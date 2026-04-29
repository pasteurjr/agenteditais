---
uc_id: UC-F03
nome: "Gerir documentos da empresa"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 474
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-F03 — Gerir documentos da empresa

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 474).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-023, RN-039 [FALTANTE→V4]

**RF relacionados:** RF-002, RF-004

**Regras de Negocio aplicaveis:**
- Faltantes: RN-039 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/compliance

### Pre-condicoes
1. Empresa existente **e vinculada ao usuario corrente** (registro ativo em `usuario_empresa`).
2. Endpoint `/api/empresa-documentos/upload` disponivel.
3. Lista de tipos/documentos necessarios carregada.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F01**
- **UC-F18**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)
- `[seed]` — dado pre-cadastrado no banco (seed)


### Pos-condicoes
1. Documento fica associado a empresa em `empresa_documentos`.
2. Documento pode ser visualizado, baixado ou excluido.
3. Status visual do documento e recalculado conforme arquivo e validade.

### Botoes e acoes observadas
- `Upload Documento`
- `Upload` por linha quando falta arquivo
- `Visualizar`
- `Download`
- `Excluir`
- modal com `Enviar` e `Cancelar`

### Sequencia de eventos
1. Usuario clica no [Botao: "Upload Documento"] no cabecalho do [Card: "Documentos da Empresa"].
2. Sistema abre o [Modal: "Upload de Documento"] com [Campo: "Tipo de Documento"] (select com optgroups por categoria), [Campo: "Arquivo"] (file input .pdf,.doc,.docx,.jpg,.png) e [Campo: "Validade"] (date picker).
3. Usuario preenche os campos e clica no [Botao: "Enviar"] no rodape do modal.
4. Sistema faz `POST /api/empresa-documentos/upload` com `FormData`.
5. A [Tabela: DataTable] de documentos e recarregada com o novo registro.
6. Usuario pode clicar [Icone-Acao: Eye] para visualizar ou [Icone-Acao: Download] para baixar o arquivo via `/api/empresa-documentos/{id}/download`.
7. Usuario pode clicar [Icone-Acao: Trash2] para excluir um documento via CRUD.

> **Nota:** O [Card: "Alertas IA sobre Documentos"] (Card 2 de 5) aparece entre o Card "Informacoes Cadastrais" e este Card. Possui [Botao: "Verificar Documentos"] que envia prompt ao chat para verificar documentos contra editais. Nao possui UC dedicado.

### Fluxos Alternativos

**FA-01 — Usuario cancela o upload**
1. No Passo 2, usuario abre o modal de upload.
2. Usuario clica [Botao: "Cancelar"] no rodape do modal.
3. Modal fecha sem enviar dados. Nenhum documento e criado.

**FA-02 — Documento sem data de validade**
1. No Passo 2, usuario nao preenche [Campo: "Validade"].
2. Sistema aceita o upload sem validade.
3. Documento aparece na lista com badge "OK" (sem vencimento).

**FA-03 — Upload de segundo documento do mesmo tipo**
1. Usuario tenta fazer upload de documento com mesmo tipo de um ja existente.
2. Sistema aceita — nao ha restricao de unicidade por tipo.
3. Ambos os documentos aparecem na lista.

### Fluxos de Excecao

**FE-01 — Arquivo em formato nao suportado**
1. Usuario seleciona arquivo com extensao nao aceita (ex: .exe, .zip).
2. O file input restringe via `accept=".pdf,.doc,.docx,.jpg,.png"`.
3. Se arquivo invalido for enviado, backend rejeita com erro 400.

**FE-02 — Arquivo excede tamanho maximo**
1. Usuario tenta enviar arquivo maior que o limite configurado no backend.
2. Sistema retorna erro 413 (Payload Too Large) ou mensagem de erro.
3. Documento NAO e salvo.

**FE-03 — Tipo de documento nao selecionado**
1. Usuario nao seleciona [Campo: "Tipo de Documento"] e tenta salvar.
2. Sistema exibe erro de validacao: campo obrigatorio.
3. Upload NAO e realizado.

**FE-04 — Exclusao de documento falha (Arnaldo OBS-15)**
1. Usuario clica [Icone-Acao: Trash2] para excluir documento.
2. Sistema nao responde ou exibe erro silencioso.
3. **Bug identificado V5:** Verificar se o endpoint DELETE esta disparando corretamente e se ha constraint FK impedindo exclusao.

**FE-05 — Erro de rede durante upload**
1. Conexao cai durante POST do FormData.
2. Modal permanece aberto. Toast de erro exibido.
3. Usuario pode tentar novamente.

### Tela(s) Representativa(s)

**Pagina:** EmpresaPage (`/app/empresa`)
**Posicao:** Card 3 de 5

#### Layout da Tela

```
[Card: "Alertas IA sobre Documentos"] [Icone: Sparkles] (Card 2 — informativo, sem UC dedicado)
  [Subtitulo: "A IA verifica seus documentos contra requisitos de editais"]
  [Botao: "Verificar Documentos"] — primary [ref: —]
  [Texto: area de resposta IA ou placeholder]

[Card: "Documentos da Empresa"] [Icone: Upload]
  [Botao: "Upload Documento"] [Icone: Plus] — header action [ref: Passo 1]
  [Tabela: DataTable]
    [Coluna: "Nome"] — nome do documento
    [Coluna: "Tipo"] — tipo documental
    [Coluna: "Validade"] — data de vencimento
    [Coluna: "Status"]
      [Badge: "OK"] — verde [ref: Passo 5]
      [Badge: "Vence"] — amarelo [ref: Passo 5]
      [Badge: "Falta"] — vermelho [ref: Passo 5]
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — visualizar [ref: Passo 6]
      [Icone-Acao: Download] — baixar [ref: Passo 6]
      [Icone-Acao: Trash2] — excluir [ref: Passo 7]

[Modal: "Upload de Documento"] (disparado por [Botao: "Upload Documento"])
  [Campo: "Tipo de Documento"] — select com optgroups, obrigatorio [ref: Passo 2]
  [Campo: "Arquivo"] — file (.pdf,.doc,.docx,.jpg,.png) [ref: Passo 2]
  [Campo: "Validade"] — date [ref: Passo 2]
  [Botao: "Enviar"] — primary [ref: Passo 3]
  [Botao: "Cancelar"]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Upload Documento"] | 1 |
| [Campo: "Tipo de Documento"] (modal) | 2 |
| [Campo: "Arquivo"] (modal) | 2 |
| [Campo: "Validade"] (modal) | 2 |
| [Botao: "Enviar"] (modal) | 3 |
| [Tabela: DataTable documentos] | 5 |
| [Badge: "OK" / "Vence" / "Falta"] | 5 |
| [Icone-Acao: Eye] | 6 |
| [Icone-Acao: Download] | 6 |
| [Icone-Acao: Trash2] | 7 |

### Persistencia observada
Tabela `empresa_documentos`: `empresa_id`, `tipo`, `nome_arquivo`, `path_arquivo`, `data_vencimento`, `texto_extraido`, `documento_necessario_id`.

### Implementacao atual
**IMPLEMENTADO**

---
