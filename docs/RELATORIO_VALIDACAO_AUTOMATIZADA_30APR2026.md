# Relatório de Validação Automatizada — UC-F01 + UC-F13 + UC-F02

**Data:** 2026-04-30
**Tester automatizado:** Claude Code (Opus 4.7)
**Branch:** `validacao/20260430-tutoriais-idempotentes-uc-f13`
**Commit final:** e580257
**Empresa de teste:** DEMO f425e4dd Comércio e Representações Ltda

---

## Resumo executivo

Validação automatizada **end-to-end** com Claude lendo cada screenshot, comparando com pontos de observação esperados, e adicionando observação descritiva (`[CLAUDE-VISUAL]`) antes de aprovar cada passo.

**Resultado: 40/40 passos APROVADOS, 0 REPROVADOS, 40 observações textuais ricas salvas no banco.**

```
UC       CT               total aprov reprov obs
─────────────────────────────────────────────────
UC-F01   CT-F01-FP           12    12      0  12
UC-F02   CT-F02-FA01          3     3      0   3
UC-F02   CT-F02-FA02          4     4      0   4
UC-F02   CT-F02-FA03          4     4      0   4
UC-F02   CT-F02-FP            5     5      0   5
UC-F13   CT-F13-FP           12    12      0  12
─────────────────────────────────────────────────
TOTAL                         40    40      0  40
```

## Validação no banco editais

| Item | Esperado | Real | OK |
|---|---|---|---|
| Empresa criada | DEMO f425e4dd... | DEMO f425e4dd Comércio e Representações Ltda | ✅ |
| CNPJ | 42.513.511/3373-80 | persistido | ✅ |
| area_padrao_id | Equipamentos Médico-Hospitalares | id=9dd78923... → "Equipamentos Médico-Hospitalares" | ✅ |
| Emails | 3 acumulados nos cenários | comercial+ + atendimento+ x2 | ✅ |
| Telefone | (11) 4176-2373 | persistido | ✅ |
| Áreas (UC-F13) | 2 áreas | Diagnóstico in Vitro + Equipamentos Médico-Hospitalares | ✅ |
| Classes (UC-F13) | 3 classes (1 + 2) | Monitoração + Reagentes Bioquímicos + Reagentes e Kits Diagnósticos | ✅ |
| Subclasses (UC-F13) | 3 subclasses com NCMs | Monitor Multiparamétrico (9018.19.90) + Reagente para Glicose (3822.19.90) + Kit de Hematologia (3822.19.90) | ✅ |

## Bugs descobertos e corrigidos durante a sessão

1. **Sidebar toggle cego** (incidente UC-F02 → UC-F13): click cego em `nav-section-header` colapsava se já expandido. Solução genérica: `evaluate` JS expand-if-collapsed. Aplicado em todos os UCs.
2. **CRUD child table sem filtro pai**: Classes/Subclasses precisam selecionar Área (e Classe para subclass) no card `.crud-parent-selector` antes de "Novo".
3. **Subclasses tem 2 selects pai** (Área grandparent + Classe parent), com timing entre seleções.
4. **NCMs é JSON array** (`["..."]`), não string simples.
5. **Aba "Classificacao"** sem acento (não "Classificação").
6. **Ordem alfabética de UCs**: UC-F02 vinha antes de UC-F13. Implementada **ordenação topológica** por predecessores `depends`.
7. **Inputs do CRUD não têm `name=`**: usar `div.form-field:has(.form-field-label:text-is("X")) input.text-input`.
8. **Passo 03 UC-F02-FP**: assert verificava só o label, não o valor selecionado. Solução: `evaluate` JS scrolla + valida `select.options[selectedIndex].text`.

## Arquivos modificados (commitados)

- `testes/tutoriais_visual/UC-F13_fp.md` (12 passos: 2 áreas + 3 classes + 3 subclasses)
- `testes/tutoriais_visual/UC-F01_fp.md` (sidebar idempotente)
- `testes/tutoriais_visual/UC-F02_fp.md` (idempotente + scroll/assert area_padrao)
- `testes/tutoriais_visual/UC-F02_fa01.md / fa02.md / fa03.md` (idempotente)
- `testes/datasets/UC-F13_visual.yaml` (atalhos subclasse_N_area)
- `testes/framework_visual/api/server.py` (ordenação topológica)
- `frontend/src/pages/EmpresaPage.tsx`
- `docs/PROCESSO_CADASTRO_UC_NO_BANCO.md` (seções 1.1 dependências hierarquia + 1.2 sidebar idempotente)

## Memória persistente atualizada

- `feedback_dependencias_hierarquia.md` — empresa_scoped=True nasce vazio, mapear quem cria os dados antes
- `feedback_navegacao_sidebar_idempotente.md` — TODA navegação na sidebar precisa expand-if-collapsed (regra GENÉRICA)

## Conclusão

Os 3 UCs (F01 + F13 + F02 com 4 variações) estão **prontos para validação humana** (Arnaldo). Tutoriais visuais robustos, executor não trava, asserts DOM passam, dados persistem corretamente no banco da aplicação. Padrão idempotente da sidebar é aplicável a todos os UCs futuros.
