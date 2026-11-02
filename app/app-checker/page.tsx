
"use client";

import { useState, type FormEvent } from "react";
import { ShieldCheck, Search, AlertTriangle, CheckCircle } from "lucide-react";

type CheckType = "app" | "phone" | "email" | "message";

export default function AppCheckerPage() {
  const [checkType, setCheckType] = useState<CheckType>("app");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const placeholders: Record<CheckType, string> = {
    app: "Enter application name",
    phone: "Enter phone number",
    email: "Enter email address",
    message: "Paste suspicious message here",
  };

  async function handleCheck(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!value.trim()) {
      setError("Please enter information to check.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: checkType,
          value: value.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to complete the check.");
      }

      setResult(data.message || "Check completed successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <ShieldCheck size={52} className="text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Fraud Detection Checker
          </h1>

          <p className="mt-3 text-slate-600">
            Check suspicious apps, phone numbers, email addresses,
            and messages with FraudShield.
          </p>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <h2 className="mb-5 text-xl font-semibold text-slate-800">
            Select Detection Type
          </h2>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { id: "app", label: "App Name" },
              { id: "phone", label: "Phone Number" },
              { id: "email", label: "Email Address" },
              { id: "message", label: "Spam Message" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCheckType(item.id as CheckType);
                  setValue("");
                  setResult("");
                  setError("");
                }}
                className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${
                  checkType === item.id
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleCheck}>
            <label className="mb-2 block font-medium text-slate-700">
              Enter Information
            </label>

            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholders[checkType]}
              rows={checkType === "message" ? 5 : 2}
              className="w-full rounded-lg border border-slate-300 p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {error && (
              <p className="mt-3 flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle size={18} />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search size={19} />
              {loading ? "Checking..." : "Check Now"}
            </button>
          </form>

          {result && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 font-semibold text-green-700">
                <CheckCircle size={20} />
                Detection Result
              </div>
              <p className="mt-2 text-sm text-green-800">{result}</p>
            </div>
          )}
        </section>

        <p className="mt-5 text-center text-sm text-slate-500">
          FraudShield helps users identify potentially suspicious digital
          activities. Results should be verified before taking action.
        </p>
      </div>
    </main>
  );
}
