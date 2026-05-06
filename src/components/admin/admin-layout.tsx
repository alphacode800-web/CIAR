"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, animate, useReducedMotion } from "framer-motion"
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
  Wallpaper,
  Palette,
  Search,
  Globe,
  Layers,
  Clapperboard,
  Newspaper,
  FileDown,
  PanelRightClose,
  PanelRightOpen,
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
  { id: "overview", icon: LayoutDashboard, labelKey: "admin.dashboard", fallback: "نظرة عامة", group: "main" },
  { id: "analytics", icon: BarChart3, labelKey: "admin.analytics", fallback: "التحليلات والزيارات", group: "main" },
  { id: "activity", icon: Activity, labelKey: "admin.activity_log", fallback: "سجل النشاط", group: "main" },
  { id: "projects", icon: FolderOpen, labelKey: "admin.projects", fallback: "المشاريع والمنصات", group: "content" },
  { id: "translations", icon: Languages, labelKey: "admin.translations", fallback: "الترجمات والنصوص", group: "content" },
  { id: "media", icon: Image, labelKey: "admin.media", fallback: "مكتبة الوسائط", group: "content" },
  { id: "backgrounds", icon: Wallpaper, labelKey: "admin.backgrounds", fallback: "خلفيات الصفحات", group: "content" },
  { id: "home-banners", icon: Clapperboard, labelKey: "admin.home_banners", fallback: "بنرات الصفحة الرئيسية", group: "content" },
  { id: "contacts", icon: Mail, labelKey: "admin.contacts", fallback: "رسائل التواصل", group: "content" },
  { id: "users", icon: Users, labelKey: "admin.users", fallback: "المستخدمون والصلاحيات", group: "content" },
  { id: "home-sections", icon: Layers, labelKey: "admin.home_sections", fallback: "أقسام الصفحة الرئيسية", group: "system" },
  { id: "news-ticker", icon: Newspaper, labelKey: "admin.news_ticker", fallback: "الشريط الإخباري", group: "system" },
  { id: "seo", icon: Globe, labelKey: "admin.seo", fallback: "تهيئة محركات البحث", group: "system" },
  { id: "appearance", icon: Palette, labelKey: "admin.appearance", fallback: "المظهر والألوان", group: "system" },
  { id: "settings", icon: Settings, labelKey: "admin.settings", fallback: "إعدادات الموقع", group: "system" },
  { id: "data-export", icon: FileDown, labelKey: "admin.data_export", fallback: "تصدير واستيراد", group: "system" },
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
        <p className="px-1 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
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
    <nav
      className={`min-h-0 flex-1 space-y-1 overflow-y-auto py-2.5 scrollbar-none ${collapsed ? "px-2" : "px-4"}`}
    >
      {renderGroup(GROUP_LABELS.main, mainItems)}

      <Separator className={`my-3 bg-white/10 ${collapsed ? "mx-2 w-6" : ""}`} />

      {renderGroup(GROUP_LABELS.content, contentItems)}

      <Separator className={`my-3 bg-white/10 ${collapsed ? "mx-2 w-6" : ""}`} />

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
  const { dir } = useI18n()
  const isActive = activeTab === tab.id
  const Icon = tab.icon
  const label = t(tab.labelKey) || tab.fallback

  const buttonContent = (
    <button
      onClick={() => {
        setTab(tab.id)
        onNavigate?.()
      }}
      className={`relative flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out ${
        collapsed ? "justify-center px-0" : ""
      } ${
        isActive
          ? "border-[#60a5fa]/70 bg-gradient-to-r from-[#1d4ed8]/80 via-[#2563eb]/75 to-[#ea580c]/45 text-white shadow-[0_14px_30px_-16px_rgba(37,99,235,0.95)]"
          : "text-slate-200/95 hover:bg-gradient-to-r hover:from-[#1e293b]/80 hover:to-[#1d4ed8]/25 hover:text-white"
      }`}
      aria-label={label}
    >
      <div className="relative shrink-0">
        <Icon className={`h-4 w-4 ${isActive ? "text-[#3b82f6]" : "text-slate-300"}`} />
        {/* Badge count for Activity Log */}
        {activityCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className={`absolute -end-1.5 -top-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-none border border-primary/30 bg-primary px-1 text-[8px] font-bold text-primary-foreground shadow-sm ${
              collapsed ? "-end-2.5 -top-1" : ""
            }`}
          >
            {activityCount > 99 ? "99+" : activityCount}
          </motion.span>
        )}
        {/* Unread dot for Contacts */}
        {showDot && (
          <span className={`absolute end-0 top-0 h-2 w-2 rounded-none bg-[#ea580c] ring-1 ring-[#7c2d12] ${collapsed ? "-end-1" : ""}`}>
            <span className="absolute inset-0 animate-ping rounded-none bg-[#fb923c] opacity-40" />
          </span>
        )}
      </div>
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && isActive && <div className="ms-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#3b82f6]" />}
    </button>
  )

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent
            side={dir === "rtl" ? "right" : "left"}
            sideOffset={10}
            className="rounded-lg text-xs font-medium shadow-[0_10px_28px_-8px_rgba(0,0,0,0.2)]"
          >
            {label}
            {activityCount > 0 && (
              <span className="ms-1.5 font-semibold text-primary">({activityCount})</span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return buttonContent
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

  /** Drawer is docked to the physical right; drag further right to dismiss */
  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const threshold = 80
      const shouldClose = info.offset.x > threshold || info.velocity.x > 400
      if (shouldClose) {
        onClose()
      } else {
        animate(x, 0, { type: "spring", damping: 25, stiffness: 300 })
      }
    },
    [onClose, x]
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
            className="fixed inset-0 z-40 bg-[#44403c]/25 backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            ref={drawerRef}
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.3, right: 0.3 }}
            onDragEnd={handleDragEnd}
            style={{ x }}
            dir={dir}
            className="admin-3d-panel glass-strong fixed bottom-2 right-2 top-16 z-50 flex w-[280px] flex-col rounded-2xl border border-primary/30 backdrop-blur-xl will-change-transform touch-none lg:hidden"
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
  const { t, dir, locale } = useI18n()
  const reduceMotion = useReducedMotion()
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

  const sidebarWidth = sidebarCollapsed ? 64 : 260

  return (
    <div
      dir={dir}
      lang={locale}
      data-admin-lux-layout
      className="admin-vivid-bg relative flex min-h-screen overflow-x-hidden bg-[#f4f6fb] text-foreground selection:bg-primary/25 selection:text-primary-foreground [&_.text-foreground]:text-foreground [&_.text-muted-foreground]:text-muted-foreground"
    >
      {/* ── Desktop Sidebar (يمين الشاشة — ثابت فيزيائياً) ── */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="admin-vivid-sidebar fixed bottom-0 right-0 top-0 z-20 hidden min-h-0 min-w-0 shrink-0 flex-col overflow-hidden border-l border-[#1f2937] bg-[#20293a] text-white lg:flex"
      >
        {/* Logo Area */}
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="admin-vivid-hero-card border-b border-white/10 bg-[#1a2333] px-4 py-4"
          >
            <div className="flex items-start gap-3">
              <div className="admin-vivid-logo relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00a2ff] shadow-md">
                <LayoutDashboard className="h-[19px] w-[19px] text-white" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#93c5fd]">CIAR</p>
                <h1 className="break-words text-sm font-bold leading-snug tracking-tight text-white">
                  {t("admin.title") || "Admin Panel"}
                </h1>
                <p className="whitespace-normal break-words text-[10px] leading-snug text-slate-300">
                  {t("admin.management") || "CIAR Management"}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {sidebarCollapsed && (
          <div className="flex justify-center border-b border-white/10 bg-[#1a2333] p-3">
            <div className="admin-vivid-logo flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a2ff] shadow-md">
              <LayoutDashboard className="h-4 w-4 text-white" />
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
        <div className="border-t border-white/10 p-2">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={sidebarCollapsed ? "icon" : "sm"}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`w-full rounded-lg transition-all ${
                    sidebarCollapsed
                      ? "h-8 w-8"
                      : "justify-center gap-2 border border-transparent text-slate-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {sidebarCollapsed ? (
                    <PanelRightOpen className="h-4 w-4" />
                  ) : (
                    <>
                      <PanelRightClose className="h-4 w-4" />
                      <span className="text-xs font-semibold">{t("admin.collapse") || "Collapse"}</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent
                  side={dir === "rtl" ? "right" : "left"}
                  sideOffset={10}
                  className="rounded-lg text-xs shadow-[0_10px_28px_-8px_rgba(0,0,0,0.2)]"
                >
                  {t("admin.expand") || "Expand sidebar"}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

      </motion.aside>

      {/* ── Mobile Drawer ── */}
      <MobileDrawer open={mobileOpen} onClose={closeMobile} dir={dir}>
        <div className="flex items-center justify-between border-b border-primary/15 bg-gradient-to-b from-background to-secondary/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/40 bg-gradient-to-b from-primary to-[oklch(0.62_0.14_72)] shadow-md ring-1 ring-white/40">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-bold tracking-tight text-[#1c1917]">{t("admin.title") || "Admin Panel"}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-[#57534e] hover:bg-[#fff7ed]"
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
        <div className="mt-auto border-t border-[#ea580c]/10 p-3">
          <p className="text-center text-[10px] font-medium text-[#57534e]">
            {t("admin.swipe_to_close") || "Swipe right to close"} →
          </p>
        </div>
      </MobileDrawer>

      {/* ── Main Content ── */}
      <motion.main
        animate={{
          marginRight: typeof window !== "undefined" && window.innerWidth >= 1024 ? sidebarWidth : 0,
        }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative z-10 min-w-0 flex-1 max-lg:!mr-0 lg:mr-[260px]"
      >
        <AdminHeader
          activeTab={activeTab}
          setTab={setTab}
          onMobileMenuToggle={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        <div className="px-4 pb-6 pt-4 sm:px-6 sm:pb-8 lg:px-8 lg:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.988 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.992 }}
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : { type: "spring", stiffness: 320, damping: 28, mass: 0.85 }
              }
              className="admin-vivid-surface admin-vivid-surface-image mx-auto max-w-7xl rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="admin-modern-tabs relative">{children}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>

      {/* ── Search Command Palette ── */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} onNavigate={setTab} />
    </div>
  )
}
