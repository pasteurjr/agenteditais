# Tutorial Sprint 2 — Conjunto 2 V3 (Análises IA + Lotes)

**Data:** 2026-05-04
**Versão:** V3 — atualiza V2 com:
- Asserts profundos validando EFEITO REAL em CV09 (itens importados >=1, lotes extraídos >=1)
- Retry explícito em CV12 (Mercado IA) — DeepSeek transient mais resiliente
- Idempotência em UC-CV09 (aceita herança de itens/lotes do TESTE BASE)
- Tolerância a "PNCP retornou vazio" só quando FE mostra mensagem amigável

**UCs detalhados:** CV08, CV09, CV10, CV11, CV12, CV13 (análises IA + ciclo de lotes)
**Trilha:** visual

---

## UC-CV09 — Importar Itens do PNCP + Extrair Lotes via IA

### Pré-condições
- UC-CV03 executado (edital VERE 0000031/2026 salvo)
- UC-CV07 executado (edital selecionado em ValidaçãoPage)
- Tab "Lotes" da página de Validação ativa

### EFEITO REAL ESPERADO

#### Passo 02 — Buscar Itens no PNCP (idempotente)
**Click:** botão "Buscar Itens no PNCP"
**Endpoint:** `POST /api/editais/{edital_id}/buscar-itens-pncp`
**Backend:** `tool_buscar_itens_edital_pncp` chama `https://pncp.gov.br/api/pncp/v1/orgaos/{cnpj}/compras/{ano}/{seq}/itens` e persiste em `editais_itens`.

**Idempotência:**
```javascript
const m = txt.match(/Itens do Edital \((\d+)\)/);
if (m && parseInt(m[1]) >= 1) {
  // Já tem itens (herança) — pula click
  return `itens_ja_importados=${m[1]}`;
}
// Senão, clica
```

**Esperado para edital VERE:** N=2 (Cadeira Odontológica + Monitor Multiparâmetro)

#### Passo 03 — Validar Itens (efeito real)
- Valida `<h4>Itens do Edital (N)</h4>` com N >= 1
- Aceita N=0 SOMENTE se FE mostra mensagem "Nenhum item carregado" ou "Importe os itens"
- `throw new Error` se N=0 sem mensagem

#### Passo 04 — Extrair Lotes via IA (idempotente)
**Click:** botão "Extrair Lotes via IA"
**Endpoint:** `POST /api/editais/{edital_id}/lotes/extrair`
**Backend:** `tool_organizar_lotes` chama DeepSeek para agrupar itens em lotes lógicos.

**Idempotência:** se `Lotes (N)` já tem N>=1, pula click.

#### Passo 05 — Validar Lotes (efeito real consistente)
- N>=1 = OK (`lotes_OK=N`)
- N=0 com itens=0 = OK (`lotes_zero_consistente`)
- N=0 com itens>=1 = FALHA (`throw Error`)

---

## UC-CV12 — Analisar Mercado do Órgão (com retry)

### Pré-condições
- Tab "Mercado" da ValidaçãoPage ativa

### EFEITO REAL ESPERADO

#### Passo 01 — Click "Analisar Mercado"
**Endpoint:** `POST /api/editais/{edital_id}/analisar-mercado`
**Backend:** chama PNCP + DeepSeek pra histórico do órgão.

#### Passo 02 — RETRY se falhou (NOVO V3)
Se a primeira chamada deu 500 (DeepSeek timeout), clica de novo:
```javascript
if (/Reputa[cç][aã]o|Volume|Modalidade|Esfera/.test(txt)) return 'ja_renderizado';
const btn = [...document.querySelectorAll('button')]
  .find(b => /Reanalisar Mercado|Analisar Mercado/i.test(b.textContent || ''));
if (btn) { btn.click(); return 'retry_clicked'; }
```

#### Passo 03 — Validar cards OU erro amigável
- Cards renderizados (Reputação, Volume, Modalidade, Esfera) → OK
- OU FE mostrou mensagem amigável de erro tratado → OK (DeepSeek transient não fatal)
- Sem cards e sem mensagem → FALHA

---

## UC-CV10 — Documentos do Edital via IA

### EFEITO REAL ESPERADO
- Click "Identificar Documentos Exigidos pelo Edital"
- POST `/api/editais/{id}/extrair-requisitos` retorna 200/201/400 (400 = sem PDF, comportamento documentado)
- Após sucesso, lista de documentos exigidos aparece na UI

---

## UC-CV11 — Riscos do Edital via IA

### EFEITO REAL ESPERADO
- Click "Analisar Riscos"
- POST `/api/editais/{id}/analisar-riscos` retorna 200/201
- Cards de riscos renderizados (alto/médio/baixo)

---

## UC-CV13 — Resumo IA do Edital (chat)

### EFEITO REAL ESPERADO
- Click "Gerar Resumo"
- POST `/api/chat` retorna 200 com payload de resumo textual
- Texto do resumo aparece na UI

---

## Tabela de cobertura V3

| UC | Passos V3 | Asserts profundos? | Idempotente? |
|---|---|---|---|
| CV01 | 7 | ✅ | N/A |
| CV02 | 3 | ✅ | ✅ (alvo VERE com fallback) |
| CV03 | 2 | ✅ | ✅ |
| CV04 | 4 | ✅ | N/A |
| CV05 | 2 | ✅ | N/A |
| CV06 | 3 | ✅ | N/A |
| CV07 | 4 | ✅ | N/A |
| CV08 | 3 | ✅ | N/A |
| CV09 | 6 | ✅ | ✅ (itens + lotes) |
| CV10 | 2 | ✅ | N/A |
| CV11 | 2 | ✅ | N/A |
| CV12 | 4 | ✅ | ✅ (retry) |
| CV13 | 2 | ✅ | N/A |
