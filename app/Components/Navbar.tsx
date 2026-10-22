
export default function Navbar() {
  return (
    <header className="navbar">
      <a href="#home" className="brand" aria-label="FraudShield home">
        <span className="brand-icon">🛡️</span>
        <span>
          Fraud<span className="brand-highlight">Shield</span>
        </span>
      </a>

      <nav className="nav-links" aria-label="Main navigation">
        <a href="#home">Home</a>
        <a href="#features">Features</a>
        <a href="#how-it-works">How It Works</a>
      </nav>

      <a href="#checker" className="nav-button">
        Get Started
      </a>
    </header>
  );
}
