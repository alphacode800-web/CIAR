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
  project: { icon: FolderOpen, color: "text-[oklch(0.78_0.14_82)]", bgColor: "bg-[oklch(0.78_0.14_82/12%)]" },
  translation: { icon: Languages, color: "text-violet-400", bgColor: "bg-violet-500/12%" },
  contact: { icon: Mail, color: "text-emerald-400", bgColor: "bg-emerald-500/12%" },
  setting: { icon: Cog, color: "text-amber-400", bgColor: "bg-amber-500/12%" },
  settings: { icon: Cog, color: "text-amber-400", bgColor: "bg-amber-500/12%" },
  user: { icon: FolderOpen, color: "text-sky-400", bgColor: "bg-sky-500/12%" },
  media: { icon: FolderOpen, color: "text-rose-400", bgColor: "bg-rose-500/12%" },
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
    gradient: "from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/8%)]",
    iconColor: "text-[oklch(0.78_0.14_82)]",
    badge: null,
  },
  {
    icon: Languages,
    label: "Translations",
    description: "Manage localization strings",
    tab: "translations",
    gradient: "from-violet-500/16% to-fuchsia-500/8%",
    iconColor: "text-violet-400",
    badge: null,
  },
  {
    icon: MessageSquare,
    label: "Contacts",
    description: "Review incoming messages",
    tab: "contacts",
    gradient: "from-emerald-500/16% to-teal-500/8%",
    iconColor: "text-emerald-400",
    badge: null,
  },
  {
    icon: Settings,
    label: "Settings",
    description: "Configure site preferences",
    tab: "settings",
    gradient: "from-amber-500/16% to-orange-500/8%",
    iconColor: "text-amber-400",
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/40%)] backdrop-blur-xl dark:bg-[oklch(0.12_0.03_265/50%)]",
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
    if (s >= 80) return { text: "Excellent", color: "text-emerald-400", dotColor: "bg-emerald-400" }
    if (s >= 60) return { text: "Good", color: "text-[oklch(0.78_0.14_82)]", dotColor: "bg-[oklch(0.78_0.14_82)]" }
    if (s >= 40) return { text: "Fair", color: "text-amber-400", dotColor: "bg-amber-400" }
    return { text: "Needs Attention", color: "text-red-400", dotColor: "bg-red-400" }
  }

  const status = getStatus(score)

  // Build conic gradient: filled portion + track
  const gradientStop = `${score / 100}%`
  const trackColor = "oklch(0.78_0.14_82/10%)"
  const fillColor = score >= 80
    ? "oklch(0.72_0.18_155)"    // emerald-ish
    : score >= 60
      ? "oklch(0.78_0.14_82)"    // gold
      : score >= 40
        ? "oklch(0.82_0.16_80)"  // amber
        : "oklch(0.65_0.2_25)"   // red-ish

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
          className="absolute rounded-full bg-[oklch(0.14_0.028_265/90%)] dark:bg-[oklch(0.12_0.03_265/95%)]"
          style={{
            width: innerSize,
            height: innerSize,
            top: strokeWidth,
            left: strokeWidth,
          }}
        />
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {displayScore}%
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
            Health
          </span>
        </div>
      </div>
      {/* Status label */}
      <div className="flex items-center gap-2">
        <div className={cn("h-2 w-2 rounded-full", status.dotColor)} />
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
      className="relative overflow-hidden rounded-2xl border border-[oklch(0.78_0.14_82/15%)] p-6 sm:p-8"
      style={{
        background: "linear-gradient(135deg, oklch(0.78_0.14_82/12%) 0%, oklch(0.72_0.13_75/6%) 40%, oklch(0.14_0.028_265/50%) 100%)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Decorative orbs */}
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[oklch(0.78_0.14_82/8%)] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-[oklch(0.72_0.13_75/6%)] blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Greeting */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.14_82)] to-[oklch(0.72_0.13_75)] flex items-center justify-center shadow-[0_0_16px_oklch(0.78_0.14_82/20%)]">
              <Sparkles className="h-4 w-4 text-[oklch(0.12_0.03_265)]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {greeting}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            {t("admin.dashboard_subtitle") || "Welcome back! Here's what's happening with your platforms."}
          </p>
          {analytics && (
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="text-[10px] border-[oklch(0.78_0.14_82/20%)] text-[oklch(0.78_0.14_82)] bg-[oklch(0.78_0.14_82/6%)]">
                <Zap className="h-3 w-3 mr-1" />
                {analytics.projects.total} {t("admin.total_projects") || "platforms"} active
              </Badge>
              <Badge variant="outline" className="text-[10px] border-emerald-500/20% text-emerald-400 bg-emerald-500/6%">
                <Activity className="h-3 w-3 mr-1" />
                {analytics.activeLocales} languages
              </Badge>
            </div>
          )}
        </div>

        {/* Right: Clock */}
        <div className="sm:text-end flex flex-col sm:items-end shrink-0">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {timeStr}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5 sm:justify-end">
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
    operational: { dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]", text: "text-emerald-400", label: "Operational" },
    warning: { dot: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]", text: "text-amber-400", label: "Attention" },
    error: { dot: "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]", text: "text-red-400", label: "Down" },
  }

  return (
    <GlassCard className="p-5" delay={0.7}>
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-4 w-4 text-[oklch(0.78_0.14_82)]" />
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
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[oklch(0.78_0.14_82/4%)] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[oklch(0.78_0.14_82/8%)] flex items-center justify-center shrink-0">
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
          color: "bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/8%)]",
          iconColor: "text-[oklch(0.78_0.14_82)]",
        },
        {
          icon: Eye,
          label: t("admin.total_views") || "Total Views",
          value: analytics.totalViews,
          color: "bg-gradient-to-br from-violet-500/16% to-fuchsia-500/8%",
          iconColor: "text-violet-400",
        },
        {
          icon: MessageSquare,
          label: t("admin.contact_messages") || "Contact Messages",
          value: analytics.contactMessages ?? analytics.contacts,
          color: "bg-gradient-to-br from-emerald-500/16% to-teal-500/8%",
          iconColor: "text-emerald-400",
        },
        {
          icon: Globe,
          label: t("admin.active_languages") || "Active Languages",
          value: analytics.activeLocales,
          color: "bg-gradient-to-br from-amber-500/16% to-orange-500/8%",
          iconColor: "text-amber-400",
        },
        {
          icon: FileEdit,
          label: t("admin.draft_projects") || "Draft Projects",
          value: analytics.projects.draft,
          color: "bg-gradient-to-br from-slate-500/16% to-slate-400/8%",
          iconColor: "text-slate-400",
        },
        {
          icon: Star,
          label: t("admin.featured_projects") || "Featured Projects",
          value: analytics.projects.featured,
          color: "bg-gradient-to-br from-[oklch(0.82_0.145_85/20%)] to-[oklch(0.75_0.14_80/8%)]",
          iconColor: "text-[oklch(0.82_0.145_85)]",
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
    <div className="space-y-6">
      {/* ── Welcome Banner ── */}
      <WelcomeBanner analytics={loading ? null : analytics} />

      {/* ── Performance + Stats Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Performance Score Card */}
        <GlassCard className="p-6 lg:col-span-4 flex flex-col items-center justify-center" delay={0.15}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-[oklch(0.78_0.14_82)]" />
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
                  <span className="text-muted-foreground">Published</span>
                  <span className="text-foreground font-medium">
                    {analytics?.projects.published}/{analytics?.projects.total}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Translations</span>
                  <span className="text-foreground font-medium">
                    {analytics?.translationCoverage || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Messages</span>
                  <span className="text-foreground font-medium">
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
                <Skeleton key={i} className="h-[120px] rounded-2xl" />
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
          <Zap className="h-3.5 w-3.5 text-[oklch(0.78_0.14_82)]" />
          {t("admin.quick_actions") || "Quick Actions"}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActionsWithBadges.map((action, index) => (
            <motion.button
              key={action.tab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.06 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "group relative flex flex-col items-start gap-2.5 rounded-2xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/40%)] backdrop-blur-lg p-5 text-start transition-all duration-300 hover:border-[oklch(0.78_0.14_82/25%)] hover:shadow-[0_0_24px_oklch(0.78_0.14_82/6%)] dark:bg-[oklch(0.12_0.03_265/50%)]"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                    action.gradient
                  )}
                >
                  <action.icon className={cn("h-5 w-5", action.iconColor)} />
                </div>
                {action.badge && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-[oklch(0.78_0.14_82/15%)] text-[oklch(0.78_0.14_82)] bg-[oklch(0.78_0.14_82/6%)]">
                    {action.badge}
                  </Badge>
                )}
                <ArrowRight className="absolute top-3 right-3 h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground block">
                  {action.label}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5 block leading-relaxed">
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
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[oklch(0.78_0.14_82/4%)] transition-colors"
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
            <button className="flex items-center gap-1 text-[11px] text-[oklch(0.78_0.14_82)] hover:underline font-medium">
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
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[oklch(0.78_0.14_82/4%)] transition-colors"
                >
                  {/* Rank */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0",
                      index === 0
                        ? "bg-[oklch(0.78_0.14_82/20%)] text-[oklch(0.78_0.14_82)]"
                        : index === 1
                          ? "bg-[oklch(0.72_0.13_75/15%)] text-[oklch(0.72_0.13_75)]"
                          : index === 2
                            ? "bg-[oklch(0.82_0.145_85/12%)] text-[oklch(0.82_0.145_85)]"
                            : "bg-muted text-muted-foreground"
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
                        <Star className="h-2.5 w-2.5 text-[oklch(0.78_0.14_82)] fill-[oklch(0.78_0.14_82)] shrink-0" />
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
                      <div className="flex-1 h-8 rounded-lg overflow-hidden bg-[oklch(0.78_0.14_82/6%)] dark:bg-[oklch(0.78_0.14_82/8%)]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct, 4)}%` }}
                          transition={{
                            duration: 0.6,
                            delay: 0.75 + index * 0.08,
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
        </GlassCard>
      </div>
    </div>
  )
}
