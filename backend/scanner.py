import requests
import ssl
import socket
import certifi
import urllib.parse
from datetime import datetime, timezone
from requests.exceptions import SSLError, ConnectionError, Timeout


# ── Scoring weights (total = 100 points) ─────────────────────────────────────
SCORES = {
    "https":            15,
    "ssl_cert":         20,
    "hsts":             10,
    "csp":              10,
    "x_frame":          10,
    "x_content_type":    8,
    "referrer_policy":   7,
    "redirect_chain":   10,
    "robots_txt":        5,
    "server_header":     5,
}
MAX_SCORE = sum(SCORES.values())  # 100


# ── Grade thresholds ──────────────────────────────────────────────────────────
def score_to_grade(pct: float) -> dict:
    if pct >= 90:
        return {"grade": "A", "label": "Excellent",  "colour": "#22c55e"}
    if pct >= 75:
        return {"grade": "B", "label": "Good",       "colour": "#84cc16"}
    if pct >= 60:
        return {"grade": "C", "label": "Fair",       "colour": "#eab308"}
    if pct >= 45:
        return {"grade": "D", "label": "Poor",       "colour": "#f97316"}
    return     {"grade": "F", "label": "Critical",   "colour": "#ef4444"}


# ── Helpers ───────────────────────────────────────────────────────────────────
def _status(passed: bool, warning: bool = False) -> str:
    if passed:   return "pass"
    if warning:  return "warning"
    return "fail"


def _make_result(check_id: str, title: str, status: str,
                 detail: str, recommendation: str, points_earned: int) -> dict:
    colours = {"pass": "#22c55e", "warning": "#eab308", "fail": "#ef4444"}
    return {
        "id":              check_id,
        "title":           title,
        "status":          status,
        "colour":          colours[status],
        "detail":          detail,
        "recommendation":  recommendation,
        "points_earned":   points_earned,
        "points_possible": SCORES[check_id],
    }


def _get_response(url: str, allow_redirects: bool = True, timeout: int = 10):
    """Return (response | None, error_string | None)."""
    headers = {"User-Agent": "ShieldScan/1.0 (StackWise Security Auditor)"}
    try:
        r = requests.get(url, headers=headers,
                         allow_redirects=allow_redirects,
                         timeout=timeout, verify=True)
        return r, None
    except SSLError as e:
        return None, f"SSL error: {e}"
    except ConnectionError:
        return None, "Could not connect to host"
    except Timeout:
        return None, "Request timed out"
    except Exception as e:
        return None, str(e)


# ── Check 1: HTTPS vs HTTP ────────────────────────────────────────────────────
def check_https(url: str) -> dict:
    parsed   = urllib.parse.urlparse(url)
    is_https = parsed.scheme == "https"
    return _make_result(
        "https",
        "HTTPS Encryption",
        _status(is_https),
        "Site is served over HTTPS." if is_https
            else "Site is served over plain HTTP — traffic is unencrypted.",
        "" if is_https
            else "Install an SSL/TLS certificate and redirect all HTTP traffic to HTTPS. "
                 "Free certificates are available via Let's Encrypt.",
        SCORES["https"] if is_https else 0,
    )


# ── Check 2: SSL Certificate ──────────────────────────────────────────────────
def check_ssl_cert(url: str) -> dict:
    parsed = urllib.parse.urlparse(url)
    host   = parsed.hostname

    if parsed.scheme != "https":
        return _make_result(
            "ssl_cert", "SSL Certificate", "fail",
            "No HTTPS — SSL certificate cannot be evaluated.",
            "Switch to HTTPS first.", 0,
        )

    try:
        ctx  = ssl.create_default_context(cafile=certifi.where())
        conn = ctx.wrap_socket(socket.create_connection((host, 443), timeout=10),
                               server_hostname=host)
        cert = conn.getpeercert()
        conn.close()

        expiry_str = cert["notAfter"]                         # e.g. "Jun 30 12:00:00 2025 GMT"
        expiry_dt  = datetime.strptime(expiry_str, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
        now        = datetime.now(timezone.utc)
        days_left  = (expiry_dt - now).days

        if days_left < 0:
            return _make_result(
                "ssl_cert", "SSL Certificate", "fail",
                f"Certificate expired {abs(days_left)} days ago.",
                "Renew your SSL certificate immediately. Use Let's Encrypt for free auto-renewal.", 0,
            )
        if days_left <= 30:
            pts = SCORES["ssl_cert"] // 2
            return _make_result(
                "ssl_cert", "SSL Certificate", "warning",
                f"Certificate valid but expires in {days_left} days.",
                "Renew your SSL certificate before it expires. Set up auto-renewal to avoid downtime.", pts,
            )
        return _make_result(
            "ssl_cert", "SSL Certificate", "pass",
            f"Certificate is valid and expires in {days_left} days ({expiry_dt.strftime('%d %b %Y')}).",
            "", SCORES["ssl_cert"],
        )

    except ssl.SSLCertVerificationError:
        return _make_result(
            "ssl_cert", "SSL Certificate", "fail",
            "Certificate is invalid or self-signed — browsers will show a security warning.",
            "Install a trusted certificate from a recognised Certificate Authority (CA).", 0,
        )
    except Exception as e:
        return _make_result(
            "ssl_cert", "SSL Certificate", "warning",
            f"Could not verify certificate: {e}",
            "Ensure your SSL certificate is correctly installed.", 0,
        )


# ── Check 3 – 7: Security Headers ────────────────────────────────────────────
def _check_header(check_id: str, title: str,
                  headers: dict, header_name: str,
                  good_detail: str, bad_detail: str,
                  recommendation: str) -> dict:
    value = headers.get(header_name, "")
    passed = bool(value)
    return _make_result(
        check_id, title,
        _status(passed),
        f"{good_detail} (value: `{value}`)" if passed else bad_detail,
        "" if passed else recommendation,
        SCORES[check_id] if passed else 0,
    )


def check_hsts(headers: dict) -> dict:
    return _check_header(
        "hsts", "HTTP Strict Transport Security (HSTS)",
        headers, "strict-transport-security",
        "HSTS header is present",
        "HSTS header is missing — browsers may allow unencrypted connections.",
        "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' to your server response headers.",
    )


def check_csp(headers: dict) -> dict:
    return _check_header(
        "csp", "Content Security Policy (CSP)",
        headers, "content-security-policy",
        "CSP header is present",
        "No Content Security Policy — the site is vulnerable to Cross-Site Scripting (XSS) attacks.",
        "Implement a Content Security Policy header. Start with "
        "'Content-Security-Policy: default-src \\'self\\'' and refine from there.",
    )


def check_x_frame(headers: dict) -> dict:
    return _check_header(
        "x_frame", "X-Frame-Options",
        headers, "x-frame-options",
        "X-Frame-Options header is present",
        "X-Frame-Options is missing — the site may be vulnerable to clickjacking attacks.",
        "Add 'X-Frame-Options: DENY' or 'X-Frame-Options: SAMEORIGIN' to prevent framing by other sites.",
    )


def check_x_content_type(headers: dict) -> dict:
    return _check_header(
        "x_content_type", "X-Content-Type-Options",
        headers, "x-content-type-options",
        "X-Content-Type-Options header is present",
        "X-Content-Type-Options is missing — browsers may sniff content types, enabling injection attacks.",
        "Add 'X-Content-Type-Options: nosniff' to your server response headers.",
    )


def check_referrer_policy(headers: dict) -> dict:
    return _check_header(
        "referrer_policy", "Referrer Policy",
        headers, "referrer-policy",
        "Referrer-Policy header is present",
        "Referrer-Policy is missing — the site may leak URL data to third-party sites.",
        "Add 'Referrer-Policy: strict-origin-when-cross-origin' to your server response headers.",
    )


# ── Check 8: Redirect Chain ───────────────────────────────────────────────────
def check_redirect_chain(url: str) -> dict:
    parsed   = urllib.parse.urlparse(url)
    http_url = f"http://{parsed.hostname}"

    resp, err = _get_response(http_url, allow_redirects=True)
    if err or resp is None:
        return _make_result(
            "redirect_chain", "HTTP → HTTPS Redirect", "warning",
            f"Could not follow redirect chain: {err}",
            "Ensure your server redirects all HTTP traffic to HTTPS.", 0,
        )

    chain    = [r.url for r in resp.history] + [resp.url]
    final_https = resp.url.startswith("https://")

    if final_https and len(resp.history) == 1:
        return _make_result(
            "redirect_chain", "HTTP → HTTPS Redirect", "pass",
            f"Clean single redirect: {' → '.join(chain)}",
            "", SCORES["redirect_chain"],
        )
    if final_https:
        pts = SCORES["redirect_chain"] // 2
        return _make_result(
            "redirect_chain", "HTTP → HTTPS Redirect", "warning",
            f"Redirects to HTTPS but chain is long ({len(resp.history)} hops): {' → '.join(chain)}",
            "Reduce redirect hops to a single HTTP → HTTPS redirect to improve performance.", pts,
        )
    return _make_result(
        "redirect_chain", "HTTP → HTTPS Redirect", "fail",
        f"HTTP does not redirect to HTTPS. Final URL: {resp.url}",
        "Configure your server to issue a 301 redirect from HTTP to HTTPS for all requests.", 0,
    )


# ── Check 9: robots.txt ───────────────────────────────────────────────────────
SENSITIVE_PATTERNS = [
    "/admin", "/wp-admin", "/phpmyadmin", "/cpanel", "/.env",
    "/config", "/backup", "/db", "/database", "/private",
    "/secret", "/api/internal", "/.git",
]

def check_robots_txt(url: str) -> dict:
    parsed    = urllib.parse.urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.hostname}/robots.txt"

    resp, err = _get_response(robots_url)
    if err or resp is None or resp.status_code == 404:
        return _make_result(
            "robots_txt", "robots.txt Exposure", "warning",
            "No robots.txt file found.",
            "Create a robots.txt file. While optional, it helps control crawler behaviour.",
            SCORES["robots_txt"] // 2,
        )

    content   = resp.text.lower()
    found     = [p for p in SENSITIVE_PATTERNS if p in content]

    if found:
        return _make_result(
            "robots_txt", "robots.txt Exposure", "warning",
            f"robots.txt exposes potentially sensitive paths: {', '.join(found)}",
            "Review your robots.txt. Listing sensitive paths in Disallow rules "
            "advertises them to attackers. Security through obscurity isn't a fix — "
            "secure those paths properly instead.",
            SCORES["robots_txt"] // 2,
        )
    return _make_result(
        "robots_txt", "robots.txt Exposure", "pass",
        "robots.txt exists and does not expose obviously sensitive paths.",
        "", SCORES["robots_txt"],
    )


# ── Check 10: Server Header ───────────────────────────────────────────────────
def check_server_header(headers: dict) -> dict:
    server = headers.get("server", "")
    if not server:
        return _make_result(
            "server_header", "Server Version Disclosure", "pass",
            "Server header is absent — software version is not disclosed.",
            "", SCORES["server_header"],
        )

    version_exposed = any(char.isdigit() for char in server)
    if version_exposed:
        return _make_result(
            "server_header", "Server Version Disclosure", "fail",
            f"Server header reveals software and version: '{server}'. "
            "Attackers can use this to find known vulnerabilities.",
            "Configure your web server to suppress or genericise the Server header. "
            "In Apache: 'ServerTokens Prod'. In Nginx: 'server_tokens off'.",
            0,
        )
    return _make_result(
        "server_header", "Server Version Disclosure", "warning",
        f"Server header present but version not visible: '{server}'.",
        "Consider removing the Server header entirely for maximum obscurity.",
        SCORES["server_header"] // 2,
    )


# ── Main scan orchestrator ────────────────────────────────────────────────────
def run_scan(url: str) -> dict:
    # Normalise URL
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    results = []

    # Checks that don't need a live response first
    results.append(check_https(url))
    results.append(check_ssl_cert(url))

    # Fetch main URL for header checks
    resp, err = _get_response(url)
    headers   = {k.lower(): v for k, v in resp.headers.items()} if resp else {}

    if err and resp is None:
        # Site unreachable — fail all header checks
        for check_id, title in [
            ("hsts",             "HTTP Strict Transport Security (HSTS)"),
            ("csp",              "Content Security Policy (CSP)"),
            ("x_frame",          "X-Frame-Options"),
            ("x_content_type",   "X-Content-Type-Options"),
            ("referrer_policy",  "Referrer Policy"),
        ]:
            results.append(_make_result(
                check_id, title, "fail",
                f"Could not reach site: {err}",
                "Ensure the site is reachable and try again.", 0,
            ))
    else:
        results.append(check_hsts(headers))
        results.append(check_csp(headers))
        results.append(check_x_frame(headers))
        results.append(check_x_content_type(headers))
        results.append(check_referrer_policy(headers))

    results.append(check_redirect_chain(url))
    results.append(check_robots_txt(url))
    results.append(check_server_header(headers))

    # Score
    total_earned = sum(r["points_earned"] for r in results)
    percentage   = round((total_earned / MAX_SCORE) * 100, 1)
    grade_info   = score_to_grade(percentage)

    return {
        "url":        url,
        "scanned_at": datetime.now(timezone.utc).isoformat(),
        "score":      total_earned,
        "max_score":  MAX_SCORE,
        "percentage": percentage,
        "grade":      grade_info["grade"],
        "label":      grade_info["label"],
        "grade_colour": grade_info["colour"],
        "checks":     results,
        "error":      err if resp is None else None,
    }