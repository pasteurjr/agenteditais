# Atores do Sistema — Agente de Editais

**Data:** 30/03/2026

---

## Atores Primários

### 1. Analista Comercial (Usuário Principal)
- Cadastra empresa e portfolio
- Busca e valida editais
- Define estratégia de participação
- Precifica lotes
- Gera propostas
- Submete documentação
- Registra resultados (vitória/derrota)
- Gerencia contratos e entregas
- Interpõe recursos e impugnações
- Monitora prazos e janelas

### 2. Agente de IA (DeepSeek)
- Extrai especificações de manuais
- Analisa aderência edital x produto
- Calcula scores de validação
- Analisa conformidade legal do edital
- Gera petições de impugnação
- Analisa proposta vencedora
- Gera laudos de recurso e contra-razão
- Sugere preços baseados em histórico
- Extrai dados de atas PDF
- Responde perguntas no chatbox

### 3. Scheduler (APScheduler)
- Verifica alertas de prazo a cada 5 minutos
- Executa monitoramentos de janela de recurso
- Busca certidões automaticamente
- Envia notificações por email

## Atores Secundários

### 4. Portal PNCP
- Fornece editais via API de busca
- Fornece detalhes de editais (itens, valores)
- Fornece PDFs de editais e atas
- Fornece preços históricos

### 5. Portal ComprasNet/gov.br
- Recebe submissão de propostas (manual/assistido)
- Recebe petições de recurso/impugnação
- Disponibiliza janela de recurso

### 6. Brave/Serper/Google CSE
- Fornece resultados de busca para scraping de editais alternativos

### 7. CAPSolver
- Resolve CAPTCHAs para busca automática de certidões
