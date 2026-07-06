import { z } from "zod"
import { textStyleSchema, type TextStyle } from "@/lib/text-style"

export const HOME_ABOUT_BRIEF_KEY = "home_about_brief_config"

export type LocalizedText = { ar: string; en: string }

export type HomeAboutBriefStat = {
  value: string
  label: LocalizedText
}

export type HomeAboutBriefContent = {
  label: LocalizedText
  title: LocalizedText
  description: LocalizedText
  cta: LocalizedText
  cardTitle: LocalizedText
  cardDescription: LocalizedText
  stats: [HomeAboutBriefStat, HomeAboutBriefStat, HomeAboutBriefStat]
}

export type HomeAboutBriefStyle = {
  label: TextStyle
  title: TextStyle & { useGradient: boolean; accentColor: string }
  description: TextStyle & { lineHeight: number }
  cta: TextStyle
  cardTitle: TextStyle
  cardDescription: TextStyle & { lineHeight: number }
  statValue: TextStyle
  statLabel: TextStyle
}

export type HomeAboutBriefConfig = {
  content: HomeAboutBriefContent
  style: HomeAboutBriefStyle
}

const localizedSchema = z.object({ ar: z.string(), en: z.string() })

const statSchema = z.object({
  value: z.string().max(24),
  label: localizedSchema,
})

const contentSchema = z.object({
  label: localizedSchema,
  title: localizedSchema,
  description: localizedSchema,
  cta: localizedSchema,
  cardTitle: localizedSchema,
  cardDescription: localizedSchema,
  stats: z.tuple([statSchema, statSchema, statSchema]),
})

const styleSchema = z.object({
  label: textStyleSchema,
  title: textStyleSchema.extend({
    useGradient: z.boolean(),
    accentColor: z.string(),
  }),
  description: textStyleSchema.extend({
    lineHeight: z.number().min(1.2).max(2.4),
  }),
  cta: textStyleSchema,
  cardTitle: textStyleSchema,
  cardDescription: textStyleSchema.extend({
    lineHeight: z.number().min(1.2).max(2.4),
  }),
  statValue: textStyleSchema,
  statLabel: textStyleSchema,
})

export const homeAboutBriefConfigSchema = z.object({
  content: contentSchema,
  style: styleSchema,
})

const defaultText = (color: string, fontSize: number, fontWeight: TextStyle["fontWeight"] = 400): TextStyle => ({
  color,
  fontFamily: "tajawal",
  fontSize,
  fontWeight,
})

export const DEFAULT_HOME_ABOUT_BRIEF: HomeAboutBriefConfig = {
  content: {
    label: { ar: "عن CIAR", en: "About CIAR" },
    title: {
      ar: "تمكين الخدمات الرقمية عبر القطاعات",
      en: "Empowering Digital Services Across Industries",
    },
    description: {
      ar: "CIAR شركة خدمات رقمية رائدة تدير 12 منصة متكاملة تشمل الموضة، المنتجات العالمية، VIP، التجارة الإلكترونية، السياحة، العقارات، السيارات، الصيانة، الشحن، التوظيف، الإعلانات، والاستثمار. نبني تجارب سلسة مدفوعة بالتكنولوجيا تربط الشركات بعملائها.",
      en: "CIAR is a leading digital services company managing 12 integrated platforms spanning fashion, global products, VIP services, e-commerce, tourism, real estate, cars, home services, shipping, jobs, marketing, and investment. We build seamless, technology-driven experiences that connect businesses with their customers.",
    },
    cta: { ar: "اعرف المزيد", en: "Learn More" },
    cardTitle: { ar: "منذ 2018", en: "Since 2018" },
    cardDescription: {
      ar: "نقدم حلولاً رقمية مبتكرة ونحول طريقة عمل الشركات في منطقة الشرق الأوسط وخارجها.",
      en: "Delivering innovative digital solutions and transforming how businesses operate across the Middle East and beyond.",
    },
    stats: [
      { value: "6+", label: { ar: "سنوات", en: "Years" } },
      { value: "8", label: { ar: "منصات", en: "Platforms" } },
      { value: "50K+", label: { ar: "مستخدم", en: "Users" } },
    ],
  },
  style: {
    label: { ...defaultText("#c4a035", 12, 600) },
    title: {
      ...defaultText("#ffffff", 36, 700),
      useGradient: false,
      accentColor: "#f5c542",
    },
    description: {
      ...defaultText("#94a3b8", 18, 400),
      lineHeight: 1.75,
    },
    cta: defaultText("#0f172a", 14, 600),
    cardTitle: defaultText("#ffffff", 20, 600),
    cardDescription: {
      ...defaultText("#94a3b8", 14, 400),
      lineHeight: 1.65,
    },
    statValue: { ...defaultText("#f5c542", 24, 700) },
    statLabel: defaultText("#94a3b8", 12, 400),
  },
}

function mergeLocalized(base: LocalizedText, patch?: Partial<LocalizedText>): LocalizedText {
  return { ...base, ...(patch ?? {}) }
}

function mergeStat(base: HomeAboutBriefStat, patch?: Partial<HomeAboutBriefStat>): HomeAboutBriefStat {
  return {
    value: patch?.value ?? base.value,
    label: mergeLocalized(base.label, patch?.label),
  }
}

export function mergeHomeAboutBriefConfig(
  base: HomeAboutBriefConfig,
  patch?: Partial<HomeAboutBriefConfig> | null
): HomeAboutBriefConfig {
  if (!patch) return structuredClone(base)
  const content = patch.content
  const style = patch.style
  return {
    content: {
      label: mergeLocalized(base.content.label, content?.label),
      title: mergeLocalized(base.content.title, content?.title),
      description: mergeLocalized(base.content.description, content?.description),
      cta: mergeLocalized(base.content.cta, content?.cta),
      cardTitle: mergeLocalized(base.content.cardTitle, content?.cardTitle),
      cardDescription: mergeLocalized(base.content.cardDescription, content?.cardDescription),
      stats: [
        mergeStat(base.content.stats[0], content?.stats?.[0]),
        mergeStat(base.content.stats[1], content?.stats?.[1]),
        mergeStat(base.content.stats[2], content?.stats?.[2]),
      ],
    },
    style: {
      label: { ...base.style.label, ...(style?.label ?? {}) },
      title: { ...base.style.title, ...(style?.title ?? {}) },
      description: { ...base.style.description, ...(style?.description ?? {}) },
      cta: { ...base.style.cta, ...(style?.cta ?? {}) },
      cardTitle: { ...base.style.cardTitle, ...(style?.cardTitle ?? {}) },
      cardDescription: { ...base.style.cardDescription, ...(style?.cardDescription ?? {}) },
      statValue: { ...base.style.statValue, ...(style?.statValue ?? {}) },
      statLabel: { ...base.style.statLabel, ...(style?.statLabel ?? {}) },
    },
  }
}

export function parseHomeAboutBrief(raw: string | null | undefined): HomeAboutBriefConfig {
  if (!raw) return mergeHomeAboutBriefConfig(DEFAULT_HOME_ABOUT_BRIEF, null)
  try {
    const parsed = homeAboutBriefConfigSchema.safeParse(JSON.parse(raw))
    if (parsed.success) {
      return mergeHomeAboutBriefConfig(DEFAULT_HOME_ABOUT_BRIEF, parsed.data)
    }
    const json = JSON.parse(raw) as Partial<HomeAboutBriefConfig>
    return mergeHomeAboutBriefConfig(DEFAULT_HOME_ABOUT_BRIEF, json)
  } catch {
    return mergeHomeAboutBriefConfig(DEFAULT_HOME_ABOUT_BRIEF, null)
  }
}

export function pickLocalized(text: LocalizedText, locale: "ar" | "en"): string {
  return locale === "ar" ? text.ar || text.en : text.en || text.ar
}

export function buildHomeAboutBrief(settings: Record<string, string>): HomeAboutBriefConfig {
  return parseHomeAboutBrief(settings[HOME_ABOUT_BRIEF_KEY])
}
