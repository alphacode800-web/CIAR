import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { signJwt } from "@/lib/jwt"
import { hashPassword, comparePassword } from "@/lib/bcrypt"

const ADMIN_USERNAME = "CIAR800"
const ADMIN_PASSWORD = "CIAR-8000"

export async function registerUser(input: {
  name: string
  email?: string
  phone?: string
  password: string
  role?: Role
}) {
  const normalizedEmail = input.email?.trim().toLowerCase()
  const normalizedPhone = input.phone ? input.phone.replace(/[^\d+]/g, "") : undefined
  const identityFilters: Array<{ email?: string; phone?: string }> = []
  if (normalizedEmail) identityFilters.push({ email: normalizedEmail })
  if (normalizedPhone) identityFilters.push({ phone: normalizedPhone })
  const existing = await prisma.user.findFirst({
    where: {
      OR: identityFilters,
    },
  })
  if (existing) return null

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: await hashPassword(input.password),
      role: input.role ?? Role.USER,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  })

  const authUser = { id: user.id, email: user.email, phone: user.phone, name: user.name, role: user.role }
  const token = signJwt(authUser)
  return { user: authUser, token }
}

export async function loginUser(input: { identifier: string; password: string }) {
  const normalizedIdentifier = input.identifier.trim()
  const normalizedPhone = normalizedIdentifier.replace(/[^\d+]/g, "")
  const isDefaultAdminLogin =
    normalizedIdentifier.toUpperCase() === ADMIN_USERNAME && input.password === ADMIN_PASSWORD

  if (isDefaultAdminLogin) {
    const authUser = {
      id: "ciar-admin",
      email: ADMIN_USERNAME.toLowerCase(),
      phone: null,
      name: "CIAR Admin",
      role: Role.ADMIN,
    }
    const token = signJwt(authUser)
    return { user: authUser, token }
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normalizedIdentifier.toLowerCase() },
        { phone: normalizedPhone },
      ],
    },
  })
  if (!user) return null

  const validPassword = await comparePassword(input.password, user.password)
  if (!validPassword) return null

  const authUser = { id: user.id, email: user.email, phone: user.phone, name: user.name, role: user.role }
  const token = signJwt(authUser)
  return { user: authUser, token }
}

