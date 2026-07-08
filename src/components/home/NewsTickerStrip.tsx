"use client"

import { useMemo } from "react"
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

function TickerSegment({
  items,
  separatorColor,
  locale,
  ariaHidden,
}: {
  items: string[]
  separatorColor: string
  locale: "ar" | "en"
  ariaHidden?: boolean
}) {
  const textDir = locale === "ar" ? "rtl" : "ltr"

  return (
    <div className="flex shrink-0 items-center" dir={textDir} aria-hidden={ariaHidden || undefined}>
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="inline-flex shrink-0 items-center whitespace-nowrap">
          <span className="px-4 sm:px-5">{item}</span>
          <span style={{ color: separatorColor }} aria-hidden>
            •
          </span>
        </span>
      ))}
    </div>
  )
}

export function NewsTickerStrip({
  items,
  style = DEFAULT_NEWS_TICKER_STYLE,
  locale = "ar",
  className,
  preview = false,
}: NewsTickerStripProps) {
  const tickerItems = useMemo(() => {
    const cleaned = items.map((item) => item.trim()).filter(Boolean)
    return cleaned.length > 0 ? cleaned : DEFAULT_NEWS_TICKER_ITEMS_AR
  }, [items])

  // Repeat items within each segment so wide screens stay filled without gaps.
  const segmentItems = useMemo(
    () => Array.from({ length: 2 }, () => tickerItems).flat(),
    [tickerItems]
  )

  const badgeLabel = locale === "ar" ? style.badgeLabelAr : style.badgeLabelEn
  const fontStack = getNewsTickerFontStack(style.fontFamily)
  const isArabic = locale === "ar"
  const trackClass = isArabic ? "news-ticker-track-rtl" : "news-ticker-track-ltr"

  return (
    <div
      dir="ltr"
      className={cn("relative w-full", preview ? "overflow-hidden rounded-xl shadow-lg" : "", className)}
      style={{
        minHeight: `${style.stripHeight}px`,
        background: getNewsTickerBackground(style),
        borderTop: preview ? undefined : "1px solid rgba(255,255,255,0.08)",
        borderBottom: preview ? undefined : "1px solid rgba(0,0,0,0.12)",
      }}
      aria-label={locale === "ar" ? "الشريط الإخباري" : "News ticker"}
    >
      <div
        className={cn(
          "mx-auto flex h-full min-h-[inherit] max-w-7xl items-stretch",
          isArabic && "flex-row-reverse"
        )}
      >
        <div
          className="relative z-10 flex shrink-0 items-center px-2.5 py-1 sm:px-3"
          style={{
            background: style.badgeBackgroundColor,
            color: style.badgeTextColor,
            fontWeight: 800,
            boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
          }}
        >
          <span
            className="text-[9px] uppercase tracking-[0.14em] sm:text-[10px]"
            style={{ fontFamily: fontStack }}
          >
            {badgeLabel}
          </span>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden py-1">
          <div
            className={cn("news-ticker-track", trackClass)}
            style={{
              ["--ticker-duration" as string]: `${style.scrollDuration}s`,
              color: style.textColor,
              fontFamily: fontStack,
              fontSize: `${style.fontSize}px`,
              fontWeight: style.fontWeight,
              letterSpacing: "0.02em",
            }}
          >
            <TickerSegment items={segmentItems} separatorColor={style.separatorColor} locale={locale} />
            <TickerSegment items={segmentItems} separatorColor={style.separatorColor} locale={locale} ariaHidden />
          </div>
        </div>
      </div>
    </div>
  )
}
