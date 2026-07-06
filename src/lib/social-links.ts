import type { LucideIcon } from "lucide-react"
import {
  Facebook,
  Ghost,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Send,
  SendHorizontal,
  Youtube,
} from "lucide-react"
import { SITE_CONTACT_DEFAULTS, whatsappHref } from "@/lib/site-contact"

export type SocialPlatformKey =
  | "whatsapp"
  | "telegram"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "youtube"
  | "twitter"
  | "tiktok"
  | "snapchat"

export interface SocialPlatform {
  key: SocialPlatformKey
  settingKey: string
  label: string
  labelAr: string
  icon: LucideIcon
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    key: "whatsapp",
    settingKey: "social_whatsapp",
    label: "WhatsApp",
    labelAr: "واتساب",
    icon: MessageCircle,
  },
  {
    key: "telegram",
    settingKey: "social_telegram",
    label: "Telegram",
    labelAr: "تيليجرام",
    icon: Send,
  },
  {
    key: "facebook",
    settingKey: "social_facebook",
    label: "Facebook",
    labelAr: "فيسبوك",
    icon: Facebook,
  },
  {
    key: "instagram",
    settingKey: "social_instagram",
    label: "Instagram",
    labelAr: "إنستغرام",
    icon: Instagram,
  },
  {
    key: "linkedin",
    settingKey: "social_linkedin",
    label: "LinkedIn",
    labelAr: "لينكدإن",
    icon: Linkedin,
  },
  {
    key: "youtube",
    settingKey: "social_youtube",
    label: "YouTube",
    labelAr: "يوتيوب",
    icon: Youtube,
  },
  {
    key: "twitter",
    settingKey: "social_twitter",
    label: "X",
    labelAr: "إكس",
    icon: SendHorizontal,
  },
  {
    key: "tiktok",
    settingKey: "social_tiktok",
    label: "TikTok",
    labelAr: "تيك توك",
    icon: Music2,
  },
  {
    key: "snapchat",
    settingKey: "social_snapchat",
    label: "Snapchat",
    labelAr: "سناب شات",
    icon: Ghost,
  },
]

export const SOCIAL_FALLBACK_URLS: Record<SocialPlatformKey, string> = {
  whatsapp: whatsappHref(SITE_CONTACT_DEFAULTS.social_whatsapp),
  telegram: "https://t.me",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  linkedin: "https://linkedin.com",
  youtube: "https://youtube.com",
  twitter: "https://x.com",
  tiktok: "https://tiktok.com",
  snapchat: "https://snapchat.com",
}

function readSetting(data: Record<string, unknown>, key: string): string {
  return String(data[key] ?? "").trim()
}

function parseFooterSocialJson(raw: string): Record<string, string> {
  if (!raw.trim()) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(parsed)) {
      const next = String(value ?? "").trim()
      if (next) result[key] = next
    }
    return result
  } catch {
    return {}
  }
}

export function parseSocialLinksFromSettings(
  data: Record<string, unknown>
): Record<SocialPlatformKey, string> {
  const jsonLinks = parseFooterSocialJson(readSetting(data, "footer_social_links"))

  return {
    whatsapp: readSetting(data, "social_whatsapp") || readSetting(data, "contact_phone"),
    telegram: readSetting(data, "social_telegram") || jsonLinks.telegram || "",
    facebook: readSetting(data, "social_facebook") || jsonLinks.facebook || "",
    instagram: readSetting(data, "social_instagram") || jsonLinks.instagram || "",
    linkedin: readSetting(data, "social_linkedin") || jsonLinks.linkedin || "",
    youtube: readSetting(data, "social_youtube") || jsonLinks.youtube || "",
    twitter:
      readSetting(data, "social_twitter") ||
      jsonLinks.twitter ||
      jsonLinks.x ||
      "",
    tiktok: readSetting(data, "social_tiktok") || jsonLinks.tiktok || "",
    snapchat: readSetting(data, "social_snapchat") || jsonLinks.snapchat || "",
  }
}

export function buildSocialHref(key: SocialPlatformKey, value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""

  if (key === "whatsapp") return whatsappHref(trimmed)

  if (key === "telegram") {
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    const handle = trimmed.replace(/^@/, "").replace(/^t\.me\//i, "")
    return handle ? `https://t.me/${handle}` : ""
  }

  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export interface SocialLinkItem extends SocialPlatform {
  href: string
  displayLabel: string
}

export function getSocialLinkItems(
  data: Record<string, unknown> = {},
  locale: "ar" | "en" = "en",
  options: { useFallbacks?: boolean } = {}
): SocialLinkItem[] {
  const useFallbacks = options.useFallbacks !== false
  const links = parseSocialLinksFromSettings({
    ...SITE_CONTACT_DEFAULTS,
    ...data,
  })

  return SOCIAL_PLATFORMS.map((platform) => {
    const configured = buildSocialHref(platform.key, links[platform.key])
    const href =
      configured ||
      (useFallbacks ? SOCIAL_FALLBACK_URLS[platform.key] : "")

    return {
      ...platform,
      href,
      displayLabel: locale === "ar" ? platform.labelAr : platform.label,
    }
  }).filter((item) => item.href)
}
