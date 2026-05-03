# PLANO: Sprint 3 — gerar tutoriais visuais (UC-P01..P12 + UC-R01..R07) reusando teste-base Sprint 2

**Data:** 2026-05-03
**Substitui plano Sprint 2** (ja executado: 7/7 Lote A + 7/7 Lote B com 0 REPROVADO).

---

## Context

Sprint 2 100% pronta. **TESTE FINAL SPRINT 2 LOTE B** (id `ac4823e1-0c9e-42e8-bd35-c61a7b547000`, run 2 = `7f178197...`) concluido com 7/7 CTs aprovados, 15 APR / 0 REP / 5 INC. Empresa demo herdada da Sprint 1: **DEMO 001 (CNPJ 23.658.582/3282-55)** com:
- 1 produto IA, hierarquia area/classe/subclasse, parametros_score completo (Sprint 1)
- 1 edital salvo, 1 estrategia, 1 monitoramento (Sprint 2 Lote A — Captacao)
- 1 analise (scores GO/NO-GO 6 dimensoes), 1 lote, 46 requisitos extraidos por IA (Sprint 2 Lote B — Validacao)

Agora Sprint 3 — **Precificacao e Proposta** — 19 UCs:
- **UC-P01..P12** (12 UCs Precificacao): organizar editais, portfolio, volumetria, custos, estruturar precos, estrategia competitiva, pipeline IA
- **UC-R01..R07** (7 UCs Proposta): proposta tecnica (motor automatico), comercial, exportacao, etc

**Modelo de heranca ja existe** (Sprint 2 implementou + corrigiu /reiniciar). Sprint 3 usa exatamente o mesmo mecanismo:
- Lote A Sprint 3 (UC-P) declara `teste_base_id = TESTE FINAL SPRINT 2 LOTE B`
- Lote B Sprint 3 (UC-R) declara `teste_base_id = TESTE FINAL SPRINT 3 LOTE A` (encadeamento natural)

Sem mudancas estruturais no backend/UI. So conteudo (tutoriais + datasets + casos de teste + importers).

**Frontend correspondente:**
- `frontend/src/pages/PrecificacaoPage.tsx` — UC-P01..P12
- `frontend/src/pages/PropostaPage.tsx` — UC-R01..R07

**Splits ja existem:** `testes/casos_de_uso/UC-P01.md..UC-P12.md` + `UC-R01.md..UC-R07.md` (header confirma `sprint: "Sprint 3-4 (Precificação e Proposta)"`).

**Ordem topologica (lote por area):**

- **Lote A — Precificacao** (12 UCs): P01 → P02 → ... → P12
- **Lote B — Proposta** (7 UCs): R01 → R02 → ... → R07

Cada lote vira teste base do proximo, exatamente como fizemos na Sprint 2.

**Arquivos criticos identificados:**

- `testes/casos_de_uso/UC-P01.md..UC-P12.md` + `UC-R01.md..UC-R07.md` — fonte canonica.
- `scripts/gerar_ucs_v7.py` — dict PREDECESSORES (verificar/popular UC-P/UC-R Sprint 3).
- `frontend/src/pages/PrecificacaoPage.tsx` + `PropostaPage.tsx` — selectors + endpoints reais.
- `testes/framework_visual/seed/importar_tutorial_uc_cv*.py` — template (sed do CV08 ou CV13).
- `testes/tutoriais_visual/UC-CV*_fp.md` — referencia de estilo (ja com fix `:has-text` aplicado).
- API/UI: nada a mudar. `/reiniciar` ja foi corrigido pra herdar (commit `46033b7`).

**Aprendizado bonus (corrigido em Sprint 2 — nao repetir!):**
- ❌ NUNCA usar `document.querySelector('button:has-text("X")')` — `:has-text` eh seletor Playwright, `querySelector` nativo lanca SyntaxError.
- ✅ Usar `[...document.querySelectorAll('button')].find(b => /X/i.test(b.textContent || ''))`.

---

## Tutoriais Sprint 3 (19 UCs × 3 arquivos + 19 importers)

Para cada UC-P01..P12 e UC-R01..R07:
- `testes/datasets/UC-P{N}_visual.yaml` (e `UC-R{N}_visual.yaml`) — placeholders apontam pra dados Sprint 1+2 herdados (`{{EMAIL_PRINCIPAL}}` = valida89, `{{CNPJ_UNICO}}` = 23.658.582/3282-55).
- `testes/casos_de_teste/UC-P{N}_visual_fp.yaml` — `asserts_dom` + `asserts_rede` por passo.
- `testes/tutoriais_visual/UC-P{N}_fp.md` — heading + prosa "Observe criticamente" + bloco YAML. Selectors via `querySelectorAll + find` (nunca `:has-text`).
- `testes/framework_visual/seed/importar_tutorial_uc_p{N}.py` — copia de `importar_tutorial_uc_cv13.py` com 3 substituicoes (UC_ID, CT_ID, ciclo_id default).

---

## Etapas de execucao

### Bloco A — Tutoriais Lote A (Precificacao UC-P01-P12)

Para cada UC, em ordem P01 → P02 → P03 → P04 → P05 → P06 → P07 → P08 → P09 → P10 → P11 → P12:
1. Inspecionar split `testes/casos_de_uso/UC-P{N}.md` (FP, eventos principais).
2. Inspecionar `frontend/src/pages/PrecificacaoPage.tsx` (selectors, endpoints reais).
3. Criar `dataset/CT/tutorial` (3 arquivos).
4. Criar importer (sed do `importar_tutorial_uc_cv13.py`).
5. Rodar importer.

### Bloco B — Teste Final Lote A (Precificacao)

1. Verificar serviços de pé (5060, 5181, 5180, 5007, 9876 vai subir junto).
2. Criar teste no UI: Sprint 3 + UCs UC-P01..UC-P12 + **teste base = TESTE FINAL SPRINT 2 LOTE B** (`ac4823e1...`).
3. POST iniciar → spawn executor.
4. `nohup /tmp/run_test.py &` em background (~30-40min para 12 CTs com IA).
5. Verificar:
   - 12/12 CTs aprovados, 0 REPROVADO.
   - Banco editais: novos registros vinculados ao `empresa_id` da empresa demo.
   - Comentarios `[TELA_OBSERVADA]` + `[CONFORME]`.
6. Commit "feat(validacao): Sprint 3 Lote A — Precificacao 12/12".

### Bloco C — Tutoriais Lote B (Proposta UC-R01-R07)

Mesmo fluxo do Bloco A, na ordem R01 → R02 → R03 → R04 → R05 → R06 → R07. Inspecionar `frontend/src/pages/PropostaPage.tsx`.

### Bloco D — Teste Final Lote B (Proposta)

1. Criar novo teste Sprint 3: UCs UC-R01..UC-R07 + **teste base = TESTE FINAL SPRINT 3 LOTE A** (encadeamento — herda empresa + dados Sprint 1+2+P01-P12).
2. Iniciar + run_test bg (~25-30min).
3. Verificar 7/7 + persistencia (tabelas de proposta).
4. Commit "feat(validacao): Sprint 3 Lote B — Proposta 7/7".

---

## Verificacao end-to-end

```bash
# 1. Splits e predecessores Sprint 3 cadastrados no banco
python3 -c "
import sys; sys.path.insert(0, 'testes/framework_visual')
from db.engine import get_db
from sqlalchemy import text
r = get_db().execute(text('''
SELECT uc.uc_id, COALESCE(p.uc_id, up.marcador) AS pred
FROM uc_predecessores up JOIN casos_de_uso uc ON uc.id = up.uc_id
LEFT JOIN casos_de_uso p ON p.id = up.predecessor_id
WHERE uc.uc_id LIKE 'UC-P%' OR uc.uc_id LIKE 'UC-R%' ORDER BY uc.uc_id
''')).fetchall()
for x in r: print(x)
"

# 2. Importers populam passos_tutorial
for n in 01 02 03 04 05 06 07 08 09 10 11 12; do
  python3 -c "
import sys; sys.path.insert(0, 'testes/framework_visual')
from db.engine import get_db
from sqlalchemy import text
r = get_db().execute(text(f\"SELECT COUNT(*) FROM passos_tutorial pt JOIN casos_de_teste ct ON ct.id=pt.caso_de_teste_id WHERE ct.ct_id='CT-P${n}-FP'\")).fetchone()
print(f'P${n}: {r[0]} passos')
"
done
for n in 01 02 03 04 05 06 07; do
  python3 -c "
import sys; sys.path.insert(0, 'testes/framework_visual')
from db.engine import get_db
from sqlalchemy import text
r = get_db().execute(text(f\"SELECT COUNT(*) FROM passos_tutorial pt JOIN casos_de_teste ct ON ct.id=pt.caso_de_teste_id WHERE ct.ct_id='CT-R${n}-FP'\")).fetchone()
print(f'R${n}: {r[0]} passos')
"
done

# 3. Persistencia banco editais (apos cada lote)
python3 << 'PY'
from sqlalchemy import create_engine, text
e = create_engine("mysql+mysqlconnector://producao:112358123@camerascasas.no-ip.info:3308/editais?charset=utf8mb4")
with e.connect() as c:
    eid = c.execute(text("SELECT id FROM empresas WHERE cnpj='23.658.582/3282-55'")).fetchone()[0]
    print('empresa demo:', eid)
    # Tabelas que esperamos crescer com Lote A (precificacao)
    for t in ['precificacoes','custos_produto','margens','propostas']:
        try:
            n = c.execute(text(f"SELECT COUNT(*) FROM {t} WHERE empresa_id='{eid}'")).scalar()
            print(f'  {t}: {n}')
        except Exception as ex:
            print(f'  {t}: tabela nao existe ({ex})')
PY

# 4. Teste Sprint 3 com base referenciada
python3 -c "
import sys; sys.path.insert(0, 'testes/framework_visual')
from db.engine import get_db
from sqlalchemy import text
r = get_db().execute(text('''
SELECT t.titulo, t.estado, tb.titulo AS base_titulo, tb.estado AS base_estado
FROM testes t LEFT JOIN testes tb ON tb.id = t.teste_base_id
WHERE t.titulo LIKE 'TESTE FINAL SPRINT 3%' ORDER BY t.criado_em DESC LIMIT 5
''')).fetchall()
for x in r: print(x)
"
```

---

## Riscos

| # | Risco | Mitigacao |
|---|---|---|
| R1 | UCs Sprint 3 podem ter selectors complexos (campos numericos, sliders, tabelas editaveis). | Inspeciono `PrecificacaoPage.tsx`/`PropostaPage.tsx` antes de cada tutorial; uso 3 formatos (entrada/exibicao/transito) ja convencionados. |
| R2 | UC-P/R dependem do DeepSeek (motor automatico de proposta) — pode demorar 60-180s. | Timeout 240s por passo; comentario explicito que LLM esta processando. |
| R3 | UC-P pode esperar lotes/itens preexistentes — herdamos 1 lote da Sprint 2 (suficiente?). | Verificar pre-condicoes em cada split. Se faltar, gerar via primeiro passo do tutorial. |
| R4 | Re-execucoes acumulam dados Sprint 3 (precos repetidos por edital). | Mesma decisao Sprint 2: primeira rodada nao tem problema; cleanup quando precisar. |
| R5 | Frontend pode ter divergencia entre split V5 e codigo atual. | Inspeciono codigo real antes de criar cada tutorial; ajusto a posteriori. |
| R6 | `uc_predecessores` pode nao ter UC-P/UC-R ainda. | Verificar `scripts/gerar_ucs_v7.py:PREDECESSORES` e popular se faltar. Re-executar `seed_uc_predecessores.py`. |
| R7 | Tutoriais erroneamente reusam padrao `:has-text` quebrado. | Plano explicito: NUNCA usar `:has-text` em `querySelector`. Usar `querySelectorAll + find + regex.test(textContent)`. |
| R8 | Pre-flight bloqueia se predecessor de Sprint 1/2 nao foi marcado aprovado no teste base. | `_validar_predecessores` ja faz walk recursivo via teste_base_id (corrigido em Sprint 2). |
| R9 | UC-R precisa de Lote A Sprint 3 concluido — se rodarmos Lote B antes do A terminar, falha. | Encadeamento sequencial estrito: Lote A 100% verde antes de criar teste Lote B. |
| R10 | Documento dos UCs (`SPRINT 3-4`) cobre 2 sprints juntas; alguns UC-P podem na verdade ser Sprint 4. | Validar individualmente cada split antes de incluir no lote. Se algum for Sprint 4 puro, deferir. |
