# REGISTRO DE CONTEXTO — Sessão 28/04/2026 13:30

**Snapshot completo** do trabalho desta sessão antes de compactar contexto.
Próximo agente que abrir esta sessão deve ler este doc primeiro pra entender onde paramos.

---

## TL;DR

Sistema **testesvalidacoes** (app de validação visual da Sprint 1 do Facilicita.IA) em **estado funcional V1**. Backend Flask REST :5060 + Frontend React Vite :5181 + Banco MySQL `testesvalidacoes`. CT-F01-FP executa end-to-end via UI. Faltam apenas: cadastrar passos dos UCs F02..F17, pre-flight check, "Re-executar CT".

---

## Arquitetura final

```
[Browser :5181]                       [Backend Flask :5060]
   ├── /login                          ├── POST /api/login (cookie session)
   ├── /  (Home)                       ├── GET  /api/me, /api/projetos, ...
   ├── /novo (NovoTeste)               ├── GET  /api/sprints/<id>/ucs-resumo (NOVO)
   ├── /teste/<id> (Teste)             ├── POST /api/testes (uc_ids[] + ciclo unico)
   └── /relatorio/<id> (Relatorio)     ├── POST /api/testes/<id>/iniciar (subprocess.Popen)
       │                               └── GET  /api/testes/<id>/relatorio
       │ proxy /api → :5060
       ▼                       ┌────────────────────────────────────┐
                               │  subprocess: executor_sprint1.py   │
                               │   ├── Lê passos_tutorial do banco  │
                               │   ├── Sobe Chromium headed         │
                               │   ├── Sobe painel Flask :9876      │
                               │   │   (index.html + controle.js    │
                               │   │    INTACTOS do executor.py)    │
                               │   └── Persiste passos_execucao     │
                               │       + screenshots em disco       │
                               └────────────────────────────────────┘
                                            ▼
                                  [MySQL testesvalidacoes]
                                  (16 tabelas, 17 UCs, 201 CTs)
```

---

## Estrutura de diretórios criada

```
/mnt/data1/progpython/agenteditais/

├── testes/framework_visual/         ← código Python existente + novo
│   ├── executor.py                  ← original, INTACTO (nunca tocar)
│   ├── executor_sprint1.py          ← NOVO — DB-aware, lê passos do banco
│   ├── painel.py                    ← original, INTACTO
│   ├── parser.py                    ← original, INTACTO
│   ├── relatorio.py                 ← original, INTACTO
│   ├── painel_assets/               ← do painel :9876
│   │   ├── index.html               ← painel original (durante exec)
│   │   ├── controle.js              ← polling do painel
│   │   └── style.css
│   ├── api/                         ← NOVO — Flask REST
│   │   ├── __init__.py
│   │   └── server.py                ← 15 endpoints JSON
│   ├── db/                          ← NOVO — SQLAlchemy + migrations
│   │   ├── engine.py                ← conexão isolada testesvalidacoes
│   │   ├── models.py                ← 16 classes ORM
│   │   ├── ddl.sql                  ← schema completo
│   │   └── migrations/
│   │       ├── 001_pediu_continuar_em_passos.sql
│   │       ├── 002_simplificar_conjuntos_e_anexos.sql
│   │       └── 003_datasets_e_passos_tutorial.sql
│   └── seed/                        ← NOVO — popular banco
│       ├── seed_testesvalidacoes.py ← projeto + sprint + UCs + CTs + 7 users
│       ├── importar_tutorial_uc_f01.py ← lê arquivos disco, popula passos_tutorial
│       ├── seed_piloto_ucf01.py     ← migração retroativa do teste piloto
│       └── parse_cts_v7.py          ← parser do doc V7 markdown

├── testes_validacoes_ui/            ← NOVO — projeto Vite/React
│   ├── package.json
│   ├── vite.config.js               ← porta 5181 + proxy /api → :5060
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                  ← AuthProvider + router
│       ├── api.js                   ← wrapper de fetch com cookies
│       ├── index.css                ← layout dark herdado do painel
│       └── pages/
│           ├── Login.jsx
│           ├── Home.jsx             ← dashboard + KPIs + tabelas
│           ├── NovoTeste.jsx        ← REFATORADO: seleção por UC
│           ├── Teste.jsx            ← visão do teste + botão Iniciar
│           ├── Relatorio.jsx        ← screenshots inline + observações
│           └── Topbar.jsx

└── docs/
    ├── planejamentoautomaticovisualsprint1.md  ← plano detalhado
    ├── COMO_USAR_TESTESVALIDACOES.md            ← guia do tester
    ├── CRITERIOS PARA GERAR CTS A PARTIR DE UCS PELA IEEE829.md
    ├── CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V6.md (FA-07 incluído)
    ├── CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V7.md (201 CTs)
    ├── FUROS_E_PENDENCIAS_FASE_A.md ... _D_a_I.md (auditorias)
    └── REGISTROCONTEXTO28041330.md  ← este arquivo
```

---

## Banco MySQL — testesvalidacoes

**Servidor:** `camerascasas.no-ip.info:3308`
**Schema:** `testesvalidacoes` (separado de `editais`)
**Usuário:** `producao` / `112358123`

### 16 tabelas

| # | Tabela | Função |
|---|---|---|
| 1 | users | testers (3 admin: pasteur, arnaldo, tarcisio + 4 normais) |
| 2 | projetos | catálogo (1: Facilicita.IA) |
| 3 | sprints | (1: Sprint 1) |
| 4 | casos_de_uso | 17 UCs Sprint 1 (UC-F01..F17) com `conteudo_md` |
| 5 | casos_de_teste | 201 CTs (124 Cenário, 29 Classe, 37 Fronteira, 11 Combinado) |
| 6 | datasets (M003) | dados_json por (UC, trilha) |
| 7 | passos_tutorial (M003) | acoes_json + asserts_json por CT |
| 8 | testes | sessões de teste do tester |
| 9 | execucoes_caso_de_teste | 1 por CT no teste, com vereditos consolidados |
| 10 | passos_execucao | 1 por passo, com screenshots + vereditos + duração + JSON |
| 11 | observacoes | comentários do tester por passo |
| 12 | relatorios | MD final por teste |
| 13 | log_auditoria | quem fez o quê |
| 14 | anexos | uploads adicionais (ainda sem UI) |
| 15 | tags | (sem UI) |
| 16 | testes_tags | junção (sem UI) |

### Decisões de schema (D1-D5)

- **D1:** Schema separado (não tabela com prefixo)
- **D2:** Login com bcrypt + sessão Flask cookie
- **D3:** Retomada por CT (CT em execução reinicia do passo 0)
- **D4:** Campo `users.administrador` controla acesso a CRUD/relatórios alheios
- **D5:** Screenshots por **passo** (não por CT) → tabela `passos_execucao`

### Migrations aplicadas

1. **001** — `pediu_continuar` movido de `testes` → `passos_execucao`
2. **002** — Removidas tabelas redundantes `conjuntos_de_teste` + `conjunto_casos_de_teste`. `anexos.execucao_id` → `passo_execucao_id`. Índice em `testes(ciclo_id)`.
3. **003** — Adicionadas `datasets` (dados_json por UC+trilha) + `passos_tutorial` (acoes_json + asserts_json por CT). Permite mover tutoriais do disco para o banco.

### Dados populados

- 1 projeto, 1 sprint, 17 UCs, 201 CTs
- 7 usuários (3 admins: pasteur/arnaldo/tarcisio + 4 testers: marbei/marcelo/valida1/valida2)
- Senha de todos: `123456` (bcrypt)
- 1 dataset cadastrado (UC-F01 visual)
- **10 passos cadastrados em passos_tutorial pra CT-F01-FP** (único CT executável hoje)
- Piloto retroativo: 1 teste do `pasteur` "Piloto UC-F01 (retroativo)" com 10 passos + screenshots

---

## Endpoints REST (`api/server.py`)

```
GET  /healthz
POST /api/login           {email, senha}
POST /api/logout
GET  /api/me

GET  /api/projetos
GET  /api/projetos/<id>/sprints
GET  /api/sprints/<id>/ucs              ← detalhado com CTs
GET  /api/sprints/<id>/ucs-resumo       ← resumo só p/ UI de criação
GET  /api/testes                         ← meus testes (admin: ?todos=1)
GET  /api/testes/<id>                    ← detalhe + execucoes
POST /api/testes                         ← cria teste {uc_ids[] OU ct_ids[]}
                                            chama context_manager.criar_ciclo()
                                            gera CNPJ único + valida<N>
POST /api/testes/<id>/iniciar            ← spawn executor_sprint1.py via subprocess
POST /api/testes/<id>/cancelar
GET  /api/testes/<id>/relatorio
GET  /api/screenshot?path=...            ← serve PNGs com validação de path
```

**CORS:** restrito a `http://localhost:5181/5180`. Cookie `SameSite=Lax`.

---

## Páginas React (`testes_validacoes_ui/`)

| Página | Path | Funcionalidade |
|---|---|---|
| Login | `/login` | bcrypt + session cookie |
| Home | `/` | KPIs + tabela em andamento + histórico. Admin tem botão "Ver todos" |
| NovoTeste | `/novo` | **REFATORADA**: tabela de UCs com `n_cenario_visual_executavel`, marca por UC inteiro, gera ciclo único |
| Teste | `/teste/<id>` | Sumário + tabela de CTs do teste + botão "▶️ Iniciar" → spawn |
| Relatorio | `/relatorio/<id>` | Sumário + accordion por CT + screenshots inline |

### Fluxo end-to-end

1. Login `pasteur@valida.com / 123456`
2. Home → "➕ Novo Teste"
3. NovoTeste: escolhe Facilicita.IA + Sprint 1 → tabela mostra **só UC-F01 executável** + 16 não-executáveis em accordion
4. Marca checkbox UC-F01 → "Criar Teste (gera ciclo único)" → ciclo `teste-<uuid8>` criado automaticamente com `valida<N>` + CNPJ próprios
5. Redireciona pra `/teste/<id>` com botão "▶️ Iniciar Teste"
6. Click → backend faz `subprocess.Popen(executor_sprint1.py --teste_id ...)` + abre painel `:9876` em nova aba
7. Tester acompanha pelo painel `:9876` (Aprovar/Reprovar/Continuar a cada passo)
8. Final → `/relatorio/<id>` mostra screenshots + observações

---

## Como subir

```bash
# Terminal 1
cd /mnt/data1/progpython/agenteditais
python3 testes/framework_visual/api/server.py

# Terminal 2
cd /mnt/data1/progpython/agenteditais/testes_validacoes_ui
npm run dev

# Browser
http://localhost:5181
```

Pra matar:
```bash
PIDS=$(ss -lntp 2>/dev/null | grep -E ":(5060|5181|9876) " | grep -oE "pid=[0-9]+" | cut -d= -f2 | sort -u)
for p in $PIDS; do kill "$p" 2>/dev/null; done
```

---

## Histórico de commits desta sessão

```
75723db  feat: UC inteiro + ciclo unico + fix retomada (2026-04-28 13:28:04)
37d7563  milestone(2026-04-28 13:23:07): testesvalidacoes MVP inicial rodando
9ff5d81  feat: backend Flask REST + frontend React Vite
a27127b  feat: substituicao webapp por executor_sprint1.py + tabelas datasets/passos_tutorial
4700558  fix(db): migration 002 — simplificacao schema apos auditoria
a3c47de  feat: Fase A — banco MySQL + modelos + seed Sprint 1
83d83ba  feat(sprint1): V7 cobertura completa IEEE 829 (201 CTs) + doc normativo
```

---

## Decisões implementadas na última iteração (75723db)

### 1. Granularidade por UC (não CT)

**Antes:** tester selecionava CTs individuais. Risco: CT-F01-FA01 sem CT-F01-FP rodar antes → estado inconsistente.

**Agora:** tester seleciona **UC inteiro**. Backend expande automaticamente todos os CTs Cenário+visual+com_passos do UC, em ordem (FP → FAs → FEs).

`POST /api/testes` aceita `uc_ids[]` (preferido) ou `ct_ids[]` (legacy).

### 2. Ciclo único por teste (isolamento)

**Antes:** `ciclo_id` digitado pelo tester. Risco: 2 testes com mesmo ciclo → CNPJ duplicado → 409.

**Agora:** Backend chama `context_manager.criar_ciclo(ciclo_id="teste-<uuid8>")` automaticamente. Cada teste tem:
- CNPJ único (gerado via algoritmo RF)
- valida<N> sequencial (próximo livre, ex: valida7)
- 18 PDFs renderizados (contrato_social, CND, FGTS, etc)

**Validado:** teste criado em `787ba5bd...` → ciclo `teste-787ba5bd` com `valida7`.

### 3. Fix bug retomada (CT em_execucao perdido)

**Bug original:** `executor_sprint1.py:399` filtrava só `estado='pendente'`. CT que estava em `em_execucao` na pausa era ignorado na retomada.

**Fix:** antes do loop principal, executor agora:
1. Busca CTs `em_execucao` do teste
2. Apaga `passos_execucao` parciais (cascade leva observações junto)
3. Reseta `em_execucao → pendente`
4. Loop pega o CT como pendente normal e roda do passo 0

---

## O que ainda falta (futuro)

### Críticos (V1.1)
1. **Importar passos dos UCs F02..F17** — hoje só CT-F01-FP é executável. Pode usar:
   - Manual: 1 SQL INSERT por passo
   - Script gerador (parsea texto do UC.md → infere passos via heurística)
   - LLM-assistido com revisão manual
2. **Pre-flight check antes de iniciar:**
   - Facilicita.IA UP em :5180?
   - DISPLAY disponível?
   - UCs selecionados realmente têm passos?

### Melhorias (V2)
3. **Botão "Re-executar este CT"** no relatório
4. **Botão "Clonar teste"** (cria novo ciclo, mesma seleção de UCs)
5. **CRUD admin** pra gerenciar projetos/sprints/UCs/CTs/users via UI
6. **Tags + UI** pra classificar testes (regression/smoke/exploratorio)
7. **Anexos** (upload de logs/vídeos por passo)
8. **Métricas** dashboard (cobertura por sprint, taxa de aprovação)

---

## Estado das portas

| Porta | Quem | Permanente? |
|---|---|---|
| 5060 | Flask REST backend | Sim (sobe manual) |
| 5181 | Vite React dev | Sim (sobe manual) |
| 9876 | Painel do executor | Não — sobe e morre com cada teste |

---

## Pontos de atenção pra próximo agente

1. **NÃO MEXER em `executor.py`** — original, é a referência viva. Use `executor_sprint1.py`.
2. **NÃO MEXER em `painel.py` nem `painel_assets/index.html`/`controle.js`** — são do painel `:9876` que funciona durante a execução.
3. **Banco MySQL é remoto** (camerascasas.no-ip.info) — pode estar lento ou indisponível esporadicamente.
4. **Senhas em texto claro no .env** — aceitável em dev, NUNCA expor.
5. **Auto mode tem sido ativado/desativado durante a sessão** — verificar instruções vigentes.
6. **Usuário fala português coloquial e direto** — fica irritado quando o sistema é over-engineered. Manter simplicidade.
7. **Múltiplos restarts e refatorações ocorreram** — o estado atual é o "limpo" após desfazer uma webapp Flask gigante que estava acoplada (vide commit `a27127b`).

---

## Arquivos críticos pra próxima sessão

| Arquivo | Por quê |
|---|---|
| `testes/framework_visual/executor_sprint1.py` | Loop principal de execução |
| `testes/framework_visual/api/server.py` | REST backend |
| `testes/framework_visual/db/models.py` | Schema ORM |
| `testes_validacoes_ui/src/pages/NovoTeste.jsx` | UI mais complexa do frontend |
| `testes_validacoes_ui/src/api.js` | Cliente HTTP |
| `testes/framework_visual/seed/importar_tutorial_uc_f01.py` | Padrão pra cadastrar passos de outros UCs |
| `docs/planejamentoautomaticovisualsprint1.md` | Doc detalhado do plano |
| `docs/COMO_USAR_TESTESVALIDACOES.md` | Guia operacional |

---

*Documento gerado em 2026-04-28 13:30 antes de compactar contexto Claude Code.*
*Próximo: continuar de onde parou OU testar end-to-end no browser pra validar mudanças do commit `75723db`.*
