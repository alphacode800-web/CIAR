import { projectSlugToModuleSlug, platformImageSlotsToPayload, resolvePlatformCardImages } from "@/lib/platform-card-images"

type PlatformBannerRow = {
  id: string
  imageUrl1?: string
  imageUrl2?: string
  imageUrl3?: string
  imageUrls?: unknown
  titleEn?: string
  titleAr?: string
  descriptionEn?: string
  descriptionAr?: string
  ctaTextEn?: string
  ctaTextAr?: string
  ctaHref?: string
  isActive?: boolean
  module?: { slug?: string }
}

export async function syncPlatformBannerImages(slug: string, imageUrls: string[]) {
  const moduleSlug = projectSlugToModuleSlug(slug)
  if (!moduleSlug) return

  const payload = platformImageSlotsToPayload(imageUrls)
  const bannersRes = await fetch("/api/super-platform/banners")
  if (!bannersRes.ok) return

  const data = await bannersRes.json()
  const banners: PlatformBannerRow[] = Array.isArray(data?.banners) ? data.banners : []
  const banner = banners.find((row) => row.module?.slug === moduleSlug)
  if (!banner?.id) return

  await fetch(`/api/super-platform/banners/${banner.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titleEn: banner.titleEn || "",
      titleAr: banner.titleAr || "",
      descriptionEn: banner.descriptionEn || "",
      descriptionAr: banner.descriptionAr || "",
      ctaTextEn: banner.ctaTextEn || "Explore",
      ctaTextAr: banner.ctaTextAr || "استكشف",
      ctaHref: banner.ctaHref || "#",
      imageUrls: payload.imageUrls,
      imageUrl1: payload.imageUrl1,
      imageUrl2: payload.imageUrl2,
      imageUrl3: payload.imageUrl3,
      isActive: banner.isActive !== false,
    }),
  })
}

export async function fetchPlatformBannerImageSlots(slug: string): Promise<string[]> {
  const moduleSlug = projectSlugToModuleSlug(slug)
  if (!moduleSlug) return []

  try {
    const res = await fetch("/api/super-platform/banners")
    if (!res.ok) return []
    const data = await res.json()
    const banners: PlatformBannerRow[] = Array.isArray(data?.banners) ? data.banners : []
    const banner = banners.find((row) => row.module?.slug === moduleSlug)
    if (!banner) return []
    return resolvePlatformCardImages(banner)
  } catch {
    return []
  }
}
