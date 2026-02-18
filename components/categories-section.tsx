'use client'

import { useState } from "react"
import { FolderOpen, ChevronDown } from "lucide-react"
import { Tables } from "@/lib/types"
import { BookmarkCard } from "@/components/bookmark-card"

type Bookmark = Tables<"bookmarks">

interface CategoriesSectionProps {
  bookmarks: Bookmark[]
}

/**
 * Categories Section - Groups bookmarks by their category (lowercase)
 * and displays them in collapsible sections.
 */
export function CategoriesSection({ bookmarks }: CategoriesSectionProps) {
  // Filter bookmarks that have a category
  const categorizedBookmarks = bookmarks.filter((bm) => bm.category)

  // Group bookmarks by lowercase category name
  const groupedByCategory = categorizedBookmarks.reduce(
    (acc, bookmark) => {
      const categoryKey = (bookmark.category || "").toLowerCase()
      if (!acc[categoryKey]) {
        acc[categoryKey] = {
          displayName: bookmark.category || "Uncategorized",
          bookmarks: [],
        }
      }
      acc[categoryKey].bookmarks.push(bookmark)
      return acc
    },
    {} as Record<string, { displayName: string; bookmarks: Bookmark[] }>
  )

  // Sort categories alphabetically
  const sortedCategories = Object.entries(groupedByCategory).sort(
    ([, a], [, b]) => a.displayName.localeCompare(b.displayName)
  )

  // State to track which categories are expanded (all start expanded)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(sortedCategories.map(([key]) => [key, true]))
  )

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }))
  }

  if (sortedCategories.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FolderOpen className="h-6 w-6" />
          Categories
        </h2>
        <p className="text-muted-foreground mt-1">
          {categorizedBookmarks.length} bookmark{categorizedBookmarks.length !== 1 ? "s" : ""} organized by category
        </p>
      </div>

      <div className="space-y-4">
        {sortedCategories.map(([categoryKey, { displayName, bookmarks: categoryBookmarks }]) => (
          <div key={categoryKey} className="border rounded-lg overflow-hidden">
            {/* Collapsible header */}
            <button
              onClick={() => toggleCategory(categoryKey)}
              className="w-full flex items-center gap-2 px-4 py-3 bg-card hover:bg-muted/50 transition-colors border-b"
            >
              <ChevronDown
                className={`h-5 w-5 text-primary transition-transform ${
                  expandedCategories[categoryKey] ? "" : "-rotate-90"
                }`}
              />
              <FolderOpen className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary flex-1 text-left">
                {displayName}
              </h3>
              <span className="text-sm text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {categoryBookmarks.length} item{categoryBookmarks.length !== 1 ? "s" : ""}
              </span>
            </button>

            {/* Collapsible content */}
            {expandedCategories[categoryKey] && (
              <div className="p-4 space-y-4 bg-background/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryBookmarks.map((bookmark) => (
                    <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
