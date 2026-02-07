"use client"

import { useState, useCallback } from "react"
import { AppShell } from "@/components/app-shell"
import {
  MapPin,
  Truck,
  Package,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePredictionMeta, useAllocations, useIncidents } from "@/lib/api-hooks"
import {
  ALLOCATIONS,
  DEPOTS,
  DISTRICTS,
  SHELTERS,
  TRAVEL_GRAPH,
} from "@/lib/reliefopt-data"

// ── Derived types from API + mock data ──────────────────────────────────────

interface SupplyRoute {
  id: string
  from: string
  to: string
  status: "active" | "blocked" | "delayed"
  eta: string
  cargo: string
  vehicleCount: number
}

interface ActivityLog {
  id: string
  action: string
  details: string
  user: string
  timestamp: string
  type: "allocation" | "dispatch" | "override" | "alert"
}

// Build supply routes from ReliefOpt allocations
function buildSupplyRoutes(): SupplyRoute[] {
  return ALLOCATIONS.map((a, idx) => {
    const depot = DEPOTS.find((d) => d.depot_id === a.depot_id)
    const district = DISTRICTS.find((d) => d.district_id === a.district_id)
    const travel = TRAVEL_GRAPH.find(
      (t) => t.depot_id === a.depot_id && t.district_id === a.district_id
    )
    const hrs = travel ? Math.floor(travel.travel_time_minutes / 60) : 0
    const mins = travel ? travel.travel_time_minutes % 60 : 0
    const statuses: ("active" | "blocked" | "delayed")[] = ["active", "delayed", "active", "blocked", "active"]
    return {
      id: `SR-${String(idx + 1).padStart(3, "0")}`,
      from: depot?.name ?? a.depot_id,
      to: district ? `${district.name}, ${district.state}` : a.district_id,
      status: statuses[idx % statuses.length],
      eta: travel ? `${hrs}h ${mins}m` : "N/A",
      cargo: idx % 2 === 0 ? "Relief Supplies" : "Medical & Food",
      vehicleCount: Math.max(2, Math.round(a.allocated_units / 1500)),
    }
  })
}

const activityLogs: ActivityLog[] = [
  { id: "AL-001", action: "Resource Allocated", details: "ML Commander allocated 8500 units to Rishikesh via DEP-01", user: "System (Commander MILP)", timestamp: "2 mins ago", type: "allocation" },
  { id: "AL-002", action: "Route Dispatched", details: "8 vehicles en-route from Central Warehouse Delhi", user: "Cmdr. Sharma", timestamp: "15 mins ago", type: "dispatch" },
  { id: "AL-003", action: "Manual Override", details: "Increased Assam allocation by 20% - demand score 0.92", user: "Dr. Patel", timestamp: "45 mins ago", type: "override" },
  { id: "AL-004", action: "Route Blocked", details: "NH-16 to Puri blocked due to flooding", user: "Field Agent", timestamp: "1 hour ago", type: "alert" },
  { id: "AL-005", action: "Sentinel Update", details: "Demand re-forecast complete: Jorhat still highest risk (0.92)", user: "System (Sentinel TFT)", timestamp: "2 hours ago", type: "allocation" },
  { id: "AL-006", action: "Inventory Updated", details: "New shipment: 5000 units arrived at Eastern Hub Kolkata", user: "Logistics Team", timestamp: "3 hours ago", type: "dispatch" },
]

const sevColors: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  moderate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  extreme: "bg-red-500/10 text-red-400 border-red-500/20",
}

const routeStatusColors: Record<string, { bg: string; icon: typeof CheckCircle2 }> = {
  active: { bg: "text-emerald-400", icon: CheckCircle2 },
  delayed: { bg: "text-amber-400", icon: Clock },
  blocked: { bg: "text-red-400", icon: XCircle },
}

const logTypeColors: Record<string, string> = {
  allocation: "bg-emerald-500/10 text-emerald-400",
  dispatch: "bg-blue-500/10 text-blue-400",
  override: "bg-amber-500/10 text-amber-400",
  alert: "bg-red-500/10 text-red-400",
}

type Tab = "zones" | "routes" | "inventory" | "logs"

export default function ResourceAllocationPage() {
  const [activeTab, setActiveTab] = useState<Tab>("zones")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch from APIs
  const { data: predData, isLoading: predLoading } = usePredictionMeta(3)
  const { data: incidents } = useIncidents()

  const districts = predData?.data?.districts as Array<{
    district_id: string
    name?: string
    state?: string
    predicted_demand_score: number
    estimated_displaced_pop: number
    allocated_units: number
    unmet_demand: number
    dominant_driver?: string
  }> | undefined

  const depots = predData?.data?.depots as Array<{
    depot_id: string
    name: string
    inventory: number
  }> | undefined

  // Build supply routes from static data
  const supplyRoutes = buildSupplyRoutes()

  // Build inventory from depot data
  const inventoryItems = depots
    ? depots.map((d, idx) => ({
        id: d.depot_id,
        name: d.name,
        category: "Depot",
        inStock: d.inventory,
        allocated: Math.round(d.inventory * (0.5 + idx * 0.08)),
        unit: "units",
        lastUpdated: `${(idx + 1) * 10} mins ago`,
      }))
    : []

  const tabs: { id: Tab; label: string; icon: typeof MapPin }[] = [
    { id: "zones", label: "Disaster Zones", icon: MapPin },
    { id: "routes", label: "Supply Routes", icon: Truck },
    { id: "inventory", label: "Depot Inventory", icon: Package },
    { id: "logs", label: "Activity Logs", icon: ClipboardList },
  ]

  function severityFromScore(score: number): string {
    if (score >= 0.75) return "critical"
    if (score >= 0.5) return "high"
    if (score >= 0.25) return "moderate"
    return "low"
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Tabs + Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 rounded-lg border border-border/50 bg-card/60 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-emerald-600/15 text-emerald-400 shadow-[inset_0_0_0_1px_hsl(160,84%,39%,0.2)]"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/60 px-3 py-2">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-emerald-50 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Disaster Zones Tab */}
        {activeTab === "zones" && (
          <div className="overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm">
            {predLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                <span className="ml-2 text-sm text-slate-400">Running Sentinel + Commander pipeline...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 text-left">
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">District</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Demand Score</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Severity</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Displaced</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Allocated</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Unmet</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Driver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {(districts ?? [])
                      .filter(
                        (d) =>
                          (d.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.state ?? "").toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .sort((a, b) => b.predicted_demand_score - a.predicted_demand_score)
                      .map((zone) => {
                        const sev = severityFromScore(zone.predicted_demand_score)
                        return (
                          <tr key={zone.district_id} className="transition-colors hover:bg-slate-800/30">
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm font-medium text-emerald-50">{zone.name ?? zone.district_id}</p>
                                <p className="text-xs text-slate-500">{zone.state}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-sm font-bold text-slate-200">{zone.predicted_demand_score.toFixed(2)}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase", sevColors[sev])}>
                                {sev}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-slate-300">{zone.estimated_displaced_pop.toLocaleString()}</td>
                            <td className="px-4 py-3 font-mono text-sm text-emerald-400">{zone.allocated_units.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={cn("font-mono text-sm font-bold", zone.unmet_demand > 0 ? "text-red-400" : "text-emerald-400")}>
                                {zone.unmet_demand.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                                {zone.dominant_driver}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Supply Routes Tab */}
        {activeTab === "routes" && (
          <div className="space-y-3">
            {supplyRoutes
              .filter(
                (r) =>
                  r.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.to.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((route) => {
                const statusStyle = routeStatusColors[route.status]
                const StatusIcon = statusStyle.icon
                return (
                  <div
                    key={route.id}
                    className="flex flex-wrap items-center gap-4 rounded-xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm transition-colors hover:bg-card/80"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800/50">
                      <Truck className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-emerald-50">
                        <span>{route.from}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{route.to}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {route.cargo} - {route.vehicleCount} vehicles
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={cn("h-4 w-4", statusStyle.bg)} />
                      <span className={cn("text-sm font-medium capitalize", statusStyle.bg)}>
                        {route.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-300">ETA: {route.eta}</p>
                    </div>
                  </div>
                )
              })}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <div className="overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm">
            {predLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 text-left">
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Depot</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Total Inventory</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Allocated</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Available</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {inventoryItems
                      .filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((item) => {
                        const available = item.inStock - item.allocated
                        const pctUsed = Math.round((item.allocated / item.inStock) * 100)
                        return (
                          <tr key={item.id} className="transition-colors hover:bg-slate-800/30">
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm font-medium text-emerald-50">{item.name}</p>
                                <p className="text-[10px] font-mono text-slate-500">{item.id}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-slate-300">{item.inStock.toLocaleString()} {item.unit}</td>
                            <td className="px-4 py-3 font-mono text-sm text-amber-400">{item.allocated.toLocaleString()} {item.unit}</td>
                            <td className="px-4 py-3">
                              <span className={cn("font-mono text-sm font-medium", available < item.inStock * 0.2 ? "text-red-400" : "text-emerald-400")}>
                                {available.toLocaleString()} {item.unit}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                                  <div
                                    className={cn("h-full rounded-full", pctUsed >= 80 ? "bg-red-500" : pctUsed >= 60 ? "bg-amber-500" : "bg-emerald-500")}
                                    style={{ width: `${pctUsed}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-400">{pctUsed}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === "logs" && (
          <div className="space-y-2">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm">
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", logTypeColors[log.type])}>
                  {log.type === "allocation" && <Package className="h-4 w-4" />}
                  {log.type === "dispatch" && <Truck className="h-4 w-4" />}
                  {log.type === "override" && <AlertTriangle className="h-4 w-4" />}
                  {log.type === "alert" && <AlertTriangle className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-emerald-50">{log.action}</p>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", logTypeColors[log.type])}>
                      {log.type}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{log.details}</p>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                    <span>{log.user}</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
