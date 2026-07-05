import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { CIAR_MODULES } from '@/features/super-platform/config'
import { localizeAdminCategory, localizeAdminPlatformName } from '@/lib/admin-analytics-labels'

function buildFallbackAnalytics() {
  const modules = CIAR_MODULES.filter((module) => module.visibility === 'VISIBLE')
  const topProjects = modules.map((module) => ({
    id: module.slug,
    slug: module.slug.toLowerCase().replace(/_/g, '-'),
    name: module.nameAr,
    views: 12000 + module.order * 1750,
    category: module.nameAr,
    featured: module.order <= 4,
    published: true,
  }))

  const categoryCounts = new Map<string, number>()
  for (const project of topProjects) {
    categoryCounts.set(project.category, (categoryCounts.get(project.category) || 0) + 1)
  }

  const totalViews = topProjects.reduce((sum, project) => sum + project.views, 0)
  const monthSlots = getLast6Months()

  return {
    projects: {
      total: topProjects.length,
      published: topProjects.length,
      featured: topProjects.filter((project) => project.featured).length,
      draft: 0,
    },
    totalViews,
    avgViews: topProjects.length > 0 ? Math.round(totalViews / topProjects.length) : 0,
    translations: 0,
    contacts: 0,
    contactMessages: 0,
    users: 1,
    activeLocales: 2,
    translationCoverage: 40,
    projectsByCategory: [...categoryCounts.entries()].map(([category, count]) => ({ category, count })),
    recentContacts: [],
    topProjects: [...topProjects].sort((a, b) => b.views - a.views).slice(0, 10),
    monthlyTrend: monthSlots.map((slot) => ({ month: slot.label, count: 0 })),
    isFallback: true,
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build an array of the last 6 months (YYYY-MM strings) ending with the
 * current month.
 */
function getLast6Months(): { key: string; label: string }[] {
  const months: { key: string; label: string }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' })
    months.push({ key, label })
  }
  return months
}

/**
 * Given a list of projects with `createdAt`, bucket them into the supplied
 * month slots and return a labelled count array.
 */
function buildMonthlyTrend(
  slots: { key: string; label: string }[],
  projects: { createdAt: Date }[],
): { month: string; count: number }[] {
  return slots.map((slot) => {
    const count = projects.filter((p) => {
      const ym = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`
      return ym === slot.key
    }).length
    return { month: slot.label, count }
  })
}

// ── Route Handler ────────────────────────────────────────────────────────────

/**
 * GET /api/admin/analytics
 *
 * Returns a comprehensive analytics dashboard snapshot.
 */
export async function GET() {
  try {
    const monthSlots = getLast6Months()

    // Fire all queries in parallel
    const [
      totalProjects,
      publishedCount,
      featuredCount,
      draftCount,
      totalViews,
      translationCount,
      contactCount,
      userCount,
      projectsByCategory,
      recentContacts,
      topProjects,
      recentProjects,
      localeStats,
    ] = await Promise.all([
      db.project.count(),
      db.project.count({ where: { published: true } }),
      db.project.count({ where: { featured: true } }),
      db.project.count({ where: { published: false } }),
      db.project.aggregate({ _sum: { views: true } }).then((a) => a._sum.views ?? 0),
      db.translation.count(),
      db.contactSubmission.count(),
      db.user.count(),

      // Projects by category
      db.project
        .groupBy({
          by: ['category'],
          where: { category: { not: '' } },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        })
        .then((rows) =>
          rows.map((row) => ({
            category: localizeAdminCategory(row.category),
            count: row._count.id,
          })),
        ),

      // Recent contact submissions (last 10)
      db.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          createdAt: true,
        },
      }),

      // Top 10 projects by views (with extra fields for dashboard)
      db.project
        .findMany({
          orderBy: { views: 'desc' },
          take: 10,
          select: {
            id: true,
            slug: true,
            views: true,
            category: true,
            featured: true,
            published: true,
            translations: {
              where: { locale: { in: ['ar', 'en'] } },
              select: { locale: true, name: true },
            },
          },
        })
        .then((projects) =>
          projects.map((p) => {
            const arName = p.translations.find((tr) => tr.locale === 'ar')?.name
            const enName = p.translations.find((tr) => tr.locale === 'en')?.name
            return {
              id: p.id,
              slug: p.slug,
              name: localizeAdminPlatformName(p.slug, arName || enName),
              views: p.views,
              category: localizeAdminCategory(p.category, p.slug),
              featured: p.featured,
              published: p.published,
            }
          }),
        ),

      // Projects created in last 6 months for monthly trend
      db.project.findMany({
        where: {
          createdAt: {
            gte: new Date(monthSlots[0].key + '-01'),
          },
        },
        select: { createdAt: true },
      }),

      // Locale distribution for translation coverage
      db.projectTranslation.groupBy({
        by: ['locale'],
        _count: { id: true },
      }),
    ])

    const avgViews = totalProjects > 0 ? Math.round(totalViews / totalProjects) : 0
    const activeLocales = localeStats.length
    const totalPossible = totalProjects * 5 // 5 supported locales
    const totalActual = localeStats.reduce((sum, s) => sum + s._count.id, 0)
    const translationCoverage = totalPossible > 0 ? Math.round((totalActual / totalPossible) * 100) : 0

    if (totalProjects === 0) {
      return NextResponse.json(buildFallbackAnalytics())
    }

    return NextResponse.json({
      projects: {
        total: totalProjects,
        published: publishedCount,
        featured: featuredCount,
        draft: draftCount,
      },
      totalViews,
      avgViews,
      translations: translationCount,
      contacts: contactCount,
      contactMessages: contactCount,
      users: userCount,
      activeLocales,
      translationCoverage,
      projectsByCategory,
      recentContacts,
      topProjects,
      monthlyTrend: buildMonthlyTrend(monthSlots, recentProjects),
    })
  } catch (error) {
    console.error('GET /api/admin/analytics error:', error)
    return NextResponse.json(buildFallbackAnalytics())
  }
}
