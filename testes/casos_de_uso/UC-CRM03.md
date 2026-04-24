---
uc_id: UC-CRM03
nome: "Mapa Geografico de Processos *(NOVO V3)*"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 2358
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CRM03 — Mapa Geografico de Processos *(NOVO V3)*

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 2358).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-198, RN-217 [FALTANTE->V4]

**RF relacionado:** RF-045-03
**Ator:** Usuario (Analista Comercial / Gestor Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Editais captados com localizacao geografica (UF/municipio do orgao)
3. Pipeline do CRM populado com editais em diversas etapas

### Pos-condicoes
1. Mapa do Brasil exibido com marcadores coloridos por etapa do pipeline
2. Filtros aplicados (regiao, portfolio, vendedor)
3. Informacoes contextuais exibidas ao clicar nos marcadores

### Sequencia de Eventos

1. Na CRMPage, usuario clica na [Aba: "Mapa"]
2. [Card: "Mapa de Processos"] exibe mapa interativo do Brasil
3. [Secao: Filtros] exibe controles de filtragem:
   - [Select: "Regiao"] — Norte, Nordeste, Centro-Oeste, Sudeste, Sul, Todas
   - [Select: "Portfolio"] — opcoes dinamicas dos agrupamentos parametrizados (UC-CRM02)
   - [Select: "Vendedor"] — opcoes dinamicas dos usuarios da empresa
   - [Select: "Etapa do Pipeline"] — opcoes das etapas do CRM
4. Marcadores no mapa exibem cores conforme etapa:
   - Captados: azul (#3b82f6)
   - Em Analise: roxo (#8b5cf6)
   - Propostas Enviadas: laranja (#f97316)
   - Ganhos Provisorios: amarelo (#eab308)
   - Recursos: vermelho (#dc2626)
   - Ganhos Definitivos: verde (#16a34a)
5. Usuario clica em marcador — [Popup: info do edital] exibe: Numero, Orgao, Valor, Etapa, Vendedor
6. [Legenda] na parte inferior exibe as cores e seus significados
7. [Secao: Resumo por Regiao] exibe tabela lateral com contagem de editais por regiao e etapa

### Fluxos Alternativos (V5)

- **FA-01 — Filtro por regiao especifica:** Usuario seleciona "Sudeste" (passo 3). Mapa faz zoom na regiao sudeste. Apenas marcadores de SP, RJ, MG, ES exibidos.
- **FA-02 — Mapa sem editais (pipeline vazio):** Mapa carrega normalmente mas sem marcadores. Mensagem "Nenhum edital com localizacao geografica definida."
- **FA-03 — Multiplos editais na mesma UF:** Marcadores se agrupam (cluster) ou aumentam de tamanho proporcional ao numero de editais.

### Fluxos de Excecao (V5)

- **FE-01 — Erro ao carregar mapa:** Biblioteca Leaflet/OSM nao carrega. Area do mapa exibe placeholder de erro. Demais elementos da pagina funcionam.
- **FE-02 — Edital sem UF definida:** Edital nao aparece no mapa. Aparece apenas no pipeline e tabelas.
- **FE-03 — Erro ao carregar dados de editais para o mapa:** Requisicao para `/api/crm/mapa` falha. Mapa carrega sem marcadores. Alerta de erro exibido.

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`)
**Posicao:** Aba "Mapa"

#### Layout da Tela

```
[Aba: "Pipeline"] [Aba: "Mapa"] [Aba: "Agenda"] [Aba: "KPIs"] [Aba: "Parametrizacoes"]

[Card: "Mapa de Processos"] [ref: Passo 2]

  [Secao: Filtros — grid 4 colunas] [ref: Passo 3]
    [Select: "Regiao"] — opcoes: Todas, Norte, Nordeste, Centro-Oeste, Sudeste, Sul
    [Select: "Portfolio"] — opcoes dinamicas
    [Select: "Vendedor"] — opcoes dinamicas
    [Select: "Etapa do Pipeline"] — opcoes dinamicas

  [Mapa: Brasil interativo] [ref: Passos 4, 5]
    [Marcadores coloridos] — por etapa [ref: Passo 4]
      azul: Captados
      roxo: Em Analise
      laranja: Propostas Enviadas
      amarelo: Ganhos Provisorios
      vermelho: Recursos
      verde: Ganhos Definitivos
    [Popup: info do edital] — ao clicar no marcador [ref: Passo 5]
      [Texto: Numero]
      [Texto: Orgao]
      [Texto: Valor] — formatCurrency
      [Badge: Etapa] — cor da etapa
      [Texto: Vendedor]

  [Legenda] [ref: Passo 6]
    [Cor: azul] Captados
    [Cor: roxo] Em Analise
    [Cor: laranja] Propostas Enviadas
    [Cor: amarelo] Ganhos Provisorios
    [Cor: vermelho] Recursos
    [Cor: verde] Ganhos Definitivos

  [Secao: Resumo por Regiao] [ref: Passo 7]
    [Tabela: resumo]
      [Coluna: "Regiao"]
      [Coluna: "Captados"]
      [Coluna: "Em Analise"]
      [Coluna: "Propostas"]
      [Coluna: "Ganhos"]
      [Coluna: "Total"]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Mapa"] | 1 |
| [Card: "Mapa de Processos"] | 2 |
| [Secao: Filtros] / selects | 3 |
| [Marcadores coloridos] no mapa | 4 |
| [Popup: info do edital] | 5 |
| [Legenda] | 6 |
| [Secao: Resumo por Regiao] / tabela | 7 |

### Implementacao Atual
**Nao Implementado**

---
