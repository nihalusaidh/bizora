"use client";

import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Download", href: "/download" },
  ],
  company: [
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ],
  resources: [
    { label: "FAQ", href: "/faq" },
    { label: "AI Setup Guide", href: "/faq" },
  ],
  legal: [
    { label: "Privacy", href: "/security" },
    { label: "Terms", href: "/security" },
    { label: "Refund Policy", href: "/security" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-md bg-[#DC2626] flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <span className="font-bold text-[#0a0a0a]">BIZORA</span>
            </Link>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Know what happened.
              <br />
              Know what to do next.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-500 hover:text-[#0a0a0a] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Bizora. All rights reserved.
          </p>
          <p className="text-xs text-neutral-400">
            Built for Indian businesses.
          </p>
        </div>
      </div>
    </footer>
  );
}
