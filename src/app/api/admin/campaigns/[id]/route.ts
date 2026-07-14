import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { CAMPAIGN_SEGMENTS } from "@/lib/email-campaigns"
import {
  deleteEmailCampaign,
  getEmailCampaign,
  updateEmailCampaign,
} from "@/services/email-campaigns.service"

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  subject: z.string().min(3).max(200).optional(),
  bodyHtml: z.string().min(5).max(50000).optional(),
  bodyText: z.string().max(50000).optional(),
  segment: z.enum(CAMPAIGN_SEGMENTS).optional(),
  locale: z.string().optional(),
  aiPrompt: z.string().max(2000).optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const campaign = await getEmailCampaign(id)
    if (!campaign) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ campaign })
  } catch (error) {
    console.error("GET /api/admin/campaigns/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 })
    }

    const campaign = await updateEmailCampaign(id, parsed.data)
    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error("PUT /api/admin/campaigns/[id] error:", error)
    if (error instanceof Error) {
      if (error.message === "CAMPAIGN_NOT_FOUND") {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }
      if (error.message === "CAMPAIGN_NOT_EDITABLE") {
        return NextResponse.json({ error: "Campaign is not editable" }, { status: 400 })
      }
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    await deleteEmailCampaign(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/campaigns/[id] error:", error)
    if (error instanceof Error) {
      if (error.message === "CAMPAIGN_NOT_FOUND") {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }
      if (error.message === "CAMPAIGN_SENDING") {
        return NextResponse.json({ error: "Cannot delete while sending" }, { status: 400 })
      }
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
