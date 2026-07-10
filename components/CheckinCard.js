"use client";

export default function CheckinCard({ question, onAnswer, answered, skipRate }) {
  if (answered !== null) {
    return (
      <div className="bg-plum-light border-2 border-lime/30 rounded-card p-8 text-center noise-texture">
        <div className="text-4xl mb-3">{answered ? "✅" : "🫡"}</div>
        <p className="font-display font-bold text-lg">
          {answered
            ? "Logged. You followed your plan today."
            : "Logged. Honesty over perfection — see you tomorrow."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-plum-light border-2 border-cream/10 rounded-card p-8 text-center noise-texture">
      <p className="font-mono text-xs tracking-widest text-coral mb-4">
        ONE TAP · NO TYPING
      </p>
      <h2 className="font-display text-2xl font-bold mb-8">{question}</h2>
      <div className="flex gap-4">
        <button
          onClick={() => onAnswer(true)}
          className="flex-1 bg-lime text-ink font-display font-bold py-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          Yes
        </button>
        <button
          onClick={() => onAnswer(false)}
          className="flex-1 bg-transparent border-2 border-cream/20 text-cream font-display font-bold py-4 rounded-full hover:border-coral hover:text-coral transition-colors"
        >
          No
        </button>
      </div>
      {skipRate !== null && (
        <p className="font-mono text-[11px] text-cream/30 mt-5">
          {skipRate}% of people also skipped today — no shame, just data.
        </p>
      )}
    </div>
  );
}
