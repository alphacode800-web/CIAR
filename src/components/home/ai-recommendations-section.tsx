"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, ArrowLeft, ArrowRight } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Recommendation = {
  id: string
  title: string
  category: string
  type: "product" | "platform"
}

export function AiRecommendationsSection({
  seedId = "",
  className = "",
}: {
  seedId?: string
  className?: string
}) {
  const { locale, dir } = useI18n()
  const { navigate } = useRouter()
  const [items, setItems] = useState<Recommendation[]>([])
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({
          limit: "4",
          locale,
        })
        if (seedId) params.set("seedId", seedId)
        const res = await fetch(`/api/ai/recommendations?${params}`)
        const data = await res.json()
        setEnabled(Boolean(data.enabled))
        setItems(Array.isArray(data.recommendations) ? data.recommendations : [])
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [locale, seedId])

  if (loading || !enabled || items.length === 0) return null

  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight

  return (
    <section className={cn("mx-auto max-w-7xl px-4 py-12", className)}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-3 gap-1 border-primary/30 text-primary">
            <Sparkles className="h-3 w-3" />
            {locale === "ar" ? "مقترح لك" : "Recommended for you"}
          </Badge>
          <h2 className={`text-2xl font-bold sm:text-3xl ${locale === "ar" ? "font-arabic-display" : ""}`}>
            {locale === "ar" ? "توصيات ذكية" : "Smart Recommendations"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === "ar"
              ? "مختارة بناءً على اهتماماتك ونشاط المنصة"
              : "Picked based on your interests and platform activity"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <motion.button
            key={item.id}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              if (item.type === "platform") {
                navigate({ page: "platform", slug: item.id })
              } else {
                navigate({ page: "projects" })
              }
            }}
            className="group rounded-2xl border border-primary/15 bg-white/70 p-5 text-start shadow-sm transition hover:border-primary/35 hover:shadow-md dark:bg-[oklch(0.12_0.03_265/55%)]"
          >
            <p className="text-xs text-muted-foreground">{item.category}</p>
            <h3 className="mt-2 line-clamp-2 text-base font-semibold text-foreground group-hover:text-primary">
              {item.title}
            </h3>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
              {locale === "ar" ? "استكشف" : "Explore"}
              <Arrow className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
