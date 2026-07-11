"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import TaskCard from "@/components/TaskCard";
import StreakBadge from "@/components/StreakBadge";
import RankBadge from "@/components/RankBadge";
import CheckinCard from "@/components/CheckinCard";
import ProfileIcon from "@/components/ProfileIcon";
import { MODES, justRankedUp } from "@/lib/ranks";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [swappedId, setSwappedId] = useState(null);
  const [profile, setProfile] = useState({
    current_streak: 0,
    longest_streak: 0,
    mode: null,
  });
  const [checkinAnswer, setCheckinAnswer] = useState(null);
  const [justRanked, setJustRanked] = useState(false);
  const [skipRate, setSkipRate] = useState(null);

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

    const { data: prof } = await supabase
      .from("profiles")
      .select("current_streak, longest_streak, mode, avatar_emoji")
      .eq("id", user.id)
      .single();

    if (!prof?.mode) {
      router.push("/onboarding");
      return;
    }
    setProfile(prof);

    const today = new Date().toISOString().slice(0, 10);

    const { data: checkin } = await supabase
      .from("checkins")
      .select("followed_plan")
      .eq("user_id", user.id)
      .eq("checkin_date", today)
      .maybeSingle();
    setCheckinAnswer(checkin ? checkin.followed_plan : null);

    const { data: rate } = await supabase.rpc("get_today_skip_rate");
    setSkipRate(rate !== null ? Number(rate) : null);

    const { data: taskRows } = await supabase.rpc("get_daily_tasks", {
      p_user_id: user.id,
    });
    const { data: assignments } = await supabase
      .from("daily_assignments")
      .select("task_id, completed")
      .eq("user_id", user.id)
      .eq("assigned_date", today);
    const done = new Set(
      (assignments || []).filter((a) => a.completed).map((a) => a.task_id)
    );
    setTasks(taskRows || []);
    setCompletedIds(done);

    setLoading(false);
  }

  async function handleCheckin(followedPlan) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const streakBefore = profile.current_streak;
    setCheckinAnswer(followedPlan);

    await supabase.rpc("record_checkin", {
      p_user_id: user.id,
      p_followed_plan: followedPlan,
    });

    const { data: prof } = await supabase
      .from("profiles")
      .select("current_streak, longest_streak, mode, avatar_emoji")
      .eq("id", user.id)
      .single();
    if (prof) {
      setProfile(prof);
      if (prof.current_streak > streakBefore && justRankedUp(prof.mode, prof.current_streak)) {
        setJustRanked(true);
        setTimeout(() => setJustRanked(false), 2500);
      }
    }
  }

  // Mark a dare done, then immediately swap in a brand new one
  // in its place — so the list never runs dry and never needs
  // a manual refresh button.
  async function handleComplete(taskId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setCompletedIds((prev) => new Set(prev).add(taskId));
    await supabase.rpc("complete_task", {
      p_user_id: user.id,
      p_task_id: taskId,
    });

    // brief pause so the person sees the "done" state before it swaps
    setTimeout(async () => {
      const { data: nextTask } = await supabase.rpc("get_next_task", {
        p_user_id: user.id,
      });
      if (nextTask) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? nextTask : t)));
        setCompletedIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
        setSwappedId(nextTask.id);
        setTimeout(() => setSwappedId(null), 1200);
      }
    }, 900);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const modeConfig = profile.mode ? MODES[profile.mode] : null;

  return (
    <main className="min-h-screen bg-plum text-cream noise-texture">
      <nav className="max-w-2xl mx-auto flex items-center justify-between px-6 py-6">
        <Link href="/" className="font-display font-extrabold text-xl">
          flick<span className="text-lime">.</span>
        </Link>
        <div className="flex items-center gap-4">
          <ProfileIcon emoji={profile.avatar_emoji} />
          <Link
            href="/friends"
            className="text-xs text-cream/60 hover:text-cream font-mono border border-cream/15 rounded-full px-3 py-2"
          >
            👥 friends
          </Link>
          <StreakBadge current={profile.current_streak} longest={profile.longest_streak} />
          <button
            onClick={handleLogout}
            className="text-xs text-cream/40 hover:text-cream/70 font-mono"
          >
            log out
          </button>
        </div>
      </nav>

      <section className="max-w-2xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="font-mono text-sm text-cream/40 mt-10">Loading…</div>
        ) : (
          <>
            <div className="mt-4 mb-6">
              <RankBadge mode={profile.mode} streak={profile.current_streak} justRanked={justRanked} />
            </div>

            <div className="mb-10">
              <CheckinCard
                question={modeConfig?.question || "Did you follow your plan today?"}
                onAnswer={handleCheckin}
                answered={checkinAnswer}
                skipRate={skipRate}
              />
            </div>

            <h2 className="font-display text-xl font-bold mb-2">
              Dares
            </h2>
            <p className="text-cream/50 text-sm mb-6">
              Finish one, a new one takes its place. Keep going as long as you want.
            </p>
            <div className="space-y-6">
              {tasks.map((task, i) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={i}
                  total={tasks.length}
                  completed={completedIds.has(task.id)}
                  onComplete={handleComplete}
                  justSwapped={swappedId === task.id}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
