export const EMAIL_CAMPAIGNS_SETTINGS_KEY = "email_campaigns_v1"

export const CAMPAIGN_SEGMENTS = [
  "all_with_email",
  "recent_30_days",
  "admins",
  "contact_leads",
] as const

export type CampaignSegment = (typeof CAMPAIGN_SEGMENTS)[number]

export const CAMPAIGN_STATUSES = [
  "draft",
  "approved",
  "sending",
  "completed",
  "failed",
  "cancelled",
] as const

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]

export type CampaignStats = {
  total: number
  sent: number
  failed: number
  skipped: number
}

export type EmailCampaignRecord = {
  id: string
  name: string
  subject: string
  bodyHtml: string
  bodyText: string
  segment: CampaignSegment
  status: CampaignStatus
  locale: string
  aiPrompt?: string
  createdAt: string
  updatedAt: string
  approvedAt?: string
  sendStartedAt?: string
  sendCompletedAt?: string
  sendOffset: number
  stats: CampaignStats
  lastError?: string
  simulated?: boolean
}

export const CAMPAIGN_SEGMENT_META: Record<
  CampaignSegment,
  { labelAr: string; labelEn: string; descriptionAr: string; descriptionEn: string }
> = {
  all_with_email: {
    labelAr: "كل المستخدمين (بريد)",
    labelEn: "All users (with email)",
    descriptionAr: "المستخدمون المسجلون الذين لديهم بريد إلكتروني",
    descriptionEn: "Registered users who have an email address",
  },
  recent_30_days: {
    labelAr: "مستخدمون جدد (30 يوم)",
    labelEn: "New users (30 days)",
    descriptionAr: "من سجّلوا خلال آخر 30 يوماً ولديهم بريد",
    descriptionEn: "Users registered in the last 30 days with email",
  },
  admins: {
    labelAr: "المدراء",
    labelEn: "Admins",
    descriptionAr: "حسابات الإدارة فقط",
    descriptionEn: "Admin accounts only",
  },
  contact_leads: {
    labelAr: "رسائل التواصل",
    labelEn: "Contact leads",
    descriptionAr: "من أرسلوا عبر نموذج التواصل ولديهم بريد",
    descriptionEn: "Contact form submissions with email",
  },
}

export const CAMPAIGN_BATCH_SIZE = 50

export function parseEmailCampaigns(raw: string | undefined): EmailCampaignRecord[] {
  if (!raw?.trim()) return []
  try {
    const parsed = JSON.parse(raw) as EmailCampaignRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function serializeEmailCampaigns(campaigns: EmailCampaignRecord[]): string {
  return JSON.stringify(campaigns)
}

export function getSegmentLabel(segment: CampaignSegment, locale: "ar" | "en"): string {
  const meta = CAMPAIGN_SEGMENT_META[segment]
  return locale === "ar" ? meta.labelAr : meta.labelEn
}

export function personalizeCampaignBody(template: string, name: string): string {
  return template.replace(/\{\{\s*name\s*\}\}/gi, name || "عميلنا")
}
