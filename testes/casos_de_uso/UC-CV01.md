---
uc_id: UC-CV01
nome: "Buscar editais por termo, classificacao e score"
sprint: "Sprint 2"
versao_uc: "5.0"
doc_origem: "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md"
linha_inicio_no_doc: 135
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-CV01 — Buscar editais por termo, classificacao e score

> Caso de uso extraído automaticamente de `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md` (linha 135).
> Sprint origem: **Sprint 2**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-043, RN-044, RN-045, RN-046, RN-065, RN-068, RN-077, RN-078 [FALTANTE->V4]

**RF relacionados:** RF-019, RF-021, RF-022, RF-026, RF-028

**Regras de Negocio aplicaveis:**
- Presentes: RN-043, RN-044, RN-045, RN-046, RN-065, RN-068
- Faltantes: RN-077 [FALTANTE], RN-078 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario comercial/captacao

### Pre-condicoes
1. Usuario autenticado.
2. Fontes e parametros basicos configurados.
3. Endpoints `/api/editais/buscar`, `/api/modalidades`, `/api/origens` e `/api/areas-produto` disponiveis.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F14**
- **UC-F15**
- **UC-F16**

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario


### Pos-condicoes
1. Lista de editais encontrada e exibida na tabela.
2. Resultados podem vir sem score, com score rapido, hibrido ou profundo.
3. Cards de prazo e ranking passam a refletir a busca atual.

### Botoes e acoes observadas
- `Buscar Editais`
- filtros de UF, fonte, area, classe, subclasse, modalidade, origem, NCM, periodo
- select `Analise de Score`
- checkbox `Incluir editais encerrados`

### Sequencia de eventos
1. Usuario preenche o [Campo: "Termo de busca / Produto"] com texto livre ou seleciona sugestao no autocomplete. [ref: Passo 1]
2. Usuario navega pela cascata [Select: "Area"] -> [Select: "Classe"] -> [Select: "Subclasse"] para refinar a classificacao. [ref: Passo 2]
3. Usuario ajusta filtros de [Select: "UF"], [Select: "Fonte"], [Select: "Modalidade"], [Select: "Origem"], [Campo: "NCM"] e [Campo: "Periodo (De/Ate)"]. [ref: Passo 3]
4. Usuario define o modo de score no [Select: "Analise de Score"]: `Sem Score`, `Score Rapido`, `Score Hibrido` ou `Score Profundo`. [ref: Passo 4]
5. Usuario pode marcar [Checkbox: "Incluir editais encerrados"] e definir [Campo: "Qtd editais profundo"]. [ref: Passo 5]
6. Usuario clica no [Botao: "Buscar Editais"]. [ref: Passo 6]
7. Sistema chama a busca principal via `POST /api/editais/buscar`, normaliza o retorno para `EditalBusca` e recalcula dias restantes, score, potencial e gaps. [ref: Passo 7]
8. Os [Card: "StatCard"] superiores (prazo 2, 5, 10, 20 dias) e a [Tabela: "Resultados"] sao atualizados com os novos dados. [ref: Passo 8]

### Fluxos Alternativos (V5)

**FA-01 — Nenhum edital encontrado para o termo informado**
1. Usuario preenche termo e clica em "Buscar Editais".
2. O endpoint retorna lista vazia (zero resultados).
3. Sistema exibe mensagem informativa na area de resultados (ex: "Nenhum edital encontrado para os criterios informados").
4. Os StatCards permanecem zerados ou com valores da busca anterior.
5. Usuario pode alterar os filtros e realizar nova busca.

**FA-02 — Filtros sem resultado (UF/NCM/Fonte restritivos)**
1. Usuario aplica combinacao de filtros muito restritiva (ex: UF=AC + NCM=9018.19.90 + Fonte=PNCP).
2. Sistema retorna lista vazia.
3. Usuario e orientado a relaxar os filtros (remover UF ou NCM) e repetir a busca.

**FA-03 — Busca sem score (modo "Sem Score" selecionado)**
1. Usuario seleciona "Sem Score" no campo de Analise de Score.
2. Sistema executa apenas a busca textual, sem calcular score de aderencia.
3. A coluna Score na tabela de resultados aparece vazia ou com traco.
4. Fluxo segue normalmente; usuario pode salvar editais mesmo sem score.

**FA-04 — Cascata de classificacao parcial (apenas Area selecionada)**
1. Usuario seleciona Area mas nao seleciona Classe ou Subclasse.
2. Sistema aceita a busca com filtro parcial de classificacao.
3. Resultados sao filtrados apenas pela Area.

**FA-05 — Incluir editais encerrados**
1. Usuario marca o checkbox "Incluir editais encerrados".
2. Sistema retorna editais com prazo expirado alem dos ativos.
3. Editais encerrados sao exibidos com diferenciacao visual (badge "Encerrado" ou cor distinta).

### Fluxos de Excecao (V5)

**FE-01 — PNCP fora do ar / timeout de conexao**
1. Usuario clica em "Buscar Editais".
2. O endpoint `/api/editais/buscar` nao consegue conectar ao portal PNCP (timeout ou HTTP 5xx).
3. Sistema exibe mensagem de erro: "Nao foi possivel conectar ao portal PNCP. Tente novamente em alguns minutos."
4. A tabela de resultados permanece vazia ou com dados da busca anterior.

**FE-02 — Termo de busca vazio ou com menos de 3 caracteres**
1. Usuario clica em "Buscar Editais" sem preencher o termo ou com menos de 3 caracteres.
2. Sistema bloqueia a busca e exibe validacao inline: "Informe ao menos 3 caracteres no termo de busca." (RN-077)
3. O botao "Buscar Editais" permanece inativo ou a requisicao nao e enviada.

**FE-03 — UF invalida informada (RN-078)**
1. Usuario tenta forcar uma UF nao valida no filtro (manipulacao de DOM ou API direta).
2. O backend valida a UF contra a lista IBGE (27 estados + DF).
3. Sistema retorna erro HTTP 400 com mensagem: "UF invalida."

**FE-04 — Erro no calculo de score (modo Score Profundo)**
1. Usuario seleciona Score Profundo e clica em "Buscar Editais".
2. O processamento de score via IA falha (timeout DeepSeek, credito insuficiente, modelo indisponivel).
3. Sistema retorna os editais encontrados mas sem score calculado.
4. Exibe alerta: "O calculo de score profundo falhou. Os resultados sao exibidos sem score."

**FE-05 — Sessao expirada durante a busca**
1. Usuario clica em "Buscar Editais" mas o token JWT expirou.
2. O backend retorna HTTP 401.
3. Sistema redireciona o usuario para a tela de login.

### Tela(s) Representativa(s)

**Pagina:** CaptacaoPage (`/app/captacao`)
**Posicao:** Bloco 1 (StatCards) + Bloco 2 (Card Buscar Editais)

#### Layout da Tela

[Cabecalho: "Captacao de Editais"] icon Search
  [Texto: "Busca inteligente com IA, classificacao e monitoramento"]

[Card: "StatCard — Prazo 2 dias"] — contador de editais proximos do vencimento
[Card: "StatCard — Prazo 5 dias"]
[Card: "StatCard — Prazo 10 dias"]
[Card: "StatCard — Prazo 20 dias"]

[Card: "Buscar Editais"] icon Search
  [Campo: "Termo de busca / Produto"] — text com autocomplete de produtos [ref: Passo 1]
  [Select: "UF"] — multiselect de estados [ref: Passo 3]
  [Select: "Fonte"] — select de fontes configuradas [ref: Passo 3]
  [Select: "Area"] — cascata nivel 1 [ref: Passo 2]
  [Select: "Classe"] — cascata nivel 2, depende de Area [ref: Passo 2]
  [Select: "Subclasse"] — cascata nivel 3, depende de Classe [ref: Passo 2]
  [Select: "Modalidade"] — select de modalidades [ref: Passo 3]
  [Select: "Origem"] — select de origens [ref: Passo 3]
  [Campo: "NCM"] — text livre [ref: Passo 3]
  [Campo: "Periodo De"] — date [ref: Passo 3]
  [Campo: "Periodo Ate"] — date [ref: Passo 3]
  [Select: "Analise de Score"] — 4 modos (Sem Score / Rapido / Hibrido / Profundo) [ref: Passo 4]
  [Campo: "Qtd editais profundo"] — number, visivel quando modo = Profundo [ref: Passo 5]
  [Checkbox: "Incluir editais encerrados"] [ref: Passo 5]
  [Botao: "Buscar Editais"] icon Search [ref: Passo 6]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Campo: "Termo de busca / Produto"] | 1 |
| [Select: "Area"] / [Select: "Classe"] / [Select: "Subclasse"] | 2 |
| [Select: "UF"] / [Select: "Fonte"] / [Select: "Modalidade"] / [Select: "Origem"] | 3 |
| [Campo: "NCM"] / [Campo: "Periodo De/Ate"] | 3 |
| [Select: "Analise de Score"] | 4 |
| [Checkbox: "Incluir editais encerrados"] / [Campo: "Qtd editais profundo"] | 5 |
| [Botao: "Buscar Editais"] | 6 |
| [Card: "StatCard"] (4x prazo) | 8 |

### Implementacao atual
**IMPLEMENTADO**

---
