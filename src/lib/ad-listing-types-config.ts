import { z } from "zod"

export const AD_LISTING_TYPES_SETTINGS_KEY = "ad_listing_types_v1"

export const AD_FIELD_INPUT_TYPES = ["csv", "text", "number", "date", "textarea"] as const
export type AdFieldInputType = (typeof AD_FIELD_INPUT_TYPES)[number]

export type AdListingFieldConfig = {
  id: string
  type: AdFieldInputType
  labelAr: string
  labelEn: string
  placeholderAr?: string
  placeholderEn?: string
}

export type AdListingTypeDefinition = {
  id: string
  labelAr: string
  labelEn: string
  descriptionAr: string
  descriptionEn: string
  enabled: boolean
  showStock: boolean
  showShipping: boolean
  showDiscount: boolean
  fields: AdListingFieldConfig[]
}

export type AdListingTypesStore = {
  defaultTypeId: string
  types: AdListingTypeDefinition[]
}

const fieldSchema = z.object({
  id: z.string().min(1).max(80).regex(/^[a-z0-9_]+$/i),
  type: z.enum(AD_FIELD_INPUT_TYPES),
  labelAr: z.string().min(1).max(120),
  labelEn: z.string().min(1).max(120),
  placeholderAr: z.string().max(200).optional(),
  placeholderEn: z.string().max(200).optional(),
})

const typeSchema = z.object({
  id: z.string().min(1).max(80).regex(/^[a-z0-9_]+$/i),
  labelAr: z.string().min(1).max(120),
  labelEn: z.string().min(1).max(120),
  descriptionAr: z.string().max(500).optional().default(""),
  descriptionEn: z.string().max(500).optional().default(""),
  enabled: z.boolean().default(true),
  showStock: z.boolean().default(true),
  showShipping: z.boolean().default(true),
  showDiscount: z.boolean().default(true),
  fields: z.array(fieldSchema).max(40).default([]),
})

export const adListingTypesStoreSchema = z.object({
  defaultTypeId: z.string().min(1).max(80),
  types: z.array(typeSchema).min(1).max(50),
})

export function slugifyListingId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "_")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `type_${Date.now()}`
}

function buildDefaultTypes(): AdListingTypeDefinition[] {
  const csv = (id: string, labelAr: string, labelEn: string, placeholderAr: string, placeholderEn: string): AdListingFieldConfig => ({
    id,
    type: "csv",
    labelAr,
    labelEn,
    placeholderAr,
    placeholderEn,
  })
  const text = (id: string, labelAr: string, labelEn: string, placeholderAr?: string, placeholderEn?: string): AdListingFieldConfig => ({
    id,
    type: "text",
    labelAr,
    labelEn,
    placeholderAr,
    placeholderEn,
  })
  const num = (id: string, labelAr: string, labelEn: string): AdListingFieldConfig => ({
    id,
    type: "number",
    labelAr,
    labelEn,
  })
  const area = (id: string, labelAr: string, labelEn: string): AdListingFieldConfig => ({
    id,
    type: "textarea",
    labelAr,
    labelEn,
  })

  return [
    {
      id: "general",
      labelAr: "عام",
      labelEn: "General",
      descriptionAr: "إعلان عام — وسوم ومواصفات.",
      descriptionEn: "General listing — tags and specs.",
      enabled: true,
      showStock: true,
      showShipping: true,
      showDiscount: true,
      fields: [
        csv("tags", "الوسوم", "Tags", "عرض، جديد، محلي", "offer, new, local"),
        text("specifications", "مواصفات", "Specifications"),
      ],
    },
    {
      id: "fashion",
      labelAr: "أزياء / بسة",
      labelEn: "Fashion / clothing",
      descriptionAr: "ملابس — قماش، ألوان، مقاسات.",
      descriptionEn: "Clothing — fabric, colors, sizes.",
      enabled: true,
      showStock: true,
      showShipping: true,
      showDiscount: true,
      fields: [
        csv("fabricTypes", "أنواع القماش", "Fabric types", "قطن، حرير", "Cotton, silk"),
        csv("colors", "الألوان", "Colors", "أبيض، أسود", "White, black"),
        csv("sizes", "المقاسات", "Sizes", "S, M, L", "S, M, L"),
      ],
    },
    {
      id: "electronics",
      labelAr: "إلكترونيات",
      labelEn: "Electronics",
      descriptionAr: "أجهزة إلكترونية.",
      descriptionEn: "Electronics devices.",
      enabled: true,
      showStock: true,
      showShipping: true,
      showDiscount: true,
      fields: [
        text("brand", "الماركة", "Brand"),
        text("model", "الموديل", "Model"),
        text("condition", "الحالة", "Condition"),
        text("warranty", "الضمان", "Warranty"),
      ],
    },
    {
      id: "real_estate",
      labelAr: "عقارات",
      labelEn: "Real estate",
      descriptionAr: "عقارات ووحدات سكنية.",
      descriptionEn: "Properties and units.",
      enabled: true,
      showStock: false,
      showShipping: false,
      showDiscount: true,
      fields: [
        text("propertyType", "نوع العقار", "Property type"),
        num("areaSqm", "المساحة (م²)", "Area (sqm)"),
        text("rooms", "الغرف", "Rooms"),
        text("location", "الموقع", "Location"),
      ],
    },
    {
      id: "vehicles",
      labelAr: "سيارات / مركبات",
      labelEn: "Vehicles",
      descriptionAr: "سيارات ومركبات.",
      descriptionEn: "Cars and vehicles.",
      enabled: true,
      showStock: false,
      showShipping: false,
      showDiscount: true,
      fields: [
        text("brand", "الماركة", "Make"),
        text("model", "الموديل", "Model"),
        num("year", "سنة الصنع", "Year"),
        num("mileage", "عداد الكيلومتر", "Mileage"),
      ],
    },
    {
      id: "services",
      labelAr: "خدمات",
      labelEn: "Services",
      descriptionAr: "خدمات مهنية.",
      descriptionEn: "Professional services.",
      enabled: true,
      showStock: false,
      showShipping: false,
      showDiscount: false,
      fields: [
        area("serviceScope", "نطاق الخدمة", "Service scope"),
        text("availability", "التوفر", "Availability"),
        text("serviceArea", "منطقة التغطية", "Coverage area"),
      ],
    },
  ]
}

export function defaultAdListingTypesStore(): AdListingTypesStore {
  return {
    defaultTypeId: "general",
    types: buildDefaultTypes(),
  }
}

export function parseAdListingTypesStore(raw: string | undefined): AdListingTypesStore {
  if (!raw) return defaultAdListingTypesStore()
  try {
    const parsed = adListingTypesStoreSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return defaultAdListingTypesStore()
    const store = parsed.data as AdListingTypesStore
    if (!store.types.some((t) => t.id === store.defaultTypeId)) {
      store.defaultTypeId = store.types[0]?.id || "general"
    }
    return store
  } catch {
    return defaultAdListingTypesStore()
  }
}

export function serializeAdListingTypesStore(store: AdListingTypesStore): string {
  return JSON.stringify(store)
}

export function getEnabledListingTypes(store: AdListingTypesStore): AdListingTypeDefinition[] {
  return store.types.filter((t) => t.enabled)
}

export function getListingTypeDefinition(
  store: AdListingTypesStore,
  typeId: string | undefined
): AdListingTypeDefinition | undefined {
  const id = typeId || store.defaultTypeId
  return store.types.find((t) => t.id === id) || store.types.find((t) => t.id === store.defaultTypeId)
}

export function getListingTypeLabelFromStore(
  store: AdListingTypesStore,
  typeId: string | undefined,
  isAr: boolean
): string {
  const type = getListingTypeDefinition(store, typeId)
  if (!type) return typeId || "—"
  return isAr ? type.labelAr : type.labelEn
}

export function newListingField(partial?: Partial<AdListingFieldConfig>): AdListingFieldConfig {
  const id = partial?.id || `field_${Date.now()}`
  return {
    id,
    type: partial?.type || "text",
    labelAr: partial?.labelAr || "حقل جديد",
    labelEn: partial?.labelEn || "New field",
    placeholderAr: partial?.placeholderAr,
    placeholderEn: partial?.placeholderEn,
  }
}

export function newListingType(partial?: Partial<AdListingTypeDefinition>): AdListingTypeDefinition {
  const id = partial?.id || slugifyListingId(partial?.labelEn || partial?.labelAr || "new_type")
  return {
    id,
    labelAr: partial?.labelAr || "نوع جديد",
    labelEn: partial?.labelEn || "New type",
    descriptionAr: partial?.descriptionAr || "",
    descriptionEn: partial?.descriptionEn || "",
    enabled: partial?.enabled ?? true,
    showStock: partial?.showStock ?? true,
    showShipping: partial?.showShipping ?? true,
    showDiscount: partial?.showDiscount ?? true,
    fields: partial?.fields || [],
  }
}
