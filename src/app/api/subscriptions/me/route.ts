import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { canPostAdvertisement, requiresAdvertiserPayment } from "@/lib/advertiser-subscription"
import {
  getSubscriptionPlansConfig,
  getUserSubscriptionStatus,
  getUserSubscriptionsStore,
} from "@/services/advertiser-subscription.service"
import { getActiveUserSubscription } from "@/lib/advertiser-subscription"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 })
    }

    const status = await getUserSubscriptionStatus(user.id)
    const config = await getSubscriptionPlansConfig()
    const store = await getUserSubscriptionsStore()
    const active = getActiveUserSubscription(store, user.id)

    return NextResponse.json({
      ...status,
      canPost: canPostAdvertisement(user, active, config),
      requiresPayment: requiresAdvertiserPayment(user, active, config),
      paymentsEnabled: config.paymentsEnabled,
      isExempt: status.isExempt,
    })
  } catch (error) {
    console.error("GET /api/subscriptions/me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
