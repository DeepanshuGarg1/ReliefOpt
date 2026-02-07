"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import {
  Send,
  Bell,
  MessageSquare,
  Phone,
  Smartphone,
  Radio,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAlerts, broadcastAlert } from "@/lib/api-hooks"

const alertChannels = [
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "voice", label: "Voice Call", icon: Phone },
  { id: "push", label: "Push Notification", icon: Smartphone },
  { id: "radio", label: "FM Radio", icon: Radio },
]

const severityOptions = ["Warning", "Critical", "Emergency"]

const sevBadgeColors: Record<string, string> = {
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  emergency: "bg-red-600/20 text-red-300 border-red-500/30",
  Warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Critical: "bg-red-500/10 text-red-400 border-red-500/20",
  Emergency: "bg-red-600/20 text-red-300 border-red-500/30",
}

const statusIcons: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  delivered: { icon: CheckCircle2, color: "text-emerald-400" },
  partial: { icon: AlertTriangle, color: "text-amber-400" },
  failed: { icon: XCircle, color: "text-red-400" },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function AlertsPage() {
  const [severity, setSeverity] = useState("Warning")
  const [message, setMessage] = useState("")
  const [targetRegion, setTargetRegion] = useState("")
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  // Fetch alert history from API
  const { data: alertHistory, isLoading: alertsLoading } = useAlerts()

  const toggleChannel = (id: string) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleBroadcast = async () => {
    if (!message || !targetRegion || selectedChannels.length === 0) return
    setIsSending(true)
    setSendError(null)

    try {
      await broadcastAlert({
        severity,
        message,
        targetRegion,
        channels: selectedChannels,
      })
      setSendSuccess(true)
      setTimeout(() => setSendSuccess(false), 3000)
      setMessage("")
      setTargetRegion("")
      setSelectedChannels([])
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to broadcast")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Dispatch New Alert */}
        <div className="rounded-xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <Send className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-bold text-emerald-50">Dispatch New Alert</h2>
          </div>

          <div className="mt-6 space-y-5">
            {/* Severity */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                Alert Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full rounded-lg border border-border/50 bg-secondary/50 px-4 py-3 text-sm text-emerald-50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                {severityOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                Alert Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter alert message for citizens..."
                rows={4}
                className="w-full resize-y rounded-lg border border-border/50 bg-secondary/50 px-4 py-3 text-sm text-emerald-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>

            {/* Target Region */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                Target Region
              </label>
              <input
                type="text"
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                placeholder="e.g., Rishikesh, Uttarakhand"
                className="w-full rounded-lg border border-border/50 bg-secondary/50 px-4 py-3 text-sm text-emerald-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>

            {/* Alert Channels */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                Alert Channels (select multiple)
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {alertChannels.map((channel) => (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => toggleChannel(channel.id)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium transition-all",
                      selectedChannels.includes(channel.id)
                        ? "border-emerald-500/30 bg-emerald-600/15 text-emerald-400"
                        : "border-border/50 bg-secondary/30 text-slate-400 hover:bg-secondary/50"
                    )}
                  >
                    <channel.icon className="h-4 w-4" />
                    {channel.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error message */}
            {sendError && (
              <p className="text-sm text-red-400">{sendError}</p>
            )}

            {/* Broadcast Button */}
            <button
              type="button"
              onClick={handleBroadcast}
              disabled={isSending || !message || !targetRegion || selectedChannels.length === 0}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-bold transition-all",
                isSending
                  ? "bg-red-600/50 text-red-200"
                  : sendSuccess
                    ? "bg-emerald-600 text-emerald-50"
                    : "bg-red-600 text-red-50 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-500"
              )}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Broadcasting via API...
                </>
              ) : sendSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Alert Broadcast Successfully
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  Broadcast Alert to Selected Region
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alert History */}
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-border/50 p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-bold text-emerald-50">Alert History</h3>
            </div>
            {alertsLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            ) : (
              <span className="text-xs text-slate-500">
                {(alertHistory as unknown[])?.length ?? 0} alerts sent
              </span>
            )}
          </div>
          <div className="divide-y divide-border/30">
            {(alertHistory as Array<{
              id: string
              severity: string
              message: string
              region: string
              channels: string[]
              sentAt: string
              status: string
              recipientCount: number
            }> | undefined)?.map((alert) => {
              const statusData = statusIcons[alert.status] ?? statusIcons.delivered
              const StatusIcon = statusData.icon
              return (
                <div key={alert.id} className="px-5 py-4 transition-colors hover:bg-slate-800/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase",
                            sevBadgeColors[alert.severity] ?? sevBadgeColors.warning
                          )}
                        >
                          {alert.severity}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="h-3 w-3" />
                          {alert.region}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="h-3 w-3" />
                          {timeAgo(alert.sentAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{alert.message}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 text-slate-500" />
                          <span className="text-[11px] text-slate-500">
                            {alert.recipientCount.toLocaleString()} recipients
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {alert.channels.map((ch) => {
                            const channel = alertChannels.find((c) => c.id === ch)
                            if (!channel) return null
                            return (
                              <div key={ch} className="rounded-md bg-slate-800/50 p-1" title={channel.label}>
                                <channel.icon className="h-3 w-3 text-slate-400" />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusIcon className={cn("h-4 w-4", statusData.color)} />
                      <span className={cn("text-xs font-medium capitalize", statusData.color)}>
                        {alert.status}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}

            {!alertsLoading && (!alertHistory || (alertHistory as unknown[]).length === 0) && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-8 w-8 text-slate-600" />
                <p className="mt-2 text-sm text-slate-500">No alerts sent yet. Dispatch your first alert above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
