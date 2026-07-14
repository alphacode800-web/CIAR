import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSettings } from "@/services/settings.service"
import { parseAiSettings } from "@/features/ai/settings"
import { analyzeSentimentLocal, type SentimentResult } from "@/features/ai/sentiment"
import { createAiCompletion } from "@/features/ai/ai-client"

const schema = z.object({
  text: z.string().trim().min(1).max(5000),
})

async function analyzeWithAi(text: string): Promise<SentimentResult | null> {
  const reply = await createAiCompletion([
    {
      role: "system",
      content:
        'حلّل المشاعر. أعد JSON فقط: {"label":"positive|neutral|negative","score":0.0,"summary":"جملة عربية قصيرة"}',
    },
    { role: "user", content: text },
  ])

  if (!reply) return null
  try {
    const match = reply.match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0]) as Partial<SentimentResult>
    if (!parsed.label || typeof parsed.score !== "number") return null
    return {
      label: parsed.label,
      score: Math.max(0, Math.min(1, parsed.score)),
      summary: String(parsed.summary || "تحليل تلقائي"),
    }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 })
    }

    const settings = parseAiSettings(await getSettings())
    if (!settings.sentimentEnabled) {
      return NextResponse.json({ error: "تحليل المشاعر غير مفعّل" }, { status: 403 })
    }

    const aiResult = await analyzeWithAi(parsed.data.text)
    const result = aiResult || analyzeSentimentLocal(parsed.data.text)
    return NextResponse.json({ result, source: aiResult ? "ai" : "local" })
  } catch (error) {
    console.error("POST /api/ai/sentiment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
