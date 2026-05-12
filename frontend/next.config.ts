import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
