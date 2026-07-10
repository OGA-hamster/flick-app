"use client";

import { useEffect, useState } from "react";
import { getRank, getNextRank } from "@/lib/ranks";

export default function RankBadge({ mode, streak, justRanked }) {
  const rank = getRank(mode, streak);
  const next = getNextRank(mode, streak);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (justRanked) {
      setShowFlash(true);
      const t = setTimeout(() => setShowFlash(false), 2200);
      return () => clearTimeout(t);
    }
  }, [justRanked]);

  return (
    <div className="relative">
      {showFlash && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap bg-lime text-ink font-display font-bold text-sm px-4 py-2 rounded-full animate-bounce shadow-xl z-10">
          🎉 Rank up! {rank.title}
        </div>
      )}
      <div
        className={`flex items-center gap-3 bg-plum-light border-2 rounded-card px-5 py-4 transition-all ${
          showFlash ? "border-lime scale-105" : "border-cream/10"
        }`}
      >
        <span className="text-3xl">{rank.emoji}</span>
        <div>
          <div className="font-display font-bold leading-tight">
            {rank.title}
          </div>
          <div className="font-mono text-[11px] text-cream/40">
            {next
              ? `${next.min - streak} days to ${next.title}`
              : "max rank reached"}
          </div>
        </div>
      </div>
    </div>
  );
}
