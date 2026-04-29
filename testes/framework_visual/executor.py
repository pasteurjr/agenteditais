#!/usr/bin/env python3
"""
Executor da trilha Visual acompanhada.

Sobe:
  1. Painel Flask em http://localhost:9876 (em thread daemon)
  2. Browser Chromium em modo headed (slow_mo=500ms)

Para cada passo do tutorial:
  1. Captura screenshot ANTES
  2. Atualiza painel (descrição, pontos de observação)
  3. Executa ação (fill/click/wait_for/...) com slow_mo visível
  4. Captura screenshot DEPOIS
  5. Roda validação automática (DOM + Rede; Semântica fica pra futuro)
  6. PAUSA: aguarda PO clicar [Continuar] no painel
  7. Coleta comentários do PO antes de avançar

Ao final, gera relatório markdown em testes/relatorios/visual/.

Uso:
    python3 testes/framework_visual/executor.py UC-F01 fp [--ciclo=<id>]
"""

from __future__ import annotations

import argparse
import configparser
import os
import sys
import time
import webbrowser
from datetime import datetime
from pathlib import Path

from playwright.sync_api import Browser, Page, sync_playwright

# Path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

from parser import Acao, PassoVisual, Tutorial, carregar_tutorial, resolve_valor_acao  # type: ignore
from painel import EstadoSessao, ResultadoPasso, iniciar_painel_em_thread  # type: ignore
from relatorio import salvar_relatorio  # type: ignore

# Carrega defaults do validaeditais.ini na raiz do projeto, com fallback hardcoded.
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


def _login(page: Page, email: str = "valida1@valida.com.br", senha: str = "123456"):
    """Login automático com a credencial do contexto (ou padrão)."""
    page.goto("/", wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(1500)
    page.evaluate("""() => {
        Object.keys(localStorage).filter(k => k.startsWith('editais_ia_')).forEach(k => localStorage.removeItem(k));
    }""")
    page.reload(wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(1500)
    try:
        page.wait_for_selector('input[type="email"]', timeout=5000)
        page.fill('input[type="email"]', email)
        page.fill('input[type="password"]', senha)
        page.click('button[type="submit"]')
        page.wait_for_timeout(3500)
        # Selecionar empresa se aparecer
        try:
            body = page.inner_text("body")
        except Exception:
            body = ""
        if "Selecionar Empresa" in body or "Escolha a empresa" in body:
            ch = page.locator("text=CH Hospitalar").first
            if ch.count() > 0:
                ch.click()
                page.wait_for_timeout(3000)
        page.wait_for_selector("text=Dashboard", timeout=15000)
    except Exception as e:
        print(f"[executor] Login falhou ou nao precisou: {e}")


def _executar_acao(
    page: Page,
    acao: Acao,
    valor: str | None,
    dataset: dict | None = None,
    contexto: dict | None = None,
    trilha: str = "visual",
    pausa_entre_acoes_ms: int = 0,
    delay_por_tecla_ms: int = 50,
) -> None:
    """Executa uma ação do tutorial. Resolve `valor_from_*` recursivamente nas sub-ações.

    - pausa_entre_acoes_ms: delay extra entre sub-acoes de uma sequencia.
    - delay_por_tecla_ms: delay entre cada tecla digitada (efeito humano).
    """
    if acao.sequencia:
        for i, sub in enumerate(acao.sequencia):
            sub_valor = resolve_valor_acao(sub, dataset or {}, contexto, trilha) if (dataset is not None or contexto is not None) else None
            _executar_acao(page, sub, sub_valor, dataset, contexto, trilha, pausa_entre_acoes_ms, delay_por_tecla_ms)
            if pausa_entre_acoes_ms > 0 and i < len(acao.sequencia) - 1:
                page.wait_for_timeout(pausa_entre_acoes_ms)
        return

    seletor = acao.seletor or acao.alternativa

    if acao.tipo in ("navigate", "navegacao", "goto"):
        url = acao.url or acao.destino or "/"
        page.goto(url, wait_until="domcontentloaded", timeout=15000)
    elif acao.tipo == "click":
        if not seletor:
            raise ValueError("click sem seletor")
        page.click(seletor, timeout=acao.timeout)
    elif acao.tipo == "fill":
        if not seletor:
            raise ValueError("fill sem seletor")
        if valor is None:
            raise ValueError("fill sem valor")
        # Digita tecla-por-tecla (humano) em vez de paste instantaneo (page.fill)
        loc = page.locator(seletor).first
        loc.click(timeout=acao.timeout)
        loc.press_sequentially(valor, delay=delay_por_tecla_ms, timeout=acao.timeout)
    elif acao.tipo == "select":
        if not seletor:
            raise ValueError("select sem seletor")
        if valor is None:
            raise ValueError("select sem valor")
        # Pega o locator do select (suporta sintaxe Playwright "X >> nth=N")
        select_loc = page.locator(seletor).first
        # Tenta value primeiro (UUID/codigo); se falhar, label exato;
        # se falhar, match parcial nas options.
        try:
            select_loc.select_option(value=valor, timeout=acao.timeout)
        except Exception:
            try:
                select_loc.select_option(label=valor, timeout=acao.timeout)
            except Exception:
                # Match parcial: pega primeira option cujo texto contenha valor
                opcoes = select_loc.locator("option").all_text_contents()
                idx = next((i for i, t in enumerate(opcoes) if valor in t), None)
                if idx is None:
                    raise ValueError(f"select: nenhuma option contem '{valor}'. Opcoes: {opcoes[:8]}")
                select_loc.select_option(index=idx, timeout=acao.timeout)
    elif acao.tipo == "wait_for":
        if not seletor:
            raise ValueError("wait_for sem seletor")
        page.wait_for_selector(seletor, timeout=acao.timeout)
    elif acao.tipo == "evaluate":
        # Executa JavaScript arbitrario na pagina (ex: localStorage.clear(), location.reload())
        # valor_literal contem o codigo JS
        if not (acao.valor_literal or valor):
            raise ValueError("evaluate sem codigo JS")
        codigo = acao.valor_literal or valor
        page.evaluate(codigo)
    elif acao.tipo == "upload_arquivo":
        # valor = path absoluto do arquivo no disco do tester
        if not seletor:
            raise ValueError("upload_arquivo sem seletor (deve apontar para input[type=file])")
        if not valor:
            raise ValueError("upload_arquivo sem valor (path do arquivo)")
        from pathlib import Path as _P
        p = _P(valor)
        if not p.exists():
            raise FileNotFoundError(f"Arquivo de upload nao existe: {valor}")
        if not p.is_file():
            raise ValueError(f"Path nao eh arquivo: {valor}")
        page.set_input_files(seletor, str(p))
    elif acao.tipo == "chamar_api":
        # Faz POST/PUT/etc na API do app via Playwright (reusa cookies/auth da sessao do browser)
        if not acao.url:
            raise ValueError("chamar_api sem url")
        metodo = (acao.metodo or "POST").upper()
        url_full = acao.url
        # Resolve placeholders no payload (substitui {{X}} por valores do dataset/contexto)
        payload = acao.payload_json
        if payload is not None and (dataset is not None or contexto is not None):
            payload = _resolver_payload(payload, dataset or {}, contexto, trilha)
        # JWT do app editais fica no localStorage (chave editais_ia_access_token).
        # Extrai e envia como Bearer token — endpoints @require_auth precisam dele.
        try:
            jwt_token = page.evaluate("() => localStorage.getItem('editais_ia_access_token')")
        except Exception:
            jwt_token = None

        # NAO usa page.context.request — Playwright Python tem bug que sobrescreve
        # Content-Type pra text/plain quando data=bytes/str, ignorando o header.
        # Solucao: requests Python externo + JWT do localStorage + URL do BACKEND direto.
        # IMPORTANTE: nao usar a URL do frontend (5180/5181) — o Vite proxy pode engolir
        # o body em chamadas server-side fora do contexto do browser. Usa porta do backend
        # editais (:5007) diretamente. Configuravel via env BACKEND_EDITAIS_URL.
        import os as _os
        import requests as _req
        backend_url = _os.environ.get("BACKEND_EDITAIS_URL", "http://localhost:5007")
        url_completa = url_full if url_full.startswith("http") else f"{backend_url}{url_full}"

        headers = {"Content-Type": "application/json"}
        if jwt_token:
            headers["Authorization"] = f"Bearer {jwt_token}"

        timeout_s = acao.timeout / 1000.0  # ms -> segundos

        try:
            if metodo == "POST":
                resp = _req.post(url_completa, json=payload, headers=headers, timeout=timeout_s)
            elif metodo == "PUT":
                resp = _req.put(url_completa, json=payload, headers=headers, timeout=timeout_s)
            elif metodo == "DELETE":
                resp = _req.delete(url_completa, json=payload, headers=headers, timeout=timeout_s)
            elif metodo == "GET":
                resp = _req.get(url_completa, headers=headers, timeout=timeout_s)
            else:
                raise ValueError(f"Metodo HTTP nao suportado: {metodo}")
        except _req.exceptions.RequestException as e:
            raise RuntimeError(f"chamar_api {metodo} {url_completa} -> erro de rede: {e}")

        if resp.status_code >= 400:
            body = resp.text[:300] if resp.text else "<no body>"
            raise RuntimeError(f"chamar_api {metodo} {url_completa} -> {resp.status_code}: {body}")
    else:
        raise ValueError(f"Tipo de acao nao suportado: {acao.tipo}")


def _resolver_payload(obj, dataset: dict, contexto, trilha: str = "visual"):
    """Resolve recursivamente strings 'from:dataset.empresa.cnpj' ou 'from:contexto.usuario.email'
    dentro do payload_json de chamar_api."""
    if isinstance(obj, str):
        if obj.startswith("from:dataset."):
            chave = obj[len("from:dataset."):]
            return _get_nested(dataset, chave)
        if obj.startswith("from:contexto."):
            chave = obj[len("from:contexto."):]
            trilha_ctx = (contexto or {}).get("trilhas", {}).get(trilha, {})
            return _get_nested(trilha_ctx, chave)
        return obj
    if isinstance(obj, dict):
        return {k: _resolver_payload(v, dataset, contexto, trilha) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_resolver_payload(x, dataset, contexto, trilha) for x in obj]
    return obj


def _get_nested(d, key: str):
    cur = d
    for part in key.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def _validar_dom(page: Page, asserts: list[dict]) -> tuple[bool, str, list[dict]]:
    """Validações DOM simples. Retorna (ok, mensagem, detalhe_por_assert)."""
    detalhe: list[dict] = []
    if not asserts:
        return True, "sem asserts DOM", detalhe
    ok_geral = True
    msg_primeiro_erro = ""
    for a in asserts:
        sel = a.get("selector")
        if not sel:
            continue
        item: dict = {"selector": sel, "ok": False, "info": ""}
        loc = page.locator(sel).first
        try:
            count = loc.count()
            item["count"] = count
        except Exception as e:
            item["info"] = f"erro contando: {e}"
            detalhe.append(item)
            if ok_geral:
                ok_geral = False
                msg_primeiro_erro = item["info"]
            continue
        if count == 0 and a.get("visible") is not False:
            item["info"] = "selector nao encontrado"
            detalhe.append(item)
            if ok_geral:
                ok_geral = False
                msg_primeiro_erro = f"selector nao encontrado: {sel}"
            continue
        if a.get("texto_contem"):
            try:
                txt = loc.text_content() or ""
                if a["texto_contem"].lower() not in txt.lower():
                    item["info"] = f"texto '{a['texto_contem']}' nao encontrado"
                    detalhe.append(item)
                    if ok_geral:
                        ok_geral = False
                        msg_primeiro_erro = item["info"]
                    continue
            except Exception:
                item["info"] = f"erro lendo texto"
                detalhe.append(item)
                if ok_geral:
                    ok_geral = False
                    msg_primeiro_erro = item["info"]
                continue
        item["ok"] = True
        item["info"] = "OK"
        detalhe.append(item)
    return ok_geral, msg_primeiro_erro, detalhe


def main():
    parser = argparse.ArgumentParser(description="Executor da trilha visual")
    parser.add_argument("uc_id")
    parser.add_argument("variacao")
    parser.add_argument("--ciclo", help="ID do ciclo (busca contexto)")
    parser.add_argument("--no-browser", action="store_true", help="Nao abrir aba do painel")
    parser.add_argument("--porta", type=int, default=PORTA_PAINEL)
    parser.add_argument("--email", default=EMAIL_DEFAULT)
    parser.add_argument("--senha", default=SENHA_DEFAULT)
    parser.add_argument("--auto-login", action="store_true",
                        help="Faz login automatico ANTES do passo 01 (atalho legado). Por padrao, login fica como passo 00 do tutorial pra voce ver acontecer.")
    parser.add_argument("--slow-mo", type=int, default=SLOW_MO_DEFAULT,
                        help=f"Delay (ms) do Playwright entre operacoes baixas. Default: {SLOW_MO_DEFAULT}")
    parser.add_argument("--delay-tecla", type=int, default=DELAY_POR_TECLA_DEFAULT,
                        help=f"Delay (ms) entre cada tecla digitada — efeito humano. Default: {DELAY_POR_TECLA_DEFAULT}")
    parser.add_argument("--pausa", type=int, default=PAUSA_ENTRE_ACOES_DEFAULT,
                        help=f"Delay (ms) extra entre sub-acoes (entre fills consecutivos). Default: {PAUSA_ENTRE_ACOES_DEFAULT}")
    args = parser.parse_args()

    print(f"[executor] Carregando tutorial {args.uc_id}/{args.variacao}...")
    tut = carregar_tutorial(args.uc_id, args.variacao, args.ciclo)
    print(f"[executor]   {len(tut.passos)} passos carregados")

    # Diretório de evidências
    iniciado_em = datetime.now().isoformat(timespec="seconds")
    ts_safe = iniciado_em.replace(":", "-").replace(".", "-")
    evid_dir = PROJECT_ROOT / "testes" / "relatorios" / "visual" / args.uc_id / ts_safe
    evid_dir.mkdir(parents=True, exist_ok=True)
    print(f"[executor] Evidencias: {evid_dir}")

    # Estado da sessão
    estado = EstadoSessao(
        uc_id=tut.uc_id,
        variacao=tut.variacao,
        ciclo_id=args.ciclo or "",
        base_url=tut.base_url,
        ambiente=tut.ambiente,
        total_passos=len(tut.passos),
        estado="aguardando_inicio",
        iniciado_em=iniciado_em,
        evidencias_dir=evid_dir,
    )
    # Pré-popular resultados (vazios) com infos do tutorial
    for p in tut.passos:
        estado.resultados.append(ResultadoPasso(
            passo_id=p.id,
            titulo=p.titulo_acao,
            descricao_painel=p.descricao_painel,
            pontos_observacao=p.pontos_observacao,
        ))

    # Sobe painel em thread
    painel_thread = iniciar_painel_em_thread(estado, host="localhost", porta=args.porta)
    print(f"[executor] Painel: http://localhost:{args.porta}")
    if not args.no_browser:
        try:
            webbrowser.open(f"http://localhost:{args.porta}")
        except Exception:
            pass
    time.sleep(1.5)  # dá tempo do Flask subir

    # Sobe Playwright headed
    print(f"[executor] Subindo browser (headed, slow_mo={args.slow_mo}ms, delay/tecla={args.delay_tecla}ms, pausa entre sub-acoes={args.pausa}ms)...")
    with sync_playwright() as p:
        browser: Browser = p.chromium.launch(headless=False, slow_mo=args.slow_mo)
        context = browser.new_context(
            base_url=tut.base_url,
            viewport={"width": 1400, "height": 900},
        )
        page = context.new_page()

        # Auto-aceita dialogs (alert/confirm/prompt) — robo aperta OK automaticamente.
        # Loga a mensagem no terminal pra rastreabilidade.
        def _on_dialog(dialog):
            print(f"[executor] DIALOG ({dialog.type}): {dialog.message!r} -> aceitando")
            try:
                dialog.accept()
            except Exception as e:
                print(f"[executor] Falha ao aceitar dialog: {e}")
        page.on("dialog", _on_dialog)

        # Login (usa contexto se houver, senão padrão)
        email = args.email
        senha = args.senha
        if tut.contexto and "trilhas" in tut.contexto:
            t_visual = tut.contexto["trilhas"].get("visual")
            if t_visual:
                email = t_visual["usuario"]["email"]
                senha = t_visual["usuario"]["senha"]
        if args.auto_login:
            print(f"[executor] Login automatico (--auto-login) com {email}...")
            try:
                _login(page, email=email, senha=senha)
            except Exception as e:
                print(f"[executor] Login falhou: {e}")
        else:
            print(f"[executor] Sem login automatico — login deve ser passo 00 do tutorial")

        estado.estado = "executando"
        idx = 0

        while idx < len(tut.passos):
            if estado.evento_parar.is_set():
                print("[executor] Parar solicitado.")
                estado.estado = "parado"
                break
            if estado.evento_reiniciar.is_set():
                print("[executor] Reiniciar solicitado.")
                estado.evento_reiniciar.clear()
                idx = 0
                for r in estado.resultados:
                    r.comentarios_po = []
                    r.correcao_necessaria = False
                    r.correcao_descricao = None
                    r.veredito_automatico = "PENDENTE"
                    r.veredicto_po = None
                    r.detalhes_validacao = {}
                    r.duracao_ms = 0
                    r.screenshot_antes = None
                    r.screenshot_depois = None
                continue

            estado.passo_atual_idx = idx
            passo = tut.passos[idx]
            resultado = estado.resultados[idx]

            # Screenshot ANTES
            antes_path = evid_dir / f"before_{passo.id}.png"
            try:
                page.screenshot(path=str(antes_path), full_page=False)
                resultado.screenshot_antes = str(antes_path)
            except Exception as e:
                print(f"[executor] Falha screenshot antes: {e}")

            t0 = time.time()
            erro_acao = None

            # Executa ação
            try:
                valor = resolve_valor_acao(passo.acao, tut.dataset, tut.contexto, "visual")
                _executar_acao(page, passo.acao, valor, tut.dataset, tut.contexto, "visual", args.pausa, args.delay_tecla)
            except Exception as e:
                erro_acao = str(e)

            # Screenshot DEPOIS
            depois_path = evid_dir / f"after_{passo.id}.png"
            try:
                page.screenshot(path=str(depois_path), full_page=False)
                resultado.screenshot_depois = str(depois_path)
            except Exception as e:
                print(f"[executor] Falha screenshot depois: {e}")

            resultado.duracao_ms = int((time.time() - t0) * 1000)

            # Validação automática
            try:
                url_at_erro = page.url
            except Exception:
                url_at_erro = ""
            if erro_acao:
                resultado.veredito_automatico = "REPROVADO"
                resultado.detalhes_validacao = {
                    "acao_erro": erro_acao,
                    "url_atual": url_at_erro,
                    "camada_decisiva": "Acao",
                }
            elif passo.validacao_ref:
                # Para a versao visual, buscamos asserts_dom no caso de teste pelo step_id
                step_id = passo.validacao_ref.split("#")[-1] if "#" in passo.validacao_ref else passo.id
                asserts_dom = []
                # caso_de_teste pode ter "passos" como lista
                cdt_passos = tut.caso_de_teste.get("passos") if isinstance(tut.caso_de_teste, dict) else None
                if isinstance(cdt_passos, list):
                    for cp in cdt_passos:
                        if cp.get("id") == step_id:
                            asserts_dom = cp.get("asserts_dom", []) or []
                            break
                ok, msg, detalhe_asserts = _validar_dom(page, asserts_dom)
                resultado.veredito_automatico = "APROVADO" if ok else "REPROVADO"
                try:
                    url_atual = page.url
                except Exception:
                    url_atual = ""
                resultado.detalhes_validacao = {
                    "dom": {"ok": ok, "mensagem": msg, "asserts": detalhe_asserts},
                    "url_atual": url_atual,
                    "camada_decisiva": "DOM" if not ok else ("DOM" if asserts_dom else "—"),
                }
            else:
                resultado.veredito_automatico = "INCONCLUSIVO"
                resultado.detalhes_validacao = {"motivo": "sem validacao_ref"}

            print(f"[executor] [{idx + 1}/{len(tut.passos)}] {passo.id}: {resultado.veredito_automatico}")

            # PAUSA — aguarda PO no painel
            estado.estado = "pausado"
            estado.evento_continuar.clear()
            print(f"[executor]   AGUARDANDO PO clicar [Continuar] no painel :{args.porta}")
            estado.evento_continuar.wait()  # bloqueia até POST /continuar

            # Se foi parar/reiniciar, próxima iteração trata
            if estado.evento_parar.is_set() or estado.evento_reiniciar.is_set():
                continue

            estado.estado = "executando"
            idx += 1

        # Encerrar
        if estado.estado != "parado":
            estado.estado = "terminado"
        estado.passo_atual_idx = len(tut.passos)
        print(f"[executor] {estado.estado.upper()}")

        # Manter browser aberto por 5s para o PO ver
        page.wait_for_timeout(5000)
        browser.close()

    # Salvar relatório
    rel_path = salvar_relatorio(estado)
    print(f"[executor] Relatorio: {rel_path}")
    print(f"[executor] Evidencias: {evid_dir}")
    return 0 if estado.estado == "terminado" else 1


if __name__ == "__main__":
    sys.exit(main())
