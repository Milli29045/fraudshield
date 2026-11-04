
"use client";

import { useState } from "react";

export default function ReportsPage() {
  const [type, setType] = useState("phone");
  const [reportedValue, setReportedValue] = useState("");
  const [category, setCategory] = useState("Spam Call");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          reportedValue,
          category,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit report.");
      }

      setSuccess(true);
      setMessage(data.message);
      setReportedValue("");
      setDescription("");
      setCategory("Spam Call");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <h1 className="mb-2 text-3xl font-bold">
          Report Suspicious Activity
        </h1>

        <p className="mb-8 text-gray-600">
          Help protect the community by reporting suspicious phone numbers,
          email addresses, and websites.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block font-medium">Report Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCategory(
                  e.target.value === "phone" ? "Spam Call" : "Other"
                );
              }}
              className="w-full rounded-lg border border-gray-300 p-3"
            >
              <option value="phone">Phone Number</option>
              <option value="email">Email Address</option>
              <option value="website">Website URL</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              {type === "phone"
                ? "Phone Number"
                : type === "email"
                ? "Email Address"
                : "Website URL"}
            </label>

            <input
              type="text"
              required
              maxLength={500}
              value={reportedValue}
              onChange={(e) => setReportedValue(e.target.value)}
              placeholder={
                type === "phone"
                  ? "Enter suspicious phone number"
                  : type === "email"
                  ? "Enter suspicious email address"
                  : "Enter suspicious website URL"
              }
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Report Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3"
            >
              {[
                "Spam Call",
                "Fraud",
                "Financial Scam",
                "Fake Job Offer",
                "Phishing",
                "Fake Online Shopping",
                "Harassment",
                "Other",
              ].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Description (Optional)
            </label>
            <textarea
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>

          <p className="text-sm text-gray-500">
            Do not include CNIC numbers, passwords, OTPs, or other private
            personal information in your report.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>

          {message && (
            <p
              role="status"
              className={`rounded-lg p-3 text-sm ${
                success
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

