import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSettings } from "@/services/settings.service"
import { parseAiSettings } from "@/features/ai/settings"
import { generateChatReply } from "@/features/ai/chat"

const schema = z.object({
  message: z.string().trim().min(1).max(1200),
  locale: z.enum(["ar", "en"]).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1200),
      })
    )
    .max(12)
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 })
    }

    const settings = parseAiSettings(await getSettings())
    if (!settings.chatEnabled) {
      return NextResponse.json({ error: "المساعد الذكي غير مفعّل حالياً" }, { status: 403 })
    }

    const payload = await generateChatReply({
      message: parsed.data.message,
      locale: parsed.data.locale,
      history: parsed.data.history,
    })

    return NextResponse.json(payload)
  } catch (error) {
    console.error("POST /api/ai/chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
