"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BarDataItem {
  label: string
  value: number
  color?: string
}

interface ChartBarProps {
  data: BarDataItem[]
  maxValue?: number
  height?: number
  showValues?: boolean
  animated?: boolean
  barHeight?: number
}

const GOLD_COLORS = [
  "oklch(0.78 0.14 82)",
  "oklch(0.72 0.13 75)",
  "oklch(0.82 0.145 85)",
  "oklch(0.68 0.12 70)",
  "oklch(0.85 0.13 88)",
  "oklch(0.65 0.11 65)",
  "oklch(0.75 0.14 80)",
  "oklch(0.70 0.13 73)",
  "oklch(0.80 0.145 86)",
  "oklch(0.62 0.10 60)",
]

export function ChartBar({
  data,
  maxValue: maxProp,
  height,
  showValues = true,
  animated = true,
  barHeight = 28,
}: ChartBarProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const max = maxProp || Math.max(...data.map((d) => d.value), 1)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      ref={ref}
      className="w-full space-y-2.5"
      style={height ? { height: undefined } : undefined}
    >
      {data.map((item, index) => {
        const pct = max > 0 ? (item.value / max) * 100 : 0
        const barColor =
          item.color || GOLD_COLORS[index % GOLD_COLORS.length]
        return (
          <div key={item.label} className="group flex items-center gap-3">
            {/* Label */}
            <div className="w-28 sm:w-36 shrink-0 text-sm text-muted-foreground truncate text-right">
              {item.label}
            </div>

            {/* Bar container */}
            <div
              className="flex-1 rounded-full overflow-hidden bg-[oklch(0.78_0.14_82/6%)] dark:bg-[oklch(0.78_0.14_82/8%)]"
              style={{ height: `${barHeight}px` }}
            >
              {animated ? (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: visible ? `${pct}%` : 0 }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.06,
                    ease: "easeOut",
                  }}
                  className="h-full rounded-full relative overflow-hidden"
                  style={{ backgroundColor: barColor }}
                >
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0" />
                </motion.div>
              ) : (
                <div
                  className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0" />
                </div>
              )}
            </div>

            {/* Value */}
            {showValues && (
              <div className="w-16 shrink-0 text-sm font-medium text-foreground text-right">
                {typeof item.value === "number"
                  ? item.value.toLocaleString()
                  : item.value}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Donut Chart (CSS conic-gradient) ────────────────────────── */

interface DonutChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  size?: number
  strokeWidth?: number
  centerLabel?: string
  centerValue?: string
}

export function DonutChart({
  data,
  size = 180,
  strokeWidth = 28,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  const segments = data.reduce<Array<DonutChartProps["data"][number] & { pct: number; start: number; color: string }>>(
    (acc, item, i) => {
      const pct = total > 0 ? (item.value / total) * 100 : 0
      const start = acc.reduce((s, seg) => s + seg.pct, 0)
      acc.push({
        ...item,
        pct,
        start,
        color: item.color || GOLD_COLORS[i % GOLD_COLORS.length],
      })
      return acc
    },
    []
  )

  const gradientStops = segments
    .map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`)
    .join(", ")

  const innerSize = size - strokeWidth * 2

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative rounded-full"
        style={{ width: size, height: size }}
      >
        {/* Conic gradient ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: total > 0
              ? `conic-gradient(${gradientStops})`
              : `oklch(0.78_0.14_82/10%)`,
          }}
        />
        {/* Inner hole */}
        <div
          className="absolute rounded-full bg-background"
          style={{
            width: innerSize,
            height: innerSize,
            top: strokeWidth,
            left: strokeWidth,
          }}
        />
        {/* Center text */}
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && (
              <span className="text-2xl font-bold text-foreground">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-xs text-muted-foreground">{centerLabel}</span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-muted-foreground truncate">{s.label}</span>
            <span className="font-medium text-foreground ml-auto">
              {total > 0 ? Math.round(s.pct) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
