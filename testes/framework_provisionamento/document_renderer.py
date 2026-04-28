"""
Renderiza documentos fictícios via templates Jinja2 → HTML → PDF (WeasyPrint).

Templates ficam em `testes/fixtures/documentos_template/*.html.j2`.

Cada documento recebe os mesmos dados básicos da empresa (razão social, CNPJ,
endereço) e gera um PDF realista o suficiente para upload em testes de UI,
sem ser confundido com documento oficial.

Saída: `testes/contextos/<ciclo_id>/docs/<trilha>/<tipo_documento>.pdf`
"""

from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
TEMPLATES_DIR = PROJECT_ROOT / "testes" / "fixtures" / "documentos_template"

# Tipos de documento disponíveis (cada um tem um template .html.j2)
# Os 6 originais (rendererizar_todos itera sobre eles) + extensoes p/ documentos sintetizados
TIPOS_DOCUMENTO = [
    "contrato_social",
    "cnd_federal",
    "fgts",
    "trabalhista",
    "sicaf",
    "alvara",
]

# Tipos extras suportados (gerador de documentos sintetizados de UCs).
# Nao incluidos em TIPOS_DOCUMENTO p/ nao quebrar renderizar_todos do context_manager.
TIPOS_DOCUMENTO_EXTRAS = [
    "estatuto_social",
    "cnd_municipal",
    "cnd_estadual",
    "balanco_patrimonial",
    "atestado_capacidade_tecnica",
    "manual_tecnico",
    "folder_catalogo",
    "nota_fiscal",
    "edital",
    "termo_referencia",
    "ata_pregao",
    "proposta_comercial",
    "proposta_tecnica",
    "peticao_impugnacao",
    "laudo_recurso",
    "contrato",
    "aditivo_contrato",
    "comprovante_entrega",
    "registro_anvisa",
    "instrucoes_uso",
]
TIPOS_VALIDOS = TIPOS_DOCUMENTO + TIPOS_DOCUMENTO_EXTRAS


def _make_env() -> Environment:
    return Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(["html", "xml"]),
        trim_blocks=True,
        lstrip_blocks=True,
    )


def _build_context(empresa: dict[str, Any], extra: dict[str, Any] | None = None) -> dict[str, Any]:
    """Contexto padrão pra todos os templates."""
    hoje = datetime.now()
    ctx = {
        "empresa": empresa,
        "hoje": hoje.strftime("%d/%m/%Y"),
        "hoje_extenso": hoje.strftime("%d de %B de %Y"),
        "validade": (hoje + timedelta(days=180)).strftime("%d/%m/%Y"),
        "ano_atual": hoje.year,
        "marca_dagua": "DOCUMENTO FICTÍCIO — VALIDAÇÃO FACILICITA.IA",
    }
    if extra:
        ctx.update(extra)
    return ctx


def renderizar(
    tipo: str,
    empresa: dict[str, Any],
    destino: Path,
    extra: dict[str, Any] | None = None,
) -> Path:
    """
    Renderiza um documento fictício.

    Args:
        tipo: nome do tipo (deve estar em TIPOS_DOCUMENTO)
        empresa: dict com pelo menos `razao_social`, `cnpj`, `endereco`
        destino: diretório onde gravar o PDF
        extra: variáveis adicionais para o template

    Returns:
        Path do PDF gerado
    """
    if tipo not in TIPOS_VALIDOS:
        raise ValueError(f"Tipo desconhecido: {tipo}. Disponíveis: {TIPOS_VALIDOS}")

    template_file = f"{tipo}.html.j2"
    if not (TEMPLATES_DIR / template_file).exists():
        raise FileNotFoundError(f"Template não encontrado: {template_file}")

    env = _make_env()
    template = env.get_template(template_file)
    ctx = _build_context(empresa, extra)
    html = template.render(**ctx)

    destino.mkdir(parents=True, exist_ok=True)
    pdf_path = destino / f"{tipo}.pdf"

    # Renderizar via WeasyPrint
    try:
        from weasyprint import HTML  # type: ignore
        HTML(string=html, base_url=str(TEMPLATES_DIR)).write_pdf(str(pdf_path))
    except Exception as e:
        # Fallback: salvar HTML se PDF falhar
        html_path = destino / f"{tipo}.html"
        html_path.write_text(html, encoding="utf-8")
        raise RuntimeError(
            f"WeasyPrint falhou para {tipo}: {e}. HTML salvo em {html_path}"
        )

    return pdf_path


def renderizar_todos(empresa: dict[str, Any], destino: Path) -> dict[str, str]:
    """
    Renderiza todos os 6 tipos de documento.

    Returns:
        Dict {tipo: path_relativo_ao_PROJECT_ROOT}
    """
    paths: dict[str, str] = {}
    for tipo in TIPOS_DOCUMENTO:
        try:
            p = renderizar(tipo, empresa, destino)
            # Tenta path relativo ao projeto; se destino estiver fora (smoke em /tmp), usa absoluto
            try:
                paths[tipo] = str(p.relative_to(PROJECT_ROOT))
            except ValueError:
                paths[tipo] = str(p)
        except Exception as e:
            print(f"[document_renderer] Falhou {tipo}: {e}")
            paths[tipo] = ""
    return paths


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Renderizar documentos fictícios")
    parser.add_argument("--empresa", default="Empresa Demo Ltda", help="Razao social")
    parser.add_argument("--cnpj", default="11.111.111/0001-11", help="CNPJ")
    parser.add_argument("--destino", required=True, help="Dir destino")
    parser.add_argument("--tipo", help="Renderizar so um tipo (default: todos)")
    args = parser.parse_args()

    empresa = {
        "razao_social": args.empresa,
        "cnpj": args.cnpj,
        "endereco": "Av. Demonstração, 100 — São Paulo/SP — 01000-000",
        "responsavel": "Fulano de Tal Demo",
    }
    if args.tipo:
        p = renderizar(args.tipo, empresa, Path(args.destino))
        print(f"Gerado: {p}")
    else:
        paths = renderizar_todos(empresa, Path(args.destino))
        print(f"Gerados {len(paths)} documentos:")
        for tipo, p in paths.items():
            print(f"  {tipo}: {p}")
