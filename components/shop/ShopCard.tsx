import Link from "next/link";
import { Shop } from "@/lib/mockData";

interface ShopCardProps {
  shop: Shop;
}

export const ShopCard = ({ shop }: ShopCardProps) => (
  <Link
    href={`/shop/${shop.slug}`}
    id={`shop-card-${shop.id}`}
    className="group flex-shrink-0 w-[260px] snap-start rounded-3xl border border-border bg-card p-5 hover:shadow-elevated transition-smooth focus-dashed"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-14 h-14 rounded-2xl bg-secondary grid place-items-center text-3xl">
        {shop.emoji}
      </div>
      <span
        className={`pill text-[11px] font-semibold px-2.5 py-1 ${
          shop.isOpen
            ? "bg-success-soft text-success-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {shop.isOpen ? "● OPEN" : "● CLOSED"}
      </span>
    </div>

    <h3 className="font-semibold text-base tracking-tight">{shop.name}</h3>
    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{shop.tagline}</p>

    <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
      <span className="font-mono">⏱ {shop.prepTime}</span>
      <span>·</span>
      <span className="font-mono">★ {shop.rating}</span>
      <span>·</span>
      <span>{shop.reviewCount} reviews</span>
    </div>

    {shop.closedNote && (
      <p className="mt-3 text-xs text-muted-foreground italic">{shop.closedNote}</p>
    )}

    {shop.tags.slice(0, 2).length > 0 && (
      <div className="flex gap-1.5 mt-3">
        {shop.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </Link>
);
