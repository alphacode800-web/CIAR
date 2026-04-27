import { Role } from "@prisma/client"
import { NextRequest } from "next/server"
import { getAuthUser, type AuthUser } from "@/lib/auth"

export async function requireAuth(request: NextRequest): Promise<AuthUser | null> {
  return getAuthUser(request)
}

export function hasAnyRole(user: AuthUser, roles: Role[]) {
  return roles.includes(user.role)
}

