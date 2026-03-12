"""
Automação de busca de certidões via Playwright + CapSolver.

Cada portal tem sua função específica. Todas retornam dict padrão:
{
    "sucesso": bool,
    "mensagem": str,
    "path_arquivo": str | None,
    "numero": str | None,
    "data_vencimento": str | None,  # YYYY-MM-DD
    "dados_extras": dict | None,
}
"""
import os
import json
import time
import base64
import requests
from datetime import date, timedelta
from config import CAPSOLVER_API_KEY


def _resultado_vazio(mensagem=""):
    return {
        "sucesso": False,
        "mensagem": mensagem,
        "path_arquivo": None,
        "numero": None,
        "data_vencimento": None,
        "dados_extras": None,
    }


def _solve_captcha_image(image_base64: str, max_retries: int = 2) -> str | None:
    """Resolve captcha de imagem via CapSolver ImageToTextTask."""
    if not CAPSOLVER_API_KEY:
        return None

    for attempt in range(max_retries):
        try:
            resp = requests.post("https://api.capsolver.com/createTask", json={
                "clientKey": CAPSOLVER_API_KEY,
                "task": {
                    "type": "ImageToTextTask",
                    "body": image_base64,
                }
            }, timeout=30)
            data = resp.json()
            if data.get("errorId", 0) != 0:
                print(f"[CAPSOLVER] Erro createTask (tentativa {attempt+1}): {data.get('errorDescription')}")
                continue

            # Resposta direta (status=ready já na primeira resposta)
            if data.get("status") == "ready":
                text = data.get("solution", {}).get("text")
                if text:
                    return text
                continue

            task_id = data.get("taskId")
            if not task_id:
                continue

            # Polling (caso não tenha vindo pronto)
            for _ in range(20):
                time.sleep(2)
                r2 = requests.post("https://api.capsolver.com/getTaskResult", json={
                    "clientKey": CAPSOLVER_API_KEY,
                    "taskId": task_id,
                }, timeout=15)
                result = r2.json()
                if result.get("status") == "ready":
                    return result.get("solution", {}).get("text")
                if result.get("errorId", 0) != 0:
                    print(f"[CAPSOLVER] Erro polling (tentativa {attempt+1}): {result.get('errorDescription')}")
                    break

        except Exception as e:
            print(f"[CAPSOLVER] Erro image (tentativa {attempt+1}): {e}")

    return None


def _solve_recaptcha_v2(site_url: str, site_key: str) -> str | None:
    """Resolve reCAPTCHA v2 via CapSolver."""
    if not CAPSOLVER_API_KEY:
        return None
    try:
        resp = requests.post("https://api.capsolver.com/createTask", json={
            "clientKey": CAPSOLVER_API_KEY,
            "task": {
                "type": "ReCaptchaV2TaskProxyLess",
                "websiteURL": site_url,
                "websiteKey": site_key,
            }
        }, timeout=30)
        data = resp.json()
        if data.get("errorId", 0) != 0:
            print(f"[CAPSOLVER] Erro reCAPTCHA: {data.get('errorDescription')}")
            return None

        task_id = data.get("taskId")
        if not task_id:
            return data.get("solution", {}).get("gRecaptchaResponse")

        for _ in range(60):
            time.sleep(3)
            r2 = requests.post("https://api.capsolver.com/getTaskResult", json={
                "clientKey": CAPSOLVER_API_KEY,
                "taskId": task_id,
            }, timeout=15)
            result = r2.json()
            if result.get("status") == "ready":
                return result.get("solution", {}).get("gRecaptchaResponse")
            if result.get("errorId", 0) != 0:
                print(f"[CAPSOLVER] Erro reCAPTCHA polling: {result.get('errorDescription')}")
                return None
        return None
    except Exception as e:
        print(f"[CAPSOLVER] Erro reCAPTCHA: {e}")
        return None


def _solve_hcaptcha(site_url: str, site_key: str) -> str | None:
    """Resolve hCaptcha via CapSolver."""
    if not CAPSOLVER_API_KEY:
        return None
    try:
        resp = requests.post("https://api.capsolver.com/createTask", json={
            "clientKey": CAPSOLVER_API_KEY,
            "task": {
                "type": "HCaptchaTaskProxyLess",
                "websiteURL": site_url,
                "websiteKey": site_key,
            }
        }, timeout=30)
        data = resp.json()
        if data.get("errorId", 0) != 0:
            print(f"[CAPSOLVER] Erro hCaptcha: {data.get('errorDescription')}")
            return None

        task_id = data.get("taskId")
        if not task_id:
            return data.get("solution", {}).get("gRecaptchaResponse")

        for _ in range(60):
            time.sleep(3)
            r2 = requests.post("https://api.capsolver.com/getTaskResult", json={
                "clientKey": CAPSOLVER_API_KEY,
                "taskId": task_id,
            }, timeout=15)
            result = r2.json()
            if result.get("status") == "ready":
                return result.get("solution", {}).get("gRecaptchaResponse")
            if result.get("errorId", 0) != 0:
                return None
        return None
    except Exception as e:
        print(f"[CAPSOLVER] Erro hCaptcha: {e}")
        return None


# ═══════════════════════════════════════════════════════════════════════════
# FGTS/CRF — Caixa Econômica Federal
# Portal com ShieldSquare anti-bot. Playwright executa o JS challenge.
# ═══════════════════════════════════════════════════════════════════════════

def buscar_fgts_browser(cnpj_limpo: str, upload_dir: str) -> dict:
    """
    Busca CRF/FGTS no portal da Caixa via Playwright.
    ShieldSquare é anti-bot JS — Playwright com Chromium real executa o challenge.
    """
    resultado = _resultado_vazio()
    try:
        from playwright.sync_api import sync_playwright
        import re

        with sync_playwright() as p:
            # headless="new" é menos detectável por anti-bots que headless=True
            browser = p.chromium.launch(headless=True, args=[
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-features=IsolateOrigins,site-per-process",
            ])
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                viewport={"width": 1366, "height": 768},
                locale="pt-BR",
            )
            # Mascarar detecção de automação
            page = context.new_page()
            page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
                Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
                Object.defineProperty(navigator, 'languages', {get: () => ['pt-BR', 'pt', 'en-US', 'en']});
                window.chrome = {runtime: {}};
            """)

            print("[FGTS] Abrindo portal da Caixa...")
            page.goto("https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf", timeout=45000, wait_until="networkidle")

            # Aguardar ShieldSquare resolver e formulário aparecer
            try:
                page.wait_for_selector("#mainForm\\:txtInscricao1, input[id*='Inscricao'], input[id*='cnpj']", timeout=25000)
            except Exception:
                # Tentar esperar mais — ShieldSquare pode demorar
                page.wait_for_timeout(8000)
                # Verificar se página carregou
                content = page.content()
                if 'ShieldSquare' in content or 'distil' in content or len(content) < 2000:
                    resultado["mensagem"] = "FGTS: ShieldSquare bloqueou acesso automático. Upload manual necessário."
                    browser.close()
                    return resultado

            # O formulário usa ID "mainForm:txtInscricao1" para CNPJ
            # e "mainForm:btnConsultar" para o botão
            cnpj_fmt = f"{cnpj_limpo[:2]}.{cnpj_limpo[2:5]}.{cnpj_limpo[5:8]}/{cnpj_limpo[8:12]}-{cnpj_limpo[12:14]}"
            input_cnpj = page.query_selector("#mainForm\\:txtInscricao1, input[id*='Inscricao'], input[id*='cnpj'], input[name*='cnpj']")
            if not input_cnpj:
                resultado["mensagem"] = "FGTS: Campo CNPJ não encontrado no formulário."
                browser.close()
                return resultado

            # FGTS espera CNPJ sem formatação (só números) ou com pontuação
            input_cnpj.fill(cnpj_limpo)
            page.wait_for_timeout(500)

            # Clicar botão consultar
            btn = page.query_selector("#mainForm\\:btnConsultar, input[id*='btnConsultar'], input[type='button'], input[value*='Consultar'], button:has-text('Consultar')")
            if btn:
                btn.click()
            else:
                page.keyboard.press("Enter")

            # Aguardar resultado
            page.wait_for_timeout(3000)

            # Extrair resultado da página
            body_text = page.inner_text("body")

            if "REGULAR" in body_text.upper():
                resultado["sucesso"] = True
                resultado["mensagem"] = "FGTS/CRF: Situação REGULAR"
                resultado["data_vencimento"] = (date.today() + timedelta(days=30)).isoformat()

                # Tentar extrair número do CRF
                match = re.search(r'CRF[:\s]*(\d[\d./-]+)', body_text)
                if match:
                    resultado["numero"] = match.group(1).strip()

                # Tentar baixar PDF se disponível
                pdf_link = page.query_selector("a[href*='.pdf'], a:has-text('Imprimir'), a:has-text('PDF')")
                if pdf_link:
                    href = pdf_link.get_attribute("href")
                    if href:
                        os.makedirs(upload_dir, exist_ok=True)
                        filepath = os.path.join(upload_dir, f"fgts_crf_{cnpj_limpo}.pdf")
                        with page.expect_download() as download_info:
                            pdf_link.click()
                        download = download_info.value
                        download.save_as(filepath)
                        resultado["path_arquivo"] = filepath

                resultado["dados_extras"] = json.dumps({
                    "situacao": "REGULAR",
                    "cnpj": cnpj_fmt,
                    "data_consulta": date.today().isoformat(),
                    "metodo": "automático (Playwright + ShieldSquare bypass)",
                }, ensure_ascii=False)

            elif "IRREGULAR" in body_text.upper():
                resultado["mensagem"] = "FGTS/CRF: Situação IRREGULAR — empresa com pendências no FGTS"
                resultado["dados_extras"] = json.dumps({
                    "situacao": "IRREGULAR",
                    "cnpj": cnpj_fmt,
                    "data_consulta": date.today().isoformat(),
                }, ensure_ascii=False)
            else:
                resultado["mensagem"] = f"FGTS: Resultado não identificado. Texto: {body_text[:200]}"

            browser.close()

    except Exception as e:
        resultado["mensagem"] = f"FGTS: Erro na automação — {str(e)[:150]}"
        print(f"[FGTS] Erro: {e}")

    return resultado


# ═══════════════════════════════════════════════════════════════════════════
# TST/CNDT — Certidão Negativa de Débitos Trabalhistas
# Portal com captcha de imagem próprio.
# ═══════════════════════════════════════════════════════════════════════════

def buscar_tst_browser(cnpj_limpo: str, upload_dir: str) -> dict:
    """
    Busca CNDT no portal do TST via Playwright + CapSolver (captcha imagem).
    """
    resultado = _resultado_vazio()
    if not CAPSOLVER_API_KEY:
        resultado["mensagem"] = "TST: CapSolver não configurado. Upload manual necessário."
        return resultado

    try:
        from playwright.sync_api import sync_playwright
        import re

        cnpj_fmt = f"{cnpj_limpo[:2]}.{cnpj_limpo[2:5]}.{cnpj_limpo[5:8]}/{cnpj_limpo[8:12]}-{cnpj_limpo[12:14]}"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={"width": 1280, "height": 720},
            )
            page = context.new_page()
            body_text = ""

            # Tentar até 3 vezes (captcha pode ser lido errado)
            for tentativa in range(3):
                print(f"[TST] Tentativa {tentativa + 1}/3...")
                # Limpar cookies para pegar novo captcha
                context.clear_cookies()
                page.goto("https://cndt-certidao.tst.jus.br/gerarCertidao.faces", timeout=30000, wait_until="networkidle")
                page.wait_for_selector("#gerarCertidaoForm\\:cpfCnpj", timeout=15000)

                # Preencher CNPJ
                input_cnpj = page.query_selector("#gerarCertidaoForm\\:cpfCnpj")
                if not input_cnpj:
                    resultado["mensagem"] = "TST: Campo CNPJ não encontrado."
                    browser.close()
                    return resultado
                input_cnpj.fill(cnpj_fmt)

                # Resolver captcha via screenshot
                captcha_img = page.query_selector("#idImgBase64, img[alt*='aptcha']")
                if not captcha_img:
                    resultado["mensagem"] = "TST: Imagem captcha não encontrada."
                    browser.close()
                    return resultado

                captcha_bytes = captcha_img.screenshot()
                captcha_b64 = base64.b64encode(captcha_bytes).decode()
                print("[TST] Resolvendo captcha via CapSolver...")
                captcha_text = _solve_captcha_image(captcha_b64)

                if not captcha_text:
                    print(f"[TST] CapSolver não resolveu na tentativa {tentativa + 1}")
                    continue

                print(f"[TST] Captcha resolvido: {captcha_text}")
                input_captcha = page.query_selector("#idCampoResposta, input[name='resposta']")
                if input_captcha:
                    input_captcha.fill(captcha_text)

                # Submeter
                btn = page.query_selector("#gerarCertidaoForm\\:btnEmitirCertidao")
                if btn:
                    btn.click()
                else:
                    page.keyboard.press("Enter")

                page.wait_for_timeout(5000)
                body_text = page.inner_text("body")

                # Se captcha errado, tentar de novo
                if "inválido" in body_text.lower() or "invalido" in body_text.lower():
                    print(f"[TST] Captcha incorreto na tentativa {tentativa + 1}, tentando novamente...")
                    continue

                break  # Sucesso ou outro resultado

            if "EMITIDA COM SUCESSO" in body_text.upper() or ("NEGATIVA" in body_text.upper() and "NADA CONSTA" in body_text.upper()):
                resultado["sucesso"] = True
                resultado["mensagem"] = "CNDT: Certidão NEGATIVA — nada consta"
                resultado["data_vencimento"] = (date.today() + timedelta(days=180)).isoformat()

                # Extrair número
                match = re.search(r'Certid[aã]o\s*(?:n[ºo.]?\s*)?(\d[\d./-]+)', body_text, re.IGNORECASE)
                if match:
                    resultado["numero"] = match.group(1).strip()

                # Tentar baixar PDF
                os.makedirs(upload_dir, exist_ok=True)
                filepath = os.path.join(upload_dir, f"cndt_tst_{cnpj_limpo}.pdf")

                pdf_link = page.query_selector("a[href*='.pdf'], a:has-text('Imprimir'), a:has-text('PDF'), a:has-text('Certidão')")
                if pdf_link:
                    try:
                        with page.expect_download(timeout=10000) as download_info:
                            pdf_link.click()
                        download = download_info.value
                        download.save_as(filepath)
                        resultado["path_arquivo"] = filepath
                    except Exception:
                        # Tentar imprimir como PDF
                        page.pdf(path=filepath)
                        resultado["path_arquivo"] = filepath
                else:
                    # Salvar página como PDF
                    page.pdf(path=filepath)
                    resultado["path_arquivo"] = filepath

                resultado["dados_extras"] = json.dumps({
                    "tipo_certidao": "CNDT - Negativa",
                    "cnpj": cnpj_fmt,
                    "data_consulta": date.today().isoformat(),
                    "validade_dias": 180,
                    "metodo": "automático (Playwright + CapSolver)",
                }, ensure_ascii=False)

            elif "POSITIVA" in body_text.upper():
                resultado["mensagem"] = "CNDT: Certidão POSITIVA — existem débitos trabalhistas"
                resultado["dados_extras"] = json.dumps({
                    "tipo_certidao": "CNDT - Positiva",
                    "cnpj": cnpj_fmt,
                    "data_consulta": date.today().isoformat(),
                }, ensure_ascii=False)
            elif "captcha" in body_text.lower() or "incorreto" in body_text.lower():
                resultado["mensagem"] = "TST: Captcha incorreto. Tente novamente."
            else:
                resultado["mensagem"] = f"TST: Resultado não identificado. Texto: {body_text[:200]}"

            browser.close()

    except Exception as e:
        resultado["mensagem"] = f"TST: Erro na automação — {str(e)[:150]}"
        print(f"[TST] Erro: {e}")

    return resultado


# ═══════════════════════════════════════════════════════════════════════════
# SEFAZ Estadual — CND ICMS
# reCAPTCHA v2 (SP) ou hCaptcha (outros estados)
# ═══════════════════════════════════════════════════════════════════════════

def buscar_sefaz_browser(cnpj_limpo: str, uf: str, url_portal: str, upload_dir: str, inscricao_estadual: str = "") -> dict:
    """
    Busca CND Estadual na SEFAZ via Playwright + CapSolver (reCAPTCHA/hCaptcha).
    """
    resultado = _resultado_vazio()
    if not CAPSOLVER_API_KEY:
        resultado["mensagem"] = f"SEFAZ-{uf}: CapSolver não configurado. Upload manual necessário."
        return resultado

    if not url_portal:
        resultado["mensagem"] = f"SEFAZ-{uf}: URL do portal não configurada na fonte."
        return resultado

    try:
        from playwright.sync_api import sync_playwright
        import re

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={"width": 1280, "height": 720},
            )
            page = context.new_page()

            print(f"[SEFAZ-{uf}] Abrindo portal: {url_portal}")
            page.goto(url_portal, timeout=30000)
            page.wait_for_timeout(3000)

            # Preencher CNPJ — buscar campo genérico
            input_cnpj = page.query_selector(
                "input[id*='cnpj'], input[name*='cnpj'], input[id*='CNPJ'], "
                "input[placeholder*='CNPJ'], input[aria-label*='CNPJ']"
            )
            if input_cnpj:
                cnpj_fmt = f"{cnpj_limpo[:2]}.{cnpj_limpo[2:5]}.{cnpj_limpo[5:8]}/{cnpj_limpo[8:12]}-{cnpj_limpo[12:14]}"
                input_cnpj.fill(cnpj_fmt)

            # Preencher IE se disponível
            if inscricao_estadual:
                input_ie = page.query_selector(
                    "input[id*='inscri'], input[name*='inscri'], input[id*='IE'], "
                    "input[placeholder*='Inscri']"
                )
                if input_ie:
                    input_ie.fill(inscricao_estadual)

            # Detectar e resolver captcha
            page_content = page.content()
            token = None

            # reCAPTCHA v2
            recaptcha_match = re.search(r'data-sitekey=["\']([^"\']+)["\']', page_content)
            if recaptcha_match:
                site_key = recaptcha_match.group(1)
                print(f"[SEFAZ-{uf}] reCAPTCHA v2 detectado, sitekey={site_key[:20]}...")
                token = _solve_recaptcha_v2(url_portal, site_key)
                if token:
                    page.evaluate(f"""
                        document.getElementById('g-recaptcha-response').value = '{token}';
                        if (typeof ___grecaptcha_cfg !== 'undefined') {{
                            Object.entries(___grecaptcha_cfg.clients).forEach(([k,v]) => {{
                                Object.entries(v).forEach(([k2,v2]) => {{
                                    if (v2 && v2.onSuccess) v2.onSuccess('{token}');
                                }});
                            }});
                        }}
                    """)
                else:
                    resultado["mensagem"] = f"SEFAZ-{uf}: Falha ao resolver reCAPTCHA. Upload manual necessário."
                    browser.close()
                    return resultado

            # hCaptcha
            hcaptcha_match = re.search(r'data-sitekey=["\']([0-9a-f-]{36})["\']', page_content)
            if not recaptcha_match and hcaptcha_match:
                site_key = hcaptcha_match.group(1)
                print(f"[SEFAZ-{uf}] hCaptcha detectado, sitekey={site_key[:20]}...")
                token = _solve_hcaptcha(url_portal, site_key)
                if token:
                    page.evaluate(f"""
                        document.querySelector('[name="h-captcha-response"]').value = '{token}';
                        document.querySelector('[name="g-recaptcha-response"]').value = '{token}';
                    """)
                else:
                    resultado["mensagem"] = f"SEFAZ-{uf}: Falha ao resolver hCaptcha. Upload manual necessário."
                    browser.close()
                    return resultado

            # Submeter
            btn = page.query_selector(
                "input[type='submit'], button[type='submit'], "
                "button:has-text('Consultar'), button:has-text('Emitir'), "
                "input[value*='Consultar'], input[value*='Emitir']"
            )
            if btn:
                btn.click()
            else:
                page.keyboard.press("Enter")

            page.wait_for_timeout(5000)
            body_text = page.inner_text("body")

            if any(kw in body_text.upper() for kw in ["NEGATIVA", "REGULAR", "NADA CONSTA", "CERTIDÃO EMITIDA"]):
                resultado["sucesso"] = True
                resultado["mensagem"] = f"SEFAZ-{uf}: Certidão Negativa emitida"
                resultado["data_vencimento"] = (date.today() + timedelta(days=90)).isoformat()

                # Extrair número
                match = re.search(r'(?:Certid[aã]o|N[ºo.])\s*[:\s]*(\d[\d./-]+)', body_text, re.IGNORECASE)
                if match:
                    resultado["numero"] = match.group(1).strip()

                # Tentar baixar PDF
                os.makedirs(upload_dir, exist_ok=True)
                filepath = os.path.join(upload_dir, f"sefaz_{uf}_{cnpj_limpo}.pdf")

                pdf_link = page.query_selector("a[href*='.pdf'], a:has-text('Imprimir'), a:has-text('PDF')")
                if pdf_link:
                    try:
                        with page.expect_download(timeout=10000) as download_info:
                            pdf_link.click()
                        download = download_info.value
                        download.save_as(filepath)
                        resultado["path_arquivo"] = filepath
                    except Exception:
                        page.pdf(path=filepath)
                        resultado["path_arquivo"] = filepath
                else:
                    page.pdf(path=filepath)
                    resultado["path_arquivo"] = filepath

                resultado["dados_extras"] = json.dumps({
                    "uf": uf,
                    "tipo_certidao": "CND Estadual - ICMS",
                    "cnpj": cnpj_limpo,
                    "data_consulta": date.today().isoformat(),
                    "metodo": "automático (Playwright + CapSolver)",
                }, ensure_ascii=False)

            elif any(kw in body_text.upper() for kw in ["POSITIVA", "DÉBITO", "PENDÊNCIA"]):
                resultado["mensagem"] = f"SEFAZ-{uf}: Certidão POSITIVA — existem débitos estaduais"
            else:
                resultado["mensagem"] = f"SEFAZ-{uf}: Resultado não identificado. Texto: {body_text[:200]}"

            browser.close()

    except Exception as e:
        resultado["mensagem"] = f"SEFAZ-{uf}: Erro na automação — {str(e)[:150]}"
        print(f"[SEFAZ-{uf}] Erro: {e}")

    return resultado


# ═══════════════════════════════════════════════════════════════════════════
# CND Federal — e-CAC (Receita Federal)
# Login via certificado digital A1 (.pfx) ou login/senha gov.br
# ═══════════════════════════════════════════════════════════════════════════

def buscar_ecac_browser(cnpj_limpo: str, upload_dir: str, certificado_path: str = "", senha_cert: str = "", usuario: str = "", senha_login: str = "") -> dict:
    """
    Busca CND Federal via e-CAC com certificado digital A1 ou login gov.br.
    """
    resultado = _resultado_vazio()

    if not certificado_path and not usuario:
        resultado["mensagem"] = (
            "CND Federal: Cadastre certificado digital A1 (.pfx) ou login gov.br "
            "na fonte de certidão para automação. Acesse o e-CAC manualmente."
        )
        return resultado

    try:
        from playwright.sync_api import sync_playwright
        import re

        with sync_playwright() as p:
            browser_args = ["--no-sandbox"]

            # Configurar certificado digital se disponível
            if certificado_path and os.path.exists(certificado_path):
                print(f"[ECAC] Usando certificado digital: {certificado_path}")
                # Playwright suporta client certificates
                browser = p.chromium.launch(headless=True, args=browser_args)
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    client_certificates=[{
                        "origin": "https://cav.receita.fazenda.gov.br",
                        "pfxPath": certificado_path,
                        "passphrase": senha_cert,
                    }],
                )
            else:
                browser = p.chromium.launch(headless=True, args=browser_args)
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                )

            page = context.new_page()

            print("[ECAC] Abrindo e-CAC...")
            page.goto("https://cav.receita.fazenda.gov.br/autenticacao/login", timeout=30000)
            page.wait_for_timeout(3000)

            # Se usando certificado, autenticação é automática
            if certificado_path and os.path.exists(certificado_path):
                # Procurar link de certificado digital
                cert_link = page.query_selector("a:has-text('Certificado Digital'), a:has-text('certificado'), button:has-text('Certificado')")
                if cert_link:
                    cert_link.click()
                    page.wait_for_timeout(5000)
            elif usuario and senha_login:
                # Login gov.br
                print("[ECAC] Tentando login gov.br...")
                # Clicar em "gov.br" ou redirecionar
                govbr_link = page.query_selector("a:has-text('gov.br'), button:has-text('gov.br'), a[href*='sso.acesso.gov.br']")
                if govbr_link:
                    govbr_link.click()
                    page.wait_for_timeout(3000)

                # Preencher CPF
                input_cpf = page.query_selector("input[id*='cpf'], input[name*='accountId'], input[type='text']")
                if input_cpf:
                    input_cpf.fill(usuario)
                    # Clicar continuar
                    btn_continuar = page.query_selector("button:has-text('Continuar'), input[value*='Continuar'], button[type='submit']")
                    if btn_continuar:
                        btn_continuar.click()
                    page.wait_for_timeout(2000)

                # Preencher senha
                input_senha = page.query_selector("input[type='password']")
                if input_senha:
                    input_senha.fill(senha_login)
                    btn_entrar = page.query_selector("button:has-text('Entrar'), button[type='submit']")
                    if btn_entrar:
                        btn_entrar.click()
                    page.wait_for_timeout(5000)

                # Verificar se pediu 2FA
                body_text = page.inner_text("body")
                if any(kw in body_text.lower() for kw in ["autenticação em duas etapas", "2fa", "código de verificação", "token"]):
                    resultado["mensagem"] = (
                        "CND Federal: Login gov.br requer autenticação em duas etapas (2FA). "
                        "Configure certificado digital A1 para automação completa, ou faça upload manual."
                    )
                    browser.close()
                    return resultado

            # Verificar se logou com sucesso
            page.wait_for_timeout(3000)
            current_url = page.url
            body_text = page.inner_text("body")

            if "cav.receita.fazenda.gov.br" not in current_url and "ecac" not in current_url.lower():
                resultado["mensagem"] = "CND Federal: Falha no login. Verifique credenciais ou certificado."
                browser.close()
                return resultado

            # Navegar para emissão de certidão
            print("[ECAC] Logado, navegando para certidões...")
            # Buscar link de certidões
            cert_link = page.query_selector("a:has-text('Certidão'), a:has-text('certidão'), a[href*='certidao']")
            if cert_link:
                cert_link.click()
                page.wait_for_timeout(5000)

            body_text = page.inner_text("body")

            if any(kw in body_text.upper() for kw in ["NEGATIVA", "NADA CONSTA", "REGULAR"]):
                resultado["sucesso"] = True
                resultado["mensagem"] = "CND Federal: Certidão Negativa emitida"
                resultado["data_vencimento"] = (date.today() + timedelta(days=180)).isoformat()

                # Extrair número
                match = re.search(r'(?:Código|Número)[:\s]*(\w[\w./-]+)', body_text, re.IGNORECASE)
                if match:
                    resultado["numero"] = match.group(1).strip()

                # Baixar PDF
                os.makedirs(upload_dir, exist_ok=True)
                filepath = os.path.join(upload_dir, f"cnd_federal_{cnpj_limpo}.pdf")

                pdf_link = page.query_selector("a[href*='.pdf'], a:has-text('Imprimir'), button:has-text('PDF')")
                if pdf_link:
                    try:
                        with page.expect_download(timeout=10000) as download_info:
                            pdf_link.click()
                        download = download_info.value
                        download.save_as(filepath)
                        resultado["path_arquivo"] = filepath
                    except Exception:
                        page.pdf(path=filepath)
                        resultado["path_arquivo"] = filepath
                else:
                    page.pdf(path=filepath)
                    resultado["path_arquivo"] = filepath

                resultado["dados_extras"] = json.dumps({
                    "tipo_certidao": "CND Federal - Tributos Federais e Dívida Ativa",
                    "cnpj": cnpj_limpo,
                    "data_consulta": date.today().isoformat(),
                    "metodo": "automático (Playwright + certificado digital)" if certificado_path else "automático (Playwright + gov.br)",
                }, ensure_ascii=False)
            elif "POSITIVA" in body_text.upper():
                resultado["mensagem"] = "CND Federal: Certidão POSITIVA — existem débitos federais"
            else:
                resultado["mensagem"] = f"CND Federal: Não foi possível emitir. Faça upload manual."

            browser.close()

    except Exception as e:
        resultado["mensagem"] = f"CND Federal: Erro na automação — {str(e)[:150]}"
        print(f"[ECAC] Erro: {e}")

    return resultado
