
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { pusherClient } from "../../lib/pusher-client";

type ChatMessage = {
  id: number;
  content: string;
  createdAt: string;
  isDeleted: boolean;
  sender: {
    id: number;
    name: string;
    role: string;
  };
};

export default function CommunityChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((newMessage: ChatMessage) => {
    setMessages((previous) => {
      if (previous.some((message) => message.id === newMessage.id)) {
        return previous;
      }
      return [...previous, newMessage];
    });
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMessages() {
      try {
        const chatResponse = await fetch("/api/chat/community", {
          credentials: "include",
          cache: "no-store",
        });

        const chatData = await chatResponse.json();

        if (!chatResponse.ok) {
          throw new Error(chatData.message || "Unable to load chat.");
        }

        const userResponse = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const userData = await userResponse.json();

        if (!userResponse.ok || !userData.authenticated) {
          throw new Error("Please login to use community chat.");
        }

        if (active) {
          setMessages(chatData.messages || []);
          setCurrentUserId(userData.user.id);
          setCurrentUserRole(userData.user.role);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Something went wrong."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMessages();

    const channel = pusherClient.subscribe("private-community-chat");

    channel.bind("new-message", (message: ChatMessage) => {
      if (active) addMessage(message);
    });

    channel.bind(
      "message-deleted",
      (deleted: { id: number; isDeleted: boolean }) => {
        if (active) {
          setMessages((previous) =>
            previous.map((message) =>
              message.id === deleted.id
                ? { ...message, content: "", isDeleted: true }
                : message
            )
          );
        }
      }
    );

    // Permanently remove deleted message from every user's chat
    channel.bind("message-removed", (removed: { id: number }) => {
      if (active) {
        setMessages((previous) =>
          previous.filter((message) => message.id !== removed.id)
        );
      }
    });

    return () => {
      active = false;
      channel.unbind("new-message");
      channel.unbind("message-deleted");
      channel.unbind("message-removed");
      pusherClient.unsubscribe("private-community-chat");
    };
  }, [addMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const messageContent = content.trim();
    if (!messageContent || sending) return;

    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/chat/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: messageContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Message could not be sent.");
      }

      addMessage(data.message);
      setContent("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(messageId: number, isDeleted: boolean) {
    const confirmation = isDeleted
      ? "Permanently remove this deleted message?"
      : "Are you sure you want to delete this message?";

    if (!window.confirm(confirmation)) return;

    setError("");

    try {
      const response = await fetch("/api/chat/community", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messageId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete message.");
      }

      if (isDeleted) {
        setMessages((previous) =>
          previous.filter((message) => message.id !== messageId)
        );
      } else {
        setMessages((previous) =>
          previous.map((message) =>
            message.id === messageId
              ? { ...message, content: "", isDeleted: true }
              : message
          )
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete message."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto flex max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

        <header className="border-b border-slate-800 bg-slate-900 p-5">
          <h1 className="text-2xl font-bold text-white">
            FraudShield Community
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Connect, share information and help others stay safe.
          </p>

          <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-400"></span>
            Community chat
          </div>
        </header>

        <section className="h-[500px] space-y-4 overflow-y-auto p-5">

          {loading && (
            <p className="text-center text-slate-400">
              Loading messages...
            </p>
          )}

          {!loading && messages.length === 0 && !error && (
            <div className="py-20 text-center">
              <h2 className="text-lg font-semibold">
                Welcome to FraudShield Community!
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                No messages yet. Start the conversation.
              </p>
            </div>
          )}

          {messages.map((message) => {
            const ownMessage = message.sender.id === currentUserId;

            const canDelete =
              ownMessage || currentUserRole === "admin";

            return (
              <div
                key={message.id}
                className={`flex ${
                  ownMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    ownMessage
                      ? "bg-blue-600 text-white"
                      : "border border-slate-700 bg-slate-800 text-white"
                  }`}
                >
                  <p className="mb-1 text-xs font-semibold text-blue-200">
                    {ownMessage ? "You" : message.sender.name}
                    {message.sender.role === "admin" && " • Admin"}
                  </p>

                  {message.isDeleted ? (
                    <p className="break-words text-sm italic text-slate-300">
                      This message was deleted
                    </p>
                  ) : (
                    <p className="break-words text-sm">
                      {message.content}
                    </p>
                  )}

                  <p className="mt-2 text-right text-[10px] text-slate-300">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(message.id, message.isDeleted)
                      }
                      className="mt-2 text-xs font-semibold text-red-300 transition-colors hover:text-red-200"
                    >
                      {message.isDeleted ? "Delete permanently" : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </section>

        {error && (
          <div className="mx-5 mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="flex gap-3 border-t border-slate-800 p-4"
        >
          <input
            type="text"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your message..."
            maxLength={2000}
            disabled={sending || loading}
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={sending || !content.trim() || loading}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </main>
  );
}
