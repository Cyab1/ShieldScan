import os
import io                              # <-- Addition 1
import random
import string
from datetime import datetime, timezone

from flask import Flask, request, jsonify, send_file   # send_file already there
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Text
import json

from scanner import run_scan
from pdf_generator import generate_pdf          # <-- Addition 1
import urllib.parse

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "https://shieldscan.vercel.app",
    "https://shieldscan-*.vercel.app",
    "https://shieldscan-sage.vercel.app",
])

# ── Database config ───────────────────────────────────────────────────────────
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"sqlite:///{os.path.join(BASE_DIR, 'shieldscan.db')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


# ── Model ─────────────────────────────────────────────────────────────────────
class ScanResult(db.Model):
    __tablename__ = "scan_results"

    id         = db.Column(db.Integer, primary_key=True)
    scan_id    = db.Column(db.String(12), unique=True, nullable=False, index=True)
    url        = db.Column(db.String(2048), nullable=False)
    scanned_at = db.Column(db.DateTime, nullable=False)
    grade      = db.Column(db.String(1), nullable=False)
    score      = db.Column(db.Integer, nullable=False)
    percentage = db.Column(db.Float, nullable=False)
    result_json = db.Column(Text, nullable=False)   # full result stored as JSON

    def to_dict(self):
        return json.loads(self.result_json)


# ── Helpers ───────────────────────────────────────────────────────────────────
def generate_scan_id(length: int = 8) -> str:
    """Generate a short unique ID like sw_a3f9k2b1."""
    chars = string.ascii_lowercase + string.digits
    while True:
        candidate = "sw_" + "".join(random.choices(chars, k=length))
        if not ScanResult.query.filter_by(scan_id=candidate).first():
            return candidate


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/api/scan", methods=["POST"])
def scan():
    data = request.get_json(silent=True) or {}
    url  = (data.get("url") or "").strip()

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

    # Run the scan
    result = run_scan(url)

    # Generate ID and save to DB
    scan_id = generate_scan_id()
    result["scan_id"] = scan_id          # attach ID to the result object

    record = ScanResult(
        scan_id     = scan_id,
        url         = result["url"],
        scanned_at  = datetime.now(timezone.utc),
        grade       = result["grade"],
        score       = result["score"],
        percentage  = result["percentage"],
        result_json = json.dumps(result),
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
def health():
    return jsonify({"status": "ok", "service": "ShieldScan API"}), 200


# ── Addition 2: PDF download route ───────────────────────────────────────────
@app.route("/api/results/<scan_id>/pdf", methods=["GET"])
def download_pdf(scan_id):
    record = ScanResult.query.filter_by(scan_id=scan_id).first()
    if not record:
        return jsonify({"error": "Scan not found."}), 404

    result = record.to_dict()
    pdf_bytes = generate_pdf(result)

    safe_url = result["url"].replace("https://", "").replace("http://", "").replace("/", "_")
    filename = f"ShieldScan_{safe_url}_{scan_id}.pdf"

    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename
    )


# ── Init ──────────────────────────────────────────────────────────────────────
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, port=5000)