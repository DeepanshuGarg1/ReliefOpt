"use client"

import { cn } from "@/lib/utils"
import {
  DISTRICTS,
  PREDICTED_DEMAND,
  buildDistrictSummary,
  SEVERITY_COLORS,
  demandToSeverity,
} from "@/lib/reliefopt-data"
import { MapPin, ArrowUpDown } from "lucide-react"
import { useState } from "react"

interface Props {
  onDistrictSelect?: (districtId: string) => void
  selectedDistrict?: string | null
}

type SortKey = "demand" | "displaced" | "allocated" | "unmet"

export function DistrictSummaryTable({ onDistrictSelect, selectedDistrict }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>("demand")
  const [sortAsc, setSortAsc] = useState(false)
  const summary = buildDistrictSummary()

  const sorted = [...summary].sort((a, b) => {
    const aVal =
      sortBy === "demand" ? a.predicted_demand_score :
      sortBy === "displaced" ? a.estimated_displaced_pop :
      sortBy === "allocated" ? a.allocated_units :
      a.unmet_demand
    const bVal =
      sortBy === "demand" ? b.predicted_demand_score :
      sortBy === "displaced" ? b.estimated_displaced_pop :
      sortBy === "allocated" ? b.allocated_units :
      b.unmet_demand
    return sortAsc ? aVal - bVal : bVal - aVal
  })

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortBy(key)
      setSortAsc(false)
    }
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-emerald-50">District Summary</h3>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
          district_summary.csv
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/30 text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 font-medium">District</th>
              <th className="cursor-pointer px-4 py-3 font-medium" onClick={() => toggleSort("demand")}>
                <span className="flex items-center gap-1">
                  Demand <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="cursor-pointer px-4 py-3 font-medium" onClick={() => toggleSort("displaced")}>
                <span className="flex items-center gap-1">
                  Displaced <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="cursor-pointer px-4 py-3 font-medium" onClick={() => toggleSort("allocated")}>
                <span className="flex items-center gap-1">
                  Allocated <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="cursor-pointer px-4 py-3 font-medium" onClick={() => toggleSort("unmet")}>
                <span className="flex items-center gap-1">
                  Unmet <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="px-4 py-3 font-medium">Driver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {sorted.map((row) => {
              const geo = DISTRICTS.find((d) => d.district_id === row.district_id)
              const demand = PREDICTED_DEMAND.find((p) => p.district_id === row.district_id)
              const severity = demandToSeverity(row.predicted_demand_score)
              const color = SEVERITY_COLORS[severity]
              const isSelected = selectedDistrict === row.district_id

              return (
                <tr
                  key={row.district_id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-slate-800/30",
                    isSelected && "bg-emerald-500/5"
                  )}
                  onClick={() => onDistrictSelect?.(row.district_id)}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                      <div>
                        <p className="font-medium text-emerald-50">{geo?.name ?? row.district_id}</p>
                        <p className="text-[10px] text-slate-500">{geo?.state}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold" style={{ color }}>{row.predicted_demand_score.toFixed(2)}</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full" style={{ width: `${row.predicted_demand_score * 100}%`, background: color }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-300">
                    {row.estimated_displaced_pop.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-emerald-400">
                    {row.allocated_units.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn("font-mono font-bold", row.unmet_demand > 0 ? "text-red-400" : "text-emerald-400")}>
                      {row.unmet_demand.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                      {demand?.dominant_driver}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
