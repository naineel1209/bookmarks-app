import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Supabase-aware middleware.
 *
 * Why build the client inline here instead of using the shared createClient()?
 * ────────────────────────────────────────────────────────────────────────────
 * The shared helper reads/writes cookies via Next.js's `cookies()` API, which
 * is designed for Server Components and Route Handlers.  In middleware the
 * canonical pattern is to read directly from `request.cookies` and write to
 * both the mutated request (so the downstream route handler sees fresh tokens)
 * and `supabaseResponse.cookies` (so the browser receives the Set-Cookie
 * headers).
 *
 * Failing to do this means session refresh cookies are silently dropped and
 * the browser never receives updated tokens.
 */
export async function middleware(request: NextRequest) {
  // Start with a pass-through response; we may replace it in setAll
  // if Supabase needs to refresh tokens.
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write to the request so the downstream route handler sees the
          // refreshed session immediately.
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options })
          )
          // Recreate the response so it picks up the mutated request.
          supabaseResponse = NextResponse.next({
            request,
          })
          // Write to the response so the browser stores the refreshed tokens.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session if it has expired.
  // IMPORTANT: Do not add any logic between createServerClient and getUser()
  // that could interfere with the cookie synchronisation above.
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
