import { SITE_CONTACT_DEFAULTS, whatsappHref } from "@/lib/site-contact"

export type AdNotifyChannel = "email" | "whatsapp"

export type AdNotifyPayload = {
  companyName: string
  title: string
  description: string
  senderType: string
  link?: string
  imageUrl?: string
  userName: string
  userEmail?: string | null
  userPhone?: string | null
  notifyVia: AdNotifyChannel
  locale?: string
}

function buildPlainBody(payload: AdNotifyPayload): string {
  const isAr = payload.locale === "ar"
  const lines = isAr
    ? [
        "طلب إعلان جديد — CIAR",
        "",
        `الجهة: ${payload.companyName}`,
        `المُعلِن: ${payload.userName}`,
        payload.userEmail ? `البريد: ${payload.userEmail}` : null,
        payload.userPhone ? `الهاتف: ${payload.userPhone}` : null,
        `التصنيف: ${payload.senderType}`,
        `قناة التواصل المفضلة: ${payload.notifyVia === "whatsapp" ? "واتساب" : "بريد إلكتروني"}`,
        `العنوان: ${payload.title}`,
        payload.link ? `الرابط: ${payload.link}` : null,
        payload.imageUrl ? `صورة: ${payload.imageUrl}` : null,
        "",
        payload.description,
      ]
    : [
        "New ad request — CIAR",
        "",
        `Organization: ${payload.companyName}`,
        `Advertiser: ${payload.userName}`,
        payload.userEmail ? `Email: ${payload.userEmail}` : null,
        payload.userPhone ? `Phone: ${payload.userPhone}` : null,
        `Category: ${payload.senderType}`,
        `Preferred channel: ${payload.notifyVia === "whatsapp" ? "WhatsApp" : "Email"}`,
        `Title: ${payload.title}`,
        payload.link ? `Link: ${payload.link}` : null,
        payload.imageUrl ? `Image: ${payload.imageUrl}` : null,
        "",
        payload.description,
      ]

  return lines.filter(Boolean).join("\n")
}

export function buildAdminAdMailto(
  adminEmail: string,
  payload: AdNotifyPayload
): string {
  const subject = encodeURIComponent(`[CIAR Ad] ${payload.title}`)
  const body = encodeURIComponent(buildPlainBody(payload))
  return `mailto:${adminEmail}?subject=${subject}&body=${body}`
}

export function buildAdminAdWhatsappUrl(
  adminWhatsapp: string,
  payload: AdNotifyPayload
): string {
  return whatsappHref(adminWhatsapp, buildPlainBody(payload))
}

export function resolveAdDeliveryUrl(
  settings: Record<string, string>,
  payload: AdNotifyPayload
): string | null {
  if (payload.notifyVia === "email") {
    const email = settings.contact_email || settings.company_email || SITE_CONTACT_DEFAULTS.contact_email
    if (!email) return null
    return buildAdminAdMailto(email, payload)
  }

  const whatsapp =
    settings.social_whatsapp || settings.contact_phone || SITE_CONTACT_DEFAULTS.social_whatsapp
  return buildAdminAdWhatsappUrl(whatsapp, payload) || null
}
