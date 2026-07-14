import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { CAMPAIGN_SEGMENTS } from "@/lib/email-campaigns"
import {
  countSegmentRecipients,
  createEmailCampaign,
  listEmailCampaigns,
} from "@/services/email-campaigns.service"
import { isEmailProviderConfigured } from "@/services/email-send.service"

const createSchema = z.object({
  name: z.string().min(2).max(120),
  subject: z.string().min(3).max(200),
  bodyHtml: z.string().min(5).max(50000),
  bodyText: z.string().max(50000).optional().default(""),
  segment: z.enum(CAMPAIGN_SEGMENTS),
  locale: z.string().optional(),
  aiPrompt: z.string().max(2000).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const segment = request.nextUrl.searchParams.get("segment")
    const [campaigns, emailConfigured] = await Promise.all([
      listEmailCampaigns(),
      isEmailProviderConfigured(),
    ])

    let segmentCounts: Record<string, number> | undefined
    if (segment && (CAMPAIGN_SEGMENTS as readonly string[]).includes(segment)) {
      const count = await countSegmentRecipients(segment as (typeof CAMPAIGN_SEGMENTS)[number])
      segmentCounts = { [segment]: count }
    } else {
      const counts = await Promise.all(
        CAMPAIGN_SEGMENTS.map(async (key) => [key, await countSegmentRecipients(key)] as const)
      )
      segmentCounts = Object.fromEntries(counts)
    }

    return NextResponse.json({ campaigns, segmentCounts, emailConfigured })
  } catch (error) {
    console.error("GET /api/admin/campaigns error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 })
    }

    const campaign = await createEmailCampaign(parsed.data)
    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error("POST /api/admin/campaigns error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
