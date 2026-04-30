"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Home, Compass, ReceiptText, User } from "lucide-react";
import { useCart } from "@/store/cart";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const Header = () => {
  const count = useCart((s) => s.count());
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/browse", label: "Browse", icon: Compass },
    { href: "/orders", label: "Orders", icon: ReceiptText },
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

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`focus-dashed transition-smooth hover:text-primary ${
                pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/cart"
              id="header-cart-btn"
              className="relative inline-flex items-center gap-2 pill bg-foreground text-background pl-4 pr-5 py-2 text-sm font-medium hover:bg-foreground/90 transition-smooth focus-dashed shadow-soft"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {mounted && count > 0 && (
                <span className="ml-1 inline-grid place-items-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold animate-scale-in">
                  {count}
                </span>
              )}
            </Link>
            <Link
              href="/profile"
              className="w-10 h-10 grid place-items-center rounded-full glass-dark hover:bg-secondary transition-smooth focus-dashed"
              aria-label="Profile"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Search (since main nav is at bottom) */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/browse"
              className="w-10 h-10 grid place-items-center rounded-full glass-dark hover:bg-secondary transition-smooth focus-dashed"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

