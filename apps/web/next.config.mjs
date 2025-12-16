/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
}

export default nextConfig
