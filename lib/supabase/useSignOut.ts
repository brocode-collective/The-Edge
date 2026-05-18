"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useSignOut(redirectTo = "/auth") {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = useCallback(async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    const supabase = getSupabaseBrowserClient();

    try {
      await supabase?.auth.signOut();
    } finally {
      queryClient.clear();
      router.replace(redirectTo);
      router.refresh();
      setIsSigningOut(false);
    }
  }, [isSigningOut, queryClient, redirectTo, router]);

  return { signOut, isSigningOut };
}
