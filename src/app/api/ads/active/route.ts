import { NextRequest, NextResponse } from "next/server"
import { AD_PLACEMENTS, AD_POSITIONS } from "@/lib/site-ads"
import { getActiveAds } from "@/services/site-ads.service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const placement = searchParams.get("placement")
    const position = searchParams.get("position")
    const locale = searchParams.get("locale") || undefined

    const ads = await getActiveAds({
      placement:
        placement && (AD_PLACEMENTS as readonly string[]).includes(placement)
          ? (placement as (typeof AD_PLACEMENTS)[number])
          : undefined,
      position:
        position && (AD_POSITIONS as readonly string[]).includes(position)
          ? (position as (typeof AD_POSITIONS)[number])
          : undefined,
      locale,
    })

    return NextResponse.json({ ads })
  } catch (error) {
    console.error("GET /api/ads/active error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
