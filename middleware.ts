import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './lib/supabase/server'

/**
 * Supabase-aware middleware.
 * The shared helper reads/writes cookies via Next.js's `cookies()` API, which works in Server Components and Route Handlers.
 * In middleware, read from `request.cookies` and write to both the mutated request and `supabaseResponse.cookies`.
 */
export async function middleware(request: NextRequest) {
  // Start with a pass-through response; we may replace it in setAll
  // if Supabase needs to refresh tokens.
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to landing page if not authenticated and trying to access protected routes
  if (!user && request.nextUrl.pathname.startsWith('/home')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Redirect to home if authenticated and trying to access the landing page
  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
