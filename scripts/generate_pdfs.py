#!/usr/bin/env python3
"""Genera los PDF de las guías técnicas (y, opcionalmente, el de referencias APA 7).

Uso:
  python3 scripts/generate_pdfs.py guias  --source http://localhost/api/v1/content/guias  --out seed/media/pdfs
  python3 scripts/generate_pdfs.py guias  --source guias.json                              --out seed/media/pdfs
  python3 scripts/generate_pdfs.py refs   --source http://localhost/api/v1/content/referencias --out seed/media/pdfs

Requiere: pip install reportlab
"""
import argparse
import json
import sys
import urllib.request
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, Preformatted, SimpleDocTemplate, Spacer, Table, TableStyle

BLUE, RED = colors.HexColor("#003366"), colors.HexColor("#B71C1C")
FOOT = "SpaceNet Lab · Universidad de Cundinamarca · CC BY-NC-SA 4.0 · 2026"
ss = getSampleStyleSheet()
H1 = ParagraphStyle("h1", parent=ss["Title"], textColor=BLUE, fontSize=20, leading=24, alignment=0)
H2 = ParagraphStyle("h2", parent=ss["Heading2"], textColor=BLUE, spaceBefore=12)
BODY = ParagraphStyle("b", parent=ss["BodyText"], fontSize=10.5, leading=15)
CODE = ParagraphStyle("c", parent=ss["Code"], fontSize=8, leading=10, backColor=colors.HexColor("#f1f5f9"), borderPadding=6)
SMALL = ParagraphStyle("s", parent=BODY, fontSize=8.5, textColor=colors.HexColor("#475569"))


def load(source: str):
    if source.startswith("http"):
        with urllib.request.urlopen(source, timeout=15) as r:
            return json.load(r)
    return json.loads(Path(source).read_text(encoding="utf-8"))


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(RED)
    canvas.setLineWidth(1.2)
    canvas.line(2 * cm, 1.6 * cm, A4[0] - 2 * cm, 1.6 * cm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#475569"))
    canvas.drawString(2 * cm, 1.1 * cm, FOOT)
    canvas.drawRightString(A4[0] - 2 * cm, 1.1 * cm, f"Pág. {doc.page}")
    canvas.restoreState()


def cop(n: int) -> str:
    return "$" + f"{n:,}".replace(",", ".")


def build_guide(g: dict, out: Path) -> None:
    story = [Paragraph(escape(g["title"]), H1), Paragraph(escape(g.get("description", "")), BODY), Spacer(1, 8)]
    for s in g.get("steps", []):
        story += [Paragraph(f"Paso {s['step']}. {escape(s['title'])}", H2), Paragraph(escape(s["body"]), BODY)]
    rows = g.get("components") or []
    if rows:
        story += [Paragraph("Presupuesto de referencia (COP)", H2)]
        data = [["Componente", "Económico", "Premium"]]
        data += [[Paragraph(escape(f"{r['category']}: {r['item']}"), SMALL), cop(r["economico"]), cop(r["premium"])] for r in rows]
        data.append(["Total", cop(sum(r["economico"] for r in rows)), cop(sum(r["premium"] for r in rows))])
        t = Table(data, colWidths=[10.2 * cm, 3.4 * cm, 3.4 * cm], repeatRows=1)
        t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), BLUE), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                               ("ALIGN", (1, 0), (-1, -1), "RIGHT"), ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                               ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cbd5e1")), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                               ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e2e8f0"))]))
        story += [t, Paragraph("Precios de referencia: confírmelos con cotizaciones vigentes.", SMALL)]
    for i, code in enumerate(g.get("code", []), 1):
        story += [Paragraph(f"Código {i}", H2), Preformatted(code, CODE)]
    SimpleDocTemplate(str(out), pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm, topMargin=2 * cm, bottomMargin=2.2 * cm,
                      title=g["title"], author="Morales Aguilar, E.; Pérez Rodríguez, D. F.").build(story, onFirstPage=footer, onLaterPages=footer)


def build_refs(refs: list[dict], out: Path) -> None:
    story = [Paragraph("Referencias (APA 7)", H1), Paragraph("SpaceNet Lab · Universidad de Cundinamarca", SMALL), Spacer(1, 10)]
    hang = ParagraphStyle("hang", parent=BODY, leftIndent=18, firstLineIndent=-18, spaceAfter=6)
    story += [Paragraph(escape(r["apa"]), hang) for r in sorted(refs, key=lambda r: r["apa"])]
    SimpleDocTemplate(str(out), pagesize=A4, leftMargin=2.5 * cm, rightMargin=2.5 * cm, title="Referencias APA 7").build(story, onFirstPage=footer, onLaterPages=footer)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("what", choices=["guias", "refs"])
    ap.add_argument("--source", required=True)
    ap.add_argument("--out", default="seed/media/pdfs")
    a = ap.parse_args()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    data = load(a.source)
    if a.what == "guias":
        for g in data:
            build_guide(g, out / g["pdfUrl"])
            print("✓", out / g["pdfUrl"])
    else:
        build_refs(data, out / "referencias-apa7.pdf")
        print("✓", out / "referencias-apa7.pdf")
    return 0


if __name__ == "__main__":
    sys.exit(main())
