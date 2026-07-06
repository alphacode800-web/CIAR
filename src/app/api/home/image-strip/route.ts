import { NextResponse } from "next/server"
import { getSetting } from "@/services/settings.service"
import { collectSiteImages } from "@/lib/collect-site-images"
import {
  IMAGE_STRIP_CONFIG_KEY,
  parseImageStripConfig,
  resolveImageStripImages,
} from "@/lib/image-strip"

export async function GET() {
  try {
    const raw = await getSetting(IMAGE_STRIP_CONFIG_KEY)
    const config = parseImageStripConfig(raw ?? null)
    const allImages = await collectSiteImages(config.extraImages)
    const images = resolveImageStripImages(allImages, config)

    return NextResponse.json({ config, images })
  } catch (error) {
    console.error("GET /api/home/image-strip error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
