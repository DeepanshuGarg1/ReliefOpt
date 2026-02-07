"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Brain,
  Bell,
  Radio,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Resource Allocation", href: "/resources", icon: Package },
  { label: "Disaster Intelligence", href: "/intelligence", icon: Brain },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Emergency Comm", href: "/communication", icon: Radio },
  { label: "Personnel", href: "/personnel", icon: Users },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border/50 bg-[hsl(220,45%,5%)] transition-all duration-300",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border/50 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600/20">
          <Shield className="h-5 w-5 text-emerald-400" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="truncate text-base font-bold tracking-tight text-emerald-50">
              ReliefOpt
            </h1>
            <p className="truncate text-[10px] font-medium uppercase tracking-widest text-emerald-500/70">
              Command Center
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-600/15 text-emerald-400 shadow-[inset_0_0_0_1px_hsl(160,84%,39%,0.2)]"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive ? "text-emerald-400" : "text-slate-500"
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* AI Status */}
      <div className="border-t border-border/50 px-3 py-4">
        {!collapsed && (
          <div className="mb-3 rounded-lg bg-emerald-950/40 px-3 py-2.5 shadow-[inset_0_0_0_1px_hsl(160,84%,39%,0.15)]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-emerald-400">
                AI Prediction Engine
              </span>
            </div>
            <p className="mt-1 text-[10px] text-emerald-500/60">Online - Models Active</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg py-2 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
