import { db } from '@/lib/db'

// ── Types ────────────────────────────────────────────────────────────────────

interface SectionTranslationItem {
  locale: string
  title: string
  subtitle: string
  content: string
  buttonText: string
}

interface SectionItem {
  id: string
  type: string
  order: number
  settings: string
  translations: SectionTranslationItem[]
}

export interface PageWithContent {
  id: string
  slug: string
  published: boolean
  order: number
  sections: SectionItem[]
}

// ── Service Functions ────────────────────────────────────────────────────────

/**
 * Fetch a page by slug with its sections and optional locale filtering.
 *
 * @param slug    Unique page slug
 * @param locale  Optional locale to filter section translations
 * @returns       The page or null if not found
 */
export async function getPage(
  slug: string,
  locale?: string,
): Promise<PageWithContent | null> {
  const page = await (db as Record<string, unknown>).page as unknown as {
    findUnique: (args: Record<string, unknown>) => Promise<PageWithContent | null>
  }

  const result = await page.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          translations: {
            where: locale ? { locale } : undefined,
          },
        },
      },
    },
  })

  return result
}

/**
 * Fetch all pages with their sections and optional locale filtering.
 *
 * @param locale  Optional locale to filter section translations
 * @returns       Array of pages
 */
export async function getAllPages(
  locale?: string,
): Promise<PageWithContent[]> {
  const page = await (db as Record<string, unknown>).page as unknown as {
    findMany: (args: Record<string, unknown>) => Promise<PageWithContent[]>
  }

  return page.findMany({
    orderBy: { order: 'asc' },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          translations: {
            where: locale ? { locale } : undefined,
          },
        },
      },
    },
  })
}

/**
 * Create a new (empty) page.
 *
 * @param slug       Unique page slug
 * @param published  Whether the page is publicly visible (default true)
 * @returns          The newly created page
 */
export async function createPage(
  slug: string,
  published = true,
): Promise<PageWithContent> {
  const pageModel = await (db as Record<string, unknown>).page as unknown as {
    create: (args: Record<string, unknown>) => Promise<PageWithContent>
  }

  return pageModel.create({
    data: { slug, published },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: { translations: true },
      },
    },
  })
}

/**
 * Update top-level page metadata.
 *
 * @param id    Page primary key
 * @param data  Fields to update
 */
export async function updatePage(
  id: string,
  data: { slug?: string; published?: boolean; order?: number },
): Promise<void> {
  const pageModel = await (db as Record<string, unknown>).page as unknown as {
    update: (args: Record<string, unknown>) => Promise<unknown>
  }

  await pageModel.update({ where: { id }, data })
}

/**
 * Delete a page and its sections (cascade).
 *
 * @param id  Page primary key
 */
export async function deletePage(id: string): Promise<void> {
  const pageModel = await (db as Record<string, unknown>).page as unknown as {
    delete: (args: Record<string, unknown>) => Promise<unknown>
  }

  await pageModel.delete({ where: { id } })
}

/**
 * Add a new section to a page.
 *
 * @param pageId  Parent page ID
 * @param type    Section type identifier
 * @param order   Display order (defaults to end of list)
 */
export async function addSection(
  pageId: string,
  type: string,
  order?: number,
): Promise<void> {
  const sectionModel = await (db as Record<string, unknown>)
    .pageSection as unknown as {
    create: (args: Record<string, unknown>) => Promise<unknown>
  }

  await sectionModel.create({
    data: { pageId, type, order: order ?? 0, settings: '{}' },
  })
}

/**
 * Update section metadata (type, order, or JSON settings).
 *
 * @param id    Section primary key
 * @param data  Fields to update
 */
export async function updateSection(
  id: string,
  data: { type?: string; order?: number; settings?: string },
): Promise<void> {
  const sectionModel = await (db as Record<string, unknown>)
    .pageSection as unknown as {
    update: (args: Record<string, unknown>) => Promise<unknown>
  }

  await sectionModel.update({ where: { id }, data })
}

/**
 * Delete a section and its translations (cascade).
 *
 * @param id  Section primary key
 */
export async function deleteSection(id: string): Promise<void> {
  const sectionModel = await (db as Record<string, unknown>)
    .pageSection as unknown as {
    delete: (args: Record<string, unknown>) => Promise<unknown>
  }

  await sectionModel.delete({ where: { id } })
}

/**
 * Create or update a section's translation for a given locale.
 *
 * @param sectionId  Section primary key
 * @param locale     Target locale
 * @param data       Translated fields
 */
export async function upsertSectionTranslation(
  sectionId: string,
  locale: string,
  data: {
    title?: string
    subtitle?: string
    content?: string
    buttonText?: string
  },
): Promise<void> {
  const translationModel = await (db as Record<string, unknown>)
    .pageSectionTranslation as unknown as {
    upsert: (args: Record<string, unknown>) => Promise<unknown>
  }

  await translationModel.upsert({
    where: { sectionId_locale: { sectionId, locale } },
    update: data,
    create: {
      sectionId,
      locale,
      title: data.title ?? '',
      subtitle: data.subtitle ?? '',
      content: data.content ?? '',
      buttonText: data.buttonText ?? '',
    },
  })
}
