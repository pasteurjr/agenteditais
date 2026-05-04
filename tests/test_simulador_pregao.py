"""Testes do Simulador de Pregao Eletronico.

Roda pregoes reais e valida persistencia + comportamento dos agentes.
NAO usa LLM por padrao (--no-llm equivalente) pra testes serem rapidos e deterministicos.
"""
import sys
from pathlib import Path

_BACKEND = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(_BACKEND))
sys.path.insert(0, str(_BACKEND / "pregao"))
sys.path.insert(0, str(_BACKEND / "langnet"))

import pytest
from sqlalchemy import create_engine, text


EDITAIS_URL = "mysql+mysqlconnector://producao:112358123@camerascasas.no-ip.info:3308/editais?charset=utf8mb4"
LANGNET_URL = "mysql+mysqlconnector://producao:112358123@camerascasas.no-ip.info:3308/langnet?charset=utf8mb4"


def test_petri_net_no_banco_existe():
    """A Petri Net do simulador deve estar cadastrada em langnet.projects."""
    import json
    e = create_engine(LANGNET_URL)
    with e.connect() as c:
        r = c.execute(text("SELECT project_data FROM projects WHERE name='Simulador Pregao Eletronico (agenteditais)'")).fetchone()
        assert r is not None, "Petri Net nao cadastrada — rode seed_petri_net_pregao.py"
        d = json.loads(r[0])
        assert len(d["lugares"]) == 9, f"Esperava 9 lugares, achou {len(d['lugares'])}"
        assert len(d["transicoes"]) == 13, f"Esperava 13 transicoes, achou {len(d['transicoes'])}"
        assert len(d["agentes"]) == 6, f"Esperava 6 agentes, achou {len(d['agentes'])}"


def test_5_personalidades_decidem_diferente():
    """Cada personalidade deve dar proposta inicial dentro da faixa esperada."""
    from agentes_licitantes import criar_agentes_padrao

    agentes = criar_agentes_padrao(custo_base=100.0, valor_referencia=200.0, use_llm=False)
    assert len(agentes) == 5

    propostas = {}
    for ag in agentes:
        v = ag.proposta_inicial()
        assert v >= ag.preco_minimo, f"{ag.personalidade} proposta R$ {v} abaixo do minimo R$ {ag.preco_minimo}"
        assert v <= 250.0, f"{ag.personalidade} proposta R$ {v} muito acima do referencia"
        propostas[ag.personalidade] = v

    # Verifica que todas personalidades existem
    assert set(propostas.keys()) == {"agressivo", "conservador", "erratico", "calculista", "reativo"}


def test_pregao_completo_e2e_sem_llm():
    """Roda pregao completo sem LLM. Deve adjudicar com vencedor unico e R$ < referencia."""
    from executor_pregao import rodar_pregao_completo
    res = rodar_pregao_completo(use_llm=False, valor_referencia=300.0, custo_base=150.0,
                                 modalidade="aberto")
    assert "vencedor_id" in res
    assert "vencedor_nome" in res
    assert res["valor_adjudicado"] < 300.0, "Vencedor R$ {} >= referencia".format(res["valor_adjudicado"])
    assert res["valor_adjudicado"] > 0
    assert res["total_lances"] > 0
    assert res["total_rodadas"] >= 1


def test_persistencia_lances_no_banco():
    """Apos pregao, deve haver lances persistidos em simulador_lances."""
    from executor_pregao import rodar_pregao_completo
    res = rodar_pregao_completo(use_llm=False, valor_referencia=300.0, custo_base=150.0,
                                 modalidade="aberto")
    sid = res["sessao_id"]
    e = create_engine(EDITAIS_URL)
    with e.connect() as c:
        n = c.execute(text(f"SELECT COUNT(*) FROM simulador_lances WHERE sessao_id='{sid}'")).scalar()
        assert n >= 5, f"Esperava ao menos 5 lances (5 propostas iniciais), achou {n}"
        # Sessao encerrada com resultado
        estado = c.execute(text(f"SELECT estado FROM simulador_sessoes WHERE id='{sid}'")).scalar()
        assert estado == "encerrado", f"Estado {estado}, esperava 'encerrado'"


def test_petri_estados_capturados():
    """Apos pregao, deve haver snapshots da Petri Net em simulador_petri_estados."""
    from executor_pregao import rodar_pregao_completo
    res = rodar_pregao_completo(use_llm=False, valor_referencia=300.0, custo_base=150.0,
                                 modalidade="aberto")
    sid = res["sessao_id"]
    e = create_engine(EDITAIS_URL)
    with e.connect() as c:
        n = c.execute(text(f"SELECT COUNT(*) FROM simulador_petri_estados WHERE sessao_id='{sid}'")).scalar()
        assert n > 0, "Nenhum snapshot da Petri Net foi gravado"
        # Cada disparo gera 9 snapshots (1 por lugar). Pelo menos 5 disparos esperados.
        assert n >= 9 * 5, f"Esperava >= 45 snapshots, achou {n}"


def test_modalidade_aberto_fechado_vai_para_p_lances_fechados():
    """Modalidade aberto+fechado dispara T_SEM_MAIS_LANCES_ABERTO_FECHADO em vez de _ABERTO."""
    from executor_pregao import rodar_pregao_completo
    res = rodar_pregao_completo(use_llm=False, valor_referencia=500.0, custo_base=200.0,
                                 modalidade="aberto_fechado")
    sid = res["sessao_id"]
    e = create_engine(EDITAIS_URL)
    with e.connect() as c:
        # Deve ter snapshot da transicao T_SEM_MAIS_LANCES_ABERTO_FECHADO ou T_FECHADO_PARA_NEGOCIACAO
        transicoes = [r[0] for r in c.execute(text(
            f"SELECT DISTINCT transicao_disparada FROM simulador_petri_estados WHERE sessao_id='{sid}'"
        )).fetchall() if r[0]]
        assert any("FECHADO" in t for t in transicoes), \
            f"Modalidade aberto_fechado nao disparou T_SEM_MAIS_LANCES_ABERTO_FECHADO ou T_FECHADO_PARA_NEGOCIACAO. Disparadas: {transicoes}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
