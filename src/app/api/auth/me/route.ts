import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const parts = token.split(".")
    if (parts.length !== 3) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString())
    if (payload.exp && Date.now() > payload.exp) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
