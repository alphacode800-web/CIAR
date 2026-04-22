"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { Search, MousePointerClick, UserPlus, Rocket } from "lucide-react"

const steps = [
  {
    icon: Search,
    num: "01",
    key: "home.how_step1",
    title: "Browse",
    description: "Explore our 8 integrated platforms and discover the services that fit your needs.",
  },
  {
    icon: MousePointerClick,
    num: "02",
    key: "home.how_step2",
    title: "Choose",
    description: "Select the platform and features that match your personal or business requirements.",
  },
  {
    icon: UserPlus,
    num: "03",
    key: "home.how_step3",
    title: "Register",
    description: "Create your account in seconds with our streamlined registration process.",
  },
  {
    icon: Rocket,
    num: "04",
    key: "home.how_step4",
    title: "Start",
    description: "Begin using the platform immediately with full access to all features and support.",
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export function HowItWorks() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)

  return (
    <section ref={ref} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("home.how_title") || "How It Works"}
          </h2>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-[oklch(0.82_0.145_85)] via-[oklch(0.78_0.14_82)] to-[oklch(0.70_0.13_72)]" />
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            {t("home.how_subtitle") || "Get started in four simple steps. It takes less than two minutes."}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Horizontal connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[52px] start-[12.5%] end-[12.5%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-[oklch(0.78_0.14_82/10%)] via-[oklch(0.78_0.14_82/30%)] to-[oklch(0.78_0.14_82/10%)]" />
            {/* Animated dots on the line */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="h-2 w-2 rounded-full bg-[oklch(0.78_0.14_82/60%)] mt-[-3px]"
                animate={{ x: ["0%", "100%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.num}
                  {...fadeUp(i * 0.12)}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Vertical line (mobile) */}
                  {i < steps.length - 1 && (
                    <div className="lg:hidden absolute top-[60px] bottom-[-16px] w-px bg-gradient-to-b from-[oklch(0.78_0.14_82/30%)] to-[oklch(0.78_0.14_82/5%)]" />
                  )}

                  {/* Step Circle */}
                  <div className="relative z-10 mb-5">
                    <div className="h-[104px] w-[104px] rounded-full glass-strong border border-[oklch(0.78_0.14_82/20%)] flex items-center justify-center shadow-lg shadow-black/10">
                      <Icon className="h-8 w-8 text-[oklch(0.78_0.14_82)]" />
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-2 -end-2 h-7 w-7 rounded-full bg-gradient-to-br from-[oklch(0.78_0.14_82)] to-[oklch(0.72_0.13_75)] flex items-center justify-center">
                      <span className="text-xs font-bold text-[oklch(0.12_0.03_265)]">{step.num}</span>
                    </div>
                  </div>

                  {/* Text */}
                  <h3 className="text-lg font-semibold mb-2">
                    {t(step.key + "_title") || step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                    {t(step.key + "_desc") || step.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
