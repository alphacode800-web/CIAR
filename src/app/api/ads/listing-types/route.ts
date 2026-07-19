import { NextResponse } from "next/server"
import { getAdListingTypesStore } from "@/services/ad-listing-types.service"
import { getEnabledListingTypes } from "@/lib/ad-listing-types-config"

export async function GET() {
  try {
    const store = await getAdListingTypesStore()
    return NextResponse.json({
      defaultTypeId: store.defaultTypeId,
      types: getEnabledListingTypes(store),
    })
  } catch (error) {
    console.error("GET /api/ads/listing-types error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
