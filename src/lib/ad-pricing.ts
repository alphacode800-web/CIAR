import { z } from "zod"
import {
  AD_DURATION_OPTIONS,
  AD_PLACEMENTS,
  type AdPlacement,
  type AdPosition,
} from "@/lib/site-ads"

export const AD_PRICING_SETTINGS_KEY = "ad_pricing_v1"

export type AdPricingConfig = {
  currency: string
  durationPrices: Record<string, number>
  slot2Surcharge: number
  placementSurcharges: Partial<Record<AdPlacement, number>>
}

export type AdQuote = {
  amount: number
  currency: string
  durationDays: number
  placement: AdPlacement
  position: AdPosition
  breakdown: {
    base: number
    placementSurcharge: number
    slotSurcharge: number
  }
}

const durationPriceSchema = z.record(z.coerce.number().min(0).max(1_000_000), z.coerce.number().min(0).max(1_000_000_000))

export const adPricingConfigSchema = z.object({
  currency: z.string().max(10).default("SAR"),
  durationPrices: durationPriceSchema,
  slot2Surcharge: z.coerce.number().min(0).max(1_000_000).default(0),
  placementSurcharges: z
    .object({
      home_after_platforms: z.coerce.number().min(0).max(1_000_000).optional(),
      home_before_why: z.coerce.number().min(0).max(1_000_000).optional(),
      projects_top: z.coerce.number().min(0).max(1_000_000).optional(),
      platform_details: z.coerce.number().min(0).max(1_000_000).optional(),
    })
    .optional()
    .default({}),
})

export function defaultAdPricingConfig(): AdPricingConfig {
  return {
    currency: "SAR",
    durationPrices: {
      "7": 49,
      "14": 89,
      "30": 149,
      "60": 279,
      "90": 399,
    },
    slot2Surcharge: 25,
    placementSurcharges: {
      platform_details: 30,
      projects_top: 20,
      home_before_why: 15,
    },
  }
}

export function parseAdPricingConfig(raw: string | undefined): AdPricingConfig {
  if (!raw) return defaultAdPricingConfig()
  try {
    const parsed = adPricingConfigSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return defaultAdPricingConfig()
    const defaults = defaultAdPricingConfig()
    return {
      currency: parsed.data.currency || defaults.currency,
      durationPrices: { ...defaults.durationPrices, ...parsed.data.durationPrices },
      slot2Surcharge: parsed.data.slot2Surcharge ?? defaults.slot2Surcharge,
      placementSurcharges: { ...defaults.placementSurcharges, ...(parsed.data.placementSurcharges || {}) },
    }
  } catch {
    return defaultAdPricingConfig()
  }
}

export function serializeAdPricingConfig(config: AdPricingConfig): string {
  return JSON.stringify(config)
}

export function computeAdQuote(input: {
  durationDays: number
  placement: AdPlacement
  position: AdPosition
  config: AdPricingConfig
}): AdQuote {
  const durationKey = String(input.durationDays)
  const fallbackKey = AD_DURATION_OPTIONS.includes(input.durationDays as (typeof AD_DURATION_OPTIONS)[number])
    ? durationKey
    : "30"
  const base =
    input.config.durationPrices[fallbackKey] ??
    input.config.durationPrices["30"] ??
    defaultAdPricingConfig().durationPrices["30"]
  const placementSurcharge = input.config.placementSurcharges[input.placement] ?? 0
  const slotSurcharge = input.position === "slot_2" ? input.config.slot2Surcharge : 0

  return {
    amount: base + placementSurcharge + slotSurcharge,
    currency: input.config.currency || "SAR",
    durationDays: input.durationDays,
    placement: input.placement,
    position: input.position,
    breakdown: {
      base,
      placementSurcharge,
      slotSurcharge,
    },
  }
}
