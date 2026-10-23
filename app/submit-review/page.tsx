
"use client";

import { useEffect, useState, type FormEvent } from "react";

type AppItem = {
  id: number;
  name: string;
  category: string | null;
};

export default function SubmitReviewPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [appId, setAppId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApps() {
      try {
        const response = await fetch("/api/apps");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load apps.");
        }

        const availableApps: AppItem[] = Array.isArray(data.apps)
          ? data.apps
          : [];

        setApps(availableApps);

        if (availableApps.length > 0) {
          setAppId(String(availableApps[0].id));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load apps."
        );
      } finally {
        setLoading(false);
      }
    }

    loadApps();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!appId) {
      setError("Please select an app.");
      return;
    }

    if (!content.trim()) {
      setError("Please enter your review.");
      return;
    }

    if (content.trim().length > 5000) {
      setError("Your review must be 5,000 characters or fewer.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appId: Number(appId),
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit your review.");
      }

      setMessage("Your review was submitted successfully.");
      setContent("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
        color: "#111827",
      }}
    >
      <section
        style={{
          maxWidth: "650px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
        }}
      >
        <p style={{ color: "#4f46e5", fontWeight: "bold" }}>
          FRAUDSHIELD
        </p>

        <h1 style={{ fontSize: "30px", marginBottom: "10px" }}>
          Submit an App Review
        </h1>

        <p style={{ color: "#64748b", lineHeight: 1.6 }}>
          Share your experience with an app to help others make informed
          decisions.
        </p>

        {loading ? (
          <p>Loading apps...</p>
        ) : apps.length === 0 ? (
          <p role="status">No apps are available for review yet.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="appId"
              style={{ display: "block", margin: "22px 0 8px", fontWeight: "bold" }}
            >
              Select App
            </label>

            <select
              id="appId"
              value={appId}
              onChange={(event) => setAppId(event.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "15px",
              }}
            >
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                  {app.category ? ` — ${app.category}` : ""}
                </option>
              ))}
            </select>

            <label
              htmlFor="content"
              style={{ display: "block", margin: "22px 0 8px", fontWeight: "bold" }}
            >
              Your Review
            </label>

            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Describe your experience with this app..."
              rows={6}
              maxLength={5000}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "15px",
                resize: "vertical",
              }}
            />

            <p style={{ color: "#64748b", fontSize: "13px" }}>
              {content.length}/5000 characters
            </p>

            <button
              type="submit"
              disabled={submitting || !appId}
              style={{
                width: "100%",
                padding: "13px",
                marginTop: "12px",
                border: "none",
                borderRadius: "8px",
                background: "#4f46e5",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: submitting ? "wait" : "pointer",
                opacity: submitting || !appId ? 0.6 : 1,
              }}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {message && (
          <p role="status" style={{ color: "#166534", marginTop: "18px" }}>
            {message}
          </p>
        )}

        {error && (
          <p role="alert" style={{ color: "#b91c1c", marginTop: "18px" }}>
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
