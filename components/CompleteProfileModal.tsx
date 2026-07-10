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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-purple-800 via-fuchsia-700 to-pink-600">

      {/* Decorative wavy background across full screen */}
      <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 400 300" preserveAspectRatio="none">
        <path d="M0,80 C100,150 150,20 250,90 C320,140 380,60 400,100 L400,300 L0,300 Z" fill="rgba(255,255,255,0.08)" />
        <path d="M0,150 C120,220 200,100 300,180 C350,220 380,180 400,200 L400,300 L0,300 Z" fill="rgba(255,255,255,0.06)" />
      </svg>
      <div className="absolute top-10 right-10 w-40 h-40 bg-cyan-300 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">

        {/* Header */}
        <div className="text-center mb-8 max-w-md">
          <p className="text-xs font-bold tracking-widest text-white/70 uppercase mb-2">Almost there</p>
          <h1 className="text-4xl font-extrabold text-white drop-shadow-sm mb-2">Let's set you up 🚀</h1>
          <p className="text-base text-white/80">Pick a vibe & tell us who you are</p>
        </div>

        {/* Emoji avatar picker */}
        <div className="flex justify-center gap-3 flex-wrap px-4 mb-8">
          {AVATAR_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${
                emoji === e
                  ? 'bg-white scale-110 shadow-lg ring-4 ring-yellow-300'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Username</label>
          <input
            type="text"
            autoComplete="off"
            name="flick-username-field"
            style={inputStyle}
            className="w-full border border-gray-200 rounded-xl p-4 mb-5 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition"
            placeholder="e.g. shadowrunner"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Full name</label>
          <input
            type="text"
            autoComplete="off"
            style={inputStyle}
            className="w-full border border-gray-200 rounded-xl p-4 mb-5 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">About you (optional)</label>
          <textarea
            style={inputStyle}
            rows={3}
            className="w-full border border-gray-200 rounded-xl p-4 mb-5 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition resize-none"
            placeholder="A short bio... what's your vibe?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Gender (optional)</label>
          <select
            style={inputStyle}
            className="w-full border border-gray-200 rounded-xl p-4 mb-3 text-base focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition"
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
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-[1.02] active:scale-[0.98] text-white rounded-xl py-4 text-base font-bold mt-5 shadow-md transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Saving...' : `${emoji} Save & Continue`}
          </button>
        </div>
      </div>
    </div>
  );
}
