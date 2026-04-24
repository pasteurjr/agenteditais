"""
Gera relatório markdown da trilha visual acompanhada.

Diferente do relatório E2E (machine-friendly), este foca nas observações
do PO durante a execução. Estrutura:
  - Sumário (UC, variação, ciclo, duração, contagens)
  - Linha do tempo (passo × veredito × correção × duração)
  - Detalhe por passo:
      - Resultado automático (DOM/Rede/Semântica se houver)
      - **Observação do PO**
      - **Correção sugerida** (se marcada)
      - Screenshots
"""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from painel import EstadoSessao  # type: ignore


def _badge(v: str) -> str:
    if v == "APROVADO":
        return "✅ APROVADO"
    if v == "REPROVADO":
        return "❌ REPROVADO"
    if v == "INCONCLUSIVO":
        return "⚠️ INCONCLUSIVO"
    return f"⏳ {v}"


def gerar_relatorio_md(estado) -> str:
    """Gera o relatório markdown da sessão visual."""
    aprovados = sum(1 for r in estado.resultados if r.veredito_automatico == "APROVADO")
    reprovados = sum(1 for r in estado.resultados if r.veredito_automatico == "REPROVADO")
    inconclusivos = sum(1 for r in estado.resultados if r.veredito_automatico == "INCONCLUSIVO")
    correcoes = sum(1 for r in estado.resultados if r.correcao_necessaria)
    com_comentarios = sum(1 for r in estado.resultados if r.comentarios_po)

    lines: list[str] = []
    lines.append(f"# Relatório Visual — {estado.uc_id} ({estado.variacao})")
    lines.append("")
    lines.append("## Sumário executivo")
    lines.append("")
    lines.append(f"- **Trilha:** Visual acompanhada (PO + Playwright headed)")
    lines.append(f"- **Ambiente:** {estado.ambiente} ({estado.base_url})")
    lines.append(f"- **Ciclo:** {estado.ciclo_id or '—'}")
    lines.append(f"- **Iniciado em:** {estado.iniciado_em}")
    lines.append(f"- **Estado final:** {estado.estado}")
    lines.append(f"- **Passos executados:** {len(estado.resultados)} / {estado.total_passos}")
    lines.append(f"- **Aprovados:** {aprovados}")
    if reprovados:
        lines.append(f"- **Reprovados:** {reprovados}")
    if inconclusivos:
        lines.append(f"- **Inconclusivos:** {inconclusivos}")
    if correcoes:
        lines.append(f"- **Correções marcadas:** {correcoes}")
    lines.append(f"- **Passos com observação do PO:** {com_comentarios}")
    lines.append("")

    # Linha do tempo
    lines.append("## Linha do tempo")
    lines.append("")
    lines.append("| # | Passo | Veredito | Correção | Comentários | Duração |")
    lines.append("|---|---|---|---|---|---|")
    for i, r in enumerate(estado.resultados):
        dur = f"{r.duracao_ms / 1000:.1f}s" if r.duracao_ms else "—"
        correcao = "⚠️ sim" if r.correcao_necessaria else "—"
        n_coments = len(r.comentarios_po)
        coments_marker = "💬" * min(n_coments, 5) if n_coments else "—"
        safe_id = r.passo_id.replace("|", "\\|")
        lines.append(f"| {i + 1} | `{safe_id}` | {_badge(r.veredito_automatico)} | {correcao} | {coments_marker} | {dur} |")
    lines.append("")

    # Detalhe por passo
    lines.append("## Detalhe por passo")
    lines.append("")
    for i, r in enumerate(estado.resultados):
        lines.append(f"### {i + 1}. `{r.passo_id}` — {r.titulo}")
        lines.append("")
        lines.append(f"- **Veredito automático:** {_badge(r.veredito_automatico)}")

        # Detalhes técnicos
        det = r.detalhes_validacao or {}
        if det.get("dom"):
            lines.append(f"- **DOM:** {'✓' if det['dom'].get('ok') else '✗'} {det['dom'].get('mensagem', '')}")
        if det.get("rede"):
            lines.append(f"- **Rede:** {'✓' if det['rede'].get('ok') else '✗'} {det['rede'].get('mensagem', '')}")
        if det.get("semantica"):
            sem = det["semantica"]
            lines.append(f"- **Semântica:** {sem.get('veredito', '?')} (confiança {int(sem.get('confianca', 0) * 100)}%)")

        # Pontos de observação que o PO foi orientado a olhar
        if r.pontos_observacao:
            lines.append("- **Pontos a observar:**")
            for po in r.pontos_observacao:
                lines.append(f"  - {po}")

        # Comentários do PO
        if r.comentarios_po:
            lines.append("- **Observações do PO:**")
            for c in r.comentarios_po:
                lines.append(f"  - 💬 {c}")
        else:
            lines.append("- **Observações do PO:** (sem comentários)")

        # Correção
        if r.correcao_necessaria:
            lines.append(f"- **🔧 Correção necessária:** {r.correcao_descricao or '(sem descrição)'}")

        # Screenshots
        if r.screenshot_antes:
            lines.append(f"- **Screenshot ANTES:** `{r.screenshot_antes}`")
        if r.screenshot_depois:
            lines.append(f"- **Screenshot DEPOIS:** `{r.screenshot_depois}`")

        lines.append("")

    # Recomendações
    lines.append("## Recomendações")
    lines.append("")
    if correcoes:
        lines.append(f"- {correcoes} passo(s) marcado(s) como precisando correção. Revisar antes de promover este UC.")
    if reprovados:
        lines.append(f"- {reprovados} reprovação(ões) automática(s). Acionar `/corrigir-divergencias` ou debugar manualmente.")
    if inconclusivos:
        lines.append(f"- {inconclusivos} passo(s) inconclusivo(s) — descrição ancorada provavelmente fraca. Refinar o caso de teste.")
    if not (correcoes or reprovados or inconclusivos):
        lines.append("- Nenhuma divergência detectada. UC pronto para cross-check com trilha humana.")
    lines.append("")

    lines.append("---")
    lines.append("")
    lines.append(f"*Relatório visual gerado em {datetime.now().isoformat(timespec='seconds')}*")
    lines.append("")

    return "\n".join(lines)


def salvar_relatorio(estado, destino_dir: Path | None = None) -> Path:
    """Salva o relatório em testes/relatorios/visual/<uc>_<variacao>_<ts>.md."""
    if destino_dir is None:
        from pathlib import Path as _P
        PROJECT_ROOT = _P(__file__).resolve().parent.parent.parent
        destino_dir = PROJECT_ROOT / "testes" / "relatorios" / "visual"
    destino_dir.mkdir(parents=True, exist_ok=True)
    ts = (estado.iniciado_em or datetime.now().isoformat()).replace(":", "-").replace(".", "-")
    fname = f"{estado.uc_id}_{estado.variacao}_{ts}.md"
    path = destino_dir / fname
    path.write_text(gerar_relatorio_md(estado), encoding="utf-8")
    return path
