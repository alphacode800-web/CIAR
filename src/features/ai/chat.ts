import { createAiCompletion } from "@/features/ai/ai-client"
import {
  buildPlatformListReply,
  getQuickPrompts,
  matchPlatformIntent,
} from "@/features/ai/platforms"

export type ChatAction = {
  label: string
  page: string
  slug?: string
}

export type ChatReplyPayload = {
  reply: string
  suggestions: string[]
  platformSlug?: string
  actions?: ChatAction[]
}

const FAQ_AR: Array<{ match: RegExp; reply: string; actions?: ChatAction[] }> = [
  {
    match: /منص|platform|خدم/i,
    reply: "",
    actions: [{ label: "استكشف المنصات", page: "projects" }],
  },
  {
    match: /تواصل|اتصال|contact|واتس/i,
    reply: "للتواصل معنا، انتقل إلى صفحة «تواصل معنا» أو استخدم زر الواتساب في الموقع. فريقنا جاهز لمساعدتك.",
    actions: [{ label: "تواصل معنا", page: "contact" }],
  },
  {
    match: /سعر|تكلف|اشتراك|pricing/i,
    reply: "تختلف الأسعار حسب المنصة والخدمة. أخبرنا بنوع الخدمة التي تبحث عنها وسنوجّهك للقسم المناسب.",
  },
  {
    match: /دعم|مساعد|support|مشكل/i,
    reply: "فريق الدعم متاح لمساعدتك. صِف مشكلتك وسنسجّلها ونحيلها للقسم المختص في أسرع وقت.",
    actions: [{ label: "تواصل مع الدعم", page: "contact" }],
  },
]

export async function generateChatReply(input: {
  message: string
  locale?: string
  history?: Array<{ role: "user" | "assistant"; content: string }>
}): Promise<ChatReplyPayload> {
  const locale = input.locale === "en" ? "en" : "ar"
  const userMessage = input.message.trim()
  const suggestions = getQuickPrompts(locale)

  if (!userMessage) {
    return {
      reply: locale === "ar" ? "اكتب سؤالك وسأساعدك فوراً." : "Please type your question and I will help.",
      suggestions,
    }
  }

  if (/منص|platform|خدم|ماذا تقدم|what do you offer/i.test(userMessage)) {
    return {
      reply: buildPlatformListReply(locale),
      suggestions,
      actions: [{ label: locale === "ar" ? "عرض المنصات" : "Browse platforms", page: "projects" }],
    }
  }

  const platform = matchPlatformIntent(userMessage)
  if (platform) {
    const name = locale === "ar" ? platform.nameAr : platform.nameEn
    const desc = locale === "ar" ? platform.descriptionAr : platform.descriptionEn
    return {
      reply:
        locale === "ar"
          ? `منصة ${name}:\n${desc}\n\nهل تريد فتح صفحة المنصة الآن؟`
          : `${name}:\n${desc}\n\nWould you like to open this platform page now?`,
      platformSlug: platform.slug,
      suggestions: [
        locale === "ar" ? "افتح المنصة" : "Open platform",
        locale === "ar" ? "منصات أخرى" : "Other platforms",
      ],
      actions: [
        {
          label: locale === "ar" ? `زيارة ${name}` : `Visit ${name}`,
          page: "platform",
          slug: platform.slug,
        },
      ],
    }
  }

  const aiReply = await createAiCompletion([
    {
      role: "system",
      content:
        locale === "ar"
          ? "أنت مساعد ذكي لمنصة CIAR التجارية. أجب بالعربية بجمل قصيرة وواضحة. ساعد في: المنصات، التواصل، الدعم، والخدمات. لا تخترع أسعاراً أو روابط غير موجودة."
          : "You are a smart assistant for CIAR platform. Answer briefly and help with platforms, contact, support, and services.",
    },
    ...(input.history || []).slice(-6),
    { role: "user", content: userMessage },
  ])

  if (aiReply) {
    return { reply: aiReply, suggestions }
  }

  for (const item of FAQ_AR) {
    if (item.match.test(userMessage)) {
      return {
        reply:
          item.reply ||
          (locale === "ar"
            ? "منصة CIAR تجمع عدة خدمات رقمية. يمكنك استكشاف المنصات من الصفحة الرئيسية."
            : "CIAR offers multiple digital services. Explore platforms from the homepage."),
        suggestions,
        actions: item.actions,
      }
    }
  }

  return {
    reply:
      locale === "ar"
        ? "شكراً لتواصلك! يمكنني مساعدتك في معرفة خدمات CIAR، التواصل مع الفريق، أو توجيهك للمنصة المناسبة. ما الذي تبحث عنه تحديداً؟"
        : "Thanks for reaching out! I can help you learn about CIAR services, contact the team, or guide you to the right platform. What are you looking for?",
    suggestions,
    actions: [{ label: locale === "ar" ? "عرض المنصات" : "Browse platforms", page: "projects" }],
  }
}
