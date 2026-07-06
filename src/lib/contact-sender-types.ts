import type { LucideIcon } from "lucide-react"
import {
  Building2,
  Handshake,
  Heart,
  Landmark,
  MoreHorizontal,
  TrendingUp,
  User,
} from "lucide-react"

export const CONTACT_SENDER_TYPES = [
  { id: "person", labelAr: "شخص", labelEn: "Individual", icon: User },
  { id: "company", labelAr: "شركة", labelEn: "Company", icon: Building2 },
  { id: "institution", labelAr: "مؤسسة", labelEn: "Institution", icon: Landmark },
  { id: "government", labelAr: "جهة حكومية", labelEn: "Government", icon: Landmark },
  { id: "nonprofit", labelAr: "جمعية / منظمة", labelEn: "NGO / Association", icon: Heart },
  { id: "investor", labelAr: "مستثمر", labelEn: "Investor", icon: TrendingUp },
  { id: "partner", labelAr: "شريك", labelEn: "Partner", icon: Handshake },
  { id: "other", labelAr: "أخرى", labelEn: "Other", icon: MoreHorizontal },
] as const satisfies ReadonlyArray<{
  id: string
  labelAr: string
  labelEn: string
  icon: LucideIcon
}>

export type ContactSenderTypeId = (typeof CONTACT_SENDER_TYPES)[number]["id"]

export const CONTACT_SENDER_TYPE_IDS = CONTACT_SENDER_TYPES.map((item) => item.id) as [
  ContactSenderTypeId,
  ...ContactSenderTypeId[],
]

export function getContactSenderType(id?: string | null) {
  if (!id) return null
  return CONTACT_SENDER_TYPES.find((item) => item.id === id) ?? null
}

export function getContactSenderTypeLabel(id: string | null | undefined, locale: string) {
  const item = getContactSenderType(id)
  if (!item) return locale === "ar" ? "غير محدد" : "Not specified"
  return locale === "ar" ? item.labelAr : item.labelEn
}

export function isContactSenderTypeId(value: string): value is ContactSenderTypeId {
  return CONTACT_SENDER_TYPE_IDS.includes(value as ContactSenderTypeId)
}
