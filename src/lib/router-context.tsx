"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"

export type PageRoute =
  | { page: "home" }
  | { page: "projects" }
  | { page: "project"; slug: string }
  | { page: "platform"; slug: string }
  | { page: "about" }
  | { page: "contact" }
  | { page: "admin-login" }
  | { page: "admin"; tab?: string }

interface RouterContextType {
  route: PageRoute
  navigate: (route: PageRoute) => void
  back: () => void
}

const RouterContext = createContext<RouterContextType>({
  route: { page: "home" },
  navigate: () => {},
  back: () => {},
})

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<PageRoute>({ page: "home" })
  const historyRef = useRef<PageRoute[]>([{ page: "home" }])

  const navigate = useCallback((newRoute: PageRoute) => {
    historyRef.current.push(newRoute)
    setRoute(newRoute)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const back = useCallback(() => {
    if (historyRef.current.length > 1) {
      historyRef.current.pop()
      const prev = historyRef.current[historyRef.current.length - 1]
      setRoute(prev)
    } else {
      setRoute({ page: "home" })
    }
  }, [])

  // Hash-based routing for bookmarkability
  useEffect(() => {
    const parseHash = (): PageRoute => {
      const hash = window.location.hash.slice(1) // remove #
      if (!hash || hash === "/") return { page: "home" }
      if (hash === "/projects") return { page: "projects" }
      if (hash.startsWith("/project/")) return { page: "project", slug: hash.slice(9) }
      if (hash.startsWith("/platform/")) return { page: "platform", slug: hash.slice(10) }
      if (hash === "/about") return { page: "about" }
      if (hash === "/contact") return { page: "contact" }
      if (hash === "/admin-login") return { page: "admin-login" }
      if (hash.startsWith("/admin")) {
        const parts = hash.split("/")
        return { page: "admin", tab: parts[2] || "overview" }
      }
      return { page: "home" }
    }

    const initialRoute = parseHash()
    historyRef.current = [initialRoute]

    const syncRoute = (r: PageRoute) => {
      setRoute(r)
    }

    syncRoute(initialRoute)

    const onHashChange = () => {
      const r = parseHash()
      historyRef.current.push(r)
      syncRoute(r)
    }

    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  // Sync route to hash
  useEffect(() => {
    let hash = "/"
    switch (route.page) {
      case "home": hash = "/"; break
      case "projects": hash = "/projects"; break
      case "project": hash = `/project/${route.slug}`; break
      case "platform": hash = `/platform/${route.slug}`; break
      case "about": hash = "/about"; break
      case "contact": hash = "/contact"; break
      case "admin-login": hash = "/admin-login"; break
      case "admin": hash = `/admin/${route.tab || "overview"}`; break
    }
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", `#${hash}`)
    }
  }, [route])

  return (
    <RouterContext.Provider value={{ route, navigate, back }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  return useContext(RouterContext)
}
