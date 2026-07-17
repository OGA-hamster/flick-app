"use client";

import { useState } from "react";

export default function InviteButton({ username }) {
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://flick-app-silk.vercel.app/signup?ref=${encodeURIComponent(
    username || ""
  )}`;
  const shareText = `Join me on Flick — one dare a day, zero decisions. Let's keep each other honest 🔥`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Flick",
          text: shareText,
          url: inviteLink,
        });
      } catch (e) {
        // user cancelled share sheet, do nothing
      }
    } else {
      handleCopy();
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(`${shareText} ${inviteLink}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-white/5 border border-cream/10 rounded-2xl p-6 mb-6">
      <p className="font-display text-lg font-bold mb-1">Invite friends</p>
      <p className="text-cream/50 text-sm mb-4">
        Share your link — they pick who to send it to from their own contacts.
      </p>
      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 bg-lime text-plum rounded-xl py-3 font-bold"
        >
          Share invite link
        </button>
        <button
          onClick={handleCopy}
          className="px-4 border border-cream/20 text-cream/70 rounded-xl text-sm font-semibold hover:border-cream/40"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}