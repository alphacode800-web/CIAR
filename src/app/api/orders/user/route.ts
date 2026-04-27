import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api-response"
import { requireAuth } from "@/middleware/auth.middleware"
import { getOrdersByUser } from "@/services/order.service"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) return fail("Unauthorized", 401)

    const orders = await getOrdersByUser(user.id)
    return ok({ orders })
  } catch (error) {
    console.error("User orders error:", error)
    return fail("Failed to fetch orders", 500)
  }
}

