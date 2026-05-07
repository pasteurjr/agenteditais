# Validação Completa das 25 Observações Arnaldo — Sprint 10

**Data:** 07/05/2026
**Sprint criada:** 10 — "Sprint 10 — Correcoes Arnaldo"
**Origem:** `docs/SPEC_UCS_ARNALDO.yaml` (25 entradas)
**Resultado da minha rodada:** ✅ **25 / 25 CTs aprovados**
**Próximo passo:** Arnaldo executar manualmente para confirmar visualmente

---

## Sumário executivo

| Métrica | Valor |
|---|---|
| Sprint criada | 10 (numero) |
| UCs novos cadastrados | 25 (UC-ARN-01 .. UC-ARN-25) |
| CTs cadastrados | 25 (CT-ARN-NN-FP) |
| Passos totais no banco | 43 |
| Observações UI ricas salvas | 43 (uma por passo) |
| Aceites de IA registrados | 2 (UC-ARN-14 e UC-ARN-25) — confirma F03-03 e2e |
| Tempo de execução total | ~11 min (uma rodada) |
| Retries necessários | 0 |
| Bugs encontrados durante teste | 0 |

---

## Mapeamento UC novo × Observação Arnaldo

| UC | Obs | Validou | Resultado |
|---|---|---|---|
| **UC-ARN-01** | F01-01 | Componente UploadLoteIA contexto=cadastro_empresa renderiza | ✅ APROVADO |
| **UC-ARN-02** | F01-02 | Label IE tem asterisco vermelho (required) | ✅ APROVADO |
| **UC-ARN-03** | F01-03 | Vincular sem re-login | ✅ APROVADO |
| **UC-ARN-04** | F01-04 | CNPJ disabled após empresa salva | ✅ APROVADO |
| **UC-ARN-05** | F01-05 | Sidebar Configurações com labels curtos | ✅ APROVADO |
| **UC-ARN-06** | F01-06 | UploadLoteIA documentos visível | ✅ APROVADO |
| **UC-ARN-07** | F01-07 | Endereço estruturado (4 campos novos) + SQL banco | ✅ APROVADO |
| **UC-ARN-08** | F01-08 | localStorage `facilicita_sidebar_sections_v1` persiste | ✅ APROVADO |
| **UC-ARN-09** | F02-01 | Tutorial V7 explica ordem F02→F13 | ✅ APROVADO |
| **UC-ARN-10** | F02-02 | Cursor pointer global em ≥3 elementos | ✅ APROVADO |
| **UC-ARN-11** | F02-03 | UploadLoteIA Portfolio renderiza | ✅ APROVADO |
| **UC-ARN-12** | F03-01 | Lógica calcDocStatus distingue Vencido vs Falta | ✅ APROVADO |
| **UC-ARN-13** | F03-02 | UploadLoteIA documentos em EmpresaPage | ✅ APROVADO |
| **UC-ARN-14** | F03-03 | POST /api/auditoria/aceite-ia retorna 200 + linha em auditoria_aceite_ia | ✅ APROVADO (1 aceite registrado) |
| **UC-ARN-15** | F04-01 | Empresa SP não vê fontes UF=MG/PR/RS | ✅ APROVADO |
| **UC-ARN-16** | F04-02 | Label "credencial" no form de fontes | ✅ APROVADO |
| **UC-ARN-17** | F04-03 | Coluna Fonte / badge Ativa | ✅ APROVADO |
| **UC-ARN-18** | F04-04 | Botão atualizar individual passa ID | ✅ APROVADO |
| **UC-ARN-19** | F04-05 | ≥3 tooltips ricos na coluna Ações | ✅ APROVADO |
| **UC-ARN-20** | F04-06 | Validade do PDF prevalece (revisão de código) | ✅ APROVADO |
| **UC-ARN-21** | F04-07 | Helper magic bytes %PDF (revisão de código) | ✅ APROVADO |
| **UC-ARN-22** | F04-08 | CRF FGTS persiste arquivo_path (revisão de código) | ✅ APROVADO |
| **UC-ARN-23** | F05-01/02/03 | Form responsável tem 3 campos novos (Validade/outorga/caminho) | ✅ APROVADO |
| **UC-ARN-24** | F13-01 | UNIQUE area: 2ª área duplicada retorna 409 com mensagem amigável | ✅ APROVADO |
| **UC-ARN-25** | F03-03 e2e | Endpoint /api/auditoria/aceite-ia + persistência | ✅ APROVADO (1 aceite registrado) |

---

## Como Arnaldo executa esses 25 testes

### Passo 1 — Acessar o testesvalidacoes externo

URL: **http://pasteurjr.servehttp.com:5181**
Login: `arnaldo@valida.com` / `123456`

### Passo 2 — Criar o teste

1. Clicar em **➕ Novo Teste** no header
2. **Título**: `ARN VALIDACAO MANUAL — <data>`
3. **Projeto**: Facilicita.IA
4. **Sprint**: `Sprint 10 — Correcoes Arnaldo`
5. **Teste base (Sprint anterior)**: `V7 OBS ARNALDO - SPRINT 1 - 07/05 00:44`
   (qualquer Sprint 1 concluído serve)
6. Botão **Marcar todos executáveis** → 25 UCs marcados
7. Clicar **Criar Teste (gera ciclo único)**

### Passo 3 — Iniciar e revisar

1. Clicar **▶ Iniciar Execução**
2. Abrir nova aba: **http://pasteurjr.servehttp.com:9876** (painel)
3. Para cada passo:
   - Ler descrição
   - Conferir screenshots Antes/Depois
   - Preencher observação se quiser comentar algo
   - Clicar **✓ Aprovar** se OK ou **✗ Reprovar** se identificar problema
   - Clicar **▶ Continuar**
4. Repetir até a mensagem final **🎬 Teste concluído!**

### Tempo estimado

10–15 minutos no total (25 UCs com 1–3 passos cada, totalizando 43 passos).

---

## Validação no banco — evidências

### Sprint 10 cadastrada

```sql
SELECT id, numero, nome FROM sprints WHERE numero=10;
-- 1 linha: "Sprint 10 — Correcoes Arnaldo"
```

### 25 UCs novos

```sql
SELECT COUNT(*) FROM casos_de_uso WHERE uc_id LIKE 'UC-ARN-%';
-- 25
```

### 25 CTs

```sql
SELECT COUNT(*) FROM casos_de_teste ct
JOIN casos_de_uso uc ON ct.caso_de_uso_id=uc.id
WHERE uc.uc_id LIKE 'UC-ARN-%';
-- 25
```

### 43 passos

```sql
SELECT COUNT(*) FROM passos_tutorial pt
JOIN casos_de_teste ct ON pt.caso_de_teste_id=ct.id
JOIN casos_de_uso uc ON ct.caso_de_uso_id=uc.id
WHERE uc.uc_id LIKE 'UC-ARN-%';
-- 43
```

### 43 observações UI ricas (minha rodada)

```sql
SELECT COUNT(*) FROM observacoes o
JOIN passos_execucao pe ON o.passo_execucao_id=pe.id
JOIN execucoes_caso_de_teste ec ON ec.id=pe.execucao_id
WHERE ec.teste_id='fcdde6cc-7167-45cf-a51c-771b8943216e';
-- 43
```

### 2 aceites de IA (F03-03 e2e)

```sql
SELECT contexto, COUNT(*) FROM auditoria_aceite_ia GROUP BY contexto;
-- arn25_e2e: 1
-- teste_arn14: 1
```

✅ Confirma que UC-ARN-14 e UC-ARN-25 acionaram o endpoint `/api/auditoria/aceite-ia` corretamente, persistindo log na tabela. **F03-03 funciona end-to-end.**

---

## Arquivos gerados

### 25 UCs × 5 arquivos cada = 125 arquivos
- `testes/casos_de_uso/UC-ARN-01.md` .. `UC-ARN-25.md`
- `testes/datasets/UC-ARN-01_visual.yaml` .. `UC-ARN-25_visual.yaml`
- `testes/casos_de_teste/UC-ARN-01_visual_fp.yaml` .. `UC-ARN-25_visual_fp.yaml`
- `testes/tutoriais_visual/UC-ARN-01_fp.md` .. `UC-ARN-25_fp.md`
- `testes/framework_visual/seed/importar_tutorial_uc_arn_01.py` .. `_25.py`

### Infraestrutura
- `docs/SPEC_UCS_ARNALDO.yaml` — spec declarativo (single source of truth)
- `scripts/gerar_ucs_arnaldo.py` — gerador (lê SPEC, escreve 5 arquivos por UC)
- `testes/framework_visual/seed/seed_sprint10_correcoes_arnaldo_ucs.py` — cria Sprint 10 + 25 UCs/CTs
- `/tmp/disparar_sprint10.py` — disparador que cria teste + inicia

---

## Resumo das fases executadas

| Fase | Tempo | Status |
|---|---|---|
| 1. SPEC + gerador | ~30min | ✅ |
| 2. 125 arquivos gerados + revisão outliers | ~5min | ✅ |
| 3. Seed Sprint 10 + 25 importers | ~2min | ✅ |
| 4. Disparar + run_test_ui | ~11min | ✅ 25/25 verde |
| 5. Relatório | ~5min | ✅ |

**Total real: ~55min** (estimativa do plano: ~3-4h). Foi mais rápido porque não houve retries.

---

## Estado final do produto

✅ **As 25 observações Arnaldo** estão:
1. Implementadas em código (commit `fadb984` de 06/05)
2. Validadas via Sprint 1 V7 (60 CTs em 3 rodadas, 06/05–07/05)
3. Validadas via Sprint 10 (25 CTs cirúrgicos, 1 rodada hoje)

✅ **Migrations aplicadas em editais** (07/05): 051, 052, 053, 054
⚠ **Pendente em editaisvalida**: replicar quando Arnaldo for testar manualmente

✅ **Documentação completa**:
- `docs/ANALISE OBS SPRINT1.md/.pdf` (análise das 25 obs)
- `docs/RESULTADO DAS OBSERVACOES NO TESTE DA SPRINT1 EM 06-05-2026.md/.pdf`
- `docs/VALIDACAO 25 OBS ARNALDO COMPLETA.md/.pdf` (este documento)

---

## Próximos passos (Arnaldo)

1. Acessar `http://pasteurjr.servehttp.com:5181`, login `arnaldo@valida.com`
2. Criar teste apontando pra **Sprint 10**, escolher um teste-base de Sprint 1 concluído
3. Marcar todos os 25 UCs e iniciar
4. Acompanhar pelo painel `:9876`, aprovando ou reprovando passo a passo
5. Se reprovar algum, abrir nova observação no docx e voltamos pro ciclo

---

**Documento gerado em:** 07/05/2026 13:00
**Versão:** 1.0
