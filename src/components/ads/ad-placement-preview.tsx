"use client"

import {
  AD_DURATION_OPTIONS,
  AD_PLACEMENT_META,
  AD_PLACEMENTS,
  AD_POSITION_META,
  getPlacementLabel,
  getPositionLabel,
  type AdPlacement,
  type AdPosition,
  type SiteAdRecord,
} from "@/lib/site-ads"
import { SiteAdBanner } from "@/components/ads/site-ad-banner"
import { cn } from "@/lib/utils"

export function AdPlacementPreview({
  placement,
  position,
  previewAd,
  locale = "ar",
}: {
  placement: AdPlacement
  position: AdPosition
  previewAd: SiteAdRecord
  locale?: "ar" | "en"
}) {
  const hint = AD_PLACEMENT_META[placement].previewHintAr

  const block = (label: string, active = false, children?: React.ReactNode) => (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-center text-[10px] font-medium",
        active
          ? "border-[oklch(0.76_0.19_48)] bg-[oklch(0.76_0.19_48/10%)] text-[oklch(0.76_0.19_48)]"
          : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
      )}
    >
      {children || label}
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-dashed border-[oklch(0.76_0.19_48/25%)] bg-white/60 p-4 dark:bg-[oklch(0.12_0.03_265/40%)]">
        <p className="mb-3 text-xs font-semibold text-foreground">
          {locale === "ar" ? "معاينة موضع الإعلان" : "Ad placement preview"}
        </p>

        {placement === "home_after_platforms" || placement === "home_before_why" ? (
          <div className="space-y-2">
            {block(locale === "ar" ? "هيدر الصفحة الرئيسية" : "Home hero")}
            {block(locale === "ar" ? "بطاقات المنصات" : "Platform cards")}
            {placement === "home_after_platforms" ? (
              <div className="space-y-1">
                {block(
                  `${getPositionLabel(position, locale)} · ${getPlacementLabel(placement, locale)}`,
                  true,
                  <SiteAdBanner ad={previewAd} compact />
                )}
              </div>
            ) : (
              block(locale === "ar" ? "التوصيات الذكية" : "Smart recommendations")
            )}
            {placement === "home_before_why" ? (
              <div className="space-y-1">
                {block(
                  `${getPositionLabel(position, locale)} · ${getPlacementLabel(placement, locale)}`,
                  true,
                  <SiteAdBanner ad={previewAd} compact />
                )}
              </div>
            ) : null}
            {block(locale === "ar" ? "لماذا تختارنا" : "Why choose us")}
            {block(locale === "ar" ? "التذييل" : "Footer")}
          </div>
        ) : null}

        {placement === "projects_top" ? (
          <div className="space-y-2">
            {block(
              `${getPositionLabel(position, locale)} · ${getPlacementLabel(placement, locale)}`,
              true,
              <SiteAdBanner ad={previewAd} compact />
            )}
            {block(locale === "ar" ? "شبكة المنصات" : "Projects grid")}
          </div>
        ) : null}

        {placement === "platform_details" ? (
          <div className="space-y-2">
            {block(locale === "ar" ? "هيدر المنصة" : "Platform hero")}
            {block(locale === "ar" ? "تفاصيل المنصة" : "Platform details")}
            {block(
              `${getPositionLabel(position, locale)} · ${getPlacementLabel(placement, locale)}`,
              true,
              <SiteAdBanner ad={previewAd} compact />
            )}
            {block(locale === "ar" ? "توصيات ذكية" : "Recommendations")}
          </div>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">{hint}</p>
      <p className="text-xs text-muted-foreground">
        {locale === "ar"
          ? `الموضع المحدد: ${AD_POSITION_META[position].labelAr}`
          : `Selected slot: ${AD_POSITION_META[position].labelEn}`}
      </p>
      <p className="text-xs text-muted-foreground">
        {locale === "ar"
          ? `المدة: ${previewAd.durationDays} يوم`
          : `Duration: ${previewAd.durationDays} days`}
      </p>
    </div>
  )
}

export const PLACEMENT_OPTIONS = AD_PLACEMENTS
export const DURATION_OPTIONS = AD_DURATION_OPTIONS
