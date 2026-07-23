"use client";

import * as React from "react";
import { ProfileIcon } from "@/components/ui/NavIcons";

/**
 * Standard Profile Avatar component.
 */
export function ProfileAvatar({ className = "" }: { className?: string; iconSize?: number }) {
  return (
    <div
      className={`relative flex items-center justify-center profile-avatar overflow-hidden ${className}`}
    >
      <ProfileIcon filled className="w-full h-full text-foreground" />
    </div>
  );
}
