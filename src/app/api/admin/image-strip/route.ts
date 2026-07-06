import { NextRequest, NextResponse } from "next/server"
import { getSetting, updateSettings } from "@/services/settings.service"
import { collectSiteImages } from "@/lib/collect-site-images"
import {
  IMAGE_STRIP_CONFIG_KEY,
  imageStripConfigSchema,
  parseImageStripConfig,
  resolveImageStripImages,
} from "@/lib/image-strip"

function buildStoredConfig(parsed: ReturnType<typeof imageStripConfigSchema.parse>) {
  return {
    enabled: parsed.enabled,
    scrollDuration: parsed.scrollDuration,
    pauseOnHover: parsed.pauseOnHover,
    imageHeight: parsed.imageHeight,
    borderRadius: parsed.borderRadius,
    extraImages: (parsed.extraImages ?? []).map((url) => url.trim()).filter(Boolean),
    hiddenImages: (parsed.hiddenImages ?? []).map((url) => url.trim()).filter(Boolean),
    imageOverrides: Object.fromEntries(
      Object.entries(parsed.imageOverrides ?? {})
        .map(([key, value]) => [key.trim(), String(value).trim()] as const)
        .filter(([key, value]) => key && value)
    ),
  }
}

export async function GET() {
  try {
    const raw = await getSetting(IMAGE_STRIP_CONFIG_KEY)
    const config = parseImageStripConfig(raw ?? null)
    const allImages = await collectSiteImages(config.extraImages)
    const images = resolveImageStripImages(allImages, config)

    return NextResponse.json({ config, images, allImages })
  } catch (error) {
    console.error("GET /api/admin/image-strip error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = imageStripConfigSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const config = buildStoredConfig(parsed.data)

    await updateSettings({
      [IMAGE_STRIP_CONFIG_KEY]: JSON.stringify(config),
    })

    const allImages = await collectSiteImages(config.extraImages)
    const images = resolveImageStripImages(allImages, config)

    return NextResponse.json({ success: true, config, images, allImages })
  } catch (error) {
    console.error("PUT /api/admin/image-strip error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
