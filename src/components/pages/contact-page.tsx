"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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

// ── Contact page component ──────────────────────────────────────────────────
export function ContactPage() {
  const { t, locale } = useI18n()
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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <Badge
          variant="secondary"
          className="px-4 py-1.5 text-sm mb-4 border border-border/50"
        >
          {t("contact.badge")}
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          {t("contact.title_1")}{" "}
          <span className="gradient-text">{t("contact.title_2")}</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("contact.subtitle")}
        </p>
      </motion.div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Info sidebar ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Contact info card */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="font-semibold mb-5">{t("contact.info_title")}</h2>
            <div className="space-y-5">
              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {t("contact.email_label")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("contact.email")}
                  </p>
                </div>
              </div>
              {/* Office */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {t("contact.office_label")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("contact.office")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Response time card */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  {t("contact.response_title")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("contact.response_text")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Contact form ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border/50 bg-card p-6 space-y-5"
          >
            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">{t("contact.name_label")}</Label>
                <Input
                  id="contact-name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder={t("contact.name_placeholder")}
                  required
                  className={cn(
                    "rounded-xl border-border/50",
                    errors.name && "border-destructive"
                  )}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">
                  {t("contact.email_label2")}
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder={t("contact.email_placeholder")}
                  required
                  className={cn(
                    "rounded-xl border-border/50",
                    errors.email && "border-destructive"
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="contact-subject">
                {t("contact.subject_label")}
              </Label>
              <Input
                id="contact-subject"
                value={form.subject}
                onChange={(e) => updateField("subject", e.target.value)}
                placeholder={t("contact.subject_placeholder")}
                required
                className={cn(
                  "rounded-xl border-border/50",
                  errors.subject && "border-destructive"
                )}
              />
              {errors.subject && (
                <p className="text-xs text-destructive">{errors.subject}</p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="contact-message">
                {t("contact.message_label")}
              </Label>
              <Textarea
                id="contact-message"
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                placeholder={t("contact.message_placeholder")}
                required
                rows={6}
                className={cn(
                  "rounded-xl border-border/50 resize-none",
                  errors.message && "border-destructive"
                )}
              />
              {errors.message && (
                <p className="text-xs text-destructive">{errors.message}</p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={sending}
              className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl py-5"
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
        </motion.div>
      </div>
    </div>
  )
}
