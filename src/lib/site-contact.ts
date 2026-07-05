/** بيانات التواصل الافتراضية للموقع */
export const SITE_CONTACT_DEFAULTS: Record<string, string> = {
  contact_email: "azasnaa628@gmail.com",
  company_email: "azasnaa628@gmail.com",
  contact_phone: "+963993153333",
  company_phone: "+963993153333",
  social_whatsapp: "+963993153333",
}

const LEGACY_CONTACT_VALUES = new Set([
  "info@ciar.sa",
  "hello@ciar.com",
  "admin@ciar.sa",
  "+966 50 000 0000",
  "+966500000000",
  "+96650000000",
  "+9665...",
  "",
])

function shouldApplyDefault(key: string, value: string | undefined): boolean {
  const trimmed = (value ?? "").trim()
  if (!trimmed) return true
  if (LEGACY_CONTACT_VALUES.has(trimmed)) return true
  if (key.includes("email") && trimmed.endsWith("@ciar.sa")) return true
  if (key.includes("email") && trimmed.endsWith("@ciar.com")) return true
  if (key.includes("phone") && trimmed.startsWith("+966")) return true
  if (key === "social_whatsapp" && trimmed.startsWith("+966")) return true
  return false
}

export function withSiteContactDefaults(settings: Record<string, string>): Record<string, string> {
  const merged = { ...settings }
  for (const [key, value] of Object.entries(SITE_CONTACT_DEFAULTS)) {
    if (shouldApplyDefault(key, merged[key])) {
      merged[key] = value
    }
  }
  return merged
}

export function whatsappDigits(value: string): string {
  return value.replace(/[^\d]/g, "")
}

export function whatsappHref(value: string, text?: string): string {
  const digits = whatsappDigits(value)
  if (!digits) return ""
  const base = `https://wa.me/${digits}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}
