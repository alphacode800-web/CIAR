import { getSettings, updateSettings } from "@/services/settings.service"
import {
  AD_LISTING_TYPES_SETTINGS_KEY,
  defaultAdListingTypesStore,
  parseAdListingTypesStore,
  serializeAdListingTypesStore,
  type AdListingTypesStore,
} from "@/lib/ad-listing-types-config"

export async function getAdListingTypesStore(): Promise<AdListingTypesStore> {
  const settings = await getSettings()
  return parseAdListingTypesStore(settings[AD_LISTING_TYPES_SETTINGS_KEY])
}

export async function saveAdListingTypesStore(store: AdListingTypesStore): Promise<AdListingTypesStore> {
  const next = parseAdListingTypesStore(serializeAdListingTypesStore(store))
  await updateSettings({ [AD_LISTING_TYPES_SETTINGS_KEY]: serializeAdListingTypesStore(next) })
  return next
}

export { defaultAdListingTypesStore }
