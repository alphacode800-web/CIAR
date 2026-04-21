import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { I18nProvider } from "@/lib/i18n-context"
import { RouterProvider } from "@/lib/router-context"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "CIAR — Building Digital Platforms That Serve Millions",
  description:
    "CIAR is a leading services company that builds and manages a diverse portfolio of digital platforms — from real estate and car rental to e-commerce, tourism, and beyond.",
  keywords: [
    "CIAR",
    "services company",
    "digital platforms",
    "real estate",
    "car rental",
    "e-commerce",
    "tourism",
    "food delivery",
  ],
  authors: [{ name: "CIAR" }],
  openGraph: {
    title: "CIAR — Building Digital Platforms That Serve Millions",
    description:
      "A leading services company building innovative digital platforms across diverse industries.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <RouterProvider>
              {children}
              <Toaster position="bottom-right" richColors />
            </RouterProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
