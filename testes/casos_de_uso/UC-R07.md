---
uc_id: UC-R07
nome: "Gerenciar Status e Submissao"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 2042
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-R07 — Gerenciar Status e Submissao

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 2042).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-041 (Submissao geral)

**Regras de Negocio aplicaveis:**
- Presentes: RN-109, RN-114
- Faltantes: RN-128 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-109, RN-114, RN-128 [FALTANTE->V4] — adicionalmente: RN-031 (bloquear submissao se empresa tem certidao vencida — dual flag `ENFORCE_CERTIDAO_GATE` + `ENFORCE_RN_VALIDATORS`), RN-082 (transicao de estado Edital: proposta_enviada->em_pregao->vencedor/perdedor), RN-037 (audit log universal de submissao) — modo warn-only por padrao (`ENFORCE_RN_VALIDATORS=false`).

**Ator:** Usuario

### Pre-condicoes
1. Proposta criada (qualquer status)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-R01 OU UC-R02**


### Pos-condicoes
1. Proposta progrediu no fluxo de status (rascunho -> revisao -> aprovada -> enviada)

### Fluxo de Status
```
rascunho -> revisao -> aprovada -> enviada
```

### Sequencia de eventos

#### Parte A — PropostaPage (Gestao de Status)
1. Usuario seleciona proposta na [Tabela: "Minhas Propostas"]. [ref: Passo 1]
2. O [Card: "Proposta Selecionada"] exibe dados do edital, orgao, produto, preco e valor total. [ref: Passo 2]
3. O [Secao: "Conteudo da Proposta (Markdown)"] exibe editor com [Secao: "Toolbar Markdown"] (Bold, Italic, H1, H2, List, Table). [ref: Passo 3]
4. Usuario edita conteudo e clica no [Botao: "Salvar Conteudo"] quando ha alteracoes nao salvas. [ref: Passo 4]
5. Usuario clica no [Botao: "Salvar Rascunho"], [Botao: "Enviar para Revisao"] ou [Botao: "Aprovar"] para mudar status. [ref: Passo 5]

#### Parte B — SubmissaoPage (Checklist e Envio)
6. Usuario acessa a SubmissaoPage e visualiza [Tabela: DataTable "Propostas Prontas para Envio"]. [ref: Passo 6]
7. Usuario seleciona uma proposta — sistema exibe [Card: "Checklist de Submissao"]. [ref: Passo 7]
8. O checklist mostra 4 itens readonly: Proposta tecnica gerada, Preco definido, Documentos anexados (N/M) e Revisao final. [ref: Passo 8]
9. Usuario pode clicar no [Botao: "Anexar Documento"] para abrir [Modal: "Anexar Documento"]. [ref: Passo 9]
10. No modal, usuario seleciona [Select: "Tipo de Documento"], [Campo: "Arquivo (.pdf, .doc, .docx)"] e opcionalmente [Campo: "Observacao"]. [ref: Passo 10]
11. Usuario clica no [Botao: "Enviar"] no modal para salvar documento. [ref: Passo 11]
12. Usuario clica no [Botao: "Marcar como Enviada"] para mudar status para "enviada". [ref: Passo 12]
13. Usuario clica no [Botao: "Aprovar"] para mudar status para "aprovada". [ref: Passo 13]
14. Usuario clica no [Botao: "Abrir Portal PNCP"] para abrir portal externo. [ref: Passo 14]

### Fluxos Alternativos (V5)

**FA-01 — Retrocesso de status permitido (Aprovada -> Em Revisao):**
1. Proposta com status "Aprovada" pode ser devolvida para "Em Revisao".
2. Usuario clica em "Devolver para Revisao".
3. Badge muda de verde para amarelo.
4. Apos correcao, usuario re-aprova a proposta.

**FA-02 — Edicao do conteudo Markdown com toolbar:**
1. No passo 3, usuario usa toolbar (Bold, H1, List, Table) para formatar o conteudo.
2. Indicador "Alteracoes nao salvas" aparece em laranja.
3. Ao clicar "Salvar Conteudo", o indicador desaparece.

**FA-03 — Preenchimento de dados de submissao (protocolo):**
1. No passo 12, usuario preenche dados de envio: protocolo, data, hora, canal, responsavel, observacoes.
2. Dados sao salvos junto com a transicao de status.

**FA-04 — Abertura do portal PNCP:**
1. No passo 14, o portal PNCP abre em nova aba do navegador.
2. Usuario realiza o envio real no portal externo.

### Fluxos de Excecao (V5)

**FE-01 — Tentativa de retroceder de "Enviada" (bloqueado):**
1. Proposta com status "Enviada" nao pode retroceder para status anterior.
2. Botoes de retrocesso ficam desabilitados.
3. Se tentado via API, sistema retorna erro de validacao.

**FE-02 — Proposta enviada nao permite edicao:**
1. Apos status "Enviada", o editor Markdown fica readonly.
2. Botoes de acao (exceto visualizacao) ficam desabilitados.

**FE-03 — Checklist incompleto ao tentar enviar:**
1. No passo 12, se o checklist nao esta 100% completo (ex: documentos faltantes).
2. Sistema exibe warning: "Checklist incompleto. Deseja enviar mesmo assim?"
3. Usuario pode confirmar ou cancelar.

**FE-04 — Certidao vencida bloqueia submissao (RN-031):**
1. Se `ENFORCE_RN_VALIDATORS=true` e `ENFORCE_CERTIDAO_GATE=true`, e a empresa tem certidao vencida.
2. Sistema bloqueia "Marcar como Enviada": "Empresa com certidao vencida."

**FE-05 — Falha ao anexar documento (arquivo invalido):**
1. No passo 10, o arquivo selecionado nao e .pdf, .doc ou .docx.
2. Sistema exibe toast: "Formato de arquivo nao suportado."

### Tela(s) Representativa(s)

**Pagina:** PropostaPage (`/app/proposta`) + SubmissaoPage (`/app/submissao`)

#### Layout da Tela — PropostaPage (Parte A)

[Card: "Proposta Selecionada"] [ref: Passo 2]
  [Badge: "Status"] — cor dinamica (Rascunho/Em Revisao/Aprovada/Enviada)
  [Secao: "Acoes de Status"]
    [Botao: "Salvar Rascunho"] icon FileEdit [ref: Passo 5]
    [Botao: "Enviar para Revisao"] icon Send [ref: Passo 5]
    [Botao: "Aprovar"] icon CheckCircle — habilitado somente se status = "revisao" [ref: Passo 5]
  [Secao: "Dados da Proposta"]
    [Texto: "Edital"] / [Texto: "Orgao"] / [Texto: "Produto"]
    [Texto: "Preco Unitario"] / [Texto: "Quantidade"] / [Texto: "Valor Total"]
  [Secao: "Descricao Tecnica"] — ver UC-R03
  [Secao: "Conteudo da Proposta (Markdown)"] [ref: Passo 3]
    [Indicador: "Alteracoes nao salvas"] — laranja, condicional
    [Secao: "Toolbar Markdown"] [ref: Passo 3]
      [Icone-Acao: Bold]
      [Icone-Acao: Italic]
      [Icone-Acao: Heading1]
      [Icone-Acao: Heading2]
      [Icone-Acao: List]
      [Icone-Acao: Table]
    [Campo: TextArea "Editor Markdown"] — monospace, min-height 300px [ref: Passo 4]
    [Botao: "Salvar Conteudo"] icon CheckCircle — visivel se dirty [ref: Passo 4]

#### Layout da Tela — SubmissaoPage (Parte B)

[Cabecalho: "Submissao de Propostas"] icon Send
  [Texto: "Preparacao e envio de propostas aos portais"]

[Card: "Propostas Prontas para Envio"] icon Send [ref: Passo 6]
  [Tabela: DataTable "Propostas Prontas"]
    [Coluna: "Edital"] — sortable
    [Coluna: "Orgao"]
    [Coluna: "Produto"]
    [Coluna: "Valor"] — moeda formatada
    [Coluna: "Abertura"] — data + hora, sortable
    [Coluna: "Status"] — badge (Aguardando/Enviada/Aprovada)
    [Coluna: "Checklist"] — badge progresso "N/M"

[Card: "Checklist de Submissao: {Edital}"] icon CheckSquare — visivel com proposta selecionada [ref: Passo 7]
  [Secao: "Info do Edital"]
    [Texto: "Orgao"] / [Texto: "Produto"] / [Texto: "Valor"] / [Texto: "Abertura"]
  [Secao: "Checklist"] [ref: Passo 8]
    [Checkbox: "Proposta tecnica gerada"] — readonly
    [Checkbox: "Preco definido"] — readonly
    [Checkbox: "Documentos anexados (N/M)"] — readonly
    [Checkbox: "Revisao final"] — readonly
  [Secao: "Acoes"] [ref: Passo 9, 12, 13, 14]
    [Botao: "Anexar Documento"] icon Upload [ref: Passo 9]
    [Botao: "Marcar como Enviada"] icon Send [ref: Passo 12]
    [Botao: "Aprovar"] icon CheckCircle [ref: Passo 13]
    [Botao: "Abrir Portal PNCP"] icon ExternalLink [ref: Passo 14]

[Modal: "Anexar Documento"] [ref: Passo 9, 10, 11]
  [Select: "Tipo de Documento"] — Proposta Tecnica / Certidao / Contrato Social / Procuracao / Outro [ref: Passo 10]
  [Campo: "Arquivo (.pdf, .doc, .docx)"] — file input [ref: Passo 10]
  [Campo: "Observacao"] — text, placeholder "Observacao opcional..." [ref: Passo 10]
  [Botao: "Enviar"] [ref: Passo 11]
  [Botao: "Cancelar"]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Tabela: "Minhas Propostas"] (PropostaPage) | 1 |
| [Card: "Proposta Selecionada"] — dados | 2 |
| [Secao: "Toolbar Markdown"] + [Campo: TextArea] | 3 |
| [Botao: "Salvar Conteudo"] | 4 |
| [Botao: "Salvar Rascunho/Enviar para Revisao/Aprovar"] | 5 |
| [Tabela: "Propostas Prontas"] (SubmissaoPage) | 6 |
| [Card: "Checklist de Submissao"] | 7 |
| 4 [Checkbox] readonly | 8 |
| [Botao: "Anexar Documento"] / [Modal: "Anexar Documento"] | 9, 10, 11 |
| [Botao: "Marcar como Enviada"] | 12 |
| [Botao: "Aprovar"] (SubmissaoPage) | 13 |
| [Botao: "Abrir Portal PNCP"] | 14 |

### Implementacao atual
**IMPLEMENTADO**

---

---

# RESUMO DE IMPLEMENTACAO

| Caso de Uso | Fase | Status | Detalhe |
|-------------|------|--------|---------|
| UC-P01 | PRECIFICACAO | IMPLEMENTADO | Lotes por especialidade, itens PNCP, nome curto extraido, ignorar/reativar |
| UC-P02 | PRECIFICACAO | IMPLEMENTADO | Vincular manual + IA auto-link + Buscar Web + ANVISA (com modais) |
| UC-P03 | PRECIFICACAO | IMPLEMENTADO | Deteccao automatica, rendimento das especificacoes, pergunta ao usuario |
| UC-P04 | PRECIFICACAO | IMPLEMENTADO | Custo manual, NCM automatico, ICMS isencao, tributos editaveis |
| UC-P05 | PRECIFICACAO | IMPLEMENTADO | Manual, Custo+Markup, Upload CSV, flag reutilizar |
| UC-P06 | PRECIFICACAO | IMPLEMENTADO | Auto-importacao edital + % sobre base + IA sugere |
| UC-P07 | PRECIFICACAO | IMPLEMENTADO | Absoluto/percentual, barra visual |
| UC-P08 | PRECIFICACAO | IMPLEMENTADO | Perfis + simulacao IA + disputa |
| UC-P09 | PRECIFICACAO | IMPLEMENTADO | Busca + stats + CSV export |
| UC-P10 | PRECIFICACAO | IMPLEMENTADO | CRUD + amortizacao + impacto no preco |
| UC-P11 | PRECIFICACAO | IMPLEMENTADO | Pipeline IA: historico + atas PNCP + justificativa + pre-preenche A-E |
| UC-P12 | PRECIFICACAO | IMPLEMENTADO | Relatorio MD com 9 secoes + download MD/PDF |
| UC-R01 | PROPOSTA | IMPLEMENTADO | Motor completo com lotes, camadas, templates, editor rico |
| UC-R02 | PROPOSTA | IMPLEMENTADO | Upload de proposta externa (.docx/.pdf) com extracao de texto |
| UC-R03 | PROPOSTA | IMPLEMENTADO | Descricao Tecnica A/B com toggle e backup do original |
| UC-R04 | PROPOSTA | IMPLEMENTADO | Semaforo ANVISA com bloqueio por validade |
| UC-R05 | PROPOSTA | IMPLEMENTADO | Auditoria documental completa com Smart Split |
| UC-R06 | PROPOSTA | IMPLEMENTADO | Export PDF/DOCX + dossie ZIP completo |
| UC-R07 | PROPOSTA | IMPLEMENTADO | Submissao com checklist dinamico e fluxo de status |

**Totais:** 19 implementados = **19/19 casos de uso (100%)**

---

*Documento gerado em 21/04/2026. Versao V5 com Fluxos Alternativos (FA) e Fluxos de Excecao (FE) para cada UC. Cada caso de uso foi verificado contra o codebase atual (PrecificacaoPage.tsx, PropostaPage.tsx, SubmissaoPage.tsx).*
