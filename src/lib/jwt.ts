import jwt from "jsonwebtoken"
import { Role } from "@prisma/client"

export type JwtUserPayload = {
  id: string
  name: string
  email: string
  role: Role
}

const getJwtSecret = () => process.env.JWT_SECRET || "change-me-in-production"

export function signJwt(payload: JwtUserPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" })
}

export function verifyJwt(token: string) {
  return jwt.verify(token, getJwtSecret()) as JwtUserPayload
}

