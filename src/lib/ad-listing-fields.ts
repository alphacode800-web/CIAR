import type { AdListingType, AdProductDetails } from "@/lib/ad-product-details"

export type AdFieldInputType = "csv" | "text" | "number" | "date" | "textarea"

export type AdListingFieldDef = {
  key: keyof AdProductDetails
  type: AdFieldInputType
  labelAr: string
  labelEn: string
  placeholderAr?: string
  placeholderEn?: string
}

export type AdListingTypeConfig = {
  labelAr: string
  labelEn: string
  descriptionAr: string
  descriptionEn: string
  fields: AdListingFieldDef[]
  showStock?: boolean
  showShipping?: boolean
  showDiscount?: boolean
}

const csv = (
  key: keyof AdProductDetails,
  labelAr: string,
  labelEn: string,
  placeholderAr: string,
  placeholderEn: string
): AdListingFieldDef => ({
  key,
  type: "csv",
  labelAr,
  labelEn,
  placeholderAr,
  placeholderEn,
})

const text = (
  key: keyof AdProductDetails,
  labelAr: string,
  labelEn: string,
  placeholderAr?: string,
  placeholderEn?: string
): AdListingFieldDef => ({
  key,
  type: "text",
  labelAr,
  labelEn,
  placeholderAr,
  placeholderEn,
})

const num = (key: keyof AdProductDetails, labelAr: string, labelEn: string): AdListingFieldDef => ({
  key,
  type: "number",
  labelAr,
  labelEn,
})

const area = (key: keyof AdProductDetails, labelAr: string, labelEn: string): AdListingFieldDef => ({
  key,
  type: "textarea",
  labelAr,
  labelEn,
})

export const AD_LISTING_TYPE_CONFIG: Record<AdListingType, AdListingTypeConfig> = {
  general: {
    labelAr: "عام",
    labelEn: "General",
    descriptionAr: "إعلان عام — وسوم، مواصفات مختصرة، وسعر.",
    descriptionEn: "General listing — tags, brief specs, and price.",
    fields: [
      csv("tags", "الوسوم", "Tags", "عرض، جديد، محلي", "offer, new, local"),
      text("specifications", "مواصفات", "Specifications", "وصف مختصر للمنتج أو الخدمة", "Brief product or service specs"),
    ],
    showStock: true,
    showShipping: true,
    showDiscount: true,
  },
  fashion: {
    labelAr: "أزياء / بسة",
    labelEn: "Fashion / clothing",
    descriptionAr: "ملابس وأقمشة — القماش، الألوان، والمقاسات.",
    descriptionEn: "Clothing — fabric, colors, and sizes.",
    fields: [
      csv("fabricTypes", "أنواع القماش", "Fabric types", "قطن، حرير، بوليستر", "Cotton, silk, polyester"),
      csv("colors", "الألوان", "Colors", "أبيض، أسود، بيج", "White, black, beige"),
      csv("sizes", "المقاسات", "Sizes", "S, M, L, XL", "S, M, L, XL"),
    ],
    showStock: true,
    showShipping: true,
    showDiscount: true,
  },
  electronics: {
    labelAr: "إلكترونيات",
    labelEn: "Electronics",
    descriptionAr: "أجهزة إلكترونية — ماركة، موديل، وحالة.",
    descriptionEn: "Electronics — brand, model, and condition.",
    fields: [
      text("brand", "الماركة", "Brand", "Samsung, Apple…", "Samsung, Apple…"),
      text("model", "الموديل", "Model", "Galaxy S24", "Galaxy S24"),
      text("condition", "الحالة", "Condition", "جديد، مستعمل", "New, used"),
      text("warranty", "الضمان", "Warranty", "سنة واحدة", "One year"),
    ],
    showStock: true,
    showShipping: true,
    showDiscount: true,
  },
  real_estate: {
    labelAr: "عقارات",
    labelEn: "Real estate",
    descriptionAr: "عقار — نوع الوحدة، المساحة، الغرف، والموقع.",
    descriptionEn: "Property — type, area, rooms, and location.",
    fields: [
      text("propertyType", "نوع العقار", "Property type", "شقة، فيلا، محل", "Apartment, villa, shop"),
      num("areaSqm", "المساحة (م²)", "Area (sqm)"),
      text("rooms", "الغرف", "Rooms", "3 غرف، 2 حمام", "3 bed, 2 bath"),
      text("location", "الموقع", "Location", "حي، مدينة", "District, city"),
    ],
    showStock: false,
    showShipping: false,
    showDiscount: true,
  },
  vehicles: {
    labelAr: "سيارات / مركبات",
    labelEn: "Vehicles",
    descriptionAr: "مركبة — ماركة، موديل، سنة، وعداد.",
    descriptionEn: "Vehicle — make, model, year, and mileage.",
    fields: [
      text("brand", "الماركة", "Make", "Toyota, Hyundai…", "Toyota, Hyundai…"),
      text("model", "الموديل", "Model", "Camry 2022", "Camry 2022"),
      num("year", "سنة الصنع", "Year"),
      num("mileage", "عداد الكيلومتر", "Mileage (km)"),
      text("condition", "الحالة", "Condition", "جديدة، مستعملة", "New, used"),
    ],
    showStock: false,
    showShipping: false,
    showDiscount: true,
  },
  food: {
    labelAr: "مأكولات / مشروبات",
    labelEn: "Food & beverages",
    descriptionAr: "طعام — نوع المطبخ، الحصص، ومدة الصلاحية.",
    descriptionEn: "Food — cuisine, portions, and shelf life.",
    fields: [
      text("cuisineType", "نوع المطبخ", "Cuisine", "عربي، إيطالي، حلويات", "Arabic, Italian, desserts"),
      text("portions", "الحصص / الأحجام", "Portions / sizes", "وجبة، عائلي", "Single, family"),
      text("shelfLife", "مدة الصلاحية", "Shelf life", "3 أيام مبرد", "3 days refrigerated"),
    ],
    showStock: true,
    showShipping: true,
    showDiscount: true,
  },
  services: {
    labelAr: "خدمات",
    labelEn: "Services",
    descriptionAr: "خدمة — نطاق العمل، التوفر، ومنطقة التغطية.",
    descriptionEn: "Service — scope, availability, and coverage area.",
    fields: [
      area("serviceScope", "نطاق الخدمة", "Service scope"),
      text("availability", "التوفر", "Availability", "يومياً 9–6", "Daily 9 AM–6 PM"),
      text("serviceArea", "منطقة التغطية", "Coverage area", "الرياض، عن بعد", "Riyadh, remote"),
    ],
    showStock: false,
    showShipping: false,
    showDiscount: false,
  },
  events: {
    labelAr: "فعاليات / مناسبات",
    labelEn: "Events",
    descriptionAr: "فعالية — التاريخ، المكان، والسعة.",
    descriptionEn: "Event — date, venue, and capacity.",
    fields: [
      { key: "eventDate", type: "date", labelAr: "تاريخ الفعالية", labelEn: "Event date" },
      text("venue", "المكان", "Venue", "قاعة، مدينة", "Hall, city"),
      num("capacity", "السعة / المقاعد", "Capacity / seats"),
    ],
    showStock: false,
    showShipping: false,
    showDiscount: true,
  },
  jobs: {
    labelAr: "وظائف / توظيف",
    labelEn: "Jobs / hiring",
    descriptionAr: "وظيفة — المسمى، الخبرة، ونوع العمل.",
    descriptionEn: "Job — title, experience, and work type.",
    fields: [
      text("jobTitle", "المسمى الوظيفي", "Job title", "مطور Frontend", "Frontend developer"),
      text("experienceYears", "الخبرة", "Experience", "3+ سنوات", "3+ years"),
      text("workType", "نوع العمل", "Work type", "دوام كامل، عن بعد", "Full-time, remote"),
      num("salary", "الراتب (اختياري)", "Salary (optional)"),
    ],
    showStock: false,
    showShipping: false,
    showDiscount: false,
  },
  tourism: {
    labelAr: "سياحة / سفر",
    labelEn: "Tourism / travel",
    descriptionAr: "برنامج سياحي — الوجهة، المدة، وما يشمله.",
    descriptionEn: "Travel offer — destination, duration, and inclusions.",
    fields: [
      text("destination", "الوجهة", "Destination", "دبي، إسطنbul", "Dubai, Istanbul"),
      text("duration", "المدة", "Duration", "5 أيام / 4 ليالي", "5 days / 4 nights"),
      area("includes", "يشمل", "Includes", "طيران، فندق، جولات", "Flights, hotel, tours"),
    ],
    showStock: true,
    showShipping: false,
    showDiscount: true,
  },
  health_beauty: {
    labelAr: "صحة / تجميل",
    labelEn: "Health / beauty",
    descriptionAr: "منتجات العناية — النوع، الماركة، والحجم.",
    descriptionEn: "Care products — type, brand, and volume.",
    fields: [
      text("productType", "نوع المنتج", "Product type", "كريم، عطر، مكمل", "Cream, perfume, supplement"),
      text("brand", "الماركة", "Brand", "La Roche…", "La Roche…"),
      text("volume", "الحجم / الكمية", "Volume / quantity", "50ml، 100g", "50ml, 100g"),
    ],
    showStock: true,
    showShipping: true,
    showDiscount: true,
  },
  product: {
    labelAr: "منتج تجاري",
    labelEn: "Commercial product",
    descriptionAr: "منتج — ماركة، مواصفات، ومخزون.",
    descriptionEn: "Product — brand, specs, and stock.",
    fields: [
      text("brand", "الماركة", "Brand"),
      csv("tags", "الوسوم", "Tags", "جديد، أصلي", "new, original"),
      text("specifications", "المواصفات", "Specifications"),
    ],
    showStock: true,
    showShipping: true,
    showDiscount: true,
  },
}

export function getListingTypeConfig(type: AdListingType | undefined): AdListingTypeConfig {
  return AD_LISTING_TYPE_CONFIG[type || "general"]
}

export function getFieldDisplayValue(details: AdProductDetails, field: AdListingFieldDef): string | number | undefined {
  const raw = details[field.key]
  if (raw === undefined || raw === null || raw === "") return undefined
  if (Array.isArray(raw)) return raw.length ? raw.join("، ") : undefined
  return raw as string | number
}
