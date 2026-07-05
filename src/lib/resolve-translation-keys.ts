import { DEFAULT_TRANSLATIONS } from "@/lib/default-translations"

/** كل مفاتيح الترجمة المعروفة (اتحاد en + ar). */
export function getAllTranslationKeys(): string[] {
  const keys = new Set<string>()
  for (const locale of Object.keys(DEFAULT_TRANSLATIONS)) {
    for (const key of Object.keys(DEFAULT_TRANSLATIONS[locale] ?? {})) {
      keys.add(key)
    }
  }
  return Array.from(keys).sort()
}

/**
 * يحلّ أنماط مثل `home.marquee_*` أو `projects.title, projects.subtitle`.
 */
export function resolveKeyPatterns(pattern: string, allKeys: string[]): string[] {
  const result = new Set<string>()
  for (const part of pattern.split(",").map((s) => s.trim()).filter(Boolean)) {
    if (part.endsWith("*")) {
      const prefix = part.slice(0, -1)
      for (const key of allKeys) {
        if (key.startsWith(prefix)) result.add(key)
      }
    } else {
      result.add(part)
    }
  }
  return Array.from(result).sort()
}

/** تسميات عربية مختصرة لحقول التحرير. */
const FIELD_LABELS_AR: Record<string, string> = {
  title: "العنوان",
  subtitle: "الوصف الفرعي",
  badge: "الشارة",
  label: "التسمية",
  description: "الوصف",
  desc: "الوصف",
  cta: "زر الإجراء",
  placeholder: "نص الحقل",
  quote: "الاقتباس",
  name: "الاسم",
  role: "الدور / المنصب",
  date: "التاريخ",
  category: "التصنيف",
  excerpt: "المقتطف",
  privacy: "ملاحظة الخصوصية",
  subscribed: "رسالة الاشتراك",
  q: "السؤال",
  a: "الجواب",
  text: "النص",
  value: "القيمة",
  view_all: "عرض الكل",
  read_more: "اقرأ المزيد",
  send: "إرسال",
  sending: "جاري الإرسال",
  success: "رسالة النجاح",
  error: "رسالة الخطأ",
  validation_error: "رسالة التحقق",
}

export function fieldLabelAr(key: string): string {
  const suffix = key.split(".").pop() ?? key
  const segments = suffix.split("_")
  const last = segments[segments.length - 1] ?? suffix
  if (FIELD_LABELS_AR[last]) return FIELD_LABELS_AR[last]
  if (FIELD_LABELS_AR[suffix]) return FIELD_LABELS_AR[suffix]

  if (/^step\d+/.test(suffix)) {
    const [, stepNum, ...rest] = suffix.match(/^(step\d+)_(.*)$/) ?? []
    const stepLabel = stepNum?.replace("step", "الخطوة ") ?? ""
    const restLabel = rest[0] ? (FIELD_LABELS_AR[rest[0]] ?? rest[0]) : ""
    return `${stepLabel} — ${restLabel}`.trim()
  }

  if (/^testimonial_\d+/.test(suffix)) {
    const n = suffix.match(/testimonial_(\d+)/)?.[1] ?? ""
    const field = suffix.replace(/testimonial_\d+_/, "")
    const fieldLabel = FIELD_LABELS_AR[field] ?? field
    return `رأي ${n} — ${fieldLabel}`
  }

  if (/^news_\d+/.test(suffix)) {
    const n = suffix.match(/news_(\d+)/)?.[1] ?? ""
    const field = suffix.replace(/news_\d+_/, "")
    const fieldLabel = FIELD_LABELS_AR[field] ?? field
    return `خبر ${n} — ${fieldLabel}`
  }

  if (/^faq_\d+/.test(suffix)) {
    const n = suffix.match(/faq_(\d+)/)?.[1] ?? ""
    const field = suffix.replace(/faq_\d+_/, "")
    const fieldLabel = FIELD_LABELS_AR[field] ?? field
    return `سؤال ${n} — ${fieldLabel}`
  }

  if (/^value_/.test(suffix)) {
    return suffix.includes("_desc") ? "وصف القيمة" : "عنوان القيمة"
  }

  if (/^stat_/.test(suffix)) {
    return suffix.endsWith("_value") ? "قيمة الإحصاء" : "تسمية الإحصاء"
  }

  return suffix.replace(/_/g, " ")
}
