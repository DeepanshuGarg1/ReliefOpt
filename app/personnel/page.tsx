"use client"

import { useState, useMemo } from "react"
import { AppShell } from "@/components/app-shell"
import {
  Users,
  Search,
  Phone,
  MapPin,
  Shield,
  HeartPulse,
  Truck,
  HardHat,
  Radio,
  ChevronDown,
  Circle,
  UserPlus,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePersonnelMeta } from "@/lib/api-hooks"

const statusColors: Record<string, { dot: string; badge: string; label: string }> = {
  active: { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Active" },
  deployed: { dot: "bg-blue-500", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Deployed" },
  standby: { dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Standby" },
  "off-duty": { dot: "bg-slate-500", badge: "bg-slate-500/10 text-slate-400 border-slate-500/20", label: "Off Duty" },
}

const roleIcons: Record<string, typeof Shield> = {
  "Incident Commander": Shield,
  "Medical Lead": HeartPulse,
  "Field Officer": HardHat,
  "Rescue Specialist": HardHat,
  "NDRF Team Lead": Shield,
  "Epidemiologist": HeartPulse,
  "Logistics Coordinator": Truck,
  "Communications Officer": Radio,
}

const teams = ["All", "Command Center", "Field Operations", "Medical Response", "NDRF Unit", "Logistics Hub"]
const statuses = ["All", "active", "deployed", "standby", "off-duty"]

export default function PersonnelPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTeam, setSelectedTeam] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")

  // Fetch from API
  const { data, isLoading } = usePersonnelMeta({
    team: selectedTeam,
    status: selectedStatus,
    search: searchQuery || undefined,
  })

  const personnel = data?.data as Array<{
    id: string
    name: string
    role: string
    team: string
    status: string
    location: string
    specialization: string
  }> | undefined

  const stats = data?.meta as {
    total: number
    active: number
    deployed: number
    standby: number
  } | undefined

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Personnel</p>
            <p className="mt-1 text-2xl font-bold text-emerald-50">{stats?.total ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-card/60 p-4 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">Active</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{stats?.active ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-card/60 p-4 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-400">Deployed</p>
            <p className="mt-1 text-2xl font-bold text-blue-400">{stats?.deployed ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-card/60 p-4 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-amber-400">Standby</p>
            <p className="mt-1 text-2xl font-bold text-amber-400">{stats?.standby ?? "-"}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/50 bg-card/60 px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search personnel by name, role, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-emerald-50 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="appearance-none rounded-lg border border-border/50 bg-card/60 px-3 py-2 pr-8 text-sm text-emerald-50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                {teams.map((t) => (
                  <option key={t} value={t}>
                    {t === "All" ? "All Teams" : t}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none rounded-lg border border-border/50 bg-card/60 px-3 py-2 pr-8 text-sm text-emerald-50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Status" : statusColors[s]?.label || s}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center rounded-xl border border-border/50 bg-card/60 py-12">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            <span className="ml-2 text-sm text-slate-400">Loading personnel...</span>
          </div>
        )}

        {/* Personnel Grid */}
        {personnel && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {personnel.map((person) => {
              const status = statusColors[person.status] ?? statusColors.active
              const PersonIcon = roleIcons[person.role] ?? Shield
              return (
                <div
                  key={person.id}
                  className="rounded-xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm transition-colors hover:bg-card/80"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800/60">
                      <PersonIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="truncate text-sm font-bold text-emerald-50">{person.name}</h4>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            status.badge
                          )}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{person.role}</p>
                      <p className="mt-0.5 text-[11px] text-emerald-500/70">{person.team}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      <span className="truncate">{person.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Shield className="h-3 w-3 text-slate-500" />
                      <span>{person.specialization}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-border/50 bg-secondary/30 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-secondary/50 hover:text-slate-200"
                    >
                      Contact
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-emerald-500/20 bg-emerald-600/10 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-600/20"
                    >
                      Reassign
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!isLoading && personnel && personnel.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/60 py-12">
            <Users className="h-10 w-10 text-slate-600" />
            <p className="mt-3 text-sm text-slate-400">No personnel found matching your filters.</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
