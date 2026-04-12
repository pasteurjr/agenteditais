# TUTORIAL DE VALIDAÇÃO MANUAL — SPRINT 5 — CONJUNTO 1 (CH Hospitalar)

**Data:** 2026-04-10
**Empresa:** CH Hospitalar (CNPJ 43.712.232/0001-85)
**Dados de apoio:** `docs/dadossprint5-1.md`
**Referência:** `docs/CASOS DE USO SPRINT5 V3.md`
**UCs cobertos:** 26 (15 V2 + 11 V3)
**Público:** validador humano acompanhando roteiro passo-a-passo

---

## Credenciais e Login

| Campo | Valor |
|---|---|
| URL | http://localhost:5179 |
| Email | valida1@valida.com.br |
| Senha | 123456 |
| Empresa | CH Hospitalar |

### Fluxo de login
1. Abrir `http://localhost:5179`
2. Preencher email/senha e clicar **Entrar**
3. Na tela de seleção, clicar em **CH Hospitalar**
4. Aguardar dashboard carregar

---

## Pré-requisitos

- Backend rodando na porta **5007**
- Frontend rodando na porta **5179**
- Seed Sprint 5 executada: `python backend/seeds/sprint5_seed.py`
- Sprints 1-4 previamente validadas (ver `relatorio_aceitacao_sprint[1-4].md`)

---

## Índice

1. [FASE 1 — Followup (UC-FU01..04)](#fase-1)
2. [FASE 2 — Atas (UC-AT01..04)](#fase-2)
3. [FASE 3 — Execução Contratos (UC-CT01..10)](#fase-3)
4. [FASE 4 — Contratado × Realizado (UC-DR01..04)](#fase-4)
5. [FASE 5 — CRM (UC-CRM01..07)](#fase-5)

---

## FASE 1 — Followup (UC-FU01..04) <a id="fase-1"></a>

**Objetivo:** validar registro de resultados ganho/perdido e histórico por edital.

### UC-FU01 — Registrar ganho
1. Sidebar → **Followup**
2. Selecionar edital com proposta submetida
3. Clicar **Registrar Resultado** → escolher **Ganho**
4. Preencher valor homologado e data
5. Salvar → esperar toast sucesso

### UC-FU02 — Registrar perda
1. Mesmo fluxo, escolher **Perdido**
2. Selecionar motivo da lista (ex: *preço não competitivo*)
3. Salvar

### UC-FU03 — Histórico do edital
1. Sidebar → **Followup** → clicar edital → aba **Histórico**
2. Verificar linha do tempo com proposta, submissão, resultado

### UC-FU04 — Filtros por período
1. Alterar filtro de período → verificar tabela recalcula

---

## FASE 2 — Atas (UC-AT01..04) <a id="fase-2"></a>

### UC-AT01 — Consultar ata
1. Sidebar → **Atas de Pregão**
2. Verificar tabela com ≥5 atas consultadas

### UC-AT02 — Detalhar ata
1. Clicar numa linha da ata → painel lateral abre com itens

### UC-AT03 — Saldo ARP
1. Aba **Saldos ARP** → verificar 2 saldos listados

### UC-AT04 — Histórico de consultas
1. Aba **Histórico** → verificar datas e usuário responsável

---

## FASE 3 — Execução Contratos (UC-CT01..10) <a id="fase-3"></a>

### UC-CT01 — Listar contratos
1. Sidebar → **Execução Contrato**
2. Tabela mostra ≥10 contratos (existentes + tiers + seed)

### UC-CT02 — Detalhar contrato
1. Clicar **Selecionar** na linha do contrato `CTR-2025-0087`
2. Verificar stat cards: valor, vigência, saldo

### UC-CT03 — Aditivos
1. Aba **Aditivos** → verificar 1 aditivo (tipo=prazo)

### UC-CT04 — Designações
1. Aba **Designações** → 2 linhas (gestor + fiscal)

### UC-CT05 — Entregas
1. Aba **Entregas** → tabela com entregas, incluindo 1 atrasada

### UC-CT06 — Atividade fiscal
1. Aba **Atividade Fiscal** → 1 inspeção registrada

### UC-CT07 — Gestão de Empenhos ⭐ NOVO V3
1. No contrato `CTR-2025-0087`, abrir aba **Empenhos**
2. **Verificar:** tabela com EMPH-2026-0001 (R$ 960.000)
3. Clicar no empenho → ver 3 itens (Analisador, Reagentes, Calibradores sem valor)
4. Confirmar **alerta SEM VALOR** no item Calibradores com badge de limite 120%
5. Clicar **Novo Empenho** → modal abre → preencher número, tipo, fonte, natureza → **Salvar**
6. Verificar nova linha na tabela

### UC-CT08 — Auditoria ⭐ NOVO V3
1. Aba **Auditoria**
2. Verificar 5 totais: Empenhado, Faturado, Pago, Entregue, Saldo
3. Tabela de conciliação por empenho
4. Clicar **Exportar CSV** → download inicia

### UC-CT09 — Contratos a Vencer ⭐ NOVO V3
1. Aba **Vencimentos**
2. Verificar 5 cards com contagens: 90d, 30d, em tratativa, renovado, não renovado
3. Em cada tier, ≥1 contrato listado

### UC-CT10 — KPIs Execução ⭐ NOVO V3
1. Aba **KPIs**
2. Verificar 6+ stat cards com números reais (não `-`)
3. Mudar filtro de período → recalcula

---

## FASE 4 — Contratado × Realizado (UC-DR01..04) <a id="fase-4"></a>

### UC-DR01 — Divergência entregas
1. Dashboard de divergência → ver entrega atrasada destacada em vermelho

### UC-DR02 — Painel consolidado
1. Verificar totais Contratado vs Realizado

### UC-DR03 — Exportação
1. Clicar **Exportar** → CSV baixa

### UC-DR04 — Drill-down
1. Clicar na linha divergente → detalhe do empenho e item

---

## FASE 5 — CRM (UC-CRM01..07) <a id="fase-5"></a>

### UC-CRM01 — Pipeline 13 stages ⭐ NOVO V3
1. Sidebar → **CRM** → aba **Pipeline**
2. Verificar 13 cards com badges numéricas
3. Pelo menos 10 cards com contagem > 0
4. Clicar card **Fase de Propostas** → tabela expandida

### UC-CRM02 — Parametrizações ⭐ NOVO V3
1. Aba **Parametrizações** → 3 sub-abas:
   - Tipos de Edital (8)
   - Agrupamentos (12)
   - Motivos de Derrota (7)
2. Criar novo Motivo → salvar → verificar lista atualizada

### UC-CRM03 — Mapa ⭐ NOVO V3
1. Aba **Mapa**
2. Verificar marcadores em ≥4 UFs
3. Filtrar por Região → marcadores reduzem
4. Clicar marcador → popup com número+órgão+valor

### UC-CRM04 — Agenda ⭐ NOVO V3
1. Aba **Agenda** → 6 itens com datas
2. Badges de urgência (crítica/alta/normal/baixa)

### UC-CRM05 — KPIs CRM ⭐ NOVO V3
1. Aba **KPIs** → 6+ stat cards com números
2. Clicar card **Perdidos** → tabela expandida

### UC-CRM06 — Decisão Não-Participação ⭐ NOVO V3
1. Pipeline → **Em Análise** → expandir edital
2. Clicar **Declinar** → modal abre
3. Selecionar motivo + justificativa ≥20 chars
4. Confirmar → edital move para Monitoramento

### UC-CRM07 — Motivo de Perda ⭐ NOVO V3
1. Pipeline → **Resultados Definitivos** → aba **Perdidos**
2. Clicar **Registrar Motivo** → modal
3. Categoria + descrição ≥30 chars + checkbox contra-razão
4. Salvar

---

## Resumo

- **UCs cobertos:** 26/26
- **UCs V3 novos:** 11 (UC-CT07 a UC-CT10 + UC-CRM01 a UC-CRM07)
- **Pré-requisito:** seed Sprint 5 executada com sucesso
- **Problemas conhecidos:** modal "Novo Empenho" pode demorar a abrir — aguardar 3s

---

## Encerramento

Após validação, **parar backend e frontend** (feedback padrão do projeto: sempre matar servidor após testes).
