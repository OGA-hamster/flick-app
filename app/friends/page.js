"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import { getRank } from "@/lib/ranks";
import InviteButton from "@/components/InviteButton";

export default function FriendsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState(null);
  const [myUsername, setMyUsername] = useState("");
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [addingId, setAddingId] = useState(null);

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
      .select("username")
      .eq("id", user.id)
      .single();
    setMyUsername(prof?.username || "");

    const { data } = await supabase.rpc("get_friends", { p_user_id: user.id });
    setFriends(data || []);

    const { data: sugg } = await supabase.rpc("get_friend_suggestions", {
      p_user_id: user.id,
      p_limit: 5,
    });
    setSuggestions(sugg || []);

    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!username.trim() || !userId) return;
    setSending(true);
    setMessage("");

    const { error } = await supabase.rpc("send_friend_request", {
      p_user_id: userId,
      p_target_username: username.trim(),
    });

    setSending(false);
    if (error) {
      setMessage(error.message.replace(/^.*: /, ""));
    } else {
      setMessage(`Request sent to @${username.trim()}`);
      setUsername("");
      load();
    }
  }

  async function handleAddSuggestion(targetUsername, targetId) {
    setAddingId(targetId);
    const { error } = await supabase.rpc("send_friend_request", {
      p_user_id: userId,
      p_target_username: targetUsername,
    });
    setAddingId(null);
    if (!error) {
      setSuggestions((prev) => prev.filter((s) => s.id !== targetId));
      load();
    }
  }

  async function handleRespond(friendshipId, accept) {
    await supabase.rpc("respond_friend_request", {
      p_user_id: userId,
      p_friendship_id: friendshipId,
      p_accept: accept,
    });
    load();
  }

  const incoming = friends.filter((f) => f.is_incoming);
  const outgoing = friends.filter((f) => f.status === "pending" && !f.is_incoming);
  const accepted = friends.filter((f) => f.status === "accepted");

  return (
    <main className="min-h-screen text-cream noise-texture">
      <nav className="max-w-2xl mx-auto flex items-center justify-between px-6 py-6">
        <Link href="/dashboard" className="font-display font-extrabold text-xl">
          flick<span className="text-lime">.</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-cream/50 hover:text-cream">
          ← back
        </Link>
      </nav>

      <section className="max-w-2xl mx-auto px-6 pb-24">
        <h1 className="font-display text-3xl font-extrabold mt-4 mb-2">
          Friends
        </h1>
        <p className="text-cream/60 mb-8">
          Add friends by username to compare streaks and keep each other honest.
        </p>

        <InviteButton username={myUsername} />

        <form onSubmit={handleAdd} className="flex gap-3 mb-6">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter a username"
            className="flex-1 bg-plum-light border border-cream/15 rounded-full px-5 py-3 text-cream placeholder:text-cream/30 focus:border-lime outline-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="bg-lime text-ink font-display font-bold px-6 py-3 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            Add
          </button>
        </form>
        {message && (
          <p className="font-mono text-xs text-coral mb-8">{message}</p>
        )}

        {loading ? (
          <div className="font-mono text-sm text-cream/40">Loading…</div>
        ) : (
          <>
            {suggestions.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display font-bold text-lg mb-4">
                  People you might know
                </h2>
                <div className="space-y-3">
                  {suggestions.map((s) => {
                    const rank = getRank(s.mode, s.current_streak);
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between bg-plum-light border border-cream/10 rounded-card px-5 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{rank.emoji}</span>
                          <div>
                            <div className="font-display font-bold">
                              @{s.username}
                            </div>
                            <div className="font-mono text-[11px] text-cream/40">
                              🔥 {s.current_streak} streak
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddSuggestion(s.username, s.id)}
                          disabled={addingId === s.id}
                          className="bg-lime/20 text-lime border border-lime/40 font-display font-bold text-sm px-4 py-2 rounded-full hover:bg-lime hover:text-ink transition disabled:opacity-50"
                        >
                          {addingId === s.id ? "..." : "+ Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {incoming.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display font-bold text-lg mb-4">
                  Friend requests
                </h2>
                <div className="space-y-3">
                  {incoming.map((f) => (
                    <div
                      key={f.friendship_id}
                      className="flex items-center justify-between bg-plum-light border border-cream/10 rounded-card px-5 py-4"
                    >
                      <span className="font-display font-bold">
                        @{f.username}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(f.friendship_id, true)}
                          className="bg-lime text-ink font-display font-bold text-sm px-4 py-2 rounded-full"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespond(f.friendship_id, false)}
                          className="border border-cream/20 text-cream/60 font-display font-bold text-sm px-4 py-2 rounded-full"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="font-display font-bold text-lg mb-4">
                Your friends
              </h2>
              {accepted.length === 0 ? (
                <p className="text-cream/40 text-sm">
                  No friends yet — add someone above to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {accepted
                    .sort((a, b) => b.current_streak - a.current_streak)
                    .map((f) => {
                      const rank = getRank(f.mode, f.current_streak);
                      return (
                        <div
                          key={f.friendship_id}
                          className="flex items-center justify-between bg-plum-light border border-cream/10 rounded-card px-5 py-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{rank.emoji}</span>
                            <div>
                              <div className="font-display font-bold">
                                @{f.username}
                              </div>
                              <div className="font-mono text-[11px] text-cream/40">
                                {rank.title}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-sm">
                            <span>🔥</span>
                            <span className="text-lime font-bold">
                              {f.current_streak}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {outgoing.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display font-bold text-lg mb-4">
                  Pending
                </h2>
                <div className="space-y-3">
                  {outgoing.map((f) => (
                    <div
                      key={f.friendship_id}
                      className="flex items-center justify-between bg-plum-light/50 border border-cream/10 rounded-card px-5 py-4"
                    >
                      <span className="font-display font-bold text-cream/60">
                        @{f.username}
                      </span>
                      <span className="font-mono text-xs text-cream/30">
                        requested
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}