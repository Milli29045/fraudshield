
export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <span className="eyebrow">
          YOUR DIGITAL SAFETY PARTNER
        </span>

        <h1>
  Fraud App Detection
  <br />
  with <span className="highlight">Sentiment Analysis.</span>
</h1>

        <p className="hero-description">
          Take a step toward safer digital experiences.
          FraudShield is being built to help you identify
          suspicious phone numbers, emails, and messages.
        </p>

        <div className="hero-actions">
          <a href="#checker" className="primary-button">
            Try the Demo <span aria-hidden="true">→</span>
          </a>

          <a href="#how-it-works" className="secondary-button">
            Learn More
          </a>
        </div>

        <div className="trust-note">
          <span className="status-dot" />
          A smarter approach to digital awareness
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />

        <div className="shield-card">
          <div className="shield-symbol">✓</div>
          <span className="shield-caption">SAFETY FIRST</span>
          <h3>Your Digital Shield</h3>
          <p>Think before you click.</p>
        </div>

        <div className="floating-card floating-top">
          <span className="floating-icon">✉</span>
          <span>
            <strong>Email Safety</strong>
            <small>Stay alert online</small>
          </span>
        </div>

        <div className="floating-card floating-bottom">
          <span className="floating-icon">☎</span>
          <span>
            <strong>Call Awareness</strong>
            <small>Check before trusting</small>
          </span>
        </div>
      </div>
    </section>
  );
}
