import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Christian Homeschools Hub",
  description:
    "A multi-state directory of Christian homeschool programs, co-ops, and resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-cream text-foreground antialiased`}
      >
        <div className="flex min-h-screen flex-col font-[family-name:var(--font-geist-sans)]">
          <header className="border-b border-blue-900/20 bg-blue-800 text-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
              <Link href="/" className="text-lg font-semibold tracking-tight">
                Christian Homeschools Hub
              </Link>
              <nav className="text-sm text-blue-100">
                <Link href="/" className="hover:text-white">
                  Browse states
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-navy/10 bg-white/50">
            <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-navy/70 sm:px-6">
              Christian Homeschools Hub — a directory for families seeking
              Christ-centered homeschool programs.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
