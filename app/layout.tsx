import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MatchMySkills - Find Your Perfect Internship Match",
  description:
    "Connect with top companies through our intelligent matching system. Get personalized internship recommendations based on your skills, interests, and career goals.",
  keywords: "internships, jobs, career, students, matching, AI, recommendations",
  authors: [{ name: "MatchMySkills Team" }],
  openGraph: {
    title: "MatchMySkills - Find Your Perfect Internship Match",
    description:
      "Connect with top companies through our intelligent matching system.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MatchMySkills - Find Your Perfect Internship Match",
    description:
      "Connect with top companies through our intelligent matching system.",
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
