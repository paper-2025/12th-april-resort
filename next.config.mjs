/** @type {import('next').NextConfig} */
const nextConfig = {
  // 👇 force Webpack instead of Turbopack
  experimental: {
    turbo: false,
  },
};

export default nextConfig;