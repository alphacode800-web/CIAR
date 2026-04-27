import { Role } from "@prisma/client"
import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { hasRole, requireAuth } from "@/middleware/auth.middleware"
import { updateProductSchema } from "@/schemas/product.schema"
import { getProductById } from "@/services/product.service"

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(_: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const product = await getProductById(id)
    if (!product) return fail("Product not found", 404)
    return ok({ product })
  } catch (error) {
    console.error("Product details error:", error)
    return fail("Failed to fetch product", 500)
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const user = await requireAuth(request)
    if (!user) return fail("Unauthorized", 401)

    const { id } = await context.params
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    })
    if (!product) return fail("Product not found", 404)

    const canDelete = hasRole(user, [Role.ADMIN]) || (user.role === Role.SELLER && user.id === product.sellerId)
    if (!canDelete) return fail("Forbidden", 403)

    await prisma.product.delete({ where: { id } })
    return ok({ deleted: true })
  } catch (error) {
    console.error("Product delete error:", error)
    return fail("Failed to delete product", 500)
  }
}

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const user = await requireAuth(request)
    if (!user) return fail("Unauthorized", 401)

    const { id } = await context.params
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    })
    if (!product) return fail("Product not found", 404)

    const canUpdate = hasRole(user, [Role.ADMIN]) || (user.role === Role.SELLER && user.id === product.sellerId)
    if (!canUpdate) return fail("Forbidden", 403)

    const parsed = updateProductSchema.safeParse(await request.json())
    if (!parsed.success) return fail("Validation failed", 422)

    const body = parsed.data

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        price: typeof body.price === "number" ? body.price : undefined,
        images: body.images,
        stock: body.stock,
        categoryId: body.categoryId,
      },
    })

    return ok({ product: { ...updated, price: Number(updated.price) } })
  } catch (error) {
    console.error("Product update error:", error)
    return fail("Failed to update product", 500)
  }
}

