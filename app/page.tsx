"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { DisasterMap } from "@/components/dashboard/disaster-map"
import { ActiveIncidents } from "@/components/dashboard/active-incidents"
import { RiskAssessment } from "@/components/dashboard/risk-assessment"
import { ResourceStatus } from "@/components/dashboard/resource-status"
import { DistrictSummaryTable } from "@/components/dashboard/district-summary-table"
import { AlertTriangle, Users, Package, Activity, Loader2 } from "lucide-react"
import { usePredictionMeta, useIncidentsMeta } from "@/lib/api-hooks"

export default function DashboardPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [months, setMonths] = useState(3)

  const { data: predictionData, isLoading: predLoading } = usePredictionMeta(months)
  const { data: incidentData } = useIncidentsMeta()

  const meta = predictionData?.meta
  const districts = predictionData?.data?.districts

  // Compute live stats from API
  const totalDisplaced = meta?.total_displaced ?? 0
  const totalAllocated = meta?.total_allocated ?? 0
  const deployPct = meta?.depot_inventory
    ? Math.round((totalAllocated / meta.depot_inventory) * 100)
    : 0
  const activeIncidents = incidentData?.meta?.activeCount ?? 0
  const totalAffected = incidentData?.meta?.totalAffected ?? 0

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Stats Row */}
        {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Incidents"
            value={activeIncidents}
            subtitle={`${incidentData?.meta?.total ?? 0} total monitored`}
            icon={AlertTriangle}
            variant="danger"
            trend={{
              value: `${(totalAffected / 1000).toFixed(0)}K affected`,
              positive: false,
            }}
          />
          <StatCard
            title="Est. Displaced"
            value={`${(totalDisplaced / 1000).toFixed(1)}K`}
            subtitle={`Across ${meta?.total_districts ?? 0} districts`}
            icon={Users}
            variant="warning"
          />
          <StatCard
            title="Resources Deployed"
            value={`${deployPct}%`}
            subtitle={`${totalAllocated.toLocaleString()} of ${(meta?.depot_inventory ?? 0).toLocaleString()} units`}
            icon={Package}
            variant="success"
          />
          <StatCard
            title="Sentinel Accuracy"
            value={`${((meta?.model_accuracy ?? meta?.sentinel_version ? 94.2 : 0)).toFixed(1)}%`}
            subtitle={`${meta?.sentinel_version ?? "TFT"} + ${meta?.commander_version ?? "MILP"}`}
            icon={Activity}
            trend={{ value: "Models Online", positive: true }}
          />
        </div> */}

        {/* Map + Risk Assessment */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2" style={{ minHeight: 500 }}>
            <DisasterMap
              onDistrictSelect={setSelectedDistrict}
              selectedDistrict={selectedDistrict}
            />
          </div>
          <div>
            <RiskAssessment selectedDistrict={selectedDistrict} />
          </div>
        </div>

        {/* District Summary Table */}
        <DistrictSummaryTable
          onDistrictSelect={setSelectedDistrict}
          selectedDistrict={selectedDistrict}
        />

        {/* Incidents + Resource Status */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ActiveIncidents />
          <ResourceStatus />
        </div>
      </div>
    </AppShell>
  )
}
