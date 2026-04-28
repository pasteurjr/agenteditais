---
uc_id: UC-CV12
nome: "Analisar mercado do orgao contratante"
sprint: "Sprint 2"
versao_uc: "5.0"
doc_origem: "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md"
linha_inicio_no_doc: 1655
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-CV12 — Analisar mercado do orgao contratante

> Caso de uso extraído automaticamente de `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md` (linha 1655).
> Sprint origem: **Sprint 2**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-045, RN-056, RN-057, RN-058, RN-059, RN-060, RN-069, RN-070, RN-076, RN-079 [FALTANTE->V4], RN-087 [FALTANTE->V4]

**RF relacionados:** RF-033

**Regras de Negocio aplicaveis:**
- Presentes: RN-045, RN-056, RN-057, RN-058, RN-059, RN-060, RN-069, RN-070, RN-076
- Faltantes: RN-079 [FALTANTE], RN-087 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario analista/comercial

### Pre-condicoes
1. Edital selecionado.
2. Endpoint `/api/editais/{id}/analisar-mercado` disponivel.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CV03 OU UC-CV07**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


### Pos-condicoes
1. Usuario visualiza dados do orgao, reputacao, volume de compras, compras similares e historico interno.
2. Analise textual da IA fica associada ao contexto do edital.

### Botoes e acoes observadas
Na aba `Mercado`:
- `Analisar Mercado do Orgao` / `Reanalisar Mercado`

### Sequencia de eventos
1. Usuario abre a [Aba: "Mercado"] no [Card: "Painel de Abas"]. [ref: Passo 1]
2. Usuario clica no [Botao: "Analisar Mercado do Orgao"] (ou [Botao: "Reanalisar Mercado"]). [ref: Passo 2]
3. Sistema chama `POST /api/editais/{id}/analisar-mercado`. [ref: Passo 3]
4. A [Secao: "Dados do Orgao"] exibe Nome, CNPJ e UF do orgao. [ref: Passo 4]
5. A [Secao: "Reputacao do Orgao"] exibe 6 indicadores: Esfera, Risco Pagamento, Volume Compras, Modalidade Principal, % Pregao Eletronico, Editais Similares. [ref: Passo 5]
6. A [Secao: "Volume de Compras no PNCP"] exibe 3 cards (Compras encontradas, Valor total, Valor medio) + badges de modalidades. [ref: Passo 6]
7. A [Secao: "Compras Similares"] lista compras do mesmo orgao com objeto, valor, data e modalidade. [ref: Passo 7]
8. A [Secao: "Historico Interno"] exibe badges com total de editais, GO, NO-GO e Em Avaliacao para o mesmo orgao. [ref: Passo 8]
9. A [Secao: "Analise de Mercado (IA)"] exibe texto analitico gerado pela IA sobre o orgao. [ref: Passo 9]

### Fluxos Alternativos (V5)

**FA-01 — Mercado ja analisado (Reanalisar)**
1. O edital ja teve analise de mercado executada anteriormente.
2. Os dados sao exibidos imediatamente a partir do cache.
3. O botao exibido e "Reanalisar Mercado".
4. Ao reanalisar, o sistema busca dados atualizados.

**FA-02 — Orgao sem historico no PNCP**
1. O orgao contratante nao possui registros no PNCP alem do edital atual.
2. A secao "Volume de Compras no PNCP" exibe valores zerados.
3. A secao "Compras Similares" exibe mensagem: "Nenhuma compra similar encontrada."

**FA-03 — Historico interno vazio (primeiro contato com o orgao)**
1. A empresa nunca participou de licitacoes com o orgao contratante.
2. A secao "Historico Interno" exibe "0 editais" com badges zerados.

**FA-04 — Analise IA com dados parciais**
1. Alguns dados do orgao estao incompletos (ex: sem CNPJ no edital).
2. A IA gera analise com base nos dados disponiveis.
3. O texto inclui ressalva sobre dados parciais.

### Fluxos de Excecao (V5)

**FE-01 — Falha na analise de mercado**
1. Usuario clica em "Analisar Mercado do Orgao".
2. O endpoint `/api/editais/{id}/analisar-mercado` retorna erro.
3. Sistema exibe mensagem: "Erro ao analisar mercado do orgao."

**FE-02 — PNCP indisponivel para consulta de volume**
1. O sistema tenta consultar o volume de compras no PNCP.
2. O portal esta fora do ar.
3. As secoes que dependem do PNCP ficam vazias com mensagem de indisponibilidade.
4. A secao "Dados do Orgao" e o "Historico Interno" (dados locais) sao exibidos normalmente.

**FE-03 — Timeout na geracao de analise IA**
1. A IA demora mais que o timeout para gerar a analise textual.
2. As demais secoes (Dados, Reputacao, Volume) sao exibidas normalmente.
3. A secao "Analise de Mercado (IA)" exibe: "A analise da IA demorou mais que o esperado. Tente reanalisar."

**FE-04 — CNPJ do orgao invalido ou ausente**
1. O edital nao possui CNPJ do orgao contratante.
2. A consulta ao PNCP nao pode ser feita por CNPJ.
3. Sistema tenta busca alternativa por nome do orgao.
4. Se nao encontrar, exibe: "Dados do orgao nao encontrados — CNPJ ausente no edital."

### Tela(s) Representativa(s)

**Pagina:** ValidacaoPage (`/app/validacao`)
**Posicao:** Aba 5 "Mercado" do Painel de Abas

#### Layout da Tela

[Aba: "Mercado"] icon Building
  [Secao: "Acao de Analise"]
    [Botao: "Analisar Mercado do Orgao"] / [Botao: "Reanalisar Mercado"] icon Building [ref: Passo 2]
    [Badge: "Cache (dados recentes)"] — visivel se dados cacheados
  [Secao: "Dados do Orgao"] icon Building [ref: Passo 4]
    [Texto: "Nome"] — nome do orgao
    [Texto: "CNPJ"] — CNPJ do orgao
    [Texto: "UF"] — estado
  [Secao: "Reputacao do Orgao"] icon Shield [ref: Passo 5]
    [Indicador: "Esfera"] — Federal/Estadual/Municipal com cor
    [Indicador: "Risco Pagamento"] — Baixo/Medio/Alto com cor
    [Indicador: "Volume Compras"] — texto
    [Indicador: "Modalidade Principal"] — texto
    [Indicador: "% Pregao Eletronico"] — percentual com cor
    [Indicador: "Editais Similares"] — numero
  [Secao: "Volume de Compras no PNCP"] icon TrendingUp [ref: Passo 6]
    [Card: "Compras encontradas"] — numero em azul
    [Card: "Valor total"] — moeda em verde
    [Card: "Valor medio"] — moeda em amarelo
    [Lista: "Modalidades"] — badges com contagem
  [Secao: "Compras Similares"] icon Search [ref: Passo 7]
    [Lista: "Compras"]
      [Texto: "Objeto"]
      [Texto: "Valor"]
      [Texto: "Data"]
      [Badge: "Modalidade"]
  [Secao: "Historico Interno"] icon ClipboardCheck [ref: Passo 8]
    [Badge: "N edital(is)"] — azul
    [Badge: "N GO"] — verde
    [Badge: "N NO-GO"] — vermelho
    [Badge: "N Em Avaliacao"] — amarelo
  [Secao: "Analise de Mercado (IA)"] icon Sparkles [ref: Passo 9]
    [Texto: "Analise textual"] — texto longo gerado pela IA

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Mercado"] | 1 |
| [Botao: "Analisar Mercado do Orgao"] / [Botao: "Reanalisar Mercado"] | 2 |
| [Secao: "Dados do Orgao"] | 4 |
| [Secao: "Reputacao do Orgao"] — 6 indicadores | 5 |
| [Secao: "Volume de Compras no PNCP"] — 3 cards + badges | 6 |
| [Secao: "Compras Similares"] | 7 |
| [Secao: "Historico Interno"] — badges GO/NO-GO | 8 |
| [Secao: "Analise de Mercado (IA)"] | 9 |

### Implementacao atual
**IMPLEMENTADO**

---
