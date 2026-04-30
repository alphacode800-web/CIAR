"use client"

import { useEffect, useMemo, useState } from "react"
import { Image as ImageIcon, Save, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

type MediaItem = {
  id: string
  originalName: string
  url: string
  category: string
}

type BannerRow = {
  id: string
  moduleId: string
  titleAr: string
  titleEn: string
  imageUrl1: string
  imageUrl2: string
  imageUrl3: string
  isActive?: boolean
  module?: { nameAr: string; nameEn: string }
}

type ImageSettingRow = {
  key: string
  value: string
}

const IMAGE_KEY_PATTERN = /(image|images|banner|background|bg|logo|hero)/i
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

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [banners, setBanners] = useState<BannerRow[]>([])
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [savingBannerId, setSavingBannerId] = useState<string | null>(null)
  const [savingSettingKey, setSavingSettingKey] = useState<string | null>(null)
  const [addingSetting, setAddingSetting] = useState(false)
  const [newSettingKey, setNewSettingKey] = useState("")
  const [newSettingValue, setNewSettingValue] = useState("")
  const [activeTab, setActiveTab] = useState<"banners" | "backgrounds" | "settings-images">("banners")

  const loadData = async () => {
    setLoading(true)
    try {
      const [mediaRes, bannersRes, settingsRes] = await Promise.all([
        fetch("/api/media?limit=100"),
        fetch("/api/super-platform/banners"),
        fetch("/api/settings"),
      ])

      const mediaData = mediaRes.ok ? await mediaRes.json() : []
      const bannersData = bannersRes.ok ? await bannersRes.json() : { banners: [] }
      const settingsData = settingsRes.ok ? await settingsRes.json() : {}

      setMedia(Array.isArray(mediaData) ? mediaData : [])
      setBanners(Array.isArray(bannersData?.banners) ? bannersData.banners : [])
      setSettings(settingsData && typeof settingsData === "object" ? settingsData : {})
    } catch {
      toast.error("تعذر تحميل الوسائط والبنرات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const imageSettings = useMemo<ImageSettingRow[]>(() => {
    return Object.entries(settings)
      .filter(([key, value]) => IMAGE_KEY_PATTERN.test(key) || /^https?:\/\//i.test(String(value)) || String(value).startsWith("/"))
      .map(([key, value]) => ({ key, value: String(value || "") }))
      .sort((a, b) => a.key.localeCompare(b.key))
  }, [settings])

  const backgroundRows = useMemo(
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

  const updateBannerField = (id: string, field: keyof BannerRow, value: string | boolean) => {
    setBanners((prev) => prev.map((banner) => (banner.id === id ? { ...banner, [field]: value } : banner)))
  }

  const saveBanner = async (banner: BannerRow) => {
    setSavingBannerId(banner.id)
    try {
      const res = await fetch(`/api/super-platform/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(banner),
      })
      if (!res.ok) throw new Error("save failed")
      toast.success("تم حفظ البانر بنجاح")
    } catch {
      toast.error("فشل حفظ البانر")
    } finally {
      setSavingBannerId(null)
    }
  }

  const updateSettingLocal = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const saveSingleSetting = async (key: string) => {
    setSavingSettingKey(key)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: settings[key] ?? "" }),
      })
      if (!res.ok) throw new Error("save failed")
      toast.success("تم حفظ التعديل")
    } catch {
      toast.error("فشل حفظ الإعداد")
    } finally {
      setSavingSettingKey(null)
    }
  }

  const addNewImageSetting = async () => {
    const key = newSettingKey.trim()
    if (!key) return
    setAddingSetting(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newSettingValue.trim() }),
      })
      if (!res.ok) throw new Error("save failed")
      setSettings((prev) => ({ ...prev, [key]: newSettingValue.trim() }))
      setNewSettingKey("")
      setNewSettingValue("")
      toast.success("تمت إضافة إعداد الصورة")
    } catch {
      toast.error("فشل إضافة الإعداد")
    } finally {
      setAddingSetting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#6f1d1b]">إدارة البنرات والخلفيات والصور</h1>
        <p className="mt-2 text-sm text-[#475569]">هنا يمكنك مشاهدة وتعديل كل وسائط الموقع من مكان واحد داخل لوحة الأدمن.</p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/55 bg-white/45 p-2">
        {[
          { id: "banners" as const, label: "بنرات المنصات" },
          { id: "backgrounds" as const, label: "الخلفيات" },
          { id: "settings-images" as const, label: "صور الإعدادات" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id ? "bg-[#1e3a5f] text-white" : "bg-white/50 text-[#334155] hover:bg-white/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "banners" ? (
        <section className="rounded-2xl border border-white/55 bg-white/40 p-5 backdrop-blur-xl">
          <div className="space-y-4">
            {banners.map((banner) => (
              <div key={banner.id} className="rounded-xl border border-white/55 bg-white/45 p-4">
                <p className="font-semibold text-[#1e3a5f]">
                  {banner.module?.nameAr || banner.titleAr || banner.module?.nameEn || banner.titleEn}
                </p>
                <p className="mb-3 text-xs text-[#64748b]">{banner.moduleId}</p>

                <div className="grid gap-3 md:grid-cols-3">
                  {(["imageUrl1", "imageUrl2", "imageUrl3"] as const).map((field, idx) => (
                    <div key={field} className="space-y-2">
                      <Label className="text-[#334155]">صورة {idx + 1}</Label>
                      <Input
                        value={banner[field] || ""}
                        onChange={(e) => updateBannerField(banner.id, field, e.target.value)}
                        placeholder="/uploads/media/example.png"
                        className="bg-white/70 text-[#1e3a5f]"
                      />
                      {banner[field] ? (
                        <img src={banner[field]} alt={`banner-${idx + 1}`} className="h-24 w-full rounded-lg object-cover" />
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    onClick={() => saveBanner(banner)}
                    className="bg-[#1e3a5f] text-white hover:bg-[#173150]"
                    disabled={savingBannerId === banner.id}
                  >
                    {savingBannerId === banner.id ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}
                    حفظ البانر
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "backgrounds" ? (
        <section className="rounded-2xl border border-white/55 bg-white/40 p-5 backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-semibold text-[#7a2e1f]">خلفيات جميع الصفحات</h2>
          <div className="space-y-3">
            {backgroundRows.map((row) => (
              <div key={row.id} className="grid gap-3 rounded-xl border border-white/55 bg-white/45 p-4 md:grid-cols-[1.2fr_2fr_auto]">
                <div>
                  <p className="text-sm font-semibold text-[#1e3a5f]">{row.label}</p>
                  <p className="text-xs text-[#64748b]">{row.path}</p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">{row.key}</p>
                </div>
                <div className="space-y-2">
                  <Input
                    value={settings[row.key] || ""}
                    onChange={(e) => updateSettingLocal(row.key, e.target.value)}
                    placeholder="/uploads/media/page-bg.jpg"
                    className="bg-white/70 text-[#1e3a5f]"
                  />
                  {settings[row.key] ? <img src={settings[row.key]} alt={row.label} className="h-24 w-full rounded-lg object-cover" /> : null}
                </div>
                <div className="flex items-start justify-end">
                  <Button
                    onClick={() => saveSingleSetting(row.key)}
                    disabled={savingSettingKey === row.key}
                    className="bg-[#1e3a5f] text-white hover:bg-[#173150]"
                  >
                    {savingSettingKey === row.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "settings-images" ? (
        <section className="rounded-2xl border border-white/55 bg-white/40 p-5 backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-semibold text-[#7a2e1f]">خلفيات وصور الإعدادات</h2>
          <div className="mb-4 grid gap-3 rounded-xl border border-dashed border-white/60 bg-white/40 p-4 md:grid-cols-[1fr_2fr_auto]">
            <Input
              value={newSettingKey}
              onChange={(e) => setNewSettingKey(e.target.value)}
              placeholder="المفتاح: hero_background_image"
              className="bg-white/70 text-[#1e3a5f]"
            />
            <Input
              value={newSettingValue}
              onChange={(e) => setNewSettingValue(e.target.value)}
              placeholder="رابط الصورة"
              className="bg-white/70 text-[#1e3a5f]"
            />
            <Button onClick={addNewImageSetting} disabled={addingSetting} className="bg-[#1e3a5f] text-white hover:bg-[#173150]">
              {addingSetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          <div className="space-y-3">
            {imageSettings.map((row) => (
              <div key={row.key} className="grid gap-3 rounded-xl border border-white/55 bg-white/45 p-4 md:grid-cols-[1.1fr_2fr_auto]">
                <div>
                  <p className="text-sm font-semibold text-[#1e3a5f]">{row.key}</p>
                </div>
                <div className="space-y-2">
                  <Input
                    value={settings[row.key] || ""}
                    onChange={(e) => updateSettingLocal(row.key, e.target.value)}
                    className="bg-white/70 text-[#1e3a5f]"
                  />
                  {settings[row.key] ? (
                    <img src={settings[row.key]} alt={row.key} className="h-20 w-full rounded-lg object-cover" />
                  ) : null}
                </div>
                <div className="flex items-start justify-end">
                  <Button
                    onClick={() => saveSingleSetting(row.key)}
                    disabled={savingSettingKey === row.key}
                    className="bg-[#1e3a5f] text-white hover:bg-[#173150]"
                  >
                    {savingSettingKey === row.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/55 bg-white/40 p-5 backdrop-blur-xl">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#7a2e1f]">
          <ImageIcon className="h-5 w-5" />
          مكتبة الوسائط المرفوعة
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {media.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/55 bg-white/45 p-2">
              <img src={item.url} alt={item.originalName} className="h-24 w-full rounded-lg object-cover" />
              <p className="mt-2 truncate text-xs text-[#334155]" title={item.originalName}>
                {item.originalName}
              </p>
              <p className="truncate text-[11px] text-[#64748b]" title={item.url}>
                {item.url}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

