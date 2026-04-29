"use client"

import { FormEvent, useState } from "react"
import { ArrowLeft, KeyRound, Mail, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "@/lib/router-context"
import { useI18n } from "@/lib/i18n-context"

export function UserAuthPage() {
  const { locale } = useI18n()
  const { login, register } = useAuth()
  const { navigate } = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [identifier, setIdentifier] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const isLogin = mode === "login"

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (isLogin) {
        const ok = await login(identifier, password)
        if (!ok) {
          setError(locale === "ar" ? "بيانات الدخول غير صحيحة" : "Invalid credentials")
          return
        }
      } else {
        if (!email.trim() && !phone.trim()) {
          setError(locale === "ar" ? "أدخل البريد أو رقم الهاتف" : "Provide email or phone number")
          return
        }
        const ok = await register(name, password, email || undefined, phone || undefined)
        if (!ok) {
          setError(locale === "ar" ? "فشل إنشاء الحساب" : "Registration failed")
          return
        }
      }
      navigate({ page: "home" })
    } catch {
      setError(locale === "ar" ? "حدث خطأ غير متوقع" : "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 text-foreground flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-card/95 shadow-xl backdrop-blur p-6 sm:p-7 space-y-5"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate({ page: "home" })}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {locale === "ar" ? "العودة للرئيسية" : "Back to home"}
          </button>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">CIAR</p>
        </div>

        <div>
          <div className="rounded-xl border border-border/60 bg-muted/30 p-1 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => {
                setMode("login")
                setError("")
              }}
              className={`rounded-lg py-2 text-sm transition-colors ${isLogin ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {locale === "ar" ? "تسجيل الدخول" : "Login"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register")
                setError("")
              }}
              className={`rounded-lg py-2 text-sm transition-colors ${!isLogin ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {locale === "ar" ? "إنشاء حساب" : "Register"}
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">CIAR</p>
          <h1 className="text-2xl font-semibold mt-1">
            {isLogin
              ? (locale === "ar" ? "تسجيل دخول المستخدم" : "User Login")
              : (locale === "ar" ? "إنشاء حساب مستخدم" : "Create User Account")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLogin
              ? (locale === "ar" ? "سجل الدخول بالبريد الإلكتروني أو رقم الهاتف." : "Sign in with email or phone number.")
              : (locale === "ar" ? "يمكنك التسجيل برقم الهاتف أو البريد الإلكتروني." : "You can register using phone number or email.")}
          </p>
        </div>

        {!isLogin && (
          <div className="space-y-2">
            <label htmlFor="user-name" className="text-sm font-medium">
              {locale === "ar" ? "الاسم الكامل" : "Full Name"}
            </label>
            <div className="relative">
              <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="user-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
                className="ps-9"
              />
            </div>
          </div>
        )}

        {isLogin ? (
          <div className="space-y-2">
            <label htmlFor="user-identifier" className="text-sm font-medium">
              {locale === "ar" ? "البريد الإلكتروني أو الهاتف" : "Email or Phone"}
            </label>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="user-identifier"
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="you@example.com or +9665..."
                required
                autoComplete="username"
                className="ps-9"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <label htmlFor="user-email" className="text-sm font-medium">
                {locale === "ar" ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className="ps-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="user-phone" className="text-sm font-medium">
                {locale === "ar" ? "رقم الهاتف (اختياري)" : "Phone Number (optional)"}
              </label>
              <div className="relative">
                <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="user-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+9665..."
                  autoComplete="tel"
                  className="ps-9"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="user-password" className="text-sm font-medium">
            {locale === "ar" ? "كلمة المرور" : "Password"}
          </label>
          <div className="relative">
            <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="ps-9"
            />
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
          {loading
            ? (locale === "ar" ? "جاري التنفيذ..." : "Please wait...")
            : isLogin
              ? (locale === "ar" ? "تسجيل الدخول" : "Login")
              : (locale === "ar" ? "إنشاء الحساب" : "Create account")}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {isLogin
            ? (locale === "ar" ? "استخدم بريدك الإلكتروني أو رقم هاتفك للدخول." : "Use your email or phone number to sign in.")
            : (locale === "ar" ? "أضف بريدًا أو رقم هاتف واحدًا على الأقل." : "Add at least one contact method: email or phone.")}
        </p>
      </form>
    </div>
  )
}
