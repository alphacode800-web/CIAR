"use client"

import { useState } from "react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Mail, MapPin, Clock, Send } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ── Client-side Zod validation schema ───────────────────────────────────────
const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(10),
})

type ContactForm = z.infer<typeof contactFormSchema>

interface FieldErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

// ── Animated section wrapper using useInView ────────────────────────────────
function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Contact info card component ─────────────────────────────────────────────
function InfoCard({
  icon: Icon,
  label,
  value,
  className,
  children,
}: {
  icon: React.ElementType
  label: string
  value: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 glass-subtle p-5 transition-all duration-300",
        "hover:border-[oklch(0.78_0.14_82/20%)] hover:shadow-[0_0_24px_oklch(0.78_0.14_82/6%)]",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.12_75/10%)] flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-[oklch(0.82_0.145_85)]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{value}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Contact page component ──────────────────────────────────────────────────
export function ContactPage() {
  const { t, locale, dir } = useI18n()
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<FieldErrors>({})

  const updateField = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validateForm = (): boolean => {
    const result = contactFormSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: FieldErrors = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof FieldErrors
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = t("contact.validation_error")
        }
      }
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSending(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(t("contact.success"))
        setForm({ name: "", email: "", subject: "", message: "" })
      } else {
        toast.error(data.error || t("contact.error"))
      }
    } catch {
      toast.error(t("contact.error"))
    } finally {
      setSending(false)
    }
  }

  const inputClasses = (field: keyof FieldErrors) =>
    cn(
      "rounded-xl border-border/50 glass-subtle bg-background/60",
      "focus:ring-[oklch(0.78_0.14_82/30%)] focus:border-[oklch(0.78_0.14_82/40%)]",
      "placeholder:text-muted-foreground/60",
      "transition-all duration-200",
      errors[field] && "border-destructive focus:ring-destructive/30 focus:border-destructive/50"
    )

  return (
    <div dir={dir} className="relative overflow-hidden">
      {/* ── Hero Header ───────────────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 pointer-events-none">
          <img src="/images/headers/contact-header.png" alt="" className="w-full h-full object-cover opacity-40 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>
        {/* Gradient mesh background */}
        <div className="absolute inset-0 mesh-gradient" />
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 dot-pattern" />
        {/* Noise overlay wrapper */}
        <div className="noise-overlay absolute inset-0" />

        {/* Floating gradient orbs */}
        <div
          className={cn(
            "absolute top-20 -start-32 h-[350px] w-[350px] rounded-full blur-3xl animate-float",
            "bg-gradient-to-br from-[oklch(0.78_0.14_82/15%)] to-[oklch(0.72_0.12_75/10%)]"
          )}
        />
        <div
          className={cn(
            "absolute bottom-10 -end-32 h-[300px] w-[300px] rounded-full blur-3xl animate-float-delayed",
            "bg-gradient-to-br from-[oklch(0.55_0.15_280/10%)] to-[oklch(0.65_0.2_330/5%)]"
          )}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm mb-6 glass-subtle border border-border/50"
            >
              {t("contact.badge")}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t("contact.title_1")}{" "}
              <span className="gradient-text">{t("contact.title_2")}</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("contact.subtitle")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        {/* Background effects */}
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div
          className={cn(
            "absolute top-0 start-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full blur-3xl pointer-events-none",
            "bg-gradient-to-br from-[oklch(0.78_0.14_82/8%)] to-[oklch(0.72_0.12_75/5%)]"
          )}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Info Column (left) ─────────────────────────────────────────── */}
          <AnimatedSection delay={0.1} className="lg:col-span-2 space-y-5">
            <div className="space-y-5">
              {/* Email card */}
              <InfoCard
                icon={Mail}
                label={t("contact.email_label")}
                value={t("contact.email")}
              />

              {/* Office card */}
              <InfoCard
                icon={MapPin}
                label={t("contact.office_label")}
                value={t("contact.office")}
              />

              {/* Response time card */}
              <InfoCard
                icon={Clock}
                label={t("contact.response_title")}
                value={t("contact.response_text")}
              >
                {/* Pulsing gold dot indicator */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[oklch(0.82_0.145_85)] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[oklch(0.78_0.14_82)]" />
                  </span>
                  <span className="text-xs text-[oklch(0.78_0.14_82)] font-medium">
                    {t("contact.response_active")}
                  </span>
                </div>
              </InfoCard>
            </div>
          </AnimatedSection>

          {/* ── Form Column (right) ────────────────────────────────────────── */}
          <AnimatedSection delay={0.2} className="lg:col-span-3">
            <div className="rounded-2xl border border-border/50 glass-strong p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name" className="text-sm font-medium">
                      {t("contact.name_label")}
                    </Label>
                    <Input
                      id="contact-name"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder={t("contact.name_placeholder")}
                      required
                      className={inputClasses("name")}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1.5">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="text-sm font-medium">
                      {t("contact.email_label2")}
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder={t("contact.email_placeholder")}
                      required
                      className={inputClasses("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1.5">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="contact-subject" className="text-sm font-medium">
                    {t("contact.subject_label")}
                  </Label>
                  <Input
                    id="contact-subject"
                    value={form.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    placeholder={t("contact.subject_placeholder")}
                    required
                    className={inputClasses("subject")}
                  />
                  {errors.subject && (
                    <p className="text-xs text-destructive mt-1.5">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="text-sm font-medium">
                    {t("contact.message_label")}
                  </Label>
                  <Textarea
                    id="contact-message"
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    placeholder={t("contact.message_placeholder")}
                    required
                    rows={6}
                    className={cn(inputClasses("message"), "resize-none")}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive mt-1.5">{errors.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={sending}
                  className={cn(
                    "w-full gap-2 bg-gradient-to-r from-[oklch(0.78_0.14_82)] to-[oklch(0.72_0.13_75)]",
                    "hover:from-[oklch(0.72_0.13_75)] hover:to-[oklch(0.65_0.12_75)]",
                    "text-white rounded-xl py-5 text-sm font-medium",
                    "transition-all duration-300 btn-glow"
                  )}
                >
                  {sending ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("contact.sending")}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t("contact.send")}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
