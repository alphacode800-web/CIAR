"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { ShieldCheck, Lock, Headphones, Zap } from "lucide-react"

const badges = [
  {
    icon: Lock,
    key: "home.badge_ssl",
    title: "SSL Secured",
    description: "256-bit encryption",
  },
  {
    icon: ShieldCheck,
    key: "home.badge_gdpr",
    title: "GDPR Compliant",
    description: "Data protection",
  },
  {
    icon: Headphones,
    key: "home.badge_support",
    title: "24/7 Support",
    description: "Always available",
  },
  {
    icon: Zap,
    key: "home.badge_uptime",
    title: "99.9% Uptime",
    description: "Enterprise SLA",
  },
]

export function TrustBadges() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section ref={ref} className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex gap-4 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory sm:justify-center sm:flex-wrap"
        >
          {badges.map((badge, i) => {
            const Icon = badge.icon
            return (
              <motion.div
                key={badge.key}
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-subtle flex-shrink-0 snap-center rounded-xl border border-[oklch(0.78_0.14_82/8%)] px-5 py-4 flex items-center gap-3 hover:border-[oklch(0.78_0.14_82/20%)] transition-all duration-300 min-w-[180px]"
              >
                <div className="h-10 w-10 rounded-lg bg-[oklch(0.78_0.14_82/10%)] flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-[oklch(0.78_0.14_82)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {t(badge.key) || badge.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(badge.key + "_desc") || badge.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
