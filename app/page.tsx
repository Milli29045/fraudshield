

"use client";

import { useState, type FormEvent } from "react";
import Navbar from "./Components/Navbar";
import Hero from "./Components/Hero";
import Checker from "./Components/Checker";
type CheckMode = "Phone Number" | "Email Address" | "Message";

export default function Home() {
  const [mode, setMode] = useState<CheckMode>("Phone Number");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  function handleCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!value.trim()) {
      setMessage("Please enter a phone number, email, or message.");
      return;
    }

    setMessage(
      "Demo only: No fraud check has been performed yet. Backend integration will be added later."
    );
  }

  function changeMode(newMode: CheckMode) {
    setMode(newMode);
    setValue("");
    setMessage("");
  }

  return (
    <main>
      <Navbar />
    <Hero />
     

   <Checker />

      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="eyebrow">WHAT WE ARE BUILDING</span>
          <h2>Digital Safety, Made Simpler</h2>
          <p>
            FraudShield aims to bring useful safety tools together
            in one easy-to-use platform.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon blue">☎</div>
            <h3>Number Awareness</h3>
            <p>
              Help users review reports about suspicious phone numbers
              once the reporting system is connected.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon purple">✉</div>
            <h3>Email & Message Safety</h3>
            <p>
              Build tools that help users examine suspicious messages
              and understand possible warning signs.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon green">◈</div>
            <h3>Community Reports</h3>
            <p>
              Allow users to submit reports and help administrators
              review suspicious activity.
            </p>
          </article>
        </div>
      </section>

      <section className="steps-section" id="how-it-works">
        <div className="section-heading">
          <span className="eyebrow">HOW IT WORKS</span>
          <h2>Three Simple Steps</h2>
          <p>
            The planned user journey for the FraudShield platform.
          </p>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <span className="step-number">01</span>
            <h3>Enter Information</h3>
            <p>Enter a phone number, email address, or message.</p>
          </article>

          <article className="step-card">
            <span className="step-number">02</span>
            <h3>Review the Results</h3>
            <p>
              Once implemented, the system will analyze available
              information and relevant reports.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">03</span>
            <h3>Make an Informed Choice</h3>
            <p>
              Use verified information and caution before responding
              to suspicious contacts.
            </p>
          </article>
        </div>
      </section>

      <section className="cta-section">
        <div>
          <span className="eyebrow">STAY INFORMED</span>
          <h2>Your Safety Starts with Awareness.</h2>
          <p>
            Explore the demo today. Real detection features will
            require a connected backend and trusted data.
          </p>
        </div>

        <a href="#checker" className="cta-button">
          Try the Demo →
        </a>
      </section>

      <footer className="footer">
        <a href="#home" className="brand footer-brand">
          <span className="brand-icon">🛡️</span>
          <span>
            Fraud<span className="brand-highlight">Shield</span>
          </span>
        </a>

  <p>
  © 2026 FraudShield. Built for safer digital awareness.
</p>
      </footer>
    </main>
  );
}
