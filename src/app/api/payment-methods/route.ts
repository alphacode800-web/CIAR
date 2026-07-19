import { NextResponse } from "next/server"
import { getEnabledPaymentMethods } from "@/lib/site-payment-methods"
import { getSitePaymentMethodsStore } from "@/services/site-payment-methods.service"

export async function GET() {
  try {
    const store = await getSitePaymentMethodsStore()
    return NextResponse.json({ methods: getEnabledPaymentMethods(store) })
  } catch (error) {
    console.error("GET /api/payment-methods error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
