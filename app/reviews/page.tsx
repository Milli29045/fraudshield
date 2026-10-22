
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
          throw new Error(data.error || "Reviews load nahi hue.");
        }

        setReviews(data.reviews);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Koi error aa gaya."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  return (
    <main
      style={{
        maxWidth: "850px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>FraudShield - All Reviews</h1>
      <p>Database se load hone wale app reviews.</p>

      {loading && <p>Reviews load ho rahe hain...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && reviews.length === 0 && (
        <p>Abhi koi review available nahi hai.</p>
      )}

      {!loading &&
        !error &&
        reviews.map((review) => (
          <article
            key={review.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "18px",
              marginTop: "16px",
            }}
          >
            <h3>{review.app.name}</h3>

            <p>{review.content}</p>

            <p>
              <strong>Review ID:</strong> {review.id}
            </p>

            <p>
              <strong>Sentiment:</strong>{" "}
              {review.sentiment ?? "Not analyzed yet"}
            </p>

            <p>
              <strong>Status:</strong> {review.status}
            </p>

            <small>
              {new Date(review.createdAt).toLocaleString()}
            </small>
          </article>
        ))}
    </main>
  );
}
