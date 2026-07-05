import { PAGE_ADMIN_CONFIG, type PageAdminId, type PageSectionLink } from "@/lib/page-admin-sections"

export type SectionAdminEntry = PageSectionLink & {
  pageId: PageAdminId
}

/** كل الأقسام التي لها تبويب إدارة محتوى مستقل (غير ظاهر في الشريط الجانبي). */
export function getAllSectionAdminEntries(): SectionAdminEntry[] {
  const entries: SectionAdminEntry[] = []
  for (const pageId of Object.keys(PAGE_ADMIN_CONFIG) as PageAdminId[]) {
    const page = PAGE_ADMIN_CONFIG[pageId]
    for (const section of page.sections) {
      if (section.contentKeys) {
        entries.push({ ...section, pageId })
      }
    }
  }
  return entries
}

export function getSectionAdminTabIds(): string[] {
  return getAllSectionAdminEntries().map((e) => e.adminTab)
}

export function getSectionByAdminTab(tabId: string): SectionAdminEntry | null {
  return getAllSectionAdminEntries().find((e) => e.adminTab === tabId) ?? null
}

export function isSectionContentTab(tabId: string): boolean {
  return getSectionAdminTabIds().includes(tabId)
}
