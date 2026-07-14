import { NextResponse } from "next/server"
import { scanFraudRisks } from "@/features/ai/fraud"

export async function GET() {
  try {
    const result = await scanFraudRisks()
    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/ai/fraud-scan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
