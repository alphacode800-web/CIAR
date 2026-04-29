import { db } from '@/lib/db'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ContactSubmissionRow {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  subject: string
  message: string
  locale: string
  createdAt: Date
}

// ── Service Functions ────────────────────────────────────────────────────────

/**
 * Submit a new contact form entry.
 *
 * @param data  Contact form payload
 * @returns     The created submission's ID
 */
export async function submitContact(
  data: {
    name: string
    email?: string
    phone?: string
    subject: string
    message: string
    locale?: string
  },
): Promise<{ id: string }> {
  const submission = await db.contactSubmission.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
      locale: data.locale ?? 'en',
    },
    select: { id: true },
  })

  return { id: submission.id }
}

/**
 * Retrieve contact submissions, newest first.
 *
 * @param limit  Maximum rows to return (default 50)
 * @returns      Array of contact submissions
 */
export async function getSubmissions(
  limit = 50,
): Promise<ContactSubmissionRow[]> {
  return db.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
