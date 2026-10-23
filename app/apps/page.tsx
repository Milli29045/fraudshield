"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function AppsPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApps() {
      try {
        const response = await fetch("/api/apps");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load apps.");
        }

        setApps(Array.isArray(data.apps) ? data.apps : []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading apps."
        );
      } finally {
        setLoading(false);
      }
    }

    loadApps();
  }, []);

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case "genuine":
        return { background: "#dcfce7", color: "#166534" };
      case "fraud":
        return { background: "#fee2e2", color: "#991b1b" };
      default:
        return { background: "#fef3c7", color: "#92400e" };
    }
  }

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "22px",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
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
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
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
            Apps Directory
          </h1>

          <p style={{ color: "#64748b", lineHeight: 1.6 }}>
            Browse registered apps and review their current verification status.
          </p>
        </header>

        {loading && <p>Loading apps...</p>}

        {error && (
          <p role="alert" style={{ color: "#b91c1c" }}>
            {error}
          </p>
        )}

        {!loading && !error && apps.length === 0 && (
          <div style={cardStyle}>No apps are available yet.</div>
        )}

        {!loading && !error && apps.length > 0 && (
          <>
            <p style={{ color: "#64748b", marginBottom: "18px" }}>
              Total apps: {apps.length}
            </p>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "18px",
              }}
            >
              {apps.map((app) => {
                const statusStyle = getStatusColor(app.fraudStatus);

                return (
                  <article key={app.id} style={cardStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
               <h2 style={{ fontSize: "21px", margin: "0 0 12px" }}>
  <Link
    href={`/apps/${app.id}`}
    style={{ color: "#111827", textDecoration: "none" }}
  >
    {app.name}
  </Link>
</h2>      

                      <span
                        style={{
                          ...statusStyle,
                          padding: "6px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {app.fraudStatus}
                      </span>
                    </div>

                    <p style={{ color: "#64748b", lineHeight: 1.7 }}>
                      {app.description || "No description available."}
                    </p>

                    <p>
                      <strong>Category:</strong>{" "}
                      {app.category || "Uncategorized"}
                    </p>

                    <p>
                      <strong>Total Reviews:</strong>{" "}
                      {app._count?.reviews ?? 0}
                    </p>

                    <p
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        marginBottom: 0,
                      }}
                    >
                      Added:{" "}
                      {new Date(app.createdAt).toLocaleDateString("en-US")}
                    </p>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </div>
    </main>
  );
}