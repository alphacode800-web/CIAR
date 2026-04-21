"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Mail,
  MessageSquare,
  Send,
  MapPin,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

export function ContactSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill in all fields")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Message sent! We'll get back to you soon.")
        setForm({ name: "", email: "", subject: "", message: "" })
      } else {
        toast.error("Something went wrong. Please try again.")
      }
    } catch {
      toast.error("Failed to send message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" ref={ref} className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-600/5 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            Get in Touch
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Let&apos;s{" "}
            <span className="gradient-text">work together</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Have a question, partnership idea, or just want to say hello?
            We&apos;d love to hear from you.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6 lg:col-span-2"
          >
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Contact Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs text-muted-foreground">
                      hello@nexuslabs.dev
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium">Office</p>
                    <p className="text-xs text-muted-foreground">
                      San Francisco, CA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Response
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                We typically respond within 24 hours on business days. For
                urgent inquiries, please include &quot;URGENT&quot; in your
                subject line.
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-2xl border border-border/50 bg-card p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-medium">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs font-medium">
                  Subject
                </Label>
                <Input
                  id="subject"
                  placeholder="Partnership Inquiry"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  className="h-10 rounded-lg text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-medium">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your project or question..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="min-h-[120px] rounded-lg text-sm"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full gap-2 rounded-xl sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
