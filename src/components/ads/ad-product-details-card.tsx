"use client"

import { Badge } from "@/components/ui/badge"
import {
  getPlacementLabel,
  getPositionLabel,
  type SiteAdRecord,
  type PendingAdRequestItem,
} from "@/lib/site-ads"
import {
  getListingTypeLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  joinList,
  type AdProductDetails,
} from "@/lib/ad-product-details"
import { whatsappHref } from "@/lib/site-contact"

type AdProductDetailsCardProps = {
  details?: AdProductDetails
  isAr: boolean
  compact?: boolean
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

export function AdProductDetailsCard({ details, isAr, compact = false }: AdProductDetailsCardProps) {
  if (!details || Object.keys(details).length === 0) return null

  const priceLabel =
    typeof details.price === "number"
      ? `${details.price.toLocaleString()} ${details.currency || "SAR"}`
      : undefined

  return (
    <div className={`rounded-xl border border-border/40 bg-muted/10 ${compact ? "p-3 space-y-2" : "p-4 space-y-3"}`}>
      <div className="flex flex-wrap gap-2">
        {details.listingType ? (
          <Badge variant="outline">{getListingTypeLabel(details.listingType, isAr)}</Badge>
        ) : null}
        {typeof details.discountPercent === "number" && details.discountPercent > 0 ? (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            {isAr ? `خصم ${details.discountPercent}%` : `${details.discountPercent}% off`}
          </Badge>
        ) : null}
        {details.paymentStatus ? (
          <Badge variant="secondary">{getPaymentStatusLabel(details.paymentStatus, isAr)}</Badge>
        ) : null}
      </div>

      <DetailRow label={isAr ? "أنواع القماش" : "Fabrics"} value={joinList(details.fabricTypes)} />
      <DetailRow label={isAr ? "الألوان" : "Colors"} value={joinList(details.colors)} />
      <DetailRow label={isAr ? "المقاسات" : "Sizes"} value={joinList(details.sizes)} />
      <DetailRow label={isAr ? "المتبقي" : "Stock"} value={details.stockRemaining} />
      <DetailRow label={isAr ? "السعر" : "Price"} value={priceLabel} />
      <DetailRow label={isAr ? "الشحن" : "Shipping"} value={details.shippingInfo} />
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
