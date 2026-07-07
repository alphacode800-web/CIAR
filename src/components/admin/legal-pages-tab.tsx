"use client"

import { useEffect, useState } from "react"
import { Eye, FileText, Loader2, Plus, Save, Scale, Trash2, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { TypographyStyleFields, ColorField } from "@/components/admin/typography-style-fields"
import {
  DEFAULT_LEGAL_PAGES,
  pickLocalized,
  type LegalPageConfig,
  type LegalPageId,
  type LegalPagesConfig,
  type LegalSection,
  type LocalizedText,
} from "@/lib/legal-pages"
import { textStyleToCss, titleStyleToCss } from "@/lib/text-style"
import { cn } from "@/lib/utils"

const PAGE_LABELS: Record<LegalPageId, { ar: string; en: string }> = {
  privacy: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
  terms: { ar: "الشروط والأحكام", en: "Terms & Conditions" },
}

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
            className={multiline ? "min-h-[100px] resize-y" : "h-10"}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">English</Label>
          <Field
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            className={multiline ? "min-h-[100px] resize-y" : "h-10"}
            dir="ltr"
          />
        </div>
      </div>
    </div>
  )
}

function LegalPagePreview({ config }: { config: LegalPageConfig }) {
  const locale: "ar" | "en" = "ar"
  const titleStyle = config.style.pageTitle.useGradient
    ? titleStyleToCss(config.style.pageTitle)
    : textStyleToCss(config.style.pageTitle)

  return (
    <div className="rounded-2xl border border-border/50 bg-[oklch(0.10_0.025_265)] p-5 text-start">
      <h3 className="font-bold leading-tight text-center" style={titleStyle}>
        {pickLocalized(config.content.pageTitle, locale)}
      </h3>
      <p
        className="mt-3 text-center"
        style={{
          ...textStyleToCss(config.style.intro),
          lineHeight: config.style.intro.lineHeight,
        }}
      >
        {pickLocalized(config.content.intro, locale)}
      </p>
      <p className="mt-2 text-center" style={textStyleToCss(config.style.lastUpdated)}>
        {pickLocalized(config.content.lastUpdated, locale)}
      </p>
      <div className="mt-6 space-y-4">
        {config.content.sections.slice(0, 3).map((section, index) => (
          <div key={index} className="rounded-xl border border-border/30 bg-muted/10 p-4">
            <h4 style={textStyleToCss(config.style.sectionHeading)}>
              {pickLocalized(section.heading, locale)}
            </h4>
            <p
              className="mt-2 line-clamp-3 whitespace-pre-line"
              style={{
                ...textStyleToCss(config.style.body),
                lineHeight: config.style.body.lineHeight,
              }}
            >
              {pickLocalized(section.body, locale)}
            </p>
          </div>
        ))}
        {config.content.sections.length > 3 ? (
          <p className="text-center text-xs text-muted-foreground">
            +{config.content.sections.length - 3} أقسام أخرى
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function LegalPagesTab() {
  const [config, setConfig] = useState<LegalPagesConfig>(DEFAULT_LEGAL_PAGES)
  const [activePage, setActivePage] = useState<LegalPageId>("privacy")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const page = config[activePage]

  useEffect(() => {
    fetch("/api/admin/legal-pages", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.config) setConfig(data.config)
      })
      .catch(() => setConfig(DEFAULT_LEGAL_PAGES))
      .finally(() => setLoading(false))
  }, [])

  const updatePage = (patch: Partial<LegalPageConfig>) => {
    setConfig((prev) => ({
      ...prev,
      [activePage]: {
        content: { ...prev[activePage].content, ...(patch.content ?? {}) },
        style: { ...prev[activePage].style, ...(patch.style ?? {}) },
      },
    }))
  }

  const updateContent = <K extends keyof LegalPageConfig["content"]>(
    key: K,
    value: LegalPageConfig["content"][K]
  ) => {
    updatePage({ content: { ...page.content, [key]: value } })
  }

  const updateStyle = <K extends keyof LegalPageConfig["style"]>(
    key: K,
    value: LegalPageConfig["style"][K]
  ) => {
    updatePage({ style: { ...page.style, [key]: value } })
  }

  const updateSection = (index: number, patch: Partial<LegalSection>) => {
    const sections = page.content.sections.map((section, i) =>
      i === index ? { ...section, ...patch, heading: { ...section.heading, ...(patch.heading ?? {}) }, body: { ...section.body, ...(patch.body ?? {}) } } : section
    )
    updateContent("sections", sections)
  }

  const addSection = () => {
    if (page.content.sections.length >= 30) return
    updateContent("sections", [
      ...page.content.sections,
      {
        heading: { ar: "عنوان القسم", en: "Section heading" },
        body: { ar: "نص القسم...", en: "Section text..." },
      },
    ])
  }

  const removeSection = (index: number) => {
    if (page.content.sections.length <= 1) return
    updateContent(
      "sections",
      page.content.sections.filter((_, i) => i !== index)
    )
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/legal-pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ config }),
      })
      if (!res.ok) throw new Error("save failed")
      const data = await res.json()
      if (data?.config) setConfig(data.config)
      toast.success("تم حفظ الصفحات القانونية")
    } catch {
      toast.error("فشل حفظ الصفحات القانونية")
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
            <Scale className="h-6 w-6 text-primary" />
            الصفحات القانونية
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            تحكم بنصوص وألوان وخطوط صفحتي سياسة الخصوصية والشروط والأحكام.
          </p>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2 rounded-full btn-gold">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التغييرات
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["privacy", "terms"] as LegalPageId[]).map((pageId) => (
          <Button
            key={pageId}
            type="button"
            variant={activePage === pageId ? "default" : "outline"}
            className={cn("rounded-full", activePage === pageId && "btn-gold")}
            onClick={() => setActivePage(pageId)}
          >
            {PAGE_LABELS[pageId].ar}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-border/40 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-primary" />
              النصوص — {PAGE_LABELS[activePage].ar}
            </div>
            <LocalizedField
              label="عنوان الصفحة"
              value={page.content.pageTitle}
              onChange={(pageTitle) => updateContent("pageTitle", pageTitle)}
            />
            <LocalizedField
              label="المقدمة"
              value={page.content.intro}
              onChange={(intro) => updateContent("intro", intro)}
              multiline
            />
            <LocalizedField
              label="تاريخ آخر تحديث"
              value={page.content.lastUpdated}
              onChange={(lastUpdated) => updateContent("lastUpdated", lastUpdated)}
            />
          </section>

          <section className="space-y-4 rounded-2xl border border-border/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-sm font-semibold">الأقسام ({page.content.sections.length})</Label>
              <Button type="button" size="sm" variant="outline" className="gap-1 rounded-full" onClick={addSection}>
                <Plus className="h-3.5 w-3.5" />
                إضافة قسم
              </Button>
            </div>
            {page.content.sections.map((section, index) => (
              <div key={index} className="space-y-3 rounded-xl border border-border/30 bg-muted/10 p-4">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm font-medium">قسم {index + 1}</Label>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    disabled={page.content.sections.length <= 1}
                    onClick={() => removeSection(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <LocalizedField
                  label="عنوان القسم"
                  value={section.heading}
                  onChange={(heading) => updateSection(index, { heading })}
                />
                <LocalizedField
                  label="نص القسم"
                  value={section.body}
                  onChange={(body) => updateSection(index, { body })}
                  multiline
                />
              </div>
            ))}
          </section>

          <section className="space-y-4 rounded-2xl border border-border/40 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Type className="h-4 w-4 text-primary" />
              الخطوط والألوان
            </div>
            <TypographyStyleFields
              label="نمط عنوان الصفحة"
              value={page.style.pageTitle}
              onChange={(pageTitle) => updateStyle("pageTitle", { ...page.style.pageTitle, ...pageTitle })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={page.style.pageTitle.useGradient}
                  onCheckedChange={(useGradient) =>
                    updateStyle("pageTitle", { ...page.style.pageTitle, useGradient })
                  }
                />
                <Label>تدرج لوني للعنوان</Label>
              </div>
              <ColorField
                label="لون التدرج"
                value={page.style.pageTitle.accentColor}
                onChange={(accentColor) =>
                  updateStyle("pageTitle", { ...page.style.pageTitle, accentColor })
                }
              />
            </div>
            <TypographyStyleFields
              label="نمط المقدمة"
              value={page.style.intro}
              onChange={(intro) => updateStyle("intro", { ...page.style.intro, ...intro })}
              showLineHeight
            />
            <TypographyStyleFields
              label="نمط عناوين الأقسام"
              value={page.style.sectionHeading}
              onChange={(sectionHeading) =>
                updateStyle("sectionHeading", { ...page.style.sectionHeading, ...sectionHeading })
              }
            />
            <TypographyStyleFields
              label="نمط نص الأقسام"
              value={page.style.body}
              onChange={(body) => updateStyle("body", { ...page.style.body, ...body })}
              showLineHeight
            />
            <TypographyStyleFields
              label="نمط تاريخ التحديث"
              value={page.style.lastUpdated}
              onChange={(lastUpdated) =>
                updateStyle("lastUpdated", { ...page.style.lastUpdated, ...lastUpdated })
              }
            />
          </section>
        </div>

        <div className="space-y-3 xl:sticky xl:top-24 xl:self-start">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Eye className="h-4 w-4" />
            معاينة — {PAGE_LABELS[activePage].ar}
          </div>
          <LegalPagePreview config={page} />
        </div>
      </div>
    </div>
  )
}
