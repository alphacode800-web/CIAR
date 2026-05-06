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
  columns?: 2 | 3 | 4 | 6
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
    6: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6",
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
            className={cn(
              "admin-vivid-stat admin-vivid-stat-image group relative overflow-hidden rounded-md border-0 p-5 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
              stat.color
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/10" />

            <div className="relative z-10">
              {/* Icon & Trend */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded bg-black/15 ring-1 ring-white/20">
                  <Icon className={cn("h-5 w-5", stat.iconColor)} />
                </div>
                {stat.trend && (
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
                      stat.trend.positive
                        ? "bg-white/20 text-white"
                        : "bg-black/20 text-white"
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
              <div className="text-4xl font-bold tracking-tight text-white">
                {isNumber ? (
                  <CountUp target={stat.value as number} />
                ) : (
                  stat.value
                )}
                {stat.suffix && (
                  <span className="ml-1 text-lg font-normal text-white/90">
                    {stat.suffix}
                  </span>
                )}
              </div>

              {/* Label */}
              <p className="mt-1 text-base font-semibold text-white/95">{stat.label}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
