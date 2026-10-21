import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Admin.css";

const API = import.meta.env.VITE_API_URL;

function getToken() {
  return sessionStorage.getItem("admin_token");
}
function setToken(t) {
  sessionStorage.setItem("admin_token", t);
}
function clearToken() {
  sessionStorage.removeItem("admin_token");
}

const authHeaders = () => ({ "X-Admin-Token": getToken() });

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${API}/api/admin/login`, { password });
      setToken(data.token);
      onLogin();
    } catch {
      setError("Invalid password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h1 className="admin-login-title">ShieldScan Admin</h1>
        <p className="admin-login-sub">StackWise internal dashboard</p>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
            required
          />
          {error && <p className="admin-error">{error}</p>}
          <button
            type="submit"
            className="admin-btn-primary"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Stats cards ───────────────────────────────────────────────────────────────
function StatsCards({ stats }) {
  const cards = [
    { label: "Total scans", value: stats.total_scans },
    { label: "Scans today", value: stats.scans_today },
    { label: "Rate limit hits", value: stats.rate_limit_hits },
    { label: "Hits today", value: stats.rate_hits_today },
  ];
  return (
    <div className="admin-stats-grid">
      {cards.map((c) => (
        <div className="admin-stat-card" key={c.label}>
          <div className="admin-stat-n">{c.value}</div>
          <div className="admin-stat-l">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Grade breakdown ───────────────────────────────────────────────────────────
function GradeBreakdown({ grades }) {
  const GRADE_COLOURS = {
    A: "#1C1C1C",
    B: "#333333",
    C: "#B45309",
    D: "#F97316",
    F: "#DC2626",
  };
  return (
    <div className="admin-card">
      <h3 className="admin-card-title">Grade breakdown</h3>
      <div className="grade-breakdown">
        {Object.entries(grades).map(([grade, count]) => (
          <div className="grade-bar-row" key={grade}>
            <span
              className="grade-bar-label"
              style={{ color: GRADE_COLOURS[grade] }}
            >
              {grade}
            </span>
            <div className="grade-bar-track">
              <div
                className="grade-bar-fill"
                style={{
                  width: `${Math.min(100, (count / Math.max(...Object.values(grades), 1)) * 100)}%`,
                  background: GRADE_COLOURS[grade],
                }}
              />
            </div>
            <span className="grade-bar-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Daily volume ──────────────────────────────────────────────────────────────
function DailyVolume({ daily }) {
  const max = Math.max(...daily.map((d) => d.count), 1);
  return (
    <div className="admin-card">
      <h3 className="admin-card-title">Daily volume — last 7 days</h3>
      <div className="daily-chart">
        {daily.map((d) => (
          <div className="daily-col" key={d.date}>
            <div className="daily-bar-wrap">
              <div
                className="daily-bar"
                style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
              />
            </div>
            <span className="daily-label">{d.date.slice(5)}</span>
            <span className="daily-count">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Top sites ─────────────────────────────────────────────────────────────────
function TopSites({ sites }) {
  return (
    <div className="admin-card">
      <h3 className="admin-card-title">Most scanned sites</h3>
      <div className="top-sites">
        {sites.length === 0 && <p className="admin-empty">No data yet</p>}
        {sites.map((s, i) => (
          <div className="top-site-row" key={s.url}>
            <span className="top-site-rank">{i + 1}</span>
            <span className="top-site-url">
              {s.url.replace(/^https?:\/\//, "")}
            </span>
            <span className="top-site-count">{s.count} scans</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Scans table ───────────────────────────────────────────────────────────────
function ScansTable() {
  const [scans, setScans] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const GRADE_COLOURS = {
    A: "#1C1C1C",
    B: "#333333",
    C: "#B45309",
    D: "#F97316",
    F: "#DC2626",
  };

  async function fetchScans(p = 1, s = search) {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/admin/scans`, {
        headers: authHeaders(),
        params: { page: p, per_page: 20, search: s },
      });
      setScans(data.scans);
      setTotal(data.total);
      setPages(data.pages);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchScans(1);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchScans(1, search);
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="admin-card-title">Recent scans</h3>
        <form onSubmit={handleSearch} className="admin-search-form">
          <input
            className="admin-input-sm"
            placeholder="Search URL or IP…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="admin-btn-sm">
            Search
          </button>
          {search && (
            <button
              type="button"
              className="admin-btn-sm ghost"
              onClick={() => {
                setSearch("");
                fetchScans(1, "");
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>
      <p className="admin-total">{total} total scans</p>
      {loading ? (
        <p className="admin-empty">Loading…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Grade</th>
                <th>Score</th>
                <th>IP</th>
                <th>Scanned</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
              {scans.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    No scans found
                  </td>
                </tr>
              )}
              {scans.map((s) => (
                <tr key={s.scan_id}>
                  <td className="scan-url">
                    {s.url.replace(/^https?:\/\//, "")}
                  </td>
                  <td>
                    <span
                      className="grade-pill"
                      style={{
                        background: GRADE_COLOURS[s.grade],
                        color: "#fff",
                      }}
                    >
                      {s.grade}
                    </span>
                  </td>
                  <td>{s.percentage}%</td>
                  <td className="scan-ip">{s.ip_address || "—"}</td>
                  <td className="scan-date">
                    {new Date(s.scanned_at).toLocaleString("en-ZA", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td>
                    <a
                      href={`/results/${s.scan_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-link"
                    >
                      View →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="admin-pagination">
        <button
          className="admin-btn-sm"
          disabled={page <= 1}
          onClick={() => fetchScans(page - 1)}
        >
          ← Prev
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button
          className="admin-btn-sm"
          disabled={page >= pages}
          onClick={() => fetchScans(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ── Rate limit hits ───────────────────────────────────────────────────────────
function RateLimitHits() {
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/api/admin/rate-hits`, { headers: authHeaders() })
      .then((r) => setHits(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-card">
      <h3 className="admin-card-title">
        Rate limit hits — potential paying customers
      </h3>
      {loading ? (
        <p className="admin-empty">Loading…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>IP Address</th>
                <th>Times blocked</th>
                <th>Last hit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {hits.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-empty">
                    No rate limit hits yet
                  </td>
                </tr>
              )}
              {hits.map((h) => (
                <tr key={h.ip_address}>
                  <td className="scan-ip">{h.ip_address}</td>
                  <td>
                    <strong>{h.count}</strong>
                  </td>
                  <td className="scan-date">
                    {new Date(h.last_hit).toLocaleString("en-ZA", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td>
                    <button
                      className="admin-btn-sm"
                      onClick={() =>
                        navigator.clipboard.writeText(h.ip_address)
                      }
                    >
                      Copy IP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Whitelist ─────────────────────────────────────────────────────────────────
function Whitelist() {
  const [ips, setIps] = useState([]);
  const [ip, setIp] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function fetchWhitelist() {
    try {
      const { data } = await axios.get(`${API}/api/admin/whitelist`, {
        headers: authHeaders(),
      });
      setIps(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWhitelist();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      await axios.post(
        `${API}/api/admin/whitelist`,
        { ip_address: ip, note },
        { headers: authHeaders() },
      );
      setIp("");
      setNote("");
      fetchWhitelist();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add IP");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id) {
    if (!confirm("Remove this IP from the whitelist?")) return;
    await axios.delete(`${API}/api/admin/whitelist/${id}`, {
      headers: authHeaders(),
    });
    fetchWhitelist();
  }

  return (
    <div className="admin-card">
      <h3 className="admin-card-title">IP Whitelist — unlimited scans</h3>
      <form onSubmit={handleAdd} className="whitelist-form">
        <input
          className="admin-input-sm"
          placeholder="IP address"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          required
        />
        <input
          className="admin-input-sm"
          placeholder="Note (e.g. client name)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit" className="admin-btn-sm" disabled={adding}>
          {adding ? "Adding…" : "+ Add IP"}
        </button>
      </form>
      {error && <p className="admin-error">{error}</p>}
      {loading ? (
        <p className="admin-empty">Loading…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>IP Address</th>
                <th>Note</th>
                <th>Added</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ips.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-empty">
                    No whitelisted IPs
                  </td>
                </tr>
              )}
              {ips.map((i) => (
                <tr key={i.id}>
                  <td className="scan-ip">{i.ip_address}</td>
                  <td>{i.note || "—"}</td>
                  <td className="scan-date">
                    {new Date(i.added_at).toLocaleString("en-ZA", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td>
                    <button
                      className="admin-btn-sm danger"
                      onClick={() => handleRemove(i.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main admin ────────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(!!getToken());
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authed) return;
    axios
      .get(`${API}/api/admin/stats`, { headers: authHeaders() })
      .then((r) => setStats(r.data))
      .catch(() => {
        clearToken();
        setAuthed(false);
      });
  }, [authed]);

  function handleLogout() {
    clearToken();
    setAuthed(false);
  }

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <div className="admin">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">ShieldScan Admin</h1>
          <p className="admin-sub">StackWise internal dashboard</p>
        </div>
        <button className="admin-btn-sm ghost" onClick={handleLogout}>
          Sign out
        </button>
      </div>

      <div className="admin-tabs">
        {[
          ["dashboard", "Dashboard"],
          ["scans", "All scans"],
          ["ratelimit", "Rate limit hits"],
          ["whitelist", "Whitelist"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`admin-tab ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {tab === "dashboard" && stats && (
          <>
            <StatsCards stats={stats} />
            <div className="admin-two-col">
              <GradeBreakdown grades={stats.grade_breakdown} />
              <TopSites sites={stats.top_sites} />
            </div>
            <DailyVolume daily={stats.daily_volume} />
          </>
        )}
        {tab === "scans" && <ScansTable />}
        {tab === "ratelimit" && <RateLimitHits />}
        {tab === "whitelist" && <Whitelist />}
      </div>
    </div>
  );
}
