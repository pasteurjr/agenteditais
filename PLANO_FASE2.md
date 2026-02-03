# Plano Fase 2 - Sistema de Automação de Licitações

## Análise: MVP Implementado vs Roadmap Completo

### ✅ Funcionalidades Implementadas (MVP - Fase 1)

| Módulo | Funcionalidade | Status |
|--------|----------------|--------|
| **Cadastro de Portfólio** | Upload de manuais/PDFs | ✅ Implementado |
| | Extração de especificações via IA | ✅ Implementado |
| | Busca na web por datasheets | ✅ Implementado |
| **Monitoramento de Fontes** | Cadastro de fontes (PNCP, BEC, etc) | ✅ Implementado |
| | Busca de editais via API PNCP | ✅ Implementado |
| | Busca via scraper (básico) | ✅ Implementado |
| **Score de Aderência** | Cálculo produto vs edital | ✅ Implementado |
| | Score técnico (0-100) | ✅ Implementado |
| **Geração de Propostas** | Proposta técnica completa | ✅ Implementado |
| | 8 seções padrão licitação | ✅ Implementado |
| | Tabela comparativa requisitos | ✅ Implementado |
| **Consultas Analíticas** | Integração MindsDB | ✅ Implementado |
| | Consultas em linguagem natural | ✅ Implementado |
| **Gestão Básica** | CRUD produtos/editais | ✅ Implementado |
| | Listagem de propostas | ✅ Implementado |
| | Autenticação JWT | ✅ Implementado |

---

## 🔴 Funcionalidades Pendentes para Fase 2

### 1. Módulo de Classificação de Editais (RF-CLA)
**Prioridade: Alta**

- [ ] **RF-CLA-001**: Telas de parametrização de tipos de editais
  - Comodatos
  - Vendas de Equipamentos
  - Aluguel com Consumo de Reagentes
  - Consumo de Reagentes
  - Insumos Laboratoriais
  - Insumos Hospitalares

- [ ] **RF-CLA-002**: Classificação automática via IA
  - Prompts especializados para cada tipo
  - Identificação automática do tipo ao importar edital

### 2. Módulo de Score Comercial (RF-SCO-002/003)
**Prioridade: Alta**

- [ ] **Score de Aderência Comercial**
  - Distância do órgão ao local de entrega
  - Frequência de entrega vs custo logístico
  - Tela de parametrização de custos

- [ ] **Score de Potencial de Ganho**
  - Análise de histórico de vitórias
  - Probabilidade baseada em concorrência
  - Margem esperada

### 3. Módulo de Recomendação de Preços (RF-PRE)
**Prioridade: Alta**

- [ ] **RF-PRE-001**: Análise de preços históricos
  - Preços médios praticados por órgão
  - Preços dos últimos editais ganhos
  - Faixa de preços (mínimo, satisfatório, máximo)

- [ ] **RF-PRE-002**: Score de Competitividade
  - Probabilidade de vitória por faixa de preço
  - Análise de concorrentes históricos

- [ ] **RF-PRE-003**: Score de Qualidade da Concorrência
  - Número médio de desclassificações
  - Taxa de impugnações por edital

- [ ] **RF-PRE-004**: Lista de Concorrentes
  - Empresas que participaram de editais similares
  - Preços praticados pelos concorrentes

### 4. Módulo de Alertas de Pregão (RF-ALE)
**Prioridade: Média**

- [ ] **RF-ALE-001**: Contagem Regressiva
  - Dashboard com editais próximos da abertura
  - Timer visual para cada pregão

- [ ] **RF-ALE-002**: Calendário Automático
  - Extração automática de datas do PDF do edital
  - Integração com calendário (Google Calendar, Outlook)
  - Notificações push/email

- [ ] **Sistema de Alertas**
  - Alerta 24h antes da abertura
  - Alerta 1h antes
  - Alerta de novos editais com alta aderência

### 5. Módulo de Robô de Lances (RF-LAN)
**Prioridade: Alta**

- [ ] **RF-LAN-001**: Sugestão de Lances
  - Algoritmo baseado em preços históricos
  - Análise em tempo real dos lances dos concorrentes

- [ ] **RF-LAN-002**: Validação de Lances
  - Verificação de margem mínima
  - Alerta de lance abaixo do custo

- [ ] **RF-LAN-003**: Algoritmo de Lances
  - Lance de cobertura automático
  - Respeito a intervalos mínimos do edital
  - Estratégias: agressivo, conservador, adaptativo

- [ ] **RF-LAN-004**: Envio Automático
  - Integração com portais de pregão
  - Tempo de resposta < 5 segundos

### 6. Módulo de Auditoria e Recursos (RF-AUD)
**Prioridade: Média**

- [ ] **RF-AUD-001**: Diagnóstico do Concorrente
  - Análise automática da proposta vencedora
  - Comparação com requisitos do edital
  - Identificação de desvios técnicos

- [ ] **RF-AUD-002**: Score de Recurso
  - Probabilidade de sucesso do recurso
  - Baseado em desvios encontrados

- [ ] **RF-AUD-003**: Laudo de Contestação
  - Geração automática do documento de recurso
  - Listagem de pontos de contestação
  - Formato jurídico padrão

### 7. Módulo de CRM Ativo (RF-CRM)
**Prioridade: Média**

- [ ] **RF-CRM-001**: Alimentação de Leads
  - Editais com alta aderência viram leads
  - Pipeline de oportunidades

- [ ] **RF-CRM-002**: Gestão de Perdas
  - Registro de motivos de perda
  - Análise de perdas por categoria
  - Ações corretivas

- [ ] **RF-CRM-003**: Gestão de Ganhos
  - Potencial de pedidos futuros
  - Prazos e volumes
  - Metas para vendedores

### 8. Módulo de Monitoramento de Licitações (RF-MTR)
**Prioridade: Média**

- [ ] **RF-MTR-001**: Diagnóstico de Perdas
  - Análise de chat do portal
  - Análise de ata da sessão
  - Extração de motivos de perda

- [ ] **RF-MTR-002**: Insumos para Melhoria
  - Fatores que geraram desvios
  - Recomendações para próximos editais
  - Aprimoramento do portfólio

### 9. Módulo de Anexação de Documentos (RF-GER-002)
**Prioridade: Média**

- [ ] Repositório de documentos da empresa
  - Alvarás
  - Certificados ANVISA
  - Certidões (bombeiros, prefeitura)
  - Balanços e demonstrativos

- [ ] Anexação automática na proposta
  - Identificação de documentos exigidos
  - Match com repositório

### 10. Painel de Revisão de Propostas (RF-GER-003)
**Prioridade: Baixa**

- [ ] Interface de revisão colaborativa
  - Edição inline das seções
  - Comentários e aprovações
  - Versionamento
  - Workflow de aprovação

---

## 📊 Priorização Fase 2

### Sprint 1 (2 semanas) - Fundamentos Comerciais
1. **Recomendação de Preços** - Análise de histórico
2. **Score Comercial** - Parametrização
3. **Lista de Concorrentes** - Histórico de participações

### Sprint 2 (2 semanas) - Alertas e Automação
4. **Alertas de Pregão** - Contagem regressiva e calendário
5. **Notificações** - Email/Push para eventos importantes
6. **Classificação de Editais** - Tipos parametrizáveis

### Sprint 3 (2 semanas) - Robô de Lances
7. **Sugestão de Lances** - Algoritmo básico
8. **Validação** - Margem mínima
9. **Interface de Lances** - Dashboard para pregões ativos

### Sprint 4 (2 semanas) - Auditoria e Recursos
10. **Diagnóstico de Concorrentes** - Análise de propostas
11. **Score de Recurso** - Probabilidade de sucesso
12. **Laudo de Contestação** - Geração automática

### Sprint 5 (2 semanas) - CRM e Analytics
13. **CRM Básico** - Leads e pipeline
14. **Monitoramento** - Análise de perdas
15. **Dashboard Analytics** - Métricas consolidadas

---

## 🛠️ Requisitos Técnicos Fase 2

### Integrações Necessárias
- [ ] Portal PNCP - API de lances (se disponível)
- [ ] Portais estaduais (BEC/SP, SIGA/RJ)
- [ ] Google Calendar API
- [ ] Sistema de notificações (Firebase/AWS SNS)
- [ ] Serviço de email (SendGrid/SES)

### Banco de Dados - Novas Tabelas
```sql
-- Preços históricos
CREATE TABLE precos_historicos (
    id, edital_id, produto_id, preco_vencedor,
    empresa_vencedora, data_homologacao
);

-- Concorrentes
CREATE TABLE concorrentes (
    id, nome, cnpj, editais_participados,
    editais_ganhos, preco_medio
);

-- Alertas
CREATE TABLE alertas (
    id, user_id, edital_id, tipo,
    data_disparo, status
);

-- Lances
CREATE TABLE lances (
    id, edital_id, user_id, valor_lance,
    posicao, timestamp
);

-- Recursos
CREATE TABLE recursos (
    id, edital_id, user_id, tipo,
    score_sucesso, laudo, status
);

-- Leads CRM
CREATE TABLE leads (
    id, user_id, edital_id, status,
    valor_potencial, probabilidade
);
```

### Novos Agentes CrewAI (conforme doc 07)
1. **price_analyst** - Análise de preços
2. **competitor_analyst** - Análise de concorrentes
3. **bid_strategist** - Estratégia de lances
4. **legal_analyst** - Análise jurídica/recursos
5. **crm_manager** - Gestão de leads

---

## 📅 Cronograma Estimado

| Fase | Sprints | Duração | Entregáveis |
|------|---------|---------|-------------|
| MVP (Atual) | - | Concluído | Cadastro, Busca, Score, Proposta |
| Fase 2.1 | 1-2 | 4 semanas | Preços, Alertas, Classificação |
| Fase 2.2 | 3-4 | 4 semanas | Robô Lances, Auditoria |
| Fase 2.3 | 5 | 2 semanas | CRM, Analytics |

**Total Fase 2: ~10 semanas**

---

## 🎯 Métricas de Sucesso Fase 2

1. **Score de aderência** com precisão ≥ 90%
2. **Geração de propostas** com redução de 70% do tempo manual
3. **Captura de editais** ≥ 95% das fontes monitoradas
4. **Robô de Lances** com tempo de resposta < 5 segundos
5. **Taxa de sucesso em recursos** ≥ 40%
6. **Aumento na taxa de vitórias** ≥ 20%

---

## Dependências e Riscos

### Dependências
- Acesso a APIs dos portais de licitação
- Dados históricos de preços (pode precisar de scraping)
- Integração com sistemas de pregão eletrônico

### Riscos
- Portais podem bloquear acesso automatizado
- APIs podem não estar disponíveis
- Mudanças na legislação de licitações

---

*Documento gerado em: 02/02/2026*
*Baseado em: 01_Requisitos_Editais_MVP.docx, 07_Configuracao_CrewAI_MVP_v2.docx, Roadmap fase 1 18-12-2025.docx*
