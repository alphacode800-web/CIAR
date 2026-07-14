import { createAiCompletion } from "@/features/ai/ai-client"
import { getSegmentLabel, type CampaignSegment } from "@/lib/email-campaigns"

export type CampaignDraftResult = {
  subject: string
  bodyHtml: string
  bodyText: string
  source: "ai" | "fallback"
}

function buildFallbackDraft(input: {
  prompt: string
  locale: "ar" | "en"
  segment: CampaignSegment
}): CampaignDraftResult {
  const segmentLabel = getSegmentLabel(input.segment, input.locale)
  if (input.locale === "ar") {
    return {
      subject: `رسالة من CIAR — ${input.prompt.slice(0, 60)}`,
      bodyHtml: `<p>مرحباً {{name}}،</p><p>${input.prompt}</p><p>مع تحيات فريق CIAR</p>`,
      bodyText: `مرحباً {{name}}،\n\n${input.prompt}\n\nمع تحيات فريق CIAR`,
      source: "fallback",
    }
  }
  return {
    subject: `CIAR update — ${input.prompt.slice(0, 60)}`,
    bodyHtml: `<p>Hello {{name}},</p><p>${input.prompt}</p><p>Best regards,<br/>CIAR Team</p>`,
    bodyText: `Hello {{name}},\n\n${input.prompt}\n\nBest regards,\nCIAR Team`,
    source: "fallback",
  }
}

export async function generateCampaignDraft(input: {
  prompt: string
  locale?: string
  segment: CampaignSegment
  audienceCount?: number
}): Promise<CampaignDraftResult> {
  const locale = input.locale === "en" ? "en" : "ar"
  const prompt = input.prompt.trim()
  if (!prompt) {
    return buildFallbackDraft({ prompt: "تحديث جديد", locale, segment: input.segment })
  }

  const segmentLabel = getSegmentLabel(input.segment, locale)
  const audienceHint =
    typeof input.audienceCount === "number"
      ? locale === "ar"
        ? `عدد المستلمين التقريبي: ${input.audienceCount}`
        : `Approximate recipients: ${input.audienceCount}`
      : ""

  const system =
    locale === "ar"
      ? `أنت كاتب رسائل بريدية احترافية لمنصة CIAR. اكتب رسالة تسويقية/إعلامية واضحة ومحترمة بالعربية.
الجمهور: ${segmentLabel}. ${audienceHint}
استخدم {{name}} لتخصيص اسم المستلم.
أعد JSON فقط بهذا الشكل: {"subject":"...","bodyHtml":"...","bodyText":"..."}
bodyHtml يمكن أن يحتوي فقرات HTML بسيطة فقط (p, strong, br).`
      : `You write professional email copy for CIAR platform.
Audience: ${segmentLabel}. ${audienceHint}
Use {{name}} for recipient personalization.
Return JSON only: {"subject":"...","bodyHtml":"...","bodyText":"..."}
bodyHtml may use simple HTML (p, strong, br).`

  const ai = await createAiCompletion([
    { role: "system", content: system },
    { role: "user", content: prompt },
  ])

  if (!ai) {
    return buildFallbackDraft({ prompt, locale, segment: input.segment })
  }

  try {
    const jsonMatch = ai.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch?.[0] || ai) as Partial<CampaignDraftResult>
    if (!parsed.subject?.trim() || !parsed.bodyHtml?.trim()) {
      return buildFallbackDraft({ prompt, locale, segment: input.segment })
    }
    return {
      subject: parsed.subject.trim(),
      bodyHtml: parsed.bodyHtml.trim(),
      bodyText: (parsed.bodyText || parsed.bodyHtml.replace(/<[^>]+>/g, "")).trim(),
      source: "ai",
    }
  } catch {
    return buildFallbackDraft({ prompt, locale, segment: input.segment })
  }
}
