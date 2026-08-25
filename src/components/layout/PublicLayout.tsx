"use client"

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/offers", label: "Offers" },
  { href: "/publishers", label: "Publishers" },
  { href: "/faq", label: "FAQ" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-[#05070b] text-white overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#05070b]/80 via-[#0d1724]/60 to-[#101827]/80" />
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] md:w-[800px] md:h-[800px] bg-gradient-radial from-indigo-900/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-gradient-radial from-purple-700/15 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[350px] h-[350px] md:w-[700px] md:h-[700px] bg-gradient-radial from-pink-900/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <div className="relative z-10">
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[#05070b]/90 border-b border-white/5"
        >
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 md:h-20">
            <Link href="/" className="flex items-center shrink-0" onClick={() => setMobileMenuOpen(false)}>
              <div className="relative h-16 w-16 overflow-hidden rounded-lg md:h-20 md:w-20">
                <Image
                  src="/afficixo-logo.png"
                  alt="Afficixo logo"
                  fill
                  sizes="(max-width: 768px) 48px, 56px"
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            </Link>

            <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/login" className="hidden text-sm text-slate-300 transition-colors hover:text-white sm:block">
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-purple-500/40 md:px-4 md:text-sm"
              >
                Join Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="rounded-md p-2 text-slate-300 transition-colors hover:text-white md:hidden"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-white/10 bg-[#05070b]/95 md:hidden"
            >
              <div className="space-y-3 px-4 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-1 text-sm text-slate-300 transition-colors hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  className="block py-1 text-sm text-slate-300 transition-colors hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            </motion.div>
          )}
        </motion.header>

        {children}

        <footer className="relative z-10 mt-8 border-t border-white/10 bg-white/[0.02] backdrop-blur py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 sm:px-6 lg:flex-row lg:px-8">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                <Image
                  src="/afficixo-logo.png"
                  alt="Afficixo logo"
                  fill
                  sizes="40px"
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 md:gap-6 md:text-sm">
              <Link href="/about" className="transition-colors hover:text-white">About</Link>
              <Link href="/offers" className="transition-colors hover:text-white">Offers</Link>
              <Link href="/publishers" className="transition-colors hover:text-white">Publishers</Link>
              <Link href="/faq" className="transition-colors hover:text-white">FAQ</Link>
              <Link href="/privacy-policy" className="transition-colors hover:text-white">Privacy Policy</Link>
              <Link href="/terms-of-service" className="transition-colors hover:text-white">Terms of Service</Link>
              <Link href="/contact" className="transition-colors hover:text-white">Contact</Link>
            </div>

            <div className="flex items-center gap-3 text-slate-400 md:gap-4">
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X" className="transition-all hover:-translate-y-0.5 hover:text-white">X</a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="transition-all hover:-translate-y-0.5 hover:text-white">in</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="transition-all hover:-translate-y-0.5 hover:text-white">GitHub</a>
              <a href="https://t.me" target="_blank" rel="noreferrer" aria-label="Telegram" className="transition-all hover:-translate-y-0.5 hover:text-white">Telegram</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
