import { z } from "zod"
import type { AuthUser } from "@/lib/auth"

export const SUBSCRIPTION_PLANS_KEY = "advertiser_subscription_plans_v1"
export const USER_SUBSCRIPTIONS_KEY = "advertiser_user_subscriptions_v1"

/** @deprecated use dynamic site payment method ids */
export const SUBSCRIPTION_PAYMENT_METHODS = ["bank", "card", "whatsapp", "cash"] as const
export type SubscriptionPaymentMethod = (typeof SUBSCRIPTION_PAYMENT_METHODS)[number]

export type SubscriptionPlan = {
  id: string
  labelAr: string
  labelEn: string
  descriptionAr: string
  descriptionEn: string
  price: number
  durationDays: number
  enabled: boolean
  featuresAr: string[]
  featuresEn: string[]
}

export type SubscriptionPlansConfig = {
  /** When false, posting ads is free for everyone (no plans/payment step). */
  paymentsEnabled: boolean
  /** User IDs exempt from payment even when payments are enabled. */
  exemptUserIds: string[]
  requireSubscription: boolean
  currency: string
  bankNameAr: string
  bankNameEn: string
  bankAccount: string
  bankIban: string
  paymentNoteAr: string
  paymentNoteEn: string
  /** Trial/sandbox: skip validation and activate subscription immediately on submit. */
  testPaymentMode: boolean
  autoActivateOnPayment: boolean
  plans: SubscriptionPlan[]
}

export type UserSubscriptionStatus = "pending" | "active" | "expired" | "cancelled" | "waived"

export type UserSubscriptionRecord = {
  id: string
  userId: string
  userName?: string
  userEmail?: string | null
  userPhone?: string | null
  planId: string
  status: UserSubscriptionStatus
  paymentStatus: "pending" | "paid" | "waived" | "rejected"
  amount: number
  currency: string
  paymentMethod?: string
  paymentDetails?: Record<string, string>
  paymentNote?: string
  startsAt?: string
  expiresAt?: string
  waivedByAdmin?: boolean
  adminNote?: string
  createdAt: string
  updatedAt: string
}

export type UserSubscriptionsStore = {
  records: UserSubscriptionRecord[]
}

const planSchema = z.object({
  id: z.string().min(1).max(80).regex(/^[a-z0-9_-]+$/i),
  labelAr: z.string().min(1).max(120),
  labelEn: z.string().min(1).max(120),
  descriptionAr: z.string().max(500).default(""),
  descriptionEn: z.string().max(500).default(""),
  price: z.coerce.number().min(0).max(1_000_000_000),
  durationDays: z.coerce.number().int().min(1).max(3650),
  enabled: z.boolean().default(true),
  featuresAr: z.array(z.string().max(200)).max(20).default([]),
  featuresEn: z.array(z.string().max(200)).max(20).default([]),
})

export const subscriptionPlansConfigSchema = z.object({
  paymentsEnabled: z.boolean().default(true),
  exemptUserIds: z.array(z.string().min(1).max(120)).max(5000).default([]),
  requireSubscription: z.boolean().default(true),
  currency: z.string().max(10).default("SAR"),
  bankNameAr: z.string().max(120).default(""),
  bankNameEn: z.string().max(120).default(""),
  bankAccount: z.string().max(120).default(""),
  bankIban: z.string().max(120).default(""),
  paymentNoteAr: z.string().max(1000).default(""),
  paymentNoteEn: z.string().max(1000).default(""),
  testPaymentMode: z.boolean().default(true),
  autoActivateOnPayment: z.boolean().default(false),
  plans: z.array(planSchema).min(1).max(30),
})

export const userSubscriptionRecordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().optional(),
  userEmail: z.string().nullable().optional(),
  userPhone: z.string().nullable().optional(),
  planId: z.string().min(1),
  status: z.enum(["pending", "active", "expired", "cancelled", "waived"]),
  paymentStatus: z.enum(["pending", "paid", "waived", "rejected"]),
  amount: z.coerce.number().min(0),
  currency: z.string().max(10),
  paymentMethod: z.string().max(80).optional(),
  paymentDetails: z.record(z.string().max(500)).optional(),
  paymentNote: z.string().max(1000).optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  waivedByAdmin: z.boolean().optional(),
  adminNote: z.string().max(500).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const userSubscriptionsStoreSchema = z.object({
  records: z.array(userSubscriptionRecordSchema).max(5000).default([]),
})

export function defaultSubscriptionPlansConfig(): SubscriptionPlansConfig {
  return {
    paymentsEnabled: true,
    exemptUserIds: [],
    requireSubscription: true,
    currency: "SAR",
    bankNameAr: "البنك الأهلي السعودي",
    bankNameEn: "Al Ahli Bank",
    bankAccount: "",
    bankIban: "",
    paymentNoteAr: "بعد التحويل، أرسل إيصال الدفع عبر واتساب أو في الملاحظات أدناه.",
    paymentNoteEn: "After transfer, send your payment receipt via WhatsApp or in the notes below.",
    testPaymentMode: true,
    autoActivateOnPayment: false,
    plans: [
      {
        id: "starter_7",
        labelAr: "باقة البداية — 7 أيام",
        labelEn: "Starter — 7 days",
        descriptionAr: "مثالية لتجربة نشر إعلان واحد",
        descriptionEn: "Ideal to try posting your first ad",
        price: 79,
        durationDays: 7,
        enabled: true,
        featuresAr: ["إعلان واحد", "لوحة المُعلِن", "دعم أساسي"],
        featuresEn: ["One ad slot", "Advertiser panel", "Basic support"],
      },
      {
        id: "basic_14",
        labelAr: "أساسي — 14 يوماً",
        labelEn: "Basic — 14 days",
        descriptionAr: "أسبوعين من النشر والظهور",
        descriptionEn: "Two weeks of visibility",
        price: 129,
        durationDays: 14,
        enabled: true,
        featuresAr: ["نشر إعلانات", "لوحة المُعلِن", "دعم واتساب"],
        featuresEn: ["Post ads", "Advertiser panel", "WhatsApp support"],
      },
      {
        id: "monthly",
        labelAr: "اشتراك شهري",
        labelEn: "Monthly plan",
        descriptionAr: "الأكثر شيوعاً — 30 يوماً",
        descriptionEn: "Most popular — 30 days",
        price: 199,
        durationDays: 30,
        enabled: true,
        featuresAr: ["نشر إعلانات", "لوحة المُعلِن", "دعم عبر واتساب", "مراجعة أسرع"],
        featuresEn: ["Post ads", "Advertiser dashboard", "WhatsApp support", "Faster review"],
      },
      {
        id: "monthly_plus",
        labelAr: "شهري بلس",
        labelEn: "Monthly Plus",
        descriptionAr: "30 يوماً + أولوية الظهور",
        descriptionEn: "30 days + priority placement",
        price: 279,
        durationDays: 30,
        enabled: true,
        featuresAr: ["أولوية المراجعة", "مواضع مميزة", "دعم مخصص"],
        featuresEn: ["Priority review", "Premium slots", "Dedicated support"],
      },
      {
        id: "bimonthly",
        labelAr: "باقة شهرين",
        labelEn: "2-month plan",
        descriptionAr: "60 يوماً — توفير 10%",
        descriptionEn: "60 days — save 10%",
        price: 359,
        durationDays: 60,
        enabled: true,
        featuresAr: ["60 يوم نشر", "لوحة المُعلِن", "دعم واتساب"],
        featuresEn: ["60 days posting", "Advertiser panel", "WhatsApp support"],
      },
      {
        id: "quarterly",
        labelAr: "ربع سنوي — 3 أشهر",
        labelEn: "Quarterly — 3 months",
        descriptionAr: "90 يوماً — أفضل قيمة",
        descriptionEn: "90 days — best value",
        price: 499,
        durationDays: 90,
        enabled: true,
        featuresAr: ["3 أشهر", "أولوية المراجعة", "دعم مخصص"],
        featuresEn: ["3 months", "Priority review", "Dedicated support"],
      },
      {
        id: "semiannual",
        labelAr: "نصف سنوي — 6 أشهر",
        labelEn: "Semi-annual — 6 months",
        descriptionAr: "180 يوماً للشركات النشطة",
        descriptionEn: "180 days for active businesses",
        price: 899,
        durationDays: 180,
        enabled: true,
        featuresAr: ["6 أشهر", "أولوية عالية", "مدير حساب"],
        featuresEn: ["6 months", "High priority", "Account manager"],
      },
      {
        id: "annual",
        labelAr: "سنوي — 12 شهراً",
        labelEn: "Annual — 12 months",
        descriptionAr: "365 يوماً — أقصى توفير",
        descriptionEn: "365 days — maximum savings",
        price: 1599,
        durationDays: 365,
        enabled: true,
        featuresAr: ["سنة كاملة", "أولوية قصوى", "مدير حساب", "تقارير شهرية"],
        featuresEn: ["Full year", "Top priority", "Account manager", "Monthly reports"],
      },
      {
        id: "enterprise",
        labelAr: "مؤسسات — باقة مخصصة",
        labelEn: "Enterprise",
        descriptionAr: "للشركات الكبرى — 365 يوماً",
        descriptionEn: "For large companies — 365 days",
        price: 2499,
        durationDays: 365,
        enabled: true,
        featuresAr: ["إعلانات متعددة", "مواضع حصرية", "دعم 24/7", "تخصيص كامل"],
        featuresEn: ["Multiple ads", "Exclusive slots", "24/7 support", "Full customization"],
      },
    ],
  }
}

export function parseSubscriptionPlansConfig(raw: string | undefined): SubscriptionPlansConfig {
  const defaults = defaultSubscriptionPlansConfig()
  if (!raw) return applySubscriptionEnvOverrides(defaults)
  try {
    const parsed = subscriptionPlansConfigSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return applySubscriptionEnvOverrides(defaults)
    return applySubscriptionEnvOverrides({
      ...defaults,
      ...parsed.data,
      testPaymentMode: parsed.data.testPaymentMode ?? defaults.testPaymentMode,
    })
  } catch {
    return applySubscriptionEnvOverrides(defaults)
  }
}

/** Env override: SUBSCRIPTION_TEST_PAYMENT=true|false */
export function applySubscriptionEnvOverrides(config: SubscriptionPlansConfig): SubscriptionPlansConfig {
  const env = process.env.SUBSCRIPTION_TEST_PAYMENT?.trim().toLowerCase()
  if (env === "true") return { ...config, testPaymentMode: true }
  if (env === "false") return { ...config, testPaymentMode: false }
  return config
}

export function isSubscriptionTestPaymentMode(config: SubscriptionPlansConfig): boolean {
  return config.testPaymentMode === true
}

export function shouldAutoActivateSubscriptionOnPayment(config: SubscriptionPlansConfig): boolean {
  return config.autoActivateOnPayment || isSubscriptionTestPaymentMode(config)
}

export function serializeSubscriptionPlansConfig(config: SubscriptionPlansConfig): string {
  return JSON.stringify(config)
}

export function parseUserSubscriptionsStore(raw: string | undefined): UserSubscriptionsStore {
  if (!raw) return { records: [] }
  try {
    const parsed = userSubscriptionsStoreSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return { records: [] }
    return parsed.data
  } catch {
    return { records: [] }
  }
}

export function serializeUserSubscriptionsStore(store: UserSubscriptionsStore): string {
  return JSON.stringify(store)
}

export function getEnabledPlans(config: SubscriptionPlansConfig): SubscriptionPlan[] {
  return config.plans.filter((p) => p.enabled)
}

export function getPlanById(config: SubscriptionPlansConfig, planId: string): SubscriptionPlan | undefined {
  return config.plans.find((p) => p.id === planId)
}

export function getPlanLabel(plan: SubscriptionPlan, isAr: boolean): string {
  return isAr ? plan.labelAr : plan.labelEn
}

export function isSubscriptionRecordActive(record: UserSubscriptionRecord | null | undefined, now = new Date()): boolean {
  if (!record) return false
  if (record.status === "waived") return true
  if (record.status !== "active") return false
  if (!record.expiresAt) return true
  return new Date(record.expiresAt) > now
}

export function getLatestUserSubscription(
  store: UserSubscriptionsStore,
  userId: string
): UserSubscriptionRecord | undefined {
  return store.records
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
}

export function getActiveUserSubscription(
  store: UserSubscriptionsStore,
  userId: string,
  now = new Date()
): UserSubscriptionRecord | undefined {
  const userRecords = store.records
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return userRecords.find((r) => isSubscriptionRecordActive(r, now))
}

export function requiresAdvertiserPayment(
  user: AuthUser,
  record: UserSubscriptionRecord | null | undefined,
  config: SubscriptionPlansConfig
): boolean {
  if (user.role === "ADMIN" || user.role === "SELLER") return false
  if (user.id === "ciar-admin") return false
  if (!config.paymentsEnabled) return false
  if (config.exemptUserIds?.includes(user.id)) return false
  if (!config.requireSubscription) return false
  return !isSubscriptionRecordActive(record)
}

export function canPostAdvertisement(
  user: AuthUser,
  record: UserSubscriptionRecord | null | undefined,
  config: SubscriptionPlansConfig
): boolean {
  return !requiresAdvertiserPayment(user, record, config)
}

export function isUserExemptFromPayment(userId: string, config: SubscriptionPlansConfig): boolean {
  return Boolean(config.exemptUserIds?.includes(userId))
}

export function subscriptionPaymentMethodLabel(method: SubscriptionPaymentMethod | undefined, isAr: boolean): string {
  const map: Record<SubscriptionPaymentMethod, { ar: string; en: string }> = {
    bank: { ar: "تحويل بنكي", en: "Bank transfer" },
    card: { ar: "بطاقة", en: "Card" },
    whatsapp: { ar: "واتساب", en: "WhatsApp" },
    cash: { ar: "نقداً", en: "Cash" },
  }
  if (!method) return isAr ? "—" : "—"
  return isAr ? map[method].ar : map[method].en
}

export function subscriptionStatusLabel(status: UserSubscriptionStatus, isAr: boolean): string {
  const map: Record<UserSubscriptionStatus, { ar: string; en: string }> = {
    pending: { ar: "بانتظار التفعيل", en: "Pending" },
    active: { ar: "نشط", en: "Active" },
    expired: { ar: "منتهي", en: "Expired" },
    cancelled: { ar: "ملغى", en: "Cancelled" },
    waived: { ar: "معفى", en: "Waived" },
  }
  return isAr ? map[status].ar : map[status].en
}

export function newSubscriptionRecordId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function slugifyPlanId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "_")
    .replace(/[^\w-]/g, "")
    .slice(0, 60) || `plan_${Date.now()}`
}

export function newSubscriptionPlan(): SubscriptionPlan {
  const id = slugifyPlanId(`plan_${Date.now()}`)
  return {
    id,
    labelAr: "خطة جديدة",
    labelEn: "New plan",
    descriptionAr: "",
    descriptionEn: "",
    price: 0,
    durationDays: 30,
    enabled: true,
    featuresAr: [],
    featuresEn: [],
  }
}

export function mergeMissingDefaultPlans(config: SubscriptionPlansConfig): SubscriptionPlansConfig {
  const defaults = defaultSubscriptionPlansConfig()
  const existingIds = new Set(config.plans.map((p) => p.id))
  const mergedPlans = [...config.plans]
  for (const plan of defaults.plans) {
    if (!existingIds.has(plan.id)) mergedPlans.push(plan)
  }
  return { ...config, plans: mergedPlans }
}

export function computeSubscriptionExpiry(startsAt: Date, durationDays: number): Date {
  const expires = new Date(startsAt)
  expires.setDate(expires.getDate() + durationDays)
  return expires
}
