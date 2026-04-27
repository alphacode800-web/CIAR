import { NextRequest, NextResponse } from "next/server"
import { Role } from "@prisma/client"
import { TOKEN_COOKIE_KEY } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { registerSchema } from "@/schemas/auth.schema"
import { registerUser } from "@/services/auth.service"

export async function POST(request: NextRequest) {
  try {
    const parsed = registerSchema.safeParse(await request.json())
    if (!parsed.success) {
      return fail("Validation failed", 422)
    }

    const result = await registerUser({
      ...parsed.data,
      role: (parsed.data.role as Role | undefined) ?? Role.USER,
    })

    if (!result) {
      return fail("Email already registered", 409)
    }

    const response = ok(result, 201)
    response.cookies.set(TOKEN_COOKIE_KEY, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error("Register error:", error)
    return fail("Registration failed", 500)
  }
}
