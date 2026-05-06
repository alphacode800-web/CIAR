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
import { useRouter as useHashRouter } from "@/lib/router-context"
import { usePathname as useNextPathname, useRouter as useNextRouter } from "next/navigation"
import { cn } from "@/lib/utils"

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface AdminHeaderProps {
  activeTab: string
  setTab: (tab: string) => void
  onMobileMenuToggle: () => void
  /** Opens the command palette owned by `AdminLayout` */
  onOpenSearch: () => void
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
  backgrounds: "admin.backgrounds",
  "home-banners": "admin.home_banners",
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
  backgrounds: { key: "admin.tab_desc_backgrounds", fallback: "Manage page background images and visual themes" },
  "home-banners": { key: "admin.tab_desc_home_banners", fallback: "Control homepage banners, logo, hero text, and media" },
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
  onOpenSearch,
}: AdminHeaderProps) {
  const { t, locale, setLocale } = useI18n()
  const { user, logout } = useAuth()
  const { navigate } = useHashRouter()
  const nextPathname = useNextPathname()
  const nextRouter = useNextRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(3)
  const time = useLiveClock()

  const handleLogout = () => {
    logout()
    if (nextPathname?.startsWith("/admin/panel")) {
      nextRouter.replace("/admin/login")
      return
    }
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

  const currentTabLabel =
    t(TAB_LABELS[activeTab] || "") ||
    t(`admin.${activeTab}`) ||
    activeTab.charAt(0).toUpperCase() + activeTab.slice(1)

  const tabDesc = TAB_DESCRIPTIONS[activeTab]
  const tabDescriptionText = tabDesc ? t(tabDesc.key) || tabDesc.fallback : ""

  return (
    <header className="admin-vivid-header admin-vivid-header-image sticky top-0 z-30 border-b border-[#e5e7eb] bg-white text-foreground shadow-sm">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        {/* ── Left Section ── */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg hover:bg-[#fff7ed] hover:text-[#c2410c] lg:hidden"
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
                  className="cursor-pointer text-[#78716c] transition-colors hover:text-[#ea580c]"
                >
                  {t("admin.title") || "Admin"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3 w-3 text-[#d6d3d1]" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold tracking-tight text-[#1c1917] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                  {currentTabLabel}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Mobile tab label */}
          <span className="truncate text-sm font-medium text-[#1c1917] sm:hidden">
            {currentTabLabel}
          </span>
        </div>

        {/* ── Center Section ── */}
        <div className="hidden max-w-sm flex-1 items-center justify-center md:flex">
          <button
            type="button"
            onClick={onOpenSearch}
            className={cn(
              "group flex w-full max-w-xs cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm",
              "border border-[#d6d3d1] bg-white shadow-sm",
              "text-[#57534e] transition-all duration-300 ease-out",
              "hover:border-[#ea580c]/40 hover:bg-[#fffdfb]"
            )}
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-[#a8a29e] transition-colors group-hover:text-[#ea580c]" />
            <span className="flex-1 text-start text-xs text-[#a8a29e]">
              {t("admin.search_placeholder") || "Search pages, actions..."}
            </span>
            <motion.kbd
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="hidden items-center gap-0.5 rounded-md border border-[#d6d3d1] bg-[#fafaf9] px-1.5 py-0.5 font-mono text-[10px] text-[#78716c] shadow-[inset_0_1px_0_rgba(255,255,255,1)] sm:inline-flex"
            >
              <span className="text-[9px]">⌘</span>K
            </motion.kbd>
          </button>
        </div>

        {/* ── Right Section ── */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-[#fff7ed] hover:text-[#c2410c]"
                aria-label={t("common.language") || "Change language"}
              >
                <Globe className="h-4 w-4 text-[#78716c]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-xl border border-[#d6d3d1] bg-[#fffdfb] shadow-md"
            >
              {ALL_LOCALES.map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={cn(
                    "cursor-pointer text-sm text-[#44403c]",
                    locale === loc ? "bg-[#fff7ed] font-medium text-[#c2410c]" : ""
                  )}
                >
                  <span className="w-7 font-mono text-xs uppercase">{loc}</span>
                  <span className="ms-2">{LOCALE_NAMES[loc]}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Live Clock */}
          <div className="hidden items-center gap-1.5 rounded-lg px-2 py-1 text-[#a8a29e] lg:flex">
            <Clock className="h-3 w-3" />
            <span className="font-mono text-xs tabular-nums tracking-wide">{time}</span>
          </div>

          {/* Divider */}
          <div className="mx-0.5 hidden h-5 w-px bg-[#e7e5e4] lg:block" />

          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-[#fff7ed] hover:text-[#c2410c] md:hidden"
            onClick={onOpenSearch}
          >
            <Search className="h-4 w-4 text-[#78716c]" />
          </Button>

          {/* Notification bell */}
          <div className="relative" data-notif-area>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 hover:bg-[#fff7ed] hover:text-[#c2410c]"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell className="h-4 w-4 text-[#57534e]" />
              {notifCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute end-1 top-1 flex h-4 w-4 items-center justify-center rounded-none border border-[#7c2d12]/40 bg-gradient-to-b from-[#fb923c] to-[#ea580c] text-[9px] font-bold text-white shadow-[0_2px_0_0_rgba(124,45,12,0.55)]"
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
          <div className="mx-1 hidden h-6 w-px bg-[#e7e5e4] sm:block" />

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 gap-2 rounded-lg px-2 hover:bg-[#fff7ed]">
                <Avatar className="h-7 w-7 rounded-lg border border-[#fed7aa] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <AvatarImage src="/logo.png" alt={t("admin.title") || "Admin"} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-b from-[#fff7ed] to-[#ffedd5] text-[11px] font-bold text-[#c2410c]">
                    AD
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-xs font-medium text-[#44403c] sm:inline">
                  {t("admin.title") || "Admin"}
                </span>
                <ChevronDown className="hidden h-3 w-3 text-[#a8a29e] sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl border border-[#d6d3d1] bg-[#fffdfb] shadow-md"
            >
              <DropdownMenuLabel className="text-xs font-normal text-[#78716c]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-[#1c1917]">{t("admin.admin_user") || "Admin User"}</span>
                  <span className="truncate">{user?.email || user?.phone || "—"}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#fed7aa]/60" />
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer gap-2.5 text-[#44403c] focus:bg-[#fff7ed]">
                  <User className="h-4 w-4 text-[#a8a29e]" />
                  {t("admin.profile") || "Profile"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2.5 text-[#44403c] focus:bg-[#fff7ed]"
                  onClick={() => setTab("settings")}
                >
                  <Settings className="h-4 w-4 text-[#a8a29e]" />
                  {t("admin.settings") || "Settings"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-[#fed7aa]/60" />
              <DropdownMenuItem
                className="cursor-pointer gap-2.5 text-red-600 focus:bg-red-50 focus:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
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
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="hidden px-4 pb-3 sm:block sm:px-6"
        >
          <div className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-3 py-2 shadow-sm">
            <p className="text-[11px] leading-relaxed text-[#57534e]">{tabDescriptionText}</p>
          </div>
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
        "absolute end-0 top-full z-50 mt-1.5 w-72 rounded-xl border border-[#d6d3d1]",
        "bg-[#fffdfb]",
        "shadow-md"
      )}
      data-notif-area
    >
      <div className="flex items-center justify-between border-b border-[#fed7aa]/60 px-4 py-3">
        <span className="text-xs font-semibold text-[#1c1917]">
          {t("admin.notifications") || "Notifications"}
        </span>
        {count > 0 && (
          <button
            onClick={onMarkAllRead}
            className="cursor-pointer text-[10px] font-medium text-[#c2410c] hover:underline"
          >
            {t("admin.mark_all_read") || "Mark all read"}
          </button>
        )}
      </div>
      <div className="p-3 text-center">
        <p className="text-xs text-[#78716c]">
          {t("admin.notification_hint") || "Open notification panel for details"}
        </p>
      </div>
    </motion.div>
  )
}
