"use client"

import { useState, useEffect, useCallback, lazy, Suspense } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Skeleton } from "@/components/ui/skeleton"
import { SuperPlatformHome } from "@/components/super-platform/super-platform-home"
import { PlatformDetailsPage } from "@/components/super-platform/platform-details-page"
import { AdminLoginPage } from "@/components/pages/admin-login-page"
import { UserAuthPage } from "@/components/pages/user-auth-page"

const HomePage = lazy(() => import("@/components/pages/home-page").then(m => ({ default: m.HomePage })))
const ProjectsPage = lazy(() => import("@/components/pages/projects-page").then(m => ({ default: m.ProjectsPage })))
const ProjectDetailsPage = lazy(() => import("@/components/pages/project-details-page").then(m => ({ default: m.ProjectDetailsPage })))
const AboutPage = lazy(() => import("@/components/pages/about-page").then(m => ({ default: m.AboutPage })))
const ContactPage = lazy(() => import("@/components/pages/contact-page").then(m => ({ default: m.ContactPage })))
const AdminPage = lazy(() => import("@/components/pages/admin-page").then(m => ({ default: m.AdminPage })))

interface Project {
  id: string
  slug: string
  imageUrl: string
  imageUrls?: string[]
  category: string
  featured: boolean
  published: boolean
  externalUrl: string
  tags: string
  views: number
  createdAt: string
  translations: { locale: string; name: string; tagline: string; description: string }[]
}

const PageSkeleton = () => (
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 space-y-6">
    <Skeleton className="h-12 w-64 mx-auto" />
    <Skeleton className="h-6 w-96 mx-auto" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-80 rounded-2xl" />
      ))}
    </div>
  </div>
)

export default function Page() {
  const { locale, dir } = useI18n()
  const { route, navigate } = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState({ totalProjects: 0, totalViews: 0, totalCategories: 0 })
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [newsTickerItems, setNewsTickerItems] = useState<string[]>([])

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects?locale=${locale}`)
      const data = await res.json()
      const projectData = Array.isArray(data) ? data : data.projects || []
      const categoryData = Array.isArray(data)
        ? Array.from(new Set(projectData.map((p: Project) => p.category).filter(Boolean)))
        : data.categories || []
      const totalViews = projectData.reduce(
        (sum: number, project: Project) => sum + (Number(project.views) || 0),
        0
      )
      setProjects(projectData)
      setCategories(categoryData)
      setStats({
        ...(Array.isArray(data)
          ? { totalProjects: projectData.length, totalViews }
          : data.stats || { totalProjects: 0, totalViews: 0 }),
        totalCategories: categoryData.length,
      })

      try {
        const tickerRes = await fetch("/api/admin/news-ticker")
        const tickerData = await tickerRes.json()
        const items = Array.isArray(tickerData.items) ? tickerData.items : []
        setNewsTickerItems(items)
      } catch {
        setNewsTickerItems([])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [locale])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = locale
  }, [dir, locale])

  const isAdmin = route.page === "admin" || route.page === "admin-login" || route.page === "user-auth"
  const isAdminAuthenticated = String(user?.role || "").toUpperCase() === "ADMIN"
  const publishedProjects = projects.filter((p) => p.published !== false)
  const homeProjects = publishedProjects.length > 0 ? publishedProjects : projects

  useEffect(() => {
    if (authLoading) return
    if (route.page === "admin" && !isAdminAuthenticated) {
      navigate({ page: "admin-login" })
    }
  }, [route.page, isAdminAuthenticated, authLoading, navigate])

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      {!isAdmin && <Navbar />}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {route.page === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<PageSkeleton />}>
                <HomePage featuredProjects={homeProjects} newsTickerItems={newsTickerItems} />
              </Suspense>
            </motion.div>
          )}

          {route.page === "projects" && (
            <motion.div
              key="projects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<PageSkeleton />}>
                <SuperPlatformHome />
              </Suspense>
            </motion.div>
          )}

          {route.page === "project" && (
            <motion.div
              key={`project-${route.slug}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<PageSkeleton />}>
                <ProjectDetailsPage slug={route.slug} />
              </Suspense>
            </motion.div>
          )}

          {route.page === "platform" && (
            <motion.div
              key={`platform-${route.slug}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<PageSkeleton />}>
                <PlatformDetailsPage slug={route.slug} />
              </Suspense>
            </motion.div>
          )}

          {route.page === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<PageSkeleton />}>
                <AboutPage />
              </Suspense>
            </motion.div>
          )}

          {route.page === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<PageSkeleton />}>
                <ContactPage />
              </Suspense>
            </motion.div>
          )}

          {route.page === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<PageSkeleton />}>
                {isAdminAuthenticated ? <AdminPage /> : null}
              </Suspense>
            </motion.div>
          )}

          {route.page === "admin-login" && (
            <motion.div
              key="admin-login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<PageSkeleton />}>
                <AdminLoginPage />
              </Suspense>
            </motion.div>
          )}

          {route.page === "user-auth" && (
            <motion.div
              key="user-auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<PageSkeleton />}>
                <UserAuthPage />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!isAdmin && <Footer />}
    </div>
  )
}
