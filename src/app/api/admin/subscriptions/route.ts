import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  activateSubscriptionRecord,
  getSubscriptionPlansConfig,
  getUserSubscriptionsStore,
  rejectSubscriptionPayment,
  removeExemptUser,
  revokeUserSubscription,
  saveSubscriptionPlansConfig,
  setPaymentsEnabled,
  waiveUserSubscription,
} from "@/services/advertiser-subscription.service"
import { subscriptionPlansConfigSchema } from "@/lib/advertiser-subscription"
import { sitePaymentMethodsStoreSchema } from "@/lib/site-payment-methods"
import { getSitePaymentMethodsStore, saveSitePaymentMethodsStore } from "@/services/site-payment-methods.service"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [plans, store, paymentMethods] = await Promise.all([
      getSubscriptionPlansConfig(),
      getUserSubscriptionsStore(),
      getSitePaymentMethodsStore(),
    ])
    return NextResponse.json({ plans, subscriptions: store.records, paymentMethods })
  } catch (error) {
    console.error("GET /api/admin/subscriptions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const waiveSchema = z.object({
  userId: z.string().min(1),
  adminNote: z.string().max(500).optional(),
  durationDays: z.coerce.number().int().min(0).max(3650).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.action === "save_plans") {
      const parsed = subscriptionPlansConfigSchema.safeParse(body.plans)
      if (!parsed.success) {
        return NextResponse.json({ error: "Validation error" }, { status: 400 })
      }
      const plans = await saveSubscriptionPlansConfig(parsed.data)
      return NextResponse.json({ success: true, plans })
    }

    if (body.action === "save_payment_methods") {
      const parsed = sitePaymentMethodsStoreSchema.safeParse(body.paymentMethods)
      if (!parsed.success) {
        return NextResponse.json({ error: "Validation error" }, { status: 400 })
      }
      const paymentMethods = await saveSitePaymentMethodsStore(parsed.data)
      return NextResponse.json({ success: true, paymentMethods })
    }

    if (body.action === "activate") {
      const subscriptionId = String(body.subscriptionId || "")
      if (!subscriptionId) {
        return NextResponse.json({ error: "subscriptionId required" }, { status: 400 })
      }
      const store = await activateSubscriptionRecord(subscriptionId, body.adminNote)
      return NextResponse.json({ success: true, subscriptions: store.records })
    }

    if (body.action === "reject") {
      const subscriptionId = String(body.subscriptionId || "")
      if (!subscriptionId) {
        return NextResponse.json({ error: "subscriptionId required" }, { status: 400 })
      }
      const store = await rejectSubscriptionPayment(subscriptionId, body.adminNote)
      return NextResponse.json({ success: true, subscriptions: store.records })
    }

    if (body.action === "waive") {
      const parsed = waiveSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: "Validation error" }, { status: 400 })
      }
      let userName = body.userName as string | undefined
      let userEmail = body.userEmail as string | null | undefined
      let userPhone = body.userPhone as string | null | undefined
      try {
        const user = await prisma.user.findUnique({
          where: { id: parsed.data.userId },
          select: { name: true, email: true, phone: true },
        })
        if (user) {
          userName = user.name
          userEmail = user.email
          userPhone = user.phone
        }
      } catch {
        // optional lookup
      }
      const store = await waiveUserSubscription(parsed.data.userId, {
        adminNote: parsed.data.adminNote,
        durationDays: parsed.data.durationDays,
        userName,
        userEmail,
        userPhone,
      })
      const plans = await getSubscriptionPlansConfig()
      return NextResponse.json({ success: true, subscriptions: store.records, plans })
    }

    if (body.action === "revoke") {
      const userId = String(body.userId || "")
      if (!userId) {
        return NextResponse.json({ error: "userId required" }, { status: 400 })
      }
      const store = await revokeUserSubscription(userId, body.adminNote)
      const plans = await getSubscriptionPlansConfig()
      return NextResponse.json({ success: true, subscriptions: store.records, plans })
    }

    if (body.action === "enable_free_for_all") {
      const plans = await setPaymentsEnabled(false)
      return NextResponse.json({ success: true, plans })
    }

    if (body.action === "enable_payments") {
      const plans = await setPaymentsEnabled(true)
      return NextResponse.json({ success: true, plans })
    }

    if (body.action === "remove_exempt") {
      const userId = String(body.userId || "")
      if (!userId) {
        return NextResponse.json({ error: "userId required" }, { status: 400 })
      }
      const plans = await removeExemptUser(userId)
      return NextResponse.json({ success: true, plans })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("POST /api/admin/subscriptions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
