"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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

  // Close mobile menu on route change
  useEffect(() => {
    const observer = () => {
      if (prevRouteRef.current !== route.page) {
        prevRouteRef.current = route.page
        setMobileOpen(false)
      }
    }
    observer()
  }, [route.page])

  // Prevent body scroll when mobile menu is open
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
          ? "glass-strong border-b border-border/50 shadow-lg shadow-black/[0.03]"
          : "bg-transparent"
      )}
    >
      {/* Subtle bottom border gradient when not scrolled */}
      {!scrolled && (
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      )}

      <nav
        dir={dir}
        className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-18"
      >
        {/* Logo with geometric hexagon icon */}
        <button
          onClick={() => navigate({ page: "home" })}
          className="flex items-center gap-2.5 group"
        >
          {/* Hexagon logo mark */}
          <svg
            viewBox="0 0 32 36"
            className="h-7 w-7 transition-transform duration-500 group-hover:scale-110"
            fill="none"
          >
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="oklch(0.75 0.15 160)" />
                <stop offset="50%" stopColor="oklch(0.7 0.18 200)" />
                <stop offset="100%" stopColor="oklch(0.7 0.18 280)" />
              </linearGradient>
            </defs>
            <path
              d="M16 0L30 9V27L16 36L2 27V9L16 0Z"
              fill="url(#logo-grad)"
              opacity="0.9"
            />
            <path
              d="M16 6L24 11V21L16 26L8 21V11L16 6Z"
              fill="currentColor"
              className="text-background"
              opacity="0.9"
            />
          </svg>
          <span className="font-bold text-xl gradient-text tracking-tight">NexusLabs</span>
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
                    className="absolute bottom-0 left-1 right-1 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-full"
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
          {/* Language switcher with ring glow */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5 text-muted-foreground hover:text-foreground",
                  "transition-all duration-300",
                  "hover:ring-2 hover:ring-emerald-500/20 hover:bg-emerald-500/5",
                  "focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                )}
              >
                <Globe className="h-4 w-4" />
                <span className="uppercase text-xs font-semibold">{locale}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 glass-strong border-border/30">
              {ALL_LOCALES.map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={cn(
                    "cursor-pointer transition-colors duration-200",
                    locale === loc
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
                      : ""
                  )}
                >
                  <span className="font-mono text-xs uppercase w-8">{loc}</span>
                  <span className="ms-2">{LOCALE_NAMES[loc]}</span>
                  {locale === loc && (
                    <span className="ms-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
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

      {/* Mobile menu with glass-strong backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 top-18 bg-background/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Menu panel */}
            <motion.div
              dir={dir}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden glass-strong border-b border-border/30 overflow-hidden"
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
                          ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent"
                      )}
                    >
                      {isActive && (
                        <span className="absolute start-2 h-6 w-0.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                      )}
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
