# Furos e Pendências — Fase B (Webapp esqueleto)

**Data:** 2026-04-27
**Fase:** B (concluída) + análise prospectiva da Fase C

## Resumo

Fase B passou em todos os critérios:
- ✅ Webapp sobe em :9876 (`/healthz` retorna 200)
- ✅ Login pasteur (admin) e valida1 (não-admin) OK (302)
- ✅ Cookie de sessão persiste entre requisições
- ✅ /home discrimina admin (badge ADMIN + "Todos os Relatórios") vs não-admin
- ✅ Acesso a /home sem cookie redireciona pra /login
- ✅ Senha errada bloqueia com mensagem
- ✅ Logout funciona
- ✅ Migration 001 aplicada (F6 da Fase A resolvido)

---

## Furos novos identificados

### F9 — Sem CSRF protection nos forms POST

**Severidade:** média
**Fase:** B em diante

**Detalhe:** O webapp usa `flask.session` puro (cookie HMAC). Não há Flask-WTF nem CSRFProtect ativo. Forms POST `/login`, `/logout`, e os futuros `/teste/<id>/aprovar` etc. são suscetíveis a CSRF via form externo.

**Risco:** site malicioso poderia hospedar form que loga/aprova teste em nome do usuário com sessão ativa.

**Mitigação V1:** baixo risco em ambiente interno; webapp não exposto à internet. Documentar.

**Ação V2:** instalar `flask-wtf`, adicionar `CSRFProtect(app)` em `app.py`, hidden token nos templates.

---

### F10 — Sem invalidação de sessão prévia ao re-login

**Severidade:** baixa
**Fase:** B (login concorrente)

**Detalhe:** Mesma conta logada em 2 browsers cria 2 sessões válidas. Não há tabela `sessions` em banco — Flask cookie self-contained.

**Risco:** baixo — comportamento esperado pra app multi-browser. Token roubado é problema separado.

**Ação:** documentado, sem ação.

---

### F11 — Falta endpoint `/meus-relatorios` e `/relatorios` (referenciados no `home.html`)

**Severidade:** baixa
**Fase:** G

**Detalhe:** Os links em `home.html` apontam pra `/meus-relatorios` (todos) e `/relatorios` (admin). Endpoints ainda não existem — clicar resulta em 404.

**Risco:** quebra UX se tester clicar agora. Mas Fase G já está planejada para criar estes endpoints.

**Ação:** Fase G implementa ambos.

---

### F12 — Falta endpoint `/teste/novo` (referenciado em `home.html`)

**Severidade:** alta (impede uso real do sistema)
**Fase:** C (próxima)

**Detalhe:** Botão "Novo Teste" leva pra `/teste/novo` que ainda não existe. **A Fase C resolve.**

**Ação:** próxima fase.

---

## Pré-requisitos pra Fase C

| Item | OK? |
|---|---|
| /home renderiza corretamente | ✅ |
| current_user() retorna User | ✅ |
| @login_required redireciona | ✅ |
| @admin_required bloqueia não-admin | ✅ (testado mentalmente, vai pra teste real na Fase G) |
| API auxiliar `/api/projetos`, `/api/sprints`, `/api/cts` ainda não existe | ❌ → Fase C cria |
| Tabelas `testes`, `conjuntos_de_teste`, `conjunto_casos_de_teste`, `execucoes_caso_de_teste` existem | ✅ |
| Conhecimento do schema dos formulários (multi-select de CTs) | ✅ |

**Conclusão:** Fase C pode começar. F9/F10/F11 não bloqueiam. F12 é resolvido pela própria Fase C.
