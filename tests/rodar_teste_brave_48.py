#!/usr/bin/env python3
"""
Bateria de 48 testes de busca de editais via chat - Brave Search API
2 termos × 3 janelas × 2 encerrados × 4 fontes = 48 testes
"""
import requests
import json
import time
import re
import sys
from datetime import datetime

BASE_URL = "http://localhost:5007"

# ── Login ──
def login():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": "testebrave@test.com", "password": "teste123"})
    if r.status_code != 200:
        # Registrar se não existir
        r = requests.post(f"{BASE_URL}/api/auth/register",
                          json={"name": "Teste Brave", "email": "testebrave@test.com", "password": "teste123"})
    data = r.json()
    return data.get("access_token", "")


def criar_sessao(headers, titulo):
    """Cria uma sessão de chat e retorna o session_id."""
    r = requests.post(f"{BASE_URL}/api/sessions",
                      headers=headers,
                      json={"title": titulo},
                      timeout=10)
    if r.status_code in (200, 201):
        data = r.json()
        return data.get("session_id", data.get("id", ""))
    return ""

# ── Config ──
TERMOS = ["equip. medico", "medicamentos"]
JANELAS = [30, 60, 90]
ENCERRADOS = [False, True]
FONTES = ["PNCP", "ComprasNet", "Licitacoes-e", "Todas"]

def montar_prompt(termo, janela, encerrado, fonte):
    """Monta o prompt de busca no formato esperado pelo chat."""
    enc_txt = "incluindo encerrados" if encerrado else "sem incluir encerrados"

    if fonte == "Todas":
        fonte_txt = "em todas as fontes"
    elif fonte == "PNCP":
        fonte_txt = "na fonte PNCP"
    elif fonte == "ComprasNet":
        fonte_txt = "na fonte ComprasNet"
    elif fonte == "Licitacoes-e":
        fonte_txt = "na fonte Licitacoes-e"
    else:
        fonte_txt = f"na fonte {fonte}"

    return f"buscar editais de {termo} {fonte_txt} janela de {janela} dias {enc_txt}"


def extrair_total_editais(resp_text, resultado_obj=None):
    """Extrai o total de editais da resposta do chat."""
    # Primeiro tentar pelo objeto resultado (mais confiável)
    if resultado_obj and isinstance(resultado_obj, dict):
        editais = resultado_obj.get("editais", [])
        if isinstance(editais, list):
            n = len(editais)
            return n, "OK" if n > 0 else "ZERO"

    if not resp_text:
        return 0, "ERRO"

    # Padrões comuns de resposta
    patterns = [
        r'(\d+)\s*edital\(?i?s?\)?\s*encontrad',
        r'\*\*Resultados:\*\*\s*(\d+)',
        r'(\d+)\s*editais?\s*encontrad',
        r'encontr[aeio]+\s*(\d+)\s*editais?',
        r'total[:\s]*(\d+)',
        r'(\d+)\s*resultado',
        r'encontr[aeio]+\s*(\d+)\s*resultado',
        r'Encontrei\s*(\d+)',
        r'(\d+)\s*editais?\s*dispon',
        r'listando\s*(\d+)',
    ]

    for p in patterns:
        m = re.search(p, resp_text, re.IGNORECASE)
        if m:
            return int(m.group(1)), "OK" if int(m.group(1)) > 0 else "ZERO"

    # Se tem "nenhum" ou "não encontr"
    if re.search(r'nenhum|não encontr|nao encontr|sem resultado|0 editais|0 edital', resp_text, re.IGNORECASE):
        return 0, "ZERO"

    # Se tem resposta mas não conseguiu parsear
    if len(resp_text) > 50:
        return -1, "PARSE"

    return 0, "ERRO"


def rodar_testes():
    print("=" * 60)
    print("BATERIA DE 48 TESTES - BRAVE SEARCH API")
    print("=" * 60)

    token = login()
    if not token:
        print("ERRO: Não conseguiu fazer login!")
        sys.exit(1)

    print(f"Token obtido: {token[:30]}...")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    resultados = []
    total_ok = 0
    total_zero = 0
    total_erro = 0
    total_parse = 0
    total_timeout = 0
    brave_calls = 0
    pncp_calls = 0

    inicio_geral = time.time()

    for i, termo in enumerate(TERMOS):
        for j, janela in enumerate(JANELAS):
            for k, encerrado in enumerate(ENCERRADOS):
                for l, fonte in enumerate(FONTES):
                    num_teste = i * 24 + j * 8 + k * 4 + l + 1
                    prompt = montar_prompt(termo, janela, encerrado, fonte)

                    print(f"\n[{num_teste:02d}/48] {prompt}")

                    inicio = time.time()
                    try:
                        # Criar nova sessão para cada teste
                        session_id = criar_sessao(headers, f"Teste Brave {num_teste:03d}")
                        if not session_id:
                            print(f"  → ERRO: Não criou sessão")
                            total_erro += 1
                            resultados.append({"num": num_teste, "termo": termo, "janela": f"{janela}d", "encerrados": "Sim" if encerrado else "Não", "fonte": fonte, "total_editais": 0, "status": "ERRO", "tempo": "0s", "resposta_preview": ""})
                            continue

                        r = requests.post(
                            f"{BASE_URL}/api/chat",
                            headers=headers,
                            json={"message": prompt, "session_id": session_id},
                            timeout=120
                        )
                        elapsed = time.time() - inicio

                        if r.status_code == 200:
                            data = r.json()
                            resp_text = data.get("response", "") or data.get("response_text", "") or ""
                            resultado_obj = data.get("resultado", None)
                            total_editais, status = extrair_total_editais(resp_text, resultado_obj)

                            if status == "OK":
                                total_ok += 1
                            elif status == "ZERO":
                                total_zero += 1
                            elif status == "PARSE":
                                total_parse += 1
                            else:
                                total_erro += 1

                            print(f"  → {total_editais} editais | {status} | {elapsed:.1f}s")
                        else:
                            elapsed = time.time() - inicio
                            total_erro += 1
                            total_editais = 0
                            status = f"HTTP-{r.status_code}"
                            print(f"  → ERRO HTTP {r.status_code} | {elapsed:.1f}s")
                            resp_text = ""

                    except requests.exceptions.Timeout:
                        elapsed = time.time() - inicio
                        total_timeout += 1
                        total_editais = 0
                        status = "TIMEOUT"
                        resp_text = ""
                        print(f"  → TIMEOUT | {elapsed:.1f}s")

                    except Exception as e:
                        elapsed = time.time() - inicio
                        total_erro += 1
                        total_editais = 0
                        status = f"EXCEPT"
                        resp_text = ""
                        print(f"  → EXCEPTION: {e} | {elapsed:.1f}s")

                    resultados.append({
                        "num": num_teste,
                        "termo": termo,
                        "janela": f"{janela}d",
                        "encerrados": "Sim" if encerrado else "Não",
                        "fonte": fonte,
                        "total_editais": total_editais,
                        "status": status,
                        "tempo": f"{elapsed:.1f}s",
                        "resposta_preview": (resp_text[:200] if resp_text else ""),
                    })

    tempo_total = time.time() - inicio_geral

    # ── Contar chamadas Brave e PNCP do log ──
    try:
        with open("/tmp/backend.log", "r") as f:
            log = f.read()
            brave_calls = log.count("[SCRAPE-BRAVE]")
            pncp_calls = log.count("pncp.gov.br/api")
    except:
        pass

    # ── Gerar relatório Markdown ──
    gerar_relatorio(resultados, total_ok, total_zero, total_erro, total_timeout, total_parse,
                    brave_calls, pncp_calls, tempo_total)

    print(f"\n{'=' * 60}")
    print(f"FINALIZADO: {total_ok} OK | {total_zero} ZERO | {total_erro} ERRO | {total_timeout} TIMEOUT | {total_parse} PARSE")
    print(f"Brave API calls: {brave_calls} | PNCP API calls: {pncp_calls}")
    print(f"Tempo total: {tempo_total:.0f}s ({tempo_total/60:.1f} min)")
    print(f"Relatório: docs/TESTE_PROMPTS_CAPTACAO_BRAVE_0203.md")
    print(f"{'=' * 60}")


def gerar_relatorio(resultados, ok, zero, erro, timeout, parse, brave_calls, pncp_calls, tempo_total):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    total = len(resultados)

    md = f"""# Relatorio de Testes - Busca de Editais via Chat (Brave Search)

**Data:** {now}
**Servidor:** localhost:5007
**Executor:** Script automatizado Python (48 testes)
**API de Scraping:** Brave Search (SCRAPE_API=brave)
**Tempo total de execucao:** {tempo_total:.0f} segundos ({tempo_total/60:.1f} minutos)

---

## Resumo Executivo

| Metrica | Valor |
|---------|-------|
| Total de testes | {total} |
| Testes com resultados (OK) | {ok} |
| Testes sem resultados (0 editais) | {zero} |
| Testes com erro de execucao | {erro} |
| Testes com timeout | {timeout} |
| Testes com parse inconclusivo | {parse} |
| Chamadas Brave Search API | {brave_calls} |
| Chamadas PNCP Search API | {pncp_calls} |

### Resultado Geral

"""
    if ok == total:
        md += "**EXCELENTE** — Todos os {total} testes retornaram resultados.\n"
    elif ok >= total * 0.75:
        md += f"**BOM** — {ok}/{total} testes retornaram resultados ({ok*100//total}%).\n"
    elif ok >= total * 0.5:
        md += f"**REGULAR** — {ok}/{total} testes retornaram resultados ({ok*100//total}%).\n"
    else:
        md += f"**INSUFICIENTE** — Apenas {ok}/{total} testes retornaram resultados ({ok*100//total}%).\n"

    # Análise por fonte
    fontes_stats = {}
    for r in resultados:
        f = r["fonte"]
        if f not in fontes_stats:
            fontes_stats[f] = {"ok": 0, "zero": 0, "erro": 0, "total": 0}
        fontes_stats[f]["total"] += 1
        if r["status"] == "OK":
            fontes_stats[f]["ok"] += 1
        elif r["status"] == "ZERO":
            fontes_stats[f]["zero"] += 1
        else:
            fontes_stats[f]["erro"] += 1

    md += """
### Resultado por Fonte

| Fonte | OK | Zero | Erro | Total | Taxa |
|-------|----|----- |------|-------|------|
"""
    for f in ["PNCP", "ComprasNet", "Licitacoes-e", "Todas"]:
        s = fontes_stats.get(f, {"ok": 0, "zero": 0, "erro": 0, "total": 0})
        taxa = f"{s['ok']*100//s['total']}%" if s['total'] > 0 else "N/A"
        md += f"| {f} | {s['ok']} | {s['zero']} | {s['erro']} | {s['total']} | {taxa} |\n"

    md += """
---

## Tabela Completa de Resultados

| # | Termo | Janela | Encerrados | Fonte | Total Editais | Status |
|---|-------|--------|------------|-------|---------------|--------|
"""
    for r in resultados:
        te = r["total_editais"] if r["total_editais"] >= 0 else "?"
        md += f"| {r['num']:02d} | {r['termo']} | {r['janela']} | {r['encerrados']} | {r['fonte']} | {te} | {r['status']} |\n"

    md += f"""
---

## Comparacao com DuckDuckGo (teste anterior 0203)

| API | OK | Zero | Erro | Brave Calls | PNCP Calls |
|-----|----|----- |------|-------------|------------|
| DuckDuckGo | 24 | 24 | 0 | N/A | 552 |
| Brave | {ok} | {zero} | {erro} | {brave_calls} | {pncp_calls} |

---

## Configuracao

- SCRAPE_API=brave
- BRAVE_API_KEY=BSAaW3EKUnWUMMlqpAcW_kvDRp77IIB
- Brave Search: $5 credito/mes (~1000 queries gratis)
- Fontes configuradas: PNCP (API nativa), ComprasNet (Brave), Licitacoes-e (Brave), Todas (agregado)

---

*Gerado automaticamente por tests/rodar_teste_brave_48.py*
"""

    with open("docs/TESTE_PROMPTS_CAPTACAO_BRAVE_0203.md", "w", encoding="utf-8") as f:
        f.write(md)

    print(f"\nRelatório salvo em docs/TESTE_PROMPTS_CAPTACAO_BRAVE_0203.md")


if __name__ == "__main__":
    rodar_testes()
