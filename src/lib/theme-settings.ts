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
  theme_heading_font: "Plus Jakarta Sans",
  theme_body_font: "Plus Jakarta Sans",
}

const FONT_STACKS: Record<string, string> = {
  "Geist Sans": "var(--font-geist-sans), system-ui, sans-serif",
  Inter: "var(--font-plus-jakarta), var(--font-geist-sans), system-ui, sans-serif",
  "Plus Jakarta Sans": "var(--font-plus-jakarta), var(--font-geist-sans), system-ui, sans-serif",
  Changa: "var(--font-changa), var(--font-tajawal), system-ui, sans-serif",
  Cairo: "var(--font-cairo), var(--font-tajawal), system-ui, sans-serif",
  Tajawal: "var(--font-tajawal), var(--font-cairo), system-ui, sans-serif",
  "El Messiri": "var(--font-el-messiri), var(--font-changa), system-ui, sans-serif",
  "Space Grotesk": "\"Space Grotesk\", var(--font-geist-sans), system-ui, sans-serif",
}

const clampInt = (value: string, min: number, max: number, fallback: number) => {
  const n = Number.parseInt(String(value || ""), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

/** Darken a hex color for readable text on light backgrounds */
const darkenHex = (hex: string, amount = 0.32) => {
  const clean = hex.replace("#", "").trim()
  if (clean.length !== 6) return hex
  const factor = 1 - amount
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0")
  const r = Number.parseInt(clean.slice(0, 2), 16)
  const g = Number.parseInt(clean.slice(2, 4), 16)
  const b = Number.parseInt(clean.slice(4, 6), 16)
  return `#${toHex(r * factor)}${toHex(g * factor)}${toHex(b * factor)}`
}

export function applyThemeSettings(settings: ThemeSettingsMap) {
  if (typeof document === "undefined") return
  const root = document.documentElement
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
  const headingFont = FONT_STACKS[get("theme_heading_font")] || FONT_STACKS["Plus Jakarta Sans"]
  const bodyFont = FONT_STACKS[get("theme_body_font")] || FONT_STACKS.Tajawal
  const isRtl = root.dir === "rtl"

  root.style.setProperty("--primary", darkenHex(primary))
  root.style.setProperty("--gold-accent", darkenHex(primary))
  root.style.setProperty("--gold-soft", primary)
  root.style.setProperty("--ring", primary)
  root.style.setProperty("--chart-1", primary)
  root.style.setProperty("--secondary", secondary)
  root.style.setProperty("--accent", accent)
  root.style.setProperty("--theme-background-light", backgroundLight)
  root.style.setProperty("--theme-background-dark", backgroundDark || DEFAULTS.theme_background_color_dark)
  root.style.setProperty("--radius", `${radius / 16}rem`)
  root.style.setProperty("--theme-blur-intensity", `${blur}px`)
  root.style.setProperty("--theme-heading-font", headingFont)
  root.style.setProperty("--theme-body-font", isRtl ? FONT_STACKS.Tajawal : bodyFont)
  root.style.setProperty("--theme-body-font-rtl", FONT_STACKS.Tajawal)
  root.style.setProperty("--theme-heading-font-rtl", FONT_STACKS["El Messiri"])
  root.style.setProperty(
    "--font-sans",
    isRtl
      ? "var(--font-tajawal), var(--font-cairo), var(--font-plus-jakarta), system-ui, sans-serif"
      : "var(--font-plus-jakarta), var(--font-tajawal), var(--font-geist-sans), system-ui, sans-serif"
  )
  root.style.fontSize = `${baseFont}px`

  if (animationsEnabled) {
    root.classList.remove("theme-no-animations")
  } else {
    root.classList.add("theme-no-animations")
  }
}
