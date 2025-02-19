import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Add headers for all responses
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, apikey, X-Client-Info')

  // Set referrer policy based on the request path
  if (req.nextUrl.pathname.startsWith('/_next/image')) {
    res.headers.set('Referrer-Policy', 'strict-origin')
  } else {
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, apikey, X-Client-Info',
        'Access-Control-Max-Age': '86400',
        'Referrer-Policy': req.nextUrl.pathname.startsWith('/_next/image') ? 
          'strict-origin' : 'strict-origin-when-cross-origin'
      },
    })
  }

  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|favicon.ico).*)',
  ],
}
