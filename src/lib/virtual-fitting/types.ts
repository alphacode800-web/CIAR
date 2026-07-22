import type { SiteAdRecord } from "@/lib/site-ads"

export type FittingRoomStatus = "idle" | "uploading" | "processing" | "completed" | "error"

export type FittingGarment = {
  id: string
  title: string
  imageUrl: string
  brand?: string
  companyName?: string
  price?: number
  currency?: string
  sizes?: string[]
  colors?: string[]
  fabricTypes?: string[]
}

export type UserImageState = {
  file: File
  previewUrl: string
  width: number
  height: number
}

export type TryOnResult = {
  resultImageUrl: string
  provider: string
  processingMs: number
  mock?: boolean
}

export type TryOnRequest = {
  userImageBase64: string
  userImageMimeType: string
  garmentImageUrl: string
  garmentId: string
  locale?: string
}

export type TryOnApiResponse = {
  success: boolean
  data?: TryOnResult
  message?: string
  code?: string
}

export function siteAdToGarment(ad: SiteAdRecord): FittingGarment | null {
  if (ad.productDetails?.listingType !== "fashion" || !ad.imageUrl?.trim()) return null
  const details = ad.productDetails
  return {
    id: ad.id,
    title: ad.title,
    imageUrl: ad.imageUrl,
    companyName: ad.companyName,
    brand: details.brand,
    price: details.price,
    currency: details.currency,
    sizes: details.sizes,
    colors: details.colors,
    fabricTypes: details.fabricTypes,
  }
}

export function collectFashionGarmentsFromAds(ads: SiteAdRecord[]): FittingGarment[] {
  const seen = new Set<string>()
  const garments: FittingGarment[] = []
  for (const ad of ads) {
    const garment = siteAdToGarment(ad)
    if (!garment || seen.has(garment.id)) continue
    seen.add(garment.id)
    garments.push(garment)
  }
  return garments
}
