"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import { getRank, MODES } from "@/lib/ranks";

const EMOJI_OPTIONS = [
  "🙂", "😎", "🔥", "🚀", "🧠", "⚡",
  "🐋", "👻", "🎯", "🌱", "🦾", "🌙",
];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    bio: "",
    avatar_emoji: "🙂",
  });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserId(user.id);

    const { data } = await supabase
      .from("profiles")
      .select(
        "username, full_name, bio, avatar_emoji, mode, current_streak, longest_streak, created_at"
      )
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setForm({
        username: data.username || "",
        full_name: data.full_name || "",
        bio: data.bio || "",
        avatar_emoji: data.avatar_emoji || "🙂",
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        username: form.username.trim(),
        full_name: form.full_name.trim(),
        bio: form.bio.trim(),
        avatar_emoji: form.avatar_emoji,
      })
      .eq("id", userId);
    setSaving(false);
    if (!error) {
      setProfile((p) => ({ ...p, ...form }));
      setEditing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-plum text-cream noise-texture flex items-center justify-center">
        <p className="font-mono text-sm text-cream/40">Loading…</p>
      </main>
    );
  }

  const rank = profile?.mode ? getRank(profile.mode, profile.current_streak) : null;
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <main className="min-h-screen bg-plum text-cream noise-texture">
      <nav className="max-w-2xl mx-auto flex items-center justify-between px-6 py-6">
        <Link href="/dashboard" className="font-display font-extrabold text-xl">
          flick<span className="text-lime">.</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-cream/50 hover:text-cream">
          ← back
        </Link>
      </nav>

      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="bg-plum-light border-2 border-cream/10 rounded-card p-8 noise-texture">
          {!editing ? (
            <>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-lime/20 border-2 border-lime/40 flex items-center justify-center text-4xl">
                    {profile.avatar_emoji}
                  </div>
                  <div>
                    <h1 className="font-display font-bold text-2xl">
                      {profile.full_name || "Unnamed"}
                    </h1>
                    <p className="text-cream/50 text-sm">
                      @{profile.username || "no-username"}
                    </p>
                    <p className="font-mono text-[11px] text-cream/30 mt-1">
                      joined {joinDate}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="border border-cream/20 text-cream/70 text-sm font-display font-bold px-4 py-2 rounded-full hover:border-lime hover:text-lime transition-colors"
                >
                  Edit
                </button>
              </div>

              {profile.bio && (
                <p className="text-cream/70 leading-relaxed mb-6">{profile.bio}</p>
              )}

              <div className="grid grid-cols-3 gap-3 mb-2">
                <div className="bg-plum border border-cream/10 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="font-display font-bold text-lg">
                    {profile.current_streak}
                  </div>
                  <div className="font-mono text-[10px] text-cream/40">
                    current streak
                  </div>
                </div>
                <div className="bg-plum border border-cream/10 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="font-display font-bold text-lg">
                    {profile.longest_streak}
                  </div>
                  <div className="font-mono text-[10px] text-cream/40">
                    best streak
                  </div>
                </div>
                <div className="bg-plum border border-cream/10 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">{rank?.emoji || "—"}</div>
                  <div className="font-display font-bold text-xs leading-tight">
                    {rank?.title || "No mode set"}
                  </div>
                  <div className="font-mono text-[10px] text-cream/40 mt-1">
                    {profile.mode ? MODES[profile.mode]?.label : ""}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display font-bold text-2xl mb-6">
                Edit profile
              </h1>

              <div className="mb-6">
                <label className="block font-mono text-xs text-cream/50 mb-3">
                  AVATAR — QUICK PICK
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setForm((f) => ({ ...f, avatar_emoji: emoji }))}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-colors ${
                        form.avatar_emoji === emoji
                          ? "border-lime bg-lime/20"
                          : "border-cream/10 hover:border-cream/30"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <label className="block font-mono text-xs text-cream/50 mb-2">
                  OR TYPE ANY EMOJI
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={form.avatar_emoji}
                    onChange={(e) => {
                      // keep only the first emoji/grapheme the person enters
                      const chars = Array.from(e.target.value);
                      setForm((f) => ({
                        ...f,
                        avatar_emoji: chars.length ? chars[chars.length - 1] : "",
                      }));
                    }}
                    className="w-16 h-16 text-3xl text-center bg-plum border border-cream/15 rounded-2xl focus:border-lime outline-none"
                  />
                  <p className="text-cream/40 text-xs leading-snug">
                    Tap here, then open your keyboard's emoji picker —
                    <br className="hidden sm:block" />
                    on phones: the 😀 icon on your keyboard.
                    <br className="hidden sm:block" />
                    On Windows: press <span className="text-cream/60">Win + .</span>
                    <br className="hidden sm:block" />
                    On Mac: press <span className="text-cream/60">Cmd + Ctrl + Space</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block font-mono text-xs text-cream/50 mb-2">
                    NAME
                  </label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, full_name: e.target.value }))
                    }
                    className="w-full bg-plum border border-cream/15 rounded-xl px-4 py-3 text-cream placeholder:text-cream/30 focus:border-lime outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-cream/50 mb-2">
                    USERNAME
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, username: e.target.value }))
                    }
                    className="w-full bg-plum border border-cream/15 rounded-xl px-4 py-3 text-cream placeholder:text-cream/30 focus:border-lime outline-none"
                    placeholder="username"
                  />
                  <p className="font-mono text-[10px] text-cream/30 mt-1">
                    Friends add you using this
                  </p>
                </div>
                <div>
                  <label className="block font-mono text-xs text-cream/50 mb-2">
                    BIO
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    rows={3}
                    maxLength={160}
                    className="w-full bg-plum border border-cream/15 rounded-xl px-4 py-3 text-cream placeholder:text-cream/30 focus:border-lime outline-none resize-none"
                    placeholder="A short line about you"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-lime text-ink font-display font-bold py-3 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-6 border border-cream/20 text-cream/60 font-display font-bold rounded-full"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
