import { db } from "@/lib/db"
import { analyzeSentimentLocal } from "@/features/ai/sentiment"
import { createAiCompletion } from "@/features/ai/ai-client"

export type AiInsightCard = {
  id: string
  title: string
  value: string
  hint: string
  tone: "neutral" | "positive" | "warning" | "danger"
}

export type AiInsightsPayload = {
  cards: AiInsightCard[]
  summary: string
  recommendations: string[]
  sentimentBreakdown: { positive: number; neutral: number; negative: number }
}

export async function buildAiInsights(): Promise<AiInsightsPayload> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [contacts, projects, orders, products] = await Promise.all([
    db.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      select: { subject: true, message: true, createdAt: true },
    }),
    db.project.findMany({
      where: { published: true },
      orderBy: { views: "desc" },
      take: 8,
      select: { slug: true, views: true, category: true, translations: { select: { locale: true, name: true } } },
    }),
    db.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { totalPrice: true, status: true, createdAt: true },
    }),
    db.product.count(),
  ])

  const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 }
  for (const contact of contacts.slice(0, 20)) {
    const result = analyzeSentimentLocal(`${contact.subject}\n${contact.message}`)
    sentimentBreakdown[result.label] += 1
  }

  const monthContacts = contacts.filter((c) => c.createdAt >= thirtyDaysAgo).length
  const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0)
  const topProject = projects[0]
  const topName =
    topProject?.translations.find((t) => t.locale === "ar")?.name ||
    topProject?.translations.find((t) => t.locale === "en")?.name ||
    topProject?.slug ||
    "—"

  const orderTotal = orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0)
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length

  const cards: AiInsightCard[] = [
    {
      id: "contacts",
      title: "رسائل الشهر",
      value: String(monthContacts),
      hint: `${contacts.length} رسالة في آخر التحليل`,
      tone: monthContacts > 10 ? "positive" : "neutral",
    },
    {
      id: "sentiment",
      title: "مشاعر العملاء",
      value: `${sentimentBreakdown.positive} إيجابي`,
      hint: `${sentimentBreakdown.negative} سلبي · ${sentimentBreakdown.neutral} محايد`,
      tone: sentimentBreakdown.negative > sentimentBreakdown.positive ? "warning" : "positive",
    },
    {
      id: "views",
      title: "مشاهدات المنصات",
      value: totalViews.toLocaleString("ar"),
      hint: topName !== "—" ? `الأعلى: ${topName}` : "لا بيانات منصات",
      tone: "neutral",
    },
    {
      id: "commerce",
      title: "نشاط الطلبات",
      value: String(orders.length),
      hint: `${pendingOrders} قيد الانتظار · ${products} منتج`,
      tone: pendingOrders > 5 ? "warning" : "neutral",
    },
  ]

  const recommendations: string[] = []
  if (sentimentBreakdown.negative >= 3) {
    recommendations.push("راجع الرسائل السلبية فوراً وفعّل ردود سريعة عبر المساعد الذكي.")
  }
  if (monthContacts === 0) {
    recommendations.push("شجّع الزوار على التواصل عبر زر الدردشة الذكية في الصفحة الرئيسية.")
  }
  if (orders.length === 0 && products > 0) {
    recommendations.push("فعّل توصيات المنتجات في الصفحة الرئيسية لزيادة التحويل.")
  }
  if (totalViews < 100) {
    recommendations.push("استخدم اقتراحات SEO الذكية لتحسين الظهور في محركات البحث.")
  }
  if (recommendations.length === 0) {
    recommendations.push("الأداء مستقر — راقب المشاعر أسبوعياً وحدّث رسائل الترحيب في المساعد.")
  }

  const localSummary = [
    `خلال 30 يوم: ${monthContacts} رسالة تواصل.`,
    `تحليل المشاعر: ${sentimentBreakdown.positive} إيجابي، ${sentimentBreakdown.negative} سلبي.`,
    `أعلى منصة: ${topName} (${topProject?.views || 0} مشاهدة).`,
    orders.length > 0 ? `الطلبات: ${orders.length} بقيمة ${orderTotal.toFixed(0)}.` : "لا طلبات حديثة.",
  ].join(" ")

  const aiSummary = await createAiCompletion([
    {
      role: "system",
      content: "أنت محلل أعمال. لخّص الوضع في 2-3 جمل عربية عملية للإدارة.",
    },
    { role: "user", content: localSummary },
  ])

  return {
    cards,
    summary: aiSummary || localSummary,
    recommendations,
    sentimentBreakdown,
  }
}
