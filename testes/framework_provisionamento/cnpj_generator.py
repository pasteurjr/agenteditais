"""
Gerador de CNPJ válido + verificador de unicidade no banco.

Algoritmo da Receita Federal (14 dígitos com 2 DVs).
Verifica `SELECT id FROM empresas WHERE cnpj = ?` antes de retornar.
Retry até 10x se colidir; após isso, declara impasse.
"""

from __future__ import annotations

import os
import random
import sys
from typing import Optional

# Sobe o path para conseguir importar do backend/
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BACKEND = os.path.join(PROJECT_ROOT, "backend")
if BACKEND not in sys.path:
    sys.path.insert(0, BACKEND)

# Pesos do algoritmo da RF
PESOS_DV1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
PESOS_DV2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

MAX_TENTATIVAS = 10


def calcular_dv(digitos: list[int], pesos: list[int]) -> int:
    """Calcula um dígito verificador da RF."""
    soma = sum(d * p for d, p in zip(digitos, pesos))
    resto = soma % 11
    return 0 if resto < 2 else 11 - resto


def gerar_cnpj_aleatorio(prefixo: Optional[str] = None) -> str:
    """
    Gera um CNPJ válido.

    Se prefixo for fornecido (até 12 dígitos), os dígitos verificadores são
    calculados em cima do prefixo + zeros + dv1 + dv2.
    """
    base: list[int]
    if prefixo:
        digitos_pref = [int(c) for c in prefixo if c.isdigit()][:12]
        base = digitos_pref + [random.randint(0, 9) for _ in range(12 - len(digitos_pref))]
    else:
        base = [random.randint(0, 9) for _ in range(12)]

    dv1 = calcular_dv(base, PESOS_DV1)
    dv2 = calcular_dv(base + [dv1], PESOS_DV2)
    return "".join(str(d) for d in base + [dv1, dv2])


def validar_cnpj(cnpj: str) -> bool:
    """Valida CNPJ pelo algoritmo da RF."""
    digitos = [int(c) for c in cnpj if c.isdigit()]
    if len(digitos) != 14:
        return False
    # Rejeita CNPJs com todos os dígitos iguais
    if len(set(digitos)) == 1:
        return False
    base = digitos[:12]
    dv1_esperado = calcular_dv(base, PESOS_DV1)
    if digitos[12] != dv1_esperado:
        return False
    dv2_esperado = calcular_dv(base + [dv1_esperado], PESOS_DV2)
    return digitos[13] == dv2_esperado


def formatar_cnpj(cnpj: str) -> str:
    """Aplica máscara XX.XXX.XXX/XXXX-XX."""
    d = "".join(c for c in cnpj if c.isdigit())
    if len(d) != 14:
        return cnpj
    return f"{d[:2]}.{d[2:5]}.{d[5:8]}/{d[8:12]}-{d[12:14]}"


def existe_no_banco(cnpj: str, db_session=None) -> bool:
    """
    Verifica se o CNPJ já existe na tabela `empresas`.

    Aceita tanto CNPJ formatado quanto não. Compara desconsiderando máscara.
    """
    cnpj_clean = "".join(c for c in cnpj if c.isdigit())
    if db_session is None:
        from models import get_db  # noqa
        db = get_db()
        try:
            return _query_cnpj(db, cnpj_clean)
        finally:
            db.close()
    return _query_cnpj(db_session, cnpj_clean)


def _query_cnpj(db, cnpj_clean: str) -> bool:
    from models import Empresa  # noqa
    # Busca tanto formatado quanto sem mascara
    encontradas = (
        db.query(Empresa.id)
        .filter(
            (Empresa.cnpj == cnpj_clean)
            | (Empresa.cnpj == formatar_cnpj(cnpj_clean))
        )
        .first()
    )
    return encontradas is not None


def gerar_cnpj_unico(prefixo: Optional[str] = None, db_session=None) -> str:
    """
    Gera um CNPJ válido E único no banco.

    Tenta até 10 vezes; se colidir 10 vezes, levanta RuntimeError.
    Retorna o CNPJ formatado.
    """
    for tentativa in range(1, MAX_TENTATIVAS + 1):
        cnpj_raw = gerar_cnpj_aleatorio(prefixo)
        cnpj_fmt = formatar_cnpj(cnpj_raw)
        if not existe_no_banco(cnpj_raw, db_session=db_session):
            return cnpj_fmt
    raise RuntimeError(
        f"Falha ao gerar CNPJ único após {MAX_TENTATIVAS} tentativas — provavelmente bug no gerador ou banco com colisão sistêmica"
    )


if __name__ == "__main__":
    # Smoke test (sem DB) — só testa geração e validação
    import argparse

    parser = argparse.ArgumentParser(description="Gerador de CNPJ válido RF")
    parser.add_argument("--n", type=int, default=5, help="Quantos CNPJs gerar")
    parser.add_argument("--validar", help="CNPJ para validar")
    args = parser.parse_args()

    if args.validar:
        ok = validar_cnpj(args.validar)
        print(f"{args.validar}: {'VÁLIDO' if ok else 'INVÁLIDO'}")
    else:
        print(f"Gerando {args.n} CNPJs (sem checagem de banco):")
        for _ in range(args.n):
            cnpj = gerar_cnpj_aleatorio()
            ok = validar_cnpj(cnpj)
            print(f"  {formatar_cnpj(cnpj)}  ({'OK' if ok else 'BUG'})")
