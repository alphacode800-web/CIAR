"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Bell,
  Building2,
  Calendar,
  Download,
  FolderOpen,
  Globe2,
  Plus,
  RefreshCw,
  Star,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"
import { useAdminNav } from "@/lib/admin-nav-context"
import { useRouter } from "@/lib/router-context"
import { localizeAdminCategory, localizeAdminPlatformName } from "@/lib/admin-analytics-labels"
import { cn } from "@/lib/utils"

interface AnalyticsData {
  projects: { total: number; published: number; draft: number; featured: number }
  totalViews: number
  avgViews: number
  contactMessages: number
  contacts: number
  translationCoverage: number
  projectsByCategory: Array<{ category: string; count: number }>
  topProjects: Array<{
    id: string
    slug: string
    name: string
    views: number
    category: string
    featured: boolean
    published: boolean
  }>
}

function isAnalyticsData(value: unknown): value is AnalyticsData {
  if (!value || typeof value !== "object") return false
  const v = value as Partial<AnalyticsData>
  return !!v.projects && typeof v.projects.total === "number"
}

const STAT_GRADIENTS = [
  "admin-pro-stat-orange",
  "admin-pro-stat-purple",
  "admin-pro-stat-green",
  "admin-pro-stat-blue",
]

export function AdminProDashboard() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { setTab } = useAdminNav()
  const { navigate } = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const fetchData = useCallback(async () => {
    setSyncing(true)
    try {
      const res = await fetch("/api/admin/analytics")
      const data = await res.json()
      setAnalytics(isAnalyticsData(data) ? data : null)
    } catch {
      setAnalytics(null)
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const categories = analytics?.projectsByCategory ?? []
  const topProjects = analytics?.topProjects ?? []
  const avgRating = analytics
    ? Math.min(5, Math.max(3.5, (analytics.translationCoverage / 20) + 3.5)).toFixed(1)
    : "4.5"

  const statCards = analytics
    ? [
        {
          label: t("admin.avg_rating") || "متوسط التقييم",
          value: avgRating,
          sub: `${analytics.totalViews.toLocaleString()} ${t("admin.views_label") || "مشاهدة"}`,
          icon: Star,
        },
        {
          label: t("admin.total_tours") || "إجمالي المشاهدات",
          value: analytics.totalViews.toLocaleString(),
          sub: t("admin.available") || "متاح",
          icon: Calendar,
        },
        {
          label: t("admin.published_platforms") || "المنصات المنشورة",
          value: String(analytics.projects.published),
          sub: `${analytics.projects.published} ${t("admin.active") || "نشط"}`,
          icon: Building2,
        },
        {
          label: t("admin.total_categories") || "إجمالي التصنيفات",
          value: String(categories.length || analytics.projects.total),
          sub: `${categories.length || analytics.projects.total} ${t("admin.active") || "نشط"}`,
          icon: Globe2,
        },
      ]
    : []

  const dateStr = now.toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="admin-pro-dashboard space-y-6">
      {/* Header row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t("admin.dashboard") || "لوحة التحكم"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("admin.dashboard_pro_subtitle") || "إدارة شاملة للمنصات والمحتوى والمستخدمين"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="hidden text-xs text-slate-500 lg:inline">{dateStr}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={syncing}
            className="gap-2 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
            {t("admin.sync") || "مزامنة"}
          </Button>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-white">
              {(user?.name || t("admin.admin_user") || "أ").charAt(0)}
            </div>
            <div className="text-start">
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("admin.welcome") || "مرحباً"}</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || t("admin.admin_user") || "مدير النظام"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setTab("projects")}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 text-white shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-orange-500"
        >
          <Plus className="h-4 w-4 me-2" />
          {t("admin.add_platform") || "إضافة منصة جديدة"}
        </Button>
        <Button
          onClick={() => setTab("media")}
          className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 text-white shadow-lg shadow-blue-500/25 hover:from-blue-400 hover:to-blue-500"
        >
          <Plus className="h-4 w-4 me-2" />
          {t("admin.add_media") || "إضافة وسائط"}
        </Button>
        <Button
          onClick={() => setTab("data-export")}
          variant="outline"
          className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-[#1a2235] dark:text-slate-200 dark:hover:bg-[#222c42] dark:hover:text-white"
        >
          <Download className="h-4 w-4 me-2" />
          {t("admin.export_data") || "تصدير البيانات"}
        </Button>
        <Button
          onClick={fetchData}
          variant="outline"
          className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-[#1a2235] dark:text-slate-200 dark:hover:bg-[#222c42] dark:hover:text-white"
        >
          <RefreshCw className={cn("h-4 w-4 me-2", syncing && "animate-spin")} />
          {t("admin.sync_data") || "مزامنة البيانات"}
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-white/5" />
            ))
          : statCards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={cn(
                    "admin-pro-stat-card relative overflow-hidden rounded-2xl p-5 text-white shadow-xl",
                    STAT_GRADIENTS[i]
                  )}
                >
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/85">{card.label}</p>
                      <p className="mt-2 text-3xl font-bold tracking-tight">{card.value}</p>
                      <p className="mt-1 text-xs text-white/70">{card.sub}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Categories */}
        <section className="admin-pro-panel rounded-2xl p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
            {t("admin.latest_categories") || "أحدث التصنيفات"}
          </h2>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-white/5" />
              ))
            ) : categories.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">{t("admin.no_data") || "لا توجد بيانات"}</p>
            ) : (
              categories.slice(0, 6).map((cat, i) => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => setTab("projects")}
                  className="admin-pro-list-item flex w-full items-center justify-between gap-3 rounded-xl p-4 text-start transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300">
                      <Globe2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {localizeAdminCategory(cat.category)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {cat.count} {t("admin.platform_count") || "منصة"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-sm font-semibold">{(4.2 + i * 0.15).toFixed(1)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Latest platforms */}
        <section className="admin-pro-panel rounded-2xl p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
            {t("admin.latest_platforms") || "أحدث المنصات"}
          </h2>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-white/5" />
              ))
            ) : topProjects.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">{t("admin.no_projects") || "لا توجد منصات"}</p>
            ) : (
              topProjects.slice(0, 6).map((project, i) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setTab("projects")}
                  className="admin-pro-list-item flex w-full items-center justify-between gap-3 rounded-xl p-4 text-start transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-300">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {localizeAdminPlatformName(project.slug, project.name)}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {localizeAdminCategory(project.category, project.slug)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-sm font-semibold">
                      {Math.min(5, 3.5 + (project.views % 15) / 10).toFixed(1)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="flex justify-center pt-2 lg:hidden">
        <Button
          variant="ghost"
          onClick={() => navigate({ page: "home" })}
          className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
        >
          {t("admin.back_to_site") || "العودة للموقع"}
        </Button>
      </div>
    </div>
  )
}
