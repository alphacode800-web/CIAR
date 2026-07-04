"use client"

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react"
import { Image as ImageIcon, Save, Loader2, Search, Pencil, Upload, Layers } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { resolveHeroImagePreviewUrl } from "@/lib/default-hero-images"

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

const PLATFORM_BANNER_FIELDS = [
  { field: "imageUrl1" as const, label: "البنر الأول" },
  { field: "imageUrl2" as const, label: "البنر الثاني" },
  { field: "imageUrl3" as const, label: "البنر الثالث" },
]

function MediaBannerPreview({
  value,
  alt,
  broken,
  onBroken,
  className,
  aspect = "wide",
  fit = "cover",
}: {
  value: string
  alt: string
  broken?: boolean
  onBroken?: () => void
  className?: string
  aspect?: "wide" | "card"
  fit?: "cover" | "contain"
}) {
  const aspectClass = aspect === "card" ? "aspect-video" : "aspect-[21/9]"
  const fitClass = fit === "contain" ? "object-contain" : "object-cover"

  if (!value?.trim()) {
    return (
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400 dark:bg-slate-900/80",
          aspectClass,
          className
        )}
      >
        <ImageIcon className="h-8 w-8 opacity-40" />
        <span className="px-2 text-center text-xs">لا توجد صورة</span>
      </div>
    )
  }

  if (broken) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center bg-amber-500/10 px-3 text-center text-xs text-amber-700 dark:text-amber-200",
          aspectClass,
          className
        )}
      >
        الرابط غير صالح
      </div>
    )
  }

  if (isLikelyVideo(value)) {
    return (
      <video
        src={value}
        className={cn("w-full", fitClass, aspectClass, className)}
        controls
        muted
        playsInline
      />
    )
  }

  return (
    <img
      src={value}
      alt={alt}
      className={cn("w-full", fitClass, aspectClass, className)}
      onError={onBroken}
    />
  )
}

function BannerCard({
  index,
  title,
  subtitle,
  value,
  previewValue,
  isDefaultPreview,
  placeholder,
  isChanged,
  isSaving,
  broken,
  onChange,
  onSave,
  onEdit,
  onBroken,
  extra,
}: {
  index?: number
  title: string
  subtitle?: string
  value: string
  previewValue?: string
  isDefaultPreview?: boolean
  placeholder: string
  isChanged?: boolean
  isSaving?: boolean
  broken?: boolean
  onChange: (value: string) => void
  onSave: () => void
  onEdit?: () => void
  onBroken?: () => void
  extra?: ReactNode
}) {
  const displayPreview = previewValue ?? value

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition hover:border-orange-400/40 dark:border-white/10 dark:bg-slate-900/60">
      <div className="relative isolate shrink-0 overflow-hidden">
        <MediaBannerPreview
          key={displayPreview}
          value={displayPreview}
          alt={title}
          broken={broken}
          onBroken={onBroken}
          aspect="card"
          className="rounded-none"
        />
        {typeof index === "number" ? (
          <span className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow">
            {index}
          </span>
        ) : null}
        {isDefaultPreview ? (
          <span className="absolute bottom-2 start-2 rounded-md bg-slate-900/75 px-1.5 py-0.5 text-[10px] font-medium text-white">
            افتراضي
          </span>
        ) : null}
        {isChanged ? (
          <span className="absolute start-2 top-2 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white shadow">
            غير محفوظ
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div className="min-h-[2.75rem]">
          <h4 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 dark:text-white">{title}</h4>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400" dir="ltr">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-medium text-slate-500">رابط الصورة</Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-8 text-xs"
            dir="ltr"
          />
        </div>

        {extra}

        <div className="mt-auto flex gap-2 pt-1">
          {onEdit ? (
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1 rounded-lg px-2.5" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
              تعديل
            </Button>
          ) : null}
          <Button
            onClick={onSave}
            disabled={isSaving}
            size="sm"
            className="h-8 flex-1 gap-1 rounded-lg"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            حفظ
          </Button>
        </div>
      </div>
    </article>
  )
}

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

  const filteredHeroRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return heroRows
    return heroRows.filter(
      (row) => row.label.toLowerCase().includes(q) || row.key.toLowerCase().includes(q)
    )
  }, [heroRows, query])

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
    <div className="space-y-8">
      {/* ── Header ── */}
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <ImageIcon className="h-6 w-6 text-orange-500" />
          إدارة الخلفيات والبنرات
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          كل بنر في كرت مستقل — 3 كروت في الصف مع معاينة واضحة وتحرير سريع.
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div className="admin-pro-panel sticky top-0 z-10 flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن بنر أو صفحة..."
            className="ps-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
            تغييرات غير محفوظة: <strong>{changedKeys.length}</strong>
          </span>
          <Button
            onClick={saveAllChanged}
            disabled={savingAll || changedKeys.length === 0}
            className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white"
          >
            {savingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ الكل
          </Button>
        </div>
      </div>

      {/* ── Homepage hero banners ── */}
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">بنرات هيدر الصفحة الرئيسية</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {filteredHeroRows.length} بنر — المعاينة تعرض الصورة الافتراضية إن لم يُحفظ رابط مخصص.
            </p>
          </div>
          <span className="shrink-0 rounded-xl bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-300">
            20 بنر
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredHeroRows.map((row, idx) => {
            const savedValue = settings[row.key] || ""
            const previewValue = resolveHeroImagePreviewUrl(savedValue, row.key)
            const isDefaultPreview = !savedValue.trim()

            return (
            <BannerCard
              key={row.key}
              index={idx + 1}
              title={row.label}
              value={savedValue}
              previewValue={previewValue}
              isDefaultPreview={isDefaultPreview}
              placeholder="https://example.com/hero.jpg"
              isChanged={savedValue !== (initialSettings[row.key] || "")}
              isSaving={savingKey === row.key}
              broken={brokenPreviews[row.key]}
              onChange={(v) => updateLocal(row.key, v)}
              onSave={() => saveKey(row.key)}
              onEdit={() =>
                openImageDialog({
                  key: row.label,
                  value: savedValue || previewValue,
                  sourceType: "setting",
                  settingKey: row.key,
                })
              }
              onBroken={() => setBrokenPreviews((prev) => ({ ...prev, [row.key]: true }))}
            />
            )
          })}
        </div>
      </section>

      {/* ── Page backgrounds ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-orange-500" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">خلفيات صفحات الموقع</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">خلفية كل صفحة في كرت مستقل.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRows.map((row) => (
            <BannerCard
              key={row.id}
              title={row.label}
              subtitle={row.path}
              value={settings[row.key] || ""}
              placeholder="/uploads/media/page-background.jpg"
              isChanged={(settings[row.key] || "") !== (initialSettings[row.key] || "")}
              isSaving={savingKey === row.key}
              broken={brokenPreviews[row.key]}
              onChange={(v) => updateLocal(row.key, v)}
              onSave={() => saveKey(row.key)}
              onEdit={() =>
                openImageDialog({
                  key: row.label,
                  value: settings[row.key] || "",
                  sourceType: "setting",
                  settingKey: row.key,
                })
              }
              onBroken={() => setBrokenPreviews((prev) => ({ ...prev, [row.key]: true }))}
              extra={
                <select
                  className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[11px] dark:border-white/10 dark:bg-slate-900"
                  defaultValue=""
                  onChange={(e) => {
                    if (!e.target.value) return
                    updateLocal(row.key, e.target.value)
                    e.currentTarget.value = ""
                  }}
                >
                  <option value="">اختر صورة جاهزة...</option>
                  {configuredImages.map((img) => (
                    <option key={`${row.id}-${img.key}`} value={img.value}>
                      {img.key}
                    </option>
                  ))}
                </select>
              }
            />
          ))}
        </div>
      </section>

      {/* ── Platform banners ── */}
      {platformBanners.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">بنرات المنصات</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">صور البنرات المرتبطة بكل منصة — 3 كروت في الصف.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {platformBanners.flatMap((banner) => {
              const bannerTitle = (banner.titleAr || banner.titleEn || banner.moduleId || banner.id).trim()
              return PLATFORM_BANNER_FIELDS.map(({ field, label }) => {
                const value = String(banner[field] || "")
                const fieldKey = `${banner.id}:${field}`
                return (
                  <BannerCard
                    key={fieldKey}
                    title={`${bannerTitle} — ${label}`}
                    value={value}
                    placeholder="https://example.com/banner.jpg"
                    isSaving={savingBannerKey === fieldKey}
                    onChange={(next) =>
                      setPlatformBanners((prev) =>
                        prev.map((row) => (row.id === banner.id ? { ...row, [field]: next } : row))
                      )
                    }
                    onSave={() => savePlatformBannerField(banner.id, field, value)}
                    onEdit={() =>
                      openImageDialog({
                        key: fieldKey,
                        value,
                        sourceType: "platform-banner",
                        bannerId: banner.id,
                        bannerField: field,
                      })
                    }
                  />
                )
              })
            })}
          </div>
        </section>
      ) : null}

      {/* ── Media gallery (configured images) ── */}
      {configuredImages.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">معرض الوسائط المستخدمة</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">جميع الصور والفيديوهات المضبوطة في الموقع.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {configuredImages.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => openImageDialog(item)}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white text-start shadow-sm transition hover:border-orange-400/40 dark:border-white/10 dark:bg-slate-900/60"
              >
                <MediaBannerPreview value={item.value} alt={item.key} aspect="card" className="rounded-none" />
                <div className="flex flex-1 flex-col gap-1 border-t border-slate-200/80 p-3 dark:border-white/8">
                  <p className="line-clamp-2 text-sm font-medium text-slate-900 dark:text-white">{item.key}</p>
                  <p className="truncate text-xs text-slate-500" dir="ltr">
                    {item.value}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-medium text-orange-500">
                    <Pencil className="h-3 w-3" />
                    تعديل
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

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
        <DialogContent className="admin-solid-dialog flex w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden border border-slate-200 !bg-white p-0 shadow-2xl dark:border-white/10 dark:!bg-slate-950 sm:max-w-2xl">
          {selectedImage ? (
            <>
              <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 pe-12 dark:border-white/10 dark:bg-slate-950">
                <DialogHeader className="space-y-1.5 text-start">
                  <DialogTitle className="text-base leading-snug sm:text-lg">{selectedImage.key}</DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    عدّل الرابط أو ارفع صورة جديدة ثم احفظ.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="relative h-48 w-full shrink-0 overflow-hidden bg-slate-950 sm:h-56">
                {selectedImageUrl || selectedImage.value ? (
                  isLikelyVideo(selectedImageUrl || selectedImage.value) ? (
                    <video
                      src={selectedImageUrl || selectedImage.value}
                      className="h-full w-full object-contain"
                      controls
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={selectedImageUrl || selectedImage.value}
                      alt={selectedImage.key}
                      className="h-full w-full object-contain"
                    />
                  )
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                    <ImageIcon className="h-8 w-8 opacity-50" />
                    <span className="text-xs">لا توجد معاينة</span>
                  </div>
                )}
              </div>

              <div className="flex max-h-[min(42vh,320px)] flex-col gap-4 overflow-y-auto bg-white p-5 dark:bg-slate-950">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">المصدر</Label>
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-white/10 dark:bg-slate-900">
                    {selectedImage.sourceType === "setting" ? "إعدادات الموقع" : "بانرات المنصات"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">طريقة التعديل</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={selectedImageSource === "link" ? "default" : "outline"}
                      className="h-9 rounded-lg"
                      onClick={() => setSelectedImageSource("link")}
                    >
                      رابط
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={selectedImageSource === "upload" ? "default" : "outline"}
                      className="h-9 rounded-lg"
                      onClick={() => setSelectedImageSource("upload")}
                    >
                      رفع ملف
                    </Button>
                  </div>
                </div>

                {selectedImageSource === "link" ? (
                  <div className="space-y-1.5">
                    <Label>رابط الصورة أو الفيديو</Label>
                    <Input
                      value={selectedImageUrl}
                      onChange={(e) => setSelectedImageUrl(e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      dir="ltr"
                      className="text-sm"
                    />
                    <p className="text-[11px] text-slate-500">
                      يُفضّل رابط صورة واحدة بعرض 1920 بكسل أو أكثر.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>رفع صورة أو فيديو من الجهاز</Label>
                    <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500 transition hover:border-orange-400 hover:bg-orange-50/50 dark:border-white/15 dark:bg-slate-900 dark:hover:bg-orange-500/5">
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
                          اضغط لاختيار ملف
                        </span>
                      )}
                    </label>
                    {selectedImageUrl ? (
                      <p
                        className="truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500 dark:border-white/10 dark:bg-slate-900"
                        dir="ltr"
                      >
                        {selectedImageUrl}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>

              <DialogFooter className="shrink-0 gap-2 border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950 sm:justify-between">
                <Button variant="outline" className="rounded-lg" onClick={() => setSelectedImage(null)}>
                  إغلاق
                </Button>
                <Button onClick={saveImageDetails} disabled={savingImageDetails} className="gap-2 rounded-lg">
                  {savingImageDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  حفظ التعديل
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

