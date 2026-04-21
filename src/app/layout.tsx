import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "NexusLabs — Building the Future of Digital Products",
  description:
    "NexusLabs is a technology company building world-class digital products across infrastructure, analytics, AI, design tools, and developer platforms.",
  keywords: [
    "NexusLabs",
    "tech company",
    "digital products",
    "SaaS",
    "cloud",
    "AI",
    "developer tools",
  ],
  authors: [{ name: "NexusLabs" }],
  openGraph: {
    title: "NexusLabs — Building the Future of Digital Products",
    description:
      "A technology company building world-class digital products.",
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
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
