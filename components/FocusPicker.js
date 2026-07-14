"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabaseClient";

const PRESETS = ["Work", "Gym", "Study", "Rest", "Creative", "Errands"];

export default function FocusPicker({ userId, existingEntry, onGenerated }) {
  const supabase = createClient();
  const [answer, setAnswer] = useState(existingEntry?.answer || "");
  const [task, setTask] = useState(existingEntry?.generated_task || null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [doneCount, setDoneCount] = useState(0);
  const recognitionRef = useRef(null);

  function handlePreset(label) {
    setAnswer(label);
  }

  function handleMic() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input isn't supported in this browser. Try Chrome.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError("");
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswer(transcript);
    };
    recognition.onerror = () => {
      setError("Couldn't hear that — try again or type it instead.");
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  async function generateTask(currentAnswer) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: currentAnswer.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      await supabase.from("focus_entries").upsert(
        {
          user_id: userId,
          entry_date: today,
          answer: currentAnswer.trim(),
          generated_task: data.task,
        },
        { onConflict: "user_id,entry_date" }
      );

      setTask(data.task);
      if (onGenerated) onGenerated(data.task);
    } catch (e) {
      setError("Couldn't reach the assistant. Try again.");
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!answer.trim() || loading) return;
    await generateTask(answer);
  }

  async function handleDone() {
    if (loading) return;
    setDoneCount((c) => c + 1);
    await generateTask(answer);
  }

  if (task) {
    return (
      <div className="bg-white/5 border border-cream/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-cream/40 font-mono uppercase">
            Made for what you're doing today
          </p>
          {doneCount > 0 && (
            <span className="text-xs text-lime font-mono">{doneCount} done</span>
          )}
        </div>
        <p className="text-lg font-bold text-lime mb-3">
          {loading ? "Thinking of your next one..." : task}
        </p>
        <p className="text-cream/50 text-xs mb-4">Based on: "{answer}"</p>

        <button
          onClick={handleDone}
          disabled={loading}
          className="w-full bg-lime text-plum rounded-xl py-3 font-bold disabled:opacity-40"
        >
          {loading ? "..." : "✓ Done — give me another"}
        </button>

        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-cream/10 rounded-2xl p-6 mb-6">
      <p className="font-display text-lg font-bold mb-1">What are you doing today?</p>
      <p className="text-cream/50 text-sm mb-4">
        Tell Flick and get dares made just for it — keep going as long as you want.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => handlePreset(p)}
            className={`px-3 py-2 rounded-full text-xs font-semibold border transition ${
              answer === p
                ? "bg-lime text-plum border-lime"
                : "border-cream/20 text-cream/70 hover:border-cream/40"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-black/20 border border-cream/15 rounded-xl p-2">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type or use the mic..."
          className="flex-1 bg-transparent outline-none text-cream placeholder-cream/40 px-2 py-1 text-sm"
        />
        <button
          onClick={handleMic}
          type="button"
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition ${
            listening
              ? "bg-coral text-white animate-pulse"
              : "bg-white/10 text-cream hover:bg-white/20"
          }`}
          title="Speak your answer"
        >
          🎤
        </button>
      </div>

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!answer.trim() || loading}
        className="w-full mt-4 bg-lime text-plum rounded-xl py-3 font-bold disabled:opacity-40"
      >
        {loading ? "Thinking..." : "Get my dare"}
      </button>
    </div>
  );
}