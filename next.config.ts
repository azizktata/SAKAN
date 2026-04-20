import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.sakan.tn' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'http',  hostname: 'localhost', port: '8000' },
      { protocol: 'https', hostname: 'www.sakan.marinekeys.com' },
    ],
  },
}

export default nextConfig
