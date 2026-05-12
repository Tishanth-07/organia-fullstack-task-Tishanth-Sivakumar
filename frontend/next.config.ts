import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Use standalone output for Docker (Render), but let Vercel use its native serverless output to prevent 404s
  output: process.env.VERCEL ? undefined : "standalone",
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },

  // Allows the backend API to be called from server components if needed
  async rewrites() {
    return []
  },

  // Allow your backend domain for Next.js Image Optimization (if you serve images from the API)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.onrender.com",   // adjust if your backend is elsewhere
      },
    ],
  },
}

export default nextConfig
