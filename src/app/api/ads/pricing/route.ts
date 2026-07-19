import { NextRequest, NextResponse } from "next/server"
import { computeAdQuote } from "@/lib/ad-pricing"
import { AD_DURATION_OPTIONS, AD_PLACEMENTS, AD_POSITIONS } from "@/lib/site-ads"
import { getAdPricingConfig } from "@/services/ad-pricing.service"

export async function GET(request: NextRequest) {
  try {
    const config = await getAdPricingConfig()
    const { searchParams } = new URL(request.url)

    const durationRaw = Number(searchParams.get("durationDays") || 30)
    const placementRaw = searchParams.get("placement") || "home_after_platforms"
    const positionRaw = searchParams.get("position") || "slot_1"

    const durationDays = AD_DURATION_OPTIONS.includes(durationRaw as (typeof AD_DURATION_OPTIONS)[number])
      ? durationRaw
      : 30
    const placement = AD_PLACEMENTS.includes(placementRaw as (typeof AD_PLACEMENTS)[number])
      ? (placementRaw as (typeof AD_PLACEMENTS)[number])
      : "home_after_platforms"
    const position = AD_POSITIONS.includes(positionRaw as (typeof AD_POSITIONS)[number])
      ? (positionRaw as (typeof AD_POSITIONS)[number])
      : "slot_1"

    const quote = computeAdQuote({ durationDays, placement, position, config })

    return NextResponse.json({
      config: {
        currency: config.currency,
        durationPrices: config.durationPrices,
        slot2Surcharge: config.slot2Surcharge,
        placementSurcharges: config.placementSurcharges,
      },
      quote,
    })
  } catch (error) {
    console.error("GET /api/ads/pricing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
