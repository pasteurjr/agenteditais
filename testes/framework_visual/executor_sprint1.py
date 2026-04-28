#!/usr/bin/env python3
"""
Executor Sprint 1 — versao DB-aware do executor original.

Le do banco testesvalidacoes:
  - Quais CTs do teste rodar (tabela testes + execucoes_caso_de_teste)
  - Para cada CT: passos do tutorial + asserts (tabelas passos_tutorial)
  - Dataset do UC (tabela datasets)

Para cada CT:
  - Sobe painel Flask em :9876 (mostrando "CT-X — UC-Y" no header)
  - Executa cada passo via Playwright headed (igual executor original)
  - Captura screenshots before/after
  - Valida DOM
  - Pausa esperando tester aprovar/reprovar/comentar
  - Persiste tudo em passos_execucao + observacoes

Argumentos:
    python3 executor_sprint1.py --teste_id <UUID>

OU criar teste novo na hora:
    python3 executor_sprint1.py --user_email pasteur@valida.com \\
                                --titulo "Smoke Sprint 1" \\
                                --ct_ids CT-F01-FP

Reusa codigo do executor.py original (importa _executar_acao, _validar_dom).
"""
from __future__ import annotations

import argparse
import atexit
import configparser
import os
import signal
import sys
import time
import webbrowser
from datetime import datetime
from pathlib import Path

from playwright.sync_api import Browser, Page, sync_playwright

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

from painel import EstadoSessao, ResultadoPasso, iniciar_painel_em_thread  # type: ignore
from parser import Acao  # type: ignore
from executor import _executar_acao, _validar_dom, _login  # type: ignore
from db.engine import get_db  # type: ignore
from db.models import (  # type: ignore
    User, Teste, ExecucaoCasoDeTeste, CasoDeTeste, CasoDeUso,
    Dataset, PassoTutorial, PassoExecucao, Observacao, Relatorio,
)
from dados.placeholders import (  # type: ignore
    construir_mapa_placeholders, resolver_placeholders,
    listar_placeholders_nao_resolvidos,
)

_INI_PATH = PROJECT_ROOT / "validaeditais.ini"
_cfg = configparser.ConfigParser()
if _INI_PATH.exists():
    _cfg.read(_INI_PATH, encoding="utf-8")

PORTA_PAINEL = _cfg.getint("visual", "porta_painel", fallback=9876)
SLOW_MO_DEFAULT = _cfg.getint("visual", "slow_mo_ms", fallback=80)
DELAY_POR_TECLA_DEFAULT = _cfg.getint("visual", "delay_por_tecla_ms", fallback=50)
PAUSA_ENTRE_ACOES_DEFAULT = _cfg.getint("visual", "pausa_entre_acoes_ms", fallback=300)
EMAIL_DEFAULT = _cfg.get("login", "email", fallback="valida4@valida.com.br")
SENHA_DEFAULT = _cfg.get("login", "senha", fallback="123456")


# ============================================================
# Helpers de conversao banco -> objetos do executor original
# ============================================================

def _dict_para_acao(d: dict) -> Acao:
    """Inverso de _acao_para_dict do importador."""
    sub = []
    if d.get("sequencia"):
        sub = [_dict_para_acao(s) for s in d["sequencia"]]
    return Acao(
        tipo=d.get("tipo", ""),
        seletor=d.get("seletor"),
        alternativa=d.get("alternativa"),
        valor_literal=d.get("valor_literal"),
        valor_from_dataset=d.get("valor_from_dataset"),
        valor_from_contexto=d.get("valor_from_contexto"),
        destino=d.get("destino"),
        url=d.get("url"),
        timeout=int(d.get("timeout", 10000)),
        sequencia=sub,
    )


def _resolve_valor(acao: Acao, dataset_dict: dict, ciclo_contexto: dict | None, trilha: str = "visual") -> str | None:
    """Resolve valor_literal | valor_from_dataset | valor_from_contexto | valor_from_pasta_docs."""
    if acao.valor_literal is not None:
        return str(acao.valor_literal)
    if acao.valor_from_dataset:
        return _get_nested(dataset_dict, acao.valor_from_dataset)
    if acao.valor_from_contexto and ciclo_contexto:
        trilha_ctx = ciclo_contexto.get("trilhas", {}).get(trilha)
        if trilha_ctx:
            return _get_nested(trilha_ctx, acao.valor_from_contexto)
    if acao.valor_from_pasta_docs and ciclo_contexto:
        pasta = ciclo_contexto.get("pasta_documentos_teste")
        if pasta:
            return str(Path(pasta) / acao.valor_from_pasta_docs)
    return None


def _get_nested(d, key: str):
    cur = d
    for part in key.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return str(cur) if cur is not None else None


def _executar_acao_com_dataset(page, acao: Acao, dataset_dict: dict, ciclo_contexto: dict | None,
                                pausa_ms: int, delay_tecla_ms: int):
    """Wrapper que resolve valor antes de chamar _executar_acao."""
    valor = _resolve_valor(acao, dataset_dict, ciclo_contexto)
    # _executar_acao aceita dataset/contexto pra resolucao recursiva nas sub-acoes
    _executar_acao(page, acao, valor, dataset_dict, ciclo_contexto, "visual",
                   pausa_ms, delay_tecla_ms)


# ============================================================
# Carregamento do ciclo (contexto.yaml em disco — opcional)
# ============================================================

def _carregar_ciclo_contexto(ciclo_id: str | None):
    if not ciclo_id:
        return None
    import yaml
    p = PROJECT_ROOT / "testes" / "contextos" / ciclo_id / "contexto.yaml"
    if not p.exists():
        return None
    return yaml.safe_load(p.read_text(encoding="utf-8"))


# ============================================================
# Execucao de UM CT
# ============================================================

def _executar_um_ct(page: Page, db, teste: Teste, exec_obj: ExecucaoCasoDeTeste,
                   estado: EstadoSessao, evid_dir: Path, ciclo_contexto: dict | None,
                   args) -> str:
    """Roda 1 CT do teste. Retorna estado final."""
    ct = exec_obj.caso_de_teste
    uc = ct.caso_de_uso

    # Header do painel: "CT-F01-FP — UC-F01: Manter cadastro principal"
    print(f"\n[exec] === {ct.ct_id} ({uc.uc_id}: {uc.nome}) ===")

    # Pega passos do CT
    passos = (
        db.query(PassoTutorial)
        .filter_by(caso_de_teste_id=ct.id)
        .order_by(PassoTutorial.ordem)
        .all()
    )
    if not passos:
        print(f"[exec] {ct.ct_id} sem passos cadastrados — PULADO")
        exec_obj.estado = "pulado"
        exec_obj.concluido_em = datetime.now()
        db.commit()
        return "pulado"

    # Pega dataset do UC
    dataset_obj = (
        db.query(Dataset)
        .filter_by(caso_de_uso_id=uc.id, trilha="visual")
        .first()
    )
    dataset_raw = dataset_obj.dados_json if dataset_obj else {}

    # Resolve placeholders ({{CNPJ_UNICO}}, {{EMAIL_PRINCIPAL}}, etc) usando ciclo + ctx.
    # Ver docs/PROCESSO_CADASTRO_UC_NO_BANCO.md secao 5.
    ciclo_id_real = exec_obj.teste.ciclo_id if exec_obj.teste else "fallback"
    mapa_ph = construir_mapa_placeholders(ciclo_id_real, ciclo_contexto)
    dataset_dict = resolver_placeholders(dataset_raw, mapa_ph)
    nao_resolvidos = listar_placeholders_nao_resolvidos(dataset_dict)
    if nao_resolvidos:
        print(f"[exec] AVISO: placeholders nao resolvidos no dataset {uc.uc_id}: {nao_resolvidos}")
    print(f"[exec] dataset {uc.uc_id} resolvido (ciclo={ciclo_id_real}, "
          f"cnpj={mapa_ph['CNPJ_UNICO']}, email={mapa_ph['EMAIL_PRINCIPAL']})")

    # Marca em_execucao
    exec_obj.estado = "em_execucao"
    exec_obj.iniciado_em = datetime.now()
    db.commit()

    # Atualiza estado do painel pra mostrar este CT
    estado.uc_id = f"{ct.ct_id} ({uc.uc_id})"
    estado.variacao = ct.descricao[:80]
    estado.total_passos = len(passos)
    estado.passo_atual_idx = 0
    estado.estado = "executando"
    estado.resultados.clear()
    for p in passos:
        estado.resultados.append(ResultadoPasso(
            passo_id=p.passo_id,
            titulo=p.titulo,
            descricao_painel=p.descricao_painel or "",
            pontos_observacao=p.pontos_observacao or [],
        ))

    primeiro_screenshot = None
    ultimo_screenshot = None
    tem_reprova = False
    duracao_total = 0

    # Loop de passos
    for idx, passo_db in enumerate(passos):
        # Aborto?
        if estado.evento_parar.is_set():
            print("[exec] STOP solicitado")
            return "pausado"

        estado.passo_atual_idx = idx
        resultado = estado.resultados[idx]

        # Cria registro PassoExecucao no banco
        passo_exec = PassoExecucao(
            execucao_id=exec_obj.id,
            ordem=passo_db.ordem,
            passo_id=passo_db.passo_id,
            passo_titulo=passo_db.titulo,
            descricao_painel=(passo_db.descricao_painel or "")[:5000],
            iniciado_em=datetime.now(),
        )
        db.add(passo_exec)
        db.flush()

        # Screenshot ANTES
        antes_path = evid_dir / f"{ct.ct_id}_{passo_db.passo_id}_before.png"
        try:
            page.screenshot(path=str(antes_path), full_page=False)
            resultado.screenshot_antes = str(antes_path)
            passo_exec.screenshot_antes_path = str(antes_path.relative_to(PROJECT_ROOT))
            if primeiro_screenshot is None:
                primeiro_screenshot = passo_exec.screenshot_antes_path
        except Exception as e:
            print(f"[exec] falha screenshot antes: {e}")

        t0 = time.time()
        erro_acao = None

        # Executa cada acao da lista
        try:
            for acao_dict in (passo_db.acoes_json or []):
                acao = _dict_para_acao(acao_dict)
                _executar_acao_com_dataset(page, acao, dataset_dict, ciclo_contexto,
                                           args.pausa, args.delay_tecla)
        except Exception as e:
            erro_acao = str(e)
            print(f"[exec]   erro acao {passo_db.passo_id}: {e}")

        duracao_passo = int((time.time() - t0) * 1000)
        duracao_total += duracao_passo

        # Screenshot DEPOIS
        depois_path = evid_dir / f"{ct.ct_id}_{passo_db.passo_id}_after.png"
        try:
            page.screenshot(path=str(depois_path), full_page=False)
            resultado.screenshot_depois = str(depois_path)
            passo_exec.screenshot_depois_path = str(depois_path.relative_to(PROJECT_ROOT))
            ultimo_screenshot = passo_exec.screenshot_depois_path
        except Exception as e:
            print(f"[exec] falha screenshot depois: {e}")

        passo_exec.duracao_ms = duracao_passo
        resultado.duracao_ms = duracao_passo

        # Validacao automatica DOM (asserts_json)
        if erro_acao:
            resultado.veredito_automatico = "REPROVADO"
            resultado.detalhes_validacao = {"acao_erro": erro_acao}
            passo_exec.veredito_automatico = "REPROVADO"
            passo_exec.detalhes_validacao_json = {"acao_erro": erro_acao}
        else:
            asserts_dom = [a for a in (passo_db.asserts_json or []) if a.get("tipo") == "dom"]
            if asserts_dom:
                ok, msg, detalhe = _validar_dom(page, asserts_dom)
                resultado.veredito_automatico = "APROVADO" if ok else "REPROVADO"
                resultado.detalhes_validacao = {"dom": {"ok": ok, "mensagem": msg, "asserts": detalhe}}
                passo_exec.veredito_automatico = "APROVADO" if ok else "REPROVADO"
                passo_exec.detalhes_validacao_json = {"dom": {"ok": ok, "mensagem": msg, "asserts": detalhe}}
            else:
                resultado.veredito_automatico = "INCONCLUSIVO"
                passo_exec.veredito_automatico = "INCONCLUSIVO"

        db.commit()
        print(f"[exec]   passo {passo_db.ordem}/{len(passos)} {passo_db.passo_id}: {passo_exec.veredito_automatico}")

        # PAUSA — aguarda tester decidir no painel
        estado.estado = "pausado"
        estado.evento_continuar.clear()
        print(f"[exec]   AGUARDANDO tester decidir no painel :{args.porta}")
        estado.evento_continuar.wait()

        # Coleta veredicto + observacoes do painel
        passo_exec.veredicto_po = resultado.veredicto_po
        passo_exec.correcao_necessaria = 1 if resultado.correcao_necessaria else 0
        passo_exec.correcao_descricao = resultado.correcao_descricao
        passo_exec.concluido_em = datetime.now()
        if resultado.veredicto_po == "REPROVADO":
            tem_reprova = True

        # Salva observacoes do tester
        for txt in (resultado.comentarios_po or []):
            db.add(Observacao(
                passo_execucao_id=passo_exec.id,
                user_id=teste.user_id,
                texto=txt,
            ))
        db.commit()

        if estado.evento_parar.is_set():
            return "pausado"
        estado.estado = "executando"

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

def _criar_teste_novo(db, args) -> str:
    """Quando --user_email + --titulo + --ct_ids sao passados, cria teste novo."""
    user = db.query(User).filter_by(email=args.user_email).first()
    if not user:
        raise SystemExit(f"User {args.user_email} nao existe")
    from db.models import Projeto, Sprint
    proj = db.query(Projeto).filter_by(nome="Facilicita.IA").first()
    sprint = db.query(Sprint).filter_by(projeto_id=proj.id, numero=1).first()

    ct_ids_lista = [s.strip() for s in args.ct_ids.split(",") if s.strip()]
    cts = db.query(CasoDeTeste).filter(CasoDeTeste.ct_id.in_(ct_ids_lista)).all()
    if not cts:
        raise SystemExit(f"Nenhum CT encontrado pra: {ct_ids_lista}")

    teste = Teste(
        projeto_id=proj.id,
        sprint_id=sprint.id,
        user_id=user.id,
        titulo=args.titulo,
        ciclo_id=args.ciclo,
        estado="criado",
    )
    db.add(teste)
    db.flush()

    ct_by_id = {c.ct_id: c for c in cts}
    for ordem, ct_id in enumerate(ct_ids_lista, start=1):
        ct = ct_by_id.get(ct_id)
        if not ct:
            print(f"  [warn] CT {ct_id} nao encontrado")
            continue
        db.add(ExecucaoCasoDeTeste(
            teste_id=teste.id,
            caso_de_teste_id=ct.id,
            ordem=ordem,
            estado="pendente",
        ))
    db.commit()
    print(f"[exec] Teste criado: id={teste.id}, {len(cts)} CTs")
    return teste.id


def main():
    parser_arg = argparse.ArgumentParser(description="Executor Sprint 1 — DB-aware")
    parser_arg.add_argument("--teste_id", help="UUID do teste existente (modo retomada)")
    parser_arg.add_argument("--user_email", help="Para criar teste novo")
    parser_arg.add_argument("--titulo", help="Titulo do teste novo")
    parser_arg.add_argument("--ct_ids", help="CSV de ct_ids para teste novo (ex: CT-F01-FP)")
    parser_arg.add_argument("--ciclo", default="piloto-ucf01", help="ID do ciclo (default piloto-ucf01)")
    parser_arg.add_argument("--porta", type=int, default=PORTA_PAINEL)
    parser_arg.add_argument("--no-browser", action="store_true")
    parser_arg.add_argument("--slow-mo", type=int, default=SLOW_MO_DEFAULT)
    parser_arg.add_argument("--delay-tecla", type=int, default=DELAY_POR_TECLA_DEFAULT)
    parser_arg.add_argument("--pausa", type=int, default=PAUSA_ENTRE_ACOES_DEFAULT)
    parser_arg.add_argument("--auto-login", action="store_true",
                            help="Faz login antes do CT 1 (usa email do contexto se houver)")
    args = parser_arg.parse_args()

    db = get_db()
    teste_id_global: str | None = None  # pra usar no cleanup

    def _cleanup_pid():
        """Garante que pid_executor=NULL e estado coerente no banco, mesmo em crash/SIGTERM."""
        if not teste_id_global:
            return
        try:
            from db.engine import get_db as _get_db
            db_clean = _get_db()
            try:
                t = db_clean.query(Teste).filter_by(id=teste_id_global).first()
                if t:
                    t.pid_executor = None
                    if t.estado == "em_andamento":
                        t.estado = "pausado"
                    db_clean.commit()
                    print(f"[exec] cleanup: pid_executor=NULL, estado={t.estado}", file=sys.stderr)
            finally:
                db_clean.close()
        except Exception as e:
            print(f"[exec] cleanup falhou: {e}", file=sys.stderr)

    def _signal_handler(signum, frame):
        print(f"[exec] recebeu sinal {signum} — limpando", file=sys.stderr)
        _cleanup_pid()
        sys.exit(143 if signum == signal.SIGTERM else 130)

    atexit.register(_cleanup_pid)
    signal.signal(signal.SIGTERM, _signal_handler)
    signal.signal(signal.SIGINT, _signal_handler)

    try:
        # Modo: criar teste novo OU usar existente
        if args.teste_id:
            teste_id = args.teste_id
        elif args.user_email and args.titulo and args.ct_ids:
            teste_id = _criar_teste_novo(db, args)
        else:
            raise SystemExit("Use --teste_id <UUID> OU --user_email + --titulo + --ct_ids")
        teste_id_global = teste_id

        teste = db.query(Teste).filter_by(id=teste_id).first()
        if not teste:
            raise SystemExit(f"Teste {teste_id} nao encontrado")

        # Reset CTs que ficaram em em_execucao (executor caiu/foi morto antes de concluir)
        # — voltam pra pendente, apagam passos parciais e sao re-executados do passo 0
        execs_em_curso = (
            db.query(ExecucaoCasoDeTeste)
            .filter_by(teste_id=teste.id, estado="em_execucao")
            .all()
        )
        if execs_em_curso:
            for e in execs_em_curso:
                # Apaga passos_execucao parciais (cascade leva observacoes junto)
                db.query(PassoExecucao).filter_by(execucao_id=e.id).delete()
                e.estado = "pendente"
                e.iniciado_em = None
            db.commit()
            print(f"[exec] {len(execs_em_curso)} CT(s) em_execucao resetados (retomada)")

        # Carrega execucoes pendentes (em ordem)
        execs = (
            db.query(ExecucaoCasoDeTeste)
            .filter_by(teste_id=teste.id, estado="pendente")
            .order_by(ExecucaoCasoDeTeste.ordem)
            .all()
        )
        if not execs:
            print(f"[exec] Nada pendente em '{teste.titulo}'.")
            return 0

        print(f"[exec] === Teste: {teste.titulo} ===")
        print(f"[exec] User: {teste.user.email if teste.user else '?'}")
        print(f"[exec] Sprint: {teste.sprint.nome if teste.sprint else '?'}")
        print(f"[exec] {len(execs)} CT(s) pendente(s)")

        # Marca teste em_andamento
        teste.estado = "em_andamento"
        teste.iniciado_em = teste.iniciado_em or datetime.now()
        teste.pid_executor = os.getpid()
        db.commit()

        # Diretorio de evidencias
        ts_safe = datetime.now().isoformat(timespec="seconds").replace(":", "-")
        evid_dir = PROJECT_ROOT / "testes" / "relatorios" / "visual" / f"teste_{teste.id[:8]}_{ts_safe}"
        evid_dir.mkdir(parents=True, exist_ok=True)
        print(f"[exec] Evidencias: {evid_dir}")

        # Carrega contexto do ciclo (opcional, pra resolver valor_from_contexto: usuario.email)
        ciclo_contexto = _carregar_ciclo_contexto(teste.ciclo_id or args.ciclo) or {}

        # Injeta pasta_documentos_teste do user (usado por valor_from_pasta_docs em uploads)
        if teste.user and teste.user.pasta_documentos_teste:
            ciclo_contexto["pasta_documentos_teste"] = teste.user.pasta_documentos_teste
            print(f"[exec] pasta_documentos_teste = {teste.user.pasta_documentos_teste}")

        # Estado compartilhado com painel
        estado = EstadoSessao(
            uc_id=teste.titulo,
            variacao=f"{len(execs)} CTs",
            ciclo_id=teste.ciclo_id or "",
            base_url="http://localhost:5180",
            ambiente="agenteditais",
            total_passos=0,
            estado="aguardando_inicio",
            iniciado_em=datetime.now().isoformat(timespec="seconds"),
            evidencias_dir=evid_dir,
        )

        # Sobe painel Flask
        iniciar_painel_em_thread(estado, host="localhost", porta=args.porta)
        print(f"[exec] Painel: http://localhost:{args.porta}")
        if not args.no_browser:
            try:
                webbrowser.open(f"http://localhost:{args.porta}")
            except Exception:
                pass
        time.sleep(1.5)

        # Boot Playwright
        print(f"[exec] Subindo browser (slow_mo={args.slow_mo}, delay_tecla={args.delay_tecla}, pausa={args.pausa})")
        with sync_playwright() as p:
            browser: Browser = p.chromium.launch(headless=False, slow_mo=args.slow_mo)
            context = browser.new_context(
                base_url="http://localhost:5180",
                viewport={"width": 1400, "height": 900},
            )
            page = context.new_page()

            # Auto-aceita dialogs
            def _on_dialog(d):
                print(f"[exec] DIALOG ({d.type}): {d.message!r} -> aceitando")
                try: d.accept()
                except: pass
            page.on("dialog", _on_dialog)

            # Login opcional
            if args.auto_login:
                email = EMAIL_DEFAULT
                senha = SENHA_DEFAULT
                if ciclo_contexto and "trilhas" in ciclo_contexto:
                    t_visual = ciclo_contexto["trilhas"].get("visual")
                    if t_visual:
                        email = t_visual["usuario"]["email"]
                        senha = t_visual["usuario"]["senha"]
                print(f"[exec] auto-login: {email}")
                try:
                    _login(page, email=email, senha=senha)
                except Exception as e:
                    print(f"[exec] auto-login falhou (tutorial pode ter passo 00): {e}")

            estado.estado = "executando"

            # Loop de CTs
            for exec_obj in execs:
                if estado.evento_parar.is_set():
                    break
                _executar_um_ct(page, db, teste, exec_obj, estado, evid_dir, ciclo_contexto, args)

            # Mantem browser 3s pra ver
            try:
                page.wait_for_timeout(3000)
            except: pass
            browser.close()

        # Estado final do teste
        if estado.evento_parar.is_set():
            teste.estado = "pausado"
        else:
            ainda_pendente = db.query(ExecucaoCasoDeTeste).filter_by(teste_id=teste.id, estado="pendente").count()
            teste.estado = "concluido" if ainda_pendente == 0 else "pausado"
            if teste.estado == "concluido":
                teste.concluido_em = datetime.now()
                # Gera relatorio
                rel_md = _gerar_relatorio(db, teste)
                rel_path = evid_dir / "relatorio.md"
                rel_path.write_text(rel_md, encoding="utf-8")
                db.add(Relatorio(
                    teste_id=teste.id,
                    formato="md",
                    conteudo_md=rel_md,
                    path_arquivo=str(rel_path.relative_to(PROJECT_ROOT)),
                ))

        teste.pid_executor = None
        db.commit()

        print(f"\n[exec] === FIM: teste estado={teste.estado} ===")
        print(f"[exec] Evidencias: {evid_dir}")
        return 0
    finally:
        db.close()


def _gerar_relatorio(db, teste) -> str:
    lines = [
        f"# Relatorio — {teste.titulo}",
        f"",
        f"- Tester: {teste.user.email if teste.user else '-'}",
        f"- Sprint: {teste.sprint.nome if teste.sprint else '-'}",
        f"- Iniciado: {teste.iniciado_em}",
        f"- Concluido: {teste.concluido_em}",
        f"- Estado: {teste.estado}",
        f"",
        f"## Casos de Teste",
        f"",
    ]
    execs = db.query(ExecucaoCasoDeTeste).filter_by(teste_id=teste.id).order_by(ExecucaoCasoDeTeste.ordem).all()
    for e in execs:
        ct = e.caso_de_teste
        lines.append(f"### {e.ordem}. {ct.ct_id} — {ct.descricao}")
        lines.append(f"  - Estado: {e.estado}")
        lines.append(f"  - Veredito automatico: {e.veredito_automatico}")
        lines.append(f"  - Veredicto PO: {e.veredicto_po or '-'}")
        passos = db.query(PassoExecucao).filter_by(execucao_id=e.id).order_by(PassoExecucao.ordem).all()
        for p in passos:
            lines.append(f"    - Passo {p.ordem} `{p.passo_id}`: auto={p.veredito_automatico}, po={p.veredicto_po or '-'}")
            obs = db.query(Observacao).filter_by(passo_execucao_id=p.id).all()
            for o in obs:
                lines.append(f"      💬 {o.texto}")
        lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    sys.exit(main())
