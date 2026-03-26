#!/usr/bin/env python3
"""
Teste REAL de acesso HTTP às certidões públicas brasileiras.
CNPJ alvo: 62.164.030/0001-90 (QUANTICA IA LTDA)
Data: 2026-03-10
"""

import requests
import json
import time
from datetime import datetime

CNPJ_FORMATADO = "62.164.030/0001-90"
CNPJ_NUMEROS = "62164030000190"
TIMEOUT = 15

HEADERS_BROWSER = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}

def separador(titulo):
    print(f"\n{'='*80}")
    print(f"  {titulo}")
    print(f"{'='*80}")

def print_response_info(resp, label=""):
    """Imprime informações detalhadas de uma resposta HTTP."""
    print(f"\n--- {label} ---")
    print(f"  Status HTTP: {resp.status_code}")
    print(f"  URL final: {resp.url}")
    print(f"  Content-Type: {resp.headers.get('Content-Type', 'N/A')}")
    print(f"  Content-Length: {resp.headers.get('Content-Length', len(resp.content))}")
    print(f"  Content-Disposition: {resp.headers.get('Content-Disposition', 'N/A')}")
    print(f"  Set-Cookie presente: {'Sim' if 'Set-Cookie' in resp.headers else 'Nao'}")

    # Verificar se é PDF
    is_pdf = resp.content[:5] == b'%PDF-' if resp.content else False
    print(f"  Conteudo e PDF: {'SIM' if is_pdf else 'NAO'}")

    # Verificar captcha no HTML
    content_text = ""
    try:
        content_text = resp.text[:3000]
    except:
        content_text = resp.content[:3000].decode('utf-8', errors='replace')

    has_recaptcha = "recaptcha" in content_text.lower() or "g-recaptcha" in content_text.lower()
    has_captcha_img = "captcha" in content_text.lower()
    has_hcaptcha = "hcaptcha" in content_text.lower()

    print(f"  Tem reCAPTCHA: {'SIM' if has_recaptcha else 'NAO'}")
    print(f"  Tem captcha (generico): {'SIM' if has_captcha_img else 'NAO'}")
    print(f"  Tem hCaptcha: {'SIM' if has_hcaptcha else 'NAO'}")

    # Primeiros 500 chars do conteúdo
    print(f"\n  Conteudo (primeiros 500 chars):")
    preview = content_text[:500]
    print(f"  {preview}")

    return content_text


# ============================================================
# TESTE 1: CND Federal (Receita Federal / PGFN)
# ============================================================
def teste_1_cnd_federal():
    separador("TESTE 1: CND Federal (Receita Federal / PGFN)")
    url_base = "https://solucoes.receita.fazenda.gov.br/Servicos/certidaointernet/PJ/Emitir"

    session = requests.Session()
    session.headers.update(HEADERS_BROWSER)

    # 1a) GET na página principal
    print("\n[1a] GET na pagina principal...")
    try:
        r1 = session.get(url_base, timeout=TIMEOUT, allow_redirects=True)
        html = print_response_info(r1, "GET pagina principal")

        # Verificar se tem ViewState (ASP.NET)
        has_viewstate = "__VIEWSTATE" in html
        has_eventvalidation = "__EVENTVALIDATION" in html
        print(f"\n  Tem __VIEWSTATE: {'SIM' if has_viewstate else 'NAO'}")
        print(f"  Tem __EVENTVALIDATION: {'SIM' if has_eventvalidation else 'NAO'}")

        # Cookies obtidos
        print(f"  Cookies: {dict(session.cookies)}")

    except Exception as e:
        print(f"  ERRO: {type(e).__name__}: {e}")
        return

    # 1b) Tentar POST com CNPJ
    print("\n[1b] POST com CNPJ...")
    try:
        # Extrair ViewState e EventValidation se existirem
        import re
        viewstate = ""
        eventvalidation = ""

        if has_viewstate:
            m = re.search(r'__VIEWSTATE[^>]*value="([^"]*)"', html)
            if m:
                viewstate = m.group(1)
                print(f"  ViewState encontrado: {viewstate[:60]}...")

        if has_eventvalidation:
            m = re.search(r'__EVENTVALIDATION[^>]*value="([^"]*)"', html)
            if m:
                eventvalidation = m.group(1)
                print(f"  EventValidation encontrado: {eventvalidation[:60]}...")

        # Tentar encontrar campos de formulário
        inputs = re.findall(r'<input[^>]*name="([^"]*)"[^>]*value="([^"]*)"', html)
        print(f"  Campos de formulario encontrados: {len(inputs)}")
        for name, val in inputs[:15]:
            print(f"    {name} = {val[:80]}")

        # Montar dados do POST
        post_data = {}
        for name, val in inputs:
            post_data[name] = val

        # Adicionar CNPJ - tentar diferentes nomes de campo
        # Procurar campo de CNPJ no HTML
        cnpj_fields = re.findall(r'<input[^>]*name="([^"]*(?:[Cc][Nn][Pp][Jj]|[Nn][Ii]|[Dd]ocumento)[^"]*)"', html)
        print(f"  Campos possiveis de CNPJ: {cnpj_fields}")

        # Também procurar por id
        cnpj_ids = re.findall(r'id="([^"]*(?:[Cc][Nn][Pp][Jj]|[Nn][Ii]|[Dd]ocumento)[^"]*)"', html)
        print(f"  IDs possiveis de CNPJ: {cnpj_ids}")

        # Tentar o POST com dados comuns
        if cnpj_fields:
            for field in cnpj_fields:
                post_data[field] = CNPJ_NUMEROS
        else:
            # Tentar nomes comuns
            post_data["NI"] = CNPJ_NUMEROS
            post_data["txtCNPJ"] = CNPJ_NUMEROS

        post_headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": url_base,
            "Origin": "https://solucoes.receita.fazenda.gov.br",
        }

        r2 = session.post(url_base, data=post_data, headers=post_headers,
                         timeout=TIMEOUT, allow_redirects=True)
        html2 = print_response_info(r2, "POST com CNPJ")

        # Verificar se retornou certidão
        if r2.content[:5] == b'%PDF-':
            print("\n  >>> SUCESSO: Retornou PDF da certidao!")
        elif "certidao" in html2.lower() or "certidão" in html2.lower():
            print("\n  >>> Menciona 'certidao' na resposta")

    except Exception as e:
        print(f"  ERRO: {type(e).__name__}: {e}")


# ============================================================
# TESTE 2: CRF/FGTS (Caixa)
# ============================================================
def teste_2_crf_fgts():
    separador("TESTE 2: CRF/FGTS (Caixa Economica Federal)")
    url_base = "https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf"

    session = requests.Session()
    session.headers.update(HEADERS_BROWSER)

    # 2a) GET na página
    print("\n[2a] GET na pagina principal...")
    try:
        r1 = session.get(url_base, timeout=TIMEOUT, allow_redirects=True)
        html = print_response_info(r1, "GET pagina principal")

        # Verificar JSF ViewState
        import re
        has_viewstate = "javax.faces.ViewState" in html or "ViewState" in html
        print(f"\n  Tem javax.faces.ViewState: {'SIM' if has_viewstate else 'NAO'}")

        # Procurar por captcha/imagem de verificação
        captcha_imgs = re.findall(r'<img[^>]*(?:captcha|verificacao|validacao)[^>]*>', html, re.IGNORECASE)
        print(f"  Imagens de captcha: {captcha_imgs[:3]}")

        # Procurar campo de código de verificação
        verif_fields = re.findall(r'(?:codigo|verificacao|captcha|validacao)', html, re.IGNORECASE)
        print(f"  Mencoes a verificacao/captcha: {len(verif_fields)} ocorrencias")

        # Cookies
        print(f"  Cookies: {dict(session.cookies)}")

        # Procurar todos os inputs
        inputs = re.findall(r'<input[^>]*name="([^"]*)"', html)
        print(f"  Campos de formulario: {inputs[:15]}")

    except Exception as e:
        print(f"  ERRO: {type(e).__name__}: {e}")


# ============================================================
# TESTE 3: CNDT Trabalhista (TST)
# ============================================================
def teste_3_cndt_tst():
    separador("TESTE 3: CNDT Trabalhista (TST)")
    url_base = "https://cndt-certidao.tst.jus.br/gerarCertidao.faces"

    session = requests.Session()
    session.headers.update(HEADERS_BROWSER)

    # 3a) GET na página
    print("\n[3a] GET na pagina principal...")
    try:
        r1 = session.get(url_base, timeout=TIMEOUT, allow_redirects=True)
        html = print_response_info(r1, "GET pagina principal")

        import re

        # Verificar reCAPTCHA
        recaptcha_keys = re.findall(r'data-sitekey="([^"]*)"', html)
        print(f"\n  reCAPTCHA site keys: {recaptcha_keys}")

        # Verificar scripts de captcha
        captcha_scripts = re.findall(r'<script[^>]*(?:recaptcha|captcha|hcaptcha)[^>]*>', html, re.IGNORECASE)
        print(f"  Scripts de captcha: {captcha_scripts}")

        # Verificar presença de Google reCAPTCHA
        has_google_recaptcha = "google.com/recaptcha" in html or "gstatic.com/recaptcha" in html
        print(f"  Google reCAPTCHA script: {'SIM' if has_google_recaptcha else 'NAO'}")

        # Procurar campos de formulário
        inputs = re.findall(r'<input[^>]*name="([^"]*)"', html)
        print(f"  Campos de formulario: {inputs[:15]}")

        # ViewState JSF
        has_viewstate = "javax.faces.ViewState" in html
        print(f"  Tem javax.faces.ViewState: {'SIM' if has_viewstate else 'NAO'}")

        # Cookies
        print(f"  Cookies: {dict(session.cookies)}")

    except Exception as e:
        print(f"  ERRO: {type(e).__name__}: {e}")


# ============================================================
# TESTE 4: CND Federal via Receita - abordagem completa
# ============================================================
def teste_4_cnd_federal_completo():
    separador("TESTE 4: CND Federal - Analise COMPLETA")

    session = requests.Session()
    session.headers.update(HEADERS_BROWSER)

    import re

    # 4a) GET na página de emissão PJ
    url_emitir = "https://solucoes.receita.fazenda.gov.br/Servicos/certidaointernet/PJ/Emitir"
    print("\n[4a] GET pagina de emissao PJ...")
    try:
        r1 = session.get(url_emitir, timeout=TIMEOUT, allow_redirects=True)
        html = print_response_info(r1, "GET Emitir PJ")

        # Listar TODOS os redirects
        print(f"\n  Historico de redirects:")
        for i, resp in enumerate(r1.history):
            print(f"    [{i}] {resp.status_code} -> {resp.url}")
        print(f"    [final] {r1.status_code} -> {r1.url}")

        # Analisar formulários
        forms = re.findall(r'<form[^>]*action="([^"]*)"[^>]*method="([^"]*)"', html, re.IGNORECASE)
        print(f"\n  Formularios: {forms}")

        # Analisar TODOS os inputs detalhadamente
        all_inputs = re.findall(r'<input[^>]*>', html)
        print(f"\n  Total de <input>: {len(all_inputs)}")
        for inp in all_inputs[:20]:
            name = re.search(r'name="([^"]*)"', inp)
            type_ = re.search(r'type="([^"]*)"', inp)
            id_ = re.search(r'id="([^"]*)"', inp)
            val_ = re.search(r'value="([^"]*)"', inp)
            print(f"    name={name.group(1) if name else 'N/A'}, type={type_.group(1) if type_ else 'N/A'}, id={id_.group(1) if id_ else 'N/A'}, value={val_.group(1)[:50] if val_ else 'N/A'}")

        # Verificar JavaScript que pode bloquear
        js_blocks = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
        print(f"\n  Blocos <script>: {len(js_blocks)}")
        for i, js in enumerate(js_blocks[:5]):
            preview = js.strip()[:200]
            if preview:
                print(f"    [{i}] {preview}")

        # Verificar se há WAF/Cloudflare/etc
        server = r1.headers.get('Server', 'N/A')
        x_powered = r1.headers.get('X-Powered-By', 'N/A')
        print(f"\n  Server: {server}")
        print(f"  X-Powered-By: {x_powered}")

        # Todos os headers de resposta
        print(f"\n  Headers de resposta:")
        for k, v in r1.headers.items():
            print(f"    {k}: {v[:100]}")

    except Exception as e:
        print(f"  ERRO: {type(e).__name__}: {e}")
        return

    # 4b) Tentar POST direto com NI (campo comum da Receita)
    print("\n[4b] POST com NI (numero de inscricao)...")
    try:
        # Extrair dados do formulario
        post_data = {}
        for inp in all_inputs:
            name = re.search(r'name="([^"]*)"', inp)
            val = re.search(r'value="([^"]*)"', inp)
            if name:
                post_data[name.group(1)] = val.group(1) if val else ""

        # Definir o CNPJ
        post_data["NI"] = CNPJ_NUMEROS

        # Procurar botão de submit
        buttons = re.findall(r'<button[^>]*>|<input[^>]*type="submit"[^>]*>', html)
        print(f"  Botoes de submit: {buttons[:5]}")

        post_headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": url_emitir,
            "Origin": "https://solucoes.receita.fazenda.gov.br",
        }

        print(f"  Dados do POST: { {k: v[:50] for k, v in post_data.items()} }")

        r2 = session.post(url_emitir, data=post_data, headers=post_headers,
                         timeout=TIMEOUT, allow_redirects=True)
        html2 = print_response_info(r2, "POST com CNPJ")

        # Verificar resultado
        if r2.content[:5] == b'%PDF-':
            print("\n  >>> SUCESSO: Retornou PDF!")
            print(f"  Tamanho do PDF: {len(r2.content)} bytes")
        elif "Validar" in html2 or "validar" in html2:
            print("\n  >>> Parece ter link de validacao")

        # Procurar mensagens de erro
        errors = re.findall(r'class="[^"]*erro[^"]*"[^>]*>(.*?)<', html2, re.IGNORECASE)
        if errors:
            print(f"\n  Mensagens de erro: {errors[:5]}")

        # Procurar por link de PDF
        pdf_links = re.findall(r'href="([^"]*\.pdf[^"]*)"', html2, re.IGNORECASE)
        if pdf_links:
            print(f"\n  Links de PDF: {pdf_links}")

    except Exception as e:
        print(f"  ERRO: {type(e).__name__}: {e}")

    # 4c) Tentar endpoint alternativo - Consultar situação
    print("\n[4c] GET na pagina de Consultar...")
    try:
        url_consultar = "https://solucoes.receita.fazenda.gov.br/Servicos/certidaointernet/PJ/Consultar"
        r3 = session.get(url_consultar, timeout=TIMEOUT, allow_redirects=True)
        html3 = print_response_info(r3, "GET Consultar PJ")
    except Exception as e:
        print(f"  ERRO: {type(e).__name__}: {e}")


# ============================================================
# EXECUÇÃO
# ============================================================
if __name__ == "__main__":
    print(f"Inicio dos testes: {datetime.now().isoformat()}")
    print(f"CNPJ: {CNPJ_FORMATADO} ({CNPJ_NUMEROS})")
    print(f"Timeout: {TIMEOUT}s")

    teste_1_cnd_federal()
    time.sleep(1)

    teste_2_crf_fgts()
    time.sleep(1)

    teste_3_cndt_tst()
    time.sleep(1)

    teste_4_cnd_federal_completo()

    print(f"\n\n{'='*80}")
    print(f"  Fim dos testes: {datetime.now().isoformat()}")
    print(f"{'='*80}")
