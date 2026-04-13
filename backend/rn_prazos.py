"""
RN Prazos — Helpers de contagem de dias uteis conforme Lei 14.133/2021.

Cobertura:
- RN-155: Contagem de prazo exclui sabados/domingos
- RN-156: Prazo de impugnacao = 3 dias uteis (Art. 164)
- RN-160: Prazo de recurso = 3 dias uteis (Art. 165 §1º I)
- RN-163: Calendario de feriados nacionais (via workalendar)

A biblioteca `workalendar` cobre feriados federais do Brasil. Feriados
estaduais e municipais NAO sao cobertos — evolucao futura via tabela.
"""
from datetime import date, datetime, timedelta
from typing import Union

try:
    from workalendar.america import Brazil
    _CAL = Brazil()
    _WORKALENDAR_OK = True
except ImportError:
    _CAL = None
    _WORKALENDAR_OK = False
    print("[RN-163 WARN] workalendar nao instalado — usando fallback sab/dom apenas")


DateLike = Union[date, datetime]


def _to_date(d: DateLike) -> date:
    if isinstance(d, datetime):
        return d.date()
    return d


def is_dia_util(d: DateLike) -> bool:
    """RN-163: True se for dia util (nao eh sab/dom nem feriado federal)."""
    d = _to_date(d)
    if _WORKALENDAR_OK:
        return _CAL.is_working_day(d)
    return d.weekday() < 5  # fallback: seg-sex


def adicionar_dias_uteis(d: DateLike, dias: int) -> date:
    """RN-156/160/163: adiciona N dias uteis a partir de d.

    Se d cair em dia nao util, a contagem comeca no proximo dia util.
    """
    d = _to_date(d)
    if _WORKALENDAR_OK:
        return _CAL.add_working_days(d, dias)
    # Fallback: conta sab/dom apenas
    atual = d
    restantes = dias
    while restantes > 0:
        atual = atual + timedelta(days=1)
        if atual.weekday() < 5:
            restantes -= 1
    return atual


def dias_uteis_entre(inicio: DateLike, fim: DateLike) -> int:
    """Conta dias uteis entre inicio (exclusivo) e fim (inclusivo)."""
    inicio, fim = _to_date(inicio), _to_date(fim)
    if fim < inicio:
        return 0
    count = 0
    atual = inicio
    while atual < fim:
        atual = atual + timedelta(days=1)
        if is_dia_util(atual):
            count += 1
    return count


def prazo_impugnacao_final(data_publicacao: DateLike) -> date:
    """RN-156: prazo final de impugnacao = data_publicacao + 3 dias uteis (Art. 164)."""
    return adicionar_dias_uteis(data_publicacao, 3)


def prazo_recurso_final(data_decisao: DateLike) -> date:
    """RN-160: prazo final de recurso = data_decisao + 3 dias uteis (Art. 165 §1º I)."""
    return adicionar_dias_uteis(data_decisao, 3)


def dias_restantes_ate(prazo_final: DateLike, hoje: DateLike = None) -> int:
    """Dias uteis restantes ate prazo_final (positivo se futuro, 0 se hoje, negativo se passou)."""
    prazo_final = _to_date(prazo_final)
    hoje = _to_date(hoje) if hoje else date.today()
    if prazo_final < hoje:
        return -dias_uteis_entre(prazo_final, hoje)
    return dias_uteis_entre(hoje, prazo_final)
