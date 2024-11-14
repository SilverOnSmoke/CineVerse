/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['image.tmdb.org'],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_TMDB_API_URL: process.env.NEXT_PUBLIC_TMDB_API_URL,
    NEXT_PUBLIC_TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
    NEXT_PUBLIC_TMDB_IMAGE_URL: process.env.NEXT_PUBLIC_TMDB_IMAGE_URL,
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  }
};

module.exports = nextConfig;