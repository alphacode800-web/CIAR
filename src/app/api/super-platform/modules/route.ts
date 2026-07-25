import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureSuperPlatformSeed, getFallbackModules } from "@/features/super-platform/server"
import { canAccessSuperAdmin } from "@/features/super-platform/authz"
import { sortPlatformModulesDesc } from "@/lib/platform-display-order"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate" }

export async function GET(request: NextRequest) {
  const includeHidden = request.nextUrl.searchParams.get("includeHidden") === "true"
  try {
    await ensureSuperPlatformSeed()

    let modules = await prisma.platformModule.findMany({
      where: includeHidden ? {} : { visibility: "VISIBLE" },
      orderBy: { order: "asc" },
      include: {
        banner: true,
      },
    })
    if (modules.length === 0) {
      await ensureSuperPlatformSeed()
      modules = await prisma.platformModule.findMany({
        where: includeHidden ? {} : { visibility: "VISIBLE" },
        orderBy: { order: "asc" },
        include: { banner: true },
      })
    }
    if (modules.length === 0) {
      return NextResponse.json(
        { modules: sortPlatformModulesDesc(getFallbackModules(includeHidden)), fallback: true },
        { headers: NO_STORE }
      )
    }
    return NextResponse.json({ modules: sortPlatformModulesDesc(modules) }, { headers: NO_STORE })
  } catch {
    const modules = getFallbackModules(includeHidden)
    return NextResponse.json(
      { modules: sortPlatformModulesDesc(modules), fallback: true },
      { headers: NO_STORE }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const allowed = await canAccessSuperAdmin(request)
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const id = String(body.id || "")
  const isEnabled = Boolean(body.isEnabled)
  const visibility = body.visibility === "HIDDEN" ? "HIDDEN" : "VISIBLE"

  if (!id) {
    return NextResponse.json({ error: "Module id is required" }, { status: 400 })
  }

  const updatedModule = await prisma.platformModule.update({
    where: { id },
    data: { isEnabled, visibility },
  })
  return NextResponse.json({ module: updatedModule })
}
