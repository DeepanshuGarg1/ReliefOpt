"use client"

import "leaflet/dist/leaflet.css"
import indiaBoundary from "../../data/india-boundary.json"

import { useEffect, useRef, useState, useCallback } from "react"
import { MapPin, Search, Layers, Route } from "lucide-react"
import type * as Leaflet from "leaflet"
import type { GeoJsonObject } from "geojson"

import {
  DISTRICTS,
  DEPOTS,
  SHELTERS,
  ALLOCATIONS,
  PREDICTED_DEMAND,
  TRAVEL_GRAPH,
  SEVERITY_COLORS,
  demandToSeverity,
} from "@/lib/reliefopt-data"
import type { DistrictGeo, PredictedDemand } from "@/lib/reliefopt-data"

interface Props {
  onDistrictSelect?: (districtId: string) => void
  selectedDistrict?: string | null
}

export function DisasterMap({ onDistrictSelect, selectedDistrict }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Leaflet.Map | null>(null)
  const layersRef = useRef<{
    districts: Leaflet.LayerGroup
    depots: Leaflet.LayerGroup
    routes: Leaflet.LayerGroup
    shelters: Leaflet.LayerGroup
  } | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [timePeriod, setTimePeriod] = useState("3")
  const [isLoaded, setIsLoaded] = useState(false)
  const [showRoutes, setShowRoutes] = useState(true)
  const [showDepots, setShowDepots] = useState(true)

  const getDemand = useCallback(
    (districtId: string): PredictedDemand | undefined =>
      PREDICTED_DEMAND.find((p) => p.district_id === districtId),
    []
  )

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    let cancelled = false

    async function initMap() {
      const L = await import("leaflet")

      if (cancelled || !mapRef.current || mapInstanceRef.current) return

      const map = L.map(mapRef.current, {
        center: [22.5, 78.9],
        zoom: 5,
        minZoom: 4,
        maxZoom: 19,
        zoomControl: true,
        attributionControl: true,
        maxBounds: [
          [6, 68],   // SW India
          [37, 98],  // NE India
        ],
        maxBoundsViscosity: 1.0,
      })


      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map)

      // 🇮🇳 India boundary overlay
      L.geoJSON(indiaBoundary as GeoJsonObject, {
        style: {
          color: "#ff9933",        // India saffron outline
          weight: 2,
          fillColor: "#ff9933",
          fillOpacity: 0.05,
          dashArray: "4,4",
        },
        interactive: false, // boundary should not block clicks
      }).addTo(map)

      const indiaLayer = L.geoJSON(indiaBoundary as GeoJsonObject)
      map.fitBounds(indiaLayer.getBounds(), { padding: [20, 20] })

      const districtLayer = L.layerGroup().addTo(map)
      const depotLayer = L.layerGroup().addTo(map)
      const routeLayer = L.layerGroup().addTo(map)
      const shelterLayer = L.layerGroup().addTo(map)

      layersRef.current = {
        districts: districtLayer,
        depots: depotLayer,
        routes: routeLayer,
        shelters: shelterLayer,
      }

      // -- District circles (demand heatmap) --
      DISTRICTS.forEach((d: DistrictGeo) => {
        const demand = getDemand(d.district_id)
        if (!demand) return
        const severity = demandToSeverity(demand.predicted_demand_score)
        const color = SEVERITY_COLORS[severity]
        const radius = 15000 + demand.predicted_demand_score * 45000

        L.circle([d.lat, d.lng], {
          color,
          fillColor: color,
          fillOpacity: 0.18,
          radius,
          weight: 1.5,
        }).addTo(districtLayer)

        // Pulsing core marker
        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div style="position:relative;width:14px;height:14px;">
          <div style="position:absolute;inset:0;background:${color};border-radius:50%;opacity:0.4;" class="animate-pulse-ring"></div>
          <div style="position:absolute;inset:2px;background:${color};border-radius:50%;border:2px solid ${color};box-shadow:0 0 14px ${color}60;"></div>
        </div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })

        const alloc = ALLOCATIONS.filter((a) => a.district_id === d.district_id)
        const totalAlloc = alloc.reduce((s, a) => s + a.allocated_units, 0)
        const unmet = Math.max(0, demand.estimated_displaced_pop - totalAlloc)

        L.marker([d.lat, d.lng], { icon })
          .addTo(districtLayer)
          .bindPopup(
            `<div style="min-width:240px;font-family:system-ui,sans-serif">
            <div style="font-weight:700;font-size:15px;margin-bottom:8px;color:#d1fae5">${d.name}, ${d.state}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <div style="background:#0f172a;padding:8px;border-radius:8px;">
                <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Demand Score</div>
                <div style="font-size:18px;font-weight:700;color:${color}">${demand.predicted_demand_score.toFixed(2)}</div>
              </div>
              <div style="background:#0f172a;padding:8px;border-radius:8px;">
                <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Displaced</div>
                <div style="font-size:18px;font-weight:700;color:#e2e8f0">${(demand.estimated_displaced_pop / 1000).toFixed(1)}K</div>
              </div>
              <div style="background:#0f172a;padding:8px;border-radius:8px;">
                <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Allocated</div>
                <div style="font-size:18px;font-weight:700;color:#22c55e">${(totalAlloc / 1000).toFixed(1)}K</div>
              </div>
              <div style="background:#0f172a;padding:8px;border-radius:8px;">
                <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Unmet</div>
                <div style="font-size:18px;font-weight:700;color:${unmet > 0 ? '#ef4444' : '#22c55e'}">${(unmet / 1000).toFixed(1)}K</div>
              </div>
            </div>
            <div style="margin-top:8px;padding:6px 8px;background:#0f172a;border-radius:6px;font-size:11px;color:#94a3b8">
              Driver: <span style="color:#a5f3fc;font-weight:600">${demand.dominant_driver}</span> &middot; Pop: ${d.population.toLocaleString()}
            </div>
          </div>`
          )
          .on("click", () => onDistrictSelect?.(d.district_id))
      })

      // -- Depot markers --
      DEPOTS.forEach((dep) => {
        const depIcon = L.divIcon({
          className: "depot-marker",
          html: `<div style="width:20px;height:20px;background:#3b82f6;border-radius:4px;border:2px solid #60a5fa;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px #3b82f640;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
        </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        L.marker([dep.lat, dep.lng], { icon: depIcon })
          .addTo(depotLayer)
          .bindPopup(
            `<div style="min-width:180px;font-family:system-ui,sans-serif">
            <div style="font-weight:700;font-size:14px;color:#93c5fd;margin-bottom:6px">${dep.name}</div>
            <div style="font-size:12px;color:#94a3b8">Inventory: <span style="color:#e2e8f0;font-weight:600">${dep.inventory.toLocaleString()} units</span></div>
            <div style="font-size:11px;color:#64748b;margin-top:2px">${dep.depot_id}</div>
          </div>`
          )
      })

      // -- Supply routes (dashed lines depot -> district) --
      ALLOCATIONS.forEach((alloc) => {
        const depot = DEPOTS.find((d) => d.depot_id === alloc.depot_id)
        const district = DISTRICTS.find((d) => d.district_id === alloc.district_id)
        if (!depot || !district) return

        const travel = TRAVEL_GRAPH.find(
          (t) => t.depot_id === alloc.depot_id && t.district_id === alloc.district_id
        )

        L.polyline(
          [
            [depot.lat, depot.lng],
            [district.lat, district.lng],
          ],
          {
            color: "#3b82f680",
            weight: 1.5,
            dashArray: "6, 8",
            opacity: 0.7,
          }
        )
          .addTo(routeLayer)
          .bindPopup(
            `<div style="font-family:system-ui,sans-serif;font-size:12px">
            <div style="color:#93c5fd;font-weight:600">${depot.name}</div>
            <div style="color:#64748b;margin:4px 0">&#8594; ${district.name}, ${district.state}</div>
            <div style="color:#e2e8f0">Units: <strong>${alloc.allocated_units.toLocaleString()}</strong></div>
            <div style="color:#94a3b8">ETA: ${travel ? `${Math.round(travel.travel_time_minutes / 60)}h ${travel.travel_time_minutes % 60}m` : "N/A"}</div>
          </div>`
          )
      })

      // -- Shelter markers --
      SHELTERS.forEach((sh) => {
        const shIcon = L.divIcon({
          className: "shelter-marker",
          html: `<div style="width:10px;height:10px;background:#a78bfa;border-radius:50%;border:2px solid #c4b5fd;box-shadow:0 0 8px #a78bfa40;"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        })

        L.marker([sh.lat, sh.lng], { icon: shIcon })
          .addTo(shelterLayer)
          .bindPopup(
            `<div style="font-family:system-ui,sans-serif;font-size:12px">
            <div style="color:#c4b5fd;font-weight:600">${sh.name}</div>
            <div style="color:#94a3b8">Capacity: <span style="color:#e2e8f0">${sh.capacity.toLocaleString()}</span></div>
          </div>`
          )
      })

      mapInstanceRef.current = map
      setIsLoaded(true)
    }

    initMap()

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [getDemand, onDistrictSelect])

  // Toggle route layer
  useEffect(() => {
    if (!layersRef.current || !mapInstanceRef.current) return
    if (showRoutes) {
      layersRef.current.routes.addTo(mapInstanceRef.current)
    } else {
      layersRef.current.routes.removeFrom(mapInstanceRef.current)
    }
  }, [showRoutes])

  // Toggle depot layer
  useEffect(() => {
    if (!layersRef.current || !mapInstanceRef.current) return
    if (showDepots) {
      layersRef.current.depots.addTo(mapInstanceRef.current)
    } else {
      layersRef.current.depots.removeFrom(mapInstanceRef.current)
    }
  }, [showDepots])

  // Pan to selected district
  useEffect(() => {
    if (!selectedDistrict || !mapInstanceRef.current) return
    const d = DISTRICTS.find((dd) => dd.district_id === selectedDistrict)
    if (d) mapInstanceRef.current.setView([d.lat, d.lng], 8, { animate: true })
  }, [selectedDistrict])

  // const handleSearch = () => {
  //   if (!searchQuery.trim() || !mapInstanceRef.current) return
  //   const found = DISTRICTS.find((z) =>
  //     z.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     z.state.toLowerCase().includes(searchQuery.toLowerCase())
  //   )
  //   if (found) {
  //     mapInstanceRef.current.setView([found.lat, found.lng], 8, { animate: true })
  //     onDistrictSelect?.(found.district_id)
  //   }
  // }

  const handleSearch = () => {
    if (!mapInstanceRef.current) return

    const query = searchQuery.trim().toLowerCase()
    if (!query) return

    const found = DISTRICTS.find((d) => {
      const name = d.name?.toLowerCase() || ""
      const state = d.state?.toLowerCase() || ""
      const id = d.district_id?.toLowerCase() || ""

      return (
        name.includes(query) ||
        state.includes(query) ||
        id.includes(query)
      )
    })

    if (!found) {
      console.warn("No district found for:", query)
      return
    }

    console.log("Found district:", found.name)

    mapInstanceRef.current.flyTo(
      [found.lat, found.lng],
      8,
      { animate: true, duration: 1.2 }
    )

    onDistrictSelect?.(found.district_id)
  }



  return (
    <div className="flex h-full flex-col rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm">
      {/* Search Bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border/50 p-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/50 bg-secondary/50 px-3 py-2">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search district... (e.g., Rishikesh, Assam)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 bg-transparent text-sm text-emerald-50 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-emerald-50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
        >
          <option value="1">1 Month Horizon</option>
          <option value="3">3 Month Horizon</option>
          <option value="6">6 Month Horizon</option>
          <option value="12">12 Month Horizon</option>
        </select>
        <button
          type="button"
          onClick={handleSearch}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-emerald-50 transition-colors hover:bg-emerald-700"
        >
          Predict
        </button>
      </div>

      {/* Map */}
      <div className="relative flex-1">
        <div ref={mapRef} className="h-full w-full" style={{ minHeight: 420 }} />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <MapPin className="h-4 w-4 animate-pulse text-emerald-400" />
              Loading map...
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute left-3 top-3 z-[1000] flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowRoutes(!showRoutes)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium backdrop-blur-sm transition-colors ${showRoutes
              ? "border-blue-500/30 bg-blue-500/15 text-blue-300"
              : "border-border/50 bg-card/90 text-slate-400"
              }`}
          >
            <Route className="h-3 w-3" />
            Supply Routes
          </button>
          <button
            type="button"
            onClick={() => setShowDepots(!showDepots)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium backdrop-blur-sm transition-colors ${showDepots
              ? "border-blue-500/30 bg-blue-500/15 text-blue-300"
              : "border-border/50 bg-card/90 text-slate-400"
              }`}
          >
            <Layers className="h-3 w-3" />
            Depots
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 z-[1000] rounded-lg border border-border/50 bg-card/90 p-3 backdrop-blur-sm">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Demand Score
          </p>
          <div className="space-y-1.5">
            {(["low", "moderate", "high", "extreme"] as const).map((level) => (
              <div key={level} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: SEVERITY_COLORS[level] }}
                />
                <span className="text-[11px] capitalize text-slate-400">
                  {level} {level === "low" ? "(0-0.25)" : level === "moderate" ? "(0.25-0.5)" : level === "high" ? "(0.5-0.75)" : "(0.75-1.0)"}
                </span>
              </div>
            ))}
            <div className="my-1.5 border-t border-border/30" />
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded bg-blue-500" />
              <span className="text-[11px] text-slate-400">Depot</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
              <span className="text-[11px] text-slate-400">Shelter</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
