"use client"

import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { cn } from "@/lib/utils"

export function Footer() {
  const { t, dir } = useI18n()
  const { navigate } = useRouter()

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
                <svg viewBox="0 0 36 36" className="h-8 w-8" fill="none">
                  <defs>
                    <linearGradient id="footer-logo" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="oklch(0.82 0.145 85)" />
                      <stop offset="100%" stopColor="oklch(0.70 0.13 72)" />
                    </linearGradient>
                  </defs>
                  <path d="M18 6L29 12V24L18 30L7 24V12L18 6Z" fill="url(#footer-logo)" opacity="0.9" />
                  <text x="18" y="20.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="oklch(0.12 0.03 265)" fontFamily="var(--font-geist-sans)">C</text>
                </svg>
                <span className="gradient-text text-xl font-bold tracking-wider">
                  {t("footer.brand")}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
                {t("hero.subtitle")}
              </p>

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
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {t("footer.products")}
              </h3>
              <ul className="space-y-2.5">
                {[
                  { key: "footer.product_1", slug: "ciar-realestate" },
                  { key: "footer.product_2", slug: "ciar-carrental" },
                  { key: "footer.product_3", slug: "ciar-mall" },
                  { key: "footer.product_4", slug: "ciar-travel" },
                  { key: "footer.product_5", slug: "ciar-food" },
                ].map((item) => (
                  <li key={item.key}>
                    <button
                      onClick={() =>
                        navigate({ page: "project", slug: item.slug })
                      }
                      className={cn(
                        "text-sm text-muted-foreground transition-colors duration-200",
                        "hover:text-[oklch(0.78_0.14_82)]"
                      )}
                    >
                      {t(item.key)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company column */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {t("footer.company")}
              </h3>
              <ul className="space-y-2.5">
                {[
                  { label: "nav.about", page: "about" as const },
                  { label: "nav.projects", page: "projects" as const },
                  { label: "nav.contact", page: "contact" as const },
                  { label: "footer.blog", page: "home" as const },
                  { label: "footer.careers", page: "home" as const },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => navigate({ page: item.page })}
                      className={cn(
                        "text-sm text-muted-foreground transition-colors duration-200",
                        "hover:text-[oklch(0.78_0.14_82)]"
                      )}
                    >
                      {t(item.label)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal column */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {t("footer.legal")}
              </h3>
              <ul className="space-y-2.5">
                {[
                  { label: "footer.privacy", page: "home" as const },
                  { label: "footer.terms", page: "home" as const },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => navigate({ page: item.page })}
                      className={cn(
                        "text-sm text-muted-foreground transition-colors duration-200",
                        "hover:text-[oklch(0.78_0.14_82)]"
                      )}
                    >
                      {t(item.label)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="section-divider-gold mt-12 mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {t("footer.brand")}.{" "}
              {t("footer.copyright")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("footer.built_with")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
