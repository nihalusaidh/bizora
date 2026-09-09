"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Download", href: "/download" },
  { label: "FAQ", href: "/faq" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const navBg = isHome
    ? scrolled
      ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10"
      : "bg-transparent"
    : "bg-white border-b border-neutral-200";

  const textColor = isHome
    ? scrolled
      ? "text-white"
      : "text-white"
    : "text-[#0a0a0a]";

  const mutedColor = isHome ? "text-white/50" : "text-neutral-500";

  return (
    <div className={`min-h-screen ${isHome ? "bg-[#0a0a0a]" : "bg-white"}`}>
      {/* Nav */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#DC2626] flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className={`text-lg font-bold tracking-tight ${textColor}`}>
              BIZORA
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`${mutedColor} hover:${textColor} transition-colors`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-medium ${mutedColor} hover:${textColor} transition-colors`}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#B91C1C] transition-colors"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 ${textColor}`}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className={`md:hidden border-t ${isHome ? "border-white/10 bg-[#0a0a0a]" : "border-neutral-200 bg-white"}`}>
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-sm font-medium ${textColor}`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className={isHome ? "border-white/10" : "border-neutral-200"} />
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={`block text-sm font-medium ${textColor}`}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="block text-center rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-medium text-white"
              >
                Start Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer - only on non-home pages (home has its own footer) */}
      {!isHome && (
        <footer className="border-t border-neutral-200 bg-white mt-20">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-[#DC2626] flex items-center justify-center">
                  <span className="text-white font-bold text-xs">B</span>
                </div>
                <span className="font-bold text-[#0a0a0a]">BIZORA</span>
              </div>
              <p className="text-xs text-neutral-400">
                © {new Date().getFullYear()} Bizora. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
