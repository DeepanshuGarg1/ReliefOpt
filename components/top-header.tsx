"use client"

import { usePathname } from "next/navigation"
import { Bell, Search } from "lucide-react"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/resources": "Resource Allocation",
  "/intelligence": "Disaster Intelligence",
  "/alerts": "Alerts",
  "/communication": "Emergency Communication",
  "/personnel": "Personnel",
}

export function TopHeader() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || "Dashboard"

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-[hsl(220,45%,5%)]/80 px-6 backdrop-blur-sm">
      <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#059669] to-transparent" />

      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500">Command Center</span>
        <span className="text-slate-600">/</span>
        <span className="font-medium text-emerald-50">{title}</span>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </button>
        <button type="button" className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  )
}
