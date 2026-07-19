"use client"

import { useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  AD_DURATION_OPTIONS,
  AD_PLACEMENTS,
  getPlacementLabel,
} from "@/lib/site-ads"
import type { AdPricingConfig } from "@/lib/ad-pricing"
import { defaultAdPricingConfig } from "@/lib/ad-pricing"

type AdPricingAdminPanelProps = {
  initialPricing?: AdPricingConfig
  isAr: boolean
  onSaved?: (pricing: AdPricingConfig) => void
}

export function AdPricingAdminPanel({ initialPricing, isAr, onSaved }: AdPricingAdminPanelProps) {
  const [pricing, setPricing] = useState<AdPricingConfig>(initialPricing || defaultAdPricingConfig())
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_pricing", pricing }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error("save failed")
      setPricing(data.pricing || pricing)
      onSaved?.(data.pricing || pricing)
      toast.success(isAr ? "تم حفظ تسعير الإعلانات" : "Ad pricing saved")
    } catch {
      toast.error(isAr ? "فشل حفظ التسعير" : "Failed to save pricing")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{isAr ? "تسعير الإعلانات" : "Ad pricing"}</p>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "حدد الأسعار التي يراها المُعلِن — حسب المدة والموضع."
              : "Set the prices advertisers see — by duration and placement."}
          </p>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2 rounded-full btn-gold">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isAr ? "حفظ التسعير" : "Save pricing"}
        </Button>
      </div>

      <div className="space-y-2 max-w-xs">
        <Label>{isAr ? "العملة" : "Currency"}</Label>
        <Input value={pricing.currency} onChange={(e) => setPricing((p) => ({ ...p, currency: e.target.value }))} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {AD_DURATION_OPTIONS.map((days) => (
          <div key={days} className="space-y-2">
            <Label>{days} {isAr ? "يوم" : "days"}</Label>
            <Input
              type="number"
              min={0}
              value={pricing.durationPrices[String(days)] ?? ""}
              onChange={(e) =>
                setPricing((p) => ({
                  ...p,
                  durationPrices: {
                    ...p.durationPrices,
                    [String(days)]: e.target.value ? Number(e.target.value) : 0,
                  },
                }))
              }
            />
          </div>
        ))}
      </div>

      <div className="space-y-2 max-w-xs">
        <Label>{isAr ? "رسوم الموضع الثاني (slot 2)" : "Slot 2 surcharge"}</Label>
        <Input
          type="number"
          min={0}
          value={pricing.slot2Surcharge}
          onChange={(e) => setPricing((p) => ({ ...p, slot2Surcharge: Number(e.target.value) || 0 }))}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {AD_PLACEMENTS.map((placement) => (
          <div key={placement} className="space-y-2">
            <Label>{getPlacementLabel(placement, isAr ? "ar" : "en")}</Label>
            <Input
              type="number"
              min={0}
              value={pricing.placementSurcharges[placement] ?? ""}
              onChange={(e) =>
                setPricing((p) => ({
                  ...p,
                  placementSurcharges: {
                    ...p.placementSurcharges,
                    [placement]: e.target.value ? Number(e.target.value) : 0,
                  },
                }))
              }
              placeholder={isAr ? "رسوم إضافية (0)" : "Extra fee (0)"}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
