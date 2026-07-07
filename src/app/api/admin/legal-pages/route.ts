import { NextRequest, NextResponse } from "next/server"
import { getSettings, updateSettings } from "@/services/settings.service"
import {
  LEGAL_PAGES_KEY,
  buildLegalPages,
  legalPagesConfigSchema,
} from "@/lib/legal-pages"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json({ config: buildLegalPages(settings) })
  } catch (error) {
    console.error("GET /api/admin/legal-pages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = legalPagesConfigSchema.safeParse(body?.config ?? body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await updateSettings({
      [LEGAL_PAGES_KEY]: JSON.stringify(parsed.data),
    })

    return NextResponse.json({ success: true, config: parsed.data })
  } catch (error) {
    console.error("PUT /api/admin/legal-pages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
