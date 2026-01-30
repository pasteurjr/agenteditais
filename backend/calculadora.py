"""
Calculadora Trabalhista - Módulo de Cálculos

Implementa as principais fórmulas de cálculos trabalhistas brasileiros.
Todas as funções retornam dicionários com:
- valor: resultado final
- memoria: detalhamento do cálculo (memória de cálculo)
- formula: fórmula utilizada

Referências legais:
- CLT (Consolidação das Leis do Trabalho)
- Lei 12.506/2011 (Aviso Prévio Proporcional)
- Lei 8.036/1990 (FGTS)
- Constituição Federal Art. 7º
"""

from datetime import date, datetime
from typing import Dict, Any, Optional
from decimal import Decimal, ROUND_HALF_UP
import math


# Constantes
SALARIO_MINIMO_2026 = 1518.00  # Valor atualizado para 2026
HORAS_MES = 220  # Jornada padrão mensal
DIAS_MES = 30


def _round_currency(value: float) -> float:
    """Arredonda para 2 casas decimais (padrão monetário)."""
    return float(Decimal(str(value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))


def _dias_entre_datas(data_inicio: date, data_fim: date) -> int:
    """Calcula dias corridos entre duas datas."""
    return (data_fim - data_inicio).days + 1


def _meses_trabalhados(data_admissao: date, data_demissao: date) -> int:
    """
    Calcula meses trabalhados para fins de férias e 13º.
    Considera fração >= 15 dias como mês completo.
    """
    # Diferença em meses
    meses = (data_demissao.year - data_admissao.year) * 12
    meses += data_demissao.month - data_admissao.month

    # Ajusta pela fração de dias
    if data_demissao.day >= 15:
        meses += 1
    if data_admissao.day > 15:
        meses -= 1

    return max(0, meses)


# =============================================================================
# VERBAS RESCISÓRIAS
# =============================================================================

def calcular_saldo_salario(
    salario: float,
    dias_trabalhados: int
) -> Dict[str, Any]:
    """
    Calcula o saldo de salário (dias trabalhados no mês da rescisão).

    Fórmula: (Salário / 30) × dias trabalhados
    """
    valor_dia = salario / DIAS_MES
    valor = valor_dia * dias_trabalhados

    return {
        "tipo": "saldo_salario",
        "valor": _round_currency(valor),
        "formula": "(Salário ÷ 30) × dias trabalhados",
        "memoria": {
            "salario_base": salario,
            "dias_trabalhados": dias_trabalhados,
            "valor_dia": _round_currency(valor_dia),
            "calculo": f"R$ {salario:.2f} ÷ 30 × {dias_trabalhados} = R$ {valor:.2f}"
        }
    }


def calcular_ferias_proporcionais(
    salario: float,
    meses_trabalhados: int,
    com_terco: bool = True
) -> Dict[str, Any]:
    """
    Calcula férias proporcionais.

    Fórmula: (Salário / 12) × meses + 1/3 constitucional
    Base legal: Art. 146 CLT, Art. 7º XVII CF
    """
    valor_mes = salario / 12
    valor_ferias = valor_mes * meses_trabalhados
    terco = valor_ferias / 3 if com_terco else 0
    valor_total = valor_ferias + terco

    return {
        "tipo": "ferias_proporcionais",
        "valor": _round_currency(valor_total),
        "formula": "(Salário ÷ 12) × meses + 1/3",
        "memoria": {
            "salario_base": salario,
            "meses_trabalhados": meses_trabalhados,
            "valor_por_mes": _round_currency(valor_mes),
            "valor_ferias": _round_currency(valor_ferias),
            "terco_constitucional": _round_currency(terco),
            "calculo": f"(R$ {salario:.2f} ÷ 12) × {meses_trabalhados} = R$ {valor_ferias:.2f} + 1/3 (R$ {terco:.2f}) = R$ {valor_total:.2f}"
        },
        "base_legal": "Art. 146 CLT, Art. 7º XVII CF"
    }


def calcular_ferias_vencidas(
    salario: float,
    periodos_vencidos: int = 1,
    em_dobro: bool = False
) -> Dict[str, Any]:
    """
    Calcula férias vencidas (não gozadas no período concessivo).

    Se não concedidas no prazo (12 meses após período aquisitivo),
    devem ser pagas em dobro (Art. 137 CLT).
    """
    valor_ferias = salario
    terco = salario / 3
    valor_simples = valor_ferias + terco

    multiplicador = 2 if em_dobro else 1
    valor_total = valor_simples * multiplicador * periodos_vencidos

    return {
        "tipo": "ferias_vencidas",
        "valor": _round_currency(valor_total),
        "formula": "(Salário + 1/3) × períodos" + (" × 2 (dobro)" if em_dobro else ""),
        "memoria": {
            "salario_base": salario,
            "periodos_vencidos": periodos_vencidos,
            "valor_ferias": _round_currency(valor_ferias),
            "terco_constitucional": _round_currency(terco),
            "valor_por_periodo": _round_currency(valor_simples),
            "em_dobro": em_dobro,
            "calculo": f"(R$ {salario:.2f} + R$ {terco:.2f}) × {periodos_vencidos}" + (f" × 2 = R$ {valor_total:.2f}" if em_dobro else f" = R$ {valor_total:.2f}")
        },
        "base_legal": "Art. 137 CLT" if em_dobro else "Art. 129 CLT"
    }


def calcular_decimo_terceiro_proporcional(
    salario: float,
    meses_trabalhados: int
) -> Dict[str, Any]:
    """
    Calcula 13º salário proporcional.

    Fórmula: (Salário / 12) × meses trabalhados no ano
    Base legal: Lei 4.090/1962
    """
    meses = min(meses_trabalhados, 12)  # Máximo 12 meses
    valor_mes = salario / 12
    valor = valor_mes * meses

    return {
        "tipo": "decimo_terceiro_proporcional",
        "valor": _round_currency(valor),
        "formula": "(Salário ÷ 12) × meses trabalhados",
        "memoria": {
            "salario_base": salario,
            "meses_trabalhados": meses,
            "valor_por_mes": _round_currency(valor_mes),
            "calculo": f"(R$ {salario:.2f} ÷ 12) × {meses} = R$ {valor:.2f}"
        },
        "base_legal": "Lei 4.090/1962"
    }


def calcular_aviso_previo(
    salario: float,
    anos_trabalhados: int,
    tipo: str = "indenizado"  # "indenizado" ou "trabalhado"
) -> Dict[str, Any]:
    """
    Calcula aviso prévio proporcional ao tempo de serviço.

    Fórmula: 30 dias + 3 dias por ano trabalhado (máx 90 dias)
    Base legal: Lei 12.506/2011, Súmula 441 TST
    """
    # Cálculo dos dias
    dias_base = 30
    dias_adicionais = min(anos_trabalhados * 3, 60)  # Máx 60 dias adicionais
    dias_total = dias_base + dias_adicionais  # Máx 90 dias

    # Valor do aviso
    valor_dia = salario / DIAS_MES
    valor = valor_dia * dias_total

    return {
        "tipo": f"aviso_previo_{tipo}",
        "valor": _round_currency(valor),
        "dias": dias_total,
        "formula": "30 dias + (3 dias × anos trabalhados), máximo 90 dias",
        "memoria": {
            "salario_base": salario,
            "anos_trabalhados": anos_trabalhados,
            "dias_base": dias_base,
            "dias_adicionais": dias_adicionais,
            "dias_total": dias_total,
            "valor_dia": _round_currency(valor_dia),
            "tipo": tipo,
            "calculo": f"30 + ({anos_trabalhados} × 3) = {dias_total} dias × R$ {valor_dia:.2f} = R$ {valor:.2f}"
        },
        "base_legal": "Lei 12.506/2011, Súmula 441 TST"
    }


def calcular_multa_fgts(
    saldo_fgts: float,
    tipo_rescisao: str = "sem_justa_causa"
) -> Dict[str, Any]:
    """
    Calcula multa do FGTS.

    - Sem justa causa: 40% do saldo
    - Culpa recíproca/força maior: 20% do saldo
    Base legal: Art. 18 Lei 8.036/1990
    """
    if tipo_rescisao == "sem_justa_causa":
        percentual = 0.40
        descricao = "40%"
    elif tipo_rescisao in ["culpa_reciproca", "forca_maior"]:
        percentual = 0.20
        descricao = "20%"
    else:
        percentual = 0
        descricao = "0%"

    valor = saldo_fgts * percentual

    return {
        "tipo": "multa_fgts",
        "valor": _round_currency(valor),
        "formula": f"Saldo FGTS × {descricao}",
        "memoria": {
            "saldo_fgts": saldo_fgts,
            "tipo_rescisao": tipo_rescisao,
            "percentual": percentual * 100,
            "calculo": f"R$ {saldo_fgts:.2f} × {percentual:.0%} = R$ {valor:.2f}"
        },
        "base_legal": "Art. 18 Lei 8.036/1990"
    }


# =============================================================================
# HORAS EXTRAS E ADICIONAIS
# =============================================================================

def calcular_horas_extras(
    salario: float,
    quantidade_horas: float,
    percentual_adicional: float = 50,
    tipo: str = "normal"  # "normal", "feriado", "domingo"
) -> Dict[str, Any]:
    """
    Calcula horas extras.

    Fórmula: (Salário / 220) × (1 + adicional%) × quantidade
    Base legal: Art. 59 CLT, Art. 7º XVI CF

    Adicionais típicos:
    - Normal: 50%
    - Feriado/Domingo: 100%
    """
    if tipo == "feriado" or tipo == "domingo":
        percentual_adicional = 100

    valor_hora = salario / HORAS_MES
    multiplicador = 1 + (percentual_adicional / 100)
    valor_hora_extra = valor_hora * multiplicador
    valor_total = valor_hora_extra * quantidade_horas

    return {
        "tipo": "horas_extras",
        "valor": _round_currency(valor_total),
        "formula": "(Salário ÷ 220) × (1 + adicional%) × horas",
        "memoria": {
            "salario_base": salario,
            "valor_hora_normal": _round_currency(valor_hora),
            "percentual_adicional": percentual_adicional,
            "valor_hora_extra": _round_currency(valor_hora_extra),
            "quantidade_horas": quantidade_horas,
            "tipo": tipo,
            "calculo": f"(R$ {salario:.2f} ÷ 220) × {multiplicador:.2f} × {quantidade_horas} = R$ {valor_total:.2f}"
        },
        "base_legal": "Art. 59 CLT, Art. 7º XVI CF"
    }


def calcular_adicional_noturno(
    salario: float,
    horas_noturnas: float,
    percentual: float = 20
) -> Dict[str, Any]:
    """
    Calcula adicional noturno.

    Fórmula: (Salário / 220) × adicional% × horas noturnas
    Hora noturna: 22h às 5h (urbano), reduzida para 52'30"
    Base legal: Art. 73 CLT
    """
    valor_hora = salario / HORAS_MES
    adicional_hora = valor_hora * (percentual / 100)
    valor_total = adicional_hora * horas_noturnas

    return {
        "tipo": "adicional_noturno",
        "valor": _round_currency(valor_total),
        "formula": "(Salário ÷ 220) × adicional% × horas noturnas",
        "memoria": {
            "salario_base": salario,
            "valor_hora_normal": _round_currency(valor_hora),
            "percentual_adicional": percentual,
            "adicional_por_hora": _round_currency(adicional_hora),
            "horas_noturnas": horas_noturnas,
            "calculo": f"(R$ {salario:.2f} ÷ 220) × {percentual}% × {horas_noturnas} = R$ {valor_total:.2f}"
        },
        "base_legal": "Art. 73 CLT",
        "observacao": "Hora noturna: 22h às 5h (urbano), com redução ficta de 52'30\""
    }


def calcular_insalubridade(
    grau: str = "medio",
    base_calculo: str = "salario_minimo",
    salario_base: Optional[float] = None
) -> Dict[str, Any]:
    """
    Calcula adicional de insalubridade.

    Graus:
    - Mínimo: 10%
    - Médio: 20%
    - Máximo: 40%

    Base de cálculo: Salário mínimo (discussão jurisprudencial)
    Base legal: Art. 192 CLT, NR-15
    """
    percentuais = {
        "minimo": 10,
        "medio": 20,
        "maximo": 40
    }

    percentual = percentuais.get(grau.lower(), 20)

    if base_calculo == "salario_minimo" or salario_base is None:
        base = SALARIO_MINIMO_2026
        base_desc = f"Salário Mínimo (R$ {SALARIO_MINIMO_2026:.2f})"
    else:
        base = salario_base
        base_desc = f"Salário Base (R$ {salario_base:.2f})"

    valor = base * (percentual / 100)

    return {
        "tipo": "adicional_insalubridade",
        "valor": _round_currency(valor),
        "formula": f"Base × {percentual}%",
        "memoria": {
            "grau": grau,
            "percentual": percentual,
            "base_calculo": base_calculo,
            "valor_base": base,
            "calculo": f"R$ {base:.2f} × {percentual}% = R$ {valor:.2f}"
        },
        "base_legal": "Art. 192 CLT, NR-15",
        "observacao": f"Base de cálculo: {base_desc}"
    }


def calcular_periculosidade(
    salario: float
) -> Dict[str, Any]:
    """
    Calcula adicional de periculosidade.

    Fórmula: Salário base × 30%
    Base legal: Art. 193 CLT, NR-16
    """
    percentual = 30
    valor = salario * (percentual / 100)

    return {
        "tipo": "adicional_periculosidade",
        "valor": _round_currency(valor),
        "formula": "Salário base × 30%",
        "memoria": {
            "salario_base": salario,
            "percentual": percentual,
            "calculo": f"R$ {salario:.2f} × 30% = R$ {valor:.2f}"
        },
        "base_legal": "Art. 193 CLT, NR-16"
    }


# =============================================================================
# RESCISÃO COMPLETA
# =============================================================================

def calcular_rescisao_completa(
    salario: float,
    data_admissao: str,  # formato: "YYYY-MM-DD"
    data_demissao: str,
    dias_trabalhados_mes: int,
    saldo_fgts: float,
    tipo_rescisao: str = "sem_justa_causa",
    ferias_vencidas: int = 0,
    aviso_previo_trabalhado: bool = False
) -> Dict[str, Any]:
    """
    Calcula rescisão completa com todas as verbas.

    Tipos de rescisão:
    - sem_justa_causa: Todas as verbas + multa 40%
    - pedido_demissao: Sem multa FGTS, sem aviso (se não trabalhar)
    - justa_causa: Apenas saldo salário e férias vencidas
    - acordo: Metade do aviso + 20% multa FGTS (Lei 13.467/2017)
    """
    # Converter datas
    dt_admissao = datetime.strptime(data_admissao, "%Y-%m-%d").date()
    dt_demissao = datetime.strptime(data_demissao, "%Y-%m-%d").date()

    # Cálculos base
    meses = _meses_trabalhados(dt_admissao, dt_demissao)
    anos = (dt_demissao - dt_admissao).days // 365

    # Meses do ano para 13º
    if dt_demissao.month >= dt_admissao.month and dt_demissao.year == dt_admissao.year:
        meses_13 = dt_demissao.month - dt_admissao.month + (1 if dt_demissao.day >= 15 else 0)
    else:
        meses_13 = dt_demissao.month + (1 if dt_demissao.day >= 15 else 0)
    meses_13 = min(meses_13, 12)

    # Meses para férias proporcionais (período aquisitivo atual)
    meses_ferias = meses % 12 if meses >= 12 else meses

    verbas = {}
    total = 0

    # 1. Saldo de salário (sempre devido)
    saldo = calcular_saldo_salario(salario, dias_trabalhados_mes)
    verbas["saldo_salario"] = saldo
    total += saldo["valor"]

    # 2. Férias vencidas (sempre devidas)
    if ferias_vencidas > 0:
        f_vencidas = calcular_ferias_vencidas(salario, ferias_vencidas, em_dobro=True)
        verbas["ferias_vencidas"] = f_vencidas
        total += f_vencidas["valor"]

    # Verbas condicionais por tipo de rescisão
    if tipo_rescisao != "justa_causa":
        # 3. Férias proporcionais
        if meses_ferias > 0:
            f_prop = calcular_ferias_proporcionais(salario, meses_ferias)
            verbas["ferias_proporcionais"] = f_prop
            total += f_prop["valor"]

        # 4. 13º proporcional
        if meses_13 > 0:
            decimo = calcular_decimo_terceiro_proporcional(salario, meses_13)
            verbas["decimo_terceiro_proporcional"] = decimo
            total += decimo["valor"]

    # 5. Aviso prévio (se não for justa causa nem pedido de demissão trabalhado)
    if tipo_rescisao == "sem_justa_causa":
        tipo_aviso = "trabalhado" if aviso_previo_trabalhado else "indenizado"
        aviso = calcular_aviso_previo(salario, anos, tipo_aviso)
        verbas["aviso_previo"] = aviso
        if not aviso_previo_trabalhado:
            total += aviso["valor"]
    elif tipo_rescisao == "acordo":
        # Acordo: metade do aviso prévio indenizado
        aviso = calcular_aviso_previo(salario, anos, "indenizado")
        aviso["valor"] = _round_currency(aviso["valor"] / 2)
        aviso["memoria"]["acordo"] = "50% do valor (acordo Art. 484-A CLT)"
        verbas["aviso_previo"] = aviso
        total += aviso["valor"]

    # 6. Multa FGTS
    if tipo_rescisao == "sem_justa_causa":
        multa = calcular_multa_fgts(saldo_fgts, "sem_justa_causa")
        verbas["multa_fgts"] = multa
        total += multa["valor"]
    elif tipo_rescisao == "acordo":
        multa = calcular_multa_fgts(saldo_fgts, "culpa_reciproca")  # 20%
        multa["memoria"]["acordo"] = "20% do valor (acordo Art. 484-A CLT)"
        verbas["multa_fgts"] = multa
        total += multa["valor"]

    return {
        "tipo": "rescisao_completa",
        "tipo_rescisao": tipo_rescisao,
        "total": _round_currency(total),
        "verbas": verbas,
        "dados_contrato": {
            "salario": salario,
            "data_admissao": data_admissao,
            "data_demissao": data_demissao,
            "tempo_servico_dias": (dt_demissao - dt_admissao).days,
            "tempo_servico_meses": meses,
            "tempo_servico_anos": anos,
            "meses_13_atual": meses_13,
            "meses_ferias_proporcionais": meses_ferias
        }
    }


# =============================================================================
# FUNÇÃO PRINCIPAL DE CÁLCULO
# =============================================================================

def calcular(tipo: str, **params) -> Dict[str, Any]:
    """
    Função principal que roteia para o cálculo específico.

    Tipos disponíveis:
    - saldo_salario
    - ferias_proporcionais
    - ferias_vencidas
    - decimo_terceiro
    - aviso_previo
    - multa_fgts
    - horas_extras
    - adicional_noturno
    - insalubridade
    - periculosidade
    - rescisao_completa
    """
    calculadoras = {
        "saldo_salario": calcular_saldo_salario,
        "ferias_proporcionais": calcular_ferias_proporcionais,
        "ferias_vencidas": calcular_ferias_vencidas,
        "decimo_terceiro": calcular_decimo_terceiro_proporcional,
        "aviso_previo": calcular_aviso_previo,
        "multa_fgts": calcular_multa_fgts,
        "horas_extras": calcular_horas_extras,
        "adicional_noturno": calcular_adicional_noturno,
        "insalubridade": calcular_insalubridade,
        "periculosidade": calcular_periculosidade,
        "rescisao_completa": calcular_rescisao_completa,
    }

    if tipo not in calculadoras:
        return {
            "erro": f"Tipo de cálculo '{tipo}' não reconhecido",
            "tipos_disponiveis": list(calculadoras.keys())
        }

    try:
        return calculadoras[tipo](**params)
    except TypeError as e:
        return {
            "erro": f"Parâmetros inválidos para '{tipo}': {str(e)}"
        }
    except Exception as e:
        return {
            "erro": f"Erro no cálculo: {str(e)}"
        }
