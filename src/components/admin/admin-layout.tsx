"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useI18n } from "@/lib/i18n-context"
import { AdminHeader } from "./admin-header"
import { SearchCommand } from "./search-command"

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
  main: "Dashboard",
  content: "Content",
  system: "System",
}

function SidebarNav({
  activeTab,
  setTab,
  onNavigate,
}: {
  activeTab: string
  setTab: (tab: string) => void
  onNavigate?: () => void
}) {
  const { t } = useI18n()

  const mainItems = SIDEBAR_ITEMS.filter((i) => i.group === "main")
  const contentItems = SIDEBAR_ITEMS.filter((i) => i.group === "content")
  const systemItems = SIDEBAR_ITEMS.filter((i) => i.group === "system")

  return (
    <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-none">
      {/* Main Group */}
      <div className="space-y-1">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          {GROUP_LABELS.main}
        </p>
        {mainItems.map((tab) => (
          <SidebarButton key={tab.id} tab={tab} activeTab={activeTab} setTab={setTab} onNavigate={onNavigate} t={t} />
        ))}
      </div>

      <Separator className="my-3 bg-[oklch(0.78_0.14_82/8%)]" />

      {/* Content Group */}
      <div className="space-y-1">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          {GROUP_LABELS.content}
        </p>
        {contentItems.map((tab) => (
          <SidebarButton key={tab.id} tab={tab} activeTab={activeTab} setTab={setTab} onNavigate={onNavigate} t={t} />
        ))}
      </div>

      <Separator className="my-3 bg-[oklch(0.78_0.14_82/8%)]" />

      {/* System Group */}
      <div className="space-y-1">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          {GROUP_LABELS.system}
        </p>
        {systemItems.map((tab) => (
          <SidebarButton key={tab.id} tab={tab} activeTab={activeTab} setTab={setTab} onNavigate={onNavigate} t={t} />
        ))}
      </div>
    </nav>
  )
}

function SidebarButton({
  tab,
  activeTab,
  setTab,
  onNavigate,
  t,
}: {
  tab: SidebarItem
  activeTab: string
  setTab: (tab: string) => void
  onNavigate?: () => void
  t: (key: string) => string
}) {
  const isActive = activeTab === tab.id
  const Icon = tab.icon

  return (
    <button
      onClick={() => {
        setTab(tab.id)
        onNavigate?.()
      }}
      className={`relative flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
        isActive
          ? "text-[oklch(0.78_0.14_82)] bg-[oklch(0.78_0.14_82/10%)]"
          : "text-muted-foreground hover:bg-[oklch(0.78_0.14_82/5%)] hover:text-foreground"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="admin-sidebar-active"
          className="absolute inset-0 rounded-lg border border-[oklch(0.78_0.14_82/20%)]"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[oklch(0.78_0.14_82)]" : ""}`} />
      <span className="truncate">{t(tab.labelKey) || tab.fallback}</span>
      {isActive && (
        <div className="ms-auto w-1.5 h-1.5 rounded-full bg-[oklch(0.78_0.14_82)] shadow-[0_0_6px_oklch(0.78_0.14_82/60%)]" />
      )}
    </button>
  )
}

export function AdminLayout({ children, activeTab, setTab }: AdminLayoutProps) {
  const { t, dir } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="flex min-h-screen pt-16 bg-background">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 shrink-0 border-e border-[oklch(0.78_0.14_82/8%)] bg-card/30 backdrop-blur-sm flex-col fixed top-16 bottom-0 z-20">
        {/* Logo Area */}
        <div className="p-4 border-b border-[oklch(0.78_0.14_82/8%)]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[oklch(0.78_0.14_82)] to-[oklch(0.72_0.13_75)] flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-[oklch(0.12_0.03_265)]" />
            </div>
            <div>
              <h1 className="text-sm font-bold">{t("admin.title") || "Admin Panel"}</h1>
              <p className="text-[10px] text-muted-foreground">CIAR Management</p>
            </div>
          </div>
        </div>
        <SidebarNav activeTab={activeTab} setTab={setTab} />

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[oklch(0.78_0.14_82/8%)]">
          <div className="rounded-lg bg-gradient-to-br from-[oklch(0.78_0.14_82/8%)] to-[oklch(0.72_0.13_75/4%)] border border-[oklch(0.78_0.14_82/12%)] p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-2 w-2 rounded-full bg-[oklch(0.78_0.14_82)] animate-pulse" />
              <span className="text-[10px] font-semibold text-[oklch(0.78_0.14_82)]">
                {t("admin.system_status") || "System Online"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {t("admin.version_info") || "v2.0 — All services running"}
            </p>
          </div>
        </div>
      </aside>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={closeMobile}
            />
            <motion.aside
              initial={{ x: dir === "rtl" ? 280 : -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: dir === "rtl" ? 280 : -280, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              dir={dir}
              className="fixed top-16 start-0 bottom-0 z-50 w-[280px] bg-card/95 backdrop-blur-xl border-e border-[oklch(0.78_0.14_82/8%)] flex flex-col lg:hidden shadow-2xl"
            >
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
              <SidebarNav activeTab={activeTab} setTab={setTab} onNavigate={closeMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 lg:ms-64">
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
      </main>

      {/* ── Search Command Palette ── */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} onNavigate={setTab} />
    </div>
  )
}
