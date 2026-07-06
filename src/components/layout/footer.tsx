"use client"

import { useEffect, useState } from "react"
import { Mail, MapPin, Phone, ChevronRight } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { SITE_CONTACT_DEFAULTS } from "@/lib/site-contact"
import { getSocialLinkItems, type SocialLinkItem } from "@/lib/social-links"
import {
  DEFAULT_SITE_GENERAL_STYLE,
  SITE_GENERAL_STYLE_KEY,
  parseSiteGeneralStyle,
  type SiteGeneralStyle,
} from "@/lib/site-general-style"
import { textStyleToCss, titleStyleToCss } from "@/lib/text-style"
import { cn } from "@/lib/utils"

export function Footer() {
  const { t, dir, locale } = useI18n()
  const { navigate } = useRouter()
  const isAr = locale === "ar"
  const [contactEmail, setContactEmail] = useState(SITE_CONTACT_DEFAULTS.contact_email)
  const [contactPhone, setContactPhone] = useState(SITE_CONTACT_DEFAULTS.contact_phone)
  const [siteName, setSiteName] = useState("")
  const [siteDescription, setSiteDescription] = useState("")
  const [generalStyle, setGeneralStyle] = useState<SiteGeneralStyle>(DEFAULT_SITE_GENERAL_STYLE)
  const [socialItems, setSocialItems] = useState<SocialLinkItem[]>(() =>
    getSocialLinkItems({}, isAr ? "ar" : "en")
  )

  const defaultDescription = isAr
    ? "منصة CIAR المتكاملة تجمع التجارة والخدمات والفرص في تجربة رقمية حديثة."
    : "CIAR integrated ecosystem brings commerce, services, and opportunities in one modern digital experience."

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings")
        const data = res.ok ? await res.json() : {}
        if (data?.contact_email) setContactEmail(String(data.contact_email))
        if (data?.contact_phone) setContactPhone(String(data.contact_phone))
        if (data?.site_name) setSiteName(String(data.site_name))
        if (data?.site_description) setSiteDescription(String(data.site_description))
        setGeneralStyle(parseSiteGeneralStyle(data[SITE_GENERAL_STYLE_KEY]))
        setSocialItems(getSocialLinkItems(data, isAr ? "ar" : "en"))
      } catch {
        setSocialItems(getSocialLinkItems({}, isAr ? "ar" : "en"))
      }
    }
    void load()
  }, [isAr])

  const displayName = siteName || t("footer.brand") || "CIAR"
  const displayDescription = siteDescription || defaultDescription

  const quickLinks = [
    { label: isAr ? "الرئيسية" : "Home", page: "home" as const },
    { label: isAr ? "منصتنا" : "Our Platforms", page: "projects" as const },
    { label: isAr ? "من نحن" : "About", page: "about" as const },
    { label: isAr ? "تواصل معنا" : "Contact", page: "contact" as const },
  ]

  const platformLinks = [
    { label: isAr ? "CiAr موضة" : "CIAR Fashion", slug: "fashion" },
    { label: isAr ? "CiAr للمنتجات العالمية" : "CIAR Global Products", slug: "global_products" },
    { label: isAr ? "CiAr VIP" : "CIAR VIP", slug: "vip" },
    { label: isAr ? "مول CiAr الإلكتروني" : "CIAR E-Mall", slug: "mall" },
    { label: isAr ? "CiAr السياحي" : "CIAR Tourism", slug: "tourism" },
  ]

  return (
    <footer dir={dir} className="relative mt-auto">
      <div className="glow-line-gold" />

      <div className="relative bg-[oklch(0.08_0.025_265)]">
        <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-3">
                <div style={titleStyleToCss(generalStyle.siteName)}>{displayName}</div>
              </div>
              <p
                className="mt-3 max-w-xs"
                style={{
                  ...textStyleToCss(generalStyle.siteDescription),
                  lineHeight: generalStyle.siteDescription.lineHeight,
                }}
              >
                {displayDescription}
              </p>

              <div className="mt-5 space-y-2.5 text-sm text-muted-foreground">
                <p className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="hover:text-primary transition-colors">
                    {contactPhone}
                  </a>
                </p>
                <p className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-primary transition-colors">
                    {contactEmail}
                  </a>
                </p>
                <p className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {isAr ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}
                </p>
              </div>

              {/* Social icons */}
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                {socialItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <a
                        key={item.key}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.displayLabel}
                        title={item.displayLabel}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full glass-subtle border border-[oklch(0.78_0.14_82/15%)]",
                          "text-muted-foreground hover:text-primary",
                          "hover:border-[oklch(0.78_0.14_82/30%)]",
                          "transition-all duration-200"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    )
                  })}
              </div>
            </div>

            {/* Platforms column */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">{isAr ? "أهم المنصات" : "Top Platforms"}</h3>
              <ul className="space-y-2.5">
                {platformLinks.map((item) => (
                  <li key={item.slug}>
                    <button
                      onClick={() => navigate({ page: "platform", slug: item.slug })}
                      className={cn(
                        "text-sm text-muted-foreground transition-all duration-200 inline-flex items-center gap-1.5",
                        "hover:text-primary hover:translate-x-0.5"
                      )}
                    >
                      <ChevronRight className={`h-3.5 w-3.5 ${isAr ? "rotate-180" : ""}`} />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">{isAr ? "روابط سريعة" : "Quick Links"}</h3>
              <ul className="space-y-2.5">
                {quickLinks.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => navigate({ page: item.page })}
                      className={cn(
                        "text-sm text-muted-foreground transition-all duration-200 inline-flex items-center gap-1.5",
                        "hover:text-primary hover:translate-x-0.5"
                      )}
                    >
                      <ChevronRight className={`h-3.5 w-3.5 ${isAr ? "rotate-180" : ""}`} />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal / newsletter */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">{isAr ? "التحديثات" : "Updates"}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isAr
                  ? "اشترك لتصلك أحدث عروض المنصات والتحديثات الجديدة."
                  : "Subscribe to receive latest platform offers and updates."}
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  type="email"
                  placeholder={isAr ? "بريدك الإلكتروني" : "Your email"}
                  className="h-10 w-full rounded-xl border border-border/30 bg-card/50 px-3 text-sm outline-none focus:border-primary/40"
                />
                <button className="btn-gold rounded-xl px-4 text-sm font-semibold">
                  {isAr ? "اشتراك" : "Join"}
                </button>
              </div>
              <div className="mt-4 text-xs text-muted-foreground/80">
                <button onClick={() => navigate({ page: "home" })} className="hover:text-primary">
                  {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
                </button>
                <span className="mx-2">•</span>
                <button onClick={() => navigate({ page: "home" })} className="hover:text-primary">
                  {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="section-divider-gold mt-12 mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {displayName}.{" "}
              {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAr ? "صُمم بعناية لمنصات CIAR" : "Crafted with care for CIAR platforms"}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
