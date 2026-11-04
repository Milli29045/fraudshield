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
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg border border-blue-100 group-hover:scale-105 transition-transform">
            🛡️
          </div>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">
            Fraud<span className="text-blue-600">Shield</span>
          </span>
        </Link>

        {/* Navigation Links - Centered & Single Line */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href.split("#")[0];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/60"
                }`}
              >
                <Icon size={15} className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          
    {/* Report Fraud Button */}
<Link
  href="/reports"
  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all active:scale-[0.98]"
>
  <Flag size={15} className="text-white" />
  <span className="hidden sm:inline text-white">Report Fraud</span>
</Link>

          {loading ? (
            <span className="text-xs text-slate-400 animate-pulse px-2">Loading...</span>
          ) : user ? (
            <>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-2 rounded-lg transition-colors"
                >
                  Admin
                </Link>
              )}

              {/* Welcome Capsule */}
              <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg">
                <ShieldCheck size={16} className="text-blue-600" />
                <span>Welcome, <strong className="text-slate-900">{user.name || "User"}</strong></span>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <LogOut size={15} />
                <span>{loggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}