import { db } from "@/lib/db"
import {
  computeAdEndDate,
  parseSiteAds,
  refreshAdExpiry,
  serializeSiteAds,
  SITE_ADS_SETTINGS_KEY,
  type AdPlacement,
  type AdPosition,
  type AdStatus,
  type PendingAdRequestItem,
  type SiteAdRecord,
} from "@/lib/site-ads"
import { PENDING_AD_REQUESTS_KEY, type PendingAdRequest } from "@/services/advertise.service"
import { getSettings, updateSettings } from "@/services/settings.service"
import { buildDefaultSiteAds, getDefaultSiteAdsForSlot } from "@/lib/default-site-ads"
import { parseAdProductDetails, type AdProductDetails } from "@/lib/ad-product-details"
import { appendAdImageToImageStrip } from "@/services/image-strip-sync.service"

async function loadAdsRaw(): Promise<SiteAdRecord[]> {
  const settings = await getSettings()
  const raw = settings[SITE_ADS_SETTINGS_KEY]
  let original = parseSiteAds(raw)

  const shouldSeedDefaults = raw === undefined || raw === "" || raw === "[]"
  if (shouldSeedDefaults) {
    original = buildDefaultSiteAds()
    await updateSettings({ [SITE_ADS_SETTINGS_KEY]: serializeSiteAds(original) })
  }
  const ads = original.map(refreshAdExpiry)
  const changed = ads.some((ad, index) => ad.status !== original[index]?.status)
  if (changed) {
    await updateSettings({ [SITE_ADS_SETTINGS_KEY]: serializeSiteAds(ads) })
  }
  return ads
}

async function saveAds(ads: SiteAdRecord[]) {
  await updateSettings({ [SITE_ADS_SETTINGS_KEY]: serializeSiteAds(ads) })
}

function isAdLive(ad: SiteAdRecord, now: Date) {
  const refreshed = refreshAdExpiry(ad, now)
  return refreshed.status === "active" && new Date(refreshed.endsAt) >= now
}

export async function listManagedAds(): Promise<SiteAdRecord[]> {
  return loadAdsRaw()
}

export async function listPendingAdRequests(): Promise<PendingAdRequestItem[]> {
  const [dbRows, settings] = await Promise.all([
    db.adSubmission.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        userId: true,
        companyName: true,
        title: true,
        description: true,
        link: true,
        imageUrl: true,
        locale: true,
        status: true,
        details: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    getSettings(),
  ])

  const queueRaw = settings[PENDING_AD_REQUESTS_KEY]
  let queue: PendingAdRequest[] = []
  if (queueRaw) {
    try {
      const parsed = JSON.parse(queueRaw) as PendingAdRequest[]
      if (Array.isArray(parsed)) queue = parsed
    } catch {
      queue = []
    }
  }

  const fromDb: PendingAdRequestItem[] = dbRows.map((row) => ({
    id: row.id,
    source: "database",
    userId: row.userId,
    userName: row.user?.name,
    companyName: row.companyName,
    title: row.title,
    description: row.description,
    link: row.link,
    imageUrl: row.imageUrl,
    locale: row.locale,
    status: row.status,
    productDetails: parseAdProductDetails(row.details),
    createdAt: row.createdAt.toISOString(),
  }))

  const fromQueue: PendingAdRequestItem[] = queue.map((item) => ({
    id: item.id,
    source: "settings_queue",
    userId: item.userId,
    userName: item.userName,
    companyName: item.companyName,
    title: item.title,
    description: item.description,
    link: item.link,
    imageUrl: item.imageUrl,
    locale: item.locale,
    status: "pending",
    productDetails: item.productDetails,
    createdAt: item.createdAt,
  }))

  const seen = new Set<string>()
  return [...fromDb, ...fromQueue].filter((item) => {
    const key = `${item.title}-${item.companyName}-${item.createdAt}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function getActiveAds(input?: {
  placement?: AdPlacement
  position?: AdPosition
  locale?: string
}): Promise<SiteAdRecord[]> {
  const ads = await loadAdsRaw()
  const now = new Date()
  const managed = ads
    .filter((ad) => isAdLive(ad, now))
    .filter((ad) => (input?.placement ? ad.placement === input.placement : true))
    .filter((ad) => (input?.position ? ad.position === input.position : true))
    .filter((ad) => {
      if (!input?.locale) return true
      return ad.locale === input.locale || ad.locale === "ar"
    })
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())

  if (managed.length > 0) return managed

  return getDefaultSiteAdsForSlot(input)
}

export async function listAllPublicAds(locale?: string): Promise<SiteAdRecord[]> {
  const ads = await loadAdsRaw()
  const now = new Date()
  const activeManaged = ads
    .filter((ad) => isAdLive(ad, now))
    .filter((ad) => {
      if (!locale) return true
      return ad.locale === locale || ad.locale === "ar"
    })

  const occupiedSlots = new Set(activeManaged.map((ad) => `${ad.placement}:${ad.position}`))
  const defaults = getDefaultSiteAdsForSlot({ locale }).filter(
    (ad) => !occupiedSlots.has(`${ad.placement}:${ad.position}`)
  )

  return [...activeManaged, ...defaults].sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
  )
}

export async function upsertManagedAd(
  input: Partial<SiteAdRecord> & {
    companyName: string
    title: string
    description: string
    placement: AdPlacement
    position: AdPosition
    durationDays: number
  }
): Promise<SiteAdRecord> {
  const ads = await loadAdsRaw()
  const nowIso = new Date().toISOString()
  const startsAt = input.startsAt || nowIso
  const id = input.id || `ad-${Date.now()}`

  const next: SiteAdRecord = {
    id,
    submissionId: input.submissionId,
    userId: input.userId,
    userName: input.userName,
    companyName: input.companyName,
    title: input.title,
    description: input.description,
    link: input.link || "",
    imageUrl: input.imageUrl || "",
    placement: input.placement,
    position: input.position,
    durationDays: input.durationDays,
    startsAt,
    endsAt: input.endsAt || computeAdEndDate(startsAt, input.durationDays),
    status: (input.status as AdStatus) || "active",
    locale: input.locale || "ar",
    createdAt: input.createdAt || nowIso,
    updatedAt: nowIso,
    productDetails: input.productDetails,
  }

  const index = ads.findIndex((ad) => ad.id === id)
  if (index >= 0) ads[index] = next
  else ads.unshift(next)

  await saveAds(ads)

  await appendAdImageToImageStrip(next.imageUrl)

  if (input.submissionId) {
    try {
      await db.adSubmission.update({
        where: { id: input.submissionId },
        data: { status: next.status === "active" ? "approved" : next.status },
      })
    } catch {
      // ignore
    }
  }

  return next
}

export async function deleteManagedAd(id: string): Promise<boolean> {
  const ads = await loadAdsRaw()
  const next = ads.filter((ad) => ad.id !== id)
  if (next.length === ads.length) return false
  await saveAds(next)
  return true
}

export async function approvePendingRequest(input: {
  pendingId: string
  source: "database" | "settings_queue"
  placement: AdPlacement
  position: AdPosition
  durationDays: number
  startsAt?: string
  productDetails?: AdProductDetails
  title?: string
  description?: string
  link?: string
  imageUrl?: string
}): Promise<SiteAdRecord> {
  const pending = (await listPendingAdRequests()).find((item) => item.id === input.pendingId)
  if (!pending) throw new Error("PENDING_NOT_FOUND")

  const mergedDetails: AdProductDetails = {
    ...pending.productDetails,
    ...input.productDetails,
    requestedPlacement: input.placement,
    requestedPosition: input.position,
    requestedDurationDays: input.durationDays,
  }

  const ad = await upsertManagedAd({
    submissionId: input.source === "database" ? pending.id : undefined,
    userId: pending.userId,
    userName: pending.userName,
    companyName: pending.companyName,
    title: input.title || pending.title,
    description: input.description || pending.description,
    link: input.link ?? pending.link,
    imageUrl: input.imageUrl ?? pending.imageUrl,
    placement: input.placement,
    position: input.position,
    durationDays: input.durationDays,
    startsAt: input.startsAt,
    status: "active",
    locale: pending.locale,
    productDetails: mergedDetails,
  })

  if (input.source === "database") {
    await db.adSubmission.update({ where: { id: pending.id }, data: { status: "approved" } }).catch(() => null)
  } else {
    const settings = await getSettings()
    const queueRaw = settings[PENDING_AD_REQUESTS_KEY]
    if (queueRaw) {
      try {
        const queue = JSON.parse(queueRaw) as PendingAdRequest[]
        const filtered = Array.isArray(queue) ? queue.filter((item) => item.id !== pending.id) : []
        await updateSettings({ [PENDING_AD_REQUESTS_KEY]: JSON.stringify(filtered) })
      } catch {
        // ignore
      }
    }
  }

  return ad
}

export async function rejectPendingRequest(input: {
  pendingId: string
  source: "database" | "settings_queue"
}): Promise<void> {
  if (input.source === "database") {
    await db.adSubmission.update({
      where: { id: input.pendingId },
      data: { status: "rejected" },
    })
    return
  }

  const settings = await getSettings()
  const queueRaw = settings[PENDING_AD_REQUESTS_KEY]
  if (!queueRaw) throw new Error("PENDING_NOT_FOUND")
  const queue = JSON.parse(queueRaw) as PendingAdRequest[]
  const filtered = Array.isArray(queue) ? queue.filter((item) => item.id !== input.pendingId) : []
  if (filtered.length === queue.length) throw new Error("PENDING_NOT_FOUND")
  await updateSettings({ [PENDING_AD_REQUESTS_KEY]: JSON.stringify(filtered) })
}

export async function listAdsForUser(userId: string): Promise<SiteAdRecord[]> {
  const ads = await loadAdsRaw()
  return ads.filter((ad) => ad.userId === userId)
}
