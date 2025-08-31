import { NextResponse } from 'next/server'

// Allowed frontend origins that can call our API routes
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'https://film-club-two.vercel.app',
])

function hasValidAdminToken(request: Request) {
  const adminToken = process.env.ADMIN_TOKEN || ''
  if (!adminToken) return false
  const x = request.headers.get('x-admin-token') || ''
  if (x && x === adminToken) return true
  const auth = request.headers.get('authorization') || request.headers.get('Authorization') || ''
  if (auth.startsWith('Bearer ') && auth.slice(7) === adminToken) return true
  return false
}

export function middleware(request: Request) {
  const { method } = request
  const origin = request.headers.get('origin') || ''

  // Only apply CORS to API routes
  const url = new URL(request.url)
  if (!url.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Protect sensitive preview endpoint with ADMIN_TOKEN
  if (url.pathname.startsWith('/api/notifications/preview')) {
    if (!hasValidAdminToken(request)) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  // Reflect allowed origin, otherwise no CORS headers
  const isAllowed = ALLOWED_ORIGINS.has(origin)
  const headers = new Headers()
  if (isAllowed) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Vary', 'Origin')
    headers.set('Access-Control-Allow-Credentials', 'true')
  }
  headers.set(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  )
  headers.set(
    'Access-Control-Allow-Headers',
    'Authorization, X-Requested-With, X-CSRF-Token, Content-Type, Accept'
  )

  // Handle preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  const response = NextResponse.next()
  headers.forEach((value, key) => response.headers.set(key, value))
  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
