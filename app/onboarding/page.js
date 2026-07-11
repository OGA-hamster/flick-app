"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { MODES } from "@/lib/ranks";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pickMode(modeKey) {
    if (!userId) return;
    setSaving(true);
    await supabase.from("profiles").update({ mode: modeKey }).eq("id", userId);
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-plum text-cream noise-texture flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p className="font-mono text-xs tracking-widest text-coral mb-3 text-center">
          ONE QUICK THING
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-center mb-3">
          What are you tracking?
        </h1>
        <p className="text-cream/60 text-center mb-10">
          This decides your daily question and your rank titles.
        </p>

        <div className="space-y-4">
          {Object.entries(MODES).map(([key, mode]) => (
            <button
              key={key}
              onClick={() => pickMode(key)}
              disabled={saving}
              className="w-full flex items-center gap-4 bg-plum-light border-2 border-cream/10 hover:border-lime rounded-card px-6 py-5 text-left transition-colors disabled:opacity-50"
            >
              <span className="text-3xl">{mode.emoji}</span>
              <div>
                <div className="font-display font-bold text-lg">
                  {mode.label}
                </div>
                <div className="text-cream/50 text-sm">{mode.question}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
