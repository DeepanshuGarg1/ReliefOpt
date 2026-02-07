"use client"

import useSWR, { mutate } from "swr"

// ── Fetcher ──────────────────────────────────────────────────────────────────

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const json = await res.json()
  return json.data
}

// ── Predict / Sentinel + Commander ───────────────────────────────────────────

export function usePrediction(district?: string | null, months = 3) {
  const params = new URLSearchParams()
  if (district) params.set("district", district)
  params.set("months", String(months))

  return useSWR(
    `/api/predict?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10_000 }
  )
}

export function usePredictionMeta(months = 3) {
  return useSWR(
    `/api/predict?months=${months}`,
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const json = await res.json()
      return { data: json.data, meta: json.meta }
    },
    { revalidateOnFocus: false, dedupingInterval: 10_000 }
  )
}

// ── Allocations ──────────────────────────────────────────────────────────────

export function useAllocations(district?: string, months = 3) {
  const params = new URLSearchParams()
  if (district) params.set("district", district)
  params.set("months", String(months))

  return useSWR(
    `/api/allocations?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10_000 }
  )
}

// ── Incidents ────────────────────────────────────────────────────────────────

export function useIncidents(filters?: {
  district?: string
  severity?: string
  status?: string
}) {
  const params = new URLSearchParams()
  if (filters?.district) params.set("district", filters.district)
  if (filters?.severity) params.set("severity", filters.severity)
  if (filters?.status) params.set("status", filters.status)

  const key = `/api/incidents?${params.toString()}`
  return useSWR(key, fetcher, { refreshInterval: 30_000 })
}

export function useIncidentsMeta(filters?: {
  district?: string
  severity?: string
  status?: string
}) {
  const params = new URLSearchParams()
  if (filters?.district) params.set("district", filters.district)
  if (filters?.severity) params.set("severity", filters.severity)
  if (filters?.status) params.set("status", filters.status)

  const key = `/api/incidents?${params.toString()}`
  return useSWR(
    `${key}#meta`,
    async () => {
      const res = await fetch(key)
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const json = await res.json()
      return { data: json.data, meta: json.meta }
    },
    { refreshInterval: 30_000 }
  )
}

// ── Intelligence ─────────────────────────────────────────────────────────────

export function useIntelligence(type: "news" | "forecast" = "news", search?: string) {
  const params = new URLSearchParams({ type })
  if (search) params.set("search", search)

  return useSWR(
    `/api/intelligence?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 15_000 }
  )
}

// ── Risk Assessment ──────────────────────────────────────────────────────────

export function useRiskAssessment(district?: string) {
  const params = new URLSearchParams()
  if (district) params.set("district", district)

  return useSWR(
    `/api/risk-assessment?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10_000 }
  )
}

// ── Personnel ────────────────────────────────────────────────────────────────

export function usePersonnel(filters?: {
  team?: string
  status?: string
  search?: string
}) {
  const params = new URLSearchParams()
  if (filters?.team && filters.team !== "All") params.set("team", filters.team)
  if (filters?.status && filters.status !== "All") params.set("status", filters.status)
  if (filters?.search) params.set("search", filters.search)

  const key = `/api/personnel?${params.toString()}`
  return useSWR(key, fetcher, { revalidateOnFocus: false })
}

export function usePersonnelMeta(filters?: {
  team?: string
  status?: string
  search?: string
}) {
  const params = new URLSearchParams()
  if (filters?.team && filters.team !== "All") params.set("team", filters.team)
  if (filters?.status && filters.status !== "All") params.set("status", filters.status)
  if (filters?.search) params.set("search", filters.search)

  const key = `/api/personnel?${params.toString()}`
  return useSWR(
    `${key}#meta`,
    async () => {
      const res = await fetch(key)
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const json = await res.json()
      return { data: json.data, meta: json.meta }
    },
    { revalidateOnFocus: false }
  )
}

// ── Alerts ───────────────────────────────────────────────────────────────────

export function useAlerts() {
  return useSWR("/api/alerts", fetcher, { refreshInterval: 15_000 })
}

export async function broadcastAlert(payload: {
  severity: string
  message: string
  targetRegion: string
  channels: string[]
}) {
  const res = await fetch("/api/alerts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || "Failed to broadcast alert")
  // Revalidate alerts cache
  mutate("/api/alerts")
  return json.data
}
