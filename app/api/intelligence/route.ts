import { NextResponse } from "next/server"

const newsData = [
  {
    id: "N-001",
    title: "IMD Issues Red Alert for Uttarakhand, Heavy Rainfall Expected",
    source: "India Meteorological Department",
    publishedAt: "2026-02-07T09:30:00Z",
    severity: "critical",
    region: "Uttarakhand",
    summary: "The India Meteorological Department has issued a red alert for 5 districts in Uttarakhand. Extremely heavy rainfall (>204mm) expected in next 48 hours.",
    aiConfidence: 0.95,
    tags: ["weather", "flood", "rainfall"],
  },
  {
    id: "N-002",
    title: "Cyclone Formation in Bay of Bengal - Category 3 Expected",
    source: "NOAA / IMD",
    publishedAt: "2026-02-07T07:00:00Z",
    severity: "critical",
    region: "Bay of Bengal",
    summary: "A deep depression in the Bay of Bengal is expected to intensify into a severe cyclonic storm within 24 hours.",
    aiConfidence: 0.88,
    tags: ["cyclone", "weather", "coastal"],
  },
  {
    id: "N-003",
    title: "Seismic Activity Detected Near Kutch Region",
    source: "National Seismological Bureau",
    publishedAt: "2026-02-07T04:00:00Z",
    severity: "warning",
    region: "Gujarat",
    summary: "Series of micro-earthquakes (2.5-3.8 on Richter) detected. No tsunami risk.",
    aiConfidence: 0.72,
    tags: ["earthquake", "seismic"],
  },
  {
    id: "N-004",
    title: "Brahmaputra River Levels Rising Above Danger Mark",
    source: "Central Water Commission",
    publishedAt: "2026-02-07T01:00:00Z",
    severity: "warning",
    region: "Assam",
    summary: "Water levels at multiple monitoring stations exceeding danger marks. Flood alerts issued for 12 districts.",
    aiConfidence: 0.91,
    tags: ["flood", "river", "water"],
  },
]

const forecastData = [
  { region: "Uttarakhand", date: "2026-02-08", rainfall: 180, windSpeed: 45, temperature: 12, humidity: 92, disasterRisk: "extreme", prediction: "Flash floods likely in Rishikesh-Haridwar belt" },
  { region: "Odisha Coast", date: "2026-02-09", rainfall: 220, windSpeed: 120, temperature: 28, humidity: 88, disasterRisk: "extreme", prediction: "Cyclone landfall expected, Category 3-4" },
  { region: "Assam Plains", date: "2026-02-08", rainfall: 95, windSpeed: 25, temperature: 26, humidity: 85, disasterRisk: "high", prediction: "River flooding in low-lying areas" },
  { region: "Kerala Hills", date: "2026-02-10", rainfall: 140, windSpeed: 30, temperature: 22, humidity: 90, disasterRisk: "high", prediction: "Landslide risk in Wayanad, Idukki" },
  { region: "Gujarat", date: "2026-02-08", rainfall: 5, windSpeed: 15, temperature: 32, humidity: 40, disasterRisk: "moderate", prediction: "Seismic monitoring, no major event predicted" },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "news"
  const search = searchParams.get("search")

  if (type === "forecast") {
    let forecasts = [...forecastData]
    if (search) {
      forecasts = forecasts.filter((f) =>
        f.region.toLowerCase().includes(search.toLowerCase())
      )
    }
    return NextResponse.json({ success: true, data: forecasts })
  }

  let news = [...newsData]
  if (search) {
    news = news.filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.region.toLowerCase().includes(search.toLowerCase()) ||
        n.tags.some((t) => t.includes(search.toLowerCase()))
    )
  }

  return NextResponse.json({
    success: true,
    data: news,
    meta: {
      aiEngineStatus: "online",
      sourcesMonitored: 42,
      lastScan: new Date().toISOString(),
    },
  })
}
