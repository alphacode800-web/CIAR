"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { Award, Trophy, Medal, Star, Crown } from "lucide-react"

const awards = [
  {
    icon: Trophy,
    title: "Best Digital Platform 2024",
    org: "Arab Digital Awards",
    key: "home.award_1",
  },
  {
    icon: Award,
    title: "Top Services Innovation",
    org: "Gulf Tech Summit",
    key: "home.award_2",
  },
  {
    icon: Medal,
    title: "Excellence in E-Commerce",
    org: "Middle East Business Awards",
    key: "home.award_3",
  },
  {
    icon: Crown,
    title: "Customer Choice Award",
    org: "Regional Tech Review",
    key: "home.award_4",
  },
  {
    icon: Star,
    title: "Rising Star Startup",
    org: "Global Innovation Forum",
    key: "home.award_5",
  },
]

export function AwardsBanner() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section ref={ref} className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-2xl border border-[oklch(0.78_0.14_82/15%)] p-8 sm:p-10 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute -top-16 -end-16 h-48 w-48 rounded-full bg-[oklch(0.78_0.14_82/6%)] blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 h-32 w-32 rounded-full bg-[oklch(0.78_0.14_82/4%)] blur-2xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/8%)] flex items-center justify-center">
                <Trophy className="h-5 w-5 text-[oklch(0.78_0.14_82)]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {t("home.awards_title") || "Awards & Recognition"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("home.awards_subtitle") || "Recognized for excellence in digital services"}
                </p>
              </div>
            </div>

            {/* Awards Grid */}
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 sm:flex-wrap sm:justify-center">
              {awards.map((award, i) => {
                const Icon = award.icon
                return (
                  <motion.div
                    key={award.key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex-shrink-0 snap-center rounded-xl bg-[oklch(0.78_0.14_82/5%)] border border-[oklch(0.78_0.14_82/10%)] px-5 py-4 flex items-center gap-3 hover:bg-[oklch(0.78_0.14_82/8%)] hover:border-[oklch(0.78_0.14_82/20%)] transition-all duration-300 min-w-[220px]"
                  >
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[oklch(0.78_0.14_82)] to-[oklch(0.70_0.13_72)] flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-[oklch(0.12_0.03_265)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {t(award.key + "_title") || award.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t(award.key + "_org") || award.org}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
