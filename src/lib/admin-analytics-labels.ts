import { CIAR_MODULES } from "@/features/super-platform/config"

const CATEGORY_LABELS_AR: Record<string, string> = {
  Marketplace: "سوق إلكتروني",
  Fashion: "موضة",
  Electronics: "إلكترونيات",
  "Home & Living": "المنزل والمعيشة",
  Groceries: "بقالة",
  Health: "صحة",
  Beauty: "جمال",
  Books: "كتب",
  Sports: "رياضة",
  Kids: "أطفال",
  Automotive: "سيارات",
  B2B: "أعمال B2B",
  Deals: "عروض",
  Uncategorized: "غير مصنّف",
  VIP: "CiAr VIP",
}

function normalizeModuleSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/^ciar-/, "")
    .replace(/-/g, "_")
    .toUpperCase()
}

function stripCiarPrefix(value: string): string {
  return value.replace(/^CIAR\s+/i, "").trim()
}

function findModuleBySlug(slug?: string) {
  if (!slug) return undefined
  const key = normalizeModuleSlug(slug)
  return CIAR_MODULES.find((module) => module.slug === key)
}

function findModuleByEnglishLabel(label?: string) {
  if (!label) return undefined
  const trimmed = label.trim()
  const stripped = stripCiarPrefix(trimmed)
  return CIAR_MODULES.find((module) => {
    const moduleShort = stripCiarPrefix(module.nameEn)
    return (
      module.nameEn === trimmed ||
      moduleShort === trimmed ||
      moduleShort === stripped ||
      module.slug === stripped.toUpperCase().replace(/\s+/g, "_")
    )
  })
}

function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text)
}

/** اسم المنصة بالعربية لعرض لوحة التحكم. */
export function localizeAdminPlatformName(slug: string, name?: string | null): string {
  const fromModule = findModuleBySlug(slug)
  if (fromModule) return fromModule.nameAr
  if (name && hasArabic(name)) return name
  const fromName = findModuleByEnglishLabel(name ?? undefined)
  if (fromName) return fromName.nameAr
  return name?.trim() || slug
}

/** تصنيف المنصة بالعربية لعرض لوحة التحكم. */
export function localizeAdminCategory(category: string, slug?: string): string {
  const trimmed = category?.trim()
  if (!trimmed) return "غير مصنّف"
  if (hasArabic(trimmed)) return trimmed

  const fromSlug = findModuleBySlug(slug)
  if (fromSlug) return fromSlug.nameAr

  const fromCategory = findModuleByEnglishLabel(trimmed)
  if (fromCategory) return fromCategory.nameAr

  return CATEGORY_LABELS_AR[trimmed] || trimmed
}
