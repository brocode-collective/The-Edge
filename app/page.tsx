"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Smartphone } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PWABanner } from "@/components/layout/PWABanner";
import { ShopCard } from "@/components/shop/ShopCard";
import { FoodCard } from "@/components/shop/FoodCard";
import { mockCategories } from "@/lib/mockData";
import { dietaryFilters } from "@/lib/designSystem";
import { useMenuItems, useShops } from "@/lib/supabase/hooks";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeDiet, setActiveDiet] = useState<string | null>(null);
  const { data: shops = [] } = useShops();
  const { data: items = [] } = useMenuItems();
  const shopNames = useMemo(
    () => new Map(shops.map((shop) => [shop.id, shop.name])),
    [shops]
  );

  const filtered = items.filter((i) => {
    const matchQ = query
      ? i.title.toLowerCase().includes(query.toLowerCase()) ||
        i.description.toLowerCase().includes(query.toLowerCase())
      : true;
    const matchC = activeCat ? i.category === activeCat : true;
    const matchD = activeDiet ? i.dietaryTags.includes(activeDiet) : true;
    return matchQ && matchC && matchD;
  });

  const popular = items.filter((i) => i.popular && i.isAvailable);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 pt-10 pb-12 md:pt-16 md:pb-20">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div className="animate-fade-up">
              <div className="label-mono mb-5">● Campus food, sorted</div>
              <h1 className="text-[44px] sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight">
                Order ahead.<br />
                Skip the queue.<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[hsl(190_95%_55%)] to-success">
                  Pick up when ready.
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                One tap for fried rice, mango juice or a quick samosa. Pay online and grab it from the vendor with your pickup code — no waiting.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/browse"
                  id="hero-cta-browse"
                  className="inline-flex items-center gap-2 pill bg-foreground text-background px-6 py-3.5 font-medium hover:bg-foreground/90 transition-smooth focus-dashed shadow-pop"
                >
                  Start Ordering <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#shops"
                  className="pill border border-border px-6 py-3.5 font-medium hover:bg-secondary transition-smooth focus-dashed"
                >
                  Browse Shops
                </a>
              </div>

              <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex -space-x-2">
                  {shops.slice(0, 4).map((s) => (
                    <div
                      key={s.id}
                      className="w-7 h-7 rounded-full bg-secondary border-2 border-background grid place-items-center text-sm"
                    >
                      {s.emoji}
                    </div>
                  ))}
                </div>
                <span>
                  <span className="font-semibold text-foreground">{shops.length} vendors</span> serving the campus today
                </span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative animate-fade-up hidden lg:block">
              <div className="aspect-square rounded-[2rem] hero-gradient p-3 shadow-pop">
                <div className="w-full h-full rounded-[1.6rem] bg-white/10 backdrop-blur-sm grid place-items-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🍛</div>
                    <div className="text-white font-bold text-2xl">Campus Canteen</div>
                    <div className="text-white/70 text-sm mt-1">Order • Pay • Pick up</div>
                  </div>
                </div>
              </div>
              {/* Floating pickup code card */}
              <div className="absolute -bottom-5 -left-4 sm:left-6 bg-background rounded-2xl p-4 shadow-elevated border border-border w-[230px] animate-fade-up">
                <div className="label-mono mb-1.5">PICKUP CODE</div>
                <div className="font-mono text-3xl font-bold tracking-widest">A7K9</div>
                <div className="mt-2 flex items-center gap-2 text-xs text-success-foreground">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse-soft" /> Ready in 4 min
                </div>
              </div>
              {/* Floating PWA card */}
              <div className="absolute -top-3 -right-3 sm:-right-4 bg-background rounded-2xl p-3 pl-4 pr-5 shadow-elevated border border-border flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-primary" />
                <div className="text-xs">
                  <div className="font-semibold">Add to Home Screen</div>
                  <div className="text-muted-foreground">For 1-tap access</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH ── */}
      <section className="container mx-auto px-4 pb-4" id="search-section">
        <div className="relative max-w-3xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="home-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food, drinks, or shops…"
            className="w-full pl-12 pr-5 py-4 rounded-full bg-secondary border border-transparent focus:border-primary focus:bg-background transition-smooth focus-dashed text-sm placeholder:text-muted-foreground outline-none"
          />
        </div>
      </section>

      {/* ── SHOPS ── */}
      <section id="shops" className="container mx-auto px-4 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="label-mono mb-2">● 01 / Vendors</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Today&apos;s shops</h2>
          </div>
          <Link href="/browse" className="text-sm font-medium text-primary hover:underline focus-dashed">
            View all →
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide -mx-4 px-4 pb-2">
          {shops.map((s) => (
            <ShopCard key={s.id} shop={s} />
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="container mx-auto px-4 py-6">
        <div className="label-mono mb-4">● 02 / Categories</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {mockCategories.map((c) => {
            const active = activeCat === c.label;
            return (
              <button
                key={c.id}
                id={`category-${c.id}`}
                onClick={() => setActiveCat(active ? null : c.label)}
                className={`rounded-3xl border p-5 text-left transition-smooth focus-dashed ${
                  active
                    ? "bg-foreground text-background border-foreground shadow-pop"
                    : "bg-card border-border hover:border-foreground/30"
                }`}
              >
                <div className="text-3xl mb-3">{c.emoji}</div>
                <div className="font-semibold tracking-tight text-sm">{c.label}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── DIETARY FILTERS ── */}
      <section className="container mx-auto px-4 pt-8">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="label-mono mr-2">FILTER</span>
          {dietaryFilters.map((d) => {
            const active = activeDiet === d;
            return (
              <button
                key={d}
                id={`diet-filter-${d.toLowerCase()}`}
                onClick={() => setActiveDiet(active ? null : d)}
                className={`pill text-xs font-medium px-3.5 py-1.5 transition-smooth focus-dashed ${
                  active
                    ? "bg-success text-success-foreground"
                    : "bg-secondary text-foreground hover:bg-accent"
                }`}
              >
                {d}
              </button>
            );
          })}
          {(activeCat || activeDiet) && (
            <button
              onClick={() => { setActiveCat(null); setActiveDiet(null); }}
              className="pill text-xs font-medium px-3.5 py-1.5 border border-border hover:bg-secondary transition-smooth focus-dashed text-muted-foreground"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* ── MENU GRID ── */}
      <section className="container mx-auto px-4 py-10">
        {(query || activeCat || activeDiet) && (
          <div className="label-mono mb-4">
            ● Results ({filtered.length} item{filtered.length !== 1 ? "s" : ""})
          </div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((i) => (
            <FoodCard key={i.id} item={i} shopName={shopNames.get(i.shopId)} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground bg-secondary/30 rounded-[2rem] border border-dashed border-border">
            No items match your filters.
          </div>
        )}
      </section>

      {/* ── POPULAR ── */}
      {!query && !activeCat && !activeDiet && popular.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <div className="label-mono mb-3">● 03 / On the rise</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">Most ordered today</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {popular.map((i) => (
              <FoodCard key={i.id} item={i} shopName={shopNames.get(i.shopId)} />
            ))}
          </div>
        </section>
      )}

      {/* ── PWA NUDGE ── */}
      <section className="container mx-auto px-4 py-14">
        <div className="rounded-[2rem] hero-gradient p-8 sm:p-12 text-white shadow-pop relative overflow-hidden">
          <div className="relative max-w-2xl">
            <div className="label-mono text-white/80 mb-3">● Pro tip</div>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Install THE EDGE on your phone
            </h3>
            <p className="mt-3 text-white/90 leading-relaxed">
              Add to your home screen for one-tap ordering. No app store, no install size — just speed.
            </p>
            <button
              id="pwa-install-btn"
              className="mt-6 pill bg-white text-foreground px-6 py-3 font-medium hover:bg-white/90 transition-smooth focus-dashed"
            >
              How to install
            </button>
          </div>
        </div>
      </section>

      <Footer />
      <PWABanner />
    </div>
  );
}
