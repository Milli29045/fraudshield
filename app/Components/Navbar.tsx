
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
  Menu,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      setMobileMenuOpen(false);
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
      setMobileMenuOpen(false);
    }
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
    setSearchQuery("");
    setShowSearch(false);
  }

  function renderNavLinks(mobile = false) {
    return navItems.map((item) => {
      const Icon = item.icon;

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={mobile ? closeMobileMenu : undefined}
          className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:!text-blue-600 ${
            mobile
              ? "w-full"
              : "shrink-0 whitespace-nowrap px-3 py-2 text-xs"
          }`}
        >
          <Icon
            size={mobile ? 19 : 15}
            className="shrink-0 text-slate-400 transition-colors duration-200 group-hover:!text-blue-600"
          />

          <span className="transition-colors duration-200 group-hover:!text-blue-600">
            {item.label}
          </span>
        </Link>
      );
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

        {/* TOP BAR */}

        <div className="flex min-h-[68px] items-center justify-between gap-2">

          {/* LOGO */}

          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex shrink-0 items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xl text-blue-600 sm:h-10 sm:w-10">
              🛡️
            </div>

            <span className="text-lg font-extrabold tracking-tight text-slate-800 sm:text-xl">
              Fraud<span className="text-blue-600">Shield</span>
            </span>
          </Link>

          {/* DESKTOP SEARCH */}

          <div className="relative hidden min-w-0 max-w-sm flex-1 sm:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
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
                    aria-label="Clear search"
                  >
                    <X size={16} className="text-slate-400" />
                  </button>
                )}
              </div>
            </form>

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
                        className="group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:!text-blue-600"
                      >
                        <Icon
                          size={17}
                          className="text-slate-400 transition-colors duration-200 group-hover:!text-blue-600"
                        />
                        <span>{item.label}</span>
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

          {/* DESKTOP ACTIONS */}

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <Link
              href="/reports"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Flag size={15} />
              Report Fraud
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
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <ShieldCheck size={15} />
                    Admin
                  </Link>
                )}

                <div className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 lg:flex">
                  <ShieldCheck size={16} className="text-blue-600" />
                  Welcome, <strong>{user.name || "User"}</strong>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <LogOut size={15} />
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-lg bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* MOBILE REPORT + MENU BUTTON */}

          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <Link
              href="/reports"
              aria-label="Report Fraud"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white"
            >
              <Flag size={19} />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm"
            >
              {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>

        {/* DESKTOP NAVIGATION */}

        <nav className="hidden items-center justify-center gap-1 overflow-x-auto border-t border-slate-100 py-2 md:flex">
          {renderNavLinks()}
        </nav>

        {/* MOBILE MENU */}

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 py-4 md:hidden">

            {/* MOBILE SEARCH */}

            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-500">
                <Search size={18} className="shrink-0 text-slate-400" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages..."
                  className="w-full bg-transparent px-3 py-3 text-sm text-slate-700 outline-none"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X size={17} className="text-slate-400" />
                  </button>
                )}
              </div>
            </form>

            {/* NAVIGATION LINKS */}

            <nav className="flex max-h-[55vh] flex-col gap-1 overflow-y-auto">
              {searchQuery.trim()
                ? filteredItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:!text-blue-600"
                      >
                        <Icon
                          size={19}
                          className="text-slate-400 transition-colors duration-200 group-hover:!text-blue-600"
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })
                : renderNavLinks(true)}
            </nav>

            {/* MOBILE ACCOUNT ACTIONS */}

            <div className="mt-4 border-t border-slate-200 pt-4">
              {loading ? (
                <p className="px-3 py-2 text-sm text-slate-400">
                  Loading account...
                </p>
              ) : user ? (
                <div className="flex flex-col gap-2">
                  <p className="px-3 py-2 text-sm text-slate-600">
                    Welcome, <strong>{user.name || "User"}</strong>
                  </p>

                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <ShieldCheck size={19} />
                      Admin Panel
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <LogOut size={19} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="rounded-lg border border-slate-200 px-3 py-3 text-center text-sm font-semibold text-slate-700 hover:text-blue-600"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="rounded-lg bg-blue-600 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
