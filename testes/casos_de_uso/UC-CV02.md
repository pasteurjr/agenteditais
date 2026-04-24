---
uc_id: UC-CV02
nome: "Explorar resultados e painel lateral do edital"
sprint: "Sprint 2"
versao_uc: "5.0"
doc_origem: "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md"
linha_inicio_no_doc: 282
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CV02 — Explorar resultados e painel lateral do edital

> Caso de uso extraído automaticamente de `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md` (linha 282).
> Sprint origem: **Sprint 2**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-046, RN-052, RN-065, RN-067

**RF relacionados:** RF-019, RF-020, RF-024, RF-026

**Regras de Negocio aplicaveis:**
- Presentes: RN-046, RN-052, RN-065, RN-067
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario comercial/captacao

### Pre-condicoes
1. Resultado de busca retornado.

### Pos-condicoes
1. Usuario visualiza detalhes completos do edital selecionado.
2. Usuario pode tomar decisoes operacionais a partir do painel.

### Botoes e acoes observadas
Na tabela:
- checkbox de selecao
- clique na linha
- `Ver detalhes`
- `Salvar edital`

No painel lateral:
- `Salvar Estrategia`
- `Salvar Edital`
- `Ir para Validacao`
- `Abrir no Portal`
- `Baixar PDF`
- `Classificar Edital via IA`
- `Recomendar Preco`
- `Historico de Precos`

### Sequencia de eventos
1. Usuario clica numa linha da [Tabela: "Resultados"] ou no [Icone-Acao: "Ver detalhes"] (Eye). [ref: Passo 1]
2. Sistema abre o [Card: "Painel Lateral"] com dados do edital: numero, orgao, UF, objeto, valor, modalidade, produto correspondente, score e potencial. [ref: Passo 2]
3. Se ja houver score profundo, o painel exibe [Secao: "Score Profundo"] com 6 [Indicador: "ScoreBar"] (Tecnica, Documental, Complexidade, Juridico, Logistico, Comercial), decisao IA e justificativas. [ref: Passo 3]
4. Se nao houver score profundo mas o modo de score estiver ativo, a tela pode buscar `scores-validacao` ao abrir o painel. [ref: Passo 4]
5. No painel, usuario visualiza [Secao: "Intencao Estrategica"] com 4 opcoes [Radio] e [Secao: "Margem"] com slider. [ref: Passo 5]
6. Usuario decide se salva, exporta, envia para validacao ou usa acoes de IA via os botoes do painel. [ref: Passo 6]

### Fluxos Alternativos (V5)

**FA-01 — Edital sem score calculado**
1. Usuario clica num edital que foi buscado no modo "Sem Score".
2. O painel lateral abre sem a secao de Score Profundo.
3. As secoes de estrategia e acoes permanecem disponiveis.
4. Usuario pode salvar o edital e calcular score posteriormente na ValidacaoPage.

**FA-02 — Edital ja salvo anteriormente**
1. Usuario clica num edital que ja foi salvo em busca anterior.
2. O painel lateral exibe [Badge: "Salvo"] no cabecalho.
3. O botao "Salvar Edital" fica desabilitado ou mostra texto "Ja Salvo".
4. O botao "Ir para Validacao" fica disponivel para navegacao direta.

**FA-03 — Tabela de resultados vazia (nenhum edital na busca)**
1. Usuario tenta clicar na tabela vazia.
2. Nenhum painel lateral e aberto.
3. Sistema exibe mensagem: "Execute uma busca para ver resultados."

**FA-04 — Navegacao direta para Validacao**
1. Usuario clica em "Ir para Validacao" no painel lateral.
2. Se o edital nao estiver salvo, sistema salva automaticamente antes de navegar.
3. Sistema redireciona para `/app/validacao` com o edital pre-selecionado.

### Fluxos de Excecao (V5)

**FE-01 — Falha ao carregar detalhes do edital**
1. Usuario clica na linha do edital na tabela.
2. A requisicao para obter detalhes do edital falha (endpoint indisponivel ou timeout).
3. Sistema exibe mensagem de erro no painel lateral: "Nao foi possivel carregar os detalhes deste edital."
4. Usuario pode tentar novamente clicando na mesma linha.

**FE-02 — URL do portal invalida (Abrir no Portal)**
1. Usuario clica em "Abrir no Portal".
2. A URL do edital esta ausente ou malformada.
3. Sistema exibe Toast de erro: "URL do portal nao disponivel para este edital."

**FE-03 — PDF nao disponivel para download**
1. Usuario clica em "Baixar PDF".
2. O edital nao possui `pdf_url` nem `pdf_path` no banco.
3. Sistema exibe Toast de erro: "PDF nao disponivel para este edital."

**FE-04 — Erro na acao de IA (Classificar/Recomendar/Historico)**
1. Usuario clica em "Classificar Edital via IA", "Recomendar Preco" ou "Historico de Precos".
2. O servico DeepSeek esta indisponivel ou retorna erro.
3. Sistema exibe mensagem: "O servico de IA esta temporariamente indisponivel."

### Tela(s) Representativa(s)

**Pagina:** CaptacaoPage (`/app/captacao`)
**Posicao:** Bloco 3 (Tabela de Resultados) + Bloco 4 (Painel Lateral)

#### Layout da Tela

[Card: "Resultados"] icon FileText
  [Secao: "Acoes em Lote"]
    [Botao: "Relatorio Completo"] icon FileText [ref: UC-CV05]
    [Botao: "Salvar Todos"] icon Save [ref: UC-CV03]
    [Botao: "Salvar Score >= 70%"] icon Save [ref: UC-CV03]
    [Botao: "Exportar CSV"] icon Download [ref: UC-CV05]
    [Botao: "Salvar Selecionados"] icon Save [ref: UC-CV03]
  [Tabela: DataTable "Resultados"]
    [Coluna: Checkbox] — selecao multipla
    [Coluna: "Fonte"] — badge com cor
    [Coluna: "Numero"] — identificador do edital
    [Coluna: "Orgao"] — nome do orgao contratante
    [Coluna: "UF"] — estado
    [Coluna: "Modalidade"] — tipo de licitacao
    [Coluna: "Objeto"] — descricao resumida
    [Coluna: "Valor"] — valor estimado formatado
    [Coluna: "Produto Correspondente"] — match com portfolio
    [Coluna: "Prazo"] — dias restantes com badge colorido
    [Coluna: "Score"] — barra percentual com cor
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — ver detalhes / abrir painel lateral [ref: Passo 1]
      [Icone-Acao: Save] — salvar edital individual [ref: UC-CV03]

[Card: "Painel Lateral"] — visivel quando edital selecionado [ref: Passo 2]
  [Secao: "Dados do Edital"]
    [Texto: "Numero"] / [Texto: "Orgao"] / [Texto: "UF"]
    [Texto: "Objeto"] / [Texto: "Valor"] / [Texto: "Modalidade"]
    [Texto: "Produto Correspondente"]
    [Badge: "Score"] — percentual com cor
    [Badge: "Potencial"] — Alto/Medio/Baixo
  [Secao: "Score Profundo"] — visivel se calculado [ref: Passo 3]
    [Indicador: "ScoreBar Tecnica"]
    [Indicador: "ScoreBar Documental"]
    [Indicador: "ScoreBar Complexidade"]
    [Indicador: "ScoreBar Juridico"]
    [Indicador: "ScoreBar Logistico"]
    [Indicador: "ScoreBar Comercial"]
    [Badge: "Decisao IA"]
    [Texto: "Justificativa"]
    [Lista: "Pontos Positivos"]
    [Lista: "Pontos de Atencao"]
  [Secao: "Intencao Estrategica"] [ref: Passo 5, UC-CV04]
    [Radio: "Estrategico"]
    [Radio: "Defensivo"]
    [Radio: "Acompanhamento"]
    [Radio: "Aprendizado"]
  [Secao: "Expectativa de Margem"] [ref: Passo 5, UC-CV04]
    [Campo: Slider] — 0% a 50%
    [Toggle: "Varia por Produto"]
    [Toggle: "Varia por Regiao"]
  [Secao: "Acoes"]
    [Botao: "Salvar Estrategia"] [ref: UC-CV04]
    [Botao: "Salvar Edital"] [ref: UC-CV03]
    [Botao: "Ir para Validacao"] icon ExternalLink [ref: Passo 6]
    [Botao: "Abrir no Portal"] icon ExternalLink [ref: Passo 6]
    [Botao: "Baixar PDF"] icon Download [ref: Passo 6]
  [Secao: "Acoes IA"]
    [Botao: "Classificar Edital via IA"] [ref: Passo 6]
    [Botao: "Recomendar Preco"] [ref: Passo 6]
    [Botao: "Historico de Precos"] [ref: Passo 6]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Tabela: "Resultados"] / [Icone-Acao: Eye] | 1 |
| [Card: "Painel Lateral"] — dados do edital | 2 |
| [Secao: "Score Profundo"] + 6 ScoreBars | 3 |
| Carga automatica de scores | 4 |
| [Secao: "Intencao Estrategica"] + [Secao: "Margem"] | 5 |
| [Botao: "Ir para Validacao"] / [Botao: "Abrir no Portal"] / [Botao: "Baixar PDF"] / Acoes IA | 6 |

### Implementacao atual
**IMPLEMENTADO**

---
