"""
Popula a tabela uc_predecessores a partir do dict PREDECESSORES em
scripts/gerar_ucs_v7.py. Idempotente: deleta tudo antes de inserir.

Uso:
    python3 testes/framework_visual/seed/seed_uc_predecessores.py
"""
from __future__ import annotations

import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_PROJECT = _HERE.parent.parent.parent
sys.path.insert(0, str(_HERE.parent))
sys.path.insert(0, str(_PROJECT / "scripts"))

from db.engine import get_db  # type: ignore
from db.models import CasoDeUso, UcPredecessor  # type: ignore
from gerar_ucs_v7 import PREDECESSORES  # type: ignore


def parse_predecessor(item: str) -> list[dict]:
    """
    Converte 1 string de predecessor em lista de dicts pra inserir.

    Exemplos:
      "UC-F01"            → [{tipo: "uc", uc_id: "UC-F01"}]
      "[login]"           → [{tipo: "marcador", marcador: "[login]"}]
      "UC-A OU UC-B"      → [{tipo: "uc", uc_id: "UC-A"}, {tipo: "uc", uc_id: "UC-B"}]  (mesmo grupo_or)
      "UC-A OU [seed]"    → [{tipo: "uc", uc_id: "UC-A"}, {tipo: "marcador", marcador: "[seed]"}]
    """
    parts = [p.strip() for p in item.split(" OU ")]
    out = []
    for p in parts:
        if p.startswith("[") and p.endswith("]"):
            out.append({"tipo": "marcador", "marcador": p})
        elif p.startswith("UC-"):
            out.append({"tipo": "uc", "uc_id": p})
    return out


def main():
    print("=== seed_uc_predecessores ===")
    db = get_db()
    try:
        # Map uc_id (string tipo "UC-F02") -> id real (UUID)
        ucs = {uc.uc_id: uc.id for uc in db.query(CasoDeUso).all()}
        print(f"  {len(ucs)} UCs carregados do banco")

        # Limpa tudo antes
        n_apagados = db.query(UcPredecessor).delete()
        if n_apagados > 0:
            print(f"  {n_apagados} predecessores antigos apagados")
        db.commit()

        n_inseridos = 0
        n_uc_sem_match = 0
        warnings = []

        for uc_id_str, lista_preds in PREDECESSORES.items():
            uc_db_id = ucs.get(uc_id_str)
            if not uc_db_id:
                warnings.append(f"UC '{uc_id_str}' nao existe no banco — skipping")
                continue

            ordem_global = 0
            grupo_or_atual = 0  # 0 = nao OR; >0 quando split de OU

            for pred_str in lista_preds:
                ordem_global += 1
                opcoes = parse_predecessor(pred_str)
                # Se for "A OU B" tem >1 opcao no mesmo grupo
                if len(opcoes) > 1:
                    grupo_or_atual += 1
                    grupo_atual = grupo_or_atual
                else:
                    grupo_atual = 0  # AND, sem grupo

                for opt in opcoes:
                    if opt["tipo"] == "uc":
                        pred_db_id = ucs.get(opt["uc_id"])
                        if not pred_db_id:
                            warnings.append(f"  predecessor '{opt['uc_id']}' (de {uc_id_str}) nao existe no banco")
                            n_uc_sem_match += 1
                            continue
                        db.add(UcPredecessor(
                            uc_id=uc_db_id,
                            predecessor_id=pred_db_id,
                            marcador=None,
                            grupo_or=grupo_atual,
                            ordem=ordem_global,
                        ))
                    else:  # marcador
                        db.add(UcPredecessor(
                            uc_id=uc_db_id,
                            predecessor_id=None,
                            marcador=opt["marcador"],
                            grupo_or=grupo_atual,
                            ordem=ordem_global,
                        ))
                    n_inseridos += 1

        db.commit()
        print(f"\n=== OK ===")
        print(f"  {n_inseridos} predecessores inseridos")
        print(f"  {n_uc_sem_match} UCs referenciados que nao existem no banco")
        if warnings:
            print(f"\n  AVISOS ({len(warnings)}):")
            for w in warnings[:20]:
                print(f"    - {w}")
            if len(warnings) > 20:
                print(f"    ... +{len(warnings) - 20} avisos")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
