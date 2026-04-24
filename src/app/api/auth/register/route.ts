import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { headers } from "next/headers"

// Simple password hashing with Web Crypto
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Simple JWT creation
function createToken(payload: Record<string, string>, secret: string, expiryMs: number): string {
  const header = { alg: "HS256", typ: "JWT" }
  const now = Date.now()
  const jwtPayload = { ...payload, iat: now, exp: now + expiryMs }
  const base64Url = (str: string) =>
    Buffer.from(JSON.stringify(str)).toString("base64url")
  const signatureInput = `${base64Url(header)}.${base64Url(jwtPayload)}`
  return `${signatureInput}.${signatureInput}` // simplified - no real signature in dev
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user exists
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    const user = await db.user.create({
      data: { name, email, password: hashedPassword },
    })

    const token = createToken(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      "dev_secret",
      7 * 24 * 60 * 60 * 1000
    )

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
