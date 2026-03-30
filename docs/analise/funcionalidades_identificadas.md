# Funcionalidades Identificadas — Agente de Editais

**Data:** 30/03/2026
**Fonte:** Inventário backend + frontend + docs

---

## Módulos Implementados (Sprints 1-5)

### 1. Autenticação
- Login com email/senha (JWT)
- Registro de usuário
- Refresh token (30 dias)
- Switch de empresa
- Logout

### 2. Empresa (Sprint 1)
- CRUD dados cadastrais (CNPJ, razão social, endereço, contatos)
- Upload e gestão de documentos (contrato social, alvarás, certidões)
- Busca automática de certidões (INSS, FGTS, tributos)
- Cadastro de responsáveis
- Categorias e tipos de documentos

### 3. Portfolio (Sprint 1)
- CRUD de produtos com NCM, fabricante, modelo
- Upload assistido por IA (manuais, IFU, NFs, ERP, folders, websites)
- Extração automática de especificações técnicas
- Hierarquia: Áreas → Classes → Subclasses
- Score de completude por produto
- Reprocessamento de metadados

### 4. Parametrizações (Sprint 1)
- Fontes de editais (PNCP, BEC, ComprasNet)
- Classes de produto com campos de máscara
- Parâmetros de score (pesos por dimensão)
- Modalidades de licitação
- Origens de órgão

### 5. Captação de Editais (Sprint 2)
- Busca multifontes (PNCP API + Brave/Serper scraper)
- Filtros por UF, categoria, modalidade, período
- Score de aderência ao portfolio
- Salvamento de editais selecionados
- Download de PDFs do PNCP
- Extração de itens e requisitos

### 6. Validação de Editais (Sprint 2)
- 6 dimensões de score: técnico, documental, complexidade, jurídico, logístico, comercial
- Score geral ponderado
- Análise de mercado via IA
- Análise de riscos
- Histórico de vencedores
- Checklist de validação
- Fluxo de decisão (participar/não participar)

### 7. Impugnação e Esclarecimentos (Sprint 4)
- Validação legal do edital com IA (lê PDF, compara com Lei 14.133)
- Geração automática de petição de impugnação
- Upload de petições externas
- Controle de prazo de 3 dias úteis (Art. 164)
- Templates de petição

### 8. Precificação (Sprint 3)
- Organização por lotes
- Vinculação item-produto (manual e por IA)
- 5 camadas de preço: A (custo), B (markup), C (referência), D (proposta), E (mínimo)
- Histórico de preços PNCP
- Simulação de disputa
- Estratégia competitiva
- Insights de precificação por IA
- Benefícios fiscais NCM

### 9. Proposta (Sprint 3)
- Geração automática de texto técnico por IA
- Editor rico com markdown
- Templates de proposta
- Validação ANVISA
- Auditoria documental
- Export PDF/DOCX
- Status: rascunho → revisão → aprovada → enviada
- Log de alterações

### 10. Submissão (Sprint 3)
- Checklist pré-submissão
- Tracking de status
- Smart Split PDF (fracionamento para limites de portal)

### 11. Recursos e Contra-Razões (Sprint 4)
- Monitoramento de janela de recurso (WhatsApp/Email/Alerta)
- Análise de proposta vencedora com IA
- Chatbox interativo para explorar desvios
- Geração de laudo de recurso com IA (seções jurídica + técnica)
- Geração de laudo de contra-razão (seções defesa + ataque)
- Submissão assistida no portal (checklist + exportar + link + protocolo)
- Templates de recurso

### 12. Follow-up (Sprint 5)
- Registro de resultado: vitória/derrota/cancelado
- Auto-criação de contrato em vitória
- Stats: pendentes, vitórias, derrotas, taxa de sucesso
- Alertas de vencimento multi-tier (30d/15d/7d/1d)
- Regras configuráveis por tipo de entidade

### 13. Atas de Pregão (Sprint 5)
- Busca de atas no PNCP
- Extração de dados de ata PDF via IA
- Dashboard de atas consultadas (vigentes/vencidas)
- Saldo ARP por item
- Controle de carona com validação Lei 14.133 (50% individual, 2x global)

### 14. Execução de Contratos (Sprint 5)
- CRUD de contratos com stats
- Registro de entregas com NF e empenho
- Cronograma semanal com atrasados
- Gestão de aditivos (Lei 14.133 Art. 124-126, limite 25%/50%)
- Designação de gestor e fiscal (Lei 14.133 Art. 117)
- Atividades fiscais (medição, vistoria, atesto, parecer)

### 15. Contratado x Realizado (Sprint 5)
- Dashboard comparativo com filtros
- Variação % por contrato (verde ≤5%, amarelo 5-15%, vermelho >15%)
- Saúde do portfolio
- Pedidos em atraso por severidade (HIGH/MEDIUM/LOW)
- Próximos vencimentos consolidados

### 16. Dashboard (Sprint 1)
- KPIs: editais novos, em análise, validados, propostas
- Funil de editais
- Editais urgentes
- Status do scheduler

### 17. Chat com IA
- Sessões de chat persistentes
- Upload de arquivos no chat
- 76 tools acessíveis via linguagem natural
- Histórico de mensagens
- Fontes/referências nas respostas

---

## Funcionalidades NÃO Implementadas (Mock)

| Funcionalidade | Página | Sprint Prevista |
|---------------|--------|----------------|
| Disputa de Lances | LancesPage | Sprint 10 |
| CRM Ativo | CRMPage | Sprint 6 |
| Análise de Perdas | PerdasPage | Sprint 6 |
| Inteligência Competitiva | ConcorrenciaPage | Sprint 6 |
| Flags/Alertas visuais | FlagsPage | Sprint 7 |
| Monitoria de termos | MonitoriaPage | Sprint 7 |
| Mercado TAM/SAM/SOM | MercadoPage | Sprint 8 |
