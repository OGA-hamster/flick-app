"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! I'm here to help with anything — habits, motivation, or just life stuff. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Something went wrong: ${data.error || "please try again."}` },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Couldn't reach the assistant. Check your connection and try again." },
      ]);
    }

    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <main className="min-h-screen bg-plum text-cream noise-texture flex flex-col">
      <nav className="max-w-2xl w-full mx-auto flex items-center justify-between px-6 py-6">
        <Link href="/dashboard" className="font-display font-extrabold text-xl">
          flick<span className="text-lime">.</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-xs text-cream/60 hover:text-cream font-mono border border-cream/15 rounded-full px-3 py-2"
        >
          ← back
        </Link>
      </nav>

      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col px-6 pb-6">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-lime text-plum rounded-br-sm"
                    : "bg-white/10 text-cream rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-cream/60 rounded-2xl rounded-bl-sm px-4 py-3 text-sm">
                Thinking...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="flex items-end gap-2 bg-white/5 border border-cream/15 rounded-2xl p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-cream placeholder-cream/40 px-3 py-2 max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-lime text-plum rounded-xl px-4 py-2 font-semibold disabled:opacity-40 shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
