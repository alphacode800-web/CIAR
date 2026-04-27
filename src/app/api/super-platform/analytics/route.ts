import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureSuperPlatformSeed } from "@/features/super-platform/server"

export async function GET() {
  await ensureSuperPlatformSeed()

  const [modulesCount, visibleModules, hiddenModules, activeBanners, adminsCount] =
    await Promise.all([
      prisma.platformModule.count(),
      prisma.platformModule.count({ where: { visibility: "VISIBLE", isEnabled: true } }),
      prisma.platformModule.count({ where: { visibility: "HIDDEN" } }),
      prisma.platformBanner.count({ where: { isActive: true } }),
      prisma.adminMember.count({ where: { isActive: true } }),
    ])

  return NextResponse.json({
    modulesCount,
    visibleModules,
    hiddenModules,
    activeBanners,
    adminsCount,
  })
}
