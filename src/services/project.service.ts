import { db } from '@/lib/db'

// ── Types ────────────────────────────────────────────────────────────────────

interface ProjectTranslationItem {
  locale: string
  name: string
  tagline: string
  description: string
}

function normalizeBrandText(value: string): string {
  return value.replace(/سيار/g, 'CIAR')
}

export interface ProjectWithTranslations {
  id: string
  slug: string
  imageUrl: string
  category: string
  featured: boolean
  published: boolean
  externalUrl: string
  tags: string
  views: number
  order: number
  createdAt: Date
  updatedAt: Date
  translations: ProjectTranslationItem[]
}

export interface CreateProjectInput {
  slug: string
  imageUrl?: string
  category?: string
  externalUrl?: string
  tags?: string
  featured?: boolean
  published?: boolean
  order?: number
  translations?: ProjectTranslationItem[]
}

export interface UpdateProjectInput {
  imageUrl?: string
  category?: string
  externalUrl?: string
  tags?: string
  featured?: boolean
  published?: boolean
  order?: number
  views?: number
}

export interface ProjectListParams {
  locale: string
  search?: string
  category?: string
  featured?: boolean
  published?: boolean
  page?: number
  limit?: number
  all?: boolean
}

export interface ProjectListResult {
  projects: ProjectWithTranslations[]
  categories: string[]
  stats: {
    totalProjects: number
    totalViews: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapProject(row: {
  id: string
  slug: string
  imageUrl: string
  category: string
  featured: boolean
  published: boolean
  externalUrl: string
  tags: string
  views: number
  order: number
  createdAt: Date
  updatedAt: Date
  translations: { locale: string; name: string; tagline: string; description: string }[]
}): ProjectWithTranslations {
  return {
    id: row.id,
    slug: row.slug,
    imageUrl: row.imageUrl,
    category: row.category,
    featured: row.featured,
    published: row.published,
    externalUrl: row.externalUrl,
    tags: row.tags,
    views: row.views,
    order: row.order,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    translations: row.translations.map((tr) => ({
      ...tr,
      name: normalizeBrandText(tr.name),
      tagline: normalizeBrandText(tr.tagline),
      description: normalizeBrandText(tr.description),
    })),
  }
}

// ── Service Functions ────────────────────────────────────────────────────────

/**
 * Retrieve a paginated, filterable list of projects.
 *
 * @param params  Query parameters (locale, search, category, featured, published, pagination)
 * @returns       Projects, categories, stats and pagination metadata
 */
export async function getProjects(
  params: ProjectListParams,
): Promise<ProjectListResult> {
  const {
    locale,
    search,
    category,
    featured,
    published = true,
    page = 1,
    limit = 12,
    all = false,
  } = params

  // Dynamic where clause
  const where: Record<string, unknown> = {}

  if (category) {
    where.category = category
  }

  if (featured !== undefined) {
    where.featured = featured
  }

  if (published !== undefined) {
    where.published = published
  }

  // Search through translations
  if (search) {
    where.translations = {
      some: {
        OR: [
          { name: { contains: search } },
          { tagline: { contains: search } },
        ],
      },
    }
  }

  // Pagination
  const skip = all ? 0 : (page - 1) * limit
  const take = all ? undefined : limit

  const [projects, total, distinctCategories, stats] = await Promise.all([
    db.project.findMany({
      where,
      skip,
      take,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        translations: {
          where: { locale },
          select: {
            locale: true,
            name: true,
            tagline: true,
            description: true,
          },
        },
      },
    }),
    db.project.count({ where }),
    db.project
      .findMany({
        where: { published: true },
        distinct: ['category'],
        select: { category: true },
      })
      .then((rows) => rows.map((r) => r.category).filter(Boolean)),
    db.project.aggregate({ _sum: { views: true }, _count: true }),
  ])

  return {
    projects: projects.map(mapProject),
    categories: distinctCategories,
    stats: {
      totalProjects: stats._count,
      totalViews: stats._sum.views ?? 0,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: all ? 1 : Math.ceil(total / limit),
    },
  }
}

/**
 * Fetch a single project by its slug (includes all translations).
 *
 * @param slug   Unique project slug
 * @param locale Optional locale to filter translations
 * @returns      The project or null if not found
 */
export async function getProjectBySlug(
  slug: string,
  locale?: string,
): Promise<ProjectWithTranslations | null> {
  const project = await db.project.findUnique({
    where: { slug },
    include: {
      translations: {
        where: locale ? { locale } : undefined,
        select: {
          locale: true,
          name: true,
          tagline: true,
          description: true,
        },
      },
    },
  })

  return project ? mapProject(project as Parameters<typeof mapProject>[0]) : null
}

/**
 * Fetch a single project by its database ID.
 *
 * @param id  Project primary key
 * @returns   The project or null if not found
 */
export async function getProjectById(
  id: string,
): Promise<ProjectWithTranslations | null> {
  const project = await db.project.findUnique({
    where: { id },
    include: {
      translations: {
        select: {
          locale: true,
          name: true,
          tagline: true,
          description: true,
        },
      },
    },
  })

  return project ? mapProject(project as Parameters<typeof mapProject>[0]) : null
}

/**
 * Create a new project with optional translations in a single transaction.
 *
 * @param input  Project data and translations
 * @returns      The newly created project
 */
export async function createProject(
  input: CreateProjectInput,
): Promise<ProjectWithTranslations> {
  const { translations = [], ...data } = input

  const project = await db.$transaction(async (tx) => {
    const created = await tx.project.create({
      data,
      include: {
        translations: {
          select: {
            locale: true,
            name: true,
            tagline: true,
            description: true,
          },
        },
      },
    })

    if (translations.length > 0) {
      await tx.projectTranslation.createMany({
        data: translations.map((t) => ({
          projectId: created.id,
          locale: t.locale,
          name: t.name,
          tagline: t.tagline,
          description: t.description,
        })),
      })

      // Re-fetch with translations
      return tx.project.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          translations: {
            select: {
              locale: true,
              name: true,
              tagline: true,
              description: true,
            },
          },
        },
      })
    }

    return created
  })

  return mapProject(project as Parameters<typeof mapProject>[0])
}

/**
 * Update an existing project's fields.
 *
 * @param id     Project primary key
 * @param input  Fields to update
 * @returns      The updated project
 * @throws       If the project is not found
 */
export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<ProjectWithTranslations> {
  const project = await db.project.update({
    where: { id },
    data: input,
    include: {
      translations: {
        select: {
          locale: true,
          name: true,
          tagline: true,
          description: true,
        },
      },
    },
  })

  return mapProject(project as Parameters<typeof mapProject>[0])
}

/**
 * Permanently delete a project and its translations (cascade).
 *
 * @param id  Project primary key
 */
export async function deleteProject(id: string): Promise<void> {
  await db.project.delete({ where: { id } })
}

/**
 * Atomically increment the view count for a project.
 *
 * @param slug  Project slug
 */
export async function incrementProjectViews(slug: string): Promise<void> {
  await db.project.update({
    where: { slug },
    data: { views: { increment: 1 } },
  })
}

/**
 * Toggle the `featured` flag on a project.
 *
 * @param id  Project primary key
 * @returns   The new featured value
 */
export async function toggleFeatured(id: string): Promise<boolean> {
  const project = await db.project.findUniqueOrThrow({ where: { id } })
  const updated = await db.project.update({
    where: { id },
    data: { featured: !project.featured },
  })
  return updated.featured
}

/**
 * Toggle the `published` flag on a project.
 *
 * @param id  Project primary key
 * @returns   The new published value
 */
export async function togglePublished(id: string): Promise<boolean> {
  const project = await db.project.findUniqueOrThrow({ where: { id } })
  const updated = await db.project.update({
    where: { id },
    data: { published: !project.published },
  })
  return updated.published
}
