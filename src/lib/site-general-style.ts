import { z } from "zod"
import { textStyleSchema, type TextStyle } from "@/lib/text-style"

export const SITE_GENERAL_STYLE_KEY = "site_general_style"

export type SiteGeneralStyle = {
  siteName: TextStyle & { useGradient: boolean; accentColor: string }
  siteDescription: TextStyle & { lineHeight: number }
}

export const siteGeneralStyleSchema = z.object({
  siteName: textStyleSchema.extend({
    useGradient: z.boolean(),
    accentColor: z.string(),
  }),
  siteDescription: textStyleSchema.extend({
    lineHeight: z.number().min(1.2).max(2.4),
  }),
})

export const DEFAULT_SITE_GENERAL_STYLE: SiteGeneralStyle = {
  siteName: {
    color: "#ffffff",
    accentColor: "#f5c542",
    fontFamily: "tajawal",
    fontSize: 28,
    fontWeight: 700,
    useGradient: true,
  },
  siteDescription: {
    color: "#94a3b8",
    fontFamily: "tajawal",
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.7,
  },
}

export function parseSiteGeneralStyle(raw: string | null | undefined): SiteGeneralStyle {
  if (!raw) return { ...DEFAULT_SITE_GENERAL_STYLE }
  try {
    const parsed = siteGeneralStyleSchema.safeParse(JSON.parse(raw))
    if (parsed.success) {
      return {
        siteName: { ...DEFAULT_SITE_GENERAL_STYLE.siteName, ...parsed.data.siteName },
        siteDescription: { ...DEFAULT_SITE_GENERAL_STYLE.siteDescription, ...parsed.data.siteDescription },
      }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SITE_GENERAL_STYLE }
}
