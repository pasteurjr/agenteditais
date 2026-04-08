# LEIAME — Documentos de Validacao Sprints 1 e 2

**Sistema:** Facilitia.ia — Sistema de Gestao de Editais com IA
**URL de acesso:** http://pasteurjr.servehttp.com:5179
**Data:** 08/04/2026

---

## O que sao estes documentos

Cada sprint possui 3 documentos que formam um ciclo completo de validacao:

1. **Casos de Uso** — Especificacao do que o sistema deve fazer (requisitos, telas, campos, eventos, respostas esperadas)
2. **Tutorial de Validacao** — Roteiro passo a passo para um testador humano executar todos os casos de uso no sistema real. Todos os dados necessarios (campos, valores, verificacoes) estao embutidos no proprio tutorial — nao e necessario consultar nenhum documento adicional.
3. **Relatorio de Validacao** — Resultado da execucao automatizada (Playwright) com screenshots de cada acao e resposta do sistema, analise de conformidade e verificacao de banco de dados.

```
CASOS DE USO (o que deve fazer) → TUTORIAL (como testar) → RELATORIO (o que aconteceu)
```

---

## Sprint 1 — Empresa, Portfolio e Parametrizacoes

A Sprint 1 cobre o cadastro inicial: dados da empresa, produtos do portfolio, e todas as parametrizacoes do sistema (areas, classes, subclasses, fontes de busca, certidoes, palavras-chave, NCMs, pesos e limiares GO/NO-GO).

| # | Documento | O que contem |
|---|-----------|-------------|
| 1 | **CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V2.md** | 58 casos de uso (UC-001 a UC-058). Cada UC descreve: pagina, pre-condicoes, layout da tela com campos e botoes, sequencia de eventos do ator, respostas esperadas do sistema, e assertions para verificacao. |
| 2 | **tutorialsprint1-2.md** | Tutorial de validacao manual para a empresa **RP3X Comercio e Representacoes Ltda.** Roteiro completo e autonomo com todos os dados a inserir em cada tela: CNPJ, razao social, endereco, produtos (Kit Hemograma Sysmex XN, Kit Glicose Wiener BioGlic-100), areas, classes, subclasses, fontes, certidoes, NCMs, pesos GO/NO-GO. Cada passo indica o que clicar, o que preencher e o que verificar. |
| 3 | **RELATORIO_VALIDACAO_SPRINT1_TUTORIAL1.md** | Relatorio da validacao automatizada (Playwright) executada com a empresa **CH Hospitalar**. 322 testes executados, screenshots de cada acao do ator e resposta do sistema, analise de conformidade com os casos de uso. Resultado: 322/322 aprovados. |

---

## Sprint 2 — Captacao e Validacao de Editais

A Sprint 2 cobre a busca de editais publicos (PNCP, BEC-SP), analise por IA com scores multidimensionais (6 dimensoes), decisoes GO/NO-GO com justificativa, monitoramento automatico, confrontacao documental, analise de riscos/mercado/concorrentes, e IA interativa (resumo, perguntas, requisitos tecnicos).

| # | Documento | O que contem |
|---|-----------|-------------|
| 1 | **CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V2.md** | 13 casos de uso (UC-CV01 a UC-CV13). Cada UC descreve as telas de Captacao e Validacao com seus campos, selects, botoes, tabelas de resultados, painel lateral, abas de analise (Aderencia, Lotes, Documentos, Riscos, Mercado, IA), e as respostas esperadas do sistema incluindo chamadas de API. |
| 2 | **tutorialsprint2-2.md** | Tutorial de validacao manual para a empresa **RP3X Comercio e Representacoes Ltda.** Roteiro completo e autonomo com 13 UCs: buscar editais com 4 modos de score, explorar painel lateral, salvar editais, definir estrategias, exportar CSV, criar monitoramentos, calcular scores IA, decidir GO/NO-GO, importar itens PNCP, confrontar documentacao, analisar riscos/atas/concorrentes/mercado, usar IA para resumos e perguntas. Todos os termos de busca, valores e verificacoes estao no proprio documento. |
| 3 | **RESULTADO VALIDACAO SPRINT2.md** | Relatorio da validacao automatizada (Playwright) executada com a empresa **CH Hospitalar**. 18 testes com assertions reais (nao smoke tests), 48 screenshots diferenciadas (acao do ator vs resposta do sistema), verificacao de banco MySQL (28 editais, 3 estrategias, 2 monitoramentos, 21 validacoes legais, 1 decisao GO, 6 lotes). Mapeamento de cada teste para os passos do documento de casos de uso. Resultado: 18/18 aprovados. |

---

## Como usar para validacao manual

1. Acessar http://pasteurjr.servehttp.com:5179
2. Login: **valida2@valida.com.br** / senha: **123456**
3. Na tela de selecao de empresa, escolher **RP3X Comercio e Representacoes Ltda.**
4. Seguir o tutorial da sprint desejada:
   - Sprint 1: `tutorialsprint1-2.md`
   - Sprint 2: `tutorialsprint2-2.md`
5. Todos os dados a inserir (campos, valores, verificacoes) estao no proprio tutorial — basta segui-lo passo a passo

### Observacoes

- A Sprint 1 deve ser executada antes da Sprint 2 (os dados de empresa e portfolio sao pre-requisito para captacao e validacao)
- O tutorial da Sprint 1 inclui cadastro de empresa, produtos, areas, classes, subclasses, fontes, certidoes, NCMs e parametrizacoes — execute todos os passos na ordem
- O tutorial da Sprint 2 inclui buscas que dependem de APIs externas (PNCP, BEC-SP) — os editais retornados podem variar conforme a data de execucao
- Scores de IA podem levar de 30 segundos (rapido) a 5 minutos (profundo) para processar

---

*Facilitia.ia — Sistema de Gestao de Editais com IA*
