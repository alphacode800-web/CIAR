"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AD_DURATION_OPTIONS,
  AD_PLACEMENTS,
  AD_POSITIONS,
  AD_PLACEMENT_META,
  getPlacementLabel,
  getPositionLabel,
} from "@/lib/site-ads"
import {
  AD_LISTING_TYPES,
  AD_PAYMENT_METHODS,
  AD_PAYMENT_STATUSES,
  emptyAdProductDetails,
  getListingTypeLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  parseCsvList,
  joinList,
  type AdProductDetails,
} from "@/lib/ad-product-details"

type AdProductDetailsFormProps = {
  value: AdProductDetails
  onChange: (value: AdProductDetails) => void
  isAr: boolean
  showPlacement?: boolean
  showPayment?: boolean
  showAdminPaymentStatus?: boolean
}

export function AdProductDetailsForm({
  value,
  onChange,
  isAr,
  showPlacement = true,
  showPayment = true,
  showAdminPaymentStatus = false,
}: AdProductDetailsFormProps) {
  const details = { ...emptyAdProductDetails(), ...value }

  const patch = (partial: Partial<AdProductDetails>) => onChange({ ...details, ...partial })

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{isAr ? "نوع الإعلان" : "Listing type"}</Label>
        <Select value={details.listingType || "general"} onValueChange={(v) => patch({ listingType: v as AdProductDetails["listingType"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {AD_LISTING_TYPES.map((type) => (
              <SelectItem key={type} value={type}>{getListingTypeLabel(type, isAr)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "أنواع القماش" : "Fabric types"}</Label>
          <Input
            value={joinList(details.fabricTypes)}
            onChange={(e) => patch({ fabricTypes: parseCsvList(e.target.value) })}
            placeholder={isAr ? "قطن، حرير، بوليستر" : "Cotton, silk, polyester"}
          />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "الألوان" : "Colors"}</Label>
          <Input
            value={joinList(details.colors)}
            onChange={(e) => patch({ colors: parseCsvList(e.target.value) })}
            placeholder={isAr ? "أبيض، أسود، بيج" : "White, black, beige"}
          />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "المقاسات" : "Sizes"}</Label>
          <Input
            value={joinList(details.sizes)}
            onChange={(e) => patch({ sizes: parseCsvList(e.target.value) })}
            placeholder={isAr ? "S, M, L, XL" : "S, M, L, XL"}
          />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "العدد المتبقي" : "Stock remaining"}</Label>
          <Input
            type="number"
            min={0}
            value={details.stockRemaining ?? ""}
            onChange={(e) => patch({ stockRemaining: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "السعر" : "Price"}</Label>
          <Input
            type="number"
            min={0}
            value={details.price ?? ""}
            onChange={(e) => patch({ price: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "العملة" : "Currency"}</Label>
          <Input value={details.currency || "SAR"} onChange={(e) => patch({ currency: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "نسبة الحسم %" : "Discount %"}</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={details.discountPercent ?? ""}
            onChange={(e) => patch({ discountPercent: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"}</Label>
          <Input dir="ltr" value={details.contactPhone || ""} onChange={(e) => patch({ contactPhone: e.target.value })} placeholder="+9665..." />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{isAr ? "رابط واتساب" : "WhatsApp link"}</Label>
        <Input dir="ltr" value={details.whatsappLink || ""} onChange={(e) => patch({ whatsappLink: e.target.value })} placeholder="https://wa.me/9665..." />
      </div>

      <div className="space-y-2">
        <Label>{isAr ? "الشحن" : "Shipping"}</Label>
        <Textarea
          rows={2}
          value={details.shippingInfo || ""}
          onChange={(e) => patch({ shippingInfo: e.target.value })}
          placeholder={isAr ? "مجاني داخل المدينة — 3 أيام توصيل" : "Free in-city — 3-day delivery"}
        />
      </div>

      {showPayment ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{isAr ? "طريقة الدفع" : "Payment method"}</Label>
            <Select value={details.paymentMethod || "whatsapp"} onValueChange={(v) => patch({ paymentMethod: v as AdProductDetails["paymentMethod"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AD_PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>{getPaymentMethodLabel(method, isAr)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "مبلغ الإعلان" : "Ad payment amount"}</Label>
            <Input
              type="number"
              min={0}
              value={details.paymentAmount ?? ""}
              onChange={(e) => patch({ paymentAmount: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>
      ) : null}

      {showAdminPaymentStatus ? (
        <div className="space-y-2">
          <Label>{isAr ? "حالة الدفع" : "Payment status"}</Label>
          <Select value={details.paymentStatus || "pending"} onValueChange={(v) => patch({ paymentStatus: v as AdProductDetails["paymentStatus"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {AD_PAYMENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>{getPaymentStatusLabel(status, isAr)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {showPlacement ? (
        <div className="rounded-xl border border-border/50 bg-muted/10 p-4 space-y-4">
          <p className="text-sm font-semibold">{isAr ? "أين يظهر الإعلان؟" : "Where should the ad appear?"}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{isAr ? "مكان الظهور" : "Placement"}</Label>
              <Select value={details.requestedPlacement || "home_after_platforms"} onValueChange={(v) => patch({ requestedPlacement: v as AdProductDetails["requestedPlacement"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AD_PLACEMENTS.map((placement) => (
                    <SelectItem key={placement} value={placement}>{getPlacementLabel(placement, isAr ? "ar" : "en")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الموضع" : "Slot"}</Label>
              <Select value={details.requestedPosition || "slot_1"} onValueChange={(v) => patch({ requestedPosition: v as AdProductDetails["requestedPosition"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AD_POSITIONS.map((position) => (
                    <SelectItem key={position} value={position}>{getPositionLabel(position, isAr ? "ar" : "en")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "مدة الإعلان" : "Duration"}</Label>
              <Select value={String(details.requestedDurationDays || 30)} onValueChange={(v) => patch({ requestedDurationDays: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AD_DURATION_OPTIONS.map((days) => (
                    <SelectItem key={days} value={String(days)}>{days} {isAr ? "يوم" : "days"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {AD_PLACEMENT_META[details.requestedPlacement || "home_after_platforms"][isAr ? "previewHintAr" : "labelEn"]}
          </p>
        </div>
      ) : null}
    </div>
  )
}
