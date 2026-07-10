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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-black">
        <h2 className="text-xl font-bold mb-1">Complete your profile</h2>
        <p className="text-sm text-gray-500 mb-4">Just a few details to get started.</p>

        <input
          className="w-full border rounded-lg p-2 mb-3"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full border rounded-lg p-2 mb-3"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <textarea
          className="w-full border rounded-lg p-2 mb-3"
          placeholder="Short description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          className="w-full border rounded-lg p-2 mb-4"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Gender (optional)</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white rounded-lg py-2 font-semibold"
        >
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}