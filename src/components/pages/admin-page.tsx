"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { DashboardTab } from "@/components/admin/dashboard-tab"
import { ProjectsTab } from "@/components/admin/projects-tab"
import { TranslationsTab } from "@/components/admin/translations-tab"
import { SettingsTab } from "@/components/admin/settings-tab"
import { useRouter } from "@/lib/router-context"

export function AdminPage() {
  const { route, navigate } = useRouter()
  const activeTab = route.tab || "dashboard"
  const setTab = (tab: string) => navigate({ page: "admin", tab })

  const tabContent: Record<string, React.ReactNode> = {
    dashboard: <DashboardTab />,
    projects: <ProjectsTab />,
    translations: <TranslationsTab />,
    settings: <SettingsTab />,
  }

  return (
    <AdminLayout activeTab={activeTab} setTab={setTab}>
      {tabContent[activeTab] || <DashboardTab />}
    </AdminLayout>
  )
}
