"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  DEFAULT_NEWS_TICKER_ITEMS_AR,
  DEFAULT_NEWS_TICKER_STYLE,
  getNewsTickerBackground,
  getNewsTickerFontStack,
  type NewsTickerStyle,
} from "@/lib/news-ticker"
import { cn } from "@/lib/utils"

type NewsTickerStripProps = {
  items: string[]
  style?: NewsTickerStyle
  locale?: "ar" | "en"
  dir?: "rtl" | "ltr"
  className?: string
  preview?: boolean
}

export function NewsTickerStrip({
  items,
  style = DEFAULT_NEWS_TICKER_STYLE,
  locale = "ar",
  dir = "rtl",
  className,
  preview = false,
}: NewsTickerStripProps) {
  const tickerItems = useMemo(() => {
    const cleaned = items.map((item) => item.trim()).filter(Boolean)
    return cleaned.length > 0 ? cleaned : DEFAULT_NEWS_TICKER_ITEMS_AR
  }, [items])

  const loopItems = useMemo(() => [...tickerItems, ...tickerItems], [tickerItems])
  const badgeLabel = locale === "ar" ? style.badgeLabelAr : style.badgeLabelEn
  const fontStack = getNewsTickerFontStack(style.fontFamily)

  return (
    <div
      dir={dir}
      className={cn("relative w-full overflow-hidden", preview ? "rounded-xl shadow-lg" : "", className)}
      style={{
        minHeight: `${style.stripHeight}px`,
        background: getNewsTickerBackground(style),
        borderTop: preview ? undefined : "1px solid rgba(255,255,255,0.08)",
        borderBottom: preview ? undefined : "1px solid rgba(0,0,0,0.12)",
      }}
      aria-label={locale === "ar" ? "الشريط الإخباري" : "News ticker"}
    >
      <div className="mx-auto flex h-full min-h-[inherit] max-w-7xl items-center">
        <div
          className="shrink-0 px-3 py-2.5 sm:px-4"
          style={{
            background: style.badgeBackgroundColor,
            color: style.badgeTextColor,
            fontWeight: 800,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          <span
            className="text-[10px] uppercase tracking-[0.16em] sm:text-[11px]"
            style={{ fontFamily: fontStack }}
          >
            {badgeLabel}
          </span>
        </div>

        <div className="relative flex-1 overflow-hidden py-2.5">
          <motion.div
            className="flex w-max whitespace-nowrap"
            style={{
              color: style.textColor,
              fontFamily: fontStack,
              fontSize: `${style.fontSize}px`,
              fontWeight: style.fontWeight,
              letterSpacing: "0.02em",
            }}
            animate={{ x: dir === "rtl" ? ["-50%", "0%"] : ["0%", "-50%"] }}
            transition={{ duration: style.scrollDuration, repeat: Infinity, ease: "linear" }}
          >
            {loopItems.map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-4 px-6 sm:px-8">
                <span>{item}</span>
                <span style={{ color: style.separatorColor }}>•</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
