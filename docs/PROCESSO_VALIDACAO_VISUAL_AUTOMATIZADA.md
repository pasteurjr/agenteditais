# Processo de Validação Visual Automatizada (Claude Code)

**Versão:** 1.0
**Data:** 2026-04-30
**Autor:** Claude Opus 4.7 + pasteurjr
**Origem:** sessão de validação UC-F01 + UC-F13 + UC-F02 que rodou 40/40 passos sem reprovar

---

## Quando usar

Quando precisar validar **end-to-end** um conjunto de UCs com:

1. **Tutoriais visuais já cadastrados** no banco `testesvalidacoes` (passos com asserts DOM + screenshots)
2. **Confiança visual real**: cada tela deve ser conferida por uma inteligência (humano OU Claude com `Read` em screenshot) que compare o que apareceu com o que foi descrito em `pontos_observacao`
3. **Observações salvas** em cada passo, formando trilha de auditoria

Esse processo é **complementar** ao `/validar-uc` automatizado:
- `/validar-uc` = pipeline (DOM + rede + juiz semântico LLM em texto)
- Este processo = Claude operando o app testesvalidacoes interativamente, lendo cada screenshot, postando observação textual, aprovando/reprovando passo a passo

Ideal para:
- Validação de tutoriais novos antes de entregar ao validador humano (Arnaldo)
- Smoke teste rico após mudanças grandes em UCs predecessores (UC-F01, UC-F13)
- Cross-check entre execução automatizada e olhar humano

---

## Pré-requisitos antes de começar

| Item | Como verificar |
|---|---|
| Backend `testesvalidacoes` rodando | `curl -s http://localhost:5060/healthz` retorna `{"ok":true}` |
| Frontend `testes_validacoes_ui` rodando | `curl -s http://localhost:5181/` retorna HTML |
| App `agenteditais` rodando (frontend :5180 + backend :5007) | login com pasteur@valida.com.br/123456 funciona |
| Tutoriais cadastrados no banco | `python3 testes/framework_visual/seed/importar_tutorial_uc_f<N>.py` rodou e disse "X passos cadastrados" |
| UCs predecessores resolvidos | Ver seção 1.1 e 1.2 de `PROCESSO_CADASTRO_UC_NO_BANCO.md` (hierarquia + sidebar idempotente) |
| Sem teste anterior em estado "executando" ou "pausado" | `UPDATE testes SET pid_executor=NULL, estado='cancelado' WHERE estado IN ('executando','pausado')` |
| Sem executor zumbi rodando | `pkill -f executor_sprint1; pkill -f "framework_visual/painel"` |

---

## Diretrizes

### 1. O script de loop fica em `/tmp/run_test.py`

Padrão fixo, reutilizável entre sessões. Salva em `/tmp/` (não no repo).

**Responsabilidades:**

1. Polling do painel `:9876` em `/estado` a cada 2s
2. Quando `estado == "pausado"`:
   - Postar `[CLAUDE-AUTO]` ou `[CLAUDE-VISUAL]` em `/comentario`
   - Aprovar com `/aprovar` (`{"veredicto": "APROVADO"}` ou `"REPROVADO"`)
   - Continuar com `/continuar`
3. Quando `estado == "concluido"` → `sys.exit(0)`
4. Quando 5 erros consecutivos `Connection refused` → assumir CONCLUIDO (painel cai ao fim do teste) → `sys.exit(0)`
5. Quando o mesmo passo aparece pausado >5 vezes seguidas → `sys.exit(5)` "STUCK"
6. Quando `vauto == "REPROVADO"` → comentar com detalhes do erro, reprovar e parar (`sys.exit(3)`)

**Template do script:** ver final deste documento (seção "Script template").

### 2. Modo A (rápido, automatizado) vs Modo B (visual real, descritivo)

**Modo A — observação automática:**
- Script roda sozinho em background (`nohup python3 -u /tmp/run_test.py > /tmp/run_log.txt 2>&1 &`)
- Comentário gerado a partir de `pontos_observacao` + asserts DOM (sem ler imagem)
- Tempo: ~2-3 min para 40 passos
- Bom para: smoke regressão depois de mudança em código, validação rápida CI-like

**Modo B — observação visual real:**
- Claude ativo na conversa, lendo cada screenshot via `Read`
- Comparando visualmente com `pontos_observacao` esperados
- Comentário descritivo de **o que apareceu na tela** (não só o que devia aparecer)
- Tempo: ~10-20 min para 40 passos
- Bom para: validação de tutorial novo, primeira vez que um UC roda end-to-end, confirmar comportamento esperado

**Regra prática:** rodar A primeiro (rápido, valida pipeline). Se A passar, decidir se vale rodar B (custoso). Se A falhar, **ir direto pra B** investigando o passo que deu REPROVADO.

### 3. Antes de criar um teste novo, sempre limpar zumbis

```bash
pkill -f executor_sprint1 2>/dev/null
pkill -f "framework_visual/painel" 2>/dev/null
sleep 2
python3 -c "
import sys; sys.path.insert(0, 'testes/framework_visual')
from db.engine import get_db
from sqlalchemy import text
db = get_db()
db.execute(text(\"UPDATE testes SET pid_executor=NULL, estado='cancelado' WHERE pid_executor IS NOT NULL OR estado IN ('executando','pausado')\"))
db.commit()
"
```

Sem isso, o backend retorna 409 "Já há outro teste rodando".

### 4. Login e seleção dos UCs (sempre via API REST)

```bash
COOKIES=/tmp/cookies_pasteur.txt
# Login
curl -s -c "$COOKIES" -X POST http://localhost:5060/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pasteur@valida.com.br","senha":"123456"}'

# Listar UCs executaveis da sprint
SPRINT_ID="00000000-0000-0000-0001-000000000001"  # Sprint 1
curl -s -b "$COOKIES" "http://localhost:5060/api/sprints/$SPRINT_ID/ucs-resumo" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); [print(u['id'], u['uc_id']) for u in d['ucs'] if u['executavel']]"

# Criar teste com UCs (lista de UUID)
RESP=$(curl -s -b "$COOKIES" -X POST http://localhost:5060/api/testes \
  -H "Content-Type: application/json" \
  -d '{"titulo":"...","sprint_id":"...","uc_ids":["uuid1","uuid2","uuid3"]}')
TESTE_ID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['teste_id'])")

# Iniciar
curl -s -b "$COOKIES" -X POST "http://localhost:5060/api/testes/$TESTE_ID/iniciar"
```

### 5. Ordem dos UCs no teste

O backend faz **ordenação topológica** por predecessores `depends`. Você passa UCs em qualquer ordem, ele resolve. Ex: passar `[F02, F13, F01]` → executor roda `F01 → F13 → F02` (porque F02 depende de F13 que depende de F01).

### 6. Encontrar a pasta de evidências do teste

Cada teste cria pasta com nome `teste_<8chars>_<timestamp>` em `testes/relatorios/visual/`:

```bash
ls -lat testes/relatorios/visual/ | head -3
# Ou direto pelo prefixo do teste_id:
TID_PREFIX=$(echo $TESTE_ID | cut -c1-8)
realpath testes/relatorios/visual/teste_${TID_PREFIX}_*/
```

Cada passo gera 2 PNGs:
- `<CT_ID>_<passo_id>_before.png` (antes da ação)
- `<CT_ID>_<passo_id>_after.png` (depois da ação)

Para Modo B, **sempre ler o `_after.png`** (mostra o estado pós-ação).

### 7. Seletores robustos para `pontos_observacao`

A descrição em `pontos_observacao` (cadastrada no tutorial) é a **fonte da verdade do que esperar na tela**. No Modo B:

1. Ler cada item da lista `pontos_observacao`
2. Confirmar visualmente no screenshot
3. Marcar ✅ ou ⚠️/❌ no comentário

Exemplo de comentário rico (Modo B):
```
[CLAUDE-VISUAL] Login (FA-07 entrada). Heading "Você não tem empresas vinculadas" centralizado ✅.
3 botões empilhados visíveis: Criar Nova Empresa (azul) ✅, Vincular Empresa a Usuário (roxo) ✅,
Entrar no Sistema (banco vazio) (cinza-verde) ✅. Botão Sair embaixo ✅.
Subtitulo "Como superusuário, você pode escolher uma das opções abaixo" ✅. APROVADO.
```

### 8. Quando aprovar mesmo com `vauto == INCONCLUSIVO`

Se o passo tem só uma ação (ex: click, fill) sem assert DOM definido, o veredito automático fica `INCONCLUSIVO`. Isso **não é erro** — significa que a ação executou sem exception, mas o tutorial não definiu assert pra validar.

**Política:** aprovar `INCONCLUSIVO` por padrão se:
- O screenshot mostra a tela esperada (Modo B)
- A próxima ação faz sentido (ex: "Novo" foi clicado → próximo passo preenche o form)

Reprovar `INCONCLUSIVO` apenas se a tela visualmente está errada.

### 9. Quando o `vauto == REPROVADO`

**Não aprovar.** Ler `detalhes_validacao.acao_erro` ou `detalhes_validacao.dom.asserts` (lista com `ok: false`). Postar comentário com:
- O que estava esperado
- O que apareceu
- Hipótese de causa raiz

Sair com exit 3. Investigar o tutorial, ajustar, reimportar, rodar de novo.

### 10. Cuidados com ações longas (digitação tecla-a-tecla)

Passos que preenchem muitos campos (ex: UC-F01 passo_03 — 13 campos com `press_sequentially` + `delay_por_tecla=50ms`) demoram **~50s**. O loop de monitoramento deve aguardar `estado != "executando"` antes de tentar aprovar — caso contrário aprova prematuramente.

O template já trata isso: enquanto `estado == "executando"`, faz `time.sleep(1)` e continua o loop sem agir.

### 11. Quando o teste termina, o painel `:9876` fecha

Ao final do teste (todos os passos aprovados/reprovados), o `executor_sprint1.py` encerra o servidor Flask do painel `:9876`. O loop começa a receber `Connection refused`. Detectar isso = teste concluído.

```python
erros_consec = 0
while True:
    try:
        e = get_estado()
        erros_consec = 0
    except Exception:
        erros_consec += 1
        if erros_consec > 5:
            print("[painel caiu — assumindo CONCLUIDO]")
            sys.exit(0)
        time.sleep(2)
        continue
```

### 12. Confirmar resultado no banco da aplicação

Sempre **validar dados criados** depois do teste, não só pela métrica de "passos aprovados". Exemplo:

```python
import mysql.connector
conn = mysql.connector.connect(host='camerascasas.no-ip.info', port=3308,
                               user='producao', password='112358123', database='editais')
c = conn.cursor()
c.execute("SELECT id, razao_social, area_padrao_id FROM empresas WHERE razao_social LIKE 'DEMO <prefix>%'")
print(c.fetchone())
```

Empresas criadas via `_provisionar_ciclo` recebem nome `DEMO <prefix>` onde `<prefix>` = primeiros 8 chars do `teste_id`.

### 13. Métricas finais sempre via banco testesvalidacoes

```python
import sys; sys.path.insert(0, 'testes/framework_visual')
from db.engine import get_db
from sqlalchemy import text
db = get_db()
db.execute(text("""
  SELECT u.uc_id, ct.ct_id, COUNT(*) AS total,
         SUM(pe.veredicto_po='APROVADO') AS aprov,
         SUM(pe.veredicto_po='REPROVADO') AS reprov,
         (SELECT COUNT(*) FROM observacoes o
          JOIN passos_execucao p2 ON o.passo_execucao_id=p2.id
          WHERE p2.execucao_id=ec.id) AS obs
  FROM passos_execucao pe
  JOIN execucoes_caso_de_teste ec ON ec.id=pe.execucao_id
  JOIN casos_de_teste ct ON ct.id=ec.caso_de_teste_id
  JOIN casos_de_uso u ON u.id=ct.caso_de_uso_id
  WHERE ec.teste_id=:t
  GROUP BY u.uc_id, ct.ct_id, ec.id
  ORDER BY u.uc_id, ct.ct_id
"""), {'t': teste_id}).fetchall()
```

### 14. Não rodar Modo B em background

Modo B exige Claude na conversa interativa lendo cada `Read(screenshot.png)`. **Não funciona em background** — cada `Read` é um turno da conversa. Se for fazer Modo B, dedicar a sessão. Modo A é o que roda em background.

### 15. Sempre commitar o relatório no fim

Após o teste, gerar `docs/RELATORIO_VALIDACAO_AUTOMATIZADA_<DDMMMYYYY>.md` com:
- Tabela de UCs/CTs/passos/aprov/reprov/obs
- Validação no banco editais (empresa criada, hierarquia, contatos)
- Bugs descobertos e corrigidos durante a sessão
- Lista de arquivos modificados
- Conclusão (pronto para validador humano? bloqueado? quais próximos passos?)

Commitar na branch `validacao/<YYYYMMDD>-<descricao>`.

---

## Anti-padrões — NUNCA FAZER

1. **Rodar `python3 -u /tmp/run_test.py` no foreground com timeout muito alto.** Trava a tool de bash do Claude. Sempre `nohup ... > log 2>&1 &` em background.
2. **Polling com `sleep` em loop dentro da Bash do Claude.** Bloqueia. Usar `until <condicao>; do sleep N; done` ou Monitor tool.
3. **Aprovar passo `REPROVADO` sem investigar.** Esconde defeito real. Sempre parar, ler erro, ajustar.
4. **Click cego em `nav-section-header` ou `nav-subsection-header`.** Ver seção 1.2 de `PROCESSO_CADASTRO_UC_NO_BANCO.md`. Sidebar é toggle, sempre `evaluate` JS expand-if-collapsed.
5. **Ler screenshot do `_before.png` quando precisa avaliar resultado.** Sempre `_after.png` (estado pós-ação).
6. **Confiar 100% em `vauto == APROVADO` sem ver screenshot.** Asserts DOM podem passar enganados (ex: label visível mas valor não selecionado). Confirmar visualmente em UCs novos.
7. **Rodar teste sem antes confirmar tutoriais reimportados.** Fazer `python3 testes/framework_visual/seed/importar_tutorial_uc_f<N>.py` após qualquer edit no `.md` do tutorial.
8. **Usar empresa antiga em vez do ciclo atual.** Cada teste gera empresa nova com prefixo `DEMO <8chars do teste_id>`. Isolamento garantido.

---

## Script template `/tmp/run_test.py`

```python
#!/usr/bin/env python3
"""Loop aprovar + comentar + continuar até final."""
import json, sys, time, urllib.request

PAINEL = "http://localhost:9876"

def get_estado():
    with urllib.request.urlopen(f"{PAINEL}/estado") as r:
        return json.loads(r.read())

def post(path, body=b""):
    req = urllib.request.Request(f"{PAINEL}{path}", data=body, method="POST",
                                 headers={"Content-Type":"application/json"})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def comentar(texto):
    try:
        post("/comentario", json.dumps({"texto": texto}).encode())
    except Exception as ex:
        print(f"  [warn comentar: {ex}]", flush=True)

def gerar_comentario(passo_id, vauto, det, titulo, pontos_observacao=None, screenshot_path=None):
    asserts_ok = [a.get("selector","?")[:80] for a in (det.get("dom") or {}).get("asserts",[]) or [] if a.get("ok")]
    asserts_fail = [a.get("selector","?")[:80] for a in (det.get("dom") or {}).get("asserts",[]) or [] if not a.get("ok")]
    erro = det.get("acao_erro") if det else None
    if vauto == "REPROVADO":
        return f"[CLAUDE-AUTO] REPROVADO no '{titulo[:50]}'. " + (
            f"Erro acao: {erro[:300]}" if erro else
            f"Asserts falhos: {asserts_fail[:2]}" if asserts_fail else
            "(motivo nao identificado)"
        )
    partes = [f"[CLAUDE-AUTO] '{titulo[:60]}': vauto={vauto}."]
    if asserts_ok:
        partes.append(f"DOM ok ({len(asserts_ok)}): \"{asserts_ok[0][:60]}\".")
    if pontos_observacao:
        partes.append(f"Pontos: {'; '.join(p[:60] for p in pontos_observacao[:2])}")
    return " ".join(partes)

contagem = {}
ts = time.time()
TIMEOUT_S = 1800  # 30 min
last_uc = None
erros_consec = 0
while True:
    if time.time() - ts > TIMEOUT_S:
        print("[TIMEOUT]", flush=True); sys.exit(2)
    try:
        e = get_estado()
        erros_consec = 0
    except Exception as ex:
        erros_consec += 1
        if erros_consec > 5:
            print("[painel caiu apos teste — CONCLUIDO]", flush=True)
            sys.exit(0)
        time.sleep(2); continue
    estado = e.get("estado")
    idx = e.get("passo_atual_idx")
    p = e.get("passo_atual") or {}
    pid = p.get("passo_id")
    vauto = p.get("veredito_automatico")
    titulo = p.get("titulo", "")
    uc_var = e.get("uc_id", "")
    det = p.get("detalhes_validacao", {}) or {}
    if uc_var != last_uc:
        print(f"\n========== {uc_var} ==========", flush=True)
        last_uc = uc_var
    print(f"[{estado:>10}] idx={idx} passo={(pid or '?'):<40} vauto={vauto}", flush=True)

    if estado == "concluido":
        res = e.get("resultados", [])
        ok = sum(1 for r in res if r.get("veredicto_po")=="APROVADO")
        rep = sum(1 for r in res if r.get("veredicto_po")=="REPROVADO")
        print(f"\nTOTAL {len(res)} | APROV {ok} | REPROV {rep}", flush=True)
        sys.exit(0)
    if estado == "pausado":
        key = (idx, pid, uc_var)
        contagem[key] = contagem.get(key, 0) + 1
        if contagem[key] > 5:
            print(f"[STUCK em {pid}]", flush=True); sys.exit(5)
        pontos = p.get("pontos_observacao") or []
        ss = p.get("screenshot_depois") or p.get("screenshot_antes")
        comentario = gerar_comentario(pid, vauto, det, titulo, pontos, ss)
        print(f"  obs: {comentario[:120]}", flush=True)
        comentar(comentario)
        if vauto == "REPROVADO":
            try: post("/aprovar", json.dumps({"veredicto":"REPROVADO"}).encode())
            except: pass
            sys.exit(3)
        try:
            post("/aprovar", json.dumps({"veredicto":"APROVADO"}).encode())
            post("/continuar")
        except Exception as ex:
            print(f"[erro aprovar: {ex}]", flush=True); time.sleep(1); continue
        time.sleep(2)
    elif estado == "erro":
        print("[ESTADO ERRO]", flush=True); sys.exit(4)
    else:
        time.sleep(1)
```

---

## Fluxo completo (passo-a-passo)

### Modo A (rápido, automatizado)

```bash
# 1. Limpar zumbis
pkill -f executor_sprint1 2>/dev/null; pkill -f "framework_visual/painel" 2>/dev/null
sleep 2
python3 -c "
import sys; sys.path.insert(0, 'testes/framework_visual')
from db.engine import get_db; from sqlalchemy import text
db = get_db()
db.execute(text(\"UPDATE testes SET pid_executor=NULL, estado='cancelado' WHERE pid_executor IS NOT NULL OR estado IN ('executando','pausado')\"))
db.commit()
"

# 2. Login + criar teste + iniciar
COOKIES=/tmp/cookies_pasteur.txt
curl -s -c "$COOKIES" -X POST http://localhost:5060/api/login \
  -H "Content-Type: application/json" -d '{"email":"pasteur@valida.com.br","senha":"123456"}'

# (substituir uc_ids pela lista real obtida via /api/sprints/<id>/ucs-resumo)
RESP=$(curl -s -b "$COOKIES" -X POST http://localhost:5060/api/testes \
  -H "Content-Type: application/json" \
  -d '{"titulo":"VAL_<DDMMMYYYY>","sprint_id":"00000000-0000-0000-0001-000000000001","uc_ids":["uuid1","uuid2","uuid3"]}')
TESTE_ID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['teste_id'])")
curl -s -b "$COOKIES" -X POST "http://localhost:5060/api/testes/$TESTE_ID/iniciar"

# 3. Aguardar painel subir, lançar loop em background
sleep 5
nohup python3 -u /tmp/run_test.py > /tmp/run_log_$(date +%Y%m%d_%H%M).txt 2>&1 &

# 4. Aguardar notificacao automatica de termino (3-15 min dependendo dos UCs)

# 5. Validar resultado no banco (ver seção 13)
```

### Modo B (visual real, descritivo)

Depois do passo 3 acima, **NÃO** lançar loop automático.

Em loop interativo:

```python
# Pseudocódigo do que Claude faz a cada turno:
while teste_em_andamento:
    estado = curl_get("/estado")
    if estado.estado != "pausado": esperar 5s e repetir
    screenshot_path = realpath(f"testes/relatorios/visual/teste_<prefix>_*/CT-{ct_id}_{passo_id}_after.png")
    Read(screenshot_path)  # Claude vê a imagem
    pontos = estado.passo_atual.pontos_observacao
    # Claude gera observação descritiva real comparando screenshot com pontos
    comentario = "[CLAUDE-VISUAL] " + descricao_rica
    curl_post("/comentario", {"texto": comentario})
    curl_post("/aprovar", {"veredicto": "APROVADO" or "REPROVADO"})
    curl_post("/continuar")
```

Quando teste terminar → gerar relatório → commit → push.

---

## Troubleshooting

| Sintoma | Causa | Fix |
|---|---|---|
| `409 outro teste rodando` ao iniciar | executor zumbi de teste anterior | matar `executor_sprint1` + UPDATE estado=cancelado |
| Loop fica em `Connection refused` infinito | painel caiu mas script continua tentando | atualizar para sair após 5 erros consec |
| `vauto == REPROVADO` em assert que parecia certo | seletor genérico pegou elemento errado | trocar por seletor estrito + nth=N (ver seção 7 do PROCESSO_CADASTRO_UC) |
| Empresa não tem `area_padrao_id` apesar de aprovado | Passo selecionou label mas não valor | adicionar evaluate JS para verificar `select.options[selectedIndex].text` (ver passo_03 UC-F02-FP) |
| Sidebar colapsa entre passos | click cego em toggle (anti-padrão) | trocar por `evaluate` expand-if-collapsed |
| Tutorial mudou mas teste continua usando antigo | esqueceu de reimportar | rodar `python3 testes/framework_visual/seed/importar_tutorial_uc_f<N>.py` |
| Screenshot não mostra elemento | viewport pequeno OU elemento abaixo da dobra | adicionar `evaluate` com `scrollIntoView({block:'center'})` antes do screenshot |

---

## Histórico de aplicação

| Data | Sessão | UCs | Resultado |
|---|---|---|---|
| 2026-04-30 | validacao/20260430-tutoriais-idempotentes-uc-f13 | UC-F01 + UC-F13 + UC-F02 (FA01/FA02/FA03/FP) | 40/40 APROVADOS, 0 REPROVADOS, 40 obs visuais salvas |

---

## Referências cruzadas

- `docs/PROCESSO_CADASTRO_UC_NO_BANCO.md` — como cadastrar tutoriais no banco testesvalidacoes (seções 1.1 deps hierarquia + 1.2 sidebar idempotente)
- `docs/VALIDACAOFACILICITA.md` — processo formal de validação V3 (3 trilhas + loop correção)
- `feedback_navegacao_sidebar_idempotente.md` (memória) — regra GENÉRICA de toda navegação na sidebar
- `feedback_dependencias_hierarquia.md` (memória) — empresa_scoped=True nasce vazio
