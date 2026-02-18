import * as React from "react"
import { ExternalLink, FolderOpen, StickyNote, Calendar, Edit2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tables } from "@/lib/types"
import { BookmarkDialog } from "@/components/add-bookmark-dialog"

type Bookmark = Tables<"bookmarks">

interface BookmarkCardProps {
  bookmark: Bookmark
}

/** Extract a clean hostname from a URL for display purposes. */
function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

/** Format an ISO date string into a readable short date. */
function formatDate(iso: string | null): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const hostname = getHostname(bookmark.url)
  const faviconUrl = `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`

  return (
    <Card className="group flex flex-col hover:shadow-md transition-shadow duration-200 border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {/* Favicon */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={faviconUrl}
            alt=""
            width={20}
            height={20}
            className="mt-0.5 rounded-sm shrink-0"
            aria-hidden
          />

          <div className="flex-1 min-w-0">
            {/* Title as a link */}
            <CardTitle className="text-base leading-snug">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors line-clamp-2 flex items-start gap-1.5 group/link"
              >
                {bookmark.title}
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 group-hover/link:opacity-60 transition-opacity" />
              </a>
            </CardTitle>

            {/* Hostname */}
            <CardDescription className="mt-0.5 text-xs truncate">
              {hostname}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-2 pb-3">
        {/* Description */}
        {bookmark.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {bookmark.description}
          </p>
        )}

        {/* Notes */}
        {bookmark.notes && (
          <div className="flex items-start gap-1.5 text-muted-foreground">
            <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <p className="text-xs line-clamp-2 italic">{bookmark.notes}</p>
          </div>
        )}

        {/* Category + Tags */}
        {(bookmark.category || (bookmark.tags && bookmark.tags.length > 0)) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {bookmark.category && (
              <Badge
                variant="secondary"
                className="gap-1 text-xs font-medium"
              >
                <FolderOpen className="h-3 w-3" />
                {bookmark.category}
              </Badge>
            )}
            {bookmark.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <time dateTime={bookmark.created_at ?? undefined}>
            {formatDate(bookmark.created_at)}
          </time>
        </div>

        {/* Edit button hidden on small screens, visible on hover on larger screens */}
        <BookmarkDialog
          bookmark={bookmark}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit bookmark"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          }
        />
      </CardFooter>
    </Card>
  )
}
