import { createClient } from './server'
import { Bookmark, Category, User } from '../types'

// Bookmark queries
export async function getBookmarks(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Bookmark[]
}

export async function createBookmark(userId: string, bookmark: Omit<Bookmark, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({ ...bookmark, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data as Bookmark
}

export async function updateBookmark(id: string, updates: Partial<Omit<Bookmark, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookmarks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Bookmark
}

export async function deleteBookmark(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function searchBookmarks(userId: string, query: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,url.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Bookmark[]
}

// Category queries
export async function getCategories(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  if (error) throw error
  return data as Category[]
}

export async function createCategory(userId: string, category: Omit<Category, 'id' | 'created_at'>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .insert({ ...category, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data as Category
}

export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Category
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// User queries
export async function getUser(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as User
}

export async function createUser(userId: string, user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .insert({ ...user, id: userId })
    .select()
    .single()

  if (error) throw error
  return data as User
}

export async function updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'email' | 'created_at' | 'updated_at'>>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as User
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  if (error) throw error
}
