---
uc_id: UC-RE06
nome: "Submissao Assistida no Portal"
sprint: "Sprint 4 (Recursos e Impugnações)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO RECURSOS E IMPUGNACOES V5.md"
linha_inicio_no_doc: 1456
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-RE06 — Submissao Assistida no Portal

> Caso de uso extraído automaticamente de `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md` (linha 1456).
> Sprint origem: **Sprint 4 (Recursos e Impugnações)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-044-06

**Regras de Negocio aplicaveis:**
- Presentes: RN-150, RN-151
- Faltantes: RN-155 [FALTANTE], RN-156 [FALTANTE], RN-164 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-150, RN-151, RN-155 [FALTANTE->V4], RN-156 [FALTANTE->V4], RN-164 [FALTANTE->V4]

**Ator:** Usuario (submissao manual assistida pelo sistema)

### Pre-condicoes
1. Peticao (impugnacao, recurso ou contra-razao) gerada e aprovada
2. Documento dentro dos limites de tamanho do portal
3. Credenciais de acesso ao portal configuradas
4. Prazo de submissao nao expirado

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-I03 OU UC-RE04 OU UC-RE05**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


### Pos-condicoes
1. Peticao validada (formato, tamanho, secoes obrigatorias)
2. Documento exportado em PDF pronto para upload manual
3. Link direto para portal gov.br aberto
4. Status de submissao registrado no sistema (protocolo, data/hora)
5. LOG de submissao registrado

### Sequencia de Eventos

1. No editor de laudo (UC-RE04 ou UC-RE05), usuario clica [Botao: "Submeter no Portal"] (icone ExternalLink)
2. [Modal: "Submissao Assistida no Portal"] abre (size: large)
3. Modal exibe dados da peticao: Tipo (badge), Edital, Subtipo em modo readonly
4. [Secao: "Validacao Pre-Envio"] exibe checklist automatico com 6 validacoes:
   - Tamanho do arquivo dentro do limite
   - Formato aceito pelo portal
   - Prazo de submissao valido
   - Secao juridica presente
   - Secao tecnica presente
   - Assinatura/identificacao presente
5. Resultado da validacao: [Texto: "Todas as validacoes passaram"] ou [Texto: "Ha validacoes pendentes"]
6. [Passo 1] usuario clica [Botao: "Exportar PDF"] ou [Botao: "Exportar DOCX"] para baixar o documento
7. [Passo 2] usuario clica [Botao: "Abrir Portal ComprasNet"] (icone ExternalLink, variant primary) — abre nova aba com link para portal gov.br
8. Usuario faz upload MANUAL do PDF no portal gov.br
9. Apos submissao, usuario preenche [TextInput: "Protocolo de Submissao"] com protocolo recebido do portal
10. Clica [Botao: "Registrar Submissao"] (icone CheckCircle) — sistema salva protocolo, data/hora
11. Modal exibe [Texto: "SUBMETIDO COM SUCESSO"] — status do laudo atualizado para "Protocolado"
12. [Botao: "Fechar"] encerra o modal

### Fluxos Alternativos (V5)

**FA-01 — Exportar em DOCX ao inves de PDF**
1. No Passo 6, usuario clica [Botao: "Exportar DOCX"] ao inves de "Exportar PDF"
2. Sistema gera arquivo DOCX
3. Download inicia — usuario faz upload do DOCX no portal (se aceito)
4. Fluxo continua no Passo 7

**FA-02 — Cancelar submissao antes de registrar protocolo**
1. Modal esta aberto (Passo 2)
2. Usuario exporta PDF (Passo 6) mas decide nao submeter no portal
3. Clica [Botao: "Cancelar"]
4. Modal fecha — status do laudo permanece inalterado (ex: "Revisao")
5. PDF exportado permanece no computador do usuario

**FA-03 — Submeter laudo com validacoes em warning (nao bloqueantes)**
1. Checklist exibe 5 de 6 validacoes passando, 1 em warning (ex: assinatura nao detectada automaticamente)
2. Texto: "5 de 6 validacoes passaram. 1 validacao em atencao."
3. Sistema permite prosseguir com a submissao (warning nao e bloqueante)
4. Fluxo continua normalmente

### Fluxos de Excecao (V5)

**FE-01 — Validacoes criticas nao passam**
1. Checklist detecta falha critica: prazo de submissao expirado
2. [Texto: "Ha validacoes pendentes"]
3. [Botao: "Registrar Submissao"] permanece desabilitado
4. Mensagem: "Corrija as validacoes pendentes antes de submeter."

**FE-02 — Protocolo nao informado ao registrar**
1. Usuario clica [Botao: "Registrar Submissao"] com [TextInput: "Protocolo"] vazio
2. Validacao: "Informe o protocolo recebido do portal."
3. Submissao nao e registrada

**FE-03 — Portal ComprasNet fora do ar**
1. Usuario clica [Botao: "Abrir Portal ComprasNet"] (Passo 7)
2. Nova aba abre mas portal esta indisponivel
3. Usuario nao consegue fazer upload
4. Pode fechar o modal e tentar novamente posteriormente
5. Status do laudo permanece inalterado

**FE-04 — Erro ao registrar submissao no banco**
1. Usuario preenche protocolo e clica [Botao: "Registrar Submissao"]
2. Requisicao ao backend falha
3. Mensagem: "Erro ao registrar submissao. Tente novamente."
4. Protocolo preenchido e preservado no campo

### Tela(s) Representativa(s)

**Pagina:** RecursosPage (`/app/recursos`)
**Posicao:** Modal "Submissao Assistida no Portal" — disparado pelo [Botao: "Submeter no Portal"] no editor

#### Layout da Tela

```
[Botao: "Submeter no Portal"] (icone ExternalLink, variant primary) — no editor de laudos [ref: Passo 1]

[Modal: "Submissao Assistida no Portal"] (size: large) [ref: Passo 2]

  [Secao: "Dados da Peticao"] [ref: Passo 3]
    [Badge: "RECURSO"] ou [Badge: "CONTRA-RAZAO"] — tipo da peticao (readonly)
    [Texto: Edital] — readonly
    [Texto: Subtipo] — readonly

  [Secao: "Validacao Pre-Envio"] [ref: Passo 4]
    [Checkbox] (readonly) "Tamanho do arquivo dentro do limite"
    [Checkbox] (readonly) "Formato aceito pelo portal"
    [Checkbox] (readonly) "Prazo de submissao valido"
    [Checkbox] (readonly) "Secao juridica presente"
    [Checkbox] (readonly) "Secao tecnica presente"
    [Checkbox] (readonly) "Assinatura/identificacao presente"
    [Texto: "Todas as validacoes passaram"] ou [Texto: "Ha validacoes pendentes"] [ref: Passo 5]

  [Secao: "Passo 1 — Exportar Documento"] [ref: Passo 6]
    [Botao: "Exportar PDF"] (icone Download) [ref: Passo 6]
    [Botao: "Exportar DOCX"] (icone Download) [ref: Passo 6]

  [Secao: "Passo 2 — Submeter no Portal gov.br"] [ref: Passo 7]
    [Botao: "Abrir Portal ComprasNet"] (icone ExternalLink, variant primary) [ref: Passo 7]

  [Secao: "Passo 3 — Registrar Protocolo"] [ref: Passos 9, 10]
    [TextInput: "Protocolo de Submissao"] — placeholder "Ex: PNCP-2026-0046-REC-001" [ref: Passo 9]
    [Botao: "Registrar Submissao"] (icone CheckCircle) [ref: Passo 10]

  [Secao: "Resultado"] [ref: Passo 11]
    [Texto: "SUBMETIDO COM SUCESSO"] — exibido apos registro

  [Rodape do Modal]
    [Botao: "Cancelar"] (variant secondary) — antes da submissao
    [Botao: "Fechar"] — apos submissao registrada [ref: Passo 12]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Submeter no Portal"] | 1 |
| [Modal: "Submissao Assistida no Portal"] | 2 |
| [Secao: "Dados da Peticao"] | 3 |
| [Secao: "Validacao Pre-Envio"] / checkboxes readonly | 4 |
| [Texto: "Todas as validacoes..."] | 5 |
| [Botao: "Exportar PDF"] / [Botao: "Exportar DOCX"] | 6 |
| [Botao: "Abrir Portal ComprasNet"] | 7 |
| [TextInput: "Protocolo de Submissao"] | 9 |
| [Botao: "Registrar Submissao"] | 10 |
| [Texto: "SUBMETIDO COM SUCESSO"] | 11 |
| [Botao: "Fechar"] | 12 |

### Implementacao Atual
**✅ IMPLEMENTADO** — Versao assistida (validacao + exportacao + link portal + registro manual de protocolo)

---

# FASE 3 — FOLLOWUP DE RESULTADOS

---
