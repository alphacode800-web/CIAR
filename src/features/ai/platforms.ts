import { CIAR_MODULES } from "@/features/super-platform/config"

export type PlatformMatch = {
  slug: string
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
}

const PLATFORM_KEYWORDS: Array<{ slug: string; patterns: RegExp[] }> = [
  { slug: "FASHION", patterns: [/موض|أزياء|فساتين|fashion|clothes|dress/i] },
  { slug: "GLOBAL_PRODUCTS", patterns: [/صين|دولي|منتج|global|products|import/i] },
  { slug: "VIP", patterns: [/vip|كبار|فاخر|premium|luxury/i] },
  { slug: "MALL", patterns: [/مول|تسوق|shop|mall|e-commerce/i] },
  { slug: "TOURISM", patterns: [/سياح|سفر|رحل|tour|travel|trip/i] },
  { slug: "REAL_ESTATE", patterns: [/عقار|شقة|أرض|rent|real.?estate|property/i] },
  { slug: "CARS", patterns: [/سيار|مركب|car|vehicle|auto/i] },
  { slug: "SERVICES", patterns: [/صيان|تنظيف|منزل|مكتب|maintenance|cleaning/i] },
  { slug: "SHIPPING", patterns: [/شحن|توصيل|shipping|delivery|cargo/i] },
  { slug: "JOBS", patterns: [/وظيف|توظيف|عمل|job|career|hire/i] },
  { slug: "ADS_MARKETING", patterns: [/إعلان|تسويق|حمل|ads|marketing|campaign/i] },
  { slug: "INVESTMENT", patterns: [/استثمار|أسهم|مكافأ|invest|shares|reward/i] },
]

export function getVisiblePlatforms(): PlatformMatch[] {
  return CIAR_MODULES.filter((m) => m.visibility === "VISIBLE").map((m) => ({
    slug: m.slug,
    nameAr: m.nameAr,
    nameEn: m.nameEn,
    descriptionAr: m.descriptionAr,
    descriptionEn: m.descriptionEn,
  }))
}

export function matchPlatformIntent(message: string): PlatformMatch | null {
  const text = message.trim()
  if (!text) return null

  for (const entry of PLATFORM_KEYWORDS) {
    if (entry.patterns.some((pattern) => pattern.test(text))) {
      const module = CIAR_MODULES.find((m) => m.slug === entry.slug && m.visibility === "VISIBLE")
      if (module) {
        return {
          slug: module.slug,
          nameAr: module.nameAr,
          nameEn: module.nameEn,
          descriptionAr: module.descriptionAr,
          descriptionEn: module.descriptionEn,
        }
      }
    }
  }
  return null
}

export function buildPlatformListReply(locale: "ar" | "en"): string {
  const platforms = getVisiblePlatforms()
  if (locale === "ar") {
    const names = platforms.map((p) => `• ${p.nameAr}`).join("\n")
    return `منصات CIAR المتاحة:\n${names}\n\nاختر منصة وسأوجّهك إليها مباشرة.`
  }
  const names = platforms.map((p) => `• ${p.nameEn}`).join("\n")
  return `Available CIAR platforms:\n${names}\n\nPick one and I will guide you there.`
}

export function getQuickPrompts(locale: "ar" | "en"): string[] {
  if (locale === "ar") {
    return [
      "ما هي المنصات المتاحة؟",
      "أريد خدمات العقارات",
      "كيف أتواصل معكم؟",
      "أخبرني عن الشحن العالمي",
    ]
  }
  return [
    "What platforms are available?",
    "I need real estate services",
    "How can I contact you?",
    "Tell me about global shipping",
  ]
}
