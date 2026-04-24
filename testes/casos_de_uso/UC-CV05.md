---
uc_id: UC-CV05
nome: "Exportar e consolidar resultados da busca"
sprint: "Sprint 2"
versao_uc: "5.0"
doc_origem: "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md"
linha_inicio_no_doc: 695
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CV05 — Exportar e consolidar resultados da busca

> Caso de uso extraído automaticamente de `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md` (linha 695).
> Sprint origem: **Sprint 2**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionados:** RF-019, RF-026
**Ator:** Usuario comercial/captacao

### Pre-condicoes
1. Resultados de busca carregados.

### Pos-condicoes
1. Usuario consegue exportar a grade corrente em CSV.
2. Usuario consegue gerar relatorio consolidado em markdown/HTML/PDF de impressao.

### Botoes e acoes observadas
- `Relatorio Completo`
- `Exportar CSV`

### Sequencia de eventos
1. Usuario executa uma busca e visualiza resultados na [Tabela: "Resultados"]. [ref: Passo 1]
2. Usuario clica no [Botao: "Exportar CSV"] na [Secao: "Acoes em Lote"] para baixar a lista corrente em formato CSV. [ref: Passo 2]
3. Usuario clica no [Botao: "Relatorio Completo"] na [Secao: "Acoes em Lote"] para consolidar a busca atual em relatorio textual estruturado (markdown/HTML). [ref: Passo 3]
4. Sistema usa o mesmo dataset normalizado da grade para gerar a saida consolidada. [ref: Passo 4]

### Fluxos Alternativos (V5)

**FA-01 — Exportar CSV com tabela vazia**
1. Usuario clica em "Exportar CSV" sem ter resultados de busca.
2. Sistema exibe mensagem: "Nenhum dado para exportar. Execute uma busca primeiro."
3. Nenhum download e iniciado.

**FA-02 — Relatorio Completo com poucos resultados**
1. Usuario clica em "Relatorio Completo" com apenas 1-2 editais na busca.
2. Sistema gera o relatorio normalmente, mas o conteudo e curto.
3. O relatorio contem os dados disponiveis sem erro.

### Fluxos de Excecao (V5)

**FE-01 — Falha na geracao do CSV**
1. Usuario clica em "Exportar CSV".
2. O processo de geracao falha (erro de formatacao ou encoding).
3. Sistema exibe Toast de erro: "Erro ao gerar arquivo CSV."

**FE-02 — Timeout na geracao do Relatorio Completo**
1. Usuario clica em "Relatorio Completo".
2. O endpoint de geracao excede o timeout (ex: muitos editais com score profundo).
3. Sistema exibe mensagem: "O relatorio demorou mais que o esperado. Tente com menos editais."

**FE-03 — Bloqueio de download pelo navegador**
1. O navegador bloqueia o download automatico do CSV.
2. O usuario precisa autorizar manualmente o download nas configuracoes do navegador.
3. Sistema nao tem controle sobre esta situacao; o download fica pendente no navegador.

### Tela(s) Representativa(s)

**Pagina:** CaptacaoPage (`/app/captacao`)
**Posicao:** Bloco 3 (Secao de Acoes em Lote acima da Tabela)

#### Layout da Tela

> Nota: Elementos compartilhados com UC-CV02/CV03. Aqui apenas os de exportacao.

[Secao: "Acoes em Lote"]
  [Botao: "Relatorio Completo"] icon FileText [ref: Passo 3]
  [Botao: "Exportar CSV"] icon Download [ref: Passo 2]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Tabela: "Resultados"] | 1 |
| [Botao: "Exportar CSV"] | 2 |
| [Botao: "Relatorio Completo"] | 3 |

### Implementacao atual
**IMPLEMENTADO**

---
