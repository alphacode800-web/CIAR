import { NextResponse } from "next/server"
import { buildInventoryForecast } from "@/features/ai/inventory"

export async function GET() {
  try {
    const forecast = await buildInventoryForecast()
    return NextResponse.json(forecast)
  } catch (error) {
    console.error("GET /api/ai/inventory error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
