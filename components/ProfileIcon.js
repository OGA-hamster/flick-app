"use client";

import Link from "next/link";

export default function ProfileIcon({ emoji }) {
  return (
    <Link
      href="/profile"
      className="w-9 h-9 rounded-full bg-plum-light border border-cream/20 flex items-center justify-center text-lg hover:border-lime transition-colors shrink-0"
      title="Your profile"
    >
      {emoji || "🙂"}
    </Link>
  );
}
