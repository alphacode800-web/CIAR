"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminTabContentSuspended } from "@/components/admin/admin-tab-content"

export function AdminPanelFull({ activeTab }: { activeTab: string }) {
  const router = useRouter()
  const setTab = useCallback(
    (tab: string) => {
      router.push(`/admin/panel/${tab}`)
    },
    [router]
  )

  return (
    <AdminLayout activeTab={activeTab} setTab={setTab}>
      <AdminTabContentSuspended activeTab={activeTab} />
    </AdminLayout>
  )
}
