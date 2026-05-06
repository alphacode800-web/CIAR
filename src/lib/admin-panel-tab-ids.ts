/**
 * التبويبات الـ15 للوحة التحكم الكاملة — يجب أن تطابق `SIDEBAR_ITEMS` في `admin-layout.tsx`.
 */
export const ADMIN_PANEL_TAB_IDS = [
  "overview",
  "analytics",
  "activity",
  "projects",
  "translations",
  "media",
  "backgrounds",
  "home-banners",
  "contacts",
  "users",
  "home-sections",
  "news-ticker",
  "seo",
  "appearance",
  "settings",
  "data-export",
] as const

export type AdminPanelTabId = (typeof ADMIN_PANEL_TAB_IDS)[number]

export function isAdminPanelTabId(tab: string): tab is AdminPanelTabId {
  return (ADMIN_PANEL_TAB_IDS as readonly string[]).includes(tab)
}
