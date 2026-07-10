"use client";

export default function StreakBadge({ current, longest }) {
  return (
    <div className="flex items-center gap-4 font-mono">
      <div className="flex items-center gap-2 bg-plum-light border border-cream/10 rounded-full px-4 py-2">
        <span className="text-lg">🔥</span>
        <span className="text-sm text-cream/90">
          <strong className="text-lime">{current}</strong> day streak
        </span>
      </div>
      <div className="hidden sm:block text-xs text-cream/40">
        best: {longest}
      </div>
    </div>
  );
}
