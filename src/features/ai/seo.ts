import { createAiCompletion } from "@/features/ai/ai-client"

export type SeoSuggestion = {
  title: string
  description: string
  keywords: string[]
}

const STOP_WORDS = new Set([
  "في", "من", "على", "إلى", "عن", "مع", "هذا", "هذه", "التي", "الذي", "و", "أو", "the", "and", "for", "with",
])

function extractKeywordsLocal(text: string, limit = 8): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word))

  const counts = new Map<string, number>()
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word)
}

export async function suggestSeo(input: {
  pageName: string
  content: string
  locale?: string
}): Promise<SeoSuggestion> {
  const locale = input.locale === "en" ? "en" : "ar"
  const content = `${input.pageName}\n${input.content}`.trim()

  const aiReply = await createAiCompletion([
    {
      role: "system",
      content:
        "أنت خبير SEO. أعد JSON فقط بهذا الشكل: {\"title\":\"\",\"description\":\"\",\"keywords\":[\"\",\"\"]}. بدون شرح إضافي.",
    },
    {
      role: "user",
      content: `اقترح عنواناً ووصفاً وكلمات مفتاحية ${locale === "ar" ? "بالعربية" : "بالإنجليزية"} لهذا المحتوى:\n${content}`,
    },
  ])

  if (aiReply) {
    try {
      const jsonMatch = aiReply.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Partial<SeoSuggestion>
        if (parsed.title && parsed.description) {
          return {
            title: String(parsed.title).slice(0, 70),
            description: String(parsed.description).slice(0, 160),
            keywords: Array.isArray(parsed.keywords)
              ? parsed.keywords.map(String).slice(0, 10)
              : extractKeywordsLocal(content),
          }
        }
      }
    } catch {
      // fallback below
    }
  }

  const keywords = extractKeywordsLocal(content)
  const baseTitle = input.pageName.trim() || (locale === "ar" ? "منصة CIAR" : "CIAR Platform")
  return {
    title: `${baseTitle} | CIAR`.slice(0, 70),
    description: content.replace(/\s+/g, " ").slice(0, 155),
    keywords: keywords.length > 0 ? keywords : locale === "ar"
      ? ["سيار", "منصة", "تجارة", "خدمات", "رقمي"]
      : ["ciar", "platform", "commerce", "services", "digital"],
  }
}
