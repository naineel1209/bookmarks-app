"use server"

import { createClient } from "@/lib/supabase/server"

export async function addBookmark(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Not authenticated")
  }

  const title = formData.get("title") as string
  const url = formData.get("url") as string
  const description = (formData.get("description") as string) || null
  const notes = (formData.get("notes") as string) || null
  const category = (formData.get("category") as string) || null
  const tagsRaw = (formData.get("tags") as string) || ""

  // Parse comma-separated tags into an array, filtering out empty strings
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)

  const { error } = await supabase.from("bookmarks").insert({
    user_id: user.id,
    title,
    url,
    description,
    notes,
    category,
    tags: tags.length > 0 ? tags : null,
  })

  if (error) throw error

  // Realtime subscription will automatically update the bookmark list
}

export async function updateBookmark(bookmarkId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Not authenticated")
  }

  const title = formData.get("title") as string
  const url = formData.get("url") as string
  const description = (formData.get("description") as string) || null
  const notes = (formData.get("notes") as string) || null
  const category = (formData.get("category") as string) || null
  const tagsRaw = (formData.get("tags") as string) || ""

  // Parse comma-separated tags into an array, filtering out empty strings
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)

  const { error } = await supabase
    .from("bookmarks")
    .update({
      title,
      url,
      description,
      notes,
      category,
      tags: tags.length > 0 ? tags : null,
    })
    .eq("id", bookmarkId)
    .eq("user_id", user.id)

  if (error) throw error

  // Realtime subscription will automatically update the bookmark list
}

export async function deleteBookmark(bookmarkId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", bookmarkId)
    .eq("user_id", user.id)

  if (error) throw error

  // Realtime subscription will automatically update the bookmark list
}
