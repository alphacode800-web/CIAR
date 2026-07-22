import { clearPendingAdDraft, getPendingAdDraft } from "@/lib/ad-draft-storage"

export type SubmitPendingAdResult = {
  submitted: boolean
  code?: string
  error?: string
  deliveryUrl?: string
  notifyVia?: string
}

export async function submitPendingAdDraft(): Promise<SubmitPendingAdResult> {
  const draft = getPendingAdDraft()
  if (!draft) return { submitted: false }

  const token = localStorage.getItem("ciar_token")
  const res = await fetch("/api/advertise", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      companyName: draft.companyName,
      senderType: draft.senderType,
      title: draft.title,
      description: draft.description,
      link: draft.link,
      imageUrl: draft.imageUrl,
      notifyVia: draft.notifyVia,
      productDetails: draft.productDetails,
      locale: draft.locale,
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (res.status === 403 && data?.code === "SUBSCRIPTION_REQUIRED") {
    return { submitted: false, code: "SUBSCRIPTION_REQUIRED" }
  }

  if (!res.ok) {
    return {
      submitted: false,
      code: typeof data?.code === "string" ? data.code : undefined,
      error: typeof data?.error === "string" ? data.error : "FAILED",
    }
  }

  clearPendingAdDraft()
  return {
    submitted: true,
    deliveryUrl: typeof data?.deliveryUrl === "string" ? data.deliveryUrl : undefined,
    notifyVia: typeof data?.notifyVia === "string" ? data.notifyVia : undefined,
  }
}

export function pendingAdSuccessMessage(notifyVia: string | undefined, isAr: boolean): string {
  if (notifyVia === "whatsapp") {
    return isAr
      ? "تم حفظ الطلب — أكّد الإرسال عبر واتساب في النافذة المفتوحة"
      : "Request saved — confirm sending via WhatsApp in the opened window"
  }
  if (notifyVia === "email") {
    return isAr
      ? "تم حفظ الطلب — أكّد الإرسال عبر البريد في تطبيق البريد"
      : "Request saved — confirm sending via email in your mail app"
  }
  return isAr
    ? "تم إرسال طلب الإعلان بنجاح — سيتواصل معك فريقنا قريباً"
    : "Your ad request was sent — our team will contact you soon"
}
