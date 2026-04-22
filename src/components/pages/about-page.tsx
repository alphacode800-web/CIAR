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

// ── Spotlight card (mouse-following glow) ───────────────────────────────────
function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    card.style.setProperty("--mouse-x", `${x}%`)
    card.style.setProperty("--mouse-y", `${y}%`)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn("card-spotlight", className)}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ── About page component ────────────────────────────────────────────────────
export function AboutPage() {
  const { t, dir } = useI18n()

  return (
    <div dir={dir} className="relative overflow-hidden">
      {/* ── Hero Header ───────────────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 pointer-events-none">
          <img src="/images/headers/about-header.png" alt="" className="w-full h-full object-cover opacity-40 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>
        {/* Gradient mesh background */}
        <div className="absolute inset-0 mesh-gradient" />
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 dot-pattern" />
        {/* Noise overlay wrapper */}
        <div className="noise-overlay absolute inset-0" />

        {/* Floating gradient orbs */}
        <div
          className={cn(
            "absolute top-10 -end-32 h-[400px] w-[400px] rounded-full blur-3xl animate-float",
            "bg-gradient-to-br from-[oklch(0.78_0.14_82/15%)] to-[oklch(0.72_0.12_75/10%)]"
          )}
        />
        <div
          className={cn(
            "absolute bottom-10 -start-32 h-[350px] w-[350px] rounded-full blur-3xl animate-float-delayed",
            "bg-gradient-to-br from-[oklch(0.55_0.15_280)]/10 to-[oklch(0.65_0.2_330)]/5"
          )}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm mb-6 glass-subtle border border-border/50"
            >
              {t("about.badge")}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t("about.title_1")}{" "}
              <span className="gradient-text">{t("about.title_2")}</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("about.subtitle")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        {/* ── Mission & Vision ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <AnimatedSection delay={0.1}>
            <SpotlightCard className="rounded-2xl border border-border/50 glass-subtle p-8 sm:p-10 h-full transition-all duration-300 hover:border-[oklch(0.78_0.14_82/25%)] hover:shadow-[0_0_30px_oklch(0.78_0.14_82/8%)]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.12_75/10%)] flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-[oklch(0.82_0.145_85)]" />
              </div>
              <h2 className="text-xl font-semibold mb-3">
                {t("about.mission_title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.mission_text")}
              </p>
            </SpotlightCard>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <SpotlightCard className="rounded-2xl border border-border/50 glass-subtle p-8 sm:p-10 h-full transition-all duration-300 hover:border-[oklch(0.55_0.15_280/25%)] hover:shadow-[0_0_30px_oklch(0.55_0.15_280/8%)]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[oklch(0.55_0.15_280)]/20 to-[oklch(0.65_0.2_330)]/10 flex items-center justify-center mb-6">
                <Lightbulb className="h-6 w-6 text-[oklch(0.70_0.15_280)]" />
              </div>
              <h2 className="text-xl font-semibold mb-3">
                {t("about.vision_title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.vision_text")}
              </p>
            </SpotlightCard>
          </AnimatedSection>
        </div>

        {/* ── Glow line divider ────────────────────────────────────────────── */}
        <div className="glow-line my-16 sm:my-20" />

        {/* ── Values heading ───────────────────────────────────────────────── */}
        <AnimatedSection className="text-center mb-12" delay={0.05}>
          <h2 className="text-2xl sm:text-3xl font-bold">
            {t("about.values_title")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            {t("about.subtitle")}
          </p>
        </AnimatedSection>

        {/* ── Values grid (3 × 2) ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {VALUES.map((value, i) => (
            <AnimatedSection key={value.titleKey} delay={i * 0.08}>
              <SpotlightCard className="rounded-2xl border border-border/50 glass-subtle p-6 h-full transition-all duration-300 hover:border-border hover:shadow-[0_0_20px_oklch(0.78_0.14_82/5%)]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.12_75/10%)] flex items-center justify-center mb-4">
                  <value.icon className="h-5 w-5 text-[oklch(0.82_0.145_85)]" />
                </div>
                <h3 className="font-semibold mb-2">{t(value.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(value.descKey)}
                </p>
              </SpotlightCard>
            </AnimatedSection>
          ))}
        </div>

        {/* ── Section divider ──────────────────────────────────────────────── */}
        <div className="section-divider my-16 sm:my-20" />

        {/* ── Stats bar ────────────────────────────────────────────────────── */}
        <AnimatedSection delay={0.15}>
          <div className="relative rounded-2xl border border-border/50 glass-strong p-8 sm:p-10 overflow-hidden">
            {/* Glow line at top */}
            <div className="absolute top-0 inset-x-0 glow-line" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
              {STATS.map((stat) => (
                <div key={stat.labelKey} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold gradient-text">
                    {t(stat.valueKey)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
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
