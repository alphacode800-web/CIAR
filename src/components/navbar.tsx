"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Menu,
  X,
  Moon,
  Sun,
  ArrowRight,
  Sparkles,
} from "lucide-react"

interface NavbarProps {
  activeSection: string
  onNavigate: (section: string) => void
}

const navItems = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
]

export function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNav = useCallback(
    (id: string) => {
      onNavigate(id)
      setMobileOpen(false)
    },
    [onNavigate]
  )

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNav("home")}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Nexus<span className="gradient-text">Labs</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeSection === item.id && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-lg bg-secondary/80"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="h-9 w-9"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={() => handleNav("projects")}
              className="hidden h-9 gap-1.5 rounded-lg sm:flex"
              size="sm"
            >
              Explore
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass border-b border-border/50 md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? "bg-secondary/80 text-foreground"
                      : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
