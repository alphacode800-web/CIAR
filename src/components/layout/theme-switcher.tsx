"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n-context"

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme()
  const { t } = useI18n()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "h-9 w-9 transition-all duration-300",
        "hover:bg-muted hover:text-primary",
        "focus-visible:ring-2 focus-visible:ring-primary/30"
      )}
      aria-label={t("admin.toggle_theme") || "تبديل الوضع الليلي / النهاري"}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
