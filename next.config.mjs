const course = process.env.NEXT_PUBLIC_LETTORIA_COURSE || 'nl';
if (!['nl','be','de','ch'].includes(course)) throw new Error('Unsupported Lettoria course: ' + course);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: course === 'nl' ? '' : '/' + course,
  // Bound export workers on shared build hosts.
  experimental: { cpus: 2 },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@react-pdf/renderer'],
};

export default nextConfig;
