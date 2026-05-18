/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000', 'olfativa.ai'] }
  }
};

module.exports = nextConfig;
