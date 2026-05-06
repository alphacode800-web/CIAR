"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

type AuthState = "loading" | "authorized" | "unauthorized"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [state, setState] = useState<AuthState>("loading")

  const isLoginRoute =
    pathname === "/admin/login" || (pathname?.startsWith("/admin/login/") ?? false)

  useEffect(() => {
    if (isLoginRoute) return

    const check = async () => {
      try {
        const token = localStorage.getItem("ciar_token")
        const res = await fetch("/api/auth/me", token ? {
          headers: { Authorization: `Bearer ${token}` },
        } : undefined)

        if (!res.ok) {
          setState("unauthorized")
          router.replace("/admin/login")
          return
        }

        const data = await res.json()
        const user = data?.data?.user ?? data?.user
        const role = String(user?.role ?? "").toLowerCase()
        if (!user || (role !== "admin" && role !== "seller")) {
          setState("unauthorized")
          router.replace("/admin/login")
          return
        }

        setState("authorized")
      } catch {
        setState("unauthorized")
        router.replace("/admin/login")
      }
    }

    void check()
  }, [router, isLoginRoute])

  if (isLoginRoute) {
    return <>{children}</>
  }

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="rounded-xl border border-border bg-card px-6 py-4 text-sm text-muted-foreground">
          Checking session...
        </div>
      </div>
    )
  }

  if (state === "unauthorized") return null
  return <>{children}</>
}

