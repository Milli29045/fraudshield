
"use client";

import { useCallback, useEffect, useState } from "react";

type AppItem = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  fraudStatus: string;
  createdAt: string;
  _count: {
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

const buttonStyle = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "8px",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 600,
};

export default function AdminPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updatingAppId, setUpdatingAppId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [appsResponse, reviewsResponse] = await Promise.all([
        fetch("/api/apps"),
        fetch("/api/reviews"),
      ]);

      const appsData = await appsResponse.json();
      const reviewsData = await reviewsResponse.json();

      if (!appsResponse.ok) {
        throw new Error(appsData.error || "Apps load nahi huin.");
      }

      if (!reviewsResponse.ok) {
        throw new Error(reviewsData.error || "Reviews load nahi hue.");
      }

      setApps(appsData.apps);
      setReviews(reviewsData.reviews);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Koi error aa gaya."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function updateReviewStatus(id: number, status: string) {
    setUpdatingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/reviews", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Review status update nahi hua.");
      }

      setMessage(`Review #${id} ${status} ho gaya.`);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Koi error aa gaya."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function updateAppStatus(id: number, fraudStatus: string) {
    setUpdatingAppId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/apps/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fraudStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "App status update nahi hua.");
      }

      setApps((currentApps) =>
        currentApps.map((app) =>
          app.id === id ? { ...app, fraudStatus } : app
        )
      );

      setMessage(`${data.app.name} ka status ${fraudStatus} ho gaya.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Koi error aa gaya."
      );
    } finally {
      setUpdatingAppId(null);
    }
  }

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "16px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  };

  function statusColor(status: string) {
    if (status === "Genuine" || status === "approved") {
      return { background: "#dcfce7", color: "#166534" };
    }

    if (status === "Fraud" || status === "rejected") {
      return { background: "#fee2e2", color: "#991b1b" };
    }

    return { background: "#fef3c7", color: "#92400e" };
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "32px 20px",
        fontFamily: "Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <header style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
            FraudShield Admin Panel
          </h1>
          <p style={{ color: "#64748b", lineHeight: 1.6 }}>
            Apps classify karein aur submitted reviews moderate karein.
          </p>

          <button
            onClick={() => void loadData()}
            disabled={loading}
            style={{
              ...buttonStyle,
              background: "#334155",
              marginTop: "10px",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Loading..." : "Refresh Dashboard"}
          </button>
        </header>

        {error && (
          <p
            role="alert"
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            {message}
          </p>
        )}

        <section style={{ marginTop: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>
            App Management
          </h2>

          {!loading && apps.length === 0 && (
            <p>Koi app database mein available nahi hai.</p>
          )}

          {apps.map((app) => (
            <article key={app.id} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "21px", margin: "0 0 10px" }}>
                    {app.name}
                  </h3>

                  <p style={{ color: "#64748b", margin: "6px 0" }}>
                    App ID: {app.id}
                  </p>

                  <p style={{ margin: "6px 0" }}>
                    Category: {app.category || "Not specified"}
                  </p>

                  {app.description && (
                    <p style={{ lineHeight: 1.6 }}>
                      {app.description}
                    </p>
                  )}

                  <p style={{ color: "#475569" }}>
                    Total Reviews: {app._count.reviews}
                  </p>
                </div>

                <span
                  style={{
                    ...statusColor(app.fraudStatus),
                    padding: "7px 12px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  {app.fraudStatus}
                </span>
              </div>

              <p style={{ fontWeight: 600, marginTop: "20px" }}>
                Change App Classification:
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <button
                  disabled={updatingAppId !== null || app.fraudStatus === "Genuine"}
                  onClick={() => void updateAppStatus(app.id, "Genuine")}
                  style={{
                    ...buttonStyle,
                    background: "#15803d",
                    opacity:
                      updatingAppId !== null || app.fraudStatus === "Genuine"
                        ? 0.6
                        : 1,
                  }}
                >
                  {updatingAppId === app.id ? "Updating..." : "Genuine"}
                </button>

                <button
                  disabled={updatingAppId !== null || app.fraudStatus === "Fraud"}
                  onClick={() => void updateAppStatus(app.id, "Fraud")}
                  style={{
                    ...buttonStyle,
                    background: "#b91c1c",
                    opacity:
                      updatingAppId !== null || app.fraudStatus === "Fraud"
                        ? 0.6
                        : 1,
                  }}
                >
                  {updatingAppId === app.id ? "Updating..." : "Fraud"}
                </button>

                <button
                  disabled={updatingAppId !== null || app.fraudStatus === "Pending"}
                  onClick={() => void updateAppStatus(app.id, "Pending")}
                  style={{
                    ...buttonStyle,
                    background: "#a16207",
                    opacity:
                      updatingAppId !== null || app.fraudStatus === "Pending"
                        ? 0.6
                        : 1,
                  }}
                >
                  {updatingAppId === app.id ? "Updating..." : "Pending"}
                </button>
              </div>
            </article>
          ))}
        </section>

        <section style={{ marginTop: "42px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>
            Review Management
          </h2>

          {!loading && reviews.length === 0 && (
            <p>Koi review available nahi hai.</p>
          )}

          {reviews.map((review) => (
            <article key={review.id} style={cardStyle}>
              <h3 style={{ fontSize: "20px" }}>{review.app.name}</h3>

              <p style={{ lineHeight: 1.7 }}>{review.content}</p>

              <p>
                <strong>Review ID:</strong> {review.id}
              </p>

              <p>
                <strong>Sentiment:</strong>{" "}
                {review.sentiment ?? "Not analyzed"}
              </p>

              <p>
                <strong>Review Status:</strong>{" "}
                <span
                  style={{
                    ...statusColor(review.status),
                    padding: "4px 9px",
                    borderRadius: "12px",
                    fontSize: "13px",
                  }}
                >
                  {review.status}
                </span>
              </p>

              <small style={{ color: "#64748b" }}>
                {new Date(review.createdAt).toLocaleString()}
              </small>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "18px",
                }}
              >
                <button
                  disabled={
                    updatingId !== null || review.status === "approved"
                  }
                  onClick={() =>
                    void updateReviewStatus(review.id, "approved")
                  }
                  style={{
                    ...buttonStyle,
                    background: "#166534",
                    opacity:
                      updatingId !== null || review.status === "approved"
                        ? 0.6
                        : 1,
                  }}
                >
                  {updatingId === review.id ? "Updating..." : "Approve"}
                </button>

                <button
                  disabled={
                    updatingId !== null || review.status === "rejected"
                  }
                  onClick={() =>
                    void updateReviewStatus(review.id, "rejected")
                  }
                  style={{
                    ...buttonStyle,
                    background: "#b91c1c",
                    opacity:
                      updatingId !== null || review.status === "rejected"
                        ? 0.6
                        : 1,
                  }}
                >
                  {updatingId === review.id ? "Updating..." : "Reject"}
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
