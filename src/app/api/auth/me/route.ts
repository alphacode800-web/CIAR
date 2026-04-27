import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api-response"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return fail("Unauthorized", 401)
    }
    return ok({ user })
  } catch {
    return fail("Unauthorized", 401)
  }
}
