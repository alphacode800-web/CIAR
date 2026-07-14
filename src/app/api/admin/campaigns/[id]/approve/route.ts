import { NextResponse } from "next/server"
import { approveEmailCampaign } from "@/services/email-campaigns.service"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const campaign = await approveEmailCampaign(id)
    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error("POST /api/admin/campaigns/[id]/approve error:", error)
    if (error instanceof Error) {
      if (error.message === "CAMPAIGN_NOT_FOUND") {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }
      if (error.message === "CAMPAIGN_NOT_DRAFT") {
        return NextResponse.json({ error: "Only drafts can be approved" }, { status: 400 })
      }
      if (error.message === "CAMPAIGN_INCOMPLETE") {
        return NextResponse.json({ error: "Subject and body are required" }, { status: 400 })
      }
      if (error.message === "CAMPAIGN_NO_RECIPIENTS") {
        return NextResponse.json({ error: "No recipients in selected segment" }, { status: 400 })
      }
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
