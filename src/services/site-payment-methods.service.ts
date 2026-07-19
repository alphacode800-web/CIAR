import {
  SITE_PAYMENT_METHODS_KEY,
  defaultSitePaymentMethodsStore,
  parseSitePaymentMethodsStore,
  serializeSitePaymentMethodsStore,
  sitePaymentMethodsStoreSchema,
  type SitePaymentMethodsStore,
} from "@/lib/site-payment-methods"
import { getSettings, updateSettings } from "@/services/settings.service"

export async function getSitePaymentMethodsStore(): Promise<SitePaymentMethodsStore> {
  const settings = await getSettings()
  return parseSitePaymentMethodsStore(settings[SITE_PAYMENT_METHODS_KEY])
}

export async function saveSitePaymentMethodsStore(store: SitePaymentMethodsStore): Promise<SitePaymentMethodsStore> {
  const parsed = sitePaymentMethodsStoreSchema.parse(store)
  await updateSettings({ [SITE_PAYMENT_METHODS_KEY]: serializeSitePaymentMethodsStore(parsed) })
  return parsed
}

export { defaultSitePaymentMethodsStore }
