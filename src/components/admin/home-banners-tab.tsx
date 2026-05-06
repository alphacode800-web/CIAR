"use client"

import { useEffect, useState } from "react"
import { Clapperboard, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type FormState = {
  nav: {
    logoType: "image" | "video"
    logoUrl: string
    logoVideoUrl: string
    logoAltAr: string
    logoAltEn: string
  }
  hero: {
    titleAr: string
    titleEn: string
    subtitleAr: string
    subtitleEn: string
    ctaPrimaryAr: string
    ctaPrimaryEn: string
    ctaPrimaryHref: string
    ctaSecondaryAr: string
    ctaSecondaryEn: string
    ctaSecondaryHref: string
    backgroundType: "image" | "video"
    videoUrl: string
    videoPoster: string
    imageSlides: string[]
  }
  newsTickerItemsText: string
}

const emptySlides = Array.from({ length: 20 }, () => "")

const DEFAULT_STATE: FormState = {
  nav: {
    logoType: "image",
    logoUrl: "",
    logoVideoUrl: "",
    logoAltAr: "CIAR",
    logoAltEn: "CIAR",
  },
  hero: {
    titleAr: "",
    titleEn: "",
    subtitleAr: "",
    subtitleEn: "",
    ctaPrimaryAr: "",
    ctaPrimaryEn: "",
    ctaPrimaryHref: "projects",
    ctaSecondaryAr: "",
    ctaSecondaryEn: "",
    ctaSecondaryHref: "about",
    backgroundType: "image",
    videoUrl: "",
    videoPoster: "",
    imageSlides: emptySlides,
  },
  newsTickerItemsText: "",
}

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(String(url || "").trim())

export function HomeBannersTab() {
  const [state, setState] = useState<FormState>(DEFAULT_STATE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const tickerItems = state.newsTickerItemsText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
  const activeHeroSlides = state.hero.imageSlides.map((item) => item.trim()).filter(Boolean)
  const configuredHeroSlides = state.hero.imageSlides
    .map((item, index) => ({ index: index + 1, url: item.trim() }))
    .filter((item) => item.url.length > 0)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/admin/home-banners")
        const data = await res.json()
        const config = data?.config
        if (!config) throw new Error("Invalid payload")
        const settingsMap = data?.settings && typeof data.settings === "object" ? data.settings : {}
        setState({
          nav: {
            logoType: config.nav.logoType === "video" ? "video" : "image",
            logoUrl: String(config.nav.logoUrl || ""),
            logoVideoUrl: String(config.nav.logoVideoUrl || ""),
            logoAltAr: String(config.nav.logoAlt?.ar || "CIAR"),
            logoAltEn: String(config.nav.logoAlt?.en || "CIAR"),
          },
          hero: {
            titleAr: String(config.hero.title?.ar || ""),
            titleEn: String(config.hero.title?.en || ""),
            subtitleAr: String(config.hero.subtitle?.ar || ""),
            subtitleEn: String(config.hero.subtitle?.en || ""),
            ctaPrimaryAr: String(config.hero.ctaPrimary?.ar || ""),
            ctaPrimaryEn: String(config.hero.ctaPrimary?.en || ""),
            ctaPrimaryHref: String(config.hero.ctaPrimaryHref || "projects"),
            ctaSecondaryAr: String(config.hero.ctaSecondary?.ar || ""),
            ctaSecondaryEn: String(config.hero.ctaSecondary?.en || ""),
            ctaSecondaryHref: String(config.hero.ctaSecondaryHref || "about"),
            backgroundType: config.hero.backgroundType === "video" ? "video" : "image",
            videoUrl: String(config.hero.backgroundVideoUrl || ""),
            videoPoster: String(config.hero.backgroundVideoPoster || ""),
            imageSlides: Array.from({ length: 20 }, (_, index) =>
              String(settingsMap[`home_hero_image_${index + 1}`] || config.hero.imageSlides?.[index] || "")
            ),
          },
          newsTickerItemsText: Array.isArray(config.newsTickerItems) ? config.newsTickerItems.join("\n") : "",
        })
      } catch {
        toast.error("تعذر تحميل إعدادات بنرات الصفحة الرئيسية")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const save = async () => {
    const tickerItems = state.newsTickerItemsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)

    if (tickerItems.length === 0) {
      toast.error("أدخل عنصرًا واحدًا على الأقل في الشريط الإخباري")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/home-banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nav: state.nav,
          hero: state.hero,
          newsTickerItems: tickerItems,
        }),
      })
      if (!res.ok) throw new Error("Save failed")
      toast.success("تم حفظ إعدادات بنرات الصفحة الرئيسية")
    } catch {
      toast.error("فشل حفظ إعدادات بنرات الصفحة الرئيسية")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[oklch(0.76_0.19_48)]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold gradient-text">
          <Clapperboard className="h-6 w-6 text-[oklch(0.76_0.19_48)]" />
          بنرات الصفحة الرئيسية
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          تحكم باللوجو، نصوص الهيرو، الخلفية (صورة/فيديو)، الشريط الإخباري وصور السلايدر.
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-border/40 bg-card/30 p-4">
        <h3 className="text-sm font-semibold">معاينة البنرات الحالية</h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border/40 bg-background/40 p-3">
            <p className="mb-2 text-xs text-muted-foreground">بنر اللوجو</p>
            <div className="flex min-h-24 items-center justify-center rounded-lg border border-border/30 bg-black/30 p-3">
              {state.nav.logoType === "video" && state.nav.logoVideoUrl ? (
                <video src={state.nav.logoVideoUrl} className="h-16 w-16 rounded object-cover" autoPlay muted loop playsInline />
              ) : state.nav.logoUrl ? (
                <img src={state.nav.logoUrl} alt={state.nav.logoAltAr || "CIAR"} className="h-16 w-16 object-contain" />
              ) : (
                <span className="text-xs text-muted-foreground">لا يوجد لوجو محدد</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-background/40 p-3">
            <p className="mb-2 text-xs text-muted-foreground">بنر الشريط الإخباري</p>
            <div className="min-h-24 rounded-lg border border-border/30 bg-black/60 p-3">
              <div className="mb-2 inline-flex rounded bg-[oklch(0.78_0.14_82/22%)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                News
              </div>
              <p className="line-clamp-2 text-sm text-white/90">
                {tickerItems.length > 0 ? tickerItems.join(" • ") : "لا توجد عناصر حالياً"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-background/40 p-3">
          <p className="mb-2 text-xs text-muted-foreground">بنر Hero</p>
          <div className="relative min-h-52 overflow-hidden rounded-lg border border-border/30">
            {state.hero.backgroundType === "video" && state.hero.videoUrl ? (
              <video
                src={state.hero.videoUrl}
                poster={state.hero.videoPoster || undefined}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : activeHeroSlides[0] ? (
              <img src={activeHeroSlides[0]} alt="Hero preview" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-black/40" />
            )}
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative z-10 space-y-2 p-4 text-white">
              <h4 className="text-base font-semibold">{state.hero.titleAr || state.hero.titleEn || "عنوان بنر Hero"}</h4>
              <p className="text-sm text-white/85">{state.hero.subtitleAr || state.hero.subtitleEn || "وصف بنر Hero"}</p>
              <div className="flex gap-2">
                <span className="rounded bg-[oklch(0.78_0.14_82)] px-3 py-1 text-xs text-black">
                  {state.hero.ctaPrimaryAr || state.hero.ctaPrimaryEn || "CTA 1"}
                </span>
                <span className="rounded border border-white/60 px-3 py-1 text-xs">
                  {state.hero.ctaSecondaryAr || state.hero.ctaSecondaryEn || "CTA 2"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/40 bg-card/30 p-4">
        <h3 className="text-sm font-semibold">بنر الهيدر / اللوجو</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>نوع اللوجو</Label>
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={state.nav.logoType}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  nav: { ...prev.nav, logoType: e.target.value === "video" ? "video" : "image" },
                }))
              }
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>رابط صورة اللوجو</Label>
            <Input
              value={state.nav.logoUrl}
              onChange={(e) => setState((prev) => ({ ...prev, nav: { ...prev.nav, logoUrl: e.target.value } }))}
            />
          </div>
          <div className="space-y-1">
            <Label>رابط فيديو اللوجو</Label>
            <Input
              value={state.nav.logoVideoUrl}
              onChange={(e) =>
                setState((prev) => ({ ...prev, nav: { ...prev.nav, logoVideoUrl: e.target.value } }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Alt عربي</Label>
            <Input
              value={state.nav.logoAltAr}
              onChange={(e) => setState((prev) => ({ ...prev, nav: { ...prev.nav, logoAltAr: e.target.value } }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Alt English</Label>
            <Input
              value={state.nav.logoAltEn}
              onChange={(e) => setState((prev) => ({ ...prev, nav: { ...prev.nav, logoAltEn: e.target.value } }))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/40 bg-card/30 p-4">
        <h3 className="text-sm font-semibold">بنر Hero</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>العنوان (AR)</Label>
            <Input
              value={state.hero.titleAr}
              onChange={(e) => setState((prev) => ({ ...prev, hero: { ...prev.hero, titleAr: e.target.value } }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Title (EN)</Label>
            <Input
              value={state.hero.titleEn}
              onChange={(e) => setState((prev) => ({ ...prev, hero: { ...prev.hero, titleEn: e.target.value } }))}
            />
          </div>
          <div className="space-y-1">
            <Label>الوصف (AR)</Label>
            <Input
              value={state.hero.subtitleAr}
              onChange={(e) => setState((prev) => ({ ...prev, hero: { ...prev.hero, subtitleAr: e.target.value } }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Subtitle (EN)</Label>
            <Input
              value={state.hero.subtitleEn}
              onChange={(e) => setState((prev) => ({ ...prev, hero: { ...prev.hero, subtitleEn: e.target.value } }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            value={state.hero.ctaPrimaryAr}
            onChange={(e) => setState((prev) => ({ ...prev, hero: { ...prev.hero, ctaPrimaryAr: e.target.value } }))}
            placeholder="CTA1 AR"
          />
          <Input
            value={state.hero.ctaPrimaryEn}
            onChange={(e) => setState((prev) => ({ ...prev, hero: { ...prev.hero, ctaPrimaryEn: e.target.value } }))}
            placeholder="CTA1 EN"
          />
          <Input
            value={state.hero.ctaPrimaryHref}
            onChange={(e) => setState((prev) => ({ ...prev, hero: { ...prev.hero, ctaPrimaryHref: e.target.value } }))}
            placeholder="projects | about | contact"
          />
          <Input
            value={state.hero.ctaSecondaryAr}
            onChange={(e) =>
              setState((prev) => ({ ...prev, hero: { ...prev.hero, ctaSecondaryAr: e.target.value } }))
            }
            placeholder="CTA2 AR"
          />
          <Input
            value={state.hero.ctaSecondaryEn}
            onChange={(e) =>
              setState((prev) => ({ ...prev, hero: { ...prev.hero, ctaSecondaryEn: e.target.value } }))
            }
            placeholder="CTA2 EN"
          />
          <Input
            value={state.hero.ctaSecondaryHref}
            onChange={(e) =>
              setState((prev) => ({ ...prev, hero: { ...prev.hero, ctaSecondaryHref: e.target.value } }))
            }
            placeholder="projects | about | contact"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>نوع خلفية Hero</Label>
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={state.hero.backgroundType}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, backgroundType: e.target.value === "video" ? "video" : "image" },
                }))
              }
            >
              <option value="image">Image Slides</option>
              <option value="video">Single Video</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>رابط فيديو الخلفية</Label>
            <Input
              value={state.hero.videoUrl}
              onChange={(e) => setState((prev) => ({ ...prev, hero: { ...prev.hero, videoUrl: e.target.value } }))}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Poster للفيديو (اختياري)</Label>
            <Input
              value={state.hero.videoPoster}
              onChange={(e) =>
                setState((prev) => ({ ...prev, hero: { ...prev.hero, videoPoster: e.target.value } }))
              }
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/40 bg-card/30 p-4">
        <h3 className="text-sm font-semibold">صور Hero (20 صورة)</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {state.hero.imageSlides.map((item, index) => (
            <Input
              key={`hero-slide-${index + 1}`}
              value={item}
              onChange={(e) =>
                setState((prev) => {
                  const next = [...prev.hero.imageSlides]
                  next[index] = e.target.value
                  return { ...prev, hero: { ...prev.hero, imageSlides: next } }
                })
              }
              placeholder={`Hero image ${index + 1}`}
            />
          ))}
        </div>
        {configuredHeroSlides.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/50 bg-background/40 p-4 text-center text-sm text-muted-foreground">
            لا توجد بنرات Hero مضبوطة حاليًا. أضف روابط الصور أعلاه ثم احفظ.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {configuredHeroSlides.map((slide) => (
              <div key={`hero-preview-${slide.index}`} className="rounded-lg border border-border/40 bg-background/40 p-2">
                <p className="mb-1 text-[11px] text-muted-foreground">Banner {slide.index}</p>
                {isVideoUrl(slide.url) ? (
                  <video src={slide.url} className="h-20 w-full rounded object-cover" controls muted playsInline />
                ) : (
                  <img src={slide.url} alt={`hero-${slide.index}`} className="h-20 w-full rounded object-cover" />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2 rounded-xl border border-border/40 bg-card/30 p-4">
        <h3 className="text-sm font-semibold">الشريط الإخباري</h3>
        <p className="text-xs text-muted-foreground">كل سطر = عنصر واحد في الشريط الإخباري.</p>
        <Textarea
          className="min-h-36"
          value={state.newsTickerItemsText}
          onChange={(e) => setState((prev) => ({ ...prev, newsTickerItemsText: e.target.value }))}
        />
      </section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2 btn-gold">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ كل بنرات الصفحة الرئيسية
        </Button>
      </div>
    </div>
  )
}

export default HomeBannersTab
