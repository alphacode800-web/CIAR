import { NextRequest, NextResponse } from "next/server"
import { listAllPublicAds } from "@/services/site-ads.service"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get("locale") || undefined
    const ads = await listAllPublicAds(locale)
    return NextResponse.json({ ads, total: ads.length })
  } catch (error) {
    console.error("GET /api/ads error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
