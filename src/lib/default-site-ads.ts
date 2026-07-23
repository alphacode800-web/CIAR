import type { AdPlacement, AdPosition, SiteAdRecord } from "@/lib/site-ads"
import type { AdProductDetails } from "@/lib/ad-product-details"

const adUnsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=75`

function buildDefaultAd(input: {
  id: string
  companyName: string
  title: string
  description: string
  link: string
  imageUrl: string
  placement: AdPlacement
  position: AdPosition
  productDetails?: AdProductDetails
}): SiteAdRecord {
  const now = new Date()
  const startsAt = new Date(now)
  startsAt.setDate(startsAt.getDate() - 14)
  const startsIso = startsAt.toISOString()
  const endsAt = new Date(now)
  endsAt.setFullYear(endsAt.getFullYear() + 1)

  return {
    id: input.id,
    companyName: input.companyName,
    title: input.title,
    description: input.description,
    link: input.link,
    imageUrl: input.imageUrl,
    placement: input.placement,
    position: input.position,
    durationDays: 365,
    startsAt: startsIso,
    endsAt: endsAt.toISOString(),
    status: "active",
    locale: "ar",
    createdAt: startsIso,
    updatedAt: now.toISOString(),
    isDefault: true,
    productDetails: input.productDetails,
  }
}

/** إعلانات افتراضية تُعرض عند غياب إعلانات منشورة لنفس الموضع */
export const DEFAULT_SITE_ADS: SiteAdRecord[] = [
  buildDefaultAd({
    id: "default-ad-home-after-platforms",
    companyName: "CIAR Fashion",
    title: "أزياء عالمية بأسعار تنافسية",
    description: "تسوّق أحدث الموديلات من موردين موثوقين عبر منصة الأزياء في CIAR.",
    link: "/#/projects",
    imageUrl: adUnsplash("1445205170230-053b83016050"),
    placement: "home_after_platforms",
    position: "slot_1",
    productDetails: {
      listingType: "fashion",
      brand: "CIAR Demo",
      price: 349,
      currency: "SAR",
      sizes: ["S", "M", "L", "XL"],
      colors: ["أسود", "كحلي"],
      fabricTypes: ["مخمل"],
    },
  }),
  buildDefaultAd({
    id: "default-ad-home-before-why",
    companyName: "CIAR Global Shipping",
    title: "شحن عالمي سريع وآمن",
    description: "وصّل بضائعك إلى أكثر من 50 دولة بأسعار شفافة وتتبع لحظي للشحنات.",
    link: "/#/projects",
    imageUrl: adUnsplash("1586528116311-ad8dd3c8310d"),
    placement: "home_before_why",
    position: "slot_2",
  }),
  buildDefaultAd({
    id: "default-ad-projects-top",
    companyName: "CIAR Real Estate",
    title: "فرص عقارية مميزة في مكان واحد",
    description: "شقق، فلل، وأراضٍ استثمارية مع فلترة ذكية ودعم كامل من فريق CIAR.",
    link: "/#/projects",
    imageUrl: adUnsplash("1560518883-ce09059eeffa"),
    placement: "projects_top",
    position: "slot_1",
  }),
  buildDefaultAd({
    id: "default-ad-platform-details",
    companyName: "CIAR VIP",
    title: "خدمات VIP حصرية لعملائنا",
    description: "استشارات مخصصة، أولوية في الدعم، وعروض خاصة على المنصات المميزة.",
    link: "/#/advertise",
    imageUrl: adUnsplash("1544191693-867a14dca8cf"),
    placement: "platform_details",
    position: "slot_1",
  }),
  buildDefaultAd({
    id: "default-ad-home-promo",
    companyName: "CIAR Ads & Marketing",
    title: "أعلن منصتك أمام آلاف الزوار",
    description: "اختر موضع الإعلان والمدة المناسبة وابدأ حملتك التسويقية خلال دقائق.",
    link: "/#/advertise",
    imageUrl: adUnsplash("1460925895917-afdab827c52f"),
    placement: "home_after_platforms",
    position: "slot_2",
  }),
  buildDefaultAd({
    id: "default-ad-projects-promo",
    companyName: "CIAR Mall",
    title: "افتتح متجرك الإلكتروني اليوم",
    description: "منصة تسوق متكاملة مع دفع آمن وإدارة مخزون ولوحة تحكم للبائعين.",
    link: "/#/advertise",
    imageUrl: adUnsplash("1441986300917-64674bd600d8"),
    placement: "projects_top",
    position: "slot_2",
  }),
]

/** Demo fashion ads — always available for virtual fitting room trials on #/ads */
export const DEFAULT_FASHION_DEMO_ADS: SiteAdRecord[] = [
  buildDefaultAd({
    id: "demo-fashion-abaya",
    companyName: "CIAR Fashion Demo",
    title: "عباءة مخملية فاخرة",
    description: "عباءة أنيقة للتجربة في غرفة القياس الافتراضية — قماش ناعم وتصميم عصري.",
    link: "/#/ads",
    imageUrl: adUnsplash("1483985988355-763728e1935b"),
    placement: "platform_details",
    position: "slot_1",
    productDetails: {
      listingType: "fashion",
      brand: "CIAR Demo",
      price: 429,
      currency: "SAR",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["أسود", "بيج"],
      fabricTypes: ["مخمل", "حرير"],
    },
  }),
  buildDefaultAd({
    id: "demo-fashion-dress",
    companyName: "CIAR Fashion Demo",
    title: "فستان سهرة عصري",
    description: "فستان بلون جذاب — جرّب مقاسك افتراضياً قبل الطلب.",
    link: "/#/ads",
    imageUrl: adUnsplash("1515886656123-9f3515b0a78d"),
    placement: "platform_details",
    position: "slot_2",
    productDetails: {
      listingType: "fashion",
      brand: "CIAR Demo",
      price: 599,
      currency: "SAR",
      sizes: ["XS", "S", "M", "L"],
      colors: ["أحمر", "أزرق داكن"],
      fabricTypes: ["شифون"],
    },
  }),
  buildDefaultAd({
    id: "demo-fashion-blazer",
    companyName: "CIAR Fashion Demo",
    title: "بلazer رجالي كلاسيك",
    description: "سترة رسمية أنيقة — مثالية لتجربة القياس الافتراضي للرجال.",
    link: "/#/ads",
    imageUrl: adUnsplash("1594935197842-48a48754b58d"),
    placement: "projects_top",
    position: "slot_1",
    productDetails: {
      listingType: "fashion",
      brand: "CIAR Demo",
      price: 749,
      currency: "SAR",
      sizes: ["48", "50", "52", "54"],
      colors: ["رمادي", "كحلي"],
      fabricTypes: ["صوف", "بوليester"],
    },
  }),
  buildDefaultAd({
    id: "demo-fashion-thobe",
    companyName: "CIAR Fashion Demo",
    title: "ثوب سعودي فاخر",
    description: "ثوب بأقمشة صيفية مريحة — جرّب القصة والمقاس على صورتك.",
    link: "/#/ads",
    imageUrl: adUnsplash("1490481651871-ab68de25d43d"),
    placement: "projects_top",
    position: "slot_2",
    productDetails: {
      listingType: "fashion",
      brand: "CIAR Demo",
      price: 389,
      currency: "SAR",
      sizes: ["54", "56", "58", "60"],
      colors: ["أبيض", "أوف-white"],
      fabricTypes: ["قطن مصري"],
    },
  }),
  buildDefaultAd({
    id: "demo-fashion-jacket",
    companyName: "CIAR Fashion Demo",
    title: "جاكيت نسائي شتوي",
    description: "جacket دافئ بتصميم عصري — اختبر مظهرك مع القياس بالذكاء الاصطناعي.",
    link: "/#/ads",
    imageUrl: adUnsplash("1487412720507-e7ab37603c6f"),
    placement: "home_before_why",
    position: "slot_1",
    productDetails: {
      listingType: "fashion",
      brand: "CIAR Demo",
      price: 499,
      currency: "SAR",
      sizes: ["S", "M", "L"],
      colors: ["بني", "أسود"],
      fabricTypes: ["جلد صناعي", "صوف"],
    },
  }),
]

export function isDefaultSiteAd(ad: SiteAdRecord): boolean {
  return Boolean(ad.isDefault) || ad.id.startsWith("default-ad-") || ad.id.startsWith("demo-fashion-")
}

export function getDefaultFashionDemoAds(locale?: string): SiteAdRecord[] {
  const now = new Date()
  return DEFAULT_FASHION_DEMO_ADS.filter((ad) => {
    if (ad.status !== "active") return false
    if (new Date(ad.endsAt) < now) return false
    if (locale && ad.locale !== locale && ad.locale !== "ar") return false
    return true
  })
}

export function getDefaultSiteAdsForSlot(input?: {
  placement?: AdPlacement
  position?: AdPosition
  locale?: string
}): SiteAdRecord[] {
  const now = new Date()
  return DEFAULT_SITE_ADS.filter((ad) => {
    if (ad.status !== "active") return false
    if (new Date(ad.endsAt) < now) return false
    if (input?.placement && ad.placement !== input.placement) return false
    if (input?.position && ad.position !== input.position) return false
    if (input?.locale && ad.locale !== input.locale && ad.locale !== "ar") return false
    return true
  }).sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
}

export function buildDefaultSiteAds(): SiteAdRecord[] {
  return DEFAULT_SITE_ADS.map((ad) => ({ ...ad }))
}
