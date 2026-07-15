"use client";

const difficultyLabel = {
  easy: "LOW EFFORT",
  medium: "MID EFFORT",
  hard: "GO BIG",
};

export default function TaskCard({ task, index, total, onComplete, completed, onRefresh, refreshed, refreshing }) {
  return (
    <div
      className={`relative w-full rounded-card p-8 sm:p-10 border-2 backdrop-blur-xl transition-colors ${
        completed
          ? "bg-white/5 border-lime/30"
          : "bg-white/10 border-cream/10"
      } noise-texture`}
    >
      <div className="flex items-center justify-between font-mono text-xs tracking-widest text-cream/50 mb-6">
        <span>DARE {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <span className={completed ? "text-lime" : "text-coral"}>
          {completed ? "DONE" : difficultyLabel[task.difficulty] || "TASK"}
        </span>
      </div>

      <div className="text-5xl mb-5">{task.emoji}</div>

      <h3 className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-3">
        {task.title}
      </h3>
      <p className="text-cream/70 leading-relaxed mb-8">{task.description}</p>

      <div className="flex gap-3">
        <button
          onClick={() => onComplete(task.id)}
          disabled={completed}
          className={`flex-1 rounded-full py-4 font-display font-bold text-sm tracking-wide transition-all ${
            completed
              ? "bg-transparent border-2 border-lime/40 text-lime/70 cursor-default"
              : "bg-lime text-ink hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {completed ? "✓ Flicked" : "Mark it done"}
        </button>

        {!completed && onRefresh && (
          <button
            onClick={() => onRefresh(task.id)}
            disabled={refreshed || refreshing}
            title={refreshed ? "Already used your refresh on this dare today" : "Not feeling this one? Swap it once"}
            className={`shrink-0 w-14 rounded-full border-2 flex items-center justify-center transition-all ${
              refreshed
                ? "border-cream/10 text-cream/20 cursor-default"
                : "border-cream/20 text-cream/70 hover:border-coral hover:text-coral"
            } ${refreshing ? "animate-spin" : ""}`}
          >
            ⟳
          </button>
        )}
      </div>
      {!completed && onRefresh && !refreshed && (
        <p className="font-mono text-[10px] text-cream/30 mt-3 text-right">
          1 refresh available today
        </p>
      )}
    </div>
  );
}