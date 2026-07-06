import { NextResponse } from "next/server"
import { getSettings } from "@/services/settings.service"
import { buildHomeAboutBrief } from "@/lib/home-about-brief"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json({ config: buildHomeAboutBrief(settings) })
  } catch (error) {
    console.error("GET /api/home/about-brief error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
