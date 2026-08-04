import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table,
    TableStyle, HRFlowable, KeepTogether
)
from reportlab.graphics.shapes import Drawing, Rect, String, Circle
from reportlab.graphics import renderPDF

# ── Brand colours ─────────────────────────────────────────────────────────────
SW_DARK       = colors.HexColor("#085041")
SW_GREEN      = colors.HexColor("#1D9E75")
SW_TEAL       = colors.HexColor("#5DCAA5")
SW_TEAL_LIGHT = colors.HexColor("#E6F5EF")
SW_BG         = colors.HexColor("#F4FBF8")
SW_PASS       = colors.HexColor("#085041")
SW_PASS_BG    = colors.HexColor("#E6F5EF")
SW_WARN       = colors.HexColor("#D97706")
SW_WARN_BG    = colors.HexColor("#FFF8E1")
SW_FAIL       = colors.HexColor("#DC2626")
SW_FAIL_BG    = colors.HexColor("#FEF2F2")
SW_TEXT       = colors.HexColor("#0A1F18")
SW_MUTED      = colors.HexColor("#4B6E60")
SW_BORDER     = colors.HexColor("#C8E6D8")
SW_WHITE      = colors.white

GRADE_COLOURS = {
    "A": colors.HexColor("#1D9E75"),
    "B": colors.HexColor("#0F6E56"),
    "C": colors.HexColor("#D97706"),
    "D": colors.HexColor("#F97316"),
    "F": colors.HexColor("#DC2626"),
}

STATUS_COLOURS = {
    "pass":    (SW_PASS,    SW_PASS_BG),
    "warning": (SW_WARN,    SW_WARN_BG),
    "fail":    (SW_FAIL,    SW_FAIL_BG),
}

STATUS_LABELS = {"pass": "PASS", "warning": "WARNING", "fail": "FAIL"}

W, H = A4
MARGIN = 18 * mm


# ── Styles ────────────────────────────────────────────────────────────────────
def _styles():
    return {
        "h1": ParagraphStyle("h1",
            fontName="Helvetica-Bold", fontSize=22,
            textColor=SW_DARK, leading=28, spaceAfter=4),
        "h2": ParagraphStyle("h2",
            fontName="Helvetica-Bold", fontSize=14,
            textColor=SW_DARK, leading=20, spaceAfter=4),
        "h3": ParagraphStyle("h3",
            fontName="Helvetica-Bold", fontSize=11,
            textColor=SW_DARK, leading=16, spaceAfter=2),
        "body": ParagraphStyle("body",
            fontName="Helvetica", fontSize=10,
            textColor=SW_TEXT, leading=15, spaceAfter=4),
        "muted": ParagraphStyle("muted",
            fontName="Helvetica", fontSize=9,
            textColor=SW_MUTED, leading=13),
        "small_bold": ParagraphStyle("small_bold",
            fontName="Helvetica-Bold", fontSize=9,
            textColor=SW_DARK, leading=13),
        "rec": ParagraphStyle("rec",
            fontName="Helvetica-Oblique", fontSize=9,
            textColor=colors.HexColor("#78350F"), leading=14),
        "badge": ParagraphStyle("badge",
            fontName="Helvetica-Bold", fontSize=8,
            leading=10, alignment=TA_CENTER),
        "footer": ParagraphStyle("footer",
            fontName="Helvetica", fontSize=8,
            textColor=SW_MUTED, leading=11, alignment=TA_CENTER),
        "url": ParagraphStyle("url",
            fontName="Helvetica", fontSize=10,
            textColor=SW_GREEN, leading=14),
    }


# ── Grade circle drawing ──────────────────────────────────────────────────────
def _grade_drawing(grade: str, percentage: float) -> Drawing:
    d      = Drawing(120, 120)
    colour = GRADE_COLOURS.get(grade, SW_MUTED)
    cx, cy, r = 60, 60, 50

    # Outer ring
    ring = Circle(cx, cy, r)
    ring.strokeColor = colour
    ring.strokeWidth = 5
    ring.fillColor   = colors.white
    d.add(ring)

    # Grade letter
    letter = String(cx, cy + 8, grade,
        fontName="Helvetica-Bold", fontSize=36,
        fillColor=colour, textAnchor="middle")
    d.add(letter)

    # Percentage below
    pct = String(cx, cy - 16, f"{percentage}%",
        fontName="Helvetica", fontSize=11,
        fillColor=SW_MUTED, textAnchor="middle")
    d.add(pct)

    return d


# ── Score bar drawing ─────────────────────────────────────────────────────────
def _score_bar(percentage: float, grade: str, width: float = 120) -> Drawing:
    h       = 10
    d       = Drawing(width, h)
    colour  = GRADE_COLOURS.get(grade, SW_MUTED)
    filled  = (percentage / 100) * width

    # Background track
    bg = Rect(0, 0, width, h, rx=5, ry=5)
    bg.fillColor   = SW_BORDER
    bg.strokeColor = None
    d.add(bg)

    # Filled portion
    if filled > 0:
        fill = Rect(0, 0, filled, h, rx=5, ry=5)
        fill.fillColor   = colour
        fill.strokeColor = None
        d.add(fill)

    return d


# ── Navbar-style header ───────────────────────────────────────────────────────
def _header_banner(canvas, doc):
    canvas.saveState()
    # Dark teal bar
    canvas.setFillColor(SW_DARK)
    canvas.rect(0, H - 14*mm, W, 14*mm, fill=True, stroke=False)

    # StackWise (white)
    canvas.setFillColor(SW_WHITE)
    canvas.setFont("Helvetica-Bold", 11)
    canvas.drawString(MARGIN, H - 9*mm, "StackWise")

    # Divider
    canvas.setFillColor(SW_TEAL)
    canvas.setFont("Helvetica", 11)
    canvas.drawString(MARGIN + 52, H - 9*mm, "|")

    # ShieldScan (teal)
    canvas.setFillColor(SW_TEAL)
    canvas.setFont("Helvetica-Bold", 11)
    canvas.drawString(MARGIN + 62, H - 9*mm, "ShieldScan")

    # Tagline (right)
    canvas.setFillColor(SW_TEAL)
    canvas.setFont("Helvetica", 9)
    canvas.setFillAlpha(0.6)
    canvas.drawRightString(W - MARGIN, H - 9*mm, "Website Security Audit")
    canvas.setFillAlpha(1)

    canvas.restoreState()


# ── Page footer ───────────────────────────────────────────────────────────────
def _footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(SW_BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 14*mm, W - MARGIN, 14*mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(SW_MUTED)
    canvas.drawString(MARGIN, 9*mm,
        f"StackWise ShieldScan  ·  hello@stackwise.co.za  ·  www.stackwise.co.za")
    canvas.drawRightString(W - MARGIN, 9*mm,
        f"Page {doc.page}")
    canvas.restoreState()


def _on_page(canvas, doc):
    _header_banner(canvas, doc)
    _footer(canvas, doc)


# ── Main generator ────────────────────────────────────────────────────────────
def generate_pdf(result: dict) -> bytes:
    buf    = io.BytesIO()
    styles = _styles()

    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=20*mm, bottomMargin=20*mm,
        title=f"ShieldScan Report — {result['url']}",
        author="StackWise ShieldScan",
    )

    story = []
    usable_w = W - 2 * MARGIN

    # ── Page 1: Summary ───────────────────────────────────────────────────────

    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("Security Audit Report", styles["h1"]))
    story.append(Paragraph(
        f"Prepared by StackWise ShieldScan  ·  Report ID: {result.get('scan_id', 'N/A')}",
        styles["muted"]
    ))
    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width=usable_w, color=SW_BORDER, thickness=0.5))
    story.append(Spacer(1, 6*mm))

    # Grade + meta side by side
    grade_d  = _grade_drawing(result["grade"], result["percentage"])
    bar_d    = _score_bar(result["percentage"], result["grade"], width=180)

    scanned_str = result.get("scanned_at", "")
    try:
        dt = datetime.fromisoformat(scanned_str).strftime("%d %b %Y, %H:%M UTC")
    except Exception:
        dt = scanned_str

    pass_n = sum(1 for c in result["checks"] if c["status"] == "pass")
    warn_n = sum(1 for c in result["checks"] if c["status"] == "warning")
    fail_n = sum(1 for c in result["checks"] if c["status"] == "fail")

    meta_data = [
        [Paragraph("<b>URL</b>", styles["small_bold"]),
         Paragraph(result["url"], styles["url"])],
        [Paragraph("<b>Scanned</b>", styles["small_bold"]),
         Paragraph(dt, styles["body"])],
        [Paragraph("<b>Score</b>", styles["small_bold"]),
         Paragraph(f"{result['score']} / {result['max_score']} points", styles["body"])],
        [Paragraph("<b>Grade</b>", styles["small_bold"]),
         Paragraph(f"{result['grade']} — {result['label']}", styles["body"])],
        [Paragraph("<b>Passed</b>", styles["small_bold"]),
         Paragraph(f"{pass_n} checks", styles["body"])],
        [Paragraph("<b>Warnings</b>", styles["small_bold"]),
         Paragraph(f"{warn_n} checks", styles["body"])],
        [Paragraph("<b>Failed</b>", styles["small_bold"]),
         Paragraph(f"{fail_n} checks", styles["body"])],
    ]

    meta_table = Table(meta_data, colWidths=[30*mm, 90*mm])
    meta_table.setStyle(TableStyle([
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [SW_WHITE, SW_BG]),
        ("LEFTPADDING",  (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING",   (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
        ("ROUNDEDCORNERS", [4]),
    ]))

    # Score bar under meta
    bar_block = [
        [Paragraph("<b>Score breakdown</b>", styles["small_bold"])],
        [bar_d],
        [Paragraph(
            f"<font color='#085041'>✓ {pass_n} passed</font>   "
            f"<font color='#D97706'>⚠ {warn_n} warnings</font>   "
            f"<font color='#DC2626'>✕ {fail_n} failed</font>",
            styles["muted"]
        )],
    ]
    bar_table = Table(bar_block, colWidths=[usable_w * 0.45])
    bar_table.setStyle(TableStyle([
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("TOPPADDING",    (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))

    # Two-column summary layout
    summary_table = Table(
        [[grade_d, meta_table]],
        colWidths=[38*mm, usable_w - 38*mm]
    )
    summary_table.setStyle(TableStyle([
        ("VALIGN",      (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",(0, 0), (-1, -1), 6),
    ]))

    story.append(summary_table)
    story.append(Spacer(1, 5*mm))
    story.append(bar_table)
    story.append(Spacer(1, 8*mm))
    story.append(HRFlowable(width=usable_w, color=SW_BORDER, thickness=0.5))

    # ── Page 2+: Check results ─────────────────────────────────────────────────
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph("Detailed Findings", styles["h2"]))
    story.append(Paragraph(
        "Checks are ordered by priority — failed items appear first.",
        styles["muted"]
    ))
    story.append(Spacer(1, 4*mm))

    STATUS_ORDER = {"fail": 0, "warning": 1, "pass": 2}
    sorted_checks = sorted(
        result["checks"],
        key=lambda c: STATUS_ORDER.get(c["status"], 9)
    )

    for check in sorted_checks:
        status   = check["status"]
        fg, bg   = STATUS_COLOURS.get(status, (SW_MUTED, SW_WHITE))
        label    = STATUS_LABELS.get(status, status.upper())

        # Badge cell
        badge_para = Paragraph(
            f'<font color="white"><b>{label}</b></font>',
            styles["badge"]
        )
        badge_table = Table([[badge_para]], colWidths=[18*mm])
        badge_table.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), fg),
            ("ROUNDEDCORNERS",(0, 0), (-1, -1), [3]),
            ("LEFTPADDING",   (0, 0), (-1, -1), 4),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
            ("TOPPADDING",    (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))

        # Points
        pts_para = Paragraph(
            f'<b>{check["points_earned"]}</b>/{check["points_possible"]} pts',
            styles["muted"]
        )

        # Header row: badge | title | points
        header_row = Table(
            [[badge_table, Paragraph(check["title"], styles["h3"]), pts_para]],
            colWidths=[22*mm, usable_w - 40*mm, 18*mm]
        )
        header_row.setStyle(TableStyle([
            ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING",(0, 0), (-1, -1), 0),
            ("ALIGN",       (2, 0), (2, 0),   "RIGHT"),
        ]))

        inner_rows = [[header_row]]
        inner_rows.append([Paragraph(check.get("detail", ""), styles["body"])])

        if check.get("recommendation"):
            rec_table = Table(
                [[Paragraph("💡  " + check["recommendation"], styles["rec"])]],
                colWidths=[usable_w - 16*mm]
            )
            rec_table.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#FFFBEB")),
                ("ROUNDEDCORNERS",(0, 0), (-1, -1), [4]),
                ("LEFTPADDING",   (0, 0), (-1, -1), 8),
                ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
                ("TOPPADDING",    (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#FDE68A")),
            ]))
            inner_rows.append([rec_table])

        inner = Table(inner_rows, colWidths=[usable_w - 8*mm])
        inner.setStyle(TableStyle([
            ("VALIGN",        (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING",   (0, 0), (-1, -1), 0),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
            ("TOPPADDING",    (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))

        # Outer card
        card = Table([[inner]], colWidths=[usable_w])
        card.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), bg),
            ("ROUNDEDCORNERS",(0, 0), (-1, -1), [6]),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
            ("TOPPADDING",    (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LINEAFTER",     (0, 0), (0, -1),  2, fg),  # left accent bar
        ]))

        story.append(KeepTogether(card))
        story.append(Spacer(1, 4*mm))

    # ── Final disclaimer ──────────────────────────────────────────────────────
    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width=usable_w, color=SW_BORDER, thickness=0.5))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph(
        "This report was generated automatically by ShieldScan. It reflects the "
        "security posture of the scanned URL at the time of the scan. It does not "
        "constitute a full penetration test. For a comprehensive security audit, "
        "contact StackWise at hello@stackwise.co.za.",
        styles["muted"]
    ))

    doc.build(story, onFirstPage=_on_page, onLaterPages=_on_page)
    return buf.getvalue()