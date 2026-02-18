"use client"

import * as React from "react"
import { Plus, Loader2, BookmarkPlus, Edit2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addBookmark, updateBookmark, deleteBookmark } from "@/app/home/actions"
import { Tables } from "@/lib/types"

type Bookmark = Tables<"bookmarks">

interface BookmarkDialogProps {
  bookmark?: Bookmark
  children?: React.ReactNode
  trigger?: React.ReactNode
}

export function BookmarkDialog({
  bookmark,
  children,
  trigger,
}: BookmarkDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const formRef = React.useRef<HTMLFormElement>(null)

  const isEditMode = !!bookmark
  const mode = isEditMode ? "edit" : "add"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    try {
      if (isEditMode && bookmark) {
        await updateBookmark(bookmark.id, formData)
      } else {
        await addBookmark(formData)
      }
      formRef.current?.reset()
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} bookmark.`)
    } finally {
      setIsPending(false)
    }
  }

  async function handleDelete() {
    if (!bookmark) return

    const confirmed = confirm(
      `Are you sure you want to delete "${bookmark.title}"? This action cannot be undone.`
    )
    if (!confirmed) return

    setIsDeleting(true)
    setError(null)

    try {
      await deleteBookmark(bookmark.id)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete bookmark.")
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultTrigger = (
    <Button
      size="lg"
      className="gap-2 shadow-md hover:shadow-lg transition-shadow"
    >
      <BookmarkPlus className="h-5 w-5" />
      Add Bookmark
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isEditMode ? (
              <>
                <Edit2 className="h-5 w-5 text-primary" />
                Edit Bookmark
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-primary" />
                New Bookmark
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details of your bookmark."
              : "Save a new link to your collection. Fill in the details below."}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {/* URL */}
          <div className="space-y-1.5">
            <Label htmlFor="url">
              URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://example.com"
              defaultValue={bookmark?.url ?? ""}
              required
              disabled={isPending}
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="My Favourite Article"
              defaultValue={bookmark?.title ?? ""}
              required
              disabled={isPending}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="A brief description of this link…"
              defaultValue={bookmark?.description ?? ""}
              rows={2}
              disabled={isPending}
            />
          </div>

          {/* Category + Tags on the same row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                type="text"
                placeholder="e.g. Design"
                defaultValue={bookmark?.category ?? ""}
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                type="text"
                placeholder="react, ux, tools"
                defaultValue={bookmark?.tags?.join(", ") ?? ""}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">Comma-separated</p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Personal notes about this bookmark…"
              defaultValue={bookmark?.notes ?? ""}
              rows={3}
              disabled={isPending}
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}

          <DialogFooter className="flex items-center justify-between">
            <div className="flex gap-2">
              {isEditMode && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending || isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending || isDeleting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || isDeleting}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating…" : "Saving…"}
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Update Bookmark
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="mr-2 h-4 w-4" />
                        Save Bookmark
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Legacy export for backwards compatibility - just the "Add" mode
 */
export function AddBookmarkDialog() {
  return <BookmarkDialog />
}
