import { NextResponse } from "next/server"
import { buildAiInsights } from "@/features/ai/insights"

export async function GET() {
  try {
    const insights = await buildAiInsights()
    return NextResponse.json(insights)
  } catch (error) {
    console.error("GET /api/ai/insights error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
