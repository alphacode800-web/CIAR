"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown, Globe, LogIn, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useI18n, ALL_LOCALES, LOCALE_NAMES } from "@/lib/i18n-context"
import { useRouter, type PageRoute } from "@/lib/router-context"
import { useAuth } from "@/lib/auth-context"
import { useAuthModal } from "@/lib/auth-modal-context"
import { useCurrency, CURRENCIES } from "@/lib/currency-context"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"
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
  const { user, logout } = useAuth()
  const { openLogin } = useAuthModal()
  const { currency, setCurrency } = useCurrency()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentCurrency = CURRENCIES.find((c) => c.code === currency.code) || CURRENCIES[0]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const [prevRouteState, setPrevRouteState] = useState(route.page)
  if (prevRouteState !== route.page) {
    setPrevRouteState(route.page)
    if (mobileOpen) queueMicrotask(() => setMobileOpen(false))
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
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
          <div className="relative h-16 w-16 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="CIAR"
              className="h-16 w-16 object-contain transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                const img = e.currentTarget
                if (!img.src.endsWith("/logo.svg")) img.src = "/logo.svg"
              }}
            />
          </div>
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.route.page
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.route)}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors duration-300",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full"
                    style={{ background: "linear-gradient(90deg, oklch(0.82 0.145 85), oklch(0.78 0.14 82), oklch(0.70 0.13 72))" }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{t(item.key)}</span>
              </button>
            )
          })}
        </div>

        {/* Right side utilities */}
        <div className="flex items-center gap-1.5">
          {/* Currency dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1 text-muted-foreground hover:text-foreground text-xs font-medium h-9 px-2",
                  "hover:ring-2 hover:ring-[oklch(0.78_0.14_82/20%)]"
                )}
              >
                <span className="text-sm">{currentCurrency.flag}</span>
                <span className="hidden sm:inline text-[11px] font-mono">{currency.code}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {CURRENCIES.map((c) => (
                <DropdownMenuItem
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={cn(
                    "cursor-pointer text-sm gap-2.5",
                    currency.code === c.code ? "bg-secondary text-foreground font-medium" : ""
                  )}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1">{c.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5 text-muted-foreground hover:text-foreground text-xs font-medium h-9 px-2",
                  "hover:ring-2 hover:ring-[oklch(0.78_0.14_82/20%)]",
                  "hidden sm:flex"
                )}
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="uppercase text-[11px]">{locale}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {ALL_LOCALES.map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={cn(
                    "cursor-pointer text-sm",
                    locale === loc ? "bg-[oklch(0.78_0.14_82/10%)] text-[oklch(0.78_0.14_82)] font-medium" : ""
                  )}
                >
                  <span className="font-mono text-xs uppercase w-7">{loc}</span>
                  <span className="ms-2">{LOCALE_NAMES[loc]}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme switcher */}
          <ThemeSwitcher />

          {/* Auth button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-foreground/10 text-foreground text-xs font-semibold">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 border-b border-border/50 mb-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 me-2" />
                  {t("auth.logout") || "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={openLogin}
              className={cn(
                "gap-1.5 text-muted-foreground hover:text-foreground text-xs font-medium h-9 px-3",
                "hover:ring-2 hover:ring-[oklch(0.78_0.14_82/20%)]"
              )}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("auth.login") || "Login"}</span>
            </Button>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
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
                      onClick={() => { navigate(item.route); setMobileOpen(false) }}
                      className={cn(
                        "flex w-full items-center rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300",
                        isActive
                          ? "bg-gradient-to-r from-[oklch(0.78_0.14_82/10%)] to-[oklch(0.72_0.13_75/10%)] text-[oklch(0.78_0.14_82)] border border-[oklch(0.78_0.14_82/20%)]"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent"
                      )}
                    >
                      <span className="relative z-10">{t(item.key)}</span>
                    </motion.button>
                  )
                })}

                {/* Mobile utilities */}
                <div className="pt-4 mt-4 border-t border-border/20 flex items-center gap-3">
                  <span className="text-sm">{currentCurrency.flag} {currency.code}</span>
                  <span className="text-muted-foreground/30">|</span>
                  <Globe className="h-4 w-4 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground/50 uppercase">{locale}</span>
                  <div className="flex-1" />
                  {user ? (
                    <Button variant="ghost" size="sm" onClick={() => { logout(); setMobileOpen(false) }} className="text-destructive text-xs h-8 gap-1.5">
                      <LogOut className="h-3.5 w-3.5" />
                      {t("auth.logout") || "Logout"}
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => { openLogin(); setMobileOpen(false) }} className="text-xs h-8 gap-1.5">
                      <LogIn className="h-3.5 w-3.5" />
                      {t("auth.login") || "Login"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
