export interface Bookmark {
  id: string
  user_id: string
  title: string
  url: string
  description?: string | null
  category?: string | null
  tags?: string[] | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color?: string
  created_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  theme: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'email' | 'created_at' | 'updated_at'>>
      },
      bookmarks: {
        Row: Bookmark
        Insert: Omit<Bookmark, 'id' | 'user_id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Bookmark, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      },
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'user_id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>
      }
    }
  }
}
