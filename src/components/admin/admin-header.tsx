"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import {
  Menu,
  Search,
  Bell,
  Globe,
  ChevronRight,
  LogOut,
  Settings,
  User,
  ChevronDown,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n, ALL_LOCALES, LOCALE_NAMES } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "@/lib/router-context"
import { cn } from "@/lib/utils"

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface AdminHeaderProps {
  activeTab: string
  setTab: (tab: string) => void
  onMobileMenuToggle: () => void
}

/* ─── Tab Label Map ──────────────────────────────────────────────────────── */

const TAB_LABELS: Record<string, string> = {
  overview: "admin.dashboard",
  analytics: "admin.analytics",
  activity: "admin.activity_log",
  projects: "admin.projects",
  translations: "admin.translations",
  settings: "admin.settings",
  appearance: "admin.appearance",
  contacts: "admin.contacts",
  users: "admin.users",
  media: "admin.media",
  "home-sections": "admin.home_sections",
  "news-ticker": "admin.news_ticker",
  seo: "admin.seo",
  "data-export": "admin.data_export",
}

/* ─── Tab Description Map ────────────────────────────────────────────────── */

const TAB_DESCRIPTIONS: Record<string, { key: string; fallback: string }> = {
  overview: { key: "admin.tab_desc_overview", fallback: "Key metrics and quick actions at a glance" },
  analytics: { key: "admin.tab_desc_analytics", fallback: "Traffic, views, and performance insights" },
  activity: { key: "admin.tab_desc_activity", fallback: "Recent system events and admin actions" },
  projects: { key: "admin.tab_desc_projects", fallback: "Manage platforms, content, and publishing" },
  translations: { key: "admin.tab_desc_translations", fallback: "Edit UI strings across all languages" },
  media: { key: "admin.tab_desc_media", fallback: "Upload and manage images, documents, and files" },
  contacts: { key: "admin.tab_desc_contacts", fallback: "Review and respond to submitted messages" },
  users: { key: "admin.tab_desc_users", fallback: "Manage user accounts, roles, and permissions" },
  "home-sections": { key: "admin.tab_desc_home_sections", fallback: "Customize homepage section order and visibility" },
  "news-ticker": { key: "admin.tab_desc_news_ticker", fallback: "Edit the scrolling news ticker in hero header" },
  seo: { key: "admin.tab_desc_seo", fallback: "Meta tags, social previews, and sitemap" },
  appearance: { key: "admin.tab_desc_appearance", fallback: "Colors, typography, layout, and effects" },
  settings: { key: "admin.tab_desc_settings", fallback: "General configuration and site preferences" },
  "data-export": { key: "admin.tab_desc_data_export", fallback: "Export, import, and backup your data" },
}

/* ─── Live Clock Hook ────────────────────────────────────────────────────── */

function useLiveClock() {
  const [time, setTime] = useState("--:--")
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = now.getHours().toString().padStart(2, "0")
      const m = now.getMinutes().toString().padStart(2, "0")
      setTime(`${h}:${m}`)
      // Update every second using rAF for better accuracy
      rafRef.current = window.setTimeout(update, 1000)
    }
    update()
    return () => clearTimeout(rafRef.current)
  }, [])

  return time
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export function AdminHeader({
  activeTab,
  setTab,
  onMobileMenuToggle,
}: AdminHeaderProps) {
  const { t, locale, setLocale } = useI18n()
  const { logout } = useAuth()
  const { navigate } = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(3)
  const time = useLiveClock()

  const handleLogout = () => {
    logout()
    navigate({ page: "admin-login" })
  }

  // Fetch notification count periodically
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/admin/activity-log?limit=10")
        const data = await res.json()
        setNotifCount(Math.min((data.activities || []).length, 3))
      } catch {
        // silent
      }
    }
    const interval = setInterval(fetchCount, 60000)
    fetchCount()
    return () => clearInterval(interval)
  }, [])

  // Close notification panel when clicking outside
  useEffect(() => {
    if (!notifOpen) return
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest("[data-notif-area]")) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [notifOpen])

  // Keyboard shortcut for search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const currentTabLabel =
    t(TAB_LABELS[activeTab] || "") ||
    t(`admin.${activeTab}`) ||
    activeTab.charAt(0).toUpperCase() + activeTab.slice(1)

  const tabDesc = TAB_DESCRIPTIONS[activeTab]
  const tabDescriptionText = tabDesc ? t(tabDesc.key) || tabDesc.fallback : ""

  return (
    <header className="sticky top-0 z-30 border-b border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.12_0.028_265/80%)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 h-14">
        {/* ── Left Section ── */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden shrink-0 hover:bg-[oklch(0.78_0.14_82/8%)]"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Breadcrumb */}
          <Breadcrumb className="hidden sm:flex">
            <BreadcrumbList className="text-xs">
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => setTab("overview")}
                  className="cursor-pointer text-muted-foreground hover:text-[oklch(0.78_0.14_82)] transition-colors"
                >
                  {t("admin.title") || "Admin"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3 w-3" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  {currentTabLabel}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Mobile tab label */}
          <span className="sm:hidden text-sm font-medium text-foreground truncate">
            {currentTabLabel}
          </span>
        </div>

        {/* ── Center Section ── */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-sm">
          <button
            onClick={() => setSearchOpen(true)}
            className={cn(
              "group flex items-center gap-2 w-full max-w-xs px-3.5 py-2 rounded-lg",
              "border border-[oklch(0.78_0.14_82/12%)] bg-[oklch(0.14_0.028_265/50%)]",
              "text-muted-foreground text-sm transition-all duration-200",
              "hover:border-[oklch(0.78_0.14_82/25%)] hover:bg-[oklch(0.14_0.028_265/70%)] hover:shadow-[0_0_16px_oklch(0.78_0.14_82/6%)]",
              "cursor-pointer"
            )}
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 group-hover:text-[oklch(0.78_0.14_82)] transition-colors" />
            <span className="flex-1 text-left text-xs text-muted-foreground/50">
              {t("admin.search_placeholder") || "Search pages, actions..."}
            </span>
            <motion.kbd
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground/40 bg-muted/50 border border-border/50"
            >
              <span className="text-[9px]">⌘</span>K
            </motion.kbd>
          </button>
        </div>

        {/* ── Right Section ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-[oklch(0.78_0.14_82/8%)]"
                aria-label={t("common.language") || "Change language"}
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-xl border-[oklch(0.78_0.14_82/12%)] bg-[oklch(0.12_0.028_265/95%)] backdrop-blur-xl"
            >
              {ALL_LOCALES.map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={cn(
                    "cursor-pointer text-sm",
                    locale === loc
                      ? "bg-[oklch(0.78_0.14_82/10%)] text-[oklch(0.78_0.14_82)] font-medium"
                      : ""
                  )}
                >
                  <span className="font-mono text-xs uppercase w-7">{loc}</span>
                  <span className="ms-2">{LOCALE_NAMES[loc]}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Live Clock */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md text-muted-foreground/60">
            <Clock className="h-3 w-3" />
            <span className="text-xs font-mono tabular-nums tracking-wide">{time}</span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-border/40 mx-0.5 hidden lg:block" />

          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden hover:bg-[oklch(0.78_0.14_82/8%)]"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
          </Button>

          {/* Notification bell */}
          <div className="relative" data-notif-area>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-[oklch(0.78_0.14_82/8%)] relative"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              {notifCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute top-1 end-1 w-4 h-4 rounded-full bg-[oklch(0.78_0.14_82)] text-[oklch(0.14_0.028_265)] text-[9px] font-bold flex items-center justify-center"
                >
                  {notifCount}
                </motion.span>
              )}
            </Button>

            {/* Notification dropdown */}
            {notifOpen && (
              <NotificationDropdown
                count={notifCount}
                onMarkAllRead={() => setNotifCount(0)}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-border/50 mx-1 hidden sm:block" />

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 gap-2 px-2 hover:bg-[oklch(0.78_0.14_82/8%)]"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src="/logo.png" alt={t("admin.title") || "Admin"} />
                  <AvatarFallback className="bg-[oklch(0.78_0.14_82/15%)] text-[oklch(0.78_0.14_82)] text-[11px] font-bold">
                    AD
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-xs font-medium text-foreground">
                  {t("admin.title") || "Admin"}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl border-[oklch(0.78_0.14_82/12%)] bg-[oklch(0.12_0.028_265/95%)] backdrop-blur-xl"
            >
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{t("admin.admin_user") || "Admin User"}</span>
                  <span>admin@jomaa.store</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[oklch(0.78_0.14_82/8%)]" />
              <DropdownMenuGroup>
                <DropdownMenuItem className="gap-2.5 cursor-pointer focus:bg-[oklch(0.78_0.14_82/8%)]">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {t("admin.profile") || "Profile"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2.5 cursor-pointer focus:bg-[oklch(0.78_0.14_82/8%)]"
                  onClick={() => setTab("settings")}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  {t("admin.settings") || "Settings"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-[oklch(0.78_0.14_82/8%)]" />
              <DropdownMenuItem
                className="gap-2.5 cursor-pointer focus:bg-red-500/10 focus:text-red-400"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
                {t("admin.logout") || "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Tab Description ── */}
      {tabDescriptionText && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 sm:px-6 pb-2 hidden sm:block"
        >
          <p className="text-[11px] text-muted-foreground/60">
            {tabDescriptionText}
          </p>
        </motion.div>
      )}
    </header>
  )
}

/* ─── Inline Notification Dropdown (lightweight) ─────────────────────────── */

function NotificationDropdown({
  count,
  onMarkAllRead,
  onClose,
}: {
  count: number
  onMarkAllRead: () => void
  onClose: () => void
}) {
  const { t } = useI18n()

  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "absolute end-0 top-full mt-1.5 z-50 w-72 rounded-xl border border-[oklch(0.78_0.14_82/12%)]",
        "bg-[oklch(0.12_0.028_265/95%)] backdrop-blur-xl",
        "shadow-[0_8px_32px_-4px_rgba(0,0,0,0.4)]"
      )}
      data-notif-area
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[oklch(0.78_0.14_82/8%)]">
        <span className="text-xs font-semibold text-foreground">
          {t("admin.notifications") || "Notifications"}
        </span>
        {count > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-[10px] text-[oklch(0.78_0.14_82)] hover:underline cursor-pointer"
          >
            {t("admin.mark_all_read") || "Mark all read"}
          </button>
        )}
      </div>
      <div className="p-3 text-center">
        <p className="text-xs text-muted-foreground">
          {t("admin.notification_hint") || "Open notification panel for details"}
        </p>
      </div>
    </motion.div>
  )
}
