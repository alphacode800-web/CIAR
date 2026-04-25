"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { Globe, MapPin } from "lucide-react"

const regions = [
  { name: "Saudi Arabia", code: "SA", key: "home.region_sa" },
  { name: "United Arab Emirates", code: "AE", key: "home.region_ae" },
  { name: "Egypt", code: "EG", key: "home.region_eg" },
  { name: "Kuwait", code: "KW", key: "home.region_kw" },
  { name: "Qatar", code: "QA", key: "home.region_qa" },
  { name: "Bahrain", code: "BH", key: "home.region_bh" },
  { name: "Oman", code: "OM", key: "home.region_om" },
  { name: "Jordan", code: "JO", key: "home.region_jo" },
  { name: "Morocco", code: "MA", key: "home.region_ma" },
  { name: "Turkey", code: "TR", key: "home.region_tr" },
  { name: "Germany", code: "DE", key: "home.region_de" },
  { name: "France", code: "FR", key: "home.region_fr" },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export function GlobalPresence() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)

  return (
    <section ref={ref} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4 text-[oklch(0.78_0.14_82)]">
            <Globe className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              {t("home.global_badge") || "Global Reach"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("home.global_title") || "Available Worldwide"}
          </h2>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-[oklch(0.82_0.145_85)] via-[oklch(0.78_0.14_82)] to-[oklch(0.70_0.13_72)]" />
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            {t("home.global_subtitle") || "Our platforms serve users across the Middle East, North Africa, and Europe."}
          </p>
        </motion.div>

        {/* Regions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {regions.map((region, i) => (
            <motion.div
              key={region.code}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="glass-subtle rounded-xl border border-[oklch(0.78_0.14_82/8%)] p-4 flex flex-col items-center gap-2 text-center hover:border-[oklch(0.78_0.14_82/20%)] hover:bg-[oklch(0.78_0.14_82/3%)] transition-all duration-300 group"
            >
              <span className="text-xs font-mono rounded-md border border-border/40 px-2 py-1">{region.code}</span>
              <span className="text-sm font-medium group-hover:text-[oklch(0.78_0.14_82)] transition-colors duration-300">
                {t(region.key) || region.name}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>Active</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Globe decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex justify-center mt-10"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-[oklch(0.55_0.14_150)] animate-pulse" />
            <span>{t("home.global_live") || "Serving 20+ countries with local support"}</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
