import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Home.css";

const SCAN_STEPS = [
  "Checking HTTPS encryption…",
  "Validating SSL certificate…",
  "Inspecting security headers…",
  "Following redirect chain…",
  "Reading robots.txt…",
  "Checking server header…",
  "Calculating security score…",
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleScan(e) {
    e.preventDefault();
    if (!url.trim()) return;

    setError("");
    setScanning(true);
    setStepIndex(0);

    // Cycle through step messages while waiting
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1 < SCAN_STEPS.length ? i + 1 : i));
    }, 600);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/scan`,
        { url },
      );
      clearInterval(interval);
      // Store result and navigate
      // NEW
      navigate(`/results/${data.scan_id}`);
    } catch (err) {
      clearInterval(interval);
      setScanning(false);
      setError(
        err.response?.data?.error ||
          "Could not reach the scanner. Make sure the backend is running.",
      );
    }
  }

  return (
    <main className="home">
      <div className="home-hero">
        <div className="hero-badge">Free Security Audit</div>
        <h1 className="hero-title">
          Is your website
          <br />
          <span className="hero-accent">actually secure?</span>
        </h1>
        <p className="hero-sub">
          ShieldScan checks your site for real security issues in seconds —
          HTTPS, SSL certificates, security headers, and more. Get a grade. Fix
          what matters.
        </p>

        <form className="scan-form" onSubmit={handleScan}>
          <div className="scan-input-row">
            <input
              className="scan-input"
              type="text"
              placeholder="https://yourbusiness.co.za"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={scanning}
              spellCheck={false}
              autoComplete="off"
            />
            <button className="scan-btn" type="submit" disabled={scanning}>
              {scanning ? "Scanning…" : "Scan now"}
            </button>
          </div>
          {error && (
            <div className="scan-error">
              {error.includes("Daily scan limit") ? (
                <p>
                  Daily scan limit reached. ShieldScan allows 5 free scans per
                  day.{" "}
                  <a
                    href="mailto:stackwiseza@gmail.com?subject=ShieldScan%20Unlimited%20Access&body=Hi%20StackWise%2C%0A%0AI%27ve%20reached%20my%20daily%20scan%20limit%20on%20ShieldScan%20and%20would%20like%20to%20discuss%20unlimited%20access.%0A%0AMy%20website%3A%20%0AMy%20name%3A%20%0A%0AThank%20you"
                    className="scan-error-link"
                  >
                    Click here to request unlimited access →
                  </a>
                </p>
              ) : (
                <p>{error}</p>
              )}
            </div>
          )}
        </form>

        {scanning && (
          <div className="scanning-state">
            <div className="scan-ring">
              <div className="scan-ring-inner">
                <svg className="scan-svg" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="#E0F2F1"
                    strokeWidth="4"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="#00BFA5"
                    strokeWidth="4"
                    strokeDasharray="60 154"
                    strokeLinecap="round"
                    className="scan-arc"
                  />
                </svg>
                <span className="scan-icon">🛡️</span>
              </div>
            </div>
            <p className="scan-step">{SCAN_STEPS[stepIndex]}</p>
          </div>
        )}
      </div>

      <div className="home-checks">
        <p className="checks-label">What ShieldScan checks</p>
        <div className="checks-grid">
          {[
            ["🔒", "HTTPS encryption"],
            ["📜", "SSL certificate"],
            ["🛡️", "Security headers"],
            ["↪️", "Redirect chain"],
            ["🤖", "robots.txt exposure"],
            ["🖥️", "Server disclosure"],
          ].map(([icon, label]) => (
            <div className="check-chip" key={label}>
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <footer className="home-footer">
        <span>
          Powered by <strong>StackWise (Pty) Ltd</strong>
        </span>
        <span className="footer-dot">·</span>
        <span>stackwiseza@gmail.com</span>
        <span className="footer-dot">·</span>
        <Link to="/privacy" className="footer-privacy">
          Privacy Policy
        </Link>
      </footer>
    </main>
  );
}
