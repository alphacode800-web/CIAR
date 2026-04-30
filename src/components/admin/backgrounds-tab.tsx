"use client"

import { useEffect, useMemo, useState } from "react"
import { Image as ImageIcon, Save, Loader2, Search, Wand2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

const PAGE_BACKGROUNDS = [
  { id: "home", label: "الصفحة الرئيسية", path: "/" },
  { id: "about", label: "صفحة من نحن", path: "/about" },
  { id: "contact", label: "صفحة تواصل معنا", path: "/contact" },
  { id: "projects", label: "صفحة المشاريع", path: "/projects" },
  { id: "store", label: "صفحة المتجر", path: "/store" },
  { id: "admin-dashboard", label: "لوحة الأدمن - الرئيسية", path: "/admin/dashboard" },
  { id: "admin-products", label: "لوحة الأدمن - المنتجات", path: "/admin/products" },
  { id: "admin-orders", label: "لوحة الأدمن - الطلبات", path: "/admin/orders" },
  { id: "admin-users", label: "لوحة الأدمن - المستخدمين", path: "/admin/users" },
  { id: "admin-media", label: "لوحة الأدمن - الوسائط", path: "/admin/media" },
]
const HOME_HERO_IMAGES = [
  { key: "home_hero_image_1", label: "صورة الهيدر 1 (سياحة)" },
  { key: "home_hero_image_2", label: "صورة الهيدر 2 (عقارات)" },
  { key: "home_hero_image_3", label: "صورة الهيدر 3 (أزياء)" },
  { key: "home_hero_image_4", label: "صورة الهيدر 4 (سيارات)" },
  { key: "home_hero_image_5", label: "صورة الهيدر 5" },
  { key: "home_hero_image_6", label: "صورة الهيدر 6" },
  { key: "home_hero_image_7", label: "صورة الهيدر 7" },
  { key: "home_hero_image_8", label: "صورة الهيدر 8" },
  { key: "home_hero_image_9", label: "صورة الهيدر 9" },
  { key: "home_hero_image_10", label: "صورة الهيدر 10" },
]
const IMAGE_KEY_PATTERN = /(image|images|banner|background|bg|logo|hero)/i
const PAGE_KEY_PATTERN = /^page_background_/i
const EXCLUDED_COMPONENT_KEYS = /(platform|module|card|cards|carousel|slider|cta|topProjects|projectsByCategory)/i

type BannerRow = {
  id: string
  moduleId: string
  titleAr?: string
  titleEn?: string
  imageUrl1?: string
  imageUrl2?: string
  imageUrl3?: string
}

type ConfiguredImage = {
  key: string
  value: string
  sourceType: "setting"
  settingKey?: string
}

export function BackgroundsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [initialSettings, setInitialSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedImage, setSelectedImage] = useState<ConfiguredImage | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState("")
  const [savingImageDetails, setSavingImageDetails] = useState(false)
  const [brokenPreviews, setBrokenPreviews] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const settingsRes = await fetch("/api/settings")
        const settingsData = settingsRes.ok ? await settingsRes.json() : {}

        const normalizedSettings = settingsData && typeof settingsData === "object" ? settingsData : {}
        setSettings(normalizedSettings)
        setInitialSettings(normalizedSettings)
      } catch {
        toast.error("تعذر تحميل الخلفيات")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const rows = useMemo(
    () =>
      PAGE_BACKGROUNDS.map((page) => {
        const key = `page_background_${page.id}`
        return {
          ...page,
          key,
          value: String(settings[key] || ""),
        }
      }),
    [settings]
  )
  const heroRows = useMemo(
    () =>
      HOME_HERO_IMAGES.map((item) => ({
        ...item,
        value: String(settings[item.key] || ""),
      })),
    [settings]
  )

  const configuredSettingImages = useMemo(
    () =>
      Object.entries(settings)
        .filter(([key, value]) => {
          if (!IMAGE_KEY_PATTERN.test(key)) return false
          if (EXCLUDED_COMPONENT_KEYS.test(key)) return false
          return String(value || "").trim().length > 0
        })
        .map(([key, value]) => ({
          key,
          value: String(value),
          sourceType: "setting" as const,
          settingKey: key,
        })),
    [settings]
  )

  const pageImages = useMemo(
    () =>
      rows
        .filter((row) => String(row.value || "").trim().length > 0)
        .map((row) => ({
          key: row.key,
          value: row.value,
          sourceType: "setting" as const,
          settingKey: row.key,
        })),
    [rows]
  )

  const componentImages = useMemo(
    () =>
      configuredSettingImages.filter(
        (item) => !PAGE_KEY_PATTERN.test(item.key)
      ),
    [configuredSettingImages]
  )

  const configuredImages = useMemo(() => [...pageImages, ...componentImages], [pageImages, componentImages])

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => row.label.toLowerCase().includes(q) || row.path.toLowerCase().includes(q) || row.key.toLowerCase().includes(q))
  }, [rows, query])

  const changedKeys = useMemo(
    () =>
      rows
        .filter((row) => (settings[row.key] || "") !== (initialSettings[row.key] || ""))
        .map((row) => row.key),
    [rows, settings, initialSettings]
  )

  const updateLocal = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setBrokenPreviews((prev) => ({ ...prev, [key]: false }))
  }

  const saveKey = async (key: string) => {
    setSavingKey(key)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: settings[key] ?? "" }),
      })
      if (!res.ok) throw new Error("save failed")
      setInitialSettings((prev) => ({ ...prev, [key]: settings[key] ?? "" }))
      toast.success("تم حفظ الخلفية")
    } catch {
      toast.error("فشل حفظ الخلفية")
    } finally {
      setSavingKey(null)
    }
  }

  const saveAllChanged = async () => {
    if (changedKeys.length === 0) return
    setSavingAll(true)
    try {
      const payload: Record<string, string> = {}
      changedKeys.forEach((key) => {
        payload[key] = settings[key] ?? ""
      })
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("save failed")
      setInitialSettings((prev) => ({ ...prev, ...payload }))
      toast.success(`تم حفظ ${changedKeys.length} خلفية`)
    } catch {
      toast.error("فشل الحفظ الجماعي")
    } finally {
      setSavingAll(false)
    }
  }

  const openImageDialog = (image: ConfiguredImage) => {
    setSelectedImage(image)
    setSelectedImageUrl(image.value)
  }

  const saveImageDetails = async () => {
    if (!selectedImage) return
    const nextUrl = selectedImageUrl.trim()
    if (!nextUrl) {
      toast.error("رابط الصورة فارغ")
      return
    }
    setSavingImageDetails(true)
    try {
      if (selectedImage.sourceType === "setting" && selectedImage.settingKey) {
        const key = selectedImage.settingKey
        const res = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [key]: nextUrl }),
        })
        if (!res.ok) throw new Error("save failed")
        setSettings((prev) => ({ ...prev, [key]: nextUrl }))
        setInitialSettings((prev) => ({ ...prev, [key]: nextUrl }))
      } else {
        throw new Error("unsupported source")
      }

      setSelectedImage((prev) => (prev ? { ...prev, value: nextUrl } : prev))
      toast.success("تم حفظ تفاصيل الصورة")
    } catch {
      toast.error("فشل حفظ تفاصيل الصورة")
    } finally {
      setSavingImageDetails(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[260px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[oklch(0.78_0.14_82)]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold gradient-text">
          <ImageIcon className="h-6 w-6 text-[oklch(0.78_0.14_82)]" />
          تبويب الخلفيات
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">إدارة خلفيات جميع صفحات الموقع من مكان واحد.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/45%)] p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن صفحة أو مسار..."
            className="ps-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">تغييرات غير محفوظة: {changedKeys.length}</span>
          <Button onClick={saveAllChanged} disabled={savingAll || changedKeys.length === 0} className="gap-2">
            {savingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ الكل
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/45%)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">صور هيدر الصفحة الرئيسية (10 صور)</h3>
        <p className="mb-3 text-xs text-muted-foreground">أضف 10 صور واضحة للهيدر (يفضل مقاس عريض 1920x1080 أو أعلى).</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {heroRows.map((row) => (
            <div key={row.key} className="space-y-2 rounded-lg border border-[oklch(0.78_0.14_82/12%)] bg-[oklch(0.12_0.03_265/55%)] p-3">
              <Label className="text-xs text-slate-300">{row.label}</Label>
              <Input
                value={settings[row.key] || ""}
                onChange={(e) => updateLocal(row.key, e.target.value)}
                placeholder="https://example.com/hero-image.jpg"
              />
              {row.value ? (
                <img
                  src={row.value}
                  alt={row.label}
                  className="h-24 w-full rounded-lg object-cover"
                  onError={() => setBrokenPreviews((prev) => ({ ...prev, [row.key]: true }))}
                />
              ) : null}
              {brokenPreviews[row.key] ? (
                <p className="text-[11px] text-amber-200">رابط الصورة غير صحيح أو الصورة غير متاحة.</p>
              ) : null}
              <div className="flex justify-end">
                <Button onClick={() => saveKey(row.key)} disabled={savingKey === row.key} className="gap-2">
                  {savingKey === row.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  حفظ
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/45%)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">صور الصفحات</h3>
        {pageImages.length === 0 ? (
          <p className="text-xs text-muted-foreground">لا توجد صور صفحات مضبوطة حاليًا.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pageImages.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => openImageDialog(item)}
                className="rounded-lg border border-[oklch(0.78_0.14_82/14%)] bg-[oklch(0.12_0.03_265/65%)] p-2 text-start transition hover:border-[oklch(0.78_0.14_82/35%)] hover:shadow-[0_0_18px_oklch(0.78_0.14_82/10%)]"
              >
                <img src={item.value} alt={item.key} className="h-24 w-full rounded-md object-cover" />
                <p className="mt-2 truncate text-[11px] text-slate-300" title={item.key}>
                  {item.key}
                </p>
                <p className="truncate text-[10px] text-slate-400" title={item.value}>
                  {item.value}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/45%)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">صور المكونات (بدون كروت المنصات)</h3>
        {componentImages.length === 0 ? (
          <p className="text-xs text-muted-foreground">لا توجد صور مكونات إضافية حاليًا.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {componentImages.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => openImageDialog(item)}
                className="rounded-lg border border-[oklch(0.78_0.14_82/14%)] bg-[oklch(0.12_0.03_265/65%)] p-2 text-start transition hover:border-[oklch(0.78_0.14_82/35%)] hover:shadow-[0_0_18px_oklch(0.78_0.14_82/10%)]"
              >
                <img src={item.value} alt={item.key} className="h-24 w-full rounded-md object-cover" />
                <p className="mt-2 truncate text-[11px] text-slate-300" title={item.key}>
                  {item.key}
                </p>
                <p className="truncate text-[10px] text-slate-400" title={item.value}>
                  {item.value}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filteredRows.map((row) => (
          <div
            key={row.id}
            className="grid gap-3 rounded-xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/45%)] p-4 md:grid-cols-[1.2fr_2fr_auto]"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{row.label}</p>
              <p className="text-xs text-muted-foreground">{row.path}</p>
              <p className="mt-1 text-[11px] text-muted-foreground/70">{row.key}</p>
              {(settings[row.key] || "") !== (initialSettings[row.key] || "") ? (
                <span className="mt-1 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300">
                  تعديل غير محفوظ
                </span>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">رابط الخلفية</Label>
              <Input
                value={settings[row.key] || ""}
                onChange={(e) => updateLocal(row.key, e.target.value)}
                placeholder="/uploads/media/page-bg.jpg"
              />
              <div className="flex items-center gap-2">
                <select
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs"
                  defaultValue=""
                  onChange={(e) => {
                    if (!e.target.value) return
                    updateLocal(row.key, e.target.value)
                    e.currentTarget.value = ""
                  }}
                >
                  <option value="">اختر صورة من الصور الحالية</option>
                  {configuredImages.map((img) => (
                    <option key={`${row.id}-${img.key}`} value={img.value}>
                      {img.key}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 gap-1"
                  onClick={() => {
                    const first = configuredImages[0]?.value
                    if (first) updateLocal(row.key, first)
                  }}
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  اقتراح
                </Button>
              </div>
              {row.value ? (
                brokenPreviews[row.key] ? (
                  <div className="flex h-24 w-full items-center justify-between rounded-lg border border-amber-400/35 bg-amber-500/10 px-3">
                    <span className="text-xs text-amber-200">الصورة غير موجودة أو الرابط غير صحيح</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const replacement = configuredImages.find((img) => img.value !== row.value)?.value
                        if (replacement) updateLocal(row.key, replacement)
                      }}
                    >
                      تطبيق صورة متاحة
                    </Button>
                  </div>
                ) : (
                  <img
                    src={row.value}
                    alt={row.label}
                    className="h-24 w-full rounded-lg object-cover"
                    onError={() => setBrokenPreviews((prev) => ({ ...prev, [row.key]: true }))}
                  />
                )
              ) : null}
            </div>

            <div className="flex items-start justify-end">
              <Button onClick={() => saveKey(row.key)} disabled={savingKey === row.key} className="gap-2">
                {savingKey === row.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedImage(null)
            setSelectedImageUrl("")
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الصورة</DialogTitle>
            <DialogDescription>يمكنك تعديل الرابط وحفظ التغييرات مباشرة من هذه النافذة.</DialogDescription>
          </DialogHeader>

          {selectedImage ? (
            <div className="space-y-4">
              <img src={selectedImageUrl || selectedImage.value} alt={selectedImage.key} className="h-64 w-full rounded-xl object-cover" />

              <div className="space-y-1">
                <Label>المعرف</Label>
                <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">{selectedImage.key}</p>
              </div>

              <div className="space-y-1">
                <Label>المصدر</Label>
                <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">
                  {selectedImage.sourceType === "setting" ? "إعدادات الموقع" : "بانرات المنصات"}
                </p>
              </div>

              <div className="space-y-1">
                <Label>رابط الصورة</Label>
                <Input value={selectedImageUrl} onChange={(e) => setSelectedImageUrl(e.target.value)} />
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedImage(null)}>إغلاق</Button>
            <Button onClick={saveImageDetails} disabled={savingImageDetails} className="gap-2">
              {savingImageDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ التعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

