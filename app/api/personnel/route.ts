import { NextResponse } from "next/server"

const personnel = [
  { id: "P-001", name: "Cmdr. Vikram Sharma", role: "Incident Commander", team: "Command Center", status: "active", location: "HQ, New Delhi", specialization: "Crisis Management" },
  { id: "P-002", name: "Dr. Aisha Patel", role: "Medical Lead", team: "Medical Response", status: "deployed", location: "Rishikesh, Uttarakhand", specialization: "Emergency Medicine" },
  { id: "P-003", name: "Lt. Rajesh Kumar", role: "Field Officer", team: "Field Operations", status: "deployed", location: "Tapovan, Rishikesh", specialization: "Search & Rescue" },
  { id: "P-004", name: "Sgt. Priya Meena", role: "Rescue Specialist", team: "Field Operations", status: "deployed", location: "Laxman Jhula, Rishikesh", specialization: "Water Rescue" },
  { id: "P-005", name: "Capt. Arjun Singh", role: "NDRF Team Lead", team: "NDRF Unit", status: "active", location: "Dehradun Base", specialization: "Disaster Response" },
  { id: "P-006", name: "Dr. Sneha Rao", role: "Epidemiologist", team: "Medical Response", status: "standby", location: "AIIMS, Delhi", specialization: "Disease Prevention" },
  { id: "P-007", name: "Mr. Anand Verma", role: "Logistics Coordinator", team: "Logistics Hub", status: "active", location: "Delhi Warehouse", specialization: "Supply Chain" },
  { id: "P-008", name: "Ms. Kavita Nair", role: "Communications Officer", team: "Command Center", status: "active", location: "HQ, New Delhi", specialization: "Emergency Comms" },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const team = searchParams.get("team")
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  let filtered = [...personnel]

  if (team && team !== "All") {
    filtered = filtered.filter((p) => p.team === team)
  }

  if (status && status !== "All") {
    filtered = filtered.filter((p) => p.status === status)
  }

  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.role.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
    )
  }

  const stats = {
    total: personnel.length,
    active: personnel.filter((p) => p.status === "active").length,
    deployed: personnel.filter((p) => p.status === "deployed").length,
    standby: personnel.filter((p) => p.status === "standby").length,
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    meta: stats,
  })
}

export async function POST(request: Request) {
  const body = await request.json()

  const newPerson = {
    id: `P-${String(personnel.length + 1).padStart(3, "0")}`,
    ...body,
    status: "standby",
  }

  return NextResponse.json({ success: true, data: newPerson }, { status: 201 })
}
