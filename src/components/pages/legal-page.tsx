"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Scale } from "lucide-react"
import { useTheme } from "next-themes"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import {
  DEFAULT_LEGAL_PAGES,
  getLegalPage,
  legalBodyStyleToCss,
  legalTextStyleToCss,
  legalTitleStyleToCss,
  pickLocalized,
  type LegalPageConfig,
  type LegalPageId,
  type LegalPagesConfig,
} from "@/lib/legal-pages"

function AnimatedBlock({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function LegalPageBody({
  config,
  locale,
  isLightMode,
}: {
  config: LegalPageConfig
  locale: "ar" | "en"
  isLightMode: boolean
}) {
  const titleStyle = legalTitleStyleToCss(config.style.pageTitle, isLightMode)

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <AnimatedBlock className="text-center mb-12">
        <div
          className={cn(
            "inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-5",
            isLightMode ? "bg-black/5" : "bg-[oklch(0.78_0.14_82/12%)]"
          )}
        >
          <Scale
            className={cn("h-7 w-7", isLightMode ? "text-black" : "text-white")}
          />
        </div>
        <h1 className="font-bold tracking-tight leading-tight" style={titleStyle}>
          {pickLocalized(config.content.pageTitle, locale)}
        </h1>
        <p className="mt-4 max-w-2xl mx-auto" style={legalBodyStyleToCss(config.style.intro, isLightMode)}>
          {pickLocalized(config.content.intro, locale)}
        </p>
        <p className="mt-3" style={legalTextStyleToCss(config.style.lastUpdated, isLightMode)}>
          {pickLocalized(config.content.lastUpdated, locale)}
        </p>
      </AnimatedBlock>

      <div className="space-y-10">
        {config.content.sections.map((section, index) => (
          <AnimatedBlock key={`${section.heading.ar}-${index}`} delay={index * 0.05}>
            <article className="rounded-2xl border border-border/40 bg-card/30 p-6 sm:p-8">
              <h2
                className="mb-4 font-semibold"
                style={legalTextStyleToCss(config.style.sectionHeading, isLightMode)}
              >
                {pickLocalized(section.heading, locale)}
              </h2>
              <div
                className="space-y-3 whitespace-pre-line"
                style={legalBodyStyleToCss(config.style.body, isLightMode)}
              >
                {pickLocalized(section.body, locale)}
              </div>
            </article>
          </AnimatedBlock>
        ))}
      </div>
    </div>
  )
}

export function LegalPageView({ pageId }: { pageId: LegalPageId }) {
  const { locale, dir } = useI18n()
  const { resolvedTheme } = useTheme()
  const [themeMounted, setThemeMounted] = useState(false)
  const activeLocale: "ar" | "en" = locale === "ar" ? "ar" : "en"
  const [config, setConfig] = useState<LegalPageConfig>(getLegalPage(DEFAULT_LEGAL_PAGES, pageId))

  useEffect(() => {
    setThemeMounted(true)
  }, [])

  const isLightMode = !themeMounted || resolvedTheme !== "dark"

  useEffect(() => {
    fetch("/api/legal-pages", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { config?: LegalPagesConfig }) => {
        if (data?.config) setConfig(getLegalPage(data.config, pageId))
      })
      .catch(() => setConfig(getLegalPage(DEFAULT_LEGAL_PAGES, pageId)))
  }, [pageId])

  return (
    <div dir={dir} className={cn("min-h-screen bg-background", dir === "rtl" ? "text-end" : "text-start")}>
      {!isLightMode ? (
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[oklch(0.78_0.14_82/6%)] to-transparent pointer-events-none" />
      ) : null}
      <LegalPageBody config={config} locale={activeLocale} isLightMode={isLightMode} />
    </div>
  )
}

export function PrivacyPolicyPage() {
  return <LegalPageView pageId="privacy" />
}

export function TermsPage() {
  return <LegalPageView pageId="terms" />
}
