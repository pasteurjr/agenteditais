---
uc_id: UC-R06
nome: "Exportar Dossie Completo"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 1956
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-R06 — Exportar Dossie Completo

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 1956).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-041-01

**Regras de Negocio aplicaveis:**
- Presentes: RN-118, RN-119
- Faltantes: RN-129 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-118, RN-119, RN-129 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Proposta selecionada
2. Auditorias concluidas (recomendado)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-R01 OU UC-R02**
- **UC-R04 OU UC-R05**


### Pos-condicoes
1. Pacote completo gerado (PDF + DOCX + ZIP)

### Sequencia de eventos
1. No [Card: "Exportacao"], usuario clica no [Botao: "Baixar PDF"] para download da proposta em formato PDF. [ref: Passo 1]
2. Ou clica no [Botao: "Baixar DOCX"] para formato Word editavel. [ref: Passo 2]
3. Ou clica no [Botao: "Baixar Dossie ZIP"] para pacote completo com proposta + anexos. [ref: Passo 3]
4. Ou clica no [Botao: "Enviar por Email"] para preparar envio via chat. [ref: Passo 4]
5. Sistema gera o arquivo via `GET /api/propostas/{id}/export?formato=pdf|docx` ou `GET /api/propostas/{id}/dossie`. [ref: Passo 5]

### Fluxos Alternativos (V5)

**FA-01 — Exportar apenas proposta tecnica (PDF individual):**
1. Usuario clica em "Baixar PDF".
2. Sistema gera PDF apenas da proposta tecnica.

**FA-02 — Exportar proposta editavel (DOCX):**
1. Usuario clica em "Baixar DOCX".
2. Sistema gera documento Word editavel.

**FA-03 — Exportar dossie completo (ZIP com todos os documentos):**
1. Usuario clica em "Baixar Dossie ZIP".
2. Sistema gera pacote ZIP com proposta, certidoes, registros ANVISA, atestados e planilha de precos.

**FA-04 — Enviar por email:**
1. Usuario clica em "Enviar por Email".
2. Sistema prepara prompt de envio via chat com destinatario e assunto sugeridos.

### Fluxos de Excecao (V5)

**FE-01 — Falha na geracao do PDF (dados incompletos):**
1. A proposta nao tem conteudo suficiente para gerar PDF.
2. Sistema exibe toast: "Erro ao gerar PDF. Verifique o conteudo da proposta."

**FE-02 — Dossie ZIP incompleto (documentos ausentes):**
1. Alguns documentos do checklist estao ausentes.
2. O ZIP e gerado com aviso: "Dossie parcial — N documentos ausentes."

**FE-03 — Download falha (erro de rede):**
1. A chamada de exportacao falha.
2. Sistema exibe toast: "Erro no download. Tente novamente."

### Tela(s) Representativa(s)

**Pagina:** PropostaPage (`/app/proposta`)
**Posicao:** Card 6 (Exportacao) — visivel com proposta selecionada

#### Layout da Tela

[Card: "Exportacao"] icon Download
  [Botao: "Baixar PDF"] icon Download [ref: Passo 1]
  [Botao: "Baixar DOCX"] icon Download [ref: Passo 2]
  [Botao: "Baixar Dossie ZIP"] icon Archive [ref: Passo 3]
  [Botao: "Enviar por Email"] icon Send [ref: Passo 4]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Baixar PDF"] | 1 |
| [Botao: "Baixar DOCX"] | 2 |
| [Botao: "Baixar Dossie ZIP"] | 3 |
| [Botao: "Enviar por Email"] | 4 |

### Implementacao atual
**IMPLEMENTADO**

---
