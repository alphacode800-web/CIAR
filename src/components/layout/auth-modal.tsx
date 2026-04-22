"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Lock, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useAuthModal } from "@/lib/auth-modal-context"
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"

interface AuthModalProps {
  mode: "login" | "register"
  onClose: () => void
}

export function AuthModal({ mode: initialMode, onClose }: AuthModalProps) {
  const { t } = useI18n()
  const { login, register } = useAuth()
  const { mode, openLogin, openRegister } = useAuthModal()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const isLogin = mode === "login"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let success = false
      if (isLogin) {
        success = await login(email, password)
        if (!success) toast.error(t("auth.login_failed") || "Invalid credentials")
      } else {
        if (!name.trim()) { toast.error(t("auth.name_required") || "Name is required"); setLoading(false); return }
        success = await register(name, email, password)
        if (!success) toast.error(t("auth.register_failed") || "Registration failed")
      }
      if (success) {
        toast.success(isLogin ? (t("auth.login_success") || "Welcome back!") : (t("auth.register_success") || "Account created!"))
        onClose()
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md glass-strong rounded-2xl border border-border/30 p-8"
        >
          <button onClick={onClose} className="absolute top-4 end-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="CIAR" className="h-10 w-10 object-contain" />
            <div>
              <h2 className="text-xl font-bold">{isLogin ? (t("auth.login") || "Login") : (t("auth.register") || "Register")}</h2>
              <p className="text-sm text-muted-foreground">
                {isLogin ? (t("auth.login_desc") || "Welcome back to CIAR") : (t("auth.register_desc") || "Create your account")}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label>{t("auth.name") || "Name"}</Label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="ps-10 rounded-xl" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("auth.email") || "Email"}</Label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="ps-10 rounded-xl" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("auth.password") || "Password"}</Label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="ps-10 rounded-xl" required />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full btn-gold rounded-xl h-11">
              {loading && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {isLogin ? (t("auth.login") || "Login") : (t("auth.register") || "Register")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? (
              <>{t("auth.no_account") || "Don't have an account?"}{" "}
                <button onClick={openRegister} className="text-[oklch(0.78_0.14_82)] hover:underline font-medium">{t("auth.register") || "Register"}</button></>
            ) : (
              <>{t("auth.has_account") || "Already have an account?"}{" "}
                <button onClick={openLogin} className="text-[oklch(0.78_0.14_82)] hover:underline font-medium">{t("auth.login") || "Login"}</button></>
            )}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
