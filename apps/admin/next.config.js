/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@eventscv/shared-types', '@eventscv/ui-components'],
  images: {
    domains: ['firebasestorage.googleapis.com', 'storage.googleapis.com'],
  },
};

module.exports = nextConfig;
