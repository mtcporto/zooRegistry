
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      { 
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgs.search.brave.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    allowedDevOrigins: [
      // Add known development origins to allow cross-origin requests
      // This is often needed for environments like Gitpod, Codespaces, or other proxied dev setups
      'https://*.cloudworkstations.dev', // General for cloud workstations
      'http://localhost:3000', // Common local dev port
      'http://localhost:9002', // Current dev server port
      'http://0.0.0.0:9002',    // Allow any IPv4 address on port 9002
      // Specific origins from logs
      'https://6000-firebase-studio-1748578760704.cluster-m7tpz3bmgjgoqrktlvd4ykrc2m.cloudworkstations.dev',
      'https://9000-firebase-studio-1748578760704.cluster-m7tpz3bmgjgoqrktlvd4ykrc2m.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
