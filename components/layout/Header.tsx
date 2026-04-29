"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const Header = () => {
  const count = useCart((s) => s.count());
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const onLanding = pathname === "/";

  const navLinks = [
    { href: "/browse", label: "Browse" },
    { href: "/favorites", label: "Favorites" },
    { href: "/orders", label: "Orders" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" id="header-logo">
          <div className="w-8 h-8 rounded-xl hero-gradient grid place-items-center text-white font-bold text-sm shadow-elevated transition-smooth group-hover:scale-105">
            E
          </div>
          <span className="font-bold tracking-tight text-lg">THE EDGE</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`focus-dashed transition-smooth hover:text-primary ${
                pathname === link.href ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {!onLanding && (
            <Link
              href="/browse"
              className="hidden sm:grid w-10 h-10 place-items-center rounded-full glass-dark hover:bg-secondary transition-smooth focus-dashed"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Link>
          )}

          <ThemeToggle />

          <Link
            href="/cart"
            id="header-cart-btn"
            className="relative inline-flex items-center gap-2 pill bg-foreground text-background pl-4 pr-5 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-smooth focus-dashed shadow-soft"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            {mounted && count > 0 && (
              <span className="ml-1 inline-grid place-items-center min-w-5 h-5 px-1.5 rounded-full bg-success text-success-foreground text-[11px] font-semibold animate-scale-in">
                {count}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-10 h-10 grid place-items-center rounded-full hover:bg-secondary transition-smooth focus-dashed"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-smooth ${
                  pathname === link.href
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
