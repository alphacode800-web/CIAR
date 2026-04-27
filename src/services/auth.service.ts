import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { signToken } from "@/lib/jwt"
import { hashPassword, comparePassword } from "@/lib/bcrypt"

export async function registerUser(input: {
  name: string
  email: string
  password: string
  role?: Role
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) return null

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: await hashPassword(input.password),
      role: input.role ?? Role.USER,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })

  const authUser = { id: user.id, email: user.email, name: user.name, role: user.role }
  const token = signToken(authUser)
  return { user: authUser, token }
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  })
  if (!user) return null

  const validPassword = await comparePassword(input.password, user.password)
  if (!validPassword) return null

  const authUser = { id: user.id, email: user.email, name: user.name, role: user.role }
  const token = signToken(authUser)
  return { user: authUser, token }
}

