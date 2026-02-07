"use client"

import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopHeader } from "@/components/top-header"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950/30 to-slate-950">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
