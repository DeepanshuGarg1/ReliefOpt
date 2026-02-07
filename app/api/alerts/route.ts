import { NextResponse } from "next/server"

interface AlertPayload {
  severity: string
  message: string
  targetRegion: string
  channels: string[]
}

// Store sent alerts in memory (in production use a database)
const sentAlerts: {
  id: string
  severity: string
  message: string
  region: string
  channels: string[]
  sentAt: string
  status: string
  recipientCount: number
}[] = []

export async function GET() {
  return NextResponse.json({
    success: true,
    data: sentAlerts,
    meta: { total: sentAlerts.length },
  })
}

export async function POST(request: Request) {
  const body: AlertPayload = await request.json()

  if (!body.message || !body.targetRegion || !body.channels?.length) {
    return NextResponse.json(
      { success: false, error: "Missing required fields: message, targetRegion, channels" },
      { status: 400 }
    )
  }

  // Simulate sending alerts through various channels
  const recipientEstimates: Record<string, number> = {
    sms: 50000,
    voice: 15000,
    push: 80000,
    radio: 200000,
  }

  const totalRecipients = body.channels.reduce(
    (sum, ch) => sum + (recipientEstimates[ch] || 10000),
    0
  )

  const alert = {
    id: `ALT-${String(sentAlerts.length + 1).padStart(3, "0")}`,
    severity: body.severity,
    message: body.message,
    region: body.targetRegion,
    channels: body.channels,
    sentAt: new Date().toISOString(),
    status: "delivered",
    recipientCount: totalRecipients,
  }

  sentAlerts.unshift(alert)

  return NextResponse.json(
    {
      success: true,
      data: alert,
      meta: {
        estimatedRecipients: totalRecipients,
        channelsUsed: body.channels,
        deliveryTime: "2-5 minutes",
      },
    },
    { status: 201 }
  )
}
