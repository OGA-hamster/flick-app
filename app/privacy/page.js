import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Flick",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen text-cream noise-texture pb-24">
      <nav className="max-w-2xl mx-auto flex items-center justify-between px-6 py-6">
        <Link href="/" className="font-display font-extrabold text-xl">
          flick<span className="text-lime">.</span>
        </Link>
        <Link href="/" className="text-sm text-cream/50 hover:text-cream">
          ← back
        </Link>
      </nav>

      <section className="max-w-2xl mx-auto px-6">
        <h1 className="font-display text-3xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-cream/40 text-sm mb-8 font-mono">Last updated: July 2026</p>

        <div className="space-y-6 text-cream/80 leading-relaxed">
          <p>
            Flick ("we," "us," "our") is a habit-building app. This page explains what
            information we collect, why, and how it's used.
          </p>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              What we collect
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Account info: email address and password (handled securely via Supabase Auth)</li>
              <li>Profile info you choose to add: username, name, bio, avatar, gender</li>
              <li>Activity data: streaks, check-ins, completed dares, mode selection</li>
              <li>Chat messages you send to Flick AI, used to generate replies and the optional "Mindset" summary on your profile</li>
              <li>Friend connections and requests you make</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              How we use it
            </h2>
            <p>
              We use your data to run core features: authentication, streaks, dares,
              friends, and the AI chat. Chat messages are sent to our AI provider (Groq)
              to generate responses — we don't sell this data or use it for advertising.
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              What we don't do
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>We don't sell your personal data to third parties</li>
              <li>We don't show ads or share your data with advertisers</li>
              <li>Other users can only see your username, avatar, mode, and streak — never your chats, email, or private info</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              Your controls
            </h2>
            <p>
              You can edit or clear your profile info, clear your "Mindset" summary, and
              delete chat history from your device at any time inside the app. To fully
              delete your account and data, contact us using the details below.
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              Third-party services we use
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Supabase — authentication and database storage</li>
              <li>Groq — AI chat processing</li>
              <li>Vercel — hosting</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              Changes to this policy
            </h2>
            <p>
              If this policy changes, we'll update this page and the "last updated" date
              above.
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              Contact
            </h2>
            <p>
              Questions about your data? Reach out at the contact info listed on our
              About page.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}