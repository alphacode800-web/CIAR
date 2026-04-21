"use client"

import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { cn } from "@/lib/utils"

export function Footer() {
  const { t, dir } = useI18n()
  const { navigate } = useRouter()

  return (
    <footer dir={dir} className="relative mt-auto">
      {/* ── Top glow divider ──────────────────────────────────────────────── */}
      <div className="glow-line" />

      {/* ── Subtle gradient background ─────────────────────────────────────── */}
      <div className="relative glass-subtle">
        {/* Subtle mesh gradient overlay */}
        <div className="absolute inset-0 mesh-gradient opacity-50 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8">
            {/* ── Brand column ─────────────────────────────────────────────── */}
            <div className="sm:col-span-2 lg:col-span-1">
              <span className="gradient-text text-xl font-bold">
                {t("footer.brand")}
              </span>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
                {t("hero.subtitle")}
              </p>

              {/* Social icons as glass pill buttons */}
              <div className="flex items-center gap-2.5 mt-5">
                {/* Twitter / X */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className={cn(
                    "w-9 h-9 rounded-full glass-subtle border border-border/50",
                    "flex items-center justify-center",
                    "text-muted-foreground hover:text-foreground",
                    "hover:glass-strong hover:border-border",
                    "transition-all duration-200"
                  )}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* GitHub */}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className={cn(
                    "w-9 h-9 rounded-full glass-subtle border border-border/50",
                    "flex items-center justify-center",
                    "text-muted-foreground hover:text-foreground",
                    "hover:glass-strong hover:border-border",
                    "transition-all duration-200"
                  )}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className={cn(
                    "w-9 h-9 rounded-full glass-subtle border border-border/50",
                    "flex items-center justify-center",
                    "text-muted-foreground hover:text-foreground",
                    "hover:glass-strong hover:border-border",
                    "transition-all duration-200"
                  )}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* ── Products column ───────────────────────────────────────────── */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {t("footer.products")}
              </h3>
              <ul className="space-y-2.5">
                {[
                  { key: "footer.product_1", slug: "cloudsync" },
                  { key: "footer.product_2", slug: "datapulse" },
                  { key: "footer.product_3", slug: "codeforge" },
                  { key: "footer.product_4", slug: "pixelcraft" },
                  { key: "footer.product_5", slug: "novamind" },
                ].map((item) => (
                  <li key={item.key}>
                    <button
                      onClick={() =>
                        navigate({ page: "project", slug: item.slug })
                      }
                      className={cn(
                        "text-sm text-muted-foreground transition-colors duration-200",
                        "hover:text-emerald-400"
                      )}
                    >
                      {t(item.key)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Company column ────────────────────────────────────────────── */}
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
                        "hover:text-emerald-400"
                      )}
                    >
                      {t(item.label)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Legal column ──────────────────────────────────────────────── */}
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
                        "hover:text-emerald-400"
                      )}
                    >
                      {t(item.label)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Bottom bar ─────────────────────────────────────────────────── */}
          <div className="section-divider mt-12 mb-6" />
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
