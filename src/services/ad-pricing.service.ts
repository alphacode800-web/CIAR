import {
  AD_PRICING_SETTINGS_KEY,
  computeAdQuote,
  defaultAdPricingConfig,
  parseAdPricingConfig,
  serializeAdPricingConfig,
  type AdPricingConfig,
  type AdQuote,
} from "@/lib/ad-pricing"
import type { AdPlacement, AdPosition } from "@/lib/site-ads"
import type { AdProductDetails } from "@/lib/ad-product-details"
import { getSettings, updateSettings } from "@/services/settings.service"

export async function getAdPricingConfig(): Promise<AdPricingConfig> {
  const settings = await getSettings()
  return parseAdPricingConfig(settings[AD_PRICING_SETTINGS_KEY])
}

export async function saveAdPricingConfig(config: AdPricingConfig): Promise<AdPricingConfig> {
  const next = parseAdPricingConfig(serializeAdPricingConfig(config))
  await updateSettings({ [AD_PRICING_SETTINGS_KEY]: serializeAdPricingConfig(next) })
  return next
}

export async function quoteAdFromDetails(details?: AdProductDetails): Promise<AdQuote> {
  const config = await getAdPricingConfig()
  return computeAdQuote({
    durationDays: details?.requestedDurationDays || 30,
    placement: details?.requestedPlacement || "home_after_platforms",
    position: details?.requestedPosition || "slot_1",
    config,
  })
}

export function applyAdminPricingToDetails(
  details: AdProductDetails | undefined,
  quote: AdQuote
): AdProductDetails {
  return {
    ...(details || {}),
    paymentAmount: quote.amount,
    currency: quote.currency,
    paymentStatus: details?.paymentStatus || "pending",
  }
}

export { defaultAdPricingConfig }
