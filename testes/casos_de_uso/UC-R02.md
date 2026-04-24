---
uc_id: UC-R02
nome: "Upload de Proposta Externa"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 1577
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-R02 — Upload de Proposta Externa

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 1577).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-040-02

**Regras de Negocio aplicaveis:**
- Presentes: RN-116, RN-117
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-116, RN-117

**Ator:** Usuario

### Pre-condicoes
1. Usuario tem proposta elaborada fora do sistema (DOCX/PDF)

### Pos-condicoes
1. Proposta importada no sistema com status "rascunho"

### Sequencia de eventos
1. Usuario clica no [Botao: "Upload Proposta Externa"] no header da PropostaPage. [ref: Passo 1]
2. No [Modal: "Upload de Proposta Externa"], usuario seleciona [Select: "Edital"] e [Select: "Produto"]. [ref: Passo 2]
3. Usuario seleciona arquivo no [Campo: "Arquivo da Proposta (.docx, .pdf)"]. [ref: Passo 3]
4. Opcionalmente preenche [Campo: "Preco Unitario"] e [Campo: "Quantidade"]. [ref: Passo 4]
5. Usuario clica no [Botao: "Importar"]. [ref: Passo 5]
6. Sistema faz `POST /api/propostas/upload` com FormData e importa a proposta. [ref: Passo 6]

### Fluxos Alternativos (V5)

**FA-01 — Upload de PDF (proposta comercial pronta):**
1. No passo 3, usuario seleciona arquivo .pdf.
2. Sistema importa e extrai texto do PDF.
3. Proposta aparece na tabela com status "Rascunho".

**FA-02 — Upload de DOCX (documento editavel):**
1. No passo 3, usuario seleciona arquivo .docx.
2. Sistema importa e extrai texto do Word.

**FA-03 — Substituicao de arquivo ja importado:**
1. Se uma proposta ja tem arquivo importado, usuario faz novo upload.
2. O arquivo anterior e substituido pelo novo.

**FA-04 — Visualizacao do arquivo importado:**
1. Apos upload, usuario clica em "Visualizar" para abrir o PDF em nova aba.

### Fluxos de Excecao (V5)

**FE-01 — Arquivo com formato nao suportado (ex: .xlsx, .png):**
1. No passo 3, usuario tenta fazer upload de arquivo que nao e .docx ou .pdf.
2. Sistema exibe toast: "Formato nao suportado. Use .docx ou .pdf."

**FE-02 — Arquivo maior que 25MB:**
1. No passo 3, o arquivo excede 25MB.
2. Sistema bloqueia upload: "Arquivo excede o tamanho maximo de 25MB."

**FE-03 — Arquivo corrompido (nao abre):**
1. No passo 6, o sistema nao consegue extrair texto do arquivo.
2. Sistema exibe toast: "Erro ao processar arquivo. Verifique se o arquivo esta corrompido."

**FE-04 — Edital ou produto nao selecionado:**
1. No passo 2, usuario tenta importar sem selecionar edital ou produto.
2. Sistema exibe validacao: "Edital e produto sao obrigatorios."

### Tela(s) Representativa(s)

**Pagina:** PropostaPage (`/app/proposta`)
**Posicao:** Modal de Upload

#### Layout da Tela

[Modal: "Upload de Proposta Externa"] [ref: Passo 1]
  [Select: "Edital"] — obrigatorio [ref: Passo 2]
  [Select: "Produto"] — obrigatorio [ref: Passo 2]
  [Campo: "Arquivo da Proposta (.docx, .pdf)"] — file input, accept ".docx,.pdf" [ref: Passo 3]
  [Campo: "Preco Unitario"] — number [ref: Passo 4]
  [Campo: "Quantidade"] — number [ref: Passo 4]
  [Botao: "Importar"] [ref: Passo 5]
  [Botao: "Cancelar"]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Upload Proposta Externa"] | 1 |
| [Select: "Edital"] / [Select: "Produto"] | 2 |
| [Campo: "Arquivo da Proposta"] | 3 |
| [Campo: "Preco Unitario"] / [Campo: "Quantidade"] | 4 |
| [Botao: "Importar"] | 5 |

### Implementacao atual
**IMPLEMENTADO**

---
