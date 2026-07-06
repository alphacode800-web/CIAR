"use client"

import { useEffect, useState } from "react"
import { FileText, Loader2, Palette, Save, Type, ImageIcon, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { PageHeroHeader } from "@/components/layout/page-hero-header"
import {
  DEFAULT_PAGE_HEADERS,
  PAGE_HEADER_LABELS,
  type LocalizedText,
  type PageHeaderConfig,
  type PageHeaderId,
  type PageHeadersStore,
  type TextStyle,
} from "@/lib/page-headers"
import {
  NEWS_TICKER_FONT_OPTIONS,
  NEWS_TICKER_WEIGHT_OPTIONS,
} from "@/lib/news-ticker"

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

function LocalizedField({
  label,
  value,
  onChange,
  multiline = false,
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
            className={multiline ? "min-h-[96px] resize-y" : "h-10"}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">English</Label>
          <Field
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            className={multiline ? "min-h-[96px] resize-y" : "h-10"}
            dir="ltr"
          />
        </div>
      </div>
    </div>
  )
}

function TextStyleFields({
  label,
  value,
  onChange,
}: {
  label: string
  value: TextStyle
  onChange: (value: TextStyle) => void
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
              onChange({ ...value, fontFamily: fontFamily as TextStyle["fontFamily"] })
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
            max={80}
            step={1}
            onValueChange={([fontSize]) => onChange({ ...value, fontSize })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">سُمك الخط</Label>
          <Select
            value={String(value.fontWeight)}
            onValueChange={(weight) =>
              onChange({ ...value, fontWeight: Number(weight) as TextStyle["fontWeight"] })
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
      </div>
    </div>
  )
}

function PageHeaderEditor({
  pageId,
  config,
  onChange,
}: {
  pageId: PageHeaderId
  config: PageHeaderConfig
  onChange: (next: PageHeaderConfig) => void
}) {
  const update = <K extends keyof PageHeaderConfig>(key: K, value: PageHeaderConfig[K]) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <div className="space-y-6">
        {pageId === "home" ? (
          <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            صور وفيديو الهيدر المتحرك يُدار من تبويب «بنرات الصفحة الرئيسية». هنا تتحكم بالنصوص والخطوط والألوان فقط.
          </p>
        ) : null}
        <div className="rounded-2xl border border-border/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            النصوص
          </div>
          <LocalizedField label="الشارة (Badge)" value={config.badge} onChange={(badge) => update("badge", badge)} />
          <LocalizedField label="العنوان — السطر الأول" value={config.titleLine1} onChange={(titleLine1) => update("titleLine1", titleLine1)} />
          <LocalizedField label="العنوان — السطر الثاني" value={config.titleLine2} onChange={(titleLine2) => update("titleLine2", titleLine2)} />
          <LocalizedField label="الوصف" value={config.subtitle} onChange={(subtitle) => update("subtitle", subtitle)} multiline />
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={config.badgeVisible} onCheckedChange={(badgeVisible) => update("badgeVisible", badgeVisible)} />
              <Label>إظهار الشارة</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={config.titleSplit} onCheckedChange={(titleSplit) => update("titleSplit", titleSplit)} />
              <Label>عنوان من جزئين</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={config.titleAccentUseGradient}
                onCheckedChange={(titleAccentUseGradient) => update("titleAccentUseGradient", titleAccentUseGradient)}
              />
              <Label>تدرج لوني للعنوان</Label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Type className="h-4 w-4 text-primary" />
            الخطوط والألوان
          </div>
          <TextStyleFields
            label="نمط الشارة"
            value={{
              color: config.badgeStyle.color,
              fontFamily: config.badgeStyle.fontFamily,
              fontSize: config.badgeStyle.fontSize,
              fontWeight: config.badgeStyle.fontWeight,
            }}
            onChange={(style) => update("badgeStyle", { ...config.badgeStyle, ...style })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              label="خلفية الشارة"
              value={config.badgeStyle.backgroundColor.startsWith("#") ? config.badgeStyle.backgroundColor : "#ffffff"}
              onChange={(backgroundColor) => update("badgeStyle", { ...config.badgeStyle, backgroundColor })}
            />
            <Input
              value={config.badgeStyle.backgroundColor}
              onChange={(e) => update("badgeStyle", { ...config.badgeStyle, backgroundColor: e.target.value })}
              placeholder="rgba(...) أو #hex"
              dir="ltr"
            />
          </div>
          <TextStyleFields label="نمط العنوان" value={config.titleStyle} onChange={(titleStyle) => update("titleStyle", titleStyle)} />
          <TextStyleFields label="نمط الجزء المميز من العنوان" value={config.titleAccentStyle} onChange={(titleAccentStyle) => update("titleAccentStyle", titleAccentStyle)} />
          <TextStyleFields label="نمط الوصف" value={config.subtitleStyle} onChange={(subtitleStyle) => update("subtitleStyle", subtitleStyle)} />
        </div>

        <div className="rounded-2xl border border-border/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ImageIcon className="h-4 w-4 text-primary" />
            الخلفية والمسافات
          </div>
          <div className="space-y-2">
            <Label>صورة الخلفية (URL)</Label>
            <Input
              value={config.backgroundImage}
              onChange={(e) => update("backgroundImage", e.target.value)}
              placeholder="/images/headers/about-header.png"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>شفافية الصورة ({config.backgroundOpacity}%)</Label>
            <Slider
              value={[config.backgroundOpacity]}
              min={0}
              max={100}
              step={1}
              onValueChange={([backgroundOpacity]) => update("backgroundOpacity", backgroundOpacity)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="لون التدرج — أعلى" value={config.overlayFromColor.startsWith("#") ? config.overlayFromColor : "#0f172a"} onChange={(overlayFromColor) => update("overlayFromColor", overlayFromColor)} />
            <Input value={config.overlayFromColor} onChange={(e) => update("overlayFromColor", e.target.value)} placeholder="rgba(...)" dir="ltr" />
            <ColorField label="لون التدرج — أسفل" value={config.overlayToColor.startsWith("#") ? config.overlayToColor : "#020617"} onChange={(overlayToColor) => update("overlayToColor", overlayToColor)} />
            <Input value={config.overlayToColor} onChange={(e) => update("overlayToColor", e.target.value)} placeholder="rgba(...)" dir="ltr" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>الحشو العلوي ({config.paddingTop}px)</Label>
              <Slider value={[config.paddingTop]} min={48} max={200} step={4} onValueChange={([paddingTop]) => update("paddingTop", paddingTop)} />
            </div>
            <div className="space-y-2">
              <Label>الحشو السفلي ({config.paddingBottom}px)</Label>
              <Slider value={[config.paddingBottom]} min={48} max={200} step={4} onValueChange={([paddingBottom]) => update("paddingBottom", paddingBottom)} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 xl:sticky xl:top-24 xl:self-start">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Eye className="h-4 w-4" />
          معاينة — {PAGE_HEADER_LABELS[pageId].ar}
        </div>
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-background shadow-xl">
          <PageHeroHeader config={config} locale="ar" />
        </div>
      </div>
    </div>
  )
}

export function PageHeadersTab() {
  const [headers, setHeaders] = useState<PageHeadersStore>(DEFAULT_PAGE_HEADERS)
  const [activePage, setActivePage] = useState<PageHeaderId>("home")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/page-headers", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.headers) setHeaders(data.headers)
      })
      .catch(() => {
        setHeaders(DEFAULT_PAGE_HEADERS)
      })
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/page-headers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ headers }),
      })
      if (!res.ok) throw new Error("save failed")
      const data = await res.json()
      if (data?.headers) setHeaders(data.headers)
      toast.success("تم حفظ إعدادات هيدر الصفحات")
    } catch {
      toast.error("فشل حفظ إعدادات الهيدر")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            هيدر الصفحات
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            تحكم بنصوص وألوان وخطوط وأحجام هيدر كل صفحة (الرئيسية، من نحن، التواصل، المنصات).
          </p>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2 rounded-full btn-gold">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التغييرات
        </Button>
      </div>

      <Tabs value={activePage} onValueChange={(value) => setActivePage(value as PageHeaderId)}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          {(Object.keys(PAGE_HEADER_LABELS) as PageHeaderId[]).map((pageId) => (
            <TabsTrigger key={pageId} value={pageId}>
              {PAGE_HEADER_LABELS[pageId].ar}
            </TabsTrigger>
          ))}
        </TabsList>

        {(Object.keys(PAGE_HEADER_LABELS) as PageHeaderId[]).map((pageId) => (
          <TabsContent key={pageId} value={pageId} className="mt-6">
            <PageHeaderEditor
              pageId={pageId}
              config={headers[pageId]}
              onChange={(next) => setHeaders((prev) => ({ ...prev, [pageId]: next }))}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
