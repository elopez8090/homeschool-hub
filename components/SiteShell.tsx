"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (
    pathname === "/about" ||
    pathname === "/how-it-works" ||
    pathname === "/faq" ||
    pathname === "/contact" ||
    pathname === "/privacy"
  ) {
    return (
      <div className="flex min-h-screen flex-col font-[family-name:var(--font-geist-sans)]">
        {children}
      </div>
    );
  }

  if (pathname === "/terms" || pathname === "/submit") {
    return (
      <div className="flex min-h-screen flex-col font-[family-name:var(--font-geist-sans)]">
        <Navigation />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col font-[family-name:var(--font-geist-sans)]">
      <Navigation />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
