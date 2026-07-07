import { z } from "zod"
import { textStyleSchema, textStyleToCss, type TextStyle } from "@/lib/text-style"

export const LEGAL_LIGHT_TEXT_COLOR = "#000000"
export const LEGAL_DARK_TEXT_COLOR = "#ffffff"

export const LEGAL_PAGES_KEY = "legal_pages_config"

export type LocalizedText = { ar: string; en: string }

export type LegalSection = {
  heading: LocalizedText
  body: LocalizedText
}

export type LegalPageContent = {
  pageTitle: LocalizedText
  intro: LocalizedText
  lastUpdated: LocalizedText
  sections: LegalSection[]
}

export type LegalPageStyle = {
  pageTitle: TextStyle & { useGradient: boolean; accentColor: string }
  intro: TextStyle & { lineHeight: number }
  sectionHeading: TextStyle
  body: TextStyle & { lineHeight: number }
  lastUpdated: TextStyle
}

export type LegalPageConfig = {
  content: LegalPageContent
  style: LegalPageStyle
}

export type LegalPageId = "privacy" | "terms"

export type LegalPagesConfig = Record<LegalPageId, LegalPageConfig>

const localizedSchema = z.object({ ar: z.string(), en: z.string() })

const sectionSchema = z.object({
  heading: localizedSchema,
  body: localizedSchema,
})

const contentSchema = z.object({
  pageTitle: localizedSchema,
  intro: localizedSchema,
  lastUpdated: localizedSchema,
  sections: z.array(sectionSchema).min(1).max(30),
})

const styleSchema = z.object({
  pageTitle: textStyleSchema.extend({
    useGradient: z.boolean(),
    accentColor: z.string(),
  }),
  intro: textStyleSchema.extend({
    lineHeight: z.number().min(1.2).max(2.4),
  }),
  sectionHeading: textStyleSchema,
  body: textStyleSchema.extend({
    lineHeight: z.number().min(1.2).max(2.4),
  }),
  lastUpdated: textStyleSchema,
})

const pageConfigSchema = z.object({
  content: contentSchema,
  style: styleSchema,
})

export const legalPagesConfigSchema = z.object({
  privacy: pageConfigSchema,
  terms: pageConfigSchema,
})

const defaultText = (
  color: string,
  fontSize: number,
  fontWeight: TextStyle["fontWeight"] = 400
): TextStyle => ({
  color,
  fontFamily: "tajawal",
  fontSize,
  fontWeight,
})

const defaultPageStyle = (): LegalPageStyle => ({
  pageTitle: {
    ...defaultText(LEGAL_LIGHT_TEXT_COLOR, 40, 700),
    useGradient: false,
    accentColor: LEGAL_LIGHT_TEXT_COLOR,
  },
  intro: {
    ...defaultText(LEGAL_LIGHT_TEXT_COLOR, 18, 400),
    lineHeight: 1.75,
  },
  sectionHeading: defaultText(LEGAL_LIGHT_TEXT_COLOR, 22, 600),
  body: {
    ...defaultText(LEGAL_LIGHT_TEXT_COLOR, 16, 400),
    lineHeight: 1.8,
  },
  lastUpdated: defaultText(LEGAL_LIGHT_TEXT_COLOR, 13, 400),
})

const DEFAULT_PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: { ar: "مقدمة", en: "Introduction" },
    body: {
      ar: "تلتزم CIAR بحماية خصوصية مستخدمي منصاتنا الرقمية. توضح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها عند استخدام خدماتنا.",
      en: "CIAR is committed to protecting the privacy of users across our digital platforms. This policy explains how we collect, use, and safeguard your data when you use our services.",
    },
  },
  {
    heading: { ar: "البيانات التي نجمعها", en: "Data We Collect" },
    body: {
      ar: "قد نجمع معلومات الحساب (الاسم، البريد الإلكتروني، رقم الهاتف)، وبيانات الاستخدام، ومعلومات الجهاز، ومحتوى الطلبات أو الرسائل التي ترسلها عبر المنصات.",
      en: "We may collect account information (name, email, phone), usage data, device information, and content you submit through orders, messages, or forms on our platforms.",
    },
  },
  {
    heading: { ar: "كيفية استخدام البيانات", en: "How We Use Data" },
    body: {
      ar: "نستخدم البيانات لتقديم الخدمات، وتحسين تجربة المستخدم، والدعم الفني، والأمان، والامتثال للأنظمة المعمول بها. لا نبيع بياناتك الشخصية لأطراف ثالثة.",
      en: "We use data to deliver services, improve user experience, provide support, maintain security, and comply with applicable regulations. We do not sell your personal data to third parties.",
    },
  },
  {
    heading: { ar: "حماية البيانات", en: "Data Protection" },
    body: {
      ar: "نطبق إجراءات أمنية تقنية وإدارية مناسبة، بما في ذلك التشفير وضوابط الوصول، لحماية بياناتك من الوصول أو الاستخدام غير المصرح به.",
      en: "We apply appropriate technical and administrative security measures, including encryption and access controls, to protect your data from unauthorized access or misuse.",
    },
  },
  {
    heading: { ar: "حقوقك", en: "Your Rights" },
    body: {
      ar: "يحق لك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها، والاعتراض على بعض المعالجات، وسحب الموافقة حيث ينطبق ذلك. تواصل معنا لتقديم أي طلب متعلق بخصوصيتك.",
      en: "You may request access, correction, or deletion of your data, object to certain processing, and withdraw consent where applicable. Contact us to submit any privacy-related request.",
    },
  },
  {
    heading: { ar: "التواصل", en: "Contact" },
    body: {
      ar: "للاستفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر صفحة «تواصل معنا» على الموقع أو عبر قنوات الدعم الرسمية لـ CIAR.",
      en: "For privacy-related inquiries, please contact us through the Contact page on this site or via CIAR's official support channels.",
    },
  },
]

const DEFAULT_TERMS_SECTIONS: LegalSection[] = [
  {
    heading: { ar: "مقدمة", en: "Introduction" },
    body: {
      ar: "تحكم هذه الشروط والأحكام استخدامك لموقع CIAR ومنصاته الرقمية. باستخدامك للخدمات، فإنك توافق على الالتزام بهذه الشروط.",
      en: "These Terms and Conditions govern your use of the CIAR website and digital platforms. By using our services, you agree to comply with these terms.",
    },
  },
  {
    heading: { ar: "قبول الشروط", en: "Acceptance of Terms" },
    body: {
      ar: "يجب أن تكون بالغاً أو تمتلك الصلاحية القانونية لاستخدام الخدمات. إذا كنت تستخدم المنصات نيابة عن جهة، فأنت تؤكد أن لديك الصلاحية لقبول هذه الشروط نيابة عنها.",
      en: "You must be of legal age or have authority to use the services. If you use the platforms on behalf of an organization, you confirm you have authority to accept these terms on its behalf.",
    },
  },
  {
    heading: { ar: "استخدام المنصات", en: "Use of Platforms" },
    body: {
      ar: "يُحظر استخدام المنصات لأي نشاط غير قانوني أو مضلل أو ينتهك حقوق الآخرين. نحتفظ بالحق في تعليق أو إنهاء الوصول عند مخالفة هذه الشروط.",
      en: "You may not use the platforms for unlawful, misleading, or rights-infringing activity. We reserve the right to suspend or terminate access when these terms are violated.",
    },
  },
  {
    heading: { ar: "الحسابات والمسؤوليات", en: "Accounts & Responsibilities" },
    body: {
      ar: "أنت مسؤول عن الحفاظ على سرية بيانات حسابك وعن جميع الأنشطة التي تتم من خلاله. يجب تقديم معلومات دقيقة ومحدّثة عند التسجيل أو إرسال الطلبات.",
      en: "You are responsible for keeping your account credentials secure and for all activity under your account. You must provide accurate and up-to-date information when registering or submitting requests.",
    },
  },
  {
    heading: { ar: "الملكية الفكرية", en: "Intellectual Property" },
    body: {
      ar: "جميع العلامات التجارية والشعارات والمحتوى المملوك لـ CIAR محمية بموجب القوانين المعمول بها. لا يجوز نسخها أو إعادة استخدامها دون إذن مسبق.",
      en: "All CIAR trademarks, logos, and proprietary content are protected under applicable laws. They may not be copied or reused without prior permission.",
    },
  },
  {
    heading: { ar: "إنهاء الخدمة", en: "Termination" },
    body: {
      ar: "يجوز لنا تعديل أو إيقاف أي جزء من الخدمات أو هذه الشروط في أي وقت. استمرارك في استخدام المنصات بعد التحديث يعني موافقتك على الشروط المعدّلة.",
      en: "We may modify or discontinue any part of the services or these terms at any time. Continued use of the platforms after updates constitutes acceptance of the revised terms.",
    },
  },
  {
    heading: { ar: "التواصل", en: "Contact" },
    body: {
      ar: "لأي استفسار حول الشروط والأحكام، يرجى التواصل معنا عبر صفحة «تواصل معنا» على الموقع.",
      en: "For questions about these Terms and Conditions, please contact us through the Contact page on this site.",
    },
  },
]

export const DEFAULT_LEGAL_PAGES: LegalPagesConfig = {
  privacy: {
    content: {
      pageTitle: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
      intro: {
        ar: "نلتزم بحماية بياناتك وخصوصيتك عبر جميع منصات CIAR الرقمية.",
        en: "We are committed to protecting your data and privacy across all CIAR digital platforms.",
      },
      lastUpdated: { ar: "آخر تحديث: 2026", en: "Last updated: 2026" },
      sections: DEFAULT_PRIVACY_SECTIONS,
    },
    style: defaultPageStyle(),
  },
  terms: {
    content: {
      pageTitle: { ar: "الشروط والأحكام", en: "Terms & Conditions" },
      intro: {
        ar: "يرجى قراءة هذه الشروط بعناية قبل استخدام موقع CIAR ومنصاته.",
        en: "Please read these terms carefully before using the CIAR website and platforms.",
      },
      lastUpdated: { ar: "آخر تحديث: 2026", en: "Last updated: 2026" },
      sections: DEFAULT_TERMS_SECTIONS,
    },
    style: defaultPageStyle(),
  },
}

function mergeLocalized(base: LocalizedText, patch?: Partial<LocalizedText>): LocalizedText {
  return { ...base, ...(patch ?? {}) }
}

function mergeSection(base: LegalSection, patch?: Partial<LegalSection>): LegalSection {
  return {
    heading: mergeLocalized(base.heading, patch?.heading),
    body: mergeLocalized(base.body, patch?.body),
  }
}

function mergePageConfig(base: LegalPageConfig, patch?: Partial<LegalPageConfig> | null): LegalPageConfig {
  if (!patch) return structuredClone(base)
  const content = patch.content
  const style = patch.style
  const baseSections = base.content.sections
  const patchSections = content?.sections

  let sections = baseSections
  if (patchSections) {
    sections = patchSections.map((section, index) =>
      mergeSection(baseSections[index] ?? { heading: { ar: "", en: "" }, body: { ar: "", en: "" } }, section)
    )
    if (patchSections.length > baseSections.length) {
      sections = [
        ...sections,
        ...patchSections.slice(baseSections.length).map((section) =>
          mergeSection({ heading: { ar: "", en: "" }, body: { ar: "", en: "" } }, section)
        ),
      ]
    }
  }

  return {
    content: {
      pageTitle: mergeLocalized(base.content.pageTitle, content?.pageTitle),
      intro: mergeLocalized(base.content.intro, content?.intro),
      lastUpdated: mergeLocalized(base.content.lastUpdated, content?.lastUpdated),
      sections,
    },
    style: {
      pageTitle: { ...base.style.pageTitle, ...(style?.pageTitle ?? {}) },
      intro: { ...base.style.intro, ...(style?.intro ?? {}) },
      sectionHeading: { ...base.style.sectionHeading, ...(style?.sectionHeading ?? {}) },
      body: { ...base.style.body, ...(style?.body ?? {}) },
      lastUpdated: { ...base.style.lastUpdated, ...(style?.lastUpdated ?? {}) },
    },
  }
}

export function mergeLegalPagesConfig(
  base: LegalPagesConfig,
  patch?: Partial<LegalPagesConfig> | null
): LegalPagesConfig {
  if (!patch) return structuredClone(base)
  return {
    privacy: mergePageConfig(base.privacy, patch.privacy),
    terms: mergePageConfig(base.terms, patch.terms),
  }
}

export function parseLegalPages(raw: string | null | undefined): LegalPagesConfig {
  if (!raw) return mergeLegalPagesConfig(DEFAULT_LEGAL_PAGES, null)
  try {
    const parsed = legalPagesConfigSchema.safeParse(JSON.parse(raw))
    if (parsed.success) {
      return mergeLegalPagesConfig(DEFAULT_LEGAL_PAGES, parsed.data)
    }
    const json = JSON.parse(raw) as Partial<LegalPagesConfig>
    return mergeLegalPagesConfig(DEFAULT_LEGAL_PAGES, json)
  } catch {
    return mergeLegalPagesConfig(DEFAULT_LEGAL_PAGES, null)
  }
}

export function pickLocalized(text: LocalizedText, locale: "ar" | "en"): string {
  return locale === "ar" ? text.ar || text.en : text.en || text.ar
}

export function buildLegalPages(settings: Record<string, string>): LegalPagesConfig {
  return parseLegalPages(settings[LEGAL_PAGES_KEY])
}

export function getLegalPage(config: LegalPagesConfig, pageId: LegalPageId): LegalPageConfig {
  return config[pageId]
}

/** الوضع النهاري: أسود — الوضع الليلي: أبيض. */
export function legalTextStyleToCss(style: TextStyle, isLightMode: boolean) {
  const color = isLightMode ? LEGAL_LIGHT_TEXT_COLOR : LEGAL_DARK_TEXT_COLOR
  return textStyleToCss({ ...style, color })
}

export function legalTitleStyleToCss(
  style: TextStyle & { useGradient: boolean; accentColor: string },
  isLightMode: boolean
) {
  const color = isLightMode ? LEGAL_LIGHT_TEXT_COLOR : LEGAL_DARK_TEXT_COLOR
  return textStyleToCss({ ...style, color })
}

export function legalBodyStyleToCss(
  style: TextStyle & { lineHeight: number },
  isLightMode: boolean
) {
  const base = legalTextStyleToCss(style, isLightMode)
  return { ...base, lineHeight: style.lineHeight }
}
