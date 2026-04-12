# LEIAME — Documentos de Validacao Sprints 3 e 4

**Sistema:** Facilitia.ia — Sistema de Gestao de Editais com IA
**URL de acesso:** http://pasteurjr.servehttp.com:5179
**Data:** 09/04/2026

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

## Sprint 3 — Precificacao e Proposta

A Sprint 3 cobre o fluxo de precificacao (6 camadas: custos, preco base, referencia, lances, historico, pipeline IA), geracao de propostas tecnicas, auditoria ANVISA, checklist documental, exportacao de dossie e gerenciamento de submissao.

| # | Documento | O que contem |
|---|-----------|-------------|
| 1 | **CASOS DE USO PRECIFICACAO E PROPOSTA V2.md** | 19 casos de uso (UC-P01 a UC-P12, UC-R01 a UC-R07). Cada UC descreve: pagina, pre-condicoes, layout da tela com campos e botoes, sequencia de eventos do ator, respostas esperadas do sistema, e assertions para verificacao. |
| 2 | **tutorialsprint3-2.md** | Tutorial de validacao manual para a empresa **RP3X Comercio e Representacoes Ltda.** Roteiro completo e autonomo com todos os dados a inserir em cada tela: custos de reagentes (Kit Hemograma R$850, Kit Glicose R$22), markup 35%, frete R$180, lances, historico PNCP, proposta tecnica. Cada passo indica o que clicar, o que preencher e o que verificar. |
| 3 | **RESULTADO VALIDACAO SPRINT3.md** | Relatorio da validacao automatizada (Playwright) executada com a empresa **CH Hospitalar**. 13 testes executados, screenshots de cada acao do ator e resposta do sistema, analise de conformidade com os casos de uso. Resultado: 13/13 aprovados. |

---

## Sprint 4 — Recursos e Impugnacoes

A Sprint 4 cobre ferramentas juridicas: analise legal de editais (Lei 14.133/2021), geracao de peticoes de impugnacao via IA, controle de prazos com countdown, recursos e contra-razoes, chatbox juridico, submissao assistida, followup de resultados (ganho/perdido), alertas de vencimento e score logistico.

| # | Documento | O que contem |
|---|-----------|-------------|
| 1 | **CASOS DE USO RECURSOS E IMPUGNACOES V2.md** | 14 casos de uso em 3 fases: Impugnacao (UC-I01 a UC-I05), Recursos (UC-RE01 a UC-RE06), Followup (UC-FU01 a UC-FU03). Cada UC descreve as paginas ImpugnacaoPage, RecursosPage e FollowupPage com seus campos, abas, botoes e respostas esperadas. |
| 2 | **tutorialsprint4-2.md** | Tutorial de validacao manual para a empresa **RP3X Comercio e Representacoes Ltda.** Roteiro completo e autonomo com cenarios de reagentes: analise legal com artigos da Lei 14.133/2021, peticoes de impugnacao, prazos, recursos, contra-razoes, followup de resultados. |
| 3 | **RESULTADO VALIDACAO SPRINT4.md** | Relatorio da validacao automatizada (Playwright) executada com a empresa **CH Hospitalar**. 14 testes executados em 3 fases, screenshots de cada acao do ator e resposta do sistema. Resultado: 14/14 aprovados. |

---

## Como usar para validacao manual

1. Acessar http://pasteurjr.servehttp.com:5179
2. Login: **valida2@valida.com.br** / senha: **123456**
3. Na tela de selecao de empresa, escolher **RP3X Comercio e Representacoes Ltda.**
4. Seguir o tutorial da sprint desejada:
   - Sprint 3: `tutorialsprint3-2.md`
   - Sprint 4: `tutorialsprint4-2.md`
5. Todos os dados a inserir (campos, valores, verificacoes) estao no proprio tutorial — basta segui-lo passo a passo

### Observacoes

- As Sprints 3 e 4 dependem dos dados das Sprints 1 e 2 (empresa cadastrada, portfolio parametrizado, editais captados e validados). Caso ainda nao tenham sido executadas, consultar o **LEIAME.pdf** original que cobre as Sprints 1 a 4 completas.
- Sprint 3: precificacao e proposta (depende de editais salvos com scores)
- Sprint 4: recursos e impugnacoes (depende de propostas geradas)
- Geracao de peticoes juridicas via IA pode levar de 30 segundos a 2 minutos
- Calculos de precificacao sao imediatos; pipeline IA de precos pode levar ate 1 minuto
- Exportacao de dossie gera PDF com todos os documentos anexados

---

*Facilitia.ia — Sistema de Gestao de Editais com IA*
