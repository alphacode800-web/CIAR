import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Changa, Aref_Ruqaa_Ink } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { I18nProvider } from "@/lib/i18n-context"
import { RouterProvider } from "@/lib/router-context"
import { AuthProvider } from "@/lib/auth-context"
import { CurrencyProvider } from "@/lib/currency-context"
import { AuthModalProvider } from "@/lib/auth-modal-context"
import { AuthModalWrapper } from "@/components/layout/auth-modal-wrapper"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const changa = Changa({
  variable: "--font-changa",
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
})

const arefRuqaaInk = Aref_Ruqaa_Ink({
  variable: "--font-aref-ruqaa-ink",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/logo.png" }],
  },
  openGraph: {
    title: "CIAR — Building Digital Platforms That Serve Millions",
    description:
      "A leading services company building innovative digital platforms across diverse industries.",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "CIAR Logo" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${changa.variable} ${arefRuqaaInk.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <CurrencyProvider>
              <I18nProvider>
                <RouterProvider>
                  <AuthModalProvider>
                    <AuthModalWrapper />
                    {children}
                    <Toaster position="bottom-right" richColors />
                  </AuthModalProvider>
                </RouterProvider>
              </I18nProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
