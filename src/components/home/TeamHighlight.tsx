"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { Code2, Palette, Headphones, Briefcase } from "lucide-react"

const teamRoles = [
  {
    icon: Code2,
    role: "Engineering",
    description: "Full-stack experts building robust, scalable platforms with modern technologies and best practices.",
    gradient: "from-[oklch(0.60_0.14_250)] to-[oklch(0.40_0.08_265)]",
    key: "home.team_engineering",
  },
  {
    icon: Palette,
    role: "Design",
    description: "Creative designers crafting intuitive, beautiful user interfaces that delight users across all platforms.",
    gradient: "from-[oklch(0.65_0.14_330)] to-[oklch(0.45_0.08_310)]",
    key: "home.team_design",
  },
  {
    icon: Headphones,
    role: "Support",
    description: "Dedicated support specialists providing 24/7 assistance and ensuring seamless user experiences.",
    gradient: "from-[oklch(0.60_0.14_55)] to-[oklch(0.40_0.08_75)]",
    key: "home.team_support",
  },
  {
    icon: Briefcase,
    role: "Management",
    description: "Experienced leaders driving strategic vision and operational excellence across all eight platforms.",
    gradient: "from-[oklch(0.60_0.12_150)] to-[oklch(0.40_0.06_130)]",
    key: "home.team_management",
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export function TeamHighlight() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)

  return (
    <section ref={ref} className="relative py-20 sm:py-28">
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("home.team_title") || "Our Expert Team"}
          </h2>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-[oklch(0.82_0.145_85)] via-[oklch(0.78_0.14_82)] to-[oklch(0.70_0.13_72)]" />
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            {t("home.team_subtitle") || "A talented team of professionals dedicated to delivering excellence across every platform."}
          </p>
        </motion.div>

        {/* Team Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamRoles.map((role, i) => (
            <motion.div
              key={role.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="glass-subtle rounded-2xl border border-[oklch(0.78_0.14_82/10%)] p-6 text-center hover:border-[oklch(0.78_0.14_82/20%)] transition-all duration-300 group"
            >
              {/* Avatar placeholder */}
              <div className="relative mx-auto mb-5">
                <div
                  className={cn(
                    "h-20 w-20 rounded-full mx-auto flex items-center justify-center",
                    "bg-gradient-to-br group-hover:scale-105 transition-transform duration-300"
                  )}
                  style={{
                    backgroundImage: `linear-gradient(135deg, oklch(0.78 0.14 82 / 25%), oklch(0.72 0.13 75 / 10%))`,
                  }}
                >
                  <role.icon className="h-9 w-9 text-[oklch(0.78_0.14_82/70%)]" />
                </div>
                {/* Glow ring */}
                <div className="absolute inset-0 h-20 w-20 mx-auto rounded-full bg-[oklch(0.78_0.14_82/5%)] blur-lg pointer-events-none" />
              </div>

              <h3 className="text-lg font-semibold mb-2 group-hover:text-[oklch(0.78_0.14_82)] transition-colors duration-300">
                {t(role.key + "_title") || role.role}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(role.key + "_desc") || role.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
