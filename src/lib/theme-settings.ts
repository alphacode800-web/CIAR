export type ThemeSettingsMap = Record<string, string>

const DEFAULTS: ThemeSettingsMap = {
  theme_primary_color: "#d4af37",
  theme_secondary_color: "#1a2744",
  theme_accent_color: "#c9a227",
  theme_background_color: "#f8fbff",
  theme_background_color_dark: "#0a0f1e",
  theme_base_font_size: "16",
  theme_border_radius: "12",
  theme_blur_intensity: "12",
  theme_animations: "true",
  theme_heading_font: "Geist Sans",
  theme_body_font: "Geist Sans",
}

const FONT_STACKS: Record<string, string> = {
  "Geist Sans": "var(--font-geist-sans), Inter, system-ui, sans-serif",
  Inter: "Inter, var(--font-geist-sans), system-ui, sans-serif",
  "Plus Jakarta Sans": "\"Plus Jakarta Sans\", Inter, system-ui, sans-serif",
  "Space Grotesk": "\"Space Grotesk\", var(--font-geist-sans), system-ui, sans-serif",
}

const clampInt = (value: string, min: number, max: number, fallback: number) => {
  const n = Number.parseInt(String(value || ""), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

export function applyThemeSettings(settings: ThemeSettingsMap) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  const body = document.body
  const get = (key: string) => String(settings[key] || DEFAULTS[key] || "").trim()

  const primary = get("theme_primary_color")
  const secondary = get("theme_secondary_color")
  const accent = get("theme_accent_color")
  const backgroundLight = get("theme_background_color")
  const backgroundDark = get("theme_background_color_dark")
  const baseFont = clampInt(get("theme_base_font_size"), 12, 22, 16)
  const radius = clampInt(get("theme_border_radius"), 0, 32, 12)
  const blur = clampInt(get("theme_blur_intensity"), 0, 32, 12)
  const animationsEnabled = get("theme_animations") !== "false"
  const headingFont = FONT_STACKS[get("theme_heading_font")] || FONT_STACKS["Geist Sans"]
  const bodyFont = FONT_STACKS[get("theme_body_font")] || FONT_STACKS["Geist Sans"]

  root.style.setProperty("--primary", primary)
  root.style.setProperty("--ring", primary)
  root.style.setProperty("--chart-1", primary)
  root.style.setProperty("--secondary", secondary)
  root.style.setProperty("--accent", accent)
  root.style.setProperty("--theme-background-light", backgroundLight)
  root.style.setProperty("--theme-background-dark", backgroundDark || DEFAULTS.theme_background_color_dark)
  root.style.setProperty("--radius", `${radius / 16}rem`)
  root.style.setProperty("--theme-blur-intensity", `${blur}px`)
  root.style.setProperty("--theme-heading-font", headingFont)
  root.style.setProperty("--theme-body-font", bodyFont)
  root.style.setProperty("--theme-body-font-rtl", bodyFont)
  root.style.fontSize = `${baseFont}px`
  body.style.fontFamily = bodyFont

  if (animationsEnabled) {
    root.classList.remove("theme-no-animations")
  } else {
    root.classList.add("theme-no-animations")
  }
}
