'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Server Action – POST /auth/logout (invoked via <form action={logout}>).
 *
 * Signs the current user out of Supabase (clears the session cookies) then
 * redirects the browser to the landing page.
 */
export async function logout() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('[auth/logout] signOut error:', error.message)
  }

  redirect('/')
}
