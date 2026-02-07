"use client"

import { Package, Truck, Users, Building2, HeartPulse, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAllocations } from "@/lib/api-hooks"

interface Resource {
  label: string
  icon: typeof Package
  available: number
  total: number
  unit: string
  status: "good" | "low" | "critical"
}

const statusColors: Record<string, { bar: string; text: string }> = {
  good: { bar: "bg-emerald-500", text: "text-emerald-400" },
  low: { bar: "bg-amber-500", text: "text-amber-400" },
  critical: { bar: "bg-red-500", text: "text-red-400" },
}

function deriveStatus(pct: number): "good" | "low" | "critical" {
  if (pct >= 0.5) return "good"
  if (pct >= 0.3) return "low"
  return "critical"
}

export function ResourceStatus() {
  const { data, isLoading } = useAllocations(undefined, 3)

  // Build resource list from API allocation data
  const allocationData = data as {
    predictedDemand?: {
      shelterCapacity: number
      medicalTeams: number
      foodSupplyKg: number
      rescuePersonnel: number
      vehicles: number
    }
  } | undefined

  const demand = allocationData?.predictedDemand

  const resources: Resource[] = demand
    ? [
        {
          label: "Medical Teams",
          icon: HeartPulse,
          available: Math.max(0, 50 - demand.medicalTeams),
          total: 50,
          unit: "teams",
          status: deriveStatus(Math.max(0, 50 - demand.medicalTeams) / 50),
        },
        {
          label: "Relief Vehicles",
          icon: Truck,
          available: Math.max(0, 40 - demand.vehicles),
          total: 40,
          unit: "vehicles",
          status: deriveStatus(Math.max(0, 40 - demand.vehicles) / 40),
        },
        {
          label: "Shelter Capacity",
          icon: Building2,
          available: Math.max(0, 25000 - demand.shelterCapacity),
          total: 25000,
          unit: "people",
          status: deriveStatus(Math.max(0, 25000 - demand.shelterCapacity) / 25000),
        },
        {
          label: "Food Supplies",
          icon: Package,
          available: Math.max(0, 100000 - demand.foodSupplyKg),
          total: 100000,
          unit: "kg",
          status: deriveStatus(Math.max(0, 100000 - demand.foodSupplyKg) / 100000),
        },
        {
          label: "Rescue Personnel",
          icon: Users,
          available: Math.max(0, 500 - demand.rescuePersonnel),
          total: 500,
          unit: "personnel",
          status: deriveStatus(Math.max(0, 500 - demand.rescuePersonnel) / 500),
        },
      ]
    : [
        { label: "Medical Teams", icon: HeartPulse, available: 34, total: 50, unit: "teams", status: "good" as const },
        { label: "Relief Vehicles", icon: Truck, available: 12, total: 40, unit: "vehicles", status: "critical" as const },
        { label: "Shelter Capacity", icon: Building2, available: 18500, total: 25000, unit: "people", status: "good" as const },
        { label: "Food Supplies", icon: Package, available: 45000, total: 100000, unit: "kg", status: "low" as const },
        { label: "Rescue Personnel", icon: Users, available: 280, total: 500, unit: "personnel", status: "low" as const },
      ]

  return (
    <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-emerald-50">Resource Status</h3>
        </div>
        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />}
      </div>
      <div className="divide-y divide-border/30">
        {resources.map((res) => {
          const pct = Math.round((res.available / res.total) * 100)
          const colors = statusColors[res.status]
          return (
            <div key={res.label} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800/50">
                    <res.icon className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <span className="text-sm text-slate-300">{res.label}</span>
                </div>
                <div className="text-right">
                  <span className={cn("text-sm font-bold", colors.text)}>
                    {res.available.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500">
                    {" "}/ {res.total.toLocaleString()} {res.unit}
                  </span>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", colors.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
