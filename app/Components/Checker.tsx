
"use client";

import { useState, type FormEvent } from "react";

type CheckMode = "Phone Number" | "Email Address" | "Message";

export default function Checker() {
  const [mode, setMode] = useState<CheckMode>("Phone Number");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!value.trim()) {
      setMessage("Please enter information first.");
      return;
    }

    setLoading(true);
    setMessage("");

    const type =
      mode === "Phone Number"
        ? "phone"
        : mode === "Email Address"
          ? "email"
          : "message";

    try {
      const response = await fetch("/api/checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          value: value.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Detection failed.");
      }

      setMessage(
        data.message ||
        data.result ||
        `Risk Level: ${data.riskLevel || "Analysis completed"}`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function changeMode(newMode: CheckMode) {
    setMode(newMode);
    setValue("");
    setMessage("");
  }

  return (
    <section className="checker-section" id="checker">
      <div className="section-heading">
        <span className="eyebrow">FRAUD AWARENESS TOOL</span>
        <h2>Check Suspicious Information</h2>
        <p>
          Enter a phone number, email address, or suspicious
          message to check for potential fraud indicators.
        </p>
      </div>

      <div className="checker-card">
        <div className="checker-tabs">
          {(
            ["Phone Number", "Email Address", "Message"] as CheckMode[]
          ).map((item) => (
            <button
              key={item}
              type="button"
              className={`tab-button ${mode === item ? "active" : ""}`}
              onClick={() => changeMode(item)}
              disabled={loading}
            >
              {item}
            </button>
          ))}
        </div>

        <form className="checker-form" onSubmit={handleCheck}>
          <label htmlFor="check-input">
            {mode === "Phone Number"
              ? "Phone number"
              : mode === "Email Address"
                ? "Email address"
                : "Message or app review"}
          </label>

          {mode === "Message" ? (
            <textarea
              id="check-input"
              rows={4}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Enter a suspicious message..."
              disabled={loading}
            />
          ) : (
            <input
              id="check-input"
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={
                mode === "Phone Number"
                  ? "Enter a phone number"
                  : "Enter an email address"
              }
              disabled={loading}
            />
          )}

          <button
            className="primary-button check-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Checking..." : "Check Now →"}
          </button>

          {message && (
            <p className="demo-message" role="status">
              {message}
            </p>
          )}

          <p className="privacy-note">
            This tool checks for potential fraud indicators.
            Results are not a guarantee that information is safe.
            Avoid entering private or sensitive information.
          </p>
        </form>
      </div>
    </section>
  );
}
