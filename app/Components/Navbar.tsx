
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Star,
  LayoutGrid,
  Settings,
  ShieldCheck,
  MessageCircle,
    History,
  LogOut,
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
  <header
  className={`navbar ${
    user?.role === "admin" ? "admin-navbar" : "user-navbar"
  }`}
>
      <a href="/" className="brand" aria-label="FraudShield home">
        <span className="brand-icon">🛡️</span>
        <span>
          Fraud<span className="brand-highlight">Shield</span>
        </span>
      </a>

     <nav className="nav-links" aria-label="Main navigation">
  {navItems.map((item) => {
    const Icon = item.icon;

    return (
      <a
        key={item.href}
        href={item.href}
        className={
          pathname === item.href.split("#")[0]
            ? "nav-item active"
            : "nav-item"
        }
      >
        <Icon size={17} strokeWidth={2} />
        <span>{item.label}</span>
      </a>
    );
  })}
</nav>

      <div className="nav-actions">
        {loading ? (
          <span className="nav-loading">Loading...</span>
        ) : user ? (
          <>
            {user.role === "admin" && (
              <a href="/admin" className="admin-link">
                Admin Dashboard
              </a>
            )}

         <div className="welcome-capsule">
  <ShieldCheck size={21} />
  <span>Welcome to <strong>FraudShield</strong></span>
</div>
<button
  type="button"
  className="nav-button logout-button"
  onClick={handleLogout}
  disabled={loggingOut}
>
  <LogOut size={17} />
  {loggingOut ? "Logging out..." : "Logout"}
</button>
          </>
        ) : (
          <>
            <a href="/login" className="nav-login">Login</a>
            <a href="/register" className="nav-button">Register</a>
          </>
        )}
      </div>
    </header>
  );
}
