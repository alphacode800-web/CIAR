import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSetting, updateSettings } from "@/services/settings.service"

const NEWS_TICKER_KEY = "home_news_ticker_items"

const updateNewsTickerSchema = z.object({
  items: z.array(z.string().trim().min(1).max(220)).min(1).max(20),
})

const defaultItems = [
  "Launching new enterprise platforms this quarter",
  "24/7 technical support now available for all clients",
  "New AI-powered modules added to our ecosystem",
  "International expansion across multiple industries",
]

function parseItems(raw: string | null): string[] {
  if (!raw) return defaultItems
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0)
        .slice(0, 20)
    }
  } catch {
    // fallback to defaults
  }
  return defaultItems
}

export async function GET() {
  try {
    const raw = await getSetting(NEWS_TICKER_KEY)
    return NextResponse.json({ items: parseItems(raw) })
  } catch (error) {
    console.error("GET /api/admin/news-ticker error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = updateNewsTickerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const items = parsed.data.items.map((item) => item.trim()).filter(Boolean)
    await updateSettings({
      [NEWS_TICKER_KEY]: JSON.stringify(items),
    })

    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error("PUT /api/admin/news-ticker error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

