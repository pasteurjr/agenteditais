# Guia de Teste — Abas da Validação (Lotes, Documentos, Riscos, Mercado, IA)

**Data:** 19/03/2026
**Pré-requisitos:** Backend rodando (porta 5007), Frontend rodando (porta 5175), pelo menos 1 edital salvo com dados PNCP (cnpj_orgao, ano_compra, seq_compra preenchidos).

---

## ABA LOTES

### O que exibe
- **Itens do Edital**: tabela com itens vindos do PNCP (#, Descrição, Qtd, Unid, Vlr Unit, Vlr Total)
- **Lotes do Edital**: cards expansíveis com itens agrupados por lote/especialidade

### Como os dados chegam
- Itens são carregados automaticamente ao selecionar o edital via `crudList("editais-itens", { parent_id: editalId })`
- Lotes via `GET /api/editais/{id}/lotes`
- Se os itens não existem no banco, precisam ser buscados do PNCP

### Passos para testar

**Teste L1: Verificar itens carregados**
1. Na Validação, selecionar um edital salvo (ex: MCTI 90002/2026)
2. Clicar na aba **Lotes**
3. **Esperado:** Tabela "Itens do Edital" com pelo menos 1 item
4. Se vazio ("Nenhum item carregado"):
   - O edital pode ter sido salvo antes do fix que salva itens automaticamente
   - Clicar **"Buscar Itens no PNCP"** → envia comando para o chat buscar itens
   - Alternativa: usar o terminal para buscar diretamente:
     ```bash
     python3 -c "
     import sys; sys.path.insert(0,'backend')
     from tools import tool_buscar_itens_edital_pncp
     result = tool_buscar_itens_edital_pncp(edital_id='<ID_DO_EDITAL>')
     print(result)
     "
     ```
5. **Verificar dados do item:** #, descrição legível, quantidade numérica, valor unitário formatado

**Teste L2: Extrair lotes via IA**
1. Com itens carregados, verificar seção "Lotes do Edital"
2. Se está vazio, clicar **"Extrair Lotes via IA"**
3. **Esperado:** Aguardar processamento (pode demorar 10-30s)
4. Lotes aparecem como cards expansíveis:
   - Número do lote
   - Nome/especialidade
   - Valor estimado
   - Status
   - Itens dentro do lote (tabela interna)
5. Edital de microscópio (MCTI) deve gerar **1 lote único** com 1 item

**Teste L3: Reprocessar lotes**
1. Com lotes já extraídos, clicar **"Reprocessar"**
2. **Esperado:** Lotes são recalculados (pode mudar agrupamento)
3. Dados anteriores são substituídos

### Problemas conhecidos
- Se o edital foi salvo **antes** do fix P1 (salvar itens ao salvar edital), os itens não estarão no banco
- O botão "Buscar Itens no PNCP" envia para o chat — não busca diretamente. Para buscar direto, use o terminal
- Editais com muitos itens (>50) podem demorar para carregar

---

## ABA DOCUMENTOS

### O que exibe
- **3 pastas de documentos:**
  - Documentos da Empresa (azul): contrato social, alvará, procuração, etc.
  - Certidões e Fiscal (amarelo): FGTS, INSS, trabalhista, etc.
  - Qualificação Técnica (verde): atestados, registros ANVISA, etc.
- **Resumo de Completude:** barra de progresso + contagem (OK / Vencidos / Faltantes)
- **Checklist Documental (IA):** se disponível, tabela detalhada

### Como os dados chegam
- Carregados automaticamente ao selecionar edital via `GET /api/editais/{id}/documentacao-necessaria`
- Retorna documentos padrão de licitação (`fonte: "padrao_licitacao"`)
- Se extrair requisitos do PDF, retorna documentos específicos do edital (`fonte: "requisitos_edital"`)

### Passos para testar

**Teste D1: Documentação padrão**
1. Selecionar edital, clicar aba **Documentos**
2. **Esperado:** 3 pastas com documentos, cada um com status (Disponível/Faltante/Vencido)
3. **Verificar:** ~16 documentos padrão divididos nas 3 categorias
4. Nota no rodapé: "Fonte: Lista padrão de licitação"

**Teste D2: Resumo de completude**
1. Na mesma aba, verificar seção "Resumo de Completude"
2. **Esperado:** Barra de progresso + badges com contagem
3. Cor: verde (100%), amarelo (>=70%), vermelho (<70%)

**Teste D3: Extrair requisitos do PDF**
1. Se a nota diz "Lista padrão", clicar **"Extrair Requisitos do Edital"**
2. **Esperado:** Processamento via IA (pode demorar 30-60s)
3. Após extração: documentos específicos do edital substituem os padrão
4. Nota muda para: "Fonte: Requisitos extraídos do edital"
5. **ATENÇÃO:** Este endpoint pode demorar bastante pois lê o PDF e chama a IA

**Teste D4: Documentos exigidos via IA**
1. Clicar **"Documentos Exigidos via IA"**
2. **Esperado:** Envia pergunta para o chat que retorna lista de documentos necessários
3. Funciona via chat — não atualiza a aba Documentos diretamente

### Problemas conhecidos
- A documentação padrão é genérica (mesma para todos os editais)
- Status dos documentos (ok/faltante/vencido) depende de cadastro na aba Empresa do sistema
- Extração de requisitos pode timeout se o PDF for muito grande
- Checklist Documental (IA) só aparece se dados foram gerados anteriormente

---

## ABA RISCOS

### O que exibe
- **Pipeline de Riscos:** badges de modalidade + prazo pagamento + alertas
- **Fatal Flaws:** problemas críticos identificados pela IA
- **Alerta de Recorrência:** se o órgão já teve editais similares perdidos
- **Aderência Trecho-a-Trecho:** trechos do edital vs portfolio com score por trecho
- **Avaliação por Dimensão:** 6 badges com classificação (Atendido/Ponto de Atenção/Impeditivo)

### Como os dados chegam
- Dados vêm do estado do edital (carregados no `loadEditaisSalvos`)
- Não chama endpoints adicionais — é read-only
- Campos usados: `sinaisMercado`, `flagsJuridicos`, `fatalFlaws`, `aderenciaTrechos`, `scores`

### Passos para testar

**Teste R1: Pipeline de riscos**
1. Selecionar edital, clicar aba **Riscos**
2. **Esperado:**
   - Badge com modalidade (ex: "Pregão Eletrônico")
   - Badge com prazo de pagamento (ex: "Faturamento 45 dias")
   - Se há riscos: badges amarelos/vermelhos
3. **NOTA:** Modalidade e prazo são hardcoded — não dinâmicos

**Teste R2: Fatal Flaws**
1. Verificar seção "Fatal Flaws"
2. Se existem: card vermelho com lista de problemas críticos
3. Se não existem: seção não aparece
4. **NOTA:** Fatal flaws dependem de análise prévia pela IA

**Teste R3: Avaliação por dimensão**
1. Verificar 6 badges no final da aba
2. **Esperado:** Cada dimensão com % e classificação
   - >= 70%: "Atendido" (verde)
   - 30-70%: "Ponto de Atenção" (amarelo)
   - < 30%: "Impeditivo" (vermelho)
3. Valores devem bater com as barras da aba Aderência

**Teste R4: Aderência trecho-a-trecho**
1. Verificar tabela "Aderência Técnica Trecho-a-Trecho"
2. Se tem dados: tabela com trechos do edital, score de aderência, trecho do portfolio
3. Se vazio: "Nenhum trecho analisado"
4. **NOTA:** Dados dependem de análise prévia do PDF pela IA

### Problemas conhecidos
- Pipeline de riscos tem valores hardcoded ("Pregão Eletrônico", "Faturamento 45 dias")
- Fatal flaws, flags jurídicos e aderência trecho-a-trecho geralmente estão vazios para editais novos
- Esses dados só são populados quando a IA analisa o PDF completo do edital
- Não há botão para disparar análise de riscos — depende de análise prévia

---

## ABA MERCADO

### O que exibe
- **Reputação do Órgão:** pregoeiro, histórico de pagamento, participações anteriores
- **Histórico de Editais Semelhantes:** editais anteriores do mesmo órgão com decisões
- **Botões:** Buscar Preços, Analisar Concorrentes (via chat)

### Como os dados chegam
- Carregados via useEffect ao selecionar edital:
  - Busca editais do mesmo órgão: `crudList("editais", { q: orgao })`
  - Para cada, busca estratégias: `crudList("estrategias-editais", { q: editalId })`
  - Contabiliza decisões: `crudList("validacao_decisoes", { q: orgao })`
- Calcula reputação com base em decisões go/nogo anteriores

### Passos para testar

**Teste M1: Reputação do órgão**
1. Selecionar edital, clicar aba **Mercado**
2. **Esperado:** 3 cards:
   - Pregoeiro: nome ou "-"
   - Pagamento: "Pagador regular" / "Sem dados" / "-"
   - Histórico: "X participações (Y GO / Z NO-GO)" ou "-"
3. **NOTA:** Se é o primeiro edital deste órgão, todos mostram "-" ou "Sem dados"

**Teste M2: Histórico de editais semelhantes**
1. Na mesma aba, verificar seção de histórico
2. Se existem editais anteriores do mesmo órgão no banco:
   - Lista com: número do edital, badge de decisão, score, objeto
3. Se não existem: "Nenhum edital anterior encontrado" ou seção vazia

**Teste M3: Buscar preços via chat**
1. Clicar **"Buscar Preços"**
2. **Esperado:** Abre o chat com comando "Busque preços de [objeto] no PNCP"
3. IA deve retornar informações de preços históricos

**Teste M4: Analisar concorrentes via chat**
1. Clicar **"Analisar Concorrentes"**
2. **Esperado:** Abre o chat com comando sobre concorrentes

### Problemas conhecidos
- Reputação só é calculada se há >= 3 editais do mesmo órgão no banco
- Para órgãos novos (primeiro edital), tudo aparece vazio
- Dados de pregoeiro não são buscados dinamicamente — vêm do cadastro
- Botões de chat só funcionam se o componente `onSendToChat` está disponível

---

## ABA IA

### O que exibe
- **Resumo Gerado pela IA:** resumo do edital em 2-3 parágrafos
- **Pergunte à IA:** campo de texto para fazer perguntas sobre o edital
- **Ações Rápidas via IA:** 5 botões para tarefas comuns

### Como os dados chegam
- Resumo: `POST /api/chat` com prompt de resumo
- Perguntas: `POST /api/chat` com a pergunta do usuário
- Ações rápidas: enviam comandos para o chat via `onSendToChat`

### Passos para testar

**Teste I1: Gerar resumo**
1. Selecionar edital, clicar aba **IA**
2. Se não tem resumo: clicar **"Gerar Resumo"**
3. **Esperado:** Aguardar (10-30s), resumo aparece em texto
4. Se já tem resumo: botão muda para **"Regerar Resumo"**

**Teste I2: Perguntar à IA**
1. No campo "Pergunte à IA", digitar: "Qual o prazo de entrega deste edital?"
2. Clicar **"Perguntar"**
3. **Esperado:** Resposta da IA aparece abaixo (10-20s)
4. Resposta deve ser contextualizada ao edital selecionado

**Teste I3: Ações rápidas**
1. Testar cada botão:
   - **"Requisitos Técnicos"** → chat recebe pergunta sobre requisitos
   - **"Classificar Edital"** → chat recebe comando de classificação
   - **"Gerar Proposta"** → chat recebe comando de gerar proposta com produto
   - **"Baixar PDF do Edital"** → chat recebe comando de baixar PDF
   - **"Buscar Itens"** → chat recebe comando de buscar itens
2. **Esperado:** Cada botão abre/envia para o chat com o comando apropriado

### Problemas conhecidos
- Resumo não é salvo persistentemente — regenera a cada sessão
- Resposta à pergunta desaparece ao trocar de aba ou edital
- Ações rápidas dependem de `onSendToChat` — em modo standalone não funcionam
- Não há histórico de conversas — cada pergunta é independente
- Respostas não são renderizadas como markdown (texto puro)

---

## CHECKLIST GERAL

| Aba | Item | Status |
|---|---|---|
| Lotes | Itens carregam automaticamente | Testar |
| Lotes | "Buscar Itens no PNCP" funciona | Testar (via chat) |
| Lotes | "Extrair Lotes via IA" funciona | ✅ Testado — funciona |
| Lotes | "Reprocessar" lotes funciona | Testar |
| Documentos | 3 pastas com documentos padrão | ✅ Testado — 16 docs |
| Documentos | Resumo de completude | Testar |
| Documentos | "Extrair Requisitos do Edital" | Testar (demora) |
| Riscos | Pipeline de riscos exibe | Testar |
| Riscos | Avaliação por dimensão bate com scores | Testar |
| Mercado | Reputação do órgão | Testar |
| Mercado | Histórico de editais semelhantes | Testar |
| IA | Gerar resumo | Testar |
| IA | Perguntar à IA | Testar |
| IA | Ações rápidas | Testar |

## COMO POPULAR ITENS PARA EDITAIS ANTIGOS

Se um edital foi salvo antes do fix e não tem itens, execute no terminal:
```bash
python3 -c "
import sys; sys.path.insert(0,'backend')
from tools import tool_buscar_itens_edital_pncp
result = tool_buscar_itens_edital_pncp(edital_id='<ID_DO_EDITAL>')
print(f'Itens encontrados: {len(result.get(\"itens\", []))}')
for it in result.get('itens', []):
    print(f'  #{it[\"numero_item\"]} | {it[\"descricao\"][:50]}')
"
```

Para encontrar o ID do edital:
```bash
python3 -c "
import sys; sys.path.insert(0,'backend')
from config import MYSQL_URI
from sqlalchemy import create_engine, text
e = create_engine(MYSQL_URI)
with e.connect() as c:
    r = c.execute(text(\"SELECT id, numero, orgao FROM editais WHERE status != 'temp_score' ORDER BY created_at DESC LIMIT 10\"))
    for row in r: print(f'{row[0]} | {row[1]} | {row[2][:40]}')
"
```
