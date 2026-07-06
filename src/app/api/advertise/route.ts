import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAuthUser } from "@/lib/auth"
import { CONTACT_SENDER_TYPE_IDS } from "@/lib/contact-sender-types"
import { normalizeOptionalUrl } from "@/lib/optional-url"
import { createAdSubmission } from "@/services/advertise.service"
import { submitContact } from "@/services/contact.service"

const optionalUrlSchema = z.preprocess(
  (value) => normalizeOptionalUrl(value),
  z.union([z.literal(""), z.string().url()])
)

const adSchema = z.object({
  companyName: z.string().min(2).max(120),
  senderType: z.enum(CONTACT_SENDER_TYPE_IDS),
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(5000),
  link: optionalUrlSchema.optional().default(""),
  imageUrl: z.preprocess(
    (value) => normalizeOptionalUrl(value),
    z.string().max(500)
  ).optional().default(""),
  locale: z.string().optional().default("ar"),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: "Subscription required", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = adSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    try {
      const submission = await createAdSubmission({
        userId: user.id,
        companyName: data.companyName,
        senderType: data.senderType,
        title: data.title,
        description: data.description,
        link: data.link || "",
        imageUrl: data.imageUrl || "",
        locale: data.locale,
      })
      return NextResponse.json({ success: true, id: submission.id })
    } catch (dbError) {
      console.error("AdSubmission DB fallback:", dbError)
      try {
        const contact = await submitContact({
          name: user.name,
          email: user.email || undefined,
          phone: user.phone || undefined,
          senderType: data.senderType,
          subject: `[إعلان] ${data.title}`,
          message: [
            `الجهة: ${data.companyName}`,
            `التصنيف: ${data.senderType}`,
            `الرابط: ${data.link || "—"}`,
            `صورة: ${data.imageUrl || "—"}`,
            "",
            data.description,
          ].join("\n"),
          locale: data.locale,
        })
        return NextResponse.json({ success: true, id: contact.id, fallback: true })
      } catch (contactError) {
        console.error("AdSubmission contact fallback failed:", contactError)
        return NextResponse.json(
          { error: "Database unavailable", code: "DB_ERROR" },
          { status: 503 }
        )
      }
    }
  } catch (error) {
    console.error("POST /api/advertise error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
