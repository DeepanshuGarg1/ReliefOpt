import { NextResponse } from "next/server"

// Mock disaster incident data - in production this would come from a database
const incidents = [
  { id: "INC-001", title: "Flash Flood Warning", location: "Rishikesh, Uttarakhand", lat: 30.0869, lng: 78.2676, type: "Flood", severity: "critical", affectedPeople: 45000, reportedAt: "2025-02-07T08:00:00Z", status: "active", resourcesNeeded: 120, resourcesDeployed: 78 },
  { id: "INC-002", title: "Cyclone Approach", location: "Chennai, Tamil Nadu", lat: 13.0827, lng: 80.2707, type: "Cyclone", severity: "high", affectedPeople: 120000, reportedAt: "2025-02-07T04:00:00Z", status: "active", resourcesNeeded: 250, resourcesDeployed: 180 },
  { id: "INC-003", title: "Landslide Alert", location: "Wayanad, Kerala", lat: 11.6854, lng: 76.1320, type: "Landslide", severity: "high", affectedPeople: 15000, reportedAt: "2025-02-06T22:00:00Z", status: "monitoring", resourcesNeeded: 60, resourcesDeployed: 42 },
  { id: "INC-004", title: "River Overflow", location: "Assam, Brahmaputra", lat: 26.2006, lng: 92.9376, type: "Flood", severity: "critical", affectedPeople: 280000, reportedAt: "2025-02-06T10:00:00Z", status: "active", resourcesNeeded: 400, resourcesDeployed: 210 },
  { id: "INC-005", title: "Cyclone Warning", location: "Odisha Coast", lat: 19.8135, lng: 85.8312, type: "Cyclone", severity: "high", affectedPeople: 1800000, reportedAt: "2025-02-06T06:00:00Z", status: "monitoring", resourcesNeeded: 150, resourcesDeployed: 130 },
  { id: "INC-006", title: "Seismic Activity", location: "Kutch, Gujarat", lat: 23.7337, lng: 69.8597, type: "Earthquake", severity: "moderate", affectedPeople: 2090000, reportedAt: "2025-02-05T14:00:00Z", status: "monitoring", resourcesNeeded: 80, resourcesDeployed: 60 },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const district = searchParams.get("district")
  const severity = searchParams.get("severity")
  const status = searchParams.get("status")

  let filtered = [...incidents]

  if (district) {
    filtered = filtered.filter((i) =>
      i.location.toLowerCase().includes(district.toLowerCase())
    )
  }

  if (severity) {
    filtered = filtered.filter((i) => i.severity === severity)
  }

  if (status) {
    filtered = filtered.filter((i) => i.status === status)
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    meta: {
      total: filtered.length,
      activeCount: filtered.filter((i) => i.status === "active").length,
      totalAffected: filtered.reduce((sum, i) => sum + i.affectedPeople, 0),
    },
  })
}

export async function POST(request: Request) {
  const body = await request.json()

  const newIncident = {
    id: `INC-${String(incidents.length + 1).padStart(3, "0")}`,
    ...body,
    reportedAt: new Date().toISOString(),
    status: "active",
    resourcesDeployed: 0,
  }

  return NextResponse.json({ success: true, data: newIncident }, { status: 201 })
}
