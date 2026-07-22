import type { AdProductDetails } from "@/lib/ad-product-details"
import type { AdNotifyChannel } from "@/lib/ad-notify"
import type { ContactSenderTypeId } from "@/lib/contact-sender-types"

export const PENDING_AD_DRAFT_KEY = "ciar_pending_ad_draft"

export type PendingAdDraft = {
  companyName: string
  senderType: ContactSenderTypeId
  title: string
  description: string
  link: string
  imageUrl: string
  notifyVia: AdNotifyChannel
  productDetails: AdProductDetails
  locale: string
  savedAt: string
}

export function savePendingAdDraft(draft: Omit<PendingAdDraft, "savedAt">) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(
    PENDING_AD_DRAFT_KEY,
    JSON.stringify({ ...draft, savedAt: new Date().toISOString() })
  )
}

export function getPendingAdDraft(): PendingAdDraft | null {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(PENDING_AD_DRAFT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PendingAdDraft
  } catch {
    return null
  }
}

export function clearPendingAdDraft() {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(PENDING_AD_DRAFT_KEY)
}

export function hasPendingAdDraft(): boolean {
  return Boolean(getPendingAdDraft())
}
