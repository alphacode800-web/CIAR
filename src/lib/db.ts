import { randomUUID } from 'crypto'
import { firebaseAdminDb } from '@/lib/firebase-admin'

type AnyRecord = Record<string, any>
type SortDir = 'asc' | 'desc'

function now(): Date {
  return new Date()
}

function coerceDate(value: any): Date {
  if (value instanceof Date) return value
  if (value?.toDate && typeof value.toDate === 'function') return value.toDate()
  return new Date(value)
}

function normalizeDoc<T extends AnyRecord>(id: string, data: AnyRecord): T {
  const normalized: AnyRecord = { id, ...data }
  for (const [k, v] of Object.entries(normalized)) {
    if (v?.toDate && typeof v.toDate === 'function') normalized[k] = v.toDate()
  }
  return normalized as T
}

function textContains(haystack: unknown, needle: string): boolean {
  return String(haystack ?? '').toLowerCase().includes(needle.toLowerCase())
}

function isPlainObject(v: unknown): v is AnyRecord {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function applyOrderBy<T extends AnyRecord>(rows: T[], orderBy: any): T[] {
  if (!orderBy) return rows
  const list = Array.isArray(orderBy) ? orderBy : [orderBy]
  return [...rows].sort((a, b) => {
    for (const rule of list) {
      const [[field, dir]] = Object.entries(rule) as [[string, SortDir]]
      const av = a[field]
      const bv = b[field]
      if (av === bv) continue
      if (av == null) return dir === 'asc' ? -1 : 1
      if (bv == null) return dir === 'asc' ? 1 : -1
      if (av > bv) return dir === 'asc' ? 1 : -1
      if (av < bv) return dir === 'asc' ? -1 : 1
    }
    return 0
  })
}

function applySelect<T extends AnyRecord>(row: T, select?: AnyRecord): AnyRecord {
  if (!select) return row
  const out: AnyRecord = {}
  for (const [key, enabled] of Object.entries(select)) {
    if (enabled) out[key] = row[key]
  }
  return out
}

class FirestoreModel {
  constructor(private readonly collectionName: string) {}

  private collection() {
    return firebaseAdminDb().collection(this.collectionName)
  }

  async all<T extends AnyRecord>(): Promise<T[]> {
    const snap = await this.collection().get()
    return snap.docs.map((d) => normalizeDoc<T>(d.id, d.data()))
  }

  async findUnique(args: { where: AnyRecord }) {
    const rows = await this.all<AnyRecord>()
    const [field, value] = Object.entries(args.where)[0] ?? []
    if (!field) return null
    return rows.find((r) => r[field] === value) ?? null
  }

  async create(args: { data: AnyRecord; select?: AnyRecord; include?: AnyRecord }) {
    const id = args.data.id ?? randomUUID()
    const createdAt = args.data.createdAt ?? now()
    const updatedAt = args.data.updatedAt ?? createdAt
    const payload = { ...args.data, createdAt, updatedAt }
    await this.collection().doc(id).set(payload)
    const saved = normalizeDoc(id, payload)
    return applySelect(saved, args.select)
  }

  async delete(args: { where: AnyRecord }) {
    const row = await this.findUnique({ where: args.where })
    if (!row) throw new Error(`${this.collectionName} not found`)
    await this.collection().doc(row.id).delete()
    return row
  }
}

const projectModel = new FirestoreModel('projects')
const projectTranslationModelBase = new FirestoreModel('projectTranslations')
const translationModelBase = new FirestoreModel('translations')
const settingModelBase = new FirestoreModel('settings')
const contactModelBase = new FirestoreModel('contactSubmissions')
const userModelBase = new FirestoreModel('users')
const mediaModelBase = new FirestoreModel('media')
const pageModelBase = new FirestoreModel('pages')
const pageSectionModelBase = new FirestoreModel('pageSections')
const pageSectionTranslationModelBase = new FirestoreModel('pageSectionTranslations')

async function getProjectTranslations(projectId: string, locale?: string) {
  const rows = await projectTranslationModelBase.all<AnyRecord>()
  return rows
    .filter((r) => r.projectId === projectId && (!locale || r.locale === locale))
    .map((r) => ({
      locale: r.locale,
      name: r.name ?? '',
      tagline: r.tagline ?? '',
      description: r.description ?? '',
    }))
}

function matchWhere(row: AnyRecord, where?: AnyRecord): boolean {
  if (!where) return true
  if (where.OR && Array.isArray(where.OR)) {
    if (where.OR.some((w: AnyRecord) => matchWhere(row, w))) return true
    const rest = { ...where }
    delete rest.OR
    return Object.keys(rest).length === 0 ? false : matchWhere(row, rest)
  }
  for (const [key, cond] of Object.entries(where)) {
    if (key === 'OR') continue
    if (key === 'translations' && isPlainObject(cond) && cond.some) continue
    const value = row[key]
    if (isPlainObject(cond)) {
      if (Array.isArray(cond.in)) {
        if (!cond.in.includes(value)) return false
        continue
      }
      if (typeof cond.contains === 'string') {
        if (!textContains(value, cond.contains)) return false
        continue
      }
      if (cond.gte != null && coerceDate(value) < coerceDate(cond.gte)) return false
      if (cond.lte != null && coerceDate(value) > coerceDate(cond.lte)) return false
      continue
    }
    if (value !== cond) return false
  }
  return true
}

export const db: any = {
  async $transaction(input: any) {
    if (typeof input === 'function') return input(db)
    if (Array.isArray(input)) return Promise.all(input)
    return input
  },

  async $queryRaw() {
    const rows = await projectModel.all<AnyRecord>()
    const grouped = new Map<string, number>()
    for (const p of rows) {
      const category = String(p.category ?? '')
      if (!category) continue
      grouped.set(category, (grouped.get(category) ?? 0) + 1)
    }
    return [...grouped.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }))
  },

  project: {
    async findMany(args: AnyRecord = {}) {
      let rows = await projectModel.all<AnyRecord>()
      rows = rows.filter((r) => matchWhere(r, args.where))
      if (args.where?.translations?.some?.OR) {
        const rules = args.where.translations.some.OR
        rows = (
          await Promise.all(
            rows.map(async (r) => {
              const trs = await getProjectTranslations(r.id)
              const ok = trs.some((t) =>
                rules.some((rule: AnyRecord) =>
                  Object.entries(rule).some(([field, c]: any) =>
                    textContains(t[field], c.contains),
                  ),
                ),
              )
              return ok ? r : null
            }),
          )
        ).filter(Boolean) as AnyRecord[]
      }
      rows = applyOrderBy(rows, args.orderBy)
      if (args.distinct?.includes('category')) {
        const seen = new Set<string>()
        rows = rows.filter((r) => {
          const c = String(r.category ?? '')
          if (!c || seen.has(c)) return false
          seen.add(c)
          return true
        })
      }
      if (typeof args.skip === 'number' && args.skip > 0) rows = rows.slice(args.skip)
      if (typeof args.take === 'number') rows = rows.slice(0, args.take)
      if (args.include?.translations) {
        const locale = args.include.translations.where?.locale
        const selected = args.include.translations.select
        return Promise.all(
          rows.map(async (r) => {
            const translations = await getProjectTranslations(r.id, locale)
            const tx = selected
              ? translations.map((t) => applySelect(t, selected))
              : translations
            return { ...r, translations: tx }
          }),
        )
      }
      return args.select ? rows.map((r) => applySelect(r, args.select)) : rows
    },
    async count(args: AnyRecord = {}) {
      const rows = await this.findMany({ where: args.where })
      return rows.length
    },
    async aggregate() {
      const rows = await projectModel.all<AnyRecord>()
      return {
        _sum: { views: rows.reduce((sum, r) => sum + Number(r.views ?? 0), 0) },
        _count: rows.length,
      }
    },
    async findUnique(args: AnyRecord) {
      const { where } = args
      const rows = await projectModel.all<AnyRecord>()
      const row = rows.find((r) =>
        where.id ? r.id === where.id : r.slug === where.slug,
      )
      if (!row) return null
      if (args.include?.translations) {
        const locale = args.include.translations.where?.locale
        const selected = args.include.translations.select
        const translations = await getProjectTranslations(row.id, locale)
        return { ...row, translations: selected ? translations.map((t) => applySelect(t, selected)) : translations }
      }
      return row
    },
    async findUniqueOrThrow(args: AnyRecord) {
      const row = await this.findUnique(args)
      if (!row) throw new Error('Project not found')
      return row
    },
    async create(args: AnyRecord) {
      const normalizedImageUrls = Array.isArray(args.data.imageUrls)
        ? args.data.imageUrls.map((item: unknown) => String(item ?? '').trim()).filter(Boolean).slice(0, 5)
        : []
      const data = {
        slug: args.data.slug,
        imageUrl: normalizedImageUrls[0] ?? args.data.imageUrl ?? '',
        imageUrls: normalizedImageUrls,
        category: args.data.category ?? '',
        externalUrl: args.data.externalUrl ?? '',
        tags: args.data.tags ?? '[]',
        featured: args.data.featured ?? false,
        published: args.data.published ?? true,
        order: args.data.order ?? 0,
        views: args.data.views ?? 0,
      }
      const row = await projectModel.create({ data })
      if (args.include?.translations) {
        return { ...row, translations: [] }
      }
      return row
    },
    async update(args: AnyRecord) {
      const existing = await this.findUniqueOrThrow({ where: args.where })
      const patch = { ...args.data }
      if (isPlainObject(patch.views) && typeof patch.views.increment === 'number') {
        patch.views = Number(existing.views ?? 0) + patch.views.increment
      }
      const payload = { ...existing, ...patch, updatedAt: now() }
      await firebaseAdminDb().collection('projects').doc(existing.id).set(payload)
      const row = normalizeDoc(existing.id, payload)
      if (args.include?.translations) {
        const selected = args.include.translations.select
        const translations = await getProjectTranslations(existing.id)
        return { ...row, translations: selected ? translations.map((t) => applySelect(t, selected)) : translations }
      }
      return row
    },
    async updateMany(args: AnyRecord) {
      const rows = await this.findMany({ where: args.where })
      await Promise.all(rows.map((r: AnyRecord) => this.update({ where: { id: r.id }, data: args.data })))
      return { count: rows.length }
    },
    async delete(args: AnyRecord) {
      const row = await projectModel.delete({ where: args.where })
      const trs = await projectTranslationModelBase.all<AnyRecord>()
      await Promise.all(
        trs.filter((t) => t.projectId === row.id).map((t) =>
          firebaseAdminDb().collection('projectTranslations').doc(t.id).delete(),
        ),
      )
      return row
    },
    async deleteMany(args: AnyRecord) {
      const rows = await this.findMany({ where: args.where })
      await Promise.all(rows.map((r: AnyRecord) => this.delete({ where: { id: r.id } })))
      return { count: rows.length }
    },
  },

  projectTranslation: {
    async findMany(args: AnyRecord = {}) {
      let rows = await projectTranslationModelBase.all<AnyRecord>()
      rows = rows.filter((r) => matchWhere(r, args.where))
      rows = applyOrderBy(rows, args.orderBy)
      if (typeof args.take === 'number') rows = rows.slice(0, args.take)
      return args.select ? rows.map((r) => applySelect(r, args.select)) : rows
    },
    async createMany(args: AnyRecord) {
      await Promise.all(args.data.map((d: AnyRecord) => projectTranslationModelBase.create({ data: d })))
      return { count: args.data.length }
    },
    async upsert(args: AnyRecord) {
      const key = args.where?.projectId_locale ?? args.where?.sectionId_locale
      const rows = await projectTranslationModelBase.all<AnyRecord>()
      const existing = rows.find((r) => r.projectId === key.projectId && r.locale === key.locale)
      if (existing) {
        const payload = { ...existing, ...args.update, updatedAt: now() }
        await firebaseAdminDb().collection('projectTranslations').doc(existing.id).set(payload)
        return normalizeDoc(existing.id, payload)
      }
      return projectTranslationModelBase.create({ data: { ...args.create } })
    },
    async groupBy(args: AnyRecord) {
      const rows = await projectTranslationModelBase.all<AnyRecord>()
      const byLocale = new Map<string, number>()
      for (const r of rows) byLocale.set(r.locale, (byLocale.get(r.locale) ?? 0) + 1)
      return [...byLocale.entries()].map(([locale, count]) => ({
        locale,
        _count: { id: count },
      }))
    },
  },

  translation: {
    async findMany(args: AnyRecord = {}) {
      let rows = await translationModelBase.all<AnyRecord>()
      rows = rows.filter((r) => matchWhere(r, args.where))
      rows = applyOrderBy(rows, args.orderBy)
      return args.select ? rows.map((r) => applySelect(r, args.select)) : rows
    },
    async count() {
      const rows = await translationModelBase.all()
      return rows.length
    },
    async upsert(args: AnyRecord) {
      const key = args.where.key_locale
      const rows = await translationModelBase.all<AnyRecord>()
      const existing = rows.find((r) => r.key === key.key && r.locale === key.locale)
      if (existing) {
        const payload = { ...existing, ...args.update, updatedAt: now() }
        await firebaseAdminDb().collection('translations').doc(existing.id).set(payload)
        return normalizeDoc(existing.id, payload)
      }
      return translationModelBase.create({ data: { ...args.create } })
    },
    async delete(args: AnyRecord) {
      const key = args.where.key_locale
      const rows = await translationModelBase.all<AnyRecord>()
      const existing = rows.find((r) => r.key === key.key && r.locale === key.locale)
      if (!existing) throw new Error('Translation not found')
      await firebaseAdminDb().collection('translations').doc(existing.id).delete()
    },
  },

  setting: {
    async findMany(args: AnyRecord = {}) {
      const rows = await settingModelBase.all<AnyRecord>()
      return args.select ? rows.map((r) => applySelect(r, args.select)) : rows
    },
    async findUnique(args: AnyRecord) {
      const rows = await settingModelBase.all<AnyRecord>()
      const row = rows.find((r) => r.key === args.where.key)
      if (!row) return null
      return args.select ? applySelect(row, args.select) : row
    },
    async upsert(args: AnyRecord) {
      const rows = await settingModelBase.all<AnyRecord>()
      const existing = rows.find((r) => r.key === args.where.key)
      if (existing) {
        const payload = { ...existing, ...args.update, updatedAt: now() }
        await firebaseAdminDb().collection('settings').doc(existing.id).set(payload)
        return normalizeDoc(existing.id, payload)
      }
      return settingModelBase.create({ data: { ...args.create } })
    },
  },

  contactSubmission: {
    async create(args: AnyRecord) {
      return contactModelBase.create({
        data: args.data,
        select: args.select,
        include: args.include,
      })
    },
    async findMany(args: AnyRecord = {}) {
      let rows = await contactModelBase.all<AnyRecord>()
      rows = rows.filter((r) => matchWhere(r, args.where))
      rows = applyOrderBy(rows, args.orderBy)
      if (typeof args.skip === 'number' && args.skip > 0) rows = rows.slice(args.skip)
      if (typeof args.take === 'number') rows = rows.slice(0, args.take)
      return args.select ? rows.map((r) => applySelect(r, args.select)) : rows
    },
    async count(args: AnyRecord = {}) {
      const rows = await this.findMany({ where: args.where })
      return rows.length
    },
    async findUnique(args: AnyRecord) {
      const rows = await contactModelBase.all<AnyRecord>()
      return rows.find((r) => r.id === args.where.id) ?? null
    },
    async delete(args: AnyRecord) {
      await contactModelBase.delete({ where: args.where })
    },
  },

  user: {
    async findUnique(args: AnyRecord) {
      const rows = await userModelBase.all<AnyRecord>()
      const row = rows.find((r) =>
        args.where.email ? r.email === args.where.email : r.id === args.where.id,
      )
      if (!row) return null
      return args.select ? applySelect(row, args.select) : row
    },
    async create(args: AnyRecord) {
      const data = { ...args.data, role: args.data.role ?? 'user', avatar: args.data.avatar ?? '' }
      return userModelBase.create({ data })
    },
    async count() {
      const rows = await userModelBase.all()
      return rows.length
    },
    async findMany(args: AnyRecord = {}) {
      let rows = await userModelBase.all<AnyRecord>()
      rows = applyOrderBy(rows, args.orderBy)
      if (typeof args.take === 'number') rows = rows.slice(0, args.take)
      return args.select ? rows.map((r) => applySelect(r, args.select)) : rows
    },
  },

  media: {
    async create(args: AnyRecord) {
      return mediaModelBase.create({
        data: args.data,
        select: args.select,
        include: args.include,
      })
    },
    async findUnique(args: AnyRecord) {
      const rows = await mediaModelBase.all<AnyRecord>()
      const row = rows.find((r) => r.id === args.where.id)
      if (!row) return null
      return args.select ? applySelect(row, args.select) : row
    },
    async findMany(args: AnyRecord = {}) {
      let rows = await mediaModelBase.all<AnyRecord>()
      rows = rows.filter((r) => matchWhere(r, args.where))
      rows = applyOrderBy(rows, args.orderBy)
      if (typeof args.take === 'number') rows = rows.slice(0, args.take)
      return args.select ? rows.map((r) => applySelect(r, args.select)) : rows
    },
    async delete(args: AnyRecord) {
      await mediaModelBase.delete({ where: args.where })
    },
  },

  page: {
    async findUnique(args: AnyRecord) {
      const pages = await pageModelBase.all<AnyRecord>()
      const page = pages.find((p) =>
        args.where.slug ? p.slug === args.where.slug : p.id === args.where.id,
      )
      if (!page) return null
      if (!args.include?.sections) return page
      const sections = await db.pageSection.findMany({
        where: { pageId: page.id },
        orderBy: args.include.sections.orderBy,
        include: args.include.sections.include,
      })
      return { ...page, sections }
    },
    async findMany(args: AnyRecord = {}) {
      let pages = await pageModelBase.all<AnyRecord>()
      pages = applyOrderBy(pages, args.orderBy)
      if (!args.include?.sections) return pages
      return Promise.all(
        pages.map(async (p) => ({
          ...p,
          sections: await db.pageSection.findMany({
            where: { pageId: p.id },
            orderBy: args.include.sections.orderBy,
            include: args.include.sections.include,
          }),
        })),
      )
    },
    async create(args: AnyRecord) {
      const page = await pageModelBase.create({ data: { ...args.data, order: args.data.order ?? 0 } })
      if (!args.include?.sections) return page
      return { ...page, sections: [] }
    },
    async update(args: AnyRecord) {
      const existing = await this.findUnique({ where: args.where })
      if (!existing) throw new Error('Page not found')
      const payload = { ...existing, ...args.data, updatedAt: now() }
      await firebaseAdminDb().collection('pages').doc(existing.id).set(payload)
      return normalizeDoc(existing.id, payload)
    },
    async delete(args: AnyRecord) {
      const existing = await this.findUnique({ where: args.where })
      if (!existing) throw new Error('Page not found')
      const sections = await db.pageSection.findMany({ where: { pageId: existing.id } })
      await Promise.all(sections.map((s: AnyRecord) => db.pageSection.delete({ where: { id: s.id } })))
      await firebaseAdminDb().collection('pages').doc(existing.id).delete()
    },
  },

  pageSection: {
    async findMany(args: AnyRecord = {}) {
      let rows = await pageSectionModelBase.all<AnyRecord>()
      rows = rows.filter((r) => matchWhere(r, args.where))
      rows = applyOrderBy(rows, args.orderBy)
      if (args.include?.translations) {
        const locale = args.include.translations.where?.locale
        const translations = await pageSectionTranslationModelBase.all<AnyRecord>()
        return rows.map((r) => ({
          ...r,
          translations: translations.filter((t) => t.sectionId === r.id && (!locale || t.locale === locale)),
        }))
      }
      return rows
    },
    async create(args: AnyRecord) {
      return pageSectionModelBase.create({ data: args.data })
    },
    async update(args: AnyRecord) {
      const rows = await pageSectionModelBase.all<AnyRecord>()
      const existing = rows.find((r) => r.id === args.where.id)
      if (!existing) throw new Error('Section not found')
      const payload = { ...existing, ...args.data, updatedAt: now() }
      await firebaseAdminDb().collection('pageSections').doc(existing.id).set(payload)
      return normalizeDoc(existing.id, payload)
    },
    async delete(args: AnyRecord) {
      const rows = await pageSectionModelBase.all<AnyRecord>()
      const existing = rows.find((r) => r.id === args.where.id)
      if (!existing) throw new Error('Section not found')
      const translations = await pageSectionTranslationModelBase.all<AnyRecord>()
      await Promise.all(
        translations.filter((t) => t.sectionId === existing.id).map((t) =>
          firebaseAdminDb().collection('pageSectionTranslations').doc(t.id).delete(),
        ),
      )
      await firebaseAdminDb().collection('pageSections').doc(existing.id).delete()
    },
  },

  pageSectionTranslation: {
    async upsert(args: AnyRecord) {
      const key = args.where.sectionId_locale
      const rows = await pageSectionTranslationModelBase.all<AnyRecord>()
      const existing = rows.find((r) => r.sectionId === key.sectionId && r.locale === key.locale)
      if (existing) {
        const payload = { ...existing, ...args.update, updatedAt: now() }
        await firebaseAdminDb().collection('pageSectionTranslations').doc(existing.id).set(payload)
        return normalizeDoc(existing.id, payload)
      }
      return pageSectionTranslationModelBase.create({ data: args.create })
    },
  },
}
