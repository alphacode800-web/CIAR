export const HOME_SECTION_LABELS_AR: Record<string, string> = {
  "hero-slideshow": "عرض الشرائح الرئيسي",
  "marquee-banner": "الشريط المتحرك",
  "about-brief": "نبذة عن الشركة",
  "trust-badges": "شارات الثقة",
  "services-grid": "شبكة الخدمات",
  "how-it-works": "كيف نعمل",
  "stats-section": "قسم الإحصاءات",
  "platforms-grid": "شبكة المنصات",
  "platform-showcase": "عرض المنصات",
  "tech-stack": "التقنيات المستخدمة",
  testimonials: "آراء العملاء",
  "global-presence": "الحضور العالمي",
  "team-highlight": "فريق العمل",
  "awards-banner": "شريط الجوائز",
  "news-updates": "الأخبار والتحديثات",
  "faq-section": "الأسئلة الشائعة",
  "newsletter-cta": "اشتراك النشرة البريدية",
}

export function getHomeSectionLabelAr(sectionId: string, fallbackName = ""): string {
  return HOME_SECTION_LABELS_AR[sectionId] || fallbackName || sectionId
}

export function localizeHomeSection<T extends { id: string; name: string }>(section: T): T {
  return {
    ...section,
    name: getHomeSectionLabelAr(section.id, section.name),
  }
}

export function buildDefaultHomeSections(): Array<{ id: string; name: string; visible: boolean; order: number }> {
  return Object.entries(HOME_SECTION_LABELS_AR).map(([id, name], order) => ({
    id,
    name,
    visible: true,
    order,
  }))
}
