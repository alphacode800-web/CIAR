"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  FolderOpen,
  Eye,
  Star,
  FileEdit,
  MessageSquare,
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Layers,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { QuickStats } from "./quick-stats"
import { ChartBar, DonutChart } from "./chart-bar"

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface AnalyticsData {
  projects: { total: number; published: number; draft: number; featured: number }
  totalViews: number
  avgViews: number
  translations: number
  contacts: number
  contactMessages: number
  users: number
  activeLocales: number
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
  monthlyTrend: Array<{ month: string; count: number }>
}

const EMPTY_ANALYTICS: AnalyticsData = {
  projects: { total: 0, published: 0, draft: 0, featured: 0 },
  totalViews: 0,
  avgViews: 0,
  translations: 0,
  contacts: 0,
  contactMessages: 0,
  users: 0,
  activeLocales: 0,
  translationCoverage: 0,
  projectsByCategory: [],
  topProjects: [],
  monthlyTrend: [],
}

function normalizeAnalytics(input: unknown): AnalyticsData {
  const raw = (input as { data?: Partial<AnalyticsData> } | null)?.data ?? (input as Partial<AnalyticsData> | null) ?? {}
  const rawProjects = raw.projects ?? {}

  return {
    projects: {
      total: Number(rawProjects.total ?? 0),
      published: Number(rawProjects.published ?? 0),
      draft: Number(rawProjects.draft ?? 0),
      featured: Number(rawProjects.featured ?? 0),
    },
    totalViews: Number(raw.totalViews ?? 0),
    avgViews: Number(raw.avgViews ?? 0),
    translations: Number(raw.translations ?? 0),
    contacts: Number(raw.contacts ?? 0),
    contactMessages: Number(raw.contactMessages ?? raw.contacts ?? 0),
    users: Number(raw.users ?? 0),
    activeLocales: Number(raw.activeLocales ?? 0),
    translationCoverage: Number(raw.translationCoverage ?? 0),
    projectsByCategory: Array.isArray(raw.projectsByCategory) ? raw.projectsByCategory : [],
    topProjects: Array.isArray(raw.topProjects) ? raw.topProjects : [],
    monthlyTrend: Array.isArray(raw.monthlyTrend) ? raw.monthlyTrend : [],
  }
}

/* ─── Gold chart colors for category donut ──────────────────────────────── */

const CATEGORY_COLORS = [
  "oklch(0.78 0.14 82)",
  "oklch(0.62 0.08 265)",
  "oklch(0.72 0.12 55)",
  "oklch(0.85 0.10 85)",
  "oklch(0.50 0.06 265)",
  "oklch(0.68 0.12 145)",
  "oklch(0.75 0.10 30)",
  "oklch(0.58 0.08 330)",
]

/* ─── Component ─────────────────────────────────────────────────────────── */

export function AnalyticsTab() {
  const { t } = useI18n()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics")
      if (!res.ok) {
        throw new Error("Failed to load analytics")
      }
      const data = await res.json()
      setAnalytics(normalizeAnalytics(data))
    } catch {
      setAnalytics(EMPTY_ANALYTICS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  /* ── KPI Cards Config ── */
  const kpiStats = analytics
    ? [
        {
          icon: FolderOpen,
          label: t("admin.total_projects") || "إجمالي المنصات",
          value: analytics.projects.total,
          color: "bg-blue-500/10",
          iconColor: "text-blue-600 dark:text-blue-400",
        },
        {
          icon: Layers,
          label: t("admin.published") || "منشور",
          value: analytics.projects.published,
          color: "bg-emerald-500/10",
          iconColor: "text-emerald-600 dark:text-emerald-400",
        },
        {
          icon: FileEdit,
          label: t("admin.drafts") || "مسودات",
          value: analytics.projects.draft,
          color: "bg-amber-500/10",
          iconColor: "text-amber-600 dark:text-amber-400",
        },
        {
          icon: Star,
          label: t("admin.featured") || "مميز",
          value: analytics.projects.featured,
          color: "bg-orange-500/10",
          iconColor: "text-orange-600 dark:text-orange-400",
        },
        {
          icon: Eye,
          label: t("admin.total_views") || "إجمالي المشاهدات",
          value: analytics.totalViews,
          color: "bg-violet-500/10",
          iconColor: "text-violet-600 dark:text-violet-400",
        },
        {
          icon: BarChart3,
          label: t("admin.avg_views") || "متوسط المشاهدات",
          value: analytics.avgViews ?? 0,
          color: "bg-sky-500/10",
          iconColor: "text-sky-600 dark:text-sky-400",
        },
        {
          icon: MessageSquare,
          label: t("admin.contact_messages") || "رسائل التواصل",
          value: analytics.contactMessages ?? analytics.contacts,
          color: "bg-rose-500/10",
          iconColor: "text-rose-600 dark:text-rose-400",
        },
        {
          icon: Globe,
          label: t("admin.translation_coverage") || "تغطية الترجمة",
          value: analytics.translationCoverage ?? 0,
          suffix: "%",
          color: "bg-teal-500/10",
          iconColor: "text-teal-600 dark:text-teal-400",
        },
      ]
    : []

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-foreground">
          {t("admin.analytics") || "Analytics"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.analytics_subtitle") || "Detailed insights into your platform performance."}
        </p>
      </motion.div>

      <div className="glow-line-gold" />

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <QuickStats stats={kpiStats} columns={4} />
      )}

      {/* ── Views Distribution + Category Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Views per Project (Top 10) ── */}
        <motion.section
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="admin-pro-panel lg:col-span-2 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5">
            <Eye className="h-4 w-4 text-[oklch(0.76_0.19_48)]" />
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              {t("admin.views_distribution") || "Views Distribution"}
            </h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-7 rounded-full" />
              ))}
            </div>
          ) : (
            <ChartBar
              data={(analytics?.topProjects || []).slice(0, 10).map((p) => ({
                label: p.name,
                value: p.views,
              }))}
              barHeight={22}
            />
          )}
        </motion.section>

        {/* ── Category Donut ── */}
        <motion.section
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="admin-pro-panel rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5">
            <PieChart className="h-4 w-4 text-[oklch(0.76_0.19_48)]" />
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              {t("admin.category_breakdown") || "Categories"}
            </h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <Skeleton className="w-[180px] h-[180px] rounded-full" />
            </div>
          ) : (
            <DonutChart
              data={(analytics?.projectsByCategory || []).map((c, i) => ({
                label: c.category,
                value: c.count,
                color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
              }))}
              centerLabel={t("admin.total") || "الإجمالي"}
              centerValue={String(analytics?.projects.total || 0)}
            />
          )}
        </motion.section>
      </div>

      {/* ── Recent Growth ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          {t("admin.recent_growth") || "Growth Indicators"}
        </h3>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: t("admin.projects_growth") || "New Projects",
                value: analytics?.monthlyTrend?.reduce((s, m) => s + m.count, 0) || 0,
                period: t("admin.last_6_months") || "آخر 6 أشهر",
                positive: true,
              },
              {
                label: t("admin.engagement_rate") || "Engagement Rate",
                value: analytics?.projects.total
                  ? Math.round((analytics.totalViews / analytics.projects.total / 100) * 100)
                  : 0,
                suffix: "%",
                period: t("admin.all_time") || "كل الفترات",
                positive: true,
              },
              {
                label: t("admin.localization_score") || "Localization Score",
                value: analytics?.translationCoverage ?? 0,
                suffix: "%",
                period: `${analytics?.activeLocales ?? 0} ${t("admin.active_locales") || "لغات نشطة"}`,
                positive: (analytics?.translationCoverage ?? 0) >= 80,
              },
            ].map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.08 }}
                className="admin-pro-panel rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {card.label}
                  </span>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                      card.positive
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-amber-400 bg-amber-500/10"
                    )}
                  >
                    {card.positive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {card.positive ? (t("admin.healthy") || "جيد") : (t("admin.needs_work") || "يحتاج تحسين")}
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {card.value}
                  {card.suffix && (
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      {card.suffix}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{card.period}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  )
}
