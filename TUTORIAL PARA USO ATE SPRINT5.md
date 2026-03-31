# Tutorial de Uso — Agente de Editais (até Sprint 5)

**Versão:** Sprint 5 completa  
**Data:** 31/03/2026  
**Sistema:** facilicita.ia — Plataforma de gestão de licitações públicas  
**Validação:** ✅ 322/322 testes Playwright passando

---

## Visão Geral

O Agente de Editais é uma plataforma completa para gestão do ciclo de licitações públicas, cobrindo desde a captação de editais até a execução contratual. O sistema usa IA (DeepSeek) para análise de editais, geração de propostas, laudos e petições.

### Arquitetura
- **Frontend:** React + TypeScript, Vite (porta 5175)
- **Backend:** Flask Python (porta 5007)
- **Banco:** MySQL
- **IA:** DeepSeek via API

---

## Iniciando o Sistema

### Pré-requisitos
1. Backend Flask rodando: `cd backend && python app.py`
2. Frontend Vite rodando: `cd frontend && npm run dev`
3. MySQL disponível

### Login
1. Acesse `http://localhost:5175`
2. Email: `pasteurjr@gmail.com`
3. Senha: `123456`
4. Sistema redireciona para o **Dashboard**

---

## Sprint 1 — Fundação

### 1. Configurar a Empresa
**Caminho:** Sidebar → Configuracoes → Empresa

1. Preencher CNPJ, razão social, endereço
2. Adicionar responsáveis (Representante Legal, Sócio, etc.)
3. Fazer upload de documentos (contrato social, certidões)
4. Configurar busca automática de certidões

### 2. Cadastrar Produtos no Portfolio
**Caminho:** Sidebar → Configuracoes → Portfolio

- **Manual:** Preencher nome, descrição, NCM, ANVISA
- **Por IA:** Upload de arquivo técnico → DeepSeek extrai especificações automaticamente
- Verificar completude técnica (ScoreBar)
- Classificar por Classes/Subclasses NBS

### 3. Configurar Parâmetros
**Caminho:** Sidebar → Configuracoes → Parametrizacoes

- **Aba Score:** Definir pesos das 6 dimensões (financeiro, técnico, legal, etc.)
- **Aba Comercial:** Markup, custos, frete, estados de atuação, modalidades
- **Aba Fontes:** Adicionar fontes de busca, palavras-chave, NCMs

---

## Sprint 2 — Captação e Validação

### 4. Buscar Editais
**Caminho:** Sidebar → Fluxo Comercial → Captacao

1. Digitar termo de busca (ex: "reagente laboratório")
2. Aplicar filtros: UF, modalidade, valor mínimo/máximo
3. Visualizar painel lateral com detalhes do edital
4. Salvar editais de interesse (badge "Salvo")
5. Exportar CSV para análise offline

### 5. Validar Editais
**Caminho:** Sidebar → Fluxo Comercial → Validacao

1. Selecionar edital salvo na lista
2. **Aba Aderência:** Score automático por IA (GO/NO-GO)
3. **Aba Lotes:** Importar itens via PNCP + extração de lotes
4. **Aba Documentos:** Verificar requisitos documentais
5. **Aba Riscos:** Análise de riscos e concorrentes
6. **Aba Mercado:** Análise de mercado do órgão por IA

### 6. Decisão de Participação
Após validação, marcar intenção (Participar / Não Participar / Avaliar) com justificativa.

---

## Sprint 3 — Precificação e Proposta

### 7. Precificar o Edital
**Caminho:** Sidebar → Fluxo Comercial → Precificacao

1. **Aba Lotes:** Organizar por lotes do edital
2. **Aba Portfolio:** Vincular produtos aos lotes
3. **Aba Custos e Preços (Camadas):**
   - Camada A: Custo de produção
   - Camada B: Preço base (markup)
   - Camada C: Referência PNCP/mercado
   - Camada D/E: Estratégia de lances
   - Camada F: Histórico de preços
4. **Simular Disputa:** Testar estratégia de lances
5. **Estratégia Competitiva:** Análise por IA

### 8. Gerar Proposta
**Caminho:** Sidebar → Fluxo Comercial → Proposta

1. Selecionar edital e lote
2. Clicar "Gerar Proposta com IA" → DeepSeek gera texto formal
3. Editar no rich text editor (toolbar)
4. Verificar ANVISA, auditoria documental (Smart Split)
5. Exportar dossiê completo

### 9. Submeter Proposta
**Caminho:** Sidebar → Fluxo Comercial → Submissao

1. Completar checklist pré-submissão
2. Fazer upload da proposta no portal (BNC, ComprasGov, etc.)
3. Registrar protocolo de submissão
4. Acompanhar status (enviado → confirmado)

---

## Sprint 4 — Impugnação e Recursos

### 10. Análise Legal e Impugnação
**Caminho:** Sidebar → Fluxo Comercial → Impugnacao

**Aba Validação Legal:**
1. Selecionar edital no dropdown
2. Verificar badge "PDF" (confirmar que PDF foi importado)
3. Clicar "Analisar Edital" → IA analisa conformidade com Lei 14.133/2021
4. Visualizar inconsistências: ALTA (vermelho) / MEDIA (amarelo) / BAIXA (verde)
5. Clicar "Prosseguir para Petição" para gerar petição formal

**Aba Petições:**
1. Nova Petição → selecionar template
2. IA gera petição formal em markdown
3. Exportar ou fazer upload externo

**Aba Prazos:**
- Controle automático de prazo de impugnação (Art. 164, Lei 14.133/2021)

### 11. Recursos
**Caminho:** Sidebar → Fluxo Comercial → Recursos

**Aba Monitoramento:**
- Selecionar edital + configurar canais de alerta

**Aba Análise:**
1. Analisar proposta vencedora com IA
2. Verificar inconsistências da vencedora

**Aba Laudos:**
1. Clicar "Novo Laudo" → Preencher tipo (Recurso / Contra-Razão)
2. Clicar "Gerar com IA" → DeepSeek gera laudo jurídico completo
3. Fazer upload no portal (via aba Submissão)

---

## Sprint 5 — Pós-Licitação

### 12. Registrar Resultado
**Caminho:** Sidebar → Fluxo Comercial → Followup

1. Selecionar edital do resultado
2. Registrar: Vitória / Derrota com detalhes
3. Configurar alertas de vencimento de contratos
4. Verificar score logístico (capacidade de entrega)

### 13. Atas de Pregão
**Caminho:** Sidebar → Fluxo Comercial → Atas de Pregao

1. **Aba Buscar:** Pesquisar atas no PNCP
2. **Aba Extrair:** Upload de PDF de ata → IA extrai itens, preços, vencedores
3. **Aba Minhas Atas:** Dashboard com estatísticas

### 14. Execução Contratual
**Caminho:** Sidebar → Fluxo Comercial → Execucao Contrato

**Aba Contratos:**
1. Novo Contrato → preencher dados do contrato
2. Registrar entregas/NFs
3. Acompanhar cronograma

**Aba Aditivos:** Registrar aditivos (tipo, valor, prazo)

**Aba Designações:** Designar Gestor e Fiscal de Contrato

**Aba Saldo ARP:** Gerenciar saldos de Ata de Registro de Preços e caronas

**Aba Dashboard:** Visão geral dos contratos (vigentes, valores, alertas)

**Aba Atrasos:** Pedidos em atraso com indicadores de severidade

---

## Chat IA (Transversal)

O botão "Abrir chat" (canto inferior direito) está disponível em todas as páginas.

**Uso:**
1. Clique no botão flutuante
2. Digite qualquer pergunta sobre licitações, editais, legislação
3. DeepSeek responde com contexto do sistema

**Exemplos:**
- "Quais são os prazos de impugnação do edital X?"
- "Analise a proposta vencedora do edital Y"
- "Gere uma petição de impugnação para a cláusula Z"

---

## Executar Testes de Validação

```bash
# Rodar todos os 322 testes (4 workers paralelos, ~22 min)
npx playwright test tests/e2e/playwright/ --workers=4

# Rodar apenas Sprint 1 (UC-001 a UC-012)
npx playwright test tests/e2e/playwright/uc-00{1..9}.spec.ts tests/e2e/playwright/uc-01{0..2}.spec.ts

# Rodar UC específico
npx playwright test tests/e2e/playwright/uc-032.spec.ts --reporter=line

# Ver screenshots coletados
ls runtime/screenshots/UC-032/
```

---

## Atalhos Importantes

| Ação | Como |
|------|------|
| Navegar entre páginas | Sidebar (expandir seção → clicar item) |
| Buscar edital | Captacao → campo de busca |
| Score de edital | Validacao → aba Aderência |
| Precificar | Precificacao → selecionar edital → montar camadas |
| Gerar proposta IA | Proposta → Gerar com IA |
| Impugnar | Impugnacao → Validação Legal → Analisar Edital |
| Laudo de recurso | Recursos → Laudos → Novo Laudo → Gerar com IA |
| Cadastrar contrato | Execucao Contrato → Novo Contrato |
| Chat IA | Botão "Abrir chat" (canto inferior direito) |

---

## Troubleshooting

### Sistema não abre
- Verificar backend: `curl http://localhost:5007/api/editais -H "Authorization: Bearer TOKEN"`
- Verificar frontend: `curl http://localhost:5175`

### IA não responde
- Verificar DEEPSEEK_API_KEY no .env do backend
- Aguardar até 120s para operações complexas (laudos, análises legais)

### Navegação não funciona
- Clicar na seção do sidebar para expandir (ex: "Fluxo Comercial")
- Aguardar carregamento completo da página

---

*Documento gerado automaticamente pelo processo autoresearch.md (Fases 1-9)*
