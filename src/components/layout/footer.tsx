"use client"

import { Mail, MapPin, Phone, ChevronRight } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { cn } from "@/lib/utils"

export function Footer() {
  const { t, dir, locale } = useI18n()
  const { navigate } = useRouter()
  const isAr = locale === "ar"

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
    { label: isAr ? "دليل CiAr السياحي" : "CIAR Tourism", slug: "tourism" },
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
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/logo.png"
                  alt="CIAR"
                  className="h-8 w-8 object-contain"
                />
                <span className="gradient-text text-xl font-bold tracking-wider">
                  {t("footer.brand")}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
                {isAr
                  ? "منصة CIAR المتكاملة تجمع التجارة والخدمات والفرص في تجربة رقمية حديثة."
                  : "CIAR integrated ecosystem brings commerce, services, and opportunities in one modern digital experience."}
              </p>

              <div className="mt-5 space-y-2.5 text-sm text-muted-foreground">
                <p className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  +966 50 000 0000
                </p>
                <p className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  hello@ciar.com
                </p>
                <p className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {isAr ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}
                </p>
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-2.5 mt-5">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className={cn(
                    "w-9 h-9 rounded-full glass-subtle border border-[oklch(0.78_0.14_82/15%)]",
                    "flex items-center justify-center",
                    "text-muted-foreground hover:text-[oklch(0.78_0.14_82)]",
                    "hover:border-[oklch(0.78_0.14_82/30%)]",
                    "transition-all duration-200"
                  )}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className={cn(
                    "w-9 h-9 rounded-full glass-subtle border border-[oklch(0.78_0.14_82/15%)]",
                    "flex items-center justify-center",
                    "text-muted-foreground hover:text-[oklch(0.78_0.14_82)]",
                    "hover:border-[oklch(0.78_0.14_82/30%)]",
                    "transition-all duration-200"
                  )}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className={cn(
                    "w-9 h-9 rounded-full glass-subtle border border-[oklch(0.78_0.14_82/15%)]",
                    "flex items-center justify-center",
                    "text-muted-foreground hover:text-[oklch(0.78_0.14_82)]",
                    "hover:border-[oklch(0.78_0.14_82/30%)]",
                    "transition-all duration-200"
                  )}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
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
                        "hover:text-[oklch(0.78_0.14_82)] hover:translate-x-0.5"
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
                        "hover:text-[oklch(0.78_0.14_82)] hover:translate-x-0.5"
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
              &copy; {new Date().getFullYear()} {t("footer.brand")}.{" "}
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
