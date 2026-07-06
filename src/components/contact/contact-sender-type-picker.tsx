"use client"

import { cn } from "@/lib/utils"
import {
  CONTACT_SENDER_TYPES,
  type ContactSenderTypeId,
} from "@/lib/contact-sender-types"

interface ContactSenderTypePickerProps {
  value: ContactSenderTypeId | ""
  onChange: (value: ContactSenderTypeId) => void
  locale: string
  label: string
  hint?: string
  error?: string
}

export function ContactSenderTypePicker({
  value,
  onChange,
  locale,
  label,
  hint,
  error,
}: ContactSenderTypePickerProps) {
  const isAr = locale === "ar"

  return (
    <div className="space-y-3">
      <div>
        {label ? (
          <>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
          </>
        ) : hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CONTACT_SENDER_TYPES.map((item) => {
          const Icon = item.icon
          const selected = value === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-pressed={selected}
              className={cn(
                "flex min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                selected
                  ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                  : "border-foreground/15 bg-background text-foreground hover:border-primary/30 hover:bg-muted/40"
              )}
            >
              <Icon className={cn("h-5 w-5", selected ? "text-primary" : "text-muted-foreground")} />
              <span className="text-xs font-medium leading-tight">
                {isAr ? item.labelAr : item.labelEn}
              </span>
            </button>
          )
        })}
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
