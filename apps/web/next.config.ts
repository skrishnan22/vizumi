import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';

const monorepoRoot = path.resolve(__dirname, '../..');
const useMonorepoTracingRoot = fs.existsSync(path.join(monorepoRoot, 'apps', 'web'));

const nextConfig: NextConfig = {
  ...(useMonorepoTracingRoot ? { outputFileTracingRoot: monorepoRoot } : {}),
  serverExternalPackages: ['pino', '@terrastruct/d2', '@terrastruct/wasm'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
