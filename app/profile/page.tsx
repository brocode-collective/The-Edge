"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, Bell, Shield, LogOut, ChevronRight, Moon, Sun, 
  ArrowLeft, Share2, BadgeCheck, PencilLine, CreditCard, 
  MapPin, Heart, ShoppingBag, HelpCircle, MessageSquare,
  Globe
} from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { label: "Orders", value: "24" },
    { label: "Favorites", value: "12" },
    { label: "Points", value: "850" },
  ];

  const settingsGroups = [
    {
      items: [
        { icon: Bell, label: "Notifications", href: "#" },
        { icon: Shield, label: "Privacy & Security", href: "#" },
        { icon: CreditCard, label: "Payment Methods", href: "#" },
        { icon: MapPin, label: "Saved Addresses", href: "#" },
      ]
    },
    {
      items: [
        { icon: HelpCircle, label: "FAQs", href: "#" },
        { icon: MessageSquare, label: "Support", href: "#" },
        { icon: Globe, label: "Language", href: "#", extra: "English" },
      ]
    }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-background pb-24">
      {/* ── TOP BAR ── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 grid place-items-center rounded-full hover:bg-secondary transition-smooth"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">My Profile</h1>
          <button className="w-10 h-10 grid place-items-center rounded-full hover:bg-secondary transition-smooth">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-8 max-w-xl">
        {/* ── PROFILE INFO ── */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-card shadow-elevated">
              <img 
                src="/.gemini/antigravity/brain/b9fca522-bb8c-4e54-9693-4aada2c43583/profile_avatar_1777577606476.png" 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-1 right-1 bg-white dark:bg-card rounded-full p-0.5">
              <BadgeCheck className="w-7 h-7 text-primary fill-primary/10" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Sarah Jenkins</h2>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Student • Faculty of Engineering</p>
        </div>

        {/* ── STATS CARD ── */}
        <div className="hero-gradient rounded-3xl p-6 mb-4 shadow-pop grid grid-cols-3 gap-4 text-white text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── EDIT BUTTON ── */}
        <button className="w-full py-4 bg-white dark:bg-card border border-border shadow-soft rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-secondary transition-smooth mb-8">
          <PencilLine className="w-4 h-4" />
          Edit Profile
        </button>

        {/* ── SETTINGS ── */}
        <div className="space-y-6">
          <section>
            <h3 className="label-mono mb-3 ml-2">Appearance</h3>
            <div className="bg-white dark:bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary grid place-items-center">
                    {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <div className="font-semibold text-[15px]">Dark Mode</div>
                    <div className="text-[11px] text-muted-foreground font-medium">Automatic night theme</div>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </section>

          {settingsGroups.map((group, gIdx) => (
            <section key={gIdx}>
              <div className="bg-white dark:bg-card border border-border rounded-3xl overflow-hidden shadow-soft">
                {group.items.map((item, iIdx) => (
                  <button 
                    key={item.label}
                    className={`w-full flex items-center justify-between p-4 hover:bg-secondary transition-smooth ${
                      iIdx !== group.items.length - 1 ? "border-b border-border/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/50 grid place-items-center">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="font-semibold text-[15px]">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.extra && <span className="text-xs text-muted-foreground font-medium">{item.extra}</span>}
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}

          <button className="w-full flex items-center justify-center gap-2 py-4 text-destructive font-bold hover:bg-destructive/5 rounded-2xl transition-smooth">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}
