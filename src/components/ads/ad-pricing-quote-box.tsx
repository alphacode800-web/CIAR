"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Receipt } from "lucide-react"
import type { AdQuote } from "@/lib/ad-pricing"
import type { AdProductDetails } from "@/lib/ad-product-details"

type AdPricingQuoteBoxProps = {
  details: AdProductDetails
  isAr: boolean
  onQuote?: (quote: AdQuote) => void
}

export function AdPricingQuoteBox({ details, isAr, onQuote }: AdPricingQuoteBoxProps) {
  const [loading, setLoading] = useState(true)
  const [quote, setQuote] = useState<AdQuote | null>(null)
  const onQuoteRef = useRef(onQuote)
  onQuoteRef.current = onQuote

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          durationDays: String(details.requestedDurationDays || 30),
          placement: details.requestedPlacement || "home_after_platforms",
          position: details.requestedPosition || "slot_1",
        })
        const res = await fetch(`/api/ads/pricing?${params.toString()}`, { signal: controller.signal })
        const data = await res.json()
        if (res.ok && data.quote) {
          setQuote(data.quote as AdQuote)
          onQuoteRef.current?.(data.quote as AdQuote)
        }
      } catch {
        // ignore abort/errors
      } finally {
        setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [details.requestedDurationDays, details.requestedPlacement, details.requestedPosition])

  return (
    <div className="rounded-xl border border-[oklch(0.76_0.19_48/25%)] bg-[oklch(0.76_0.19_48/8%)] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Receipt className="h-4 w-4 text-[oklch(0.76_0.19_48)]" />
        {isAr ? "مبلغ الإعلان" : "Ad fee"}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {isAr
          ? "السعر يُحسب تلقائياً حسب مدة الإعلان ومكان الظهور — لا يمكن للمُعلِن تعديله."
          : "Price is calculated from duration and placement — advertisers cannot edit it."}
      </p>
      <div className="mt-3 text-2xl font-bold text-[oklch(0.76_0.19_48)]">
        {loading ? (
          <span className="inline-flex items-center gap-2 text-base">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isAr ? "جاري حساب السعر..." : "Calculating..."}
          </span>
        ) : quote ? (
          `${quote.amount.toLocaleString()} ${quote.currency}`
        ) : (
          "—"
        )}
      </div>
      {quote && !loading ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          {isAr ? "يشمل" : "Includes"}: {quote.breakdown.base.toLocaleString()} {quote.currency}
          {quote.breakdown.placementSurcharge > 0
            ? ` + ${isAr ? "مكان" : "placement"} ${quote.breakdown.placementSurcharge.toLocaleString()}`
            : ""}
          {quote.breakdown.slotSurcharge > 0
            ? ` + ${isAr ? "موضع 2" : "slot 2"} ${quote.breakdown.slotSurcharge.toLocaleString()}`
            : ""}
        </p>
      ) : null}
    </div>
  )
}
