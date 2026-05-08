# Sprint 1 testesvalidacoes — atualizada para V8 (08/05/2026)

**O que foi feito:** todos os passos da Sprint 1 que precisavam de atualização foram enriquecidos com **bloco "🟦 V8 — observações adicionais (08/05/2026)"**, anexado ao `descricao_painel` existente, sem perder o conteúdo original. Cada bloco V8 referencia explicitamente a obs Arnaldo correspondente (F0X-NN) e instrui o tester sobre o que observar de novo.

## Cobertura final — 25/25 obs Arnaldo

| Obs | UCs onde aparece | Passos atualizados |
|---|---|---|
| **F01-01** UploadLoteIA cadastro_empresa | UC-F01 | 1 (`passo_01_criar_via_fa07a`) |
| **F01-02** IE asterisco vermelho | UC-F01 | 2 (`passo_03_preencher_dados_basicos_crud`, `passo_07_verificar_dados_carregados`) |
| **F01-03** Vincular sem re-login | UC-F01 | 1 (`passo_04b_vincular_empresa_ao_user`) |
| **F01-04** CNPJ readonly após Save | UC-F01 | 1 (`passo_06_navegar_empresa_page`) |
| **F01-05** Sidebar 4 labels curtos | UC-F01 | 1 (`passo_06_navegar_empresa_page`) |
| **F01-06** UploadLoteIA documentos | UC-F01 | 1 (`passo_01_criar_via_fa07a`) |
| **F01-07** Endereço 7 campos | UC-F01 | 1 (`passo_07_verificar_dados_carregados`) |
| **F01-08** Sidebar localStorage | UC-F01 | 1 (`passo_06_navegar_empresa_page`) |
| **F02-01** Ordem F02→F13 | UC-F02 | 1 (`passo_00_setup_empresa_e_login`) |
| **F02-02** Cursor pointer | UC-F01, UC-F02, UC-F06 | 3 (`passo_00_login`, `passo_03_selecionar_area_padrao`, `passo_00_setup_navegar_meus_produtos`) |
| **F02-03** UploadLote Portfolio | UC-F06, UC-F07 | 2 (`passo_00_setup_navegar_meus_produtos`, `passo_00_setup_navegar_cadastro_ia`) |
| **F03-01** 4 estados de badge | UC-F03 | 2 (`passo_00_setup_navegar_documentos`, `passo_06_preencher_doc3_alvara`) |
| **F03-02** UploadLote Documentos | UC-F03 | 1 (`passo_00_setup_navegar_documentos`) |
| **F03-03** Aceite IA + auditoria | UC-F03, UC-F07 | 2 (`passo_00_setup_navegar_documentos`, `passo_00_setup_navegar_cadastro_ia`) |
| **F04-01** Filtro UF | UC-F04 | 2 (`passo_00_setup`, `passo_03_validar_listagem_combinada`) |
| **F04-02** Label "credencial" | UC-F04 | 2 (`passo_00_setup`, `passo_02_cadastrar_fontes_v5`) |
| **F04-03** Coluna Fonte | UC-F04 | 1 (`passo_04_sincronizar_fontes`) |
| **F04-04** Botão individual | UC-F04 | 1 (`passo_04_sincronizar_fontes`) |
| **F04-05** Tooltips ricos | UC-F04 | 1 (`passo_04_sincronizar_fontes`) |
| **F04-06** Validade PDF prevalece | UC-F04 | 1 (`passo_00_setup`) |
| **F04-07** Magic bytes %PDF | UC-F04 | 2 (`passo_00_setup`, `passo_05_buscar_certidoes_real`) |
| **F04-08** CRF FGTS path persiste | UC-F04 | 1 (`passo_05_buscar_certidoes_real`) |
| **F05-01** Submenu renomeado | UC-F05 | 2 (`passo_00_setup_navegar_responsaveis`, `passo_07_verificar_lista_3_responsaveis`) |
| **F05-02** Validade mandato | UC-F05 | 5 passos (setup + 4 cadastros) |
| **F05-03** Documento outorga | UC-F05 | 5 passos (idem) |
| **F13-01** Rejeição duplicatas | UC-F13 | 2 (`passo_01_criar_area_1`, `passo_04_criar_classe_1`) |

## Estatísticas técnicas

- **25 passos da Sprint 1** receberam bloco V8 anexado (de um total de 110 passos S1).
- **+13 KB de descrição** acrescentados (texto rico explicando cada correção).
- **+49 pontos de observação** novos no array `pontos_observacao` (checklist visual pro tester).
- **Conteúdo original preservado** — bloco V8 é APPEND, não substitui.
- **Idempotente** — script verifica `🟦 V8 — observações adicionais` antes de adicionar (não duplica em re-execuções).

## Como o tester vê

No painel `:9876` durante a execução de cada passo, ele vê:
1. **Descrição original** (o que sempre teve no V6/V7) — preserva o contexto histórico
2. **Linha divisória "🟦 V8 — observações adicionais (08/05/2026)"** — marca o que mudou
3. **Bloco V8** com explicação da correção Arnaldo + o que checar visualmente
4. **Pontos de observação** — checklist explícito para o tester confirmar item por item

## Arquivos relacionados

- Backup pré-update: `/tmp/backup_passos_s1_pre_v8.tsv` (103 linhas — 1 por passo)
- Script principal: `/tmp/atualizar_passos_s1_v8.py` (24 atualizações)
- Script complemento (F01-01): `/tmp/atualizar_passos_s1_v8_complemento.py`
- Tutoriais V8 fonte: `docs/tutorialsprint1-2 V8.md`, `docs/tutorialsprint1-3 V8.md`
- Análise prévia: `docs/REVISAO TUTORIAIS V6V7 vs 25 CORRECOES.md`

## Próximo passo recomendado

Rodar uma rodada de validação V12 da Sprint 1 no testesvalidacoes (com Arnaldo manual ou auto-validação) para conferir que os passos enriquecidos:
1. Continuam executáveis (não há erro técnico)
2. Têm conteúdo rico no painel `:9876` no momento da pausa de cada passo
3. O `pontos_observacao` aparece como checklist visual

Como os passos foram apenas **enriquecidos com texto** (não mudou estrutura de ação), o teste deve manter o mesmo perfil de aprovação que tinha antes (~322/322 aprovados em 31/03 ou rodada equivalente).
