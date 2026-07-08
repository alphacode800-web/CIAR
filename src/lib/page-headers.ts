import { z } from "zod"
import {
  getNewsTickerFontStack,
  newsTickerFontKeys,
  type NewsTickerFontKey,
} from "@/lib/news-ticker"

export const PAGE_HEADERS_KEY = "page_headers_config"

export type PageHeaderId = "home" | "about" | "contact" | "projects"

export type PageHeaderLayout = "centered" | "platforms"

export type LocalizedText = {
  ar: string
  en: string
}

export type TextStyle = {
  color: string
  fontFamily: NewsTickerFontKey
  fontSize: number
  fontWeight: 400 | 500 | 600 | 700 | 800
}

export type PageHeaderConfig = {
  layout: PageHeaderLayout
  badge: LocalizedText
  badgeVisible: boolean
  badgeStyle: TextStyle & { backgroundColor: string; borderColor: string }
  titleLine1: LocalizedText
  titleLine2: LocalizedText
  titleSplit: boolean
  titleAccentUseGradient: boolean
  titleStyle: TextStyle
  titleAccentStyle: TextStyle
  subtitle: LocalizedText
  subtitleStyle: TextStyle
  backgroundImage: string
  backgroundOpacity: number
  overlayFromColor: string
  overlayToColor: string
  overlayOpacity: number
  paddingTop: number
  paddingBottom: number
}

export type PageHeadersStore = Record<PageHeaderId, PageHeaderConfig>

const textStyleSchema = z.object({
  color: z.string(),
  fontFamily: z.enum(newsTickerFontKeys),
  fontSize: z.number().min(12).max(96),
  fontWeight: z.union([z.literal(400), z.literal(500), z.literal(600), z.literal(700), z.literal(800)]),
})

export const pageHeaderSchema = z.object({
  layout: z.enum(["centered", "platforms"]),
  badge: z.object({ ar: z.string(), en: z.string() }),
  badgeVisible: z.boolean(),
  badgeStyle: textStyleSchema.extend({
    backgroundColor: z.string(),
    borderColor: z.string(),
  }),
  titleLine1: z.object({ ar: z.string(), en: z.string() }),
  titleLine2: z.object({ ar: z.string(), en: z.string() }),
  titleSplit: z.boolean(),
  titleAccentUseGradient: z.boolean(),
  titleStyle: textStyleSchema,
  titleAccentStyle: textStyleSchema,
  subtitle: z.object({ ar: z.string(), en: z.string() }),
  subtitleStyle: textStyleSchema,
  backgroundImage: z.string(),
  backgroundOpacity: z.number().min(0).max(100),
  overlayFromColor: z.string(),
  overlayToColor: z.string(),
  overlayOpacity: z.number().min(0).max(100),
  paddingTop: z.number().min(48).max(240),
  paddingBottom: z.number().min(48).max(240),
})

export const pageHeadersStoreSchema = z.object({
  about: pageHeaderSchema,
  contact: pageHeaderSchema,
  projects: pageHeaderSchema,
  home: pageHeaderSchema.optional(),
})

const defaultTextStyle = (color = "#ffffff"): TextStyle => ({
  color,
  fontFamily: "tajawal",
  fontSize: 16,
  fontWeight: 400,
})

const defaultBadgeStyle = (): PageHeaderConfig["badgeStyle"] => ({
  ...defaultTextStyle("#94a3b8"),
  fontSize: 14,
  fontWeight: 500,
  backgroundColor: "rgba(255,255,255,0.06)",
  borderColor: "rgba(255,255,255,0.12)",
})

const defaultTitleStyle = (): TextStyle => ({
  color: "#ffffff",
  fontFamily: "tajawal",
  fontSize: 48,
  fontWeight: 700,
})

const defaultAccentStyle = (): TextStyle => ({
  color: "#f5c542",
  fontFamily: "tajawal",
  fontSize: 48,
  fontWeight: 700,
})

const defaultSubtitleStyle = (): TextStyle => ({
  color: "#94a3b8",
  fontFamily: "tajawal",
  fontSize: 18,
  fontWeight: 400,
})

const sharedBackground = {
  backgroundOpacity: 40,
  overlayFromColor: "rgba(15,23,42,0.5)",
  overlayToColor: "rgba(15,23,42,0.95)",
  overlayOpacity: 100,
  paddingTop: 96,
  paddingBottom: 128,
}

export const DEFAULT_PAGE_HEADERS: PageHeadersStore = {
  home: {
    layout: "centered",
    badge: { ar: "CIAR", en: "CIAR" },
    badgeVisible: false,
    badgeStyle: defaultBadgeStyle(),
    titleLine1: { ar: "منصتنا", en: "Our Platform" },
    titleLine2: { ar: "منظومة رقمية متكاملة", en: "Integrated Digital Ecosystem" },
    titleSplit: true,
    titleAccentUseGradient: false,
    titleStyle: { ...defaultTitleStyle(), fontSize: 56, color: "#111827" },
    titleAccentStyle: { ...defaultAccentStyle(), color: "#111827" },
    subtitle: {
      ar: "جميع المنصات في واجهة واحدة حديثة. كل منصة تُدار من لوحة الأدمن مع صور ومحتوى ديناميكي.",
      en: "All platforms in one modern experience. Every card is managed dynamically from the admin panel.",
    },
    subtitleStyle: { ...defaultSubtitleStyle(), fontSize: 18, color: "#374151" },
    backgroundImage: "",
    backgroundOpacity: 100,
    overlayFromColor: "transparent",
    overlayToColor: "transparent",
    overlayOpacity: 0,
    paddingTop: 96,
    paddingBottom: 80,
  },
  about: {
    layout: "centered",
    badge: { ar: "عن CIAR", en: "About CIAR" },
    badgeVisible: true,
    badgeStyle: defaultBadgeStyle(),
    titleLine1: { ar: "نبني منصات", en: "We Build Platforms" },
    titleLine2: { ar: "تخدم الملايين", en: "That Serve Millions" },
    titleSplit: true,
    titleAccentUseGradient: true,
    titleStyle: defaultTitleStyle(),
    titleAccentStyle: defaultAccentStyle(),
    subtitle: {
      ar: "منظومة CIAR تجمع التجارة والخدمات والفرص في تجربة رقمية متكاملة.",
      en: "CIAR ecosystem brings commerce, services, and opportunities together.",
    },
    subtitleStyle: defaultSubtitleStyle(),
    backgroundImage: "/images/headers/about-header.png",
    ...sharedBackground,
  },
  contact: {
    layout: "centered",
    badge: { ar: "تواصل معنا", en: "Get In Touch" },
    badgeVisible: true,
    badgeStyle: defaultBadgeStyle(),
    titleLine1: { ar: "نحن هنا", en: "We're Here" },
    titleLine2: { ar: "لخدمتك", en: "To Help You" },
    titleSplit: true,
    titleAccentUseGradient: true,
    titleStyle: defaultTitleStyle(),
    titleAccentStyle: defaultAccentStyle(),
    subtitle: {
      ar: "تواصل مع فريق CIAR للاستفسارات والشراكات والدعم.",
      en: "Reach the CIAR team for inquiries, partnerships, and support.",
    },
    subtitleStyle: defaultSubtitleStyle(),
    backgroundImage: "/images/headers/contact-header.png",
    ...sharedBackground,
  },
  projects: {
    layout: "platforms",
    badge: { ar: "مميز", en: "Featured" },
    badgeVisible: true,
    badgeStyle: defaultBadgeStyle(),
    titleLine1: { ar: "منصاتنا", en: "Our Platforms" },
    titleLine2: { ar: "", en: "" },
    titleSplit: false,
    titleAccentUseGradient: true,
    titleStyle: { ...defaultTitleStyle(), fontSize: 56 },
    titleAccentStyle: defaultAccentStyle(),
    subtitle: {
      ar: "استكشف محفظة منصات CIAR الرقمية.",
      en: "Explore CIAR's portfolio of digital platforms.",
    },
    subtitleStyle: { ...defaultSubtitleStyle(), fontSize: 17 },
    backgroundImage: "/images/headers/projects-header.png",
    paddingTop: 80,
    paddingBottom: 80,
    backgroundOpacity: 40,
    overlayFromColor: "rgba(15,23,42,0.5)",
    overlayToColor: "rgba(15,23,42,0.95)",
    overlayOpacity: 100,
  },
}

export const PAGE_HEADER_LABELS: Record<
  PageHeaderId,
  { ar: string; en: string; previewHash: string }
> = {
  home: { ar: "الصفحة الرئيسية", en: "Home page", previewHash: "#/" },
  about: { ar: "صفحة من نحن", en: "About page", previewHash: "#/about" },
  contact: { ar: "صفحة التواصل", en: "Contact page", previewHash: "#/contact" },
  projects: { ar: "صفحة المنصات", en: "Platforms page", previewHash: "#/projects" },
}

export function mergePageHeaderConfig(
  base: PageHeaderConfig,
  patch?: Partial<PageHeaderConfig> | null
): PageHeaderConfig {
  if (!patch) return { ...base }
  return {
    ...base,
    ...patch,
    badge: { ...base.badge, ...(patch.badge ?? {}) },
    titleLine1: { ...base.titleLine1, ...(patch.titleLine1 ?? {}) },
    titleLine2: { ...base.titleLine2, ...(patch.titleLine2 ?? {}) },
    subtitle: { ...base.subtitle, ...(patch.subtitle ?? {}) },
    badgeStyle: { ...base.badgeStyle, ...(patch.badgeStyle ?? {}) },
    titleStyle: { ...base.titleStyle, ...(patch.titleStyle ?? {}) },
    titleAccentStyle: { ...base.titleAccentStyle, ...(patch.titleAccentStyle ?? {}) },
    subtitleStyle: { ...base.subtitleStyle, ...(patch.subtitleStyle ?? {}) },
  }
}

/** Home hero shows photo backgrounds without dark overlay — force readable dark text. */
export function homeHeroHeaderOnLightBackground(config: PageHeaderConfig): PageHeaderConfig {
  return {
    ...config,
    titleAccentUseGradient: false,
    titleStyle: { ...config.titleStyle, color: "#111827" },
    titleAccentStyle: { ...config.titleAccentStyle, color: "#111827" },
    subtitleStyle: { ...config.subtitleStyle, color: "#374151" },
  }
}

function splitLegacyHeroTitle(title: string): { line1: string; line2: string } {
  const trimmed = title.trim()
  if (!trimmed) return { line1: "", line2: "" }
  const parts = trimmed.split(/\s*[-–—]\s*/)
  if (parts.length >= 2) {
    return { line1: parts[0].trim(), line2: parts.slice(1).join(" - ").trim() }
  }
  return { line1: trimmed, line2: "" }
}

function legacyHomeHeroPatch(settings?: Record<string, string>): Partial<PageHeaderConfig> | undefined {
  if (!settings) return undefined
  const titleAr = String(settings.home_hero_title_ar ?? "").trim()
  const titleEn = String(settings.home_hero_title_en ?? "").trim()
  const subtitleAr = String(settings.home_hero_subtitle_ar ?? "").trim()
  const subtitleEn = String(settings.home_hero_subtitle_en ?? "").trim()
  if (!titleAr && !titleEn && !subtitleAr && !subtitleEn) return undefined

  const patch: Partial<PageHeaderConfig> = {}
  if (subtitleAr || subtitleEn) {
    patch.subtitle = {
      ar: subtitleAr || DEFAULT_PAGE_HEADERS.home.subtitle.ar,
      en: subtitleEn || DEFAULT_PAGE_HEADERS.home.subtitle.en,
    }
  }
  if (titleAr || titleEn) {
    const arParts = splitLegacyHeroTitle(titleAr)
    const enParts = splitLegacyHeroTitle(titleEn)
    patch.titleLine1 = {
      ar: arParts.line1 || DEFAULT_PAGE_HEADERS.home.titleLine1.ar,
      en: enParts.line1 || DEFAULT_PAGE_HEADERS.home.titleLine1.en,
    }
    patch.titleLine2 = {
      ar: arParts.line2,
      en: enParts.line2,
    }
    patch.titleSplit = Boolean(arParts.line2 || enParts.line2)
  }
  return patch
}

function parsePageHeaderPage(raw: unknown, base: PageHeaderConfig): PageHeaderConfig {
  const parsed = pageHeaderSchema.safeParse(raw)
  if (parsed.success) return mergePageHeaderConfig(base, parsed.data)
  if (raw && typeof raw === "object") {
    return mergePageHeaderConfig(base, raw as Partial<PageHeaderConfig>)
  }
  return mergePageHeaderConfig(base, undefined)
}

export function resolvePageHeadersFromSettings(settings: Record<string, string> = {}): PageHeadersStore {
  return parsePageHeaders(settings[PAGE_HEADERS_KEY] ?? null, settings)
}

export function homeHeaderLegacySyncFields(config: PageHeaderConfig): Record<string, string> {
  const combineTitle = (locale: "ar" | "en") => {
    const line1 = locale === "ar" ? config.titleLine1.ar : config.titleLine1.en
    const line2 = locale === "ar" ? config.titleLine2.ar : config.titleLine2.en
    if (config.titleSplit && line2.trim()) return `${line1} ${line2}`.trim()
    return line1.trim()
  }
  return {
    home_hero_title_ar: combineTitle("ar"),
    home_hero_title_en: combineTitle("en"),
    home_hero_subtitle_ar: config.subtitle.ar,
    home_hero_subtitle_en: config.subtitle.en,
  }
}

export function parsePageHeaders(
  raw: string | null | undefined,
  settings?: Record<string, string>
): PageHeadersStore {
  if (!raw) {
    return {
      home: mergePageHeaderConfig(DEFAULT_PAGE_HEADERS.home, legacyHomeHeroPatch(settings)),
      about: mergePageHeaderConfig(DEFAULT_PAGE_HEADERS.about, undefined),
      contact: mergePageHeaderConfig(DEFAULT_PAGE_HEADERS.contact, undefined),
      projects: mergePageHeaderConfig(DEFAULT_PAGE_HEADERS.projects, undefined),
    }
  }

  try {
    const json = JSON.parse(raw) as Record<string, unknown>
    const parsed = pageHeadersStoreSchema.safeParse(json)

    if (parsed.success) {
      return {
        home: parsed.data.home
          ? mergePageHeaderConfig(DEFAULT_PAGE_HEADERS.home, parsed.data.home)
          : mergePageHeaderConfig(DEFAULT_PAGE_HEADERS.home, legacyHomeHeroPatch(settings)),
        about: mergePageHeaderConfig(DEFAULT_PAGE_HEADERS.about, parsed.data.about),
        contact: mergePageHeaderConfig(DEFAULT_PAGE_HEADERS.contact, parsed.data.contact),
        projects: mergePageHeaderConfig(DEFAULT_PAGE_HEADERS.projects, parsed.data.projects),
      }
    }

    return {
      home: json.home
        ? parsePageHeaderPage(json.home, DEFAULT_PAGE_HEADERS.home)
        : mergePageHeaderConfig(DEFAULT_PAGE_HEADERS.home, legacyHomeHeroPatch(settings)),
      about: parsePageHeaderPage(json.about, DEFAULT_PAGE_HEADERS.about),
      contact: parsePageHeaderPage(json.contact, DEFAULT_PAGE_HEADERS.contact),
      projects: parsePageHeaderPage(json.projects, DEFAULT_PAGE_HEADERS.projects),
    }
  } catch {
    // ignore malformed json
  }

  return {
    home: mergePageHeaderConfig(DEFAULT_PAGE_HEADERS.home, legacyHomeHeroPatch(settings)),
    about: mergePageHeaderConfig(DEFAULT_PAGE_HEADERS.about, undefined),
    contact: mergePageHeaderConfig(DEFAULT_PAGE_HEADERS.contact, undefined),
    projects: mergePageHeaderConfig(DEFAULT_PAGE_HEADERS.projects, undefined),
  }
}

export function pickLocalized(text: LocalizedText, locale: "ar" | "en"): string {
  return locale === "ar" ? text.ar || text.en : text.en || text.ar
}

export function resolvePageBackgroundImage(
  config: PageHeaderConfig,
  settings: Record<string, string> = {},
  pageId: PageHeaderId
): string {
  const fromSettings = String(settings[`page_background_${pageId}`] || "").trim()
  return fromSettings || config.backgroundImage
}

export function textStyleToCss(style: TextStyle) {
  return {
    color: style.color,
    fontFamily: getNewsTickerFontStack(style.fontFamily),
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
  } as const
}

export function getPageHeader(pageId: PageHeaderId, store: PageHeadersStore): PageHeaderConfig {
  return store[pageId] ?? DEFAULT_PAGE_HEADERS[pageId]
}
