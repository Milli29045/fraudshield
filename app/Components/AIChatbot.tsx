
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello! 👋 I am FraudShield AI Assistant. I can help you understand online scams, suspicious emails, phone numbers, websites and digital safety. How can I help you today?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
function handleRefresh() {
  if (loading) return;

  setMessages([
    {
      role: "assistant",
      text: "Hello! 👋 I am FraudShield AI Assistant. I can help you understand online scams, suspicious emails, phone numbers, websites and digital safety. How can I help you today?",
    },
  ]);

  setInput("");
}
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const message = input.trim();

    if (!message || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI assistant is unavailable.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || "Sorry, I could not generate a response.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[350px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-950 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl">
                🛡️
              </div>

              <div>
                <h3 className="font-bold">FraudShield AI</h3>
                <p className="text-xs text-blue-200">
                  Your Digital Safety Assistant
                </p>
              </div>
            </div>

          <div className="flex items-center gap-3">
  <button
    onClick={handleRefresh}
    disabled={loading}
    className="text-2xl text-white hover:text-blue-200 disabled:opacity-40"
    title="Start new conversation"
    aria-label="Refresh chatbot"
  >
    ↻
  </button>

  <button
    onClick={() => setIsOpen(false)}
    className="text-2xl text-white hover:text-blue-200"
    aria-label="Close chatbot"
  >
    ×
  </button>
</div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-blue-950 text-white"
                      : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                  AI is typing...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-gray-200 bg-white p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about online safety..."
              maxLength={2000}
              disabled={loading}
              className="min-w-0 flex-1 rounded-full border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-700"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-full bg-blue-950 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>

          <div className="bg-white pb-2 text-center text-[10px] text-gray-400">
            Never share your password or OTP.
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-950 text-3xl text-white shadow-xl transition hover:scale-105 hover:bg-blue-800"
          aria-label="Open FraudShield AI chatbot"
        >
          {isOpen ? "×" : "💬"}
        </button>
      </div>
    </div>
  );
}
