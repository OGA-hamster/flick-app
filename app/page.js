import Link from "next/link";

const sampleDares = [
  { emoji: "💬", title: "Text someone you miss", tag: "LOW EFFORT" },
  { emoji: "🥶", title: "Cold shower, 30 seconds", tag: "MID EFFORT" },
  { emoji: "🗨️", title: "Talk to a stranger, 60 sec", tag: "GO BIG" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-plum text-cream noise-texture">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 py-6">
        <span className="font-display font-extrabold text-xl tracking-tight">
          flick<span className="text-lime">.</span>
        </span>
        <div className="flex items-center gap-6">
          <Link
            href="/about"
            className="text-sm text-cream/70 hover:text-cream transition-colors"
          >
            About
          </Link>
          <Link
            href="/login"
            className="text-sm text-cream/70 hover:text-cream transition-colors"
          >
            Log in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-xs tracking-widest text-coral mb-5">
            NO FEED. NO CHOICES. JUST TODAY'S 3.
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-extrabold leading-[0.98] mb-6">
            You don't decide.
            <br />
            You just <span className="text-lime">flick.</span>
          </h1>
          <p className="text-cream/70 text-lg leading-relaxed mb-8 max-w-md">
            Every morning, Flick hands you exactly 3 tiny dares. No app to
            configure, no habit tracker to set up, no scrolling for what to
            do. Swipe, do it, done. Tomorrow it's different.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="bg-lime text-ink font-display font-bold px-8 py-4 rounded-full hover:scale-[1.03] active:scale-[0.98] transition-transform"
            >
              Get today's dares →
            </Link>
            <span className="font-mono text-xs text-cream/40">
              free · takes 20 seconds
            </span>
          </div>
        </div>

        {/* Signature element: stacked dare deck */}
        <div className="relative h-[420px] flex items-center justify-center">
          {sampleDares.map((d, i) => (
            <div
              key={d.title}
              className="absolute w-64 rounded-card bg-plum-light border-2 border-cream/10 p-6 noise-texture shadow-2xl"
              style={{
                transform: `rotate(${(i - 1) * 8}deg) translateY(${i * 18}px)`,
                zIndex: sampleDares.length - i,
              }}
            >
              <div className="font-mono text-[10px] tracking-widest text-coral mb-4">
                {d.tag}
              </div>
              <div className="text-4xl mb-3">{d.emoji}</div>
              <div className="font-display font-bold text-lg leading-snug">
                {d.title}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-cream/10">
        <h2 className="font-display text-3xl font-bold mb-12">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-10">
          {[
            {
              n: "①",
              t: "Open Flick",
              d: "3 dares, already picked for you. Nothing to configure.",
            },
            {
              n: "②",
              t: "Do one, or all three",
              d: "Small enough to finish before your coffee gets cold.",
            },
            {
              n: "③",
              t: "Keep the streak alive",
              d: "Tomorrow's dares are different. The deck never repeats for 3 weeks.",
            },
          ].map((s) => (
            <div key={s.t}>
              <div className="text-lime font-display text-2xl mb-3">{s.n}</div>
              <h3 className="font-display font-bold text-lg mb-2">{s.t}</h3>
              <p className="text-cream/60 text-sm leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-cream/10 text-center">
        <h2 className="font-display text-4xl font-extrabold mb-6 max-w-xl mx-auto">
          Stop deciding what to do today.
        </h2>
        <Link
          href="/signup"
          className="inline-block bg-coral text-ink font-display font-bold px-8 py-4 rounded-full hover:scale-[1.03] active:scale-[0.98] transition-transform"
        >
          Start my streak
        </Link>
      </section>

      <footer className="max-w-5xl mx-auto px-6 py-10 text-center font-mono text-xs text-cream/30">
        flick — one dare a day
      </footer>
    </main>
  );
}
