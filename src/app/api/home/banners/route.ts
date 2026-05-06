import { NextResponse } from "next/server"
import { getSettings } from "@/services/settings.service"
import { buildHomeBannersConfig } from "@/lib/home-banners"

export async function GET() {
  try {
    const settings = await getSettings()
    const config = buildHomeBannersConfig(settings)
    return NextResponse.json({ config })
  } catch (error) {
    console.error("GET /api/home/banners error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
