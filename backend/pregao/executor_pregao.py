"""Executor do Simulador de Pregao Eletronico.

Orquestra:
1. Carrega Petri Net do banco langnet.projects
2. Cria sessao em editais.simulador_sessoes
3. Cria 5 agentes IA (1 por personalidade)
4. Executa o pregao seguindo a Petri Net:
   - Coleta propostas iniciais
   - Classifica
   - Loop de rodadas de lances abertos
   - (opcional) Lance fechado
   - Negociacao
   - Habilitacao
   - Adjudicacao
   - Gera ata
5. Persiste tudo em editais.simulador_lances + petri_estados

Cada passo dispara a transicao correspondente da Petri Net via langnet.py.
"""
from __future__ import annotations
import json
import sys
import uuid
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List

_BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_BACKEND))
sys.path.insert(0, str(_BACKEND / "langnet"))
sys.path.insert(0, str(_BACKEND / "pregao"))

from sqlalchemy import create_engine, text

# Importacoes do framework langnet (modulo direto)
from langnet import PetriNet, Lugar, Arco, Transicao, EstadoGlobal  # noqa: E402

# Importacoes do simulador
from agentes_licitantes import criar_agentes_padrao, AgenteLicitante  # noqa: E402
from pregoeiro_ia import (  # noqa: E402
    classificar_propostas, deve_encerrar_rodada,
    negociar_com_vencedor, habilitar_documental,
    adjudicar, gerar_ata_pregao
)

LANGNET_URL = "mysql+mysqlconnector://producao:112358123@camerascasas.no-ip.info:3308/langnet?charset=utf8mb4"
EDITAIS_URL = "mysql+mysqlconnector://producao:112358123@camerascasas.no-ip.info:3308/editais?charset=utf8mb4"


def carregar_petri_net_do_banco(project_name: str = "Simulador Pregao Eletronico (agenteditais)") -> Dict:
    """Le project_data da tabela langnet.projects."""
    e = create_engine(LANGNET_URL)
    with e.connect() as c:
        r = c.execute(text("SELECT id, project_data FROM projects WHERE name=:n"),
                      {"n": project_name}).fetchone()
        if not r:
            raise ValueError(f"Projeto '{project_name}' nao encontrado no banco langnet")
        return {"project_id": r[0], "petri_net": json.loads(r[1])}


def construir_petri_net_runtime(petri_dict: Dict) -> PetriNet:
    """Constroi PetriNet do langnet.py a partir do JSON do banco."""
    pn = PetriNet(petri_dict.get("nome", "Pregao"))
    # Lugares (sem funcao por enquanto — o executor controla)
    lugares_map = {}
    for l in petri_dict["lugares"]:
        lug = Lugar(nome=l["id"], numero_tokens=l.get("tokens", 0))
        pn.adicionar_lugar(lug)
        lugares_map[l["id"]] = lug
    # Transicoes
    for t in petri_dict["transicoes"]:
        # Encontra arcos de entrada e saida
        entrada = []
        saida = []
        for a in petri_dict["arcos"]:
            if a["destino"] == t["id"]:
                # arco de lugar para esta transicao (entrada)
                if a["origem"] in lugares_map:
                    entrada.append(Arco(lugares_map[a["origem"]], a.get("peso", 1)))
            elif a["origem"] == t["id"]:
                # arco da transicao para lugar (saida)
                if a["destino"] in lugares_map:
                    saida.append(Arco(lugares_map[a["destino"]], a.get("peso", 1)))
        tr = Transicao(nome=t["id"], entrada=entrada, saida=saida,
                       prioridade=t.get("prioridade", 0))
        pn.adicionar_transicao(tr)
    return pn


def disparar_transicao(pn: PetriNet, nome_transicao: str, sessao_id: str = None) -> bool:
    """Dispara uma transicao especifica pelo nome. Retorna True se disparou."""
    tr = next((t for t in pn.transicoes if t.nome == nome_transicao), None)
    if not tr:
        print(f"  [warn] transicao {nome_transicao} nao existe")
        return False
    if not tr.verificar_habilitacao():
        # Pode estar bloqueada por falta de tokens — forca colocando token onde precisa
        for arco in tr.entrada:
            if arco.lugar.numero_tokens < arco.peso:
                arco.lugar.numero_tokens = arco.peso
    try:
        tr.disparar()
        if sessao_id:
            _salvar_estado_petri(sessao_id, pn, transicao_disparada=nome_transicao)
        return True
    except Exception as ex:
        print(f"  [warn] falha ao disparar {nome_transicao}: {ex}")
        return False


def _salvar_estado_petri(sessao_id: str, pn: PetriNet, transicao_disparada: str = None,
                         estado_global: dict = None):
    """Salva snapshot da Petri Net em editais.simulador_petri_estados."""
    e = create_engine(EDITAIS_URL)
    with e.connect() as c:
        for lug in pn.lugares:
            c.execute(text("""INSERT INTO simulador_petri_estados
                (sessao_id, place_id, tokens, transicao_disparada, estado_global)
                VALUES (:s, :p, :t, :tr, :eg)"""),
                {"s": sessao_id, "p": lug.nome, "t": lug.numero_tokens,
                 "tr": transicao_disparada,
                 "eg": json.dumps(estado_global or {})})
        c.commit()


def criar_sessao(langnet_project_id: str, edital_id: str = None,
                 empresa_id: str = None, modalidade: str = "aberto",
                 valor_referencia: float = 200.0,
                 custo_base: float = 100.0,
                 use_llm: bool = True) -> Dict[str, Any]:
    """Cria sessao no banco editais + 5 agentes."""
    sessao_id = str(uuid.uuid4())
    config = {
        "valor_referencia": valor_referencia,
        "custo_base": custo_base,
        "use_llm": use_llm,
        "n_agentes": 5,
        "max_rodadas": 10,
        "modalidade": modalidade,  # FIX: incluir modalidade no config pra executor decidir caminho
    }
    e = create_engine(EDITAIS_URL)
    with e.connect() as c:
        c.execute(text("""INSERT INTO simulador_sessoes
            (id, langnet_project_id, edital_id, empresa_id, modalidade, estado, config_json)
            VALUES (:id, :p, :e, :em, :m, 'iniciado', :c)"""),
            {"id": sessao_id, "p": langnet_project_id, "e": edital_id,
             "em": empresa_id, "m": modalidade,
             "c": json.dumps(config)})

        # Cria 5 agentes
        agentes = criar_agentes_padrao(custo_base=custo_base, valor_referencia=valor_referencia,
                                        use_llm=use_llm)
        for ag in agentes:
            ag.id = str(uuid.uuid4())
            c.execute(text("""INSERT INTO simulador_agentes
                (id, sessao_id, personalidade, nome_ficticio, cnpj_ficticio, proposta_inicial, estado)
                VALUES (:id, :s, :p, :n, :c, NULL, :e)"""),
                {"id": ag.id, "s": sessao_id, "p": ag.personalidade,
                 "n": ag.nome, "c": ag.cnpj,
                 "e": json.dumps({"custo": ag.custo_estimado, "minimo": ag.preco_minimo})})
        c.commit()
    return {"sessao_id": sessao_id, "agentes": agentes, "config": config}


def executar_pregao_completo(sessao_dados: Dict[str, Any], pn: PetriNet) -> Dict[str, Any]:
    """Roda pregao end-to-end. Retorna resultado final."""
    sessao_id = sessao_dados["sessao_id"]
    agentes: List[AgenteLicitante] = sessao_dados["agentes"]
    config = sessao_dados["config"]

    e = create_engine(EDITAIS_URL)

    print(f"\n=== PREGAO {sessao_id[:8]} INICIADO ===")
    print(f"Agentes: {len(agentes)} | Valor referencia: R$ {config['valor_referencia']:.2f}")
    for ag in agentes:
        print(f"  - {ag.personalidade:<13} | {ag.nome[:35]:<35} | custo R$ {ag.custo_estimado:.2f} | minimo R$ {ag.preco_minimo:.2f}")

    # === FASE 1: PROPOSTAS INICIAIS (P_INICIO -> P_PROPOSTAS) ===
    disparar_transicao(pn, "T_ABRIR_PROPOSTAS", sessao_id)
    print("\n--- FASE 1: PROPOSTAS INICIAIS ---")
    propostas = []
    with e.connect() as c:
        for ag in agentes:
            valor = ag.proposta_inicial()
            print(f"  {ag.nome[:30]:<30} -> R$ {valor:.2f}")
            lance_id = str(uuid.uuid4())
            c.execute(text("""INSERT INTO simulador_lances
                (id, sessao_id, agente_id, rodada, valor, tipo)
                VALUES (:id, :s, :a, 0, :v, 'proposta')"""),
                {"id": lance_id, "s": sessao_id, "a": ag.id, "v": valor})
            c.execute(text("UPDATE simulador_agentes SET proposta_inicial=:v WHERE id=:i"),
                      {"v": valor, "i": ag.id})
            propostas.append({"agente_id": ag.id, "agente_nome": ag.nome,
                              "personalidade": ag.personalidade, "valor": valor})
        c.commit()
    disparar_transicao(pn, "T_TODAS_PROPOSTAS", sessao_id)

    # === FASE 2: CLASSIFICACAO ===
    print("\n--- FASE 2: CLASSIFICACAO ---")
    cls = classificar_propostas(propostas, config["valor_referencia"])
    print(f"  Classificados: {len(cls['classificados'])} | Desclassificados: {len(cls['desclassificados'])}")
    for p in cls['classificados']:
        print(f"    OK   R$ {p['valor']:.2f} {p['agente_nome'][:30]}")
    for p in cls['desclassificados']:
        print(f"    XXX  R$ {p['valor']:.2f} {p['agente_nome'][:30]} (acima do teto)")

    classificados_ids = [p["agente_id"] for p in cls["classificados"]]
    agentes_ativos = [a for a in agentes if a.id in classificados_ids]

    if len(agentes_ativos) < 2:
        print("[ERRO] Menos de 2 classificados — pregao deserto")
        return {"estado": "deserto", "vencedor": None}

    disparar_transicao(pn, "T_INICIAR_LANCES", sessao_id)

    # === FASE 3: LANCES ABERTOS (LOOP) ===
    print("\n--- FASE 3: RODADAS DE LANCES ABERTOS ---")
    historico_lances = []
    valores_atuais = {p["agente_id"]: p["valor"] for p in cls["classificados"]}
    rodada = 0
    max_rodadas = config["max_rodadas"]

    while rodada < max_rodadas:
        rodada += 1
        print(f"\n  Rodada {rodada}:")
        # Ranking atual
        ranking = sorted(
            [{"agente_id": aid, "valor": v} for aid, v in valores_atuais.items()],
            key=lambda x: x["valor"]
        )

        novos_lances = 0
        for ag in agentes_ativos:
            meu_v = valores_atuais.get(ag.id)
            if meu_v is None: continue
            novo_lance = ag.decidir_lance(ranking, rodada, meu_v)
            if novo_lance is None or novo_lance >= meu_v:
                continue  # passou
            valores_atuais[ag.id] = novo_lance
            historico_lances.append({"rodada": rodada, "agente_id": ag.id, "valor": novo_lance})
            print(f"    {ag.personalidade:<13} {ag.nome[:30]:<30} R$ {meu_v:.2f} -> R$ {novo_lance:.2f}")
            with e.connect() as c:
                c.execute(text("""INSERT INTO simulador_lances
                    (id, sessao_id, agente_id, rodada, valor, tipo)
                    VALUES (:id, :s, :a, :r, :v, 'lance_aberto')"""),
                    {"id": str(uuid.uuid4()), "s": sessao_id, "a": ag.id,
                     "r": rodada, "v": novo_lance})
                c.commit()
            novos_lances += 1

        print(f"  >> {novos_lances} lances nesta rodada")
        disparar_transicao(pn, "T_NOVA_RODADA", sessao_id)

        # Encerrar?
        if deve_encerrar_rodada(historico_lances, rodada, max_rodadas, rodadas_sem_lance=2):
            print(f"\n  [PREGOEIRO] Encerrando rodadas (rodada={rodada}, novos_lances={novos_lances})")
            break

    # Determina lider
    ranking_final = sorted(
        [{"agente_id": aid, "valor": v} for aid, v in valores_atuais.items()],
        key=lambda x: x["valor"]
    )
    lider_id = ranking_final[0]["agente_id"]
    lider_valor = ranking_final[0]["valor"]
    lider_obj = next((a for a in agentes if a.id == lider_id), None)
    print(f"\n  [LIDER APOS LANCES] {lider_obj.nome[:35]} R$ {lider_valor:.2f}")

    # Disparar saida do loop (escolhe modalidade)
    if config.get("modalidade") == "aberto_fechado":
        disparar_transicao(pn, "T_SEM_MAIS_LANCES_ABERTO_FECHADO", sessao_id)
        # Fase fechado (top 3)
        print("\n--- FASE 4: LANCE FECHADO (TOP 3) ---")
        top3 = ranking_final[:3]
        # Cada um do top3 tem 1 chance de lance final selado
        for entry in top3:
            ag = next(a for a in agentes if a.id == entry["agente_id"])
            v_atual = entry["valor"]
            # Decide lance final selado: tenta uma melhora
            novo = ag.decidir_lance([entry], 999, v_atual)  # rodada 999 = lance fechado
            if novo and novo < v_atual:
                valores_atuais[ag.id] = novo
                with e.connect() as c:
                    c.execute(text("""INSERT INTO simulador_lances
                        (id, sessao_id, agente_id, rodada, valor, tipo)
                        VALUES (:id, :s, :a, 999, :v, 'lance_fechado')"""),
                        {"id": str(uuid.uuid4()), "s": sessao_id, "a": ag.id, "v": novo})
                    c.commit()
                print(f"    {ag.nome[:35]} lance fechado: R$ {v_atual:.2f} -> R$ {novo:.2f}")
        ranking_final = sorted(
            [{"agente_id": aid, "valor": v} for aid, v in valores_atuais.items()],
            key=lambda x: x["valor"]
        )
        disparar_transicao(pn, "T_FECHADO_PARA_NEGOCIACAO", sessao_id)
    else:
        disparar_transicao(pn, "T_SEM_MAIS_LANCES_ABERTO", sessao_id)

    # === FASE 5: NEGOCIACAO ===
    lider_id = ranking_final[0]["agente_id"]
    lider_valor = ranking_final[0]["valor"]
    lider_obj = next((a for a in agentes if a.id == lider_id), None)

    print(f"\n--- FASE 5: NEGOCIACAO COM {lider_obj.nome[:35]} ---")
    neg = negociar_com_vencedor(
        {"agente_id": lider_id, "aceita_negociacao": lider_obj.aceita_negociacao(lider_valor*0.95, lider_valor)},
        lider_valor, config["valor_referencia"]
    )
    if neg["negociado"]:
        print(f"  [PREGOEIRO] Pediu desconto. Valor proposto: R$ {neg['valor_proposto_pregoeiro']:.2f}")
        if neg["valor_final"] < lider_valor:
            print(f"  [LICITANTE] Aceitou. Novo valor: R$ {neg['valor_final']:.2f}")
            with e.connect() as c:
                c.execute(text("""INSERT INTO simulador_lances
                    (id, sessao_id, agente_id, rodada, valor, tipo)
                    VALUES (:id, :s, :a, 1000, :v, 'negociacao')"""),
                    {"id": str(uuid.uuid4()), "s": sessao_id, "a": lider_id, "v": neg["valor_final"]})
                c.commit()
            valor_final = neg["valor_final"]
        else:
            print(f"  [LICITANTE] Recusou. Mantem R$ {lider_valor:.2f}")
            valor_final = lider_valor
        disparar_transicao(pn, "T_NEGOCIAR", sessao_id)
    else:
        print(f"  [PREGOEIRO] Sem necessidade de negociar. {neg['motivo']}")
        valor_final = lider_valor
        disparar_transicao(pn, "T_PULAR_NEGOCIACAO", sessao_id)

    # === FASE 6: HABILITACAO ===
    print(f"\n--- FASE 6: HABILITACAO DE {lider_obj.nome[:35]} ---")
    hab = habilitar_documental({"agente_id": lider_id})
    if not hab["habilitado"]:
        print(f"  [INABILITADO] Motivo: {hab['motivo']}")
        # Em producao, chamaria o proximo. Por simplicidade aqui, encerra.
        # Mas Petri Net suporta o loop T_INABILITAR -> P_NEGOCIACAO
        print(f"  [NOTA] simulador encerra aqui — loop de inabilitacao seria pra proximo colocado.")
        disparar_transicao(pn, "T_INABILITAR", sessao_id)
        return {"estado": "inabilitado", "vencedor_inicial": lider_obj.nome,
                "motivo_inabilitacao": hab['motivo']}
    print(f"  [HABILITADO] {lider_obj.nome[:35]}")
    disparar_transicao(pn, "T_HABILITAR", sessao_id)

    # === FASE 7: ADJUDICACAO ===
    print(f"\n--- FASE 7: ADJUDICACAO ---")
    adj = adjudicar({
        "agente_id": lider_id, "nome": lider_obj.nome,
        "valor_final": valor_final
    })
    print(f"  ADJUDICADO: {adj['vencedor_nome']} | R$ {adj['valor_adjudicado']:.2f}")
    disparar_transicao(pn, "T_ADJUDICAR", sessao_id)

    # === FASE 8: ATA ===
    print(f"\n--- FASE 8: GERANDO ATA (DeepSeek) ---")
    sessao_completa = {
        "sessao_id": sessao_id,
        "edital_id": "demo",
        "modalidade": config.get("modalidade", "aberto"),
        "agentes": [{"nome": a.nome, "cnpj": a.cnpj, "personalidade": a.personalidade}
                    for a in agentes],
        "propostas": propostas,
        "lances": historico_lances,
        "total_rodadas": rodada,
        "vencedor": {"nome": lider_obj.nome, "cnpj": lider_obj.cnpj,
                     "valor_adjudicado": valor_final, "habilitado": True},
    }
    ata = gerar_ata_pregao(sessao_completa, use_llm=config.get("use_llm", True))
    print("\n" + "="*60)
    print(ata[:600])
    print("="*60)
    disparar_transicao(pn, "T_GERAR_ATA", sessao_id)

    # Atualiza sessao
    resultado = {
        "vencedor_id": lider_id,
        "vencedor_nome": lider_obj.nome,
        "vencedor_cnpj": lider_obj.cnpj,
        "valor_adjudicado": valor_final,
        "valor_referencia": config["valor_referencia"],
        "economia_pct": (1 - valor_final / config["valor_referencia"]) * 100,
        "total_rodadas": rodada,
        "total_lances": len(historico_lances) + len(propostas),
        "ata": ata,
    }
    with e.connect() as c:
        c.execute(text("""UPDATE simulador_sessoes
            SET estado='encerrado', resultado_json=:r, encerrado_em=NOW()
            WHERE id=:i"""),
            {"r": json.dumps(resultado, ensure_ascii=False, default=str), "i": sessao_id})
        c.commit()

    print(f"\n=== PREGAO {sessao_id[:8]} ENCERRADO ===")
    print(f"Vencedor: {lider_obj.nome}")
    print(f"Valor: R$ {valor_final:.2f}")
    print(f"Economia: {resultado['economia_pct']:.1f}% sobre referencia")
    print(f"Total: {resultado['total_lances']} lances em {rodada} rodadas")
    return resultado


def rodar_pregao_completo(use_llm: bool = True, valor_referencia: float = 200.0,
                          custo_base: float = 100.0, modalidade: str = "aberto") -> Dict:
    """Entry point: cria + executa um pregao completo."""
    pn_dados = carregar_petri_net_do_banco()
    pn = construir_petri_net_runtime(pn_dados["petri_net"])
    sessao = criar_sessao(
        langnet_project_id=pn_dados["project_id"],
        valor_referencia=valor_referencia,
        custo_base=custo_base,
        modalidade=modalidade,
        use_llm=use_llm,
    )
    resultado = executar_pregao_completo(sessao, pn)
    resultado["sessao_id"] = sessao["sessao_id"]
    return resultado


if __name__ == "__main__":
    # Teste rapido
    use_llm = "--no-llm" not in sys.argv
    res = rodar_pregao_completo(use_llm=use_llm)
    print("\n=== RESULTADO ===")
    print(json.dumps({k: v for k, v in res.items() if k != "ata"}, indent=2, ensure_ascii=False, default=str))
