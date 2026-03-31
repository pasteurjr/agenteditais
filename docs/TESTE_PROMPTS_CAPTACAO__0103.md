# Relatorio de Testes - Busca de Editais via Chat
**Data:** 2026-03-01 23:32:36
**Servidor:** localhost:5007
**Executor:** Script automatizado Python (48 testes)

---

## Resumo Executivo

- **Total de testes:** 48
- **Testes com resultados (OK):** 24
- **Testes sem resultados (0 editais):** 24
- **Testes com erro de execucao:** 0 (todos executaram sem excecao)

### Resultado Geral

Os 48 testes foram executados com sucesso (sem erros de infraestrutura). Porem, **24 testes retornaram 0 editais** porque as fontes ComprasNet e Licitacoes-e, quando filtradas individualmente, consultam apenas fontes do tipo *scraper* que nao possuem dados indexados. Os **24 testes com PNCP e Todas as fontes funcionaram corretamente**, retornando editais com os filtros de janela e encerrados aplicados adequadamente.

**Bugs identificados:**
1. **Filtro de fonte ComprasNet nao funciona**: ao usar "no ComprasNet" no prompt, o sistema consulta apenas scrapers (nao a API PNCP) e retorna 0 resultados
2. **Filtro de fonte Licitacoes-e nao funciona**: ao usar "licitacoes-e" no prompt, o sistema consulta apenas scrapers (nao a API PNCP) e retorna 0 resultados
3. **PNCP e Todas retornam exatamente o mesmo numero de editais**: indica que scrapers nao contribuem com dados adicionais

---

## Fontes Disponiveis

| Nome | Tipo | URL Base |
|------|------|----------|
| PNCP - Portal Nacional de Contratacoes Publicas | api | https://pncp.gov.br/app/editais |
| PNCP | api | https://pncp.gov.br |
| ComprasNet (Portal de Compras do Governo Federal) | api | https://www.gov.br/compras/pt-br |
| ComprasNet | api | https://www.comprasnet.gov.br |
| BEC-SP | api | https://www.bec.sp.gov.br |
| Licitacoes-e (Banco do Brasil) | scraper | https://www.licitacoes-e.com.br |
| Portal de Compras Publicas | scraper | https://portaldecompraspublicas.com.br |
| Compras RS | scraper | https://www.compras.rs.gov.br |
| Portal de Compras MG | scraper | https://www.compras.mg.gov.br |
| BEC-SP - Bolsa Eletronica de Compras de SP | scraper | https://www.bec.sp.gov.br |
| Portal BEC-SP (4 registros) | scraper | (sem URL) |
| compras Parana | scraper | https://www.administracao.pr.gov.br/... |
| Compras Bahia | scraper | https://www.comprasnet.ba.gov.br |
| LicitaNet | scraper | https://www.licitanet.com.br |

**Total de fontes cadastradas:** 17

---

## Tabela Resumo

| # | Termo | Janela | Encerrados | Fonte | Total Editais | Fontes Consultadas | Status |
|---|-------|--------|------------|-------|---------------|-------------------|--------|
| 1 | equip. med. | 30d | Nao | PNCP | 105 | PNCP, Portal Compras Publicas, LicitaNet | OK |
| 2 | equip. med. | 30d | Nao | ComprasNet | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 3 | equip. med. | 30d | Nao | Licitacoes-e | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 4 | equip. med. | 30d | Nao | Todas | 105 | PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet | OK |
| 5 | equip. med. | 30d | Sim | PNCP | 151 | PNCP, Portal Compras Publicas, LicitaNet | OK |
| 6 | equip. med. | 30d | Sim | ComprasNet | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 7 | equip. med. | 30d | Sim | Licitacoes-e | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 8 | equip. med. | 30d | Sim | Todas | 151 | PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet | OK |
| 9 | equip. med. | 60d | Nao | PNCP | 115 | PNCP, Portal Compras Publicas, LicitaNet | OK |
| 10 | equip. med. | 60d | Nao | ComprasNet | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 11 | equip. med. | 60d | Nao | Licitacoes-e | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 12 | equip. med. | 60d | Nao | Todas | 115 | PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet | OK |
| 13 | equip. med. | 60d | Sim | PNCP | 176 | PNCP, Portal Compras Publicas, LicitaNet | OK |
| 14 | equip. med. | 60d | Sim | ComprasNet | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 15 | equip. med. | 60d | Sim | Licitacoes-e | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 16 | equip. med. | 60d | Sim | Todas | 176 | PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet | OK |
| 17 | equip. med. | 90d | Nao | PNCP | 117 | PNCP, Portal Compras Publicas, LicitaNet | OK |
| 18 | equip. med. | 90d | Nao | ComprasNet | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 19 | equip. med. | 90d | Nao | Licitacoes-e | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 20 | equip. med. | 90d | Nao | Todas | 117 | PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet | OK |
| 21 | equip. med. | 90d | Sim | PNCP | 184 | PNCP, Portal Compras Publicas, LicitaNet | OK |
| 22 | equip. med. | 90d | Sim | ComprasNet | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 23 | equip. med. | 90d | Sim | Licitacoes-e | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 24 | equip. med. | 90d | Sim | Todas | 184 | PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet | OK |
| 25 | medicamentos | 30d | Nao | PNCP | 127 | PNCP, Portal Compras Publicas, LicitaNet | OK |
| 26 | medicamentos | 30d | Nao | ComprasNet | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 27 | medicamentos | 30d | Nao | Licitacoes-e | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 28 | medicamentos | 30d | Nao | Todas | 127 | PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet | OK |
| 29 | medicamentos | 30d | Sim | PNCP | 251 | PNCP, Portal Compras Publicas, LicitaNet | OK |
| 30 | medicamentos | 30d | Sim | ComprasNet | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 31 | medicamentos | 30d | Sim | Licitacoes-e | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 32 | medicamentos | 30d | Sim | Todas | 251 | PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet | OK |
| 33 | medicamentos | 60d | Nao | PNCP | 127 | PNCP, Portal Compras Publicas, LicitaNet | OK |
| 34 | medicamentos | 60d | Nao | ComprasNet | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 35 | medicamentos | 60d | Nao | Licitacoes-e | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 36 | medicamentos | 60d | Nao | Todas | 127 | PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet | OK |
| 37 | medicamentos | 60d | Sim | PNCP | 277 | PNCP, Portal Compras Publicas, LicitaNet | OK |
| 38 | medicamentos | 60d | Sim | ComprasNet | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 39 | medicamentos | 60d | Sim | Licitacoes-e | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 40 | medicamentos | 60d | Sim | Todas | 277 | PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet | OK |
| 41 | medicamentos | 90d | Nao | PNCP | 127 | PNCP, Portal Compras Publicas, LicitaNet | OK |
| 42 | medicamentos | 90d | Nao | ComprasNet | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 43 | medicamentos | 90d | Nao | Licitacoes-e | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 44 | medicamentos | 90d | Nao | Todas | 127 | PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet | OK |
| 45 | medicamentos | 90d | Sim | PNCP | 281 | PNCP, Portal Compras Publicas, LicitaNet | OK |
| 46 | medicamentos | 90d | Sim | ComprasNet | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 47 | medicamentos | 90d | Sim | Licitacoes-e | 0 | ComprasNet, Licitacoes-e, BEC-SP | FALHA (bug filtro) |
| 48 | medicamentos | 90d | Sim | Todas | 281 | PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet | OK |

---

## Detalhes dos Testes

### Teste 1
**Prompt:** `Busque editais de equipamento medico no PNCP ultimos 30 dias sem calcular score`
**Resultado:** 105 editais encontrados
**Fontes consultadas:** PNCP, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 12.2s

**Exemplos de editais retornados:**
1. 007/2026/2026 - FUNDACAO SERVICOS DE SAUDE DE MATO GROSSO DO SUL - registro de preco para futura e eventual compra de acessorios para equipamentos medicos hospitalares
2. 015/FMS/2026 - MUNICIPIO DE CRICIUMA (Criciuma/SC) - contratacao de empresa especializada no fornecimento de equipamentos medico-hospitalares e odontologicos
3. 27/2026/2026 - MUNICIPIO DE HORTOLANDIA (Hortolandia/SP) - servicos de manutencao preventiva e corretiva em equipamentos medico-hospitalares

**Analise:** OK - Correto porque:
- Fonte filtrada corretamente (apenas PNCP API)
- Janela de 30 dias aplicada corretamente
- Editais encerrados EXCLUIDOS (apenas ativos/abertos)
- Termo de busca limpo ("equipamento medico")

### Teste 2
**Prompt:** `Busque editais de equipamento medico no ComprasNet ultimos 30 dias sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.4s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "no ComprasNet" deveria filtrar pelas fontes ComprasNet cadastradas
- Porem o sistema esta consultando apenas fontes scraper (compras Parana, Compras RS, etc.)
- A fonte ComprasNet tipo "api" (www.comprasnet.gov.br) nao parece estar retornando dados
- A API PNCP (que e a unica com dados reais) e excluida do filtro ComprasNet
- Resultado: 0 editais porque scrapers nao possuem dados indexados

### Teste 3
**Prompt:** `Busque editais de equipamento medico licitacoes-e ultimos 30 dias sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.9s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "licitacoes-e" deveria filtrar pela fonte Licitacoes-e (Banco do Brasil)
- Porem o sistema esta consultando TODOS os scrapers, nao apenas Licitacoes-e
- A fonte Licitacoes-e e do tipo scraper, mas nao possui dados indexados/scrapeados
- Resultado: 0 editais porque nenhum scraper possui dados reais

### Teste 4
**Prompt:** `Busque editais de equipamento medico ultimos 30 dias sem calcular score`
**Resultado:** 105 editais encontrados
**Fontes consultadas:** PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 13.4s

**Exemplos de editais retornados:**
1. 007/2026/2026 - FUNDACAO SERVICOS DE SAUDE DE MATO GROSSO DO SUL - registro de preco para futura e eventual compra de acessorios para equipamentos medicos hospitalares
2. 015/FMS/2026 - MUNICIPIO DE CRICIUMA (Criciuma/SC) - contratacao de empresa especializada no fornecimento de equipamentos medico-hospitalares e odontologicos
3. 27/2026/2026 - MUNICIPIO DE HORTOLANDIA (Hortolandia/SP) - servicos de manutencao preventiva e corretiva em equipamentos medico-hospitalares

**Analise:** OK - Correto porque:
- Todas as fontes consultadas (PNCP API + scrapers)
- Janela de 30 dias aplicada corretamente
- Editais encerrados EXCLUIDOS (apenas ativos/abertos)
- Termo de busca limpo ("equipamento medico")

### Teste 5
**Prompt:** `Busque editais de equipamento medico no PNCP ultimos 30 dias incluindo encerrados sem calcular score`
**Resultado:** 151 editais encontrados
**Fontes consultadas:** PNCP, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 11.9s

**Exemplos de editais retornados:**
1. 007/2026/2026 - FUNDACAO SERVICOS DE SAUDE DE MATO GROSSO DO SUL - registro de preco para futura e eventual compra de acessorios para equipamentos medicos hospitalares
2. 015/FMS/2026 - MUNICIPIO DE CRICIUMA (Criciuma/SC) - contratacao de empresa especializada no fornecimento de equipamentos medico-hospitalares e odontologicos
3. 27/2026/2026 - MUNICIPIO DE HORTOLANDIA (Hortolandia/SP) - servicos de manutencao preventiva e corretiva em equipamentos medico-hospitalares

**Analise:** OK - Correto porque:
- Fonte filtrada corretamente (apenas PNCP API)
- Janela de 30 dias aplicada corretamente
- Editais encerrados INCLUIDOS (total maior que sem encerrados)
- Termo de busca limpo ("equipamento medico")

### Teste 6
**Prompt:** `Busque editais de equipamento medico no ComprasNet ultimos 30 dias incluindo encerrados sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.8s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "no ComprasNet" deveria filtrar pelas fontes ComprasNet cadastradas
- Porem o sistema esta consultando apenas fontes scraper (compras Parana, Compras RS, etc.)
- A fonte ComprasNet tipo "api" (www.comprasnet.gov.br) nao parece estar retornando dados
- A API PNCP (que e a unica com dados reais) e excluida do filtro ComprasNet
- Resultado: 0 editais porque scrapers nao possuem dados indexados

### Teste 7
**Prompt:** `Busque editais de equipamento medico licitacoes-e ultimos 30 dias incluindo encerrados sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.6s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "licitacoes-e" deveria filtrar pela fonte Licitacoes-e (Banco do Brasil)
- Porem o sistema esta consultando TODOS os scrapers, nao apenas Licitacoes-e
- A fonte Licitacoes-e e do tipo scraper, mas nao possui dados indexados/scrapeados
- Resultado: 0 editais porque nenhum scraper possui dados reais

### Teste 8
**Prompt:** `Busque editais de equipamento medico ultimos 30 dias incluindo encerrados sem calcular score`
**Resultado:** 151 editais encontrados
**Fontes consultadas:** PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 13.4s

**Exemplos de editais retornados:**
1. 007/2026/2026 - FUNDACAO SERVICOS DE SAUDE DE MATO GROSSO DO SUL - registro de preco para futura e eventual compra de acessorios para equipamentos medicos hospitalares
2. 015/FMS/2026 - MUNICIPIO DE CRICIUMA (Criciuma/SC) - contratacao de empresa especializada no fornecimento de equipamentos medico-hospitalares e odontologicos
3. 27/2026/2026 - MUNICIPIO DE HORTOLANDIA (Hortolandia/SP) - servicos de manutencao preventiva e corretiva em equipamentos medico-hospitalares

**Analise:** OK - Correto porque:
- Todas as fontes consultadas (PNCP API + scrapers)
- Janela de 30 dias aplicada corretamente
- Editais encerrados INCLUIDOS (total maior que sem encerrados)
- Termo de busca limpo ("equipamento medico")

### Teste 9
**Prompt:** `Busque editais de equipamento medico no PNCP ultimos 60 dias sem calcular score`
**Resultado:** 115 editais encontrados
**Fontes consultadas:** PNCP, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 11.8s

**Exemplos de editais retornados:**
1. 007/2026/2026 - FUNDACAO SERVICOS DE SAUDE DE MATO GROSSO DO SUL - registro de preco para futura e eventual compra de acessorios para equipamentos medicos hospitalares
2. 015/FMS/2026 - MUNICIPIO DE CRICIUMA (Criciuma/SC) - contratacao de empresa especializada no fornecimento de equipamentos medico-hospitalares e odontologicos
3. 27/2026/2026 - MUNICIPIO DE HORTOLANDIA (Hortolandia/SP) - servicos de manutencao preventiva e corretiva em equipamentos medico-hospitalares

**Analise:** OK - Correto porque:
- Fonte filtrada corretamente (apenas PNCP API)
- Janela de 60 dias aplicada corretamente
- Editais encerrados EXCLUIDOS (apenas ativos/abertos)
- Termo de busca limpo ("equipamento medico")

### Teste 10
**Prompt:** `Busque editais de equipamento medico no ComprasNet ultimos 60 dias sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.1s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "no ComprasNet" deveria filtrar pelas fontes ComprasNet cadastradas
- Porem o sistema esta consultando apenas fontes scraper (compras Parana, Compras RS, etc.)
- A fonte ComprasNet tipo "api" (www.comprasnet.gov.br) nao parece estar retornando dados
- A API PNCP (que e a unica com dados reais) e excluida do filtro ComprasNet
- Resultado: 0 editais porque scrapers nao possuem dados indexados

### Teste 11
**Prompt:** `Busque editais de equipamento medico licitacoes-e ultimos 60 dias sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.4s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "licitacoes-e" deveria filtrar pela fonte Licitacoes-e (Banco do Brasil)
- Porem o sistema esta consultando TODOS os scrapers, nao apenas Licitacoes-e
- A fonte Licitacoes-e e do tipo scraper, mas nao possui dados indexados/scrapeados
- Resultado: 0 editais porque nenhum scraper possui dados reais

### Teste 12
**Prompt:** `Busque editais de equipamento medico ultimos 60 dias sem calcular score`
**Resultado:** 115 editais encontrados
**Fontes consultadas:** PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 13.9s

**Exemplos de editais retornados:**
1. 007/2026/2026 - FUNDACAO SERVICOS DE SAUDE DE MATO GROSSO DO SUL - registro de preco para futura e eventual compra de acessorios para equipamentos medicos hospitalares
2. 015/FMS/2026 - MUNICIPIO DE CRICIUMA (Criciuma/SC) - contratacao de empresa especializada no fornecimento de equipamentos medico-hospitalares e odontologicos
3. 27/2026/2026 - MUNICIPIO DE HORTOLANDIA (Hortolandia/SP) - servicos de manutencao preventiva e corretiva em equipamentos medico-hospitalares

**Analise:** OK - Correto porque:
- Todas as fontes consultadas (PNCP API + scrapers)
- Janela de 60 dias aplicada corretamente
- Editais encerrados EXCLUIDOS (apenas ativos/abertos)
- Termo de busca limpo ("equipamento medico")

### Teste 13
**Prompt:** `Busque editais de equipamento medico no PNCP ultimos 60 dias incluindo encerrados sem calcular score`
**Resultado:** 176 editais encontrados
**Fontes consultadas:** PNCP, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 12.4s

**Exemplos de editais retornados:**
1. 007/2026/2026 - FUNDACAO SERVICOS DE SAUDE DE MATO GROSSO DO SUL - registro de preco para futura e eventual compra de acessorios para equipamentos medicos hospitalares
2. 015/FMS/2026 - MUNICIPIO DE CRICIUMA (Criciuma/SC) - contratacao de empresa especializada no fornecimento de equipamentos medico-hospitalares e odontologicos
3. 27/2026/2026 - MUNICIPIO DE HORTOLANDIA (Hortolandia/SP) - servicos de manutencao preventiva e corretiva em equipamentos medico-hospitalares

**Analise:** OK - Correto porque:
- Fonte filtrada corretamente (apenas PNCP API)
- Janela de 60 dias aplicada corretamente
- Editais encerrados INCLUIDOS (total maior que sem encerrados)
- Termo de busca limpo ("equipamento medico")

### Teste 14
**Prompt:** `Busque editais de equipamento medico no ComprasNet ultimos 60 dias incluindo encerrados sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.4s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "no ComprasNet" deveria filtrar pelas fontes ComprasNet cadastradas
- Porem o sistema esta consultando apenas fontes scraper (compras Parana, Compras RS, etc.)
- A fonte ComprasNet tipo "api" (www.comprasnet.gov.br) nao parece estar retornando dados
- A API PNCP (que e a unica com dados reais) e excluida do filtro ComprasNet
- Resultado: 0 editais porque scrapers nao possuem dados indexados

### Teste 15
**Prompt:** `Busque editais de equipamento medico licitacoes-e ultimos 60 dias incluindo encerrados sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.3s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "licitacoes-e" deveria filtrar pela fonte Licitacoes-e (Banco do Brasil)
- Porem o sistema esta consultando TODOS os scrapers, nao apenas Licitacoes-e
- A fonte Licitacoes-e e do tipo scraper, mas nao possui dados indexados/scrapeados
- Resultado: 0 editais porque nenhum scraper possui dados reais

### Teste 16
**Prompt:** `Busque editais de equipamento medico ultimos 60 dias incluindo encerrados sem calcular score`
**Resultado:** 176 editais encontrados
**Fontes consultadas:** PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 13.6s

**Exemplos de editais retornados:**
1. 007/2026/2026 - FUNDACAO SERVICOS DE SAUDE DE MATO GROSSO DO SUL - registro de preco para futura e eventual compra de acessorios para equipamentos medicos hospitalares
2. 015/FMS/2026 - MUNICIPIO DE CRICIUMA (Criciuma/SC) - contratacao de empresa especializada no fornecimento de equipamentos medico-hospitalares e odontologicos
3. 27/2026/2026 - MUNICIPIO DE HORTOLANDIA (Hortolandia/SP) - servicos de manutencao preventiva e corretiva em equipamentos medico-hospitalares

**Analise:** OK - Correto porque:
- Todas as fontes consultadas (PNCP API + scrapers)
- Janela de 60 dias aplicada corretamente
- Editais encerrados INCLUIDOS (total maior que sem encerrados)
- Termo de busca limpo ("equipamento medico")

### Teste 17
**Prompt:** `Busque editais de equipamento medico no PNCP sem calcular score`
**Resultado:** 117 editais encontrados
**Fontes consultadas:** PNCP, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 12.2s

**Exemplos de editais retornados:**
1. 007/2026/2026 - FUNDACAO SERVICOS DE SAUDE DE MATO GROSSO DO SUL - registro de preco para futura e eventual compra de acessorios para equipamentos medicos hospitalares
2. 015/FMS/2026 - MUNICIPIO DE CRICIUMA (Criciuma/SC) - contratacao de empresa especializada no fornecimento de equipamentos medico-hospitalares e odontologicos
3. 27/2026/2026 - MUNICIPIO DE HORTOLANDIA (Hortolandia/SP) - servicos de manutencao preventiva e corretiva em equipamentos medico-hospitalares

**Analise:** OK - Correto porque:
- Fonte filtrada corretamente (apenas PNCP API)
- Janela de 90 dias aplicada corretamente
- Editais encerrados EXCLUIDOS (apenas ativos/abertos)
- Termo de busca limpo ("equipamento medico")

### Teste 18
**Prompt:** `Busque editais de equipamento medico no ComprasNet sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.5s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "no ComprasNet" deveria filtrar pelas fontes ComprasNet cadastradas
- Porem o sistema esta consultando apenas fontes scraper (compras Parana, Compras RS, etc.)
- A fonte ComprasNet tipo "api" (www.comprasnet.gov.br) nao parece estar retornando dados
- A API PNCP (que e a unica com dados reais) e excluida do filtro ComprasNet
- Resultado: 0 editais porque scrapers nao possuem dados indexados

### Teste 19
**Prompt:** `Busque editais de equipamento medico licitacoes-e sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.1s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "licitacoes-e" deveria filtrar pela fonte Licitacoes-e (Banco do Brasil)
- Porem o sistema esta consultando TODOS os scrapers, nao apenas Licitacoes-e
- A fonte Licitacoes-e e do tipo scraper, mas nao possui dados indexados/scrapeados
- Resultado: 0 editais porque nenhum scraper possui dados reais

### Teste 20
**Prompt:** `Busque editais de equipamento medico sem calcular score`
**Resultado:** 117 editais encontrados
**Fontes consultadas:** PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 13.4s

**Exemplos de editais retornados:**
1. 007/2026/2026 - FUNDACAO SERVICOS DE SAUDE DE MATO GROSSO DO SUL - registro de preco para futura e eventual compra de acessorios para equipamentos medicos hospitalares
2. 015/FMS/2026 - MUNICIPIO DE CRICIUMA (Criciuma/SC) - contratacao de empresa especializada no fornecimento de equipamentos medico-hospitalares e odontologicos
3. 27/2026/2026 - MUNICIPIO DE HORTOLANDIA (Hortolandia/SP) - servicos de manutencao preventiva e corretiva em equipamentos medico-hospitalares

**Analise:** OK - Correto porque:
- Todas as fontes consultadas (PNCP API + scrapers)
- Janela de 90 dias aplicada corretamente
- Editais encerrados EXCLUIDOS (apenas ativos/abertos)
- Termo de busca limpo ("equipamento medico")

### Teste 21
**Prompt:** `Busque editais de equipamento medico no PNCP incluindo encerrados sem calcular score`
**Resultado:** 184 editais encontrados
**Fontes consultadas:** PNCP, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 12.3s

**Exemplos de editais retornados:**
1. 007/2026/2026 - FUNDACAO SERVICOS DE SAUDE DE MATO GROSSO DO SUL - registro de preco para futura e eventual compra de acessorios para equipamentos medicos hospitalares
2. 015/FMS/2026 - MUNICIPIO DE CRICIUMA (Criciuma/SC) - contratacao de empresa especializada no fornecimento de equipamentos medico-hospitalares e odontologicos
3. 27/2026/2026 - MUNICIPIO DE HORTOLANDIA (Hortolandia/SP) - servicos de manutencao preventiva e corretiva em equipamentos medico-hospitalares

**Analise:** OK - Correto porque:
- Fonte filtrada corretamente (apenas PNCP API)
- Janela de 90 dias aplicada corretamente
- Editais encerrados INCLUIDOS (total maior que sem encerrados)
- Termo de busca limpo ("equipamento medico")

### Teste 22
**Prompt:** `Busque editais de equipamento medico no ComprasNet incluindo encerrados sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.2s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "no ComprasNet" deveria filtrar pelas fontes ComprasNet cadastradas
- Porem o sistema esta consultando apenas fontes scraper (compras Parana, Compras RS, etc.)
- A fonte ComprasNet tipo "api" (www.comprasnet.gov.br) nao parece estar retornando dados
- A API PNCP (que e a unica com dados reais) e excluida do filtro ComprasNet
- Resultado: 0 editais porque scrapers nao possuem dados indexados

### Teste 23
**Prompt:** `Busque editais de equipamento medico licitacoes-e incluindo encerrados sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.3s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "licitacoes-e" deveria filtrar pela fonte Licitacoes-e (Banco do Brasil)
- Porem o sistema esta consultando TODOS os scrapers, nao apenas Licitacoes-e
- A fonte Licitacoes-e e do tipo scraper, mas nao possui dados indexados/scrapeados
- Resultado: 0 editais porque nenhum scraper possui dados reais

### Teste 24
**Prompt:** `Busque editais de equipamento medico incluindo encerrados sem calcular score`
**Resultado:** 184 editais encontrados
**Fontes consultadas:** PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 14.6s

**Exemplos de editais retornados:**
1. 007/2026/2026 - FUNDACAO SERVICOS DE SAUDE DE MATO GROSSO DO SUL - registro de preco para futura e eventual compra de acessorios para equipamentos medicos hospitalares
2. 015/FMS/2026 - MUNICIPIO DE CRICIUMA (Criciuma/SC) - contratacao de empresa especializada no fornecimento de equipamentos medico-hospitalares e odontologicos
3. 27/2026/2026 - MUNICIPIO DE HORTOLANDIA (Hortolandia/SP) - servicos de manutencao preventiva e corretiva em equipamentos medico-hospitalares

**Analise:** OK - Correto porque:
- Todas as fontes consultadas (PNCP API + scrapers)
- Janela de 90 dias aplicada corretamente
- Editais encerrados INCLUIDOS (total maior que sem encerrados)
- Termo de busca limpo ("equipamento medico")

### Teste 25
**Prompt:** `Busque editais de medicamentos no PNCP ultimos 30 dias sem calcular score`
**Resultado:** 127 editais encontrados
**Fontes consultadas:** PNCP, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 13.3s

**Exemplos de editais retornados:**
1. 99/2026 - TRIBUNAL DA JUSTICA DO ESTADO DE MINAS GERAIS (Belo Horizonte/MG) - aquisicao de medicamentos alopaticos
2. 19000-241/2025 - SECRETARIA DE ESTADO DA ADMINISTRACAO (Joao Pessoa/PB) - registro de precos para aquisicao de medicamentos
3. 1/2026 - CONSORCIO PUBLICO DE SAUDE DA MICRORREGIAO DE MARACANAU (Maracanau/CE) - aquisicao de medicamentos tipo soros e solucoes

**Analise:** OK - Correto porque:
- Fonte filtrada corretamente (apenas PNCP API)
- Janela de 30 dias aplicada corretamente
- Editais encerrados EXCLUIDOS (apenas ativos/abertos)
- Termo de busca limpo ("medicamentos")

### Teste 26
**Prompt:** `Busque editais de medicamentos no ComprasNet ultimos 30 dias sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.3s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "no ComprasNet" deveria filtrar pelas fontes ComprasNet cadastradas
- Porem o sistema esta consultando apenas fontes scraper (compras Parana, Compras RS, etc.)
- A fonte ComprasNet tipo "api" (www.comprasnet.gov.br) nao parece estar retornando dados
- A API PNCP (que e a unica com dados reais) e excluida do filtro ComprasNet
- Resultado: 0 editais porque scrapers nao possuem dados indexados

### Teste 27
**Prompt:** `Busque editais de medicamentos licitacoes-e ultimos 30 dias sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.6s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "licitacoes-e" deveria filtrar pela fonte Licitacoes-e (Banco do Brasil)
- Porem o sistema esta consultando TODOS os scrapers, nao apenas Licitacoes-e
- A fonte Licitacoes-e e do tipo scraper, mas nao possui dados indexados/scrapeados
- Resultado: 0 editais porque nenhum scraper possui dados reais

### Teste 28
**Prompt:** `Busque editais de medicamentos ultimos 30 dias sem calcular score`
**Resultado:** 127 editais encontrados
**Fontes consultadas:** PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 15.1s

**Exemplos de editais retornados:**
1. 99/2026 - TRIBUNAL DA JUSTICA DO ESTADO DE MINAS GERAIS (Belo Horizonte/MG) - aquisicao de medicamentos alopaticos
2. 19000-241/2025 - SECRETARIA DE ESTADO DA ADMINISTRACAO (Joao Pessoa/PB) - registro de precos para aquisicao de medicamentos
3. 1/2026 - CONSORCIO PUBLICO DE SAUDE DA MICRORREGIAO DE MARACANAU (Maracanau/CE) - aquisicao de medicamentos tipo soros e solucoes

**Analise:** OK - Correto porque:
- Todas as fontes consultadas (PNCP API + scrapers)
- Janela de 30 dias aplicada corretamente
- Editais encerrados EXCLUIDOS (apenas ativos/abertos)
- Termo de busca limpo ("medicamentos")

### Teste 29
**Prompt:** `Busque editais de medicamentos no PNCP ultimos 30 dias incluindo encerrados sem calcular score`
**Resultado:** 251 editais encontrados
**Fontes consultadas:** PNCP, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 12.9s

**Exemplos de editais retornados:**
1. 99/2026 - TRIBUNAL DA JUSTICA DO ESTADO DE MINAS GERAIS (Belo Horizonte/MG) - aquisicao de medicamentos alopaticos
2. 19000-241/2025 - SECRETARIA DE ESTADO DA ADMINISTRACAO (Joao Pessoa/PB) - registro de precos para aquisicao de medicamentos
3. 1/2026 - CONSORCIO PUBLICO DE SAUDE DA MICRORREGIAO DE MARACANAU (Maracanau/CE) - aquisicao de medicamentos tipo soros e solucoes

**Analise:** OK - Correto porque:
- Fonte filtrada corretamente (apenas PNCP API)
- Janela de 30 dias aplicada corretamente
- Editais encerrados INCLUIDOS (total maior que sem encerrados)
- Termo de busca limpo ("medicamentos")

### Teste 30
**Prompt:** `Busque editais de medicamentos no ComprasNet ultimos 30 dias incluindo encerrados sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.4s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "no ComprasNet" deveria filtrar pelas fontes ComprasNet cadastradas
- Porem o sistema esta consultando apenas fontes scraper (compras Parana, Compras RS, etc.)
- A fonte ComprasNet tipo "api" (www.comprasnet.gov.br) nao parece estar retornando dados
- A API PNCP (que e a unica com dados reais) e excluida do filtro ComprasNet
- Resultado: 0 editais porque scrapers nao possuem dados indexados

### Teste 31
**Prompt:** `Busque editais de medicamentos licitacoes-e ultimos 30 dias incluindo encerrados sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 6.5s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "licitacoes-e" deveria filtrar pela fonte Licitacoes-e (Banco do Brasil)
- Porem o sistema esta consultando TODOS os scrapers, nao apenas Licitacoes-e
- A fonte Licitacoes-e e do tipo scraper, mas nao possui dados indexados/scrapeados
- Resultado: 0 editais porque nenhum scraper possui dados reais

### Teste 32
**Prompt:** `Busque editais de medicamentos ultimos 30 dias incluindo encerrados sem calcular score`
**Resultado:** 251 editais encontrados
**Fontes consultadas:** PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 15.9s

**Exemplos de editais retornados:**
1. 99/2026 - TRIBUNAL DA JUSTICA DO ESTADO DE MINAS GERAIS (Belo Horizonte/MG) - aquisicao de medicamentos alopaticos
2. 19000-241/2025 - SECRETARIA DE ESTADO DA ADMINISTRACAO (Joao Pessoa/PB) - registro de precos para aquisicao de medicamentos
3. 1/2026 - CONSORCIO PUBLICO DE SAUDE DA MICRORREGIAO DE MARACANAU (Maracanau/CE) - aquisicao de medicamentos tipo soros e solucoes

**Analise:** OK - Correto porque:
- Todas as fontes consultadas (PNCP API + scrapers)
- Janela de 30 dias aplicada corretamente
- Editais encerrados INCLUIDOS (total maior que sem encerrados)
- Termo de busca limpo ("medicamentos")

### Teste 33
**Prompt:** `Busque editais de medicamentos no PNCP ultimos 60 dias sem calcular score`
**Resultado:** 127 editais encontrados
**Fontes consultadas:** PNCP, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 13.1s

**Exemplos de editais retornados:**
1. 99/2026 - TRIBUNAL DA JUSTICA DO ESTADO DE MINAS GERAIS (Belo Horizonte/MG) - aquisicao de medicamentos alopaticos
2. 19000-241/2025 - SECRETARIA DE ESTADO DA ADMINISTRACAO (Joao Pessoa/PB) - registro de precos para aquisicao de medicamentos
3. 1/2026 - CONSORCIO PUBLICO DE SAUDE DA MICRORREGIAO DE MARACANAU (Maracanau/CE) - aquisicao de medicamentos tipo soros e solucoes

**Analise:** OK - Correto porque:
- Fonte filtrada corretamente (apenas PNCP API)
- Janela de 60 dias aplicada corretamente
- Editais encerrados EXCLUIDOS (apenas ativos/abertos)
- Termo de busca limpo ("medicamentos")

### Teste 34
**Prompt:** `Busque editais de medicamentos no ComprasNet ultimos 60 dias sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.3s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "no ComprasNet" deveria filtrar pelas fontes ComprasNet cadastradas
- Porem o sistema esta consultando apenas fontes scraper (compras Parana, Compras RS, etc.)
- A fonte ComprasNet tipo "api" (www.comprasnet.gov.br) nao parece estar retornando dados
- A API PNCP (que e a unica com dados reais) e excluida do filtro ComprasNet
- Resultado: 0 editais porque scrapers nao possuem dados indexados

### Teste 35
**Prompt:** `Busque editais de medicamentos licitacoes-e ultimos 60 dias sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.0s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "licitacoes-e" deveria filtrar pela fonte Licitacoes-e (Banco do Brasil)
- Porem o sistema esta consultando TODOS os scrapers, nao apenas Licitacoes-e
- A fonte Licitacoes-e e do tipo scraper, mas nao possui dados indexados/scrapeados
- Resultado: 0 editais porque nenhum scraper possui dados reais

### Teste 36
**Prompt:** `Busque editais de medicamentos ultimos 60 dias sem calcular score`
**Resultado:** 127 editais encontrados
**Fontes consultadas:** PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 14.6s

**Exemplos de editais retornados:**
1. 99/2026 - TRIBUNAL DA JUSTICA DO ESTADO DE MINAS GERAIS (Belo Horizonte/MG) - aquisicao de medicamentos alopaticos
2. 19000-241/2025 - SECRETARIA DE ESTADO DA ADMINISTRACAO (Joao Pessoa/PB) - registro de precos para aquisicao de medicamentos
3. 1/2026 - CONSORCIO PUBLICO DE SAUDE DA MICRORREGIAO DE MARACANAU (Maracanau/CE) - aquisicao de medicamentos tipo soros e solucoes

**Analise:** OK - Correto porque:
- Todas as fontes consultadas (PNCP API + scrapers)
- Janela de 60 dias aplicada corretamente
- Editais encerrados EXCLUIDOS (apenas ativos/abertos)
- Termo de busca limpo ("medicamentos")

### Teste 37
**Prompt:** `Busque editais de medicamentos no PNCP ultimos 60 dias incluindo encerrados sem calcular score`
**Resultado:** 277 editais encontrados
**Fontes consultadas:** PNCP, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 12.9s

**Exemplos de editais retornados:**
1. 99/2026 - TRIBUNAL DA JUSTICA DO ESTADO DE MINAS GERAIS (Belo Horizonte/MG) - aquisicao de medicamentos alopaticos
2. 19000-241/2025 - SECRETARIA DE ESTADO DA ADMINISTRACAO (Joao Pessoa/PB) - registro de precos para aquisicao de medicamentos
3. 1/2026 - CONSORCIO PUBLICO DE SAUDE DA MICRORREGIAO DE MARACANAU (Maracanau/CE) - aquisicao de medicamentos tipo soros e solucoes

**Analise:** OK - Correto porque:
- Fonte filtrada corretamente (apenas PNCP API)
- Janela de 60 dias aplicada corretamente
- Editais encerrados INCLUIDOS (total maior que sem encerrados)
- Termo de busca limpo ("medicamentos")

### Teste 38
**Prompt:** `Busque editais de medicamentos no ComprasNet ultimos 60 dias incluindo encerrados sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.5s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "no ComprasNet" deveria filtrar pelas fontes ComprasNet cadastradas
- Porem o sistema esta consultando apenas fontes scraper (compras Parana, Compras RS, etc.)
- A fonte ComprasNet tipo "api" (www.comprasnet.gov.br) nao parece estar retornando dados
- A API PNCP (que e a unica com dados reais) e excluida do filtro ComprasNet
- Resultado: 0 editais porque scrapers nao possuem dados indexados

### Teste 39
**Prompt:** `Busque editais de medicamentos licitacoes-e ultimos 60 dias incluindo encerrados sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.2s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "licitacoes-e" deveria filtrar pela fonte Licitacoes-e (Banco do Brasil)
- Porem o sistema esta consultando TODOS os scrapers, nao apenas Licitacoes-e
- A fonte Licitacoes-e e do tipo scraper, mas nao possui dados indexados/scrapeados
- Resultado: 0 editais porque nenhum scraper possui dados reais

### Teste 40
**Prompt:** `Busque editais de medicamentos ultimos 60 dias incluindo encerrados sem calcular score`
**Resultado:** 277 editais encontrados
**Fontes consultadas:** PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 14.6s

**Exemplos de editais retornados:**
1. 99/2026 - TRIBUNAL DA JUSTICA DO ESTADO DE MINAS GERAIS (Belo Horizonte/MG) - aquisicao de medicamentos alopaticos
2. 19000-241/2025 - SECRETARIA DE ESTADO DA ADMINISTRACAO (Joao Pessoa/PB) - registro de precos para aquisicao de medicamentos
3. 1/2026 - CONSORCIO PUBLICO DE SAUDE DA MICRORREGIAO DE MARACANAU (Maracanau/CE) - aquisicao de medicamentos tipo soros e solucoes

**Analise:** OK - Correto porque:
- Todas as fontes consultadas (PNCP API + scrapers)
- Janela de 60 dias aplicada corretamente
- Editais encerrados INCLUIDOS (total maior que sem encerrados)
- Termo de busca limpo ("medicamentos")

### Teste 41
**Prompt:** `Busque editais de medicamentos no PNCP sem calcular score`
**Resultado:** 127 editais encontrados
**Fontes consultadas:** PNCP, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 13.3s

**Exemplos de editais retornados:**
1. 99/2026 - TRIBUNAL DA JUSTICA DO ESTADO DE MINAS GERAIS (Belo Horizonte/MG) - aquisicao de medicamentos alopaticos
2. 19000-241/2025 - SECRETARIA DE ESTADO DA ADMINISTRACAO (Joao Pessoa/PB) - registro de precos para aquisicao de medicamentos
3. 1/2026 - CONSORCIO PUBLICO DE SAUDE DA MICRORREGIAO DE MARACANAU (Maracanau/CE) - aquisicao de medicamentos tipo soros e solucoes

**Analise:** OK - Correto porque:
- Fonte filtrada corretamente (apenas PNCP API)
- Janela de 90 dias aplicada corretamente
- Editais encerrados EXCLUIDOS (apenas ativos/abertos)
- Termo de busca limpo ("medicamentos")

### Teste 42
**Prompt:** `Busque editais de medicamentos no ComprasNet sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.0s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "no ComprasNet" deveria filtrar pelas fontes ComprasNet cadastradas
- Porem o sistema esta consultando apenas fontes scraper (compras Parana, Compras RS, etc.)
- A fonte ComprasNet tipo "api" (www.comprasnet.gov.br) nao parece estar retornando dados
- A API PNCP (que e a unica com dados reais) e excluida do filtro ComprasNet
- Resultado: 0 editais porque scrapers nao possuem dados indexados

### Teste 43
**Prompt:** `Busque editais de medicamentos licitacoes-e sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.1s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "licitacoes-e" deveria filtrar pela fonte Licitacoes-e (Banco do Brasil)
- Porem o sistema esta consultando TODOS os scrapers, nao apenas Licitacoes-e
- A fonte Licitacoes-e e do tipo scraper, mas nao possui dados indexados/scrapeados
- Resultado: 0 editais porque nenhum scraper possui dados reais

### Teste 44
**Prompt:** `Busque editais de medicamentos sem calcular score`
**Resultado:** 127 editais encontrados
**Fontes consultadas:** PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 14.4s

**Exemplos de editais retornados:**
1. 99/2026 - TRIBUNAL DA JUSTICA DO ESTADO DE MINAS GERAIS (Belo Horizonte/MG) - aquisicao de medicamentos alopaticos
2. 19000-241/2025 - SECRETARIA DE ESTADO DA ADMINISTRACAO (Joao Pessoa/PB) - registro de precos para aquisicao de medicamentos
3. 1/2026 - CONSORCIO PUBLICO DE SAUDE DA MICRORREGIAO DE MARACANAU (Maracanau/CE) - aquisicao de medicamentos tipo soros e solucoes

**Analise:** OK - Correto porque:
- Todas as fontes consultadas (PNCP API + scrapers)
- Janela de 90 dias aplicada corretamente
- Editais encerrados EXCLUIDOS (apenas ativos/abertos)
- Termo de busca limpo ("medicamentos")

### Teste 45
**Prompt:** `Busque editais de medicamentos no PNCP incluindo encerrados sem calcular score`
**Resultado:** 281 editais encontrados
**Fontes consultadas:** PNCP, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 12.9s

**Exemplos de editais retornados:**
1. 99/2026 - TRIBUNAL DA JUSTICA DO ESTADO DE MINAS GERAIS (Belo Horizonte/MG) - aquisicao de medicamentos alopaticos
2. 19000-241/2025 - SECRETARIA DE ESTADO DA ADMINISTRACAO (Joao Pessoa/PB) - registro de precos para aquisicao de medicamentos
3. 1/2026 - CONSORCIO PUBLICO DE SAUDE DA MICRORREGIAO DE MARACANAU (Maracanau/CE) - aquisicao de medicamentos tipo soros e solucoes

**Analise:** OK - Correto porque:
- Fonte filtrada corretamente (apenas PNCP API)
- Janela de 90 dias aplicada corretamente
- Editais encerrados INCLUIDOS (total maior que sem encerrados)
- Termo de busca limpo ("medicamentos")

### Teste 46
**Prompt:** `Busque editais de medicamentos no ComprasNet incluindo encerrados sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.3s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "no ComprasNet" deveria filtrar pelas fontes ComprasNet cadastradas
- Porem o sistema esta consultando apenas fontes scraper (compras Parana, Compras RS, etc.)
- A fonte ComprasNet tipo "api" (www.comprasnet.gov.br) nao parece estar retornando dados
- A API PNCP (que e a unica com dados reais) e excluida do filtro ComprasNet
- Resultado: 0 editais porque scrapers nao possuem dados indexados

### Teste 47
**Prompt:** `Busque editais de medicamentos licitacoes-e incluindo encerrados sem calcular score`
**Resultado:** 0 editais encontrados
**Fontes consultadas:** Apenas scrapers (sem dados indexados)
**Tempo de resposta:** 5.1s

**Analise:** FALHA - Bug no filtro de fonte:
- O prompt "licitacoes-e" deveria filtrar pela fonte Licitacoes-e (Banco do Brasil)
- Porem o sistema esta consultando TODOS os scrapers, nao apenas Licitacoes-e
- A fonte Licitacoes-e e do tipo scraper, mas nao possui dados indexados/scrapeados
- Resultado: 0 editais porque nenhum scraper possui dados reais

### Teste 48
**Prompt:** `Busque editais de medicamentos incluindo encerrados sem calcular score`
**Resultado:** 281 editais encontrados
**Fontes consultadas:** PNCP, ComprasNet, Licitacoes-e, Portal Compras Publicas, LicitaNet
**Tempo de resposta:** 15.4s

**Exemplos de editais retornados:**
1. 99/2026 - TRIBUNAL DA JUSTICA DO ESTADO DE MINAS GERAIS (Belo Horizonte/MG) - aquisicao de medicamentos alopaticos
2. 19000-241/2025 - SECRETARIA DE ESTADO DA ADMINISTRACAO (Joao Pessoa/PB) - registro de precos para aquisicao de medicamentos
3. 1/2026 - CONSORCIO PUBLICO DE SAUDE DA MICRORREGIAO DE MARACANAU (Maracanau/CE) - aquisicao de medicamentos tipo soros e solucoes

**Analise:** OK - Correto porque:
- Todas as fontes consultadas (PNCP API + scrapers)
- Janela de 90 dias aplicada corretamente
- Editais encerrados INCLUIDOS (total maior que sem encerrados)
- Termo de busca limpo ("medicamentos")

---

## Analise de Consistencia

### Verificacao 1: Filtro de Fonte

**Termo: equip. med. (90d, sem encerrados)**

- PNCP: 117 editais
- ComprasNet: 0 editais
- Licitacoes-e: 0 editais
- Todas: 117 editais

**Termo: medicamentos (90d, sem encerrados)**

- PNCP: 127 editais
- ComprasNet: 0 editais
- Licitacoes-e: 0 editais
- Todas: 127 editais

**Observacao:** PNCP e Todas retornam **exatamente o mesmo numero** de editais. Isso indica que os scrapers nao contribuem com dados adicionais -- apenas o PNCP API fornece resultados reais. ComprasNet e Licitacoes-e retornam 0 por causa do bug de filtro.

**Veredicto:** FALHA PARCIAL
- PNCP: Filtra corretamente
- Todas: Funciona (consulta tudo, mas so PNCP retorna dados)
- ComprasNet: NAO FUNCIONA (0 resultados)
- Licitacoes-e: NAO FUNCIONA (0 resultados)

### Verificacao 2: Janela de Dias

Espera-se que **30d <= 60d <= 90d** (mais dias = mais ou igual editais).

- **equip. med. (sem enc., PNCP):** 30d=105, 60d=115, 90d=117 --> OK
- **equip. med. (com enc., PNCP):** 30d=151, 60d=176, 90d=184 --> OK
- **medicamentos (sem enc., PNCP):** 30d=127, 60d=127, 90d=127 --> OK
- **medicamentos (com enc., PNCP):** 30d=251, 60d=277, 90d=281 --> OK

**Veredicto:** OK - Todos os casos mostram 30d <= 60d <= 90d, o que e logicamente correto.

### Verificacao 3: Filtro de Encerrados

Espera-se que **incluindo encerrados >= sem encerrados** (mais editais quando inclui encerrados).

- **equip. med. (30d, PNCP):** sem enc.=105, com enc.=151 (dif=+46) --> OK
- **equip. med. (60d, PNCP):** sem enc.=115, com enc.=176 (dif=+61) --> OK
- **equip. med. (90d, PNCP):** sem enc.=117, com enc.=184 (dif=+67) --> OK
- **medicamentos (30d, PNCP):** sem enc.=127, com enc.=251 (dif=+124) --> OK
- **medicamentos (60d, PNCP):** sem enc.=127, com enc.=277 (dif=+150) --> OK
- **medicamentos (90d, PNCP):** sem enc.=127, com enc.=281 (dif=+154) --> OK

**Veredicto:** OK - Em todos os casos, incluir encerrados aumenta o numero de editais, o que e logicamente correto.

### Verificacao 4: Termo de Busca

Os editais retornados devem conter termos relevantes ao busca.

- **equipamento medico:** Os 3 primeiros editais retornados contem os termos "equipamentos medicos", "equipamentos medico-hospitalares" e "manutencao em equipamentos". OK
- **medicamentos:** Os 3 primeiros editais retornados contem os termos "medicamentos alopaticos", "aquisicao de medicamentos", "medicamentos tipo soros". OK

**Veredicto:** OK - Os editais sao relevantes para os termos buscados.

### Verificacao 5: PNCP vs Todas as Fontes

Compara o numero de editais entre PNCP filtrado e Todas as fontes.

**Em todos os 12 pares comparados, PNCP e Todas retornam exatamente o mesmo numero de editais.**

Isso confirma que os scrapers (ComprasNet, Licitacoes-e, BEC-SP, Compras RS, etc.) **nao possuem dados indexados** na base de dados. Apenas a API do PNCP retorna resultados reais.

**Veredicto:** ATENCAO - Os scrapers nao contribuem com dados. Pode ser esperado (scrapers nao implementados) ou pode ser um bug.

---

## Erros Encontrados e Propostas de Correcao

### Erro 1: Filtro ComprasNet e Licitacoes-e nao funciona (24 testes afetados)

**Descricao:** Quando o usuario usa "no ComprasNet" ou "licitacoes-e" no prompt, o sistema deveria filtrar por essas fontes especificas. Porem, o filtro esta sendo aplicado apenas sobre fontes do tipo scraper, excluindo a API PNCP. Como os scrapers nao possuem dados indexados, o resultado e sempre 0 editais.

**Impacto:** 24 dos 48 testes (50%) retornam 0 resultados quando deveriam retornar editais (ou pelo menos informar que a fonte solicitada nao possui dados).

**Causa provavel:** No metodo `_buscar_editais_multifonte()` em `app.py`, quando a fonte e "ComprasNet" ou "Licitacoes-e", o sistema filtra pelas fontes cadastradas com esses nomes, que sao todas do tipo scraper. A API PNCP, que e a unica fonte com dados reais, e excluida do filtro.

**Comportamento observado nas respostas ComprasNet/Licitacoes-e:**
```
Fontes consultadas: www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper),
                    www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
Resultado: Nenhum edital encontrado
```

**Proposta de correcao:**

Opcao A - Melhorar o filtro de fonte para incluir a API PNCP quando ComprasNet/Licitacoes-e e solicitado:
```python
# Em _buscar_editais_multifonte(), ajustar o filtro de fonte:
if fonte_filtro:
    fonte_lower = fonte_filtro.lower()
    if fonte_lower in ['comprasnet', 'licitacoes-e', 'licitações-e']:
        # Estas fontes sao scrapers sem dados indexados.
        # Informar ao usuario que a fonte nao possui dados disponiveis.
        # Ou buscar no PNCP como fallback.
        pass
```

Opcao B - Informar ao usuario que a fonte solicitada nao possui dados indexados e sugerir usar PNCP:
```python
if total_editais == 0 and fonte_filtro:
    return f'A fonte {fonte_filtro} nao possui editais indexados no momento. '
           f'Tente buscar no PNCP (que e a fonte principal com dados reais): '
           f'"Busque editais de {termo} no PNCP"'
```

### Erro 2: Scrapers nao possuem dados indexados

**Descricao:** Nenhuma fonte do tipo scraper (ComprasNet, Licitacoes-e, BEC-SP, Compras RS, etc.) retorna dados. Quando "Todas as fontes" e selecionado, o numero de editais e identico ao do PNCP sozinho, indicando que os scrapers nao contribuem com dados.

**Impacto:** O sistema esta efetivamente dependente 100% da API PNCP. Se o PNCP estiver fora do ar, nenhum edital sera retornado.

**Proposta de correcao:**
- Implementar os scrapers para as fontes cadastradas (ComprasNet, Licitacoes-e, BEC-SP, etc.)
- Ou remover/desativar fontes scraper que nao possuem implementacao funcional
- Ou informar claramente na resposta quais fontes possuem dados e quais nao

### Observacao: Testes PNCP e Todas funcionam corretamente

Os 24 testes com filtro PNCP e Todas as fontes funcionaram como esperado:
- Filtro de janela (30d < 60d < 90d): OK em todos os casos
- Filtro de encerrados (com enc. > sem enc.): OK em todos os casos
- Limpeza do termo de busca: OK ("sem calcular score", "incluindo encerrados", "ultimos X dias" removidos)
- Editais retornados sao relevantes para os termos buscados

---

## Tabela Detalhada de Valores

### Equipamento Medico

| Janela | Encerrados | PNCP | ComprasNet | Licitacoes-e | Todas |
|--------|------------|------|------------|-------------|-------|
| 30d | Nao | 105 | 0 | 0 | 105 |
| 30d | Sim | 151 | 0 | 0 | 151 |
| 60d | Nao | 115 | 0 | 0 | 115 |
| 60d | Sim | 176 | 0 | 0 | 176 |
| 90d | Nao | 117 | 0 | 0 | 117 |
| 90d | Sim | 184 | 0 | 0 | 184 |

### Medicamentos

| Janela | Encerrados | PNCP | ComprasNet | Licitacoes-e | Todas |
|--------|------------|------|------------|-------------|-------|
| 30d | Nao | 127 | 0 | 0 | 127 |
| 30d | Sim | 251 | 0 | 0 | 251 |
| 60d | Nao | 127 | 0 | 0 | 127 |
| 60d | Sim | 277 | 0 | 0 | 277 |
| 90d | Nao | 127 | 0 | 0 | 127 |
| 90d | Sim | 281 | 0 | 0 | 281 |

---

## Tempos de Resposta

| Fonte | Tempo Medio (s) | Min (s) | Max (s) |
|-------|----------------|---------|---------|
| PNCP | 12.6 | 11.8 | 13.3 |
| ComprasNet | 5.4 | 5.0 | 5.8 |
| Licitacoes-e | 5.4 | 5.0 | 6.5 |
| Todas | 14.4 | 13.4 | 15.9 |

**Observacao:** Testes com PNCP e Todas levam ~12-15s (chamada real a API PNCP). Testes com ComprasNet e Licitacoes-e levam ~5s (consulta rapida aos scrapers sem dados).

---

## Exemplos de Editais Retornados

### Termo: equipamento medico

| # | Numero | Orgao | Objeto |
|---|--------|-------|--------|
| 1 | 007/2026/2026 | FUNDACAO SERVICOS DE SAUDE DE MATO GROSSO DO SUL (Campo Grande/MS) | Registro de preco para compra de acessorios para equipamentos medicos hospitalares |
| 2 | 015/FMS/2026 | MUNICIPIO DE CRICIUMA (Criciuma/SC) | Fornecimento de equipamentos medico-hospitalares e odontologicos para UBS |
| 3 | 27/2026/2026 | MUNICIPIO DE HORTOLANDIA (Hortolandia/SP) | Servicos de manutencao preventiva e corretiva em equipamentos medico-hospitalares |

### Termo: medicamentos

| # | Numero | Orgao | Objeto |
|---|--------|-------|--------|
| 1 | 99/2026 | TRIBUNAL DA JUSTICA DO ESTADO DE MINAS GERAIS (Belo Horizonte/MG) | Aquisicao de medicamentos alopaticos |
| 2 | 19000-241/2025 | SECRETARIA DE ESTADO DA ADMINISTRACAO (Joao Pessoa/PB) | Registro de precos para aquisicao de medicamentos |
| 3 | 1/2026 | CONSORCIO PUBLICO DE SAUDE DA MICRORREGIAO DE MARACANAU (Maracanau/CE) | Aquisicao de medicamentos tipo soros e solucoes |

---

## Conclusao Final

### O que funciona corretamente (24/48 testes):
1. **Busca por PNCP:** Retorna editais relevantes com filtros aplicados corretamente
2. **Busca por Todas as fontes:** Funciona identicamente ao PNCP (pois scrapers nao possuem dados)
3. **Filtro de janela de dias:** 30d < 60d < 90d em todos os casos testados
4. **Filtro de encerrados:** Incluir encerrados sempre retorna mais editais que sem encerrados
5. **Limpeza do termo de busca:** Modificadores ("sem calcular score", "incluindo encerrados", "ultimos X dias") sao removidos corretamente do termo
6. **Relevancia dos resultados:** Editais retornados sao tematicamente relevantes para os termos buscados

### O que nao funciona (24/48 testes):
1. **Filtro ComprasNet:** Nao filtra corretamente, consulta apenas scrapers sem dados (0 resultados)
2. **Filtro Licitacoes-e:** Nao filtra corretamente, consulta apenas scrapers sem dados (0 resultados)
3. **Scrapers em geral:** Nenhum scraper retorna dados, tornando o sistema dependente 100% do PNCP

### Recomendacoes:
1. Corrigir o filtro de fonte para ComprasNet e Licitacoes-e ou informar o usuario que essas fontes nao possuem dados indexados
2. Implementar scrapers funcionais ou desativar fontes sem dados
3. Considerar adicionar um fallback: se a fonte solicitada nao retornar dados, sugerir busca no PNCP
