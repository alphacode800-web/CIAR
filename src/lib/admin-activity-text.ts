import { localizeAdminCategory } from "@/lib/admin-analytics-labels"

export function formatAdminTimeAgo(
  dateStr: string,
  t: (key: string) => string
): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return t("admin.just_now")
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return t("admin.minutes_ago").replace("{n}", String(minutes))
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t("admin.hours_ago").replace("{n}", String(hours))
  const days = Math.floor(hours / 24)
  if (days < 30) return t("admin.days_ago").replace("{n}", String(days))
  const months = Math.floor(days / 30)
  return t("admin.months_ago").replace("{n}", String(months))
}

export function formatAdminTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("ar-SA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const ADMIN_ACTIVITY_META_LABELS: Record<string, string> = {
  slug: "المعرّف",
  category: "التصنيف",
  email: "البريد",
  subject: "الموضوع",
  key: "المفتاح",
  locale: "اللغة",
  filename: "الملف",
}

export function formatAdminMetaLabel(key: string): string {
  return ADMIN_ACTIVITY_META_LABELS[key] || key
}

export function localizeAdminMetaValue(key: string, value: string | number): string {
  const text = String(value)
  if (key === "category") return localizeAdminCategory(text)
  return text
}
