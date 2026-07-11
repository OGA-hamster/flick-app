"use client";

const difficultyLabel = {
  easy: "LOW EFFORT",
  medium: "MID EFFORT",
  hard: "GO BIG",
};

export default function TaskCard({ task, index, total, onComplete, completed, justSwapped }) {
  return (
    <div
      className={`relative w-full rounded-card p-8 sm:p-10 border-2 transition-all duration-500 ${
        completed
          ? "bg-plum-light/40 border-lime/30"
          : justSwapped
          ? "bg-plum-light border-lime/40 scale-[1.01]"
          : "bg-plum-light border-cream/10"
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

      <button
        onClick={() => onComplete(task.id)}
        disabled={completed}
        className={`w-full rounded-full py-4 font-display font-bold text-sm tracking-wide transition-all ${
          completed
            ? "bg-transparent border-2 border-lime/40 text-lime/70 cursor-default"
            : "bg-lime text-ink hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        {completed ? "✓ Flicked — next one loading" : "Mark it done"}
      </button>
    </div>
  );
}
