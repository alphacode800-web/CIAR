import { db } from '@/lib/db'

// ── Types ────────────────────────────────────────────────────────────────────

export interface MediaRow {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  alt: string
  category: string
  createdAt: Date
}

// ── Service Functions ────────────────────────────────────────────────────────

/**
 * Register a new media entry in the database.
 *
 * @param data  Media metadata
 * @returns     The created record's ID and URL
 */
export async function createMedia(
  data: {
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
    alt?: string
    category?: string
  },
): Promise<{ id: string; url: string }> {
  const mediaModel = await (db as Record<string, unknown>).media as unknown as {
    create: (args: Record<string, unknown>) => Promise<{ id: string; url: string }>
  }

  return mediaModel.create({
    data: {
      filename: data.filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      url: data.url,
      alt: data.alt ?? '',
      category: data.category ?? '',
    },
    select: { id: true, url: true },
  })
}

/**
 * List media entries, optionally filtered by category.
 *
 * @param category  Optional category filter
 * @param limit     Maximum rows to return (default 50)
 * @returns         Array of media records
 */
export async function getMedia(
  category?: string,
  limit = 50,
): Promise<MediaRow[]> {
  const mediaModel = await (db as Record<string, unknown>).media as unknown as {
    findMany: (args: Record<string, unknown>) => Promise<MediaRow[]>
  }

  return mediaModel.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/**
 * Delete a media entry by ID.
 *
 * @param id  Media primary key
 */
export async function deleteMedia(id: string): Promise<void> {
  const mediaModel = await (db as Record<string, unknown>).media as unknown as {
    delete: (args: Record<string, unknown>) => Promise<unknown>
  }

  await mediaModel.delete({ where: { id } })
}
