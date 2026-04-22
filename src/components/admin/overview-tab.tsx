"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  FolderOpen,
  Eye,
  MessageSquare,
  Globe,
  Plus,
  Languages,
  Settings,
  BarChart3,
  TrendingUp,
  Clock,
  ArrowRight,
  Star,
  FileEdit,
  Mail,
  Cog,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { QuickStats } from "./quick-stats"
import { ChartBar } from "./chart-bar"

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

interface ActivityEntry {
  id: string
  type: string
  action: string
  description: string
  meta?: Record<string, string | number>
  timestamp: string
}

/* ─── Activity Type Config ──────────────────────────────────────────────── */

const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  project: { icon: FolderOpen, color: "text-blue-400", bgColor: "bg-blue-500/15" },
  translation: { icon: Languages, color: "text-violet-400", bgColor: "bg-violet-500/15" },
  contact: { icon: Mail, color: "text-emerald-400", bgColor: "bg-emerald-500/15" },
  setting: { icon: Cog, color: "text-amber-400", bgColor: "bg-amber-500/15" },
  settings: { icon: Cog, color: "text-amber-400", bgColor: "bg-amber-500/15" },
  user: { icon: FolderOpen, color: "text-sky-400", bgColor: "bg-sky-500/15" },
  media: { icon: FolderOpen, color: "text-rose-400", bgColor: "bg-rose-500/15" },
}

const ACTION_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  project_published: { label: "Published", variant: "default" },
  project_created: { label: "Created", variant: "secondary" },
  project_updated: { label: "Updated", variant: "outline" },
  project_featured: { label: "Featured", variant: "default" },
  contact_received: { label: "Contact", variant: "secondary" },
  translation_updated: { label: "Translation", variant: "outline" },
  settings_updated: { label: "Settings", variant: "outline" },
  user_registered: { label: "User", variant: "secondary" },
  media_uploaded: { label: "Media", variant: "outline" },
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

/* ─── Quick Actions Config ──────────────────────────────────────────────── */

const QUICK_ACTIONS = [
  {
    icon: Plus,
    label: "Add Project",
    tab: "projects",
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-400",
  },
  {
    icon: Languages,
    label: "Manage Translations",
    tab: "translations",
    gradient: "from-violet-500/20 to-fuchsia-500/10",
    iconColor: "text-violet-400",
  },
  {
    icon: MessageSquare,
    label: "View Contacts",
    tab: "contacts",
    gradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-400",
  },
  {
    icon: Settings,
    label: "Site Settings",
    tab: "settings",
    gradient: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
  },
]

/* ─── Component ─────────────────────────────────────────────────────────── */

export function OverviewTab() {
  const { t } = useI18n()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [analyticsRes, activityRes] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/admin/activity-log?limit=10"),
      ])
      const analyticsData = await analyticsRes.json()
      const activityData = await activityRes.json()
      setAnalytics(analyticsData)
      setActivities(activityData.activities || [])
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const statsConfig = analytics
    ? [
        {
          icon: FolderOpen,
          label: t("admin.total_projects") || "Total Projects",
          value: analytics.projects.total,
          color: "bg-gradient-to-br from-blue-500/20 to-cyan-500/10",
          iconColor: "text-blue-400",
          trend: { value: 12, positive: true },
        },
        {
          icon: Eye,
          label: t("admin.total_views") || "Total Views",
          value: analytics.totalViews,
          color: "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10",
          iconColor: "text-violet-400",
          trend: { value: 8, positive: true },
        },
        {
          icon: MessageSquare,
          label: t("admin.contact_messages") || "Contact Messages",
          value: analytics.contactMessages ?? analytics.contacts,
          color: "bg-gradient-to-br from-emerald-500/20 to-teal-500/10",
          iconColor: "text-emerald-400",
          trend: { value: 24, positive: true },
        },
        {
          icon: Globe,
          label: t("admin.active_languages") || "Active Languages",
          value: analytics.activeLocales ?? 5,
          suffix: "/ 5",
          color: "bg-gradient-to-br from-amber-500/20 to-orange-500/10",
          iconColor: "text-amber-400",
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
        <h2 className="text-2xl font-bold gradient-text">
          {t("admin.dashboard") || "Dashboard Overview"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.dashboard_subtitle") || "Welcome back! Here is what is happening with your platforms."}
        </p>
      </motion.div>

      {/* ── Glow Divider ── */}
      <div className="glow-line-gold" />

      {/* ── Stats Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <QuickStats stats={statsConfig} columns={4} />
      )}

      {/* ── Quick Actions ── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          {t("admin.quick_actions") || "Quick Actions"}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, index) => (
            <motion.button
              key={action.tab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + index * 0.06 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "group relative flex flex-col items-center gap-3 rounded-2xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/40%)] backdrop-blur-lg p-5 text-center transition-all duration-300 hover:border-[oklch(0.78_0.14_82/25%)] hover:shadow-[0_0_24px_oklch(0.78_0.14_82/6%)]",
                "dark:bg-[oklch(0.12_0.03_265/50%)]"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                  action.gradient
                )}
              >
                <action.icon className={cn("h-5 w-5", action.iconColor)} />
              </div>
              <span className="text-sm font-medium text-foreground">
                {action.label}
              </span>
              <ArrowRight className="absolute top-3 right-3 h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ── Two-Column: Activity + Top Projects ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Recent Activity ── */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-2xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/40%)] backdrop-blur-lg p-5 dark:bg-[oklch(0.12_0.03_265/50%)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("admin.recent_activity") || "Recent Activity"}
            </h3>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto scrollbar-none pr-1">
              {activities.map((activity, index) => {
                const typeConfig = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.project
                const badgeConfig = ACTION_BADGES[activity.action] || { label: activity.action, variant: "outline" as const }
                const Icon = typeConfig.icon
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + index * 0.04 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-[oklch(0.78_0.14_82/4%)] transition-colors"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                        typeConfig.bgColor
                      )}
                    >
                      <Icon className={cn("h-4 w-4", typeConfig.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={badgeConfig.variant} className="text-[10px] px-1.5 py-0 h-4">
                          {badgeConfig.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.section>

        {/* ── Top Projects Table ── */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="rounded-2xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/40%)] backdrop-blur-lg p-5 dark:bg-[oklch(0.12_0.03_265/50%)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("admin.top_projects") || "Top Projects"}
            </h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {(analytics?.topProjects || []).slice(0, 5).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[oklch(0.78_0.14_82/4%)] transition-colors"
                >
                  {/* Rank */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                      index === 0
                        ? "bg-[oklch(0.78_0.14_82/20%)] text-[oklch(0.78_0.14_82)]"
                        : index === 1
                          ? "bg-[oklch(0.72_0.13_75/15%)] text-[oklch(0.72_0.13_75)]"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {project.name}
                      </p>
                      {project.featured && (
                        <Star className="h-3 w-3 text-[oklch(0.78_0.14_82)] fill-[oklch(0.78_0.14_82)] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {project.category || "Uncategorized"}
                    </p>
                  </div>

                  {/* Views */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">
                      {project.views.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>

      {/* ── Two-Column: Category Breakdown + Monthly Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Projects by Category ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="rounded-2xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/40%)] backdrop-blur-lg p-5 dark:bg-[oklch(0.12_0.03_265/50%)]"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">
            {t("admin.projects_by_category") || "Projects by Category"}
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-7 rounded-full" />
              ))}
            </div>
          ) : (
            <ChartBar
              data={(analytics?.projectsByCategory || []).map((c) => ({
                label: c.category,
                value: c.count,
              }))}
              barHeight={24}
            />
          )}
        </motion.section>

        {/* ── Monthly Trend ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="rounded-2xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/40%)] backdrop-blur-lg p-5 dark:bg-[oklch(0.12_0.03_265/50%)]"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">
            {t("admin.monthly_trend") || "Monthly Project Creation"}
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(analytics?.monthlyTrend || []).length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No data available for the last 6 months
                </div>
              ) : (
                (analytics?.monthlyTrend || []).map((item, index) => {
                  const maxCount = Math.max(
                    ...(analytics?.monthlyTrend || []).map((m) => m.count),
                    1
                  )
                  const pct = (item.count / maxCount) * 100
                  return (
                    <motion.div
                      key={item.month}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.65 + index * 0.07 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-16 shrink-0 text-xs text-muted-foreground">
                        {item.month}
                      </div>
                      <div className="flex-1 h-8 rounded-lg overflow-hidden bg-[oklch(0.78_0.14_82/6%)] dark:bg-[oklch(0.78_0.14_82/8%)]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct, 4)}%` }}
                          transition={{
                            duration: 0.6,
                            delay: 0.7 + index * 0.08,
                            ease: "easeOut",
                          }}
                          className="h-full rounded-lg bg-gradient-to-r from-[oklch(0.78_0.14_82)] to-[oklch(0.72_0.13_75)] relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
                        </motion.div>
                      </div>
                      <div className="w-8 shrink-0 text-xs font-semibold text-foreground text-right">
                        {item.count}
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}
