"""Modo interativo do simulador: pregao avanca por etapas (controlado pelo operador).

Diferente do executor_pregao.py (que roda tudo de uma vez), este modulo expoe
metodos atomicos: avancar_etapa(), dar_lance_operador(), instruir_pregoeiro(), etc.
Estado fica persistido no banco — UI consulta e exibe.
"""
from __future__ import annotations
import json
import sys
import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional

_BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_BACKEND))
sys.path.insert(0, str(_BACKEND / "pregao"))
sys.path.insert(0, str(_BACKEND / "langnet"))

from sqlalchemy import create_engine, text
from langnet import PetriNet  # noqa: E402
from agentes_licitantes import criar_agentes_padrao, AgenteLicitante  # noqa: E402
from pregoeiro_ia import (  # noqa: E402
    classificar_propostas, deve_encerrar_rodada, negociar_com_vencedor,
    habilitar_documental, adjudicar, gerar_ata_pregao
)
from executor_pregao import (  # noqa: E402
    carregar_petri_net_do_banco, construir_petri_net_runtime,
    disparar_transicao, _salvar_estado_petri,
    EDITAIS_URL,
)

# Sessoes interativas em memoria (state machine por sessao_id)
_SESSOES_INTERATIVAS: Dict[str, Dict[str, Any]] = {}


def criar_sessao_interativa(valor_referencia: float = 200.0,
                             custo_base: float = 100.0,
                             modalidade: str = "aberto",
                             operador_participa: bool = True,
                             operador_custo_estimado: float = None,
                             use_llm: bool = True) -> Dict:
    """Cria sessao em estado 'aguardando_propostas'.

    Operador participa como 6o licitante: nome 'OPERADOR (Voce)' personalidade 'operador'.
    """
    pn_dados = carregar_petri_net_do_banco()
    pn = construir_petri_net_runtime(pn_dados["petri_net"])

    sessao_id = str(uuid.uuid4())
    config = {
        "valor_referencia": valor_referencia,
        "custo_base": custo_base,
        "modalidade": modalidade,
        "operador_participa": operador_participa,
        "operador_custo": operador_custo_estimado or custo_base * 1.0,
        "use_llm": use_llm,
        "max_rodadas": 10,
    }

    e = create_engine(EDITAIS_URL)
    with e.connect() as c:
        c.execute(text("""INSERT INTO simulador_sessoes
            (id, langnet_project_id, modalidade, estado, config_json)
            VALUES (:id, :p, :m, 'iniciado', :c)"""),
            {"id": sessao_id, "p": pn_dados["project_id"],
             "m": modalidade, "c": json.dumps(config)})

        agentes_ia = criar_agentes_padrao(custo_base, valor_referencia, use_llm=use_llm)

        # Operador como pseudo-agente
        operador = None
        if operador_participa:
            operador_id = str(uuid.uuid4())
            preco_min_operador = config["operador_custo"] * 1.05
            operador = {
                "id": operador_id,
                "nome": "OPERADOR (Voce)",
                "cnpj": "00.000.000/0001-00",
                "personalidade": "operador",
                "custo": config["operador_custo"],
                "minimo": preco_min_operador,
            }
            c.execute(text("""INSERT INTO simulador_agentes
                (id, sessao_id, personalidade, nome_ficticio, cnpj_ficticio, estado)
                VALUES (:id, :s, :p, :n, :c, :e)"""),
                {"id": operador_id, "s": sessao_id, "p": "operador",
                 "n": "OPERADOR (Voce)", "c": "00.000.000/0001-00",
                 "e": json.dumps({"custo": config["operador_custo"], "minimo": preco_min_operador})})

        for ag in agentes_ia:
            ag.id = str(uuid.uuid4())
            c.execute(text("""INSERT INTO simulador_agentes
                (id, sessao_id, personalidade, nome_ficticio, cnpj_ficticio, estado)
                VALUES (:id, :s, :p, :n, :c, :e)"""),
                {"id": ag.id, "s": sessao_id, "p": ag.personalidade,
                 "n": ag.nome, "c": ag.cnpj,
                 "e": json.dumps({"custo": ag.custo_estimado, "minimo": ag.preco_minimo})})
        c.commit()

    # Dispara T_ABRIR_PROPOSTAS pra mover token de P_INICIO -> P_PROPOSTAS
    disparar_transicao(pn, "T_ABRIR_PROPOSTAS", sessao_id)

    state = {
        "sessao_id": sessao_id,
        "petri_net": pn,
        "petri_dict": pn_dados["petri_net"],
        "agentes_ia": agentes_ia,
        "operador": operador,
        "config": config,
        "etapa": "propostas",  # propostas | lances | negociacao | habilitacao | adjudicacao | encerrado
        "rodada": 0,
        "valores_atuais": {},  # {agente_id: valor_atual}
        "historico_lances": [],
        "instrucoes_pregoeiro": [],  # mensagens chat
        "log": [],
    }
    _SESSOES_INTERATIVAS[sessao_id] = state
    return {"sessao_id": sessao_id, "operador": operador,
            "agentes": [{"id": a.id, "nome": a.nome, "personalidade": a.personalidade,
                         "cnpj": a.cnpj, "custo": a.custo_estimado, "minimo": a.preco_minimo}
                        for a in agentes_ia],
            "config": config, "etapa": "propostas"}


def obter_estado(sessao_id: str) -> Dict:
    """Retorna snapshot completo da sessao pra UI exibir."""
    state = _SESSOES_INTERATIVAS.get(sessao_id)
    if not state:
        # Tenta carregar do banco
        return _carregar_do_banco(sessao_id)

    pn = state["petri_net"]
    petri_lugares_estado = []
    for lug_dict in state["petri_dict"]["lugares"]:
        lug_obj = next((l for l in pn.lugares if l.nome == lug_dict["id"]), None)
        petri_lugares_estado.append({
            "id": lug_dict["id"],
            "nome": lug_dict.get("nome", lug_dict["id"]),
            "coordenadas": lug_dict.get("coordenadas", {"x": 0, "y": 0}),
            "tokens": lug_obj.numero_tokens if lug_obj else 0,
            "agentId": lug_dict.get("agentId"),
        })

    # Ranking atual
    valores = state["valores_atuais"]
    ranking = sorted(
        [{"agente_id": aid, "valor": v} for aid, v in valores.items()],
        key=lambda x: x["valor"]
    ) if valores else []

    # Adiciona nomes ao ranking
    todos_ag = state.get("agentes_ia", []) + ([state["operador"]] if state.get("operador") else [])
    nome_map = {}
    pers_map = {}
    for a in state.get("agentes_ia", []):
        nome_map[a.id] = a.nome
        pers_map[a.id] = a.personalidade
    if state.get("operador"):
        nome_map[state["operador"]["id"]] = state["operador"]["nome"]
        pers_map[state["operador"]["id"]] = "operador"
    for r in ranking:
        r["nome"] = nome_map.get(r["agente_id"], "?")
        r["personalidade"] = pers_map.get(r["agente_id"], "?")

    return {
        "sessao_id": sessao_id,
        "etapa": state["etapa"],
        "rodada": state["rodada"],
        "max_rodadas": state["config"]["max_rodadas"],
        "config": state["config"],
        "petri_lugares": petri_lugares_estado,
        "petri_transicoes": state["petri_dict"]["transicoes"],
        "petri_arcos": state["petri_dict"]["arcos"],
        "ranking": ranking,
        "historico_lances": state["historico_lances"][-50:],  # ultimos 50
        "operador": state.get("operador"),
        "instrucoes_pregoeiro": state["instrucoes_pregoeiro"][-20:],
        "log": state["log"][-30:],
    }


def coletar_propostas_iniciais(sessao_id: str, valor_proposta_operador: float = None) -> Dict:
    """Coleta propostas iniciais de todos. Operador deve passar sua proposta tambem.

    Move estado: 'propostas' -> 'classificacao' -> 'lances' (rodada 1).
    """
    state = _SESSOES_INTERATIVAS[sessao_id]
    if state["etapa"] != "propostas":
        return {"erro": f"Etapa atual eh {state['etapa']}, nao 'propostas'"}

    e = create_engine(EDITAIS_URL)
    propostas = []

    # Operador (se participa)
    if state["operador"]:
        if valor_proposta_operador is None:
            return {"erro": "operador participa mas nao informou proposta inicial"}
        v = float(valor_proposta_operador)
        if v < state["operador"]["minimo"]:
            return {"erro": f"proposta do operador R$ {v} abaixo do minimo R$ {state['operador']['minimo']}"}
        propostas.append({"agente_id": state["operador"]["id"], "agente_nome": state["operador"]["nome"],
                          "personalidade": "operador", "valor": v})
        state["valores_atuais"][state["operador"]["id"]] = v
        state["log"].append(f"OPERADOR submeteu proposta inicial R$ {v:.2f}")
        with e.connect() as c:
            c.execute(text("""INSERT INTO simulador_lances (id, sessao_id, agente_id, rodada, valor, tipo)
                VALUES (:id, :s, :a, 0, :v, 'proposta')"""),
                {"id": str(uuid.uuid4()), "s": sessao_id, "a": state["operador"]["id"], "v": v})
            c.execute(text("UPDATE simulador_agentes SET proposta_inicial=:v WHERE id=:i"),
                      {"v": v, "i": state["operador"]["id"]})
            c.commit()

    # Agentes IA
    for ag in state["agentes_ia"]:
        v = ag.proposta_inicial()
        propostas.append({"agente_id": ag.id, "agente_nome": ag.nome,
                          "personalidade": ag.personalidade, "valor": v})
        state["valores_atuais"][ag.id] = v
        state["log"].append(f"{ag.personalidade.upper()} {ag.nome[:25]} R$ {v:.2f}")
        with e.connect() as c:
            c.execute(text("""INSERT INTO simulador_lances (id, sessao_id, agente_id, rodada, valor, tipo)
                VALUES (:id, :s, :a, 0, :v, 'proposta')"""),
                {"id": str(uuid.uuid4()), "s": sessao_id, "a": ag.id, "v": v})
            c.execute(text("UPDATE simulador_agentes SET proposta_inicial=:v WHERE id=:i"),
                      {"v": v, "i": ag.id})
            c.commit()

    # Disparar T_TODAS_PROPOSTAS
    disparar_transicao(state["petri_net"], "T_TODAS_PROPOSTAS", sessao_id)

    # Classificacao
    cls = classificar_propostas(propostas, state["config"]["valor_referencia"])
    classificados_ids = {p["agente_id"] for p in cls["classificados"]}
    # Mantem so quem foi classificado
    state["valores_atuais"] = {aid: v for aid, v in state["valores_atuais"].items() if aid in classificados_ids}
    state["log"].append(f"Classificados: {len(cls['classificados'])} | Desclassificados: {len(cls['desclassificados'])}")
    disparar_transicao(state["petri_net"], "T_INICIAR_LANCES", sessao_id)

    state["etapa"] = "lances"
    state["rodada"] = 0
    return {"ok": True, "etapa": "lances",
            "classificados": len(cls["classificados"]),
            "desclassificados": len(cls["desclassificados"])}


def avancar_rodada(sessao_id: str, lance_operador: Optional[float] = None,
                   passar_operador: bool = False) -> Dict:
    """Avanca 1 rodada de lances abertos. Operador pode dar lance ou passar.

    IAs decidem automaticamente apos.
    """
    state = _SESSOES_INTERATIVAS[sessao_id]
    if state["etapa"] != "lances":
        return {"erro": f"Etapa atual eh {state['etapa']}, nao 'lances'"}

    state["rodada"] += 1
    rodada = state["rodada"]
    e = create_engine(EDITAIS_URL)
    valores = state["valores_atuais"]

    ranking = sorted(
        [{"agente_id": aid, "valor": v} for aid, v in valores.items()],
        key=lambda x: x["valor"]
    )

    novos_lances = 0
    log_rodada = []

    # 1) Operador primeiro (se participa e nao passou)
    if state["operador"] and state["operador"]["id"] in valores:
        meu_v = valores[state["operador"]["id"]]
        if not passar_operador and lance_operador is not None:
            v = float(lance_operador)
            if v >= meu_v:
                log_rodada.append(f"OPERADOR: lance R$ {v} >= seu valor atual R$ {meu_v} (ignorado)")
            elif v < state["operador"]["minimo"]:
                log_rodada.append(f"OPERADOR: lance R$ {v} abaixo do seu minimo R$ {state['operador']['minimo']} (rejeitado)")
            else:
                valores[state["operador"]["id"]] = v
                state["historico_lances"].append({"rodada": rodada, "agente_id": state["operador"]["id"], "valor": v})
                log_rodada.append(f"OPERADOR: R$ {meu_v:.2f} -> R$ {v:.2f}")
                with e.connect() as c:
                    c.execute(text("""INSERT INTO simulador_lances (id, sessao_id, agente_id, rodada, valor, tipo)
                        VALUES (:id, :s, :a, :r, :v, 'lance_aberto')"""),
                        {"id": str(uuid.uuid4()), "s": sessao_id, "a": state["operador"]["id"],
                         "r": rodada, "v": v})
                    c.commit()
                novos_lances += 1
        elif passar_operador:
            log_rodada.append(f"OPERADOR: passou a rodada {rodada}")

    # Re-rank apos lance do operador
    ranking = sorted(
        [{"agente_id": aid, "valor": v} for aid, v in valores.items()],
        key=lambda x: x["valor"]
    )

    # 2) IAs decidem
    for ag in state["agentes_ia"]:
        meu_v = valores.get(ag.id)
        if meu_v is None: continue
        novo = ag.decidir_lance(ranking, rodada, meu_v)
        if novo is None or novo >= meu_v:
            continue
        valores[ag.id] = novo
        state["historico_lances"].append({"rodada": rodada, "agente_id": ag.id, "valor": novo})
        log_rodada.append(f"{ag.personalidade.upper()} {ag.nome[:20]}: R$ {meu_v:.2f} -> R$ {novo:.2f}")
        with e.connect() as c:
            c.execute(text("""INSERT INTO simulador_lances (id, sessao_id, agente_id, rodada, valor, tipo)
                VALUES (:id, :s, :a, :r, :v, 'lance_aberto')"""),
                {"id": str(uuid.uuid4()), "s": sessao_id, "a": ag.id, "r": rodada, "v": novo})
            c.commit()
        novos_lances += 1

    state["log"].append(f"=== Rodada {rodada}: {novos_lances} lances ===")
    state["log"].extend(log_rodada)
    disparar_transicao(state["petri_net"], "T_NOVA_RODADA", sessao_id)

    # Decidir se encerra
    encerrar = deve_encerrar_rodada(state["historico_lances"], rodada,
                                     state["config"]["max_rodadas"], rodadas_sem_lance=2)
    if encerrar:
        state["log"].append(f"PREGOEIRO: encerrando rodadas (rodada={rodada}, novos={novos_lances})")
        state["etapa"] = "negociacao_pendente"
        # Disparar saida
        if state["config"]["modalidade"] == "aberto_fechado":
            disparar_transicao(state["petri_net"], "T_SEM_MAIS_LANCES_ABERTO_FECHADO", sessao_id)
            state["etapa"] = "lance_fechado_pendente"
        else:
            disparar_transicao(state["petri_net"], "T_SEM_MAIS_LANCES_ABERTO", sessao_id)

    return {"ok": True, "rodada": rodada, "novos_lances": novos_lances,
            "encerrou": encerrar, "etapa": state["etapa"]}


def executar_negociacao(sessao_id: str) -> Dict:
    """Pregoeiro tenta negociar com o lider."""
    state = _SESSOES_INTERATIVAS[sessao_id]
    if state["etapa"] not in ("negociacao_pendente", "lance_fechado_pendente"):
        return {"erro": f"Etapa atual eh {state['etapa']}"}

    valores = state["valores_atuais"]
    ranking = sorted(
        [{"agente_id": aid, "valor": v} for aid, v in valores.items()],
        key=lambda x: x["valor"]
    )
    lider_id = ranking[0]["agente_id"]
    lider_valor = ranking[0]["valor"]

    # Encontra o agente
    operador = state.get("operador")
    if operador and lider_id == operador["id"]:
        lider_obj = {"nome": operador["nome"], "minimo": operador["minimo"]}
        eh_operador = True
    else:
        ag = next((a for a in state["agentes_ia"] if a.id == lider_id), None)
        lider_obj = {"nome": ag.nome, "minimo": ag.preco_minimo} if ag else {"nome": "?", "minimo": 0}
        eh_operador = False

    state["log"].append(f"PREGOEIRO: negociando com lider {lider_obj['nome']} R$ {lider_valor:.2f}")

    neg = negociar_com_vencedor(
        {"agente_id": lider_id, "aceita_negociacao": True},
        lider_valor, state["config"]["valor_referencia"]
    )
    if neg["negociado"] and neg["valor_final"] < lider_valor:
        valores[lider_id] = neg["valor_final"]
        state["log"].append(f"LIDER aceitou desconto. Novo R$ {neg['valor_final']:.2f}")
        e = create_engine(EDITAIS_URL)
        with e.connect() as c:
            c.execute(text("""INSERT INTO simulador_lances (id, sessao_id, agente_id, rodada, valor, tipo)
                VALUES (:id, :s, :a, 1000, :v, 'negociacao')"""),
                {"id": str(uuid.uuid4()), "s": sessao_id, "a": lider_id, "v": neg["valor_final"]})
            c.commit()
        disparar_transicao(state["petri_net"], "T_NEGOCIAR", sessao_id)
    else:
        state["log"].append(f"PREGOEIRO: nao precisou negociar ({neg.get('motivo', '')})")
        disparar_transicao(state["petri_net"], "T_PULAR_NEGOCIACAO", sessao_id)

    state["etapa"] = "habilitacao_pendente"
    return {"ok": True, "etapa": "habilitacao_pendente",
            "lider_nome": lider_obj["nome"], "valor": valores[lider_id]}


def executar_habilitacao(sessao_id: str) -> Dict:
    """Pregoeiro verifica documentos do lider."""
    state = _SESSOES_INTERATIVAS[sessao_id]
    if state["etapa"] != "habilitacao_pendente":
        return {"erro": f"Etapa atual eh {state['etapa']}"}

    valores = state["valores_atuais"]
    ranking = sorted([{"agente_id": aid, "valor": v} for aid, v in valores.items()], key=lambda x: x["valor"])
    lider_id = ranking[0]["agente_id"]

    hab = habilitar_documental({"agente_id": lider_id})
    if hab["habilitado"]:
        state["log"].append(f"PREGOEIRO: lider HABILITADO")
        disparar_transicao(state["petri_net"], "T_HABILITAR", sessao_id)
        state["etapa"] = "adjudicacao_pendente"
    else:
        state["log"].append(f"PREGOEIRO: lider INABILITADO. Motivo: {hab['motivo']}")
        disparar_transicao(state["petri_net"], "T_INABILITAR", sessao_id)
        # Remove lider e volta pra negociacao com o proximo
        del valores[lider_id]
        if not valores:
            state["etapa"] = "deserto"
        else:
            state["etapa"] = "negociacao_pendente"

    return {"ok": True, "etapa": state["etapa"], "habilitado": hab["habilitado"],
            "motivo": hab.get("motivo")}


def executar_adjudicacao(sessao_id: str) -> Dict:
    """Adjudica e gera ata."""
    state = _SESSOES_INTERATIVAS[sessao_id]
    if state["etapa"] != "adjudicacao_pendente":
        return {"erro": f"Etapa atual eh {state['etapa']}"}

    valores = state["valores_atuais"]
    ranking = sorted([{"agente_id": aid, "valor": v} for aid, v in valores.items()], key=lambda x: x["valor"])
    lider_id = ranking[0]["agente_id"]
    lider_valor = ranking[0]["valor"]

    # Pega nome
    operador = state.get("operador")
    if operador and lider_id == operador["id"]:
        nome = operador["nome"]
        cnpj = operador["cnpj"]
    else:
        ag = next((a for a in state["agentes_ia"] if a.id == lider_id), None)
        nome = ag.nome if ag else "?"
        cnpj = ag.cnpj if ag else "?"

    state["log"].append(f"PREGOEIRO: ADJUDICADO a {nome} por R$ {lider_valor:.2f}")
    disparar_transicao(state["petri_net"], "T_ADJUDICAR", sessao_id)

    # Gera ata
    sessao_completa = {
        "edital_id": "demo",
        "modalidade": state["config"]["modalidade"],
        "agentes": [{"nome": a.nome, "cnpj": a.cnpj, "personalidade": a.personalidade}
                    for a in state["agentes_ia"]],
        "lances": state["historico_lances"],
        "total_rodadas": state["rodada"],
        "vencedor": {"nome": nome, "cnpj": cnpj, "valor_adjudicado": lider_valor, "habilitado": True},
    }
    if state.get("operador"):
        sessao_completa["agentes"].insert(0, {"nome": state["operador"]["nome"],
                                                "cnpj": state["operador"]["cnpj"],
                                                "personalidade": "operador"})

    # Aplicar instrucoes do operador no prompt da ata
    instrucoes = state.get("instrucoes_pregoeiro", [])
    if instrucoes:
        sessao_completa["instrucoes_extras"] = instrucoes

    ata = gerar_ata_pregao(sessao_completa, use_llm=state["config"].get("use_llm", True))
    state["log"].append(f"ATA gerada ({len(ata)} chars)")
    disparar_transicao(state["petri_net"], "T_GERAR_ATA", sessao_id)

    state["etapa"] = "encerrado"
    state["ata"] = ata
    state["resultado"] = {
        "vencedor_id": lider_id,
        "vencedor_nome": nome,
        "vencedor_cnpj": cnpj,
        "valor_adjudicado": lider_valor,
        "valor_referencia": state["config"]["valor_referencia"],
        "economia_pct": (1 - lider_valor / state["config"]["valor_referencia"]) * 100,
        "total_rodadas": state["rodada"],
        "total_lances": len(state["historico_lances"]),
        "operador_venceu": (lider_id == state["operador"]["id"]) if state.get("operador") else False,
        "ata": ata,
    }

    e = create_engine(EDITAIS_URL)
    with e.connect() as c:
        c.execute(text("""UPDATE simulador_sessoes
            SET estado='encerrado', resultado_json=:r, encerrado_em=NOW() WHERE id=:i"""),
            {"r": json.dumps(state["resultado"], ensure_ascii=False, default=str),
             "i": sessao_id})
        c.commit()

    return {"ok": True, "etapa": "encerrado", "resultado": state["resultado"]}


def instruir_pregoeiro(sessao_id: str, mensagem: str) -> Dict:
    """Operador envia instrucao em linguagem natural pro pregoeiro.

    Por ora, registra no log + influencia ata final. Pode evoluir pra
    interpretar comandos via DeepSeek (encerrar agora, pedir desconto X%, etc).
    """
    state = _SESSOES_INTERATIVAS.get(sessao_id)
    if not state:
        return {"erro": "sessao nao encontrada"}

    state["instrucoes_pregoeiro"].append({"de": "operador", "msg": mensagem,
                                            "rodada": state["rodada"]})
    state["log"].append(f"OPERADOR -> PREGOEIRO: {mensagem[:80]}")

    # Resposta simples (pode evoluir pra DeepSeek interpretar e agir)
    resposta = "Anotado, comandante. Vou considerar isso na proxima decisao."
    if "encerr" in mensagem.lower() or "fim" in mensagem.lower():
        resposta = "Entendido. Vou encerrar a rodada atual."
    elif "desconto" in mensagem.lower() or "negocia" in mensagem.lower():
        resposta = "Vou pedir desconto na fase de negociacao."
    elif "incabilit" in mensagem.lower() or "rejeit" in mensagem.lower():
        resposta = "Atencao redobrada na habilitacao."

    state["instrucoes_pregoeiro"].append({"de": "pregoeiro", "msg": resposta,
                                            "rodada": state["rodada"]})
    state["log"].append(f"PREGOEIRO -> OPERADOR: {resposta[:80]}")

    return {"ok": True, "resposta_pregoeiro": resposta,
            "total_instrucoes": len(state["instrucoes_pregoeiro"])}


def _carregar_do_banco(sessao_id: str) -> Dict:
    """Fallback: carrega snapshot basico do banco se sessao nao esta em memoria."""
    e = create_engine(EDITAIS_URL)
    with e.connect() as c:
        r = c.execute(text("SELECT estado, modalidade, config_json, resultado_json FROM simulador_sessoes WHERE id=:i"),
                      {"i": sessao_id}).fetchone()
        if not r:
            return {"erro": "sessao nao encontrada"}
        return {"sessao_id": sessao_id, "etapa": r[0],
                "modalidade": r[1],
                "config": json.loads(r[2]) if r[2] else {},
                "resultado": json.loads(r[3]) if r[3] else None,
                "fora_de_memoria": True}
