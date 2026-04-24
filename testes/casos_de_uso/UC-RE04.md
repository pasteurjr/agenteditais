---
uc_id: UC-RE04
nome: "Gerar Laudo de Recurso"
sprint: "Sprint 4 (Recursos e Impugnações)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO RECURSOS E IMPUGNACOES V5.md"
linha_inicio_no_doc: 1144
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-RE04 — Gerar Laudo de Recurso

> Caso de uso extraído automaticamente de `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md` (linha 1144).
> Sprint origem: **Sprint 4 (Recursos e Impugnações)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-044-04

**Regras de Negocio aplicaveis:**
- Presentes: RN-144, RN-146, RN-147, RN-149, RN-153
- Faltantes: RN-155 [FALTANTE], RN-157 [FALTANTE], RN-159 [FALTANTE], RN-162 [FALTANTE], RN-163 [FALTANTE], RN-164 [FALTANTE], RN-212 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-144, RN-146, RN-147, RN-149, RN-153, RN-155 [FALTANTE->V4], RN-157 [FALTANTE->V4], RN-159 [FALTANTE->V4], RN-162 [FALTANTE->V4], RN-163 [FALTANTE->V4], RN-164 [FALTANTE->V4], RN-212 [FALTANTE->V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Analise da proposta vencedora concluida (UC-RE02)
2. Intencao de recurso manifestada dentro do prazo (UC-RE01)
3. Inconsistencias identificadas e classificadas
4. Base de legislacao e jurisprudencias disponivel
5. Template de laudo selecionado (padrao ou customizado)

### Pos-condicoes
1. Laudo de recurso gerado com secoes juridica e tecnica obrigatorias
2. Laudo em status "rascunho", 100% editavel
3. LOG de criacao e edicoes registrado
4. Documento pronto para exportacao e submissao

### Sequencia de Eventos

1. Usuario acessa RecursosPage e clica na [Aba: "Laudos"] (icone FileText, com badge de quantidade)
2. Clica [Botao: "Novo Laudo"] (icone Plus, variant primary) — Modal "Novo Laudo" abre
3. Preenche [Select: "Edital"] (obrigatorio), [Select: "Tipo"] = "Recurso" (obrigatorio)
4. Preenche [Select: "Subtipo"] = "Administrativo" ou "Tecnico" (obrigatorio)
5. Seleciona [Select: "Template"] e opcionalmente preenche [TextInput: "Empresa Alvo"]
6. Opcionalmente adiciona [TextArea: "Conteudo Inicial"] (rows 8)
7. Clica [Botao: "Criar"] (variant primary) — laudo criado com status "Rascunho"
8. Laudo aparece na [Tabela: Laudos]; usuario clica [Icone-Acao: Eye] para abrir editor
9. [Card: "Editando: {edital_numero} - {tipo} ({subtipo})"] (icone Edit3) exibe editor
10. [TextArea] do editor exibe o texto do laudo (rows 20) — 100% editavel
11. Usuario edita laudo incluindo obrigatoriamente secoes JURIDICA e TECNICA (hint visivel na tela)
12. Clica [Botao: "Salvar Rascunho"] (icone Save) para salvar sem mudar status
13. Clica [Botao: "Enviar para Revisao"] (icone Send) para mudar status
14. Clica [Botao: "Submeter no Portal"] (icone ExternalLink) para prosseguir para UC-RE06
15. Opcionalmente exporta: [Botao: "PDF"] ou [Botao: "DOCX"] (icone Download)

### Fluxos Alternativos (V5)

**FA-01 — Criar laudo sem empresa alvo (recurso contra o edital)**
1. No modal, usuario deixa [TextInput: "Empresa Alvo"] em branco (Passo 5)
2. Sistema aceita — laudo e criado sem empresa alvo
3. Coluna "Empresa Alvo" na tabela exibe "-" ou vazio
4. Cenario tipico de recurso administrativo contra clausula do edital

**FA-02 — Criar laudo com template pre-definido**
1. Usuario seleciona template especifico em [Select: "Template"] (Passo 5)
2. Template preenche automaticamente o [TextArea: "Conteudo Inicial"]
3. Usuario pode editar o conteudo pre-preenchido antes de clicar "Criar"
4. Laudo criado com conteudo do template

**FA-03 — Editar laudo e salvar multiplas vezes antes de enviar para revisao**
1. Usuario abre editor (Passo 8)
2. Edita secao juridica — clica "Salvar Rascunho"
3. Edita secao tecnica — clica "Salvar Rascunho" novamente
4. Cada salvamento e registrado no LOG
5. So envia para revisao apos completar ambas as secoes

### Fluxos de Excecao (V5)

**FE-01 — Campos obrigatorios nao preenchidos no modal**
1. Usuario deixa [Select: "Edital"], [Select: "Tipo"] ou [Select: "Subtipo"] sem selecao
2. Clica [Botao: "Criar"]
3. Validacao: mensagem indicando campo obrigatorio faltante
4. Modal nao fecha

**FE-02 — Laudo sem secoes obrigatorias ao submeter no portal**
1. Usuario edita laudo mas nao inclui "## SECAO JURIDICA" ou "## SECAO TECNICA"
2. Clica [Botao: "Submeter no Portal"]
3. Validacao pre-envio (UC-RE06) detecta secoes ausentes
4. Checkbox "Secao juridica presente" ou "Secao tecnica presente" aparece desmarcado
5. Mensagem: "Ha validacoes pendentes. Corrija antes de submeter."

**FE-03 — Erro ao salvar rascunho**
1. Usuario clica [Botao: "Salvar Rascunho"]
2. Requisicao ao backend falha
3. Mensagem: "Erro ao salvar rascunho. Tente novamente."
4. Conteudo do editor e preservado na tela

**FE-04 — Excluir laudo acidentalmente**
1. Usuario clica [Icone-Acao: Trash2] na tabela de laudos
2. Confirmacao: "Deseja excluir este laudo? Esta acao nao pode ser desfeita."
3. Se confirmar: laudo excluido permanentemente
4. Se cancelar: nenhuma acao

### Tela(s) Representativa(s)

**Pagina:** RecursosPage (`/app/recursos`)
**Posicao:** Aba "Laudos" (3a aba) — lista e editor de laudos

#### Layout da Tela

```
[Aba: "Monitoramento"] [Aba: "Analise"] [Aba: "Laudos" (badge: N)]

[Card: "Laudos de Recurso e Contra-Razao"] (icone FileText)
  [Botao: "Novo Laudo"] (icone Plus, variant primary) [ref: Passo 2]
  [Botao: "Upload Laudo"] (icone Upload) [ref: UC-RE05]

  [Tabela: Laudos] [ref: Passo 8]
    [Coluna: "Edital"] — sortable
    [Coluna: "Tipo"] — "Recurso" ou "Contra-Razao"
    [Coluna: "Subtipo"] — "Tecnico" ou "Administrativo"
    [Coluna: "Empresa Alvo"]
    [Coluna: "Status"] — render com badge e icone
      [Badge: "Rascunho"] (neutral, icone Edit3)
      [Badge: "Revisao"] (warning, icone Eye)
      [Badge: "Protocolado"] (info, icone Send)
      [Badge: "Deferido"] (success, icone CheckCircle)
      [Badge: "Indeferido"] (error, icone XCircle)
    [Coluna: "Data"] — sortable
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — abrir editor [ref: Passo 8]
      [Icone-Acao: Trash2] — excluir laudo (danger)

[Card: "Editando: {edital_numero} - {tipo} ({subtipo})"] (icone Edit3) [ref: Passo 9]
  [Alerta: "Secoes obrigatorias: ## SECAO JURIDICA, ## SECAO TECNICA"] [ref: Passo 11]
  [TextArea] — editor, rows 20, 100% editavel [ref: Passos 10, 11]
  [Botao: "Salvar Rascunho"] (icone Save) [ref: Passo 12]
  [Botao: "Enviar para Revisao"] (icone Send, variant primary) [ref: Passo 13]
  [Botao: "Submeter no Portal"] (icone ExternalLink, variant primary) [ref: Passo 14]
  [Botao: "PDF"] (icone Download) [ref: Passo 15]
  [Botao: "DOCX"] (icone Download) [ref: Passo 15]

[Modal: "Novo Laudo"] (disparado por [Botao: "Novo Laudo"]) [ref: Passos 3-7]
  [Select: "Edital"] — obrigatorio [ref: Passo 3]
  [Select: "Tipo"] — "Recurso" ou "Contra-Razao" [ref: Passo 3]
  [Select: "Subtipo"] — "Administrativo" ou "Tecnico" [ref: Passo 4]
  [Select: "Template"] — opcao padrao: "Nenhum (em branco)" [ref: Passo 5]
  [TextInput: "Empresa Alvo"] — opcional [ref: Passo 5]
  [TextArea: "Conteudo Inicial"] — rows 8, opcional [ref: Passo 6]
  [Botao: "Cancelar"]
  [Botao: "Criar"] (variant primary) [ref: Passo 7]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Laudos"] | 1 |
| [Botao: "Novo Laudo"] | 2 |
| [Modal: "Novo Laudo"] | 3, 4, 5, 6, 7 |
| [Select: "Edital"] no modal | 3 |
| [Select: "Tipo"] = "Recurso" | 3 |
| [Select: "Subtipo"] | 4 |
| [Select: "Template"] | 5 |
| [TextInput: "Empresa Alvo"] | 5 |
| [TextArea: "Conteudo Inicial"] | 6 |
| [Botao: "Criar"] | 7 |
| [Tabela: Laudos] | 8 |
| [Icone-Acao: Eye] | 8 |
| [Card: "Editando: ..."] | 9 |
| [TextArea] editor | 10, 11 |
| [Alerta: secoes obrigatorias] | 11 |
| [Botao: "Salvar Rascunho"] | 12 |
| [Botao: "Enviar para Revisao"] | 13 |
| [Botao: "Submeter no Portal"] | 14 |
| [Botao: "PDF"] / [Botao: "DOCX"] | 15 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---
