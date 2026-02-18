'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/types'

type BookmarkRow = Tables<'bookmarks'>

/**
 * Hook that manages bookmarks fetching and realtime synchronization.
 * Single source of truth for bookmark state.
 * Handles initial fetch and realtime subscriptions automatically.
 */
export function useBookmarksSubscription() {
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let subscription: any

    async function initializeBookmarks() {
      try {
        // Fetch initial bookmarks (single source of truth)
        const { data, error } = await supabase
          .from('bookmarks')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data) {
          setBookmarks(data)
        }
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to fetch bookmarks:', err)
        setIsLoading(false)
      }

      // Subscribe to realtime changes
      subscription = supabase
        .channel('bookmarks_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks',
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              console.log("Received INSERT eventType")

              // Add new bookmark to the beginning
              setBookmarks((prev) => [payload.new as BookmarkRow, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              console.log("Received UPDATE eventType")

              // Update existing bookmark
              setBookmarks((prev) =>
                prev.map((bm) =>
                  bm.id === payload.new.id
                    ? (payload.new as BookmarkRow)
                    : bm
                )
              )
            } else if (payload.eventType === 'DELETE') {
              console.log("Received DELETE eventType")

              // Remove deleted bookmark
              setBookmarks((prev) =>
                prev.filter((bm) => bm.id !== payload.old.id)
              )
            }
          }
        )
        .subscribe((status) => {
          setIsSubscribed(status === 'SUBSCRIBED')
        })
    }

    initializeBookmarks()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [supabase])

  return { bookmarks, isSubscribed, isLoading }
}
