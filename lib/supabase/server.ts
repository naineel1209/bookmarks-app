import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase server client for use in Server Components, Route Handlers,
 * and Server Actions.
 *
 * Uses the getAll/setAll cookie interface introduced in @supabase/ssr v0.3.0+
 * and required by v0.8.0.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component – cookies cannot be set there.
            // Safe to ignore when middleware is handling session refresh.
          }
        },
      },
    }
  )
}

/**
 * Creates a Supabase admin client using the service-role key.
 *
 * IMPORTANT: This client bypasses Row Level Security entirely.
 * Use it ONLY in server-side code (Route Handlers, Server Actions) and
 * NEVER expose the service-role key to the browser.
 *
 * Prefer this over the SSR client when you need a reliable, privileged
 * write to the database (e.g. upserting a user profile during OAuth
 * callback) where schema-cache or RLS issues could otherwise block the
 * anon/publishable key.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    )
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      // Disable auto-refresh and session persistence; this is a short-lived
      // server-side client that only needs the service-role JWT.
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
