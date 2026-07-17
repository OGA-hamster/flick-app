import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Flick",
};

export default function TermsPage() {
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
        <h1 className="font-display text-3xl font-extrabold mb-2">Terms of Service</h1>
        <p className="text-cream/40 text-sm mb-8 font-mono">Last updated: July 2026</p>

        <div className="space-y-6 text-cream/80 leading-relaxed">
          <p>
            By using Flick, you agree to these terms. If you don't agree, please don't
            use the app.
          </p>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              What Flick is
            </h2>
            <p>
              Flick is a habit-building and accountability app. It provides daily
              check-ins, tasks ("dares"), streaks, an AI chat assistant, and a friends
              system. Flick is for motivation and habit-tracking purposes only — it is
              not medical, psychological, or professional advice of any kind.
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              Your account
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>You must provide accurate information when signing up</li>
              <li>You're responsible for keeping your login credentials secure</li>
              <li>You must be old enough to legally use this app in your country</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              Acceptable use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Harass, abuse, or impersonate other users</li>
              <li>Use the AI chat to generate harmful, illegal, or abusive content</li>
              <li>Attempt to disrupt, hack, or misuse the app or its infrastructure</li>
              <li>Create fake accounts or manipulate streaks/rankings dishonestly</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              AI chat disclaimer
            </h2>
            <p>
              Flick AI is an automated assistant and can make mistakes. It is not a
              substitute for professional advice (medical, mental health, financial, or
              legal). If you're going through a difficult time, please reach out to a
              qualified professional or a trusted person in your life.
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              Premium features
            </h2>
            <p>
              Some features may be marked as "Premium." At this time, premium access is
              managed manually and is not tied to an active payment system. This may
              change in the future, and this page will be updated accordingly.
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              Changes and termination
            </h2>
            <p>
              We may update these terms, modify features, or suspend accounts that
              violate these terms, at our discretion. We'll try to give notice of major
              changes where possible.
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              Limitation of liability
            </h2>
            <p>
              Flick is provided "as is" without warranties of any kind. We're not liable
              for any damages resulting from your use of the app, to the fullest extent
              permitted by law.
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-cream mb-2">
              Contact
            </h2>
            <p>
              Questions about these terms? Reach out at the contact info listed on our
              About page.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}