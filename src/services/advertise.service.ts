import { db } from "@/lib/db"
import type { AdNotifyChannel } from "@/lib/ad-notify"
import type { AdProductDetails } from "@/lib/ad-product-details"
import { serializeAdProductDetails } from "@/lib/ad-product-details"
import { appendAdImageToImageStrip } from "@/services/image-strip-sync.service"
import { getSettings, updateSettings } from "@/services/settings.service"

export const PENDING_AD_REQUESTS_KEY = "pending_ad_requests"

export type PendingAdRequest = {
  id: string
  userId: string
  userName: string
  userEmail?: string | null
  userPhone?: string | null
  companyName: string
  senderType: string
  title: string
  description: string
  link: string
  imageUrl: string
  locale: string
  notifyVia: AdNotifyChannel
  productDetails?: AdProductDetails
  createdAt: string
}

export async function createAdSubmission(data: {
  userId: string
  companyName: string
  senderType: string
  title: string
  description: string
  link?: string
  imageUrl?: string
  locale?: string
  productDetails?: AdProductDetails
}) {
  const submission = await db.adSubmission.create({
    data: {
      userId: data.userId,
      companyName: data.companyName,
      senderType: data.senderType,
      title: data.title,
      description: data.description,
      link: data.link || "",
      imageUrl: data.imageUrl || "",
      details: serializeAdProductDetails(data.productDetails),
      locale: data.locale || "ar",
      status: "pending",
    },
    select: { id: true },
  })

  await appendAdImageToImageStrip(data.imageUrl)
  return submission
}

export async function queueAdRequestInSettings(
  data: Omit<PendingAdRequest, "id" | "createdAt">
): Promise<string> {
  const settings = await getSettings()
  const existing = settings[PENDING_AD_REQUESTS_KEY]
  let queue: PendingAdRequest[] = []

  if (existing) {
    try {
      const parsed = JSON.parse(existing) as PendingAdRequest[]
      if (Array.isArray(parsed)) queue = parsed
    } catch {
      queue = []
    }
  }

  const id = `ad-${Date.now()}`
  queue.unshift({
    ...data,
    id,
    createdAt: new Date().toISOString(),
  })

  await updateSettings({
    [PENDING_AD_REQUESTS_KEY]: JSON.stringify(queue.slice(0, 200)),
  })

  await appendAdImageToImageStrip(data.imageUrl)

  return id
}
