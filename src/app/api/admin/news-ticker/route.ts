import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSetting, updateSettings } from "@/services/settings.service"
import {
  DEFAULT_NEWS_TICKER_STYLE,
  NEWS_TICKER_STYLE_KEY,
  newsTickerStyleSchema,
  parseNewsTickerStyle,
} from "@/lib/news-ticker"
import { parseHomeNewsTicker } from "@/lib/home-banners"

const NEWS_TICKER_KEY = "home_news_ticker_items"

const updateNewsTickerSchema = z.object({
  items: z.array(z.string().trim().min(1).max(220)).min(1).max(20),
  style: newsTickerStyleSchema.optional(),
})

export async function GET() {
  try {
    const [itemsRaw, styleRaw] = await Promise.all([
      getSetting(NEWS_TICKER_KEY),
      getSetting(NEWS_TICKER_STYLE_KEY),
    ])
    return NextResponse.json({
      items: parseHomeNewsTicker(itemsRaw ?? null),
      style: parseNewsTickerStyle(styleRaw ?? null),
    })
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
    const style = parsed.data.style ?? DEFAULT_NEWS_TICKER_STYLE

    await updateSettings({
      [NEWS_TICKER_KEY]: JSON.stringify(items),
      [NEWS_TICKER_STYLE_KEY]: JSON.stringify(style),
    })

    return NextResponse.json({ success: true, items, style })
  } catch (error) {
    console.error("PUT /api/admin/news-ticker error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
