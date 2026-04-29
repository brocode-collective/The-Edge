"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome, Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      toast.error("Supabase is not configured. Add your project URL and anon key to .env.local.");
      return;
    }

    setLoading(true);

    try {
      const authResponse =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              },
            });

      if (authResponse.error) {
        toast.error(authResponse.error.message);
        return;
      }

      if (mode === "signup" && !authResponse.data.session) {
        toast.success("Account created. Check your email to confirm your sign up.");
        return;
      }

      toast.success("Signed in. Welcome to THE EDGE.");
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      toast.error("Supabase is not configured. Add your project URL and anon key to .env.local.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      {/* Left: branding */}
      <div className="hidden lg:flex flex-col hero-gradient p-12 text-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 grid place-items-center font-bold text-sm">E</div>
          <span className="font-bold tracking-tight text-lg">THE EDGE</span>
        </Link>
        <div className="flex-1 flex flex-col justify-center max-w-sm">
          <div className="text-5xl mb-6">🍛</div>
          <h2 className="text-4xl font-bold tracking-tight leading-tight mb-4">
            Campus food, sorted.
          </h2>
          <p className="text-white/80 leading-relaxed">
            Sign in to save your favorites, access your order history, and get personalized recommendations from your campus vendors.
          </p>
          <div className="mt-8 space-y-3 text-sm text-white/70">
            <div className="flex items-center gap-2">✓ Order history across all sessions</div>
            <div className="flex items-center gap-2">✓ Synced favorites and preferences</div>
            <div className="flex items-center gap-2">✓ One-tap reorder from past meals</div>
            <div className="flex items-center gap-2">✓ Guest mode also available — no login required</div>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="max-w-sm w-full mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-dashed transition-smooth mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl hero-gradient grid place-items-center text-white font-bold text-sm">E</div>
            <span className="font-bold tracking-tight text-lg">THE EDGE</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            {mode === "login"
              ? "Sign in to access your orders and favorites."
              : "Join THE EDGE and start ordering campus food."}
          </p>

          {/* Google */}
          <button
            id="google-auth-btn"
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-border bg-card py-3.5 font-medium text-sm hover:bg-secondary transition-smooth focus-dashed mb-4"
          >
            <Chrome className="w-5 h-5 text-primary" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="label-mono mb-2 block" htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:bg-background outline-none text-sm transition-smooth focus-dashed placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="label-mono mb-2 block" htmlFor="auth-password">Password</label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:bg-background outline-none text-sm transition-smooth focus-dashed placeholder:text-muted-foreground pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth focus-dashed"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="email-auth-btn"
              type="submit"
              disabled={loading}
              className="w-full pill bg-foreground text-background py-3.5 font-semibold hover:bg-foreground/90 transition-smooth focus-dashed disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  {mode === "login" ? "Sign in with email" : "Create account"}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:underline focus-dashed font-medium"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-smooth focus-dashed"
            >
              Continue as guest (no login required)
            </Link>
          </div>

          <p className="mt-8 text-[11px] text-muted-foreground text-center">
            Authentication powered by Supabase · Preferences and orders synced across devices
          </p>
        </div>
      </div>
    </div>
  );
}
