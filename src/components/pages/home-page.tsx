"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, ChevronDown, Eye, Layers, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"

interface HomeStats {
  totalProjects: number
  totalViews: number
}

export function HomePage({ stats }: { stats: HomeStats }) {
  const { t } = useI18n()
  const { navigate } = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const categories = new Set<string>()

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute top-0 -start-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 blur-3xl" />
      <div className="absolute top-20 -end-40 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 blur-3xl" />
      <div className="absolute bottom-0 start-1/3 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-cyan-500/10 to-emerald-500/5 blur-3xl" />

      {/* Hero content */}
      <motion.div
        style={{ y, opacity }}
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20 sm:pt-40 sm:pb-28 flex flex-col items-center text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge
            variant="secondary"
            className="px-4 py-1.5 text-sm font-medium border border-border/50 rounded-full"
          >
            {t("hero.badge")}
          </Badge>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight"
        >
          {t("hero.title_1")}{" "}
          <span className="gradient-text">{t("hero.title_2")}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
        >
          {t("hero.subtitle")}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Button
            size="lg"
            onClick={() => navigate({ page: "projects" })}
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl px-8"
          >
            {t("hero.cta")}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate({ page: "about" })}
            className="rounded-xl px-8 border-border/50 hover:bg-secondary"
          >
            {t("hero.cta2")}
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-6 sm:gap-12"
        >
          {[
            {
              icon: Layers,
              value: stats.totalProjects,
              label: t("hero.stat_products"),
            },
            {
              icon: Eye,
              value: stats.totalViews.toLocaleString(),
              label: t("hero.stat_views"),
            },
            {
              icon: Zap,
              value: "6+",
              label: t("hero.stat_categories"),
            },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <stat.icon className="h-5 w-5 text-emerald-400 mb-1" />
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 inset-x-0 flex justify-center"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="h-6 w-6 text-muted-foreground/50" />
        </motion.div>
      </motion.div>
    </div>
  )
}
