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
  TrendingUp,
  Clock,
  ArrowRight,
  Star,
  Mail,
  Cog,
  FileEdit,
  ShieldCheck,
  Database,
  HardDrive,
  Calendar,
  Sparkles,
  Activity,
  Zap,
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

function isAnalyticsData(value: unknown): value is AnalyticsData {
  if (!value || typeof value !== "object") return false
  const v = value as Partial<AnalyticsData>
  return !!v.projects && typeof v.projects.total === "number"
}

/* ─── Activity Type Config ──────────────────────────────────────────────── */

const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  project: { icon: FolderOpen, color: "text-[#c2410c]", bgColor: "bg-orange-100" },
  translation: { icon: Languages, color: "text-violet-700", bgColor: "bg-violet-100" },
  contact: { icon: Mail, color: "text-emerald-800", bgColor: "bg-emerald-100" },
  setting: { icon: Cog, color: "text-amber-800", bgColor: "bg-amber-100" },
  settings: { icon: Cog, color: "text-amber-800", bgColor: "bg-amber-100" },
  user: { icon: FolderOpen, color: "text-sky-800", bgColor: "bg-sky-100" },
  media: { icon: FolderOpen, color: "text-rose-800", bgColor: "bg-rose-100" },
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
    description: "Create a new platform listing",
    tab: "projects",
    gradient: "from-orange-100 to-orange-50",
    iconColor: "text-[#c2410c]",
    badge: null,
  },
  {
    icon: Languages,
    label: "Translations",
    description: "Manage localization strings",
    tab: "translations",
    gradient: "from-violet-100 to-violet-50",
    iconColor: "text-violet-800",
    badge: null,
  },
  {
    icon: MessageSquare,
    label: "Contacts",
    description: "Review incoming messages",
    tab: "contacts",
    gradient: "from-emerald-100 to-emerald-50",
    iconColor: "text-emerald-800",
    badge: null,
  },
  {
    icon: Settings,
    label: "Settings",
    description: "Configure site preferences",
    tab: "settings",
    gradient: "from-amber-100 to-amber-50",
    iconColor: "text-amber-900",
    badge: null,
  },
]

/* ─── Glass Card Utility ────────────────────────────────────────────────── */

function GlassCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "admin-3d-panel glass-strong rounded-2xl border border-primary/20 transition-shadow duration-300 hover:border-primary/40",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

/* ─── Performance Ring ──────────────────────────────────────────────────── */

function PerformanceRing({ score, animated }: { score: number; animated: boolean }) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (!animated) return
    const duration = 1500
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setDisplayScore(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score, animated])

  const getStatus = (s: number) => {
    if (s >= 80) return { text: "Excellent", color: "text-emerald-800", dotColor: "bg-emerald-600" }
    if (s >= 60) return { text: "Good", color: "text-[#9a3412]", dotColor: "bg-[#ea580c]" }
    if (s >= 40) return { text: "Fair", color: "text-amber-800", dotColor: "bg-amber-500" }
    return { text: "Needs Attention", color: "text-red-700", dotColor: "bg-red-600" }
  }

  const status = getStatus(score)

  // Build conic gradient: filled portion + track
  const gradientStop = `${score / 100}%`
  const trackColor = "#e7e5e4"
  const fillColor = score >= 80
    ? "#059669"
    : score >= 60
      ? "#ea580c"
      : score >= 40
        ? "#d97706"
        : "#dc2626"

  const ringSize = 160
  const strokeWidth = 14
  const innerSize = ringSize - strokeWidth * 2

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative rounded-full"
        style={{ width: ringSize, height: ringSize }}
      >
        {/* Conic gradient ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${fillColor} ${gradientStop}, ${trackColor} ${gradientStop})`,
          }}
        />
        {/* Inner hole */}
        <div
          className="absolute rounded-full border border-stone-200/90 bg-[#fafaf9] shadow-[inset_0_2px_6px_rgba(0,0,0,0.04)]"
          style={{
            width: innerSize,
            height: innerSize,
            top: strokeWidth,
            left: strokeWidth,
          }}
        />
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="gradient-text text-3xl font-bold tracking-tight">
            {displayScore}%
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-stone-500">
            Health
          </span>
        </div>
      </div>
      {/* Status label */}
      <div className="flex items-center gap-2">
        <div className={cn("h-2 w-2 shrink-0 rounded-full ring-2 ring-white", status.dotColor)} />
        <span className={cn("text-sm font-medium", status.color)}>{status.text}</span>
      </div>
    </div>
  )
}

/* ─── Welcome Banner ────────────────────────────────────────────────────── */

function WelcomeBanner({ analytics }: { analytics: AnalyticsData | null }) {
  const { t } = useI18n()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hour = now.getHours()
  let greeting: string
  if (hour < 12) greeting = t("admin.good_morning") || "Good Morning"
  else if (hour < 17) greeting = t("admin.good_afternoon") || "Good Afternoon"
  else greeting = t("admin.good_evening") || "Good Evening"

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const timeStr = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong noise-overlay relative overflow-hidden rounded-3xl border border-primary/18 p-6 sm:p-8"
    >
      {/* Decorative wash — site hero tone */}
      <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Greeting */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="glow-gold flex h-9 w-9 items-center justify-center rounded-xl border border-primary/35 bg-gradient-to-b from-primary to-[oklch(0.62_0.14_72)] shadow-md ring-1 ring-white/50">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <h2 className="gradient-text-warm text-xl font-bold tracking-tight sm:text-2xl">
              {greeting}
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            {t("admin.dashboard_subtitle") || "Welcome back! Here's what's happening with your platforms."}
          </p>
          {analytics && (
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="border-orange-200 bg-orange-50 text-[10px] text-[#9a3412]">
                <Zap className="me-1 h-3 w-3 shrink-0" />
                {analytics.projects.total} {t("admin.overview_active_platforms") || "active digital platforms"}
              </Badge>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-800">
                <Activity className="h-3 w-3 me-1 shrink-0" />
                {analytics.activeLocales} {t("admin.overview_languages") || "languages"}
              </Badge>
            </div>
          )}
        </div>

        {/* Right: Clock */}
        <div className="flex shrink-0 flex-col sm:items-end sm:text-end">
          <div className="gradient-text text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
            {timeStr}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground sm:justify-end">
            <Calendar className="h-3.5 w-3.5" />
            {dateStr}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── System Status ─────────────────────────────────────────────────────── */

function SystemStatusSection({
  analytics,
  activities,
}: {
  analytics: AnalyticsData | null
  activities: ActivityEntry[]
}) {
  const { t } = useI18n()
  const latestActivityTime = activities[0]?.timestamp
    ? timeAgo(activities[0].timestamp)
    : "No activity"

  const systems = [
    {
      name: t("admin.total_projects") || "Total Projects",
      status: "operational" as const,
      icon: HardDrive,
      detail: `${analytics?.projects.total ?? 0} records`,
    },
    {
      name: t("admin.contact_messages") || "Contact Messages",
      status: "operational" as const,
      icon: Database,
      detail: `${analytics?.contactMessages ?? analytics?.contacts ?? 0} messages`,
    },
    {
      name: t("admin.recent_activity") || "Recent Activity",
      status: activities.length > 0 ? ("operational" as const) : ("warning" as const),
      icon: ShieldCheck,
      detail: latestActivityTime,
    },
  ]

  const statusConfig = {
    operational: { dot: "bg-emerald-600", text: "text-emerald-800", label: "Operational" },
    warning: { dot: "bg-amber-500", text: "text-amber-900", label: "Attention" },
    error: { dot: "bg-red-600", text: "text-red-800", label: "Down" },
  }

  return (
    <GlassCard className="p-5" delay={0.7}>
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-4 w-4 text-[#ea580c]" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t("admin.system_status") || "System Status"}
        </h3>
      </div>
      <div className="space-y-3">
        {systems.map((system, index) => {
          const cfg = statusConfig[system.status]
          const Icon = system.icon
          return (
            <motion.div
              key={system.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75 + index * 0.06 }}
              className="flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-stone-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-50 ring-1 ring-orange-100">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{system.name}</p>
                <p className="text-[11px] text-muted-foreground">{system.detail}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn("text-[11px] font-medium", cfg.text)}>{cfg.label}</span>
                <div className={cn("h-2 w-2 rounded-full", cfg.dot)} />
              </div>
            </motion.div>
          )
        })}
      </div>
    </GlassCard>
  )
}

/* ─── Main Component ────────────────────────────────────────────────────── */

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

      // Netlify may return { error: ... } on failed API calls.
      // Guard the shape to avoid runtime crashes in the admin overview.
      setAnalytics(isAnalyticsData(analyticsData) ? analyticsData : null)
      setActivities(Array.isArray(activityData?.activities) ? activityData.activities : [])
    } catch {
      // silent fail
      setAnalytics(null)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* ── Calculate Health Score ── */
  const healthScore = analytics
    ? (() => {
        const publishedRatio = analytics.projects.total > 0
          ? analytics.projects.published / analytics.projects.total
          : 0
        const translationPct = Math.min((analytics.translationCoverage || 0), 100) / 100
        const messagesScore = Math.min((analytics.contactMessages ?? 0) / 10, 1)
        return Math.round((publishedRatio * 0.4 + translationPct * 0.3 + messagesScore * 0.3) * 100)
      })()
    : 0

  /* ── Stats Config (6 items) ── */
  const statsConfig = analytics
    ? [
        {
          icon: FolderOpen,
          label: t("admin.total_projects") || "Total Projects",
          value: analytics.projects.total,
          color: "bg-[#1f2937]",
          iconColor: "text-white",
        },
        {
          icon: Eye,
          label: t("admin.total_views") || "Total Views",
          value: analytics.totalViews,
          color: "bg-[#00b8b8]",
          iconColor: "text-white",
        },
        {
          icon: MessageSquare,
          label: t("admin.contact_messages") || "Contact Messages",
          value: analytics.contactMessages ?? analytics.contacts,
          color: "bg-[#f43f5e]",
          iconColor: "text-white",
        },
        {
          icon: Globe,
          label: t("admin.active_languages") || "Active Languages",
          value: analytics.activeLocales,
          color: "bg-[#6366f1]",
          iconColor: "text-white",
        },
        {
          icon: FileEdit,
          label: t("admin.draft_projects") || "Draft Projects",
          value: analytics.projects.draft,
          color: "bg-[#0ea5e9]",
          iconColor: "text-white",
        },
        {
          icon: Star,
          label: t("admin.featured_projects") || "Featured Projects",
          value: analytics.projects.featured,
          color: "bg-[#a855f7]",
          iconColor: "text-white",
        },
      ]
    : []

  /* ── Quick Actions with dynamic badges ── */
  const quickActionsWithBadges = QUICK_ACTIONS.map((action) => {
    let badge: string | null = null
    if (action.tab === "projects" && analytics) {
      badge = `${analytics.projects.draft} drafts`
    } else if (action.tab === "contacts" && analytics) {
      badge = `${analytics.contactMessages ?? analytics.contacts} messages`
    } else if (action.tab === "translations" && analytics) {
      badge = `${analytics.translationCoverage || 0}% coverage`
    }
    return { ...action, badge }
  })

  return (
    <div className="admin-overview-vivid space-y-6">
      {/* ── Welcome Banner ── */}
      <WelcomeBanner analytics={loading ? null : analytics} />

      {/* ── Performance + Stats Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Performance Score Card */}
        <GlassCard className="p-6 lg:col-span-4 flex flex-col items-center justify-center" delay={0.15}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-primary" />
            {t("admin.platform_health") || "Platform Health"}
          </h3>
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-[160px] w-[160px] rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ) : (
            <>
              <PerformanceRing score={healthScore} animated={!loading} />
              <div className="mt-2 w-full space-y-1.5 px-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-600">Published</span>
                  <span className="font-medium text-stone-900">
                    {analytics?.projects.published}/{analytics?.projects.total}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-600">Translations</span>
                  <span className="font-medium text-stone-900">
                    {analytics?.translationCoverage || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-600">Messages</span>
                  <span className="font-medium text-stone-900">
                    {analytics?.contactMessages ?? 0}
                  </span>
                </div>
              </div>
            </>
          )}
        </GlassCard>

        {/* Stats Cards (6 columns on xl) */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[120px] rounded-lg" />
              ))}
            </div>
          ) : (
            <QuickStats stats={statsConfig} columns={6} />
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-primary" />
          {t("admin.quick_actions") || "Quick Actions"}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActionsWithBadges.map((action, index) => (
            <motion.button
              key={action.tab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.06 }}
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                "admin-3d-panel glass-strong group relative flex flex-col items-start gap-2.5 rounded-2xl border border-primary/18 p-5 text-start transition-all duration-300 hover:border-primary/40"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br transition-transform duration-300 group-hover:scale-105",
                    action.gradient
                  )}
                >
                  <action.icon className={cn("h-5 w-5", action.iconColor)} />
                </div>
                {action.badge && (
                  <Badge variant="outline" className="h-5 border-orange-200 bg-orange-50 px-1.5 py-0 text-[10px] text-[#9a3412]">
                    {action.badge}
                  </Badge>
                )}
                <ArrowRight className="absolute end-3 top-3 h-3.5 w-3.5 text-stone-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground block">
                  {action.label}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-stone-600">
                  {action.description}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ── Two-Column: Activity + Top Projects + System Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Recent Activity (compact) ── */}
        <GlassCard className="p-5 lg:col-span-1" delay={0.45}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("admin.recent_activity") || "Recent Activity"}
            </h3>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-11 rounded-xl" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-none pr-1">
              {activities.slice(0, 8).map((activity, index) => {
                const typeConfig = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.project
                const badgeConfig = ACTION_BADGES[activity.action] || { label: activity.action, variant: "outline" as const }
                const Icon = typeConfig.icon
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.04 }}
                    className="flex items-center gap-2.5 rounded-md p-2.5 transition-colors hover:bg-stone-50"
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                        typeConfig.bgColor
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5", typeConfig.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-snug truncate">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant={badgeConfig.variant} className="text-[9px] px-1 py-0 h-3.5">
                          {badgeConfig.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {timeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </GlassCard>

        {/* ── Top Projects ── */}
        <GlassCard className="p-5 lg:col-span-1" delay={0.5}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("admin.top_projects") || "Top Projects"}
            </h3>
            <button type="button" className="flex items-center gap-1 text-[11px] font-medium text-[#c2410c] hover:underline">
              {t("admin.view_all") || "View All"}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-11 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {(analytics?.topProjects || []).slice(0, 6).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + index * 0.05 }}
                  className="flex items-center gap-2.5 rounded-md p-2.5 transition-colors hover:bg-stone-50"
                >
                  {/* Rank */}
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold",
                      index === 0
                        ? "bg-orange-100 text-[#c2410c]"
                        : index === 1
                          ? "bg-orange-50 text-[#9a3412]"
                          : index === 2
                            ? "bg-amber-100 text-amber-900"
                            : "bg-stone-100 text-stone-600"
                    )}
                  >
                    {index + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium text-foreground truncate">
                        {project.name}
                      </p>
                      {project.featured && (
                        <Star className="h-2.5 w-2.5 shrink-0 fill-[#ea580c] text-[#ea580c]" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {project.category || "Uncategorized"}
                    </p>
                  </div>

                  {/* Views */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-semibold text-foreground">
                      {project.views.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* ── Right Column: System Status ── */}
        <SystemStatusSection analytics={analytics} activities={activities} />
      </div>

      {/* ── Two-Column: Category Breakdown + Monthly Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Projects by Category ── */}
        <GlassCard className="p-5" delay={0.6}>
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
        </GlassCard>

        {/* ── Monthly Trend ── */}
        <GlassCard className="p-5" delay={0.65}>
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
                      transition={{ delay: 0.7 + index * 0.07 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-16 shrink-0 text-xs text-muted-foreground">
                        {item.month}
                      </div>
                      <div className="h-8 flex-1 overflow-hidden rounded-md bg-stone-100 ring-1 ring-stone-200/80">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct, 4)}%` }}
                          transition={{
                            duration: 0.6,
                            delay: 0.75 + index * 0.08,
                            ease: "easeOut",
                          }}
                          className="relative h-full overflow-hidden rounded-md bg-gradient-to-r from-[#fb923c] to-[#ea580c]"
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
        </GlassCard>
      </div>
    </div>
  )
}
