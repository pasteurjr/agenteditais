---
uc_id: UC-SC05
nome: "DRE do Contrato (EXPANSAO — ContratadoRealizadoPage + PrecificacaoPage)"
sprint: "Sprint 9"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT9.md"
linha_inicio_no_doc: 1073
split_gerado_em: "2026-05-04T03:45:25"
---

# UC-SC05 — DRE do Contrato (EXPANSAO — ContratadoRealizadoPage + PrecificacaoPage)

> Caso de uso extraido de `docs/CASOS DE USO SPRINT9.md` (linha 1073).
> Sprint origem: **Sprint 9**.

---

**Tipo:** EXPANSAO de duas paginas existentes
**UCs estendidos:** UC-CR01 (Sprint 5 — Dashboard Contratado x Realizado), UC-P04 (Sprint 3 — Base de Custos), UC-P05 (Sprint 3 — Preco Base), UC-FU03 (Sprint 5 — Score Logistico), UC-P10 (Sprint 3 — Comodato).
**O que JA EXISTE:** ContratadoRealizadoPage com dashboard. PrecificacaoPage com camadas A-E completas. Score Logistico (frete estimado). Comodato (amortizacao mensal).

**RNs aplicadas:** RN-NEW-18 (margem >20% verde, 10-20% amarelo, <10% vermelho), RN-102 (margem padronizada), RN-037 (audit)

**RF relacionado:** RF-051 (Contratado x Realizado), RF-039 (Precificacao)
**Ator:** Usuario (Diretor Financeiro, Gestor Comercial)

### Pre-condicoes
1. Contrato cadastrado com itens e precos (para DRE realizado)
2. Edital com camadas A-C configuradas (para DRE simulado/previsto)
3. Dados de custos e impostos disponiveis (Camada A, Sprint 3)

### Pos-condicoes
1. DRE do contrato calculado e exibido
2. Margem liquida classificada por cor (RN-NEW-18)
3. Comparativo previsto vs realizado visivel (para contratos em execucao)

### Sequencia de Eventos

1. **Na ContratadoRealizadoPage** — DRE de contratos existentes:
2. **NOVO:** Na tabela de contratos, nova coluna "Margem DRE" com badge colorido (RN-NEW-18)
3. Ao clicar num contrato, **NOVO:** [Card: "DRE do Contrato"] exibe:
   - Receita Bruta: volume_realizado * preco_unitario
   - (-) Impostos: aliquota_efetiva * receita (dados Camada A)
   - = Receita Liquida
   - (-) Custos Diretos: custo_base * volume (Camada A/B)
   - (-) Despesas Operacionais: frete + logistica (Score Logistico, UC-FU03)
   - (-) Comodato: amortizacao * meses (UC-P10, se aplicavel)
   - = **Resultado Operacional**
   - Margem Liquida (%): resultado / receita_bruta * 100
4. [Badge: Atratividade] conforme RN-NEW-18:
   - Verde (>20%): "Atrativo"
   - Amarelo (10-20%): "Aceitavel"
   - Vermelho (<10%): "Marginal"
   - Vermelho escuro (<0%): "PREJUIZO"
5. Se contrato em execucao: [Card: "Comparativo DRE Previsto vs Realizado"]:
   - Duas colunas: Previsto (dados do edital) vs Realizado (dados de entregas/empenhos)
   - Destaque em vermelho para linhas com desvio > 10%
6. **Na PrecificacaoPage** — DRE simulado para editais em analise:
7. **NOVO:** [Botao: "Simular DRE"] na tab de custos ou estrategia
8. Ao clicar: [Modal: "DRE Simulado"] com os mesmos componentes do item 3, mas usando:
   - volume do edital (nao realizado)
   - precos das Camadas A-E (nao homologado)
   - frete estimado pelo Score Logistico
9. Objetivo: avaliar se vale participar ANTES de gastar tempo com proposta
10. [Botao: "Exportar DRE"] gera PDF com o demonstrativo

### Tela(s) Representativa(s)

**Pagina:** ContratadoRealizadoPage — detalhe do contrato
**Posicao:** Card novo no painel de detalhe

#### Layout do DRE

```
+--- DRE do Contrato CT-2026-001 ---+
|                                    |
| Receita Bruta      R$ 250.000,00  |
| (-) Impostos       R$  23.125,00  |
| = Receita Liquida  R$ 226.875,00  |
| (-) Custos         R$ 170.000,00  |
| (-) Desp. Oper.    R$  12.500,00  |
| (-) Comodato       R$   8.333,33  |
| = Resultado        R$  36.041,67  |
|                                    |
| Margem: 14.4% [ACEITAVEL - Amar.] |
|                                    |
| +--- Previsto vs Realizado ---+    |
| |           Prev.   Real.     |    |
| |Receita   R$250K  R$237K ⚠  |    |
| |Custos    R$170K  R$175K ⚠  |    |
| |Resultado R$ 36K  R$ 28K    |    |
| +-----------------------------+   |
|                                    |
| [Exportar DRE PDF]                 |
+------------------------------------+
```

### Excecoes
- **E1:** Custos nao configurados (Camada A) — DRE parcial com "Custos: N/D" e margem incalculavel
- **E2:** Comodato nao aplicavel — linha de comodato omitida
- **E3:** Score Logistico nao calculado — despesas operacionais mostram "Estimativa indisponivel"

---

# FASE 3 — INFRAESTRUTURA

---
