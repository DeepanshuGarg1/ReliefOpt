import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: string; positive: boolean }
  variant?: "default" | "danger" | "warning" | "success"
}

const variantStyles = {
  default: {
    icon: "bg-emerald-600/15 text-emerald-400",
    border: "border-border/50",
  },
  danger: {
    icon: "bg-red-600/15 text-red-400",
    border: "border-red-500/20",
  },
  warning: {
    icon: "bg-amber-600/15 text-amber-400",
    border: "border-amber-500/20",
  },
  success: {
    icon: "bg-emerald-600/15 text-emerald-400",
    border: "border-emerald-500/20",
  },
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) {
  const style = variantStyles[variant]

  return (
    <div
      className={cn(
        "rounded-xl border bg-card/60 p-5 backdrop-blur-sm transition-all duration-200 hover:bg-card/80",
        style.border
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-50">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trend.positive ? "text-emerald-400" : "text-red-400"
              )}
            >
              {trend.positive ? "+" : ""}{trend.value}
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5", style.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
