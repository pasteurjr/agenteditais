---
uc_id: UC-FU01_S4_legacy
nome: "Registrar Resultado de Edital"
sprint: "Sprint 4 (Recursos e Impugnações)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO RECURSOS E IMPUGNACOES V5.md"
linha_inicio_no_doc: 1620
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-FU01_S4_legacy — Registrar Resultado de Edital

> Caso de uso extraído automaticamente de `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md` (linha 1620).
> Sprint origem: **Sprint 4 (Recursos e Impugnações)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-045-01
**Ator:** Usuario

### Pre-condicoes
1. Edital submetido (proposta enviada ao portal)
2. Resultado do certame publicado (vitoria, derrota ou cancelamento)
3. Usuario autenticado no sistema

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario


### Pos-condicoes
1. Resultado registrado no banco vinculado ao edital
2. Status do edital atualizado (Vitoria, Derrota ou Cancelado)
3. Metricas de taxa de sucesso atualizadas automaticamente
4. LOG de registro criado

### Sequencia de Eventos

1. Usuario acessa FollowupPage (`/app/followup`) via menu lateral "Follow-up"
2. Cabecalho exibe [Card: Stat] com 4 metricas: Pendentes, Vitorias, Derrotas, Taxa de Sucesso
3. Na [Aba: "Resultados"], [Card: "Editais Pendentes de Resultado"] exibe editais aguardando registro
4. [Tabela: Editais Pendentes] mostra: Edital, Orgao, Data Submissao, Valor Proposta, Acao
5. Usuario clica [Botao: "Registrar"] na coluna Acao do edital desejado
6. [Modal: "Registrar Resultado — {numero}"] abre
7. Usuario seleciona tipo via [Radio: "Vitoria"], [Radio: "Derrota"] ou [Radio: "Cancelado"]
8. **Se Vitoria:** preenche [TextInput: "Valor Final (R$)"]
9. **Se Derrota:** preenche [TextInput: "Valor Final (R$)"], [TextInput: "Empresa Vencedora"], [Select: "Motivo da Derrota"] (Preco/Tecnico/Documental/Recurso/ME-EPP/Outro)
10. **Se Cancelado:** preenche [TextArea: "Justificativa do Cancelamento"]
11. Opcionalmente preenche [TextArea: "Observacoes"]
12. Clica [Botao: "Registrar"] (variant primary) no rodape do modal
13. Modal fecha; edital sai da tabela de Pendentes e aparece em [Card: "Resultados Registrados"]
14. [Cards Stat] atualizam: Vitorias, Derrotas, Taxa de Sucesso recalculados

### Fluxos Alternativos (V5)

**FA-01 — Registrar cancelamento de edital**
1. Usuario seleciona [Radio: "Cancelado"] (Passo 7)
2. Campos "Valor Final", "Empresa Vencedora" e "Motivo da Derrota" ficam ocultos
3. [TextArea: "Justificativa do Cancelamento"] aparece (obrigatorio)
4. Usuario preenche justificativa (ex: "Edital revogado por vicio no termo de referencia")
5. Clica [Botao: "Registrar"]
6. Edital registrado como cancelado — nao contabiliza em vitorias nem derrotas

**FA-02 — Registrar derrota por motivo ME/EPP (Micro/Pequena Empresa)**
1. Usuario seleciona [Radio: "Derrota"]
2. Seleciona [Select: "Motivo da Derrota"] = "ME/EPP"
3. Preenche demais campos
4. Derrota registrada com motivo especifico — permite analise de perdas por criterio de ME/EPP

**FA-03 — Registrar vitoria com valor diferente da proposta original**
1. Usuario seleciona [Radio: "Vitoria"]
2. Preenche [TextInput: "Valor Final"] com valor diferente do proposto (ex: negociacao pos-adjudicacao)
3. Sistema aceita — valor final pode ser menor que a proposta original
4. Diferenca entre proposta e valor final e registrada automaticamente

### Fluxos de Excecao (V5)

**FE-01 — Nenhum edital pendente de resultado**
1. Usuario acessa [Aba: "Resultados"]
2. [Card: "Editais Pendentes de Resultado"] esta vazio
3. Mensagem: "Nenhum edital pendente de resultado."
4. Apenas a tabela de Resultados Registrados e exibida

**FE-02 — Tipo de resultado nao selecionado**
1. Usuario abre modal mas nao seleciona [Radio] de tipo (Vitoria/Derrota/Cancelado)
2. Clica [Botao: "Registrar"]
3. Validacao: "Selecione o tipo de resultado."
4. Modal nao fecha

**FE-03 — Valor final nao informado para Vitoria/Derrota**
1. Usuario seleciona "Vitoria" mas deixa [TextInput: "Valor Final"] vazio
2. Clica [Botao: "Registrar"]
3. Validacao: "Informe o valor final homologado."
4. Modal nao fecha

**FE-04 — Erro ao salvar resultado no banco**
1. Usuario preenche todos os campos e clica [Botao: "Registrar"]
2. Requisicao ao backend falha
3. Mensagem: "Erro ao registrar resultado. Tente novamente."
4. Modal permanece aberto com dados preservados

### Tela(s) Representativa(s)

**Pagina:** FollowupPage (`/app/followup`)
**Posicao:** Header com Stat Cards + Aba "Resultados"

#### Layout da Tela

```
[Cabecalho: "Follow-up de Resultados"]

[Secao: Stat Cards — grid 4 colunas] [ref: Passo 2]
  [Card: "Pendentes"] (icone Clock, cor: #3b82f6)
  [Card: "Vitorias"] (icone Trophy, cor: #16a34a)
  [Card: "Derrotas"] (icone XCircle, cor: #dc2626)
  [Card: "Taxa de Sucesso"] (icone Ban, cor: #eab308)

[Aba: "Resultados"] [Aba: "Alertas"]

[Card: "Editais Pendentes de Resultado"] [ref: Passo 3]
  [Tabela: Editais Pendentes] [ref: Passo 4]
    [Coluna: "Edital"]
    [Coluna: "Orgao"]
    [Coluna: "Data Submissao"] — toLocaleDateString
    [Coluna: "Valor Proposta"] — formatado R$
    [Coluna: "Acao"]
      [Botao: "Registrar"] — abre modal [ref: Passo 5]

[Card: "Resultados Registrados"] [ref: Passo 13]
  [Tabela: Resultados]
    [Coluna: "Edital"]
    [Coluna: "Orgao"]
    [Coluna: "Resultado"] — badge colorido
      [Badge: "Vitoria"] (background: #16a34a)
      [Badge: "Derrota"] (background: #dc2626)
      [Badge: "Cancelado"] (background: #6b7280)
    [Coluna: "Valor Final"] — formatado R$
    [Coluna: "Data"] — toLocaleDateString

[Modal: "Registrar Resultado — {numero}"] [ref: Passos 6-12]
  [Radio: "Vitoria"] [ref: Passo 7]
  [Radio: "Derrota"] [ref: Passo 7]
  [Radio: "Cancelado"] [ref: Passo 7]

  [TextInput: "Valor Final (R$)"] — condicional: visivel se tipo != "cancelado" [ref: Passos 8, 9]
  [TextInput: "Empresa Vencedora"] — condicional: visivel se tipo == "derrota" [ref: Passo 9]
  [Select: "Motivo da Derrota"] — condicional: visivel se tipo == "derrota" [ref: Passo 9]
    opcoes: "Preco", "Tecnico", "Documental", "Recurso", "ME/EPP", "Outro"
  [TextArea: "Justificativa do Cancelamento"] — condicional: visivel se tipo == "cancelado" [ref: Passo 10]
  [TextArea: "Observacoes"] — sempre visivel, opcional [ref: Passo 11]

  [Botao: "Cancelar"] (variant secondary)
  [Botao: "Registrar"] (variant primary) [ref: Passo 12]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Stat Cards: Pendentes/Vitorias/Derrotas/Taxa] | 2, 14 |
| [Aba: "Resultados"] | 3 |
| [Card: "Editais Pendentes de Resultado"] | 3 |
| [Tabela: Editais Pendentes] | 4 |
| [Botao: "Registrar"] na tabela | 5 |
| [Modal: "Registrar Resultado"] | 6 |
| [Radio: "Vitoria" / "Derrota" / "Cancelado"] | 7 |
| [TextInput: "Valor Final"] | 8, 9 |
| [TextInput: "Empresa Vencedora"] | 9 |
| [Select: "Motivo da Derrota"] | 9 |
| [TextArea: "Justificativa do Cancelamento"] | 10 |
| [TextArea: "Observacoes"] | 11 |
| [Botao: "Registrar"] no modal | 12 |
| [Card: "Resultados Registrados"] | 13 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---
