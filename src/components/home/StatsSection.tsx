"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { Layers, Users, Globe2, ShieldCheck } from "lucide-react"

const stats = [
  { icon: Layers, value: 8, suffix: "+", key: "home.stats_platforms", label: "Platforms" },
  { icon: Users, value: 50000, suffix: "+", key: "home.stats_users", label: "Active Users" },
  { icon: Globe2, value: 5, suffix: "", key: "home.stats_languages", label: "Languages" },
  { icon: ShieldCheck, value: 24, suffix: "/7", key: "home.stats_support", label: "Support" },
]

function AnimatedCounter({ value, suffix, isInView }: { value: number; suffix: string; isInView: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return

    const duration = 1500
    const steps = 60
    const interval = duration / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(value * eased))
      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [isInView, value])

  const displayValue = value >= 1000 ? `${(count / 1000).toFixed(count >= value ? 0 : 1)}K` : count

  return (
    <span className="tabular-nums tracking-tight">
      {displayValue}{suffix}
    </span>
  )
}

export function StatsSection() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section ref={ref} className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong rounded-2xl border border-[oklch(0.78_0.14_82/20%)] p-8 sm:p-12 shadow-xl shadow-black/10 relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute -top-20 start-1/2 -translate-x-1/2 h-60 w-[400px] rounded-full bg-[oklch(0.78_0.14_82/8%)] blur-[80px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center gap-3"
                >
                  <div className="h-12 w-12 rounded-xl bg-[oklch(0.78_0.14_82/10%)] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[oklch(0.78_0.14_82)]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold gradient-text">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} isInView={isInView} />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {t(stat.key) || stat.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
