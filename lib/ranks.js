export const MODES = {
  trader: {
    label: "Trader",
    emoji: "📈",
    question: "Did you follow your trading plan today?",
    ranks: [
      { min: 0, title: "Paper Hands", emoji: "📄" },
      { min: 3, title: "Nervous Nibbler", emoji: "😬" },
      { min: 7, title: "Iron Hands", emoji: "🔩" },
      { min: 14, title: "Market Ghost", emoji: "👻" },
      { min: 30, title: "Whale Mode", emoji: "🐋" },
    ],
  },
  founder: {
    label: "Founder",
    emoji: "🚀",
    question: "Did you follow your plan for the business today?",
    ranks: [
      { min: 0, title: "Dreamer", emoji: "💭" },
      { min: 3, title: "Idea Hoarder", emoji: "🗂️" },
      { min: 7, title: "Builder", emoji: "🔨" },
      { min: 14, title: "Ship Machine", emoji: "🚢" },
      { min: 30, title: "Empire Mode", emoji: "🏰" },
    ],
  },
  daily_life: {
    label: "Daily Life",
    emoji: "🌤️",
    question: "Did you follow your plan for today?",
    ranks: [
      { min: 0, title: "Snoozer", emoji: "😴" },
      { min: 3, title: "Half-Awake", emoji: "🥱" },
      { min: 7, title: "Consistent", emoji: "🧱" },
      { min: 14, title: "Locked In", emoji: "🔒" },
      { min: 30, title: "Unstoppable", emoji: "⚡" },
    ],
  },
};

// Returns the current rank object for a given mode + streak.
export function getRank(mode, streak) {
  const config = MODES[mode] || MODES.daily_life;
  const ranks = config.ranks;
  let current = ranks[0];
  for (const r of ranks) {
    if (streak >= r.min) current = r;
  }
  return current;
}

// Returns the next rank (or null if already at max) — used to show
// "3 days to Iron Hands" style progress.
export function getNextRank(mode, streak) {
  const config = MODES[mode] || MODES.daily_life;
  const ranks = config.ranks;
  for (const r of ranks) {
    if (streak < r.min) return r;
  }
  return null;
}

// True if this streak count is exactly the threshold for a new rank —
// used to trigger the rank-up animation right when it happens.
export function justRankedUp(mode, streak) {
  const config = MODES[mode] || MODES.daily_life;
  return config.ranks.some((r) => r.min === streak && streak > 0);
}
