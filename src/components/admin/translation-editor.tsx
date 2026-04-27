"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, AlertCircle, Loader2, Type } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { LOCALE_NAMES } from "@/lib/i18n-context"

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface TranslationEditorProps {
  locale: string
  key: string
  value: string
  onChange: (key: string, locale: string, value: string) => void
  onSave: (key: string, locale: string, value: string) => Promise<void>
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

/* ─── Locale Badge Colors ────────────────────────────────────────────────── */

const LOCALE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  en: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  ar: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  fr: { bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/30" },
  es: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  de: { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/30" },
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export function TranslationEditor({
  locale,
  key: translationKey,
  value,
  onChange,
  onSave,
}: TranslationEditorProps) {
  const { t } = useI18n()
  const [editing, setEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [editing])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSave = useCallback(
    async (newValue: string) => {
      setSaveStatus("saving")
      try {
        await onSave(translationKey, locale, newValue)
        setSaveStatus("saved")
        setTimeout(() => setSaveStatus("idle"), 2000)
      } catch {
        setSaveStatus("error")
        setTimeout(() => setSaveStatus("idle"), 3000)
      }
    },
    [onSave, translationKey, locale]
  )

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    onChange(translationKey, locale, newValue)

    // Debounced auto-save (1 second)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      handleSave(newValue)
    }, 1000)
  }

  const handleBlur = () => {
    setEditing(false)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = undefined
    }
    // Save on blur if value changed
    if (localValue !== value) {
      handleSave(localValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      setEditing(false)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = undefined
      }
      if (localValue !== value) {
        handleSave(localValue)
      }
    }
    if (e.key === "Escape") {
      setEditing(false)
      setLocalValue(value)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = undefined
      }
    }
  }

  const localeColor = LOCALE_COLORS[locale] || LOCALE_COLORS.en
  const charCount = localValue.length
  const isEmpty = localValue.trim() === ""

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200",
        editing
          ? "border-[oklch(0.78_0.14_82/30%)] bg-[oklch(0.14_0.028_265/50%)] shadow-[0_0_12px_oklch(0.78_0.14_82/5%)]"
          : "border-[oklch(0.78_0.14_82/8%)] bg-[oklch(0.14_0.028_265/20%)] hover:border-[oklch(0.78_0.14_82/18%)] hover:bg-[oklch(0.14_0.028_265/35%)]"
      )}
    >
      {/* Locale Badge */}
      <div
        className={cn(
          "shrink-0 mt-1 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
          localeColor.bg,
          localeColor.text,
          localeColor.border
        )}
      >
        {LOCALE_NAMES[locale as keyof typeof LOCALE_NAMES] || locale}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Key label (shown when not editing) */}
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="w-full text-left group cursor-pointer"
          >
            <p className="text-[10px] font-mono text-muted-foreground/60 mb-1 truncate">
              {translationKey}
            </p>
            <p
              className={cn(
                "text-sm leading-relaxed",
                isEmpty ? "text-muted-foreground/40 italic" : "text-foreground"
              )}
            >
              {isEmpty
                ? (t("admin.click_to_edit") || "Click to edit...")
                : localValue}
            </p>
          </button>
        )}

        {/* Edit mode */}
        {editing && (
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-[oklch(0.78_0.14_82/50%)] mb-1">
              {translationKey}
            </p>
            <textarea
              ref={textareaRef}
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              rows={Math.max(1, Math.min(4, Math.ceil(localValue.length / 60) + 1))}
              className={cn(
                "w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/30 outline-none",
                "border-b border-[oklch(0.78_0.14_82/20%)] focus:border-[oklch(0.78_0.14_82/40%)] pb-1 transition-colors"
              )}
              placeholder={t("admin.type_translation") || "Type translation..."}
            />
            <p className="text-[10px] text-muted-foreground/40">
              {t("admin.press_enter") || "Press Enter to save, Esc to cancel"}
            </p>
          </div>
        )}
      </div>

      {/* Right side: char count + status */}
      <div className="shrink-0 flex flex-col items-end gap-1.5 mt-1">
        {/* Save status indicator */}
        <AnimatePresence mode="wait">
          {saveStatus !== "idle" && (
            <motion.div
              key={saveStatus}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1"
            >
              {saveStatus === "saving" && (
                <Loader2 className="h-3 w-3 text-[oklch(0.78_0.14_82)] animate-spin" />
              )}
              {saveStatus === "saved" && (
                <Check className="h-3 w-3 text-emerald-400" />
              )}
              {saveStatus === "error" && (
                <AlertCircle className="h-3 w-3 text-red-400" />
              )}
              <span
                className={cn(
                  "text-[10px] font-medium",
                  saveStatus === "saving" && "text-[oklch(0.78_0.14_82)]",
                  saveStatus === "saved" && "text-emerald-400",
                  saveStatus === "error" && "text-red-400"
                )}
              >
                {saveStatus === "saving" && (t("admin.saving") || "Saving...")}
                {saveStatus === "saved" && (t("admin.saved") || "Saved")}
                {saveStatus === "error" && (t("admin.save_error") || "Error")}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character count */}
        <span
          className={cn(
            "text-[10px] tabular-nums",
            charCount > 200 ? "text-amber-400" : "text-muted-foreground/40"
          )}
        >
          {charCount}
        </span>
      </div>
    </div>
  )
}
