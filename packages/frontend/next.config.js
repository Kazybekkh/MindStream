/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['livepeer.studio'],
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    NEXT_PUBLIC_ENVIO_GRAPHQL_URL: process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_URL || '',
  }
}

module.exports = nextConfig
