"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";
import { HomeIcon, SearchIcon, CartIcon, ProfileIcon } from "@/components/ui/NavIcons";

const BUBBLE =
  "bg-white dark:bg-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-black/5 dark:border-white/10";

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

  const colorClass = (active: boolean) => (active ? "text-foreground" : "text-muted-foreground");

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
    >
      <div className="flex items-center gap-3 pointer-events-auto">
        <Link
          href="/"
          aria-label="Home"
          className={`w-12 h-12 rounded-full ${BUBBLE} grid place-items-center active:scale-90 transition-smooth shrink-0`}
        >
          <HomeIcon filled={isHome} className={`w-5 h-5 ${colorClass(isHome)}`} />
        </Link>

        <motion.div layout transition={{ type: "spring", stiffness: 380, damping: 30 }} className="shrink-0">
          <Link
            href="/browse"
            aria-label="Search"
            className={`h-12 rounded-full ${BUBBLE} flex items-center justify-center gap-2 active:scale-95 transition-smooth overflow-hidden ${
              mounted ? "px-5" : "w-12"
            }`}
          >
            <SearchIcon filled={isBrowse} className={`w-5 h-5 shrink-0 ${colorClass(isBrowse)}`} />
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
          className={`relative w-12 h-12 rounded-full ${BUBBLE} grid place-items-center active:scale-90 transition-smooth shrink-0`}
        >
          <CartIcon filled={isCart} className={`w-5 h-5 ${colorClass(isCart)}`} />
          {mounted && count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground animate-scale-in">
              {count}
            </span>
          )}
        </Link>

        <Link
          href="/profile"
          aria-label="Profile"
          className={`w-12 h-12 rounded-full ${BUBBLE} grid place-items-center active:scale-90 transition-smooth shrink-0`}
        >
          <ProfileIcon filled={isProfile} className={`w-5 h-5 ${colorClass(isProfile)}`} />
        </Link>
      </div>

      <div className="w-28 h-1 rounded-full bg-neutral-400/60 dark:bg-neutral-600/60 pointer-events-none" />
    </div>
  );
};
