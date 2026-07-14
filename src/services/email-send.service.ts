import { withSiteContactDefaults } from "@/lib/site-contact"
import { getSettings } from "@/services/settings.service"

export type EmailPayload = {
  to: string
  subject: string
  html: string
  text: string
}

export type SendEmailResult = {
  ok: boolean
  id?: string
  error?: string
  simulated?: boolean
}

function resolveFromEmail(settings: Record<string, string>): string {
  const merged = withSiteContactDefaults(settings)
  const email = merged.company_email || merged.contact_email || "onboarding@resend.dev"
  const name = merged.company_name || merged.site_name || "CIAR"
  return `${name} <${email}>`
}

export async function isEmailProviderConfigured(): Promise<boolean> {
  return Boolean(process.env.RESEND_API_KEY?.trim())
}

export async function sendSingleEmail(payload: EmailPayload): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const settings = await getSettings()
  const from = resolveFromEmail(settings)

  if (!apiKey) {
    return { ok: true, simulated: true, id: `sim-${Date.now()}` }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    })

    const data = (await res.json()) as { id?: string; message?: string }
    if (!res.ok) {
      return { ok: false, error: data.message || `HTTP ${res.status}` }
    }
    return { ok: true, id: data.id }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Send failed" }
  }
}

export async function sendEmailBatch(payloads: EmailPayload[]): Promise<SendEmailResult[]> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const settings = await getSettings()
  const from = resolveFromEmail(settings)

  if (!apiKey) {
    return payloads.map((_, index) => ({
      ok: true,
      simulated: true,
      id: `sim-${Date.now()}-${index}`,
    }))
  }

  try {
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        payloads.map((payload) => ({
          from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }))
      ),
    })

    const data = (await res.json()) as { data?: Array<{ id: string }>; message?: string }
    if (!res.ok) {
      return payloads.map(() => ({ ok: false, error: data.message || `HTTP ${res.status}` }))
    }

    const rows = data.data || []
    return payloads.map((_, index) => ({
      ok: Boolean(rows[index]?.id),
      id: rows[index]?.id,
      error: rows[index]?.id ? undefined : "Batch item failed",
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Batch send failed"
    return payloads.map(() => ({ ok: false, error: message }))
  }
}
