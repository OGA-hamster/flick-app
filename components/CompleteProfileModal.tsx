'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function CompleteProfileModal({ userId, onComplete }) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [description, setDescription] = useState('');
  const [gender, setGender] = useState('');
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-500 px-8 pt-10 pb-14 text-center relative">
          <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 mx-auto flex items-center justify-center text-3xl mb-3">
            👤
          </div>
          <h2 className="text-2xl font-extrabold text-white">Complete your profile</h2>
          <p className="text-sm text-white/80 mt-1">Just a few details to get started</p>
        </div>

        {/* Form */}
        <div className="px-8 pb-8 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1 mt-1">Username</label>
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

            <label className="block text-xs font-semibold text-gray-500 mb-1">Full name</label>
            <input
              type="text"
              autoComplete="off"
              style={inputStyle}
              className="w-full border border-gray-200 rounded-xl p-3 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <label className="block text-xs font-semibold text-gray-500 mb-1">About you (optional)</label>
            <textarea
              style={inputStyle}
              rows={3}
              className="w-full border border-gray-200 rounded-xl p-3 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition resize-none"
              placeholder="A short bio..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label className="block text-xs font-semibold text-gray-500 mb-1">Gender (optional)</label>
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
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 text-white rounded-xl py-3 font-bold mt-4 shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save & Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}