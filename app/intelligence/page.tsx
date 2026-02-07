"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import {
  Search,
  Brain,
  Newspaper,
  CloudRain,
  Shield,
  AlertTriangle,
  ExternalLink,
  Globe,
  Thermometer,
  Wind,
  Droplets,
  Eye,
  Clock,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useIntelligence, useRiskAssessment } from "@/lib/api-hooks"

const newsSeverityColors: Record<string, string> = {
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
}

const riskColors: Record<string, string> = {
  low: "text-emerald-400",
  moderate: "text-yellow-400",
  high: "text-orange-400",
  extreme: "text-red-400",
}

const riskBgColors: Record<string, string> = {
  low: "bg-emerald-500",
  moderate: "bg-yellow-500",
  high: "bg-orange-500",
  extreme: "bg-red-500",
}

// Risk assessment regions to query
const riskRegions = [
  { name: "Rishikesh", category: "Flood Risk", icon: Droplets },
  { name: "Chennai", category: "Cyclone Risk", icon: Wind },
  { name: "Kutch", category: "Earthquake Risk", icon: AlertTriangle },
  { name: "Wayanad", category: "Landslide Risk", icon: Shield },
]

type IntelTab = "news" | "forecast" | "risk"

export default function DisasterIntelligencePage() {
  const [activeTab, setActiveTab] = useState<IntelTab>("news")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Fetch from APIs
  const { data: newsData, isLoading: newsLoading } = useIntelligence("news", debouncedSearch)
  const { data: forecastData, isLoading: forecastLoading } = useIntelligence("forecast", debouncedSearch)

  // Fetch risk for each region
  const { data: rishikeshRisk } = useRiskAssessment("Rishikesh")
  const { data: chennaiRisk } = useRiskAssessment("Chennai")
  const { data: kutchRisk } = useRiskAssessment("Kutch")
  const { data: wayanadRisk } = useRiskAssessment("Wayanad")
  const riskResults = [rishikeshRisk, chennaiRisk, kutchRisk, wayanadRisk]

  const handleSearch = () => {
    setDebouncedSearch(searchQuery)
  }

  const tabs: { id: IntelTab; label: string; icon: typeof Brain }[] = [
    { id: "news", label: "News Intelligence", icon: Newspaper },
    { id: "forecast", label: "Forecast", icon: CloudRain },
    { id: "risk", label: "Risk Assessment", icon: Shield },
  ]

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/50 bg-card/60 px-4 py-3 backdrop-blur-sm">
            <Search className="h-5 w-5 text-emerald-500" />
            <input
              type="text"
              placeholder="Search disaster intelligence... (e.g., Cyclone, Uttarakhand, Flood)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-transparent text-sm text-emerald-50 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-emerald-50 transition-colors hover:bg-emerald-700"
            >
              Analyze
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-border/50 bg-card/60 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-emerald-600/15 text-emerald-400 shadow-[inset_0_0_0_1px_hsl(160,84%,39%,0.2)]"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* News Intelligence */}
        {activeTab === "news" && (
          <div className="space-y-3">
            {newsLoading && (
              <div className="flex items-center justify-center rounded-xl border border-border/50 bg-card/60 py-12">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                <span className="ml-2 text-sm text-slate-400">Scanning intelligence sources...</span>
              </div>
            )}
            {newsData &&
              (newsData as Array<{
                id: string
                title: string
                source: string
                publishedAt: string
                severity: string
                region: string
                summary: string
                aiConfidence: number
                tags: string[]
              }>).map((news) => (
                <div
                  key={news.id}
                  className="rounded-xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm transition-colors hover:bg-card/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase",
                            newsSeverityColors[news.severity] ?? newsSeverityColors.info
                          )}
                        >
                          {news.severity}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Globe className="h-3 w-3" />
                          {news.region}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="h-3 w-3" />
                          {news.publishedAt}
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-emerald-50">{news.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">{news.summary}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <span className="text-[11px] text-slate-500">Source: {news.source}</span>
                        <div className="flex items-center gap-1.5">
                          <Brain className="h-3 w-3 text-emerald-500" />
                          <span className="text-[11px] text-emerald-400">
                            AI Confidence: {(news.aiConfidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Open link</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Forecast */}
        {activeTab === "forecast" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forecastLoading && (
              <div className="col-span-full flex items-center justify-center rounded-xl border border-border/50 bg-card/60 py-12">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                <span className="ml-2 text-sm text-slate-400">Loading forecasts from Sentinel...</span>
              </div>
            )}
            {forecastData &&
              (forecastData as Array<{
                region: string
                date: string
                rainfall: number
                windSpeed: number
                temperature: number
                humidity: number
                disasterRisk: string
                prediction: string
              }>).map((forecast) => (
                <div
                  key={forecast.region}
                  className="rounded-xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-emerald-50">{forecast.region}</h4>
                    <span className={cn("text-xs font-bold uppercase", riskColors[forecast.disasterRisk] ?? "text-slate-400")}>
                      {forecast.disasterRisk}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{forecast.date}</p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-500">Rainfall</p>
                        <p className="text-sm font-bold text-slate-200">{forecast.rainfall}mm</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Wind</p>
                        <p className="text-sm font-bold text-slate-200">{forecast.windSpeed}km/h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-400" />
                      <div>
                        <p className="text-xs text-slate-500">Temp</p>
                        <p className="text-sm font-bold text-slate-200">{forecast.temperature}°C</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="text-xs text-slate-500">Humidity</p>
                        <p className="text-sm font-bold text-slate-200">{forecast.humidity}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-800/50 px-3 py-2">
                    <p className="text-[11px] font-medium text-slate-400">
                      <Brain className="mr-1 inline h-3 w-3 text-emerald-500" />
                      ML Prediction: <span className="text-slate-300">{forecast.prediction}</span>
                    </p>
                  </div>

                  <div className="mt-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={cn("h-full rounded-full", riskBgColors[forecast.disasterRisk] ?? "bg-slate-600")}
                        style={{
                          width:
                            forecast.disasterRisk === "extreme"
                              ? "90%"
                              : forecast.disasterRisk === "high"
                                ? "70%"
                                : forecast.disasterRisk === "moderate"
                                  ? "45%"
                                  : "20%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Risk Assessment */}
        {activeTab === "risk" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {riskRegions.map((region, idx) => {
              const riskData = riskResults[idx] as {
                overallRisk: number
                riskLevel: string
                factors: Record<string, number>
                recommendation: string
              } | undefined
              const score = riskData?.overallRisk ?? 0
              const pct = (score / 10) * 100
              const color =
                pct >= 70 ? "bg-red-500" : pct >= 50 ? "bg-orange-500" : pct >= 30 ? "bg-yellow-500" : "bg-emerald-500"
              const textColor =
                pct >= 70 ? "text-red-400" : pct >= 50 ? "text-orange-400" : pct >= 30 ? "text-yellow-400" : "text-emerald-400"

              const RegionIcon = region.icon
              const factors = riskData?.factors
              const topFactors = factors
                ? Object.entries(factors)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([key, val]) => `${key.replace(/([A-Z])/g, " $1").trim()}: ${val.toFixed(1)}`)
                : ["Loading..."]

              return (
                <div
                  key={region.name}
                  className="rounded-xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/50">
                        <RegionIcon className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-50">{region.category}</h4>
                        <p className="text-[10px] text-slate-500">{region.name}</p>
                      </div>
                    </div>
                    <span className={cn("text-2xl font-bold", textColor)}>{score.toFixed(1)}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {riskData && (
                    <p className="mt-2 text-[11px] text-slate-400">{riskData.recommendation}</p>
                  )}
                  <div className="mt-3 space-y-1.5">
                    {topFactors.map((factor) => (
                      <div key={factor} className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                        {factor}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
