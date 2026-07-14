import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAuthUser, type AuthUser } from "@/lib/auth"
import { resolveAdDeliveryUrl, type AdNotifyChannel } from "@/lib/ad-notify"
import { CONTACT_SENDER_TYPE_IDS } from "@/lib/contact-sender-types"
import { normalizeOptionalUrl } from "@/lib/optional-url"
import { prisma } from "@/lib/prisma"
import {
  createAdSubmission,
  queueAdRequestInSettings,
} from "@/services/advertise.service"
import { submitContact } from "@/services/contact.service"
import { getSettings } from "@/services/settings.service"
import { withSiteContactDefaults } from "@/lib/site-contact"
import { adProductDetailsSchema } from "@/lib/ad-product-details"

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
  imageUrl: z
    .preprocess((value) => normalizeOptionalUrl(value), z.string().max(500))
    .optional()
    .default(""),
  locale: z.string().optional().default("ar"),
  notifyVia: z.enum(["email", "whatsapp"]),
  productDetails: adProductDetailsSchema.optional(),
})

function channelLabel(channel: AdNotifyChannel) {
  return channel === "whatsapp" ? "واتساب" : "بريد إلكتروني"
}

function buildAdMessage(user: AuthUser, data: z.infer<typeof adSchema>) {
  return [
    `المستخدم: ${user.name}`,
    user.email ? `البريد: ${user.email}` : null,
    user.phone ? `الهاتف: ${user.phone}` : null,
    `معرّف المستخدم: ${user.id}`,
    `قناة الإرسال المختارة: ${channelLabel(data.notifyVia)}`,
    `الجهة: ${data.companyName}`,
    `التصنيف: ${data.senderType}`,
    `الرابط: ${data.link || "—"}`,
    `صورة: ${data.imageUrl || "—"}`,
    data.productDetails?.fabricTypes?.length ? `الأقمشة: ${data.productDetails.fabricTypes.join("، ")}` : null,
    data.productDetails?.colors?.length ? `الألوان: ${data.productDetails.colors.join("، ")}` : null,
    data.productDetails?.sizes?.length ? `المقاسات: ${data.productDetails.sizes.join("، ")}` : null,
    typeof data.productDetails?.stockRemaining === "number" ? `المتبقي: ${data.productDetails.stockRemaining}` : null,
    typeof data.productDetails?.price === "number" ? `السعر: ${data.productDetails.price} ${data.productDetails.currency || "SAR"}` : null,
    typeof data.productDetails?.discountPercent === "number" ? `الحسم: ${data.productDetails.discountPercent}%` : null,
    data.productDetails?.shippingInfo ? `الشحن: ${data.productDetails.shippingInfo}` : null,
    data.productDetails?.contactPhone ? `هاتف: ${data.productDetails.contactPhone}` : null,
    data.productDetails?.whatsappLink ? `واتساب: ${data.productDetails.whatsappLink}` : null,
    "",
    data.description,
  ]
    .filter(Boolean)
    .join("\n")
}

async function userExistsInDb(userId: string): Promise<boolean> {
  try {
    const row = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })
    return Boolean(row)
  } catch {
    return false
  }
}

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

    if (data.notifyVia === "email" && !user.email) {
      return NextResponse.json(
        { error: "Email required on your account for this channel", code: "EMAIL_REQUIRED" },
        { status: 400 }
      )
    }

    if (data.notifyVia === "whatsapp" && !user.phone) {
      return NextResponse.json(
        { error: "Phone required on your account for this channel", code: "PHONE_REQUIRED" },
        { status: 400 }
      )
    }

    const message = buildAdMessage(user, data)
    let contactId: string | null = null
    let adId: string | null = null

    try {
      const contact = await submitContact({
        name: user.name || data.companyName,
        email: user.email || undefined,
        phone: user.phone || undefined,
        senderType: data.senderType,
        subject: `[إعلان] ${data.title}`,
        message,
        locale: data.locale,
      })
      contactId = contact.id
    } catch (contactError) {
      console.error("Ad contact save failed:", contactError)
    }

    if (await userExistsInDb(user.id)) {
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
          productDetails: data.productDetails,
        })
        adId = submission.id
      } catch (adError) {
        console.error("AdSubmission save failed:", adError)
      }
    }

    const settings = withSiteContactDefaults(await getSettings())
    const deliveryUrl = resolveAdDeliveryUrl(settings, {
      companyName: data.companyName,
      title: data.title,
      description: data.description,
      senderType: data.senderType,
      link: data.link,
      imageUrl: data.imageUrl,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      notifyVia: data.notifyVia,
      locale: data.locale,
    })

    if (contactId || adId) {
      return NextResponse.json({
        success: true,
        id: adId || contactId,
        via: adId ? "ad_submission" : "contact",
        notifyVia: data.notifyVia,
        deliveryUrl,
      })
    }

    try {
      const queuedId = await queueAdRequestInSettings({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        companyName: data.companyName,
        senderType: data.senderType,
        title: data.title,
        description: data.description,
        link: data.link || "",
        imageUrl: data.imageUrl || "",
        locale: data.locale,
        notifyVia: data.notifyVia,
        productDetails: data.productDetails,
      })
      return NextResponse.json({
        success: true,
        id: queuedId,
        via: "settings_queue",
        notifyVia: data.notifyVia,
        deliveryUrl,
      })
    } catch (queueError) {
      console.error("Ad settings queue failed:", queueError)
      return NextResponse.json(
        {
          error: "Database unavailable",
          code: "DB_ERROR",
          hint: "تحقق من ضبط DATABASE_URL في Netlify ثم أعد النشر",
        },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error("POST /api/advertise error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
