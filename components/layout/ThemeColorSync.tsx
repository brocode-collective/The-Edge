"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

const THEME_COLORS: Record<string, string> = {
  light: "#ffffff",
  dark: "#000000",
};

/**
 * Keeps the browser / PWA status-bar colour in sync with the
 * current next-themes resolved theme by imperatively updating
 * every <meta name="theme-color"> tag in the document head.
 *
 * Mount once inside <Providers> (after <ThemeProvider>).
 */
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color = THEME_COLORS[resolvedTheme ?? "light"] ?? THEME_COLORS.light;

    // Update all existing theme-color meta tags (Next.js may emit
    // multiple — one per media query from the static viewport export).
    const metas = document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );

    if (metas.length > 0) {
      metas.forEach((meta) => {
        meta.removeAttribute("media"); // drop the media query so one value wins
        meta.setAttribute("content", color);
      });
    } else {
      // Fallback: create a meta tag if none exist yet
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = color;
      document.head.appendChild(meta);
    }
  }, [resolvedTheme]);

  return null;
}
