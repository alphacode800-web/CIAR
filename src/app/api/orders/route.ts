import { Prisma } from "@prisma/client"
import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/middleware/auth.middleware"
import { checkoutOrderSchema } from "@/schemas/order.schema"
import { mapOrder } from "@/services/order.service"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) return fail("Unauthorized", 401)

    const parsed = checkoutOrderSchema.safeParse(await request.json())
    if (!parsed.success) return fail("Validation failed", 422)

    const productIds = parsed.data.items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, stock: true, title: true },
    })
    if (products.length !== productIds.length) return fail("One or more products not found", 404)

    const productMap = new Map(products.map((product) => [product.id, product]))
    let totalPrice = new Prisma.Decimal(0)

    for (const item of parsed.data.items) {
      const product = productMap.get(item.productId)
      if (!product) return fail("One or more products not found", 404)
      if (product.stock < item.quantity) {
        return fail(`Insufficient stock for product: ${product.title}`, 400)
      }
      totalPrice = totalPrice.plus(product.price.mul(item.quantity))
    }

    const created = await prisma.$transaction(async (tx) => {
      for (const item of parsed.data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      return tx.order.create({
        data: {
          userId: user.id,
          totalPrice,
          items: {
            create: parsed.data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: productMap.get(item.productId)!.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, title: true, images: true },
              },
            },
          },
        },
      })
    })

    return ok({ order: mapOrder(created) }, 201)
  } catch (error) {
    console.error("Order create error:", error)
    return fail("Failed to create order", 500)
  }
}

