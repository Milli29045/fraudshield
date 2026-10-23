"use client";

import { useEffect, useState } from "react";

type Review = {
  id: number;
  content: string;
  sentiment: string | null;
  status: string;
  createdAt: string;
  app: {
    name: string;
  };
};

function getSentimentStyle(sentiment: string | null) {
  switch (sentiment?.toLowerCase()) {
    case "positive":
      return { background: "#dcfce7", color: "#166534" };
    case "negative":
      return { background: "#fee2e2", color: "#991b1b" };
    case "neutral":
      return { background: "#e0e7ff", color: "#3730a3" };
    default:
      return { background: "#f3f4f6", color: "#374151" };
  }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReviews() {
      try {
        const response = await fetch("/api/reviews");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load reviews. Please try again."
          );
        }

        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading reviews."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  const positiveCount = reviews.filter(
    (review) => review.sentiment?.toLowerCase() === "positive"
  ).length;

  const negativeCount = reviews.filter(
    (review) => review.sentiment?.toLowerCase() === "negative"
  ).length;

  const neutralCount = reviews.filter(
    (review) => review.sentiment?.toLowerCase() === "neutral"
  ).length;

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "20px",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px 20px",
        fontFamily: "Arial, sans-serif",
        color: "#111827",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <header style={{ marginBottom: "28px" }}>
          <p
            style={{
              color: "#4f46e5",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            FRAUDSHIELD
          </p>

          <h1 style={{ fontSize: "32px", margin: "8px 0" }}>
            Reviews Dashboard
          </h1>

          <p style={{ color: "#64748b", lineHeight: 1.6 }}>
            View app reviews and their sentiment analysis results.
          </p>
        </header>

        {loading && <p>Loading reviews...</p>}

        {error && (
          <p role="alert" style={{ color: "#b91c1c" }}>
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              <div style={cardStyle}>
                <p style={{ color: "#64748b", margin: 0 }}>
                  Total Reviews
                </p>
                <h2 style={{ fontSize: "30px", marginBottom: 0 }}>
                  {reviews.length}
                </h2>
              </div>

              <div style={cardStyle}>
                <p style={{ color: "#166534", margin: 0 }}>Positive</p>
                <h2 style={{ fontSize: "30px", marginBottom: 0 }}>
                  {positiveCount}
                </h2>
              </div>

              <div style={cardStyle}>
                <p style={{ color: "#991b1b", margin: 0 }}>Negative</p>
                <h2 style={{ fontSize: "30px", marginBottom: 0 }}>
                  {negativeCount}
                </h2>
              </div>

              <div style={cardStyle}>
                <p style={{ color: "#3730a3", margin: 0 }}>Neutral</p>
                <h2 style={{ fontSize: "30px", marginBottom: 0 }}>
                  {neutralCount}
                </h2>
              </div>
            </section>

            <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>
              All Reviews
            </h2>

            {reviews.length === 0 && (
              <div style={cardStyle}>No reviews are available yet.</div>
            )}

            {reviews.map((review) => {
              const sentimentStyle = getSentimentStyle(review.sentiment);

              return (
                <article
                  key={review.id}
                  style={{
                    ...cardStyle,
                    marginBottom: "16px",
                    overflowWrap: "anywhere",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: "18px" }}>
                      {review.app.name}
                    </h3>

                    <span
                      style={{
                        ...sentimentStyle,
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "bold",
                      }}
                    >
                      {review.sentiment ?? "Not analyzed"}
                    </span>
                  </div>

                  <p style={{ lineHeight: 1.7, margin: "18px 0" }}>
                    {review.content}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "16px",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    <span>Review ID: {review.id}</span>
                    <span>Status: {review.status}</span>
                    <span>
                      {new Date(review.createdAt).toLocaleString("en-US")}
                    </span>
                  </div>
                </article>
              );
            })}
          </>
        )}
      </div>
    </main>
  );
}