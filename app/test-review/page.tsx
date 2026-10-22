
"use client";

import { useState } from "react";

export default function TestReviewPage() {
  const [appId, setAppId] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appId: Number(appId),
          content: content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Review save nahi hua.");
        return;
      }

      setMessage("Success! Review database mein save ho gaya.");
      setContent("");
    } catch {
      setMessage("Server se connection nahi ho saka.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>FraudShield - Review Testing</h1>

      <p>
        Apni test app ki ID aur review enter karein.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="appId">App ID</label>
        <input
          id="appId"
          type="number"
          min="1"
          required
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          placeholder="Example: 1"
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            margin: "8px 0 20px",
            boxSizing: "border-box",
          }}
        />

        <label htmlFor="content">Your Review</label>
        <textarea
          id="content"
          required
          maxLength={5000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your app review here..."
          rows={5}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            margin: "8px 0 20px",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 22px",
            background: "#1769aa",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {message && (
        <p role="status" style={{ marginTop: "20px" }}>
          {message}
        </p>
      )}
    </main>
  );
}
