import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
] as const;

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-blue-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav aria-label="Footer">
          <ul className="grid grid-cols-1 gap-4 text-center md:grid-cols-4 md:gap-6">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-white transition-colors hover:text-gray-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-8 border-t border-white/15 pt-6 text-center text-sm text-white">
          © 2026 Christian Homeschools Hub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
