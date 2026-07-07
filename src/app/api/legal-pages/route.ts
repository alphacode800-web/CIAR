import { NextResponse } from "next/server"
import { getSettings } from "@/services/settings.service"
import { buildLegalPages } from "@/lib/legal-pages"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json({ config: buildLegalPages(settings) })
  } catch (error) {
    console.error("GET /api/legal-pages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
