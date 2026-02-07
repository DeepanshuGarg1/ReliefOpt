// ─────────────────────────────────────────────────────────────────────────────
// ReliefOpt Data Model  (mirrors docs/INPUT_OUTPUT_FORMATS.md)
// ─────────────────────────────────────────────────────────────────────────────

// ── Raw Input Types ──────────────────────────────────────────────────────────

export interface WeatherTimeseries {
  district_id: string
  timestamp: string
  rainfall: number
  wind_speed: number
  pressure: number
  humidity: number
  temp_gradient: number
  observed_displaced_pop?: number
  observed_demand_score?: number
}

export interface DistrictStatic {
  district_id: string
  population_density: number
  housing_kachha_ratio: number
  median_age: number
  elevation: number
  soil_type_code: number
  vulnerability_index?: number
}

export interface Depot {
  depot_id: string
  inventory: number
  lat: number
  lng: number
  name: string
}

export interface Shelter {
  shelter_id: string
  district_id: string
  capacity: number
  lat: number
  lng: number
  name: string
}

export interface TravelEdge {
  depot_id: string
  district_id: string
  travel_time_minutes: number
}

// ── Agent 1: Sentinel – Predicted Demand ─────────────────────────────────────

export interface PredictedDemand {
  district_id: string
  predicted_demand_score: number // 0-1
  estimated_displaced_pop: number
  dominant_driver: string
}

// ── Agent 2: Commander – Allocation Plan ─────────────────────────────────────

export interface AllocationRow {
  depot_id: string
  shelter_id: string
  district_id: string
  allocated_units: number
  travel_time_minutes: number
}

// ── District Summary (joined output) ─────────────────────────────────────────

export interface DistrictSummary {
  district_id: string
  estimated_displaced_pop: number
  predicted_demand_score: number
  allocated_units: number
  unmet_demand: number
}

// ── Extended UI types ────────────────────────────────────────────────────────

export interface DistrictGeo {
  district_id: string
  name: string
  state: string
  lat: number
  lng: number
  population: number
}

export type SeverityLevel = "low" | "moderate" | "high" | "extreme"

export function demandToSeverity(score: number): SeverityLevel {
  if (score < 0.25) return "low"
  if (score < 0.50) return "moderate"
  if (score < 0.75) return "high"
  return "extreme"
}

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#f97316",
  extreme: "#ef4444",
}

// ── Mock Datasets ────────────────────────────────────────────────────────────
// These simulate what ReliefOpt CLI outputs; replace with real API calls.

export const DISTRICTS: DistrictGeo[] = [
  { district_id: "D01", name: "Rishikesh", state: "Uttarakhand", lat: 30.0869, lng: 78.2676, population: 120000 },
  { district_id: "D02", name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, population: 4640000 },
  { district_id: "D03", name: "Kutch", state: "Gujarat", lat: 23.7337, lng: 69.8597, population: 2090000 },
  { district_id: "D04", name: "Wayanad", state: "Kerala", lat: 11.6854, lng: 76.132, population: 817000 },
  { district_id: "D05", name: "Jorhat", state: "Assam", lat: 26.7509, lng: 94.2037, population: 1091000 },
  { district_id: "D06", name: "Puri", state: "Odisha", lat: 19.8135, lng: 85.8312, population: 1698000 },
  { district_id: "D07", name: "Leh", state: "Ladakh", lat: 34.1526, lng: 77.5771, population: 35000 },
  { district_id: "D08", name: "Chamoli", state: "Uttarakhand", lat: 30.4044, lng: 79.321, population: 391000 },
  { district_id: "D09", name: "Nagapattinam", state: "Tamil Nadu", lat: 10.766, lng: 79.8424, population: 1616000 },
  { district_id: "D10", name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, population: 960000 },
]

export const DEPOTS: Depot[] = [
  { depot_id: "DEP-01", inventory: 50000, lat: 28.6139, lng: 77.209, name: "Central Warehouse Delhi" },
  { depot_id: "DEP-02", inventory: 35000, lat: 22.5726, lng: 88.3639, name: "Eastern Hub Kolkata" },
  { depot_id: "DEP-03", inventory: 28000, lat: 12.9716, lng: 77.5946, name: "Southern Hub Bangalore" },
  { depot_id: "DEP-04", inventory: 20000, lat: 23.0225, lng: 72.5714, name: "Western Hub Ahmedabad" },
  { depot_id: "DEP-05", inventory: 18000, lat: 26.8467, lng: 80.9462, name: "Northern Hub Lucknow" },
]

export const SHELTERS: Shelter[] = [
  { shelter_id: "SHL-01", district_id: "D01", capacity: 5000, lat: 30.1, lng: 78.28, name: "Rishikesh Relief Camp" },
  { shelter_id: "SHL-02", district_id: "D02", capacity: 15000, lat: 13.06, lng: 80.25, name: "Chennai Convention Center" },
  { shelter_id: "SHL-03", district_id: "D04", capacity: 3000, lat: 11.7, lng: 76.14, name: "Wayanad Community Hall" },
  { shelter_id: "SHL-04", district_id: "D05", capacity: 8000, lat: 26.76, lng: 94.21, name: "Jorhat Stadium Shelter" },
  { shelter_id: "SHL-05", district_id: "D06", capacity: 10000, lat: 19.82, lng: 85.84, name: "Puri Cyclone Shelter" },
  { shelter_id: "SHL-06", district_id: "D10", capacity: 6000, lat: 26.15, lng: 91.74, name: "Guwahati Army Camp" },
  { shelter_id: "SHL-07", district_id: "D03", capacity: 12000, lat: 23.74, lng: 69.86, name: "Kutch Relief Center" },
  { shelter_id: "SHL-08", district_id: "D09", capacity: 7000, lat: 10.77, lng: 79.85, name: "Nagapattinam Shelter" },
]

export const TRAVEL_GRAPH: TravelEdge[] = [
  { depot_id: "DEP-01", district_id: "D01", travel_time_minutes: 320 },
  { depot_id: "DEP-01", district_id: "D07", travel_time_minutes: 840 },
  { depot_id: "DEP-01", district_id: "D08", travel_time_minutes: 420 },
  { depot_id: "DEP-02", district_id: "D05", travel_time_minutes: 540 },
  { depot_id: "DEP-02", district_id: "D10", travel_time_minutes: 480 },
  { depot_id: "DEP-03", district_id: "D02", travel_time_minutes: 360 },
  { depot_id: "DEP-03", district_id: "D04", travel_time_minutes: 300 },
  { depot_id: "DEP-03", district_id: "D09", travel_time_minutes: 420 },
  { depot_id: "DEP-04", district_id: "D03", travel_time_minutes: 240 },
  { depot_id: "DEP-05", district_id: "D01", travel_time_minutes: 600 },
  { depot_id: "DEP-05", district_id: "D05", travel_time_minutes: 960 },
  { depot_id: "DEP-01", district_id: "D06", travel_time_minutes: 900 },
  { depot_id: "DEP-02", district_id: "D06", travel_time_minutes: 540 },
]

// Sentinel mock output (predicted_demand.csv)
export const PREDICTED_DEMAND: PredictedDemand[] = [
  { district_id: "D01", predicted_demand_score: 0.87, estimated_displaced_pop: 18000, dominant_driver: "rainfall" },
  { district_id: "D02", predicted_demand_score: 0.72, estimated_displaced_pop: 95000, dominant_driver: "wind_speed" },
  { district_id: "D03", predicted_demand_score: 0.31, estimated_displaced_pop: 12000, dominant_driver: "pressure" },
  { district_id: "D04", predicted_demand_score: 0.78, estimated_displaced_pop: 9500, dominant_driver: "rainfall" },
  { district_id: "D05", predicted_demand_score: 0.92, estimated_displaced_pop: 140000, dominant_driver: "rainfall" },
  { district_id: "D06", predicted_demand_score: 0.65, estimated_displaced_pop: 52000, dominant_driver: "wind_speed" },
  { district_id: "D07", predicted_demand_score: 0.18, estimated_displaced_pop: 1200, dominant_driver: "temp_gradient" },
  { district_id: "D08", predicted_demand_score: 0.44, estimated_displaced_pop: 7800, dominant_driver: "rainfall" },
  { district_id: "D09", predicted_demand_score: 0.56, estimated_displaced_pop: 34000, dominant_driver: "wind_speed" },
  { district_id: "D10", predicted_demand_score: 0.83, estimated_displaced_pop: 68000, dominant_driver: "rainfall" },
]

// Commander mock output (allocations.csv)
export const ALLOCATIONS: AllocationRow[] = [
  { depot_id: "DEP-01", shelter_id: "SHL-01", district_id: "D01", allocated_units: 8500, travel_time_minutes: 320 },
  { depot_id: "DEP-03", shelter_id: "SHL-02", district_id: "D02", allocated_units: 15000, travel_time_minutes: 360 },
  { depot_id: "DEP-04", shelter_id: "SHL-07", district_id: "D03", allocated_units: 5000, travel_time_minutes: 240 },
  { depot_id: "DEP-03", shelter_id: "SHL-03", district_id: "D04", allocated_units: 3000, travel_time_minutes: 300 },
  { depot_id: "DEP-02", shelter_id: "SHL-04", district_id: "D05", allocated_units: 8000, travel_time_minutes: 540 },
  { depot_id: "DEP-02", shelter_id: "SHL-05", district_id: "D06", allocated_units: 10000, travel_time_minutes: 540 },
  { depot_id: "DEP-02", shelter_id: "SHL-06", district_id: "D10", allocated_units: 6000, travel_time_minutes: 480 },
  { depot_id: "DEP-03", shelter_id: "SHL-08", district_id: "D09", allocated_units: 7000, travel_time_minutes: 420 },
]

// District Summary (joined)
export function buildDistrictSummary(): DistrictSummary[] {
  return PREDICTED_DEMAND.map((pd) => {
    const totalAllocated = ALLOCATIONS
      .filter((a) => a.district_id === pd.district_id)
      .reduce((sum, a) => sum + a.allocated_units, 0)
    return {
      district_id: pd.district_id,
      estimated_displaced_pop: pd.estimated_displaced_pop,
      predicted_demand_score: pd.predicted_demand_score,
      allocated_units: totalAllocated,
      unmet_demand: Math.max(0, pd.estimated_displaced_pop - totalAllocated),
    }
  })
}

// Weather snapshot (latest row per district)
export const WEATHER_SNAPSHOT: WeatherTimeseries[] = [
  { district_id: "D01", timestamp: "2026-02-07T06:00:00Z", rainfall: 145.2, wind_speed: 22.5, pressure: 998.3, humidity: 92.1, temp_gradient: -2.3 },
  { district_id: "D02", timestamp: "2026-02-07T06:00:00Z", rainfall: 35.8, wind_speed: 85.4, pressure: 992.1, humidity: 88.5, temp_gradient: -0.8 },
  { district_id: "D03", timestamp: "2026-02-07T06:00:00Z", rainfall: 2.1, wind_speed: 12.3, pressure: 1008.5, humidity: 45.2, temp_gradient: 1.2 },
  { district_id: "D04", timestamp: "2026-02-07T06:00:00Z", rainfall: 182.6, wind_speed: 18.7, pressure: 1001.2, humidity: 95.3, temp_gradient: -1.5 },
  { district_id: "D05", timestamp: "2026-02-07T06:00:00Z", rainfall: 210.3, wind_speed: 28.1, pressure: 995.8, humidity: 96.7, temp_gradient: -3.1 },
  { district_id: "D06", timestamp: "2026-02-07T06:00:00Z", rainfall: 55.4, wind_speed: 62.3, pressure: 996.5, humidity: 85.2, temp_gradient: -0.5 },
  { district_id: "D07", timestamp: "2026-02-07T06:00:00Z", rainfall: 5.2, wind_speed: 8.5, pressure: 1012.1, humidity: 38.5, temp_gradient: 2.8 },
  { district_id: "D08", timestamp: "2026-02-07T06:00:00Z", rainfall: 68.9, wind_speed: 15.2, pressure: 1003.4, humidity: 78.2, temp_gradient: -0.9 },
  { district_id: "D09", timestamp: "2026-02-07T06:00:00Z", rainfall: 42.5, wind_speed: 45.8, pressure: 997.8, humidity: 82.4, temp_gradient: -0.3 },
  { district_id: "D10", timestamp: "2026-02-07T06:00:00Z", rainfall: 175.8, wind_speed: 25.4, pressure: 996.2, humidity: 94.8, temp_gradient: -2.7 },
]

export const DISTRICT_STATIC: DistrictStatic[] = [
  { district_id: "D01", population_density: 285, housing_kachha_ratio: 0.35, median_age: 28.5, elevation: 372, soil_type_code: 3, vulnerability_index: 0.72 },
  { district_id: "D02", population_density: 8800, housing_kachha_ratio: 0.12, median_age: 32.1, elevation: 6, soil_type_code: 1, vulnerability_index: 0.45 },
  { district_id: "D03", population_density: 46, housing_kachha_ratio: 0.48, median_age: 27.3, elevation: 58, soil_type_code: 4, vulnerability_index: 0.61 },
  { district_id: "D04", population_density: 384, housing_kachha_ratio: 0.28, median_age: 30.2, elevation: 780, soil_type_code: 2, vulnerability_index: 0.68 },
  { district_id: "D05", population_density: 382, housing_kachha_ratio: 0.42, median_age: 26.8, elevation: 86, soil_type_code: 1, vulnerability_index: 0.78 },
  { district_id: "D06", population_density: 488, housing_kachha_ratio: 0.38, median_age: 29.1, elevation: 4, soil_type_code: 1, vulnerability_index: 0.58 },
  { district_id: "D07", population_density: 3, housing_kachha_ratio: 0.15, median_age: 31.5, elevation: 3500, soil_type_code: 5, vulnerability_index: 0.32 },
  { district_id: "D08", population_density: 49, housing_kachha_ratio: 0.52, median_age: 27.9, elevation: 1280, soil_type_code: 3, vulnerability_index: 0.74 },
  { district_id: "D09", population_density: 720, housing_kachha_ratio: 0.32, median_age: 30.8, elevation: 3, soil_type_code: 1, vulnerability_index: 0.52 },
  { district_id: "D10", population_density: 1313, housing_kachha_ratio: 0.22, median_age: 28.7, elevation: 55, soil_type_code: 1, vulnerability_index: 0.65 },
]
