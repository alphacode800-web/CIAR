"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/sections/hero"
import { FeaturedProjects } from "@/components/sections/featured-projects"
import { ProjectsGrid } from "@/components/sections/projects-grid"
import { ProjectDetail } from "@/components/sections/project-detail"
import { AboutSection } from "@/components/sections/about-section"
import { ContactSection } from "@/components/sections/contact-section"
import { Separator } from "@/components/ui/separator"
import type { Project } from "@/components/sections/featured-projects"

interface Stats {
  totalViews: number
  totalProjects: number
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [stats, setStats] = useState<Stats>({ totalViews: 0, totalProjects: 0 })
  const [activeSection, setActiveSection] = useState("home")
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch all data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/projects")
        const data = await res.json()
        setProjects(data.projects)
        setCategories(data.categories)
        setStats(data.stats)
      } catch (err) {
        console.error("Failed to fetch projects:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Intersection observer for active section
  useEffect(() => {
    const sections = ["home", "projects", "about", "contact"]
    const observers: IntersectionObserver[] = []

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id)
          }
        },
        { rootMargin: "-40% 0px -50% 0px" }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  // Navigation handler
  const handleNavigate = useCallback((section: string) => {
    const el = document.getElementById(section)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  // Project detail handler
  const handleSelectProject = useCallback((slug: string) => {
    setSelectedSlug(slug)
    setDetailOpen(true)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false)
    setTimeout(() => setSelectedSlug(null), 300)
  }, [])

  const selectedProject = projects.find((p) => p.slug === selectedSlug) || null

  return (
    <div className="min-h-screen">
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Main content */}
      <main>
        {/* Hero */}
        <Hero
          onExplore={() => handleNavigate("projects")}
          stats={stats}
        />

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Separator className="opacity-50" />
        </div>

        {/* Projects section */}
        <section id="projects" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
            {/* Featured */}
            <FeaturedProjects
              projects={projects}
              onSelect={handleSelectProject}
            />

            <Separator className="opacity-50" />

            {/* All Projects */}
            <ProjectsGrid
              projects={projects}
              categories={categories}
              onSelect={handleSelectProject}
            />
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Separator className="opacity-50" />
        </div>

        {/* About */}
        <AboutSection />

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Separator className="opacity-50" />
        </div>

        {/* Contact */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Project Detail Sheet */}
      <ProjectDetail
        project={selectedProject}
        open={detailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  )
}
