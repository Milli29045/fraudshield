"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type AppItem = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  fraudStatus: string;
  createdAt: string;
  _count?: {
    reviews: number;
  };
};

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

function AppDetailsContent() {
  const params = useParams<{ id: string }>();
  const appId = Number(params.id);

  const [app, setApp] = useState<AppItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDetails() {
      if (!Number.isInteger(appId) || appId <= 0) {
        setError("Invalid app ID.");
        setLoading(false);
        return;
      }

      try {
        const [appsResponse, reviewsResponse] = await Promise.all([
          fetch("/api/apps"),
          fetch(`/api/reviews?appId=${appId}`),
        ]);

        const appsData = await appsResponse.json();
        const reviewsData = await reviewsResponse.json();

        if (!appsResponse.ok) {
          throw new Error(appsData.error || "Unable to load apps.");
        }

        if (!reviewsResponse.ok) {
          throw new Error(
            reviewsData.error || "Unable to load app reviews."
          );
        }

        const foundApp = (appsData.apps as AppItem[]).find(
          (item) => item.id === appId
        );

        if (!foundApp) {
          setError("App not found.");
          return;
        }

        setApp(foundApp);
        setReviews(
          Array.isArray(reviewsData.reviews)
            ? reviewsData.reviews
            : []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading app details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [appId]);

  const statusColor =
    app?.fraudStatus.toLowerCase() === "genuine"
      ? { background: "#dcfce7", color: "#166534" }
      : app?.fraudStatus.toLowerCase() === "fraud"
        ? { background: "#fee2e2", color: "#991b1b" }
        : { background: "#fef3c7", color: "#92400e" };

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "16px",
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <Link
        href="/apps"
        style={{ color: "#4f46e5", textDecoration: "none" }}
      >
        ← Back to Apps
      </Link>

      {loading && <p style={{ marginTop: "20px" }}>Loading app details...</p>}

      {error && (
        <p role="alert" style={{ color: "#b91c1c", marginTop: "20px" }}>
          {error}
        </p>
      )}

      {!loading && !error && app && (
        <>
          <header style={{ margin: "28px 0" }}>
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
              {app.name}
            </h1>

            <p style={{ color: "#64748b", lineHeight: 1.7 }}>
              {app.description || "No description available."}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {app.category || "Uncategorized"}
            </p>

            <p>
              <strong>Verification Status:</strong>{" "}
              <span
                style={{
                  ...statusColor,
                  padding: "5px 10px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                {app.fraudStatus}
              </span>
            </p>

            <p>
              <strong>Total Reviews:</strong> {reviews.length}
            </p>

            <p style={{ color: "#64748b", fontSize: "13px" }}>
              Added on{" "}
              {new Date(app.createdAt).toLocaleDateString("en-US")}
            </p>
          </header>

          <section>
            <h2 style={{ fontSize: "24px", marginBottom: "18px" }}>
              User Reviews
            </h2>

            {reviews.length === 0 && (
              <div style={cardStyle}>
                No reviews have been submitted for this app yet.
              </div>
            )}

            {reviews.map((review) => (
              <article key={review.id} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <strong>Review #{review.id}</strong>
                  <span style={{ color: "#64748b" }}>
                    {review.sentiment || "Not analyzed"}
                  </span>
                </div>

                <p style={{ lineHeight: 1.7, overflowWrap: "anywhere" }}>
                  {review.content}
                </p>

                <p style={{ color: "#64748b", fontSize: "13px" }}>
                  Status: {review.status}
                </p>

                <p style={{ color: "#64748b", fontSize: "13px" }}>
                  {new Date(review.createdAt).toLocaleString("en-US")}
                </p>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

export default function AppDetailsPage() {
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
      <Suspense fallback={<div style={{ maxWidth: "900px", margin: "0 auto" }}>Loading app details...</div>}>
        <AppDetailsContent />
      </Suspense>
    </main>
  );
}