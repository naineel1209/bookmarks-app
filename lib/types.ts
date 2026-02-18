export interface Bookmark {
  id: string
  user_id: string
  title: string
  url: string
  created_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      bookmarks: {
        Row: Bookmark
        Insert: Omit<Bookmark, 'id' | 'created_at'>
        Update: Partial<Omit<Bookmark, 'id' | 'user_id' | 'created_at'>>
      },
      user: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<Omit<User, 'id' | 'email' | 'created_at'>>
      }
    }
  }
}
