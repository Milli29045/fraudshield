
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Search, Star, Smartphone, CheckCircle2 } from "lucide-react";

type AppItem = {
  id: number;
  name: string;
  category: string | null;
};

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

export default function SubmitReviewPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [appName, setAppName] = useState("");
  const [selectedAppId, setSelectedAppId] = useState("");
  const [content, setContent] = useState("");

  const [storeApps, setStoreApps] = useState<StoreApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
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
          err instanceof Error ? err.message : "Unable to load apps."
        );
      } finally {
        setLoading(false);
      }
    }

    loadApps();
  }, []);

  const filteredApps = useMemo(() => {
    const query = appName.trim().toLowerCase();

    if (!query || selectedAppId) return [];

    return apps
      .filter((app) => app.name.toLowerCase().includes(query))
      .slice(0, 10);
  }, [apps, appName, selectedAppId]);

  function handleAppNameChange(value: string) {
    setAppName(value);
    setSelectedAppId("");
    setStoreApps([]);
    setMessage("");
    setError("");
  }

  function selectDatabaseApp(app: AppItem) {
    setAppName(app.name);
    setSelectedAppId(String(app.id));
    setStoreApps([]);
    setError("");
    setMessage("");
  }

  async function handleStoreSearch() {
    const query = appName.trim();

    if (query.length < 2) {
      setError("Enter at least 2 characters to search apps.");
      return;
    }

    setSearching(true);
    setError("");
    setStoreApps([]);

    try {
      const response = await fetch(
        `/api/search-apps?q=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to search apps.");
      }

      setStoreApps(data.apps || []);

      if (!data.apps?.length) {
        setError("No store apps found. You can still enter the app name manually.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "App search failed."
      );
    } finally {
      setSearching(false);
    }
  }

  function selectStoreApp(app: StoreApp) {
    setAppName(app.name);
    setSelectedAppId("");
    setStoreApps([]);
    setMessage(`${app.name} selected from ${app.platform}.`);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const cleanAppName = appName.trim();
    const cleanContent = content.trim();

    if (!cleanAppName) {
      setError("Please enter or select an app name.");
      return;
    }

    if (cleanAppName.length > 150) {
      setError("App name must be 150 characters or fewer.");
      return;
    }

    if (!cleanContent) {
      setError("Please enter your review.");
      return;
    }

    if (cleanContent.length > 5000) {
      setError("Your review must be 5,000 characters or fewer.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = selectedAppId
        ? {
            appId: Number(selectedAppId),
            content: cleanContent,
          }
        : {
            appName: cleanAppName,
            content: cleanContent,
          };

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit your review.");
      }

      setMessage(data.message || "Your review was submitted successfully.");
      setContent("");
      setSelectedAppId("");
      setAppName("");
      setStoreApps([]);

      const appsResponse = await fetch("/api/apps");

      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApps(Array.isArray(appsData.apps) ? appsData.apps : []);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Star size={27} />
          </div>

          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            FraudShield Community
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Submit an App Review
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Share your app experience and help others make safer digital
            decisions.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-8">
          <form onSubmit={handleSubmit}>

            <div className="mb-6">
              <label
                htmlFor="appName"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                App Name
              </label>

              <div className="relative">
                <Smartphone
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="appName"
                  type="text"
                  value={appName}
                  onChange={(event) =>
                    handleAppNameChange(event.target.value)
                  }
                  placeholder="Search or enter an app name..."
                  maxLength={150}
                  required
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {selectedAppId && (
                <p className="mt-2 flex items-center gap-2 text-xs font-medium text-green-600">
                  <CheckCircle2 size={15} />
                  Existing database app selected
                </p>
              )}

              {!selectedAppId && appName.trim() && (
                <p className="mt-2 text-xs text-slate-500">
                  Select a suggestion or submit your own app name.
                </p>
              )}

              {loading && (
                <p className="mt-2 text-xs text-slate-400">
                  Loading existing apps...
                </p>
              )}

              {filteredApps.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <p className="border-b border-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
                    EXISTING APPS
                  </p>

                  {filteredApps.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => selectDatabaseApp(app)}
                      className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 transition last:border-0 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <span className="font-medium">{app.name}</span>
                      <span className="text-xs text-slate-400">
                        {app.category || "App"}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleStoreSearch}
                disabled={searching || appName.trim().length < 2}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Search size={17} />
                {searching
                  ? "Searching stores..."
                  : "Search Google Play & Apple Store"}
              </button>

              {storeApps.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    App Store Search Results ({storeApps.length})
                  </p>

                  {storeApps.map((app, index) => (
                    <button
                      key={`${app.platform}-${app.id}-${index}`}
                      type="button"
                      onClick={() => selectStoreApp(app)}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50"
                    >
                      {app.icon ? (
                        <img
                          src={app.icon}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                          <Smartphone size={22} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {app.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {app.platform}
                          {app.rating !== null
                            ? ` • Rating ${app.rating.toFixed(1)}/5`
                            : ""}
                        </p>
                      </div>

                      <span className="text-xs font-semibold text-blue-600">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-5">
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Your Review
              </label>

              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Describe your experience with this app..."
                rows={6}
                maxLength={5000}
                required
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              <p className="mt-2 text-right text-xs text-slate-400">
                {content.length}/5000 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !appName.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Star size={17} />
              {submitting ? "Submitting Review..." : "Submit Review"}
            </button>
          </form>

          {message && (
            <div
              role="status"
              className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
            >
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          FraudShield helps users share app experiences and improve digital awareness.
        </p>

      </div>
    </main>
  );
}
