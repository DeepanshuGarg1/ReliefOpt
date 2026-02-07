"use client"

import { Shield, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  PREDICTED_DEMAND,
  DISTRICTS,
  SEVERITY_COLORS,
  demandToSeverity,
} from "@/lib/reliefopt-data"
import { useRiskAssessment, usePrediction } from "@/lib/api-hooks"

interface Props {
  selectedDistrict?: string | null
}

interface RiskFactor {
  label: string
  value: number
  max: number
  color: string
  detail?: string
}

function getRiskLevel(score: number) {
  if (score <= 2.5)
    return { label: "Low", color: "text-emerald-400", bg: "from-emerald-600 to-emerald-500" }
  if (score <= 5.0)
    return { label: "Moderate", color: "text-yellow-400", bg: "from-yellow-600 to-yellow-500" }
  if (score <= 7.5)
    return { label: "High", color: "text-orange-400", bg: "from-orange-600 to-orange-500" }
  return { label: "Extreme", color: "text-red-400", bg: "from-red-600 to-red-500" }
}

function severityFromScore(score: number): "low" | "moderate" | "high" | "extreme" {
  if (score <= 2.5) return "low"
  if (score <= 5.0) return "moderate"
  if (score <= 7.5) return "high"
  return "extreme"
}

export function RiskAssessment({ selectedDistrict }: Props) {
  const districtId = selectedDistrict || "D05"
  const districtGeo = DISTRICTS.find((d) => d.district_id === districtId)
  const districtName = districtGeo?.name ?? districtId

  // Fetch risk assessment from API
  const { data: riskData, isLoading: riskLoading } = useRiskAssessment(districtName)

  // Also fetch prediction data for this district
  const { data: predData, isLoading: predLoading } = usePrediction(districtId)

  const isLoading = riskLoading || predLoading

  // Use API risk data if available
  const overallRisk = riskData?.overallRisk ?? 5.0
  const risk = getRiskLevel(overallRisk)
  const severity = severityFromScore(overallRisk)

  // Build factors from API response
  const apiFactors = riskData?.factors as Record<string, number> | undefined
  const factors: RiskFactor[] = apiFactors
    ? [
        {
          label: "Weather Severity",
          value: apiFactors.weatherSeverity ?? 0,
          max: 10,
          color:
            (apiFactors.weatherSeverity ?? 0) > 6
              ? "#ef4444"
              : (apiFactors.weatherSeverity ?? 0) > 3
                ? "#f97316"
                : "#22c55e",
        },
        {
          label: "Flood Risk",
          value: apiFactors.floodRisk ?? 0,
          max: 10,
          color:
            (apiFactors.floodRisk ?? 0) > 6
              ? "#ef4444"
              : (apiFactors.floodRisk ?? 0) > 3
                ? "#f97316"
                : "#22c55e",
        },
        {
          label: "Cyclone Risk",
          value: apiFactors.cycloneRisk ?? 0,
          max: 10,
          color:
            (apiFactors.cycloneRisk ?? 0) > 6
              ? "#ef4444"
              : (apiFactors.cycloneRisk ?? 0) > 3
                ? "#f97316"
                : "#22c55e",
        },
        {
          label: "Landslide Risk",
          value: apiFactors.landslideRisk ?? 0,
          max: 10,
          color:
            (apiFactors.landslideRisk ?? 0) > 6
              ? "#ef4444"
              : (apiFactors.landslideRisk ?? 0) > 3
                ? "#f97316"
                : "#22c55e",
        },
      ]
    : []

  // Get Sentinel prediction info from /api/predict
  const sentinel = predData?.sentinel as {
    predicted_demand_score?: number
    estimated_displaced_pop?: number
    dominant_driver?: string
  } | undefined

  const demandScore = sentinel?.predicted_demand_score ?? 0
  const displacedPop = sentinel?.estimated_displaced_pop ?? 0
  const dominantDriver = sentinel?.dominant_driver ?? "N/A"

  const statusMessages: Record<string, string> = {
    low: "Conditions are safe. Normal activities can proceed.",
    moderate:
      "Some risk factors elevated. Monitor conditions and prepare contingency plans.",
    high: "Significant risk detected. Activate response teams and pre-position resources.",
    extreme:
      "CRITICAL: Immediate action required. Deploy all resources and initiate evacuations.",
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/15">
            <Shield className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-50">Disaster Risk Assessment</h3>
            {districtGeo && (
              <p className="text-[10px] text-slate-500">
                {districtGeo.name}, {districtGeo.state}
              </p>
            )}
          </div>
        </div>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
        ) : (
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300"
          >
            <Info className="h-4 w-4" />
            <span className="sr-only">Risk info</span>
          </button>
        )}
      </div>

      {/* Risk Score */}
      <div className={cn("mt-4 rounded-xl bg-gradient-to-r p-5 text-center", risk.bg)}>
        <p className="text-xs font-medium text-white/80">Overall Risk Score</p>
        <div className="mt-1 flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold text-white">
            {overallRisk.toFixed(1)}
          </span>
          <div className="text-left">
            <span className="text-lg font-bold text-white">{risk.label}</span>
            <p className="text-[10px] text-white/60">out of 10</p>
          </div>
        </div>
        {sentinel && (
          <p className="mt-2 text-xs text-white/70">
            Sentinel demand:{" "}
            <span className="font-bold text-white">
              {demandScore.toFixed(2)}
            </span>
            {" | "}Displaced:{" "}
            <span className="font-bold text-white">
              {displacedPop.toLocaleString()}
            </span>
            {" | "}Driver:{" "}
            <span className="font-bold text-white">{dominantDriver}</span>
          </p>
        )}
      </div>

      {/* Risk Factors */}
      {factors.length > 0 && (
        <div className="mt-5 space-y-4">
          {factors.map((factor) => (
            <div key={factor.label}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: factor.color }}
                  />
                  <span className="text-sm text-slate-300">{factor.label}</span>
                </div>
                <span className="text-sm font-bold text-slate-200">
                  {factor.value.toFixed(1)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((factor.value / factor.max) * 100, 100)}%`,
                    background: factor.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Severity Slider */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
          <span>Extreme</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 via-60% to-red-500">
          <div
            className="relative h-full"
            style={{ width: `${(overallRisk / 10) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-white bg-slate-700 shadow-lg" />
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div
        className={cn(
          "mt-4 rounded-lg px-4 py-2.5",
          severity === "extreme"
            ? "bg-red-950/40 shadow-[inset_0_0_0_1px_hsl(0,72%,51%,0.2)]"
            : severity === "high"
              ? "bg-orange-950/40 shadow-[inset_0_0_0_1px_hsl(25,95%,53%,0.2)]"
              : severity === "moderate"
                ? "bg-yellow-950/40 shadow-[inset_0_0_0_1px_hsl(48,96%,53%,0.15)]"
                : "bg-emerald-950/40 shadow-[inset_0_0_0_1px_hsl(160,84%,39%,0.15)]"
        )}
      >
        <p
          className={cn(
            "text-xs",
            severity === "extreme"
              ? "text-red-400"
              : severity === "high"
                ? "text-orange-400"
                : severity === "moderate"
                  ? "text-yellow-400"
                  : "text-emerald-400"
          )}
        >
          {riskData?.recommendation ?? statusMessages[severity]}
        </p>
      </div>

      {/* Model info */}
      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-600">
        <span className="rounded bg-slate-800/50 px-1.5 py-0.5 font-mono">
          risk-model
        </span>
        <span>+</span>
        <span className="rounded bg-slate-800/50 px-1.5 py-0.5 font-mono">
          sentinel-tft
        </span>
      </div>
    </div>
  )
}
