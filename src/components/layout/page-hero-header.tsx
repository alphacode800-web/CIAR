"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  pickLocalized,
  textStyleToCss,
  type PageHeaderConfig,
} from "@/lib/page-headers"

function buildTitleAccentStyle(config: PageHeaderConfig) {
  return config.titleAccentUseGradient
    ? {
        ...textStyleToCss(config.titleAccentStyle),
        backgroundImage: `linear-gradient(135deg, ${config.titleAccentStyle.color}, ${config.titleStyle.color})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }
    : textStyleToCss(config.titleAccentStyle)
}

type PageHeaderTextBlockProps = {
  config: PageHeaderConfig
  locale: "ar" | "en"
  className?: string
  align?: "start" | "center"
  animated?: boolean
  inView?: boolean
}

export function PageHeaderTextBlock({
  config,
  locale,
  className,
  align = "center",
  animated = false,
  inView = true,
}: PageHeaderTextBlockProps) {
  const isPlatforms = config.layout === "platforms"
  const textAlign = align === "center" || isPlatforms ? "center" : "start"

  const badgeText = pickLocalized(config.badge, locale)
  const title1 = pickLocalized(config.titleLine1, locale)
  const title2 = pickLocalized(config.titleLine2, locale)
  const subtitle = pickLocalized(config.subtitle, locale)
  const titleAccentStyle = buildTitleAccentStyle(config)

  const TitleTag = animated ? motion.h1 : "h1"
  const SubtitleTag = animated ? motion.p : "p"
  const BadgeWrap = animated ? motion.div : "div"

  const titleProps = animated
    ? {
        initial: { opacity: 0, y: 30 },
        animate: inView ? { opacity: 1, y: 0 } : {},
        transition: { duration: 0.8, delay: 0.1 },
      }
    : {}

  const subtitleProps = animated
    ? {
        initial: { opacity: 0, y: 20 },
        animate: inView ? { opacity: 1, y: 0 } : {},
        transition: { duration: 0.7, delay: 0.2 },
      }
    : {}

  const badgeProps = animated
    ? {
        initial: { opacity: 0, y: 16 },
        animate: inView ? { opacity: 1, y: 0 } : {},
        transition: { duration: 0.6 },
      }
    : {}

  return (
    <div
      className={cn(
        "space-y-6",
        textAlign === "center" && "text-center",
        className
      )}
    >
      {config.badgeVisible && badgeText ? (
        <BadgeWrap
          {...badgeProps}
          className={cn("mb-0", textAlign === "center" && "flex justify-center")}
        >
          {isPlatforms ? (
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm"
              style={{
                backgroundColor: config.badgeStyle.backgroundColor,
                borderColor: config.badgeStyle.borderColor,
              }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: config.badgeStyle.color }} />
              <span style={textStyleToCss(config.badgeStyle)}>{badgeText}</span>
            </div>
          ) : (
            <Badge
              variant="secondary"
              className="mb-0 border px-4 py-1.5 glass-subtle"
              style={{
                backgroundColor: config.badgeStyle.backgroundColor,
                borderColor: config.badgeStyle.borderColor,
                ...textStyleToCss(config.badgeStyle),
              }}
            >
              {badgeText}
            </Badge>
          )}
        </BadgeWrap>
      ) : null}

      {title1 ? (
        <TitleTag
          {...titleProps}
          className={cn(
            "font-bold leading-tight tracking-tight drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]",
            textAlign === "center" && "mx-auto"
          )}
          style={textStyleToCss(config.titleStyle)}
        >
          {config.titleSplit && title2 ? (
            <>
              {title1}{" "}
              <span style={titleAccentStyle}>{title2}</span>
            </>
          ) : config.titleAccentUseGradient ? (
            <span style={titleAccentStyle}>{title1}</span>
          ) : (
            title1
          )}
        </TitleTag>
      ) : null}

      {subtitle ? (
        <SubtitleTag
          {...subtitleProps}
          className={cn(
            "max-w-3xl leading-relaxed drop-shadow-[0_1px_10px_rgba(0,0,0,0.4)]",
            textAlign === "center" ? "mx-auto mt-5 max-w-2xl" : "mt-3"
          )}
          style={textStyleToCss(config.subtitleStyle)}
        >
          {subtitle}
        </SubtitleTag>
      ) : null}
    </div>
  )
}

export function PageHeaderOverlay({ config }: { config: PageHeaderConfig }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(to bottom, ${config.overlayFromColor}, ${config.overlayToColor})`,
        opacity: config.overlayOpacity / 100,
      }}
    />
  )
}

type PageHeroHeaderProps = {
  config: PageHeaderConfig
  locale: "ar" | "en"
  className?: string
  children?: React.ReactNode
}

export function PageHeroHeader({ config, locale, className, children }: PageHeroHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" })
  const isPlatforms = config.layout === "platforms"

  return (
    <section
      className={cn("relative overflow-hidden", className)}
      style={{
        paddingTop: `${config.paddingTop}px`,
        paddingBottom: `${config.paddingBottom}px`,
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        {config.backgroundImage ? (
          <img
            src={config.backgroundImage}
            alt=""
            className="h-full w-full object-cover scale-105"
            style={{ opacity: config.backgroundOpacity / 100 }}
          />
        ) : null}
        <PageHeaderOverlay config={config} />
      </div>

      <div className="absolute inset-0 mesh-gradient pointer-events-none" />
      <div className="absolute inset-0 dot-pattern pointer-events-none" />
      <div className="noise-overlay absolute inset-0 pointer-events-none" />

      <div
        ref={headerRef}
        className={cn(
          "relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
          isPlatforms ? "pt-4" : ""
        )}
      >
        <PageHeaderTextBlock config={config} locale={locale} animated inView={headerInView} />

        {children ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-10 sm:mt-12"
          >
            {children}
          </motion.div>
        ) : null}
      </div>
    </section>
  )
}
