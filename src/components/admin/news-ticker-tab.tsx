"use client"

import { useEffect, useState } from "react"
import { Newspaper, Plus, Trash2, Save, Loader2, Palette, Type, Gauge, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"
import { NewsTickerStrip } from "@/components/home/NewsTickerStrip"
import {
  DEFAULT_NEWS_TICKER_ITEMS_AR,
  DEFAULT_NEWS_TICKER_STYLE,
  NEWS_TICKER_FONT_OPTIONS,
  NEWS_TICKER_PRESETS,
  NEWS_TICKER_WEIGHT_OPTIONS,
  type NewsTickerStyle,
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
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-3">
        <label className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-slate-200 shadow-sm dark:border-white/15">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer border-0 p-0"
            aria-label={label}
          />
        </label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 font-mono text-sm uppercase"
          dir="ltr"
          maxLength={7}
        />
      </div>
    </div>
  )
}

export function NewsTickerTab() {
  const { t } = useI18n()
  const [items, setItems] = useState<string[]>([])
  const [style, setStyle] = useState<NewsTickerStyle>(DEFAULT_NEWS_TICKER_STYLE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadItems() {
      try {
        const res = await fetch("/api/admin/news-ticker")
        const data = await res.json()
        setItems(
          Array.isArray(data.items) && data.items.length > 0 ? data.items : DEFAULT_NEWS_TICKER_ITEMS_AR
        )
        if (data.style && typeof data.style === "object") {
          setStyle({ ...DEFAULT_NEWS_TICKER_STYLE, ...data.style })
        }
      } catch {
        setItems(DEFAULT_NEWS_TICKER_ITEMS_AR)
        setStyle(DEFAULT_NEWS_TICKER_STYLE)
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [])

  const updateStyle = <K extends keyof NewsTickerStyle>(key: K, value: NewsTickerStyle[K]) => {
    setStyle((prev) => ({ ...prev, [key]: value }))
  }

  const applyPreset = (presetId: string) => {
    const preset = NEWS_TICKER_PRESETS.find((item) => item.id === presetId)
    if (!preset) return
    setStyle((prev) => ({ ...prev, ...preset.style }))
  }

  const updateItem = (index: number, value: string) => {
    setItems((prev) => prev.map((item, idx) => (idx === index ? value : item)))
  }

  const addItem = () => setItems((prev) => [...prev, ""])

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const saveAll = async () => {
    const cleaned = items.map((item) => item.trim()).filter(Boolean)
    if (cleaned.length === 0) {
      toast.error("أضف خبراً واحداً على الأقل")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/news-ticker", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cleaned, style }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(typeof payload?.error === "string" ? payload.error : "فشل الحفظ")
      }
      setItems(cleaned)
      toast.success("تم حفظ الشريط الإخباري بنجاح")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الحفظ")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-72 rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-24 rounded-xl bg-muted/30 animate-pulse" />
        <div className="h-48 rounded-xl bg-muted/30 animate-pulse" />
      </div>
    )
  }

  const previewItems = items.map((item) => item.trim()).filter(Boolean)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-orange-500" />
          {t("admin.news_ticker") || "الشريط الإخباري"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.news_ticker_desc") || "تحكم كامل بالشكل والألوان والخط — بدون أي أكواد برمجية"}
        </p>
      </div>

      {/* معاينة مباشرة */}
      <section className="admin-pro-panel space-y-3 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Eye className="h-4 w-4 text-orange-500" />
          معاينة مباشرة
        </div>
        <NewsTickerStrip items={previewItems} style={style} locale="ar" dir="rtl" preview />
      </section>

      {/* تفعيل الشريط */}
      <section className="admin-pro-panel flex items-center justify-between gap-4 rounded-2xl p-4">
        <div>
          <p className="font-semibold">إظهار الشريط في الصفحة الرئيسية</p>
          <p className="text-sm text-muted-foreground">يمكنك إخفاء الشريط مؤقتاً دون حذف الأخبار</p>
        </div>
        <Switch checked={style.enabled} onCheckedChange={(checked) => updateStyle("enabled", checked)} />
      </section>

      {/* قوالب جاهزة */}
      <section className="admin-pro-panel space-y-3 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Palette className="h-4 w-4 text-orange-500" />
          قوالب ألوان جاهزة
        </div>
        <div className="flex flex-wrap gap-2">
          {NEWS_TICKER_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => applyPreset(preset.id)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </section>

      {/* الألوان */}
      <section className="admin-pro-panel space-y-4 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Palette className="h-4 w-4 text-orange-500" />
          الألوان والخلفية
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 p-3 dark:border-white/10">
          <div>
            <p className="text-sm font-medium">خلفية متدرجة</p>
            <p className="text-xs text-muted-foreground">لونين يتلاشيان بجانب بعض</p>
          </div>
          <Switch
            checked={style.backgroundType === "gradient"}
            onCheckedChange={(checked) => updateStyle("backgroundType", checked ? "gradient" : "solid")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            label="لون الخلفية"
            value={style.backgroundColor}
            onChange={(value) => updateStyle("backgroundColor", value)}
          />
          {style.backgroundType === "gradient" ? (
            <ColorField
              label="لون الخلفية الثاني"
              value={style.backgroundColorEnd}
              onChange={(value) => updateStyle("backgroundColorEnd", value)}
            />
          ) : null}
          <ColorField
            label="لون النص"
            value={style.textColor}
            onChange={(value) => updateStyle("textColor", value)}
          />
          <ColorField
            label="لون الفاصل (•)"
            value={style.separatorColor}
            onChange={(value) => updateStyle("separatorColor", value)}
          />
          <ColorField
            label="لون شارة «أخبار»"
            value={style.badgeBackgroundColor}
            onChange={(value) => updateStyle("badgeBackgroundColor", value)}
          />
          <ColorField
            label="لون نص الشارة"
            value={style.badgeTextColor}
            onChange={(value) => updateStyle("badgeTextColor", value)}
          />
        </div>
      </section>

      {/* الخط */}
      <section className="admin-pro-panel space-y-4 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Type className="h-4 w-4 text-orange-500" />
          الخط والحجم
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>نوع الخط</Label>
            <select
              value={style.fontFamily}
              onChange={(e) => updateStyle("fontFamily", e.target.value as NewsTickerStyle["fontFamily"])}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-900"
            >
              {NEWS_TICKER_FONT_OPTIONS.map((font) => (
                <option key={font.key} value={font.key}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>سُمك الخط</Label>
            <select
              value={style.fontWeight}
              onChange={(e) => updateStyle("fontWeight", Number(e.target.value) as NewsTickerStyle["fontWeight"])}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-900"
            >
              {NEWS_TICKER_WEIGHT_OPTIONS.map((weight) => (
                <option key={weight.value} value={weight.value}>
                  {weight.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <Label>حجم الخط</Label>
            <span className="font-semibold text-orange-600">{style.fontSize} بكسل</span>
          </div>
          <Slider
            value={[style.fontSize]}
            min={11}
            max={22}
            step={1}
            onValueChange={([value]) => updateStyle("fontSize", value)}
          />
        </div>

        <div className="space-y-2">
          <Label>نص شارة الأخبار (عربي)</Label>
          <Input
            value={style.badgeLabelAr}
            onChange={(e) => updateStyle("badgeLabelAr", e.target.value)}
            placeholder="أخبار"
            className="h-11 rounded-xl"
          />
        </div>
      </section>

      {/* الحركة والارتفاع */}
      <section className="admin-pro-panel space-y-4 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Gauge className="h-4 w-4 text-orange-500" />
          الحركة والمقاس
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <Label>سرعة الحركة</Label>
            <span className="text-muted-foreground">
              {style.scrollDuration <= 28
                ? "سريع"
                : style.scrollDuration >= 48
                  ? "بطيء"
                  : "متوسط"}
            </span>
          </div>
          <Slider
            value={[style.scrollDuration]}
            min={20}
            max={90}
            step={1}
            onValueChange={([value]) => updateStyle("scrollDuration", value)}
          />
          <p className="text-xs text-muted-foreground">
            حرّك المؤشر يميناً لإبطاء الشريط، ويساراً لتسريعه
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <Label>ارتفاع الشريط</Label>
            <span className="font-semibold text-orange-600">{style.stripHeight} بكسل</span>
          </div>
          <Slider
            value={[style.stripHeight]}
            min={28}
            max={72}
            step={2}
            onValueChange={([value]) => updateStyle("stripHeight", value)}
          />
        </div>
      </section>

      {/* الأخبار */}
      <section className="admin-pro-panel space-y-4 rounded-2xl p-4 sm:p-5">
        <div className="text-sm font-semibold">نصوص الأخبار</div>
        <p className="text-xs text-muted-foreground">اكتب كل خبر في سطر منفصل — سيظهر متحركاً في الشريط</p>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`ticker-${index}`} className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-xs font-bold text-orange-600">
                {index + 1}
              </span>
              <Input
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder="اكتب نص الخبر هنا..."
                className="h-11 rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeItem(index)}
                disabled={items.length <= 1}
                className="h-11 w-11 shrink-0 rounded-xl"
                aria-label="حذف الخبر"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button type="button" variant="outline" onClick={addItem} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            إضافة خبر
          </Button>
          <Button
            type="button"
            onClick={saveAll}
            className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white"
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ الكل
          </Button>
        </div>
      </section>
    </div>
  )
}
