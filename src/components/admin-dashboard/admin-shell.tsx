"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminGuard } from "@/components/admin-dashboard/admin-guard"

const links = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem("ciar_token")
    router.replace("/admin/login")
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <aside className="rounded-2xl border border-border bg-card p-4 h-fit sticky top-6">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">JOMAA STORE</p>
                <h1 className="text-lg font-semibold mt-1">Admin Dashboard</h1>
              </div>

              <nav className="space-y-1">
                {links.map((link) => {
                  const Icon = link.icon
                  const active = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              <Button className="mt-6 w-full" variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 me-2" />
                Logout
              </Button>
            </aside>

            <main className="rounded-2xl border border-border bg-card p-4 md:p-6">{children}</main>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}

