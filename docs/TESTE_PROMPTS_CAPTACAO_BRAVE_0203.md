# Relatorio de Testes - Busca de Editais via Chat (Brave Search)

**Data:** 2026-03-02 17:46:00
**Servidor:** localhost:5007
**Executor:** Script automatizado Python (48 testes)
**API de Scraping:** Brave Search (SCRAPE_API=brave)
**Tempo total de execucao:** 1086 segundos (18.1 minutos)

---

## Resumo Executivo

| Metrica | Valor |
|---------|-------|
| Total de testes | 48 |
| Testes com resultados (OK) | 42 |
| Testes sem resultados (0 editais) | 6 |
| Testes com erro de execucao | 0 |
| Testes com timeout | 0 |
| Testes com parse inconclusivo | 0 |
| Chamadas Brave Search API | 242 |
| Chamadas PNCP Search API | 120 |

### Resultado Geral

**BOM** — 42/48 testes retornaram resultados (87%).

### Resultado por Fonte

| Fonte | OK | Zero | Erro | Total | Taxa |
|-------|----|----- |------|-------|------|
| PNCP | 12 | 0 | 0 | 12 | 100% |
| ComprasNet | 12 | 0 | 0 | 12 | 100% |
| Licitacoes-e | 6 | 6 | 0 | 12 | 50% |
| Todas | 12 | 0 | 0 | 12 | 100% |

---

## Tabela Completa de Resultados

| # | Termo | Janela | Encerrados | Fonte | Total Editais | Status |
|---|-------|--------|------------|-------|---------------|--------|
| 01 | equip. medico | 30d | Não | PNCP | 2 | OK |
| 02 | equip. medico | 30d | Não | ComprasNet | 1 | OK |
| 03 | equip. medico | 30d | Não | Licitacoes-e | 1 | OK |
| 04 | equip. medico | 30d | Não | Todas | 2 | OK |
| 05 | equip. medico | 30d | Sim | PNCP | 20 | OK |
| 06 | equip. medico | 30d | Sim | ComprasNet | 2 | OK |
| 07 | equip. medico | 30d | Sim | Licitacoes-e | 1 | OK |
| 08 | equip. medico | 30d | Sim | Todas | 20 | OK |
| 09 | equip. medico | 60d | Não | PNCP | 2 | OK |
| 10 | equip. medico | 60d | Não | ComprasNet | 1 | OK |
| 11 | equip. medico | 60d | Não | Licitacoes-e | 1 | OK |
| 12 | equip. medico | 60d | Não | Todas | 2 | OK |
| 13 | equip. medico | 60d | Sim | PNCP | 20 | OK |
| 14 | equip. medico | 60d | Sim | ComprasNet | 2 | OK |
| 15 | equip. medico | 60d | Sim | Licitacoes-e | 1 | OK |
| 16 | equip. medico | 60d | Sim | Todas | 20 | OK |
| 17 | equip. medico | 90d | Não | PNCP | 2 | OK |
| 18 | equip. medico | 90d | Não | ComprasNet | 1 | OK |
| 19 | equip. medico | 90d | Não | Licitacoes-e | 1 | OK |
| 20 | equip. medico | 90d | Não | Todas | 2 | OK |
| 21 | equip. medico | 90d | Sim | PNCP | 20 | OK |
| 22 | equip. medico | 90d | Sim | ComprasNet | 2 | OK |
| 23 | equip. medico | 90d | Sim | Licitacoes-e | 1 | OK |
| 24 | equip. medico | 90d | Sim | Todas | 20 | OK |
| 25 | medicamentos | 30d | Não | PNCP | 130 | OK |
| 26 | medicamentos | 30d | Não | ComprasNet | 2 | OK |
| 27 | medicamentos | 30d | Não | Licitacoes-e | 0 | ZERO |
| 28 | medicamentos | 30d | Não | Todas | 130 | OK |
| 29 | medicamentos | 30d | Sim | PNCP | 249 | OK |
| 30 | medicamentos | 30d | Sim | ComprasNet | 4 | OK |
| 31 | medicamentos | 30d | Sim | Licitacoes-e | 0 | ZERO |
| 32 | medicamentos | 30d | Sim | Todas | 250 | OK |
| 33 | medicamentos | 60d | Não | PNCP | 130 | OK |
| 34 | medicamentos | 60d | Não | ComprasNet | 2 | OK |
| 35 | medicamentos | 60d | Não | Licitacoes-e | 0 | ZERO |
| 36 | medicamentos | 60d | Não | Todas | 130 | OK |
| 37 | medicamentos | 60d | Sim | PNCP | 267 | OK |
| 38 | medicamentos | 60d | Sim | ComprasNet | 4 | OK |
| 39 | medicamentos | 60d | Sim | Licitacoes-e | 0 | ZERO |
| 40 | medicamentos | 60d | Sim | Todas | 267 | OK |
| 41 | medicamentos | 90d | Não | PNCP | 130 | OK |
| 42 | medicamentos | 90d | Não | ComprasNet | 2 | OK |
| 43 | medicamentos | 90d | Não | Licitacoes-e | 0 | ZERO |
| 44 | medicamentos | 90d | Não | Todas | 130 | OK |
| 45 | medicamentos | 90d | Sim | PNCP | 270 | OK |
| 46 | medicamentos | 90d | Sim | ComprasNet | 4 | OK |
| 47 | medicamentos | 90d | Sim | Licitacoes-e | 0 | ZERO |
| 48 | medicamentos | 90d | Sim | Todas | 270 | OK |

---

## Comparacao com DuckDuckGo (teste anterior 0203)

| API | OK | Zero | Erro | Brave Calls | PNCP Calls |
|-----|----|----- |------|-------------|------------|
| DuckDuckGo | 24 | 24 | 0 | N/A | 552 |
| Brave | 42 | 6 | 0 | 242 | 120 |

---

## Configuracao

- SCRAPE_API=brave
- BRAVE_API_KEY=BSAaW3EKUnWUMMlqpAcW_kvDRp77IIB
- Brave Search: $5 credito/mes (~1000 queries gratis)
- Fontes configuradas: PNCP (API nativa), ComprasNet (Brave), Licitacoes-e (Brave), Todas (agregado)

---

*Gerado automaticamente por tests/rodar_teste_brave_48.py*
