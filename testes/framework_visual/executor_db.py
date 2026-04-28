#!/usr/bin/env python3
"""
Executor DB-aware da trilha visual.

Modo banco: roda 1 teste inteiro (N CTs sequenciais) lendo de
testesvalidacoes.testes / execucoes_caso_de_teste / casos_de_teste / casos_de_uso.

Persiste a cada passo em testesvalidacoes.passos_execucao:
- screenshots before/after
- veredito automatico (DOM/Rede)
- duracao
- detalhes JSON
- aguarda veredicto_po + pediu_continuar do tester via polling no banco

Comunica com o webapp via:
- arquivo IPC `/tmp/painel_<teste_id>.json` (write-then-rename atomico)
- polling do banco a cada 250ms

Trata SIGTERM: marca teste como pausado e sai limpo.

Uso:
    python3 testes/framework_visual/executor_db.py --teste_id <UUID>
"""
from __future__ import annotations

import argparse
import configparser
import json
import os
import signal
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

from playwright.sync_api import Browser, Page, sync_playwright

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from parser import Acao, PassoVisual, Tutorial, carregar_tutorial, resolve_valor_acao  # type: ignore
from db.engine import get_db  # type: ignore
from db.models import (  # type: ignore
    Teste, ExecucaoCasoDeTeste, CasoDeTeste, CasoDeUso, PassoExecucao,
    Observacao, User, Relatorio,
)
from executor import _login, _executar_acao, _validar_dom  # type: ignore

# Carrega .env
def _load_env():
    if os.getenv("_TESTES_ENV_LOADED"):
        return
    env_file = PROJECT_ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip())
    os.environ["_TESTES_ENV_LOADED"] = "1"

_load_env()

# Defaults do INI
_INI_PATH = PROJECT_ROOT / "validaeditais.ini"
_cfg = configparser.ConfigParser()
if _INI_PATH.exists():
    _cfg.read(_INI_PATH, encoding="utf-8")

SLOW_MO_DEFAULT = _cfg.getint("visual", "slow_mo_ms", fallback=80)
DELAY_POR_TECLA_DEFAULT = _cfg.getint("visual", "delay_por_tecla_ms", fallback=50)
PAUSA_ENTRE_ACOES_DEFAULT = _cfg.getint("visual", "pausa_entre_acoes_ms", fallback=300)


# ============================================================
# Estado global pra IPC + signal handling
# ============================================================

_TESTE_ID_GLOBAL: Optional[str] = None
_DEVE_PARAR = False


def _ipc_path(teste_id: str) -> Path:
    return Path(f"/tmp/painel_{teste_id}.json")


def _escrever_ipc(teste_id: str, dados: dict) -> None:
    """Write-then-rename atomico do estado pra leitura do webapp."""
    p = _ipc_path(teste_id)
    tmp = p.with_suffix(".tmp")
    try:
        tmp.write_text(json.dumps(dados, default=str, ensure_ascii=False), encoding="utf-8")
        os.replace(tmp, p)
    except Exception as e:
        print(f"[ipc] erro ao escrever IPC: {e}")


def _signal_handler(signum, frame):
    global _DEVE_PARAR
    print(f"[executor_db] sinal {signum} recebido, marcando para parar...")
    _DEVE_PARAR = True


# ============================================================
# Helpers de banco
# ============================================================

def _carregar_teste_e_execucoes(db, teste_id: str):
    teste = db.query(Teste).filter_by(id=teste_id).first()
    if not teste:
        raise RuntimeError(f"Teste {teste_id} nao encontrado")
    # Execucoes pendente ordem
    execs = (
        db.query(ExecucaoCasoDeTeste)
        .filter_by(teste_id=teste_id, estado="pendente")
        .order_by(ExecucaoCasoDeTeste.ordem)
        .all()
    )
    return teste, execs


def _criar_evid_dir(teste_id: str, ct_id: str) -> Path:
    ts_safe = datetime.now().isoformat(timespec="seconds").replace(":", "-").replace(".", "-")
    evid = PROJECT_ROOT / "testes" / "relatorios" / "visual" / f"teste_{teste_id[:8]}" / f"{ct_id}_{ts_safe}"
    evid.mkdir(parents=True, exist_ok=True)
    return evid


# ============================================================
# Loop de execucao de 1 CT (1 ExecucaoCasoDeTeste)
# ============================================================

def _executar_uma_execucao(
    db, page: Page, teste: Teste, exec_obj: ExecucaoCasoDeTeste,
    args, evid_dir: Path,
) -> str:
    """Roda um CT inteiro. Retorna estado final ('aprovado'|'reprovado'|'pulado'|'erro')."""
    ct = exec_obj.caso_de_teste
    if not ct:
        print(f"[exec] CT nao encontrado para execucao {exec_obj.id}")
        exec_obj.estado = "erro"
        db.commit()
        return "erro"

    # Marca em_execucao
    exec_obj.estado = "em_execucao"
    exec_obj.iniciado_em = datetime.now()
    db.commit()

    # Carrega tutorial visual — depende de variacao_tutorial
    if not ct.variacao_tutorial:
        # Sem tutorial visual — pula
        exec_obj.estado = "pulado"
        exec_obj.concluido_em = datetime.now()
        # Cria 1 passo virtual com a observacao automatica
        p = PassoExecucao(
            execucao_id=exec_obj.id,
            ordem=1,
            passo_id="sem_tutorial",
            passo_titulo="CT sem tutorial visual",
            descricao_painel="Esta CT nao tem tutorial visual disponivel.",
            veredito_automatico="INCONCLUSIVO",
            iniciado_em=datetime.now(),
            concluido_em=datetime.now(),
        )
        db.add(p)
        db.flush()
        # Observacao automatica
        admin_user = db.query(User).filter_by(administrador=1).first()
        if admin_user:
            db.add(Observacao(
                passo_execucao_id=p.id,
                user_id=admin_user.id,
                texto="[automatico] CT pulado: sem tutorial visual disponivel para esta variacao.",
            ))
        db.commit()
        print(f"[exec] {ct.ct_id}: PULADO (sem tutorial)")
        return "pulado"

    uc = ct.caso_de_uso
    try:
        tut = carregar_tutorial(uc.uc_id, ct.variacao_tutorial, teste.ciclo_id)
    except FileNotFoundError as e:
        print(f"[exec] {ct.ct_id}: tutorial nao encontrado — pulado: {e}")
        exec_obj.estado = "pulado"
        exec_obj.concluido_em = datetime.now()
        p = PassoExecucao(
            execucao_id=exec_obj.id, ordem=1, passo_id="erro_carregar",
            passo_titulo="Falha ao carregar tutorial",
            descricao_painel=str(e),
            veredito_automatico="INCONCLUSIVO",
            iniciado_em=datetime.now(), concluido_em=datetime.now(),
        )
        db.add(p)
        db.commit()
        return "pulado"

    print(f"[exec] {ct.ct_id}: {len(tut.passos)} passos do tutorial '{ct.variacao_tutorial}'")

    primeiro_screenshot = None
    ultimo_screenshot = None
    tem_reprova = False
    duracao_total = 0

    # Pre-popular passos_execucao com pendente
    for ordem, passo in enumerate(tut.passos, start=1):
        existente = db.query(PassoExecucao).filter_by(execucao_id=exec_obj.id, ordem=ordem).first()
        if existente:
            continue  # retomada — passo ja existe (vazio ou parcial)
        p_obj = PassoExecucao(
            execucao_id=exec_obj.id,
            ordem=ordem,
            passo_id=passo.id,
            passo_titulo=passo.titulo_acao,
            descricao_painel=passo.descricao_painel[:5000],
        )
        db.add(p_obj)
    db.commit()

    # Loop dos passos
    for ordem, passo in enumerate(tut.passos, start=1):
        if _DEVE_PARAR:
            print(f"[exec] interrompido por sinal externo")
            return "pausado"

        p_obj = db.query(PassoExecucao).filter_by(execucao_id=exec_obj.id, ordem=ordem).first()
        if not p_obj:
            continue

        # Se o passo ja foi aprovado/reprovado em retomada, pula
        if p_obj.veredicto_po in ("APROVADO", "REPROVADO"):
            print(f"[exec]   passo {ordem} ja decidido ({p_obj.veredicto_po}) — pula")
            if p_obj.veredicto_po == "REPROVADO":
                tem_reprova = True
            continue

        p_obj.iniciado_em = datetime.now()
        p_obj.veredito_automatico = "PENDENTE"
        db.commit()

        # Screenshot ANTES
        antes_path = evid_dir / f"before_{passo.id}.png"
        try:
            page.screenshot(path=str(antes_path), full_page=False)
            p_obj.screenshot_antes_path = str(antes_path.relative_to(PROJECT_ROOT))
            p_obj.screenshot_antes_url = f"/teste/{teste.id}/screenshot/{antes_path.name}?evid_ct={ct.ct_id}"
            if primeiro_screenshot is None:
                primeiro_screenshot = p_obj.screenshot_antes_path
        except Exception as e:
            print(f"[exec]   falha screenshot antes: {e}")

        db.commit()

        # Atualiza IPC
        _escrever_ipc(teste.id, {
            "teste_id": teste.id,
            "ct_id": ct.ct_id,
            "ct_descricao": ct.descricao,
            "passo_atual_ordem": ordem,
            "passo_atual_titulo": passo.titulo_acao,
            "passo_atual_descricao": passo.descricao_painel,
            "pontos_observacao": passo.pontos_observacao,
            "screenshot_antes_url": p_obj.screenshot_antes_url,
            "screenshot_depois_url": None,
            "veredito_automatico": "PENDENTE",
            "estado": "executando",
            "atualizado_em": datetime.now().isoformat(timespec="seconds"),
        })

        # Executa acao
        t0 = time.time()
        erro_acao = None
        try:
            valor = resolve_valor_acao(passo.acao, tut.dataset, tut.contexto, "visual")
            _executar_acao(page, passo.acao, valor, tut.dataset, tut.contexto, "visual",
                           args.pausa, args.delay_tecla)
        except Exception as e:
            erro_acao = str(e)
            print(f"[exec]   erro acao passo {ordem}: {e}")

        duracao_passo = int((time.time() - t0) * 1000)
        duracao_total += duracao_passo

        # Screenshot DEPOIS
        depois_path = evid_dir / f"after_{passo.id}.png"
        try:
            page.screenshot(path=str(depois_path), full_page=False)
            p_obj.screenshot_depois_path = str(depois_path.relative_to(PROJECT_ROOT))
            p_obj.screenshot_depois_url = f"/teste/{teste.id}/screenshot/{depois_path.name}?evid_ct={ct.ct_id}"
            ultimo_screenshot = p_obj.screenshot_depois_path
        except Exception as e:
            print(f"[exec]   falha screenshot depois: {e}")

        p_obj.duracao_ms = duracao_passo

        # Validacao automatica DOM
        try:
            url_atual = page.url
        except Exception:
            url_atual = ""

        if erro_acao:
            p_obj.veredito_automatico = "REPROVADO"
            p_obj.detalhes_validacao_json = {
                "acao_erro": erro_acao,
                "url_atual": url_atual,
                "camada_decisiva": "Acao",
            }
        else:
            asserts_dom = []
            cdt_passos = tut.caso_de_teste.get("passos") if isinstance(tut.caso_de_teste, dict) else None
            if isinstance(cdt_passos, list):
                step_id = passo.validacao_ref.split("#")[-1] if (passo.validacao_ref and "#" in passo.validacao_ref) else passo.id
                for cp in cdt_passos:
                    if cp.get("id") == step_id:
                        asserts_dom = cp.get("asserts_dom", []) or []
                        break
            if asserts_dom:
                ok, msg, detalhe = _validar_dom(page, asserts_dom)
                p_obj.veredito_automatico = "APROVADO" if ok else "REPROVADO"
                p_obj.detalhes_validacao_json = {
                    "dom": {"ok": ok, "mensagem": msg, "asserts": detalhe},
                    "url_atual": url_atual,
                    "camada_decisiva": "DOM",
                }
            else:
                p_obj.veredito_automatico = "INCONCLUSIVO"
                p_obj.detalhes_validacao_json = {
                    "url_atual": url_atual,
                    "camada_decisiva": "—",
                    "motivo": "sem asserts DOM",
                }

        db.commit()

        # Atualiza IPC pos-execucao
        _escrever_ipc(teste.id, {
            "teste_id": teste.id,
            "ct_id": ct.ct_id,
            "ct_descricao": ct.descricao,
            "passo_atual_ordem": ordem,
            "passo_atual_titulo": passo.titulo_acao,
            "passo_atual_descricao": passo.descricao_painel,
            "pontos_observacao": passo.pontos_observacao,
            "screenshot_antes_url": p_obj.screenshot_antes_url,
            "screenshot_depois_url": p_obj.screenshot_depois_url,
            "veredito_automatico": p_obj.veredito_automatico,
            "detalhes_validacao_json": p_obj.detalhes_validacao_json,
            "estado": "aguardando_decisao",
            "atualizado_em": datetime.now().isoformat(timespec="seconds"),
        })

        # PAUSA — polling no banco esperando veredicto_po + pediu_continuar
        print(f"[exec]   passo {ordem}: {p_obj.veredito_automatico} — aguardando decisao do PO...")
        while not _DEVE_PARAR:
            db.refresh(p_obj)
            if p_obj.pediu_continuar and p_obj.veredicto_po:
                # Persiste decisao
                p_obj.concluido_em = datetime.now()
                if p_obj.veredicto_po == "REPROVADO":
                    tem_reprova = True
                # Reseta flag pra evitar avanco infinito
                p_obj.pediu_continuar = 0
                db.commit()
                break
            time.sleep(0.25)

        if _DEVE_PARAR:
            return "pausado"

    # Consolida CT
    exec_obj.veredito_automatico = "REPROVADO" if tem_reprova else "APROVADO"
    exec_obj.veredicto_po = "REPROVADO" if tem_reprova else "APROVADO"
    exec_obj.estado = "reprovado" if tem_reprova else "aprovado"
    exec_obj.concluido_em = datetime.now()
    exec_obj.duracao_ms = duracao_total
    if primeiro_screenshot:
        exec_obj.screenshot_antes_path = primeiro_screenshot
    if ultimo_screenshot:
        exec_obj.screenshot_depois_path = ultimo_screenshot
    db.commit()
    print(f"[exec] {ct.ct_id}: {exec_obj.estado} ({duracao_total}ms)")
    return exec_obj.estado


# ============================================================
# Main
# ============================================================

def main():
    parser_arg = argparse.ArgumentParser(description="Executor DB-aware da trilha visual")
    parser_arg.add_argument("--teste_id", required=True, help="UUID do teste em testesvalidacoes.testes")
    parser_arg.add_argument("--slow-mo", type=int, default=SLOW_MO_DEFAULT)
    parser_arg.add_argument("--delay-tecla", type=int, default=DELAY_POR_TECLA_DEFAULT)
    parser_arg.add_argument("--pausa", type=int, default=PAUSA_ENTRE_ACOES_DEFAULT)
    args = parser_arg.parse_args()

    global _TESTE_ID_GLOBAL
    _TESTE_ID_GLOBAL = args.teste_id

    # Signal handlers
    signal.signal(signal.SIGTERM, _signal_handler)
    signal.signal(signal.SIGINT, _signal_handler)

    db = get_db()
    try:
        teste, execs = _carregar_teste_e_execucoes(db, args.teste_id)
        print(f"[executor_db] teste={teste.titulo}; execucoes pendentes: {len(execs)}")

        if not execs:
            print(f"[executor_db] nenhuma execucao pendente — nada a fazer")
            return 0

        # Marca teste como em_andamento
        teste.estado = "em_andamento"
        teste.iniciado_em = teste.iniciado_em or datetime.now()
        teste.pid_executor = os.getpid()
        db.commit()

        # IPC inicial
        _escrever_ipc(teste.id, {
            "teste_id": teste.id,
            "estado": "iniciando",
            "atualizado_em": datetime.now().isoformat(timespec="seconds"),
        })

        # Boot Playwright
        with sync_playwright() as p:
            browser: Browser = p.chromium.launch(headless=False, slow_mo=args.slow_mo)
            base_url = "http://localhost:5180"  # padrao agenteditais
            context = browser.new_context(base_url=base_url, viewport={"width": 1400, "height": 900})
            page = context.new_page()

            # Auto-aceita dialogs
            def _on_dialog(d):
                print(f"[exec] DIALOG ({d.type}): {d.message!r} -> aceitando")
                try: d.accept()
                except: pass
            page.on("dialog", _on_dialog)

            # Loop sobre execucoes pendentes
            for exec_obj in execs:
                if _DEVE_PARAR:
                    break
                evid_dir = _criar_evid_dir(teste.id, exec_obj.caso_de_teste.ct_id if exec_obj.caso_de_teste else "ct_unk")
                _executar_uma_execucao(db, page, teste, exec_obj, args, evid_dir)

            # Manter browser 3s pra ver
            try:
                page.wait_for_timeout(3000)
            except:
                pass
            browser.close()

        # Estado final do teste
        if _DEVE_PARAR:
            teste.estado = "pausado"
        else:
            # Tem alguma pendente?
            ainda_pendente = db.query(ExecucaoCasoDeTeste).filter_by(teste_id=teste.id, estado="pendente").count()
            if ainda_pendente > 0:
                teste.estado = "pausado"
            else:
                teste.estado = "concluido"
                teste.concluido_em = datetime.now()
                # Gera relatorio basico
                from relatorio import gerar_relatorio_md  # type: ignore
                # Usar nosso gerador DB se existir; senao, descricao simples
                rel_path = PROJECT_ROOT / "testes" / "relatorios" / "visual" / f"teste_{teste.id[:8]}.md"
                rel_path.parent.mkdir(parents=True, exist_ok=True)
                conteudo = _gerar_relatorio_simples(db, teste)
                rel_path.write_text(conteudo, encoding="utf-8")
                rel = Relatorio(
                    teste_id=teste.id,
                    formato="md",
                    conteudo_md=conteudo,
                    path_arquivo=str(rel_path.relative_to(PROJECT_ROOT)),
                )
                db.add(rel)

        teste.pid_executor = None
        db.commit()

        # IPC final
        _escrever_ipc(teste.id, {
            "teste_id": teste.id,
            "estado": teste.estado,
            "atualizado_em": datetime.now().isoformat(timespec="seconds"),
        })

        print(f"[executor_db] FIM — teste {teste.id} estado={teste.estado}")
        return 0
    finally:
        db.close()


def _gerar_relatorio_simples(db, teste) -> str:
    """Relatorio markdown basico ao concluir teste."""
    lines = [
        f"# Relatorio — {teste.titulo}",
        "",
        f"- **Teste ID:** {teste.id}",
        f"- **Projeto:** {teste.projeto.nome if teste.projeto else '-'}",
        f"- **Sprint:** {teste.sprint.nome if teste.sprint else '-'}",
        f"- **Tester:** {teste.user.email if teste.user else '-'}",
        f"- **Iniciado em:** {teste.iniciado_em}",
        f"- **Concluido em:** {teste.concluido_em}",
        f"- **Estado:** {teste.estado}",
        "",
        "## Casos de Teste",
        "",
    ]
    for e in sorted(teste.execucoes, key=lambda x: x.ordem):
        ct = e.caso_de_teste
        lines.append(f"### {e.ordem}. {ct.ct_id if ct else '?'} — {e.estado}")
        lines.append(f"  - Veredito automatico: {e.veredito_automatico}")
        lines.append(f"  - Veredicto PO: {e.veredicto_po or '-'}")
        lines.append(f"  - Duracao: {(e.duracao_ms or 0) / 1000:.1f}s")
        for p in sorted(e.passos, key=lambda x: x.ordem):
            lines.append(f"    - Passo {p.ordem} `{p.passo_id}`: auto={p.veredito_automatico}, po={p.veredicto_po or '-'}")
            for o in p.observacoes:
                lines.append(f"      - obs: {o.texto}")
        lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    sys.exit(main())
