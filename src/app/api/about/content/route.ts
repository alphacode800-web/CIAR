import { NextResponse } from "next/server"
import { getSettings } from "@/services/settings.service"
import { buildAboutCompanyIntro } from "@/lib/about-content"

export async function GET() {
  try {
    const settings = await getSettings()
    const intro = buildAboutCompanyIntro(settings)
    return NextResponse.json({ intro })
  } catch (error) {
    console.error("GET /api/about/content error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
