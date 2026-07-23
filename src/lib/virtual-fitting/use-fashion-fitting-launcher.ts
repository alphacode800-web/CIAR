"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n-context"
import { useFittingRoom } from "@/lib/fitting-room-context"
import { mergePublicAdsWithFashionDemos } from "@/lib/default-site-ads"
import { collectFashionGarmentsFromAds } from "@/lib/virtual-fitting/types"

export function useFashionFittingLauncher() {
  const { locale } = useI18n()
  const isAr = locale === "ar"
  const { openFittingRoom } = useFittingRoom()
  const [loading, setLoading] = useState(false)

  const launchFashionFittingRoom = useCallback(
    async (initialGarmentId?: string) => {
      setLoading(true)
      try {
        const res = await fetch(`/api/ads?locale=${locale}`)
        const data = await res.json()
        const ads = mergePublicAdsWithFashionDemos(
          Array.isArray(data.ads) ? data.ads : [],
          locale
        )
        const garments = collectFashionGarmentsFromAds(ads)

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
