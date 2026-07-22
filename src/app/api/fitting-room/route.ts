import { NextRequest } from "next/server"
import { z } from "zod"
import { fail, ok } from "@/lib/api-response"
import { processVirtualTryOn } from "@/services/virtual-fitting.service"

const tryOnSchema = z.object({
  userImageBase64: z.string().min(100).max(15_000_000),
  userImageMimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  garmentImageUrl: z.string().url().max(2000),
  garmentId: z.string().min(1).max(120),
  locale: z.string().max(10).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = tryOnSchema.safeParse(body)
    if (!parsed.success) {
      return fail("Invalid request payload", 400)
    }

    const result = await processVirtualTryOn(parsed.data)
    return ok(result)
  } catch (error) {
    console.error("POST /api/fitting-room error:", error)
    return fail(error instanceof Error ? error.message : "Try-on failed", 500)
  }
}

export async function GET() {
  const { getVirtualFittingProvider } = await import("@/services/virtual-fitting.service")
  return ok({ provider: getVirtualFittingProvider() })
}
