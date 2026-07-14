"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

const AVATAR_OPTIONS = ["😎", "🔥", "🚀", "🐉", "👾", "🦊", "🌙", "⚡"];

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
    description: "",
    gender: "",
    avatar_emoji: "😎",
  });
  const [error, setError] = useState("");

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

    const { data: prof } = await supabase
      .from("profiles")
      .select(
        "username, full_name, description, gender, avatar_emoji, mode, current_streak, longest_streak, is_premium, created_at, mindset_tag, mindset_note, mindset_updated_at"
      )
      .eq("id", user.id)
      .single();

    if (prof) {
      setProfile(prof);
      setForm({
        username: prof.username || "",
        full_name: prof.full_name || "",
        description: prof.description || "",
        gender: prof.gender || "",
        avatar_emoji: prof.avatar_emoji || "😎",
      });
    }

    setLoading(false);
  }

  async function handleSave() {
    if (!form.username || !form.full_name) {
      setError("Username and name are required.");
      return;
    }
    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: form.username,
        full_name: form.full_name,
        description: form.description,
        gender: form.gender || null,
        avatar_emoji: form.avatar_emoji,
      })
      .eq("id", userId);

    setSaving(false);

    if (updateError) {
      setError(
        updateError.message.includes("duplicate")
          ? "That username is taken."
          : updateError.message
      );
      return;
    }

    setProfile((p) => ({ ...p, ...form }));
    setEditing(false);
  }

  async function handleClearMindset() {
    await supabase
      .from("profiles")
      .update({ mindset_tag: null, mindset_note: null, mindset_updated_at: null })
      .eq("id", userId);
    setProfile((p) => ({ ...p, mindset_tag: null, mindset_note: null, mindset_updated_at: null }));
  }

  const inputStyle = {
    color: "#111827",
    backgroundColor: "#ffffff",
    WebkitTextFillColor: "#111827",
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-plum text-cream flex items-center justify-center">
        <p className="font-mono text-sm text-cream/40">Loading…</p>
      </main>
    );
  }

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-plum text-cream noise-texture pb-24">
      <nav className="max-w-2xl mx-auto flex items-center justify-between px-6 py-6">
        <Link href="/dashboard" className="font-display font-extrabold text-xl">
          flick<span className="text-lime">.</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-xs text-cream/60 hover:text-cream font-mono border border-cream/15 rounded-full px-3 py-2"
        >
          ← back
        </Link>
      </nav>

      <section className="max-w-2xl mx-auto px-6">
        {/* Header card */}
        <div className="bg-gradient-to-br from-purple-700 via-fuchsia-600 to-pink-500 rounded-3xl p-8 text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 mx-auto flex items-center justify-center text-4xl mb-3">
            {profile?.avatar_emoji || "😎"}
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            {profile?.full_name || "No name set"}
          </h1>
          <p className="text-white/80 text-sm">@{profile?.username || "username"}</p>
          {joinDate && (
            <p className="text-white/60 text-xs mt-1">Joined {joinDate}</p>
          )}
          {profile?.is_premium && (
            <span className="inline-block mt-3 bg-yellow-300 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
              ⭐ Premium
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 border border-cream/10 rounded-2xl p-4 text-center">
            <p className="text-3xl font-extrabold text-lime">{profile?.current_streak ?? 0}</p>
            <p className="text-xs text-cream/50 font-mono mt-1">current streak</p>
          </div>
          <div className="bg-white/5 border border-cream/10 rounded-2xl p-4 text-center">
            <p className="text-3xl font-extrabold text-lime">{profile?.longest_streak ?? 0}</p>
            <p className="text-xs text-cream/50 font-mono mt-1">longest streak</p>
          </div>
        </div>

        {/* Mindset card */}
        {profile?.mindset_tag && (
          <div className="bg-white/5 border border-cream/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-cream/40 font-mono uppercase">Your Mindset</p>
              <button
                onClick={handleClearMindset}
                className="text-xs text-cream/40 hover:text-coral"
              >
                clear
              </button>
            </div>
            <p className="text-lg font-bold text-lime mb-1">{profile.mindset_tag}</p>
            {profile.mindset_note && (
              <p className="text-cream/70 text-sm">{profile.mindset_note}</p>
            )}
            <p className="text-cream/30 text-xs mt-2 font-mono">
              Based on your recent chats with Flick AI
            </p>
          </div>
        )}

        {!editing ? (
          <>
            {/* View mode */}
            <div className="bg-white/5 border border-cream/10 rounded-2xl p-6 mb-6">
              <p className="text-xs text-cream/40 font-mono uppercase mb-1">Mode</p>
              <p className="mb-4 capitalize">{profile?.mode || "not set"}</p>

              <p className="text-xs text-cream/40 font-mono uppercase mb-1">About</p>
              <p className="mb-4 text-cream/80">
                {profile?.description || "No bio yet."}
              </p>

              <p className="text-xs text-cream/40 font-mono uppercase mb-1">Gender</p>
              <p className="capitalize">{profile?.gender || "Prefer not to say"}</p>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full bg-lime text-plum rounded-xl py-3 font-bold"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <>
            {/* Edit mode */}
            <div className="bg-white rounded-2xl p-6 mb-6">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                Avatar
              </label>
              <div className="flex justify-center gap-2 flex-wrap mb-5">
                {AVATAR_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, avatar_emoji: e }))}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                      form.avatar_emoji === e
                        ? "bg-fuchsia-100 scale-110 shadow ring-2 ring-fuchsia-400"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                autoComplete="off"
                style={inputStyle}
                className="w-full border border-gray-200 rounded-xl p-3 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              />

              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                Full name
              </label>
              <input
                type="text"
                autoComplete="off"
                style={inputStyle}
                className="w-full border border-gray-200 rounded-xl p-3 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              />

              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                About you
              </label>
              <textarea
                style={inputStyle}
                rows={3}
                className="w-full border border-gray-200 rounded-xl p-3 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 resize-none"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />

              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                Gender
              </label>
              <select
                style={inputStyle}
                className="w-full border border-gray-200 rounded-xl p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditing(false);
                  setError("");
                  setForm({
                    username: profile?.username || "",
                    full_name: profile?.full_name || "",
                    description: profile?.description || "",
                    gender: profile?.gender || "",
                    avatar_emoji: profile?.avatar_emoji || "😎",
                  });
                }}
                className="flex-1 bg-white/10 text-cream rounded-xl py-3 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-lime text-plum rounded-xl py-3 font-bold disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}