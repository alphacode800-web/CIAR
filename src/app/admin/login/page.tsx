"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AdminLoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const defaultAdminUser = "admin@jomaa.store"
  const defaultAdminPassword = "Password@123"
  const hasValues = useMemo(() => identifier.trim().length > 0 && password.trim().length > 0, [identifier, password])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error?.message ?? data?.error ?? "Invalid credentials")
        return
      }
      const payload = data?.data ?? data
      if (payload?.token) localStorage.setItem("ciar_token", payload.token)
      const role = String(payload?.user?.role || "").toUpperCase()
      if (role !== "ADMIN") {
        setError("This account is not allowed to access admin dashboard.")
        localStorage.removeItem("ciar_token")
        return
      }
      router.replace("/admin/dashboard")
    } catch {
      setError("Something went wrong. Try again.")
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
          <h1 className="text-2xl font-semibold mt-1">تسجيل دخول الأدمن</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            استخدم بيانات حساب الأدمن للدخول إلى لوحة التحكم.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm space-y-1">
          <p className="font-medium">بيانات تسجيل الأدمن:</p>
          <p>
            <span className="text-muted-foreground">يوزر:</span> {defaultAdminUser}
          </p>
          <p>
            <span className="text-muted-foreground">الباسوورد:</span> {defaultAdminPassword}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="admin-user" className="text-sm font-medium">
            يوزر الأدمن
          </label>
          <Input
            id="admin-user"
            type="text"
            placeholder="أدخل يوزر الأدمن"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="admin-password" className="text-sm font-medium">
            باسوورد الأدمن
          </label>
          <Input
            id="admin-password"
            type="password"
            placeholder="أدخل باسوورد الأدمن"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error ? <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p> : null}

        <Button type="submit" className="w-full h-11 text-base" disabled={loading || !hasValues}>
          {loading ? "جاري تسجيل الدخول..." : "دخول لوحة الأدمن"}
        </Button>
      </form>
    </div>
  )
}

