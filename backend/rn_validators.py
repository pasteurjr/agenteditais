"""
RN Validators — Regras de Negocio formalizadas em Secao 13 de requisitos_completosv8.md

Cobertura:
- RN-028: DV CNPJ
- RN-029: DV CPF
- RN-035: Formato NCM (XXXX.XX.XX)
- RN-042: Email RFC 5322 simplificado
- RN-078: UF valida (IBGE)
- RN-121: Quantidade inteira >= 1
- RN-125: Lance D > Lance E
- RN-209: Valor entrega <= saldo
- RN-206: Gestor != Fiscal
- RN-207: Aditivo cumulativo <= 25%

Cada funcao levanta ValueError com mensagem PT-BR em caso de falha.
"""
import re


UFS_IBGE = {
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO",
}

_NCM_RE = re.compile(r"^\d{4}\.\d{2}\.\d{2}$")
_EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")


def _digitos(s: str) -> str:
    return re.sub(r"\D", "", s or "")


def validar_cnpj(cnpj: str) -> bool:
    """RN-028: valida DV de CNPJ. Aceita formatado ou so digitos."""
    c = _digitos(cnpj)
    if len(c) != 14 or c == c[0] * 14:
        return False
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    pesos2 = [6] + pesos1
    soma1 = sum(int(c[i]) * pesos1[i] for i in range(12))
    dv1 = 11 - (soma1 % 11)
    dv1 = 0 if dv1 >= 10 else dv1
    if dv1 != int(c[12]):
        return False
    soma2 = sum(int(c[i]) * pesos2[i] for i in range(13))
    dv2 = 11 - (soma2 % 11)
    dv2 = 0 if dv2 >= 10 else dv2
    return dv2 == int(c[13])


def validar_cpf(cpf: str) -> bool:
    """RN-029: valida DV de CPF. Aceita formatado ou so digitos."""
    c = _digitos(cpf)
    if len(c) != 11 or c == c[0] * 11:
        return False
    soma1 = sum(int(c[i]) * (10 - i) for i in range(9))
    dv1 = 11 - (soma1 % 11)
    dv1 = 0 if dv1 >= 10 else dv1
    if dv1 != int(c[9]):
        return False
    soma2 = sum(int(c[i]) * (11 - i) for i in range(10))
    dv2 = 11 - (soma2 % 11)
    dv2 = 0 if dv2 >= 10 else dv2
    return dv2 == int(c[10])


def validar_ncm(ncm: str) -> bool:
    """RN-035: NCM deve seguir padrao XXXX.XX.XX (8 digitos com pontos)."""
    if not ncm:
        return False
    return bool(_NCM_RE.match(ncm.strip()))


def validar_email(email: str) -> bool:
    """RN-042: email RFC 5322 simplificado."""
    if not email:
        return False
    return bool(_EMAIL_RE.match(email.strip()))


def validar_uf(uf: str) -> bool:
    """RN-078: UF deve estar na lista do IBGE."""
    if not uf:
        return False
    return uf.strip().upper() in UFS_IBGE


def validar_quantidade(qtd) -> bool:
    """RN-121: quantidade de volumetria deve ser inteira >= 1."""
    try:
        n = int(qtd)
        return n >= 1
    except (TypeError, ValueError):
        return False


def validar_lance_d_maior_e(lance_d, lance_e) -> bool:
    """RN-125: primeiro lance (Camada D) > lance minimo (Camada E)."""
    try:
        return float(lance_d) > float(lance_e)
    except (TypeError, ValueError):
        return False


def validar_entrega_dentro_saldo(valor_entrega, saldo_contrato) -> bool:
    """RN-209: valor da entrega <= saldo restante do contrato."""
    try:
        return float(valor_entrega) <= float(saldo_contrato)
    except (TypeError, ValueError):
        return False


def validar_gestor_diferente_fiscal(gestor_id, fiscal_id) -> bool:
    """RN-206: gestor_id != fiscal_id (Art. 117 Lei 14.133/2021)."""
    if not gestor_id or not fiscal_id:
        return True
    return str(gestor_id) != str(fiscal_id)


def validar_aditivo_cumulativo(aditivos_existentes_pct: float, novo_aditivo_pct: float) -> bool:
    """RN-207: soma cumulativa de aditivos <= 25% do valor original (Art. 124-126)."""
    try:
        return (float(aditivos_existentes_pct) + float(novo_aditivo_pct)) <= 25.0
    except (TypeError, ValueError):
        return False


class RNValidationError(ValueError):
    """Erro de violacao de Regra de Negocio. Carrega o codigo RN."""
    def __init__(self, rn_code: str, message: str):
        self.rn_code = rn_code
        super().__init__(f"[{rn_code}] {message}")


def check(rn_code: str, condition: bool, message: str):
    """Helper: levanta RNValidationError se condition for False."""
    if not condition:
        raise RNValidationError(rn_code, message)
