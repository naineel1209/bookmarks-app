import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/logout/action'

/**
 * /home – protected page.
 *
 * Fetches the currently authenticated user server-side and logs all
 * available details to the server console.  The full user object is
 * also rendered on the page so it is easy to inspect during development.
 */
export default async function HomePage() {
  const supabase = await createClient()

  // getUser() re-validates the session against Supabase on every request.
  // Never use getSession() for trusted server-side auth checks.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    // Middleware should have already redirected, but guard here as well.
    redirect('/')
  }

  // ── Server-side logging ──────────────────────────────────────────────────
  console.log('[home] Authenticated user details:')
  console.log(JSON.stringify(user, null, 2))
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Bookmarks
            </h1>
            {/* Avatar + display name + logout */}
            <div className="flex items-center gap-3">
              {user.user_metadata?.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.user_metadata.avatar_url as string}
                  alt="Avatar"
                  width={36}
                  height={36}
                  referrerPolicy="no-referrer"
                  className="rounded-full ring-2 ring-gray-200 dark:ring-gray-600"
                />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {(user.user_metadata?.full_name as string | undefined) ?? user.email}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── User Debug Panel ─────────────────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Authenticated User Details
          </h2>

          {/* Quick-glance fields */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-6">
            {[
              { label: 'User ID', value: user.id },
              { label: 'Email', value: user.email ?? '—' },
              { label: 'Full Name', value: (user.user_metadata?.full_name as string | undefined) ?? '—' },
              { label: 'Provider', value: user.app_metadata?.provider ?? '—' },
              { label: 'Email confirmed', value: user.email_confirmed_at ? new Date(user.email_confirmed_at).toLocaleString() : 'No' },
              { label: 'Last sign-in', value: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '—' },
              { label: 'Created at', value: new Date(user.created_at).toLocaleString() },
              { label: 'Role', value: user.role ?? '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {label}
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900 dark:text-white break-all">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Raw JSON dump */}
          <details>
            <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:underline select-none">
              Show full user object (JSON)
            </summary>
            <pre className="mt-3 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg text-xs overflow-auto max-h-96 text-gray-800 dark:text-gray-200">
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </section>

        {/* ── Add Bookmark Form ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add New Bookmark
          </h2>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                URL
              </label>
              <input
                type="url"
                id="url"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="My Favourite Website"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Bookmark
            </button>
          </form>
        </div>

        {/* ── Bookmarks List ────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Bookmarks
          </h2>

          {/* Empty State */}
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No bookmarks yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding your first bookmark above.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
