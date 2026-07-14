import type { AdProductDetails } from "@/lib/ad-product-details"

export const SITE_ADS_SETTINGS_KEY = "site_ads_v1"

export const AD_POSITIONS = ["slot_1", "slot_2"] as const
export type AdPosition = (typeof AD_POSITIONS)[number]

export const AD_PLACEMENTS = [
  "home_after_platforms",
  "home_before_why",
  "projects_top",
  "platform_details",
] as const
export type AdPlacement = (typeof AD_PLACEMENTS)[number]

export const AD_STATUSES = ["pending", "active", "rejected", "expired"] as const
export type AdStatus = (typeof AD_STATUSES)[number]

export const AD_DURATION_OPTIONS = [7, 14, 30, 60, 90] as const

export type SiteAdRecord = {
  id: string
  submissionId?: string
  userId?: string
  userName?: string
  companyName: string
  title: string
  description: string
  link: string
  imageUrl: string
  placement: AdPlacement
  position: AdPosition
  durationDays: number
  startsAt: string
  endsAt: string
  status: AdStatus
  locale: string
  createdAt: string
  updatedAt: string
  isDefault?: boolean
  productDetails?: AdProductDetails
}

export type PendingAdRequestItem = {
  id: string
  source: "database" | "settings_queue"
  userId?: string
  userName?: string
  companyName: string
  title: string
  description: string
  link: string
  imageUrl: string
  locale: string
  status: string
  createdAt: string
  productDetails?: AdProductDetails
}

export const AD_PLACEMENT_META: Record<
  AdPlacement,
  { labelAr: string; labelEn: string; previewHintAr: string }
> = {
  home_after_platforms: {
    labelAr: "الصفحة الرئيسية — بعد بطاقات المنصات",
    labelEn: "Homepage — after platform cards",
    previewHintAr: "يظهر بين قسم المنصات وقسم التوصيات الذكية",
  },
  home_before_why: {
    labelAr: "الصفحة الرئيسية — قبل «لماذا تختارنا»",
    labelEn: "Homepage — before Why Choose Us",
    previewHintAr: "يظهر بعد التوصيات وقبل قسم لماذا تختارنا",
  },
  projects_top: {
    labelAr: "صفحة المنصات — أعلى الصفحة",
    labelEn: "Projects page — top banner",
    previewHintAr: "شريط عريض أعلى قائمة المنصات",
  },
  platform_details: {
    labelAr: "صفحة تفاصيل المنصة — وسط المحتوى",
    labelEn: "Platform details — mid content",
    previewHintAr: "بطاقة إعلانية داخل صفحة المنصة المحددة",
  },
}

export const AD_POSITION_META: Record<AdPosition, { labelAr: string; labelEn: string }> = {
  slot_1: { labelAr: "الموضع الأول", labelEn: "First slot" },
  slot_2: { labelAr: "الموضع الثاني", labelEn: "Second slot" },
}

export function getPlacementLabel(placement: AdPlacement, locale: "ar" | "en") {
  const meta = AD_PLACEMENT_META[placement]
  return locale === "ar" ? meta.labelAr : meta.labelEn
}

export function getPositionLabel(position: AdPosition, locale: "ar" | "en") {
  const meta = AD_POSITION_META[position]
  return locale === "ar" ? meta.labelAr : meta.labelEn
}

export function computeAdEndDate(startIso: string, durationDays: number): string {
  const start = new Date(startIso)
  const end = new Date(start)
  end.setDate(end.getDate() + Math.max(1, durationDays))
  return end.toISOString()
}

export function isAdCurrentlyActive(ad: SiteAdRecord, now = new Date()): boolean {
  if (ad.status !== "active") return false
  const start = new Date(ad.startsAt)
  const end = new Date(ad.endsAt)
  return now >= start && now <= end
}

export function refreshAdExpiry(ad: SiteAdRecord, now = new Date()): SiteAdRecord {
  if (ad.status !== "active") return ad
  if (new Date(ad.endsAt) < now) {
    return { ...ad, status: "expired", updatedAt: now.toISOString() }
  }
  return ad
}

export function parseSiteAds(raw: string | undefined): SiteAdRecord[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as SiteAdRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function serializeSiteAds(ads: SiteAdRecord[]): string {
  return JSON.stringify(ads.slice(0, 300))
}
