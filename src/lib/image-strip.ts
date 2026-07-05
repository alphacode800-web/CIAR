import { z } from "zod"
import { dedupeImageUrls } from "@/lib/collect-site-images"

export const IMAGE_STRIP_CONFIG_KEY = "home_image_strip_config"

export type ImageStripConfig = {
  enabled: boolean
  scrollDuration: number
  pauseOnHover: boolean
  imageHeight: number
  borderRadius: number
  extraImages: string[]
}

export const DEFAULT_IMAGE_STRIP_CONFIG: ImageStripConfig = {
  enabled: true,
  scrollDuration: 45,
  pauseOnHover: true,
  imageHeight: 144,
  borderRadius: 14,
  extraImages: [],
}

export const imageStripConfigSchema = z.object({
  enabled: z.boolean(),
  scrollDuration: z.number().min(10).max(120),
  pauseOnHover: z.boolean(),
  imageHeight: z.number().min(80).max(220),
  borderRadius: z.number().min(0).max(32),
  extraImages: z.array(z.string().trim().max(500)).max(50).optional(),
})

function extractLegacyGroupImages(parsed: Record<string, unknown>): string[] {
  if (!Array.isArray(parsed.groups)) return []
  return parsed.groups.flatMap((group) => {
    if (!group || typeof group !== "object") return []
    const images = (group as { images?: unknown }).images
    if (!Array.isArray(images)) return []
    return images.map((url) => String(url ?? "").trim()).filter(Boolean)
  })
}

export function parseImageStripConfig(raw: string | null | undefined): ImageStripConfig {
  if (!raw) return DEFAULT_IMAGE_STRIP_CONFIG

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const result = imageStripConfigSchema.safeParse(parsed)

    const extraImages = dedupeImageUrls([
      ...(Array.isArray(parsed.extraImages)
        ? parsed.extraImages.map((url) => String(url ?? "").trim()).filter(Boolean)
        : []),
      ...extractLegacyGroupImages(parsed),
    ])

    if (!result.success) {
      return { ...DEFAULT_IMAGE_STRIP_CONFIG, extraImages }
    }

    return {
      enabled: result.data.enabled,
      scrollDuration: result.data.scrollDuration,
      pauseOnHover: result.data.pauseOnHover,
      imageHeight: result.data.imageHeight,
      borderRadius: result.data.borderRadius,
      extraImages: dedupeImageUrls([
        ...(result.data.extraImages ?? []),
        ...extractLegacyGroupImages(parsed),
      ]),
    }
  } catch {
    return DEFAULT_IMAGE_STRIP_CONFIG
  }
}
