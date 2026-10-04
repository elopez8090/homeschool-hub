"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact" },
] as const;

// TODO - Hide this link once admin auth is implemented
// Later we can add: {isAdmin && <NavLink href="/admin">Admin</NavLink>}
const ADMIN_LINK = { href: "/admin/submissions", label: "Admin Panel" } as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function HamburgerIcon() {
  return (
    <span className="flex flex-col gap-1.5" aria-hidden="true">
      <span className="block h-0.5 w-5 rounded-full bg-current" />
      <span className="block h-0.5 w-5 rounded-full bg-current" />
      <span className="block h-0.5 w-5 rounded-full bg-current" />
    </span>
  );
}

function CloseIcon() {
  return (
    <span className="relative block h-5 w-5" aria-hidden="true">
      <span className="absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
      <span className="absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
    </span>
  );
}

const OWNER_LINK = { href: "/owner/dashboard", label: "My Programs" } as const;

function isOwnerLinkActive(pathname: string) {
  return pathname === "/owner/dashboard" || pathname.startsWith("/owner/programs");
}

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [ownerSignedIn, setOwnerSignedIn] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/owner/session");
        if (!cancelled) setOwnerSignedIn(response.ok);
      } catch {
        if (!cancelled) setOwnerSignedIn(false);
      }
    }

    loadSession();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-blue-950 text-white shadow-sm">
      <div className="relative z-[60] mx-auto flex h-20 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
        <Link
          href="/"
          onClick={close}
          className="inline-flex shrink-0 items-center transition-opacity hover:opacity-80"
        >
          <Image
            src="/christianhs_logo1.png"
            alt="Christian Homeschools Hub"
            width={512}
            height={140}
            priority
            className="h-14 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-x-2.5 md:flex lg:gap-x-4 xl:gap-x-5" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap border-b-2 py-1 text-xs font-medium transition-colors lg:text-sm ${
                  active
                    ? "border-white text-white"
                    : "border-transparent text-white hover:text-gray-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {ownerSignedIn ? (
            <Link
              href={OWNER_LINK.href}
              aria-current={isOwnerLinkActive(pathname) ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 py-1 text-xs font-medium transition-colors lg:text-sm ${
                isOwnerLinkActive(pathname)
                  ? "border-white text-white"
                  : "border-transparent text-white hover:text-gray-200"
              }`}
            >
              {OWNER_LINK.label}
            </Link>
          ) : null}
          {/* TODO - Hide this link once admin auth is implemented */}
          <Link
            href={ADMIN_LINK.href}
            aria-current={isActive(pathname, ADMIN_LINK.href) ? "page" : undefined}
            className={`whitespace-nowrap border-b-2 py-1 text-xs font-medium transition-colors lg:text-sm ${
              isActive(pathname, ADMIN_LINK.href)
                ? "border-white text-white"
                : "border-transparent text-white hover:text-gray-200"
            }`}
          >
            {ADMIN_LINK.label}
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      <div className={`md:hidden ${open ? "" : "pointer-events-none"}`}>
        <button
          type="button"
          className={`fixed inset-0 top-20 z-40 bg-blue-950 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={close}
        />

        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
          aria-hidden={!open}
          className={`fixed inset-x-0 top-20 z-50 bg-blue-950 text-white shadow-lg transition-transform duration-300 ease-out ${
            open ? "translate-y-0" : "-translate-y-[calc(100%+5rem)]"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold tracking-wide text-white">Menu</p>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10"
              aria-label="Close menu"
              tabIndex={open ? 0 : -1}
              onClick={close}
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="flex flex-col px-3 py-3" aria-label="Mobile">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  tabIndex={open ? undefined : -1}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                    active
                      ? "bg-white/10 font-semibold text-white"
                      : "text-white hover:bg-white/10 hover:text-gray-200"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {ownerSignedIn ? (
              <Link
                href={OWNER_LINK.href}
                onClick={close}
                tabIndex={open ? undefined : -1}
                aria-current={isOwnerLinkActive(pathname) ? "page" : undefined}
                className={`rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                  isOwnerLinkActive(pathname)
                    ? "bg-white/10 font-semibold text-white"
                    : "text-white hover:bg-white/10 hover:text-gray-200"
                }`}
              >
                {OWNER_LINK.label}
              </Link>
            ) : null}
            {/* TODO - Hide this link once admin auth is implemented */}
            <div className="mt-2 border-t border-white/10 pt-2">
              <Link
                href={ADMIN_LINK.href}
                onClick={close}
                tabIndex={open ? undefined : -1}
                aria-current={isActive(pathname, ADMIN_LINK.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                  isActive(pathname, ADMIN_LINK.href)
                    ? "bg-white/10 font-semibold text-white"
                    : "text-white hover:bg-white/10 hover:text-gray-200"
                }`}
              >
                {ADMIN_LINK.label}
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
