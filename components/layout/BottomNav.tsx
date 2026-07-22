"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";

type IconVariant = { black: string; white: string };

const DualIcon = ({ icon, label, className = "w-5 h-5" }: { icon: IconVariant; label: string; className?: string }) => (
  <>
    <img src={icon.black} alt={label} className={`${className} dark:hidden object-contain`} loading="eager" decoding="sync" />
    <img src={icon.white} alt={label} className={`hidden ${className} dark:block object-contain`} loading="eager" decoding="sync" />
  </>
);

export const BottomNav = () => {
  const count = useCart((s) => s.count());
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isHome = pathname === "/";
  const isBrowse = pathname === "/browse";
  const isCart = pathname === "/cart";
  const isProfile = pathname === "/profile";

  const homeIcon: IconVariant = isHome
    ? { black: "/icons/home-filled-black.svg", white: "/icons/home-filled-white.svg" }
    : { black: "/icons/home-line-black.svg", white: "/icons/home-line-white.svg" };

  const browseIcon: IconVariant = isBrowse
    ? { black: "/icons/search-filled-black.svg", white: "/icons/search-filled-white.svg" }
    : { black: "/icons/search-line-black.svg", white: "/icons/search-line-white.svg" };

  const cartIcon: IconVariant = isCart
    ? { black: "/icons/cart-solid-black.svg", white: "/icons/cart-solid-white.svg" }
    : { black: "/icons/cart-new-black.svg", white: "/icons/cart-new-white.svg" };

  const profileIcon: IconVariant = isProfile
    ? { black: "/images/profile-black.svg", white: "/images/profile-white.svg" }
    : { black: "/icons/profile-line-black.svg", white: "/icons/profile-line-white.svg" };

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
    >
      <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-black/5 dark:border-white/10 p-2 pointer-events-auto">
        <Link
          href="/"
          aria-label="Home"
          className="w-11 h-11 rounded-full grid place-items-center active:scale-90 transition-smooth shrink-0"
        >
          <DualIcon icon={homeIcon} label="Home" />
        </Link>

        <motion.div layout transition={{ type: "spring", stiffness: 380, damping: 30 }} className="shrink-0">
          <Link
            href="/browse"
            aria-label="Search"
            className={`h-11 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-smooth overflow-hidden ${
              mounted ? "px-5 bg-secondary/70" : "w-11"
            }`}
          >
            <DualIcon icon={browseIcon} label="Search" />
            {mounted && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12, duration: 0.2 }}
                className={`text-sm whitespace-nowrap ${isBrowse ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}
              >
                Search
              </motion.span>
            )}
          </Link>
        </motion.div>

        <Link
          href="/cart"
          aria-label="Cart"
          className="relative w-11 h-11 rounded-full grid place-items-center active:scale-90 transition-smooth shrink-0"
        >
          <DualIcon icon={cartIcon} label="Cart" />
          {mounted && count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground animate-scale-in">
              {count}
            </span>
          )}
        </Link>

        <Link
          href="/profile"
          aria-label="Profile"
          className="w-11 h-11 rounded-full grid place-items-center active:scale-90 transition-smooth shrink-0"
        >
          <DualIcon icon={profileIcon} label="Profile" />
        </Link>
      </div>

      <div className="w-28 h-1 rounded-full bg-neutral-400/60 dark:bg-neutral-600/60 pointer-events-none" />
    </div>
  );
};
