"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n-context"
import { useFittingRoom } from "@/lib/fitting-room-context"
import { getDefaultFashionDemoAds, mergePublicAdsWithFashionDemos } from "@/lib/default-site-ads"
import { collectFashionGarmentsFromAds } from "@/lib/virtual-fitting/types"

function resolveFashionGarments(ads: unknown[], locale: string) {
  const merged = mergePublicAdsWithFashionDemos(Array.isArray(ads) ? ads : [], locale)
  let garments = collectFashionGarmentsFromAds(merged)
  if (garments.length === 0) {
    garments = collectFashionGarmentsFromAds(getDefaultFashionDemoAds(locale))
  }
  return garments
}

export function useFashionFittingLauncher() {
  const { locale } = useI18n()
  const isAr = locale === "ar"
  const { openFittingRoom } = useFittingRoom()
  const [loading, setLoading] = useState(false)

  const launchFashionFittingRoom = useCallback(
    async (initialGarmentId?: string) => {
      setLoading(true)
      try {
        const res = await fetch(`/api/ads?locale=${locale}`, { cache: "no-store" })
        const data = await res.json().catch(() => ({}))
        const garments = resolveFashionGarments(data.ads, locale)

        if (garments.length === 0) {
          toast.info(
            isAr
              ? "لا توجد إعلانات أزياء بصور حالياً — أضف إعلاناً من نوع «أزياء» لتجربة القياس"
              : "No fashion ads with images yet — add a fashion listing to try virtual fitting"
          )
          return false
        }

        openFittingRoom({
          garments,
          initialGarmentId:
            initialGarmentId && garments.some((g) => g.id === initialGarmentId)
              ? initialGarmentId
              : undefined,
        })
        return true
      } catch {
        const garments = resolveFashionGarments([], locale)
        if (garments.length > 0) {
          openFittingRoom({
            garments,
            initialGarmentId:
              initialGarmentId && garments.some((g) => g.id === initialGarmentId)
                ? initialGarmentId
                : undefined,
          })
          return true
        }
        toast.error(isAr ? "تعذّر فتح غرفة القياس" : "Could not open fitting room")
        return false
      } finally {
        setLoading(false)
      }
    },
    [isAr, locale, openFittingRoom]
  )

  return { launchFashionFittingRoom, loading }
}
