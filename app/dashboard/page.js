"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import TaskCard from "@/components/TaskCard";
import StreakBadge from "@/components/StreakBadge";
import RankBadge from "@/components/RankBadge";
import CheckinCard from "@/components/CheckinCard";
import CompleteProfileModal from "@/components/CompleteProfileModal";
import ProfileIcon from "@/components/ProfileIcon";
import { MODES, justRankedUp } from "@/lib/ranks";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [profile, setProfile] = useState({
    current_streak: 0,
    longest_streak: 0,
    mode: null,
    profile_completed: true,
    avatar_url: null,
  });
  const [userId, setUserId] = useState(null);
  const [checkinAnswer, setCheckinAnswer] = useState(null);
  const [justRanked, setJustRanked] = useState(false);
  const [skipRate, setSkipRate] = useState(null);
  const [refreshedIds, setRefreshedIds] = useState(new Set());
  const [refreshingId, setRefreshingId] = useState(null);

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
      .select("current_streak, longest_streak, mode, profile_completed, avatar_url")
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
      .select("task_id, completed, refreshed")
      .eq("user_id", user.id)
      .eq("assigned_date", today);
    const done = new Set(
      (assignments || []).filter((a) => a.completed).map((a) => a.task_id)
    );
    const refreshedSet = new Set(
      (assignments || []).filter((a) => a.refreshed).map((a) => a.task_id)
    );
    setTasks(taskRows || []);
    setCompletedIds(done);
    setRefreshedIds(refreshedSet);

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
      .select("current_streak, longest_streak, mode, profile_completed, avatar_url")
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
  }

  async function handleRefresh(taskId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setRefreshingId(taskId);
    const { data: newTask, error } = await supabase.rpc("refresh_task", {
      p_user_id: user.id,
      p_old_task_id: taskId,
    });

    if (!error && newTask) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? newTask : t)));
      setRefreshedIds((prev) => new Set(prev).add(newTask.id));
    }
    setRefreshingId(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const modeConfig = profile.mode ? MODES[profile.mode] : null;

  return (
    <main className="min-h-screen bg-plum text-cream noise-texture">
      {!loading && userId && !profile.profile_completed && (
        <CompleteProfileModal
          userId={userId}
          onComplete={() => setProfile((p) => ({ ...p, profile_completed: true }))}
        />
      )}

      <nav className="max-w-2xl mx-auto flex items-center justify-between px-6 py-6">
        <Link href="/" className="font-display font-extrabold text-xl">
          flick<span className="text-lime">.</span>
        </Link>
        <div className="flex items-center gap-4">
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
              Today's dares (optional)
            </h2>
            <p className="text-cream/50 text-sm mb-6">
              A few extra mental resets, if you want them.
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
                  onRefresh={handleRefresh}
                  refreshed={refreshedIds.has(task.id)}
                  refreshing={refreshingId === task.id}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {!loading && profile.profile_completed && (
        <ProfileIcon avatarUrl={profile.avatar_url} />
      )}
    </main>
  );
}