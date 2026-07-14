"use client"

import { useCallback, useEffect, useState } from "react"
import { Clock, MapPin, Megaphone, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import {
  getPlacementLabel,
  getPositionLabel,
  type PendingAdRequestItem,
  type SiteAdRecord,
} from "@/lib/site-ads"
import { AdProductDetailsCard } from "@/components/ads/ad-product-details-card"

export function AdvertiserPanel() {
  const { locale } = useI18n()
  const { user } = useAuth()
  const isAr = locale === "ar"
  const [ads, setAds] = useState<SiteAdRecord[]>([])
  const [pending, setPending] = useState<PendingAdRequestItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const token = localStorage.getItem("ciar_token")
      const res = await fetch("/api/ads/mine", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      setAds(Array.isArray(data.ads) ? data.ads : [])
      setPending(Array.isArray(data.pending) ? data.pending : [])
    } catch {
      setAds([])
      setPending([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  if (!user) return null

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-gradient-to-r from-[oklch(0.78_0.14_82/8%)] to-transparent px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.78_0.14_82/15%)]">
            <Megaphone className="h-5 w-5 text-[oklch(0.78_0.14_82)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isAr ? "لوحة المُعلِن" : "Advertiser dashboard"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAr ? "تابع إعلاناتك وحالة الطلبات" : "Track your ads and request status"}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-2" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {isAr ? "تحديث" : "Refresh"}
        </Button>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {pending.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {isAr ? "طلبات قيد المراجعة" : "Pending review"}
            </p>
            <div className="space-y-2">
              {pending.map((item) => (
                <div key={item.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    <Badge variant="secondary">{isAr ? "قيد المراجعة" : "Pending"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.companyName}</p>
                  <AdProductDetailsCard details={item.productDetails} isAr={isAr} compact />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {isAr ? "إعلاناتي المنشورة" : "Published ads"}
          </p>
          {ads.length === 0 ? (
            <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              {isAr ? "لا إعلانات منشورة بعد — أرسل طلباً جديداً بالأسفل" : "No published ads yet — submit a new request below"}
            </p>
          ) : (
            <div className="space-y-2">
              {ads.map((ad) => (
                <div key={ad.id} className="rounded-xl border border-border/40 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{ad.title}</p>
                    <Badge variant={ad.status === "active" ? "default" : "outline"}>{ad.status}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {getPlacementLabel(ad.placement, isAr ? "ar" : "en")}
                    </span>
                    <span>{getPositionLabel(ad.position, isAr ? "ar" : "en")}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {ad.durationDays} {isAr ? "يوم" : "days"}
                    </span>
                  </div>
                  <AdProductDetailsCard details={ad.productDetails} isAr={isAr} compact />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
