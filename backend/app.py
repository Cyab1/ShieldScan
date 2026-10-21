import os
import io
import random
import string
from datetime import datetime, timezone, timedelta
from functools import wraps

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Text, func
import json

from scanner import run_scan
from pdf_generator import generate_pdf
import urllib.parse

app = Flask(__name__)

# ── Auth ──────────────────────────────────────────────────────────────────────
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme123")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "shieldscan-admin-token")


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("X-Admin-Token", "")
        if token != ADMIN_TOKEN:
            return jsonify({"error": "Unauthorised"}), 401
        return f(*args, **kwargs)

    return decorated


# ── CORS ──────────────────────────────────────────────────────────────────────
CORS(
    app,
    origins=[
        "http://localhost:5173",
        "https://shieldscan.vercel.app",
        "https://shieldscan-*.vercel.app",
        "https://shieldscan-sage.vercel.app",
        "https://shieldscan.stackwiseza.co.za",
    ],
    supports_credentials=True,
)


# ── Limiter ───────────────────────────────────────────────────────────────────
def get_ip():
    return request.remote_addr


limiter = Limiter(
    get_ip,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

# ── Database ──────────────────────────────────────────────────────────────────
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"sqlite:///{os.path.join(BASE_DIR, 'shieldscan.db')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


# ── Models ────────────────────────────────────────────────────────────────────
class ScanResult(db.Model):
    __tablename__ = "scan_results"
    id = db.Column(db.Integer, primary_key=True)
    scan_id = db.Column(db.String(12), unique=True, nullable=False, index=True)
    url = db.Column(db.String(2048), nullable=False)
    scanned_at = db.Column(db.DateTime, nullable=False)
    grade = db.Column(db.String(1), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    percentage = db.Column(db.Float, nullable=False)
    ip_address = db.Column(db.String(64), nullable=True)
    result_json = db.Column(Text, nullable=False)

    def to_dict(self):
        return json.loads(self.result_json)

    def to_summary(self):
        return {
            "scan_id": self.scan_id,
            "url": self.url,
            "scanned_at": self.scanned_at.isoformat(),
            "grade": self.grade,
            "score": self.score,
            "percentage": self.percentage,
            "ip_address": self.ip_address,
        }


class WhitelistedIP(db.Model):
    __tablename__ = "whitelisted_ips"
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(64), unique=True, nullable=False)
    note = db.Column(db.String(255), nullable=True)
    added_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def to_dict(self):
        return {
            "id": self.id,
            "ip_address": self.ip_address,
            "note": self.note,
            "added_at": self.added_at.isoformat(),
        }


class RateLimitHit(db.Model):
    __tablename__ = "rate_limit_hits"
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(64), nullable=False)
    url = db.Column(db.String(2048), nullable=True)
    hit_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def to_dict(self):
        return {
            "id": self.id,
            "ip_address": self.ip_address,
            "url": self.url,
            "hit_at": self.hit_at.isoformat(),
        }


# ── Helpers ───────────────────────────────────────────────────────────────────
def generate_scan_id(length: int = 8) -> str:
    chars = string.ascii_lowercase + string.digits
    while True:
        candidate = "sw_" + "".join(random.choices(chars, k=length))
        if not ScanResult.query.filter_by(scan_id=candidate).first():
            return candidate


def is_whitelisted(ip: str) -> bool:
    return WhitelistedIP.query.filter_by(ip_address=ip).first() is not None


# ── Scan ──────────────────────────────────────────────────────────────────────
@app.route("/api/scan", methods=["POST"])
@limiter.limit("5 per day", exempt_when=lambda: is_whitelisted(get_ip()))
def scan():
    data = request.get_json(silent=True) or {}
    url = (data.get("url") or "").strip()
    ip = get_ip()

    if not url:
        return jsonify({"error": "No URL provided."}), 400

    try:
        parsed = urllib.parse.urlparse(
            url if url.startswith(("http://", "https://")) else "https://" + url
        )
        if not parsed.hostname or "." not in parsed.hostname:
            raise ValueError
    except ValueError:
        return jsonify({"error": "Invalid URL format."}), 400

    result = run_scan(url)
    scan_id = generate_scan_id()
    result["scan_id"] = scan_id

    record = ScanResult(
        scan_id=scan_id,
        url=result["url"],
        scanned_at=datetime.now(timezone.utc),
        grade=result["grade"],
        score=result["score"],
        percentage=result["percentage"],
        ip_address=ip,
        result_json=json.dumps(result),
    )
    db.session.add(record)
    db.session.commit()

    return jsonify(result), 200


@app.route("/api/results/<scan_id>", methods=["GET"])
def get_result(scan_id):
    record = ScanResult.query.filter_by(scan_id=scan_id).first()
    if not record:
        return jsonify({"error": "Scan not found."}), 404
    return jsonify(record.to_dict()), 200


@app.route("/api/health", methods=["GET"])
@limiter.exempt
def health():
    return jsonify({"status": "ok", "service": "ShieldScan API"}), 200


@app.route("/api/results/<scan_id>/pdf", methods=["GET"])
def download_pdf(scan_id):
    record = ScanResult.query.filter_by(scan_id=scan_id).first()
    if not record:
        return jsonify({"error": "Scan not found."}), 404

    result = record.to_dict()
    pdf_bytes = generate_pdf(result)
    safe_url = (
        result["url"].replace("https://", "").replace("http://", "").replace("/", "_")
    )
    filename = f"ShieldScan_{safe_url}_{scan_id}.pdf"

    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )


# ── Admin auth ────────────────────────────────────────────────────────────────
@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True) or {}
    password = data.get("password", "")
    if password == ADMIN_PASSWORD:
        return jsonify({"token": ADMIN_TOKEN}), 200
    return jsonify({"error": "Invalid password"}), 401


# ── Admin stats ───────────────────────────────────────────────────────────────
@app.route("/api/admin/stats", methods=["GET"])
@require_admin
def admin_stats():
    try:
        total = ScanResult.query.count()
        today = datetime.now(timezone.utc).date()
        today_count = ScanResult.query.filter(
            db.func.date(ScanResult.scanned_at) == today
        ).count()

        grades = {}
        for g in ["A", "B", "C", "D", "F"]:
            grades[g] = ScanResult.query.filter_by(grade=g).count()

        daily = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            count = ScanResult.query.filter(
                db.func.date(ScanResult.scanned_at) == day
            ).count()
            daily.append({"date": day.isoformat(), "count": count})

        rate_hits = RateLimitHit.query.count()
        rate_hits_today = RateLimitHit.query.filter(
            db.func.date(RateLimitHit.hit_at) == today
        ).count()

        top_sites = (
            db.session.query(ScanResult.url, func.count(ScanResult.url).label("count"))
            .group_by(ScanResult.url)
            .order_by(func.count(ScanResult.url).desc())
            .limit(5)
            .all()
        )

        return (
            jsonify(
                {
                    "total_scans": total,
                    "scans_today": today_count,
                    "grade_breakdown": grades,
                    "daily_volume": daily,
                    "rate_limit_hits": rate_hits,
                    "rate_hits_today": rate_hits_today,
                    "top_sites": [{"url": s.url, "count": s.count} for s in top_sites],
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Admin scans ───────────────────────────────────────────────────────────────
@app.route("/api/admin/scans", methods=["GET"])
@require_admin
def admin_scans():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    search = request.args.get("search", "").strip()

    query = ScanResult.query
    if search:
        query = query.filter(
            db.or_(
                ScanResult.url.ilike(f"%{search}%"),
                ScanResult.ip_address.ilike(f"%{search}%"),
                ScanResult.grade.ilike(f"%{search}%"),
            )
        )

    results = query.order_by(ScanResult.scanned_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return (
        jsonify(
            {
                "scans": [r.to_summary() for r in results.items],
                "total": results.total,
                "pages": results.pages,
                "page": page,
            }
        ),
        200,
    )


# ── Admin rate hits ───────────────────────────────────────────────────────────
@app.route("/api/admin/rate-hits", methods=["GET"])
@require_admin
def admin_rate_hits():
    hits = (
        db.session.query(
            RateLimitHit.ip_address,
            func.count(RateLimitHit.ip_address).label("count"),
            func.max(RateLimitHit.hit_at).label("last_hit"),
        )
        .group_by(RateLimitHit.ip_address)
        .order_by(func.count(RateLimitHit.ip_address).desc())
        .limit(20)
        .all()
    )

    return (
        jsonify(
            [
                {
                    "ip_address": h.ip_address,
                    "count": h.count,
                    "last_hit": h.last_hit.isoformat() if h.last_hit else None,
                }
                for h in hits
            ]
        ),
        200,
    )


# ── Admin whitelist ───────────────────────────────────────────────────────────
@app.route("/api/admin/whitelist", methods=["GET"])
@require_admin
def get_whitelist():
    ips = WhitelistedIP.query.order_by(WhitelistedIP.added_at.desc()).all()
    return jsonify([ip.to_dict() for ip in ips]), 200


@app.route("/api/admin/whitelist", methods=["POST"])
@require_admin
def add_whitelist():
    data = request.get_json(silent=True) or {}
    ip = (data.get("ip_address") or "").strip()
    note = (data.get("note") or "").strip()

    if not ip:
        return jsonify({"error": "IP address required"}), 400
    if WhitelistedIP.query.filter_by(ip_address=ip).first():
        return jsonify({"error": "IP already whitelisted"}), 400

    entry = WhitelistedIP(ip_address=ip, note=note)
    db.session.add(entry)
    db.session.commit()
    return jsonify(entry.to_dict()), 201


@app.route("/api/admin/whitelist/<int:entry_id>", methods=["DELETE"])
@require_admin
def remove_whitelist(entry_id):
    entry = WhitelistedIP.query.get(entry_id)
    if not entry:
        return jsonify({"error": "Not found"}), 404
    db.session.delete(entry)
    db.session.commit()
    return jsonify({"success": True}), 200


# ── Rate limit error handler ──────────────────────────────────────────────────
@app.errorhandler(429)
def rate_limit_exceeded(e):
    try:
        ip = get_ip()
        url = (request.get_json(silent=True, force=True) or {}).get("url", "")
        hit = RateLimitHit(ip_address=ip, url=url)
        db.session.add(hit)
        db.session.commit()
    except Exception:
        pass
    return (
        jsonify(
            {
                "error": "Daily scan limit reached. ShieldScan allows 5 free scans per day. Contact hello@stackwiseza.co.za to discuss unlimited access."
            }
        ),
        429,
    )


@app.route("/api/admin/debug", methods=["GET"])
def debug():
    try:
        with app.app_context():
            db.create_all()
        tables = db.engine.table_names()
        return jsonify({"tables": tables}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Init ──────────────────────────────────────────────────────────────────────
with app.app_context():
    db.create_all()
    # Add ip_address column to existing databases
    try:
        with db.engine.connect() as conn:
            conn.execute(
                db.text("ALTER TABLE scan_results ADD COLUMN ip_address VARCHAR(64)")
            )
            conn.commit()
    except Exception:
        pass  # Column already exists

if __name__ == "__main__":
    app.run(debug=True, port=5000)
