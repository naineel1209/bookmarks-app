import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * GET /auth/login
 *
 * Initiates the Google OAuth PKCE flow via Supabase.
 *
 * Why not use the shared createClient() helper?
 * ──────────────────────────────────────────────
 * The shared helper writes cookies through Next.js's internal cookie store.
 * When we return our own `NextResponse.redirect(data.url)`, that is a
 * *different* response object, so any cookies written to the internal store
 * are discarded and never reach the browser.
 *
 * By building the client inline we intercept every cookie Supabase wants to
 * write (including the PKCE code_verifier) into a local array via setAll,
 * then manually attach them to our redirect response before returning it.
 * This guarantees the browser stores the code_verifier cookie so it is
 * available at /auth/callback when exchangeCodeForSession reads it.
 */
export async function GET() {
  const cookieStore = await cookies()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  // Accumulate every cookie Supabase wants to write during signInWithOAuth
  const pendingCookies: { name: string; value: string; options: CookieOptions }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Capture instead of writing to the implicit route-handler response
          cookiesToSet.forEach((c) => pendingCookies.push(c))
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('[auth/login] signInWithOAuth error:', error.message)
    return NextResponse.json(
      { error: 'Failed to initiate Google sign-in.' },
      { status: 500 }
    )
  }

  if (!data.url) {
    console.error('[auth/login] signInWithOAuth returned no URL')
    return NextResponse.json(
      { error: 'No authorization URL returned by Supabase.' },
      { status: 500 }
    )
  }

  // Build the redirect response and attach the PKCE code_verifier (and any
  // other cookies Supabase set) so the browser carries them to /auth/callback.
  const response = NextResponse.redirect(data.url)
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  })

  return response
}
