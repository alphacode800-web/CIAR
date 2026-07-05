import { NextRequest, NextResponse } from "next/server"
import { getSettings, updateSettings } from "@/services/settings.service"
import {
  ABOUT_COMPANY_INTRO_AR_KEY,
  ABOUT_COMPANY_INTRO_EN_KEY,
  aboutCompanyIntroSchema,
  buildAboutCompanyIntro,
} from "@/lib/about-content"

export async function GET() {
  try {
    const settings = await getSettings()
    const intro = buildAboutCompanyIntro(settings)
    return NextResponse.json({ intro })
  } catch (error) {
    console.error("GET /api/admin/about-content error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = aboutCompanyIntroSchema.safeParse(body?.intro ?? body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const intro = parsed.data

    await updateSettings({
      [ABOUT_COMPANY_INTRO_AR_KEY]: intro.ar,
      [ABOUT_COMPANY_INTRO_EN_KEY]: intro.en,
    })

    return NextResponse.json({ success: true, intro })
  } catch (error) {
    console.error("PUT /api/admin/about-content error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
