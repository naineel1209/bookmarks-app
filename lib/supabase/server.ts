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
