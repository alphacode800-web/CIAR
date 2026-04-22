import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
      db.$queryRaw`
        SELECT category, COUNT(*) as count
        FROM Project
        WHERE category IS NOT NULL AND category != ''
        GROUP BY category
        ORDER BY count DESC
      `.then((rows: Array<{ category: string; count: unknown }>) =>
        rows.map((r) => ({
          category: r.category,
          count: Number(r.count),
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
              where: { locale: 'en' },
              select: { name: true },
            },
          },
        })
        .then((projects) =>
          projects.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.translations[0]?.name ?? p.slug,
            views: p.views,
            category: p.category,
            featured: p.featured,
            published: p.published,
          })),
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
