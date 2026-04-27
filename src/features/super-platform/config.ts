import type { ModuleSeed } from "./types"

export const CIAR_MODULES: ModuleSeed[] = [
  { slug: "FASHION", nameEn: "CIAR Fashion", nameAr: "CiAr موضة", descriptionEn: "Women's and men's fashion: dresses, shoes, bags, and accessories.", descriptionAr: "موضة نسائية ورجالية: فساتين، احذية، جزادين، اكسسوارات.", visibility: "VISIBLE", order: 1 },
  { slug: "GLOBAL_PRODUCTS", nameEn: "CIAR Global Products", nameAr: "CiAr للمنتجات الصينية والدولية", descriptionEn: "Chinese and international products between global companies from all industries.", descriptionAr: "للمنتجات الصينية والدولية بين الشركات العالمية من كافة الصناعات.", visibility: "VISIBLE", order: 2 },
  { slug: "VIP", nameEn: "CIAR VIP", nameAr: "CiAr VIP", descriptionEn: "For VIP clients: global brands, men's and women's fashion, and all premium needs.", descriptionAr: "لكبار الشخصيات، البسة رجالية ونسائية، ماركات عالمية وكل ما تحتاجه.", visibility: "VISIBLE", order: 3 },
  { slug: "MALL", nameEn: "CIAR E-Mall", nameAr: "مول CiAr الالكتروني", descriptionEn: "A global-scale e-mall with daily offers and exclusive features.", descriptionAr: "أكبر مول الكتروني عالميا مع عروض وميزات يومية.", visibility: "VISIBLE", order: 4 },
  { slug: "TOURISM", nameEn: "CIAR Tourism Guide", nameAr: "CiAr الدليل والوسيط السياحي", descriptionEn: "Tourism guide and broker for all countries, agencies, and distinguished offers.", descriptionAr: "الدليل والوسيط السياحي لكافة دول وشركات العالم وخدمات وعروض مميزة.", visibility: "VISIBLE", order: 5 },
  { slug: "REAL_ESTATE", nameEn: "CIAR Real Estate Guide", nameAr: "دليل CiAr للتسويق العقاري", descriptionEn: "Buy, sell, and rent all types of real estate.", descriptionAr: "بيع وشراء وأجار كافة انواع العقارات.", visibility: "VISIBLE", order: 6 },
  { slug: "CARS", nameEn: "CIAR Car Trading Guide", nameAr: "دليل CiAr لتجارة السيارات", descriptionEn: "Buy, sell, and rent all types of cars.", descriptionAr: "بيع وشراء وأجار كافة انواع السيارات.", visibility: "VISIBLE", order: 7 },
  { slug: "SERVICES", nameEn: "CIAR Home & Office Services", nameAr: "دليل CiAr لصيانة المنازل والمكاتب", descriptionEn: "Home and office maintenance with cleaning services.", descriptionAr: "لصيانة المنازل والمكاتب وخدمات التنظيف.", visibility: "VISIBLE", order: 8 },
  { slug: "SHIPPING", nameEn: "CIAR Global Shipping Guide", nameAr: "CiAr دليل الشحن العالمي", descriptionEn: "Worldwide shipping by land, sea, and air.", descriptionAr: "دليل الشحن العالمي برا وبحرا وجوا إلى كافة دول العالم.", visibility: "VISIBLE", order: 9 },
  { slug: "JOBS", nameEn: "CIAR Jobs & Housing", nameAr: "CiAr دليل شواغر التوظيف", descriptionEn: "Job vacancies, career search, and employee housing options.", descriptionAr: "دليل شواغر التوظيف والبحث عن العمل وسكن موظفين.", visibility: "VISIBLE", order: 10 },
  { slug: "ADS_MARKETING", nameEn: "CIAR Ads & Campaign Design", nameAr: "CiAr استضافة وتصميم الحملات الاعلانية", descriptionEn: "Hosting and design for full advertising campaigns.", descriptionAr: "استضافة وتصميم كافة الحملات الاعلانية.", visibility: "VISIBLE", order: 11 },
  { slug: "INVESTMENT", nameEn: "CIAR Platform Shares", nameAr: "CiAr أسهم المنصة والمكافآت", descriptionEn: "Internal member shares and rewards for the CIAR platform.", descriptionAr: "أسهم منصتنا الخاصة بالأعضاء والمكافآت.", visibility: "VISIBLE", order: 12 },
  { slug: "DELIVERY_SYSTEM", nameEn: "Delivery System", nameAr: "نظام التوصيل", descriptionEn: "Internal delivery orchestration tools.", descriptionAr: "أدوات داخلية لإدارة عمليات التوصيل.", visibility: "HIDDEN", order: 13 },
  { slug: "TAXI_SYSTEM", nameEn: "Taxi System", nameAr: "نظام التاكسي", descriptionEn: "Internal ride and fleet management.", descriptionAr: "إدارة الأسطول والرحلات داخلياً.", visibility: "HIDDEN", order: 14 },
  { slug: "INTERNAL_MANAGEMENT", nameEn: "Internal Management Tools", nameAr: "أدوات الإدارة الداخلية", descriptionEn: "Operational and administrative internal tooling.", descriptionAr: "أدوات تشغيل وإدارة داخلية.", visibility: "HIDDEN", order: 15 },
]

export const DEFAULT_BANNER_IMAGES = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80",
]

export const MODULE_BANNER_IMAGES: Record<string, [string, string, string]> = {
  FASHION: [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
  ],
  GLOBAL_PRODUCTS: [
    "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
  ],
  VIP: [
    "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1590548784585-643d2b9f2925?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1600&q=80",
  ],
  MALL: [
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=80",
  ],
  TOURISM: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1600&q=80",
  ],
  REAL_ESTATE: [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  ],
  CARS: [
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
  ],
  SERVICES: [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1600&q=80",
  ],
  SHIPPING: [
    "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1586528116493-b6f5b1f8b4d7?auto=format&fit=crop&w=1600&q=80",
  ],
  JOBS: [
    "https://images.unsplash.com/photo-1521790797524-b2497295b8a0?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1600&q=80",
  ],
  ADS_MARKETING: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=1600&q=80",
  ],
  INVESTMENT: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1461280360983-bd93eaa5051b?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1534951009808-766178b47a4f?auto=format&fit=crop&w=1600&q=80",
  ],
  DELIVERY_SYSTEM: [
    "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80",
  ],
  TAXI_SYSTEM: [
    "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
  ],
  INTERNAL_MANAGEMENT: [
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=80",
  ],
}
