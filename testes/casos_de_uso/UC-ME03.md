---
uc_id: UC-ME03
nome: "Participacao de Mercado — Share vs Concorrentes (EXPANSAO — ConcorrenciaPage)"
sprint: "Sprint 7"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT7 V4.md"
linha_inicio_no_doc: 280
split_gerado_em: "2026-05-04T01:54:15"
---

# UC-ME03 — Participacao de Mercado — Share vs Concorrentes (EXPANSAO — ConcorrenciaPage)

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT7 V4.md` (linha 280).
> Sprint origem: **Sprint 7**.

---

**Tipo:** EXPANSAO da pagina existente `ConcorrenciaPage.tsx`
**O que JA EXISTE:** Tabela de concorrentes com colunas Nome/CNPJ/Vitorias/Derrotas/Taxa Sucesso/Preco Medio + detalhe com stat cards (Vitorias/Derrotas) + sub-tabela historico de licitacoes + botao "Analisar via IA". Endpoints: `GET /api/concorrentes/listar`, `GET /api/crud/precos-historicos`. Arquivo: `frontend/src/pages/ConcorrenciaPage.tsx` (231L).

**RNs aplicadas:** RN-074 (taxa vitoria concorrente), RN-073 (alerta >=2 perdas para concorrente), RN-037 (audit log)

**RF relacionado:** RF-049 (Concorrencia), RF-050
**Ator:** Usuario (Diretor, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Tabela `concorrentes` possui pelo menos 1 registro (JA EXISTE do Sprint 5)
3. ConcorrenciaPage ja funcional com tabela e detalhe (Sprint 5)

### Pos-condicoes
1. ConcorrenciaPage expandida com grafico de share e stat cards estrategicos
2. Badge de alerta RN-073 visivel na tabela existente

### Sequencia de Eventos — APENAS O DELTA (o que ADICIONA a ConcorrenciaPage)

1. Usuario acessa ConcorrenciaPage (`/app/concorrencia`) via menu lateral "Indicadores > Concorrencia" (JA EXISTE)
2. **NOVO:** [Card: "Stat Cards — grid 4"] acima da tabela existente: Concorrentes Conhecidos (total), Nossa Taxa de Vitoria (%), Maior Ameaca (concorrente com mais vitorias), Editais Disputados Juntos (total)
3. **NOVO:** [Card: "Filtros"] adicionais: [Select: "Segmento"], [Select: "UF"], [Select: "Periodo"] (adicionar aos filtros de busca existentes)
4. **NOVO:** [Card: "Share de Mercado"] grafico de barras horizontais:
   - Cada barra: nome do player + % editais ganhos no segmento
   - Barra da empresa em azul, concorrentes em cinza
   - Ordenado por taxa de vitoria descendente
5. **JA EXISTE:** Tabela de concorrentes com colunas Nome/CNPJ/Vitorias/Derrotas/Taxa/Preco Medio (MANTER)
6. **NOVO:** [Badge: "Alerta"] (RN-073) amarelo na tabela existente se >= 2 editais perdidos para concorrente
7. **EXPANDIDO:** Modal de detalhe existente — adicionar: UFs de atuacao, tendencia (subindo/caindo)
8. **NOVO:** Endpoint `GET /api/dashboard/mercado/share` para dados agregados de share

### Tela(s) Representativa(s)

**Pagina:** ConcorrenciaPage (`/app/concorrencia`) — NAO MercadoPage
**Posicao:** Secao nova acima da tabela existente

#### Layout da Tela (mostra APENAS os elementos NOVOS)

```
+---------------------------------------------------------------+
|  Concorrencia                                                 |
|                                                               |
|  === ELEMENTOS NOVOS (Sprint 7) ===                           |
|                                                               |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|  |Concorrent.|  |Nossa Taxa |  |Maior      |  |Disputas   |   |
|  |Conhecidos |  |de Vitoria |  |Ameaca     |  |Juntos     |   |
|  |    14     |  |  28.5%    |  |MedLab Sul |  |   87      |   |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|                                                               |
|  [Filtros NOVOS] Segmento: [Hemato v]  UF: [Todos v]         |
|  Periodo: [12m v]                                              |
|                                                               |
|  +------- Share de Mercado (%) (NOVO) ----+                   |
|  | CH Hospitalar  28.5%  ████████ (azul)                     |
|  | MedLab Sul     24.2%  ███████  (cinza)                    |
|  | DiagTech       18.1%  █████    (cinza)                    |
|  +-------------------------------------+                     |
|                                                               |
|  === TABELA EXISTENTE (Sprint 5) — manter ===                |
|  +---- Tabela Concorrentes (JA EXISTE) ---+                   |
|  |Nome      |CNPJ  |Vitor.|Derrot.|Taxa|Preco M.|Acao      | |
|  |MedLab Sul|12.34.|  18  |  34   |34.6|R$680K  |[Det][IA] | |
|  |          |      |      |       |    |  [!]   |          | |
|  +---------------------------------------------+             |
|  [!] = Badge alerta NOVO (RN-073)                            |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **NOVOS (leitura):** Stat Cards (4), Grafico share (barras horizontais), Badge alerta RN-073
- **NOVOS (input):** Filtros Segmento, UF, Periodo
- **EXPANDIDOS:** Modal detalhe (+ UFs atuacao, tendencia)
- **JA EXISTENTES (nao alterar):** Tabela concorrentes, busca, detalhe com historico, botao IA

### Excecoes
- **E1:** Nenhum concorrente cadastrado — stat cards zerados, grafico share vazio (tabela existente mostra CTA)
- **E2:** Sem participacoes no periodo — stat cards zerados, grafico vazio

---
