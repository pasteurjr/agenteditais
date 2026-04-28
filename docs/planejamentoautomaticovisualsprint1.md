# Planejamento — Automação Visual da Sprint 1

**Projeto:** Facilicita.IA (agenteditais)
**Sprint:** 1 — Empresa, Portfólio e Parametrização
**Data:** 2026-04-27
**Versão:** 1.0
**Autor:** equipe de QA + Claude Code

---

## 1. Objetivo

Cobrir **toda a Sprint 1 (124 CTs de Categoria=Cenário)** com a trilha de validação visual acompanhada, executados a partir de um app web permanente que:

- Persiste em banco MySQL dedicado (`testesvalidacoes`).
- Suporta múltiplos testers logados (auditoria por usuário).
- Permite pausar e retomar testes do ponto onde parou.
- Gera relatórios consolidados por teste, com screenshots e observações vinculados a passos específicos do tutorial.
- Distingue **administradores** (pasteur/arnaldo/tarcisio) de testers comuns no acesso a CRUDs e a relatórios alheios.

Esta é a **Fase 1 da automação visual**. Fases 2 (Classes, Fronteira) e 3 (Combinados) ficam para iterações posteriores.

---

## 2. Cobertura alvo da Fase 1

Conforme `docs/CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V7.md`:

| Categoria | Quantidade | Trilha desta fase |
|---|---|---|
| **Cenário** (FP + FAs + FEs) | **124** | **visual** ✅ |
| Classe | 29 | e2e (Fase 2) |
| Fronteira | 37 | e2e (Fase 2) |
| Combinado | 11 | e2e (Fase 3) |

Distribuição por UC:

| UC | Cenários | UC | Cenários |
|---|---|---|---|
| F01 | 11 | F10 | 6 |
| F02 | 9 | F11 | 5 |
| F03 | 9 | F12 | 4 |
| F04 | 10 | F13 | 4 |
| F05 | 9 | F14 | 6 |
| F06 | 9 | F15 | 7 |
| F07 | 9 | F16 | 6 |
| F08 | 8 | F17 | 7 |
| F09 | 5 | | |

Os 124 CTs Cenário **incluem o Fluxo Principal (FP) e todos os FAs/FEs documentados** nos UCs V6.

---

## 3. Decisões arquiteturais (D1–D5)

| ID | Decisão | Justificativa |
|---|---|---|
| **D1** | Banco `testesvalidacoes` é **schema separado** na mesma instância MySQL (`camerascasas.no-ip.info:3308`) | Reusa credenciais e conexão. Isolamento sem custo de infraestrutura |
| **D2** | Web app é o **painel Flask atual em `:9876` estendido** | Vira app permanente. Reusa `index.html`, `controle.js`, `painel.py` |
| **D3** | Retomada é **por CT** (granularidade) | CTs aprovados/reprovados são pulados; CT em andamento reinicia do passo 0. Simples e robusto |
| **D4** | Campo `users.administrador TINYINT(1)` controla acesso a CRUDs e relatórios globais | Apenas pasteur, arnaldo, tarcisio têm `administrador=1`. Não-admins veem só os próprios testes |
| **D5** | Screenshots gravados por **passo lógico do tutorial** (não por CT) | Nova tabela `passos_execucao` filha de `execucoes_caso_de_teste`. Permite query cross-teste por passo, observações vinculadas a passo específico |

---

## 4. Modelo de dados — banco `testesvalidacoes`

### 4.1 Diagrama lógico

```
projetos ──< sprints ──< casos_de_uso ──< casos_de_teste
                                              │
users ────────< testes ──< conjuntos_de_teste ──< conjunto_casos_de_teste >── casos_de_teste
                  │
                  └──< execucoes_caso_de_teste >── casos_de_teste
                              │
                              └──< passos_execucao ──< observacoes >── users
                                                  └── anexos >── users

testes ──< testes_tags >── tags
testes ──< relatorios
users   ──< log_auditoria
```

### 4.2 Tabelas

| # | Tabela | Propósito |
|---|---|---|
| 1 | `users` | Testers (login no app). Campo `administrador` define poderes |
| 2 | `projetos` | Catálogo de projetos (Facilicita.IA, futuros) |
| 3 | `sprints` | Sprints por projeto |
| 4 | `casos_de_uso` | UCs documentados com cache do markdown completo |
| 5 | `casos_de_teste` | 201 CTs categorizados (Cenário/Classe/Fronteira/Combinado) |
| 6 | `testes` | Sessão de teste — chave por (projeto, sprint, user, data) |
| 7 | `conjuntos_de_teste` | Agrupador de CTs por teste |
| 8 | `conjunto_casos_de_teste` | Junção ordenada de CTs no conjunto |
| 9 | `execucoes_caso_de_teste` | Resultado consolidado por CT no teste |
| 9b | `passos_execucao` | **D5** — granularidade por passo (screenshots, vereditos, durações) |
| 10 | `observacoes` | Texto livre do tester, vinculado a passo |
| 11 | `relatorios` | Markdown final + path do arquivo |
| 12 | `log_auditoria` | Quem fez o quê e quando |
| 13 | `anexos` | Uploads adicionais (vídeos, logs) |
| 14 | `tags` + `testes_tags` | Classificação livre (regressão, smoke...) |

### 4.3 Campos críticos da `passos_execucao` (D5)

```
id, execucao_id, ordem, passo_id, passo_titulo, descricao_painel,
screenshot_antes_path, screenshot_depois_path,
screenshot_antes_url, screenshot_depois_url,
veredito_automatico, veredicto_po,
duracao_ms, detalhes_validacao_json,
correcao_necessaria, correcao_descricao,
iniciado_em, concluido_em
```

DDL completo em `testes/framework_visual/db/ddl.sql`.

---

## 5. Aplicação web — Painel Flask permanente

### 5.1 Telas

| Tela | Path | Acesso |
|---|---|---|
| Login | `/login` | público |
| Home (testes do user) | `/home` | logado |
| Novo teste | `/teste/novo` | logado |
| Executar teste | `/teste/<id>/executar` | logado, dono ou admin |
| Meus relatórios | `/meus-relatorios` | logado |
| Relatório individual | `/relatorio/<teste_id>` | dono ou admin |
| **Lista global de relatórios** | `/relatorios` | **admin** |
| **CRUD admin** (projetos/sprints/UCs/CTs/users/tags) | `/admin/...` | **admin** |

### 5.2 Sessões e auth

- Sessão Flask via cookie (`SECRET_KEY` no `.env`).
- Decorators: `@login_required`, `@admin_required`.
- Hash de senha: bcrypt (reusa `backend/auth/jwt_utils.py`).

### 5.3 Comandos do tester durante execução

| Botão no painel | Endpoint | Efeito |
|---|---|---|
| ✅ Aprovar | `POST /teste/<id>/aprovar` | Marca `passos_execucao.veredicto_po='APROVADO'` |
| ❌ Reprovar | `POST /teste/<id>/reprovar` | Marca `'REPROVADO'` + `correcao_necessaria=1` |
| 💬 Comentário | `POST /teste/<id>/comentario` | INSERT em `observacoes` (vinculado ao passo atual) |
| ▶️ Continuar | `POST /teste/<id>/continuar` | Sinaliza ao executor para avançar |
| ⏸️ Pausar | `POST /teste/<id>/pausar` | SIGTERM no executor; teste fica em `pausado` |
| 🔄 Pular CT | `POST /teste/<id>/pular_ct` | Marca execução atual como `pulado` |

---

## 6. Fluxo de execução

```
[ Tester loga ]
       │
       ▼
[ /home ] ── ver histórico ── [ continuar teste pausado ]
       │                              │
       ▼                              ▼
[ /teste/novo ]            [ retomada: pula CTs aprovados ]
       │
   seleciona projeto, sprint, CTs (filtro Cenário+visual)
       │
       ▼
[ POST /teste/novo ]
   ├─> INSERT testes
   ├─> INSERT conjuntos_de_teste
   ├─> INSERT conjunto_casos_de_teste (ordem)
   └─> INSERT execucoes_caso_de_teste (todas pendente)
       │
       ▼
[ /teste/<id>/executar ] ── botão "Iniciar" ── spawn executor.py --teste_id <uuid>
       │
       ▼
[ Executor Playwright ]
   For cada execução pendente:
     For cada passo do tutorial:
       INSERT passos_execucao (ordem, passo_id, iniciado_em)
       Screenshot ANTES → UPDATE
       Ação Playwright
       Screenshot DEPOIS → UPDATE
       Validação automática (DOM/Rede) → UPDATE
       Escreve /tmp/painel_<teste_id>.json
       Polling no banco até veredicto_po setado
       UPDATE concluido_em
     Consolida vereditos no execucoes_caso_de_teste
   Concluído → INSERT relatorios → estado=concluido
```

---

## 7. Plano de execução (10 fases)

| Fase | Descrição | Estimativa | Critério de pronto |
|---|---|---|---|
| **A** | Banco + DDL + modelos SQLAlchemy + parser V7 + seed completo (projeto, sprint, 17 UCs, 201 CTs, 7 users) | 1-2 dias | `SELECT COUNT(*) FROM casos_de_teste` = 201; 7 users (3 admins) |
| **B** | Webapp esqueleto: login, home vazia, logout | 1 dia | Login com `pasteur@valida.com / 123456` chega em `/home` |
| **C** | Criação de teste: `/teste/novo` + APIs `/api/projetos/sprints/cts` | 1-2 dias | Criar teste com 3 CTs gera 1 testes + 1 conjunto + 3 execucoes pendente |
| **D** | Refator do executor (`--teste_id`) + IPC + polling de comandos no banco | 2-3 dias | `executor.py --teste_id X` lê do banco e executa; SIGTERM marca pausado |
| **E** | Painel HTTP no webapp + adaptar `controle.js` | 2 dias | Painel acessível em `/teste/<id>/executar`; aprovar/comentar persiste no banco |
| **F** | Retomada (pula CTs concluídos) + rehidratar histórico | 0.5-1 dia | Pausar no 2º CT, retomar → começa do CT 2 |
| **G** | Relatórios: lista, detalhe, download MD, geração ao concluir | 1-2 dias | `/relatorio/<id>` mostra screenshots inline + observações |
| **H** | Migration retroativa do piloto UC-F01 (10 passos com PNGs já existentes) | 0.5 dia | Login pasteur vê histórico com Piloto UC-F01 |
| **I** | Auditoria mínima + tags V1 | 1 dia | `log_auditoria` registra login/criar/aprovar/pausar/retomar |
| **J** | Polimento (anexos, métricas no home) | 1 dia | Doc final entregue |

**Total: 12-15 dias-pessoa.**

---

## 8. Verificação end-to-end

Após Fase G:

1. Banco: `SELECT COUNT(*) FROM casos_de_teste` → **201**
2. Banco: `SELECT email, administrador FROM users` → 7 linhas, 3 com `administrador=1`
3. Subir webapp: `bash scripts/start_painel_webapp.sh`
4. Login `pasteur@valida.com / 123456` → `/home` mostra "Piloto UC-F01" no histórico
5. Criar novo teste com filtro categoria=Cenário, trilha=visual, selecionar CT-F01-FP
6. Iniciar → Chromium headed abre, executa 10 passos
7. Aprovar passos 0-3, reprovar passo 4 com observação "Toast não apareceu", continuar até final
8. Banco final:
   - `SELECT estado FROM testes WHERE id=?` → `concluido`
   - `SELECT estado FROM execucoes_caso_de_teste WHERE teste_id=?` → `reprovado` (porque há passo reprovado)
   - `SELECT COUNT(*) FROM passos_execucao WHERE execucao_id=?` → **10** (D5 — todos persistidos)
   - `SELECT screenshot_antes_path, screenshot_depois_path FROM passos_execucao WHERE execucao_id=?` → 10 linhas, todos paths não null
   - `SELECT COUNT(*) FROM observacoes o JOIN passos_execucao p ON o.passo_execucao_id=p.id WHERE p.execucao_id=?` → ≥1
   - `SELECT path_arquivo FROM relatorios WHERE teste_id=?` → não null
9. `/relatorio/<id>` renderiza HTML com 10 pares de screenshots + observação no passo 4
10. **Retomada**: criar teste com 3 CTs, pausar no 2º, voltar à home, retomar → executor começa do CT 2
11. **Auditoria**: `SELECT acao FROM log_auditoria WHERE user_id=?` cobre login, criar_teste, aprovar_x, reprovar, pausar, retomar
12. **Acesso admin**: logado como `valida1@valida.com` (não-admin), tentar `/relatorios` → 403; `/admin/projetos` → 403; `/meus-relatorios` → 200

---

## 9. Riscos

| # | Risco | Mitigação |
|---|---|---|
| R1 | Concorrência (2 cliques em "Iniciar") | Lock por `testes.pid_executor`; verificação `os.kill(pid, 0)` antes de spawn |
| R2 | IPC arquivo JSON com race condition | Write+rename atômico (`os.replace`); único escritor (executor) |
| R5 | Retomada pode repetir um CT inteiro | Aceito em V1 (granularidade por CT, não por passo do CT) |
| R8 | CT sem tutorial visual disponível | Marca execução como `pulado` com observação automática; não bloqueia teste |
| R9 | Webapp não fica de pé sozinho | V1: script bash; V2: systemd unit |
| R12 | Senha "123456" no seed | Aceitável em dev; `SEED_PASSWORD` no `.env` para outros ambientes |

---

## 10. Cobertura de requisitos do usuário

| Pedido original | Coberto em |
|---|---|
| Banco `testesvalidacoes` com tabelas pra usuarios, projetos, sprints, casos de uso, casos de testes, testes (chaves usuario+projeto+data/hora), resultados de cada CT com observações | Modelo de dados (seção 4) — 14 tabelas |
| Linha do teste UC-F01 já feito preservada | Fase H — `seed_piloto_ucf01.py` |
| Login + senha + tela de seleção (teste já feito ou novo) | Fase B/C — `/login`, `/home` |
| Reiniciar do ponto que parou | Fase F — D3 (retomada por CT) |
| Sessão de relatórios | Fase G — `/relatorios` (admin) e `/meus-relatorios` (user) |
| Inserts pros UCs já existentes, projeto Facilicita, usuários (pasteur, arnaldo, tarcisio, marbei, marcelo, valida1, valida2 com `@valida.com / 123456`) | Fase A — `seed_*.py` |
| Forma de criar conjunto de teste novo | `/teste/novo` cria 1 conjunto por teste com CTs ordenados |
| Tester experiente — verificar e inferir requisitos novos | Auditoria, anexos, tags, KPIs no home (V1); compartilhamento, notificações, métricas avançadas (V2) |
| **Telas antes/depois gravadas associadas ao teste** | **D5 — tabela `passos_execucao` (granularidade por passo)** |
| **Campo administrador, só pasteur/arnaldo/tarcisio admins; admins acessam CRUDs e relatórios** | **D4 — `users.administrador` + `@admin_required`** |

---

## 11. Próximas iterações (V2)

Não escopadas nesta entrega:

- Compartilhamento por link público read-only de relatórios
- Notificações entre testers (quem aprovou, quem reprovou)
- Retomada por passo dentro de um CT
- SSO entre login do tester e usuários do app testado (`editaisvalida`)
- Sistema de migrations Alembic
- Dashboards de métricas avançado (cobertura por sprint, taxa de aprovação, tempo médio)
- Comparação entre execuções do mesmo CT ao longo do tempo
- Automação visual das categorias **Classe** (29 CTs) e **Fronteira** (37 CTs) — Fase 2
- Automação dos **Combinados pairwise** (11 CTs) — Fase 3
- Estender pra Sprints 2 a 9

---

## 12. Referências

- `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V6.md` — UCs Sprint 1
- `docs/CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V7.md` — 201 CTs categorizados IEEE 829
- `docs/CRITERIOS PARA GERAR CTS A PARTIR DE UCS PELA IEEE829.md` — doc normativo de geração
- `docs/VALIDACAOFACILICITA.md` — processo formal de validação V3
- `testes/framework_visual/` — código atual a estender
- `/home/pasteurjr/.claude/plans/composed-riding-porcupine.md` — plano técnico interno

---

*Documento normativo desta fase. Atualizar versão e data ao revisar.*
