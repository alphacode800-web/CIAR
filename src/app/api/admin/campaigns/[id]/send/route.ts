import { NextResponse } from "next/server"
import { sendEmailCampaignBatch } from "@/services/email-campaigns.service"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const result = await sendEmailCampaignBatch(id)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("POST /api/admin/campaigns/[id]/send error:", error)
    if (error instanceof Error) {
      if (error.message === "CAMPAIGN_NOT_FOUND") {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }
      if (error.message === "CAMPAIGN_NOT_APPROVED") {
        return NextResponse.json({ error: "Campaign must be approved first" }, { status: 400 })
      }
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
