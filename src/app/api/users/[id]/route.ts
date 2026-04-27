import { Role } from "@prisma/client"
import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { hasRole, requireAuth } from "@/middleware/auth.middleware"

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser) return fail("Unauthorized", 401)
    if (!hasRole(currentUser, [Role.ADMIN])) return fail("Forbidden", 403)

    const { id } = await context.params
    await prisma.user.delete({ where: { id } })
    return ok({ deleted: true })
  } catch (error) {
    console.error("User delete error:", error)
    return fail("Failed to delete user", 500)
  }
}

