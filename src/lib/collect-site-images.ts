import { prisma } from "@/lib/prisma"
import { getSettings } from "@/services/settings.service"
import { getMedia } from "@/services/media.service"
import { buildHomeBannersConfig } from "@/lib/home-banners"
import { DEFAULT_HERO_IMAGE_URLS } from "@/lib/default-hero-images"
import { MODULE_BANNER_IMAGES, DEFAULT_BANNER_IMAGES } from "@/features/super-platform/config"
import { getFallbackBanners } from "@/features/super-platform/server"

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i

export function isRenderableImageUrl(url: unknown): url is string {
  const trimmed = String(url ?? "").trim()
  if (!trimmed) return false
  if (VIDEO_EXT.test(trimmed)) return false
  if (trimmed === "/logo.png" || trimmed === "/logo.svg") return false
  return true
}

export function dedupeImageUrls(urls: unknown[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const url of urls) {
    if (!isRenderableImageUrl(url)) continue
    const normalized = url.trim()
    if (seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
  }

  return result
}

function pushBannerImages(
  target: string[],
  banner?: { imageUrl1?: string | null; imageUrl2?: string | null; imageUrl3?: string | null } | null
) {
  if (!banner) return
  target.push(banner.imageUrl1 ?? "", banner.imageUrl2 ?? "", banner.imageUrl3 ?? "")
}

export async function collectSiteImages(extraImages: string[] = []): Promise<string[]> {
  const urls: string[] = []

  try {
    const settings = await getSettings()
    const homeConfig = buildHomeBannersConfig(settings)

    urls.push(...homeConfig.hero.imageSlides)
    urls.push(homeConfig.hero.backgroundVideoPoster)

    if (homeConfig.nav.logoType === "image") {
      urls.push(homeConfig.nav.logoUrl)
    }

    for (let index = 1; index <= 20; index += 1) {
      urls.push(settings[`home_hero_image_${index}`] ?? "")
    }
  } catch {
    // settings unavailable — fall back to defaults below
  }

  urls.push(...DEFAULT_HERO_IMAGE_URLS)

  for (const images of Object.values(MODULE_BANNER_IMAGES)) {
    urls.push(...images)
  }
  urls.push(...DEFAULT_BANNER_IMAGES)

  try {
    const banners = await prisma.platformBanner.findMany({
      where: { isActive: true },
      include: { module: true },
    })

    for (const banner of banners) {
      if (banner.module?.visibility === "VISIBLE" && banner.module?.isEnabled) {
        pushBannerImages(urls, banner)
      }
    }
  } catch {
    for (const banner of getFallbackBanners()) {
      pushBannerImages(urls, banner)
    }
  }

  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      select: { imageUrl: true },
    })
    for (const project of projects) {
      urls.push(project.imageUrl)
    }
  } catch {
    // ignore project fetch errors
  }

  try {
    const media = await getMedia(undefined, 200)
    for (const item of media) {
      if (String(item.mimeType || "").startsWith("image/")) {
        urls.push(item.url)
      }
    }
  } catch {
    // ignore media fetch errors
  }

  urls.push(...extraImages)

  return dedupeImageUrls(urls)
}
