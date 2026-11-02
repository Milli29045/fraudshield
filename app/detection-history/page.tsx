
"use client";

import { useEffect, useState } from "react";
import {
  History,
  ShieldCheck,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";

type Detection = {
  id: number;
  type: string;
  inputValue: string;
  riskLevel: string;
  result: string;
  createdAt: string;
};

export default function DetectionHistoryPage() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/detections");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load history.");
      }

      setDetections(data.detections || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  function getRiskStyle(risk: string) {
    if (
      risk === "High Suspicion" ||
      risk === "Suspicious Pattern"
    ) {
      return "bg-red-100 text-red-700";
    }

    if (risk === "Potentially Suspicious") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (risk === "No Suspicious Keywords Found") {
      return "bg-green-100 text-green-700";
    }

    return "bg-blue-100 text-blue-700";
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-blue-600">
              <History size={25} />
              <span className="font-semibold">FraudShield</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Detection History
            </h1>

            <p className="mt-2 text-slate-600">
              Review your previous fraud detection checks.
            </p>
          </div>

          <button
            onClick={loadHistory}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {loading && (
          <p className="rounded-xl bg-white p-6 text-center text-slate-600 shadow">
            Loading detection history...
          </p>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6 rounded-xl bg-white p-5 shadow">
              <p className="text-sm text-slate-500">
                Total Detection Checks
              </p>
              <p className="mt-1 text-3xl font-bold text-blue-600">
                {detections.length}
              </p>
            </div>

            {detections.length === 0 ? (
              <div className="rounded-xl bg-white p-10 text-center shadow">
                <ShieldCheck
                  size={45}
                  className="mx-auto mb-3 text-slate-400"
                />
                <h2 className="text-xl font-semibold text-slate-800">
                  No Detection History Found
                </h2>
                <p className="mt-2 text-slate-500">
                  Your completed detection checks will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {detections.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="font-semibold capitalize text-slate-800">
                        {item.type} Detection
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getRiskStyle(item.riskLevel)}`}
                      >
                        {item.riskLevel}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Checked Information
                      </p>
                      <p className="mt-1 break-words text-slate-800">
                        {item.inputValue}
                      </p>
                    </div>

                    <div className="mt-4 flex items-start gap-2">
                      <AlertTriangle
                        size={17}
                        className="mt-1 shrink-0 text-slate-500"
                      />
                      <p className="text-sm text-slate-600">
                        {item.result}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <Clock size={15} />
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
