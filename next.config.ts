import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL}/:path*`,
      },
    ]
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.sakan.tn' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'http',  hostname: 'localhost', port: '8000' },
      { protocol: 'https', hostname: 'www.sakan.marinekeys.com' },
      { protocol: 'https', hostname: 'sakan.marinekeys.com' },
      { protocol: 'http',  hostname: 'www.tunisie-annonce.com' },
    ],
  },
}

export default nextConfig
