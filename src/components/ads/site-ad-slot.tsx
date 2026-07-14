"use client"

import { useEffect, useState } from "react"
import type { AdPlacement, AdPosition, SiteAdRecord } from "@/lib/site-ads"
import { SiteAdBanner } from "@/components/ads/site-ad-banner"

export function SiteAdSlot({
  placement,
  position = "slot_1",
  locale = "ar",
  className = "",
}: {
  placement: AdPlacement
  position?: AdPosition
  locale?: string
  className?: string
}) {
  const [ads, setAds] = useState<SiteAdRecord[]>([])

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({ placement, position, locale })
        const res = await fetch(`/api/ads/active?${params}`)
        const data = await res.json()
        setAds(Array.isArray(data.ads) ? data.ads : [])
      } catch {
        setAds([])
      }
    }
    load()
  }, [placement, position, locale])

  if (ads.length === 0) return null

  return (
    <div className={className}>
      {ads.slice(0, 1).map((ad) => (
        <SiteAdBanner key={ad.id} ad={ad} />
      ))}
    </div>
  )
}
