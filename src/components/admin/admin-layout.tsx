"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion"
import {
  LayoutDashboard,
  BarChart3,
  Activity,
  FolderOpen,
  Languages,
  Settings,
  Menu,
  X,
  Mail,
  Users,
  Image,
  Palette,
  Search,
  Globe,
  Layers,
  FileDown,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
  FolderKanban,
  MessageSquare,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useI18n } from "@/lib/i18n-context"
import { AdminHeader } from "./admin-header"
import { SearchCommand } from "./search-command"

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface AdminLayoutProps {
  children: React.ReactNode
  activeTab: string
  setTab: (tab: string) => void
}

interface SidebarItem {
  id: string
  icon: LucideIcon
  labelKey: string
  fallback: string
  group: "main" | "content" | "system"
}

/* ─── Sidebar Config ─────────────────────────────────────────────────────── */

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "overview", icon: LayoutDashboard, labelKey: "admin.dashboard", fallback: "Overview", group: "main" },
  { id: "analytics", icon: BarChart3, labelKey: "admin.analytics", fallback: "Analytics", group: "main" },
  { id: "activity", icon: Activity, labelKey: "admin.activity_log", fallback: "Activity Log", group: "main" },
  { id: "projects", icon: FolderOpen, labelKey: "admin.projects", fallback: "Projects", group: "content" },
  { id: "translations", icon: Languages, labelKey: "admin.translations", fallback: "Translations", group: "content" },
  { id: "media", icon: Image, labelKey: "admin.media", fallback: "Media Library", group: "content" },
  { id: "contacts", icon: Mail, labelKey: "admin.contacts", fallback: "Contacts", group: "content" },
  { id: "users", icon: Users, labelKey: "admin.users", fallback: "Users", group: "content" },
  { id: "home-sections", icon: Layers, labelKey: "admin.home_sections", fallback: "Home Sections", group: "system" },
  { id: "seo", icon: Globe, labelKey: "admin.seo", fallback: "SEO", group: "system" },
  { id: "appearance", icon: Palette, labelKey: "admin.appearance", fallback: "Appearance", group: "system" },
  { id: "settings", icon: Settings, labelKey: "admin.settings", fallback: "Settings", group: "system" },
  { id: "data-export", icon: FileDown, labelKey: "admin.data_export", fallback: "Export / Import", group: "system" },
]

const GROUP_LABELS: Record<string, string> = {
  main: "admin.group_dashboard",
  content: "admin.group_content",
  system: "admin.group_system",
}

/* ─── Sidebar Nav ────────────────────────────────────────────────────────── */

function SidebarNav({
  activeTab,
  setTab,
  onNavigate,
  collapsed,
  activityCount,
  unreadContacts,
}: {
  activeTab: string
  setTab: (tab: string) => void
  onNavigate?: () => void
  collapsed: boolean
  activityCount: number
  unreadContacts: boolean
}) {
  const { t } = useI18n()

  const mainItems = SIDEBAR_ITEMS.filter((i) => i.group === "main")
  const contentItems = SIDEBAR_ITEMS.filter((i) => i.group === "content")
  const systemItems = SIDEBAR_ITEMS.filter((i) => i.group === "system")

  const renderGroup = (labelKey: string, items: SidebarItem[]) => {
    if (collapsed) {
      // Collapsed: no group labels, just icons
      return (
        <div className="flex flex-col items-center gap-0.5 py-1">
          {items.map((tab) => (
            <SidebarButton
              key={tab.id}
              tab={tab}
              activeTab={activeTab}
              setTab={setTab}
              onNavigate={onNavigate}
              t={t}
              collapsed={collapsed}
              activityCount={tab.id === "activity" ? activityCount : 0}
              showDot={tab.id === "contacts" && unreadContacts}
            />
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-1">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          {t(labelKey) || labelKey}
        </p>
        {items.map((tab) => (
          <SidebarButton
            key={tab.id}
            tab={tab}
            activeTab={activeTab}
            setTab={setTab}
            onNavigate={onNavigate}
            t={t}
            collapsed={collapsed}
            activityCount={tab.id === "activity" ? activityCount : 0}
            showDot={tab.id === "contacts" && unreadContacts}
          />
        ))}
      </div>
    )
  }

  return (
    <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-none">
      {renderGroup(GROUP_LABELS.main, mainItems)}

      <Separator className={`my-3 bg-[oklch(0.78_0.14_82/8%)] ${collapsed ? "mx-2 w-6" : ""}`} />

      {renderGroup(GROUP_LABELS.content, contentItems)}

      <Separator className={`my-3 bg-[oklch(0.78_0.14_82/8%)] ${collapsed ? "mx-2 w-6" : ""}`} />

      {renderGroup(GROUP_LABELS.system, systemItems)}
    </nav>
  )
}

/* ─── Sidebar Button ─────────────────────────────────────────────────────── */

function SidebarButton({
  tab,
  activeTab,
  setTab,
  onNavigate,
  t,
  collapsed,
  activityCount,
  showDot,
}: {
  tab: SidebarItem
  activeTab: string
  setTab: (tab: string) => void
  onNavigate?: () => void
  t: (key: string) => string
  collapsed: boolean
  activityCount: number
  showDot: boolean
}) {
  const isActive = activeTab === tab.id
  const Icon = tab.icon
  const label = t(tab.labelKey) || tab.fallback

  const buttonContent = (
    <button
      onClick={() => {
        setTab(tab.id)
        onNavigate?.()
      }}
      className={`relative flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
        collapsed ? "justify-center px-0" : ""
      } ${
        isActive
          ? "text-[oklch(0.78_0.14_82)] bg-[oklch(0.78_0.14_82/10%)]"
          : "text-muted-foreground hover:bg-[oklch(0.78_0.14_82/5%)] hover:text-foreground"
      }`}
      aria-label={label}
    >
      {isActive && (
        <motion.div
          layoutId={collapsed ? "admin-sidebar-active-collapsed" : "admin-sidebar-active"}
          className="absolute inset-0 rounded-lg border border-[oklch(0.78_0.14_82/20%)]"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <div className="relative shrink-0">
        <Icon className={`h-4 w-4 ${isActive ? "text-[oklch(0.78_0.14_82)]" : ""}`} />
        {/* Badge count for Activity Log */}
        {activityCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className={`absolute -top-1.5 -end-1.5 min-w-[14px] h-[14px] rounded-full bg-[oklch(0.78_0.14_82)] text-[oklch(0.14_0.028_265)] text-[8px] font-bold flex items-center justify-center px-1 ${
              collapsed ? "-top-1 -end-2.5" : ""
            }`}
          >
            {activityCount > 99 ? "99+" : activityCount}
          </motion.span>
        )}
        {/* Unread dot for Contacts */}
        {showDot && (
          <span className={`absolute top-0 end-0 w-2 h-2 rounded-full bg-[oklch(0.78_0.14_82)] ${collapsed ? "-end-1" : ""}`}>
            <span className="absolute inset-0 rounded-full bg-[oklch(0.78_0.14_82)] animate-ping opacity-40" />
          </span>
        )}
      </div>
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && isActive && (
        <div className="ms-auto w-1.5 h-1.5 rounded-full bg-[oklch(0.78_0.14_82)] shadow-[0_0_6px_oklch(0.78_0.14_82/60%)]" />
      )}
    </button>
  )

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="end" sideOffset={8} className="text-xs font-medium">
            {label}
            {activityCount > 0 && (
              <span className="ms-1.5 text-[oklch(0.78_0.14_82)]">({activityCount})</span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return buttonContent
}

/* ─── Quick Overview Footer ──────────────────────────────────────────────── */

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { t } = useI18n()
  const [stats, setStats] = useState<{ projects: number; messages: number }>({
    projects: 0,
    messages: 0,
  })
  const [uptime, setUptime] = useState("0m")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectRes, contactRes] = await Promise.allSettled([
          fetch("/api/projects"),
          fetch("/api/admin/contacts"),
        ])
        if (projectRes.status === "fulfilled") {
          const pData = await projectRes.value.json()
          setStats((prev) => ({
            ...prev,
            projects: Array.isArray(pData) ? pData.length : pData.projects?.length ?? prev.projects,
          }))
        }
        if (contactRes.status === "fulfilled") {
          const cData = await contactRes.value.json()
          setStats((prev) => ({
            ...prev,
            messages: Array.isArray(cData) ? cData.length : cData.contacts?.length ?? prev.messages,
          }))
        }
      } catch {
        // silent
      }
    }
    fetchStats()
  }, [])

  // Uptime tracker (time since component mounted)
  useEffect(() => {
    const startTime = Date.now()
    const updateUptime = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      if (elapsed < 60) setUptime(`${elapsed}s`)
      else if (elapsed < 3600) setUptime(`${Math.floor(elapsed / 60)}m`)
      else setUptime(`${Math.floor(elapsed / 3600)}h ${Math.floor((elapsed % 3600) / 60)}m`)
    }
    updateUptime()
    const interval = setInterval(updateUptime, 10000)
    return () => clearInterval(interval)
  }, [])

  if (collapsed) {
    return (
      <div className="p-2 border-t border-[oklch(0.78_0.14_82/8%)] flex justify-center">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[oklch(0.78_0.14_82/8%)]">
                <div className="relative">
                  <div className="h-2 w-2 rounded-full bg-[oklch(0.78_0.14_82)]" />
                  <div className="absolute inset-0 rounded-full bg-[oklch(0.78_0.14_82)] animate-ping opacity-30" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="end" sideOffset={8} className="text-xs">
              <div className="flex flex-col gap-1">
                <span>{stats.projects} {t("admin.projects") || "Projects"}</span>
                <span>{stats.messages} {t("admin.contacts") || "Messages"}</span>
                <span>{t("admin.up") || "Up"}: {uptime}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  return (
    <div className="p-3 border-t border-[oklch(0.78_0.14_82/8%)]">
      <div className="rounded-lg bg-gradient-to-br from-[oklch(0.78_0.14_82/6%)] to-[oklch(0.72_0.13_75/3%)] border border-[oklch(0.78_0.14_82/10%)] p-3 space-y-2.5">
        {/* Header with status */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("admin.quick_overview") || "Quick Overview"}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <div className="h-1.5 w-1.5 rounded-full bg-[oklch(0.78_0.14_82)]" />
              <div className="absolute inset-0 rounded-full bg-[oklch(0.78_0.14_82)] animate-ping opacity-30" />
            </div>
            <span className="text-[9px] font-medium text-[oklch(0.78_0.14_82)]">{t("admin.live") || "Live"}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-md bg-[oklch(0.14_0.028_265/40%)] px-2 py-1.5">
            <FolderKanban className="h-3 w-3 text-[oklch(0.78_0.14_82)] shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-foreground leading-none">{stats.projects}</p>
              <p className="text-[8px] text-muted-foreground leading-none mt-0.5">
                {t("admin.projects") || "Projects"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-[oklch(0.14_0.028_265/40%)] px-2 py-1.5">
            <MessageSquare className="h-3 w-3 text-[oklch(0.78_0.14_82)] shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-foreground leading-none">{stats.messages}</p>
              <p className="text-[8px] text-muted-foreground leading-none mt-0.5">
                {t("admin.messages") || "Messages"}
              </p>
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
          <Clock className="h-2.5 w-2.5 text-muted-foreground/60" />
          <span>
            {t("admin.uptime") || "Session uptime"}: {uptime}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Swipe-to-Close Mobile Drawer ───────────────────────────────────────── */

function MobileDrawer({
  open,
  onClose,
  dir,
  children,
}: {
  open: boolean
  onClose: () => void
  dir: "ltr" | "rtl"
  children: React.ReactNode
}) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const isStartDir = dir === "rtl" ? -1 : 1

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const threshold = 80
      const shouldClose = info.offset.x * isStartDir > threshold || info.velocity.x * isStartDir > 300
      if (shouldClose) {
        onClose()
      } else {
        animate(x, 0, { type: "spring", damping: 25, stiffness: 300 })
      }
    },
    [isStartDir, onClose, x]
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            ref={drawerRef}
            initial={{ x: dir === "rtl" ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dir === "rtl" ? 300 : -300, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.3, right: 0.3 }}
            onDragEnd={handleDragEnd}
            style={{ x }}
            dir={dir}
            className="fixed top-16 start-0 bottom-0 z-50 w-[280px] bg-card/95 backdrop-blur-xl border-e border-[oklch(0.78_0.14_82/8%)] flex flex-col lg:hidden shadow-2xl will-change-transform touch-none"
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── Main Layout Component ──────────────────────────────────────────────── */

export function AdminLayout({ children, activeTab, setTab }: AdminLayoutProps) {
  const { t, dir } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activityCount, setActivityCount] = useState(0)
  const [unreadContacts, setUnreadContacts] = useState(false)

  // Fetch activity count and unread contacts on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/activity-log?limit=10")
        const data = await res.json()
        const activities = data.activities || []
        setActivityCount(activities.length)
      } catch {
        // silent
      }

      try {
        const res = await fetch("/api/admin/contacts")
        const data = await res.json()
        const contacts = data.contacts || data || []
        setUnreadContacts(
          Array.isArray(contacts) && contacts.some((c: { read?: boolean }) => !c.read)
        )
      } catch {
        // silent
      }
    }
    fetchData()
  }, [])

  const closeMobile = () => setMobileOpen(false)

  const sidebarWidth = sidebarCollapsed ? 64 : 256 // 16 = 64px, 64 = 256px

  return (
    <div className="flex min-h-screen pt-16 bg-background">
      {/* ── Desktop Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="hidden lg:flex shrink-0 border-e border-[oklch(0.78_0.14_82/8%)] bg-card/30 backdrop-blur-sm flex-col fixed top-16 bottom-0 z-20 overflow-hidden"
      >
        {/* Logo Area */}
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="p-4 border-b border-[oklch(0.78_0.14_82/8%)]"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[oklch(0.78_0.14_82)] to-[oklch(0.72_0.13_75)] flex items-center justify-center shrink-0">
                <LayoutDashboard className="h-4 w-4 text-[oklch(0.12_0.03_265)]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold">{t("admin.title") || "Admin Panel"}</h1>
                <p className="text-[10px] text-muted-foreground">{t("admin.management") || "CIAR Management"}</p>
              </div>
            </div>
          </motion.div>
        )}

        {sidebarCollapsed && (
          <div className="p-3 border-b border-[oklch(0.78_0.14_82/8%)] flex justify-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[oklch(0.78_0.14_82)] to-[oklch(0.72_0.13_75)] flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-[oklch(0.12_0.03_265)]" />
            </div>
          </div>
        )}

        <SidebarNav
          activeTab={activeTab}
          setTab={setTab}
          collapsed={sidebarCollapsed}
          activityCount={activityCount}
          unreadContacts={unreadContacts}
        />

        {/* Collapse Toggle Button */}
        <div className="p-2 border-t border-[oklch(0.78_0.14_82/8%)]">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={sidebarCollapsed ? "icon" : "sm"}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`w-full ${
                    sidebarCollapsed
                      ? "h-8 w-8"
                      : "justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-[oklch(0.78_0.14_82/8%)]"
                  }`}
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <>
                      <PanelLeftClose className="h-4 w-4" />
                      <span className="text-xs">{t("admin.collapse") || "Collapse"}</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="end" sideOffset={8} className="text-xs">
                  {t("admin.expand") || "Expand sidebar"}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Sidebar Footer */}
        <SidebarFooter collapsed={sidebarCollapsed} />
      </motion.aside>

      {/* ── Mobile Drawer ── */}
      <MobileDrawer open={mobileOpen} onClose={closeMobile} dir={dir}>
        <div className="p-4 border-b border-[oklch(0.78_0.14_82/8%)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[oklch(0.78_0.14_82)] to-[oklch(0.72_0.13_75)] flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-[oklch(0.12_0.03_265)]" />
            </div>
            <h1 className="text-sm font-bold">{t("admin.title") || "Admin Panel"}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-[oklch(0.78_0.14_82/8%)]"
            onClick={closeMobile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarNav
          activeTab={activeTab}
          setTab={setTab}
          onNavigate={closeMobile}
          collapsed={false}
          activityCount={activityCount}
          unreadContacts={unreadContacts}
        />
        {/* Mobile drawer footer */}
        <div className="mt-auto p-3 border-t border-[oklch(0.78_0.14_82/8%)]">
          <p className="text-[10px] text-muted-foreground text-center">
            {t("admin.swipe_to_close") || "Swipe left to close"} {dir === "rtl" ? "←" : "→"}
          </p>
        </div>
      </MobileDrawer>

      {/* ── Main Content ── */}
      <motion.main
        animate={{ marginStart: typeof window !== "undefined" && window.innerWidth >= 1024 ? sidebarWidth : 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="flex-1 min-w-0 lg:ms-64 max-lg:!ms-0"
      >
        <AdminHeader
          activeTab={activeTab}
          setTab={setTab}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <div className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>

      {/* ── Search Command Palette ── */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} onNavigate={setTab} />
    </div>
  )
}
