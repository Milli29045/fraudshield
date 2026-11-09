

"use client";

import { useState, type FormEvent } from "react";
type StoreApp = {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  rating: number | null;
  installs: string | null;
  platform: "Android" | "iOS";
  storeUrl: string;
};
import Navbar from "./Components/Navbar";
import Hero from "./Components/Hero";
import Checker from "./Components/Checker";
import Link from "next/link";
type CheckMode = "Phone Number" | "Email Address" | "Message";

export default function Home() {
  const [mode, setMode] = useState<CheckMode>("Phone Number");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [appQuery, setAppQuery] = useState("");
const [apps, setApps] = useState<StoreApp[]>([]);
const [appLoading, setAppLoading] = useState(false);
const [appError, setAppError] = useState("");

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
async function handleAppSearch(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (appQuery.trim().length < 2) {
    setAppError("Please enter at least 2 characters.");
    setApps([]);
    return;
  }

  setAppLoading(true);
  setAppError("");
  setApps([]);

  try {
    const response = await fetch(
      `/api/search-apps?q=${encodeURIComponent(appQuery.trim())}`
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to search apps.");
    }

    setApps(data.apps || []);

    if (!data.apps?.length) {
      setAppError("No apps found. Please try another search.");
    }
  } catch (error) {
    setAppError(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again."
    );
  } finally {
    setAppLoading(false);
  }
}
  return (
    <main>
      <Navbar />
      
    <Hero />
     
<section id="features" className="bg-gradient-to-b from-white to-blue-50 px-5 py-20 sm:px-8">
  <div className="mx-auto max-w-7xl">

    <div className="mb-14 text-center">
      <span className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold tracking-widest text-blue-600">
        OUR SECURITY FEATURES
      </span>

      <h2 className="mt-5 text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Protect Yourself from
        <span className="text-blue-600"> Online Threats</span>
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
        Explore FraudShield security tools designed to help you
        recognize suspicious activities and make safer digital decisions.
      </p>
    </div>

    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">

      {/* Phone Detection */}

      <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&q=80"
            alt="Smartphone security"
            className="h-48 w-full object-cover transition duration-500 group-hover:scale-110"
          />
        </div>

        <div className="p-6">
          <div className="mb-3 text-3xl">📱</div>
          <h3 className="text-lg font-bold text-slate-900">
            Phone Fraud Detection
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Check suspicious phone numbers and stay aware of
            potentially fraudulent contacts.
          </p>
          <a href="#checker" className="mt-5 inline-block text-sm font-bold text-blue-600 hover:text-blue-800">
            Check Number →
          </a>
        </div>
      </article>

      {/* Email Detection */}

      <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=700&q=80"
            alt="Email security"
            className="h-48 w-full object-cover transition duration-500 group-hover:scale-110"
          />
        </div>

        <div className="p-6">
          <div className="mb-3 text-3xl">📧</div>
          <h3 className="text-lg font-bold text-slate-900">
            Email Fraud Detection
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Examine suspicious email addresses and identify
            possible warning signs.
          </p>
          <a href="#checker" className="mt-5 inline-block text-sm font-bold text-blue-600 hover:text-blue-800">
            Check Email →
          </a>
        </div>
      </article>

      {/* Website Safety */}

      <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=700&q=80"
            alt="Cybersecurity and website protection"
            className="h-48 w-full object-cover transition duration-500 group-hover:scale-110"
          />
        </div>

        <div className="p-6">
          <div className="mb-3 text-3xl">🌐</div>
          <h3 className="text-lg font-bold text-slate-900">
            Website Safety
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Review website links and look for suspicious
            or potentially unsafe destinations.
          </p>
          <Link href="/app-checker" className="mt-5 inline-block text-sm font-bold text-blue-600 hover:text-blue-800">
            Check Website →
          </Link>
        </div>
      </article>

      {/* Message Detection */}

      <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=700&q=80"
            alt="Messaging and online communication"
            className="h-48 w-full object-cover transition duration-500 group-hover:scale-110"
          />
        </div>

        <div className="p-6">
          <div className="mb-3 text-3xl">💬</div>
          <h3 className="text-lg font-bold text-slate-900">
            Scam Message Detection
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Analyze suspicious messages and understand
            potential scam warning signs.
          </p>
          <a href="#checker" className="mt-5 inline-block text-sm font-bold text-blue-600 hover:text-blue-800">
            Check Message →
          </a>
        </div>
      </article>

    </div>
  </div>
</section>
<section id="all-apps" className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-10 sm:px-6 lg:py-12">
  <div className="mx-auto max-w-4xl text-center">
    <span className="mb-3 inline-block rounded-full border border-blue-100 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 shadow-sm">
      FraudShield App Discovery
    </span>

    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
      Search Any App. <span className="text-blue-600">Stay Safe.</span>
    </h2>

    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
      Discover Android and iOS applications from Google Play Store and Apple App Store.
    </p>

    <form
      onSubmit={handleAppSearch}
      className="mx-auto mt-7 flex max-w-2xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-blue-100/60 sm:flex-row"
    >
      <input
        type="text"
        value={appQuery}
        onChange={(event) => setAppQuery(event.target.value)}
        placeholder="Search WhatsApp, Instagram, Facebook..."
        aria-label="Search apps"
        className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100"
      />

      <button
        type="submit"
        disabled={appLoading}
        className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {appLoading ? "Searching..." : "Search Apps"}
      </button>
    </form>

    <p className="mt-3 text-xs text-slate-400">
      Search applications across Android and iOS platforms.
    </p>

    {appError && (
      <p className="mt-4 text-sm font-medium text-red-600">
        {appError}
      </p>
    )}

    {apps.length > 0 && (
      <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
        {apps.map((app, index) => (
          <article
            key={`${app.platform}-${app.id}-${index}`}
            className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            {app.icon && (
              <img
                src={app.icon}
                alt={app.name}
                className="h-14 w-14 rounded-xl object-cover"
              />
            )}

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-800">{app.name}</h3>

              <p className="mt-1 text-xs font-semibold text-blue-600">
                {app.platform}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {app.rating !== null
                  ? `Rating: ${app.rating.toFixed(1)} / 5`
                  : "Rating unavailable"}
              </p>

              <a
                href={app.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-bold text-blue-600 hover:underline"
              >
                View App →
              </a>
            </div>
          </article>
        ))}
      </div>
    )}
  </div>
</section>
  
     
<section
  id="how-it-works"
  className="relative overflow-hidden bg-slate-950 px-5 py-24 sm:px-8"
>
  <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
  <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

  <div className="relative mx-auto max-w-7xl">

    <div className="mb-16 text-center">
      <span className="inline-block rounded-full border border-blue-400/30 bg-blue-500/10 px-5 py-2 text-xs font-bold tracking-widest text-blue-300">
        HOW IT WORKS
      </span>

      <h2 className="mt-6 text-3xl font-extrabold text-white sm:text-5xl">
        Your Safety in
        <span className="text-blue-400"> 3 Simple Steps</span>
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
        FraudShield helps you make informed decisions before
        interacting with suspicious contacts and online platforms.
      </p>
    </div>

    <div className="grid gap-7 md:grid-cols-3">

      <article className="group rounded-3xl border border-white/10 bg-white/[0.04] p-8 transition duration-300 hover:-translate-y-2 hover:border-blue-400/50 hover:bg-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 text-3xl">
            🔍
          </div>
          <span className="text-5xl font-black text-white/10">01</span>
        </div>

        <h3 className="mt-8 text-xl font-bold text-white">
          Enter Information
        </h3>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          Enter a suspicious phone number, email address,
          website link or message into the FraudShield checker.
        </p>

        <div className="mt-7 h-1 w-12 rounded-full bg-blue-500 transition-all group-hover:w-20" />
      </article>

      <article className="group rounded-3xl border border-white/10 bg-white/[0.04] p-8 transition duration-300 hover:-translate-y-2 hover:border-blue-400/50 hover:bg-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/15 text-3xl">
            🛡️
          </div>
          <span className="text-5xl font-black text-white/10">02</span>
        </div>

        <h3 className="mt-8 text-xl font-bold text-white">
          Analyze the Results
        </h3>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          FraudShield analyzes the submitted information
          and helps identify possible suspicious activity.
        </p>

        <div className="mt-7 h-1 w-12 rounded-full bg-indigo-500 transition-all group-hover:w-20" />
      </article>

      <article className="group rounded-3xl border border-white/10 bg-white/[0.04] p-8 transition duration-300 hover:-translate-y-2 hover:border-blue-400/50 hover:bg-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-3xl">
            ✅
          </div>
          <span className="text-5xl font-black text-white/10">03</span>
        </div>

        <h3 className="mt-8 text-xl font-bold text-white">
          Stay Protected
        </h3>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          Review the available findings and use caution
          before responding to suspicious contacts or links.
        </p>

        <div className="mt-7 h-1 w-12 rounded-full bg-emerald-500 transition-all group-hover:w-20" />
      </article>

    </div>

    <div className="mt-12 text-center">
      <a
        href="#checker"
        className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
      >
        Try FraudShield Now →
      </a>
    </div>

  </div>
</section>

<Checker />
    
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
  
    </main>
  );
}
