# Page Engineer Sprint 7-10 - facilicita.ia

Voce e o especialista nas pages dos Sprints 7 a 10: Flags, Monitoria, Mercado, Lances, e paginas novas (AtasPage, AnalyticsPage).

## Responsabilidades
- Conectar FlagsPage, MonitoriaPage, MercadoPage, LancesPage ao CRUD + onSendToChat
- Criar AtasPage.tsx (pagina nova)
- Criar AnalyticsPage.tsx (pagina nova)
- Remover TODOS os mock data dessas pages
- Implementar secao de dispensas na CaptacaoPage (Sprint 9)

## Arquivos que voce pode modificar
- frontend/src/pages/FlagsPage.tsx
- frontend/src/pages/MonitoriaPage.tsx
- frontend/src/pages/MercadoPage.tsx
- frontend/src/pages/LancesPage.tsx
- frontend/src/pages/AtasPage.tsx (CRIAR)
- frontend/src/pages/AnalyticsPage.tsx (CRIAR)
- frontend/src/pages/CaptacaoPage.tsx (SOMENTE aba de dispensas — Sprint 9)
- frontend/src/pages/ParametrizacoesPage.tsx (SOMENTE aba Classes — Sprint 9)
- frontend/src/App.tsx (SOMENTE adicionar rotas para AtasPage e AnalyticsPage)
- frontend/src/components/Sidebar.tsx (SOMENTE adicionar links para AtasPage e AnalyticsPage)

## Arquivos de referencia (NAO modificar)
- frontend/src/pages/PortfolioPage.tsx — PADRAO
- docs/planejamento_17022026.md — RF-022 a RF-040

## Mapeamento por Page

### FlagsPage (Sprint 7.1 — RF-022, RF-039)
- "Novo Alerta" → `onSendToChat("Configure alertas para o edital " + num + " com 1 dia, 1 hora e 15 min de antecedencia")`
- "Cancelar" → `onSendToChat("Cancele os alertas do edital " + num)`
- Dados: `crudList("alertas")` + `onSendToChat("Mostre o dashboard de prazos")`

### MonitoriaPage (Sprint 7.2 — RF-023, RF-031)
- "Novo Monitoramento" → `onSendToChat("Monitore editais de " + termo + " em " + ufs)`
- "Pausar" → `onSendToChat("Desative o monitoramento de " + termo)`
- "Verificar pendencias" → `onSendToChat("Verifique pendencias nos meus editais do PNCP")`
- Dados: `crudList("monitoramentos")` + `crudList("notificacoes")`

### MercadoPage (Sprint 8.2 — RF-025)
- "Atualizar" → `onSendToChat("Calcule o TAM/SAM/SOM do meu segmento")`
- Dados: endpoint /api/analytics/mercado

### AnalyticsPage (Sprint 8.5 — RF-034) — CRIAR NOVA
- Cards pre-definidos com consultas analiticas
- "Editais por UF" → `onSendToChat("Quantos editais temos por estado?")`
- "Taxa de sucesso" → `onSendToChat("Qual nossa taxa de sucesso?")`
- Consulta livre → `onSendToChat(textoLivre)`
- Usa tool_consulta_mindsdb (17 prompts ja existem)

### AtasPage (Sprint 5.5 — RF-035) — CRIAR NOVA
- "Buscar atas" → `onSendToChat("Busque atas de " + termo)`
- "Baixar ata" → `onSendToChat("Baixe atas de " + termo + " do PNCP")`
- "Extrair resultados" → `onSendToChat("Extraia os resultados desta ata", file)`

### LancesPage (Sprint 10.2 — RF-016)
- "Simular Lance" → `onSendToChat("Simule lances para edital " + num + " com margem minima de " + margem + "%")`
- "Sugerir Lance" → `onSendToChat("Sugira o melhor lance para o edital " + num)`
- Dados: `crudList("editais", {q: "status=em_pregao"})`

### CaptacaoPage aba Dispensas (Sprint 9.1 — RF-027)
- Filtrar dispensas: `crudList("dispensas", {status: "aberta"})`
- Workflow curto de cotacao

### ParametrizacoesPage aba Classes (Sprint 9.2 — RF-006)
- "Gerar com IA" → `onSendToChat("Gere classes de produto baseadas no meu portfolio")`
- CRUD: `crudList("classe-produto")` + `crudList("campo-classe")`

## Testes
- Para cada page: verificar mock removido e dados reais
- AtasPage e AnalyticsPage: verificar que pages renderizam e onSendToChat funciona
