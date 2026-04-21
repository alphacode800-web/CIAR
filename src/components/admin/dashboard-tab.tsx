"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FolderOpen, Eye, Languages } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n-context"

export function DashboardTab() {
  const { t } = useI18n()
  const [stats, setStats] = useState({ projects: 0, views: 0, translations: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [projRes, transRes] = await Promise.all([
          fetch("/api/projects?locale=en"),
          fetch("/api/translations?locale=en"),
        ])
        const projData = await projRes.json()
        const transData = await transRes.json()
        setStats({
          projects: projData.projects?.length || 0,
          views: projData.stats?.totalViews || 0,
          translations: Object.keys(transData).length || 0,
        })
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cards = [
    {
      label: t("admin.total_projects"),
      value: stats.projects,
      icon: FolderOpen,
      color: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-400",
    },
    {
      label: t("admin.total_views"),
      value: stats.views.toLocaleString(),
      icon: Eye,
      color: "from-violet-500/20 to-fuchsia-500/10",
      iconColor: "text-violet-400",
    },
    {
      label: t("admin.total_translations"),
      value: stats.translations,
      icon: Languages,
      color: "from-amber-500/20 to-orange-500/10",
      iconColor: "text-amber-400",
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t("admin.dashboard")}</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="rounded-2xl border border-border/50 bg-card p-6"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}
              >
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {card.label}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
