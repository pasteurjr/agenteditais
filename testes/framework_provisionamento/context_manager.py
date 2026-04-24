"""
Orquestrador da Fase 0 — provisiona contexto completo de um ciclo de validação.

Para cada uma das 3 trilhas (e2e, visual, humano):
  1. Aloca usuário sequencial valida<N>
  2. Gera CNPJ válido + único
  3. Seleciona N editais do PNCP (se UCs do ciclo precisarem)
  4. Renderiza 6 documentos fictícios
  5. Grava contexto.yaml em testes/contextos/<ciclo_id>/

NÃO cria empresa — UC-F01 cria via UI (Opção Y).

Uso programático:
    from context_manager import criar_ciclo
    ctx = criar_ciclo(ciclo_id="2026-04-25_103000",
                      ambiente="agenteditais",
                      precisa_editais=True,
                      termo_busca_pncp="diagnostico")
"""

from __future__ import annotations

import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

import yaml

# Path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "backend"))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from cnpj_generator import gerar_cnpj_unico  # type: ignore
from user_allocator import alocar_usuarios  # type: ignore
from document_renderer import renderizar_todos  # type: ignore

TRILHAS = ("e2e", "visual", "humano")

# Razões sociais por trilha (templates legíveis)
RAZAO_SOCIAL_TEMPLATES = {
    "e2e": "E2E_{ciclo_short}_EMPRESA_{n:03d}",
    "visual": "DEMO {n:03d} Comércio e Representações Ltda",
    "humano": "RP3X {n:03d} Comércio e Representações Ltda",
}


def _ciclo_id_default() -> str:
    return datetime.now().strftime("%Y-%m-%d_%H%M%S")


def _path_contexto(ciclo_id: str) -> Path:
    return PROJECT_ROOT / "testes" / "contextos" / ciclo_id


def criar_ciclo(
    ciclo_id: str | None = None,
    ambiente: str = "agenteditais",
    precisa_editais: bool = False,
    termo_busca_pncp: str = "diagnostico",
    n_editais: int = 3,
    sprints_no_ciclo: list[int] | None = None,
) -> dict[str, Any]:
    """
    Provisiona contexto completo de um ciclo. Retorna o dict do contexto.yaml.

    Se já existe contexto.yaml para o ciclo_id, levanta erro (use carregar_ciclo).
    """
    ciclo_id = ciclo_id or _ciclo_id_default()
    ctx_dir = _path_contexto(ciclo_id)
    contexto_yaml_path = ctx_dir / "contexto.yaml"

    if contexto_yaml_path.exists():
        raise FileExistsError(
            f"Contexto ja existe para ciclo_id={ciclo_id}. Use carregar_ciclo() ou apague o diretorio."
        )

    print(f"[ctx] Provisionando ciclo {ciclo_id} (ambiente={ambiente})")
    ctx_dir.mkdir(parents=True, exist_ok=True)

    # 1. Alocar 3 usuários sequenciais
    print(f"[ctx] Alocando 3 usuarios sequenciais...")
    usuarios = alocar_usuarios(quantidade=3)
    if len(usuarios) != 3:
        raise RuntimeError(f"Esperava 3 usuarios, recebi {len(usuarios)}")
    print(f"[ctx]   alocados: {[u['email'] for u in usuarios]}")

    # 2. Gerar 3 CNPJs únicos
    print(f"[ctx] Gerando 3 CNPJs unicos...")
    cnpjs = [gerar_cnpj_unico() for _ in range(3)]
    print(f"[ctx]   {cnpjs}")

    # 3. Editais (opcional)
    editais_por_trilha: dict[str, list[dict]] = {t: [] for t in TRILHAS}
    if precisa_editais:
        print(f"[ctx] Selecionando {n_editais} editais do PNCP (termo='{termo_busca_pncp}')...")
        try:
            from pncp_adapter import selecionar_e_baixar  # type: ignore
            editais_dir = ctx_dir / "editais"
            editais = selecionar_e_baixar(
                n=n_editais, destino_dir=editais_dir, termo_busca=termo_busca_pncp
            )
            # Distribui mesmos editais para as 3 trilhas (validacao roda em ambientes
            # diferentes, mas mesma seleção de editais facilita cross-check)
            for t in TRILHAS:
                editais_por_trilha[t] = editais
            print(f"[ctx]   {len(editais)} editais baixados em {editais_dir}")
        except Exception as e:
            print(f"[ctx] AVISO: falha ao selecionar editais (continuando sem): {e}")

    # 4. Renderizar documentos por trilha
    print(f"[ctx] Renderizando documentos ficticios para 3 trilhas...")
    docs_por_trilha: dict[str, dict[str, str]] = {}
    ciclo_short = ciclo_id.split("_")[0].replace("-", "")
    for i, trilha in enumerate(TRILHAS):
        empresa_dict = {
            "razao_social": RAZAO_SOCIAL_TEMPLATES[trilha].format(
                ciclo_short=ciclo_short, n=i + 1
            ),
            "cnpj": cnpjs[i],
            "endereco": "Av. da Validacao, 1000 — Sao Paulo/SP — 01000-000",
            "responsavel": f"Validador {i + 1}",
        }
        destino = ctx_dir / "docs" / trilha
        docs = renderizar_todos(empresa_dict, destino)
        docs_por_trilha[trilha] = docs

    # 5. Montar e gravar contexto.yaml
    contexto: dict[str, Any] = {
        "ciclo_id": ciclo_id,
        "criado_em": datetime.now().isoformat(timespec="seconds"),
        "ambiente": ambiente,
        "sprints_no_ciclo": sprints_no_ciclo or [],
        "trilhas": {},
    }

    for i, trilha in enumerate(TRILHAS):
        u = usuarios[i]
        razao_social = RAZAO_SOCIAL_TEMPLATES[trilha].format(
            ciclo_short=ciclo_short, n=i + 1
        )
        contexto["trilhas"][trilha] = {
            "usuario": {
                "email": u["email"],
                "senha": u["senha"],
                "id": u["id"],
            },
            "empresa": {
                "cnpj_pretendido": cnpjs[i],
                "razao_social_pretendida": razao_social,
                "id": None,  # preenchido após UC-F01 criar via UI
            },
            "editais_selecionados": editais_por_trilha.get(trilha, []),
            "documentos_renderizados": docs_por_trilha.get(trilha, {}),
        }

    with open(contexto_yaml_path, "w", encoding="utf-8") as f:
        yaml.safe_dump(contexto, f, allow_unicode=True, sort_keys=False, default_flow_style=False)

    print(f"[ctx] OK: contexto gravado em {contexto_yaml_path}")
    return contexto


def carregar_ciclo(ciclo_id: str) -> dict[str, Any]:
    """Carrega contexto.yaml de um ciclo existente."""
    contexto_yaml_path = _path_contexto(ciclo_id) / "contexto.yaml"
    if not contexto_yaml_path.exists():
        raise FileNotFoundError(f"Contexto nao encontrado: {contexto_yaml_path}")
    with open(contexto_yaml_path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def atualizar_empresa_id(ciclo_id: str, trilha: str, empresa_id: str) -> None:
    """
    Atualiza o `empresa.id` de uma trilha após UC-F01 criar a empresa via UI.
    """
    contexto = carregar_ciclo(ciclo_id)
    if trilha not in contexto["trilhas"]:
        raise ValueError(f"Trilha {trilha} nao existe no contexto")
    contexto["trilhas"][trilha]["empresa"]["id"] = empresa_id
    contexto_yaml_path = _path_contexto(ciclo_id) / "contexto.yaml"
    with open(contexto_yaml_path, "w", encoding="utf-8") as f:
        yaml.safe_dump(contexto, f, allow_unicode=True, sort_keys=False)
    print(f"[ctx] empresa.id={empresa_id} salvo para trilha={trilha}")


def limpar_ciclo(ciclo_id: str, trilhas: tuple[str, ...] = ("e2e",)) -> None:
    """
    Limpa dados de um ciclo no banco para as trilhas especificadas.

    Por padrão limpa só a E2E (visual e humano são reusáveis).
    Remove usuários e empresas associadas (a empresa criada pelo UC-F01).
    """
    from user_allocator import remover_usuarios  # type: ignore

    contexto = carregar_ciclo(ciclo_id)
    emails_para_remover: list[str] = []
    for trilha in trilhas:
        t = contexto["trilhas"].get(trilha)
        if not t:
            continue
        emails_para_remover.append(t["usuario"]["email"])

    if emails_para_remover:
        n = remover_usuarios(emails_para_remover)
        print(f"[ctx] {n} usuario(s) removido(s) (cascade apaga empresas associadas)")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Provisionar contexto de ciclo de validacao")
    parser.add_argument("--criar", action="store_true", help="Criar novo ciclo")
    parser.add_argument("--ciclo-id", help="ID do ciclo (default: timestamp)")
    parser.add_argument("--ambiente", default="agenteditais")
    parser.add_argument("--editais", action="store_true", help="Buscar editais do PNCP")
    parser.add_argument("--termo", default="diagnostico", help="Termo PNCP")
    parser.add_argument("--sprints", help="Sprints no ciclo (ex: 1,2,3)")
    parser.add_argument("--carregar", help="Carregar ciclo existente")
    parser.add_argument("--limpar", help="Limpar ciclo (so trilha E2E)")

    args = parser.parse_args()

    if args.carregar:
        ctx = carregar_ciclo(args.carregar)
        print(yaml.safe_dump(ctx, allow_unicode=True, default_flow_style=False))
    elif args.limpar:
        limpar_ciclo(args.limpar)
    elif args.criar:
        sprints = [int(s) for s in args.sprints.split(",")] if args.sprints else None
        ctx = criar_ciclo(
            ciclo_id=args.ciclo_id,
            ambiente=args.ambiente,
            precisa_editais=args.editais,
            termo_busca_pncp=args.termo,
            sprints_no_ciclo=sprints,
        )
        print(f"\nCiclo criado: {ctx['ciclo_id']}")
    else:
        parser.print_help()
