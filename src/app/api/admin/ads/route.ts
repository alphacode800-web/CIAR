import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  AD_DURATION_OPTIONS,
  AD_PLACEMENTS,
  AD_POSITIONS,
  AD_STATUSES,
} from "@/lib/site-ads"
import {
  approvePendingRequest,
  deleteManagedAd,
  listManagedAds,
  listPendingAdRequests,
  rejectPendingRequest,
  upsertManagedAd,
} from "@/services/site-ads.service"
import { adProductDetailsSchema } from "@/lib/ad-product-details"
import { adPricingConfigSchema } from "@/lib/ad-pricing"
import { adListingTypesStoreSchema } from "@/lib/ad-listing-types-config"
import { getAdPricingConfig, saveAdPricingConfig } from "@/services/ad-pricing.service"
import { getAdListingTypesStore, saveAdListingTypesStore } from "@/services/ad-listing-types.service"

const upsertSchema = z.object({
  id: z.string().optional(),
  companyName: z.string().min(2).max(120),
  title: z.string().min(3).max(160),
  description: z.string().min(5).max(5000),
  link: z.string().max(500).optional().default(""),
  imageUrl: z.string().max(500).optional().default(""),
  placement: z.enum(AD_PLACEMENTS),
  position: z.enum(AD_POSITIONS),
  durationDays: z.coerce.number().refine((v) => AD_DURATION_OPTIONS.includes(v as (typeof AD_DURATION_OPTIONS)[number]), {
    message: "Invalid duration",
  }),
  startsAt: z.string().optional(),
  status: z.enum(AD_STATUSES).optional(),
  locale: z.string().optional(),
  userId: z.string().optional(),
  userName: z.string().optional(),
  submissionId: z.string().optional(),
  productDetails: adProductDetailsSchema.optional(),
})

const approveSchema = z.object({
  pendingId: z.string().min(1),
  source: z.enum(["database", "settings_queue"]),
  placement: z.enum(AD_PLACEMENTS),
  position: z.enum(AD_POSITIONS),
  durationDays: z.coerce.number().refine((v) => AD_DURATION_OPTIONS.includes(v as (typeof AD_DURATION_OPTIONS)[number])),
  startsAt: z.string().optional(),
  productDetails: adProductDetailsSchema.optional(),
  title: z.string().min(3).max(160).optional(),
  description: z.string().min(5).max(5000).optional(),
  link: z.string().max(500).optional(),
  imageUrl: z.string().max(500).optional(),
})

const rejectSchema = z.object({
  pendingId: z.string().min(1),
  source: z.enum(["database", "settings_queue"]),
})

export async function GET() {
  try {
    const [ads, pending, pricing, listingTypes] = await Promise.all([
      listManagedAds(),
      listPendingAdRequests(),
      getAdPricingConfig(),
      getAdListingTypesStore(),
    ])
    return NextResponse.json({ ads, pending, pricing, listingTypes })
  } catch (error) {
    console.error("GET /api/admin/ads error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.action === "approve") {
      const parsed = approveSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: "Validation error" }, { status: 400 })
      }
      const ad = await approvePendingRequest(parsed.data)
      return NextResponse.json({ success: true, ad })
    }

    if (body.action === "reject") {
      const parsed = rejectSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: "Validation error" }, { status: 400 })
      }
      await rejectPendingRequest(parsed.data)
      return NextResponse.json({ success: true })
    }

    if (body.action === "save_pricing") {
      const parsed = adPricingConfigSchema.safeParse(body.pricing)
      if (!parsed.success) {
        return NextResponse.json({ error: "Validation error" }, { status: 400 })
      }
      const pricing = await saveAdPricingConfig(parsed.data)
      return NextResponse.json({ success: true, pricing })
    }

    if (body.action === "save_listing_types") {
      const parsed = adListingTypesStoreSchema.safeParse(body.listingTypes)
      if (!parsed.success) {
        return NextResponse.json({ error: "Validation error" }, { status: 400 })
      }
      const listingTypesSaved = await saveAdListingTypesStore(parsed.data)
      return NextResponse.json({ success: true, listingTypes: listingTypesSaved })
    }

    const parsed = upsertSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 })
    }

    const ad = await upsertManagedAd(parsed.data)
    return NextResponse.json({ success: true, ad })
  } catch (error) {
    console.error("POST /api/admin/ads error:", error)
    if (error instanceof Error && error.message === "PENDING_NOT_FOUND") {
      return NextResponse.json({ error: "طلب الإعلان غير موجود" }, { status: 404 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  return POST(request)
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const ok = await deleteManagedAd(id)
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/ads error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
