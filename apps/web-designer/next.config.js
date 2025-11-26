/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@quickquote/core'],
  
  // Disable caching in development for better hot reload
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Generate unique build IDs to prevent caching issues
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

module.exports = nextConfig;
