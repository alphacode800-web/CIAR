"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { Check, ChevronLeft, ChevronRight, Shirt } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FittingGarment } from "@/lib/virtual-fitting/types"

type GarmentSelectorProps = {
  garments: FittingGarment[]
  selectedId: string | null
  onSelect: (id: string) => void
  isAr: boolean
  disabled?: boolean
}

export function GarmentSelector({
  garments,
  selectedId,
  onSelect,
  isAr,
  disabled,
}: GarmentSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "prev" | "next") => {
    const el = scrollRef.current
    if (!el) return
    const amount = dir === "next" ? 220 : -220
    el.scrollBy({ left: amount, behavior: "smooth" })
  }

  if (garments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
        {isAr ? "لا توجد قطع أزياء متاحة حالياً" : "No fashion garments available yet"}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Shirt className="h-4 w-4 text-[oklch(0.78_0.14_82)]" />
          {isAr ? "اختر قطعة الملابس" : "Select garment"}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => scroll("prev")}
            className="rounded-full border border-border/50 p-1.5 hover:bg-muted/50"
            aria-label={isAr ? "السابق" : "Previous"}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("next")}
            className="rounded-full border border-border/50 p-1.5 hover:bg-muted/50"
            aria-label={isAr ? "التالي" : "Next"}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin"
      >
        {garments.map((garment) => {
          const selected = garment.id === selectedId
          return (
            <motion.button
              key={garment.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(garment.id)}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              className={cn(
                "relative w-[140px] shrink-0 snap-start overflow-hidden rounded-2xl border text-start transition-all duration-300",
                "bg-gradient-to-b from-background/80 to-muted/30 backdrop-blur-sm",
                selected
                  ? "border-[oklch(0.78_0.14_82/60%)] shadow-[0_0_24px_oklch(0.78_0.14_82/20%)] ring-2 ring-[oklch(0.78_0.14_82/35%)]"
                  : "border-border/40 hover:border-[oklch(0.78_0.14_82/30%)]",
                disabled && "opacity-60"
              )}
            >
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={garment.imageUrl}
                  alt={garment.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="space-y-0.5 p-2.5">
                <p className="line-clamp-2 text-xs font-semibold leading-tight">{garment.title}</p>
                {garment.price != null ? (
                  <p className="text-[10px] text-[oklch(0.78_0.14_82)]">
                    {garment.price.toLocaleString()} {garment.currency || "SAR"}
                  </p>
                ) : null}
              </div>
              {selected ? (
                <div className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[oklch(0.78_0.14_82)] text-black shadow-lg">
                  <Check className="h-3.5 w-3.5" />
                </div>
              ) : null}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
