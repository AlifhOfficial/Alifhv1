/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reduce logging verbosity in development
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Disable React Strict Mode to prevent double rendering in development
  reactStrictMode: false,
  
  transpilePackages: ['@alifh/shared', '@alifh/database'],
  serverExternalPackages: ['better-auth', '@node-rs/argon2', '@node-rs/bcrypt'],
  
  // Allow larger request bodies for video uploads (default is 1MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '60mb',
    },
    middlewareClientMaxBodySize: '60mb',
  },
  
  // Content Security Policy
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development'
              ? "script-src 'self' 'unsafe-eval' 'unsafe-inline';" // Development: allow HMR
              : "script-src 'self' 'unsafe-inline';", // Production: no eval
          },
        ],
      },
    ];
  },
  
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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
}

export default nextConfig
