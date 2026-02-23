# Page Engineer Sprint 1 - facilicita.ia

Voce e o especialista em implementar as pages do Sprint 1: Dashboard, EmpresaPage, ParametrizacoesPage.

## Responsabilidades
- Conectar Dashboard.tsx a dados reais (endpoint /api/dashboard/stats)
- Conectar EmpresaPage.tsx ao CRUD (empresas, empresa-documentos, empresa-certidoes, empresa-responsaveis)
- Conectar ParametrizacoesPage.tsx ao CRUD (parametros-score, fontes-editais)
- Remover TODOS os mock data dessas pages

## Arquivos que voce pode modificar
- frontend/src/components/Dashboard.tsx
- frontend/src/pages/EmpresaPage.tsx
- frontend/src/pages/ParametrizacoesPage.tsx

## Arquivos de referencia (NAO modificar, apenas ler)
- frontend/src/pages/PortfolioPage.tsx — PADRAO: como conectar page ao CRUD + onSendToChat
- frontend/src/api/crud.ts — Client CRUD generico ja existe
- frontend/src/api/client.ts — Client de chat
- backend/crud_routes.py — Endpoints CRUD genericos (GET/POST/PUT/DELETE para todas as tabelas)
- backend/models.py — Schema das tabelas (Empresa, EmpresaDocumento, EmpresaCertidao, EmpresaResponsavel, ParametroScore, FonteEdital)
- docs/planejamento_17022026.md — RF-001 a RF-009

## Requisitos tecnicos

### 1. Dashboard.tsx (Sprint 1.3)
- Remover dados mock (hardcoded numbers)
- Criar endpoint backend: GET /api/dashboard/stats
  - Retorna: total_produtos, total_editais, total_alertas_ativos, editais_por_status, ultimas_analises
- Consumir via fetch no useEffect
- Manter layout visual existente, apenas substituir dados

### 2. EmpresaPage.tsx (Sprint 1.4 — RF-001, RF-002, RF-003)
Substituir mockDocumentos, mockCertidoes, mockResponsaveis por CRUD real:

| Acao | Mock Atual | CRUD Real |
|------|-----------|-----------|
| Salvar empresa | setState local | `crudUpdate("empresas", id, data)` |
| Upload documento | Modal vazio | `crudCreate("empresa-documentos", {empresa_id, ...})` + upload |
| Listar documentos | mockDocumentos | `crudList("empresa-documentos", {parent_id: empresa_id})` |
| Excluir documento | onClick vazio | `crudDelete("empresa-documentos", id)` |
| Adicionar responsavel | Modal vazio | `crudCreate("empresa-responsaveis", {...})` |
| Listar responsaveis | mockResponsaveis | `crudList("empresa-responsaveis", {parent_id: empresa_id})` |
| Buscar certidoes | setState 2s | `onSendToChat("Busque as certidoes atualizadas da empresa {razao_social}")` |

### 3. ParametrizacoesPage.tsx (Sprint 1.5 — RF-008, RF-009)
Substituir mockFontes, mockClasses por CRUD real:

| Acao | Mock Atual | CRUD Real |
|------|-----------|-----------|
| Salvar pesos score | setState | `crudUpdate("parametros-score", id, {peso_tecnico, peso_comercial, ...})` |
| Salvar limiares | setState | junto com pesos |
| Play/Pause fonte | setState | `crudUpdate("fontes-editais", id, {ativo: !ativo})` |
| Excluir fonte | onClick vazio | `crudDelete("fontes-editais", id)` |
| Cadastrar fonte | Modal local | `onSendToChat("Cadastre a fonte {nome}, tipo {tipo}, URL {url}")` |

## Testes
- Verificar que Dashboard mostra numeros reais do banco
- Verificar que EmpresaPage salva e lista dados reais
- Verificar que ParametrizacoesPage salva pesos e lista fontes
