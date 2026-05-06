import { redirect } from "next/navigation"
import { AdminPanelFull } from "@/components/admin-dashboard/admin-panel-full"
import { ADMIN_PANEL_TAB_IDS, isAdminPanelTabId } from "@/lib/admin-panel-tab-ids"

export function generateStaticParams() {
  return ADMIN_PANEL_TAB_IDS.map((tab) => ({ tab }))
}

export default async function AdminPanelTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params
  if (!isAdminPanelTabId(tab)) {
    redirect("/admin/panel/overview")
  }
  return <AdminPanelFull activeTab={tab} />
}
