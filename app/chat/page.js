"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hey! I'm Flick AI. Ask me about the app, your habits, motivation, or just talk. What's on your mind?",
};

function newChatObject() {
  return {
    id: Date.now().toString(),
    title: "New chat",
    messages: [WELCOME_MESSAGE],
    updatedAt: Date.now(),
  };
}

function renderFormattedText(text) {
  const lines = text.split("\n");
  const elements = [];
  let listBuffer = [];
  let numberedBuffer = [];

  function flushLists(key) {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={"ul-" + key} className="list-disc list-inside space-y-1 my-1">
          {listBuffer.map((item, idx) => (
            <li key={idx}>{formatInline(item)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
    if (numberedBuffer.length > 0) {
      elements.push(
        <ol key={"ol-" + key} className="list-decimal list-inside space-y-1 my-1">
          {numberedBuffer.map((item, idx) => (
            <li key={idx}>{formatInline(item)}</li>
          ))}
        </ol>
      );
      numberedBuffer = [];
    }
  }

  function formatInline(str) {
    const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
        return <em key={idx}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={idx} className="bg-black/30 px-1.5 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.*)/);
    if (trimmed.startsWith("### ")) {
      flushLists(i);
      elements.push(<h3 key={i} className="font-bold text-base mt-2 mb-1">{formatInline(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith("## ")) {
      flushLists(i);
      elements.push(<h2 key={i} className="font-bold text-lg mt-2 mb-1">{formatInline(trimmed.slice(3))}</h2>);
    } else if (trimmed.startsWith("# ")) {
      flushLists(i);
      elements.push(<h1 key={i} className="font-bold text-xl mt-2 mb-1">{formatInline(trimmed.slice(2))}</h1>);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      numberedBuffer.length > 0 && flushLists(i);
      listBuffer.push(trimmed.slice(2));
    } else if (numberedMatch) {
      listBuffer.length > 0 && flushLists(i);
      numberedBuffer.push(numberedMatch[1]);
    } else {
      flushLists(i);
      if (trimmed.length > 0) {
        elements.push(<p key={i} className="mb-1 last:mb-0">{formatInline(line)}</p>);
      }
    }
  });
  flushLists("end");

  return elements;
}

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [editingMessageValue, setEditingMessageValue] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const savedChats = localStorage.getItem("flick_chats");
    const savedActive = localStorage.getItem("flick_active_id");
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChats(parsed);
          setActiveId(savedActive && parsed.find((c) => c.id === savedActive) ? savedActive : parsed[0].id);
          setLoaded(true);
          return;
        }
      } catch (e) {}
    }
    const fresh = newChatObject();
    setChats([fresh]);
    setActiveId(fresh.id);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("flick_chats", JSON.stringify(chats));
      if (activeId) localStorage.setItem("flick_active_id", activeId);
    }
  }, [chats, activeId, loaded]);

  const activeChat = chats.find((c) => c.id === activeId);
  const messages = activeChat ? activeChat.messages : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function autoResize() {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 128) + "px";
    }
  }

  function updateActiveChat(newMessages, titleOverride) {
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: newMessages,
              title: titleOverride || c.title,
              updatedAt: Date.now(),
            }
          : c
      )
    );
  }

  async function sendToAPI(newMessages) {
    setLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        signal: controller.signal,
      });
      const data = await res.json();
      const replyMsg = !res.ok
        ? { role: "assistant", content: `Something went wrong: ${data.error || "please try again."}` }
        : { role: "assistant", content: data.reply };
      updateActiveChat([...newMessages, replyMsg]);
    } catch (err) {
      if (err.name === "AbortError") {
        updateActiveChat([...newMessages, { role: "assistant", content: "(stopped)" }]);
      } else {
        updateActiveChat([
          ...newMessages,
          { role: "assistant", content: "Couldn't reach the assistant. Check your connection and try again." },
        ]);
      }
    }
    setLoading(false);
    abortControllerRef.current = null;
  }

  async function handleSend() {
    if (!input.trim() || loading || !activeChat) return;
    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    const isFirstUserMessage = messages.length === 1;
    const newTitle = isFirstUserMessage
      ? input.trim().slice(0, 32) + (input.trim().length > 32 ? "…" : "")
      : null;
    updateActiveChat(newMessages, newTitle);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await sendToAPI(newMessages);
  }

  function handleStop() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleNewChat() {
    const fresh = newChatObject();
    setChats((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
    setSidebarOpen(false);
  }

  function handleSelectChat(id) {
    setActiveId(id);
    setSidebarOpen(false);
  }

  function handleDeleteChat(id, e) {
    e.stopPropagation();
    setChats((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const fresh = newChatObject();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(remaining[0].id);
      return remaining;
    });
  }

  function startEditingTitle(chat, e) {
    e.stopPropagation();
    setEditingTitleId(chat.id);
    setEditingTitleValue(chat.title);
  }

  function saveEditingTitle(id) {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: editingTitleValue.trim() || c.title } : c))
    );
    setEditingTitleId(null);
  }

  function handleCopy(text, index) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  }

  function startEditingMessage(index, content) {
    setEditingMessageIndex(index);
    setEditingMessageValue(content);
  }

  async function saveEditingMessage(index) {
    const trimmed = editingMessageValue.trim();
    if (!trimmed) {
      setEditingMessageIndex(null);
      return;
    }
    const newMessages = messages.slice(0, index);
    newMessages.push({ role: "user", content: trimmed });
    updateActiveChat(newMessages);
    setEditingMessageIndex(null);
    await sendToAPI(newMessages);
  }

  const isEmpty = messages.length <= 1;
  const filteredChats = chats
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <main className="h-screen bg-plum text-cream noise-texture flex overflow-hidden">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#1F1424] border-r border-cream/10 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-4 border-b border-cream/10 space-y-3">
          <Link href="/dashboard" className="font-display font-extrabold text-lg block">
            flick<span className="text-lime">.</span>
          </Link>
          <button
            onClick={handleNewChat}
            className="w-full bg-lime text-plum font-semibold rounded-xl py-2 text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            + New chat
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-white/5 border border-cream/15 rounded-lg px-3 py-2 text-xs outline-none placeholder-cream/40"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm ${
                chat.id === activeId
                  ? "bg-white/10 text-cream"
                  : "text-cream/60 hover:bg-white/5 hover:text-cream"
              }`}
            >
              {editingTitleId === chat.id ? (
                <input
                  autoFocus
                  value={editingTitleValue}
                  onChange={(e) => setEditingTitleValue(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.key === "Enter" && saveEditingTitle(chat.id)}
                  onBlur={() => saveEditingTitle(chat.id)}
                  className="bg-black/30 rounded px-2 py-1 text-sm flex-1 outline-none"
                />
              ) : (
                <span className="truncate flex-1">{chat.title}</span>
              )}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => startEditingTitle(chat, e)}
                  className="text-cream/40 hover:text-lime text-xs"
                  title="Rename"
                >
                  ✎
                </button>
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="text-cream/40 hover:text-coral text-xs"
                  title="Delete chat"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-cream/10">
          <Link
            href="/dashboard"
            className="text-xs text-cream/50 hover:text-cream font-mono"
          >
            ← back to dashboard
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-cream/10 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-cream text-xl">
            ☰
          </button>
          <span className="font-display font-extrabold text-lg">
            flick<span className="text-lime">.</span>
          </span>
        </div>

        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <h1 className="font-display text-3xl font-extrabold mb-8 text-center">
              What's on your mind?
            </h1>
            <div className="w-full max-w-xl flex items-end gap-2 bg-white/5 border border-cream/15 rounded-2xl p-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoResize();
                }}
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
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-2xl mx-auto space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-end gap-2 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-lime text-plum flex items-center justify-center text-sm shrink-0 mb-1">
                        💬
                      </div>
                    )}
                    <div className="flex flex-col gap-1 max-w-[78%]">
                      {editingMessageIndex === i ? (
                        <div className="bg-white/5 border border-lime rounded-2xl p-2">
                          <textarea
                            autoFocus
                            value={editingMessageValue}
                            onChange={(e) => setEditingMessageValue(e.target.value)}
                            className="w-full bg-transparent resize-none outline-none text-cream text-sm p-2"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2 px-2 pb-1">
                            <button
                              onClick={() => setEditingMessageIndex(null)}
                              className="text-xs text-cream/50 hover:text-cream"
                            >
                              cancel
                            </button>
                            <button
                              onClick={() => saveEditingMessage(i)}
                              className="text-xs bg-lime text-plum rounded-full px-3 py-1 font-semibold"
                            >
                              save & resend
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-lime text-plum rounded-br-sm"
                              : "bg-white/10 text-cream rounded-bl-sm"
                          }`}
                        >
                          {msg.role === "assistant" ? renderFormattedText(msg.content) : msg.content}
                        </div>
                      )}
                      <div
                        className={`flex gap-3 text-xs text-cream/40 ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <button onClick={() => handleCopy(msg.content, i)} className="hover:text-cream">
                            {copiedIndex === i ? "copied!" : "copy"}
                          </button>
                        )}
                        {msg.role === "user" && !loading && editingMessageIndex !== i && (
                          <button
                            onClick={() => startEditingMessage(i, msg.content)}
                            className="hover:text-cream"
                          >
                            edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-end gap-2 justify-start">
                    <div className="w-7 h-7 rounded-full bg-lime text-plum flex items-center justify-center text-sm shrink-0 mb-1">
                      💬
                    </div>
                    <div className="bg-white/10 text-cream/60 rounded-2xl rounded-bl-sm px-4 py-3 text-sm flex items-center gap-2">
                      <span className="flex gap-1">
                        <span className="animate-bounce" style={{ animationDelay: "0ms" }}>●</span>
                        <span className="animate-bounce" style={{ animationDelay: "150ms" }}>●</span>
                        <span className="animate-bounce" style={{ animationDelay: "300ms" }}>●</span>
                      </span>
                      <button
                        onClick={handleStop}
                        className="ml-2 text-xs border border-cream/30 rounded-full px-2 py-1 hover:border-coral hover:text-coral font-semibold"
                      >
                        stop
                      </button>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="max-w-2xl mx-auto flex items-end gap-2 bg-white/5 border border-cream/15 rounded-2xl p-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    autoResize();
                  }}
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
          </>
        )}
      </div>
    </main>
  );
}