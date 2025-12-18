/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reduce logging verbosity in development
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Optimize Turbopack dev server
  experimental: {
    // Enable Turbopack optimizations
    turbo: {
      resolveAlias: {
        // Prevent duplicate package resolution
        '@alifh/database': './packages/database/src',
        '@alifh/shared': './packages/shared/src',
      },
    },
    // Use SWC minifier for faster builds
    swcMinify: true,
  },
  
  transpilePackages: ['@alifh/shared', '@alifh/database'],
  serverExternalPackages: ['better-auth', '@node-rs/argon2', '@node-rs/bcrypt'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh7.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'alifh-uploads.7117386bede3499b286ceb28090ed343.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-98e5497543c348a49ca803322a46382e.r2.dev',
      },
    ],
  },
}

export default nextConfig
