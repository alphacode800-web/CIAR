"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatItem {
  icon: React.ElementType
  label: string
  value: number | string
  suffix?: string
  color: string
  iconColor: string
  trend?: { value: number; positive: boolean }
}

interface QuickStatsProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
}

function CountUp({
  target,
  duration = 1200,
}: {
  target: number
  duration?: number
}) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setDisplay(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [target, duration])

  return <span ref={ref}>{display.toLocaleString()}</span>
}

export function QuickStats({ stats, columns = 4 }: QuickStatsProps) {
  const gridCols: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns])}>
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const isNumber = typeof stat.value === "number"
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
            className="group relative rounded-2xl border border-[oklch(0.78_0.14_82/12%)] bg-[oklch(0.14_0.028_265/50%)] backdrop-blur-xl p-5 overflow-hidden transition-all duration-300 hover:border-[oklch(0.78_0.14_82/25%)] hover:shadow-[0_0_30px_oklch(0.78_0.14_82/8%)] dark:bg-[oklch(0.12_0.03_265/60%)]"
          >
            {/* Subtle gradient accent at top-left */}
            <div
              className={cn(
                "absolute -top-12 -left-12 w-32 h-32 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-35",
                stat.color
              )}
            />

            <div className="relative z-10">
              {/* Icon & Trend */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center",
                    stat.color
                  )}
                >
                  <Icon className={cn("h-5 w-5", stat.iconColor)} />
                </div>
                {stat.trend && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                      stat.trend.positive
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-red-400 bg-red-500/10"
                    )}
                  >
                    {stat.trend.positive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(stat.trend.value)}%
                  </div>
                )}
              </div>

              {/* Value */}
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {isNumber ? (
                  <CountUp target={stat.value as number} />
                ) : (
                  stat.value
                )}
                {stat.suffix && (
                  <span className="text-lg font-normal text-muted-foreground ml-1">
                    {stat.suffix}
                  </span>
                )}
              </div>

              {/* Label */}
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
