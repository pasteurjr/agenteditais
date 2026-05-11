# COMO TESTAR AUTOMÁTICO COM CLAUDE — Validação Visual via testesvalidacoes

**Data:** 11/05/2026
**Para quê:** disparar testes automáticos no app **testesvalidacoes** que executam visualmente o **Facilicita.IA** (ou **Conexus**) passo-a-passo via Playwright, postando observações analíticas ancoradas em evidência real.

Este documento é o **prompt operacional** que o Claude precisa seguir para reproduzir o disparo automatizado feito em 11/05/2026 (testes `9e1fde05` Sprint 1 + `84bad20a` Sprint 2, 102+45 passos APROVADO).

---

## 0. Pré-requisitos verificados antes de começar

```bash
# 0.1 REST do testesvalidacoes deve estar UP (porta 5060)
curl -s -m 2 http://localhost:5060/api/projetos | head -c 50
# precisa retornar JSON ou erro de auth, NÃO connection refused

# 0.2 Frontend testesvalidacoes UP (porta 5181)
curl -s -m 2 http://pasteurjr.servehttp.com:5181/ | head -c 50

# 0.3 DISPLAY do user (geralmente :1) — para janelas Playwright headed aparecerem
echo $DISPLAY
xdpyinfo -display :1 | head -3

# 0.4 Apps sob teste ativos:
#   - Facilicita.IA: backend 5007 + frontend 5180 (banco editais)
#   - Conexus: backend 5003 + frontend 5176 (banco zarpa)
```

Se algum desses não estiver UP, parar e avisar o user.

---

## 1. Arquitetura — 4 processos em paralelo

Quando um teste roda, existem 4 processos cooperando:

| Processo | Onde | O que faz |
|---|---|---|
| **REST :5060** | `testes/framework_visual/api/server.py` (já rodando) | API de criação/listagem/início de testes |
| **Painel :9876** | `testes/framework_visual/painel.py` (sobe quando teste inicia, morre ao fim) | Controle do executor — pausar/aprovar/continuar, comentário por passo |
| **Executor Playwright** | `testes/framework_visual/executor_sprint1.py` (spawn pelo `/iniciar`) | Opera o browser do app sob teste (Facilicita ou Conexus) via Playwright headed. `headless=False` é hard-coded na linha 616 do executor. |
| **Aprovador analítico** | script Python externo (você cria em `/tmp/`) | Lê painel /estado, posta observação rica em /comentario, aprova /aprovar + continuar /continuar |

**Importante:** o executor TEM `headless=False` por padrão — a janela do browser aparece como `"frontend: Google Chrome for Testing"` no `DISPLAY=:1`. O user vê isso no desktop dele.

---

## 2. Credenciais e identificadores fixos

```
testesvalidacoes UI/REST:
  URL: http://pasteurjr.servehttp.com:5181 (front) / http://localhost:5060/api (REST)
  Login: pasteur@valida.com / 123456 (admin)
  NÃO usar arnaldo@valida.com para login UI — usar pasteur

Facilicita.IA (banco editais):
  projeto_id: 00000000-0000-0000-0000-000000000001
  Sprint 1 id: 00000000-0000-0000-0001-000000000001
  Sprint 2 id: 7de58c02-cbcc-44e2-bb60-7c6dbb83a458

Conexus:
  projeto_id: 86c7ff1c-6ae3-4e33-a904-47608bc51df2

MySQL testesvalidacoes (para o aprovador buscar checklist dos passos):
  host=camerascasas.no-ip.info port=3308 user=producao password=112358123 database=testesvalidacoes
```

---

## 3. Receita — 6 passos para disparar um teste

### Passo 3.1 — Limpar ambiente antes de começar

```bash
# Matar executor + painel órfãos
ps aux | grep -E "executor_sprint1|painel\.py" | grep -v grep | awk '{print $2}' | xargs -r kill 2>/dev/null
sleep 2
# Confirmar painel morto
curl -s -m 2 http://localhost:9876/estado 2>&1 | head -c 30 || echo "painel DOWN OK"
```

### Passo 3.2 — Script Playwright que cria + inicia o teste via UI (headed)

Modelo canônico: copiar `/tmp/disparar_v2.py` (Sprint 1) ou `/tmp/disparar_s2_v2.py` (Sprint >= 2 com teste base).

**Estrutura mínima do script:**

```python
from playwright.sync_api import sync_playwright
import time, json
from pathlib import Path

BASE = "http://pasteurjr.servehttp.com:5181"
EMAIL = "pasteur@valida.com"
SENHA = "123456"
TITULO = "TESTE <NOME UNICO> <DATA>"       # ex: "TESTE SPRINT3 V1 11/05"
SPRINT_LABEL = "Sprint 3"                  # texto que aparece no dropdown
# SE SPRINT >= 2, defina o teste base (id da rodada concluída anterior):
TESTE_BASE_TITULO = "TESTE SPRINT2 v8 11/05"
TESTE_BASE_ID     = "84bad20a-76ef-4a86-b8f4-bd59737776ae"

with sync_playwright() as p:
    # HEADED + slow_mo OBRIGATÓRIO — user precisa ver
    browser = p.chromium.launch(headless=False, slow_mo=600,
        args=['--window-position=20,20','--window-size=1500,950'])
    ctx = browser.new_context(viewport={"width":1500,"height":920})
    page = ctx.new_page()

    # 1. LOGIN
    page.goto(BASE, wait_until="networkidle", timeout=15000)
    page.fill('input[type="email"]', EMAIL)
    page.fill('input[type="password"]', SENHA)
    page.locator('button[type="submit"]').first.click()
    page.wait_for_url(lambda u:"/login" not in u, timeout=10000)
    page.wait_for_load_state("networkidle", timeout=8000)
    time.sleep(2)

    # 2. NOVO TESTE
    page.locator('a:has-text("Novo Teste"), a:has-text("Novo")').first.click()
    page.wait_for_load_state("networkidle"); time.sleep(2)

    # 3. TITULO — usa placeholder pra evitar pegar input errado
    page.get_by_placeholder("Ex: Smoke regressao Sprint 1 - dia 28/04").fill(TITULO)
    time.sleep(0.8)

    # 4. PROJETO (1o select)
    sel0 = page.locator('select').nth(0)
    opts = sel0.evaluate("el=>Array.from(el.options).map(o=>({v:o.value,t:o.textContent.trim()}))")
    for op in opts:
        if "Facilicita" in op['t']:   # ou "Conexus"
            sel0.select_option(value=op['v']); break
    time.sleep(2.5)

    # 5. SPRINT (2o select)
    page.wait_for_load_state("networkidle"); time.sleep(1.5)
    sel1 = page.locator('select').nth(1)
    opts = sel1.evaluate("el=>Array.from(el.options).map(o=>({v:o.value,t:o.textContent.trim()}))")
    for op in opts:
        if SPRINT_LABEL in op['t']:
            sel1.select_option(value=op['v']); break
    time.sleep(3)

    # 6. **TESTE BASE (3o select)** — APARECE SÓ SE SPRINT >= 2
    # SEM ISSO, Sprint 2+ arranca sem empresa cadastrada e UCs quebram com score=0!
    # Esperar o 3o select materializar:
    for _ in range(20):
        time.sleep(1)
        if page.locator('select').count() >= 3: break
    if page.locator('select').count() >= 3:
        sel_base = page.locator('select').nth(2)
        opts = sel_base.evaluate("el=>Array.from(el.options).map(o=>({v:o.value,t:o.textContent.trim()}))")
        for op in opts:
            if op['v'] == TESTE_BASE_ID or TESTE_BASE_TITULO in op['t']:
                sel_base.select_option(value=op['v']); break
        time.sleep(3)

    # 7. MARCAR TODOS
    page.wait_for_load_state("networkidle"); time.sleep(2)
    page.locator('button:has-text("Marcar todos")').first.click()
    time.sleep(2)

    # 8. CRIAR
    btn = page.locator('button:has-text("Criar Teste")').first
    btn.scroll_into_view_if_needed(); time.sleep(0.6); btn.click()
    page.wait_for_load_state("networkidle"); time.sleep(4)

    # 9. CAPTURAR teste_id
    teste_id = page.url.rsplit("/teste/",1)[1].split("/")[0].split("?")[0] if "/teste/" in page.url else None
    print(f">>> teste_id={teste_id}")

    # 10. INICIAR
    page.goto(f"{BASE}/teste/{teste_id}", wait_until="networkidle", timeout=15000)
    time.sleep(3)
    for sel in ['button:has-text("Iniciar Execução")','button:has-text("Iniciar")','button:has-text("▶")']:
        l = page.locator(sel).first
        if l.count() > 0 and l.is_visible():
            l.click(); print(f"INICIADO via {sel}"); time.sleep(6); break

    # MANTER browser vivo enquanto teste roda
    time.sleep(3600)
    browser.close()
```

Rodar:
```bash
DISPLAY=:1 nohup python3 -u /tmp/disparar_<sprint>.py > /tmp/disparar_<sprint>.log 2>&1 &
```

### Passo 3.3 — Aguardar painel :9876 subir

```bash
until curl -s -m 2 http://localhost:9876/estado >/dev/null 2>&1; do sleep 2; done
echo "PAINEL UP"
curl -s http://localhost:9876/estado | python3 -c "
import sys,json
d=json.load(sys.stdin)
p=d.get('passo_atual') or {}
print('estado:',d.get('estado'),'uc:',d.get('uc_id'),'passo:',p.get('passo_id'))"
```

### Passo 3.4 — Subir o aprovador analítico

Copiar `/tmp/aprovador_s1_s2_1105.py` como base. Conteúdo essencial:

```python
import json, time, urllib.request, re
from pathlib import Path
import pymysql

PAINEL = "http://localhost:9876"
MYSQL = dict(host="camerascasas.no-ip.info", port=3308, user="producao",
             password="112358123", database="testesvalidacoes",
             charset="utf8mb4", cursorclass=pymysql.cursors.DictCursor)
OUT = Path("/tmp/aprovador_logs"); OUT.mkdir(parents=True, exist_ok=True)

def get_estado():
    return json.loads(urllib.request.urlopen(f"{PAINEL}/estado", timeout=5).read())

def post(p, b=b"{}"):
    req = urllib.request.Request(f"{PAINEL}{p}", data=b,
        headers={"Content-Type":"application/json"})
    urllib.request.urlopen(req, timeout=5).read()

def comentar(t):
    try: post("/comentario", json.dumps({"texto": t}).encode())
    except: pass

def buscar_passo(uc_raw, passo_id, cn):
    """Busca o passo no banco testesvalidacoes pra recuperar descricao/checklist."""
    m = re.search(r"UC-(F|CV|AT|CR|CL|DI|MA|HC|AU|ARN|M\d)\d+", uc_raw or "")
    uc_id = m.group(0) if m else uc_raw
    with cn.cursor() as cur:
        cur.execute("""SELECT pt.descricao_painel, pt.pontos_observacao, pt.titulo
                       FROM passos_tutorial pt
                       JOIN casos_de_teste ct ON ct.id=pt.caso_de_teste_id
                       JOIN casos_de_uso uc ON uc.id=ct.caso_de_uso_id
                       WHERE uc.uc_id=%s AND pt.passo_id=%s LIMIT 1""", (uc_id, passo_id))
        return cur.fetchone()

def gerar_obs(uc_raw, passo_id, vauto, det, resultado, db_p):
    """Observação ancorada em evidência real: NÃO usar template fixo.

    INCLUIR:
    - veredito_automatico (APROVADO/REPROVADO/INCONCLUSIVO)
    - resultado_acao (string retornada pelo evaluate)
    - acao_erro (se houve throw)
    - asserts DOM/rede que passaram (com seletores e URLs reais)
    - checklist do banco (pontos_observacao do passo)
    - obs Arnaldo cobertas (regex F0[1-5]-NN no descricao_painel)
    """
    m = re.search(r"UC-(F|CV|ARN|M\d)\d+", uc_raw or "")
    uc_id = m.group(0) if m else uc_raw
    L = [f"[CLAUDE <DATA>] UC={uc_id} | PASSO={passo_id}"]
    if db_p and db_p.get('titulo'): L.append(f"TITULO: {db_p['titulo'][:120]}")
    L.append(f"VEREDITO AUTOMATICO: {vauto}")
    if resultado: L.append(f"RESULTADO: {str(resultado)[:200]}")
    erro = (det or {}).get("acao_erro")
    if erro: L.append(f"ERRO: {str(erro)[:200]}")
    dom = (det or {}).get("dom") or {}; rede = (det or {}).get("rede") or {}
    dom_ok = [a for a in dom.get("asserts",[]) if a.get("ok")]
    rede_ok = [a for a in rede.get("asserts",[]) if a.get("ok")]
    if dom_ok: L.append(f"DOM ({len(dom_ok)}): " + " | ".join((a.get("selector") or "?")[:60] for a in dom_ok[:3]))
    if rede_ok: L.append(f"REDE ({len(rede_ok)}): " + " | ".join(f"{a.get('url_contem','?')[:50]}[{a.get('status_real','?')}]" for a in rede_ok[:3]))
    if db_p:
        pts = []
        try:
            r = db_p.get('pontos_observacao') or "[]"
            p = json.loads(r) if r else []
            if isinstance(p, list): pts = p
        except: pass
        if pts:
            L.append(f"--- CHECKLIST ({len(pts)}) ---")
            for p in pts[:6]: L.append(f"• {str(p)[:130]}")
    return "\n".join(L)

print("APROVADOR iniciado", flush=True)
cn = pymysql.connect(**MYSQL)
last = None; erros = 0; n = 0
while True:
    try: est = get_estado(); erros = 0
    except:
        erros += 1
        if erros > 8: print("[painel down — fim]"); break
        time.sleep(3); continue
    estado = est.get("estado")
    passo = est.get("passo_atual") or {}
    pid = passo.get("passo_id") or "?"
    uc_raw = est.get("uc_id") or est.get("ct_id") or ""
    vauto = passo.get("veredito_automatico")
    det = passo.get("detalhes_validacao") or {}
    res = passo.get("resultado_acao") or det.get("resultado_acao")
    if estado == "concluido":
        print(f"========== CONCLUIDO ({n} passos) =========="); break
    cur = f"{uc_raw}|{pid}"
    if estado in ("pausado","terminado") and cur != last and vauto:
        n += 1
        db_p = buscar_passo(uc_raw, pid, cn)
        obs = gerar_obs(uc_raw, pid, vauto, det, res, db_p)
        print(f"[{n:03d}] {uc_raw} | {pid} -> {vauto}", flush=True)
        comentar(obs); time.sleep(2)
        try: post("/aprovar"); time.sleep(1); post("/continuar")
        except: pass
        last = cur; time.sleep(2)
    else: time.sleep(2)
cn.close()
```

Rodar:
```bash
DISPLAY=:1 nohup python3 -u /tmp/aprovador_<data>.py > /tmp/aprovador_<data>.log 2>&1 &
```

### Passo 3.5 — Monitorar

```bash
# A) estado do teste via REST
curl -s -b /tmp/tv_cookies.txt "http://localhost:5060/api/testes/<teste_id>" | \
  python3 -c "import sys,json; t=json.load(sys.stdin).get('teste',{}); print('estado:',t.get('estado'),'concluido_em:',t.get('concluido_em'))"

# B) últimos passos aprovados
tail -20 /tmp/aprovador_<data>.log

# C) painel atual
curl -s http://localhost:9876/estado | \
  python3 -c "import sys,json; d=json.load(sys.stdin); p=d.get('passo_atual') or {}; print('estado:',d.get('estado'),'uc:',d.get('uc_id'),'passo:',p.get('passo_id'))"
```

### Passo 3.6 — Quando concluir

- Painel `:9876` morre sozinho (aprovador detecta e sai)
- Estado do teste: `concluido`
- Para Sprint seguinte: repete 3.1 a 3.5 com novo título + `TESTE_BASE_ID` = id do teste recém-concluído

---

## 4. Regras INVIOLÁVEIS — não fugir disto

### 4.1 — Login UI = `pasteur@valida.com` SEMPRE

NÃO usar `arnaldo@valida.com`, `valida<N>@valida.com.br` ou qualquer outro. `pasteur` é admin no testesvalidacoes.

### 4.2 — `headless=False` no Playwright disparador

User precisa VER. `slow_mo=600` na `chromium.launch()`. Janela com `--window-position=20,20 --window-size=1500,950`.

### 4.3 — Sprint >= 2 → SELECIONAR TESTE BASE (3º select)

Form de Novo Teste tem 3 selects quando sprint > 1:
1. Projeto
2. Sprint
3. **Teste base** (lista testes concluídos da sprint anterior)

**SEM teste base, Sprint 2+ arranca SEM empresa cadastrada → score=0 em todos os UCs.** Tutorial Sprint 2 V8 cita explicitamente "continua os dados criados na Sprint 1 V8".

O 3º select aparece SÓ depois que você seleciona Sprint 2+, então tem que esperar (loop até `page.locator('select').count() >= 3`).

### 4.4 — Observações ANCORADAS EM EVIDÊNCIA REAL

NÃO usar template fixo de "8 critérios" ou "problemas pré-escritos por categoria". A obs DEVE ser derivada de:
- `veredito_automatico` (APROVADO/REPROVADO/INCONCLUSIVO)
- `resultado_acao` (string que o evaluate retornou)
- `acao_erro` (se houve throw)
- `detalhes_validacao.dom.asserts` que passaram (selectors reais)
- `detalhes_validacao.rede.asserts` que passaram (URLs + status reais)
- `pontos_observacao` do banco (checklist do passo)

Veja seção 3.4 — função `gerar_obs()` é a referência.

### 4.5 — NÃO usar curl pra criar/iniciar testes

Tem que ser via UI testesvalidacoes (Playwright headed). Curl bypassa o fluxo visível que o user quer ver.

### 4.6 — Não matar processos do user sem perguntar

Antes de `kill <pid>` em executor/painel, confirmar com user se está rodando algo que ele quer terminar.

---

## 5. Arquivos de referência (copiar/adaptar)

| Arquivo | O que é |
|---|---|
| `/tmp/disparar_v2.py` | Disparador Sprint 1 (sem teste base) |
| `/tmp/disparar_s2_v2.py` | Disparador Sprint 2+ (com teste base — 3º select) |
| `/tmp/aprovador_s1_s2_1105.py` | Aprovador analítico que postou as obs reais em 11/05 |
| `/tmp/run_v8s2_final.py` | Versão anterior do aprovador (Sprint 2 V8 08/05) |
| `/tmp/operar_ui_testesvalida.py` | Modelo original com 3 selects (Sprint 10 Arnaldo 07/05) |
| `testes/framework_visual/executor_sprint1.py` | Executor que opera o app sob teste — `headless=False` linha 616 |
| `testes/framework_visual/api/server.py` | REST :5060 — endpoints `/api/testes` (POST cria), `/api/testes/:id/iniciar` |

---

## 6. Validar antes de reportar "concluído"

Ao final do teste:

```bash
# Quantos APROVADO vs REPROVADO vs INCONCLUSIVO
grep -E "-> APROVADO|-> REPROVADO|-> INCONCLUSIVO" /tmp/aprovador_<data>.log | \
  awk '{print $NF}' | sort | uniq -c

# Verificar no banco que as observações foram salvas
mysql -h camerascasas.no-ip.info -P3308 -uproducao -p112358123 testesvalidacoes -e "
SELECT COUNT(*) AS obs_postadas FROM observacoes_passos
WHERE teste_id='<teste_id>' AND observacao LIKE '%CLAUDE%'"

# Estado final
curl -s -b /tmp/tv_cookies.txt "http://localhost:5060/api/testes/<teste_id>" | \
  python3 -c "import sys,json; t=json.load(sys.stdin).get('teste',{}); print(t.get('estado'),t.get('concluido_em'))"
```

Reportar ao user:
- Teste ID
- Hora de início → fim
- N de passos APROVADO/REPROVADO/INCONCLUSIVO
- URL para revisão: `http://pasteurjr.servehttp.com:5181/teste/<teste_id>`

---

## 7. Histórico — testes já rodados via esta receita

| Data | Teste ID | Título | Passos | Resultado |
|---|---|---|---|---|
| 07/05 | múltiplos UC-ARN | Sprint 10 Arnaldo (25 UCs) | ~75 | 25/25 CTs aprovados |
| 08/05 | tutorialsprint2 V8 S2 | Sprint 2 V8 piloto | ~80 | rodada de feedback |
| 09/05 | b0155fe0 | TESTE SPRINT 1 CONEXUS (M1) | 120 | 23/23 CTs (7 REPROVADO em passo_04) |
| **11/05** | **9e1fde05** | **TESTE SPRINT1 V8 11/05** | **102** | **TODOS APROVADO** |
| **11/05** | **84bad20a** | **TESTE SPRINT2 v8 11/05** (teste_base=9e1fde05) | **45** | **mix APROVADO/INCONCLUSIVO** |

---

## 8. Quando NÃO seguir esta receita

- Conexus (não Facilicita): mesma receita, mas trocar projeto_id e usar Funções M1..AG (mapeadas em sprints.numero 1..7). Detalhes em `zarpa-prototype/v4/docs/INSTRUCOESTESTESVALIDACOES.md`.
- Trilha humana (Arnaldo manual): este documento NÃO se aplica — é tutorial em prosa.
- Trilha E2E headless (CI/regressão): pode usar `headless=True`, mas user quer ver — só usar headless se explicitamente pedido.

---

**Fim. Em caso de dúvida, ler os arquivos de referência na seção 5 antes de inventar.**
