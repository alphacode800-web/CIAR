import { AdminShell } from "@/components/admin-dashboard/admin-shell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}

