import { db } from '@/lib/db'

// ── Service Functions ────────────────────────────────────────────────────────

/**
 * Retrieve all site settings as a key→value map.
 *
 * @returns  Flat object of every setting
 */
export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.setting.findMany({
    select: { key: true, value: true },
  })

  const map: Record<string, string> = {}
  for (const row of rows) {
    map[row.key] = row.value
  }
  return map
}

/**
 * Retrieve a single setting value by key.
 *
 * @param key  Setting key
 * @returns    The value, or null if the key does not exist
 */
export async function getSetting(key: string): Promise<string | null> {
  const row = await db.setting.findUnique({
    where: { key },
    select: { value: true },
  })
  return row?.value ?? null
}

/**
 * Create or update multiple settings in a single transaction.
 *
 * @param data  Key→value map of settings to persist
 */
export async function updateSettings(data: Record<string, string>): Promise<void> {
  if (Object.keys(data).length === 0) return

  await db.$transaction(
    Object.entries(data).map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value, type: 'string' },
      }),
    ),
  )
}
