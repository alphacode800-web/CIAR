"use client"

import { AdminShell } from "@/components/admin-dashboard/admin-shell"

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
