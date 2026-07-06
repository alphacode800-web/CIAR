"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { cn } from "@/lib/utils"
import { ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DEFAULT_HOME_ABOUT_BRIEF,
  pickLocalized,
  type HomeAboutBriefConfig,
} from "@/lib/home-about-brief"
import { textStyleToCss, titleStyleToCss } from "@/lib/text-style"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
})

export function AboutBrief() {
  const { dir, locale } = useI18n()
  const { navigate } = useRouter()
  const activeLocale = locale === "ar" ? "ar" : "en"
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [config, setConfig] = useState<HomeAboutBriefConfig>(DEFAULT_HOME_ABOUT_BRIEF)

  useEffect(() => {
    fetch("/api/home/about-brief", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.config) setConfig(d.config)
      })
      .catch(() => setConfig(DEFAULT_HOME_ABOUT_BRIEF))
  }, [])

  const titleStyle = config.style.title.useGradient
    ? titleStyleToCss(config.style.title)
    : textStyleToCss(config.style.title)

  return (
    <section ref={ref} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: dir === "rtl" ? 24 : -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={cn("space-y-6", dir === "rtl" ? "lg:order-2 text-end" : "lg:order-1 text-start")}
          >
            <div className={cn("flex items-center gap-4", dir === "rtl" ? "flex-row-reverse" : "")}>
              <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-[oklch(0.78_0.14_82/50%)] to-transparent" />
              <span className="uppercase tracking-widest" style={textStyleToCss(config.style.label)}>
                {pickLocalized(config.content.label, activeLocale)}
              </span>
            </div>

            <h2 className="font-bold tracking-tight leading-tight" style={titleStyle}>
              {pickLocalized(config.content.title, activeLocale)}
            </h2>

            <p
              style={{
                ...textStyleToCss(config.style.description),
                lineHeight: config.style.description.lineHeight,
              }}
            >
              {pickLocalized(config.content.description, activeLocale)}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                onClick={() => navigate({ page: "about" })}
                className="gap-2 rounded-xl px-6 h-11 text-sm font-semibold btn-gold"
                style={textStyleToCss(config.style.cta)}
              >
                {pickLocalized(config.content.cta, activeLocale)}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: dir === "rtl" ? -24 : 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={cn("lg:order-2", dir === "rtl" ? "lg:order-1" : "")}
          >
            <div className="glass rounded-2xl border border-[oklch(0.78_0.14_82/15%)] p-8 relative overflow-hidden">
              <div className="absolute -top-12 -end-12 h-40 w-40 rounded-full bg-[oklch(0.78_0.14_82/8%)] blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 start-0 h-32 w-32 rounded-full bg-[oklch(0.22_0.04_265/15%)] blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center gap-6 text-center">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/8%)] flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-[oklch(0.78_0.14_82)]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold" style={textStyleToCss(config.style.cardTitle)}>
                    {pickLocalized(config.content.cardTitle, activeLocale)}
                  </h3>
                  <p
                    className="max-w-xs mx-auto"
                    style={{
                      ...textStyleToCss(config.style.cardDescription),
                      lineHeight: config.style.cardDescription.lineHeight,
                    }}
                  >
                    {pickLocalized(config.content.cardDescription, activeLocale)}
                  </p>
                </div>
                <div className="flex gap-8 pt-2">
                  {config.content.stats.map((stat, index) => (
                    <div key={`${stat.value}-${index}`} className="flex items-center gap-8">
                      {index > 0 ? <div className="h-12 w-px bg-[oklch(0.78_0.14_82/15%)]" /> : null}
                      <div className="text-center">
                        <div style={textStyleToCss(config.style.statValue)}>{stat.value}</div>
                        <div className="mt-1" style={textStyleToCss(config.style.statLabel)}>
                          {pickLocalized(stat.label, activeLocale)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
