---
uc_id: UC-FU01
nome: "Registrar Resultado (Vitoria/Derrota)"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 109
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-FU01 — Registrar Resultado (Vitoria/Derrota)

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 109).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-084 (cooldown 60s DeepSeek no followup IA), RN-132 (audit de invocacoes DeepSeek), RN-037 (audit log)

**RF relacionado:** RF-017, RF-046
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Ao menos um edital possui status "submetido" no banco de dados
3. Proposta foi enviada para o orgao contratante (submissao registrada)

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario


### Pos-condicoes
1. Resultado registrado no banco com tipo (vitoria/derrota/cancelado)
2. Edital atualizado com status final correspondente
3. Concorrente vencedor registrado (derrota) e motivo catalogado
4. Contrato automaticamente sugerido para criacao (vitoria)

### Sequencia de Eventos

1. Usuario acessa FollowupPage (`/app/followup`) via menu lateral "Follow-up"
2. [Cabecalho: "Follow-up de Resultados"] exibe a pagina principal
3. [Secao: Stat Cards] mostra 4 metricas: Pendentes (azul), Vitorias (verde), Derrotas (vermelho), Taxa de Sucesso (amarelo)
4. Na [Aba: "Resultados"], [Card: "Editais Pendentes de Resultado"] lista editais aguardando registro
5. [Tabela: Editais Pendentes] exibe: Edital, Orgao, Data Submissao, Valor Proposta, Acao
6. Usuario clica [Botao: "Registrar"] na coluna Acao do edital desejado
7. [Modal: "Registrar Resultado — {numero}"] abre
8. Usuario seleciona tipo via [Radio: "Vitoria"], [Radio: "Derrota"] ou [Radio: "Cancelado"]
9. **Se Vitoria:** preenche [TextInput: "Valor Final (R$)"]
10. **Se Derrota:** preenche [TextInput: "Valor Final (R$)"], [TextInput: "Empresa Vencedora"], [Select: "Motivo da Derrota"]
11. **Se Cancelado:** preenche [TextArea: "Justificativa do Cancelamento"]
12. Opcionalmente preenche [TextArea: "Observacoes"]
13. Clica [Botao: "Registrar"] (variant primary) no rodape do modal
14. Modal fecha; edital move da tabela Pendentes para [Card: "Resultados Registrados"]
15. [Stat Cards] recalculam: Vitorias, Derrotas, Taxa de Sucesso atualizados

### Fluxos Alternativos (V5)

- **FA-01 — Registro de resultado "Cancelado" pelo orgao:** No passo 8, usuario seleciona "Cancelado". No passo 11, preenche justificativa descrevendo o motivo do cancelamento (ex: edicao revogada pelo orgao). Edital vai para Resultados Registrados com badge "Cancelado" (cinza). Stat Cards nao contabilizam como vitoria nem derrota.
- **FA-02 — Edital sem valor final conhecido (vitoria provisoria):** No passo 9, usuario deixa campo "Valor Final" em branco ou informa R$ 0,00. Sistema aceita registro como provisorio. Stat Card "Vitorias" incrementa, mas valor nao afeta somatorio financeiro ate edicao posterior.
- **FA-03 — Alteracao de resultado ja registrado:** Usuario localiza edital na tabela "Resultados Registrados" e clica [Botao: "Editar"]. Modal reabre com dados pre-preenchidos. Usuario altera tipo (ex: de derrota para vitoria apos recurso). Ao salvar, Stat Cards recalculam.

### Fluxos de Excecao (V5)

- **FE-01 — Nenhum edital pendente de resultado:** No passo 4, tabela "Editais Pendentes" esta vazia. Sistema exibe mensagem "Nenhum edital pendente de resultado". Nenhum botao "Registrar" disponivel.
- **FE-02 — Campos obrigatorios nao preenchidos:** No passo 13, usuario clica "Registrar" sem preencher campos obrigatorios (ex: valor final em vitoria, empresa vencedora em derrota). Sistema exibe mensagem de validacao inline e nao fecha o modal.
- **FE-03 — Erro de comunicacao com backend:** Apos clicar "Registrar", requisicao POST falha (timeout ou erro 500). Sistema exibe toast de erro "Falha ao registrar resultado. Tente novamente." Modal permanece aberto com dados preservados.
- **FE-04 — Cooldown DeepSeek ativo (RN-084):** Se followup com IA e invocado em menos de 60s apos chamada anterior, backend retorna aviso de cooldown. Sistema exibe alerta "Aguarde {N}s para nova analise IA".

### Tela(s) Representativa(s)

**Pagina:** FollowupPage (`/app/followup`)
**Posicao:** Aba "Resultados" + Modal

#### Layout da Tela

```
[Cabecalho: "Follow-up de Resultados"]

[Secao: Stat Cards — grid 4 colunas] [ref: Passos 3, 15]
  [Card: "Pendentes"] (icone Clock, cor: #3b82f6)
  [Card: "Vitorias"] (icone Trophy, cor: #16a34a)
  [Card: "Derrotas"] (icone XCircle, cor: #dc2626)
  [Card: "Taxa de Sucesso"] (icone Ban, cor: #eab308)

[Aba: "Resultados"] [Aba: "Alertas"]

[Card: "Editais Pendentes de Resultado"] [ref: Passo 4]
  [Tabela: Editais Pendentes] [ref: Passo 5]
    [Coluna: "Edital"]
    [Coluna: "Orgao"]
    [Coluna: "Data Submissao"] — toLocaleDateString
    [Coluna: "Valor Proposta"] — formatado R$
    [Coluna: "Acao"]
      [Botao: "Registrar"] — abre modal [ref: Passo 6]

[Card: "Resultados Registrados"] [ref: Passo 14]
  [Tabela: Resultados]
    [Coluna: "Edital"]
    [Coluna: "Orgao"]
    [Coluna: "Resultado"] — badge colorido [ref: Passo 14]
      [Badge: "Vitoria"] (background: #16a34a)
      [Badge: "Derrota"] (background: #dc2626)
      [Badge: "Cancelado"] (background: #6b7280)
    [Coluna: "Valor Final"] — formatado R$
    [Coluna: "Data"] — toLocaleDateString

[Modal: "Registrar Resultado — {numero}"] [ref: Passos 7-13]
  [Radio: "Vitoria"] [ref: Passo 8]
  [Radio: "Derrota"] [ref: Passo 8]
  [Radio: "Cancelado"] [ref: Passo 8]
  [TextInput: "Valor Final (R$)"] — condicional: tipo != "cancelado" [ref: Passos 9, 10]
  [TextInput: "Empresa Vencedora"] — condicional: tipo == "derrota" [ref: Passo 10]
  [Select: "Motivo da Derrota"] — condicional: tipo == "derrota" [ref: Passo 10]
    opcoes: "Preco", "Tecnico", "Documental", "Recurso", "ME/EPP", "Outro"
  [TextArea: "Justificativa do Cancelamento"] — condicional: tipo == "cancelado" [ref: Passo 11]
  [TextArea: "Observacoes"] — sempre visivel, opcional [ref: Passo 12]
  [Botao: "Cancelar"] (variant secondary)
  [Botao: "Registrar"] (variant primary) [ref: Passo 13]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Stat Cards: Pendentes/Vitorias/Derrotas/Taxa] | 3, 15 |
| [Aba: "Resultados"] | 4 |
| [Card: "Editais Pendentes de Resultado"] | 4 |
| [Tabela: Editais Pendentes] | 5 |
| [Botao: "Registrar"] na tabela | 6 |
| [Modal: "Registrar Resultado"] | 7 |
| [Radio: "Vitoria"/"Derrota"/"Cancelado"] | 8 |
| [TextInput: "Valor Final"] | 9, 10 |
| [TextInput: "Empresa Vencedora"] | 10 |
| [Select: "Motivo da Derrota"] | 10 |
| [TextArea: "Justificativa do Cancelamento"] | 11 |
| [TextArea: "Observacoes"] | 12 |
| [Botao: "Registrar"] no modal | 13 |
| [Card: "Resultados Registrados"] | 14 |

### Implementacao Atual
**Implementado**

---
