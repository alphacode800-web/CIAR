import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSettings, updateSettings } from "@/services/settings.service"
import {
  PAGE_HEADERS_KEY,
  pageHeaderSchema,
  homeHeaderLegacySyncFields,
  resolvePageHeadersFromSettings,
} from "@/lib/page-headers"

export const dynamic = "force-dynamic"

const updateSchema = z.object({
  headers: z.object({
    about: pageHeaderSchema,
    contact: pageHeaderSchema,
    projects: pageHeaderSchema,
    home: pageHeaderSchema,
  }),
})

export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json({ headers: resolvePageHeadersFromSettings(settings) })
  } catch (error) {
    console.error("GET /api/admin/page-headers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await updateSettings({
      [PAGE_HEADERS_KEY]: JSON.stringify(parsed.data.headers),
      ...homeHeaderLegacySyncFields(parsed.data.headers.home),
    })

    return NextResponse.json({ success: true, headers: parsed.data.headers })
  } catch (error) {
    console.error("PUT /api/admin/page-headers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
