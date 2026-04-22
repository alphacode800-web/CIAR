"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useI18n } from "@/lib/i18n-context"
import { Sparkles, Zap, Globe, ShieldCheck } from "lucide-react"

const marqueeItems = [
  { icon: Sparkles, key: "home.marquee_platforms", fallback: "8+ Digital Platforms" },
  { icon: Globe, key: "home.marquee_users", fallback: "50K+ Active Users" },
  { key: "home.marquee_languages", fallback: "5 Languages Supported" },
  { icon: ShieldCheck, key: "home.marquee_support", fallback: "24/7 Customer Support" },
  { key: "home.marquee_services", fallback: "100+ Integrated Services" },
  { icon: Zap, key: "home.marquee_uptime", fallback: "99.9% Platform Uptime" },
  { key: "home.marquee_security", fallback: "Enterprise-Grade Security" },
  { key: "home.marquee_global", fallback: "Available in 20+ Countries" },
]

export function MarqueeBanner() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  const items = [...marqueeItems, ...marqueeItems]

  return (
    <div ref={ref} className="relative overflow-hidden py-6">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-24 bg-gradient-to-e from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-24 bg-gradient-to-s from-background to-transparent" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="flex animate-marquee gap-12 whitespace-nowrap"
      >
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <div
              key={`${item.key}-${i}`}
              className="flex items-center gap-2.5 text-sm sm:text-base font-medium text-[oklch(0.78_0.14_82/70%)] select-none"
            >
              {Icon && <Icon className="h-4 w-4 text-[oklch(0.78_0.14_82)]" />}
              <span>{t(item.key) || item.fallback}</span>
              <span className="text-[oklch(0.78_0.14_82/30%)] mx-1">•</span>
            </div>
          )
        })}
      </motion.div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
