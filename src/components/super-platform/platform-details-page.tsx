"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { ExternalLink, Image as ImageIcon, Layers3, Sparkles } from "lucide-react"

type PlatformModule = {
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
  } | null
}

export function PlatformDetailsPage({ slug }: { slug: string }) {
  const { locale } = useI18n()
  const { navigate } = useRouter()
  const activeLocale: "en" | "ar" = locale === "ar" ? "ar" : "en"
  const [module, setModule] = useState<PlatformModule | null>(null)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("/api/super-platform/modules")
        .then((r) => r.json())
        .then((d) => {
          const rows = Array.isArray(d.modules) ? d.modules : []
          const found = rows.find((m: PlatformModule) => m.slug.toLowerCase() === slug.toLowerCase())
          setModule(found || null)
        })
        .catch(() => setModule(null))
    }, 0)
    return () => clearTimeout(timer)
  }, [slug])

  const images = useMemo(() => {
    if (!module?.banner) return []
    return [module.banner.imageUrl1, module.banner.imageUrl2, module.banner.imageUrl3].filter(Boolean)
  }, [module])

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((s) => (images.length ? (s + 1) % images.length : 0))
    }, 3000)
    return () => clearInterval(interval)
  }, [images.length])

  const title = activeLocale === "ar" ? module?.banner?.titleAr || module?.nameAr : module?.banner?.titleEn || module?.nameEn
  const description =
    activeLocale === "ar"
      ? module?.banner?.descriptionAr || module?.descriptionAr
      : module?.banner?.descriptionEn || module?.descriptionEn
  const siteHref = module?.banner?.ctaHref || "#"

  if (!module) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center">
        <h1 className={`text-3xl font-bold ${activeLocale === "ar" ? "font-arabic-display" : ""}`}>
          {activeLocale === "ar" ? "القسم غير موجود" : "Section not found"}
        </h1>
        <Button className="mt-6" onClick={() => navigate({ page: "projects" })}>
          {activeLocale === "ar" ? "العودة إلى منصتنا" : "Back to platforms"}
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-[72vh] overflow-hidden bg-[oklch(0.10_0.025_265)]">
        {images.length > 0 && (
          <AnimatePresence mode="sync">
            <motion.img
              key={images[idx]}
              src={images[idx]}
              alt={title || module.slug}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            />
          </AnimatePresence>
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-6xl items-center px-4 py-16">
          <div className="space-y-6 text-white">
            <h1 className={`text-4xl font-bold sm:text-6xl ${activeLocale === "ar" ? "font-arabic-display" : ""}`}>
              {title}
            </h1>
            <p className="max-w-3xl text-lg text-white/90">{description}</p>
            <div className="flex flex-wrap gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`h-2 rounded-full transition-all ${i === idx ? "w-10 bg-primary" : "w-4 bg-white/40"}`}
                  onClick={() => setIdx(i)}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-3 pt-3">
              <Button className="btn-gold" onClick={() => navigate({ page: "projects" })}>
                {activeLocale === "ar" ? "العودة إلى منصتنا" : "Back to platforms"}
              </Button>
              <Button asChild className="btn-gold">
                <a href={siteHref} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {activeLocale === "ar" ? "زيارة الموقع" : "Visit website"}
                </a>
              </Button>
              {module.banner?.ctaHref && (
                <Button variant="outline" asChild>
                  <a href={module.banner.ctaHref} target="_blank" rel="noopener noreferrer">
                    {activeLocale === "ar" ? module.banner.ctaTextAr : module.banner.ctaTextEn}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-5">
            <div className="mb-3 inline-flex rounded-xl bg-primary/15 p-2 text-primary">
              <Layers3 className="h-5 w-5" />
            </div>
            <h3 className={`text-lg font-semibold ${activeLocale === "ar" ? "font-arabic-display" : ""}`}>
              {activeLocale === "ar" ? "قسم متكامل" : "Integrated Section"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeLocale === "ar" ? "تفاصيل شاملة وخبرة موحدة داخل منظومة CIAR." : "Complete details and unified experience inside CIAR ecosystem."}
            </p>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="mb-3 inline-flex rounded-xl bg-primary/15 p-2 text-primary">
              <ImageIcon className="h-5 w-5" />
            </div>
            <h3 className={`text-lg font-semibold ${activeLocale === "ar" ? "font-arabic-display" : ""}`}>
              {activeLocale === "ar" ? "معرض تفاعلي" : "Interactive Gallery"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeLocale === "ar" ? "ثلاث صور مميزة تعرض أهم ملامح المنصة." : "Three distinctive images highlight key platform value."}
            </p>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="mb-3 inline-flex rounded-xl bg-primary/15 p-2 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className={`text-lg font-semibold ${activeLocale === "ar" ? "font-arabic-display" : ""}`}>
              {activeLocale === "ar" ? "تصميم عصري" : "Modern Design"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeLocale === "ar" ? "واجهة حديثة مع حركة سلسة وتجربة فاخرة." : "Contemporary UI with smooth motion and premium feel."}
            </p>
          </div>
        </div>

        {images.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {images.map((img, i) => (
              <button
                key={`${img}-${i}`}
                type="button"
                onClick={() => setIdx(i)}
                className={`overflow-hidden rounded-2xl border transition-all ${i === idx ? "border-primary shadow-lg" : "border-border/40 opacity-85 hover:opacity-100"}`}
              >
                <img src={img} alt={`${title}-${i + 1}`} className="h-44 w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
