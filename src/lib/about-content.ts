import { z } from "zod"
import {
  getNewsTickerFontStack,
  newsTickerFontKeys,
  type NewsTickerFontKey,
} from "@/lib/news-ticker"

export const ABOUT_COMPANY_INTRO_AR_KEY = "about_company_intro_ar"
export const ABOUT_COMPANY_INTRO_EN_KEY = "about_company_intro_en"
export const ABOUT_COMPANY_INTRO_STYLE_KEY = "about_company_intro_style"

export type AboutTextStyle = {
  color: string
  fontFamily: NewsTickerFontKey
  fontSize: number
  fontWeight: 400 | 500 | 600 | 700 | 800
}

export type AboutIntroStyle = {
  sectionTitle: { ar: string; en: string }
  title: AboutTextStyle & { useGradient: boolean; accentColor: string }
  body: AboutTextStyle & { lineHeight: number }
}

export type AboutCompanyIntro = {
  ar: string
  en: string
  style: AboutIntroStyle
}

const textStyleSchema = z.object({
  color: z.string(),
  fontFamily: z.enum(newsTickerFontKeys),
  fontSize: z.number().min(12).max(72),
  fontWeight: z.union([z.literal(400), z.literal(500), z.literal(600), z.literal(700), z.literal(800)]),
})

export const aboutIntroStyleSchema = z.object({
  sectionTitle: z.object({ ar: z.string().max(120), en: z.string().max(120) }),
  title: textStyleSchema.extend({
    useGradient: z.boolean(),
    accentColor: z.string(),
  }),
  body: textStyleSchema.extend({
    lineHeight: z.number().min(1.2).max(2.4),
  }),
})

export const aboutCompanyIntroSchema = z.object({
  ar: z.string().trim().max(2000),
  en: z.string().trim().max(2000),
  style: aboutIntroStyleSchema.optional(),
})

export const DEFAULT_ABOUT_INTRO_STYLE: AboutIntroStyle = {
  sectionTitle: { ar: "قيمنا", en: "Our Values" },
  title: {
    color: "#ffffff",
    accentColor: "#f5c542",
    fontFamily: "tajawal",
    fontSize: 30,
    fontWeight: 700,
    useGradient: true,
  },
  body: {
    color: "#94a3b8",
    fontFamily: "tajawal",
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.75,
  },
}

export const DEFAULT_ABOUT_COMPANY_INTRO: AboutCompanyIntro = {
  ar: "CIAR منظومة رقمية متكاملة تجمع بين التجارة الإلكترونية، العقارات، السياحة، التوظيف، الشحن، والخدمات اليومية في تجربة واحدة موحّدة. نبني حلولاً موثوقة وسريعة تُدار بالكامل من لوحة تحكم احترافية، مع واجهات عصرية بالعربية والإنجليزية تلبّي احتياجات الأفراد والشركات على حدّ سواء. نلتزم بالجودة والأمان وشفافية الخدمة، ونسعى لتمكين مستخدمينا من الوصول إلى فرص حقيقية عبر شبكة منصات متخصصة تعمل بتكامل وانسجام، مع دعم مستمر وتطوير دائم يواكب تطلعات السوق الرقمي.",
  en: "CIAR is an integrated digital ecosystem that brings e-commerce, real estate, tourism, jobs, shipping, and everyday services together in one unified experience. We build reliable, fast solutions fully managed through a professional admin panel, with modern Arabic and English interfaces for individuals and businesses alike. We are committed to quality, security, and service transparency, empowering our users to access real opportunities through a network of specialized platforms that work in harmony—with continuous support and ongoing development that keeps pace with the digital market.",
  style: DEFAULT_ABOUT_INTRO_STYLE,
}

export function parseAboutIntroStyle(raw: string | null | undefined): AboutIntroStyle {
  if (!raw) return { ...DEFAULT_ABOUT_INTRO_STYLE }
  try {
    const parsed = aboutIntroStyleSchema.safeParse(JSON.parse(raw))
    if (parsed.success) {
      return { ...DEFAULT_ABOUT_INTRO_STYLE, ...parsed.data }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_ABOUT_INTRO_STYLE }
}

export function buildAboutCompanyIntro(settings: Record<string, string>): AboutCompanyIntro {
  const ar = String(settings[ABOUT_COMPANY_INTRO_AR_KEY] ?? "").trim()
  const en = String(settings[ABOUT_COMPANY_INTRO_EN_KEY] ?? "").trim()
  const style = parseAboutIntroStyle(settings[ABOUT_COMPANY_INTRO_STYLE_KEY])

  return {
    ar: ar || DEFAULT_ABOUT_COMPANY_INTRO.ar,
    en: en || DEFAULT_ABOUT_COMPANY_INTRO.en,
    style,
  }
}

export function resolveAboutCompanyIntro(intro: AboutCompanyIntro, locale: string): string {
  return locale === "ar" ? intro.ar : intro.en
}

export function resolveAboutSectionTitle(intro: AboutCompanyIntro, locale: string): string {
  const title = locale === "ar" ? intro.style.sectionTitle.ar : intro.style.sectionTitle.en
  return title || (locale === "ar" ? DEFAULT_ABOUT_INTRO_STYLE.sectionTitle.ar : DEFAULT_ABOUT_INTRO_STYLE.sectionTitle.en)
}

export function aboutTextStyleToCss(style: AboutTextStyle) {
  return {
    color: style.color,
    fontFamily: getNewsTickerFontStack(style.fontFamily),
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
  } as const
}

export function aboutTitleStyleToCss(style: AboutIntroStyle["title"]) {
  if (style.useGradient) {
    return {
      fontFamily: getNewsTickerFontStack(style.fontFamily),
      fontSize: `${style.fontSize}px`,
      fontWeight: style.fontWeight,
      backgroundImage: `linear-gradient(135deg, ${style.accentColor}, ${style.color})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    } as const
  }
  return aboutTextStyleToCss(style)
}
