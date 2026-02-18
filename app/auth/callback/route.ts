import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /auth/callback
 *
 * OAuth callback handler that completes the PKCE flow.
 *
 * Flow:
 *  1. Google (via Supabase) redirects here with a one-time `code`.
 *  2. We call supabase.auth.exchangeCodeForSession(code) which:
 *     a. Reads the PKCE code_verifier stored in the cookie set during /api/login.
 *     b. Sends code + verifier to Supabase, which validates them with Google.
 *     c. Returns the authenticated user's session (access_token, refresh_token).
 *     d. Persists the session tokens into cookies so subsequent server calls
 *        are automatically authenticated.
 *  3. We upsert the user's profile into our public `users` table so we have
 *     app-level data (email, full_name, avatar_url) alongside the auth record.
 *  4. Finally we redirect the browser to /home (or any `next` query param).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  // Allow an optional redirect target passed through the state
  const next = searchParams.get('next') ?? '/home'

  // If no code was provided the OAuth round-trip failed
  if (!code) {
    console.error('[auth/callback] Missing code in callback URL')
    return NextResponse.redirect(`${origin}/?error=missing_oauth_code`)
  }

  const supabase = await createClient()

  // --- PKCE: exchange authorization code for a session ---
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[auth/callback] exchangeCodeForSession error:', exchangeError.message)
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(exchangeError.message)}`
    )
  }

  const { user } = data

  if (!user) {
    console.error('[auth/callback] No user returned after exchange')
    return NextResponse.redirect(`${origin}/?error=no_user_after_exchange`)
  }

  // --- Upsert the user profile into the public users table ---
  // user_metadata from Google OAuth contains: full_name, avatar_url, email
  const adminClient = createAdminClient()
  const { error: upsertError } = await adminClient
    .from('users')
    .upsert(
      {
        id: user.id,
        email: user.email!,
        full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
        avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      },
      {
        // `id` is the primary key – update the row if it already exists
        onConflict: 'id',
        ignoreDuplicates: false,
      }
    )

  if (upsertError) {
    // Non-fatal: the user is authenticated but we couldn't persist their profile.
    // Log the error and continue; the app can retry or create the profile lazily.
    console.error('[auth/callback] Failed to upsert user profile:', upsertError.message)
  }

  // Redirect to the app now that the session is established
  return NextResponse.redirect(`${origin}${next}`)
}
