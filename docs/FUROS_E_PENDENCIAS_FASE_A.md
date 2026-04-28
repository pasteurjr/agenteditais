# Furos e Pendências — Fase A da Automação Visual Sprint 1

**Data:** 2026-04-27
**Auditor:** automação (Claude Code)
**Objeto:** banco `testesvalidacoes`, modelos SQLAlchemy, parser V7, seed
**Fase auditada:** A (concluída) + análise prospectiva da Fase B (próxima)

---

## 1. Resumo executivo

Fase A passou em todos os critérios funcionais primários:
- ✅ 16 tabelas criadas no MySQL `testesvalidacoes`
- ✅ 1 projeto, 1 sprint, 17 UCs, 201 CTs (124 Cenário + 29 Classe + 37 Fronteira + 11 Combinado)
- ✅ 7 usuários, 3 admins (pasteur/arnaldo/tarcisio)
- ✅ Bcrypt verifica senha `123456` corretamente
- ✅ Idempotência confirmada (rodar seed 2x não cria nada novo)
- ✅ Encoding utf-8 preservado (acento "Cenário" intacto)
- ✅ Sem conflito de namespace `db.Base` vs `backend.Base`
- ✅ Parser V7 captura todos os 201 CTs (após bug fix da troca de UC)

Foram identificados **8 furos** — nenhum bloqueia a Fase B, mas devem ser resolvidos antes das fases D/E/G.

---

## 2. Furos identificados

### F1 — `flask-login` não instalado (impede Fase B padrão)

**Severidade:** baixa
**Fase impactada:** B (auth)

**Detalhe:** O plano falava em "flask-login opcional ou rolagem manual via flask.session". O `flask-login` **não está** instalado no ambiente. Como mitigação, vou usar `flask.session` puro (cookie HMAC do Flask) com decorator manual `@login_required`.

**Risco:** baixo — `flask.session` é nativo do Flask 3.0.3 (já instalado). Decorator manual é trivial.

**Ação:** seguir com `flask.session` na Fase B. Não instalar `flask-login` agora.

---

### F2 — Tutoriais visuais para os outros 16 UCs **não existem**

**Severidade:** alta
**Fase impactada:** E, G (execução de testes além do UC-F01)

**Detalhe:** Apenas `testes/tutoriais_visual/UC-F01_fp.md` existe. Os outros 16 UCs (F02..F17) não têm tutorial visual escrito. Resultado: ao criar um teste com qualquer CT que não seja `CT-F01-FP/FA0X/FE0X` cobrindo UC-F01, a execução marca `pulado` com observação "tutorial visual não disponível" (R8 do plano).

**Mitigação no plano:** R8 já cobre — a Fase E não bloqueia. Tester poderá criar testes mas com fallback `pulado`.

**Risco:** o tester pasteur pode criar teste com CT-F02-FP, achar que vai rodar e levar `pulado`. UI deve avisar **na criação** que tal CT não tem tutorial.

**Ação na Fase C:** no formulário `/teste/novo`, JavaScript marcar visualmente os CTs sem tutorial (cor cinza + label "sem tutorial"). Avisar tester antes de submeter.

**Ação posterior (fora desta fase):** escrever tutoriais para F02..F17 em sessões dedicadas.

---

### F3 — `variacao_tutorial` para Classes/Fronteira/Combinado é NULL por design

**Severidade:** informativa
**Fase impactada:** nenhuma (esperado)

**Detalhe:** 77 CTs (29 Classe + 37 Fronteira + 11 Combinado) têm `variacao_tutorial=NULL` porque não são executáveis pela trilha visual. São candidatos para `e2e` (Fase 2 do projeto).

**Risco:** zero — alinhado com decisão de Fase 1 só cobrir Cenário.

**Ação:** documentado no `planejamentoautomaticovisualsprint1.md`. Sem ação adicional.

---

### F4 — Falta `webapp/auth.py` e demais arquivos da Fase B (esperado)

**Severidade:** zero (planejado)
**Fase:** B em andamento

**Detalhe:** `webapp/__init__.py` está vazio. Nenhum `app.py`, `routes_*.py`, `auth.py`, `orchestrator.py` foi criado ainda. Será feito na Fase B.

**Ação:** Fase B (próxima).

---

### F5 — `pid_executor` na tabela `testes` não tem GC

**Severidade:** média
**Fase impactada:** D, E

**Detalhe:** Quando o webapp spawna o executor (via subprocess), grava `testes.pid_executor`. Se o executor crashar abruptamente sem capturar SIGTERM, o pid fica órfão no banco. O lock R1 (botão Iniciar bloqueado se pid_executor != null) impede re-spawn permanentemente.

**Risco:** tester perde acesso a "Iniciar" do teste indefinidamente.

**Mitigação V1:** webapp ao verificar lock, fazer `os.kill(pid, 0)` — se levantar `OSError`, considerar pid morto e zerar (PID-stale check). Isso já está mencionado em R1 do plano. Garantir implementação na Fase E.

**Ação na Fase E:** implementar `is_pid_alive()` em `orchestrator.py` antes de bloquear botão.

---

### F6 — Falta tabela/registro pra **comandos do tester** (continuar/aprovar) que o executor faz polling

**Severidade:** alta
**Fase impactada:** D (IPC)

**Detalhe:** O plano define que o executor faz polling no banco a cada 250ms procurando `veredicto_po IS NOT NULL` e `pediu_continuar=1`. Tem coluna `pediu_continuar` em `testes` (boa). Mas:

1. **`pediu_continuar` é por TESTE**, não por PASSO. Significa que se tester clicar Continuar antes do passo terminar, fica setado e o próximo passo já avança sem nova decisão. Bug grave.
2. Solução: mover `pediu_continuar` para tabela `passos_execucao` (1 flag por passo).

**Risco:** se não corrigido, o painel ignora o passo atual ao receber Continue.

**Ação:** ALTER TABLE — adicionar `pediu_continuar TINYINT(1) DEFAULT 0` em `passos_execucao` e remover de `testes` (ou só ignorar). Resolver na Fase D antes de implementar polling.

---

### F7 — Schema sem mecanismo de migrations versionadas

**Severidade:** média
**Fase impactada:** futura (V2)

**Detalhe:** Hoje uso `Base.metadata.create_all` (CREATE TABLE IF NOT EXISTS). Qualquer ALTER TABLE futuro (ex: F6 acima — adicionar `pediu_continuar` em passos_execucao) **não é refletido pelo create_all**. Mudanças de schema viram problema.

**Risco:** divergência entre `models.py` e banco real conforme o projeto evolui.

**Mitigação V1:** documentar TODAS as alterações em arquivos `db/migrations/NNN_descricao.sql`, rodar manualmente.

**Ação:**
1. Criar `testes/framework_visual/db/migrations/001_pediu_continuar_em_passos.sql` quando F6 for endereçado.
2. V2 considerar Alembic (já anotado no plano).

---

### F8 — Não há índice em `(teste_id, estado)` em `execucoes_caso_de_teste`

**Severidade:** baixa
**Fase impactada:** F (retomada)

**Detalhe:** A query principal da retomada é `SELECT * FROM execucoes_caso_de_teste WHERE teste_id = ? AND estado = 'pendente' ORDER BY ordem`. Tenho `KEY ix_exec_estado (estado)` mas filtrando por `teste_id` primeiro o índice não ajuda muito.

**Risco:** baixíssimo agora (10s de execuções), mas em escala (centenas de testes × dezenas de CTs cada) pode degradar.

**Ação:** adicionar `KEY ix_exec_teste_estado (teste_id, estado)` na Fase F.

---

## 3. Pré-requisitos pra Fase B (próxima)

| Item | OK? | Observação |
|---|---|---|
| Flask 3.0.3 instalado | ✅ | Confirmado |
| bcrypt 4.1.2 instalado | ✅ | Confirmado |
| `db.engine.get_db()` retorna sessão | ✅ | Testado |
| `User.password_hash` armazena bcrypt | ✅ | Verify roundtrip OK |
| Porta 9876 livre | ✅ | Confirmado |
| `painel_assets/index.html` reaproveitável como `executar.html` | ✅ | Mantido sem alteração |
| Pasta `painel_assets/` graváveis | ✅ | Permissões OK |
| `WEBAPP_SECRET_KEY` no .env | ✅ | Adicionado na Fase A |

**Conclusão:** Fase B pode começar sem bloqueios. Furos F1, F4 são endereçados na própria Fase B. Furos F5/F6/F7/F8 são endereçados nas fases D-F. Furo F2 é cosmético na Fase B/C (UI deve marcar tutoriais ausentes).

---

## 4. Plano de tratamento

| Furo | Quando resolver | Ação |
|---|---|---|
| F1 | Fase B | Usar `flask.session` puro (não instalar flask-login) |
| F2 | Fase C | UI marca CTs sem tutorial; criar tutoriais F02..F17 em sessão dedicada |
| F3 | — | Documentado, sem ação |
| F4 | Fase B–G | Implementar no curso natural |
| F5 | Fase E | Implementar `is_pid_alive` em orchestrator |
| F6 | Fase D | Migration 001 — mover `pediu_continuar` pra `passos_execucao` |
| F7 | Fase D em diante | Disciplina de criar arquivos `migrations/NNN_*.sql` |
| F8 | Fase F | ALTER TABLE adicionar índice composto |

---

## 5. Conclusão

**Aprovação para seguir Fase B: SIM.**

Fase A está sólida. Os 8 furos identificados são endereçáveis no curso natural das próximas fases — nenhum bloqueia o início da Fase B (esqueleto do webapp Flask com login + home).

---

*Documento gerado em 2026-04-27 durante auditoria automática pré-Fase B.*
