import { Prisma, Role } from "@prisma/client"
import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { hasRole, requireAuth } from "@/middleware/auth.middleware"
import { createProductSchema } from "@/schemas/product.schema"
import { getProducts, mapProduct } from "@/services/product.service"

export async function GET() {
  try {
    const products = await getProducts()
    return ok({ products })
  } catch (error) {
    console.error("Products fetch error:", error)
    return fail("Failed to fetch products", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) return fail("Unauthorized", 401)
    if (!hasRole(user, [Role.ADMIN, Role.SELLER])) return fail("Forbidden", 403)

    const parsed = createProductSchema.safeParse(await request.json())
    if (!parsed.success) return fail("Validation failed", 422)

    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
      select: { id: true },
    })
    if (!category) return fail("Category not found", 404)

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        price: new Prisma.Decimal(parsed.data.price),
        sellerId: user.id,
      },
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return ok({ product: mapProduct(product) }, 201)
  } catch (error) {
    console.error("Product creation error:", error)
    return fail("Failed to create product", 500)
  }
}

