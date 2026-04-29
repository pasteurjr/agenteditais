#!/usr/bin/env python3
"""Converte MD em PDF usando markdown + weasyprint."""
import sys
from pathlib import Path
import markdown as md
from weasyprint import HTML, CSS

CSS_STYLE = """
@page { size: A4; margin: 1.8cm 1.5cm 2cm 1.5cm; @bottom-right { content: counter(page) " / " counter(pages); color: #888; font-size: 9pt; } }
body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 10.5pt; color: #222; line-height: 1.45; }
h1 { font-size: 18pt; color: #1a4480; border-bottom: 2px solid #1a4480; padding-bottom: 4pt; margin-top: 14pt; page-break-after: avoid; }
h2 { font-size: 14pt; color: #2563eb; margin-top: 12pt; page-break-after: avoid; }
h3 { font-size: 12pt; color: #374151; margin-top: 10pt; page-break-after: avoid; }
h4 { font-size: 11pt; color: #4b5563; margin-top: 8pt; }
code { background: #f3f4f6; padding: 1px 5px; border-radius: 3px; font-family: 'DejaVu Sans Mono', monospace; font-size: 9.5pt; }
pre { background: #1f2937; color: #e5e7eb; padding: 8pt 10pt; border-radius: 4pt; overflow-x: auto; font-size: 8.5pt; line-height: 1.35; page-break-inside: avoid; }
pre code { background: transparent; color: inherit; padding: 0; }
table { border-collapse: collapse; width: 100%; margin: 8pt 0; font-size: 9.5pt; page-break-inside: avoid; }
th, td { border: 1px solid #d1d5db; padding: 4pt 6pt; text-align: left; vertical-align: top; }
th { background: #e5e7eb; font-weight: bold; }
blockquote { border-left: 3px solid #2563eb; background: #eff6ff; padding: 6pt 10pt; margin: 8pt 0; color: #1e40af; }
a { color: #2563eb; text-decoration: none; }
ul, ol { padding-left: 22pt; margin: 4pt 0; }
li { margin: 2pt 0; }
hr { border: none; border-top: 1px solid #d1d5db; margin: 14pt 0; }
"""

def converter(md_path: Path, pdf_path: Path):
    texto = md_path.read_text(encoding='utf-8')
    html_body = md.markdown(texto, extensions=['tables', 'fenced_code', 'codehilite', 'toc'])
    html_full = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><title>{md_path.stem}</title></head><body>{html_body}</body></html>"""
    HTML(string=html_full).write_pdf(str(pdf_path), stylesheets=[CSS(string=CSS_STYLE)])
    print(f"  ✓ {pdf_path.name}")


if __name__ == "__main__":
    project = Path(__file__).resolve().parent.parent
    arquivos = [
        # Tutoriais V2
        "tutorialsprint1-1 V2.md",
        "tutorialsprint1-2 V2.md",
        "tutorialsprint2-1 V2.md",
        "tutorialsprint2-2 V2.md",
        # Datasets V2
        "dadosempportpar-1 V2.md",
        "dadosempportpar-2 V2.md",
        "dadoscapval-1 V2.md",
        "dadoscapval-2 V2.md",
        # Docs canônicos modificados (V7)
        "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V7.md",
        "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V7.md",
    ]
    docs = project / "docs"
    print(f"=== Convertendo {len(arquivos)} arquivos ===")
    erros = []
    for nome in arquivos:
        md_path = docs / nome
        if not md_path.exists():
            erros.append(f"{nome}: NAO EXISTE")
            print(f"  ✗ {nome} (nao existe)")
            continue
        pdf_path = docs / (md_path.stem + ".pdf")
        try:
            converter(md_path, pdf_path)
        except Exception as e:
            erros.append(f"{nome}: {e}")
            print(f"  ✗ {nome}: {e}")
    print(f"\n=== {len(arquivos) - len(erros)}/{len(arquivos)} convertidos ===")
    if erros:
        for e in erros:
            print(f"  ! {e}")
        sys.exit(1)
    # Split UC-F13
    uc_md = project / "testes" / "casos_de_uso" / "UC-F13.md"
    if uc_md.exists():
        out = docs / "UC-F13 (split V8).pdf"
        converter(uc_md, out)
