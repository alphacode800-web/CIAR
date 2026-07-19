import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAuthUser } from "@/lib/auth"
import { startSubscriptionCheckout } from "@/services/advertiser-subscription.service"

const checkoutSchema = z.object({
  planId: z.string().min(1).max(80),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 })
    }

    const result = await startSubscriptionCheckout(user, parsed.data.planId)
    return NextResponse.json({
      success: true,
      subscriptionId: result.record.id,
      plan: result.plan,
      amount: result.record.amount,
      currency: result.record.currency,
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PLAN_NOT_FOUND") {
        return NextResponse.json({ error: "Plan not found", code: "PLAN_NOT_FOUND" }, { status: 404 })
      }
      if (error.message === "ALREADY_ACTIVE") {
        return NextResponse.json({ error: "Already subscribed", code: "ALREADY_ACTIVE" }, { status: 409 })
      }
    }
    console.error("POST /api/subscriptions/checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
