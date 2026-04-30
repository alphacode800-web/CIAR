"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminGuard } from "@/components/admin-dashboard/admin-guard"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"

const links = [
  { href: "/admin/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/media", label: "البنرات والصور", icon: ImageIcon },
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
      <div
        dir="rtl"
        className="min-h-screen bg-gradient-to-br from-[#f5eddc] via-[#efe1c5] to-[#f3e8cf] text-[#1e3a5f]"
      >
        <div className="mx-auto w-full max-w-[1700px] px-4 py-6 md:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <aside className="sticky top-6 h-fit rounded-3xl border border-white/45 bg-white/35 p-5 shadow-xl shadow-[#5a3a2a]/10 backdrop-blur-xl">
              <div className="mb-6 rounded-2xl border border-white/40 bg-gradient-to-r from-[#6f1d1b] to-[#8b5e34] p-4 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-white/80">JOMAA STORE</p>
                <h1 className="mt-1 text-lg font-semibold">لوحة التحكم</h1>
              </div>

              <nav className="space-y-1">
                {links.map((link) => {
                  const Icon = link.icon
                  const active = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                        active
                          ? "bg-gradient-to-r from-[#d7c0a1]/70 to-[#c7ab84]/70 font-medium text-[#6f1d1b]"
                          : "text-[#334155] hover:bg-white/40 hover:text-[#1e3a5f]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              <Button
                className="mt-6 w-full border-white/50 bg-white/45 text-[#1e3a5f] hover:bg-white/65 hover:text-[#1e3a5f]"
                variant="outline"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 me-2" />
                تسجيل الخروج
              </Button>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/45 bg-white/35 px-3 py-2">
                <span className="text-sm font-medium text-[#475569]">تغيير الثيم</span>
                <ThemeSwitcher />
              </div>
            </aside>

            <main className="rounded-3xl border border-white/50 bg-white/40 p-5 shadow-xl shadow-[#5a3a2a]/10 backdrop-blur-xl md:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}

