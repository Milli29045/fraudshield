
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

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

type FraudReport = {
  id: number;
  type: string;
  reportedValue: string;
  category: string;
  description: string | null;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  } | null;
};

const buttonStyle = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "8px",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 600,
};
const formInputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "12px",
  marginBottom: "14px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "15px",
};
export default function AdminPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<FraudReport[]>([]);
const [updatingReportId, setUpdatingReportId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updatingAppId, setUpdatingAppId] = useState<number | null>(null);
  const [appName, setAppName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [appCategory, setAppCategory] = useState("");
  const [appStatus, setAppStatus] = useState("Pending");
  const [addingApp, setAddingApp] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
   
const [appsResponse, reviewsResponse, reportsResponse] =
  await Promise.all([
    fetch("/api/apps"),
    fetch("/api/reviews"),
    fetch("/api/reports"),
  ]);

      const appsData = await appsResponse.json();
      const reviewsData = await reviewsResponse.json();
const reportsData = await reportsResponse.json();
      if (!appsResponse.ok) {
        throw new Error(appsData.error || "Unable to load apps.");
      }

      if (!reviewsResponse.ok) {
        throw new Error(reviewsData.error || "Unable to load reviews.");
      }

      setApps(appsData.apps);
      setReviews(reviewsData.reviews);
      if (!reportsResponse.ok) {
  throw new Error(
    reportsData.message || "Unable to load fraud reports."
  );
}

setReports(reportsData.reports || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
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
        throw new Error(data.error || "Unable to update review status.");
      }

      setMessage(`Review #${id} has been ${status}.`);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  }

async function updateReportStatus(id: number, status: "approved" | "rejected") {
  setUpdatingReportId(id);
  setError("");
  setMessage("");

  try {
    const response = await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to update report.");
    }

    setMessage(`Report #${id} has been ${status}.`);
    await loadData();
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Something went wrong."
    );
  } finally {
    setUpdatingReportId(null);
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
        throw new Error(data.error || "Unable to update app status.");
      }

      setApps((currentApps) =>
        currentApps.map((app) =>
          app.id === id ? { ...app, fraudStatus } : app
        )
      );

      setMessage(`${data.app.name} status has been updated to ${fraudStatus}.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setUpdatingAppId(null);
    }
  }

async function addApp(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setError("");
  setMessage("");

  if (!appName.trim()) {
    setError("Please enter an app name.");
    return;
  }

  setAddingApp(true);

  try {
    const response = await fetch("/api/apps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: appName.trim(),
        description: appDescription.trim(),
        category: appCategory.trim(),
        fraudStatus: appStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to add app.");
    }

    setAppName("");
    setAppDescription("");
    setAppCategory("");
    setAppStatus("Pending");

    setMessage(`${data.app.name} added successfully.`);

    await loadData();
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Unable to add app."
    );
  } finally {
    setAddingApp(false);
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
          Manage app classifications and moderate submitted reviews.
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
          
<form
  onSubmit={addApp}
  style={{
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "20px",
  }}
>
  <h3 style={{ fontSize: "20px", marginBottom: "16px" }}>
    Add New App
  </h3>

  <input
    value={appName}
    onChange={(e) => setAppName(e.target.value)}
    placeholder="App Name"
    maxLength={150}
    required
    style={formInputStyle}
  />

  <textarea
    value={appDescription}
    onChange={(e) => setAppDescription(e.target.value)}
    placeholder="App Description"
    rows={3}
    style={formInputStyle}
  />

  <input
    value={appCategory}
    onChange={(e) => setAppCategory(e.target.value)}
    placeholder="Category (e.g. Social Media, Finance)"
    style={formInputStyle}
  />

  <select
    value={appStatus}
    onChange={(e) => setAppStatus(e.target.value)}
    style={formInputStyle}
  >
    <option value="Pending">Pending</option>
    <option value="Genuine">Genuine</option>
    <option value="Fraud">Fraud</option>
  </select>

  <button
    type="submit"
    disabled={addingApp}
    style={{
      ...buttonStyle,
      background: "#4f46e5",
      opacity: addingApp ? 0.6 : 1,
    }}
  >
    {addingApp ? "Adding App..." : "Add App"}
  </button>
</form>


          {!loading && apps.length === 0 && (
            <p>No apps are available.</p>
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
          
<section style={{ marginTop: "42px" }}>
  <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>
    Fraud Reports Management
  </h2>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
      marginBottom: "20px",
    }}
  >
    <div style={{ ...cardStyle, flex: "1 1 150px" }}>
      <h3>Pending Reports</h3>
      <p style={{ fontSize: "28px", fontWeight: 700, color: "#a16207" }}>
        {reports.filter((r) => r.status === "pending").length}
      </p>
    </div>

    <div style={{ ...cardStyle, flex: "1 1 150px" }}>
      <h3>Approved Reports</h3>
      <p style={{ fontSize: "28px", fontWeight: 700, color: "#15803d" }}>
        {reports.filter((r) => r.status === "approved").length}
      </p>
    </div>

    <div style={{ ...cardStyle, flex: "1 1 150px" }}>
      <h3>Rejected Reports</h3>
      <p style={{ fontSize: "28px", fontWeight: 700, color: "#b91c1c" }}>
        {reports.filter((r) => r.status === "rejected").length}
      </p>
    </div>
  </div>

  {!loading && reports.length === 0 && (
    <p>No fraud reports have been submitted yet.</p>
  )}

  {reports.map((report) => (
    <article key={report.id} style={cardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
            {report.type === "phone"
              ? "Suspicious Phone Number"
              : report.type === "email"
                ? "Spam Email"
                : "Suspicious Website"}
          </h3>

          <p style={{ fontWeight: 700, fontSize: "17px" }}>
            {report.reportedValue}
          </p>

          <p>
            <strong>Report ID:</strong> {report.id}
          </p>

          <p>
            <strong>Category:</strong> {report.category}
          </p>

          <p>
            <strong>Description:</strong>{" "}
            {report.description || "No description provided."}
          </p>

          <p>
            <strong>Submitted by:</strong>{" "}
            {report.user?.name || "Unknown User"}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {report.user?.email || "Not available"}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>

        <span
          style={{
            ...statusColor(report.status),
            padding: "7px 12px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: 700,
            height: "fit-content",
          }}
        >
          {report.status.toUpperCase()}
        </span>
      </div>

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
            updatingReportId !== null || report.status === "approved"
          }
          onClick={() =>
            void updateReportStatus(report.id, "approved")
          }
          style={{
            ...buttonStyle,
            background: "#15803d",
            opacity: updatingReportId !== null || report.status === "approved" ? 0.6 : 1,
          }}
        >
          {updatingReportId === report.id ? "Updating..." : "Approve"}
        </button>

        <button
          disabled={
            updatingReportId !== null || report.status === "rejected"
          }
          onClick={() =>
            void updateReportStatus(report.id, "rejected")
          }
          style={{
            ...buttonStyle,
            background: "#b91c1c",
            opacity: updatingReportId !== null || report.status === "rejected" ? 0.6 : 1,
          }}
        >
          {updatingReportId === report.id ? "Updating..." : "Reject"}
        </button>
      </div>
    </article>
  ))}
</section>

          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>
            Review Management
          </h2>

          {!loading && reviews.length === 0 && (
            <p>No reviews are available.</p>
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
