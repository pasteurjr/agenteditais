# Verificacao da Sprint 5 — CRM e Execucao de Contratos

**Data:** 09/04/2026
**Referencia:** CASOS DE USO SPRINT5 V3.md + SPRINT 5 VF
**Empresa de teste:** CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda.
**Usuario:** valida1@valida.com.br / 123456
**URL:** `http://pasteurjr.servehttp.com:5179`
**Publico:** Validador Automatizado (Playwright) e Dono do Produto

---

## Indice

1. [Resumo da Sprint 5](#resumo-da-sprint-5)
2. [O Que Foi Implementado](#o-que-foi-implementado)
3. [Pre-requisitos](#pre-requisitos)
4. [Credenciais e Fluxo de Acesso](#credenciais-e-fluxo-de-acesso)
5. [Dados de Referencia da Sprint 5](#dados-de-referencia)
6. [Parte A — CRM (UC-CRM01 a CRM07)](#parte-a--crm)
7. [Parte B — Execucao (UC-CT07 a CT10)](#parte-b--execucao)
8. [Ordem Recomendada de Execucao](#ordem-recomendada-de-execucao)
9. [Checklist Final](#checklist-final)

---

## Resumo da Sprint 5

A Sprint 5 fecha o ciclo comercial do Agente de Editais cobrindo **tudo o que acontece depois que o edital ja esta no pipeline**: acompanhar a venda ate o ganho, executar o contrato, auditar a execucao financeira e monitorar vencimentos/renovacoes.

A versao V3 traz **11 novos casos de uso** divididos em 2 grupos:

### Grupo A — Execucao de Contratos (UC-CT07 a CT10)
Expansao da ProducaoPage com controle financeiro-fiscal dos contratos ganhos.

- **UC-CT07** — Controle de Empenhos (hierarquia Contrato → Empenho → Itens → Faturas → Entregas com calculo automatico de saldo)
- **UC-CT08** — Auditoria Empenho x Fatura x Entrega x Saldo (reconciliacao com exportacao CSV)
- **UC-CT09** — Dashboard de Contratos a Vencer (5 tiers: 30d, 90d, tratativa, renovados, nao renovados)
- **UC-CT10** — KPIs de Execucao (6 indicadores agregados)

### Grupo B — CRM e Pipeline de Vendas (UC-CRM01 a CRM07)
Reescrita completa da CRMPage substituindo dados mock por pipeline real.

- **UC-CRM01** — Pipeline Kanban com 13 estagios do fluxo comercial
- **UC-CRM02** — Parametrizacoes do business (Tipos de Edital, Agrupamento Portfolio, Motivos de Derrota)
- **UC-CRM03** — Mapa geografico de distribuicao dos editais por UF
- **UC-CRM04** — Agenda de compromissos (manual + auto-gerado a partir de prazos de editais)
- **UC-CRM05** — 14 KPIs de performance comercial
- **UC-CRM06** — Registro de decisoes de nao-participacao com motivos parametrizados
- **UC-CRM07** — Registro de perdas definitivas com flag de contra-razao

### Visao Geral do Fluxo

```
Captacao → Analise → Proposta → Submissao → Resultado
   │          │         │          │           │
   └──────────┴─────────┴──────────┴───────────┤
                                                ▼
                                          CRM Pipeline
                                          (visao kanban)
                                                │
                                                ▼
                                            GANHOU
                                                │
                                                ▼
                                      Contrato Assinado
                                                │
                                    ┌───────────┼───────────┐
                                    ▼           ▼           ▼
                               Empenhos    Entregas    Aditivos
                                    │           │           │
                                    └───────────┼───────────┘
                                                ▼
                                          Auditoria
                                                │
                                                ▼
                                       Contrato Vencendo
                                                │
                                                ▼
                                    Tratativa → Renovado
                                              ou Encerrado
```

---

## O Que Foi Implementado

### Backend

**Novas tabelas:**
- `empenhos` — registra empenhos com numero, tipo, valor, data, fonte de recurso
- `empenho_itens` — itens contratados com flag `gera_valor` para alertas de consumo
- `empenho_faturas` — faturas vinculadas ao empenho com status (pendente/paga/cancelada)
- `crm_parametrizacoes` — valores parametrizaveis por empresa (tipo_edital, agrupamento_portfolio, motivo_derrota)
- `edital_decisoes` — registro de decisoes de nao-participacao e perdas definitivas
- `crm_agenda_items` — itens de agenda do CRM (manuais)

**Colunas adicionadas:**
- `editais`: pipeline_stage, pipeline_substage, pipeline_tipo_venda, tipo_edital_id, agrupamento_portfolio_id, vendedor_responsavel
- `contratos`: tratativa_status, tratativa_observacoes, data_renovacao
- `contrato_entregas`: fatura_id, empenho_item_id

**Novos endpoints:**

Blueprint `empenho_routes.py`:
- `GET /api/contratos/{id}/empenhos` — lista com saldo calculado
- `GET /api/empenhos/{id}/saldo` — saldo + itens + faturas
- `GET /api/empenhos/{id}/alertas-consumo` — alertas de itens sem valor acima do limite
- `GET /api/contratos/{id}/auditoria-empenhos` — reconciliacao
- `GET /api/contratos/{id}/auditoria-empenhos/export?format=csv` — export CSV
- `GET /api/dashboard/contratos-vencer` — 5 tiers
- `PUT /api/contratos/{id}/tratativa` — atualizar workflow
- `GET /api/dashboard/kpis-execucao` — 6 KPIs

Blueprint `crm_routes.py`:
- `GET /api/crm/pipeline` — 13 stages agrupados
- `PUT /api/editais/{id}/pipeline-stage` — mover edital entre stages
- `POST /api/crm/parametrizacoes/seed` — popular 28 valores padrao
- `GET /api/crm/mapa` — editais por UF com coordenadas
- `GET /api/crm/agenda` — itens manuais + auto-gerados
- `GET /api/crm/kpis` — 14 KPIs do CRM
- `POST /api/crm/pipeline/migrate` — migrar status legado para pipeline_stage

### Frontend

**Paginas alteradas:**
- `ProducaoPage.tsx` — +4 tabs (Empenhos, Auditoria, Vencimentos, KPIs) + modal de novo empenho
- `CRMPage.tsx` — reescrita completa com 6 tabs (Pipeline, Parametrizacoes, Mapa, Agenda, KPIs, Decisoes)
- `Sidebar.tsx` — +6 itens CRUD no menu

---

## Pre-requisitos

Os dados das Sprints 1, 2, 3 e 4 devem estar cadastrados antes de executar os testes da Sprint 5:

| Sprint | Dados necessarios |
|---|---|
| Sprint 1 | Empresa CH Hospitalar, portfolio com Monitor Multiparametrico Mindray iMEC10 Plus, parametrizacoes basicas |
| Sprint 2 | Edital de "monitor multiparametrico" salvo (UC-CV03), status GO (UC-CV08), itens/lotes importados (UC-CV09) |
| Sprint 3 | Proposta finalizada e submetida (UC-R01..R09) |
| Sprint 4 | Resultado de edital registrado (UC-FU01) — status "ganho" ou "perdido" |

**Contrato base para Sprint 5:**
- Contrato CT-2026/001 vinculado ao edital de monitor multiparametrico, ja cadastrado (UC-E01 da Sprint 5 V2) ou sera criado no UC-CT07 abaixo.

---

## Credenciais e Fluxo de Acesso

| Campo | Valor |
|---|---|
| URL | `http://pasteurjr.servehttp.com:5179` |
| Usuario (Conjunto 1) | valida1@valida.com.br |
| Senha | 123456 |
| Perfil | Superusuario |
| Empresa | CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda. |

### Fluxo de login

1. Acessar o sistema em `http://pasteurjr.servehttp.com:5179`
2. Preencher email e senha
3. Apos autenticacao, aparece tela de selecao de empresa
4. Clicar em "CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda."
5. Sistema carrega o Dashboard com a empresa selecionada

### Fluxo automatizado (helpers.ts)

```typescript
await login(page);  // helper ja existente — faz os 5 passos acima
```

---

## Dados de Referencia

### Contrato Base (CT-2026/001)

| Campo | Valor |
|---|---|
| Numero | `CT-2026/001` |
| Orgao | Hospital Universitario Clementino Fraga Filho (HUCFF/UFRJ) |
| Edital vinculado | Edital de monitor multiparametrico (Sprint 2) |
| Objeto | Fornecimento de 10 monitores multiparametricos com acessorios |
| Valor total | `R$ 198.500,00` |
| Data assinatura | `2026-01-15` |
| Data inicio | `2026-02-01` |
| Data fim | `2027-01-31` |
| Status | vigente |

### Empenhos do Contrato

**Empenho 1 — Equipamentos principais**

| Campo | Valor |
|---|---|
| Numero | `2026NE000123` |
| Tipo | ordinario |
| Valor empenhado | `R$ 185.000,00` |
| Data | `2026-02-10` |
| Fonte de recurso | 0181 — Recursos Proprios Diretamente Arrecadados |
| Natureza despesa | 449052 — Equipamentos e Material Permanente |

**Itens do Empenho 1:**

| Item | Descricao | Qtd | Unit | Total | Gera Valor |
|---|---|---|---|---|---|
| 1 | Monitor Multiparametrico Mindray iMEC10 Plus | 10 | `R$ 18.500,00` | `R$ 185.000,00` | Sim |

**Empenho 2 — Acessorios e consumiveis**

| Campo | Valor |
|---|---|
| Numero | `2026NE000124` |
| Tipo | estimativo |
| Valor empenhado | `R$ 13.500,00` |
| Data | `2026-02-15` |
| Fonte de recurso | 0181 |
| Natureza despesa | 339030 — Material de Consumo |

**Itens do Empenho 2:**

| Item | Descricao | Qtd | Unit | Total | Gera Valor | Limite Consumo |
|---|---|---|---|---|---|---|
| 1 | Cabo de ECG 5 vias | 10 | `R$ 350,00` | `R$ 3.500,00` | Sim | — |
| 2 | Suporte com rodizios | 10 | `R$ 950,00` | `R$ 9.500,00` | Sim | — |
| 3 | Calibradores de pressao (brinde contratual) | 10 | `R$ 0,00` | `R$ 0,00` | Nao | 100% |

### Faturas

| Fatura | Empenho | Valor | Data Emissao | Status |
|---|---|---|---|---|
| `NF-001/2026` | 2026NE000123 | `R$ 92.500,00` | `2026-03-01` | paga |
| `NF-002/2026` | 2026NE000123 | `R$ 92.500,00` | `2026-04-01` | pendente |
| `NF-003/2026` | 2026NE000124 | `R$ 4.500,00` | `2026-03-15` | paga |

### Contratos adicionais para testar Vencimentos

| Contrato | Orgao | Data Fim | Status Tratativa |
|---|---|---|---|
| `CT-2025/012` | Hospital Santa Casa SP | `2026-05-05` (~30 dias) | — |
| `CT-2025/015` | Pref. Belo Horizonte | `2026-07-10` (~90 dias) | — |
| `CT-2024/008` | UFMG | `2026-06-15` | em_tratativa |
| `CT-2023/005` | UNICAMP | `2026-03-30` | renovado |
| `CT-2023/007` | USP | `2026-02-28` | nao_renovado |

### Editais para o Pipeline (alem do edital base)

| Numero | Orgao | UF | Objeto | Stage alvo |
|---|---|---|---|---|
| `PE-055/2026` | UFMG | MG | Microscopios opticos | em_analise |
| `PE-060/2026` | USP | SP | Centrifugas de laboratorio | lead_potencial |
| `PE-065/2026` | UNICAMP | SP | Reagentes | fase_propostas |
| `PE-070/2026` | Pref. BH | MG | Autoclaves | proposta_submetida |
| `PE-075/2026` | UNESP | SP | Equipamentos lab | espera_resultado |

---

## Parte A — CRM

### UC-CRM01 — Pipeline Kanban

**Pagina:** `CRMPage` — rota `/app/crm`
**Aba:** Pipeline (primeira aba — padrao)
**Pre-condicoes:**
- Editais das sprints anteriores salvos no banco
- Login efetuado com valida1@valida.com.br

#### Sequencia de Automacao

```typescript
// Navegar para CRM
await page.click('button:has-text("CRM")');
await expect(page).toHaveURL(/\/app\/crm/);

// A aba Pipeline deve estar ativa por padrao
await expect(page.locator('text=Pipeline de Vendas')).toBeVisible();

// Rodar a migracao inicial para popular pipeline_stage a partir do status legado
await page.click('button:has-text("Migrar Legado")');
// Aguardar reload
await page.waitForTimeout(1000);

// Verificar que aparecem as 13 colunas
const stageLabels = [
  'Editais Não Divulgados Captados',
  'Editais Divulgados Captados',
  'Editais em Análise',
  'Leads Potenciais',
  'Monitoramento da Concorrência',
  'Em Processo de Impugnação',
  'Em Fase de Propostas',
  'Propostas Submetidas',
  'Em Espera de Resultados',
  'Ganho Provisório e Habilitação',
  'Processos e Recursos',
  'Contra Razões',
  'Resultados Definitivos',
];
for (const label of stageLabels) {
  await expect(page.locator(`text=${label}`)).toBeVisible();
}

// Verificar que o edital de monitor multiparametrico aparece em alguma coluna
await expect(page.locator('text=monitor multiparametrico').first()).toBeVisible();

// Mover um edital entre stages: selecionar select dentro do card e trocar stage
const primeiroCardSelect = page.locator('select').first();
await primeiroCardSelect.selectOption('fase_propostas');
// O sistema persiste e recarrega o pipeline automaticamente

// Clicar em Atualizar
await page.click('button:has-text("Atualizar")');
```

#### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|---|---|---|---|
| 1 | Abrir menu CRM | `button:has-text("CRM")` | — | URL contem `/app/crm` |
| 2 | Verificar titulo do kanban | `text=Pipeline de Vendas` | — | Texto visivel |
| 3 | Clicar Migrar Legado | `button:has-text("Migrar Legado")` | — | Sem erro |
| 4 | Aguardar carregamento | `waitForTimeout(1000)` | — | — |
| 5 | Verificar 13 colunas presentes | `text=Editais em Análise` etc. | — | Todas visiveis |
| 6 | Localizar edital de referencia | `text=monitor multiparametrico` | — | Card visivel |
| 7 | Mover edital para `fase_propostas` | `select` dentro do card | `fase_propostas` | Card muda de coluna |
| 8 | Clicar Atualizar | `button:has-text("Atualizar")` | — | Pipeline recarregado |

#### Verificacoes finais

```typescript
// Contador total deve bater com o numero de editais
const totalText = await page.locator('h3:has-text("Pipeline de Vendas")').textContent();
expect(totalText).toMatch(/\d+ editais/);

// Edital movido deve aparecer na nova coluna (fase_propostas)
const colunaFase = page.locator('text=Em Fase de Propostas').locator('..').locator('..');
await expect(colunaFase.locator('text=monitor multiparametrico')).toBeVisible();
```

> **Nota manual:** Verificar que cada mini-card tem numero do edital, orgao, UF, objeto resumido e valor de referencia em verde. O select dentro do card permite mover sem abrir modal.

---

### UC-CRM02 — Parametrizacoes do CRM

**Pagina:** `CRMPage` — aba Parametrizacoes
**Pre-condicoes:** UC-CRM01 concluido (opcional, independente)

#### Sequencia de Automacao

```typescript
// Ir para aba Parametrizacoes
await page.click('button[role="tab"]:has-text("Parametrizações")');

// Clicar em Popular Padroes
await page.click('button:has-text("Popular Padrões")');
await page.waitForTimeout(500);

// Deve aparecer a sub-tab "Tipos de Edital" selecionada por padrao
await expect(page.locator('text=Aquisição Equipamentos')).toBeVisible();
await expect(page.locator('text=Comodato')).toBeVisible();
await expect(page.locator('text=Manutenção')).toBeVisible();

// Clicar em "Agrupamento Portfolio"
await page.click('button:has-text("Agrupamento Portfolio")');
await expect(page.locator('text=Point Of Care')).toBeVisible();
await expect(page.locator('text=Hematologia')).toBeVisible();
await expect(page.locator('text=Quimioluminescência')).toBeVisible();

// Clicar em "Motivos de Derrota"
await page.click('button:has-text("Motivos de Derrota")');
await expect(page.locator('text=Administrativo')).toBeVisible();
await expect(page.locator('text=Não atende especificação')).toBeVisible();
await expect(page.locator('text=Inviável comercialmente')).toBeVisible();

// Adicionar um novo motivo personalizado
await page.getByPlaceholder('Novo valor...').fill('Preço muito abaixo do mercado');
await page.click('button:has-text("Adicionar")');
await expect(page.locator('text=Preço muito abaixo do mercado')).toBeVisible();
```

#### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|---|---|---|---|
| 1 | Abrir aba Parametrizacoes | `button[role="tab"]:has-text("Parametrizações")` | — | Conteudo visivel |
| 2 | Clicar Popular Padroes | `button:has-text("Popular Padrões")` | — | Seed executado |
| 3 | Verificar Tipos de Edital | `text=Aquisição Equipamentos` | — | 8 valores visiveis |
| 4 | Trocar para Agrupamento Portfolio | `button:has-text("Agrupamento Portfolio")` | — | 13 valores visiveis |
| 5 | Trocar para Motivos Derrota | `button:has-text("Motivos de Derrota")` | — | 7 valores visiveis |
| 6 | Adicionar motivo novo | `getByPlaceholder('Novo valor...')` | `Preço muito abaixo do mercado` | Campo preenchido |
| 7 | Clicar Adicionar | `button:has-text("Adicionar")` | — | Novo item na lista |

---

### UC-CRM03 — Mapa Geografico

**Pagina:** `CRMPage` — aba Mapa
**Pre-condicoes:** Editais com UF cadastrada

#### Sequencia de Automacao

```typescript
await page.click('button[role="tab"]:has-text("Mapa")');

// Verificar titulo
await expect(page.locator('text=Distribuição Geográfica')).toBeVisible();

// Verificar cards de UFs — SP deve aparecer (muitos editais)
await expect(page.locator('.card:has-text("SP")').first()).toBeVisible();
// MG tambem (UFMG, Pref. BH)
await expect(page.locator('.card:has-text("MG")').first()).toBeVisible();
// RJ (HUCFF/UFRJ)
await expect(page.locator('.card:has-text("RJ")').first()).toBeVisible();

// Cada card deve mostrar coordenadas (lat, lon)
await expect(page.locator('text=/lat -\\d+\\.\\d+/').first()).toBeVisible();
```

#### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|---|---|---|---|
| 1 | Abrir aba Mapa | `button[role="tab"]:has-text("Mapa")` | — | Conteudo visivel |
| 2 | Verificar titulo | `text=Distribuição Geográfica` | — | Titulo visivel |
| 3 | Verificar card SP | `.card:has-text("SP")` | — | Pelo menos 1 |
| 4 | Verificar card MG | `.card:has-text("MG")` | — | Pelo menos 1 |
| 5 | Verificar card RJ | `.card:has-text("RJ")` | — | Pelo menos 1 |
| 6 | Verificar coordenadas | `text=/lat -\\d+\\.\\d+/` | — | Pelo menos 1 |

> **Nota manual:** Cada card de UF mostra a contagem total de editais e um breakdown por stage. Editais sem UF cadastrada nao aparecem.

---

### UC-CRM04 — Agenda de Compromissos

**Pagina:** `CRMPage` — aba Agenda
**Pre-condicoes:** Editais com data_limite_proposta ou data_limite_impugnacao futuras

#### Sequencia de Automacao

```typescript
await page.click('button[role="tab"]:has-text("Agenda")');
await expect(page.locator('text=Agenda de Compromissos')).toBeVisible();

// Itens auto-gerados dos editais devem aparecer com titulo "Prazo proposta:" ou "Prazo impugnação:"
await expect(page.locator('text=/Prazo (proposta|impugnação):/').first()).toBeVisible();

// Itens devem ter farol de urgencia (crítica, alta, normal, baixa)
await expect(page.locator('text=/CRITICA|ALTA|NORMAL|BAIXA/').first()).toBeVisible();

// Marcador de origem automatico
await expect(page.locator('text=automático').first()).toBeVisible();
```

#### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|---|---|---|---|
| 1 | Abrir aba Agenda | `button[role="tab"]:has-text("Agenda")` | — | Conteudo visivel |
| 2 | Verificar titulo | `text=Agenda de Compromissos` | — | Titulo visivel |
| 3 | Verificar item auto | `text=/Prazo (proposta\|impugnação):/` | — | Pelo menos 1 |
| 4 | Verificar urgencia | `text=/CRITICA\|ALTA\|NORMAL/` | — | Pelo menos 1 |
| 5 | Verificar origem auto | `text=automático` | — | Pelo menos 1 |

> **Nota manual:** Os itens criticos (<= 1 dia) ficam com barra vermelha a esquerda, altos (<= 3 dias) amarela, normais azul.

---

### UC-CRM05 — KPIs do CRM

**Pagina:** `CRMPage` — aba KPIs
**Pre-condicoes:** Editais de diferentes sprints e status

#### Sequencia de Automacao

```typescript
await page.click('button[role="tab"]:has-text("KPIs")');
await page.waitForTimeout(500);

// Verificar os 8 cards de contadores
const kpiLabels = [
  'Total Editais', 'Analisados', 'Participados', 'Não Participados',
  'Ganhos', 'Perdidos', 'Em Recurso', 'Em Contra-Razão',
];
for (const label of kpiLabels) {
  await expect(page.locator(`text=${label}`)).toBeVisible();
}

// Verificar cards de taxas e valores
await expect(page.locator('text=Taxa Participação')).toBeVisible();
await expect(page.locator('text=Taxa Vitória')).toBeVisible();
await expect(page.locator('text=Valor Ganhos')).toBeVisible();
await expect(page.locator('text=Ticket Médio Ganhos')).toBeVisible();
```

#### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|---|---|---|---|
| 1 | Abrir aba KPIs | `button[role="tab"]:has-text("KPIs")` | — | Conteudo visivel |
| 2 | Verificar 8 cards de contadores | `text=Total Editais` etc. | — | Todos visiveis |
| 3 | Verificar Taxa Participacao | `text=Taxa Participação` | — | Card visivel |
| 4 | Verificar Taxa Vitoria | `text=Taxa Vitória` | — | Card visivel |
| 5 | Verificar Valor Ganhos | `text=Valor Ganhos` | — | Card visivel |
| 6 | Verificar Ticket Medio | `text=Ticket Médio Ganhos` | — | Card visivel |

> **Nota manual:** As barras de progresso das taxas devem ser proporcionais aos percentuais. Os valores sao formatados como R$ com separador de milhar.

---

### UC-CRM06 — Registrar Decisao de Nao-Participacao

**Pagina:** `CRMPage` — aba Decisoes
**Pre-condicoes:** UC-CRM02 concluido (motivos parametrizados)

#### Sequencia de Automacao

```typescript
await page.click('button[role="tab"]:has-text("Decisões")');
await expect(page.locator('text=Decisões de Editais')).toBeVisible();

// Clicar em Nova Decisao
await page.click('button:has-text("Nova Decisão")');

// Preencher modal
await page.getByLabel('ID do Edital').fill('<ID-DO-EDITAL-ULTRASSOM>');
// (ID pode ser obtido via API /api/crud/editais ou copiado da aba Pipeline)
await page.getByLabel('Tipo').selectOption('nao_participacao');
await page.getByLabel('Motivo').selectOption('Inviável comercialmente');
await page.getByLabel('Justificativa').fill(
  'Preço de referência do edital (R$ 85.000) está 22% abaixo do nosso custo de aquisição do ultrassonógrafo portátil. Analise mostra inviabilidade comercial.'
);
await page.getByLabel('Teve Contra-Razão?').selectOption('nao');

// Salvar
await page.click('button:has-text("Salvar")');
await page.waitForTimeout(500);

// A decisao deve aparecer na tabela
await expect(page.locator('table tbody tr').first()).toContainText(/Não Participação|Inviável/i);
```

#### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|---|---|---|---|
| 1 | Abrir aba Decisoes | `button[role="tab"]:has-text("Decisões")` | — | Conteudo visivel |
| 2 | Clicar Nova Decisao | `button:has-text("Nova Decisão")` | — | Modal aberto |
| 3 | Preencher ID do Edital | `getByLabel('ID do Edital')` | `<uuid-edital-ultrassom>` | Campo preenchido |
| 4 | Selecionar tipo | `getByLabel('Tipo')` | `nao_participacao` | Selecionado |
| 5 | Selecionar motivo | `getByLabel('Motivo')` | `Inviável comercialmente` | Selecionado |
| 6 | Preencher justificativa | `getByLabel('Justificativa')` | texto de 160+ chars | Campo preenchido |
| 7 | Selecionar contra-razao | `getByLabel('Teve Contra-Razão?')` | `nao` | Selecionado |
| 8 | Clicar Salvar | `button:has-text("Salvar")` | — | Modal fecha |
| 9 | Verificar linha na tabela | `table tbody tr` | — | Decisao visivel |

---

### UC-CRM07 — Registrar Perda Definitiva com Contra-Razao

**Pagina:** `CRMPage` — aba Decisoes

#### Sequencia de Automacao

```typescript
// Aba Decisoes ja deve estar aberta do UC-CRM06
await page.click('button:has-text("Nova Decisão")');

// Obter ID de um edital ja perdido (status "perdido" no sistema)
await page.getByLabel('ID do Edital').fill('<ID-DO-EDITAL-PERDIDO>');
await page.getByLabel('Tipo').selectOption('perda');
await page.getByLabel('Motivo').selectOption('Não atende especificação');
await page.getByLabel('Justificativa').fill(
  'Tela do monitor vencedor atende o requisito de 12 polegadas enquanto nosso produto oferece 10,4 polegadas. Recurso submetido foi indeferido — orgao manteve decisao.'
);
await page.getByLabel('Teve Contra-Razão?').selectOption('sim');

await page.click('button:has-text("Salvar")');
await page.waitForTimeout(500);

// A perda deve aparecer na tabela com badge vermelha e check-mark de contra-razao
const linhaPerda = page.locator('table tbody tr').filter({ hasText: 'Perda' }).first();
await expect(linhaPerda).toContainText('Não atende especificação');
await expect(linhaPerda.locator('td').last()).toContainText('✅');
```

#### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|---|---|---|---|
| 1 | Clicar Nova Decisao | `button:has-text("Nova Decisão")` | — | Modal aberto |
| 2 | Preencher ID Edital | `getByLabel('ID do Edital')` | `<uuid-edital-perdido>` | Campo preenchido |
| 3 | Selecionar tipo | `getByLabel('Tipo')` | `perda` | Selecionado |
| 4 | Selecionar motivo | `getByLabel('Motivo')` | `Não atende especificação` | Selecionado |
| 5 | Preencher justificativa | `getByLabel('Justificativa')` | texto especifico | Campo preenchido |
| 6 | Selecionar contra-razao | `getByLabel('Teve Contra-Razão?')` | `sim` | Selecionado |
| 7 | Clicar Salvar | `button:has-text("Salvar")` | — | Modal fecha |
| 8 | Verificar badge Perda | `tr:has-text("Perda")` | — | Linha visivel |
| 9 | Verificar check contra-razao | `td:has-text("✅")` | — | Marcado |

> **Nota manual:** A importancia desse registro e capturar se a perda ocorreu mesmo apos esforco de contra-razao — permite calcular taxa de reversao dos recursos no futuro.

---

## Parte B — Execucao

### UC-CT07 — Controle de Empenhos

**Pagina:** `ProducaoPage` — aba Empenhos
**Rota:** `/app/producao`
**Pre-condicoes:**
- Contrato `CT-2026/001` existente (criar via aba Contratos se nao existir)
- Contrato selecionado

#### Sequencia de Automacao

```typescript
// Navegar para ProducaoPage
await page.click('button:has-text("Execução")');
await expect(page).toHaveURL(/\/app\/producao/);

// Aba Contratos esta ativa por padrao — criar contrato base se nao existir
const contratoExiste = await page.locator('text=CT-2026/001').isVisible();
if (!contratoExiste) {
  await page.click('button:has-text("Novo Contrato")');
  await page.getByLabel('Número do Contrato').fill('CT-2026/001');
  await page.getByLabel('Órgão').fill('Hospital Universitário Clementino Fraga Filho (HUCFF/UFRJ)');
  await page.getByLabel('Objeto').fill('Fornecimento de 10 monitores multiparametricos Mindray iMEC10 Plus com acessórios');
  await page.getByLabel('Valor Total').fill('198500.00');
  await page.getByLabel('Início').fill('2026-02-01');
  await page.getByLabel('Término').fill('2027-01-31');
  await page.click('button:has-text("Criar")');
  await page.waitForTimeout(500);
}

// Selecionar o contrato CT-2026/001
await page.locator('tr:has-text("CT-2026/001")').locator('button:has-text("Selecionar")').click();
await expect(page.locator('text=Contrato selecionado:')).toContainText('CT-2026/001');

// Ir para aba Empenhos
await page.click('button[role="tab"]:has-text("Empenhos")');
await expect(page.locator('text=Empenhos — CT-2026/001')).toBeVisible();

// Criar primeiro empenho
await page.click('button:has-text("Novo Empenho")');
await page.getByLabel('Número do Empenho').fill('2026NE000123');
await page.getByLabel('Tipo').selectOption('ordinario');
await page.getByLabel('Valor Empenhado').fill('185000.00');
await page.getByLabel('Data do Empenho').fill('2026-02-10');
await page.getByLabel('Fonte de Recurso').fill('0181 — Recursos Proprios Diretamente Arrecadados');
await page.getByLabel('Natureza da Despesa').fill('449052 — Equipamentos e Material Permanente');
await page.click('button:has-text("Criar")');
await page.waitForTimeout(500);

// Criar segundo empenho
await page.click('button:has-text("Novo Empenho")');
await page.getByLabel('Número do Empenho').fill('2026NE000124');
await page.getByLabel('Tipo').selectOption('estimativo');
await page.getByLabel('Valor Empenhado').fill('13500.00');
await page.getByLabel('Data do Empenho').fill('2026-02-15');
await page.getByLabel('Fonte de Recurso').fill('0181');
await page.getByLabel('Natureza da Despesa').fill('339030 — Material de Consumo');
await page.click('button:has-text("Criar")');
await page.waitForTimeout(500);

// Verificar cards de resumo no topo da aba
await expect(page.locator('text=Total Empenhos')).toBeVisible();
// A contagem deve ser 2
await expect(page.locator('text=Valor Empenhado')).toBeVisible();

// Verificar linhas na tabela
await expect(page.locator('text=2026NE000123')).toBeVisible();
await expect(page.locator('text=2026NE000124')).toBeVisible();

// Barra de saldo deve estar em verde (100% no inicio)
// valores em R$ 185.000,00 e R$ 13.500,00 visiveis
await expect(page.locator('text=R$ 185.000,00')).toBeVisible();
```

#### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|---|---|---|---|
| 1 | Navegar para Execucao | `button:has-text("Execução")` | — | URL `/app/producao` |
| 2 | (Opcional) Criar contrato base | fluxo de Novo Contrato | ver tabela Dados | Contrato CT-2026/001 criado |
| 3 | Selecionar CT-2026/001 | `tr:has-text("CT-2026/001") button:has-text("Selecionar")` | — | Banner mostra selecao |
| 4 | Abrir aba Empenhos | `button[role="tab"]:has-text("Empenhos")` | — | Titulo visivel |
| 5 | Clicar Novo Empenho | `button:has-text("Novo Empenho")` | — | Modal aberto |
| 6 | Numero | `getByLabel('Número do Empenho')` | `2026NE000123` | Preenchido |
| 7 | Tipo | `getByLabel('Tipo')` | `ordinario` | Selecionado |
| 8 | Valor | `getByLabel('Valor Empenhado')` | `185000.00` | Preenchido |
| 9 | Data | `getByLabel('Data do Empenho')` | `2026-02-10` | Preenchida |
| 10 | Fonte Recurso | `getByLabel('Fonte de Recurso')` | fonte 0181 | Preenchida |
| 11 | Natureza | `getByLabel('Natureza da Despesa')` | 449052 | Preenchida |
| 12 | Criar | `button:has-text("Criar")` | — | Modal fecha |
| 13-18 | Repetir 5-12 para empenho 2 | — | `2026NE000124` / 13500 / 2026-02-15 | Criado |
| 19 | Verificar tabela | `text=2026NE000123` | — | Ambas linhas visiveis |
| 20 | Verificar valor | `text=R$ 185.000,00` | — | Visivel |

#### Verificacoes finais

```typescript
// Os 4 cards de resumo no topo devem estar populados
await expect(page.locator('text=Total Empenhos').locator('..').locator('text=2')).toBeVisible();

// Saldo deve ser igual ao empenhado (nenhuma fatura ainda)
// Saldo total: R$ 198.500,00
```

> **Nota manual:** Cada linha da tabela mostra Numero, Data, Empenhado, Faturado, Saldo, % Saldo (barra colorida) e Status. Como nao ha faturas cadastradas ainda, o Saldo deve igualar o Empenhado e a barra deve estar 100% verde.

---

### UC-CT08 — Auditoria Empenho x Fatura x Entrega

**Pagina:** `ProducaoPage` — aba Auditoria
**Pre-condicoes:** UC-CT07 concluido (empenhos criados). Entregas ja cadastradas (via Sprint 5 V2) facilitam mas nao sao obrigatorias.

#### Sequencia de Automacao

```typescript
// Criar entregas vinculadas a faturas (via CRUD para simplicidade)
// Em producao isso e feito via aba Entregas + linking manual

// Ir para aba Auditoria
await page.click('button[role="tab"]:has-text("Auditoria")');
await expect(page.locator('text=Auditoria — CT-2026/001')).toBeVisible();

// Verificar os 5 cards de totais
await expect(page.locator('text=Empenhado').first()).toBeVisible();
await expect(page.locator('text=Faturado').first()).toBeVisible();
await expect(page.locator('text=Pago').first()).toBeVisible();
await expect(page.locator('text=Entregue').first()).toBeVisible();
await expect(page.locator('text=Saldo').first()).toBeVisible();

// Verificar tabela de reconciliacao com os 2 empenhos
await expect(page.locator('tr:has-text("2026NE000123")')).toBeVisible();
await expect(page.locator('tr:has-text("2026NE000124")')).toBeVisible();

// Clicar em Exportar CSV
const downloadPromise = page.waitForEvent('download');
await page.click('button:has-text("Exportar CSV")');
const download = await downloadPromise;

// Verificar que o nome do arquivo e auditoria_empenhos_CT-2026/001.csv
expect(download.suggestedFilename()).toMatch(/auditoria_empenhos.*\.csv/);
```

#### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|---|---|---|---|
| 1 | Abrir aba Auditoria | `button[role="tab"]:has-text("Auditoria")` | — | Conteudo visivel |
| 2 | Verificar titulo | `text=Auditoria — CT-2026/001` | — | Visivel |
| 3 | Verificar 5 cards totais | `text=Empenhado,Faturado,Pago,Entregue,Saldo` | — | Todos visiveis |
| 4 | Verificar linha empenho 1 | `tr:has-text("2026NE000123")` | — | Visivel |
| 5 | Verificar linha empenho 2 | `tr:has-text("2026NE000124")` | — | Visivel |
| 6 | Clicar Exportar CSV | `button:has-text("Exportar CSV")` | — | Download iniciado |
| 7 | Validar nome arquivo | `download.suggestedFilename()` | — | Contem `auditoria_empenhos` |

> **Nota manual:** Se houver divergencias (faturado != entregue em valor), a linha deve ficar destacada em vermelho e um alerta amarelo deve aparecer acima da tabela informando o numero de divergencias encontradas.

---

### UC-CT09 — Dashboard de Contratos a Vencer

**Pagina:** `ProducaoPage` — aba Vencimentos
**Pre-condicoes:** Contratos adicionais cadastrados (ver tabela Dados de Referencia)

#### Sequencia de Automacao

```typescript
// Pre-condicao: cadastrar contratos de vencimento em datas variadas
// Criar CT-2025/012 com data_fim = 2026-05-05 (~30 dias da data atual 2026-04-09)
// Criar CT-2025/015 com data_fim = 2026-07-10 (~90 dias)
// (fluxo via aba Contratos + Novo Contrato — pular se ja cadastrados)

// Ir para aba Vencimentos
await page.click('button[role="tab"]:has-text("Vencimentos")');
await page.waitForTimeout(500);

// Verificar as 5 colunas
await expect(page.locator('text=A vencer 30 dias')).toBeVisible();
await expect(page.locator('text=A vencer 90 dias')).toBeVisible();
await expect(page.locator('text=Em Tratativa')).toBeVisible();
await expect(page.locator('text=Renovados')).toBeVisible();
await expect(page.locator('text=Não Renovados')).toBeVisible();

// Verificar que CT-2025/012 aparece na coluna "A vencer 30 dias"
const col30 = page.locator('h4:has-text("A vencer 30 dias")').locator('..');
await expect(col30.locator('text=CT-2025/012')).toBeVisible();

// Clicar em "Iniciar tratativa" para CT-2025/012
const contratoCard = col30.locator('div:has-text("CT-2025/012")').first();
await contratoCard.locator('button:has-text("Iniciar tratativa")').click();
await page.waitForTimeout(500);

// Agora o CT-2025/012 deve aparecer em "Em Tratativa"
const colTratativa = page.locator('h4:has-text("Em Tratativa")').locator('..');
await expect(colTratativa.locator('text=CT-2025/012')).toBeVisible();

// Marcar como renovado
const contratoTratativa = colTratativa.locator('div:has-text("CT-2025/012")').first();
await contratoTratativa.locator('button:has-text("Marcar renovado")').click();
await page.waitForTimeout(500);

// Agora deve aparecer em "Renovados"
const colRenovados = page.locator('h4:has-text("Renovados")').locator('..');
await expect(colRenovados.locator('text=CT-2025/012')).toBeVisible();
```

#### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|---|---|---|---|
| 1 | Abrir aba Vencimentos | `button[role="tab"]:has-text("Vencimentos")` | — | Conteudo visivel |
| 2 | Verificar 5 colunas | `text=A vencer 30,90,Em Tratativa,Renovados,Não` | — | Todas visiveis |
| 3 | Verificar CT em 30d | coluna 30d com `text=CT-2025/012` | — | Presente |
| 4 | Clicar Iniciar tratativa | `button:has-text("Iniciar tratativa")` | — | Click ok |
| 5 | Verificar movimento | coluna Tratativa com `text=CT-2025/012` | — | Movido |
| 6 | Clicar Marcar renovado | `button:has-text("Marcar renovado")` | — | Click ok |
| 7 | Verificar Renovados | coluna Renovados com `text=CT-2025/012` | — | Movido |

> **Nota manual:** Cada card de contrato dentro das colunas mostra numero, orgao e data fim. O botao muda conforme o tier atual do contrato: 30d/90d -> "Iniciar tratativa"; Tratativa -> "Marcar renovado" ou "Não renovar".

---

### UC-CT10 — KPIs de Execucao

**Pagina:** `ProducaoPage` — aba KPIs
**Pre-condicoes:** UC-CT09 concluido (contratos em diferentes estados)

#### Sequencia de Automacao

```typescript
await page.click('button[role="tab"]:has-text("KPIs")');
await page.waitForTimeout(500);

// Verificar 6 cards de KPIs
const kpiLabels = [
  'Contratos Ativos',
  'Vencer 30 dias',
  'Vencer 90 dias',
  'Em Tratativa',
  'Renovados',
  'Não Renovados',
];
for (const label of kpiLabels) {
  await expect(page.locator(`text=${label}`)).toBeVisible();
}

// O valor de "Renovados" deve ser >= 1 (o CT-2025/012 movido no UC-CT09)
const cardRenovados = page.locator('text=Renovados').locator('..').locator('..');
const valorTexto = await cardRenovados.textContent();
expect(parseInt(valorTexto?.match(/\d+/)?.[0] || '0')).toBeGreaterThanOrEqual(1);

// Verificar periodo de referencia
await expect(page.locator('text=Período de referência')).toBeVisible();
await expect(page.locator('text=/Hoje: 2026-\\d{2}-\\d{2}/')).toBeVisible();
```

#### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|---|---|---|---|
| 1 | Abrir aba KPIs | `button[role="tab"]:has-text("KPIs")` | — | Conteudo visivel |
| 2 | Verificar 6 cards | `text=Contratos Ativos,Vencer 30,etc` | — | Todos visiveis |
| 3 | Verificar contador Renovados | card Renovados | — | >= 1 |
| 4 | Verificar periodo | `text=Período de referência` | — | Visivel |
| 5 | Verificar data hoje | `text=/Hoje: 2026-\\d{2}-\\d{2}/` | — | Data no formato |

---

## Ordem Recomendada de Execucao

Execute na ordem abaixo para respeitar dependencias entre UCs:

| # | UC | Pre-requisito | Observacao |
|---|---|---|---|
| 1 | UC-CRM02 (seed) | nenhum | Popular parametrizacoes primeiro — motivos e tipos ficam disponiveis para outros UCs |
| 2 | UC-CRM01 (migrate) | Editais Sprints 1-4 | Popular pipeline_stage a partir do status legado |
| 3 | UC-CRM03 | Editais com UF | — |
| 4 | UC-CRM04 | Editais com prazos | Itens auto-gerados aparecem |
| 5 | UC-CRM05 | Todos acima | KPIs calculam sobre dados reais |
| 6 | UC-CRM06 | UC-CRM02 | Precisa de motivos parametrizados |
| 7 | UC-CRM07 | UC-CRM02 + edital perdido | Precisa motivo + edital ja com status "perdido" |
| 8 | UC-CT07 | Contrato CT-2026/001 existente | Criar contrato se nao existir |
| 9 | UC-CT08 | UC-CT07 | Aba Auditoria precisa de empenhos |
| 10 | UC-CT09 | Contratos com data_fim variada | Criar contratos de teste se necessario |
| 11 | UC-CT10 | UC-CT09 | KPIs refletem o estado apos movimentacoes |

---

## Checklist Final

Apos executar todos os UCs, verificar:

- [ ] UC-CRM01 — 13 stages visiveis e edital movido entre colunas
- [ ] UC-CRM02 — 28 parametrizacoes seed populadas (8 tipos + 13 agrupamentos + 7 motivos)
- [ ] UC-CRM03 — Cards de UFs (SP, MG, RJ) com coordenadas
- [ ] UC-CRM04 — Itens auto-gerados a partir de prazos de editais
- [ ] UC-CRM05 — 8 contadores + 4 metricas de conversao
- [ ] UC-CRM06 — Pelo menos 1 decisao de nao-participacao registrada
- [ ] UC-CRM07 — Pelo menos 1 perda definitiva com flag de contra-razao
- [ ] UC-CT07 — 2 empenhos criados (185.000 + 13.500) para o CT-2026/001
- [ ] UC-CT08 — Relatorio de auditoria gerado e CSV exportado
- [ ] UC-CT09 — CT-2025/012 movido do tier 30d -> tratativa -> renovado
- [ ] UC-CT10 — 6 KPIs preenchidos, contador "Renovados" >= 1

---

## Observacoes

- **Mapa nao usa Leaflet ainda** — implementado como grid de cards por UF. Upgrade futuro para componente Leaflet real se desejado.
- **Auditoria exporta CSV** (suficiente para Excel abrir) — nao PDF. Upgrade futuro possivel.
- **Empenho + Entregas:** para testar auditoria completa com divergencias, e necessario criar Entregas via aba Entregas (sprint 5 V2) e vincular `fatura_id` e `empenho_item_id` via CRUD direto ou futura UI de linking.
- **URL do backend:** `http://localhost:5007` (requer backend rodando antes da sessao de teste).
- **URL do frontend:** `http://pasteurjr.servehttp.com:5179` (ou `http://localhost:5175` local).

---

**Fim do documento de verificacao da Sprint 5.**
