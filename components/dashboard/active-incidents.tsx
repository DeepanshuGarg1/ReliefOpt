"use client"

import { AlertTriangle, MapPin, Clock, Users, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIncidents } from "@/lib/api-hooks"

const severityBadge: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  moderate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
}

const statusBadge: Record<string, string> = {
  active: "bg-red-500/10 text-red-400",
  monitoring: "bg-yellow-500/10 text-yellow-400",
  resolved: "bg-emerald-500/10 text-emerald-400",
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function ActiveIncidents() {
  const { data: incidents, isLoading, error } = useIncidents()

  return (
    <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <h3 className="text-sm font-bold text-emerald-50">Active Incidents</h3>
        </div>
        {incidents && (
          <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
            {incidents.filter((i: { status: string }) => i.status === "active").length} Active
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
        </div>
      )}

      {error && (
        <div className="px-4 py-6 text-center text-sm text-red-400">
          Failed to load incidents
        </div>
      )}

      {incidents && (
        <div className="divide-y divide-border/30">
          {incidents.map((incident: {
            id: string
            title: string
            location: string
            severity: string
            affectedPeople: number
            reportedAt: string
            status: string
          }) => (
            <div
              key={incident.id}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-800/30"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800/50">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-emerald-50">
                    {incident.title}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase",
                      severityBadge[incident.severity] ?? severityBadge.moderate
                    )}
                  >
                    {incident.severity}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {incident.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo(incident.reportedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {incident.affectedPeople.toLocaleString()}
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                  statusBadge[incident.status] ?? statusBadge.monitoring
                )}
              >
                {incident.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
