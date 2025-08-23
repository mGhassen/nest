/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove deprecated serverComponentsExternalPackages
  },
  serverExternalPackages: ['@prisma/client'],
}

module.exports = nextConfig
