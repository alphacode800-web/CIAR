"use client"

import { lazy, Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const OverviewTab = lazy(() => import("@/components/admin/overview-tab").then((m) => ({ default: m.OverviewTab })))
const AnalyticsTab = lazy(() => import("@/components/admin/analytics-tab").then((m) => ({ default: m.AnalyticsTab })))
const ActivityTab = lazy(() => import("@/components/admin/activity-tab").then((m) => ({ default: m.ActivityTab })))
const ProjectsTab = lazy(() => import("@/components/admin/projects-tab").then((m) => ({ default: m.ProjectsTab })))
const TranslationsTab = lazy(() => import("@/components/admin/translations-tab").then((m) => ({ default: m.TranslationsTab })))
const MediaTab = lazy(() => import("@/components/admin/media-tab").then((m) => ({ default: m.MediaTab })))
const BackgroundsTab = lazy(() => import("@/components/admin/backgrounds-tab").then((m) => ({ default: m.BackgroundsTab })))
const HomeBannersTab = lazy(() => import("@/components/admin/home-banners-tab").then((m) => ({ default: m.HomeBannersTab })))
const ContactsTab = lazy(() => import("@/components/admin/contacts-tab").then((m) => ({ default: m.ContactsTab })))
const UsersTab = lazy(() => import("@/components/admin/users-tab").then((m) => ({ default: m.UsersTab })))
const HomeSectionsTab = lazy(() => import("@/components/admin/home-sections-tab").then((m) => ({ default: m.HomeSectionsTab })))
const NewsTickerTab = lazy(() => import("@/components/admin/news-ticker-tab").then((m) => ({ default: m.NewsTickerTab })))
const SeoTab = lazy(() => import("@/components/admin/seo-tab").then((m) => ({ default: m.SeoTab })))
const AppearanceTab = lazy(() => import("@/components/admin/appearance-tab").then((m) => ({ default: m.AppearanceTab })))
const SiteSettingsTab = lazy(() => import("@/components/admin/site-settings-tab").then((m) => ({ default: m.SiteSettingsTab })))
const DataExportTab = lazy(() => import("@/components/admin/data-export-tab").then((m) => ({ default: m.DataExportTab })))

export function AdminTabSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

export function AdminTabContent({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "overview":
      return <OverviewTab />
    case "analytics":
      return <AnalyticsTab />
    case "activity":
      return <ActivityTab />
    case "projects":
      return <ProjectsTab />
    case "translations":
      return <TranslationsTab />
    case "media":
      return <MediaTab />
    case "backgrounds":
      return <BackgroundsTab />
    case "home-banners":
      return <HomeBannersTab />
    case "contacts":
      return <ContactsTab />
    case "users":
      return <UsersTab />
    case "home-sections":
      return <HomeSectionsTab />
    case "news-ticker":
      return <NewsTickerTab />
    case "seo":
      return <SeoTab />
    case "appearance":
      return <AppearanceTab />
    case "settings":
      return <SiteSettingsTab />
    case "data-export":
      return <DataExportTab />
    default:
      return <OverviewTab />
  }
}

export function AdminTabContentSuspended({ activeTab }: { activeTab: string }) {
  return (
    <Suspense fallback={<AdminTabSkeleton />}>
      <AdminTabContent activeTab={activeTab} />
    </Suspense>
  )
}
