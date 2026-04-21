"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Target, Lightbulb, Users, Rocket, Shield, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"

// ── Values configuration – keys come from translations ──────────────────────
const VALUES = [
  {
    icon: Lightbulb,
    titleKey: "about.value_innovation",
    descKey: "about.value_innovation_desc",
  },
  {
    icon: Users,
    titleKey: "about.value_users",
    descKey: "about.value_users_desc",
  },
  {
    icon: Shield,
    titleKey: "about.value_security",
    descKey: "about.value_security_desc",
  },
  {
    icon: Rocket,
    titleKey: "about.value_speed",
    descKey: "about.value_speed_desc",
  },
  {
    icon: Users,
    titleKey: "about.value_team",
    descKey: "about.value_team_desc",
  },
  {
    icon: Globe,
    titleKey: "about.value_global",
    descKey: "about.value_global_desc",
  },
]

// ── Stats configuration ─────────────────────────────────────────────────────
const STATS = [
  { valueKey: "about.stat_products_value", labelKey: "about.stat_products" },
  { valueKey: "about.stat_users_value", labelKey: "about.stat_users" },
  { valueKey: "about.stat_uptime_value", labelKey: "about.stat_uptime" },
  { valueKey: "about.stat_support_value", labelKey: "about.stat_support" },
]

// ── Animated section wrapper using useInView ────────────────────────────────
function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── About page component ────────────────────────────────────────────────────
export function AboutPage() {
  const { t, dir } = useI18n()

  return (
    <div dir={dir} className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern" />
      <div
        className={cn(
          "absolute top-20 -end-40 h-[500px] w-[500px] rounded-full blur-3xl",
          "bg-gradient-to-br from-emerald-500/15 to-teal-500/10"
        )}
      />
      <div
        className={cn(
          "absolute bottom-40 -start-40 h-[400px] w-[400px] rounded-full blur-3xl",
          "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5"
        )}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <AnimatedSection className="text-center mb-16">
          <Badge
            variant="secondary"
            className="px-4 py-1.5 text-sm mb-4 border border-border/50"
          >
            {t("about.badge")}
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {t("about.title_1")}{" "}
            <span className="gradient-text">{t("about.title_2")}</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("about.subtitle")}
          </p>
        </AnimatedSection>

        {/* ── Mission & Vision cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <AnimatedSection delay={0.1}>
            <div className="rounded-2xl border border-border/50 bg-card p-8 hover:border-border hover:shadow-lg transition-all h-full">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center mb-5">
                <Target className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold mb-3">
                {t("about.mission_title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.mission_text")}
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="rounded-2xl border border-border/50 bg-card p-8 hover:border-border hover:shadow-lg transition-all h-full">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 flex items-center justify-center mb-5">
                <Lightbulb className="h-6 w-6 text-violet-400" />
              </div>
              <h2 className="text-xl font-semibold mb-3">
                {t("about.vision_title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.vision_text")}
              </p>
            </div>
          </AnimatedSection>
        </div>

        {/* ── Values heading ──────────────────────────────────────────────── */}
        <AnimatedSection className="text-center mb-12" delay={0.1}>
          <h2 className="text-2xl sm:text-3xl font-bold">
            {t("about.values_title")}
          </h2>
        </AnimatedSection>

        {/* ── Values grid (6 items) ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {VALUES.map((value, i) => (
            <AnimatedSection key={value.titleKey} delay={0.1 + i * 0.08}>
              <div className="rounded-2xl border border-border/50 bg-card p-6 hover:border-border hover:shadow-lg transition-all h-full">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <value.icon className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-2">{t(value.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(value.descKey)}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* ── Stats bar ───────────────────────────────────────────────────── */}
        <AnimatedSection delay={0.2}>
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {STATS.map((stat) => (
                <div key={stat.labelKey} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold gradient-text">
                    {t(stat.valueKey)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t(stat.labelKey)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
