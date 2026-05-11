import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

/**
 * Viewport Configuration
 * Optimization for device responsiveness and browser UI theme.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#020509',
}

/**
 * Global Metadata Configuration
 * SEO optimization for the Nintro platform.
 */
export const metadata: Metadata = {
  title: 'Nintro — Where tasks get done.',
  description: 'Nintro is the modern task management system for high-performing teams. Plan, track, and ship work — beautifully.',
  openGraph: {
    title: 'Nintro — Task Management for Modern Teams',
    description: 'Plan, track, and ship work together — beautifully.',
    type: 'website',
  },
}

/**
 * RootLayout Component
 * The foundational structure for the entire application.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        
        {/* ── Section: Global Background Aesthetics ─────────────── */}
        <div className="ambient ambient-1" aria-hidden="true" />
        <div className="ambient ambient-2" aria-hidden="true" />
        <div className="dot-grid"          aria-hidden="true" />

        {/* ── Section: Main Viewport Wrapper ─────────────────────── */}
        <div className="min-h-screen flex flex-col relative z-10">
          {children}
        </div>

        {/* ── Section: Notification System ───────────────────────── */}
        <Toaster 
          richColors 
          position="top-right" 
          theme="dark" 
          expand={false} 
          closeButton 
        />
        
      </body>
    </html>
  )
}