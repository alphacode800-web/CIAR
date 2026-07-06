import { DEFAULT_BANNER_IMAGES, MODULE_BANNER_IMAGES } from "@/features/super-platform/config"

export const MAX_PLATFORM_CARD_IMAGES = 20

export function projectSlugToModuleSlug(slug: string): string | null {
  if (!slug.startsWith("ciar-")) return null
  return slug.slice(5).toUpperCase().replace(/-/g, "_")
}

export type PlatformBannerImagesSource = {
  imageUrls?: unknown
  imageUrl1?: string | null
  imageUrl2?: string | null
  imageUrl3?: string | null
}

export function normalizePlatformImageUrls(urls: unknown): string[] {
  if (!Array.isArray(urls)) return []
  const seen = new Set<string>()
  const result: string[] = []

  for (const raw of urls) {
    const url = String(raw ?? "").trim()
    if (!url || seen.has(url)) continue
    seen.add(url)
    result.push(url)
    if (result.length >= MAX_PLATFORM_CARD_IMAGES) break
  }

  return result
}

/** @deprecated use normalizePlatformImageUrls */
export function toPlatformImageSlots(urls: string[] | undefined | null): string[] {
  return normalizePlatformImageUrls(urls)
}

export function resolvePlatformCardImages(
  source: PlatformBannerImagesSource | string[] | null | undefined
): string[] {
  if (Array.isArray(source)) return normalizePlatformImageUrls(source)
  if (!source) return []

  return normalizePlatformImageUrls([
    ...normalizePlatformImageUrls(source.imageUrls),
    source.imageUrl1,
    source.imageUrl2,
    source.imageUrl3,
  ])
}

export function mergePlatformImageSlots(projectUrls: string[], bannerUrls: string[]): string[] {
  return normalizePlatformImageUrls([...projectUrls, ...bannerUrls])
}

export function getDefaultModuleBannerImages(slug: string): string[] {
  const moduleSlug = projectSlugToModuleSlug(slug)
  if (!moduleSlug) return []
  return [...(MODULE_BANNER_IMAGES[moduleSlug] || DEFAULT_BANNER_IMAGES)]
}

export function resolveProjectEditImages(
  slug: string,
  projectUrls: string[],
  bannerUrls: string[] = []
): string[] {
  const fallback = bannerUrls.length > 0 ? bannerUrls : getDefaultModuleBannerImages(slug)
  return mergePlatformImageSlots(projectUrls, fallback)
}

export function platformImageSlotsToPayload(slots: string[]) {
  const normalized = normalizePlatformImageUrls(slots)
  return {
    imageUrls: normalized,
    imageUrl1: normalized[0] || "",
    imageUrl2: normalized[1] || "",
    imageUrl3: normalized[2] || "",
    imageUrl: normalized[0] || "",
  }
}
