/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove deprecated serverComponentsExternalPackages
  },
  serverExternalPackages: ['@prisma/client'],
  eslint: {
    // Disable ESLint during build for now
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
