"use client"

import { useEffect, useState } from "react"
import { Building2, Eye, FileText, Loader2, Save, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { TypographyStyleFields, ColorField } from "@/components/admin/typography-style-fields"
import {
  DEFAULT_HOME_ABOUT_BRIEF,
  pickLocalized,
  type HomeAboutBriefConfig,
  type LocalizedText,
} from "@/lib/home-about-brief"
import { textStyleToCss, titleStyleToCss } from "@/lib/text-style"

function LocalizedField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string
  value: LocalizedText
  onChange: (value: LocalizedText) => void
  multiline?: boolean
}) {
  const Field = multiline ? Textarea : Input
  return (
    <div className="space-y-2 rounded-xl border border-border/40 bg-muted/10 p-4">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">العربية</Label>
          <Field
            value={value.ar}
            onChange={(e) => onChange({ ...value, ar: e.target.value })}
            className={multiline ? "min-h-[88px] resize-y" : "h-10"}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">English</Label>
          <Field
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            className={multiline ? "min-h-[88px] resize-y" : "h-10"}
            dir="ltr"
          />
        </div>
      </div>
    </div>
  )
}

function AboutBriefPreview({ config }: { config: HomeAboutBriefConfig }) {
  const locale: "ar" | "en" = "ar"
  const titleStyle = config.style.title.useGradient
    ? titleStyleToCss(config.style.title)
    : textStyleToCss(config.style.title)

  return (
    <div className="rounded-2xl border border-border/50 bg-[oklch(0.10_0.025_265)] p-5">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 text-start">
          <span style={textStyleToCss(config.style.label)}>{pickLocalized(config.content.label, locale)}</span>
          <h3 className="font-bold leading-tight" style={titleStyle}>
            {pickLocalized(config.content.title, locale)}
          </h3>
          <p
            style={{
              ...textStyleToCss(config.style.description),
              lineHeight: config.style.description.lineHeight,
            }}
          >
            {pickLocalized(config.content.description, locale)}
          </p>
          <span
            className="inline-flex rounded-xl px-4 py-2 btn-gold"
            style={textStyleToCss(config.style.cta)}
          >
            {pickLocalized(config.content.cta, locale)}
          </span>
        </div>
        <div className="rounded-2xl border border-[oklch(0.78_0.14_82/15%)] bg-muted/10 p-5 text-center">
          <h4 style={textStyleToCss(config.style.cardTitle)}>{pickLocalized(config.content.cardTitle, locale)}</h4>
          <p
            className="mt-2"
            style={{
              ...textStyleToCss(config.style.cardDescription),
              lineHeight: config.style.cardDescription.lineHeight,
            }}
          >
            {pickLocalized(config.content.cardDescription, locale)}
          </p>
          <div className="mt-4 flex justify-center gap-6">
            {config.content.stats.map((stat) => (
              <div key={stat.value + stat.label.ar}>
                <div style={textStyleToCss(config.style.statValue)}>{stat.value}</div>
                <div style={textStyleToCss(config.style.statLabel)}>{pickLocalized(stat.label, locale)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function HomeAboutBriefTab() {
  const [config, setConfig] = useState<HomeAboutBriefConfig>(DEFAULT_HOME_ABOUT_BRIEF)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/home-about-brief", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.config) setConfig(data.config)
      })
      .catch(() => setConfig(DEFAULT_HOME_ABOUT_BRIEF))
      .finally(() => setLoading(false))
  }, [])

  const updateContent = <K extends keyof HomeAboutBriefConfig["content"]>(
    key: K,
    value: HomeAboutBriefConfig["content"][K]
  ) => {
    setConfig((prev) => ({ ...prev, content: { ...prev.content, [key]: value } }))
  }

  const updateStyle = <K extends keyof HomeAboutBriefConfig["style"]>(
    key: K,
    value: HomeAboutBriefConfig["style"][K]
  ) => {
    setConfig((prev) => ({ ...prev, style: { ...prev.style, [key]: value } }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/home-about-brief", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ config }),
      })
      if (!res.ok) throw new Error("save failed")
      const data = await res.json()
      if (data?.config) setConfig(data.config)
      toast.success("تم حفظ قسم «نبذة عن CIAR»")
    } catch {
      toast.error("فشل حفظ القسم")
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
            نبذة عن CIAR — الصفحة الرئيسية
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            تحكم بنصوص وألوان وخطوط قسم «عن CIAR» في الصفحة الرئيسية (العنوان، الوصف، البطاقة، والإحصائيات).
          </p>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2 rounded-full btn-gold">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التغييرات
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-border/40 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-primary" />
              النصوص
            </div>
            <LocalizedField label="الشارة الصغيرة" value={config.content.label} onChange={(label) => updateContent("label", label)} />
            <LocalizedField label="العنوان الرئيسي" value={config.content.title} onChange={(title) => updateContent("title", title)} />
            <LocalizedField label="الوصف" value={config.content.description} onChange={(description) => updateContent("description", description)} multiline />
            <LocalizedField label="زر الدعوة (CTA)" value={config.content.cta} onChange={(cta) => updateContent("cta", cta)} />
            <LocalizedField label="عنوان البطاقة" value={config.content.cardTitle} onChange={(cardTitle) => updateContent("cardTitle", cardTitle)} />
            <LocalizedField label="وصف البطاقة" value={config.content.cardDescription} onChange={(cardDescription) => updateContent("cardDescription", cardDescription)} multiline />
          </section>

          <section className="space-y-4 rounded-2xl border border-border/40 p-4">
            <Label className="text-sm font-semibold">الإحصائيات (3)</Label>
            {config.content.stats.map((stat, index) => (
              <div key={index} className="space-y-3 rounded-xl border border-border/30 bg-muted/10 p-4">
                <Label className="text-sm font-medium">إحصائية {index + 1}</Label>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">القيمة (مثل 50K+)</Label>
                  <Input
                    value={stat.value}
                    onChange={(e) => {
                      const stats = [...config.content.stats] as HomeAboutBriefConfig["content"]["stats"]
                      stats[index] = { ...stats[index], value: e.target.value }
                      updateContent("stats", stats)
                    }}
                    dir="ltr"
                    className="h-10 font-mono"
                  />
                </div>
                <LocalizedField
                  label="التسمية"
                  value={stat.label}
                  onChange={(label) => {
                    const stats = [...config.content.stats] as HomeAboutBriefConfig["content"]["stats"]
                    stats[index] = { ...stats[index], label }
                    updateContent("stats", stats)
                  }}
                />
              </div>
            ))}
          </section>

          <section className="space-y-4 rounded-2xl border border-border/40 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Type className="h-4 w-4 text-primary" />
              الخطوط والألوان
            </div>
            <TypographyStyleFields label="نمط الشارة" value={config.style.label} onChange={(label) => updateStyle("label", { ...config.style.label, ...label })} />
            <TypographyStyleFields label="نمط العنوان" value={config.style.title} onChange={(title) => updateStyle("title", { ...config.style.title, ...title })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={config.style.title.useGradient}
                  onCheckedChange={(useGradient) => updateStyle("title", { ...config.style.title, useGradient })}
                />
                <Label>تدرج لوني للعنوان</Label>
              </div>
              <ColorField
                label="لون التدرج"
                value={config.style.title.accentColor}
                onChange={(accentColor) => updateStyle("title", { ...config.style.title, accentColor })}
              />
            </div>
            <TypographyStyleFields label="نمط الوصف" value={config.style.description} onChange={(description) => updateStyle("description", { ...config.style.description, ...description })} showLineHeight />
            <TypographyStyleFields label="نمط زر CTA" value={config.style.cta} onChange={(cta) => updateStyle("cta", { ...config.style.cta, ...cta })} />
            <TypographyStyleFields label="نمط عنوان البطاقة" value={config.style.cardTitle} onChange={(cardTitle) => updateStyle("cardTitle", { ...config.style.cardTitle, ...cardTitle })} />
            <TypographyStyleFields label="نمط وصف البطاقة" value={config.style.cardDescription} onChange={(cardDescription) => updateStyle("cardDescription", { ...config.style.cardDescription, ...cardDescription })} showLineHeight />
            <TypographyStyleFields label="نمط قيمة الإحصائية" value={config.style.statValue} onChange={(statValue) => updateStyle("statValue", { ...config.style.statValue, ...statValue })} />
            <TypographyStyleFields label="نمط تسمية الإحصائية" value={config.style.statLabel} onChange={(statLabel) => updateStyle("statLabel", { ...config.style.statLabel, ...statLabel })} />
          </section>
        </div>

        <div className="space-y-3 xl:sticky xl:top-24 xl:self-start">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Eye className="h-4 w-4" />
            معاينة — نبذة عن CIAR
          </div>
          <AboutBriefPreview config={config} />
        </div>
      </div>
    </div>
  )
}
