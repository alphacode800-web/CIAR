import type { AdProductDetails } from "@/lib/ad-product-details"
import { formatDetailFieldDisplayValue, readDetailFieldValue } from "@/lib/ad-product-details"
import {
  defaultAdListingTypesStore,
  getListingTypeDefinition,
  type AdFieldInputType,
  type AdListingFieldConfig,
  type AdListingTypeDefinition,
  type AdListingTypesStore,
} from "@/lib/ad-listing-types-config"

export type { AdFieldInputType, AdListingFieldConfig, AdListingTypeDefinition, AdListingTypesStore }

/** @deprecated use AdListingFieldConfig */
export type AdListingFieldDef = AdListingFieldConfig

/** @deprecated use AdListingTypeDefinition */
export type AdListingTypeConfig = AdListingTypeDefinition

export function getListingTypesStore(fallback?: AdListingTypesStore): AdListingTypesStore {
  return fallback || defaultAdListingTypesStore()
}

export function getListingTypeConfig(
  typeId: string | undefined,
  store?: AdListingTypesStore
): AdListingTypeDefinition {
  const resolved = getListingTypesStore(store)
  return (
    getListingTypeDefinition(resolved, typeId) ||
    getListingTypeDefinition(resolved, resolved.defaultTypeId) ||
    resolved.types[0]
  )
}

export function getFieldDisplayValue(
  details: AdProductDetails,
  field: AdListingFieldConfig
): string | number | undefined {
  return formatDetailFieldDisplayValue(readDetailFieldValue(details, field.id))
}
