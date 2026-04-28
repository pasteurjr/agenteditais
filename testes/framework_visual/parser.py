"""
Parser do tutorial visual.

Lê:
  - testes/tutoriais_visual/<UC>_<variacao>.md (MD + blocos YAML)
  - testes/casos_de_teste/<UC>_visual_<variacao>.{yaml,md} (caso de teste)
  - testes/datasets/<UC>_visual.yaml (dataset)
  - testes/contextos/<ciclo_id>/contexto.yaml (contexto, opcional)

Produz uma estrutura `Tutorial` com lista de `Passo`s prontos para o
executor consumir e o painel exibir.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


@dataclass
class Acao:
    """Ação que o executor deve fazer no browser."""
    tipo: str  # "click", "fill", "wait_for", "navigate", "navegacao"
    seletor: str | None = None
    alternativa: str | None = None
    valor_literal: str | None = None
    valor_from_dataset: str | None = None
    valor_from_contexto: str | None = None
    valor_from_pasta_docs: str | None = None  # caminho relativo dentro de users.pasta_documentos_teste
    destino: str | None = None
    url: str | None = None
    metodo: str | None = None  # GET/POST/PUT/DELETE — usado por chamar_api
    payload_json: dict | list | None = None  # body pra chamar_api (JSON)
    timeout: int = 10000
    sequencia: list["Acao"] = field(default_factory=list)


@dataclass
class PassoVisual:
    """Um passo do tutorial visual (renderizado no painel + executado)."""
    id: str
    descricao_painel: str  # Texto natural do MD que aparece no painel
    titulo_acao: str  # Curto: "Preencher CNPJ"
    acao: Acao
    pontos_observacao: list[str] = field(default_factory=list)
    validacao_ref: str | None = None  # path#step_id


@dataclass
class CasoTesteVisual:
    """Asserções do caso de teste (resolvidas em tempo de execução)."""
    passos: dict[str, dict[str, Any]] = field(default_factory=dict)


@dataclass
class Tutorial:
    """Tutorial visual completo carregado."""
    uc_id: str
    variacao: str
    trilha: str
    base_url: str
    ambiente: str
    dataset_ref: str
    caso_de_teste_ref: str
    passos: list[PassoVisual]
    dataset: dict[str, Any]
    caso_de_teste: dict[str, Any]
    contexto: dict[str, Any] | None = None


def _resolve_path(rel: str) -> Path:
    """Resolve path relativo ao projeto."""
    return PROJECT_ROOT / rel if not rel.startswith("/") else Path(rel)


def _parse_acao(d: dict[str, Any]) -> Acao:
    """Constrói Acao a partir de dict YAML."""
    sub = []
    if d.get("sequencia"):
        sub = [_parse_acao(s) for s in d["sequencia"]]
    return Acao(
        tipo=d.get("tipo", ""),
        seletor=d.get("seletor"),
        alternativa=d.get("alternativa"),
        valor_literal=d.get("valor_literal"),
        valor_from_dataset=d.get("valor_from_dataset"),
        valor_from_contexto=d.get("valor_from_contexto"),
        valor_from_pasta_docs=d.get("valor_from_pasta_docs"),
        destino=d.get("destino"),
        url=d.get("url"),
        metodo=d.get("metodo"),
        payload_json=d.get("payload_json"),
        timeout=int(d.get("timeout", 10000)),
        sequencia=sub,
    )


def _extrair_passo_visual(secao_md: str, bloco_yaml: dict[str, Any]) -> PassoVisual:
    """
    Junta texto natural da seção (entre o título e o bloco yaml) com os dados
    estruturados do YAML. O texto vai pro painel; o YAML controla execução.
    """
    titulo_match = re.match(r"^##\s+(?:Passo\s+\d+\s*[:—-]\s*)?(.+?)$", secao_md.strip().split("\n", 1)[0])
    titulo = titulo_match.group(1).strip() if titulo_match else "Passo"

    # Extrair pontos de observação se houver "Observe criticamente" ou similar
    pontos: list[str] = []
    obs_match = re.search(
        r"\*\*Observe criticamente:?\*\*[^\n]*\n((?:-\s*.+\n?)+)",
        secao_md,
        re.IGNORECASE,
    )
    if obs_match:
        for ln in obs_match.group(1).strip().split("\n"):
            ln = ln.strip()
            if ln.startswith("-"):
                pontos.append(ln.lstrip("- ").strip())

    # Descrição do painel = todo o texto da seção exceto o bloco YAML
    desc_painel = re.sub(r"```yaml[\s\S]*?```", "", secao_md, flags=re.MULTILINE).strip()

    return PassoVisual(
        id=bloco_yaml.get("id", "passo_sem_id"),
        descricao_painel=desc_painel,
        titulo_acao=titulo,
        acao=_parse_acao(bloco_yaml.get("acao_executor") or bloco_yaml.get("acao") or {}),
        pontos_observacao=pontos,
        validacao_ref=bloco_yaml.get("validacao_ref"),
    )


def _split_secoes(corpo: str) -> list[str]:
    """Divide o corpo do MD em seções por '## '."""
    partes = re.split(r"(?m)^##\s+", corpo)
    # Primeira parte (antes do primeiro ##) descartada — header geral.
    return [f"## {p}" for p in partes[1:]] if len(partes) > 1 else []


def carregar_tutorial(
    uc_id: str,
    variacao: str,
    ciclo_id: str | None = None,
) -> Tutorial:
    """
    Carrega o tutorial visual + caso de teste + dataset.

    Path do tutorial: testes/tutoriais_visual/<uc>_<variacao>.md
    """
    tutorial_path = PROJECT_ROOT / "testes" / "tutoriais_visual" / f"{uc_id}_{variacao}.md"
    if not tutorial_path.exists():
        raise FileNotFoundError(f"Tutorial visual nao encontrado: {tutorial_path}")

    text = tutorial_path.read_text(encoding="utf-8")

    # Frontmatter
    fm_match = re.match(r"^---\r?\n([\s\S]*?)\r?\n---", text)
    if not fm_match:
        raise ValueError(f"Tutorial sem frontmatter: {tutorial_path}")
    metadados = yaml.safe_load(fm_match.group(1))

    corpo = text[fm_match.end():]
    secoes = _split_secoes(corpo)

    # Para cada seção, encontrar o bloco yaml e construir PassoVisual
    passos: list[PassoVisual] = []
    bloco_re = re.compile(r"```yaml\s*\n([\s\S]*?)\n```")
    for sec in secoes:
        bloco_match = bloco_re.search(sec)
        if not bloco_match:
            continue
        try:
            yml = yaml.safe_load(bloco_match.group(1))
            if not isinstance(yml, dict) or "id" not in yml:
                continue
            passos.append(_extrair_passo_visual(sec, yml))
        except yaml.YAMLError as e:
            print(f"[parser] YAML invalido em secao: {e}")

    # Dataset
    dataset_path = _resolve_path(metadados["dataset_ref"])
    dataset = yaml.safe_load(dataset_path.read_text(encoding="utf-8"))

    # Caso de teste (pode ser yaml OU md — para visual normalmente yaml)
    cdt_path = _resolve_path(metadados["caso_de_teste_ref"])
    if cdt_path.suffix == ".yaml":
        caso_de_teste = yaml.safe_load(cdt_path.read_text(encoding="utf-8"))
    else:
        caso_de_teste = {"raw_md": cdt_path.read_text(encoding="utf-8")}

    # Contexto opcional
    contexto = None
    if ciclo_id:
        ctx_path = PROJECT_ROOT / "testes" / "contextos" / ciclo_id / "contexto.yaml"
        if ctx_path.exists():
            contexto = yaml.safe_load(ctx_path.read_text(encoding="utf-8"))

    return Tutorial(
        uc_id=metadados["uc_id"],
        variacao=metadados["variacao"],
        trilha=metadados.get("trilha", "visual"),
        base_url=metadados.get("base_url", "http://localhost:5180"),
        ambiente=metadados.get("ambiente", "agenteditais"),
        dataset_ref=metadados["dataset_ref"],
        caso_de_teste_ref=metadados["caso_de_teste_ref"],
        passos=passos,
        dataset=dataset,
        caso_de_teste=caso_de_teste,
        contexto=contexto,
    )


def resolve_valor_acao(
    acao: Acao,
    dataset: dict[str, Any],
    contexto: dict[str, Any] | None,
    trilha: str = "visual",
) -> str | None:
    """Resolve valor_literal | valor_from_dataset | valor_from_contexto | valor_from_pasta_docs."""
    if acao.valor_literal is not None:
        return str(acao.valor_literal)
    if acao.valor_from_dataset:
        return _get_nested(dataset, acao.valor_from_dataset)
    if acao.valor_from_contexto and contexto:
        trilha_ctx = contexto.get("trilhas", {}).get(trilha)
        if trilha_ctx:
            return _get_nested(trilha_ctx, acao.valor_from_contexto)
    if acao.valor_from_pasta_docs and contexto:
        # contexto["pasta_documentos_teste"] eh injetado pelo executor_sprint1
        # antes da execucao (vem de users.pasta_documentos_teste)
        pasta = contexto.get("pasta_documentos_teste")
        if pasta:
            from pathlib import Path as _P
            return str(_P(pasta) / acao.valor_from_pasta_docs)
    return None


def _get_nested(d: Any, key: str) -> str | None:
    """Acessa chave aninhada (ex: 'valores.empresa.cnpj')."""
    cur = d
    for part in key.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return str(cur) if cur is not None else None


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Parser do tutorial visual")
    parser.add_argument("uc_id")
    parser.add_argument("variacao")
    parser.add_argument("--ciclo")
    args = parser.parse_args()

    tut = carregar_tutorial(args.uc_id, args.variacao, args.ciclo)
    print(f"Tutorial {tut.uc_id} ({tut.variacao}): {len(tut.passos)} passos")
    for p in tut.passos:
        print(f"  - {p.id}: {p.titulo_acao} (acao={p.acao.tipo})")
        if p.pontos_observacao:
            for po in p.pontos_observacao:
                print(f"    obs: {po}")
