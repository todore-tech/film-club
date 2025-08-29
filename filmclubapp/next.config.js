/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'github.com', pathname: '/**' },
      { protocol: 'https', hostname: 'vercel.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.vercel.app', pathname: '/**' },
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/**' },
    ],
  },
  async headers() {
    // Allow client-side fetch/WebSocket connections to these domains
    const connectSrc = [
      "'self'",
      'https://github.com',
      'https://api.github.com',
      'https://vercel.com',
      'https://api.vercel.com',
      'https://supabase.com',
      'https://*.supabase.co',
      'wss://*.supabase.co',
      'http://localhost:3000',
      'https://film-club-two.vercel.app',
    ].join(' ')

    const imgSrc = [
      "'self'",
      'data:',
      'blob:',
      'https://avatars.githubusercontent.com',
      'https://github.com',
      'https://vercel.com',
      'https://*.vercel.app',
      'https://*.supabase.co',
    ].join(' ')

    const frameSrc = [
      "'self'",
      'https://*.supabase.co',
    ].join(' ')

    const csp = [
      `connect-src ${connectSrc}`,
      `img-src ${imgSrc}`,
      `frame-src ${frameSrc}`,
    ].join('; ')

    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
