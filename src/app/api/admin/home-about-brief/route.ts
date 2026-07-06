import { NextRequest, NextResponse } from "next/server"
import { getSettings, updateSettings } from "@/services/settings.service"
import {
  HOME_ABOUT_BRIEF_KEY,
  buildHomeAboutBrief,
  homeAboutBriefConfigSchema,
} from "@/lib/home-about-brief"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json({ config: buildHomeAboutBrief(settings) })
  } catch (error) {
    console.error("GET /api/admin/home-about-brief error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = homeAboutBriefConfigSchema.safeParse(body?.config ?? body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await updateSettings({
      [HOME_ABOUT_BRIEF_KEY]: JSON.stringify(parsed.data),
    })

    return NextResponse.json({ success: true, config: parsed.data })
  } catch (error) {
    console.error("PUT /api/admin/home-about-brief error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
