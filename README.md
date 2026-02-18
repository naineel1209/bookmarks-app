# Smart Bookmarks App

A real-time bookmark manager built with Next.js and Supabase.

## Features

- 🔐 Google OAuth authentication
- 📚 Add and manage bookmarks (URL + title)
- 🔒 Private bookmarks per user
- ⚡ Real-time updates across tabs
- 🗑️ Delete bookmarks
- 🎨 Clean, responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Backend**: Supabase (Auth, Database, Realtime)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Google Cloud Console project for OAuth

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bookmarks-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase URL and anon key

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Setup Instructions

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Enable Google OAuth in Authentication > Providers
3. Create the bookmarks table (SQL will be provided)
4. Enable Realtime on the bookmarks table
5. Copy your project URL and anon key to `.env.local`

### Deployment

This app is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel settings
4. Deploy!

## Problems Encountered & Solutions

(This section will be filled out during development)

## Live Demo

**Live URL**: (Will be added after deployment)

## License

MIT
