import { AdminGuard } from "@/components/admin-dashboard/admin-guard"

export default function AdminLayoutRoot({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>
}
