"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Car,
  ShoppingCart,
  Plane,
  UtensilsCrossed,
  GraduationCap,
  HeartPulse,
  Truck,
} from "lucide-react"

const platforms = [
  { name: "CIAR Real Estate", category: "Real Estate", icon: Building2, gradient: "from-[oklch(0.55_0.12_250)] to-[oklch(0.35_0.06_265)]" },
  { name: "CIAR Drive", category: "Car Rental", icon: Car, gradient: "from-[oklch(0.55_0.12_180)] to-[oklch(0.35_0.06_200)]" },
  { name: "CIAR Shop", category: "E-Commerce", icon: ShoppingCart, gradient: "from-[oklch(0.55_0.14_330)] to-[oklch(0.35_0.08_310)]" },
  { name: "CIAR Travel", category: "Tourism", icon: Plane, gradient: "from-[oklch(0.55_0.14_55)] to-[oklch(0.35_0.08_75)]" },
  { name: "CIAR Food", category: "Food Delivery", icon: UtensilsCrossed, gradient: "from-[oklch(0.55_0.14_20)] to-[oklch(0.35_0.08_10)]" },
  { name: "CIAR Learn", category: "Education", icon: GraduationCap, gradient: "from-[oklch(0.55_0.12_280)] to-[oklch(0.35_0.06_300)]" },
  { name: "CIAR Health", category: "Healthcare", icon: HeartPulse, gradient: "from-[oklch(0.55_0.14_150)] to-[oklch(0.35_0.08_130)]" },
  { name: "CIAR Logistics", category: "Logistics", icon: Truck, gradient: "from-[oklch(0.55_0.10_30)] to-[oklch(0.35_0.06_50)]" },
]

export function PlatformShowcase() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  const items = [...platforms, ...platforms]

  return (
    <section ref={ref} className="relative py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("home.platforms_title") || "Our Platform Ecosystem"}
          </h2>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-[oklch(0.82_0.145_85)] via-[oklch(0.78_0.14_82)] to-[oklch(0.70_0.13_72)]" />
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            {t("home.platforms_subtitle") || "Eight specialized platforms, one unified experience."}
          </p>
        </motion.div>
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 sm:w-32 bg-gradient-to-e from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 sm:w-32 bg-gradient-to-s from-background to-transparent" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex animate-showcase-scroll gap-5"
      >
        {items.map((platform, i) => {
          const Icon = platform.icon
          return (
            <div
              key={`${platform.name}-${i}`}
              className="group min-w-[280px] sm:min-w-[320px] flex-shrink-0 rounded-2xl border border-[oklch(0.78_0.14_82/10%)] overflow-hidden transition-all duration-500 hover:border-[oklch(0.78_0.14_82/25%)] hover:shadow-xl hover:shadow-[oklch(0.78_0.14_82/5%)] bg-card/50 backdrop-blur-sm"
            >
              {/* Image area */}
              <div className={cn("relative h-44 bg-gradient-to-br flex items-center justify-center", platform.gradient)}>
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.10_0.025_265/80%)] to-transparent" />
                <Icon className="h-14 w-14 text-white/30 group-hover:text-white/50 transition-colors duration-300 relative z-10" />
                <div className="absolute top-3 start-3 z-10">
                  <Badge className="glass text-xs font-medium border-[oklch(0.78_0.14_82/20%)]">
                    {t(`home.service_${platform.category.toLowerCase().replace(/ /g, "_")}`) || platform.category}
                  </Badge>
                </div>
              </div>
              {/* Info */}
              <div className="p-5">
                <h3 className="text-base font-semibold group-hover:text-[oklch(0.78_0.14_82)] transition-colors duration-300">
                  {platform.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {t(`home.platform_${platform.category.toLowerCase().replace(/ /g, "_")}_desc`) ||
                    `Comprehensive ${platform.category.toLowerCase()} solutions powered by cutting-edge technology.`}
                </p>
              </div>
            </div>
          )
        })}
      </motion.div>

      <style jsx>{`
        @keyframes showcase-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-showcase-scroll {
          animation: showcase-scroll 40s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-showcase-scroll {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
