import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Bookmarks",
  description: "Manage your bookmarks with real-time sync",
  icons: {
    // SVG icon — picked up by modern browsers (Chrome, Firefox, Edge, Safari 12+)
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    // Apple home-screen icon (iOS Safari)
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    // Shortcut for legacy browser toolbar pinning
    shortcut: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
