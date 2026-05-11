import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nintro — Where tasks get done.',
  description: 'Nintro is the modern task management system for high-performing teams. Plan, track, and ship work — beautifully.',
  openGraph: {
    title: 'Nintro — Task Management for Modern Teams',
    description: 'Plan, track, and ship work together — beautifully.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#020509" />
      </head>
      <body>
        {/* Ambient blobs — position:fixed, never affect layout height */}
        <div className="ambient ambient-1" aria-hidden="true" />
        <div className="ambient ambient-2" aria-hidden="true" />
        <div className="dot-grid"          aria-hidden="true" />

        {/*
          CRITICAL FIX:
          This wrapper guarantees every page occupies at least full viewport height.
          Pages use flex-col + flex-1 on <main> so footer always stays at bottom.
          Without this, content collapses and only footer renders at top.
        */}
        <div className="min-h-screen flex flex-col">
          {children}
        </div>

        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  )
}