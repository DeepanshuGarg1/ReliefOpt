import { NextResponse } from "next/server"

// Simulated ML-based allocation engine
interface AllocationRequest {
  district: string
  months: number
  disasterType?: string
}

interface AllocationResult {
  district: string
  predictedDemand: {
    shelterCapacity: number
    medicalTeams: number
    foodSupplyKg: number
    rescuePersonnel: number
    vehicles: number
  }
  riskScore: number
  confidence: number
  allocations: {
    resource: string
    quantity: number
    source: string
    eta: string
    priority: "critical" | "high" | "medium" | "low"
  }[]
}

// Simulated ML prediction function
function predictResourceDemand(district: string, months: number): AllocationResult {
  // Simulated predictions - in production these come from your ML model
  const districtData: Record<string, { base: number; riskFactor: number }> = {
    rishikesh: { base: 45000, riskFactor: 0.87 },
    chennai: { base: 120000, riskFactor: 0.75 },
    wayanad: { base: 15000, riskFactor: 0.69 },
    assam: { base: 280000, riskFactor: 0.92 },
    jorhat: { base: 280000, riskFactor: 0.92 },
    odisha: { base: 85000, riskFactor: 0.65 },
    kutch: { base: 2090000, riskFactor: 0.38 },
    default: { base: 50000, riskFactor: 0.5 },
  }

  const key = Object.keys(districtData).find((k) => district.toLowerCase().includes(k)) || "default"
  const data = districtData[key]
  const timeFactor = Math.min(months / 12, 1)

  const population = Math.round(data.base * (1 + timeFactor * 0.3))
  const riskScore = Math.round(data.riskFactor * 10 * 10) / 10

  return {
    district,
    predictedDemand: {
      shelterCapacity: Math.round(population * 0.15),
      medicalTeams: Math.round(population / 5000),
      foodSupplyKg: Math.round(population * 2.5),
      rescuePersonnel: Math.round(population / 1000),
      vehicles: Math.round(population / 3000),
    },
    riskScore,
    confidence: Math.round((0.85 + Math.random() * 0.1) * 100) / 100,
    allocations: [
      { resource: "Medical Teams", quantity: Math.round(population / 5000), source: "AIIMS Delhi + Regional", eta: "4-6 hours", priority: "critical" },
      { resource: "Food Supplies", quantity: Math.round(population * 2.5), source: "Central Warehouse", eta: "6-8 hours", priority: "critical" },
      { resource: "Shelter Kits", quantity: Math.round(population * 0.15), source: "State Depot", eta: "3-5 hours", priority: "high" },
      { resource: "Rescue Personnel", quantity: Math.round(population / 1000), source: "NDRF + State Forces", eta: "2-4 hours", priority: "critical" },
      { resource: "Vehicles", quantity: Math.round(population / 3000), source: "Fleet Pool", eta: "1-3 hours", priority: "high" },
      { resource: "Water Purification", quantity: Math.round(population * 0.5), source: "NGO Partners", eta: "8-12 hours", priority: "medium" },
    ],
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const district = searchParams.get("district") || "Rishikesh"
  const months = Number.parseInt(searchParams.get("months") || "3", 10)

  const result = predictResourceDemand(district, months)

  return NextResponse.json({
    success: true,
    data: result,
    meta: {
      modelVersion: "v2.4.1",
      lastTrained: "2026-02-01T00:00:00Z",
      accuracy: 0.942,
    },
  })
}

export async function POST(request: Request) {
  const body: AllocationRequest = await request.json()

  const result = predictResourceDemand(body.district, body.months)

  return NextResponse.json({
    success: true,
    data: result,
    meta: {
      modelVersion: "v2.4.1",
      lastTrained: "2026-02-01T00:00:00Z",
      accuracy: 0.942,
    },
  })
}
