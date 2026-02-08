"use client"

import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopHeader } from "@/components/top-header"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* 🌌 Emerald Energy Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/40 to-slate-950" />

        {/* Radial emerald glow */}
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-500/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-400/15 blur-[120px]" />

        {/* Cyber accent */}
        <div className="absolute top-1/3 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-emerald-600/10 blur-[100px]" />

        {/* Subtle noise overlay (optional but 🔥) */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
      </div>

      {/* Layout */}
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopHeader />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
