# Plano — Retomada, Pausa, Reinício e Adição de UCs em Testes

**Versão:** 1.0
**Data:** 2026-04-30
**Branch:** `validacao/20260430-tutoriais-idempotentes-uc-f13`

---

## Contexto

Hoje o app `testesvalidacoes` tem fluxo unidirecional:

1. Cria teste com lista de UCs.
2. Inicia → executor roda CTs em sequência.
3. Termina (concluido) ou é cancelado (terminal).
4. Não há retomada após cancelamento.
5. Não há adição de UCs ao teste depois de criado.
6. Cada teste = 1 ciclo isolado (1 usuário sintético + 1 empresa DEMO).

**Limitação real observada na sessão de 30/04/2026:** ao terminar UC-F01+F13+F02 num teste e querer adicionar UC-F04, o usuário tem que criar OUTRO teste. Mas isso gera novo `ciclo_id` (= novo usuário sintético + nova empresa DEMO), perdendo todos os pré-requisitos satisfeitos (vínculo usuario_empresa, hierarquia Área/Classe/Subclasse, contatos preenchidos). Pré-flight bloqueia ou faz tester refazer tudo.

---

## Modelo proposto — Teste com Rodadas

### Conceitos

**Teste** = container persistente que representa um conjunto de UCs sendo validados. Identidade: `(titulo, sprint_id, lista canônica de uc_ids)`. Tem N **rodadas**.

**Rodada (Run)** = execução completa, com ciclo isolado próprio. Cada rodada tem:
- `numero` sequencial (1, 2, 3, ...)
- `ciclo_id` próprio (formato: `teste-<8chars do teste_id>-r<numero>`)
- **Novo usuário sintético** (próximo `valida<N>@valida.com.br` disponível)
- **Nova empresa DEMO** (CNPJ gerado, prefixo `DEMO <8chars>r<N> Comércio…`)
- `estado` (criado/em_andamento/pausado/concluido/cancelado)
- N execuções de CT (passos, observações, screenshots, relatório)
- `iniciado_em`, `concluido_em`, `pid_executor`

O **estado do teste** = estado da rodada **atual** (a última criada).

### Operações por estado da rodada atual

| Estado atual | Pausar | Retomar | Adicionar UCs | Reiniciar do zero |
|---|---|---|---|---|
| em_andamento | ✅ vira `pausado` | — | — | — |
| pausado | — | ✅ continua de onde parou (mesmo browser logo, executor relança Playwright) | ✅ insere UCs novos como `pendente` | ✅ cria rodada nova |
| concluido | — | — | ✅ insere UCs novos como `pendente`, rodada vira `pausado` | ✅ cria rodada nova |
| cancelado | — | — | — | ✅ cria rodada nova |

### Decisões de produto (CONFIRMADAS)

1. **Terminologia:** "rodada" (PT-BR). Run = sinônimo técnico no código.
2. **Reiniciar do zero PRESERVA rodadas anteriores.** Nada é apagado. A rodada antiga fica no histórico, com seus passos/observações/screenshots/relatório intactos. Acessível navegando no relatório consolidado.
3. **Reiniciar do zero CRIA novo usuário e nova empresa DEMO.** A empresa/usuário da rodada anterior permanecem no banco `editais` (não apaga). Como CNPJ é único por geração, não há colisão.
4. **Adicionar UCs** insere CTs na ordem topológica correta (predecessores antes), respeitando os UCs já executados na rodada atual.
5. **Retomar** continua de onde parou na MESMA rodada — reusa `ciclo_id`, mesmo usuário, mesma empresa. Pré-requisitos já satisfeitos continuam válidos.
6. **Visibilidade:** tela do teste mostra contexto do ciclo (usuário, empresa, hierarquia criada, vínculos). Relatório também.

---

## Mudanças de schema

### Tabela nova `runs_teste`

```sql
CREATE TABLE runs_teste (
  id VARCHAR(36) PRIMARY KEY,
  teste_id VARCHAR(36) NOT NULL,
  numero INT NOT NULL,
  ciclo_id VARCHAR(120) NOT NULL UNIQUE,
  user_sintetico_id VARCHAR(36),
  user_sintetico_email VARCHAR(255),
  empresa_demo_cnpj VARCHAR(18),
  empresa_demo_razao VARCHAR(255),
  estado ENUM('criado','em_andamento','pausado','concluido','cancelado') DEFAULT 'criado',
  pid_executor INT NULL,
  iniciado_em DATETIME NULL,
  concluido_em DATETIME NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teste_id) REFERENCES testes(id) ON DELETE CASCADE,
  UNIQUE KEY uq_teste_numero (teste_id, numero),
  INDEX idx_teste (teste_id),
  INDEX idx_estado (estado),
  INDEX idx_ciclo (ciclo_id)
);
```

### Coluna nova em `execucoes_caso_de_teste`

```sql
ALTER TABLE execucoes_caso_de_teste
  ADD COLUMN run_id VARCHAR(36) NULL AFTER teste_id,
  ADD INDEX idx_run (run_id),
  ADD CONSTRAINT fk_run FOREIGN KEY (run_id) REFERENCES runs_teste(id) ON DELETE CASCADE;
```

### Coluna nova em `testes`

```sql
ALTER TABLE testes
  ADD COLUMN uc_ids_canonicos JSON NULL AFTER descricao;
-- lista canonica dos UCs do teste, usada quando "Reiniciar do zero" cria
-- nova rodada com a mesma lista. Adicionar UCs muda essa lista.
```

### Migration de dados existentes

Para cada teste já existente:
1. Criar 1 rodada (`numero=1`) com:
   - `ciclo_id` ← `testes.ciclo_id`
   - `estado` ← `testes.estado`
   - `iniciado_em` ← `testes.iniciado_em`
   - `concluido_em` ← `testes.concluido_em`
   - `pid_executor` ← `testes.pid_executor`
2. Popular `execucoes_caso_de_teste.run_id` ← rodada criada
3. Popular `testes.uc_ids_canonicos` ← lista distinta de `casos_de_uso.id` agregada das execuções
4. Manter campos antigos em `testes` (compat) — depreciar gradualmente.

Após migration, regra de invariante:
- `testes.estado` = estado da última rodada (calculado dinamicamente OU sincronizado por trigger).

---

## Endpoints novos

### `POST /api/testes/<id>/pausar`
- Só funciona se rodada atual estiver `em_andamento`.
- Manda `POST /parar` no painel `:9876` (que seta `evento_parar` no executor).
- Executor termina o CT atual, marca CTs restantes como `pendente`, sai.
- Rodada vira `pausado`.

### `POST /api/testes/<id>/retomar`
- Só funciona se rodada atual estiver `pausado` ou `concluido`.
- Se `concluido` mas tem CTs `pendente` (foram adicionados depois), spawna executor.
- Reusa `ciclo_id` da rodada atual → mesmo usuário sintético, mesma empresa.
- Internamente é o `/api/testes/<id>/iniciar` adaptado pra aceitar estado pausado.

### `POST /api/testes/<id>/adicionar-ucs`
Body: `{uc_ids: ["uuid1", "uuid2", ...]}`
- Aceita só se rodada atual estiver `pausado`, `concluido` ou `cancelado` (NÃO em em_andamento).
- Filtra UCs que já estão na rodada atual (não duplica). Recomendado mostrar no frontend só os ainda não incluídos.
- Resolve ordem topológica considerando UCs já executados (predecessores satisfeitos).
- Insere `ExecucaoCasoDeTeste` com `estado='pendente'` na ordem certa, após os existentes.
- Atualiza `testes.uc_ids_canonicos`.
- Se rodada estava `concluido`, transiciona pra `pausado`.

### `POST /api/testes/<id>/reiniciar`
- Aceita em qualquer estado.
- Se rodada atual está `em_andamento`, recusa (peça pra pausar/cancelar antes).
- Cria nova rodada com `numero=último+1`:
  - Novo `ciclo_id` = `teste-<8chars>-r<numero>`
  - **Provisiona** novo ciclo via `criar_ciclo()` → novo CNPJ + novo usuário sintético `valida<N+1>@valida.com.br`
- Insere `ExecucaoCasoDeTeste` com `run_id` da nova rodada, `estado='pendente'`, baseado em `testes.uc_ids_canonicos`
- Marca rodada anterior como `concluido` (se estava `pausado`/`concluido`) — fica histórica.
- Retorna `run_id` da nova rodada (frontend pode auto-iniciar).

### `GET /api/testes/<id>/runs`
- Lista todas as rodadas do teste, em ordem `numero ASC`.
- Cada item: `id, numero, ciclo_id, estado, user_sintetico_email, empresa_demo_cnpj, iniciado_em, concluido_em, total_passos, aprovados, reprovados, observacoes`.

### `GET /api/runs/<run_id>/relatorio` (e .md, .docx, .pdf)
- Mesma estrutura que `/api/testes/<id>/relatorio` mas escopado a 1 rodada.
- Recebe `run_id`. O relatório atual de teste vira: relatório da rodada **atual**.

### `GET /api/testes/<id>/ciclo`
- Devolve dict com:
  ```json
  {
    "rodada_atual": { "numero": 2, "ciclo_id": "teste-xxx-r2", "estado": "pausado" },
    "usuario": { "email": "valida73@valida.com.br", "id": "..." },
    "empresa": { "cnpj": "42.513.511/3373-80", "razao": "DEMO xxxr2 Comércio...", "id_no_editais": "..." },
    "hierarquia": { "areas": 2, "classes": 3, "subclasses": 3 },
    "vinculos": { "usuario_empresa": 1 },
    "evidencias_dir": "testes/relatorios/visual/teste_xxx_2026-...",
    "contexto_yaml_path": "testes/contextos/teste-xxx-r2/contexto.yaml"
  }
  ```

---

## Mudanças no executor_sprint1.py

Mínimas — o executor já filtra CTs por `estado='pendente'` em ordem. Adicionar:

1. Aceitar argumento `--run_id` (opcional, default = última rodada do teste).
2. Filtrar `ExecucaoCasoDeTeste` por `(teste_id, run_id, estado='pendente')`.
3. Marcar `runs_teste.estado` em vez de só `testes.estado`.
4. Diretório de evidências: `teste_<8chars>_r<numero>_<timestamp>` (inclui número da rodada).
5. Carregar `contexto.yaml` da rodada (`testes/contextos/<ciclo_id_da_rodada>/`).

---

## Mudanças no frontend

### Tela do teste (`Teste.jsx`)

Card novo no topo: **Contexto do Ciclo (Rodada N)**
```
🔄 Rodada 2 de 3 (atual)  [seletor pra ver outras]
👤 Usuário: valida73@valida.com.br
🏢 Empresa: DEMO f425e4dd r2 Comércio... (CNPJ 42.513.511/3373-80)
📂 Hierarquia: 2 áreas + 3 classes + 3 subclasses
🔗 Vínculos: 1
```

Botões de ação (mostrados conforme estado da rodada atual):
- ⏸️ **Pausar** — em_andamento
- ▶️ **Retomar** — pausado
- ➕ **Adicionar UCs** — pausado/concluido/cancelado
- 🔄 **Reiniciar do zero** — qualquer estado terminal
- ⏹️ **Cancelar** — em_andamento (já existe)
- 📄 **Ver Relatório (rodada atual)** — sempre
- 📚 **Histórico de rodadas** — se houver mais de 1

### Tela de relatório (`Relatorio.jsx`)

URL muda para `/relatorio/<teste_id>/run/<numero>` (legado `/relatorio/<teste_id>` redireciona pra rodada mais recente).

Topo da tela: dropdown "Rodada N" com lista de rodadas. Trocar mostra outro relatório.

### Tela nova: histórico de rodadas

`/teste/<teste_id>/historico` — tabela:
| # | Estado | Iniciado | Concluído | Passos | Aprov | Reprov | Empresa | Usuário | Ações |
|---|---|---|---|---|---|---|---|---|---|
| 1 | concluido | 16:00 | 16:05 | 12 | 12 | 0 | DEMO ...r1 | valida73 | [Relatório] |
| 2 | pausado | 16:30 | — | 8/12 | 8 | 0 | DEMO ...r2 | valida74 | [Relatório] [Retomar] |

### Modal "Adicionar UCs"

Lista de UCs executáveis da sprint que **não estão** na rodada atual. Multi-select. Ao confirmar, chama `/api/testes/<id>/adicionar-ucs`.

### Modal "Reiniciar do zero" — confirmação

```
Tem certeza? Isso vai criar a Rodada 3 do teste com:
- Novo usuário sintético (próximo valida<N> disponível)
- Nova empresa DEMO (novo CNPJ)
- Mesmos UCs da rodada atual (todos pendentes)

A Rodada 2 atual ficará no histórico como "concluido" e seus relatórios continuam acessíveis.

[Cancelar]  [Confirmar e iniciar nova rodada]
```

---

## Ordem de implementação

### Fase 1 — backend (schema + endpoints sem UI)

1. Migration `001_runs_teste.sql`: cria tabela `runs_teste`, coluna `run_id` em `execucoes_caso_de_teste`, coluna `uc_ids_canonicos` em `testes`. Migra dados existentes.
2. Modelo SQLAlchemy `RunTeste` em `db/models.py`.
3. `_montar_relatorio_dict` aceita `run_id` opcional.
4. `executor_sprint1.py` aceita `--run_id`.
5. Endpoint `GET /api/testes/<id>/runs`.
6. Endpoint `GET /api/testes/<id>/ciclo`.
7. Endpoint `GET /api/runs/<run_id>/relatorio` (+ .md/.docx/.pdf).
8. Endpoint `POST /api/testes/<id>/pausar`.
9. Endpoint `POST /api/testes/<id>/retomar`.
10. Endpoint `POST /api/testes/<id>/adicionar-ucs`.
11. Endpoint `POST /api/testes/<id>/reiniciar`.
12. Validar tudo via curl. Backend reiniciado e healthcheck OK.

### Fase 2 — frontend

1. `api.js`: novos métodos.
2. `Teste.jsx`: card de contexto do ciclo + botões novos (Pausar, Retomar, Adicionar UCs, Reiniciar).
3. Modal "Adicionar UCs".
4. Modal "Reiniciar do zero" (confirmação).
5. Página nova `/teste/<id>/historico` com tabela de rodadas.
6. `Relatorio.jsx`: dropdown de rodadas.
7. CSS dos novos elementos.

### Fase 3 — testes manuais

1. Criar teste novo, executar até pausar.
2. Retomar — confirmar reusa ciclo.
3. Adicionar UCs — confirmar pré-flight aceita predecessores satisfeitos.
4. Concluir.
5. Reiniciar do zero — confirmar nova rodada com novo user/empresa.
6. Comparar relatórios das 2 rodadas.
7. Histórico exibe ambas.

### Fase 4 — atualização docs e memórias

1. Atualizar `PROCESSO_VALIDACAO_VISUAL_AUTOMATIZADA.md` com fluxo de retomada.
2. Memória persistente: `feedback_rodadas_teste.md` com regras de quando criar rodada nova vs reaproveitar atual.

---

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Migration de dados em testes legados quebra relatórios antigos | Migration cria rodada `numero=1` retroativa e popula `run_id` em todas execuções existentes. Relatórios antigos continuam funcionando via redirect `/relatorio/<id>` → rodada mais recente. |
| Provisionamento de novo ciclo demora (gera CNPJ via API ou seed) | Mesmo fluxo de hoje (`criar_ciclo()`). Tempo aceitável (~3s). |
| Múltiplas rodadas concorrentes do mesmo teste | Bloqueado: só 1 rodada `em_andamento` por teste. Painel `:9876` continua singleton global. |
| Empresas DEMO acumulando no banco editais | Aceitável (cada CNPJ único). Limpeza manual via `DELETE WHERE razao_social LIKE 'DEMO %'` quando o usuário quiser. Não automatiza. |
| Usuários sintéticos `valida<N>` esgotando | Existe pool grande (`valida1..valida100+` no banco). Se esgotar, criar mais via seed. |
| Adicionar UC com predecessores fora da rodada | Pre-flight fica permissivo: predecessor satisfeito = `aprovado` em qualquer execução **da mesma rodada** (não conta rodadas anteriores — política autocontida da rodada). |

---

## Compat backwards

- Endpoint `/api/testes/<id>/iniciar` continua funcionando — agora ele cria/retoma a rodada atual automaticamente.
- Endpoint `/api/testes/<id>/relatorio` continua funcionando — devolve relatório da rodada atual (último `numero`).
- Tabela `testes` mantém colunas `ciclo_id`, `estado`, `pid_executor`, `iniciado_em`, `concluido_em` por compat. Calculadas dinamicamente a partir da rodada atual (ou populadas por trigger).

---

## Implementação

A partir daqui, codificação direta sem mais decisões de produto. Cada fase commitada separadamente para facilitar review.
