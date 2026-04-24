---
uc_id: UC-AT02
nome: "Extrair Resultados de Ata PDF"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 501
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-AT02 — Extrair Resultados de Ata PDF

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 501).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-213 [FALTANTE->V4]

**RF relacionado:** RF-035
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. PDF da ata disponivel (via download do PNCP ou URL direta)
3. Backend tools `tool_baixar_ata_pncp` e `tool_extrair_ata_pdf` operacionais

### Pos-condicoes
1. Itens da ata extraidos com descricao, vencedor, preco e quantidade
2. Dados disponiveis para importacao na base de precos historicos
3. Concorrentes identificados registrados

### Sequencia de Eventos

1. Usuario clica na [Aba: "Extrair"] da AtasPage (ou e direcionado via [Botao: "Extrair"] da busca)
2. Se veio da busca, [TextInput: "URL da ata (PNCP ou PDF direto)"] ja esta pre-preenchido com URL
3. Usuario escolhe fonte: preenche [TextInput: "URL da ata"] OU preenche [TextArea: "Ou cole o texto da ata aqui"]
4. Clica [Botao: "Extrair Dados"] (icone Download) — desabilitado se nenhum campo preenchido
5. Durante extracao: [Botao: "Extraindo..."] (icone Loader2, animate-spin) exibido
6. Backend processa: baixa PDF, extrai texto via IA
7. [Tabela: "Itens Extraidos ({N})"] exibe resultados com colunas: Descricao, Vencedor, Valor Unit., Qtd
8. Usuario revisa itens extraidos na tabela

### Fluxos Alternativos (V5)

- **FA-01 — Extracao via texto colado (sem URL):** No passo 3, usuario opta por colar texto diretamente no TextArea ao inves de usar URL. Backend processa texto puro sem necessidade de download de PDF.
- **FA-02 — Ata com poucos itens (1-2):** Extracao retorna apenas 1 ou 2 itens. Tabela exibe normalmente com contagem "(1)" ou "(2)" no titulo.
- **FA-03 — Ata sem vencedor definido em todos os itens:** Alguns itens retornam coluna "Vencedor" como "Nao definido" ou vazio. Tabela exibe mesmo assim para revisao manual.

### Fluxos de Excecao (V5)

- **FE-01 — URL invalida ou PDF corrompido:** Backend nao consegue baixar ou processar o PDF. Sistema exibe alerta "Nao foi possivel processar o documento. Verifique a URL ou cole o texto manualmente."
- **FE-02 — Ambos os campos vazios:** No passo 4, botao "Extrair Dados" permanece desabilitado. Nenhuma acao e disparada.
- **FE-03 — IA nao consegue extrair itens:** Backend processa mas DeepSeek retorna resultado vazio ou mal formatado. Sistema exibe alerta "Nao foi possivel extrair itens desta ata. Tente colar o texto manualmente."
- **FE-04 — Timeout na extracao:** Processamento demora alem do limite. Sistema exibe erro "Extracao expirou. O documento pode ser muito grande. Tente colar apenas a secao de itens."

### Tela(s) Representativa(s)

**Pagina:** AtasPage (`/app/atas`)
**Posicao:** Aba "Extrair" (2a aba)

#### Layout da Tela

```
[Aba: "Buscar"] [Aba: "Extrair"] [Aba: "Minhas Atas"] [Aba: "Saldo ARP"]

[Card principal — formulario de extracao] [ref: Passos 2-5]
  [TextInput: "URL da ata (PNCP ou PDF direto)"] [ref: Passos 2, 3]
    placeholder: "https://pncp.gov.br/..."
  [TextArea: "Ou cole o texto da ata aqui"] [ref: Passo 3]
    placeholder: "Cole o texto completo da ata..."
  [Botao: "Extrair Dados"] (icone Download) — desabilitado se ambos vazios [ref: Passo 4]
  [Botao: "Extraindo..."] (icone Loader2, animate-spin) — exibido durante extracao [ref: Passo 5]

[Tabela: "Itens Extraidos ({N})"] — customizada com HTML [ref: Passos 7, 8]
  [Coluna: "Descricao"]
  [Coluna: "Vencedor"]
  [Coluna: "Valor Unit."] — alinhado a direita
  [Coluna: "Qtd"] — alinhado a direita
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Extrair"] | 1 |
| [TextInput: "URL da ata"] | 2, 3 |
| [TextArea: "Ou cole o texto"] | 3 |
| [Botao: "Extrair Dados"] | 4 |
| [Botao: "Extraindo..."] | 5 |
| [Tabela: "Itens Extraidos"] | 7, 8 |

### Implementacao Atual
**Implementado**

---
