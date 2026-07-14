import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSettings, updateSettings } from "@/services/settings.service"
import { parseAiSettings, serializeAiSettings } from "@/features/ai/settings"
import { isAiConfigured } from "@/features/ai/ai-client"

const updateSchema = z.object({
  chatEnabled: z.boolean().optional(),
  sentimentEnabled: z.boolean().optional(),
  seoEnabled: z.boolean().optional(),
  recommendationsEnabled: z.boolean().optional(),
  inventoryEnabled: z.boolean().optional(),
  fraudEnabled: z.boolean().optional(),
  welcomeAr: z.string().trim().min(1).max(300).optional(),
  welcomeEn: z.string().trim().min(1).max(300).optional(),
})

export async function GET() {
  try {
    const settings = await getSettings()
    const ai = parseAiSettings(settings)
    const configured = await isAiConfigured()
    return NextResponse.json({ settings: ai, configured })
  } catch (error) {
    console.error("GET /api/ai/settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 })
    }

    const current = parseAiSettings(await getSettings())
    const next = { ...current, ...parsed.data }
    await updateSettings(serializeAiSettings(next))
    return NextResponse.json({ success: true, settings: next })
  } catch (error) {
    console.error("PUT /api/ai/settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
