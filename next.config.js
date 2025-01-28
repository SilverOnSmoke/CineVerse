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