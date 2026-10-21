import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Link } from 'react-router-dom'
import "./Results.css";

const STATUS_LABELS = { pass: "Pass", warning: "Warning", fail: "Fail" };

const GRADE_COLOURS = {
  A: "#1D9E75",
  B: "#0F6E56",
  C: "#D97706",
  D: "#F97316",
  F: "#DC2626",
};

export default function Results() {
  const { scanId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchResult() {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/results/${scanId}`,
        );
        setResult(data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "Scan not found. It may have expired or the link is incorrect."
            : "Could not load scan results. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [scanId]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareLinkedIn() {
    const text = `I just ran a website security audit on ${result.url} using ShieldScan by StackWise — scored ${result.percentage}% (Grade ${result.grade}). Free tool for SA businesses:`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  // ── Addition 1: downloadPdf function ──
  function downloadPdf() {
    window.open(
      `${import.meta.env.VITE_API_URL}/api/results/${scanId}/pdf`,
      "_blank",
    );
  }

  // ── Loading state ──
  if (loading)
    return (
      <div className="results-loading">
        <div className="loading-ring">
          <svg viewBox="0 0 80 80" width="80" height="80">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#E6F5EF"
              strokeWidth="4"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#1D9E75"
              strokeWidth="4"
              strokeDasharray="60 154"
              strokeLinecap="round"
              className="scan-arc"
            />
          </svg>
        </div>
        <p>Loading results…</p>
      </div>
    );

  // ── Error state ──
  if (error)
    return (
      <div className="results-loading">
        <p className="load-error">{error}</p>
        <button className="sidebar-btn" onClick={() => navigate("/")}>
          ← Back to scanner
        </button>
      </div>
    );

  const passCount = result.checks.filter((c) => c.status === "pass").length;
  const warnCount = result.checks.filter((c) => c.status === "warning").length;
  const failCount = result.checks.filter((c) => c.status === "fail").length;
  const gradeColour = GRADE_COLOURS[result.grade] || "#64748B";
  const scannedDate = new Date(result.scanned_at).toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Sort: fail first, then warning, then pass
  const STATUS_ORDER = { fail: 0, warning: 1, pass: 2 };
  const sortedChecks = [...result.checks].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );

  return (
    <main className="results">
      {/* ── Sidebar ── */}
      <aside className="results-sidebar">
        <div className="grade-card">
          <div
            className="grade-circle"
            style={{ borderColor: gradeColour, color: gradeColour }}
          >
            <span className="grade-letter">{result.grade}</span>
            <span className="grade-pct">{result.percentage}%</span>
          </div>
          <p className="grade-label" style={{ color: gradeColour }}>
            {result.label}
          </p>
          <p className="grade-score">
            {result.score} / {result.max_score} points
          </p>
        </div>

        {/* Score bar */}
        <div className="score-bar-card">
          <p className="score-bar-label">Score breakdown</p>
          <div className="score-bar-track">
            <div
              className="score-bar-fill"
              style={{
                width: `${result.percentage}%`,
                background: gradeColour,
              }}
            />
          </div>
          <div className="score-bar-legend">
            <span style={{ color: "var(--sw-pass)" }}>
              ✓ {passCount} passed
            </span>
            <span style={{ color: "var(--sw-warn)" }}>
              ⚠ {warnCount} warnings
            </span>
            <span style={{ color: "var(--sw-fail)" }}>
              ✕ {failCount} failed
            </span>
          </div>
        </div>

        <div className="sidebar-meta">
          <div className="meta-row">
            <span className="meta-key">URL</span>
            <span className="meta-val url-val">
              {result.url.replace(/^https?:\/\//, "")}
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-key">Scanned</span>
            <span className="meta-val">{scannedDate}</span>
          </div>
          <div className="meta-row">
            <span className="meta-key">Report ID</span>
            <span className="meta-val url-val">{result.scan_id}</span>
          </div>
        </div>

        {/* Action buttons */}
        {/* ── Addition 2: PDF button added at the top ── */}
        <button className="sidebar-btn pdf-btn" onClick={downloadPdf}>
          ⬇ Download PDF Report
        </button>

        <button className="sidebar-btn share-btn" onClick={copyLink}>
          {copied ? "✓ Link copied!" : "🔗 Copy report link"}
        </button>

        <button className="sidebar-btn linkedin-btn" onClick={shareLinkedIn}>
          Share on LinkedIn
        </button>

        <button className="sidebar-btn" onClick={() => navigate("/")}>
          ← Scan another site
        </button>
      </aside>

      {/* ── Report ── */}
      <section className="results-report">
        <div className="report-header">
          <h1 className="report-title">Security Report</h1>
          <p className="report-sub">
            Powered by <strong>StackWise (Pty) Ltd</strong> · ShieldScan
            <span className="report-sub-note">
              {" "}
              · Failed checks shown first
            </span>
          </p>
        </div>

        {failCount > 0 && (
          <div className="fix-first-banner">
            <span className="fix-first-icon">🔴</span>
            <div>
              <p className="fix-first-title">
                {failCount} issue{failCount > 1 ? "s" : ""} need attention
              </p>
              <p className="fix-first-sub">
                Fix the red items below to improve your grade immediately.
              </p>
            </div>
          </div>
        )}

        <div className="checks-list">
          {sortedChecks.map((check) => (
            <div className={`check-card check-${check.status}`} key={check.id}>
              <div className="check-top">
                <div className="check-left">
                  <span className={`check-badge badge-${check.status}`}>
                    {STATUS_LABELS[check.status]}
                  </span>
                  <h3 className="check-title">{check.title}</h3>
                </div>
                <div className="check-points">
                  <span className="pts-earned">{check.points_earned}</span>
                  <span className="pts-sep">/</span>
                  <span className="pts-total">{check.points_possible}</span>
                  <span className="pts-label">pts</span>
                </div>
              </div>
              <p className="check-detail">{check.detail}</p>
              {check.recommendation && (
                <div className="check-rec">
                  <span className="rec-icon">💡</span>
                  <p className="rec-text">{check.recommendation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="report-footer">
          <p>
            Report ID: <span className="footer-id">{result.scan_id}</span>
            {" · "}Generated by <strong>StackWise (Pty) Ltd</strong> ·
            ShieldScan
            {" · "}
            <a href="mailto:hello@stackwiseza.co.za">hello@stackwiseza.co.za</a>
            {" · "}
            <Link to="/privacy">Privacy Policy</Link>
            {" · "}
            <Link to="/terms">Terms of Use</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
