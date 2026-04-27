import { Role } from "@prisma/client"
import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { hasRole, requireAuth } from "@/middleware/auth.middleware"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    })
    return ok({ categories })
  } catch (error) {
    console.error("Categories fetch error:", error)
    return fail("Failed to fetch categories", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) return fail("Unauthorized", 401)
    if (!hasRole(user, [Role.ADMIN])) return fail("Forbidden", 403)

    const body = (await request.json()) as { name?: string; image?: string }
    if (!body.name) return fail("Category name is required", 422)

    const created = await prisma.category.create({
      data: {
        name: body.name,
        image: body.image ?? "",
      },
    })
    return ok({ category: created }, 201)
  } catch (error) {
    console.error("Category create error:", error)
    return fail("Failed to create category", 500)
  }
}

