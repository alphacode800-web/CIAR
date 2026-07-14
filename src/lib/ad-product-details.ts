import { z } from "zod"
import {
  AD_DURATION_OPTIONS,
  AD_PLACEMENTS,
  AD_POSITIONS,
  type AdPlacement,
  type AdPosition,
} from "@/lib/site-ads"

export const AD_LISTING_TYPES = ["fashion", "general", "product", "service"] as const
export type AdListingType = (typeof AD_LISTING_TYPES)[number]

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
}

export const adProductDetailsSchema = z.object({
  listingType: z.enum(AD_LISTING_TYPES).optional(),
  fabricTypes: z.array(z.string().max(80)).max(20).optional(),
  colors: z.array(z.string().max(80)).max(30).optional(),
  sizes: z.array(z.string().max(40)).max(30).optional(),
  stockRemaining: z.coerce.number().int().min(0).max(1_000_000).optional(),
  price: z.coerce.number().min(0).max(1_000_000_000).optional(),
  currency: z.string().max(10).optional(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  shippingInfo: z.string().max(500).optional(),
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
})

export function emptyAdProductDetails(): AdProductDetails {
  return {
    listingType: "fashion",
    fabricTypes: [],
    colors: [],
    sizes: [],
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
  const map: Record<AdListingType, { ar: string; en: string }> = {
    fashion: { ar: "أزياء / بسة", en: "Fashion / clothing" },
    general: { ar: "عام", en: "General" },
    product: { ar: "منتج", en: "Product" },
    service: { ar: "خدمة", en: "Service" },
  }
  const key = type || "general"
  return isAr ? map[key].ar : map[key].en
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
