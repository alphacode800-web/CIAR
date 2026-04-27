import { Role } from "@prisma/client"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyJwt } from "@/lib/jwt"

export type RequestUser = {
  id: string
  name: string
  email: string
  role: Role
}

export function extractRequestToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7).trim()
  return request.cookies.get("jomaa_token")?.value || null
}

export async function requireAuth(request: NextRequest): Promise<RequestUser | null> {
  const token = extractRequestToken(request)
  if (!token) return null

  try {
    const payload = verifyJwt(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true },
    })
    return user
  } catch {
    return null
  }
}

export function hasRole(user: RequestUser, roles: Role[]) {
  return roles.includes(user.role)
}

