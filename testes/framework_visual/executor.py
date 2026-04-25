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

PORTA_PAINEL = 9876
SLOW_MO = 500  # ms entre ações pra você ver acontecendo


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


def _executar_acao(page: Page, acao: Acao, valor: str | None) -> None:
    """Executa uma ação do tutorial."""
    if acao.sequencia:
        for sub in acao.sequencia:
            sub_valor = None
            # Para sub-acoes, valor passado nao se aplica — cada uma resolve o seu
            _executar_acao(page, sub, sub_valor)
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
        page.fill(seletor, valor, timeout=acao.timeout)
    elif acao.tipo == "select":
        if not seletor:
            raise ValueError("select sem seletor")
        if valor is None:
            raise ValueError("select sem valor")
        page.select_option(seletor, valor, timeout=acao.timeout)
    elif acao.tipo == "wait_for":
        if not seletor:
            raise ValueError("wait_for sem seletor")
        page.wait_for_selector(seletor, timeout=acao.timeout)
    else:
        raise ValueError(f"Tipo de acao nao suportado: {acao.tipo}")


def _validar_dom(page: Page, asserts: list[dict]) -> tuple[bool, str]:
    """Validações DOM simples. Retorna (ok, mensagem)."""
    if not asserts:
        return True, "sem asserts DOM"
    for a in asserts:
        sel = a.get("selector")
        if not sel:
            continue
        loc = page.locator(sel).first
        try:
            count = loc.count()
        except Exception as e:
            return False, f"erro contando {sel}: {e}"
        if count == 0 and a.get("visible") is not False:
            return False, f"selector nao encontrado: {sel}"
        if a.get("texto_contem"):
            try:
                txt = loc.text_content() or ""
                if a["texto_contem"].lower() not in txt.lower():
                    return False, f"texto '{a['texto_contem']}' nao em {sel}"
            except Exception:
                return False, f"erro lendo texto de {sel}"
    return True, ""


def main():
    parser = argparse.ArgumentParser(description="Executor da trilha visual")
    parser.add_argument("uc_id")
    parser.add_argument("variacao")
    parser.add_argument("--ciclo", help="ID do ciclo (busca contexto)")
    parser.add_argument("--no-browser", action="store_true", help="Nao abrir aba do painel")
    parser.add_argument("--porta", type=int, default=PORTA_PAINEL)
    parser.add_argument("--email", default="valida1@valida.com.br")
    parser.add_argument("--senha", default="123456")
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
    print(f"[executor] Subindo browser (headed, slow_mo={SLOW_MO}ms)...")
    with sync_playwright() as p:
        browser: Browser = p.chromium.launch(headless=False, slow_mo=SLOW_MO)
        context = browser.new_context(
            base_url=tut.base_url,
            viewport={"width": 1400, "height": 900},
        )
        page = context.new_page()

        # Login (usa contexto se houver, senão padrão)
        email = args.email
        senha = args.senha
        if tut.contexto and "trilhas" in tut.contexto:
            t_visual = tut.contexto["trilhas"].get("visual")
            if t_visual:
                email = t_visual["usuario"]["email"]
                senha = t_visual["usuario"]["senha"]
        print(f"[executor] Login com {email}...")
        try:
            _login(page, email=email, senha=senha)
        except Exception as e:
            print(f"[executor] Login falhou: {e}")

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
                _executar_acao(page, passo.acao, valor)
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
            if erro_acao:
                resultado.veredito_automatico = "REPROVADO"
                resultado.detalhes_validacao = {"acao_erro": erro_acao}
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
                ok, msg = _validar_dom(page, asserts_dom)
                resultado.veredito_automatico = "APROVADO" if ok else "REPROVADO"
                resultado.detalhes_validacao = {"dom": {"ok": ok, "mensagem": msg}}
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
