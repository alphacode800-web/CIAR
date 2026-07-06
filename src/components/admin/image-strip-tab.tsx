"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import {
  Film,
  Gauge,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  Eye,
  PauseCircle,
  Images,
  Play,
  Square,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useI18n } from "@/lib/i18n-context"
import { ImageStripBar } from "@/components/home/ImageStripBar"
import { DEFAULT_IMAGE_STRIP_CONFIG, type ImageStripConfig } from "@/lib/image-strip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function ImageStripTab() {
  const { t } = useI18n()
  const [config, setConfig] = useState<ImageStripConfig>(DEFAULT_IMAGE_STRIP_CONFIG)
  const [siteImages, setSiteImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [togglingEnabled, setTogglingEnabled] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/image-strip")
        const data = await res.json()
        if (data?.config) {
          setConfig(data.config as ImageStripConfig)
        }
        if (Array.isArray(data?.images)) {
          setSiteImages(data.images)
        }
      } catch {
        setConfig(DEFAULT_IMAGE_STRIP_CONFIG)
        setSiteImages([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const updateConfig = <K extends keyof ImageStripConfig>(key: K, value: ImageStripConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const updateExtraImage = (index: number, url: string) => {
    setConfig((prev) => ({
      ...prev,
      extraImages: prev.extraImages.map((item, idx) => (idx === index ? url : item)),
    }))
  }

  const addExtraImage = () => {
    setConfig((prev) => ({
      ...prev,
      extraImages: [...prev.extraImages, ""],
    }))
  }

  const removeExtraImage = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      extraImages: prev.extraImages.filter((_, idx) => idx !== index),
    }))
  }

  const uploadMediaFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("category", "general")
    const res = await fetch("/api/media", { method: "POST", body: formData })
    if (!res.ok) throw new Error("upload failed")
    const result = await res.json()
    return String(result?.url || "")
  }

  const uploadIntoExtraImage = async (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0]
    event.currentTarget.value = ""
    if (!file) return

    setUploadingIndex(index)
    try {
      const url = await uploadMediaFile(file)
      if (!url) throw new Error("empty url")
      updateExtraImage(index, url)
      toast.success("تم رفع الصورة")
    } catch {
      toast.error("فشل رفع الصورة")
    } finally {
      setUploadingIndex(null)
    }
  }

  const save = async (nextConfig: ImageStripConfig = config) => {
    const payload: ImageStripConfig = {
      ...nextConfig,
      extraImages: nextConfig.extraImages.map((url) => url.trim()).filter(Boolean),
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/image-strip", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(typeof data?.error === "string" ? data.error : "فشل الحفظ")
      }
      const data = await res.json()
      if (data?.config) setConfig(data.config)
      if (Array.isArray(data?.images)) setSiteImages(data.images)
      toast.success("تم حفظ شريط الصور")
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الحفظ")
      return false
    } finally {
      setSaving(false)
    }
  }

  const toggleEnabled = async () => {
    const nextEnabled = !config.enabled
    const nextConfig = { ...config, enabled: nextEnabled }
    setConfig(nextConfig)
    setTogglingEnabled(true)
    try {
      const payload: ImageStripConfig = {
        ...nextConfig,
        extraImages: nextConfig.extraImages.map((url) => url.trim()).filter(Boolean),
      }
      const res = await fetch("/api/admin/image-strip", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(typeof data?.error === "string" ? data.error : "فشل التحديث")
      }
      const data = await res.json()
      if (data?.config) setConfig(data.config)
      toast.success(nextEnabled ? "تم تشغيل شريط الصور في الموقع" : "تم إيقاف شريط الصور في الموقع")
    } catch (error) {
      setConfig((prev) => ({ ...prev, enabled: !nextEnabled }))
      toast.error(error instanceof Error ? error.message : "فشل تحديث حالة الشريط")
    } finally {
      setTogglingEnabled(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const previewImages = siteImages.length > 0 ? siteImages : config.extraImages.filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold gradient-text">
            <Film className="h-6 w-6 text-primary" />
            {t("admin.image_strip") || "شريط الصور"}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("admin.image_strip_desc") ||
              "يعرض الشريط تلقائياً كل صور الموقع (الهيرو، المنصات، المشاريع، مكتبة الوسائط). الصور غير المتاحة لا تُعرض."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 px-3 py-1 text-xs font-semibold",
              config.enabled
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                config.enabled ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              )}
            />
            {config.enabled ? "يعمل على الموقع" : "متوقف على الموقع"}
          </Badge>
          <Button
            type="button"
            variant={config.enabled ? "outline" : "default"}
            disabled={togglingEnabled || saving}
            onClick={() => void toggleEnabled()}
            className={cn(
              "gap-2",
              !config.enabled && "bg-emerald-600 text-white hover:bg-emerald-700"
            )}
          >
            {togglingEnabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : config.enabled ? (
              <Square className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {config.enabled ? "إيقاف الشريط" : "تشغيل الشريط"}
          </Button>
          <Button onClick={() => void save()} disabled={saving || togglingEnabled} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <section className="space-y-3 rounded-xl border border-border/40 bg-card/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Eye className="h-4 w-4 text-primary" />
            معاينة مباشرة
            {!config.enabled ? (
              <Badge variant="secondary" className="text-[10px]">
                الشريط متوقف — لن يظهر في الموقع
              </Badge>
            ) : null}
          </div>
          <span className="text-xs text-muted-foreground">
            {siteImages.length} {siteImages.length === 1 ? "صورة" : "صورة"} في الموقع
          </span>
        </div>
        {previewImages.length > 0 ? (
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-border/30",
              !config.enabled && "opacity-50 grayscale"
            )}
          >
            <ImageStripBar
              config={{ ...config, enabled: true }}
              images={previewImages}
              preview
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">لا توجد صور متاحة حالياً</p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-xl border border-border/40 bg-card/30 p-4 md:grid-cols-2">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/30 bg-background/40 p-4">
          <div>
            <Label className="text-sm font-semibold">تفعيل الشريط</Label>
            <p className="text-xs text-muted-foreground">نفس زر التشغيل/الإيقاف في الأعلى — يُحفظ فوراً</p>
          </div>
          <Switch
            checked={config.enabled}
            disabled={togglingEnabled}
            onCheckedChange={() => void toggleEnabled()}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/30 bg-background/40 p-4">
          <div>
            <Label className="text-sm font-semibold">إيقاف عند التمرير</Label>
            <p className="text-xs text-muted-foreground">إيقاف الحركة عند مرور الماوس</p>
          </div>
          <Switch
            checked={config.pauseOnHover}
            onCheckedChange={(v) => updateConfig("pauseOnHover", v)}
          />
        </div>

        <div className="space-y-3 rounded-lg border border-border/30 bg-background/40 p-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Gauge className="h-4 w-4 text-primary" />
              سرعة الحركة
            </Label>
            <span className="text-xs font-mono text-muted-foreground">{config.scrollDuration}s</span>
          </div>
          <Slider
            value={[config.scrollDuration]}
            min={10}
            max={120}
            step={5}
            onValueChange={([value]) => updateConfig("scrollDuration", value)}
          />
          <p className="text-xs text-muted-foreground">
            <PauseCircle className="inline h-3 w-3 me-1" />
            قيمة أقل = حركة أسرع
          </p>
        </div>

        <div className="space-y-3 rounded-lg border border-border/30 bg-background/40 p-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">ارتفاع الصور</Label>
            <span className="text-xs font-mono text-muted-foreground">{config.imageHeight}px</span>
          </div>
          <Slider
            value={[config.imageHeight]}
            min={80}
            max={220}
            step={4}
            onValueChange={([value]) => updateConfig("imageHeight", value)}
          />
        </div>

        <div className="space-y-3 rounded-lg border border-border/30 bg-background/40 p-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">استدارة الزوايا</Label>
            <span className="text-xs font-mono text-muted-foreground">{config.borderRadius}px</span>
          </div>
          <Slider
            value={[config.borderRadius]}
            min={0}
            max={32}
            step={2}
            onValueChange={([value]) => updateConfig("borderRadius", value)}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/40 bg-card/30 p-4">
        <div className="flex items-center gap-2">
          <Images className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">صور الموقع التلقائية ({siteImages.length})</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          تُجمع من: صور الهيرو، بنرات المنصات، المشاريع، ومكتبة الوسائط. تُعرض فقط الصور التي تُحمّل بنجاح.
        </p>
        {siteImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {siteImages.map((url) => (
              <div
                key={url}
                className="aspect-[3/4] overflow-hidden rounded-lg border border-border/30 bg-muted"
              >
                <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">لا توجد صور متاحة</p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">صور إضافية (اختياري)</h3>
            <p className="text-xs text-muted-foreground">تُدمج مع صور الموقع التلقائية</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addExtraImage} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            إضافة صورة
          </Button>
        </div>

        {config.extraImages.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/40 p-4 text-sm text-muted-foreground">
            لا توجد صور إضافية — الشريط يعتمد على صور الموقع تلقائياً.
          </p>
        ) : (
          config.extraImages.map((url, index) => (
            <div
              key={`extra-${index}`}
              className="flex flex-col gap-3 rounded-lg border border-border/30 bg-background/40 p-3 sm:flex-row sm:items-center"
            >
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-border/30 bg-muted">
                {url.trim() ? (
                  <img src={url.trim()} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                    —
                  </div>
                )}
              </div>
              <Input
                value={url}
                onChange={(e) => updateExtraImage(index, e.target.value)}
                placeholder="https://..."
                dir="ltr"
                className="flex-1 font-mono text-xs"
              />
              <div className="flex shrink-0 gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void uploadIntoExtraImage(e, index)}
                  />
                  {uploadingIndex === index ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  رفع
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => removeExtraImage(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
