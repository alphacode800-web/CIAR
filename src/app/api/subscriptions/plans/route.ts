import { NextResponse } from "next/server"
import { getSubscriptionPlansConfig } from "@/services/advertiser-subscription.service"
import { getEnabledPlans } from "@/lib/advertiser-subscription"

export async function GET() {
  try {
    const config = await getSubscriptionPlansConfig()
    return NextResponse.json({
      paymentsEnabled: config.paymentsEnabled,
      requireSubscription: config.requireSubscription,
      currency: config.currency,
      bankNameAr: config.bankNameAr,
      bankNameEn: config.bankNameEn,
      bankAccount: config.bankAccount,
      bankIban: config.bankIban,
      paymentNoteAr: config.paymentNoteAr,
      paymentNoteEn: config.paymentNoteEn,
      plans: getEnabledPlans(config),
    })
  } catch (error) {
    console.error("GET /api/subscriptions/plans error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
