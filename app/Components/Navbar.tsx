
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import {
  Home,
  Star,
  LayoutGrid,
  Settings,
  ShieldCheck,
  MessageCircle,
  History,
  LogOut,
  Flag,
  Search,
  X,
} from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Submit Review", href: "/submit-review", icon: Star },
  { label: "Features", href: "/#features", icon: LayoutGrid },
  { label: "How It Works", href: "/#how-it-works", icon: Settings },
  { label: "App Checker", href: "/app-checker", icon: ShieldCheck },
  { label: "Detection History", href: "/detection-history", icon: History },
  { label: "Apps", href: "/apps", icon: LayoutGrid },
  { label: "Reviews", href: "/reviews", icon: MessageCircle },
  { label: "Community Chat", href: "/chat/community", icon: MessageCircle },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  useEffect(() => {
    async function checkUser() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkUser();
  }, []);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to logout. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (filteredItems.length > 0) {
      router.push(filteredItems[0].href);
      setSearchQuery("");
      setShowSearch(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* TOP ROW */}

        <div className="flex min-h-[68px] items-center justify-between gap-3">

          {/* Logo */}

          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xl text-blue-600 transition-transform group-hover:scale-105">
              🛡️
            </div>

            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              Fraud<span className="text-blue-600">Shield</span>
            </span>
          </Link>

          {/* SEARCH BAR */}

          <div className="relative hidden min-w-0 flex-1 max-w-sm sm:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                <Search size={18} className="shrink-0 text-slate-400" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearch(true);
                  }}
                  onFocus={() => setShowSearch(true)}
                  placeholder="Search FraudShield..."
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearch(false);
                    }}
                    className="text-slate-400 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>

            {/* SEARCH RESULTS */}

            {showSearch && searchQuery.trim() && (
              <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          setSearchQuery("");
                          setShowSearch(false);
                        }}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Icon size={17} />
                        {item.label}
                      </Link>
                    );
                  })
                ) : (
                  <p className="px-3 py-4 text-sm text-slate-500">
                    No matching pages found.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT ACTIONS */}

          <div className="flex shrink-0 items-center justify-end gap-2">

            <Link
              href="/reports"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
            >
              <Flag size={15} />
              <span className="hidden sm:inline">Report Fraud</span>
            </Link>

            {loading ? (
              <span className="px-2 text-xs text-slate-400">
                Loading...
              </span>
            ) : user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    <ShieldCheck size={15} />
                    <span>Admin</span>
                  </Link>
                )}

                <div className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 lg:flex">
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span>
                    Welcome,{" "}
                    <strong className="text-slate-900">
                      {user.name || "User"}
                    </strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  <LogOut size={15} />
                  <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:text-blue-600"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-lg bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM NAVIGATION */}

        <nav className="flex items-center justify-center gap-1 overflow-x-auto border-t border-slate-100 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href.split("#")[0];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 hover:scale-105 hover:text-blue-600 ${
                  isActive ? "text-blue-600" : "text-slate-600"
                }`}
              >
                <Icon
                  size={15}
                  className={isActive ? "text-blue-600" : "text-slate-400"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
