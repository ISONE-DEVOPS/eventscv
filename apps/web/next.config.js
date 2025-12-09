/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  transpilePackages: ['@eventscv/shared-types', '@eventscv/ui-components'],
  images: {
    domains: ['firebasestorage.googleapis.com', 'storage.googleapis.com', 'lh3.googleusercontent.com', 'images.unsplash.com'],
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
