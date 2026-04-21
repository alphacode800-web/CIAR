"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  FolderOpen,
  Languages,
  Settings,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"

interface AdminLayoutProps {
  children: React.ReactNode
  activeTab: string
  setTab: (tab: string) => void
}

const SIDEBAR_TABS = [
  { id: "dashboard", icon: LayoutDashboard, labelKey: "admin.dashboard" },
  { id: "projects", icon: FolderOpen, labelKey: "admin.projects" },
  { id: "translations", icon: Languages, labelKey: "admin.translations" },
  { id: "settings", icon: Settings, labelKey: "admin.settings" },
]

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

  return (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      {SIDEBAR_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setTab(tab.id)
            onNavigate?.()
          }}
          className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          }`}
        >
          <tab.icon className="h-4 w-4" />
          {t(tab.labelKey)}
        </button>
      ))}
    </nav>
  )
}

export function AdminLayout({ children, activeTab, setTab }: AdminLayoutProps) {
  const { t, dir } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="flex min-h-screen pt-16">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 shrink-0 border-e border-border/50 bg-card/50 flex-col fixed top-16 bottom-0">
        <div className="p-4 border-b border-border/50">
          <h1 className="text-lg font-bold">{t("admin.title")}</h1>
        </div>
        <SidebarNav activeTab={activeTab} setTab={setTab} />
      </aside>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={closeMobile}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: dir === "rtl" ? 256 : -256, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: dir === "rtl" ? 256 : -256, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              dir={dir}
              className="fixed top-16 start-0 bottom-0 z-50 w-64 bg-card border-e border-border/50 flex flex-col lg:hidden shadow-xl"
            >
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h1 className="text-lg font-bold">{t("admin.title")}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
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
        {/* Mobile header bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/80 sticky top-16 z-30">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">
            {t(
              SIDEBAR_TABS.find((tab) => tab.id === activeTab)?.labelKey ||
                "admin.dashboard"
            )}
          </h1>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
