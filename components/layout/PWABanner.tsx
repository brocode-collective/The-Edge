"use client";

import { useState } from "react";
import { Smartphone, X } from "lucide-react";

export const PWABanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[340px] z-50 animate-slide-in-right">
      <div className="bg-card border border-border rounded-3xl p-4 shadow-elevated flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl hero-gradient grid place-items-center text-white shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm tracking-tight">Install THE EDGE</div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Add to home screen for one-tap ordering. No app store needed.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="w-7 h-7 rounded-full grid place-items-center hover:bg-secondary transition-smooth focus-dashed shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
