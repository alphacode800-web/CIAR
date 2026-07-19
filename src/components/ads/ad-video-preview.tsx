"use client"

import { ExternalLink } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import {
  collectVideoUrls,
  getVideoEmbedUrl,
  isDirectVideoUrl,
  normalizeVideoUrl,
} from "@/lib/ad-product-details"

export function AdVideoPreview({ url, compact = false }: { url: string; compact?: boolean }) {
  const { locale } = useI18n()
  const isAr = locale === "ar"
  const normalized = normalizeVideoUrl(url)
  const embed = getVideoEmbedUrl(normalized)

  if (!normalized) return null

  if (embed && !isDirectVideoUrl(normalized)) {
    return (
      <div className={`overflow-hidden rounded-xl border border-border/40 bg-black/90 ${compact ? "aspect-video" : "aspect-video"}`}>
        <iframe
          src={embed}
          title={isAr ? "فيديو الإعلان" : "Ad video"}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  if (isDirectVideoUrl(normalized)) {
    return (
      <video
        src={normalized}
        controls
        playsInline
        className={`w-full rounded-xl border border-border/40 bg-black ${compact ? "max-h-40" : "max-h-56"}`}
      />
    )
  }

  return (
    <a
      href={normalized}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[oklch(0.76_0.19_48)] hover:underline"
    >
      {isAr ? "فتح رابط الفيديو" : "Open video link"}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  )
}

export function AdVideoGallery({ details }: { details?: { videoUrl?: string; videoUrls?: string[] } }) {
  const urls = collectVideoUrls(details)
  if (!urls.length) return null

  return (
    <div className="space-y-2">
      {urls.map((url) => (
        <AdVideoPreview key={url} url={url} />
      ))}
    </div>
  )
}
