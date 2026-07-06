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
  hiddenImages: string[]
  imageOverrides: Record<string, string>
}

export const DEFAULT_IMAGE_STRIP_CONFIG: ImageStripConfig = {
  enabled: true,
  scrollDuration: 45,
  pauseOnHover: true,
  imageHeight: 144,
  borderRadius: 14,
  extraImages: [],
  hiddenImages: [],
  imageOverrides: {},
}

export const imageStripConfigSchema = z.object({
  enabled: z.boolean(),
  scrollDuration: z.number().min(10).max(120),
  pauseOnHover: z.boolean(),
  imageHeight: z.number().min(80).max(220),
  borderRadius: z.number().min(0).max(32),
  extraImages: z.array(z.string().trim().max(500)).max(50).optional(),
  hiddenImages: z.array(z.string().trim().max(500)).max(300).optional(),
  imageOverrides: z.record(z.string(), z.string().trim().max(500)).optional(),
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
      return {
        ...DEFAULT_IMAGE_STRIP_CONFIG,
        extraImages,
        hiddenImages: dedupeImageUrls(
          Array.isArray(parsed.hiddenImages)
            ? parsed.hiddenImages.map((url) => String(url ?? "").trim()).filter(Boolean)
            : []
        ),
        imageOverrides: normalizeImageOverrides(parsed.imageOverrides),
      }
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
      hiddenImages: dedupeImageUrls(result.data.hiddenImages ?? []),
      imageOverrides: normalizeImageOverrides(result.data.imageOverrides ?? {}),
    }
  } catch {
    return DEFAULT_IMAGE_STRIP_CONFIG
  }
}

function normalizeImageOverrides(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const from = String(key ?? "").trim()
    const to = String(value ?? "").trim()
    if (from && to) out[from] = to
  }
  return out
}

export function resolveImageStripImages(
  rawImages: string[],
  config: Pick<ImageStripConfig, "hiddenImages" | "imageOverrides">
): string[] {
  const hidden = new Set(config.hiddenImages.map((url) => url.trim()).filter(Boolean))

  return dedupeImageUrls(
    rawImages
      .map((url) => {
        const trimmed = url.trim()
        if (!trimmed || hidden.has(trimmed)) return ""
        const override = config.imageOverrides[trimmed]?.trim()
        if (override) return hidden.has(override) ? "" : override
        return trimmed
      })
      .filter(Boolean)
  )
}
