"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FolderOpen,
  Languages,
  Mail,
  Cog,
  Filter,
  Loader2,
  Clock,
  ChevronDown,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface ActivityEntry {
  id: string
  type: string
  action: string
  description: string
  meta?: Record<string, string | number>
  timestamp: string
}

type FilterType = "all" | "project" | "translation" | "contact" | "settings"

/* ─── Config ────────────────────────────────────────────────────────────── */

const FILTER_OPTIONS: Array<{ value: FilterType; label: string; icon: React.ElementType }> = [
  { value: "all", label: "All Activity", icon: Clock },
  { value: "project", label: "Projects", icon: FolderOpen },
  { value: "translation", label: "Translations", icon: Languages },
  { value: "contact", label: "Contacts", icon: Mail },
  { value: "settings", label: "Settings", icon: Cog },
]

const ACTIVITY_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string; borderColor: string }
> = {
  project: {
    icon: FolderOpen,
    color: "text-blue-400",
    bgColor: "bg-blue-500/15",
    borderColor: "border-blue-500/30",
  },
  translation: {
    icon: Languages,
    color: "text-violet-400",
    bgColor: "bg-violet-500/15",
    borderColor: "border-violet-500/30",
  },
  contact: {
    icon: Mail,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15",
    borderColor: "border-emerald-500/30",
  },
  setting: {
    icon: Cog,
    color: "text-amber-400",
    bgColor: "bg-amber-500/15",
    borderColor: "border-amber-500/30",
  },
  settings: {
    icon: Cog,
    color: "text-amber-400",
    bgColor: "bg-amber-500/15",
    borderColor: "border-amber-500/30",
  },
  user: {
    icon: FolderOpen,
    color: "text-sky-400",
    bgColor: "bg-sky-500/15",
    borderColor: "border-sky-500/30",
  },
  media: {
    icon: FolderOpen,
    color: "text-rose-400",
    bgColor: "bg-rose-500/15",
    borderColor: "border-rose-500/30",
  },
}

const ACTION_STYLES: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
  project_published: { variant: "default", label: "Published" },
  project_created: { variant: "secondary", label: "Created" },
  project_updated: { variant: "outline", label: "Updated" },
  project_featured: { variant: "default", label: "Featured" },
  contact_received: { variant: "secondary", label: "Message" },
  translation_updated: { variant: "outline", label: "i18n" },
  settings_updated: { variant: "outline", label: "Config" },
  user_registered: { variant: "secondary", label: "User" },
  media_uploaded: { variant: "outline", label: "Media" },
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
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

/* ─── Component ─────────────────────────────────────────────────────────── */

export function ActivityTab() {
  const { t } = useI18n()
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [filter, setFilter] = useState<FilterType>("all")
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchActivities = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      try {
        const res = await fetch(
          `/api/admin/activity-log?filter=${filter}&page=${pageNum}&limit=10`
        )
        const data = await res.json()

        if (append) {
          setActivities((prev) => [...prev, ...data.activities])
        } else {
          setActivities(data.activities || [])
        }
        setHasMore(data.pagination?.hasMore || false)
      } catch {
        // silent
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [filter]
  )

  // Initial fetch
  useEffect(() => {
    setPage(1)
    fetchActivities(1)
  }, [fetchActivities])

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)
    setPage(1)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchActivities(nextPage, true)
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold gradient-text">
          {t("admin.activity_log") || "Activity Log"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.activity_log_subtitle") || "Track all changes and events across your platform."}
        </p>
      </motion.div>

      <div className="glow-line-gold" />

      {/* ── Filter Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-wrap gap-2"
      >
        <Filter className="h-4 w-4 text-muted-foreground self-center mr-1" />
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleFilterChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200",
              filter === opt.value
                ? "bg-[oklch(0.78_0.14_82/15%)] text-[oklch(0.78_0.14_82)] border border-[oklch(0.78_0.14_82/30%)] shadow-[0_0_12px_oklch(0.78_0.14_82/8%)]"
                : "text-muted-foreground border border-transparent hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <opt.icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        ))}
      </motion.div>

      {/* ── Activity Timeline ── */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-muted-foreground"
        >
          <Clock className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {t("admin.no_activity") || "No activity found"}
          </p>
          <p className="text-xs mt-1 opacity-60">
            {t("admin.no_activity_desc") || "Activity will appear here as changes are made."}
          </p>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute start-5 top-0 bottom-0 w-px bg-gradient-to-b from-[oklch(0.78_0.14_82/20%)] via-[oklch(0.78_0.14_82/10%)] to-transparent" />

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {activities.map((activity, index) => {
                const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG.project
                const actionStyle = ACTION_STYLES[activity.action] || {
                  variant: "outline" as const,
                  label: activity.action,
                }
                const Icon = config.icon

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ delay: index * 0.04, duration: 0.35 }}
                    className="relative flex gap-4 ps-2"
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 mt-3 shrink-0">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center border-2",
                          config.bgColor,
                          config.borderColor
                        )}
                      >
                        <Icon className={cn("h-3.5 w-3.5", config.color)} />
                      </div>
                    </div>

                    {/* Card */}
                    <div
                      className={cn(
                        "flex-1 rounded-xl border border-[oklch(0.78_0.14_82/8%)] bg-[oklch(0.14_0.028_265/30%)] backdrop-blur-lg p-4 transition-all duration-200 hover:border-[oklch(0.78_0.14_82/18%)] hover:bg-[oklch(0.14_0.028_265/45%)]",
                        "dark:bg-[oklch(0.12_0.03_265/40%)]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-relaxed">
                            {activity.description}
                          </p>
                          {activity.meta && Object.keys(activity.meta).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {Object.entries(activity.meta)
                                .slice(0, 3)
                                .map(([key, val]) => (
                                  <span
                                    key={key}
                                    className="inline-flex text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md"
                                  >
                                    {key}: {String(val)}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={actionStyle.variant}
                          className="text-[10px] px-1.5 py-0 h-5 shrink-0"
                        >
                          {actionStyle.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mt-2.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span title={formatTimestamp(activity.timestamp)}>
                          {timeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Load More ── */}
      {!loading && hasMore && activities.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center pt-4"
        >
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="gap-2 border-[oklch(0.78_0.14_82/20%)] hover:bg-[oklch(0.78_0.14_82/8%)] hover:border-[oklch(0.78_0.14_82/35%)]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("admin.loading") || "Loading..."}</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>{t("admin.load_more") || "Load More"}</span>
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  )
}
