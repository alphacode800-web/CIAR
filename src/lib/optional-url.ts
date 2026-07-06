/** Treat placeholder-only URLs as empty optional fields. */
export function normalizeOptionalUrl(value: unknown): string {
  const trimmed = String(value ?? "").trim()
  if (!trimmed || trimmed === "https://" || trimmed === "http://") return ""
  return trimmed
}

export function isValidOptionalUrl(value: string): boolean {
  if (!value) return true
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}
