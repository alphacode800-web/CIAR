import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSettings } from "@/services/settings.service"
import { parseAiSettings } from "@/features/ai/settings"
import { suggestSeo } from "@/features/ai/seo"

const schema = z.object({
  pageName: z.string().trim().min(1).max(120),
  content: z.string().trim().min(10).max(4000),
  locale: z.enum(["ar", "en"]).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 })
    }

    const settings = parseAiSettings(await getSettings())
    if (!settings.seoEnabled) {
      return NextResponse.json({ error: "اقتراحات SEO غير مفعّلة" }, { status: 403 })
    }

    const suggestion = await suggestSeo(parsed.data)
    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error("POST /api/ai/seo-suggest error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
