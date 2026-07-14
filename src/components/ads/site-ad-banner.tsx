"use client"

import { ExternalLink, Megaphone } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { isDefaultSiteAd } from "@/lib/default-site-ads"
import type { SiteAdRecord } from "@/lib/site-ads"
import { cn } from "@/lib/utils"
import { AdProductDetailsCard } from "@/components/ads/ad-product-details-card"

export function SiteAdBanner({
  ad,
  className = "",
  compact = false,
}: {
  ad: SiteAdRecord
  className?: string
  compact?: boolean
}) {
  const { locale } = useI18n()
  const isAr = locale === "ar"
  const isDefault = isDefaultSiteAd(ad)

  const content = (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[oklch(0.76_0.19_48/18%)] bg-gradient-to-r from-[oklch(0.76_0.19_48/8%)] to-transparent p-4 sm:p-5",
        compact ? "p-3" : "p-4 sm:p-5",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.76_0.19_48)]">
        <Megaphone className="h-3.5 w-3.5" />
        {isAr ? "إعلان" : "Sponsored"}
        {isDefault ? (
          <span className="rounded-full bg-slate-500/15 px-2 py-0.5 text-[9px] font-bold normal-case text-slate-500 dark:text-slate-300">
            {isAr ? "افتراضي" : "Default"}
          </span>
        ) : null}
      </div>
      <div className={cn("flex gap-4", ad.imageUrl ? "items-center" : "items-start")}>
        {ad.imageUrl ? (
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:h-24 sm:w-36">
            <img src={ad.imageUrl} alt={ad.title} className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{ad.companyName}</p>
          <h3 className={cn("font-bold text-foreground", compact ? "text-sm" : "text-base sm:text-lg")}>{ad.title}</h3>
          {!compact ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ad.description}</p>
          ) : null}
          <AdProductDetailsCard details={ad.productDetails} isAr={isAr} compact />
          {ad.link ? (
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[oklch(0.76_0.19_48)]">
              {isAr ? "اعرف المزيد" : "Learn more"}
              <ExternalLink className="h-3 w-3" />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )

  if (ad.link) {
    const isExternal = /^https?:\/\//i.test(ad.link)
    return (
      <a
        href={ad.link}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="block transition hover:opacity-95"
      >
        {content}
      </a>
    )
  }

  return content
}
