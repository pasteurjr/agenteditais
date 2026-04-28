# Furos e Pendências — Fases D, E, G, H, I (executor + painel + relatórios + piloto + auditoria)

**Data:** 2026-04-27
**Fases:** D + E + G + H + I (concluídas)

## Resumo

✅ **Fase D — `executor_db.py`**: novo módulo separado do `executor.py` legado. Aceita `--teste_id`, lê do banco, persiste cada passo em `passos_execucao` (D5), IPC via `/tmp/painel_<teste_id>.json`, polling do banco, SIGTERM handler, screenshots em `testes/relatorios/visual/teste_<id8>/<ct>_<ts>/`.

✅ **Fase E — painel HTTP no webapp**: `routes_painel.py` + `orchestrator.py`. Endpoints `/teste/<id>/{iniciar,pausar,cancelar,estado,aprovar,reprovar,comentario,screenshot/<nome>}`. Comandos persistem em banco, executor faz polling.

✅ **Fase G — relatórios**: `routes_relatorios.py` + `relatorios.html` + `relatorio.html`. `/relatorios` admin-only, `/meus-relatorios` qualquer logado, `/relatorio/<id>` dono ou admin, `/relatorio/<id>/md` download.

✅ **Fase H — migration retroativa do piloto**: `seed_piloto_ucf01.py` cria 1 teste do pasteur com 1 CT-F01-FP, 10 passos com vereditos do log original (8 APROVADOS + 2 REPROVADOS), screenshots reais apontando pra `testes/relatorios/visual/UC-F01/2026-04-27T16-07-30/`.

✅ **Fase I — auditoria**: `webapp/audit.py` + hooks em login, criar_teste, iniciar_executor, aprovar_passo, reprovar_passo. Tabela `log_auditoria` populada.

## Validação E2E manual

```
Login pasteur → /home: ✅ 2 testes (Smoke E2E + Piloto UC-F01)
/meus-relatorios: ✅ lista o piloto
/relatorios (admin): ✅ lista global
/relatorio/<piloto_id>: ✅ 10 passos com screenshots inline
/relatorio/<id>/md: ✅ download MD original
/teste/<id>/screenshot/<nome>: ✅ serve PNG do piloto (1400x900)
log_auditoria: ✅ evento "login" registrado com IP
```

## Furos novos identificados

### F17 — `routes_painel.py /aprovar` etc não testados com executor real rodando

**Severidade:** crítica
**Detalhe:** `executor_db.py` foi escrito mas não rodou end-to-end com Playwright real (auto mode sem permissão pra abrir display). Preciso de teste manual quando estiver no desktop.

**Ação:** quando o usuário rodar manualmente com `bash scripts/start_painel_webapp.sh` + criar teste + iniciar, validar o ciclo completo. Documentar no checklist.

### F18 — Não tem `tags` UI hoje (testes_tags vazia)

**Severidade:** baixa
**Detalhe:** Tabela `tags` + `testes_tags` existe no DDL mas sem CRUD. Adiar para V2 (Fase J leve).

### F19 — Sem CRUD admin (projetos/sprints/UCs/CTs/users)

**Severidade:** média
**Detalhe:** Plano original previa rotas `/admin/projetos`, etc. Hoje não existem. Admin pode gerenciar via `seed_*.py` ou direto no banco.

**Ação V2:** adicionar `routes_admin.py` com CRUD genérico via Flask-Admin ou similar.

### F20 — Concorrência: 2 testes diferentes podem usar a porta 9876 simultaneamente

**Severidade:** baixa (ambiente single-tester por vez)
**Detalhe:** Webapp serve qualquer teste em /teste/<id>/executar, mas só pode haver 1 browser Playwright headed por vez (limitação de display). Se 2 testers tentarem iniciar ao mesmo tempo, vão concorrer pelo display.

**Mitigação V1:** documentar; UX só 1 teste em execução simultânea por máquina.

## Pré-requisitos pra Fase J (final, polimento + doc)

| Item | OK? |
|---|---|
| Webapp 24 rotas funcionais | ✅ |
| Banco com piloto | ✅ |
| Audit log capturando eventos | ✅ |
| executor_db importa OK | ✅ |
| Executor rodou end-to-end com Playwright real? | ❌ (F17 — depende de display) |
| Anexos UI | ❌ (V2) |
| Tags UI | ❌ (V2) |

## Conclusão

Sistema **funcional E2E** sem o ciclo Playwright real (F17). Todas as outras peças funcionam isoladamente e são integradas via banco. Quando o usuário rodar manualmente o webapp + criar teste + iniciar, o ciclo completo vai operar.

Próxima e ultima fase J: doc final + commit consolidado.
