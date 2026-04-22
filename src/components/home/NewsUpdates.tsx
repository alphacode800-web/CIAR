"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { Calendar, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const news = [
  {
    date: "Dec 15, 2024",
    title: "CIAR Launches New Logistics Platform",
    excerpt: "Expanding our ecosystem with a comprehensive logistics management solution for businesses of all sizes across the MENA region.",
    category: "Announcement",
    key: "home.news_1",
  },
  {
    date: "Nov 28, 2024",
    title: "Real Estate Platform Reaches 10,000 Listings",
    excerpt: "A major milestone for our property marketplace as demand continues to grow for digital real estate solutions.",
    category: "Milestone",
    key: "home.news_2",
  },
  {
    date: "Nov 10, 2024",
    title: "CIAR Health Introduces Telemedicine Features",
    excerpt: "New virtual consultation capabilities now available, connecting patients with healthcare providers remotely.",
    category: "Feature",
    key: "home.news_3",
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export function NewsUpdates() {
  const { t, dir } = useI18n()
  const ref = useRef<HTMLDivElement>(null)

  return (
    <section ref={ref} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeUp(0)} className={cn("flex items-end justify-between mb-14", dir === "rtl" ? "flex-row-reverse" : "")}>
          <div className={cn(dir === "rtl" ? "text-end" : "text-start")}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {t("home.news_title") || "Latest Updates"}
            </h2>
            <div className={cn(
              "mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-[oklch(0.82_0.145_85)] via-[oklch(0.78_0.14_82)] to-[oklch(0.70_0.13_72)]",
              dir === "rtl" ? "ml-auto" : ""
            )} />
            <p className="mt-4 text-muted-foreground max-w-lg">
              {t("home.news_subtitle") || "Stay informed about the latest developments across our platforms."}
            </p>
          </div>
          <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-[oklch(0.78_0.14_82)] hover:text-[oklch(0.82_0.145_85)] transition-colors duration-300">
            {t("home.news_view_all") || "View All"}
            <ArrowRight className={cn("h-4 w-4", dir === "rtl" && "rotate-180")} />
          </button>
        </motion.div>

        {/* News Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="glass-subtle rounded-2xl border border-[oklch(0.78_0.14_82/10%)] overflow-hidden group hover:border-[oklch(0.78_0.14_82/20%)] hover:shadow-xl hover:shadow-[oklch(0.78_0.14_82/5%)] transition-all duration-500"
            >
              {/* Date & Category */}
              <div className="p-5 pb-0 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{t(item.key + "_date") || item.date}</span>
                </div>
                <Badge
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.78_0.14_82/10%)] text-[oklch(0.78_0.14_82)] border border-[oklch(0.78_0.14_82/15%)]"
                >
                  {t(item.key + "_category") || item.category}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-[oklch(0.78_0.14_82)] transition-colors duration-300">
                  {t(item.key + "_title") || item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                  {t(item.key + "_excerpt") || item.excerpt}
                </p>
                <button className="inline-flex items-center gap-1.5 text-sm font-medium text-[oklch(0.78_0.14_82)] hover:text-[oklch(0.82_0.145_85)] transition-colors duration-300">
                  {t("home.news_read_more") || "Read More"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="sm:hidden mt-8 text-center">
          <button className="inline-flex items-center gap-2 text-sm font-medium text-[oklch(0.78_0.14_82)]">
            {t("home.news_view_all") || "View All Updates"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
