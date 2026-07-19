"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  getPlacementLabel,
  getPositionLabel,
  type PendingAdRequestItem,
  type SiteAdRecord,
} from "@/lib/site-ads"
import {
  collectVideoUrls,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  type AdProductDetails,
} from "@/lib/ad-product-details"
import {
  defaultAdListingTypesStore,
  getListingTypeLabelFromStore,
  type AdListingTypesStore,
} from "@/lib/ad-listing-types-config"
import { getFieldDisplayValue, getListingTypeConfig } from "@/lib/ad-listing-fields"
import { whatsappHref } from "@/lib/site-contact"
import { AdVideoPreview } from "@/components/ads/ad-video-preview"

type AdProductDetailsCardProps = {
  details?: AdProductDetails
  isAr: boolean
  compact?: boolean
  listingTypesStore?: AdListingTypesStore
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-end">{value}</span>
    </div>
  )
}

export function AdProductDetailsCard({
  details,
  isAr,
  compact = false,
  listingTypesStore,
}: AdProductDetailsCardProps) {
  const [typesStore, setTypesStore] = useState<AdListingTypesStore>(
    listingTypesStore || defaultAdListingTypesStore()
  )

  useEffect(() => {
    if (listingTypesStore) {
      setTypesStore(listingTypesStore)
      return
    }
    const load = async () => {
      try {
        const res = await fetch("/api/ads/listing-types")
        const data = await res.json()
        if (res.ok && data.types) {
          setTypesStore({ defaultTypeId: data.defaultTypeId || "general", types: data.types })
        }
      } catch {
        // keep defaults
      }
    }
    void load()
  }, [listingTypesStore])

  if (!details || Object.keys(details).length === 0) return null

  const listingType = details.listingType || typesStore.defaultTypeId
  const typeConfig = getListingTypeConfig(listingType, typesStore)
  const priceLabel =
    typeof details.price === "number"
      ? `${details.price.toLocaleString()} ${details.currency || "SAR"}`
      : undefined
  const videoUrls = collectVideoUrls(details)

  return (
    <div className={`rounded-xl border border-border/40 bg-muted/10 ${compact ? "p-3 space-y-2" : "p-4 space-y-3"}`}>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{getListingTypeLabelFromStore(typesStore, listingType, isAr)}</Badge>
        {typeof details.discountPercent === "number" && details.discountPercent > 0 ? (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            {isAr ? `خصم ${details.discountPercent}%` : `${details.discountPercent}% off`}
          </Badge>
        ) : null}
        {details.paymentStatus ? (
          <Badge variant="secondary">{getPaymentStatusLabel(details.paymentStatus, isAr)}</Badge>
        ) : null}
      </div>

      {typeConfig.fields.map((field) => (
        <DetailRow
          key={field.id}
          label={isAr ? field.labelAr : field.labelEn}
          value={getFieldDisplayValue(details, field)}
        />
      ))}

      {typeConfig.showStock !== false ? (
        <DetailRow label={isAr ? "المتبقي" : "Stock"} value={details.stockRemaining} />
      ) : null}
      <DetailRow label={isAr ? "السعر" : "Price"} value={priceLabel} />
      {typeConfig.showShipping !== false ? (
        <DetailRow label={isAr ? "الشحن" : "Shipping"} value={details.shippingInfo} />
      ) : null}
      <DetailRow label={isAr ? "الهاتف" : "Phone"} value={details.contactPhone} />
      <DetailRow label={isAr ? "طريقة الدفع" : "Payment"} value={getPaymentMethodLabel(details.paymentMethod, isAr)} />
      {typeof details.paymentAmount === "number" ? (
        <DetailRow
          label={isAr ? "مبلغ الإعلان" : "Ad fee"}
          value={`${details.paymentAmount.toLocaleString()} ${details.currency || "SAR"}`}
        />
      ) : null}

      {details.requestedPlacement ? (
        <DetailRow
          label={isAr ? "مكان الظهور" : "Placement"}
          value={`${getPlacementLabel(details.requestedPlacement, isAr ? "ar" : "en")} · ${getPositionLabel(details.requestedPosition || "slot_1", isAr ? "ar" : "en")}`}
        />
      ) : null}
      {details.requestedDurationDays ? (
        <DetailRow label={isAr ? "المدة" : "Duration"} value={`${details.requestedDurationDays} ${isAr ? "يوم" : "days"}`} />
      ) : null}

      {videoUrls.length > 0 ? (
        <div className="space-y-2 pt-1">
          {videoUrls.map((url) => (
            <AdVideoPreview key={url} url={url} compact={compact} />
          ))}
        </div>
      ) : null}

      {details.whatsappLink || details.contactPhone ? (
        <a
          href={details.whatsappLink || whatsappHref(details.contactPhone || "", isAr ? "مرحباً" : "Hello")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm font-semibold text-[oklch(0.76_0.19_48)] hover:underline"
        >
          {isAr ? "تواصل عبر واتساب" : "Contact on WhatsApp"}
        </a>
      ) : null}
    </div>
  )
}

export function getAdProductDetailsFromRecord(
  record: SiteAdRecord | PendingAdRequestItem
): AdProductDetails | undefined {
  return record.productDetails
}
