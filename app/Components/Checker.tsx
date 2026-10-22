
"use client";

import { useState, type FormEvent } from "react";

type CheckMode = "Phone Number" | "Email Address" | "Message";

export default function Checker() {
  const [mode, setMode] = useState<CheckMode>("Phone Number");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  function handleCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!value.trim()) {
      setMessage("Please enter information first.");
      return;
    }

    setMessage(
      "Demo only: No fraud analysis has been performed. Sentiment analysis and real detection will be added after backend integration."
    );
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
          Enter an app-related review, phone number, email,
          or message to explore the demo interface.
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
              placeholder="Enter an app review or suspicious message..."
            />
          ) : (
            <input
              id="check-input"
              type={mode === "Email Address" ? "email" : "tel"}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={
                mode === "Phone Number"
                  ? "Enter a phone number"
                  : "Enter an email address"
              }
            />
          )}

          <button className="primary-button check-button" type="submit">
            Explore Demo →
          </button>

          {message && (
            <p className="demo-message" role="status">
              {message}
            </p>
          )}

          <p className="privacy-note">
            Demo only. Do not enter private information. This tool
            does not currently verify fraud or analyze sentiment.
          </p>
        </form>
      </div>
    </section>
  );
}
