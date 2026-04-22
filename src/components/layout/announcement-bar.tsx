"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Megaphone } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"

const DISMISS_KEY = "ciar_banner_dismissed"
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000

interface BannerConfig {
  enabled: boolean
  text: string
  link: string
  type: "info" | "success" | "warning"
}

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    return Date.now() - Date.parse(raw) < DISMISS_DURATION_MS
  } catch { return false }
}

function setDismissed(): void {
  try { localStorage.setItem(DISMISS_KEY, new Date().toISOString()) } catch {}
}

export function AnnouncementBar() {
  const { dir } = useI18n()
  const [banner, setBanner] = useState<BannerConfig | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadBanner() {
      try {
        const res = await fetch("/api/settings")
        if (!res.ok || cancelled) return
        const data: Record<string, string> = await res.json()
        if (cancelled) return

        const enabled = data.banner_enabled === "true"
        const text = data.banner_text?.trim()
        const link = data.banner_link?.trim() || ""
        const type = (["info", "success", "warning"].includes(data.banner_type)
          ? data.banner_type : "info") as BannerConfig["type"]

        if (enabled && text && !isDismissed()) {
          setBanner({ enabled, text, link, type })
          setVisible(true)
        }
      } catch {}
    }
    loadBanner()
    return () => { cancelled = true }
  }, [])

  const handleDismiss = () => { setVisible(false); setDismissed() }

  if (!banner || !visible) return null

  const tickerText = `${banner.text}        •        ${banner.text}        •        ${banner.text}`

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          dir={dir}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="relative flex items-center overflow-hidden border-y border-border/10 bg-[oklch(0.14_0.025_265)]">
            {/* Side accent line */}
            <div className="absolute inset-y-0 start-0 w-px bg-gradient-to-b from-[oklch(0.78_0.14_82/10%)] to-transparent" />

            {/* Left badge */}
            <div className="flex items-center gap-2.5 px-4 sm:px-5 py-2.5 shrink-0 relative z-10 bg-foreground/[0.06] backdrop-blur-sm border-e border-border/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.78_0.14_82)]" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.78_0.14_82)]" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] font-[family-name:var(--font-geist-sans)] text-[oklch(0.78_0.14_82)]">
                {banner.type === "info" ? "NEWS" : banner.type === "success" ? "NEW" : "ALERT"}
              </span>
            </div>

            {/* Scrolling ticker */}
            <div className="flex-1 overflow-hidden py-2.5 relative">
              <div className="absolute inset-y-0 start-0 w-8 bg-gradient-to-e from-[oklch(0.14_0.025_265/80%)] to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 end-8 w-12 bg-gradient-to-s from-transparent to-[oklch(0.14_0.025_265/60%)] z-10 pointer-events-none" />

              {banner.link ? (
                <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                  <div className={cn("whitespace-nowrap", dir === "rtl" ? "animate-marquee-rtl" : "animate-marquee-ltr")}>
                    <span className="text-[13px] font-medium tracking-wide text-foreground/80">{tickerText}</span>
                  </div>
                </a>
              ) : (
                <div className={cn("whitespace-nowrap", dir === "rtl" ? "animate-marquee-rtl" : "animate-marquee-ltr")}>
                  <span className="text-[13px] font-medium tracking-wide text-foreground/80">{tickerText}</span>
                </div>
              )}
            </div>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="shrink-0 flex items-center justify-center z-10 px-3 py-2.5 transition-colors duration-200 hover:bg-foreground/[0.08]"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-foreground/80 transition-colors" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
