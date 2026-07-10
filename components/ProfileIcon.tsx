'use client';
import Link from 'next/link';

export default function ProfileIcon({ avatarUrl }) {
  return (
    <Link
      href="/profile"
      className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-black shadow-lg flex items-center justify-center z-40 overflow-hidden"
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <span className="text-white text-xl">👤</span>
      )}
    </Link>
  );
}