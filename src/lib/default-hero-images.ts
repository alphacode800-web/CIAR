const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1920&q=75`

/** Default hero slide URLs shown on the homepage when no custom URL is saved. */
export const DEFAULT_HERO_IMAGE_URLS = [
  unsplash("1436491865332-7a61a109cc05"), // aviation / tourism
  unsplash("1560518883-ce09059eeffa"), // real estate
  unsplash("1441986300917-64674bd600d8"), // retail / mall
  unsplash("1492144534655-ae79c964c9d7"), // automotive
  unsplash("1586528116311-ad8dd3c8310d"), // shipping / logistics
  unsplash("1522071820081-009f0129c71c"), // teams / hiring
  unsplash("1460925895917-afdab827c52f"), // analytics / ads
  unsplash("1556742049-0cfed4f6a45d"), // payments / commerce
  unsplash("1517248135467-4c7edcad34c4"), // hospitality
  unsplash("1445205170230-053b83016050"), // fashion
  unsplash("1507679799987-c73779587ccf"), // professional services
  unsplash("1504307651254-35680f356dfd"), // field services
  unsplash("1544191693-867a14dca8cf"), // luxury / VIP
  unsplash("1486406146926-c627a92ad3b4"), // investment / business
  unsplash("1556761175-5973dc0f32e7"), // campaigns / product
  unsplash("1578574577315-3fbeb0ce23b9"), // global logistics
  unsplash("1521737604893-d14cc237f11d"), // marketing / creative
  unsplash("1454165804606-c3d568bc25a3"), // partnerships
  unsplash("1497366216548-37526070297c"), // workspace
  unsplash("1489515217757-5fd1b906566c"), // digital / platform
] as const

export function getDefaultHeroImageUrl(index: number): string {
  return DEFAULT_HERO_IMAGE_URLS[index] ?? ""
}

/** Merge saved hero URLs with defaults so the slideshow always has enough slides. */
export function resolveHeroSlidesFromSettings(settings: Record<string, string>): string[] {
  return Array.from({ length: DEFAULT_HERO_IMAGE_URLS.length }, (_, index) => {
    const saved = String(settings[`home_hero_image_${index + 1}`] ?? "").trim()
    return saved || getDefaultHeroImageUrl(index)
  })
}

export function mergeHeroSlideUrls(
  sources: Array<string | null | undefined>,
  broken: Set<string> = new Set(),
  minSlides = 5,
  maxSlides = 20
): string[] {
  const pool: string[] = []
  const seen = new Set<string>()

  for (const raw of sources) {
    const url = String(raw ?? "").trim()
    if (!url || seen.has(url) || broken.has(url)) continue
    seen.add(url)
    pool.push(url)
    if (pool.length >= maxSlides) return pool
  }

  for (const url of DEFAULT_HERO_IMAGE_URLS) {
    if (pool.length >= maxSlides) break
    if (seen.has(url) || broken.has(url)) continue
    seen.add(url)
    pool.push(url)
  }

  const fallback = DEFAULT_HERO_IMAGE_URLS.filter((url) => !broken.has(url))
  if (pool.length >= minSlides) return pool
  return pool.length > 0 ? pool : fallback.length > 0 ? [...fallback] : [...DEFAULT_HERO_IMAGE_URLS]
}

import { resolvePlatformCardImages } from "@/lib/platform-card-images"

export function collectPlatformBannerImages(
  banners: Array<{
    imageUrls?: unknown
    imageUrl1?: string
    imageUrl2?: string
    imageUrl3?: string
  }>
): string[] {
  return banners.flatMap((banner) => resolvePlatformCardImages(banner))
}

export function getHeroImageIndexFromKey(key: string): number {
  const match = key.match(/home_hero_image_(\d+)/)
  if (!match) return -1
  return Number(match[1]) - 1
}

export function resolveHeroImagePreviewUrl(savedUrl: string, key: string): string {
  const trimmed = String(savedUrl || "").trim()
  if (trimmed) return trimmed
  const index = getHeroImageIndexFromKey(key)
  return index >= 0 ? getDefaultHeroImageUrl(index) : ""
}
