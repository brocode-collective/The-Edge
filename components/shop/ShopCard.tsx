"use client";

import Link from "next/link";
import { Shop } from "@/lib/mockData";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const ScrollIfLong = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const originalWidth = contentRef.current.scrollWidth;
      if (originalWidth > containerWidth) {
        setShouldScroll(true);
        setContentWidth(originalWidth + 24); // original width + 24px gap
      }
    }
  }, [children]);

  return (
    <div ref={containerRef} className="overflow-hidden w-full relative">
      <motion.div
        animate={shouldScroll ? { x: [0, -contentWidth] } : { x: 0 }}
        transition={shouldScroll ? {
          duration: contentWidth / 20, // speed
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop"
        } : {}}
        className={shouldScroll ? "flex w-max" : ""}
        style={{ gap: shouldScroll ? 24 : 0 }}
      >
        <div ref={contentRef} className={className}>
          {children}
        </div>
        {shouldScroll && (
          <div className={className}>
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
};

interface ShopCardProps {
  shop: Shop;
}

export const ShopCard = ({ shop }: ShopCardProps) => (
  <Link
    href={`/shop/${shop.slug}`}
    id={`shop-card-${shop.id}`}
    className="group flex-shrink-0 w-[260px] h-[200px] flex flex-col justify-between snap-start rounded-3xl border border-border bg-card p-5 hover:shadow-elevated transition-smooth focus-dashed"
  >
    <div>
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-2xl bg-secondary grid place-items-center text-2xl">
          {shop.emoji}
        </div>
        <span
          className={`pill text-[10px] font-semibold px-2 py-0.5 ${
            shop.isOpen
              ? "bg-success-soft text-success-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {shop.isOpen ? "● OPEN" : "● CLOSED"}
        </span>
      </div>

      <div className="min-w-0">
        <h3 className="font-semibold text-base tracking-tight truncate">{shop.name}</h3>
        <p className="text-sm text-muted-foreground mt-0.5 truncate">{shop.tagline}</p>
      </div>
    </div>

    <div className="mt-2 overflow-hidden flex flex-col gap-2">
      {shop.closedNote && (
        <ScrollIfLong className="w-max">
          <p className="text-xs text-muted-foreground italic whitespace-nowrap">
            {shop.closedNote}
          </p>
        </ScrollIfLong>
      )}

      {shop.tags.length > 0 && (
        <ScrollIfLong className="flex gap-1.5 w-max">
          {shop.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </ScrollIfLong>
      )}
    </div>
  </Link>
);
