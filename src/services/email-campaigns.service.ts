import { db } from "@/lib/db"
import {
  CAMPAIGN_BATCH_SIZE,
  EMAIL_CAMPAIGNS_SETTINGS_KEY,
  personalizeCampaignBody,
  parseEmailCampaigns,
  serializeEmailCampaigns,
  type CampaignSegment,
  type CampaignStats,
  type EmailCampaignRecord,
} from "@/lib/email-campaigns"
import { sendEmailBatch } from "@/services/email-send.service"
import { getSettings, updateSettings } from "@/services/settings.service"
import { v4 as uuidv4 } from "uuid"

export type CampaignRecipient = {
  id: string
  email: string
  name: string
}

async function loadCampaigns(): Promise<EmailCampaignRecord[]> {
  const settings = await getSettings()
  return parseEmailCampaigns(settings[EMAIL_CAMPAIGNS_SETTINGS_KEY])
}

async function saveCampaigns(campaigns: EmailCampaignRecord[]) {
  await updateSettings({ [EMAIL_CAMPAIGNS_SETTINGS_KEY]: serializeEmailCampaigns(campaigns) })
}

function emptyStats(): CampaignStats {
  return { total: 0, sent: 0, failed: 0, skipped: 0 }
}

export async function listEmailCampaigns(): Promise<EmailCampaignRecord[]> {
  const campaigns = await loadCampaigns()
  return campaigns.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getEmailCampaign(id: string): Promise<EmailCampaignRecord | null> {
  const campaigns = await loadCampaigns()
  return campaigns.find((c) => c.id === id) ?? null
}

function segmentWhere(segment: CampaignSegment) {
  const since = new Date()
  since.setDate(since.getDate() - 30)

  if (segment === "recent_30_days") {
    return {
      email: { not: null },
      createdAt: { gte: since },
    }
  }
  if (segment === "admins") {
    return {
      email: { not: null },
      role: "ADMIN" as const,
    }
  }
  return { email: { not: null } }
}

export async function countSegmentRecipients(segment: CampaignSegment): Promise<number> {
  if (segment === "contact_leads") {
    return db.contactSubmission.count({
      where: {
        email: { not: null },
        NOT: { email: "" },
      },
    })
  }

  const users = await db.user.count({
    where: {
      ...segmentWhere(segment),
      NOT: { email: "" },
    },
  })
  return users
}

export async function fetchSegmentRecipients(
  segment: CampaignSegment,
  offset: number,
  limit: number
): Promise<CampaignRecipient[]> {
  if (segment === "contact_leads") {
    const rows = await db.contactSubmission.findMany({
      where: {
        email: { not: null },
        NOT: { email: "" },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      select: { id: true, email: true, name: true },
    })
    return rows
      .filter((row) => row.email)
      .map((row) => ({ id: row.id, email: row.email!, name: row.name }))
  }

  const rows = await db.user.findMany({
    where: {
      ...segmentWhere(segment),
      NOT: { email: "" },
    },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
    select: { id: true, email: true, name: true },
  })

  return rows
    .filter((row) => row.email)
    .map((row) => ({ id: row.id, email: row.email!, name: row.name }))
}

export async function createEmailCampaign(input: {
  name: string
  subject: string
  bodyHtml: string
  bodyText: string
  segment: CampaignSegment
  locale?: string
  aiPrompt?: string
}): Promise<EmailCampaignRecord> {
  const now = new Date().toISOString()
  const campaign: EmailCampaignRecord = {
    id: uuidv4(),
    name: input.name.trim(),
    subject: input.subject.trim(),
    bodyHtml: input.bodyHtml.trim(),
    bodyText: input.bodyText.trim(),
    segment: input.segment,
    locale: input.locale === "en" ? "en" : "ar",
    aiPrompt: input.aiPrompt?.trim(),
    status: "draft",
    createdAt: now,
    updatedAt: now,
    sendOffset: 0,
    stats: emptyStats(),
  }

  const campaigns = await loadCampaigns()
  campaigns.unshift(campaign)
  await saveCampaigns(campaigns)
  return campaign
}

export async function updateEmailCampaign(
  id: string,
  input: Partial<Pick<EmailCampaignRecord, "name" | "subject" | "bodyHtml" | "bodyText" | "segment" | "locale" | "aiPrompt">>
): Promise<EmailCampaignRecord> {
  const campaigns = await loadCampaigns()
  const index = campaigns.findIndex((c) => c.id === id)
  if (index < 0) throw new Error("CAMPAIGN_NOT_FOUND")

  const current = campaigns[index]
  if (current.status !== "draft") throw new Error("CAMPAIGN_NOT_EDITABLE")

  const updated: EmailCampaignRecord = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  }
  campaigns[index] = updated
  await saveCampaigns(campaigns)
  return updated
}

export async function deleteEmailCampaign(id: string): Promise<void> {
  const campaigns = await loadCampaigns()
  const target = campaigns.find((c) => c.id === id)
  if (!target) throw new Error("CAMPAIGN_NOT_FOUND")
  if (target.status === "sending") throw new Error("CAMPAIGN_SENDING")

  await saveCampaigns(campaigns.filter((c) => c.id !== id))
}

export async function approveEmailCampaign(id: string): Promise<EmailCampaignRecord> {
  const campaigns = await loadCampaigns()
  const index = campaigns.findIndex((c) => c.id === id)
  if (index < 0) throw new Error("CAMPAIGN_NOT_FOUND")

  const current = campaigns[index]
  if (current.status !== "draft") throw new Error("CAMPAIGN_NOT_DRAFT")
  if (!current.subject.trim() || !current.bodyHtml.trim()) throw new Error("CAMPAIGN_INCOMPLETE")

  const total = await countSegmentRecipients(current.segment)
  if (total === 0) throw new Error("CAMPAIGN_NO_RECIPIENTS")

  const updated: EmailCampaignRecord = {
    ...current,
    status: "approved",
    approvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sendOffset: 0,
    stats: { total, sent: 0, failed: 0, skipped: 0 },
  }
  campaigns[index] = updated
  await saveCampaigns(campaigns)
  return updated
}

export async function sendEmailCampaignBatch(id: string): Promise<{
  campaign: EmailCampaignRecord
  done: boolean
  batchSent: number
  batchFailed: number
}> {
  const campaigns = await loadCampaigns()
  const index = campaigns.findIndex((c) => c.id === id)
  if (index < 0) throw new Error("CAMPAIGN_NOT_FOUND")

  let current = campaigns[index]
  if (current.status !== "approved" && current.status !== "sending") {
    throw new Error("CAMPAIGN_NOT_APPROVED")
  }

  if (current.status === "approved") {
    current = {
      ...current,
      status: "sending",
      sendStartedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    campaigns[index] = current
    await saveCampaigns(campaigns)
  }

  const recipients = await fetchSegmentRecipients(current.segment, current.sendOffset, CAMPAIGN_BATCH_SIZE)
  if (recipients.length === 0) {
    const completed: EmailCampaignRecord = {
      ...current,
      status: "completed",
      sendCompletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    campaigns[index] = completed
    await saveCampaigns(campaigns)
    return { campaign: completed, done: true, batchSent: 0, batchFailed: 0 }
  }

  const payloads = recipients.map((recipient) => ({
    to: recipient.email,
    subject: personalizeCampaignBody(current.subject, recipient.name),
    html: personalizeCampaignBody(current.bodyHtml, recipient.name),
    text: personalizeCampaignBody(current.bodyText || current.bodyHtml.replace(/<[^>]+>/g, ""), recipient.name),
  }))

  const results = await sendEmailBatch(payloads)
  const simulated = results.some((r) => r.simulated)

  let batchSent = 0
  let batchFailed = 0
  for (const result of results) {
    if (result.ok) batchSent += 1
    else batchFailed += 1
  }

  const nextOffset = current.sendOffset + recipients.length
  const done = nextOffset >= current.stats.total

  const updated: EmailCampaignRecord = {
    ...current,
    sendOffset: nextOffset,
    simulated: simulated || current.simulated,
    stats: {
      ...current.stats,
      sent: current.stats.sent + batchSent,
      failed: current.stats.failed + batchFailed,
    },
    status: done ? "completed" : "sending",
    sendCompletedAt: done ? new Date().toISOString() : current.sendCompletedAt,
    updatedAt: new Date().toISOString(),
    lastError: batchFailed > 0 ? `${batchFailed} failed in last batch` : undefined,
  }

  campaigns[index] = updated
  await saveCampaigns(campaigns)

  return { campaign: updated, done, batchSent, batchFailed }
}
