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

  // Close mobile menu on route change (using event subscription pattern)
  useEffect(() => {
    const observer = () => {
      if (prevRouteRef.current !== route.page) {
        prevRouteRef.current = route.page
        setMobileOpen(false)
      }
    }
    observer()
  }, [route.page])

  const currentPage = route.page === "project" ? "projects" : route.page

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav
        dir={dir}
        className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16"
      >
        {/* Logo */}
        <button
          onClick={() => navigate({ page: "home" })}
          className="flex items-center gap-2 font-bold text-xl"
        >
          <span className="gradient-text">NexusLabs</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.route.page
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.route)}
                className="relative px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-secondary/80"
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
          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                <Globe className="h-4 w-4" />
                <span className="uppercase text-xs font-semibold">{locale}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {ALL_LOCALES.map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={locale === loc ? "bg-secondary font-medium" : ""}
                >
                  <span className="font-mono text-xs uppercase w-8">{loc}</span>
                  <span className="ms-2">{LOCALE_NAMES[loc]}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            dir={dir}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden glass border-b border-border/50"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = currentPage === item.route.page
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      navigate(item.route)
                      setMobileOpen(false)
                    }}
                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    {t(item.key)}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
