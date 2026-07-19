import { z } from "zod"
import {
  AD_DURATION_OPTIONS,
  AD_PLACEMENTS,
  AD_POSITIONS,
  type AdPlacement,
  type AdPosition,
} from "@/lib/site-ads"

export const AD_LISTING_TYPES = [
  "general",
  "fashion",
  "electronics",
  "real_estate",
  "vehicles",
  "food",
  "services",
  "events",
  "jobs",
  "tourism",
  "health_beauty",
  "product",
] as const
/** Dynamic listing type id — configured by admin in settings. */
export type AdListingType = string

export const AD_PAYMENT_METHODS = ["cash", "bank", "card", "whatsapp"] as const
export type AdPaymentMethod = (typeof AD_PAYMENT_METHODS)[number]

export const AD_PAYMENT_STATUSES = ["pending", "paid", "waived", "rejected"] as const
export type AdPaymentStatus = (typeof AD_PAYMENT_STATUSES)[number]

export type AdProductDetails = {
  listingType?: AdListingType
  fabricTypes?: string[]
  colors?: string[]
  sizes?: string[]
  stockRemaining?: number
  price?: number
  currency?: string
  discountPercent?: number
  shippingInfo?: string
  contactPhone?: string
  whatsappLink?: string
  paymentMethod?: AdPaymentMethod
  paymentStatus?: AdPaymentStatus
  paymentAmount?: number
  requestedPlacement?: AdPlacement
  requestedPosition?: AdPosition
  requestedDurationDays?: number
  videoUrl?: string
  videoUrls?: string[]
  brand?: string
  model?: string
  condition?: string
  warranty?: string
  propertyType?: string
  areaSqm?: number
  rooms?: string
  location?: string
  year?: number
  mileage?: number
  cuisineType?: string
  portions?: string
  shelfLife?: string
  serviceScope?: string
  availability?: string
  serviceArea?: string
  eventDate?: string
  venue?: string
  capacity?: number
  jobTitle?: string
  experienceYears?: string
  workType?: string
  salary?: number
  destination?: string
  duration?: string
  includes?: string
  productType?: string
  volume?: string
  specifications?: string
  tags?: string[]
  customFields?: Record<string, string | number | string[]>
}

const optionalString = z.string().max(500).optional()
const optionalShort = z.string().max(120).optional()
const optionalCsv = z.array(z.string().max(80)).max(30).optional()

export const adProductDetailsSchema = z.object({
  listingType: z.string().max(80).optional(),
  fabricTypes: optionalCsv,
  colors: optionalCsv,
  sizes: z.array(z.string().max(40)).max(30).optional(),
  stockRemaining: z.coerce.number().int().min(0).max(1_000_000).optional(),
  price: z.coerce.number().min(0).max(1_000_000_000).optional(),
  currency: z.string().max(10).optional(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  shippingInfo: optionalString,
  contactPhone: z.string().max(30).optional(),
  whatsappLink: z.string().max(500).optional(),
  paymentMethod: z.enum(AD_PAYMENT_METHODS).optional(),
  paymentStatus: z.enum(AD_PAYMENT_STATUSES).optional(),
  paymentAmount: z.coerce.number().min(0).max(1_000_000_000).optional(),
  requestedPlacement: z.enum(AD_PLACEMENTS).optional(),
  requestedPosition: z.enum(AD_POSITIONS).optional(),
  requestedDurationDays: z.coerce
    .number()
    .refine((v) => AD_DURATION_OPTIONS.includes(v as (typeof AD_DURATION_OPTIONS)[number]), {
      message: "Invalid duration",
    })
    .optional(),
  videoUrl: z.string().max(500).optional(),
  videoUrls: z.array(z.string().max(500)).max(5).optional(),
  brand: optionalShort,
  model: optionalShort,
  condition: optionalShort,
  warranty: optionalShort,
  propertyType: optionalShort,
  areaSqm: z.coerce.number().min(0).max(1_000_000).optional(),
  rooms: optionalShort,
  location: optionalShort,
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  mileage: z.coerce.number().min(0).max(10_000_000).optional(),
  cuisineType: optionalShort,
  portions: optionalShort,
  shelfLife: optionalShort,
  serviceScope: optionalString,
  availability: optionalShort,
  serviceArea: optionalShort,
  eventDate: optionalShort,
  venue: optionalShort,
  capacity: z.coerce.number().int().min(0).max(1_000_000).optional(),
  jobTitle: optionalShort,
  experienceYears: optionalShort,
  workType: optionalShort,
  salary: z.coerce.number().min(0).max(1_000_000_000).optional(),
  destination: optionalShort,
  duration: optionalShort,
  includes: optionalString,
  productType: optionalShort,
  volume: optionalShort,
  specifications: optionalString,
  tags: optionalCsv,
  customFields: z
    .record(
      z.string().max(80),
      z.union([z.string().max(500), z.number(), z.array(z.string().max(80)).max(30)])
    )
    .optional(),
})

export function emptyAdProductDetails(): AdProductDetails {
  return {
    listingType: "general",
    fabricTypes: [],
    colors: [],
    sizes: [],
    tags: [],
    customFields: {},
    currency: "SAR",
    paymentStatus: "pending",
    requestedPlacement: "home_after_platforms",
    requestedPosition: "slot_1",
    requestedDurationDays: 30,
  }
}

export function parseCsvList(value: string): string[] {
  return value
    .split(/[,،\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30)
}

export function joinList(values?: string[]): string {
  return (values || []).join(isArabicList(values) ? "، " : ", ")
}

function isArabicList(values?: string[]): boolean {
  if (!values?.length) return true
  return /[\u0600-\u06FF]/.test(values.join(""))
}

export function parseAdProductDetails(raw: unknown): AdProductDetails {
  if (!raw) return {}
  if (typeof raw === "string") {
    try {
      return parseAdProductDetails(JSON.parse(raw))
    } catch {
      return {}
    }
  }
  if (typeof raw !== "object") return {}
  const parsed = adProductDetailsSchema.safeParse(raw)
  return parsed.success ? parsed.data : {}
}

export function serializeAdProductDetails(details?: AdProductDetails): string {
  return JSON.stringify(details || {})
}

export function getListingTypeLabel(type: AdListingType | undefined, isAr: boolean): string {
  const key = type || "general"
  const map: Record<string, { ar: string; en: string }> = {
    general: { ar: "عام", en: "General" },
    fashion: { ar: "أزياء / بسة", en: "Fashion / clothing" },
    electronics: { ar: "إلكترونيات", en: "Electronics" },
    real_estate: { ar: "عقارات", en: "Real estate" },
    vehicles: { ar: "سيارات / مركبات", en: "Vehicles" },
    food: { ar: "مأكولات / مشروبات", en: "Food & beverages" },
    services: { ar: "خدمات", en: "Services" },
    events: { ar: "فعاليات / مناسبات", en: "Events" },
    jobs: { ar: "وظائف / توظيف", en: "Jobs / hiring" },
    tourism: { ar: "سياحة / سفر", en: "Tourism / travel" },
    health_beauty: { ar: "صحة / تجميل", en: "Health / beauty" },
    product: { ar: "منتج تجاري", en: "Commercial product" },
  }
  const entry = map[key]
  if (entry) return isAr ? entry.ar : entry.en
  return key
}

const LEGACY_DETAIL_FIELDS = new Set([
  "fabricTypes",
  "colors",
  "sizes",
  "tags",
  "brand",
  "model",
  "condition",
  "warranty",
  "propertyType",
  "areaSqm",
  "rooms",
  "location",
  "year",
  "mileage",
  "cuisineType",
  "portions",
  "shelfLife",
  "serviceScope",
  "availability",
  "serviceArea",
  "eventDate",
  "venue",
  "capacity",
  "jobTitle",
  "experienceYears",
  "workType",
  "salary",
  "destination",
  "duration",
  "includes",
  "productType",
  "volume",
  "specifications",
])

export function readDetailFieldValue(details: AdProductDetails, fieldId: string): string {
  const raw = LEGACY_DETAIL_FIELDS.has(fieldId)
    ? (details as Record<string, unknown>)[fieldId]
    : details.customFields?.[fieldId]
  if (Array.isArray(raw)) return joinList(raw as string[])
  if (raw === undefined || raw === null) return ""
  return String(raw)
}

export function writeDetailFieldValue(
  details: AdProductDetails,
  fieldId: string,
  fieldType: "csv" | "text" | "number" | "date" | "textarea",
  value: string
): AdProductDetails {
  let parsed: string | number | string[] | undefined
  if (fieldType === "csv") parsed = parseCsvList(value)
  else if (fieldType === "number") parsed = value ? Number(value) : undefined
  else parsed = value || undefined

  if (LEGACY_DETAIL_FIELDS.has(fieldId)) {
    return { ...details, [fieldId]: parsed } as AdProductDetails
  }

  const customFields = { ...(details.customFields || {}) }
  if (parsed === undefined || parsed === "" || (Array.isArray(parsed) && !parsed.length)) {
    delete customFields[fieldId]
  } else {
    customFields[fieldId] = parsed as string | number | string[]
  }
  return { ...details, customFields }
}

export function formatDetailFieldDisplayValue(value: unknown): string | number | undefined {
  if (value === undefined || value === null || value === "") return undefined
  if (Array.isArray(value)) return value.length ? value.join("، ") : undefined
  return value as string | number
}

export function getPaymentMethodLabel(method: AdPaymentMethod | undefined, isAr: boolean): string {
  const map: Record<AdPaymentMethod, { ar: string; en: string }> = {
    cash: { ar: "نقداً", en: "Cash" },
    bank: { ar: "تحويل بنكي", en: "Bank transfer" },
    card: { ar: "بطاقة", en: "Card" },
    whatsapp: { ar: "واتساب", en: "WhatsApp" },
  }
  if (!method) return "—"
  return isAr ? map[method].ar : map[method].en
}

export function getPaymentStatusLabel(status: AdPaymentStatus | undefined, isAr: boolean): string {
  const map: Record<AdPaymentStatus, { ar: string; en: string }> = {
    pending: { ar: "بانتظار الدفع", en: "Pending payment" },
    paid: { ar: "مدفوع", en: "Paid" },
    waived: { ar: "معفى", en: "Waived" },
    rejected: { ar: "مرفوض", en: "Rejected" },
  }
  if (!status) return "—"
  return isAr ? map[status].ar : map[status].en
}

/** Accept direct files, CDN links, and social platform URLs. */
export function normalizeVideoUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""

  if (/^https?:\/\//i.test(trimmed)) return trimmed

  if (trimmed.startsWith("//")) return `https:${trimmed}`

  return trimmed.includes(".") ? `https://${trimmed}` : trimmed
}

export function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url) || url.startsWith("/uploads/")
}

export function getVideoEmbedUrl(url: string): string | null {
  const normalized = normalizeVideoUrl(url)
  if (!normalized) return null

  const yt =
    normalized.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]+)/i)?.[1] ||
    normalized.match(/youtube\.com\/embed\/([\w-]+)/i)?.[1]
  if (yt) return `https://www.youtube.com/embed/${yt}`

  const vimeo = normalized.match(/vimeo\.com\/(\d+)/i)?.[1]
  if (vimeo) return `https://player.vimeo.com/video/${vimeo}`

  if (isDirectVideoUrl(normalized)) return normalized

  return null
}

export function collectVideoUrls(details?: AdProductDetails): string[] {
  const urls = [
    ...(details?.videoUrls || []),
    ...(details?.videoUrl ? [details.videoUrl] : []),
  ]
    .map(normalizeVideoUrl)
    .filter(Boolean)

  return [...new Set(urls)].slice(0, 5)
}

export function formatProductDetailsForMessage(details?: AdProductDetails): string[] {
  if (!details) return []
  const lines: string[] = []
  const push = (label: string, value: unknown) => {
    if (value === undefined || value === null || value === "") return
    if (Array.isArray(value) && !value.length) return
    lines.push(`${label}: ${Array.isArray(value) ? value.join("، ") : value}`)
  }

  if (details.listingType) push("نوع الإعلان", getListingTypeLabel(details.listingType, true))
  push("أنواع القماش", details.fabricTypes)
  push("الألوان", details.colors)
  push("المقاسات", details.sizes)
  push("الماركة", details.brand)
  push("الموديل", details.model)
  push("الحالة", details.condition)
  push("الضمان", details.warranty)
  push("نوع العقار", details.propertyType)
  push("المساحة", details.areaSqm)
  push("الغرف", details.rooms)
  push("الموقع", details.location)
  push("سنة الصنع", details.year)
  push("العداد", details.mileage)
  push("نوع المطبخ", details.cuisineType)
  push("الحصص", details.portions)
  push("الصلاحية", details.shelfLife)
  push("نطاق الخدمة", details.serviceScope)
  push("التوفر", details.availability)
  push("منطقة التغطية", details.serviceArea)
  push("تاريخ الفعالية", details.eventDate)
  push("المكان", details.venue)
  push("السعة", details.capacity)
  push("المسمى الوظيفي", details.jobTitle)
  push("الخبرة", details.experienceYears)
  push("نوع العمل", details.workType)
  push("الراتب", details.salary)
  push("الوجهة", details.destination)
  push("المدة", details.duration)
  push("يشمل", details.includes)
  push("نوع المنتج", details.productType)
  push("الحجم", details.volume)
  push("المواصفات", details.specifications)
  push("الوسوم", details.tags)
  push("المتبقي", details.stockRemaining)
  push("السعر", typeof details.price === "number" ? `${details.price} ${details.currency || "SAR"}` : undefined)
  push("الحسم", typeof details.discountPercent === "number" ? `${details.discountPercent}%` : undefined)
  push("الشحن", details.shippingInfo)
  push("هاتف", details.contactPhone)
  push("واتساب", details.whatsappLink)
  collectVideoUrls(details).forEach((url, index) => push(`فيديو ${index + 1}`, url))
  if (details.customFields) {
    for (const [key, value] of Object.entries(details.customFields)) {
      push(key, value)
    }
  }

  return lines
}
