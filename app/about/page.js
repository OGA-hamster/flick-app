import Link from "next/link";
export default function AboutPage() {
  return (
    <main className="min-h-screen  text-cream noise-texture">
      <nav className="max-w-3xl mx-auto flex items-center justify-between px-6 py-6">
        <Link href="/" className="font-display font-extrabold text-xl">
          flick<span className="text-lime">.</span>
        </Link>
        <Link
          href="/signup"
          className="text-sm text-cream/70 hover:text-cream transition-colors"
        >
          Get started
        </Link>
      </nav>
      <section className="max-w-2xl mx-auto px-6 py-16">
        <p className="font-mono text-xs tracking-widest text-coral mb-4">
          WHY FLICK EXISTS
        </p>
        <h1 className="font-display text-4xl font-extrabold mb-8 leading-tight">
          Too many choices, not enough follow-through.
        </h1>
        <p className="text-cream/70 leading-relaxed mb-6">
          {/* EDIT ME: replace with your own story — why you built this,
              what problem you kept running into, what changed */}
          Flick started from a simple frustration: knowing exactly what to
          do, and still not doing it — because there were 20 other things
          competing for the decision. Not a motivation problem. A decision
          problem.
        </p>
        <p className="text-cream/70 leading-relaxed mb-6">
          {/* EDIT ME */}
          So the idea became: remove the choice entirely. Give people one
          honest question a day, one small task, and let the streak do the
          rest. No dashboards to configure, no habits to design from
          scratch — just show up and answer honestly.
        </p>
        <div className="border-t border-cream/10 my-12" />
        <p className="font-mono text-xs tracking-widest text-coral mb-4">
          FOUNDER
        </p>
        <div className="mb-6">
          <img
            src="/founder.jpg"
            alt="Parth Chaudhari"
            className="w-28 h-28 rounded-full object-cover border-2 border-lime/40 mb-5"
          />
          <div>
            <h2 className="font-display font-bold text-xl mb-1 tracking-wide">
              PARTH CHAUDHARI
            </h2>
            <p className="text-cream/50 text-sm mb-3">
              17-year-old founder · trader · web creator · entrepreneur
            </p>
            <p className="text-cream/70 leading-relaxed">
              I'm 17, and I build things end-to-end — from the idea to the
              interface to the database behind it. Before Flick, I spent
              time trading forex, crypto, and futures, which is where the
              core idea for this app actually came from: the gap between
              knowing your plan and actually following it isn't a
              willpower problem, it's a decision problem. Flick is my
              attempt to close that gap — for traders, for founders, and
              for anyone trying to be a little more consistent with
              themselves.
            </p>
          </div>
        </div>
        <div className="border-t border-cream/10 my-12" />
        <Link
          href="/signup"
          className="inline-block bg-lime text-ink font-display font-bold px-8 py-4 rounded-full hover:scale-[1.03] active:scale-[0.98] transition-transform"
        >
          Try today's dares →
        </Link>
        <div className="border-t border-cream/10 my-12" />
        <div className="flex gap-6 text-xs text-cream/40 font-mono">
          <Link href="/privacy" className="hover:text-cream/70">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-cream/70">
            Terms of Service
          </Link>
        </div>
      </section>
    </main>
  );
}