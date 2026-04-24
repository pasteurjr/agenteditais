---
uc_id: UC-CRM01
nome: "Pipeline de Cards do CRM *(NOVO V3)*"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 2096
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CRM01 — Pipeline de Cards do CRM *(NOVO V3)*

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 2096).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-165, RN-166, RN-167, RN-168, RN-204 [FALTANTE->V4], RN-205 [FALTANTE->V4], RN-212 [FALTANTE->V4]

**RF relacionado:** RF-045, RF-045-01
**Ator:** Usuario (Analista Comercial / Gestor Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Editais captados e processados nas etapas anteriores do fluxo comercial (Sprints 1-4)
3. Pagina CRMPage implementada e acessivel via menu lateral

### Pos-condicoes
1. Pipeline completo do ciclo de vida dos editais visualizado em formato de cards/kanban
2. Contagem de editais por etapa exibida em cada card
3. Drill-down disponivel em cada card para listar editais daquela etapa
4. Editais com vendas recorrentes diferenciados de vendas pontuais

### Sequencia de Eventos

1. Usuario acessa CRMPage (`/app/crm`) via menu lateral "CRM"
2. [Cabecalho: "CRM do Processo"] com paragrafo "Pipeline de gestao do ciclo de vida dos editais"
3. [Secao: Pipeline Overview — grid responsivo] exibe cards representando cada etapa do processo licitatorio:
   - [Card: "Editais Nao Divulgados Captados"] — oportunidades mapeadas presencialmente
   - [Card: "Editais Divulgados Captados"] — oportunidades captadas nos sistemas governamentais
   - [Card: "Editais em Analise"] — editais em processo de decisao de participacao
   - [Card: "Leads Potenciais"] — editais com decisao firme de participacao
   - [Card: "Monitoramento Concorrencia"] — editais declinados mas acompanhados
   - [Card: "Impugnacao"] — editais com processo de impugnacao aberto
   - [Card: "Fase de Propostas"] — editais em elaboracao/precificacao de proposta
   - [Card: "Propostas Submetidas"] — propostas enviadas aguardando lances
   - [Card: "Espera de Resultados"] — editais pos-lances aguardando resultado
   - [Card: "Ganho Provisorio e Habilitacao"] — ganhos provisorios pre-recursos
   - [Card: "Processos e Recursos"] — recursos em elaboracao/submetidos
   - [Card: "Contra Razoes"] — contra-razoes em elaboracao/submetidas
   - [Card: "Resultados Definitivos"] — ganhos e perdas definitivas
4. Cada card exibe: [Badge: contagem] de editais naquela etapa, [Icone] representativo, [Texto: nome da etapa]
5. Cards com subcards exibem indicador de expansao (icone ChevronDown)
6. Usuario clica em um card — [Card Expandido: "{nome_etapa}"] abre abaixo com lista de editais
7. [Tabela: Editais da Etapa] exibe: Numero, Orgao, Objeto (truncado), Valor Estimado, Tipo Venda (Pontual/Recorrente), Data, Acao
8. [Coluna: "Tipo Venda"] exibe badge: Pontual (azul), Recorrente (verde)
9. Cards com subcards (ex: Impugnacao, Recursos, Contra Razoes, Resultados Definitivos) expandem para mostrar os subcards:
   - Impugnacao: Aguardando Resultado, Deferida, Indeferida
   - Recursos: Em Elaboracao (com contador de tempo), Submetidos
   - Contra Razoes: Em Elaboracao (com contador de tempo), Submetidas
   - Resultados Definitivos: Aguardando Homologacao, Ganhos, Perdidos
10. [Indicador: Contador de Tempo] (cor dinamica) exibido em recursos/contra-razoes em elaboracao — fica vermelho quando se aproxima do prazo limite
11. Usuario pode mover edital entre etapas via [Botao: "Avancar"] ou [Botao: "Retroceder"] na coluna Acao da tabela expandida

### Fluxos Alternativos (V5)

- **FA-01 — Card do pipeline com contagem zero:** Card exibe badge "0". Ao clicar, Card Expandido abre com tabela vazia e mensagem "Nenhum edital nesta etapa."
- **FA-02 — Pipeline sem editais em nenhuma etapa (CRM vazio):** Todos os 13 cards exibem badge "0". Sistema funciona normalmente mas sem dados.
- **FA-03 — Edital movido de "Em Analise" para "Monitoramento" via declinio (UC-CRM06):** Apos declinio, card "Em Analise" decrementa e "Monitoramento" incrementa. Badges atualizam automaticamente.

### Fluxos de Excecao (V5)

- **FE-01 — Erro ao carregar pipeline:** Requisicao GET para `/api/crm/pipeline` falha. Cards nao renderizados. Alerta de erro exibido.
- **FE-02 — Tentativa de avancar edital para etapa invalida:** Backend rejeita transicao fora da maquina de estados (RN-205). Sistema exibe alerta "Transicao nao permitida de '{etapa_atual}' para '{etapa_destino}'."
- **FE-03 — Contador de tempo expirado em recurso/contra-razao:** Indicador fica vermelho piscante. Edital marcado como "prazo expirado". Acao de submissao pode ser bloqueada dependendo das regras.

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`)
**Posicao:** Secao Pipeline (principal)

#### Layout da Tela

```
[Cabecalho: "CRM do Processo"] [ref: Passo 2]
  [Titulo h1: "CRM do Processo"]
  [Texto p: "Pipeline de gestao do ciclo de vida dos editais"]

[Secao: Pipeline Overview — grid responsivo, 4-5 colunas] [ref: Passo 3]
  [Card: "Editais Nao Divulgados"] (icone Eye, cor: #6b7280) [ref: Passos 3, 4]
    [Badge: contagem] (bg: #f3f4f6)
    [Texto: "Nao Divulgados"]
  [Card: "Editais Divulgados"] (icone Globe, cor: #3b82f6)
    [Badge: contagem]
  [Card: "Em Analise"] (icone Search, cor: #8b5cf6)
    [Badge: contagem]
  [Card: "Leads Potenciais"] (icone Target, cor: #16a34a)
    [Badge: contagem]
  [Card: "Monitoramento"] (icone Binoculars, cor: #f59e0b)
    [Badge: contagem]
  [Card: "Impugnacao"] (icone Scale, cor: #dc2626) [ref: Passo 5]
    [Badge: contagem]
    [Icone: ChevronDown] — indica subcards
  [Card: "Fase de Propostas"] (icone FileText, cor: #0891b2)
    [Badge: contagem]
  [Card: "Propostas Submetidas"] (icone Send, cor: #7c3aed)
    [Badge: contagem]
  [Card: "Espera Resultados"] (icone Hourglass, cor: #ea580c)
    [Badge: contagem]
  [Card: "Ganho Provisorio"] (icone Award, cor: #65a30d)
    [Badge: contagem]
  [Card: "Recursos"] (icone Gavel, cor: #b91c1c)
    [Badge: contagem]
    [Icone: ChevronDown]
  [Card: "Contra Razoes"] (icone Shield, cor: #9333ea)
    [Badge: contagem]
    [Icone: ChevronDown]
  [Card: "Resultados Definitivos"] (icone Trophy, cor: #ca8a04)
    [Badge: contagem]
    [Icone: ChevronDown]

[Card Expandido: "{nome_etapa}"] — condicional, abre ao clicar [ref: Passos 6, 7]
  [Tabela: Editais da Etapa] (DataTable)
    [Coluna: "Numero"] (sortable)
    [Coluna: "Orgao"] (sortable)
    [Coluna: "Objeto"] — truncado 50 chars
    [Coluna: "Valor Estimado"] (render: formatCurrency)
    [Coluna: "Tipo Venda"] — badge [ref: Passo 8]
      [Badge: "Pontual"] (bg: #dbeafe, fg: #1e40af)
      [Badge: "Recorrente"] (bg: #dcfce7, fg: #166534)
    [Coluna: "Data"]
    [Coluna: "Acao"]
      [Botao: "Avancar"] (size: sm, variant: primary) [ref: Passo 11]
      [Botao: "Retroceder"] (size: sm, variant: secondary) [ref: Passo 11]

[Secao: Subcards] — condicional, para cards com sub-etapas [ref: Passo 9]
  [SubCard: "{sub_etapa}"]
    [Badge: contagem]
    [Indicador: Contador de Tempo] — condicional [ref: Passo 10]
      (cor verde: > 48h, amarelo: 24-48h, vermelho: < 24h)
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Cabecalho: "CRM do Processo"] | 2 |
| [Secao: Pipeline Overview] / cards | 3, 4 |
| [Badge: contagem] em cada card | 4 |
| [Icone: ChevronDown] | 5 |
| [Card Expandido] | 6 |
| [Tabela: Editais da Etapa] | 7 |
| [Coluna: "Tipo Venda"] / badges | 8 |
| [Secao: Subcards] | 9 |
| [Indicador: Contador de Tempo] | 10 |
| [Botao: "Avancar"] / [Botao: "Retroceder"] | 11 |

### Implementacao Atual
**Nao Implementado**

---
