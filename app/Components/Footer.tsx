
import Link from "next/link";

const socialLinks = [
  {
    name: "WhatsApp",
    href: "https://wa.me/923220752013",
    icon: "☏",
    color: "hover:bg-green-500",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/",
    icon: "▶",
    color: "hover:bg-red-600",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/",
    icon: "◎",
    color: "hover:bg-pink-600",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/",
    icon: "f",
    color: "hover:bg-blue-600",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: "in",
    color: "hover:bg-sky-600",
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#07152f] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          <div>
            <h2 className="text-3xl font-extrabold">
              Fraud<span className="text-blue-400">Shield</span> 🛡️
            </h2>

            <p className="mt-5 max-w-xs text-sm leading-7 text-gray-300">
              Your trusted digital safety partner. Detect online scams,
              identify suspicious activities and stay protected.
            </p>

            <p className="mt-5 text-sm font-semibold text-blue-400">
              Your Digital Safety Partner
            </p>

            <h3 className="mt-7 mb-4 text-lg font-bold">
              Follow Us
            </h3>

            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:text-white ${social.color}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold">Quick Links</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li>
                <Link href="/" className="hover:text-blue-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/chat/community" className="hover:text-blue-400">
                  Community Chat
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-blue-400">
                  App Reviews
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold">Our Services</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li>📱 Phone Number Checking</li>
              <li>📧 Email Fraud Detection</li>
              <li>🌐 Website Safety Checking</li>
              <li>💬 Scam Message Detection</li>
              <li>🤖 AI Safety Assistant</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold">Stay Protected</h3>

            <p className="text-sm leading-7 text-gray-300">
              Think before you click. Never share your passwords, OTPs
              or banking information with unknown people.
            </p>

            <div className="mt-6 rounded-xl border border-blue-400/20 bg-blue-400/10 p-4">
              <p className="font-semibold text-blue-300">
                Your Security Matters
              </p>
              <p className="mt-2 text-xs text-gray-300">
                Stay alert. Stay informed. Stay safe.
              </p>
            </div>

            <a
              href="https://wa.me/923220752013"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <span>☏</span>
              Chat with us on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-7">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} FraudShield. All rights reserved.
            </p>

            <p className="text-xs text-gray-400">
              Built for a Safer Digital World 💙
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
