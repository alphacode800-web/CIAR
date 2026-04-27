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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">CIAR</p>
          <h1 className="text-2xl font-semibold mt-1">
            {locale === "ar" ? "تسجيل دخول الأدمن" : "Admin Login"}
          </h1>
        </div>

        <Input
          type="email"
          placeholder={locale === "ar" ? "البريد الإلكتروني" : "Email"}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={locale === "ar" ? "كلمة المرور" : "Password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? locale === "ar" ? "جاري تسجيل الدخول..." : "Signing in..."
            : locale === "ar" ? "دخول لوحة الأدمن" : "Enter Admin Dashboard"}
        </Button>
      </form>
    </div>
  )
}
