import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { Role, type User } from "@prisma/client"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export type AuthUser = {
  id: string
  email?: string | null
  phone?: string | null
  name: string
  role: Role
}

type JwtPayload = AuthUser & {
  iat: number
  exp: number
}

const TOKEN_COOKIE_KEY = "jomaa_token"

function getJwtSecret() {
  return process.env.JWT_SECRET || "change-me-in-production"
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, getJwtSecret(), {
    expiresIn: "7d",
  })
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as JwtPayload
}

export function extractTokenFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim()
  }

  const cookieToken = request.cookies.get(TOKEN_COOKIE_KEY)?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const token = extractTokenFromRequest(request)
  if (!token) return null

  try {
    const payload = verifyToken(token)
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      })
      if (user) {
        return {
          ...user,
          phone: null,
        }
      }
    } catch {
      // Fallback to JWT payload when database schema is behind.
    }
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? null,
      role: payload.role,
    }
  } catch {
    return null
  }
}

export function toAuthUser(user: Pick<User, "id" | "email" | "phone" | "name" | "role">): AuthUser {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    role: user.role as Role,
  }
}

export { TOKEN_COOKIE_KEY }

