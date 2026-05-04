"""Endpoints REST do Simulador de Pregao Eletronico.

Registrar no backend/app.py via:
    from pregao.api_simulador import register_simulador_routes
    register_simulador_routes(app)
"""
from __future__ import annotations
import json
import sys
import threading
from pathlib import Path
from flask import jsonify, request

_BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_BACKEND))
sys.path.insert(0, str(_BACKEND / "pregao"))
sys.path.insert(0, str(_BACKEND / "langnet"))

from sqlalchemy import create_engine, text

EDITAIS_URL = "mysql+mysqlconnector://producao:112358123@camerascasas.no-ip.info:3308/editais?charset=utf8mb4"

# Threads em background pra pregoes em execucao
_PREGOES_RUNNING = {}


def _executar_em_background(sessao_id: str, **kwargs):
    """Roda o pregao em thread separada."""
    try:
        from executor_pregao import (
            carregar_petri_net_do_banco, construir_petri_net_runtime,
            criar_sessao, executar_pregao_completo
        )
        # Note: criar_sessao ja cria nova sessao_id; aqui queremos USAR a sessao_id ja criada
        # Adaptacao: usar entry point novo
        # Por simplicidade, usamos rodar_pregao_completo que cria nova sessao
        from executor_pregao import rodar_pregao_completo
        res = rodar_pregao_completo(**kwargs)
        _PREGOES_RUNNING[sessao_id] = {"estado": "concluido", "resultado": res}
    except Exception as ex:
        _PREGOES_RUNNING[sessao_id] = {"estado": "erro", "erro": str(ex)}


def register_simulador_routes(app):
    """Registra rotas /api/simulador/* no Flask app."""

    @app.route("/api/simulador/iniciar", methods=["POST"])
    def simulador_iniciar():
        data = request.get_json(silent=True) or {}
        valor_referencia = float(data.get("valor_referencia", 200.0))
        custo_base = float(data.get("custo_base", 100.0))
        modalidade = data.get("modalidade", "aberto")
        use_llm = bool(data.get("use_llm", True))

        from executor_pregao import (
            carregar_petri_net_do_banco, construir_petri_net_runtime, criar_sessao
        )
        try:
            pn_dados = carregar_petri_net_do_banco()
            sessao = criar_sessao(
                langnet_project_id=pn_dados["project_id"],
                valor_referencia=valor_referencia,
                custo_base=custo_base,
                modalidade=modalidade,
                use_llm=use_llm,
            )
            sid = sessao["sessao_id"]

            # Roda pregao em thread separada
            def _run():
                try:
                    pn = construir_petri_net_runtime(pn_dados["petri_net"])
                    from executor_pregao import executar_pregao_completo
                    res = executar_pregao_completo(sessao, pn)
                    _PREGOES_RUNNING[sid] = {"estado": "concluido", "resultado": res}
                except Exception as ex:
                    import traceback
                    _PREGOES_RUNNING[sid] = {"estado": "erro", "erro": str(ex),
                                              "trace": traceback.format_exc()}

            t = threading.Thread(target=_run, daemon=True)
            t.start()
            _PREGOES_RUNNING[sid] = {"estado": "executando"}

            return jsonify({
                "ok": True,
                "sessao_id": sid,
                "config": sessao["config"],
                "agentes": [{"id": ag.id, "nome": ag.nome, "personalidade": ag.personalidade,
                             "cnpj": ag.cnpj, "custo": ag.custo_estimado, "minimo": ag.preco_minimo}
                            for ag in sessao["agentes"]]
            }), 201
        except Exception as ex:
            import traceback
            return jsonify({"ok": False, "erro": str(ex),
                            "trace": traceback.format_exc()}), 500

    @app.route("/api/simulador/<sessao_id>/estado", methods=["GET"])
    def simulador_estado(sessao_id):
        e = create_engine(EDITAIS_URL)
        with e.connect() as c:
            r = c.execute(text("SELECT estado, modalidade, criado_em, encerrado_em, resultado_json FROM simulador_sessoes WHERE id=:i"), {"i": sessao_id}).fetchone()
            if not r:
                return jsonify({"ok": False, "erro": "sessao nao encontrada"}), 404
            estado, modalidade, criado, encerrado, resultado = r
            # Lances
            lances = c.execute(text(f"SELECT rodada, valor, tipo FROM simulador_lances WHERE sessao_id=:i ORDER BY rodada, ts"), {"i": sessao_id}).fetchall()
            # Petri snapshots ultimo
            ult = c.execute(text(f"SELECT transicao_disparada, ts FROM simulador_petri_estados WHERE sessao_id=:i AND transicao_disparada IS NOT NULL ORDER BY id DESC LIMIT 1"), {"i": sessao_id}).fetchone()
            return jsonify({
                "ok": True,
                "sessao_id": sessao_id,
                "estado": estado,
                "modalidade": modalidade,
                "criado_em": str(criado),
                "encerrado_em": str(encerrado) if encerrado else None,
                "ultima_transicao": ult[0] if ult else None,
                "total_lances": len(lances),
                "execucao_thread": _PREGOES_RUNNING.get(sessao_id, {}).get("estado", "desconhecido"),
                "resultado": json.loads(resultado) if resultado else None,
            })

    @app.route("/api/simulador/<sessao_id>/lances", methods=["GET"])
    def simulador_lances(sessao_id):
        e = create_engine(EDITAIS_URL)
        with e.connect() as c:
            rows = c.execute(text(f"""SELECT l.rodada, l.valor, l.tipo, l.ts,
                a.personalidade, a.nome_ficticio
                FROM simulador_lances l
                LEFT JOIN simulador_agentes a ON a.id = l.agente_id
                WHERE l.sessao_id=:i ORDER BY l.rodada, l.ts"""),
                {"i": sessao_id}).fetchall()
            return jsonify({
                "ok": True,
                "sessao_id": sessao_id,
                "lances": [{"rodada": r[0], "valor": float(r[1]), "tipo": r[2],
                            "ts": str(r[3]), "personalidade": r[4], "nome": r[5]}
                           for r in rows]
            })

    @app.route("/api/simulador/<sessao_id>/resultado", methods=["GET"])
    def simulador_resultado(sessao_id):
        e = create_engine(EDITAIS_URL)
        with e.connect() as c:
            r = c.execute(text("SELECT resultado_json, estado FROM simulador_sessoes WHERE id=:i"),
                          {"i": sessao_id}).fetchone()
            if not r:
                return jsonify({"ok": False, "erro": "sessao nao encontrada"}), 404
            return jsonify({
                "ok": True,
                "sessao_id": sessao_id,
                "estado": r[1],
                "resultado": json.loads(r[0]) if r[0] else None,
            })

    @app.route("/api/simulador/sessoes", methods=["GET"])
    def simulador_sessoes_list():
        e = create_engine(EDITAIS_URL)
        with e.connect() as c:
            rows = c.execute(text("""SELECT id, modalidade, estado, criado_em, encerrado_em
                FROM simulador_sessoes ORDER BY criado_em DESC LIMIT 20""")).fetchall()
            return jsonify({"ok": True, "sessoes": [
                {"id": r[0], "modalidade": r[1], "estado": r[2],
                 "criado_em": str(r[3]), "encerrado_em": str(r[4]) if r[4] else None}
                for r in rows]})

    # ===== Modo INTERATIVO (operador como 6º licitante) =====

    @app.route("/api/simulador/interativo/iniciar", methods=["POST"])
    def simulador_interativo_iniciar():
        from sessao_interativa import criar_sessao_interativa
        data = request.get_json(silent=True) or {}
        try:
            res = criar_sessao_interativa(
                valor_referencia=float(data.get("valor_referencia", 200.0)),
                custo_base=float(data.get("custo_base", 100.0)),
                modalidade=data.get("modalidade", "aberto"),
                operador_participa=bool(data.get("operador_participa", True)),
                operador_custo_estimado=float(data.get("operador_custo", 100.0)),
                use_llm=bool(data.get("use_llm", True)),
            )
            return jsonify({"ok": True, **res}), 201
        except Exception as ex:
            import traceback
            return jsonify({"ok": False, "erro": str(ex), "trace": traceback.format_exc()}), 500

    @app.route("/api/simulador/interativo/<sessao_id>/estado", methods=["GET"])
    def simulador_interativo_estado(sessao_id):
        from sessao_interativa import obter_estado
        try:
            return jsonify({"ok": True, **obter_estado(sessao_id)})
        except Exception as ex:
            return jsonify({"ok": False, "erro": str(ex)}), 500

    @app.route("/api/simulador/interativo/<sessao_id>/propostas", methods=["POST"])
    def simulador_interativo_propostas(sessao_id):
        from sessao_interativa import coletar_propostas_iniciais
        data = request.get_json(silent=True) or {}
        valor_op = data.get("valor_proposta_operador")
        if valor_op is not None: valor_op = float(valor_op)
        res = coletar_propostas_iniciais(sessao_id, valor_op)
        return jsonify(res)

    @app.route("/api/simulador/interativo/<sessao_id>/avancar", methods=["POST"])
    def simulador_interativo_avancar(sessao_id):
        from sessao_interativa import avancar_rodada
        data = request.get_json(silent=True) or {}
        lance_op = data.get("lance_operador")
        if lance_op is not None: lance_op = float(lance_op)
        passar = bool(data.get("passar_operador", False))
        res = avancar_rodada(sessao_id, lance_op, passar)
        return jsonify(res)

    @app.route("/api/simulador/interativo/<sessao_id>/negociar", methods=["POST"])
    def simulador_interativo_negociar(sessao_id):
        from sessao_interativa import executar_negociacao
        return jsonify(executar_negociacao(sessao_id))

    @app.route("/api/simulador/interativo/<sessao_id>/habilitar", methods=["POST"])
    def simulador_interativo_habilitar(sessao_id):
        from sessao_interativa import executar_habilitacao
        return jsonify(executar_habilitacao(sessao_id))

    @app.route("/api/simulador/interativo/<sessao_id>/adjudicar", methods=["POST"])
    def simulador_interativo_adjudicar(sessao_id):
        from sessao_interativa import executar_adjudicacao
        return jsonify(executar_adjudicacao(sessao_id))

    @app.route("/api/simulador/interativo/<sessao_id>/chat", methods=["POST"])
    def simulador_interativo_chat(sessao_id):
        from sessao_interativa import instruir_pregoeiro
        data = request.get_json(silent=True) or {}
        msg = data.get("mensagem", "").strip()
        if not msg:
            return jsonify({"ok": False, "erro": "mensagem vazia"}), 400
        return jsonify(instruir_pregoeiro(sessao_id, msg))

    print("[simulador] 5 endpoints batch + 7 endpoints interativos registrados em /api/simulador/*")
