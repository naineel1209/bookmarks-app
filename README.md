# 📚 Smart Bookmarks App

A modern, real-time bookmark manager that keeps your bookmarks synchronized across all your devices. Built with Next.js 15 and powered by Supabase for seamless authentication and live data synchronization.

## ✨ Features

- **🔐 Google OAuth Authentication** - Secure login with your Google account
- **📚 Bookmark Management** - Add, organize, and delete bookmarks with URL and title
- **🔒 Private Bookmarks** - Each user's bookmarks are kept private and secure
- **⚡ Real-time Live Sync** - Bookmarks synchronize instantly across all open tabs and devices using Supabase Realtime
- **🎨 Responsive UI** - Clean, modern interface built with Tailwind CSS
- **🏷️ Category Organization** - Organize bookmarks by custom categories

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 15 (App Router), React 19 |
| **Backend** | Supabase (Auth, Database, Realtime) |
| **Styling** | Tailwind CSS, shadcn/ui components |
| **Language** | TypeScript |
| **Authentication** | Supabase Auth with Google OAuth (PKCE flow) |
| **Deployment** | Vercel |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A [Supabase](https://supabase.com) account
- A [Google Cloud Console](https://console.cloud.google.com) project for OAuth

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd bookmarks-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase URL and anon key

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Enable Google OAuth in **Authentication > Providers**
3. Run the SQL schema from [`lib/supabase/schema.sql`](lib/supabase/schema.sql)
4. Enable Realtime on the bookmarks table
5. Copy your project URL and anon key to `.env.local`

### Deployment

This app is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel settings
4. Deploy!

---

## 🐛 Issues Faced During Development

### 1. Understanding the Complete OAuth Workflow

One of the key learning experiences during development was figuring out the complete OAuth 2.0 authorization flow and how Supabase implements it. This required diving deep into both Google's OAuth principles and Supabase's specific implementation.

---

The Supabase OAuth request flow involves multiple parties:

```
User's Browser → Supabase → Google Auth Servers → Supabase → Redirect URI
```

Understanding this flow required checking out multiple documentation sources:
- **Supabase Documentation**: [Social Login with Google & Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google)
- **Google OAuth Documentation**: [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2#webserver)

#### Important Configuration Details

The critical insight was that redirect URIs must match **exactly** across three different locations:

1. **Google Cloud Console** - Authorized redirect URIs
   - `https://<project-ref>.supabase.co/auth/v1/callback`

2. **Supabase Dashboard** - Site URL and additional redirect URLs
   - Site URL: Your production URL (e.g., `https://your-app.vercel.app`)
   - Redirect URLs: Add both development and production callback URLs

3. **Application Code** - The redirect URL passed to the `signInWithOAuth()` call
   ```typescript
   await supabase.auth.signInWithOAuth({
     provider: 'google',
     options: {
       redirectTo: `${origin}/auth/callback`, // Must match Supabase allowlist
     },
   })
   ```

The key learning: **Every redirect URI must be an exact match** — including trailing slashes, protocol (http/https), and port numbers. A mismatch at any point in the chain will cause the OAuth flow to fail.

---

### 2. Implementing Real-time Sync Across Browser Tabs

A core feature requirement was to keep bookmarks synchronized when the same site is open in multiple browser tabs.

#### Initial Approach: Polling

The first solution considered was implementing a fixed interval polling mechanism:
- Set up a `setInterval` to periodically refresh the component
- Fetch the latest data from the server at each interval
- Update the UI with the new data

**Drawbacks**: This approach creates unnecessary server load, introduces latency (updates only happen at interval boundaries), and wastes bandwidth with redundant requests.

#### Better Solution: Supabase Realtime

After researching alternatives, I discovered **Supabase Realtime** — a feature that publishes events on Postgres database changes at the row level to all subscribed clients.

The implementation was straightforward, but there was a critical consideration: **we shouldn't listen to ALL database events**. Every user's bookmark changes would trigger events for all connected clients, creating noise and potential security concerns.

#### The Solution: RLS + Realtime

The elegant solution was leveraging **Row Level Security (RLS) policies**. Supabase Realtime respects RLS policies, automatically filtering events to only those rows the user has access to. This means:
- Users only receive events for their own bookmarks
- No manual filtering logic needed in the application code
- Security is enforced at the database level

The implementation in [`lib/hooks/useBookmarksSubscription.ts`](lib/hooks/useBookmarksSubscription.ts):

```typescript
const channel = supabase
  .channel('bookmarks-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'bookmarks',
    },
    (payload) => {
      // Handle INSERT, UPDATE, DELETE events
      onBookmarkChange(payload)
    }
  )
  .subscribe()
```

With RLS policies in place, each user automatically receives only their own bookmark events, making real-time sync both secure and efficient.

---

## 📁 Project Structure

```
bookmarks-app/
├── app/
│   ├── auth/
│   │   ├── callback/route.ts    # OAuth callback handler
│   │   ├── login/route.ts       # Login initiation
│   │   └── logout/action.ts     # Logout server action
│   ├── home/
│   │   ├── page.tsx             # Main dashboard
│   │   └── actions.ts           # Server actions for bookmarks
│   ├── layout.tsx
│   └── page.tsx                 # Landing page
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── add-bookmark-dialog.tsx
│   ├── bookmark-card.tsx
│   └── categories-section.tsx
├── lib/
│   ├── hooks/
│   │   └── useBookmarksSubscription.ts  # Realtime subscription hook
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── schema.sql           # Database schema
│   ├── types.ts
│   └── utils.ts
├── middleware.ts                # Auth middleware
└── docs/
    └── cookie-error-resolution.md
```

## 🔗 Live Demo

**Live URL**: https://bookmarks-app-beta-gray.vercel.app/
