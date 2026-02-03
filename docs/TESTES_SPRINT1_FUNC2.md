# Testes Sprint 1 - Funcionalidade 2: Extrair Resultados de Ata (PDF)

## Status: ✅ IMPLEMENTADO - AGUARDANDO TESTES

## Descrição
Permite extrair automaticamente os resultados de uma ata de sessão de pregão eletrônico (PDF).
O sistema extrai:
- Número do edital
- Órgão licitante
- Data da sessão
- Vencedores de cada item/lote
- Preços vencedores
- Participantes e seus lances
- Empresas desclassificadas

Os dados são salvos nas tabelas:
- `concorrentes` - Empresas participantes (novos ou atualizados)
- `precos_historicos` - Preço vencedor (se edital encontrado)
- `participacoes_editais` - Lances de cada participante

---

## Como Testar

### 1. Obter uma Ata de Sessão
Atas de pregão eletrônico podem ser encontradas em:
- Portal PNCP: https://pncp.gov.br
- ComprasNet: https://www.gov.br/compras
- Portais de transparência de prefeituras

### 2. Upload da Ata
1. Na interface do chat, clique no ícone de 📎 (clip)
2. Selecione um arquivo PDF de ata de sessão
3. Digite uma das mensagens abaixo e envie

---

## Prompts para Testar

### 1. Extrair Resultados Completos
```
Extraia os resultados desta ata
```
**Esperado:**
- Exibe número do edital, órgão, data
- Lista todos os itens com vencedores e preços
- Mostra participantes e desclassificados
- Registra concorrentes no banco

### 2. Identificar Vencedor
```
Quem ganhou este pregão?
```
**Esperado:**
- Identifica empresa(s) vencedora(s)
- Mostra preços vencedores
- Registra no histórico

### 3. Registrar Resultados
```
Registre os resultados da ata
```
**Esperado:**
- Extrai e salva todos os dados
- Atualiza concorrentes
- Se edital existir no sistema, atualiza status para "perdedor"

### 4. Extração Detalhada
```
Extraia vencedores e preços desta licitação
```
**Esperado:**
- Foco em vencedores e valores
- Tabela formatada com resultados

---

## Prompts Disponíveis no Dropdown

| Ícone | Nome | Prompt |
|-------|------|--------|
| 📄 | Extrair ata (PDF) | Extraia os resultados desta ata |

**IMPORTANTE:** Este prompt deve ser usado JUNTO com o upload de um arquivo PDF!

---

## Exemplo de Resposta Esperada

```
## 📄 Resultados Extraídos da Ata

**Arquivo:** ata_pe001_2026.pdf
**Edital:** PE-001/2026
**Órgão:** Hospital das Clínicas UFMG
**Data da Sessão:** 15/02/2026
**Objeto:** Aquisição de equipamentos médico-hospitalares...

---

### 📊 Itens/Lotes Extraídos

**Item 1:** Analisador Hematológico Automatizado...
- 🏆 **Vencedor:** MedLab Diagnósticos Ltda
- 💰 **Preço:** R$ 365.000,00
- 👥 **Participantes:** 4

**Item 2:** Reagentes para Hematologia...
- 🏆 **Vencedor:** TechSaúde Comercial
- 💰 **Preço:** R$ 128.500,00
- 👥 **Participantes:** 3

### ⚠️ Empresas Desclassificadas
- **DiagnósticaBR:** Documentação incompleta

---

### 📁 Dados Registrados

**Novos concorrentes:** MedLab Diagnósticos, TechSaúde Comercial
**Concorrentes atualizados:** 2

✅ **Edital PE-001/2026 encontrado no sistema - dados salvos no histórico!**
```

---

## Verificação de Dados no Banco

```sql
-- Ver concorrentes registrados
SELECT nome, cnpj, editais_participados, editais_ganhos
FROM concorrentes
ORDER BY created_at DESC LIMIT 10;

-- Ver preços históricos de atas
SELECT ph.*, e.numero
FROM precos_historicos ph
LEFT JOIN editais e ON ph.edital_id = e.id
WHERE ph.fonte = 'ata_pdf'
ORDER BY ph.data_registro DESC LIMIT 10;

-- Ver participações
SELECT pe.*, c.nome as concorrente, e.numero as edital
FROM participacoes_editais pe
LEFT JOIN concorrentes c ON pe.concorrente_id = c.id
LEFT JOIN editais e ON pe.edital_id = e.id
WHERE pe.fonte = 'ata_pdf'
ORDER BY pe.created_at DESC LIMIT 20;
```

---

## Arquivos Modificados

| Arquivo | Modificação |
|---------|-------------|
| `backend/app.py` | Adicionada intenção `extrair_ata` no prompt LLM e fallback |
| `backend/app.py` | Adicionado handler no mapa de intenções de arquivo |
| `backend/app.py` | Adicionada função `processar_extrair_ata()` |
| `backend/tools.py` | Adicionado `PROMPT_EXTRAIR_ATA` |
| `backend/tools.py` | Adicionada função `tool_extrair_ata_pdf()` |
| `frontend/src/components/ChatInput.tsx` | Adicionado prompt no dropdown |

---

## Limitações Conhecidas

1. **Qualidade do PDF**: PDFs escaneados (imagem) não funcionam bem. O texto precisa ser selecionável.
2. **Tamanho**: Atas muito grandes (>50 páginas) são truncadas para não estourar o contexto do LLM.
3. **Formatos variados**: Atas de diferentes órgãos têm formatos diferentes. O LLM tenta interpretar, mas pode falhar em formatos muito atípicos.
4. **Edital não cadastrado**: Se o edital não existir no sistema, os dados são extraídos mas não salvos no histórico de preços.

---

## Próximos Passos

Após seus testes, seguiremos para a **Funcionalidade 3: Buscar Preços no PNCP**.

---

*Gerado em: 03/02/2026*
