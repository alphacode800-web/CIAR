"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n, ALL_LOCALES, LOCALE_NAMES } from "@/lib/i18n-context"
import { useRouter, type PageRoute } from "@/lib/router-context"
import { cn } from "@/lib/utils"

const NAV_ITEMS: { key: string; route: PageRoute }[] = [
  { key: "nav.home", route: { page: "home" } },
  { key: "nav.projects", route: { page: "projects" } },
  { key: "nav.about", route: { page: "about" } },
  { key: "nav.contact", route: { page: "contact" } },
  { key: "nav.admin", route: { page: "admin" } },
]

export function Navbar() {
  const { t, locale, setLocale, dir } = useI18n()
  const { route, navigate } = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const prevRouteRef = useRef(route.page)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close mobile menu when route changes
  const [prevRouteState, setPrevRouteState] = useState(route.page)
  if (prevRouteState !== route.page) {
    setPrevRouteState(route.page)
    if (mobileOpen) {
      // Use a micro-task to avoid synchronous setState during render
      queueMicrotask(() => setMobileOpen(false))
    }
  }

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  const currentPage = route.page === "project" ? "projects" : route.page

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-out",
        scrolled
          ? "glass-strong border-b border-[oklch(0.78_0.14_82/15%)] shadow-lg shadow-black/10"
          : "bg-transparent"
      )}
    >
      {!scrolled && (
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.78_0.14_82/30%)] to-transparent" />
      )}

      <nav
        dir={dir}
        className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-18"
      >
        {/* Logo */}
        <button
          onClick={() => navigate({ page: "home" })}
          className="flex items-center gap-3 group"
        >
          {/* CIAR logo mark — geometric diamond */}
          <div className="relative h-9 w-9 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="h-8 w-8 transition-transform duration-500 group-hover:scale-110" fill="none">
              <defs>
                <linearGradient id="ciar-logo" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="oklch(0.82 0.145 85)" />
                  <stop offset="50%" stopColor="oklch(0.78 0.14 82)" />
                  <stop offset="100%" stopColor="oklch(0.70 0.13 72)" />
                </linearGradient>
              </defs>
              <path d="M18 2L33 10V26L18 34L3 26V10L18 2Z" fill="url(#ciar-logo)" opacity="0.15" />
              <path d="M18 6L29 12V24L18 30L7 24V12L18 6Z" fill="url(#ciar-logo)" opacity="0.9" />
              <text x="18" y="20.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="oklch(0.12 0.03 265)" fontFamily="var(--font-geist-sans)">C</text>
            </svg>
          </div>
          <span className="font-bold text-xl tracking-wider gradient-text">CIAR</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.route.page
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.route)}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors duration-300",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, oklch(0.82 0.145 85), oklch(0.78 0.14 82), oklch(0.70 0.13 72))",
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{t(item.key)}</span>
              </button>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5 text-muted-foreground hover:text-foreground",
                  "transition-all duration-300",
                  "hover:ring-2 hover:ring-[oklch(0.78_0.14_82/20%)] hover:bg-[oklch(0.78_0.14_82/5%)]",
                  "focus-visible:ring-2 focus-visible:ring-[oklch(0.78_0.14_82/30%)]"
                )}
              >
                <Globe className="h-4 w-4" />
                <span className="uppercase text-xs font-semibold">{locale}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 glass-strong border-[oklch(0.78_0.14_82/20%)]">
              {ALL_LOCALES.map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={cn(
                    "cursor-pointer transition-colors duration-200",
                    locale === loc
                      ? "bg-[oklch(0.78_0.14_82/10%)] text-[oklch(0.78_0.14_82)] font-medium"
                      : ""
                  )}
                >
                  <span className="font-mono text-xs uppercase w-8">{loc}</span>
                  <span className="ms-2">{LOCALE_NAMES[loc]}</span>
                  {locale === loc && (
                    <span className="ms-auto h-1.5 w-1.5 rounded-full bg-[oklch(0.78_0.14_82)]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden transition-colors duration-300"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 top-18 bg-background/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              dir={dir}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden glass-strong border-b border-[oklch(0.78_0.14_82/20%)] overflow-hidden"
            >
              <div className="px-6 py-5 space-y-1">
                {NAV_ITEMS.map((item, index) => {
                  const isActive = currentPage === item.route.page
                  return (
                    <motion.button
                      key={item.key}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      onClick={() => {
                        navigate(item.route)
                        setMobileOpen(false)
                      }}
                      className={cn(
                        "flex w-full items-center rounded-xl px-4 py-3.5 text-sm font-medium",
                        "transition-all duration-300",
                        isActive
                          ? "bg-gradient-to-r from-[oklch(0.78_0.14_82/10%)] to-[oklch(0.72_0.13_75/10%)] text-[oklch(0.78_0.14_82)] border border-[oklch(0.78_0.14_82/20%)]"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent"
                      )}
                    >
                      <span className="relative z-10">{t(item.key)}</span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
