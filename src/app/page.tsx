"use client"

import { useState, useEffect, useCallback, lazy, Suspense } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { useAuth } from "@/lib/auth-context"
import { useAuthModal } from "@/lib/auth-modal-context"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Skeleton } from "@/components/ui/skeleton"

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
  category: string
  featured: boolean
  published: boolean
  externalUrl: string
  tags: string
  views: number
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
  const { openLogin } = useAuthModal()
  const [stats, setStats] = useState({ totalProjects: 0, totalViews: 0, totalCategories: 0 })
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects?locale=${locale}`)
      const data = await res.json()
      const projectData = data.projects || []
      const categoryData = data.categories || []
      setProjects(projectData)
      setCategories(categoryData)
      setStats({
        ...(data.stats || { totalProjects: 0, totalViews: 0 }),
        totalCategories: categoryData.length,
      })
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [locale])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = locale
  }, [dir, locale])

  const isAdmin = route.page === "admin"
  const isAdminAuthenticated = user?.role === "admin"

  useEffect(() => {
    if (authLoading) return
    if (route.page === "admin" && !isAdminAuthenticated) {
      navigate({ page: "home" })
      openLogin()
    }
  }, [route.page, isAdminAuthenticated, authLoading, navigate, openLogin])

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
                <HomePage stats={stats} featuredProjects={projects.filter((p) => p.published)} />
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
                <ProjectsPage
                  projects={projects}
                  categories={categories}
                  onRefresh={fetchData}
                />
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
        </AnimatePresence>
      </main>

      {!isAdmin && <Footer />}
    </div>
  )
}
