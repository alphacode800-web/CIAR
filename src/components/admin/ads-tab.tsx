"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Megaphone,
  Save,
  Trash2,
  Loader2,
  Eye,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Pencil,
  FileText,
  LayoutTemplate,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
  AD_DURATION_OPTIONS,
  AD_PLACEMENTS,
  AD_POSITIONS,
  AD_PLACEMENT_META,
  computeAdEndDate,
  getPlacementLabel,
  getPositionLabel,
  type AdPlacement,
  type AdPosition,
  type PendingAdRequestItem,
  type SiteAdRecord,
} from "@/lib/site-ads"
import { isDefaultSiteAd } from "@/lib/default-site-ads"
import { AdPlacementPreview } from "@/components/ads/ad-placement-preview"
import { SiteAdBanner } from "@/components/ads/site-ad-banner"
import { AdProductDetailsForm } from "@/components/ads/ad-product-details-form"
import { AdProductDetailsCard } from "@/components/ads/ad-product-details-card"
import { emptyAdProductDetails, type AdProductDetails } from "@/lib/ad-product-details"
import type { AdPricingConfig } from "@/lib/ad-pricing"
import { defaultAdPricingConfig } from "@/lib/ad-pricing"
import type { AdListingTypesStore } from "@/lib/ad-listing-types-config"
import { defaultAdListingTypesStore } from "@/lib/ad-listing-types-config"
import { AdPricingAdminPanel } from "@/components/ads/ad-pricing-admin-panel"
import { AdListingTypesAdminPanel } from "@/components/ads/ad-listing-types-admin-panel"
import { cn } from "@/lib/utils"

type AdsView = "list" | "editor" | "pending"

const emptyDraft = (): Partial<SiteAdRecord> & {
  companyName: string
  title: string
  description: string
  placement: AdPlacement
  position: AdPosition
  durationDays: number
} => ({
  companyName: "",
  title: "",
  description: "",
  link: "",
  imageUrl: "",
  placement: "home_after_platforms",
  position: "slot_1",
  durationDays: 30,
  status: "active",
  locale: "ar",
  productDetails: emptyAdProductDetails(),
})

function statusBadge(status: string) {
  if (status === "active") return "default"
  if (status === "pending") return "secondary"
  if (status === "expired") return "outline"
  return "destructive"
}

function AdLivePreview({ ad, locale }: { ad: SiteAdRecord; locale: "ar" | "en" }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/50 bg-[oklch(0.10_0.025_265)] p-4">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-[oklch(0.76_0.19_48)]">
          <Eye className="h-3.5 w-3.5" />
          {locale === "ar" ? "معاينة الإعلان في الموقع" : "Live ad preview"}
        </p>
        <SiteAdBanner ad={ad} compact />
      </div>
      <AdPlacementPreview placement={ad.placement} position={ad.position} previewAd={ad} locale={locale} />
    </div>
  )
}

export function AdsTab() {
  const { t, locale } = useI18n()
  const isAr = locale === "ar"
  const [view, setView] = useState<AdsView>("list")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ads, setAds] = useState<SiteAdRecord[]>([])
  const [pending, setPending] = useState<PendingAdRequestItem[]>([])
  const [draft, setDraft] = useState(emptyDraft())
  const [reviewingItem, setReviewingItem] = useState<PendingAdRequestItem | null>(null)
  const [reviewDetails, setReviewDetails] = useState<AdProductDetails>(emptyAdProductDetails())
  const [pricing, setPricing] = useState<AdPricingConfig>(defaultAdPricingConfig())
  const [listingTypes, setListingTypes] = useState<AdListingTypesStore>(defaultAdListingTypesStore())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/ads")
      const data = await res.json()
      setAds(Array.isArray(data.ads) ? data.ads : [])
      setPending(Array.isArray(data.pending) ? data.pending : [])
      if (data.pricing) setPricing(data.pricing)
      if (data.listingTypes) setListingTypes(data.listingTypes)
    } catch {
      toast.error(t("admin.ads_load_failed") || "تعذر تحميل الإعلانات")
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const previewAd = useMemo<SiteAdRecord>(() => {
    const startsAt = draft.startsAt || new Date().toISOString()
    return {
      id: draft.id || "preview",
      companyName: draft.companyName || (isAr ? "شركة مثال" : "Sample Co."),
      title: draft.title || (isAr ? "عنوان الإعلان" : "Ad title"),
      description: draft.description || (isAr ? "وصف الإعلان يظهر هنا في الموقع" : "Ad description preview"),
      link: draft.link || "",
      imageUrl: draft.imageUrl || "",
      placement: draft.placement || "home_after_platforms",
      position: draft.position || "slot_1",
      durationDays: draft.durationDays || 30,
      startsAt,
      endsAt: computeAdEndDate(startsAt, draft.durationDays || 30),
      status: "active",
      locale: draft.locale || "ar",
      createdAt: startsAt,
      updatedAt: startsAt,
      productDetails: draft.productDetails,
    }
  }, [draft, isAr])

  const openCreate = () => {
    setDraft(emptyDraft())
    setView("editor")
  }

  const openEdit = (ad: SiteAdRecord) => {
    setDraft({ ...ad, productDetails: ad.productDetails || emptyAdProductDetails() })
    setView("editor")
  }

  const openReview = (item: PendingAdRequestItem) => {
    setReviewingItem(item)
    const details = { ...emptyAdProductDetails(), ...item.productDetails }
    setReviewDetails(details)
    setDraft((prev) => ({
      ...prev,
      companyName: item.companyName,
      title: item.title,
      description: item.description,
      link: item.link,
      imageUrl: item.imageUrl,
      placement: details.requestedPlacement || prev.placement || "home_after_platforms",
      position: details.requestedPosition || prev.position || "slot_1",
      durationDays: details.requestedDurationDays || prev.durationDays || 30,
      productDetails: details,
    }))
    setView("pending")
  }

  const saveAd = async () => {
    if (!draft.companyName?.trim() || !draft.title?.trim() || !draft.description?.trim()) {
      toast.error(t("admin.ads_required_fields") || "أكمل الحقول المطلوبة")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/ads", {
        method: draft.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      })
      if (!res.ok) throw new Error("save failed")
      toast.success(t("admin.ads_saved") || "تم حفظ الإعلان")
      setView("list")
      load()
    } catch {
      toast.error(t("admin.ads_save_failed") || "فشل حفظ الإعلان")
    } finally {
      setSaving(false)
    }
  }

  const approvePending = async (item: PendingAdRequestItem) => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          pendingId: item.id,
          source: item.source,
          placement: draft.placement || reviewDetails.requestedPlacement || "home_after_platforms",
          position: draft.position || reviewDetails.requestedPosition || "slot_1",
          durationDays: draft.durationDays || reviewDetails.requestedDurationDays || 30,
          title: draft.title || item.title,
          description: draft.description || item.description,
          link: draft.link ?? item.link,
          imageUrl: draft.imageUrl ?? item.imageUrl,
          productDetails: { ...reviewDetails, paymentStatus: reviewDetails.paymentStatus || "paid" },
        }),
      })
      if (!res.ok) throw new Error("approve failed")
      toast.success(t("admin.ads_approved") || "تمت الموافقة ونشر الإعلان")
      setReviewingItem(null)
      load()
    } catch {
      toast.error(t("admin.ads_approve_failed") || "فشلت الموافقة")
    } finally {
      setSaving(false)
    }
  }

  const rejectPending = async (item: PendingAdRequestItem) => {
    if (!confirm(isAr ? "رفض هذا الطلب؟" : "Reject this request?")) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          pendingId: item.id,
          source: item.source,
        }),
      })
      if (!res.ok) throw new Error("reject failed")
      toast.success(isAr ? "تم رفض الطلب" : "Request rejected")
      if (reviewingItem?.id === item.id) setReviewingItem(null)
      load()
    } catch {
      toast.error(isAr ? "فشل الرفض" : "Reject failed")
    } finally {
      setSaving(false)
    }
  }

  const deleteAd = async (id: string) => {
    if (!confirm(isAr ? "حذف هذا الإعلان؟" : "Delete this ad?")) return
    try {
      const res = await fetch(`/api/admin/ads?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
      toast.success(t("admin.ads_deleted") || "تم حذف الإعلان")
      load()
    } catch {
      toast.error(t("admin.ads_delete_failed") || "فشل الحذف")
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
            <Megaphone className="h-6 w-6 text-primary" />
            {t("admin.ads") || "إدارة الإعلانات"}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("admin.ads_desc") ||
              "تحكم بالموضع الأول والثاني، مدة الإعلان، الموافقة على طلبات العملاء، ومعاينة مكان الظهور في الموقع."}
          </p>
        </div>
        {view === "editor" ? (
          <Button onClick={saveAd} disabled={saving} className="gap-2 rounded-full btn-gold">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("common.save") || "حفظ"}
          </Button>
        ) : (
          <Button onClick={openCreate} className="gap-2 rounded-full btn-gold">
            <Plus className="h-4 w-4" />
            {t("admin.ads_add") || "إعلان جديد"}
          </Button>
        )}
      </div>

      <AdListingTypesAdminPanel initialStore={listingTypes} isAr={isAr} onSaved={setListingTypes} />

      <AdPricingAdminPanel initialPricing={pricing} isAr={isAr} onSaved={setPricing} />

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "list" as const, label: isAr ? "كل الإعلانات" : "All ads", count: ads.length },
            { id: "editor" as const, label: draft.id ? (isAr ? "تعديل إعلان" : "Edit ad") : (isAr ? "إنشاء إعلان" : "Create ad") },
            { id: "pending" as const, label: isAr ? "طلبات معلقة" : "Pending", count: pending.length },
          ] as const
        ).map((tab) => (
          <Button
            key={tab.id}
            type="button"
            variant={view === tab.id ? "default" : "outline"}
            className={cn("rounded-full gap-2", view === tab.id && "btn-gold")}
            onClick={() => setView(tab.id)}
          >
            {tab.label}
            {"count" in tab && tab.count !== undefined ? (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {tab.count}
              </Badge>
            ) : null}
          </Button>
        ))}
      </div>

      {view === "list" ? (
        <section className="space-y-3 rounded-2xl border border-border/40 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            {t("admin.ads_all") || "كل الإعلانات"}
          </div>
          {ads.length === 0 ? (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              {t("admin.ads_empty") || "لا إعلانات منشورة بعد"}
            </p>
          ) : (
            ads.map((ad) => (
              <div key={ad.id} className="rounded-xl border border-border/30 bg-muted/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{ad.title}</p>
                      <Badge variant={statusBadge(ad.status)}>{ad.status}</Badge>
                      {isDefaultSiteAd(ad) ? (
                        <Badge variant="outline">{isAr ? "افتراضي" : "Default"}</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{ad.companyName}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {getPlacementLabel(ad.placement, isAr ? "ar" : "en")}
                      </span>
                      <span>· {getPositionLabel(ad.position, isAr ? "ar" : "en")}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {ad.durationDays} {isAr ? "يوم" : "days"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1 rounded-full" onClick={() => openEdit(ad)}>
                      <Pencil className="h-3.5 w-3.5" />
                      {t("common.edit") || "تعديل"}
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1 rounded-full" onClick={() => deleteAd(ad.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      {t("common.delete") || "حذف"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      ) : null}

      {view === "pending" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <section className="space-y-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4 text-amber-600" />
              {t("admin.ads_pending") || "طلبات بانتظار الموافقة"}
            </div>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">{isAr ? "لا طلبات معلقة حالياً" : "No pending requests"}</p>
            ) : (
              pending.map((item) => (
                <div
                  key={`${item.source}-${item.id}`}
                  className={cn(
                    "rounded-xl border bg-background/80 p-4 transition-colors",
                    reviewingItem?.id === item.id ? "border-primary/40 ring-1 ring-primary/20" : "border-border/30"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <button type="button" className="min-w-0 flex-1 text-start" onClick={() => openReview(item)}>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.companyName}</p>
                      <p className="text-xs text-muted-foreground">{item.userName || "—"}</p>
                    </button>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => openReview(item)}>
                        <Pencil className="h-4 w-4" />
                        {isAr ? "مراجعة" : "Review"}
                      </Button>
                      <Button size="sm" className="gap-1 rounded-full" disabled={saving} onClick={() => approvePending(item)}>
                        <CheckCircle2 className="h-4 w-4" />
                        {t("admin.ads_approve") || "موافقة"}
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1 rounded-full" disabled={saving} onClick={() => rejectPending(item)}>
                        <XCircle className="h-4 w-4" />
                        {isAr ? "رفض" : "Reject"}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <AdProductDetailsCard details={item.productDetails} isAr={isAr} compact listingTypesStore={listingTypes} />
                  </div>
                </div>
              ))
            )}
          </section>

          <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
            {reviewingItem ? (
              <>
                <div className="rounded-2xl border border-border/40 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{isAr ? "مراجعة وتعديل الطلب" : "Review & edit request"}</p>
                    <Button size="sm" variant="ghost" onClick={() => setReviewingItem(null)}>
                      {isAr ? "إغلاق" : "Close"}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.ads_title") || "عنوان الإعلان"}</Label>
                    <Input value={draft.title || ""} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.ads_description") || "الوصف"}</Label>
                    <Textarea rows={3} value={draft.description || ""} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} />
                  </div>
                  <AdProductDetailsForm
                    value={reviewDetails}
                    onChange={setReviewDetails}
                    isAr={isAr}
                    showPlacement
                    showPayment
                    showAdminPaymentStatus
                    listingTypesStore={listingTypes}
                    allListingTypes
                    pricingMode="admin"
                  />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>{t("admin.ads_placement") || "مكان الظهور"}</Label>
                      <Select value={draft.placement} onValueChange={(v) => setDraft((p) => ({ ...p, placement: v as AdPlacement }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {AD_PLACEMENTS.map((p) => (
                            <SelectItem key={p} value={p}>{getPlacementLabel(p, isAr ? "ar" : "en")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.ads_position") || "الموضع"}</Label>
                      <Select value={draft.position} onValueChange={(v) => setDraft((p) => ({ ...p, position: v as AdPosition }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {AD_POSITIONS.map((p) => (
                            <SelectItem key={p} value={p}>{getPositionLabel(p, isAr ? "ar" : "en")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.ads_duration") || "المدة"}</Label>
                      <Select value={String(draft.durationDays)} onValueChange={(v) => setDraft((p) => ({ ...p, durationDays: Number(v) }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {AD_DURATION_OPTIONS.map((d) => (
                            <SelectItem key={d} value={String(d)}>{d} {isAr ? "يوم" : "days"}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button className="gap-2 rounded-full btn-gold" disabled={saving} onClick={() => approvePending(reviewingItem)}>
                      <CheckCircle2 className="h-4 w-4" />
                      {t("admin.ads_approve") || "موافقة ونشر"}
                    </Button>
                    <Button variant="destructive" className="gap-2 rounded-full" disabled={saving} onClick={() => rejectPending(reviewingItem)}>
                      <XCircle className="h-4 w-4" />
                      {isAr ? "رفض الطلب" : "Reject request"}
                    </Button>
                  </div>
                </div>
                <AdLivePreview
                  ad={{
                    ...previewAd,
                    title: draft.title || previewAd.title,
                    description: draft.description || previewAd.description,
                    placement: draft.placement || previewAd.placement,
                    position: draft.position || previewAd.position,
                    productDetails: reviewDetails,
                  }}
                  locale={isAr ? "ar" : "en"}
                />
              </>
            ) : (
              <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                {isAr ? "اختر طلباً للمراجعة والتعديل قبل الموافقة أو الرفض" : "Select a request to review and edit before approving or rejecting"}
              </p>
            )}
          </aside>
        </div>
      ) : null}

      {view === "editor" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <section className="space-y-4 rounded-2xl border border-border/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                {isAr ? "بيانات الإعلان" : "Ad content"}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("admin.ads_company") || "الجهة"}</Label>
                  <Input value={draft.companyName} onChange={(e) => setDraft((p) => ({ ...p, companyName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.ads_title") || "عنوان الإعلان"}</Label>
                  <Input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("admin.ads_description") || "الوصف"}</Label>
                <Textarea rows={4} value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("admin.ads_link") || "الرابط"}</Label>
                  <Input dir="ltr" value={draft.link || ""} onChange={(e) => setDraft((p) => ({ ...p, link: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.ads_image") || "رابط الصورة"}</Label>
                  <Input dir="ltr" value={draft.imageUrl || ""} onChange={(e) => setDraft((p) => ({ ...p, imageUrl: e.target.value }))} />
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-border/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Megaphone className="h-4 w-4 text-primary" />
                {isAr ? "تفاصيل المنتج / البسة" : "Product / clothing details"}
              </div>
              <AdProductDetailsForm
                value={draft.productDetails || emptyAdProductDetails()}
                onChange={(productDetails) => setDraft((p) => ({ ...p, productDetails }))}
                isAr={isAr}
                showPayment
                showAdminPaymentStatus
                listingTypesStore={listingTypes}
                allListingTypes
                pricingMode="admin"
              />
            </section>

            <section className="space-y-4 rounded-2xl border border-border/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <LayoutTemplate className="h-4 w-4 text-primary" />
                {t("admin.ads_controls") || "الموضع والمدة"}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t("admin.ads_placement") || "مكان الظهور"}</Label>
                  <Select value={draft.placement} onValueChange={(v) => setDraft((p) => ({ ...p, placement: v as AdPlacement }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AD_PLACEMENTS.map((p) => (
                        <SelectItem key={p} value={p}>{getPlacementLabel(p, isAr ? "ar" : "en")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    {AD_PLACEMENT_META[draft.placement || "home_after_platforms"].previewHintAr}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.ads_position") || "الموضع"}</Label>
                  <Select value={draft.position} onValueChange={(v) => setDraft((p) => ({ ...p, position: v as AdPosition }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AD_POSITIONS.map((p) => (
                        <SelectItem key={p} value={p}>{getPositionLabel(p, isAr ? "ar" : "en")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.ads_duration") || "مدة الإعلان"}</Label>
                  <Select value={String(draft.durationDays)} onValueChange={(v) => setDraft((p) => ({ ...p, durationDays: Number(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AD_DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d} value={String(d)}>{d} {isAr ? "يوم" : "days"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-3 xl:sticky xl:top-4 xl:self-start">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Eye className="h-4 w-4 text-primary" />
              {t("admin.ads_preview") || "معاينة الموضع"}
            </div>
            <AdLivePreview ad={previewAd} locale={isAr ? "ar" : "en"} />
          </aside>
        </div>
      ) : null}
    </div>
  )
}
