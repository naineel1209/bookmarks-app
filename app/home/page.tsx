'use client'

import { logout } from "@/app/auth/logout/action"
import { Bookmark, BookMarked } from "lucide-react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"

import { AddBookmarkDialog } from "@/components/add-bookmark-dialog"
import { BookmarkCard } from "@/components/bookmark-card"
import { CategoriesSection } from "@/components/categories-section"
import { useBookmarksSubscription } from "@/lib/hooks/useBookmarksSubscription"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@/lib/types"

/**
 * /home – Client-side protected page with realtime bookmarks.
 *
 * - Authenticates on mount using Supabase client
 * - Fetches initial bookmarks for the user
 * - Sets up realtime subscription to bookmark changes
 * - Renders bookmarks in a responsive grid with live updates
 * - Provides an "Add Bookmark" button that opens a shadcn Dialog
 */
export default function HomePage() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)

  // Authenticate and set user
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser()

      if (error || !authUser) {
        redirect("/")
      }

      // Extract relevant user data from auth user
      const userData: User = {
        id: authUser.id,
        email: authUser.email || "",
        full_name: authUser.user_metadata?.full_name || null,
        avatar_url: authUser.user_metadata?.avatar_url || null,
        bio: null,
        theme: null,
        created_at: authUser.created_at || null,
        updated_at: authUser.updated_at || null,
      }

      setUser(userData)
    }

    checkAuth()
  }, [supabase])

  // Use realtime subscription for bookmarks (handles fetch + sync)
  const { bookmarks: bookmarkList, isLoading } =
    useBookmarksSubscription()

  const displayName = user
    ? (user.full_name as string | undefined) ?? user.email
    : "Loading..."

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <BookMarked className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              My Bookmarks
            </span>
          </div>

          {/* User info + logout */}
          <div className="flex items-center gap-3">
            {user && user.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url as string}
                alt="Avatar"
                width={34}
                height={34}
                referrerPolicy="no-referrer"
                className="rounded-full ring-2 ring-border"
              />
            )}
            <span className="hidden sm:block text-sm font-medium text-muted-foreground max-w-[200px] truncate">
              {displayName}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-medium px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Page content ──────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero / action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Your Bookmarks
            </h1>
            <p className="text-muted-foreground mt-1">
              {bookmarkList.length === 0
                ? "No bookmarks saved yet — add your first one!"
                : `${bookmarkList.length} bookmark${bookmarkList.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>

          {/* Add Bookmark widget → opens Dialog */}
          <AddBookmarkDialog />
        </div>

        {/* ── Uncategorized Bookmarks grid / empty state ──────────────────────────── */}
        {isLoading ? (
          <LoadingState />
        ) : bookmarkList.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Section for uncategorized bookmarks */}
            {(() => {
              const uncategorized = bookmarkList.filter((bm) => !bm.category)
              if (uncategorized.length > 0) {
                return (
                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Bookmarks</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uncategorized.map((bookmark) => (
                        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                      ))}
                    </div>
                  </section>
                )
              }
              return null
            })()}

            {/* Categories Section */}
            <CategoriesSection bookmarks={bookmarkList} />
          </>
        )}
      </main>
    </div>
  )
}

/* ── Loading State ──────────────────────────────────────────────────────── */
function LoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-48 rounded-lg border bg-card animate-pulse"
        />
      ))}
    </div>
  )
}

/* ── Empty State ─────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-20 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Bookmark className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No bookmarks yet</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        Click <strong>Add Bookmark</strong> above to save your first link.
        <br />
        Your entire collection will appear here.
      </p>
    </div>
  )
}
