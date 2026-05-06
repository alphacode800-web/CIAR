"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, LayoutGrid, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminGuard } from "@/components/admin-dashboard/admin-guard"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"

const links = [
  { href: "/admin/panel/overview", label: "اللوحة الكاملة — 15 قسمًا", icon: LayoutDashboard },
  { href: "/admin/super-platform", label: "إعداد المنصات الفائقة", icon: LayoutGrid },
] as const

function linkActive(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === "/admin/panel/overview") return pathname.startsWith("/admin/panel")
  return pathname === href || pathname.startsWith(`${href}/`)
}

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
        className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_90%_70%_at_100%_0%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(ellipse_85%_65%_at_0%_100%,rgba(234,88,12,0.16),transparent_52%),linear-gradient(165deg,#f8fbff_0%,#ecf3ff_46%,#fff4eb_100%)] text-[#0f172a]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.28] bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2272%22 height=%2272%22 viewBox=%220 0 72 72%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.42%22%3E%3Ccircle cx=%2236%22 cy=%2236%22 r=%221.2%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"
        />
        <div className="relative mx-auto w-full max-w-[1700px] px-4 py-7 md:px-10 md:py-9">
          <div className="grid gap-7 lg:grid-cols-[280px_1fr]">
            <aside className="sticky top-7 h-fit rounded-[1.35rem] border border-[#d8e6fb] bg-white/65 p-5 shadow-[0_24px_70px_-28px_rgba(37,99,235,0.28),0_0_0_1px_rgba(255,255,255,0.7)_inset] backdrop-blur-2xl ring-1 ring-[#93c5fd]/25">
              <div className="mb-6 overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#ea580c] p-[1px] shadow-[0_18px_50px_-20px_rgba(37,99,235,0.55)]">
                <div className="rounded-[0.9rem] bg-gradient-to-br from-[#1e40af]/95 via-[#1d4ed8]/95 to-[#9a3412]/92 px-4 py-4 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#bfdbfe]">CIAR</p>
                  <h1 className="mt-1.5 text-lg font-bold tracking-tight text-white drop-shadow-sm">لوحة التحكم</h1>
                  <p className="mt-1 text-[11px] text-blue-100/80">تجربة إدارية حديثة</p>
                </div>
              </div>

              <nav className="space-y-1.5">
                {links.map((link) => {
                  const Icon = link.icon
                  const active = linkActive(pathname, link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition-all duration-200 ${
                        active
                          ? "border border-[#93c5fd]/70 bg-gradient-to-l from-[#dbeafe]/95 to-[#ffedd5]/95 font-semibold text-[#0f172a] shadow-[0_12px_26px_-14px_rgba(37,99,235,0.38)] ring-1 ring-white/70"
                          : "border border-transparent text-[#334155] hover:border-[#bfdbfe] hover:bg-white/70 hover:text-[#0f172a] hover:shadow-md"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          active
                            ? "bg-[#2563eb]/14 text-[#1d4ed8]"
                            : "bg-white/60 text-[#2563eb] group-hover:bg-white/90"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="leading-snug">{link.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <Button
                className="mt-7 w-full rounded-xl border border-[#93c5fd]/50 bg-white/70 py-5 text-[#0f172a] shadow-sm backdrop-blur-sm hover:bg-white hover:shadow-md"
                variant="outline"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 me-2" />
                تسجيل الخروج
              </Button>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-[#dbeafe] bg-white/65 px-3.5 py-2.5 shadow-sm backdrop-blur-sm">
                <span className="text-sm font-medium text-[#334155]">تغيير الثيم</span>
                <ThemeSwitcher />
              </div>
            </aside>

            <main className="rounded-[1.35rem] border border-[#d8e6fb] bg-white/68 p-6 shadow-[0_28px_80px_-32px_rgba(37,99,235,0.2),0_0_0_1px_rgba(255,255,255,0.52)_inset] backdrop-blur-2xl ring-1 ring-[#93c5fd]/18 md:p-9">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}

