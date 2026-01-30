# Plano: Agente de Editais - MVP 4 horas

## Prazo: até 16:30

## Escopo MVP: 9 Ações via Select + Prompt

| # | Ação | Descrição |
|---|------|-----------|
| 1 | Buscar material na web | Busca PDF na web, baixa, extrai specs, salva no banco |
| 2 | Upload de manual | Recebe PDF, extrai specs, salva no banco |
| 3 | Cadastrar fonte de editais | Adiciona fonte (PNCP, BEC, etc) ao banco |
| 4 | Buscar editais | Busca nas fontes, salva editais + requisitos |
| 5 | Buscar editais + calcular score | Busca E calcula aderência com produtos |
| 6 | Listar editais salvos | Mostra editais com filtros |
| 7 | Calcular aderência | Compara produto x edital, gera scores |
| 8 | Gerar proposta | Gera proposta técnica |
| 9 | Chat livre | Conversa normal |

## Arquitetura: Agente com Tools (Function Calling)

O DeepSeek usa **function calling** (deepseek-reasoner, modo thinking, 64K tokens) para executar tools que acessam o banco.

### 12 Tools Necessárias
```
web_search, download_arquivo, processar_upload, extrair_especificacoes,
cadastrar_fonte, listar_fontes, buscar_editais_fonte, extrair_requisitos,
listar_editais, listar_produtos, calcular_aderencia, gerar_proposta
```

## Banco de Dados: MySQL "editais"

### Tabelas
- users, refresh_tokens (copiar trabalhista)
- produtos, produtos_especificacoes, produtos_documentos
- fontes_editais (NOVA)
- editais, editais_requisitos, editais_documentos
- analises, analises_detalhes
- propostas
- sessions, messages, documents

## Fases de Implementação (4 horas)

### Fase 0: Setup (15 min)
- [x] Copiar código trabalhista para /mnt/data1/progpython/agenteditais
- [ ] Adaptar config.py (porta 5007, banco editais)
- [ ] Criar banco MySQL "editais" com tabelas
- [ ] Adaptar .env

### Fase 1: Backend Models (30 min)
- [ ] models.py com todas as tabelas novas
- [ ] Inserir fontes iniciais (PNCP, ComprasNet, BEC)

### Fase 2: Tools do Agente (1h30)
- [ ] tools.py com as 12 tools
- [ ] Integração com DeepSeek function calling
- [ ] prompts.py adaptado para editais

### Fase 3: Endpoints API (45 min)
- [ ] POST /api/chat (com ação selecionada)
- [ ] POST /api/upload
- [ ] GET /api/produtos, /api/editais, /api/analises

### Fase 4: Frontend (1h)
- [ ] Select de ações acima do prompt no Chat.tsx
- [ ] Sidebar adaptado
- [ ] Porta 5007/5175

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `backend/config.py` | Porta 5007, banco editais |
| `backend/models.py` | Novos models (Produto, Edital, Analise, etc) |
| `backend/tools.py` | **NOVO**: 12 tools para o agente |
| `backend/prompts.py` | Prompts para editais |
| `backend/app.py` | Endpoints adaptados |
| `frontend/src/components/Chat.tsx` | Select de ações |
| `frontend/src/api/client.ts` | Porta 5007 |

## Verificação Final
1. Backend rodando porta 5007
2. Frontend rodando porta 5175
3. Login funciona
4. Select de 9 ações aparece acima do prompt
5. Fluxo completo: Upload manual → Buscar editais → Calcular aderência → Gerar proposta
