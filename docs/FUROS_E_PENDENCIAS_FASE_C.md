# Furos e Pendências — Fase C (Criação de teste)

**Data:** 2026-04-27
**Fase:** C (concluída) + análise prospectiva da Fase D

## Resumo

✅ Endpoints criados e testados:
- GET `/api/projetos`, `/api/projetos/<id>/sprints`, `/api/sprints/<id>/cts`
- GET `/teste/novo` (form com filtros + accordion)
- POST `/teste/novo` cria teste + conjunto + execucoes_caso_de_teste em transação
- GET `/teste/<id>/executar` mostra visão estática (placeholder pra Fase E)

✅ Validação E2E manual:
- Criação de teste "Smoke E2E auditoria" com CT-F01-FP
- Gravado em `testes` (estado=criado), `conjuntos_de_teste` e 1 `execucoes_caso_de_teste` pendente
- Aparece em /home

## Furos identificados

### F13 — Não há restrição de criação por admin/não-admin

**Severidade:** baixa
**Detalhe:** Qualquer logado pode criar teste em qualquer projeto/sprint. OK por design — testers não-admin podem criar testes próprios.

### F14 — Trilha "humana" filtra mas o sistema não tem suporte humano hoje

**Severidade:** baixa cosmética
**Detalhe:** O dropdown de trilha tem opção "humana" mas isso é só pra V2. Banco tem 0 CTs com trilha=humana hoje (parser não infere).

**Ação:** documentado, ok.

### F15 — Sem validação que CTs selecionados são da sprint informada

**Severidade:** média
**Detalhe:** O POST aceita `ct_ids` arbitrários, sem validar que pertencem à sprint selecionada. Tester malicioso poderia criar teste com CTs cruzados (ex: dados Sprint 1 + CTs Sprint 2 que não existe).

**Mitigação V1:** UI só mostra CTs da sprint selecionada via JS — usuário comum não consegue cruzar.

**Ação V2:** validar no backend.

### F16 — CT sem tutorial (variacao_tutorial NULL) entra no teste mas não vai executar

**Severidade:** alta — UX
**Detalhe:** Hoje o checkbox `disabled` se `tem_tutorial=false`. Mas o filtro "só com tutorial" pode ser desligado. Se tester selecionar CT sem tutorial, será marcado como `pulado` no executor (R8 do plano).

**Ação:** OK. Já há mensagem visual "(sem tutorial)" e o checkbox é disabled por padrão.

## Pré-requisitos pra Fase D

| Item | OK? |
|---|---|
| Banco com `passos_execucao` | ✅ |
| `pediu_continuar` em `passos_execucao` (F6) | ✅ |
| `executor.py` modo standalone funciona | ✅ (testado anteriormente com piloto) |
| `parser.carregar_tutorial` aceita uc_id+variacao+ciclo | ✅ |
| Subprocess.Popen disponível | ✅ |
| Capacidade de SIGTERM cap | ✅ (signal nativo Python) |
| Tutorial visual UC-F01_fp existe | ✅ |
| Tutorial visual de outros UCs | ❌ (F2 — fallback `pulado`) |

**Conclusão:** Fase D pode começar. Foco será refator do `executor.py` para modo `--teste_id` com persistência granular em `passos_execucao`.
