import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allows the backend API to be called from server components if needed
  async rewrites() {
    return []
  },
}

export default nextConfig
