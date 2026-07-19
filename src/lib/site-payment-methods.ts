import { z } from "zod"

export const SITE_PAYMENT_METHODS_KEY = "site_payment_methods_v1"

export const PAYMENT_FIELD_TYPES = ["text", "tel", "email", "number", "textarea"] as const
export type PaymentFieldType = (typeof PAYMENT_FIELD_TYPES)[number]

export type SitePaymentField = {
  id: string
  type: PaymentFieldType
  labelAr: string
  labelEn: string
  placeholderAr?: string
  placeholderEn?: string
  required?: boolean
}

export type SitePaymentMethod = {
  id: string
  labelAr: string
  labelEn: string
  descriptionAr: string
  descriptionEn: string
  iconUrl: string
  enabled: boolean
  instructionsAr: string
  instructionsEn: string
  accountInfoAr?: string
  accountInfoEn?: string
  fields: SitePaymentField[]
}

export type SitePaymentMethodsStore = {
  methods: SitePaymentMethod[]
}

const fieldSchema = z.object({
  id: z.string().min(1).max(80).regex(/^[a-z0-9_]+$/i),
  type: z.enum(PAYMENT_FIELD_TYPES),
  labelAr: z.string().min(1).max(120),
  labelEn: z.string().min(1).max(120),
  placeholderAr: z.string().max(200).optional(),
  placeholderEn: z.string().max(200).optional(),
  required: z.boolean().optional().default(true),
})

const methodSchema = z.object({
  id: z.string().min(1).max(80).regex(/^[a-z0-9_-]+$/i),
  labelAr: z.string().min(1).max(120),
  labelEn: z.string().min(1).max(120),
  descriptionAr: z.string().max(500).default(""),
  descriptionEn: z.string().max(500).default(""),
  iconUrl: z.string().max(500).default(""),
  enabled: z.boolean().default(true),
  instructionsAr: z.string().max(1000).default(""),
  instructionsEn: z.string().max(1000).default(""),
  accountInfoAr: z.string().max(500).optional(),
  accountInfoEn: z.string().max(500).optional(),
  fields: z.array(fieldSchema).max(15).default([]),
})

export const sitePaymentMethodsStoreSchema = z.object({
  methods: z.array(methodSchema).min(1).max(30),
})

function field(
  id: string,
  labelAr: string,
  labelEn: string,
  type: PaymentFieldType = "text",
  placeholderAr?: string,
  placeholderEn?: string
): SitePaymentField {
  return { id, type, labelAr, labelEn, placeholderAr, placeholderEn, required: true }
}

export function defaultSitePaymentMethodsStore(): SitePaymentMethodsStore {
  return {
    methods: [
      {
        id: "bank_transfer",
        labelAr: "تحويل بنكي",
        labelEn: "Bank transfer",
        descriptionAr: "تحويل مباشر إلى حساب CIAR",
        descriptionEn: "Direct transfer to CIAR account",
        iconUrl: "/payment/mada.svg",
        enabled: true,
        instructionsAr: "حوّل المبلغ ثم أدخل بيانات التحويل أدناه.",
        instructionsEn: "Transfer the amount then enter your transfer details below.",
        accountInfoAr: "البنك: البنك الأهلي · IBAN: SA00 0000 0000 0000 0000 0000",
        accountInfoEn: "Bank: Al Ahli · IBAN: SA00 0000 0000 0000 0000 0000",
        fields: [
          field("sender_name", "اسم المحوّل", "Sender name"),
          field("bank_name", "اسم البنك", "Bank name"),
          field("transaction_ref", "رقم العملية / المرجع", "Transaction reference", "text", "REF-123456", "REF-123456"),
          field("transfer_date", "تاريخ التحويل", "Transfer date"),
        ],
      },
      {
        id: "mada",
        labelAr: "مدى",
        labelEn: "mada",
        descriptionAr: "بطاقة مدى السعودية",
        descriptionEn: "Saudi mada card",
        iconUrl: "/payment/mada.svg",
        enabled: true,
        instructionsAr: "ادفع عبر مدى ثم أدخل رقم العملية.",
        instructionsEn: "Pay via mada then enter the transaction ID.",
        fields: [
          field("card_holder", "اسم حامل البطاقة", "Cardholder name"),
          field("last_four", "آخر 4 أرقام", "Last 4 digits", "number"),
          field("transaction_id", "رقم العملية", "Transaction ID"),
          field("phone", "رقم الهاتف", "Phone number", "tel", "+9665...", "+9665..."),
        ],
      },
      {
        id: "visa_mastercard",
        labelAr: "Visa / Mastercard",
        labelEn: "Visa / Mastercard",
        descriptionAr: "بطاقات Visa أو Mastercard",
        descriptionEn: "Visa or Mastercard",
        iconUrl: "/payment/visa.svg",
        enabled: true,
        instructionsAr: "أكمل الدفع بالبطاقة ثم أدخل تفاصيل العملية.",
        instructionsEn: "Complete card payment then enter transaction details.",
        fields: [
          field("card_holder", "اسم حامل البطاقة", "Cardholder name"),
          field("card_brand", "نوع البطاقة", "Card brand", "text", "Visa / Mastercard", "Visa / Mastercard"),
          field("transaction_id", "رقم العملية", "Transaction ID"),
          field("email", "البريد الإلكتروني", "Email", "email"),
        ],
      },
      {
        id: "paypal",
        labelAr: "PayPal",
        labelEn: "PayPal",
        descriptionAr: "الدفع عبر PayPal",
        descriptionEn: "Pay with PayPal",
        iconUrl: "/payment/paypal.svg",
        enabled: true,
        instructionsAr: "أرسل المبلغ إلى حساب PayPal الخاص بـ CIAR.",
        instructionsEn: "Send the amount to CIAR PayPal account.",
        accountInfoEn: "PayPal: payments@ciar.com",
        accountInfoAr: "PayPal: payments@ciar.com",
        fields: [
          field("paypal_email", "بريد PayPal المستخدم", "PayPal email used", "email"),
          field("transaction_id", "رقم العملية", "Transaction ID"),
        ],
      },
      {
        id: "apple_pay",
        labelAr: "Apple Pay",
        labelEn: "Apple Pay",
        descriptionAr: "Apple Pay",
        descriptionEn: "Apple Pay",
        iconUrl: "/payment/apple-pay.svg",
        enabled: true,
        instructionsAr: "ادفع عبر Apple Pay ثم أدخل مرجع العملية.",
        instructionsEn: "Pay via Apple Pay then enter the reference.",
        fields: [
          field("transaction_ref", "مرجع العملية", "Transaction reference"),
          field("phone", "رقم الهاتف", "Phone", "tel"),
        ],
      },
      {
        id: "stc_pay",
        labelAr: "stc pay",
        labelEn: "stc pay",
        descriptionAr: "محفظة stc pay",
        descriptionEn: "stc pay wallet",
        iconUrl: "/payment/stc-pay.svg",
        enabled: true,
        instructionsAr: "حوّل عبر stc pay ثم أدخل رقم العملية.",
        instructionsEn: "Transfer via stc pay then enter transaction ID.",
        fields: [
          field("stc_phone", "رقم stc pay", "stc pay number", "tel"),
          field("transaction_id", "رقم العملية", "Transaction ID"),
        ],
      },
      {
        id: "tamara",
        labelAr: "تمارا",
        labelEn: "Tamara",
        descriptionAr: "الدفع بالتقسيط عبر تمara",
        descriptionEn: "Pay in installments with Tamara",
        iconUrl: "/payment/tamara.svg",
        enabled: true,
        instructionsAr: "أكمل الطلب عبر تمara ثم أدخل رقم الطلب.",
        instructionsEn: "Complete Tamara checkout then enter order ID.",
        fields: [
          field("tamara_order_id", "رقم طلب Tamara", "Tamara order ID"),
          field("phone", "رقم الهاتف", "Phone", "tel"),
        ],
      },
      {
        id: "whish_money",
        labelAr: "Whish Money",
        labelEn: "Whish Money",
        descriptionAr: "محفظة Whish Money",
        descriptionEn: "Whish Money wallet",
        iconUrl: "/payment/whish-money.png",
        enabled: true,
        instructionsAr: "حوّل عبر Whish ثم أدخل بيانات التحويل.",
        instructionsEn: "Transfer via Whish then enter details.",
        fields: [
          field("whish_number", "رقم Whish", "Whish number", "tel"),
          field("transaction_ref", "مرجع التحويل", "Transfer reference"),
        ],
      },
      {
        id: "ciar_prepaid",
        labelAr: "CIAR Prepaid",
        labelEn: "CIAR Prepaid",
        descriptionAr: "بطاقة CIAR مسبقة الدفع",
        descriptionEn: "CIAR prepaid card",
        iconUrl: "/payment/ciar-prepaid.png",
        enabled: true,
        instructionsAr: "أدخل رمز البطاقة المسبقة الدفع.",
        instructionsEn: "Enter your prepaid card code.",
        fields: [
          field("prepaid_code", "رمز البطاقة", "Prepaid code"),
          field("phone", "رقم الهاتف", "Phone", "tel"),
        ],
      },
      {
        id: "whatsapp",
        labelAr: "واتساب",
        labelEn: "WhatsApp",
        descriptionAr: "تأكيد الدفع عبر واتساب",
        descriptionEn: "Confirm payment via WhatsApp",
        iconUrl: "/payment/visa.svg",
        enabled: true,
        instructionsAr: "أرسل إيصال الدفع عبر واتساب ثم أكمل البيانات.",
        instructionsEn: "Send payment receipt via WhatsApp then fill in details.",
        fields: [
          field("whatsapp_number", "رقم واتساب", "WhatsApp number", "tel"),
          field("receipt_note", "وصف الإيصال / الملاحظة", "Receipt description", "textarea"),
        ],
      },
      {
        id: "cash",
        labelAr: "نقداً",
        labelEn: "Cash",
        descriptionAr: "دفع نقدي في المكتب",
        descriptionEn: "Cash payment at office",
        iconUrl: "/payment/mada.svg",
        enabled: true,
        instructionsAr: "ادفع نقداً في مقر CIAR ثم أدخل بياناتك.",
        instructionsEn: "Pay cash at CIAR office then enter your details.",
        fields: [
          field("payer_name", "اسم الدافع", "Payer name"),
          field("phone", "رقم الهاتف", "Phone", "tel"),
          field("visit_date", "تاريخ الزيارة / الدفع", "Visit / payment date"),
        ],
      },
    ],
  }
}

export function parseSitePaymentMethodsStore(raw: string | undefined): SitePaymentMethodsStore {
  if (!raw) return defaultSitePaymentMethodsStore()
  try {
    const parsed = sitePaymentMethodsStoreSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return defaultSitePaymentMethodsStore()
    return parsed.data
  } catch {
    return defaultSitePaymentMethodsStore()
  }
}

export function serializeSitePaymentMethodsStore(store: SitePaymentMethodsStore): string {
  return JSON.stringify(store)
}

export function getEnabledPaymentMethods(store: SitePaymentMethodsStore): SitePaymentMethod[] {
  return store.methods.filter((m) => m.enabled)
}

export function getPaymentMethodById(store: SitePaymentMethodsStore, id: string): SitePaymentMethod | undefined {
  return store.methods.find((m) => m.id === id)
}

export function getPaymentMethodLabel(method: SitePaymentMethod, isAr: boolean): string {
  return isAr ? method.labelAr : method.labelEn
}

export function slugifyPaymentMethodId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "_")
    .replace(/[^\w-]/g, "")
    .slice(0, 60) || `pay_${Date.now()}`
}

export function newSitePaymentMethod(): SitePaymentMethod {
  const id = slugifyPaymentMethodId(`method_${Date.now()}`)
  return {
    id,
    labelAr: "طريقة جديدة",
    labelEn: "New method",
    descriptionAr: "",
    descriptionEn: "",
    iconUrl: "/payment/mada.svg",
    enabled: true,
    instructionsAr: "",
    instructionsEn: "",
    fields: [field("reference", "المرجع", "Reference")],
  }
}

export function newPaymentField(): SitePaymentField {
  return field("field_" + Date.now(), "حقل جديد", "New field")
}

export function validatePaymentDetails(
  method: SitePaymentMethod,
  details: Record<string, string>
): { ok: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  for (const f of method.fields) {
    const value = (details[f.id] || "").trim()
    if (f.required !== false && !value) {
      errors[f.id] = "required"
    }
  }
  return { ok: Object.keys(errors).length === 0, errors }
}

export function formatPaymentDetailsForDisplay(
  method: SitePaymentMethod,
  details: Record<string, string> | undefined,
  isAr: boolean
): string[] {
  if (!details) return []
  return method.fields
    .map((f) => {
      const value = details[f.id]
      if (!value) return null
      return `${isAr ? f.labelAr : f.labelEn}: ${value}`
    })
    .filter(Boolean) as string[]
}
