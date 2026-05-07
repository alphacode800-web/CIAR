"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { Image as ImageIcon, Save, Loader2, Search, Wand2, Pencil, Upload } from "lucide-react"
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
  { id: "admin-super", label: "لوحة الأدمن - المنصات والمحتوى", path: "/admin/super-platform" },
  { id: "admin-media", label: "لوحة الأدمن - الوسائط", path: "/admin/media" },
]
const HOME_HERO_IMAGES = [
  { key: "home_hero_image_1", label: "صورة الهيدر 1 (سياحة / طيران)" },
  { key: "home_hero_image_2", label: "صورة الهيدر 2 (عقارات)" },
  { key: "home_hero_image_3", label: "صورة الهيدر 3 (تجارة / مول)" },
  { key: "home_hero_image_4", label: "صورة الهيدر 4 (سيارات)" },
  { key: "home_hero_image_5", label: "صورة الهيدر 5 (شحن / لوجستيات)" },
  { key: "home_hero_image_6", label: "صورة الهيدر 6 (فرق / توظيف)" },
  { key: "home_hero_image_7", label: "صورة الهيدر 7 (تحليلات / إعلان)" },
  { key: "home_hero_image_8", label: "صورة الهيدر 8 (دفع / تجارة إلكترونية)" },
  { key: "home_hero_image_9", label: "صورة الهيدر 9 (ضيافة)" },
  { key: "home_hero_image_10", label: "صورة الهيدر 10 (أزياء)" },
  { key: "home_hero_image_11", label: "صورة الهيدر 11 (خدمات مهنية)" },
  { key: "home_hero_image_12", label: "صورة الهيدر 12 (صيانة / خدمات ميدانية)" },
  { key: "home_hero_image_13", label: "صورة الهيدر 13 (فاخر / VIP)" },
  { key: "home_hero_image_14", label: "صورة الهيدر 14 (استثمار / أعمال)" },
  { key: "home_hero_image_15", label: "صورة الهيدر 15 (حملات / منتج)" },
  { key: "home_hero_image_16", label: "صورة الهيدر 16 (لوجستيات عالمية)" },
  { key: "home_hero_image_17", label: "صورة الهيدر 17 (تسويق / إبداع)" },
  { key: "home_hero_image_18", label: "صورة الهيدر 18 (شراكات)" },
  { key: "home_hero_image_19", label: "صورة الهيدر 19 (مساحات عمل)" },
  { key: "home_hero_image_20", label: "صورة الهيدر 20 (رقمي / منصة)" },
]
const MEDIA_KEY_PATTERN = /(image|images|banner|background|bg|logo|hero|video|poster)/i
const PAGE_KEY_PATTERN = /^page_background_/i

type BannerRow = {
  id: string
  moduleId: string
  titleAr?: string
  titleEn?: string
  imageUrl1?: string
  imageUrl2?: string
  imageUrl3?: string
}

type ConfiguredMedia = {
  key: string
  value: string
  sourceType: "setting" | "platform-banner"
  settingKey?: string
  bannerId?: string
  bannerField?: "imageUrl1" | "imageUrl2" | "imageUrl3"
}

const isLikelyVideo = (url: string) => /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(String(url || "").trim())

export function BackgroundsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [initialSettings, setInitialSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  const [savingBannerKey, setSavingBannerKey] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [selectedImage, setSelectedImage] = useState<ConfiguredMedia | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState("")
  const [selectedImageSource, setSelectedImageSource] = useState<"link" | "upload">("link")
  const [savingImageDetails, setSavingImageDetails] = useState(false)
  const [uploadingImageDetails, setUploadingImageDetails] = useState(false)
  const [brokenPreviews, setBrokenPreviews] = useState<Record<string, boolean>>({})
  const [platformBanners, setPlatformBanners] = useState<BannerRow[]>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [settingsRes, bannersRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/super-platform/banners"),
        ])
        const settingsData = settingsRes.ok ? await settingsRes.json() : {}
        const bannersData = bannersRes.ok ? await bannersRes.json() : {}

        const normalizedSettings = settingsData && typeof settingsData === "object" ? settingsData : {}
        setSettings(normalizedSettings)
        setInitialSettings(normalizedSettings)
        const rows = Array.isArray(bannersData?.banners)
          ? bannersData.banners.map((row: BannerRow) => ({
              id: String(row.id || ""),
              moduleId: String(row.moduleId || ""),
              titleAr: String(row.titleAr || ""),
              titleEn: String(row.titleEn || ""),
              imageUrl1: String(row.imageUrl1 || ""),
              imageUrl2: String(row.imageUrl2 || ""),
              imageUrl3: String(row.imageUrl3 || ""),
            }))
          : []
        setPlatformBanners(rows.filter((row: BannerRow) => row.id))
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

  const configuredSettingMedia = useMemo(
    () =>
      Object.entries(settings)
        .filter(([key, value]) => {
          if (!MEDIA_KEY_PATTERN.test(key)) return false
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
      configuredSettingMedia.filter(
        (item) => !PAGE_KEY_PATTERN.test(item.key)
      ),
    [configuredSettingMedia]
  )

  const platformBannerMedia = useMemo<ConfiguredMedia[]>(
    () =>
      platformBanners.flatMap((banner) => {
        const base = banner.titleAr || banner.titleEn || banner.moduleId || banner.id
        return (["imageUrl1", "imageUrl2", "imageUrl3"] as const)
          .map((field) => {
            const value = String(banner[field] || "").trim()
            if (!value) return null
            return {
              key: `platform_banner_${base}_${field}`,
              value,
              sourceType: "platform-banner" as const,
              bannerId: banner.id,
              bannerField: field,
            }
          })
          .filter(Boolean) as ConfiguredMedia[]
      }),
    [platformBanners]
  )

  const configuredImages = useMemo(
    () => [...pageImages, ...componentImages, ...platformBannerMedia],
    [pageImages, componentImages, platformBannerMedia]
  )

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => row.label.toLowerCase().includes(q) || row.path.toLowerCase().includes(q) || row.key.toLowerCase().includes(q))
  }, [rows, query])

  const changedKeys = useMemo(
    () =>
      [...rows, ...heroRows]
        .filter((row) => (settings[row.key] || "") !== (initialSettings[row.key] || ""))
        .map((row) => row.key),
    [rows, heroRows, settings, initialSettings]
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

  const openImageDialog = (image: ConfiguredMedia) => {
    setSelectedImage(image)
    setSelectedImageUrl(image.value)
    setSelectedImageSource("link")
  }

  const uploadMediaFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("category", "hero")
    const res = await fetch("/api/media", {
      method: "POST",
      body: formData,
    })
    if (!res.ok) throw new Error("upload failed")
    const result = await res.json()
    return String(result?.url || "")
  }

  const handleDialogFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.currentTarget.value = ""
    if (!file) return
    setUploadingImageDetails(true)
    try {
      const uploadedUrl = await uploadMediaFile(file)
      if (!uploadedUrl) throw new Error("empty upload url")
      setSelectedImageUrl(uploadedUrl)
      toast.success("تم رفع الملف بنجاح")
    } catch {
      toast.error("فشل رفع الملف")
    } finally {
      setUploadingImageDetails(false)
    }
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
      } else if (
        selectedImage.sourceType === "platform-banner" &&
        selectedImage.bannerId &&
        selectedImage.bannerField
      ) {
        const target = platformBanners.find((row) => row.id === selectedImage.bannerId)
        if (!target) throw new Error("banner not found")
        const payload = {
          ...target,
          [selectedImage.bannerField]: nextUrl,
        }
        const res = await fetch(`/api/super-platform/banners/${selectedImage.bannerId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("save failed")
        setPlatformBanners((prev) =>
          prev.map((row) =>
            row.id === selectedImage.bannerId
              ? { ...row, [selectedImage.bannerField!]: nextUrl }
              : row
          )
        )
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

  const savePlatformBannerField = async (
    bannerId: string,
    field: "imageUrl1" | "imageUrl2" | "imageUrl3",
    value: string
  ) => {
    const target = platformBanners.find((row) => row.id === bannerId)
    if (!target) return
    const key = `${bannerId}:${field}`
    setSavingBannerKey(key)
    try {
      const payload = { ...target, [field]: value }
      const res = await fetch(`/api/super-platform/banners/${bannerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("save failed")
      setPlatformBanners((prev) => prev.map((row) => (row.id === bannerId ? { ...row, [field]: value } : row)))
      toast.success("تم حفظ صورة البنر")
    } catch {
      toast.error("فشل حفظ صورة البنر")
    } finally {
      setSavingBannerKey(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[260px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[oklch(0.76_0.19_48)]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold gradient-text">
          <ImageIcon className="h-6 w-6 text-[oklch(0.76_0.19_48)]" />
          تبويب الخلفيات
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">إدارة خلفيات جميع صفحات الموقع من مكان واحد.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[oklch(0.76_0.19_48/10%)] bg-[oklch(0.14_0.028_265/45%)] p-4 md:flex-row md:items-center md:justify-between">
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

      <div className="rounded-xl border border-[oklch(0.76_0.19_48/10%)] bg-[oklch(0.14_0.028_265/45%)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">صور هيدر الصفحة الرئيسية (20 صورة)</h3>
        <p className="mb-3 text-xs text-muted-foreground">أضف حتى 20 صورة للهيدر تعكس منتجات وخدمات المنصة (يفضل عريض 1920×1080 أو أعلى).</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {heroRows.map((row) => (
            <div key={row.key} className="space-y-2 rounded-lg border border-[oklch(0.76_0.19_48/12%)] bg-[oklch(0.12_0.03_265/55%)] p-3">
              <Label className="text-xs text-slate-300">{row.label}</Label>
              <Input
                value={settings[row.key] || ""}
                onChange={(e) => updateLocal(row.key, e.target.value)}
                placeholder="https://example.com/hero-image.jpg"
              />
              {row.value ? (
                isLikelyVideo(row.value) ? (
                  <video src={row.value} className="h-24 w-full rounded-lg object-cover" controls muted playsInline />
                ) : (
                  isLikelyVideo(row.value) ? (
                    <video src={row.value} className="h-24 w-full rounded-lg object-cover" controls muted playsInline />
                  ) : (
                    <img
                      src={row.value}
                      alt={row.label}
                      className="h-24 w-full rounded-lg object-cover"
                      onError={() => setBrokenPreviews((prev) => ({ ...prev, [row.key]: true }))}
                    />
                  )
                )
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

      <div className="rounded-xl border border-[oklch(0.76_0.19_48/10%)] bg-[oklch(0.14_0.028_265/45%)] p-4">
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
                className="rounded-lg border border-[oklch(0.76_0.19_48/14%)] bg-[oklch(0.12_0.03_265/65%)] p-2 text-start transition hover:border-[oklch(0.76_0.19_48/35%)] hover:shadow-[0_0_18px_oklch(0.76_0.19_48/10%)]"
              >
                {isLikelyVideo(item.value) ? (
                  <video src={item.value} className="h-24 w-full rounded-md object-cover" controls muted playsInline />
                ) : (
                  <img src={item.value} alt={item.key} className="h-24 w-full rounded-md object-cover" />
                )}
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

      <div className="rounded-xl border border-[oklch(0.76_0.19_48/10%)] bg-[oklch(0.14_0.028_265/45%)] p-4">
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
                className="rounded-lg border border-[oklch(0.76_0.19_48/14%)] bg-[oklch(0.12_0.03_265/65%)] p-2 text-start transition hover:border-[oklch(0.76_0.19_48/35%)] hover:shadow-[0_0_18px_oklch(0.76_0.19_48/10%)]"
              >
                {isLikelyVideo(item.value) ? (
                  <video src={item.value} className="h-24 w-full rounded-md object-cover" controls muted playsInline />
                ) : (
                  <img src={item.value} alt={item.key} className="h-24 w-full rounded-md object-cover" />
                )}
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

      <div className="rounded-xl border border-[oklch(0.76_0.19_48/10%)] bg-[oklch(0.14_0.028_265/45%)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">صور بنرات المنصات الحالية</h3>
        {platformBanners.length === 0 ? (
          <p className="text-xs text-muted-foreground">لا توجد بنرات منصات حالياً.</p>
        ) : (
          <div className="space-y-3">
            {platformBanners.map((banner) => (
              <div key={banner.id} className="rounded-lg border border-border/40 bg-background/40 p-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  {(banner.titleAr || banner.titleEn || banner.moduleId || banner.id).trim()}
                </p>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  {(["imageUrl1", "imageUrl2", "imageUrl3"] as const).map((field) => {
                    const value = String(banner[field] || "")
                    const fieldKey = `${banner.id}:${field}`
                    return (
                      <div key={fieldKey} className="space-y-2 rounded-lg border border-border/40 p-3">
                        <Label className="text-[11px] text-muted-foreground">{field}</Label>
                        {value ? (
                          isLikelyVideo(value) ? (
                            <video src={value} className="h-44 w-full rounded-md object-cover" controls muted playsInline />
                          ) : (
                            <img src={value} className="h-44 w-full rounded-md object-cover" alt={fieldKey} />
                          )
                        ) : (
                          <div className="flex h-44 items-center justify-center rounded-md border border-dashed border-border/50 text-xs text-muted-foreground">
                            لا يوجد محتوى
                          </div>
                        )}
                        <Input
                          value={value}
                          onChange={(e) =>
                            setPlatformBanners((prev) =>
                              prev.map((row) =>
                                row.id === banner.id ? { ...row, [field]: e.target.value } : row
                              )
                            )
                          }
                          placeholder="https://example.com/banner-image.jpg"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() =>
                              openImageDialog({
                                key: fieldKey,
                                value,
                                sourceType: "platform-banner",
                                bannerId: banner.id,
                                bannerField: field,
                              })
                            }
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            تعديل
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => savePlatformBannerField(banner.id, field, value)}
                            disabled={savingBannerKey === fieldKey}
                            className="gap-2"
                          >
                            {savingBannerKey === fieldKey ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Save className="h-3.5 w-3.5" />
                            )}
                            حفظ
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filteredRows.map((row) => (
          <div
            key={row.id}
            className="grid gap-3 rounded-xl border border-[oklch(0.76_0.19_48/10%)] bg-[oklch(0.14_0.028_265/45%)] p-4 md:grid-cols-[1.2fr_2fr_auto]"
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
            setSelectedImageSource("link")
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
              {isLikelyVideo(selectedImageUrl || selectedImage.value) ? (
                <video
                  src={selectedImageUrl || selectedImage.value}
                  className="h-64 w-full rounded-xl object-cover"
                  controls
                  muted
                  playsInline
                />
              ) : (
                <img src={selectedImageUrl || selectedImage.value} alt={selectedImage.key} className="h-64 w-full rounded-xl object-cover" />
              )}

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
                <Label>طريقة التعديل</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={selectedImageSource === "link" ? "default" : "outline"}
                    onClick={() => setSelectedImageSource("link")}
                  >
                    رابط
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={selectedImageSource === "upload" ? "default" : "outline"}
                    onClick={() => setSelectedImageSource("upload")}
                  >
                    رفع من الهاتف/الجهاز
                  </Button>
                </div>
              </div>

              {selectedImageSource === "link" ? (
                <div className="space-y-1">
                  <Label>رابط الصورة/الفيديو</Label>
                  <Input value={selectedImageUrl} onChange={(e) => setSelectedImageUrl(e.target.value)} />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>رفع صورة أو فيديو</Label>
                  <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-xs text-muted-foreground transition hover:border-[oklch(0.76_0.19_48/45%)]">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v"
                      onChange={handleDialogFileUpload}
                    />
                    {uploadingImageDetails ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري الرفع...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <Upload className="h-4 w-4" />
                        اختر ملف من الجهاز
                      </span>
                    )}
                  </label>
                  {selectedImageUrl ? (
                    <p className="truncate rounded-md border border-border bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground">
                      {selectedImageUrl}
                    </p>
                  ) : null}
                </div>
              )}
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

