export type ModuleSlug =
  | "FASHION"
  | "GLOBAL_PRODUCTS"
  | "VIP"
  | "MALL"
  | "TOURISM"
  | "REAL_ESTATE"
  | "CARS"
  | "SERVICES"
  | "SHIPPING"
  | "JOBS"
  | "ADS_MARKETING"
  | "INVESTMENT"
  | "DELIVERY_SYSTEM"
  | "TAXI_SYSTEM"
  | "INTERNAL_MANAGEMENT"

export type ModuleVisibility = "VISIBLE" | "HIDDEN"

export interface ModuleSeed {
  slug: ModuleSlug
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  visibility: ModuleVisibility
  order: number
}
