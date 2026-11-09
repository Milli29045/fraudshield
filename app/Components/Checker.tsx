
"use client";

import { useState, type FormEvent } from "react";

type CheckMode =
  | "Phone Number"
  | "Email Address"
  | "Message"
  | "Website URL";

type ApiResult = {
  success?: boolean;
  error?: string;
  message?: string;
  result?: string;
  riskLevel?: string;
  checks?: Record<string, unknown>;
  note?: string;
};

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

    try {
      let endpoint = "/api/checker";

      let requestBody: Record<string, string> = {
        type: "",
        value: value.trim(),
      };

      if (mode === "Phone Number") {
        endpoint = "/api/check-phone";
        requestBody = {
          phone: value.trim(),
        };
      } else if (mode === "Email Address") {
        endpoint = "/api/check-email";
        requestBody = {
          email: value.trim(),
        };
      } else if (mode === "Website URL") {
        endpoint = "/api/check-website";
        requestBody = {
          url: value.trim(),
        };
      } else {
        requestBody.type = "message";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = (await response.json()) as ApiResult;

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Detection failed."
        );
      }

      const lines: string[] = [];

      lines.push(`Risk Level: ${data.riskLevel || "Unknown"}`);

   if (data.result || data.message) {
  lines.push(`Result: ${data.result || data.message}`);
}
      if (data.checks) {
        lines.push("");
        lines.push("Verification Details:");

        Object.entries(data.checks).forEach(([key, item]) => {
          if (
            item !== null &&
            item !== undefined &&
            item !== ""
          ) {
            const label = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (char) => char.toUpperCase());

            const displayValue =
              Array.isArray(item)
                ? item.length > 0
                  ? item.join(", ")
                  : "None"
                : typeof item === "object"
                  ? JSON.stringify(item)
                  : String(item);

            lines.push(`${label}: ${displayValue}`);
          }
        });
      }

      if (data.note) {
        lines.push("");
        lines.push(data.note);
      }

      setMessage(lines.join("\n"));
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
          Enter a phone number, email address, website URL,
          or suspicious message to check for potential fraud indicators.
        </p>
      </div>

      <div className="checker-card">
        <div className="checker-tabs">
          {(
            [
              "Phone Number",
              "Email Address",
              "Message",
              "Website URL",
            ] as CheckMode[]
          ).map((item) => (
            <button
              key={item}
              type="button"
              className={`tab-button ${
                mode === item ? "active" : ""
              }`}
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
                : mode === "Website URL"
                  ? "Website URL"
                  : "Suspicious message"}
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
                  : mode === "Email Address"
                    ? "Enter an email address"
                    : "Enter a website URL"
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
            <p
              className="demo-message"
              role="status"
              style={{ whiteSpace: "pre-line" }}
            >
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
