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
  ariaHidden,
}: {
  items: string[]
  separatorColor: string
  ariaHidden?: boolean
}) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden || undefined}>
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="inline-flex shrink-0 items-center">
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
  dir = "rtl",
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

  return (
    <div
      dir={dir}
      className={cn("relative w-full", preview ? "overflow-hidden rounded-xl shadow-lg" : "", className)}
      style={{
        minHeight: `${style.stripHeight}px`,
        background: getNewsTickerBackground(style),
        borderTop: preview ? undefined : "1px solid rgba(255,255,255,0.08)",
        borderBottom: preview ? undefined : "1px solid rgba(0,0,0,0.12)",
      }}
      aria-label={locale === "ar" ? "الشريط الإخباري" : "News ticker"}
    >
      <div className="mx-auto flex h-full min-h-[inherit] max-w-7xl items-stretch">
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

        <div className="relative min-w-0 flex-1 overflow-hidden py-1" dir="ltr">
          <div
            className="news-ticker-track news-ticker-track-ltr"
            style={{
              ["--ticker-duration" as string]: `${style.scrollDuration}s`,
              color: style.textColor,
              fontFamily: fontStack,
              fontSize: `${style.fontSize}px`,
              fontWeight: style.fontWeight,
              letterSpacing: "0.02em",
            }}
          >
            <TickerSegment items={segmentItems} separatorColor={style.separatorColor} />
            <TickerSegment items={segmentItems} separatorColor={style.separatorColor} ariaHidden />
          </div>
        </div>
      </div>
    </div>
  )
}
