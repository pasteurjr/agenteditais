---
uc_id: UC-CRM05
nome: "KPIs do CRM *(NOVO V3)*"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 2580
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-CRM05 — KPIs do CRM *(NOVO V3)*

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 2580).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-194, RN-196, RN-197, RN-214 [FALTANTE->V4], RN-215 [FALTANTE->V4]

**RF relacionado:** RF-045-05
**Ator:** Usuario (Gestor Comercial / Diretor)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Editais registrados nas diversas etapas do pipeline do CRM
3. Resultados de ganhos e perdas registrados (UC-FU01)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-FU01**


### Pos-condicoes
1. KPIs de performance comercial calculados e exibidos
2. Filtros de periodo aplicados
3. Drill-down disponivel em cada KPI

### Sequencia de Eventos

1. Na CRMPage, usuario clica na [Aba: "KPIs"]
2. [Select: "Periodo"] permite filtrar: Ultimo mes, Ultimos 3 meses, Ultimos 6 meses, Ultimos 12 meses, Tudo
3. [Secao: KPIs Principais — grid 3x2] exibe 6 stat cards:
   - [Card: "Participados / Analisados"] — percentual e numeros absolutos (ex: "45/120 = 37.5%")
   - [Card: "Nao Participados / Analisados"] — complementar ao anterior
   - [Card: "Ganhos / Participados"] — taxa de conversao de vitorias
   - [Card: "Ganhos c/ Recursos / Participados"] — taxa de vitorias via recurso
   - [Card: "Perdidos / Participados"] — taxa de perdas
   - [Card: "Perdidos apos Contra Razao / Total Contra Razoes"] — eficacia das contra-razoes
4. [Card: "Indice de Reversao por Recursos"] exibe: total de reversoes, percentual, principais motivos
5. [Card: "Ticket Medio"] exibe comparativo:
   - Ticket Medio Editais Ganhos vs Ticket Medio Editais Participados e Perdidos
   - [Texto explicativo: "Para entender o quanto a energia dispendida nas vitorias foi bem direcionada na criacao de valor"]
6. [Card: "Potencial de Receita"] exibe: valor total em pipeline ativo, distribuido por etapa
7. [Card: "Tempo Medio de Ganho"] exibe: media de dias desde lance ate ganho definitivo, com tendencia
8. Usuario clica em um KPI — [Card Expandido] mostra tabela com os editais que compoem aquele indicador
9. [Secao: Analise de Perdas] exibe tabela com principais motivos de perda agregados:
   - [Tabela: Motivos de Perda] com: Motivo, Quantidade, %, Tendencia
   - Diferenciacao entre perdas simples e perdas apos contra-razao

### Fluxos Alternativos (V5)

- **FA-01 — Nenhum resultado registrado no periodo:** Todos os KPIs exibem 0/0 = 0%. Ticket Medio R$ 0,00. Tempo Medio "N/A". Mensagem "Nenhum resultado registrado no periodo selecionado."
- **FA-02 — KPI com drill-down vazio:** Usuario clica em KPI com valor 0. Card Expandido abre com tabela vazia.
- **FA-03 — Sem perdas apos contra-razao:** Card "Perdidos apos CR / Total CR" exibe 0/0. Secao Analise de Perdas nao mostra coluna "Perda apos CR".

### Fluxos de Excecao (V5)

- **FE-01 — Erro ao carregar KPIs:** Requisicao falha. Stat Cards exibem "-". Demais cards nao renderizados. Alerta de erro.
- **FE-02 — Divisao por zero em taxa:** Se denominador e 0 (ex: 0 participados), KPI exibe "N/A" ao inves de percentual.
- **FE-03 — Timeout ao recalcular com periodo "Tudo":** Volume de dados muito grande. Loader permanece e eventual timeout com mensagem de erro.

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`)
**Posicao:** Aba "KPIs"

#### Layout da Tela

```
[Aba: "Pipeline"] [Aba: "Mapa"] [Aba: "Agenda"] [Aba: "KPIs"] [Aba: "Parametrizacoes"]

[Select: "Periodo"] [ref: Passo 2]
  opcoes: "1m", "3m", "6m", "12m", "tudo"

[Secao: KPIs Principais — grid 3x2] [ref: Passo 3]
  [Card: "Participados / Analisados"] (icone Users, cor: #3b82f6) — clicavel [ref: Passo 8]
    [Texto: "{n}/{total} = {pct}%"] (fontSize: 22, fontWeight: 700)
  [Card: "Nao Participados / Analisados"] (icone UserMinus, cor: #6b7280) — clicavel
    [Texto: "{n}/{total} = {pct}%"]
  [Card: "Ganhos / Participados"] (icone Trophy, cor: #16a34a) — clicavel
    [Texto: "{n}/{total} = {pct}%"]
  [Card: "Ganhos c/ Recursos"] (icone Gavel, cor: #65a30d) — clicavel
    [Texto: "{n}/{total} = {pct}%"]
  [Card: "Perdidos / Participados"] (icone XCircle, cor: #dc2626) — clicavel
    [Texto: "{n}/{total} = {pct}%"]
  [Card: "Perdidos apos CR / Total CR"] (icone ShieldX, cor: #b91c1c) — clicavel
    [Texto: "{n}/{total} = {pct}%"]

[Card: "Indice de Reversao por Recursos"] [ref: Passo 4]
  [Texto: "Total reversoes: {n}"]
  [Texto: "Indice: {pct}%"]
  [Tabela: Principais Motivos de Reversao]
    [Coluna: "Motivo"]
    [Coluna: "Quantidade"]
    [Coluna: "%"]

[Card: "Ticket Medio"] [ref: Passo 5]
  [Secao: grid 2 colunas]
    [Campo: "TM Editais Ganhos"] — formatCurrency, cor verde
    [Campo: "TM Editais Participados/Perdidos"] — formatCurrency, cor cinza
  [Texto: "Avaliacao da direcao da energia nas vitorias"] (fontSize: 12, color: #6b7280)

[Card: "Potencial de Receita"] [ref: Passo 6]
  [Texto: "Total em Pipeline: {formatCurrency}"]
  [Tabela: distribuicao por etapa]
    [Coluna: "Etapa"]
    [Coluna: "Qtd Editais"]
    [Coluna: "Valor Total"] (render: formatCurrency)

[Card: "Tempo Medio de Ganho"] [ref: Passo 7]
  [Texto: "{dias} dias"] (fontSize: 28, fontWeight: 700)
  [Texto: "Do lance ao ganho definitivo"]
  [Indicador: tendencia] — icone TrendingUp/TrendingDown

[Card Expandido: "{KPI selecionado}"] — condicional [ref: Passo 8]
  [Tabela: Editais do KPI]
    [Coluna: "Numero"]
    [Coluna: "Orgao"]
    [Coluna: "Valor"] (render: formatCurrency)
    [Coluna: "Resultado"]
    [Coluna: "Data"]

[Secao: Analise de Perdas] [ref: Passo 9]
  [Tabela: Motivos de Perda]
    [Coluna: "Motivo"]
    [Coluna: "Quantidade"]
    [Coluna: "%"]
    [Coluna: "Tendencia"] — icone TrendingUp/TrendingDown
    [Coluna: "Tipo"] — badge: "Perda Direta" / "Perda apos CR"
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "KPIs"] | 1 |
| [Select: "Periodo"] | 2 |
| [Secao: KPIs Principais] / stat cards | 3 |
| [Card: "Indice de Reversao por Recursos"] | 4 |
| [Card: "Ticket Medio"] | 5 |
| [Card: "Potencial de Receita"] | 6 |
| [Card: "Tempo Medio de Ganho"] | 7 |
| [Card Expandido] com tabela | 8 |
| [Secao: Analise de Perdas] / tabela | 9 |

### Implementacao Atual
**Nao Implementado**

---
