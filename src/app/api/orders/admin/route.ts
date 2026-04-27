import { Role } from "@prisma/client"
import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api-response"
import { hasRole, requireAuth } from "@/middleware/auth.middleware"
import { getAllOrders } from "@/services/order.service"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) return fail("Unauthorized", 401)
    if (!hasRole(user, [Role.ADMIN])) return fail("Forbidden", 403)

    const orders = await getAllOrders()
    return ok({ orders })
  } catch (error) {
    console.error("Admin orders error:", error)
    return fail("Failed to fetch orders", 500)
  }
}

