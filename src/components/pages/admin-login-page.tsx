"use client"

import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "@/lib/router-context"
import { useI18n } from "@/lib/i18n-context"

export function AdminLoginPage() {
  const { locale } = useI18n()
  const { login, user } = useAuth()
  const { navigate } = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (String(user?.role || "").toUpperCase() === "ADMIN") {
      navigate({ page: "admin", tab: "dashboard" })
    }
  }, [user, navigate])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const ok = await login(email, password)
      if (!ok) {
        setError(locale === "ar" ? "بيانات الدخول غير صحيحة" : "Invalid credentials")
        return
      }
      const token = localStorage.getItem("ciar_token")
      const meRes = await fetch("/api/auth/me", token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      const meData = meRes.ok ? await meRes.json() : {}
      const role = String(meData?.data?.user?.role || meData?.user?.role || user?.role || "")
      if (role.toUpperCase() !== "ADMIN") {
        setError(locale === "ar" ? "هذا الحساب ليس حساب أدمن" : "This account is not an admin account")
        return
      }
      navigate({ page: "admin", tab: "dashboard" })
    } catch {
      setError(locale === "ar" ? "حدث خطأ أثناء تسجيل الدخول" : "Something went wrong while signing in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 text-foreground flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur p-6 sm:p-7 space-y-5"
      >
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">CIAR</p>
          <h1 className="text-2xl font-semibold mt-1">
            {locale === "ar" ? "تسجيل دخول الأدمن" : "Admin Login"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "ar"
              ? "استخدم بيانات حساب الأدمن للدخول إلى لوحة التحكم."
              : "Use admin account credentials to access the dashboard."}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="admin-user" className="text-sm font-medium">
            {locale === "ar" ? "يوزر الأدمن" : "Admin Username"}
          </label>
          <Input
            id="admin-user"
            type="text"
            placeholder={locale === "ar" ? "أدخل يوزر الأدمن" : "Enter admin username"}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="admin-password" className="text-sm font-medium">
            {locale === "ar" ? "باسوورد الأدمن" : "Admin Password"}
          </label>
          <Input
            id="admin-password"
            type="password"
            placeholder={locale === "ar" ? "أدخل باسوورد الأدمن" : "Enter admin password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error ? (
          <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
          {loading
            ? locale === "ar" ? "جاري تسجيل الدخول..." : "Signing in..."
            : locale === "ar" ? "دخول لوحة الأدمن" : "Enter Admin Dashboard"}
        </Button>
      </form>
    </div>
  )
}
