"use client"

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n-context"
import type { ImageStripConfig } from "@/lib/image-strip"
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"

function StripImage({
  src,
  height,
  borderRadius,
  index,
  onBroken,
  onOpen,
}: {
  src: string
  height: number
  borderRadius: number
  index: number
  onBroken: (url: string) => void
  onOpen: (url: string) => void
}) {
  const [failed, setFailed] = useState(false)
  const width = Math.round(height * 0.68)

  if (failed) return null

  return (
    <button
      type="button"
      onClick={() => onOpen(src)}
      className="group/img relative shrink-0 cursor-pointer overflow-hidden shadow-lg shadow-black/30 ring-1 ring-white/10 transition-all duration-500 hover:z-10 hover:scale-[1.04] hover:ring-primary/35 hover:shadow-[0_8px_32px_-8px_oklch(0.78_0.14_82/40%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ height, width, borderRadius }}
      aria-label="Open image preview"
    >
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110"
        loading={index < 12 ? "eager" : "lazy"}
        draggable={false}
        onError={() => {
          setFailed(true)
          onBroken(src)
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/5 opacity-80"
        aria-hidden
      />
    </button>
  )
}

function ImageStripLightbox({
  images,
  index,
  onClose,
  onChange,
  locale,
}: {
  images: string[]
  index: number
  onClose: () => void
  onChange: (index: number) => void
  locale: string
}) {
  const isAr = locale === "ar"
  const total = images.length
  const current = images[index]

  const goPrev = useCallback(() => {
    onChange((index - 1 + total) % total)
  }, [index, onChange, total])

  const goNext = useCallback(() => {
    onChange((index + 1) % total)
  }, [index, onChange, total])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        isAr ? goNext() : goPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        isAr ? goPrev() : goNext()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [goNext, goPrev, isAr])

  if (!current) return null

  const PrevIcon = isAr ? ChevronRight : ChevronLeft
  const NextIcon = isAr ? ChevronLeft : ChevronRight

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/40 backdrop-blur-[5px]" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none sm:p-6",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"
          )}
        >
          <DialogTitle className="sr-only">
            {isAr ? "معاينة الصورة" : "Image preview"} {index + 1} / {total}
          </DialogTitle>

          <button
            type="button"
            onClick={onClose}
            className="absolute end-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-none border border-white/20 bg-black/45 text-white transition hover:border-primary/50 hover:text-primary"
            aria-label={isAr ? "إغلاق" : "Close"}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex w-full max-w-6xl items-stretch justify-center gap-0">
            <button
              type="button"
              onClick={goPrev}
              className="hidden h-auto min-h-[12rem] w-11 shrink-0 items-center justify-center rounded-none border border-white/15 bg-black/35 text-white transition hover:border-primary/45 hover:bg-black/50 hover:text-primary sm:flex sm:min-h-[18rem] sm:w-12"
              aria-label={isAr ? "الصورة السابقة" : "Previous image"}
            >
              <PrevIcon className="h-6 w-6" />
            </button>

            <div className="relative flex min-h-[50vh] flex-1 items-center justify-center rounded-none border border-white/15 bg-black/25 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.75)]">
              <img
                key={current}
                src={current}
                alt=""
                className="max-h-[72vh] w-auto max-w-full rounded-none object-contain"
              />

              <button
                type="button"
                onClick={goPrev}
                className="absolute start-0 top-1/2 flex h-10 w-9 -translate-y-1/2 items-center justify-center rounded-none border border-white/15 bg-black/45 text-white transition hover:border-primary/45 hover:text-primary sm:hidden"
                aria-label={isAr ? "الصورة السابقة" : "Previous image"}
              >
                <PrevIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute end-0 top-1/2 flex h-10 w-9 -translate-y-1/2 items-center justify-center rounded-none border border-white/15 bg-black/45 text-white transition hover:border-primary/45 hover:text-primary sm:hidden"
                aria-label={isAr ? "الصورة التالية" : "Next image"}
              >
                <NextIcon className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={goNext}
              className="hidden h-auto min-h-[12rem] w-11 shrink-0 items-center justify-center rounded-none border border-white/15 bg-black/35 text-white transition hover:border-primary/45 hover:bg-black/50 hover:text-primary sm:flex sm:min-h-[18rem] sm:w-12"
              aria-label={isAr ? "الصورة التالية" : "Next image"}
            >
              <NextIcon className="h-6 w-6" />
            </button>
          </div>

          <p className="mt-5 rounded-none border border-white/15 bg-black/35 px-4 py-1.5 text-[11px] font-medium tracking-[0.2em] text-white/75">
            {index + 1} / {total}
          </p>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

interface ImageStripBarProps {
  config: ImageStripConfig
  images: string[]
  className?: string
  preview?: boolean
}

export function ImageStripBar({ config, images, className, preview = false }: ImageStripBarProps) {
  const { locale } = useI18n()
  const activeLocale = locale === "ar" ? "ar" : "en"
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(() => new Set())
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const visibleImages = useMemo(
    () => [...new Set(images.map((url) => url.trim()).filter(Boolean))].filter((url) => !brokenUrls.has(url)),
    [images, brokenUrls]
  )

  const markBroken = (url: string) => {
    setBrokenUrls((prev) => {
      if (prev.has(url)) return prev
      const next = new Set(prev)
      next.add(url)
      return next
    })
  }

  const openLightbox = (src: string) => {
    const idx = visibleImages.indexOf(src)
    if (idx >= 0 && idx < visibleImages.length) setLightboxIndex(idx)
  }

  if (!config.enabled && !preview) return null
  if (visibleImages.length === 0) return null

  const trackItems = preview ? visibleImages : [...visibleImages, ...visibleImages]

  return (
    <>
      <section
        className={cn(
          "relative overflow-hidden bg-[oklch(0.10_0.025_265)]",
          preview ? "py-3" : "py-5 sm:py-6",
          className
        )}
        aria-label={activeLocale === "ar" ? "معرض صور الموقع" : "Site image gallery strip"}
      >
        {!preview && (
          <>
            <div className="pointer-events-none absolute inset-0 dot-pattern opacity-[0.12]" aria-hidden />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              aria-hidden
            />
          </>
        )}

        <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-12 bg-gradient-to-e from-[oklch(0.10_0.025_265)] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-12 bg-gradient-to-s from-[oklch(0.10_0.025_265)] to-transparent sm:w-24" />

        <div className="overflow-hidden" dir="ltr">
          <div
            className={cn(
              "flex w-max items-center gap-2 sm:gap-2.5",
              !preview && lightboxIndex === null && "image-strip-marquee",
              !preview && config.pauseOnHover && "image-strip-marquee-pause",
              lightboxIndex !== null && "image-strip-marquee-paused"
            )}
            style={
              !preview
                ? ({ ["--strip-duration" as string]: `${config.scrollDuration}s` } as CSSProperties)
                : undefined
            }
          >
            {trackItems.map((src, index) => (
              <StripImage
                key={`${src}-${index}`}
                src={src}
                height={config.imageHeight}
                borderRadius={config.borderRadius}
                index={index}
                onBroken={markBroken}
                onOpen={openLightbox}
              />
            ))}
          </div>
        </div>
      </section>

      {lightboxIndex !== null && visibleImages.length > 0 && visibleImages[lightboxIndex] && (
        <ImageStripLightbox
          images={visibleImages}
          index={Math.min(lightboxIndex, visibleImages.length - 1)}
          locale={activeLocale}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      )}
    </>
  )
}
