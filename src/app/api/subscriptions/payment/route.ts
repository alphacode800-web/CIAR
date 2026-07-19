import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAuthUser } from "@/lib/auth"
import { submitSubscriptionPayment } from "@/services/advertiser-subscription.service"

const paymentSchema = z.object({
  subscriptionId: z.string().min(1),
  paymentMethodId: z.string().min(1).max(80),
  paymentDetails: z.record(z.string().max(500)),
  paymentNote: z.string().max(1000).optional().default(""),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = paymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 })
    }

    const result = await submitSubscriptionPayment(user, parsed.data)
    return NextResponse.json({
      success: true,
      autoActivated: result.autoActivated,
      subscription: result.record,
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SUBSCRIPTION_NOT_FOUND") {
        return NextResponse.json({ error: "Subscription not found", code: "NOT_FOUND" }, { status: 404 })
      }
      if (error.message === "INVALID_STATUS") {
        return NextResponse.json({ error: "Invalid subscription status", code: "INVALID_STATUS" }, { status: 400 })
      }
      if (error.message === "PAYMENT_METHOD_NOT_FOUND") {
        return NextResponse.json({ error: "Payment method not found", code: "METHOD_NOT_FOUND" }, { status: 400 })
      }
      if (error.message === "VALIDATION_FAILED") {
        return NextResponse.json({ error: "Missing required payment fields", code: "VALIDATION_FAILED" }, { status: 400 })
      }
    }
    console.error("POST /api/subscriptions/payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
