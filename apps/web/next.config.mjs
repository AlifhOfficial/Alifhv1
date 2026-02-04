/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack is now the default bundler in Next.js 16+
  // No configuration needed - it's automatically used for both dev and builds
  
  // Disable build cache to prevent disk bloat
  cacheMaxMemorySize: 0,
  
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
  
  // Content Security Policy and PWA Service Worker headers
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
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
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
        hostname: 'cdn.alifh.ae',
      },
      {
        protocol: 'https',
        hostname: 'cdn.alifh.com',
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
