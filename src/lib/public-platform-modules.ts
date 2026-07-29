import { comparePlatformOrderDesc } from "@/lib/platform-display-order"

export const LOCAL_PROJECTS_CACHE_KEY = "ciar-admin-projects-local-cache"

export type PublicPlatformBanner = {
  id: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  ctaTextEn: string
  ctaTextAr: string
  ctaHref: string
  imageUrl1: string
  imageUrl2: string
  imageUrl3: string
  isActive?: boolean
  imageUrls?: string[]
}

export type PublicPlatformModule = {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  visibility: "VISIBLE" | "HIDDEN"
  isEnabled: boolean
  order: number
  banner: PublicPlatformBanner | null
}

type CachedProject = {
  slug: string
  published: boolean
  imageUrl: string
  imageUrls?: string[]
  translations?: { locale: string; name: string; description: string }[]
}

function moduleSlugToProjectSlug(moduleSlug: string): string {
  return `ciar-${moduleSlug.toLowerCase().replace(/_/g, "-")}`
}

function pickTranslation(translations: CachedProject["translations"] = [], locale: "ar" | "en") {
  const direct = translations.find((tr) => tr.locale === locale)
  if (direct) return direct
  return translations.find((tr) => tr.locale === "en") || translations[0]
}

/** Same merge used on صفحة منصاتنا when API is in fallback mode. */
export function mergeLocalProjectsIntoModules(modules: PublicPlatformModule[]): PublicPlatformModule[] {
  if (typeof window === "undefined") return modules

  try {
    const cachedRaw = localStorage.getItem(LOCAL_PROJECTS_CACHE_KEY)
    const cachedProjects: CachedProject[] = cachedRaw ? JSON.parse(cachedRaw) : []
    if (!Array.isArray(cachedProjects) || cachedProjects.length === 0) return modules

    return modules.map((moduleItem) => {
      const matched = cachedProjects.find(
        (project) => project.slug === moduleSlugToProjectSlug(moduleItem.slug)
      )
      if (!matched) return moduleItem

      const ar = pickTranslation(matched.translations, "ar")
      const en = pickTranslation(matched.translations, "en")
      const images =
        Array.isArray(matched.imageUrls) && matched.imageUrls.length > 0
          ? matched.imageUrls
          : matched.imageUrl
            ? [matched.imageUrl]
            : []

      return {
        ...moduleItem,
        nameEn: en?.name || moduleItem.nameEn,
        nameAr: ar?.name || moduleItem.nameAr,
        descriptionEn: en?.description || moduleItem.descriptionEn,
        descriptionAr: ar?.description || moduleItem.descriptionAr,
        isEnabled: matched.published,
        banner: moduleItem.banner
          ? {
              ...moduleItem.banner,
              titleEn: en?.name || moduleItem.banner.titleEn,
              titleAr: ar?.name || moduleItem.banner.titleAr,
              descriptionEn: en?.description || moduleItem.banner.descriptionEn,
              descriptionAr: ar?.description || moduleItem.banner.descriptionAr,
              imageUrls: images,
              imageUrl1: images[0] || moduleItem.banner.imageUrl1,
              imageUrl2: images[1] || moduleItem.banner.imageUrl2,
              imageUrl3: images[2] || moduleItem.banner.imageUrl3,
            }
          : moduleItem.banner,
      }
    })
  } catch {
    return modules
  }
}

export function filterPublicPlatformModules(modules: PublicPlatformModule[]): PublicPlatformModule[] {
  return modules
    .filter((m) => m.visibility === "VISIBLE" && m.isEnabled && m.banner?.isActive)
    .sort(comparePlatformOrderDesc)
}

export async function fetchPublicPlatformModules(): Promise<PublicPlatformModule[]> {
  const res = await fetch("/api/super-platform/modules", { cache: "no-store" })
  const data = await res.json()
  let rows: PublicPlatformModule[] = Array.isArray(data?.modules) ? data.modules : []

  if (data?.fallback) {
    rows = mergeLocalProjectsIntoModules(rows)
  }

  return filterPublicPlatformModules(rows)
}

/** Card shape used on the home page platform grid. */
export type HomePlatformCard = {
  id: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  ctaTextEn: string
  ctaTextAr: string
  ctaHref: string
  imageUrl1: string
  imageUrl2: string
  imageUrl3: string
  module?: { slug?: string; order?: number }
}

export function moduleToHomePlatformCard(module: PublicPlatformModule): HomePlatformCard {
  const banner = module.banner
  return {
    id: module.slug.toLowerCase(),
    titleEn: banner?.titleEn || module.nameEn,
    titleAr: banner?.titleAr || module.nameAr,
    descriptionEn: banner?.descriptionEn || module.descriptionEn,
    descriptionAr: banner?.descriptionAr || module.descriptionAr,
    ctaTextEn: banner?.ctaTextEn || "Explore section",
    ctaTextAr: banner?.ctaTextAr || "استكشف القسم",
    ctaHref: banner?.ctaHref || `#/platform/${module.slug.toLowerCase()}`,
    imageUrl1: banner?.imageUrl1 || "",
    imageUrl2: banner?.imageUrl2 || "",
    imageUrl3: banner?.imageUrl3 || "",
    module: { slug: module.slug, order: module.order },
  }
}

export function modulesToHomePlatformCards(modules: PublicPlatformModule[]): HomePlatformCard[] {
  return modules.map(moduleToHomePlatformCard)
}
