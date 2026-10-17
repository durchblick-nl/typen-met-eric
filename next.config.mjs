/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_LETTORIA_COURSE && process.env.NEXT_PUBLIC_LETTORIA_COURSE !== 'nl' ? '/' + process.env.NEXT_PUBLIC_LETTORIA_COURSE : '',
  // Bound export workers on shared build hosts.
  experimental: { cpus: 2 },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@react-pdf/renderer'],
};

export default nextConfig;
