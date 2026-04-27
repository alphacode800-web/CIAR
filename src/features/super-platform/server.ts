import { prisma } from "@/lib/prisma"
import { CIAR_MODULES, DEFAULT_BANNER_IMAGES, MODULE_BANNER_IMAGES } from "./config"

type FallbackModule = {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  visibility: "VISIBLE" | "HIDDEN"
  isEnabled: boolean
  order: number
  banner: {
    id: string
    moduleId: string
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
    isActive: boolean
  }
}

export async function ensureSuperPlatformSeed() {
  await prisma.$transaction(async (tx) => {
    for (const platformModule of CIAR_MODULES) {
      const images = MODULE_BANNER_IMAGES[platformModule.slug] || DEFAULT_BANNER_IMAGES
      const upsertedModule = await tx.platformModule.upsert({
        where: { slug: platformModule.slug },
        update: {
          slug: platformModule.slug,
          nameEn: platformModule.nameEn,
          nameAr: platformModule.nameAr,
          descriptionEn: platformModule.descriptionEn,
          descriptionAr: platformModule.descriptionAr,
          visibility: platformModule.visibility,
          order: platformModule.order,
          isEnabled: true,
        },
        create: {
          slug: platformModule.slug,
          nameEn: platformModule.nameEn,
          nameAr: platformModule.nameAr,
          descriptionEn: platformModule.descriptionEn,
          descriptionAr: platformModule.descriptionAr,
          visibility: platformModule.visibility,
          order: platformModule.order,
          isEnabled: true,
        },
      })

      await tx.platformBanner.upsert({
        where: { moduleId: upsertedModule.id },
        update: {
          titleEn: platformModule.nameEn,
          titleAr: platformModule.nameAr,
          descriptionEn: platformModule.descriptionEn,
          descriptionAr: platformModule.descriptionAr,
          ctaTextEn: "Explore module",
          ctaTextAr: "استكشف القسم",
          ctaHref: `/super-platform?module=${platformModule.slug}`,
          imageUrl1: images[0],
          imageUrl2: images[1],
          imageUrl3: images[2],
          isActive: true,
        },
        create: {
          moduleId: upsertedModule.id,
          titleEn: platformModule.nameEn,
          titleAr: platformModule.nameAr,
          descriptionEn: platformModule.descriptionEn,
          descriptionAr: platformModule.descriptionAr,
          ctaTextEn: "Explore module",
          ctaTextAr: "استكشف القسم",
          ctaHref: `/super-platform?module=${platformModule.slug}`,
          imageUrl1: images[0],
          imageUrl2: images[1],
          imageUrl3: images[2],
          isActive: true,
        },
      })
    }
  })
}

export function getFallbackModules(includeHidden = false): FallbackModule[] {
  const rows = CIAR_MODULES.map((module) => ({
    id: `fallback-${module.slug}`,
    slug: module.slug,
    nameEn: module.nameEn,
    nameAr: module.nameAr,
    descriptionEn: module.descriptionEn,
    descriptionAr: module.descriptionAr,
    visibility: module.visibility,
    isEnabled: true,
    order: module.order,
    banner: {
      id: `fallback-banner-${module.slug}`,
      moduleId: `fallback-${module.slug}`,
      titleEn: module.nameEn,
      titleAr: module.nameAr,
      descriptionEn: module.descriptionEn,
      descriptionAr: module.descriptionAr,
      ctaTextEn: "Explore module",
      ctaTextAr: "استكشف القسم",
      ctaHref: `/super-platform?module=${module.slug}`,
      imageUrl1: (MODULE_BANNER_IMAGES[module.slug] || DEFAULT_BANNER_IMAGES)[0],
      imageUrl2: (MODULE_BANNER_IMAGES[module.slug] || DEFAULT_BANNER_IMAGES)[1],
      imageUrl3: (MODULE_BANNER_IMAGES[module.slug] || DEFAULT_BANNER_IMAGES)[2],
      isActive: true,
    },
  }))

  return includeHidden ? rows : rows.filter((m) => m.visibility === "VISIBLE")
}

export function getFallbackBanners() {
  return getFallbackModules(true).map((m) => ({
    ...m.banner,
    module: {
      id: m.id,
      slug: m.slug,
      nameEn: m.nameEn,
      nameAr: m.nameAr,
      descriptionEn: m.descriptionEn,
      descriptionAr: m.descriptionAr,
      visibility: m.visibility,
      isEnabled: m.isEnabled,
      order: m.order,
    },
  }))
}

export function getLocalizedText<T extends { nameEn?: string; nameAr?: string; titleEn?: string; titleAr?: string }>(
  item: T,
  locale: "en" | "ar",
  kind: "name" | "title" = "name"
) {
  if (kind === "title") return locale === "ar" ? item.titleAr : item.titleEn
  return locale === "ar" ? item.nameAr : item.nameEn
}
