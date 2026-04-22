"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { Send, Mail, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterCTA() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setEmail("")
      }, 3000)
    }
  }

  return (
    <section ref={ref} className="relative py-20 sm:py-28">
      <div className="absolute inset-0 mesh-gradient opacity-40 pointer-events-none" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong rounded-3xl border border-[oklch(0.78_0.14_82/20%)] p-10 sm:p-14 text-center shadow-xl shadow-black/10 relative overflow-hidden animate-gold-glow"
        >
          {/* Floating orbs */}
          <div
            className="absolute -top-20 -start-20 h-48 w-48 rounded-full bg-[oklch(0.78_0.14_82/8%)] blur-[60px] pointer-events-none animate-float"
          />
          <div
            className="absolute -bottom-16 -end-16 h-40 w-40 rounded-full bg-[oklch(0.72_0.12_75/6%)] blur-[50px] pointer-events-none animate-float-delayed"
          />
          <div
            className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-[oklch(0.78_0.14_82/4%)] blur-[80px] pointer-events-none"
          />

          {/* Content */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-[oklch(0.78_0.14_82)]" />
                <span className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.78_0.14_82/70%)]">
                  {t("home.newsletter_badge") || "Newsletter"}
                </span>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight"
            >
              <span className="gradient-text">
                {t("home.newsletter_title") || "Stay Updated"}
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed"
            >
              {t("home.newsletter_subtitle") ||
                "Subscribe to our newsletter for the latest platform updates, features, and exclusive offers delivered to your inbox."}
            </motion.p>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
            >
              <div className="relative w-full">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="email"
                  placeholder={t("home.newsletter_placeholder") || "Enter your email address"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn(
                    "h-12 ps-10 rounded-xl bg-[oklch(0.78_0.14_82/5%)] border-[oklch(0.78_0.14_82/15%)]",
                    "placeholder:text-muted-foreground/50",
                    "focus:border-[oklch(0.78_0.14_82/40%)] focus:ring-[oklch(0.78_0.14_82/10%)]",
                    "text-foreground"
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={submitted}
                className={cn(
                  "w-full sm:w-auto h-12 rounded-xl gap-2 px-8 text-sm font-semibold flex-shrink-0",
                  submitted
                    ? "bg-[oklch(0.55_0.14_150)] text-white border-0"
                    : "btn-gold"
                )}
              >
                {submitted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {t("home.newsletter_subscribed") || "Subscribed!"}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t("home.newsletter_cta") || "Subscribe"}
                  </>
                )}
              </Button>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-4 text-xs text-muted-foreground/60"
            >
              {t("home.newsletter_privacy") || "No spam, ever. Unsubscribe at any time."}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
