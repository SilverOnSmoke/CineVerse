/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['image.tmdb.org'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 640, 750, 828, 1080],
  },
  env: {
    NEXT_PUBLIC_TMDB_API_URL: process.env.NEXT_PUBLIC_TMDB_API_URL,
    NEXT_PUBLIC_TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
    NEXT_PUBLIC_TMDB_IMAGE_URL: process.env.NEXT_PUBLIC_TMDB_IMAGE_URL,
    NEXT_PUBLIC_NATIVE_PROVIDER_URL: process.env.NEXT_PUBLIC_NATIVE_PROVIDER_URL,
    NEXT_PUBLIC_NATIVE_PROVIDER_TOKEN: process.env.NEXT_PUBLIC_NATIVE_PROVIDER_TOKEN,
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { message: /the request of a dependency is an expression/ },
      { message: /Module not found: Can't resolve 'punycode'/ }
    ];
    return config;
  }
};

module.exports = nextConfig;