import { NextRequest, NextResponse } from "next/server"
import { getSettings, updateSettings } from "@/services/settings.service"
import {
  DEFAULT_PAGE_HEADERS,
  PAGE_HEADERS_KEY,
  getPageHeader,
  homeHeaderLegacySyncFields,
  resolvePageHeadersFromSettings,
  resolvePageBackgroundImage,
  type PageHeaderId,
} from "@/lib/page-headers"

export const dynamic = "force-dynamic"

const PAGE_IDS: PageHeaderId[] = ["home", "about", "contact", "projects"]

export async function GET(request: NextRequest) {
  try {
    const page = request.nextUrl.searchParams.get("page") as PageHeaderId | null
    const settings = await getSettings()
    const store = resolvePageHeadersFromSettings(settings)

    if (page && PAGE_IDS.includes(page)) {
      const header = getPageHeader(page, store)
      return NextResponse.json({
        page,
        header: {
          ...header,
          backgroundImage: resolvePageBackgroundImage(header, settings, page),
        },
      })
    }

    const headers = Object.fromEntries(
      PAGE_IDS.map((id) => {
        const header = getPageHeader(id, store)
        return [
          id,
          {
            ...header,
            backgroundImage: resolvePageBackgroundImage(header, settings, id),
          },
        ]
      })
    )

    return NextResponse.json({ headers, defaults: DEFAULT_PAGE_HEADERS })
  } catch (error) {
    console.error("GET /api/page-headers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
