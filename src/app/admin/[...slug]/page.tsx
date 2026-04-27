import { redirect } from "next/navigation"

export default function AdminCatchAllRedirectPage() {
  redirect("/admin/dashboard")
}
