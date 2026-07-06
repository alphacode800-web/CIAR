export const PLATFORM_CARD_IMAGE_COUNT = 3

export function projectSlugToModuleSlug(slug: string): string | null {
  if (!slug.startsWith("ciar-")) return null
  return slug.slice(5).toUpperCase().replace(/-/g, "_")
}

export function toPlatformImageSlots(urls: string[] | undefined | null): string[] {
  const slots = (Array.isArray(urls) ? urls : [])
    .map((item) => String(item || "").trim())
    .slice(0, PLATFORM_CARD_IMAGE_COUNT)
  while (slots.length < PLATFORM_CARD_IMAGE_COUNT) slots.push("")
  return slots
}

export function mergePlatformImageSlots(projectUrls: string[], bannerUrls: string[]): string[] {
  const project = toPlatformImageSlots(projectUrls)
  const banner = toPlatformImageSlots(bannerUrls)
  return project.map((url, idx) => url || banner[idx] || "")
}

export function platformImageSlotsToPayload(slots: string[]) {
  const normalized = toPlatformImageSlots(slots).map((item) => item.trim())
  const filled = normalized.filter(Boolean)
  return {
    imageUrls: filled,
    imageUrl1: normalized[0] || "",
    imageUrl2: normalized[1] || "",
    imageUrl3: normalized[2] || "",
    imageUrl: filled[0] || "",
  }
}
