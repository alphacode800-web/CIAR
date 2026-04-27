import { Role } from "@prisma/client"
import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { hasRole, requireAuth } from "@/middleware/auth.middleware"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) return fail("Unauthorized", 401)
    if (!hasRole(user, [Role.ADMIN])) return fail("Forbidden", 403)

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    return ok({ users })
  } catch (error) {
    console.error("Users fetch error:", error)
    return fail("Failed to fetch users", 500)
  }
}

