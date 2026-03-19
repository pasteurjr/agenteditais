# Roteiro de Testes — Validação (pós-correções 19/03/2026)

## Pré-requisitos

1. Backend rodando: `python3 backend/app.py` (porta 5007)
2. Frontend rodando: `cd frontend && npm run dev` (porta 5175)
3. Estar logado no sistema
4. Ter pelo menos 1 produto no Portfolio (ex: Microscópio Binocular Eclipse E200)

---

## PARTE 1 — Captação: Salvar Edital com Itens + Scores + PDF

Objetivo: verificar que ao salvar um edital na Captação, os itens, scores e PDF são salvos corretamente para a Validação consumir.

### Teste 1.1: Buscar editais

1. Ir para **Captação**
2. Preencher: Termo = `microscopio`, Fonte = `PNCP`, Período = `30 dias`
3. Selecionar **Score Híbrido**
4. Clicar **Buscar**
5. **Esperado:** Tabela com ~10-14 resultados, ordenados por score decrescente, com colunas: Fonte, Numero, Orgao, UF, Modalidade, Objeto, Valor, Produto, Prazo, Score

### Teste 1.2: Verificar relatório sincronizado com tabela

1. Clicar no botão **Relatório Completo** no topo da tabela
2. **Esperado:** Abre nova aba com relatório HTML
3. **Verificar:**
   - [ ] Mesma quantidade de resultados que a tabela
   - [ ] Mesma ordem (score decrescente)
   - [ ] Mesmas colunas incluindo Objeto
   - [ ] Scores idênticos aos da tabela
   - [ ] Link Portal em cada edital nos detalhes
4. Clicar em um Link Portal
5. **Esperado:** Abre página do edital no PNCP (formato `pncp.gov.br/app/editais/{cnpj}/{ano}/{seq}`)

### Teste 1.3: Salvar edital com download de PDF

1. Na tabela, localizar o edital do **MCTI** (90002/2026, microscópio)
2. Clicar no ícone de **Salvar** (ou abrir painel e clicar Salvar Edital)
3. **Esperado:** Aparece pergunta "Edital salvo! Deseja baixar o PDF do edital?"
4. Clicar **OK**
5. **Esperado:**
   - [ ] PDF é baixado para a pasta de downloads do navegador
   - [ ] Nome do arquivo contém o número do edital
   - [ ] Arquivo é um PDF real (não ZIP) — abrir e verificar que é o edital
6. Badge **SALVO** aparece na linha do edital na tabela

### Teste 1.4: Verificar dados salvos no banco

Executar no terminal:
```bash
python3 -c "
import sys; sys.path.insert(0,'backend')
from config import MYSQL_URI
from sqlalchemy import create_engine, text
e = create_engine(MYSQL_URI)
with e.connect() as c:
    # Edital
    r = c.execute(text(\"SELECT numero, url, pdf_url, pdf_path, cnpj_orgao FROM editais WHERE numero LIKE '%90002%' LIMIT 1\"))
    for row in r: print('EDITAL:', row)
    # Itens
    r = c.execute(text(\"SELECT COUNT(*) FROM edital_itens WHERE edital_id = (SELECT id FROM editais WHERE numero LIKE '%90002%' LIMIT 1)\"))
    for row in r: print('ITENS:', row)
    # Analise (scores)
    r = c.execute(text(\"SELECT score_tecnico, score_comercial, score_final FROM analises WHERE edital_id = (SELECT id FROM editais WHERE numero LIKE '%90002%' LIMIT 1) ORDER BY created_at DESC LIMIT 1\"))
    for row in r: print('SCORES:', row)
"
```

**Esperado:**
- [ ] `url` = `https://pncp.gov.br/app/editais/01263896000164/2026/142`
- [ ] `pdf_url` = URL do PNCP para download
- [ ] `pdf_path` = caminho local do PDF (não ZIP)
- [ ] `cnpj_orgao` = `01263896000164`
- [ ] ITENS > 0
- [ ] SCORES com valores > 0

### Teste 1.5: Botão Baixar PDF no painel

1. Clicar na linha do edital MCTI (já salvo) para abrir o painel lateral
2. **Verificar:**
   - [ ] Botão **Abrir no Portal** presente → clicar → abre PNCP
   - [ ] Botão **Baixar PDF** presente (só aparece para editais salvos com dados PNCP)
   - [ ] Clicar Baixar PDF → baixa o PDF

---

## PARTE 2 — Validação: Verificar que dados chegam da Captação

Objetivo: verificar que os editais salvos na Captação aparecem na Validação com itens, scores e PDF corretos.

### Teste 2.1: Abrir Validação

1. Ir para **Validação** (menu lateral)
2. **Esperado:** Tabela com editais salvos (status "novo", "analisando", etc.)
3. Localizar o edital MCTI (90002/2026) na lista
4. **Verificar:**
   - [ ] Score aparece na coluna Score (não zero)
   - [ ] Status = "novo"

### Teste 2.2: Selecionar edital e verificar painel de Score

1. Clicar no edital MCTI na tabela
2. **Esperado:** Painel inferior abre com detalhes
3. No **painel de Score** (lado direito):
   - [ ] Se o edital foi salvo **após o fix P2** e tinha score profundo na Captação: Score Geral aparece no ScoreCircle (não zero), 6 barras com valores > 0, badge GO/NO-GO
   - [ ] Se o edital foi salvo **antes do fix** ou só tinha score rápido: Score pode ser zero — nesse caso o botão "Calcular Scores IA" aparece e deve ser clicado para calcular

### Teste 2.3: Ver Edital (PDF)

1. Clicar no botão **Ver Edital** (ícone de olho, topo do card de info)
2. **Esperado:** Modal fullscreen abre com o PDF do edital renderizado
3. **Verificar:**
   - [ ] PDF é exibido (não tela em branco)
   - [ ] Conteúdo é o edital real (não relação de itens, não ZIP)
   - [ ] Botão "Baixar e Salvar" funciona
   - [ ] Botão "Abrir em Nova Aba" funciona

---

## PARTE 3 — Aba Aderência (reorganizada)

### Teste 3.1: Conteúdo da aba

1. Com edital selecionado, clicar na aba **Aderência**
2. **Verificar que EXISTE:**
   - [ ] Seção "Aderência Técnica Detalhada" com 6 barras de score (ou botão Calcular se não tem scores)
   - [ ] Seção "Análise da IA" com justificativa + pontos positivos/atenção (se scores foram calculados)
   - [ ] Seção "Mapa Logístico" com UF Edital → UF Empresa, distância, dias estimados
3. **Verificar que NÃO EXISTE (removido por duplicação):**
   - [ ] Banner "Recomendação da IA: GO/NO-GO" (já está no painel de score)
   - [ ] Seção "Certificações" (movida para aba Documentos)
   - [ ] Seção "Análise de Lote" com gráfico de barras coloridas (movida para aba Lotes)
   - [ ] Seção "Intenção Estratégica e Margem" com radio buttons e slider (movida para decisão)

### Teste 3.2: Sub-scores detalhados

1. Se os 6 scores aparecem como barras:
   - [ ] Técnico, Documental, Complexidade, Jurídico, Logístico, Comercial
   - [ ] Valores entre 0-100
   - [ ] Cores: verde (>= 70), amarelo (>= 40), vermelho (< 40)
2. Se aparece botão "Calcular Scores":
   - [ ] Clicar → scores são calculados via IA
   - [ ] Após cálculo, barras aparecem com valores

### Teste 3.3: Mapa Logístico

1. **Verificar:**
   - [ ] UF do edital aparece corretamente (ex: MT para MCTI)
   - [ ] UF da empresa aparece (ex: MG)
   - [ ] Distância classificada: Próximo/Médio/Distante
   - [ ] Dias estimados de entrega

---

## PARTE 4 — Aba Lotes

### Teste 4.1: Itens do edital

1. Clicar na aba **Lotes**
2. **Esperado:** Seção "Itens do Edital" com tabela de itens
3. **Verificar:**
   - [ ] Itens aparecem (não "Nenhum item carregado")
   - [ ] Colunas: #, Descrição, Qtd, Unid, Vlr Unit, Vlr Total
   - [ ] Dados correspondem aos itens do PNCP
4. Se itens estão vazios:
   - [ ] Botão "Buscar Itens no PNCP" aparece
   - [ ] Clicar → itens são buscados e exibidos

### Teste 4.2: Lotes (extração via IA)

1. Na mesma aba, seção "Lotes do Edital"
2. Se não tem lotes:
   - [ ] Botão "Extrair Lotes via IA" aparece
   - [ ] Clicar → lotes são extraídos e organizados
3. Se tem lotes:
   - [ ] Cards expansíveis por lote (Lote 1, Lote 2, etc.)
   - [ ] Cada lote mostra: nome, especialidade, valor estimado, status
   - [ ] Expandir lote → mostra itens daquele lote
   - [ ] Botão "Reprocessar" disponível

---

## PARTE 5 — Aba Documentos

### Teste 5.1: Documentação necessária

1. Clicar na aba **Documentos**
2. **Verificar:**
   - [ ] 3 pastas de documentos: Empresa, Certidões/Fiscal, Qualificação Técnica
   - [ ] Cada documento com status: Disponível/Vencido/Faltante
   - [ ] Resumo de completude (barra de progresso + contagem)
3. Se vazio:
   - [ ] Botão "Extrair Requisitos do Edital" → extrai do PDF via IA
   - [ ] Botão "Documentos Exigidos via IA" → lista documentos necessários

---

## PARTE 6 — Aba Riscos

### Teste 6.1: Pipeline de riscos

1. Clicar na aba **Riscos**
2. **Verificar:**
   - [ ] Badges de modalidade, risco, flags
   - [ ] Fatal Flaws (se existirem)
   - [ ] Alerta de Recorrência (editais semelhantes perdidos)
   - [ ] Aderência Trecho-a-Trecho (tabela com trechos do edital + score)
   - [ ] Avaliação por Dimensão (6 badges com nível de risco)

---

## PARTE 7 — Aba Mercado

### Teste 7.1: Reputação do órgão

1. Clicar na aba **Mercado**
2. **Verificar:**
   - [ ] Dados do órgão: nome, pregoeiro, histórico de pagamento
   - [ ] Histórico de editais semelhantes (do mesmo órgão)
   - [ ] Botões "Buscar Preços" e "Analisar Concorrentes" (via chat)

---

## PARTE 8 — Aba IA

### Teste 8.1: Chat com IA

1. Clicar na aba **IA**
2. **Verificar:**
   - [ ] Resumo gerado pela IA (se disponível)
   - [ ] Campo "Pergunte à IA" com input de texto
   - [ ] Digitar uma pergunta (ex: "Quais os riscos deste edital?") → resposta da IA
3. **Ações rápidas via IA:**
   - [ ] Botão "Requisitos Técnicos" → funciona
   - [ ] Botão "Classificar Edital" → funciona
   - [ ] Botão "Gerar Proposta" → funciona
   - [ ] Botão "Baixar PDF do Edital" → funciona
   - [ ] Botão "Buscar Itens" → funciona

---

## PARTE 9 — Decisão GO/NO-GO

### Teste 9.1: Tomar decisão

1. Com edital selecionado, no topo da área de detalhes:
   - [ ] 3 botões de decisão: Participar (verde), Acompanhar (amarelo), Ignorar (vermelho)
2. Clicar em **Participar**
3. **Esperado:** Card de justificativa aparece
4. **Preencher:**
   - Motivo: `portfolio_aderente`
   - Detalhes: "Portfolio possui Microscópio compatível, documentação em dia"
5. Clicar **Salvar Justificativa**
6. **Esperado:**
   - [ ] Badge "Decisão salva" aparece
   - [ ] Status do edital muda para "validado"
   - [ ] Badge na tabela atualiza

### Teste 9.2: Alterar decisão

1. Clicar em **Acompanhar**
2. Mudar motivo para `falta_documentacao`
3. Salvar
4. **Esperado:** Status muda para "analisando"

---

## PARTE 10 — Relatório da Captação (regressão)

### Teste 10.1: Relatório com coluna Objeto

1. Voltar para **Captação**
2. Buscar `seringa descartavel`, PNCP, Híbrido
3. Clicar **Relatório Completo**
4. **Verificar:**
   - [ ] Coluna Objeto presente na tabela resumo
   - [ ] Ordem por score decrescente
   - [ ] Link Portal em cada edital
   - [ ] Scores idênticos à tabela da UI

### Teste 10.2: PDF do relatório

1. No relatório HTML, clicar **Baixar PDF**
2. **Verificar:**
   - [ ] PDF gerado em landscape
   - [ ] Todas as colunas visíveis (incluindo Score na última coluna)
   - [ ] Não corta conteúdo

### Teste 10.3: MD do relatório

1. Clicar **Baixar MD**
2. **Verificar:**
   - [ ] Arquivo .md baixado
   - [ ] Conteúdo idêntico ao HTML renderizado

---

## Checklist Final

| Item | Status |
|---|---|
| Itens salvos ao salvar edital na Captação | [ ] |
| Scores propagados da Captação para Validação | [ ] |
| PDF extraído de ZIP automaticamente | [ ] |
| Ver Edital na Validação exibe PDF (não tela em branco) | [ ] |
| Aba Aderência sem duplicações | [ ] |
| Aba Lotes com itens | [ ] |
| Relatório sincronizado com tabela | [ ] |
| URLs do PNCP no formato correto | [ ] |
| Decisão GO/NO-GO funciona | [ ] |
| Download de PDF ao salvar edital | [ ] |
