"""
Adapter PNCP — wrapper fino sobre `backend/tools.py::_buscar_*_pncp`.

Reusa as funções do projeto pra:
  - Buscar editais com prazo futuro
  - Filtrar os que têm arquivo baixável (PDF/ZIP)
  - Baixar os arquivos pra `testes/contextos/<ciclo_id>/editais/`

NÃO duplica lógica de PNCP — só orquestra.
"""

from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import requests

# Path para o backend
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND = PROJECT_ROOT / "backend"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))


def _data_aberura_futura(data_str: str | None, dias_minimos: int = 3) -> bool:
    """Verifica se data_str (ISO ou similar) é >= hoje + dias_minimos."""
    if not data_str:
        return False
    try:
        # Tenta vários formatos comuns de data PNCP
        for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
            try:
                dt = datetime.strptime(data_str.split(".")[0].split("+")[0], fmt)
                limite = datetime.now() + timedelta(days=dias_minimos)
                return dt >= limite
            except ValueError:
                continue
    except Exception:
        pass
    return False


def buscar_editais_candidatos(
    termo_busca: str = "diagnostico",
    n_minimo: int = 3,
    dias_minimos: int = 3,
) -> list[dict[str, Any]]:
    """
    Busca editais no PNCP que sejam candidatos à validação.

    Critérios:
      - Data de abertura de proposta no futuro (>= hoje + dias_minimos)
      - Tem pelo menos 1 arquivo PDF/ZIP baixável (verificado via _buscar_arquivos_pncp)
      - Texto do objeto contém o termo_busca (case-insensitive), se fornecido

    Estratégia: query direta no endpoint /contratacoes/publicacao com
    janela de datas. Reutiliza `_buscar_arquivos_pncp` do projeto.
    """
    try:
        from tools import _buscar_arquivos_pncp  # type: ignore
        from config import PNCP_BASE_URL  # type: ignore
    except ImportError as e:
        raise ImportError(
            f"Falha ao importar funcoes PNCP do backend: {e}. "
            "Garanta que backend/tools.py esta acessivel."
        )

    # A API PNCP filtra por dataPublicacao. Para encontrar editais com abertura
    # futura, buscamos publicacoes recentes (ultimos 30 dias) e depois filtramos
    # por dataAberturaProposta no codigo.
    hoje = datetime.now()
    data_inicial = (hoje - timedelta(days=30)).strftime("%Y%m%d")
    data_final = hoje.strftime("%Y%m%d")

    candidatos: list[dict[str, Any]] = []
    termo_lower = termo_busca.lower() if termo_busca else None

    # Pesquisa em até 3 páginas (150 editais), para cada modalidade comum
    for modalidade in (6, 8, 4):  # Pregão Eletrônico, Dispensa, Concorrência
        if len(candidatos) >= n_minimo:
            break
        for pagina in range(1, 4):
            if len(candidatos) >= n_minimo:
                break
            try:
                resp = requests.get(
                    f"{PNCP_BASE_URL}/contratacoes/publicacao",
                    params={
                        "dataInicial": data_inicial,
                        "dataFinal": data_final,
                        "codigoModalidadeContratacao": modalidade,
                        "tamanhoPagina": 50,
                        "pagina": pagina,
                    },
                    headers={"Accept": "application/json"},
                    timeout=30,
                )
                if resp.status_code != 200:
                    break
                items = resp.json().get("data", []) or []
            except Exception as e:
                print(f"[pncp_adapter] Erro PNCP pagina {pagina}: {e}")
                break

            if not items:
                break

            for item in items:
                if len(candidatos) >= n_minimo:
                    break

                # Filtro por termo de busca no objeto
                if termo_lower:
                    objeto = (item.get("objetoCompra") or "").lower()
                    if termo_lower not in objeto:
                        continue

                # Filtro: data abertura futura
                if not _data_aberura_futura(item.get("dataAberturaProposta"), dias_minimos):
                    continue

                orgao = item.get("orgaoEntidade") or {}
                cnpj = (orgao.get("cnpj") or "").replace(".", "").replace("/", "").replace("-", "")
                ano = item.get("anoCompra")
                seq = item.get("sequencialCompra")

                if not (cnpj and ano and seq):
                    continue

                # Verifica arquivos baixáveis
                try:
                    arqs = _buscar_arquivos_pncp(cnpj, int(ano), int(seq))
                except Exception:
                    arqs = []
                baixaveis = [a for a in arqs if (a.get("url") or "").lower().endswith((".pdf", ".zip"))]
                if not baixaveis:
                    continue

                candidatos.append({
                    "numero": str(item.get("numeroCompra") or ""),
                    "objeto": item.get("objetoCompra", "")[:200],
                    "cnpj_orgao": cnpj,
                    "ano_compra": ano,
                    "seq_compra": seq,
                    "url_pncp": f"https://pncp.gov.br/app/editais/{cnpj}/{ano}/{seq}",
                    "data_abertura": item.get("dataAberturaProposta", ""),
                    "modalidade": modalidade,
                    "arquivos": baixaveis,
                })

    return candidatos


def baixar_edital(edital: dict[str, Any], destino_dir: Path) -> str:
    """
    Baixa o primeiro arquivo PDF/ZIP do edital pra destino_dir.
    Retorna path local do arquivo baixado.
    """
    destino_dir.mkdir(parents=True, exist_ok=True)
    if not edital.get("arquivos"):
        raise ValueError(f"Edital {edital.get('numero')} sem arquivos baixaveis")
    arq = edital["arquivos"][0]
    url = arq.get("url", "")
    if not url:
        raise ValueError("Arquivo sem URL")

    # Nome do arquivo a partir do basename da URL
    parsed = urlparse(url)
    fname = os.path.basename(parsed.path) or "edital.pdf"
    # Sanitize fname
    fname = "".join(c if c.isalnum() or c in "._-" else "_" for c in fname)
    if not fname.lower().endswith((".pdf", ".zip")):
        fname += ".pdf"

    safe_numero = (edital.get("numero", "edital") or "edital").replace("/", "_")
    full = destino_dir / f"edital_{safe_numero}__{fname}"
    if full.exists():
        return str(full)

    resp = requests.get(url, timeout=60, stream=True)
    resp.raise_for_status()
    with open(full, "wb") as f:
        for chunk in resp.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
    return str(full)


def selecionar_e_baixar(
    n: int,
    destino_dir: Path,
    termo_busca: str = "diagnostico",
) -> list[dict[str, Any]]:
    """
    Seleciona N editais e baixa os arquivos pra destino_dir.

    Retorna lista enriquecida com `arquivo_local` apontando pro path baixado.
    """
    candidatos = buscar_editais_candidatos(termo_busca=termo_busca, n_minimo=n)
    selecionados: list[dict[str, Any]] = []
    for ed in candidatos[:n]:
        try:
            local = baixar_edital(ed, destino_dir)
            ed["arquivo_local"] = local
            selecionados.append(ed)
        except Exception as e:
            print(f"[pncp_adapter] Falhou ao baixar edital {ed.get('numero')}: {e}")
    return selecionados


if __name__ == "__main__":
    # Smoke test
    import argparse

    parser = argparse.ArgumentParser(description="Selecionar editais reais do PNCP")
    parser.add_argument("--n", type=int, default=3, help="Quantos editais")
    parser.add_argument("--termo", default="diagnostico", help="Termo de busca")
    parser.add_argument("--destino", required=True, help="Dir destino dos PDFs")
    args = parser.parse_args()

    selecionados = selecionar_e_baixar(args.n, Path(args.destino), termo_busca=args.termo)
    print(f"\nSelecionados {len(selecionados)} editais:")
    for ed in selecionados:
        print(f"  - {ed['numero']} ({ed['data_abertura']}) → {ed.get('arquivo_local')}")
