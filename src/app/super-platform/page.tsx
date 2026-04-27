import type { Metadata } from "next"
import { SuperPlatformHome } from "@/components/super-platform/super-platform-home"

export const metadata: Metadata = {
  title: "CIAR Super Platform | Multi-Module Ecosystem",
  description:
    "A scalable CIAR super app architecture with fashion, marketplace, tourism, real estate, cars, services, shipping, jobs, marketing, and investment modules.",
  alternates: {
    canonical: "/super-platform",
    languages: {
      en: "/super-platform",
      ar: "/super-platform?lang=ar",
    },
  },
}

export default function SuperPlatformPage() {
  return <SuperPlatformHome />
}
