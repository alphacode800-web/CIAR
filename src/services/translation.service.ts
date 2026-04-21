import { db } from '@/lib/db'

// ── Types ────────────────────────────────────────────────────────────────────

export interface TranslationMap {
  [key: string]: string
}

export interface TranslationRow {
  id: string
  key: string
  locale: string
  value: string
}

// ── Service Functions ────────────────────────────────────────────────────────

/**
 * Retrieve a flat key→value map of UI translations for a given locale.
 *
 * @param locale  Target locale code (e.g. "en", "zh")
 * @param keys    Optional list of keys to fetch (filters the result)
 * @returns       Map of translation key to value
 */
export async function getTranslations(
  locale: string,
  keys?: string[],
): Promise<TranslationMap> {
  const where: Record<string, unknown> = { locale }

  if (keys && keys.length > 0) {
    where.key = { in: keys }
  }

  const rows = await db.translation.findMany({
    where,
    select: { key: true, value: true },
  })

  const map: TranslationMap = {}
  for (const row of rows) {
    map[row.key] = row.value
  }
  return map
}

/**
 * Fetch every translation row in the database.
 *
 * @returns  All translation records
 */
export async function getAllTranslations(): Promise<TranslationRow[]> {
  return db.translation.findMany({
    orderBy: [{ locale: 'asc' }, { key: 'asc' }],
  })
}

/**
 * Create or update a single translation entry.
 *
 * @param key    Translation key
 * @param locale Target locale
 * @param value  Translated value
 */
export async function upsertTranslation(
  key: string,
  locale: string,
  value: string,
): Promise<void> {
  await db.translation.upsert({
    where: { key_locale: { key, locale } },
    update: { value },
    create: { key, locale, value },
  })
}

/**
 * Create or update multiple translations in a single transaction.
 *
 * @param translations  Array of { key, locale, value } objects
 */
export async function bulkUpsertTranslations(
  translations: { key: string; locale: string; value: string }[],
): Promise<void> {
  if (translations.length === 0) return

  await db.$transaction(
    translations.map((t) =>
      db.translation.upsert({
        where: { key_locale: { key: t.key, locale: t.locale } },
        update: { value: t.value },
        create: { key: t.key, locale: t.locale, value: t.value },
      }),
    ),
  )
}

/**
 * Delete a single translation entry identified by key + locale.
 *
 * @param key    Translation key
 * @param locale Target locale
 */
export async function deleteTranslation(
  key: string,
  locale: string,
): Promise<void> {
  await db.translation.delete({
    where: { key_locale: { key, locale } },
  })
}
