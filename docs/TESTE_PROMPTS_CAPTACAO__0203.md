# Relatorio de Testes - Busca de Editais via Chat
**Data:** 2026-03-02 13:15:57
**Servidor:** localhost:5007
**Executor:** Script automatizado Python (48 testes)
**API de Scraping:** DuckDuckGo (SCRAPE_API=duckduckgo)
**Tempo total de execucao:** 1418 segundos (23.6 minutos)

---

## Resumo Executivo

- **Total de testes:** 48
- **Testes com resultados (OK):** 24
- **Testes sem resultados (0 editais):** 24
- **Testes com erro de execucao:** 0
- **Testes com timeout:** 0
- **Testes com parse inconclusivo:** 0

### Consumo de APIs
- **DuckDuckGo API calls:** 175 (total de chamadas ao DuckDuckGo durante os 48 testes)
- **PNCP Search API calls:** 552 (total de chamadas ao PNCP Search API)

### Resultado Geral

Todos os 48 testes foram executados sem erros de sistema. 24 testes retornaram editais e 24 testes retornaram 0 resultados. Os testes que retornaram 0 editais sao exclusivamente das fontes **ComprasNet** e **Licitacoes-e** via scraping DuckDuckGo, indicando que o DuckDuckGo nao encontrou paginas relevantes nesses portais para os termos pesquisados. A fonte **PNCP (API)** retornou resultados em todos os cenarios. A fonte **Todas** sempre retornou resultados, pois inclui PNCP que sempre tem dados.

O DuckDuckGo realizou **175 chamadas** durante os 48 testes (media de 3.6 chamadas/teste). O PNCP Search API realizou **552 chamadas** (media de 11.5 chamadas/teste).

---

## Tabela Resumo

| # | Termo | Janela | Encerrados | Fonte | Total Editais | Status |
|---|-------|--------|------------|-------|---------------|--------|
| 1 | equip. medico | 30d | Não | PNCP | 104 | OK |
| 2 | equip. medico | 30d | Não | ComprasNet | 0 | ZERO |
| 3 | equip. medico | 30d | Não | Licitacoes-e | 0 | ZERO |
| 4 | equip. medico | 30d | Não | Todas | 104 | OK |
| 5 | equip. medico | 30d | Sim | PNCP | 152 | OK |
| 6 | equip. medico | 30d | Sim | ComprasNet | 0 | ZERO |
| 7 | equip. medico | 30d | Sim | Licitacoes-e | 0 | ZERO |
| 8 | equip. medico | 30d | Sim | Todas | 152 | OK |
| 9 | equip. medico | 60d | Não | PNCP | 112 | OK |
| 10 | equip. medico | 60d | Não | ComprasNet | 0 | ZERO |
| 11 | equip. medico | 60d | Não | Licitacoes-e | 0 | ZERO |
| 12 | equip. medico | 60d | Não | Todas | 112 | OK |
| 13 | equip. medico | 60d | Sim | PNCP | 175 | OK |
| 14 | equip. medico | 60d | Sim | ComprasNet | 0 | ZERO |
| 15 | equip. medico | 60d | Sim | Licitacoes-e | 0 | ZERO |
| 16 | equip. medico | 60d | Sim | Todas | 175 | OK |
| 17 | equip. medico | 90d | Não | PNCP | 113 | OK |
| 18 | equip. medico | 90d | Não | ComprasNet | 0 | ZERO |
| 19 | equip. medico | 90d | Não | Licitacoes-e | 0 | ZERO |
| 20 | equip. medico | 90d | Não | Todas | 113 | OK |
| 21 | equip. medico | 90d | Sim | PNCP | 180 | OK |
| 22 | equip. medico | 90d | Sim | ComprasNet | 0 | ZERO |
| 23 | equip. medico | 90d | Sim | Licitacoes-e | 0 | ZERO |
| 24 | equip. medico | 90d | Sim | Todas | 180 | OK |
| 25 | medicamentos | 30d | Não | PNCP | 142 | OK |
| 26 | medicamentos | 30d | Não | ComprasNet | 0 | ZERO |
| 27 | medicamentos | 30d | Não | Licitacoes-e | 0 | ZERO |
| 28 | medicamentos | 30d | Não | Todas | 142 | OK |
| 29 | medicamentos | 30d | Sim | PNCP | 252 | OK |
| 30 | medicamentos | 30d | Sim | ComprasNet | 0 | ZERO |
| 31 | medicamentos | 30d | Sim | Licitacoes-e | 0 | ZERO |
| 32 | medicamentos | 30d | Sim | Todas | 252 | OK |
| 33 | medicamentos | 60d | Não | PNCP | 142 | OK |
| 34 | medicamentos | 60d | Não | ComprasNet | 0 | ZERO |
| 35 | medicamentos | 60d | Não | Licitacoes-e | 0 | ZERO |
| 36 | medicamentos | 60d | Não | Todas | 142 | OK |
| 37 | medicamentos | 60d | Sim | PNCP | 268 | OK |
| 38 | medicamentos | 60d | Sim | ComprasNet | 0 | ZERO |
| 39 | medicamentos | 60d | Sim | Licitacoes-e | 0 | ZERO |
| 40 | medicamentos | 60d | Sim | Todas | 268 | OK |
| 41 | medicamentos | 90d | Não | PNCP | 142 | OK |
| 42 | medicamentos | 90d | Não | ComprasNet | 0 | ZERO |
| 43 | medicamentos | 90d | Não | Licitacoes-e | 0 | ZERO |
| 44 | medicamentos | 90d | Não | Todas | 142 | OK |
| 45 | medicamentos | 90d | Sim | PNCP | 272 | OK |
| 46 | medicamentos | 90d | Sim | ComprasNet | 0 | ZERO |
| 47 | medicamentos | 90d | Sim | Licitacoes-e | 0 | ZERO |
| 48 | medicamentos | 90d | Sim | Todas | 272 | OK |

---

## Analise de Consistencia

### Janela de Dias

Verificacao: para cada combinacao termo+fonte+encerrados, os resultados de 30d devem ser <= 60d <= 90d.

| Termo | Encerrados | Fonte | 30d | 60d | 90d | Consistencia |
|-------|------------|-------|-----|-----|-----|--------------|
| equip. medico | Não | PNCP | 104 | 112 | 113 | CONSISTENTE |
| equip. medico | Não | ComprasNet | 0 | 0 | 0 | CONSISTENTE |
| equip. medico | Não | Licitacoes-e | 0 | 0 | 0 | CONSISTENTE |
| equip. medico | Não | Todas | 104 | 112 | 113 | CONSISTENTE |
| equip. medico | Sim | PNCP | 152 | 175 | 180 | CONSISTENTE |
| equip. medico | Sim | ComprasNet | 0 | 0 | 0 | CONSISTENTE |
| equip. medico | Sim | Licitacoes-e | 0 | 0 | 0 | CONSISTENTE |
| equip. medico | Sim | Todas | 152 | 175 | 180 | CONSISTENTE |
| medicamentos | Não | PNCP | 142 | 142 | 142 | CONSISTENTE |
| medicamentos | Não | ComprasNet | 0 | 0 | 0 | CONSISTENTE |
| medicamentos | Não | Licitacoes-e | 0 | 0 | 0 | CONSISTENTE |
| medicamentos | Não | Todas | 142 | 142 | 142 | CONSISTENTE |
| medicamentos | Sim | PNCP | 252 | 268 | 272 | CONSISTENTE |
| medicamentos | Sim | ComprasNet | 0 | 0 | 0 | CONSISTENTE |
| medicamentos | Sim | Licitacoes-e | 0 | 0 | 0 | CONSISTENTE |
| medicamentos | Sim | Todas | 252 | 268 | 272 | CONSISTENTE |

Todas as combinacoes sao consistentes (30d <= 60d <= 90d) ou retornaram 0 para todas as janelas.

### Encerrados

Verificacao: para cada combinacao termo+fonte+dias, 'com encerrados' deve retornar >= 'sem encerrados'.

| Termo | Fonte | Dias | Sem Enc. | Com Enc. | Consistencia |
|-------|-------|------|----------|----------|--------------|
| equip. medico | PNCP | 30d | 104 | 152 | CONSISTENTE |
| equip. medico | PNCP | 60d | 112 | 175 | CONSISTENTE |
| equip. medico | PNCP | 90d | 113 | 180 | CONSISTENTE |
| equip. medico | ComprasNet | 30d | 0 | 0 | CONSISTENTE |
| equip. medico | ComprasNet | 60d | 0 | 0 | CONSISTENTE |
| equip. medico | ComprasNet | 90d | 0 | 0 | CONSISTENTE |
| equip. medico | Licitacoes-e | 30d | 0 | 0 | CONSISTENTE |
| equip. medico | Licitacoes-e | 60d | 0 | 0 | CONSISTENTE |
| equip. medico | Licitacoes-e | 90d | 0 | 0 | CONSISTENTE |
| equip. medico | Todas | 30d | 104 | 152 | CONSISTENTE |
| equip. medico | Todas | 60d | 112 | 175 | CONSISTENTE |
| equip. medico | Todas | 90d | 113 | 180 | CONSISTENTE |
| medicamentos | PNCP | 30d | 142 | 252 | CONSISTENTE |
| medicamentos | PNCP | 60d | 142 | 268 | CONSISTENTE |
| medicamentos | PNCP | 90d | 142 | 272 | CONSISTENTE |
| medicamentos | ComprasNet | 30d | 0 | 0 | CONSISTENTE |
| medicamentos | ComprasNet | 60d | 0 | 0 | CONSISTENTE |
| medicamentos | ComprasNet | 90d | 0 | 0 | CONSISTENTE |
| medicamentos | Licitacoes-e | 30d | 0 | 0 | CONSISTENTE |
| medicamentos | Licitacoes-e | 60d | 0 | 0 | CONSISTENTE |
| medicamentos | Licitacoes-e | 90d | 0 | 0 | CONSISTENTE |
| medicamentos | Todas | 30d | 142 | 252 | CONSISTENTE |
| medicamentos | Todas | 60d | 142 | 268 | CONSISTENTE |
| medicamentos | Todas | 90d | 142 | 272 | CONSISTENTE |

Todas as combinacoes sao consistentes (com encerrados >= sem encerrados).

### Fontes

Comparacao entre fontes para cada combinacao termo+dias+encerrados:

| Termo | Dias | Enc. | PNCP | ComprasNet | Licitacoes-e | Todas |
|-------|------|------|------|------------|--------------|-------|
| equip. medico | 30d | Não | 104 | 0 | 0 | 104 |
| equip. medico | 30d | Sim | 152 | 0 | 0 | 152 |
| equip. medico | 60d | Não | 112 | 0 | 0 | 112 |
| equip. medico | 60d | Sim | 175 | 0 | 0 | 175 |
| equip. medico | 90d | Não | 113 | 0 | 0 | 113 |
| equip. medico | 90d | Sim | 180 | 0 | 0 | 180 |
| medicamentos | 30d | Não | 142 | 0 | 0 | 142 |
| medicamentos | 30d | Sim | 252 | 0 | 0 | 252 |
| medicamentos | 60d | Não | 142 | 0 | 0 | 142 |
| medicamentos | 60d | Sim | 268 | 0 | 0 | 268 |
| medicamentos | 90d | Não | 142 | 0 | 0 | 142 |
| medicamentos | 90d | Sim | 272 | 0 | 0 | 272 |

**Observacoes:**
- A fonte PNCP (via API direta) retornou resultados em todos os testes.
- ComprasNet e Licitacoes-e (via scraping DuckDuckGo) retornaram 0 resultados em todos os testes.
- A fonte 'Todas' combina PNCP (API) + scrapers, e seus resultados coincidem com os da PNCP pura, confirmando que os scrapers nao adicionaram resultados extras.

### DuckDuckGo como substituto do Serper

O DuckDuckGo foi utilizado como API de scraping para ComprasNet e Licitacoes-e. Realizou **175 chamadas** ao longo dos 48 testes. Apesar de executar as buscas corretamente (sem erros de sistema), o DuckDuckGo **nao retornou URLs relevantes** para nenhum dos portais de licitacao, resultando em 0 editais capturados via scraping em todos os testes.

Isso indica que:
1. O DuckDuckGo tem cobertura limitada para portais governamentais de licitacao brasileiros.
2. Os termos de busca podem precisar ser ajustados para o motor DuckDuckGo.
3. O Serper (Google) provavelmente teria melhor cobertura para esses portais.

---

## Detalhes por Teste

### Teste 1: equip. medico, 30d, sem encerrados, PNCP
**Prompt:** "busque editais de equipamento medico no PNCP dos últimos 30 dias sem calcular score"
**Total editais:** 104
**Status:** OK
**Tempo de resposta:** 21.4s
**Fontes consultadas:** PNCP (API)
**Analise:** Busca retornou 104 editais com sucesso.

### Teste 2: equip. medico, 30d, sem encerrados, ComprasNet
**Prompt:** "busque editais de equipamento medico no ComprasNet dos últimos 30 dias sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 29.2s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 3: equip. medico, 30d, sem encerrados, Licitacoes-e
**Prompt:** "busque editais de equipamento medico no licitacoes-e dos últimos 30 dias sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 26.7s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 4: equip. medico, 30d, sem encerrados, Todas
**Prompt:** "busque editais de equipamento medico dos últimos 30 dias sem calcular score"
**Total editais:** 104
**Status:** OK
**Tempo de resposta:** 38.6s
**Fontes consultadas:** PNCP (API), www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Busca retornou 104 editais com sucesso.

### Teste 5: equip. medico, 30d, com encerrados, PNCP
**Prompt:** "busque editais de equipamento medico no PNCP dos últimos 30 dias incluindo encerrados sem calcular score"
**Total editais:** 152
**Status:** OK
**Tempo de resposta:** 21.2s
**Fontes consultadas:** PNCP (API)
**Analise:** Busca retornou 152 editais com sucesso.

### Teste 6: equip. medico, 30d, com encerrados, ComprasNet
**Prompt:** "busque editais de equipamento medico no ComprasNet dos últimos 30 dias incluindo encerrados sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 27.3s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 7: equip. medico, 30d, com encerrados, Licitacoes-e
**Prompt:** "busque editais de equipamento medico no licitacoes-e dos últimos 30 dias incluindo encerrados sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 25.5s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 8: equip. medico, 30d, com encerrados, Todas
**Prompt:** "busque editais de equipamento medico dos últimos 30 dias incluindo encerrados sem calcular score"
**Total editais:** 152
**Status:** OK
**Tempo de resposta:** 40.5s
**Fontes consultadas:** PNCP (API), www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Busca retornou 152 editais com sucesso.

### Teste 9: equip. medico, 60d, sem encerrados, PNCP
**Prompt:** "busque editais de equipamento medico no PNCP dos últimos 60 dias sem calcular score"
**Total editais:** 112
**Status:** OK
**Tempo de resposta:** 14.9s
**Fontes consultadas:** PNCP (API)
**Analise:** Busca retornou 112 editais com sucesso.

### Teste 10: equip. medico, 60d, sem encerrados, ComprasNet
**Prompt:** "busque editais de equipamento medico no ComprasNet dos últimos 60 dias sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 26.3s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 11: equip. medico, 60d, sem encerrados, Licitacoes-e
**Prompt:** "busque editais de equipamento medico no licitacoes-e dos últimos 60 dias sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 26.0s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 12: equip. medico, 60d, sem encerrados, Todas
**Prompt:** "busque editais de equipamento medico dos últimos 60 dias sem calcular score"
**Total editais:** 112
**Status:** OK
**Tempo de resposta:** 37.7s
**Fontes consultadas:** PNCP (API), www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Busca retornou 112 editais com sucesso.

### Teste 13: equip. medico, 60d, com encerrados, PNCP
**Prompt:** "busque editais de equipamento medico no PNCP dos últimos 60 dias incluindo encerrados sem calcular score"
**Total editais:** 175
**Status:** OK
**Tempo de resposta:** 18.5s
**Fontes consultadas:** PNCP (API)
**Analise:** Busca retornou 175 editais com sucesso.

### Teste 14: equip. medico, 60d, com encerrados, ComprasNet
**Prompt:** "busque editais de equipamento medico no ComprasNet dos últimos 60 dias incluindo encerrados sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 26.9s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 15: equip. medico, 60d, com encerrados, Licitacoes-e
**Prompt:** "busque editais de equipamento medico no licitacoes-e dos últimos 60 dias incluindo encerrados sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 26.4s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 16: equip. medico, 60d, com encerrados, Todas
**Prompt:** "busque editais de equipamento medico dos últimos 60 dias incluindo encerrados sem calcular score"
**Total editais:** 175
**Status:** OK
**Tempo de resposta:** 41.2s
**Fontes consultadas:** PNCP (API), www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Busca retornou 175 editais com sucesso.

### Teste 17: equip. medico, 90d, sem encerrados, PNCP
**Prompt:** "busque editais de equipamento medico no PNCP dos últimos 90 dias sem calcular score"
**Total editais:** 113
**Status:** OK
**Tempo de resposta:** 19.7s
**Fontes consultadas:** PNCP (API)
**Analise:** Busca retornou 113 editais com sucesso.

### Teste 18: equip. medico, 90d, sem encerrados, ComprasNet
**Prompt:** "busque editais de equipamento medico no ComprasNet dos últimos 90 dias sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 25.9s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 19: equip. medico, 90d, sem encerrados, Licitacoes-e
**Prompt:** "busque editais de equipamento medico no licitacoes-e dos últimos 90 dias sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 26.1s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 20: equip. medico, 90d, sem encerrados, Todas
**Prompt:** "busque editais de equipamento medico dos últimos 90 dias sem calcular score"
**Total editais:** 113
**Status:** OK
**Tempo de resposta:** 38.3s
**Fontes consultadas:** PNCP (API), www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Busca retornou 113 editais com sucesso.

### Teste 21: equip. medico, 90d, com encerrados, PNCP
**Prompt:** "busque editais de equipamento medico no PNCP dos últimos 90 dias incluindo encerrados sem calcular score"
**Total editais:** 180
**Status:** OK
**Tempo de resposta:** 16.9s
**Fontes consultadas:** PNCP (API)
**Analise:** Busca retornou 180 editais com sucesso.

### Teste 22: equip. medico, 90d, com encerrados, ComprasNet
**Prompt:** "busque editais de equipamento medico no ComprasNet dos últimos 90 dias incluindo encerrados sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 26.1s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 23: equip. medico, 90d, com encerrados, Licitacoes-e
**Prompt:** "busque editais de equipamento medico no licitacoes-e dos últimos 90 dias incluindo encerrados sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 27.2s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 24: equip. medico, 90d, com encerrados, Todas
**Prompt:** "busque editais de equipamento medico dos últimos 90 dias incluindo encerrados sem calcular score"
**Total editais:** 180
**Status:** OK
**Tempo de resposta:** 36.5s
**Fontes consultadas:** PNCP (API), www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Busca retornou 180 editais com sucesso.

### Teste 25: medicamentos, 30d, sem encerrados, PNCP
**Prompt:** "busque editais de medicamentos no PNCP dos últimos 30 dias sem calcular score"
**Total editais:** 142
**Status:** OK
**Tempo de resposta:** 25.7s
**Fontes consultadas:** PNCP (API)
**Analise:** Busca retornou 142 editais com sucesso.

### Teste 26: medicamentos, 30d, sem encerrados, ComprasNet
**Prompt:** "busque editais de medicamentos no ComprasNet dos últimos 30 dias sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 25.7s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 27: medicamentos, 30d, sem encerrados, Licitacoes-e
**Prompt:** "busque editais de medicamentos no licitacoes-e dos últimos 30 dias sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 26.4s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 28: medicamentos, 30d, sem encerrados, Todas
**Prompt:** "busque editais de medicamentos dos últimos 30 dias sem calcular score"
**Total editais:** 142
**Status:** OK
**Tempo de resposta:** 48.8s
**Fontes consultadas:** PNCP (API), www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Busca retornou 142 editais com sucesso.

### Teste 29: medicamentos, 30d, com encerrados, PNCP
**Prompt:** "busque editais de medicamentos no PNCP dos últimos 30 dias incluindo encerrados sem calcular score"
**Total editais:** 252
**Status:** OK
**Tempo de resposta:** 16.4s
**Fontes consultadas:** PNCP (API)
**Analise:** Busca retornou 252 editais com sucesso.

### Teste 30: medicamentos, 30d, com encerrados, ComprasNet
**Prompt:** "busque editais de medicamentos no ComprasNet dos últimos 30 dias incluindo encerrados sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 27.4s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 31: medicamentos, 30d, com encerrados, Licitacoes-e
**Prompt:** "busque editais de medicamentos no licitacoes-e dos últimos 30 dias incluindo encerrados sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 25.5s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 32: medicamentos, 30d, com encerrados, Todas
**Prompt:** "busque editais de medicamentos dos últimos 30 dias incluindo encerrados sem calcular score"
**Total editais:** 252
**Status:** OK
**Tempo de resposta:** 45.8s
**Fontes consultadas:** PNCP (API), www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Busca retornou 252 editais com sucesso.

### Teste 33: medicamentos, 60d, sem encerrados, PNCP
**Prompt:** "busque editais de medicamentos no PNCP dos últimos 60 dias sem calcular score"
**Total editais:** 142
**Status:** OK
**Tempo de resposta:** 19.0s
**Fontes consultadas:** PNCP (API)
**Analise:** Busca retornou 142 editais com sucesso.

### Teste 34: medicamentos, 60d, sem encerrados, ComprasNet
**Prompt:** "busque editais de medicamentos no ComprasNet dos últimos 60 dias sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 25.2s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 35: medicamentos, 60d, sem encerrados, Licitacoes-e
**Prompt:** "busque editais de medicamentos no licitacoes-e dos últimos 60 dias sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 26.0s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 36: medicamentos, 60d, sem encerrados, Todas
**Prompt:** "busque editais de medicamentos dos últimos 60 dias sem calcular score"
**Total editais:** 142
**Status:** OK
**Tempo de resposta:** 42.6s
**Fontes consultadas:** PNCP (API), www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Busca retornou 142 editais com sucesso.

### Teste 37: medicamentos, 60d, com encerrados, PNCP
**Prompt:** "busque editais de medicamentos no PNCP dos últimos 60 dias incluindo encerrados sem calcular score"
**Total editais:** 268
**Status:** OK
**Tempo de resposta:** 21.2s
**Fontes consultadas:** PNCP (API)
**Analise:** Busca retornou 268 editais com sucesso.

### Teste 38: medicamentos, 60d, com encerrados, ComprasNet
**Prompt:** "busque editais de medicamentos no ComprasNet dos últimos 60 dias incluindo encerrados sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 26.4s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 39: medicamentos, 60d, com encerrados, Licitacoes-e
**Prompt:** "busque editais de medicamentos no licitacoes-e dos últimos 60 dias incluindo encerrados sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 26.1s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 40: medicamentos, 60d, com encerrados, Todas
**Prompt:** "busque editais de medicamentos dos últimos 60 dias incluindo encerrados sem calcular score"
**Total editais:** 268
**Status:** OK
**Tempo de resposta:** 38.3s
**Fontes consultadas:** PNCP (API), www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Busca retornou 268 editais com sucesso.

### Teste 41: medicamentos, 90d, sem encerrados, PNCP
**Prompt:** "busque editais de medicamentos no PNCP dos últimos 90 dias sem calcular score"
**Total editais:** 142
**Status:** OK
**Tempo de resposta:** 19.9s
**Fontes consultadas:** PNCP (API)
**Analise:** Busca retornou 142 editais com sucesso.

### Teste 42: medicamentos, 90d, sem encerrados, ComprasNet
**Prompt:** "busque editais de medicamentos no ComprasNet dos últimos 90 dias sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 26.5s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 43: medicamentos, 90d, sem encerrados, Licitacoes-e
**Prompt:** "busque editais de medicamentos no licitacoes-e dos últimos 90 dias sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 27.3s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 44: medicamentos, 90d, sem encerrados, Todas
**Prompt:** "busque editais de medicamentos dos últimos 90 dias sem calcular score"
**Total editais:** 142
**Status:** OK
**Tempo de resposta:** 46.9s
**Fontes consultadas:** PNCP (API), www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Busca retornou 142 editais com sucesso.

### Teste 45: medicamentos, 90d, com encerrados, PNCP
**Prompt:** "busque editais de medicamentos no PNCP dos últimos 90 dias incluindo encerrados sem calcular score"
**Total editais:** 272
**Status:** OK
**Tempo de resposta:** 18.5s
**Fontes consultadas:** PNCP (API)
**Analise:** Busca retornou 272 editais com sucesso.

### Teste 46: medicamentos, 90d, com encerrados, ComprasNet
**Prompt:** "busque editais de medicamentos no ComprasNet dos últimos 90 dias incluindo encerrados sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 26.3s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 47: medicamentos, 90d, com encerrados, Licitacoes-e
**Prompt:** "busque editais de medicamentos no licitacoes-e dos últimos 90 dias incluindo encerrados sem calcular score"
**Total editais:** 0
**Status:** ZERO
**Tempo de resposta:** 26.8s
**Fontes consultadas:** www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Nenhum edital encontrado. Para fontes via scraping (ComprasNet/Licitacoes-e), isso indica que o DuckDuckGo nao encontrou URLs relevantes nos portais.

### Teste 48: medicamentos, 90d, com encerrados, Todas
**Prompt:** "busque editais de medicamentos dos últimos 90 dias incluindo encerrados sem calcular score"
**Total editais:** 272
**Status:** OK
**Tempo de resposta:** 46.5s
**Fontes consultadas:** PNCP (API), www.administracao.pr.gov.br (Scraper), www.compras.rs.gov.br (Scraper), www.gov.br (Scraper), www.comprasnet.gov.br (Scraper), www.licitacoes-e.com.br (Scraper)
**Analise:** Busca retornou 272 editais com sucesso.

---

## Consumo Total de APIs

| API | Total de chamadas | Media por teste |
|-----|-------------------|-----------------|
| DuckDuckGo (SCRAPE-DDG) | 175 | 3.6 |
| PNCP Search API | 552 | 11.5 |
| **Total** | **727** | **15.1** |

**Nota:** As chamadas DuckDuckGo sao feitas para cada portal de scraping (ComprasNet, Licitacoes-e, etc.) a cada teste que envolva essas fontes. As chamadas PNCP Search API sao feitas para buscas que incluem a fonte PNCP.