# Contexto e Arquitetura Observada

## Visão geral

O repositório implementa um sistema de gestão de editais com IA orientado ao fluxo comercial e operacional de licitações públicas. O produto cobre, no código e na documentação, a cadeia:

- fundação cadastral
- portfolio
- captação
- validação
- impugnação e recursos
- precificação
- proposta
- submissão
- follow-up
- atas
- execução contratual
- contratado x realizado

## Camadas principais

### Frontend

Stack observada:

- React `19.2.0`
- TypeScript
- Vite `7.2.4`
- `lucide-react`
- navegação local por estado em vez de roteador tradicional

Arquivos estruturantes:

- `frontend/src/App.tsx`
- `frontend/src/components/Sidebar.tsx`
- `frontend/src/hooks/useChat.ts`
- `frontend/src/api/client.ts`
- `frontend/src/api/crud.ts`

Constatações:

- 23 páginas em `frontend/src/pages`
- `App.tsx` centraliza a troca de páginas e injeta `onSendToChat`
- há um `CrudPage` genérico para tabelas de cadastro
- o chat flutuante é transversal ao sistema

### Backend

Stack observada:

- Flask
- SQLAlchemy
- MySQL
- JWT
- DeepSeek via wrapper local
- APScheduler

Arquivos estruturantes:

- `backend/app.py`
- `backend/models.py`
- `backend/tools.py`
- `backend/crud_routes.py`
- `backend/config.py`
- `backend/scheduler.py`

Constatações:

- `backend/app.py` contém 119 rotas confirmadas por busca de decorators
- `backend/crud_routes.py` registra um CRUD genérico para dezenas de tabelas
- `backend/models.py` reúne o domínio principal e relacionamentos
- `backend/tools.py` concentra a maior parte da lógica operacional e assistida por IA

## Integrações observadas

- DeepSeek
- PNCP
- Brave Search / Serper / Google CSE / SerpAPI
- BEC
- ComprasNet
- CAPSolver
- MindsDB
- SMTP

Observação crítica:

- muitas integrações dependem de configuração externa, rede e credenciais; portanto, presença em código não equivale a operação comprovada nesta sessão

## Fluxo de navegação

O `Sidebar` divide o sistema em quatro grandes blocos:

- `Fluxo Comercial`
- `Cadastros`
- `Indicadores`
- `Configuracoes`

Isso reflete bem o modelo descrito em `docs/requisitos_completosv6.md` e na documentação de workflow.

## Chat e automação

O padrão observado é:

1. a página chama `onSendToChat`
2. o frontend envia para `/api/chat` ou `/api/chat-upload`
3. o backend classifica a intenção
4. uma tool executa a ação
5. a UI pode recarregar dados via CRUD/API específica

Esse padrão está alinhado com `INSTRUCOES_PARA_AGENT_TEAMS_NESSE_REPO.md`.

## Situação arquitetural real

Pontos fortes:

- domínio de negócio amplo já representado em banco e telas
- boa quantidade de funcionalidades específicas de licitações
- documentação extensa
- trilha forte de testes e screenshots

Pontos frágeis:

- monolitismo elevado em `backend/app.py` e `backend/tools.py`
- frontend com acoplamento alto entre tela, fetch e regra de apresentação
- acúmulo de dívida de tipagem no frontend
- mistura de módulos reais e mockados na mesma shell de produto
