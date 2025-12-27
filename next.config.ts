import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['pino', 'jsdom'],
  // Prevent trailing slash redirects that convert POST to GET (causing 405)
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
