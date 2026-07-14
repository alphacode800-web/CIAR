import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { listAdsForUser, listPendingAdRequests } from "@/services/site-ads.service"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const [ads, pendingAll] = await Promise.all([
      listAdsForUser(user.id),
      listPendingAdRequests(),
    ])

    const pending = pendingAll.filter((item) => item.userId === user.id)

    return NextResponse.json({ ads, pending })
  } catch (error) {
    console.error("GET /api/ads/mine error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
