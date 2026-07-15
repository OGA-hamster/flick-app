"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen  text-cream noise-texture flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display font-extrabold text-xl">
          flick<span className="text-lime">.</span>
        </Link>
        <h1 className="font-display text-3xl font-bold mt-8 mb-2">
          Welcome back
        </h1>
        <p className="text-cream/60 text-sm mb-8">
          Your streak is waiting on you.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-cream/50 mb-2">
              EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-xl border border-cream/15 rounded-xl px-4 py-3 text-cream placeholder:text-cream/30 focus:border-lime outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-cream/50 mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-xl border border-cream/15 rounded-xl px-4 py-3 text-cream placeholder:text-cream/30 focus:border-lime outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-coral text-sm font-mono">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime text-ink font-display font-bold py-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-center text-cream/50 text-sm mt-6">
          New here?{" "}
          <Link href="/signup" className="text-lime">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
