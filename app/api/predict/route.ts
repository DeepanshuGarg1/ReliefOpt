import { NextResponse } from "next/server"
import {
  PREDICTED_DEMAND,
  DISTRICTS,
  WEATHER_SNAPSHOT,
  DISTRICT_STATIC,
  ALLOCATIONS,
  buildDistrictSummary,
  DEPOTS,
  SHELTERS,
  TRAVEL_GRAPH,
} from "@/lib/reliefopt-data"

/**
 * GET /api/predict?district=D01&months=3
 *
 * Returns Sentinel + Commander outputs for a given district or all districts.
 * Mirrors the output of:
 *   reliefopt predict  -> predicted_demand.csv
 *   reliefopt allocate -> allocations.csv + district_summary.csv
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const districtId = searchParams.get("district") // e.g. "D01" or district name
  const months = Number.parseInt(searchParams.get("months") || "3", 10)

  // Resolve by name or ID
  const resolvedId = districtId
    ? DISTRICTS.find(
        (d) =>
          d.district_id === districtId ||
          d.name.toLowerCase().includes(districtId.toLowerCase())
      )?.district_id
    : null

  const summary = buildDistrictSummary()

  // If a specific district was requested
  if (resolvedId) {
    const demand = PREDICTED_DEMAND.find((p) => p.district_id === resolvedId)
    const weather = WEATHER_SNAPSHOT.find((w) => w.district_id === resolvedId)
    const staticData = DISTRICT_STATIC.find((s) => s.district_id === resolvedId)
    const districtGeo = DISTRICTS.find((d) => d.district_id === resolvedId)
    const districtAllocs = ALLOCATIONS.filter((a) => a.district_id === resolvedId)
    const distSummary = summary.find((s) => s.district_id === resolvedId)

    // Resolve depot/shelter names for allocations
    const enrichedAllocs = districtAllocs.map((a) => ({
      ...a,
      depot_name: DEPOTS.find((d) => d.depot_id === a.depot_id)?.name ?? a.depot_id,
      shelter_name: SHELTERS.find((s) => s.shelter_id === a.shelter_id)?.name ?? a.shelter_id,
    }))

    // Time-scaled demand (simple multiplier for months)
    const timeFactor = Math.min(months / 6, 1.5)

    return NextResponse.json({
      success: true,
      data: {
        district: districtGeo,
        sentinel: demand
          ? {
              ...demand,
              estimated_displaced_pop: Math.round(demand.estimated_displaced_pop * timeFactor),
              predicted_demand_score: Math.min(1, demand.predicted_demand_score * (0.8 + timeFactor * 0.2)),
            }
          : null,
        commander: { allocations: enrichedAllocs },
        summary: distSummary
          ? {
              ...distSummary,
              estimated_displaced_pop: Math.round(distSummary.estimated_displaced_pop * timeFactor),
            }
          : null,
        weather,
        static: staticData,
      },
      meta: {
        sentinel_version: "TFT-v2.4",
        commander_version: "MILP-v1.2",
        lookback: 30,
        horizon: months,
        model_accuracy: 0.942,
        last_trained: "2026-02-01T00:00:00Z",
      },
    })
  }

  // Return all districts overview
  const enrichedSummary = summary.map((s) => {
    const geo = DISTRICTS.find((d) => d.district_id === s.district_id)
    const demand = PREDICTED_DEMAND.find((p) => p.district_id === s.district_id)
    return {
      ...s,
      name: geo?.name,
      state: geo?.state,
      lat: geo?.lat,
      lng: geo?.lng,
      population: geo?.population,
      dominant_driver: demand?.dominant_driver,
    }
  })

  const totalDisplaced = summary.reduce((s, d) => s + d.estimated_displaced_pop, 0)
  const totalAllocated = summary.reduce((s, d) => s + d.allocated_units, 0)
  const totalUnmet = summary.reduce((s, d) => s + d.unmet_demand, 0)

  return NextResponse.json({
    success: true,
    data: {
      districts: enrichedSummary,
      depots: DEPOTS,
      shelters: SHELTERS,
      travel_graph: TRAVEL_GRAPH,
    },
    meta: {
      total_districts: DISTRICTS.length,
      total_displaced: totalDisplaced,
      total_allocated: totalAllocated,
      total_unmet: totalUnmet,
      depot_inventory: DEPOTS.reduce((s, d) => s + d.inventory, 0),
      sentinel_version: "TFT-v2.4",
      commander_version: "MILP-v1.2",
    },
  })
}
