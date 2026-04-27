"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  FolderOpen,
  Languages,
  Mail,
  Settings,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface NotificationPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Notification {
  id: string
  type: "success" | "warning" | "info" | "error"
  title: string
  description: string
  timestamp: string
  read: boolean
}

/* ─── Config ──────────────────────────────────────────────────────────────── */

const NOTIFICATION_STYLES: Record<
  Notification["type"],
  { icon: React.ElementType; color: string; bgColor: string; borderColor: string; dotColor: string }
> = {
  success: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    dotColor: "bg-emerald-400",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    dotColor: "bg-amber-400",
  },
  info: {
    icon: Info,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    dotColor: "bg-blue-400",
  },
  error: {
    icon: AlertCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    dotColor: "bg-red-400",
  },
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

/* ─── Component ───────────────────────────────────────────────────────────── */

export function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
  const { t } = useI18n()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/activity-log?limit=10")
      const data = await res.json()

      // Convert activity entries to notifications
      const mapped: Notification[] = (data.activities || []).map(
        (entry: {
          id: string
          type: string
          action: string
          description: string
          timestamp: string
        }, index: number) => {
          // Determine notification type based on action
          let notifType: Notification["type"] = "info"
          if (entry.action.includes("published") || entry.action.includes("created")) {
            notifType = "success"
          } else if (entry.action.includes("delete") || entry.type === "error") {
            notifType = "error"
          } else if (entry.action.includes("settings") || entry.action.includes("featured")) {
            notifType = "warning"
          }

          return {
            id: entry.id,
            type: notifType,
            title: entry.action.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            description: entry.description,
            timestamp: entry.timestamp,
            read: index > 2, // First 3 are unread
          }
        }
      )

      setNotifications(mapped)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open, fetchNotifications])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => onOpenChange(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute end-0 top-full mt-2 z-50 w-[380px] max-w-[calc(100vw-2rem)]",
              "rounded-2xl border border-[oklch(0.78_0.14_82/12%)]",
              "bg-[oklch(0.12_0.028_265/95%)] backdrop-blur-xl",
              "shadow-[0_16px_48px_-8px_rgba(0,0,0,0.5)] shadow-[0_0_0_1px_oklch(0.78_0.14_82/5%)]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[oklch(0.78_0.14_82/8%)]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[oklch(0.78_0.14_82/15%)] flex items-center justify-center">
                  <Bell className="h-3.5 w-3.5 text-[oklch(0.78_0.14_82)]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("admin.notifications") || "Notifications"}
                  </h3>
                  {unreadCount > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      {unreadCount} {t("admin.unread") || "unread"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllRead}
                    className="h-7 px-2 text-[10px] text-[oklch(0.78_0.14_82)] hover:bg-[oklch(0.78_0.14_82/8%)] gap-1"
                  >
                    <CheckCheck className="h-3 w-3" />
                    {t("admin.mark_all_read") || "Mark all read"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 lg:hidden"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="max-h-[400px]">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-3/4 rounded" />
                        <Skeleton className="h-2.5 w-full rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-4">
                  <div className="w-12 h-12 rounded-full bg-[oklch(0.78_0.14_82/8%)] flex items-center justify-center mb-3">
                    <Bell className="h-5 w-5 text-[oklch(0.78_0.14_82/30%)]" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("admin.no_notifications") || "No notifications"}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1 text-center">
                    {t("admin.no_notifications_desc") || "You're all caught up! New notifications will appear here."}
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  <AnimatePresence initial={false}>
                    {notifications.map((notification, index) => {
                      const style = NOTIFICATION_STYLES[notification.type]
                      const Icon = style.icon

                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          transition={{ delay: index * 0.04, duration: 0.25 }}
                          className={cn(
                            "flex items-start gap-3 rounded-xl px-3 py-3 transition-colors duration-150",
                            notification.read
                              ? "hover:bg-[oklch(0.78_0.14_82/4%)]"
                              : "bg-[oklch(0.78_0.14_82/5%)] hover:bg-[oklch(0.78_0.14_82/8%)]"
                          )}
                        >
                          {/* Icon */}
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              style.bgColor
                            )}
                          >
                            <Icon className={cn("h-4 w-4", style.color)} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={cn(
                                  "text-xs font-medium truncate",
                                  notification.read
                                    ? "text-muted-foreground"
                                    : "text-foreground"
                                )}
                              >
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dotColor)} />
                              )}
                            </div>
                            <p
                              className={cn(
                                "text-[11px] leading-relaxed mt-0.5 line-clamp-2",
                                notification.read
                                  ? "text-muted-foreground/50"
                                  : "text-muted-foreground/70"
                              )}
                            >
                              {notification.description}
                            </p>
                            <p className="text-[10px] text-muted-foreground/40 mt-1.5 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {timeAgo(notification.timestamp)}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-[oklch(0.78_0.14_82/8%)] px-5 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-8 text-[11px] text-muted-foreground hover:text-foreground hover:bg-[oklch(0.78_0.14_82/8%)]"
                >
                  {t("admin.view_all_notifications") || "View All Notifications"}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── Export unread count hook for external use ───────────────────────────── */

export function useNotificationCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await fetch("/api/admin/activity-log?limit=10")
        const data = await res.json()
        // Count first 3 as unread
        setCount(Math.min((data.activities || []).length, 3))
      } catch {
        // silent
      }
    }
    fetch()
    const interval = setInterval(fetch, 60000)
    return () => clearInterval(interval)
  }, [])

  return count
}
