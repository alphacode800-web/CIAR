import { OrderStatus, Role } from "@prisma/client"
import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { hasRole, requireAuth } from "@/middleware/auth.middleware"
import { updateOrderStatusSchema } from "@/schemas/order.schema"

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) return fail("Unauthorized", 401)
    if (!hasRole(user, [Role.ADMIN])) return fail("Forbidden", 403)

    const parsed = updateOrderStatusSchema.safeParse(await request.json())
    if (!parsed.success) return fail("Validation failed", 422)

    const order = await prisma.order.update({
      where: { id: parsed.data.orderId },
      data: { status: parsed.data.status as OrderStatus },
    })

    return ok({ order: { ...order, totalPrice: Number(order.totalPrice) } })
  } catch (error) {
    console.error("Order status update error:", error)
    return fail("Failed to update order status", 500)
  }
}

