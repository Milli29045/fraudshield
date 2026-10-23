
export default function Navbar() {
  return (
    <header className="navbar" id="home">
      <a href="/" className="brand" aria-label="FraudShield home">
        <span className="brand-icon">🛡️</span>
        <span>
          Fraud<span className="brand-highlight">Shield</span>
        </span>
      </a>

      <nav className="nav-links" aria-label="Main navigation">
        <a href="/submit-review">Submit Review</a>
        <a href="/">Home</a>
        <a href="/#features">Features</a>
        <a href="/#how-it-works">How It Works</a>
        <a href="/#checker">App Checker</a>
        <a href="/apps">Apps</a>
        <a href="/reviews">Reviews</a>
      </nav>

      <div className="nav-actions">
        <a href="/login" className="nav-login">
          Login
        </a>

        <a href="/register" className="nav-button">
          Register
        </a>
      </div>
    </header>
  );
}
