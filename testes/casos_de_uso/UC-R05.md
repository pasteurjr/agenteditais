---
uc_id: UC-R05
nome: "Auditoria Documental + Smart Split"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 1853
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-R05 — Auditoria Documental + Smart Split

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 1853).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-040-05

**Regras de Negocio aplicaveis:**
- Presentes: RN-111, RN-112, RN-113
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-111, RN-112, RN-113

**Ator:** Usuario

### Pre-condicoes
1. Proposta selecionada
2. Documentos do produto cadastrados

### Pos-condicoes
1. Todos os documentos exigidos verificados
2. PDFs > 25MB fracionados se necessario

### Sequencia de eventos
1. No [Card: "Auditoria Documental"], usuario clica no [Botao: "Verificar Documentos"]. [ref: Passo 1]
2. Sistema chama `GET /api/propostas/{id}/doc-audit`. [ref: Passo 2]
3. A [Tabela: "Document Records"] exibe Documento, Tamanho, Status e Acoes. [ref: Passo 3]
4. Status badge: [Badge: "Presente"] verde, [Badge: "Ausente"] vermelho, [Badge: "Vencido"] amarelo. [ref: Passo 4]
5. Se documento > 25MB, a coluna Acoes mostra [Botao: "Fracionar"] (Smart Split). [ref: Passo 5]
6. Usuario clica no [Botao: "Fracionar"] — sistema chama `POST /api/propostas/{id}/smart-split`. [ref: Passo 6]
7. A [Secao: "Checklist"] exibe resumo: "N de M documentos presentes" e alerta sobre arquivos grandes. [ref: Passo 7]

### Fluxos Alternativos (V5)

**FA-01 — Todos os documentos presentes (100% completo):**
1. No passo 7, o indicador mostra "M de M documentos presentes" em verde.
2. Nenhum alerta de documento faltante.

**FA-02 — Upload de documento faltante durante a auditoria:**
1. Para um documento com status "Ausente", usuario clica em "Upload".
2. Seleciona o arquivo e informa a validade.
3. O status muda para "Presente" (verde) e o indicador e atualizado.

**FA-03 — Documentos pequenos (sem alerta Smart Split):**
1. Todos os documentos estao abaixo de 25MB.
2. Nenhum botao "Fracionar" e exibido.
3. Alerta Smart Split nao aparece.

### Fluxos de Excecao (V5)

**FE-01 — Documento com mais de 25MB (Smart Split necessario):**
1. No passo 5, algum documento excede 25MB.
2. Botao "Fracionar" e exibido na coluna de acoes.
3. Alerta: "Existem documentos maiores que 25MB. Use Fracionar para dividir."

**FE-02 — Smart Split falha (PDF protegido por senha):**
1. No passo 6, o PDF esta protegido por senha e nao pode ser dividido.
2. Sistema exibe toast: "Nao foi possivel fracionar o PDF. Remova a protecao por senha."

**FE-03 — Documento vencido (certidao expirada):**
1. No passo 4, algum documento tem validade expirada.
2. Badge amarelo "Vencido" e exibido.
3. Alerta: "Documentos vencidos devem ser atualizados antes do envio."

**FE-04 — Falha na auditoria documental (erro de rede):**
1. A chamada `GET /api/propostas/{id}/doc-audit` falha.
2. Sistema exibe toast: "Erro ao verificar documentos. Tente novamente."

### Tela(s) Representativa(s)

**Pagina:** PropostaPage (`/app/proposta`)
**Posicao:** Card 5 (Auditoria Documental)

#### Layout da Tela

[Card: "Auditoria Documental"] icon FileCheck
  [Botao: "Verificar Documentos"] icon FileCheck [ref: Passo 1]
  [Texto: "Clique em 'Verificar Documentos' para conferir"] — estado inicial
  [Tabela: "Document Records"] — visivel apos verificacao [ref: Passo 3]
    [Coluna: "Documento"] — nome do arquivo
    [Coluna: "Tamanho"] — KB/MB formatado
    [Coluna: "Status"] — badge [ref: Passo 4]
      [Badge: "Presente"] — verde
      [Badge: "Ausente"] — vermelho
      [Badge: "Vencido"] — amarelo
    [Coluna: "Acoes"]
      [Botao: "Fracionar"] icon Scissors — visivel se > 25MB [ref: Passo 5, 6]
  [Secao: "Checklist"] [ref: Passo 7]
    [Indicador: "N de M documentos presentes"] — verde se todos, laranja se faltam
    [Alerta: "Existem documentos maiores que 25MB. Use Fracionar para dividir."] — condicional

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Verificar Documentos"] | 1 |
| [Tabela: "Document Records"] | 3 |
| [Badge: "Presente/Ausente/Vencido"] | 4 |
| [Botao: "Fracionar"] | 5, 6 |
| [Secao: "Checklist"] | 7 |

### Implementacao atual
**IMPLEMENTADO**

---
