import { z } from "zod"

export const NEWS_TICKER_STYLE_KEY = "home_news_ticker_style"

export const DEFAULT_NEWS_TICKER_ITEMS_AR = [
  "منصة CIAR توفر خدمات سياحة وعقارات وتجارة إلكترونية للأفراد والشركات",
  "دعم فني على مدار الساعة لجميع منصاتنا الرقمية",
  "وحدات ذكاء اصطناعي جديدة ضمن منظومتنا المتكاملة",
  "توسع دولي في عدة قطاعات وخدمات رقمية",
]

export const newsTickerFontKeys = [
  "tajawal",
  "cairo",
  "el-messiri",
  "changa",
  "aref-ruqaa",
  "system",
] as const

export type NewsTickerFontKey = (typeof newsTickerFontKeys)[number]

export type NewsTickerStyle = {
  enabled: boolean
  backgroundType: "solid" | "gradient"
  backgroundColor: string
  backgroundColorEnd: string
  textColor: string
  separatorColor: string
  badgeBackgroundColor: string
  badgeTextColor: string
  badgeLabelAr: string
  badgeLabelEn: string
  fontFamily: NewsTickerFontKey
  fontSize: number
  fontWeight: 400 | 500 | 600 | 700 | 800
  scrollDuration: number
  stripHeight: number
}

export const NEWS_TICKER_FONT_OPTIONS: Array<{ key: NewsTickerFontKey; label: string; stack: string }> = [
  { key: "tajawal", label: "تجوال", stack: "var(--font-tajawal), sans-serif" },
  { key: "cairo", label: "القاهرة", stack: "var(--font-cairo), sans-serif" },
  { key: "el-messiri", label: "المسيري", stack: "var(--font-el-messiri), sans-serif" },
  { key: "changa", label: "تشانغا", stack: "var(--font-changa), sans-serif" },
  { key: "aref-ruqaa", label: "رفع الخط", stack: "var(--font-aref-ruqaa-ink), serif" },
  { key: "system", label: "خط الجهاز", stack: "system-ui, sans-serif" },
]

export const NEWS_TICKER_WEIGHT_OPTIONS: Array<{ value: NewsTickerStyle["fontWeight"]; label: string }> = [
  { value: 400, label: "عادي" },
  { value: 500, label: "متوسط" },
  { value: 600, label: "شبه عريض" },
  { value: 700, label: "عريض" },
  { value: 800, label: "عريض جداً" },
]

export const DEFAULT_NEWS_TICKER_STYLE: NewsTickerStyle = {
  enabled: true,
  backgroundType: "gradient",
  backgroundColor: "#1a2332",
  backgroundColorEnd: "#0f172a",
  textColor: "#ffffff",
  separatorColor: "#f5c542",
  badgeBackgroundColor: "#f5a623",
  badgeTextColor: "#1a1a2e",
  badgeLabelAr: "أخبار",
  badgeLabelEn: "News",
  fontFamily: "tajawal",
  fontSize: 13,
  fontWeight: 600,
  scrollDuration: 24,
  stripHeight: 46,
}

export const NEWS_TICKER_PRESETS: Array<{
  id: string
  label: string
  style: Partial<NewsTickerStyle>
}> = [
  {
    id: "gold-dark",
    label: "ذهبي داكن",
    style: {
      backgroundType: "gradient",
      backgroundColor: "#1a2332",
      backgroundColorEnd: "#0f172a",
      textColor: "#ffffff",
      separatorColor: "#f5c542",
      badgeBackgroundColor: "#f5a623",
      badgeTextColor: "#1a1a2e",
    },
  },
  {
    id: "orange-night",
    label: "برتقالي ليلي",
    style: {
      backgroundType: "gradient",
      backgroundColor: "#2d1810",
      backgroundColorEnd: "#1a0f08",
      textColor: "#fff7ed",
      separatorColor: "#fb923c",
      badgeBackgroundColor: "#ea580c",
      badgeTextColor: "#ffffff",
    },
  },
  {
    id: "clean-light",
    label: "فاتح نظيف",
    style: {
      backgroundType: "solid",
      backgroundColor: "#f8fafc",
      backgroundColorEnd: "#f8fafc",
      textColor: "#0f172a",
      separatorColor: "#f97316",
      badgeBackgroundColor: "#f97316",
      badgeTextColor: "#ffffff",
    },
  },
  {
    id: "royal-blue",
    label: "أزرق ملكي",
    style: {
      backgroundType: "gradient",
      backgroundColor: "#1e3a5f",
      backgroundColorEnd: "#0f2744",
      textColor: "#e0f2fe",
      separatorColor: "#38bdf8",
      badgeBackgroundColor: "#0284c7",
      badgeTextColor: "#ffffff",
    },
  },
]

const hexColor = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "لون غير صالح")

export const newsTickerStyleSchema = z.object({
  enabled: z.boolean(),
  backgroundType: z.enum(["solid", "gradient"]),
  backgroundColor: hexColor,
  backgroundColorEnd: hexColor,
  textColor: hexColor,
  separatorColor: hexColor,
  badgeBackgroundColor: hexColor,
  badgeTextColor: hexColor,
  badgeLabelAr: z.string().trim().min(1).max(24),
  badgeLabelEn: z.string().trim().min(1).max(24),
  fontFamily: z.enum(newsTickerFontKeys),
  fontSize: z.number().min(11).max(22),
  fontWeight: z.union([z.literal(400), z.literal(500), z.literal(600), z.literal(700), z.literal(800)]),
  scrollDuration: z.number().min(8).max(60),
  stripHeight: z.number().min(36).max(72),
})

export function getNewsTickerFontStack(key: NewsTickerFontKey): string {
  return NEWS_TICKER_FONT_OPTIONS.find((item) => item.key === key)?.stack ?? NEWS_TICKER_FONT_OPTIONS[0].stack
}

export function parseNewsTickerStyle(raw: string | null | undefined): NewsTickerStyle {
  if (!raw) return { ...DEFAULT_NEWS_TICKER_STYLE }
  try {
    const parsed = newsTickerStyleSchema.safeParse(JSON.parse(raw))
    if (parsed.success) return parsed.data
  } catch {
    // ignore
  }
  return { ...DEFAULT_NEWS_TICKER_STYLE }
}

export function getNewsTickerBackground(style: NewsTickerStyle): string {
  if (style.backgroundType === "gradient") {
    return `linear-gradient(90deg, ${style.backgroundColor} 0%, ${style.backgroundColorEnd} 50%, ${style.backgroundColor} 100%)`
  }
  return style.backgroundColor
}
