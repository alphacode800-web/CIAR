export type SentimentLabel = "positive" | "neutral" | "negative"

export type SentimentResult = {
  label: SentimentLabel
  score: number
  summary: string
}

const POSITIVE_AR = ["ممتاز", "رائع", "شكر", "جيد", "سعيد", "ممتازة", "أحب", "مفيد", "سريع", "احتراف"]
const NEGATIVE_AR = ["سيء", "مشكلة", "تأخير", "غاضب", "فاشل", "رديء", "سيئة", "شكوى", "لا يعمل", "محبط"]
const POSITIVE_EN = ["great", "excellent", "thank", "good", "happy", "love", "helpful", "fast", "amazing"]
const NEGATIVE_EN = ["bad", "problem", "delay", "angry", "fail", "poor", "complaint", "broken", "frustrated"]

export function analyzeSentimentLocal(text: string): SentimentResult {
  const normalized = String(text || "").toLowerCase()
  let positive = 0
  let negative = 0

  for (const word of [...POSITIVE_AR, ...POSITIVE_EN]) {
    if (normalized.includes(word)) positive += 1
  }
  for (const word of [...NEGATIVE_AR, ...NEGATIVE_EN]) {
    if (normalized.includes(word)) negative += 1
  }

  if (positive > negative) {
    return {
      label: "positive",
      score: Math.min(0.95, 0.55 + positive * 0.1),
      summary: "تقييم إيجابي — رضا العميل مرتفع",
    }
  }
  if (negative > positive) {
    return {
      label: "negative",
      score: Math.min(0.95, 0.55 + negative * 0.1),
      summary: "تقييم سلبي — يحتاج متابعة سريعة",
    }
  }
  return {
    label: "neutral",
    score: 0.5,
    summary: "تقييم محايد — لا مؤشرات واضحة",
  }
}
