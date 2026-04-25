import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

const ADMIN_USERNAME = "CIAR-800"
const ADMIN_PASSWORD = "CIAR100-800"
const ADMIN_USER = {
  id: "admin-ciar-800",
  name: ADMIN_USERNAME,
  email: "admin@ciar.local",
  role: "admin",
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

function createToken(payload: Record<string, string>, secret: string, expiryMs: number): string {
  const header = { alg: "HS256", typ: "JWT" }
  const now = Date.now()
  const jwtPayload = { ...payload, iat: now, exp: now + expiryMs }
  const base64Url = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url")
  const signatureInput = `${base64Url(header)}.${base64Url(jwtPayload)}`
  return `${signatureInput}.${signatureInput}`
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Dedicated fixed admin account login.
    if ((email === ADMIN_USERNAME || email === ADMIN_USER.email) && password === ADMIN_PASSWORD) {
      const token = createToken(
        {
          id: ADMIN_USER.id,
          email: ADMIN_USER.email,
          name: ADMIN_USER.name,
          role: ADMIN_USER.role,
        },
        "dev_secret",
        7 * 24 * 60 * 60 * 1000
      )

      return NextResponse.json({
        token,
        user: ADMIN_USER,
      })
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const hashedPassword = await hashPassword(password)
    if (hashedPassword !== user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

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
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
