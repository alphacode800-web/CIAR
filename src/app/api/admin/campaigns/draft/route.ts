import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { CAMPAIGN_SEGMENTS } from "@/lib/email-campaigns"
import { generateCampaignDraft } from "@/features/ai/campaign-draft"
import { countSegmentRecipients } from "@/services/email-campaigns.service"

const draftSchema = z.object({
  prompt: z.string().min(5).max(2000),
  segment: z.enum(CAMPAIGN_SEGMENTS),
  locale: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = draftSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 })
    }

    const audienceCount = await countSegmentRecipients(parsed.data.segment)
    const draft = await generateCampaignDraft({
      prompt: parsed.data.prompt,
      segment: parsed.data.segment,
      locale: parsed.data.locale,
      audienceCount,
    })

    return NextResponse.json({ success: true, draft, audienceCount })
  } catch (error) {
    console.error("POST /api/admin/campaigns/draft error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
