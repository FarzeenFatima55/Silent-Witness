"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield } from "lucide-react";
import Button from "@/app/components/ui/Button";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Privacy", href: "#privacy" },
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50",
          "transition-all duration-300",
          isScrolled
            ? "bg-cream/90 backdrop-blur-md border-b border-navy/8 shadow-[0_1px_12px_rgb(27_42_74/0.06)]"
            : "bg-transparent",
        ].join(" ")}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <a
              href="#"
              className="flex items-center gap-2.5 group"
              aria-label="Silent Witness — home"
            >
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-navy shadow-[0_2px_8px_rgb(27_42_74/0.25)]">
                <Shield className="w-4 h-4 text-sage" strokeWidth={1.5} />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-sage rounded-full border-2 border-cream animate-pulse-ring" />
              </div>
              <span className="text-navy font-bold text-lg tracking-tight">
                Silent<span className="text-sage">Witness</span>
              </span>
            </a>

            {/* Desktop nav */}
            <ul className="hidden md:flex items-center gap-1" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="px-4 py-2 text-sm font-medium text-slate hover:text-navy rounded-lg hover:bg-navy/5 transition-all duration-150 cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs text-slate/70 font-medium">No login required</span>
              <Button size="md" variant="ghost" onClick={() => router.push("/access-case")}>
                Access Case
              </Button>
              <Button size="md" variant="primary" onClick={() => router.push("/create-case")}>
                <Shield className="w-3.5 h-3.5" />
                Make a Report
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg text-navy hover:bg-navy/8 transition-colors"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-16 left-0 right-0 z-40 bg-cream/97 backdrop-blur-md border-b border-navy/10 shadow-lg md:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-navy hover:bg-navy/6 rounded-xl transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-2 pt-2 border-t border-navy/8 flex flex-col gap-2">
                <Button size="md" variant="ghost" className="w-full" onClick={() => { setIsMobileOpen(false); router.push("/access-case"); }}>
                  Access Case
                </Button>
                <Button size="md" variant="primary" className="w-full" onClick={() => { setIsMobileOpen(false); router.push("/create-case"); }}>
                  <Shield className="w-3.5 h-3.5" />
                  Make a Report
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
