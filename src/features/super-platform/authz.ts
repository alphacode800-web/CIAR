import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function canAccessSuperAdmin(request: NextRequest) {
  const authUser = await getAuthUser(request)
  if (!authUser) return false
  if (authUser.role === "ADMIN") return true

  const member = await prisma.adminMember.findUnique({
    where: { email: authUser.email },
    select: { isActive: true },
  })
  return Boolean(member?.isActive)
}
