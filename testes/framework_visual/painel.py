"""
Painel de controle Flask para a trilha visual acompanhada.

Sobe em http://localhost:9876.

Endpoints:
  GET  /             — UI HTML do painel
  GET  /estado       — JSON do estado atual (passo, screenshots, progresso)
  POST /continuar    — desbloqueia o próximo passo
  POST /parar        — encerra graciosamente
  POST /reiniciar    — volta ao primeiro passo
  POST /comentario   — adiciona comentário ao passo atual
  POST /correcao     — marca passo como "precisa correção"
  GET  /screenshot/<nome> — serve screenshots do diretório de evidências
  GET  /relatorio    — relatório parcial até o momento

O `executor.py` mantém uma instância de `EstadoSessao` e chama o painel
em background. A comunicação humano→executor é via `threading.Event`.
"""

from __future__ import annotations

import threading
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

from flask import Flask, jsonify, request, send_file, abort, render_template_string

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
ASSETS_DIR = Path(__file__).resolve().parent / "painel_assets"


@dataclass
class ResultadoPasso:
    passo_id: str
    titulo: str
    descricao_painel: str = ""
    pontos_observacao: list[str] = field(default_factory=list)
    screenshot_antes: str | None = None
    screenshot_depois: str | None = None
    comentarios_po: list[str] = field(default_factory=list)
    correcao_necessaria: bool = False
    correcao_descricao: str | None = None
    veredito_automatico: str = "PENDENTE"  # APROVADO, REPROVADO, INCONCLUSIVO, PENDENTE
    detalhes_validacao: dict[str, Any] = field(default_factory=dict)
    iniciado_em: str = ""
    duracao_ms: int = 0


@dataclass
class EstadoSessao:
    """Estado compartilhado entre executor (Playwright) e painel (Flask)."""
    uc_id: str = ""
    variacao: str = ""
    ciclo_id: str = ""
    base_url: str = ""
    ambiente: str = ""
    total_passos: int = 0
    passo_atual_idx: int = 0
    estado: str = "aguardando_inicio"  # aguardando_inicio | executando | pausado | terminado | parado
    resultados: list[ResultadoPasso] = field(default_factory=list)
    iniciado_em: str = ""
    evidencias_dir: Path | None = None

    # Eventos pra comunicação humano → executor
    evento_continuar: threading.Event = field(default_factory=threading.Event)
    evento_parar: threading.Event = field(default_factory=threading.Event)
    evento_reiniciar: threading.Event = field(default_factory=threading.Event)

    @property
    def passo_atual(self) -> ResultadoPasso | None:
        if 0 <= self.passo_atual_idx < len(self.resultados):
            return self.resultados[self.passo_atual_idx]
        return None

    def to_dict(self) -> dict[str, Any]:
        passo = self.passo_atual
        return {
            "uc_id": self.uc_id,
            "variacao": self.variacao,
            "ciclo_id": self.ciclo_id,
            "base_url": self.base_url,
            "ambiente": self.ambiente,
            "total_passos": self.total_passos,
            "passo_atual_idx": self.passo_atual_idx,
            "estado": self.estado,
            "passo_atual": _passo_to_dict(passo) if passo else None,
            "resultados": [_passo_to_dict(p) for p in self.resultados],
            "iniciado_em": self.iniciado_em,
            "progresso_pct": int(100 * (self.passo_atual_idx + 1) / max(self.total_passos, 1))
                if self.estado != "aguardando_inicio" else 0,
        }


def _passo_to_dict(p: ResultadoPasso) -> dict[str, Any]:
    return {
        "passo_id": p.passo_id,
        "titulo": p.titulo,
        "descricao_painel": p.descricao_painel,
        "pontos_observacao": p.pontos_observacao,
        "screenshot_antes": _screenshot_url(p.screenshot_antes),
        "screenshot_depois": _screenshot_url(p.screenshot_depois),
        "comentarios_po": p.comentarios_po,
        "correcao_necessaria": p.correcao_necessaria,
        "correcao_descricao": p.correcao_descricao,
        "veredito_automatico": p.veredito_automatico,
        "detalhes_validacao": p.detalhes_validacao,
        "iniciado_em": p.iniciado_em,
        "duracao_ms": p.duracao_ms,
    }


def _screenshot_url(path: str | None) -> str | None:
    if not path:
        return None
    p = Path(path)
    return f"/screenshot/{p.name}"


def criar_app(estado: EstadoSessao) -> Flask:
    app = Flask(__name__, static_folder=None)

    @app.route("/")
    def index():
        html = (ASSETS_DIR / "index.html").read_text(encoding="utf-8")
        return render_template_string(html)

    @app.route("/controle.js")
    def controle_js():
        return send_file(ASSETS_DIR / "controle.js", mimetype="application/javascript")

    @app.route("/estado")
    def get_estado():
        return jsonify(estado.to_dict())

    @app.route("/continuar", methods=["POST"])
    def continuar():
        if estado.estado == "pausado":
            estado.evento_continuar.set()
            return jsonify({"ok": True, "msg": "destrancado"})
        return jsonify({"ok": False, "msg": f"estado nao eh pausado: {estado.estado}"}), 409

    @app.route("/parar", methods=["POST"])
    def parar():
        estado.evento_parar.set()
        estado.evento_continuar.set()  # desbloqueia se estava pausado
        return jsonify({"ok": True, "msg": "parando"})

    @app.route("/reiniciar", methods=["POST"])
    def reiniciar():
        estado.evento_reiniciar.set()
        estado.evento_continuar.set()
        return jsonify({"ok": True, "msg": "reiniciando"})

    @app.route("/comentario", methods=["POST"])
    def comentario():
        data = request.get_json(silent=True) or {}
        texto = (data.get("texto") or "").strip()
        if not texto:
            return jsonify({"ok": False, "msg": "texto vazio"}), 400
        passo = estado.passo_atual
        if not passo:
            return jsonify({"ok": False, "msg": "sem passo atual"}), 409
        passo.comentarios_po.append(texto)
        return jsonify({"ok": True, "comentarios": passo.comentarios_po})

    @app.route("/correcao", methods=["POST"])
    def correcao():
        data = request.get_json(silent=True) or {}
        descricao = (data.get("descricao") or "").strip()
        passo = estado.passo_atual
        if not passo:
            return jsonify({"ok": False, "msg": "sem passo atual"}), 409
        passo.correcao_necessaria = True
        passo.correcao_descricao = descricao or "marcado como necessitando correcao"
        return jsonify({"ok": True})

    @app.route("/screenshot/<nome>")
    def screenshot(nome: str):
        if not estado.evidencias_dir:
            abort(404)
        # Prevenir path traversal
        if "/" in nome or ".." in nome:
            abort(400)
        full = estado.evidencias_dir / nome
        if not full.exists():
            abort(404)
        return send_file(full, mimetype="image/png")

    @app.route("/relatorio")
    def relatorio_parcial():
        from relatorio import gerar_relatorio_md  # type: ignore
        try:
            md = gerar_relatorio_md(estado)
            return md, 200, {"Content-Type": "text/markdown; charset=utf-8"}
        except Exception as e:
            return f"erro: {e}", 500

    return app


def iniciar_painel_em_thread(estado: EstadoSessao, host: str = "localhost", porta: int = 9876) -> threading.Thread:
    """
    Sobe o Flask em thread daemon. Retorna a thread (pra join opcional).

    Use:
        estado = EstadoSessao(...)
        thread = iniciar_painel_em_thread(estado)
        # ... seu loop de execução ...
    """
    app = criar_app(estado)

    def _run():
        app.run(host=host, port=porta, debug=False, use_reloader=False)

    t = threading.Thread(target=_run, daemon=True)
    t.start()
    return t


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Painel de controle visual")
    parser.add_argument("--port", type=int, default=9876)
    args = parser.parse_args()

    # Demo standalone
    estado = EstadoSessao(
        uc_id="UC-DEMO",
        variacao="fp",
        ciclo_id="demo",
        base_url="http://localhost:5180",
        ambiente="agenteditais",
        total_passos=3,
        estado="aguardando_inicio",
    )
    estado.resultados = [
        ResultadoPasso(passo_id=f"passo_{i:02d}", titulo=f"Passo {i} demo", descricao_painel=f"Demo {i}")
        for i in range(1, 4)
    ]

    app = criar_app(estado)
    print(f"Painel demo em http://localhost:{args.port}")
    app.run(host="localhost", port=args.port, debug=False)
