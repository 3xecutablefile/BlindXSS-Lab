/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // This helps with XSS testing
  swcMinify: true,
  experimental: {
    // Enable server components if needed in the future
  }
}

module.exports = nextConfig