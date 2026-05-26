/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@arcpay/sdk', '@arcpay/ui'],
}

module.exports = nextConfig;
