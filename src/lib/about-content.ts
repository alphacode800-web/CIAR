import { z } from "zod"

export const ABOUT_COMPANY_INTRO_AR_KEY = "about_company_intro_ar"
export const ABOUT_COMPANY_INTRO_EN_KEY = "about_company_intro_en"

export type AboutCompanyIntro = {
  ar: string
  en: string
}

export const DEFAULT_ABOUT_COMPANY_INTRO: AboutCompanyIntro = {
  ar: "CIAR منظومة رقمية متكاملة تجمع بين التجارة الإلكترونية، العقارات، السياحة، التوظيف، الشحن، والخدمات اليومية في تجربة واحدة موحّدة. نبني حلولاً موثوقة وسريعة تُدار بالكامل من لوحة تحكم احترافية، مع واجهات عصرية بالعربية والإنجليزية تلبّي احتياجات الأفراد والشركات على حدّ سواء. نلتزم بالجودة والأمان وشفافية الخدمة، ونسعى لتمكين مستخدمينا من الوصول إلى فرص حقيقية عبر شبكة منصات متخصصة تعمل بتكامل وانسجام، مع دعم مستمر وتطوير دائم يواكب تطلعات السوق الرقمي.",
  en: "CIAR is an integrated digital ecosystem that brings e-commerce, real estate, tourism, jobs, shipping, and everyday services together in one unified experience. We build reliable, fast solutions fully managed through a professional admin panel, with modern Arabic and English interfaces for individuals and businesses alike. We are committed to quality, security, and service transparency, empowering our users to access real opportunities through a network of specialized platforms that work in harmony—with continuous support and ongoing development that keeps pace with the digital market.",
}

export const aboutCompanyIntroSchema = z.object({
  ar: z.string().trim().max(2000),
  en: z.string().trim().max(2000),
})

export function buildAboutCompanyIntro(settings: Record<string, string>): AboutCompanyIntro {
  const ar = String(settings[ABOUT_COMPANY_INTRO_AR_KEY] ?? "").trim()
  const en = String(settings[ABOUT_COMPANY_INTRO_EN_KEY] ?? "").trim()

  return {
    ar: ar || DEFAULT_ABOUT_COMPANY_INTRO.ar,
    en: en || DEFAULT_ABOUT_COMPANY_INTRO.en,
  }
}

export function resolveAboutCompanyIntro(intro: AboutCompanyIntro, locale: string): string {
  return locale === "ar" ? intro.ar : intro.en
}
