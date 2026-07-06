"use client"

import { useEffect, useState } from "react"
import { Building2, Eye, Loader2, Save, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"
import {
  DEFAULT_ABOUT_COMPANY_INTRO,
  aboutTitleStyleToCss,
  aboutTextStyleToCss,
  type AboutCompanyIntro,
  type AboutIntroStyle,
  type AboutTextStyle,
} from "@/lib/about-content"
import { NEWS_TICKER_FONT_OPTIONS, NEWS_TICKER_WEIGHT_OPTIONS } from "@/lib/news-ticker"

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const safe = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : "#ffffff"

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-3">
        <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-border">
          <input
            type="color"
            value={safe}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer border-0 p-0"
          />
        </label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-10 font-mono text-sm" dir="ltr" />
      </div>
    </div>
  )
}

function TextStyleFields({
  label,
  value,
  onChange,
  showLineHeight,
}: {
  label: string
  value: AboutTextStyle & { lineHeight?: number }
  onChange: (value: AboutTextStyle & { lineHeight?: number }) => void
  showLineHeight?: boolean
}) {
  return (
    <div className="space-y-4 rounded-xl border border-border/40 bg-muted/10 p-4">
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField label="اللون" value={value.color} onChange={(color) => onChange({ ...value, color })} />
        <div className="space-y-2">
          <Label className="text-sm font-medium">الخط</Label>
          <Select
            value={value.fontFamily}
            onValueChange={(fontFamily) =>
              onChange({ ...value, fontFamily: fontFamily as AboutTextStyle["fontFamily"] })
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NEWS_TICKER_FONT_OPTIONS.map((font) => (
                <SelectItem key={font.key} value={font.key}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">حجم الخط ({value.fontSize}px)</Label>
          <Slider
            value={[value.fontSize]}
            min={12}
            max={48}
            step={1}
            onValueChange={([fontSize]) => onChange({ ...value, fontSize })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">سُمك الخط</Label>
          <Select
            value={String(value.fontWeight)}
            onValueChange={(weight) =>
              onChange({ ...value, fontWeight: Number(weight) as AboutTextStyle["fontWeight"] })
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NEWS_TICKER_WEIGHT_OPTIONS.map((weight) => (
                <SelectItem key={weight.value} value={String(weight.value)}>
                  {weight.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {showLineHeight ? (
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-sm font-medium">ارتفاع السطر ({value.lineHeight?.toFixed(2)})</Label>
            <Slider
              value={[value.lineHeight ?? 1.75]}
              min={1.2}
              max={2.4}
              step={0.05}
              onValueChange={([lineHeight]) => onChange({ ...value, lineHeight })}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function AboutContentTab() {
  const { t } = useI18n()
  const [intro, setIntro] = useState<AboutCompanyIntro>(DEFAULT_ABOUT_COMPANY_INTRO)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/about-content")
        const data = await res.json()
        if (data?.intro) {
          setIntro({
            ...DEFAULT_ABOUT_COMPANY_INTRO,
            ...data.intro,
            style: { ...DEFAULT_ABOUT_COMPANY_INTRO.style, ...(data.intro.style || {}) },
          })
        }
      } catch {
        setIntro(DEFAULT_ABOUT_COMPANY_INTRO)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const updateStyle = (patch: Partial<AboutIntroStyle>) => {
    setIntro((prev) => ({ ...prev, style: { ...prev.style, ...patch } }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/about-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intro }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(typeof data?.error === "string" ? data.error : "فشل الحفظ")
      }
      const data = await res.json()
      if (data?.intro) setIntro(data.intro)
      toast.success("تم حفظ النص التعريفي")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الحفظ")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold gradient-text">
            <Building2 className="h-6 w-6 text-primary" />
            {t("admin.about_content") || "محتوى من نحن"}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("admin.about_content_desc") ||
              "تحكم في النص التعريفي للشركة الذي يظهر في صفحة «عن CIAR» تحت عنوان «قيمنا»."}
          </p>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التغييرات
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-border/40 bg-card/30 p-4">
              <Label htmlFor="about-intro-ar">النص التعريفي (عربي)</Label>
              <Textarea
                id="about-intro-ar"
                value={intro.ar}
                onChange={(e) => setIntro((prev) => ({ ...prev, ar: e.target.value }))}
                rows={8}
                placeholder="اكتب نبذة تعريفية عن الشركة..."
                className="min-h-[180px] resize-y leading-relaxed"
              />
              <p className="text-xs text-muted-foreground">{intro.ar.length} / 2000 حرف</p>
            </div>

            <div className="space-y-2 rounded-xl border border-border/40 bg-card/30 p-4">
              <Label htmlFor="about-intro-en">النص التعريفي (إنجليزي)</Label>
              <Textarea
                id="about-intro-en"
                value={intro.en}
                onChange={(e) => setIntro((prev) => ({ ...prev, en: e.target.value }))}
                rows={8}
                placeholder="Write the company intro in English..."
                dir="ltr"
                className="min-h-[180px] resize-y leading-relaxed"
              />
              <p className="text-xs text-muted-foreground">{intro.en.length} / 2000 حرف</p>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/40 bg-card/30 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Type className="h-4 w-4 text-primary" />
              الخطوط والألوان
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>عنوان القسم (عربي)</Label>
                <Input
                  value={intro.style.sectionTitle.ar}
                  onChange={(e) =>
                    updateStyle({ sectionTitle: { ...intro.style.sectionTitle, ar: e.target.value } })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>عنوان القسم (English)</Label>
                <Input
                  value={intro.style.sectionTitle.en}
                  onChange={(e) =>
                    updateStyle({ sectionTitle: { ...intro.style.sectionTitle, en: e.target.value } })
                  }
                  dir="ltr"
                />
              </div>
            </div>

            <TextStyleFields
              label="نمط العنوان"
              value={intro.style.title}
              onChange={(title) => updateStyle({ title: { ...intro.style.title, ...title } })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={intro.style.title.useGradient}
                  onCheckedChange={(useGradient) =>
                    updateStyle({ title: { ...intro.style.title, useGradient } })
                  }
                />
                <Label>تدرج لوني للعنوان</Label>
              </div>
              <ColorField
                label="لون التدرج / البارز"
                value={intro.style.title.accentColor}
                onChange={(accentColor) => updateStyle({ title: { ...intro.style.title, accentColor } })}
              />
            </div>

            <TextStyleFields
              label="نمط النص التعريفي"
              value={intro.style.body}
              onChange={(body) => updateStyle({ body: { ...intro.style.body, ...body } })}
              showLineHeight
            />
          </section>
        </div>

        <section className="space-y-3 xl:sticky xl:top-24 xl:self-start">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Eye className="h-4 w-4 text-primary" />
            معاينة (عربي)
          </div>
          <div className="rounded-xl border border-border/30 bg-background/40 p-5 text-center">
            <h3 style={aboutTitleStyleToCss(intro.style.title)}>
              {intro.style.sectionTitle.ar || "قيمنا"}
            </h3>
            <p
              className="mx-auto mt-3 max-w-3xl"
              style={{
                ...aboutTextStyleToCss(intro.style.body),
                lineHeight: intro.style.body.lineHeight,
              }}
            >
              {intro.ar || DEFAULT_ABOUT_COMPANY_INTRO.ar}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
