import { NextRequest, NextResponse } from "next/server"
import { getSetting, updateSettings } from "@/services/settings.service"
import { collectSiteImages } from "@/lib/collect-site-images"
import {
  IMAGE_STRIP_CONFIG_KEY,
  imageStripConfigSchema,
  parseImageStripConfig,
} from "@/lib/image-strip"

export async function GET() {
  try {
    const raw = await getSetting(IMAGE_STRIP_CONFIG_KEY)
    const config = parseImageStripConfig(raw ?? null)
    const images = await collectSiteImages(config.extraImages)

    return NextResponse.json({ config, images })
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

    const config = {
      enabled: parsed.data.enabled,
      scrollDuration: parsed.data.scrollDuration,
      pauseOnHover: parsed.data.pauseOnHover,
      imageHeight: parsed.data.imageHeight,
      borderRadius: parsed.data.borderRadius,
      extraImages: (parsed.data.extraImages ?? [])
        .map((url) => url.trim())
        .filter(Boolean),
    }

    await updateSettings({
      [IMAGE_STRIP_CONFIG_KEY]: JSON.stringify(config),
    })

    const images = await collectSiteImages(config.extraImages)

    return NextResponse.json({ success: true, config, images })
  } catch (error) {
    console.error("PUT /api/admin/image-strip error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
