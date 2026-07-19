import { isRenderableImageUrl, dedupeImageUrls } from "@/lib/collect-site-images"
import { IMAGE_STRIP_CONFIG_KEY, parseImageStripConfig } from "@/lib/image-strip"
import { getSettings, updateSettings } from "@/services/settings.service"

/** Persist an ad image in the image strip config so it appears immediately. */
export async function appendAdImageToImageStrip(imageUrl: string | undefined | null): Promise<void> {
  const trimmed = String(imageUrl ?? "").trim()
  if (!isRenderableImageUrl(trimmed)) return

  try {
    const settings = await getSettings()
    const config = parseImageStripConfig(settings[IMAGE_STRIP_CONFIG_KEY])
    if (config.extraImages.includes(trimmed)) return

    const nextConfig = {
      ...config,
      extraImages: dedupeImageUrls([...config.extraImages, trimmed]),
    }

    await updateSettings({
      [IMAGE_STRIP_CONFIG_KEY]: JSON.stringify(nextConfig),
    })
  } catch {
    // non-blocking
  }
}

export async function appendAdImagesToImageStrip(imageUrls: Array<string | undefined | null>): Promise<void> {
  for (const url of imageUrls) {
    await appendAdImageToImageStrip(url)
  }
}
