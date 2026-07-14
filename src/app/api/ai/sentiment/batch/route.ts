import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { getSettings } from "@/services/settings.service"
import { parseAiSettings } from "@/features/ai/settings"
import { analyzeSentimentLocal } from "@/features/ai/sentiment"

const schema = z.object({
  limit: z.number().int().min(1).max(50).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const settings = parseAiSettings(await getSettings())
    if (!settings.sentimentEnabled) {
      return NextResponse.json({ error: "تحليل المشاعر غير مفعّل" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = schema.safeParse(body)
    const limit = parsed.success ? parsed.data.limit || 20 : 20

    const contacts = await db.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, subject: true, message: true },
    })

    const results = contacts.map((contact) => {
      const result = analyzeSentimentLocal(`${contact.subject}\n${contact.message}`)
      return { id: contact.id, result }
    })

    const breakdown = { positive: 0, neutral: 0, negative: 0 }
    for (const item of results) {
      breakdown[item.result.label] += 1
    }

    return NextResponse.json({ results, breakdown, total: results.length })
  } catch (error) {
    console.error("POST /api/ai/sentiment/batch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
