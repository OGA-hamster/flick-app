'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

const AVATAR_OPTIONS = ['😎', '🔥', '🚀', '🐉', '👾', '🦊', '🌙', '⚡'];

export default function CompleteProfileModal({ userId, onComplete }) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [description, setDescription] = useState('');
  const [gender, setGender] = useState('');
  const [emoji, setEmoji] = useState('😎');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const inputStyle = {
    color: '#111827',
    backgroundColor: '#ffffff',
    WebkitTextFillColor: '#111827',
  };

  const handleSubmit = async () => {
    if (!username || !fullName) {
      setError('Username and name are required.');
      return;
    }
    setLoading(true);
    setError('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username,
        full_name: fullName,
        description,
        gender: gender || null,
        avatar_emoji: emoji,
        profile_completed: true,
      })
      .eq('id', userId);

    setLoading(false);

    if (updateError) {
      setError(updateError.message.includes('duplicate') ? 'That username is taken.' : updateError.message);
      return;
    }

    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden my-8">

        {/* Header with wavy gradient background */}
        <div className="relative px-8 pt-10 pb-16 text-center overflow-hidden bg-gradient-to-br from-purple-700 via-fuchsia-600 to-pink-500">

          {/* Wavy shapes */}
          <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 400 300" preserveAspectRatio="none">
            <path d="M0,80 C100,150 150,20 250,90 C320,140 380,60 400,100 L400,300 L0,300 Z" fill="rgba(255,255,255,0.08)" />
            <path d="M0,150 C120,220 200,100 300,180 C350,220 380,180 400,200 L400,300 L0,300 Z" fill="rgba(255,255,255,0.06)" />
          </svg>

          {/* Dotted texture corners */}
          <div className="absolute top-4 left-4 grid grid-cols-4 gap-1 opacity-40">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-white" />
            ))}
          </div>
          <div className="absolute bottom-4 right-4 grid grid-cols-4 gap-1 opacity-30">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-white" />
            ))}
          </div>

          {/* Glow circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-cyan-300 rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-yellow-300 rounded-full blur-3xl opacity-30" />

          {/* Sparkles */}
          <div className="absolute top-3 left-4 text-2xl animate-bounce" style={{ animationDuration: '2s' }}>✨</div>
          <div className="absolute top-6 right-6 text-xl animate-pulse">⭐</div>

          <p className="relative text-xs font-bold tracking-widest text-white/70 uppercase mb-2">Almost there</p>
          <h2 className="relative text-3xl font-extrabold text-white drop-shadow-sm">Let's set you up 🚀</h2>
          <p className="relative text-sm text-white/80 mt-2">Pick a vibe & tell us who you are</p>

          {/* Emoji avatar picker */}
          <div className="relative mt-5 flex justify-center gap-2 flex-wrap px-4">
            {AVATAR_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                  emoji === e
                    ? 'bg-white scale-110 shadow-lg ring-2 ring-yellow-300'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="px-8 pb-8 -mt-8 relative">
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
            <label className="block text-xs font-bold text-gray-500 mb-1 mt-1 uppercase tracking-wide">Username</label>
            <input
              type="text"
              autoComplete="off"
              name="flick-username-field"
              style={inputStyle}
              className="w-full border border-gray-200 rounded-xl p-3 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition"
              placeholder="e.g. shadowrunner"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Full name</label>
            <input
              type="text"
              autoComplete="off"
              style={inputStyle}
              className="w-full border border-gray-200 rounded-xl p-3 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">About you (optional)</label>
            <textarea
              style={inputStyle}
              rows={3}
              className="w-full border border-gray-200 rounded-xl p-3 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition resize-none"
              placeholder="A short bio... what's your vibe?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Gender (optional)</label>
            <select
              style={inputStyle}
              className="w-full border border-gray-200 rounded-xl p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-[1.02] active:scale-[0.98] text-white rounded-xl py-3 font-bold mt-4 shadow-md transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Saving...' : `${emoji} Save & Continue`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}