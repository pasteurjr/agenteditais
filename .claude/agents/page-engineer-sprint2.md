# Page Engineer Sprint 2 - facilicita.ia

Voce e o especialista em implementar as pages do Sprint 2: CaptacaoPage, ValidacaoPage.

## Responsabilidades
- Conectar CaptacaoPage.tsx ao CRUD editais + busca via onSendToChat
- Conectar ValidacaoPage.tsx ao CRUD editais + analises + acoes via onSendToChat
- Implementar coluna estrategia go/nogo na CaptacaoPage
- Remover TODOS os mock data dessas pages

## Arquivos que voce pode modificar
- frontend/src/pages/CaptacaoPage.tsx
- frontend/src/pages/ValidacaoPage.tsx

## Arquivos de referencia (NAO modificar, apenas ler)
- frontend/src/pages/PortfolioPage.tsx — PADRAO
- frontend/src/api/crud.ts — Client CRUD
- backend/tools.py — Tools de busca e analise (tool_buscar_editais_scraper, tool_calcular_aderencia, etc.)
- docs/planejamento_17022026.md — RF-010, RF-011, RF-037

## Requisitos tecnicos

### 1. CaptacaoPage.tsx (Sprint 2.1, 2.2, 2.6 — RF-010, RF-037)

| Botao na UI | Mock Atual | Implementacao Real |
|-------------|-----------|-------------------|
| Buscar Editais | Filtra mockResultados 1.5s | `onSendToChat("Busque editais de " + termo + " no PNCP")` |
| Salvar Todos | console.log | `onSendToChat("Salvar todos os editais")` |
| Salvar Recomendados | console.log | `onSendToChat("Salvar editais recomendados")` |
| Salvar Individual | console.log | `onSendToChat("Salvar edital " + numero)` |
| Salvar Selecionados | onClick vazio | `onSendToChat("Salvar editais " + numerosJoin)` |
| Exportar CSV | onClick vazio | Gerar CSV no frontend a partir dos dados exibidos |
| Configurar Monitoria | onClick vazio | `onSendToChat("Monitore editais de " + termo)` |
| Go/NoGo/Acompanhar | Nao existe | `crudCreate("estrategias-editais", {decisao, edital_id, ...})` |

Dados iniciais: `crudList("editais")` para editais ja salvos no banco.
Busca PNCP: via onSendToChat (resultado vem no chat, page faz refetch apos 3s).

### 2. ValidacaoPage.tsx (Sprint 2.3, 2.4 — RF-011)

| Botao na UI | Mock Atual | Implementacao Real |
|-------------|-----------|-------------------|
| Gerar Resumo | Mock 2s | `onSendToChat("Resuma o edital " + numero)` |
| Perguntar ao edital | Mock resposta | `onSendToChat(pergunta + " sobre o edital " + numero)` |
| Baixar PDF | abre URL | `onSendToChat("Baixe o PDF do edital " + numero)` |
| Participar | setState | `crudUpdate("editais", id, {status: "participando"})` + `crudCreate("estrategias-editais", {decisao: "go"})` |
| Acompanhar | setState | `crudUpdate("editais", id, {status: "analisando"})` + `crudCreate("estrategias-editais", {decisao: "acompanhar"})` |
| Ignorar | setState | `crudUpdate("editais", id, {status: "desistido"})` + `crudCreate("estrategias-editais", {decisao: "nogo"})` |
| Calcular Aderencia | Nao existe | `onSendToChat("Calcule a aderencia do produto " + produto + " ao edital " + numero)` |

Dados: `crudList("editais", {q: "status=analisando"})` + `crudList("analises")`.
Aba Analitica: exibir 5 scores (tecnico, comercial existem; documental, juridico, logistico serao criados pelo backend-tools-engineer).

## Testes
- Verificar que CaptacaoPage busca editais via chat e exibe resultados
- Verificar que ValidacaoPage lista editais e exibe analises
- Verificar que botoes Go/NoGo salvam no banco via CRUD
