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
        <path d="M0,150 C120,220 200,100