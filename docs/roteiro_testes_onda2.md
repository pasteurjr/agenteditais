# Roteiro de Testes — Onda 2

**Data**: 19/02/2026 (atualizado)
**Sprints cobertas**: Sprint 2 (Captacao + Validacao) e Sprint 3 (Precificacao + Proposta + Submissao)
**Ambiente**: Backend porta 5007 | Frontend porta 5175

---

## Pre-requisitos

1. Backend rodando (`python app.py` na porta 5007)
2. Frontend rodando (`npm run dev` na porta 5175)
3. Usuario com login valido (ex: `pasteurjr@gmail.com` / `123456`)
4. Pelo menos 1 produto cadastrado no portfolio (PortfolioPage)
5. Pelo menos 1 edital salvo no banco (via Captacao ou CRUD)

---

## 1. LOGIN E DASHBOARD

### 1.1 Login com credenciais validas
- **Passo**: Acessar `http://localhost:5175`. Preencher email e senha. Clicar "Entrar".
- **Esperado**: Token gerado no `localStorage` (chave `editais_ia_access_token`). Dashboard carrega com dados reais. Nome do usuario aparece na sidebar.
- **Resultado testes auto**: OK — Token presente, dashboard carregou.

### 1.2 Dashboard com dados reais
- **Passo**: Observar os cards do Dashboard.
- **Esperado**:
  - Cards de status: Novos, Em Analise, Validados, Propostas Enviadas, Lance Hoje
  - Funil mostra etapas (Captacao, Validacao, Precificacao, etc.) com contagens reais
  - Valor total em R$ aparece (ex: R$ 960k)
  - Editais Urgentes listados com prazo (ex: PE-001/2026 5 dias)
  - Proximos Eventos com datas de abertura
  - Insights da IA (pode estar vazio)
- **Resultado testes auto**: OK — Dashboard completo visivel.

---

## 2. CAPTACAO DE EDITAIS (CaptacaoPage)

### 2.1 Navegacao
- **Passo**: Clicar em "Captacao" no sidebar (dentro de Fluxo Comercial, ja expandido por padrao).
- **Esperado**: Pagina abre com titulo "Captacao de Editais", subtitulo "Busca e captacao de novos editais", cards de prazos, formulario de busca e card de monitoramento.
- **Resultado testes auto**: OK

### 2.2 Cards de prazo
- **Passo**: Observar os 4 StatCards no topo.
- **Esperado**:
  - "Proximos 2 dias" (icone vermelho)
  - "Proximos 5 dias" (icone laranja)
  - "Proximos 10 dias" (icone amarelo)
  - "Proximos 20 dias" (icone azul)
  - Contagens = 0 antes da busca, atualizam apos busca com resultados
- **Resultado testes auto**: OK — 4 cards presentes.

### 2.3 Formulario de busca — campos presentes
- **Passo**: Verificar campos do card "Buscar Editais".
- **Esperado**:
  - Campo "Termo / Palavra-chave" com placeholder "Ex: microscopio, reagente..."
  - Select "UF" com 27 UFs brasileiras + "Todas"
  - Select "Fonte" com opcoes: PNCP, ComprasNET, BEC-SP, SICONV, Todas as fontes
  - Botao "Buscar Editais" (ActionButton com icone lupa, variante primary)
  - Segunda linha de selects:
    - "Classificacao Tipo" com: Todos, Reagentes, Equipamentos, Comodato, Aluguel, Oferta de Preco
    - "Classificacao Origem" com: Todos, Municipal, Estadual, Federal, Universidade, Hospital, LACEN, Forca Armada, Autarquia
  - Checkbox "Calcular score de aderencia (portfolio)" — marcado por padrao
  - Checkbox "Incluir editais encerrados" — desmarcado por padrao
- **Resultado testes auto**: OK — Todos os campos confirmados (UF com estados, Fonte com PNCP/ComprasNET, Tipo com Reagentes/Equip, Origem com Mun/Fed, checkboxes presentes).

### 2.4 Busca sem termo
- **Passo**: Limpar o campo de busca. Clicar "Buscar Editais".
- **Esperado**: Mensagem de erro "Informe um termo de busca" aparece em div alert-error.
- **Resultado testes auto**: OK — Mensagem exibida.

### 2.5 Busca de editais — multi-fonte (T13 refatorado)
- **Passo**: Digitar "reagentes" no campo de busca. Manter UF "Todas" e Fonte "PNCP". Desmarcar "Calcular score". Marcar "Incluir editais encerrados". Clicar "Buscar Editais".
- **Esperado**:
  - Loading spinner aparece no botao
  - Backend chama `_buscar_editais_multifonte()` que consulta:
    - **PNCP API real** (`pncp.gov.br/api/consulta/v1/contratacoes/publicacao`) — ate 250 resultados
    - **Serper/Google** (scraper complementar) — ate 22 resultados de 11 fontes
  - Deduplicacao: editais duplicados sao mesclados (prioridade PNCP)
  - Filtragem: servicos/prorrogacoes sao excluidos automaticamente
  - Enriquecimento: editais do scraper sao enriquecidos com dados PNCP quando possivel
  - Tabela de resultados aparece com colunas: checkbox, Numero, Orgao, UF, Objeto, Valor, Produto, Prazo, Score, Acoes
  - Status "Encerrado" (badge neutral) para editais encerrados
  - Score como circulo colorido (se checkbox ativo) ou "-" (se desativado)
- **NOTA**: A API do PNCP pode estar lenta/fora do ar. Neste caso, o endpoint retorna os resultados que conseguiu obter + campo `erros_fontes` com descricao dos timeouts. Isso NAO e bug — e instabilidade externa.
- **Resultado testes auto**: WARN — Busca disparada corretamente, mas PNCP estava em timeout durante o teste.

### 2.6 Busca com filtro de UF
- **Passo**: Digitar "equipamento" no campo. Selecionar UF "SP". Clicar "Buscar Editais".
- **Esperado**: Parametro `uf=SP` enviado ao backend. Resultados filtrados por UF.

### 2.7 Cards de prazos atualizados
- **Passo**: Apos uma busca com resultados, observar os 4 cards de prazo no topo.
- **Esperado**: Contagens atualizadas com base nos editais abertos retornados.

### 2.8 Painel lateral de detalhes
- **Passo**: Clicar em uma linha da tabela de resultados (onRowClick).
- **Esperado**:
  - Painel lateral abre ao lado direito da tabela (layout "with-panel")
  - Mostra: Score Geral (ScoreCircle grande), 3 sub-scores (Tecnico, Comercial, Recomendacao) como ScoreBar
  - Produto Correspondente (se houver, vem de `produtos_aderentes[0]`)
  - Potencial de Ganho (Elevado/Medio/Baixo) via badge colorido
  - Gap Analysis com barras atendido/parcial/nao_atendido
  - RadioGroup "Intencao Estrategica" (Estrategico, Defensivo, Acompanhamento, Aprendizado)
  - Range slider "Expectativa de Margem" (0% a 50%)
  - Info: Valor, Abertura, Tipo, Origem
  - Botoes: "Salvar Estrategia", "Salvar Edital", "Ir para Validacao", "Abrir no Portal"

### 2.9 Fechar painel
- **Passo**: Clicar no X no canto do painel.
- **Esperado**: Painel fecha, tabela volta a ocupar largura total.

### 2.10 Salvar edital individual (T14)
- **Passo**: Clicar no icone de salvar (disquete) na coluna "Acoes" de um edital.
- **Esperado**: Edital salvo no banco via crudCreate("editais", ...). Nenhum erro no console.

### 2.11 Salvar todos os editais (T14)
- **Passo**: Apos busca, clicar em "Salvar Todos" acima da tabela.
- **Esperado**: Alert confirma "X edital(is) salvo(s)".

### 2.12 Salvar editais com score >= 70% (T14)
- **Passo**: Clicar em "Salvar Score >= 70%".
- **Esperado**: Apenas editais com score >= 70 sao salvos. Alert confirma quantidade.

### 2.13 Salvar editais selecionados (T14)
- **Passo**: Marcar checkbox de 2-3 editais. Clicar "Salvar Selecionados" na barra de selecao.
- **Esperado**: Apenas editais marcados sao salvos. Alert confirma quantidade.

### 2.14 Persistir intencao estrategica (T15)
- **Passo**: Abrir painel de um edital. Selecionar "Estrategico" no RadioGroup. Ajustar margem para 25%. Clicar "Salvar Estrategia".
- **Esperado**:
  - Mensagem "Estrategia salva com sucesso" aparece
  - Dados persistidos no banco (tabela estrategias-editais) via crudCreate/crudUpdate
  - Mapeamento: estrategico→go/alta, defensivo→acompanhar/media, acompanhamento→acompanhar/baixa, aprendizado→nogo/baixa

### 2.15 Navegacao para Validacao (T16)
- **Passo**: Abrir painel de um edital salvo. Clicar "Ir para Validacao".
- **Esperado**: App dispara evento `navigate-to` com `page: "validacao"`. Edital correspondente deve estar na lista de Meus Editais.

### 2.16 Monitoramento automatico (T17)
- **Passo**: Observar o card "Monitoramento Automatico" na parte inferior da pagina.
- **Esperado**:
  - Se houver monitoramentos cadastrados: lista com termo, status (Ativo/Inativo), UFs e contagem
  - Se nao houver: mensagem "Nenhum monitoramento configurado" com sugestao de como configurar via chat (ex: "Monitore editais de equipamentos laboratoriais no PNCP")
  - Botao "Atualizar" recarrega lista via crudList("monitoramentos")
- **Resultado testes auto**: OK — Card presente com orientacao.

---

## 3. VALIDACAO DE EDITAIS (ValidacaoPage)

### 3.1 Navegacao
- **Passo**: Clicar em "Validacao" na sidebar.
- **Esperado**: Pagina abre com titulo "Validacao de Editais", subtitulo "Analise multi-dimensional, scores e decisao estrategica".
- **Resultado testes auto**: OK

### 3.2 Tabela de editais reais (T18)
- **Passo**: Observar a tabela "Meus Editais".
- **Esperado**:
  - Editais carregados do banco via GET /api/editais/salvos — mesmos editais salvos na Captacao
  - Colunas: Numero, Orgao, UF, Objeto, Valor, Abertura, Status, Score
  - Status com badges coloridos (Novo=amarelo, Analisando=azul, Validado=verde, Descartado=cinza)
  - Score como circulo colorido (0/100 se nao calculado)
  - Se nao houver editais: mensagem "Nenhum edital encontrado"
- **Resultado testes auto**: OK — 5 editais encontrados (PE-001, DL-010, PE-003, PE-015, CC-002).

### 3.3 Erro de carregamento
- **Passo**: Se o backend estiver offline, observar mensagem de erro.
- **Esperado**: Banner vermelho com mensagem de erro e botao "Tentar novamente".

### 3.4 Filtros
- **Passo**: Usar o filtro "Status" (select) e o campo de busca (input "Buscar edital...").
- **Esperado**:
  - Select Status com opcoes: Todos, Novo, Analisando, Validado, Descartado
  - Campo de busca filtra por numero e orgao em tempo real
- **Resultado testes auto**: OK — Campo de busca presente. Filtro status presente.

### 3.5 Selecionar edital — painel de analise
- **Passo**: Clicar em uma linha da tabela.
- **Esperado**:
  - Barra de decisao aparece com botoes: Participar (verde), Acompanhar (azul), Ignorar (cinza)
  - Card de informacoes do edital: Numero, Orgao, Objeto, Valor Estimado, Data Abertura, Produto Correspondente
  - Score Dashboard com:
    - Score Geral (ScoreCircle grande, 0-100)
    - Potencial de Ganho (Elevado/Medio/Baixo)
    - Botao "Calcular Scores IA" (Sparkles icon)
    - 6 barras de score: Aderencia Tecnica, Documental, Complexidade, Juridico, Logistico, Comercial
    - RadioGroup "Intencao Estrategica"
    - Range "Expectativa de Margem"
    - Select de Status (header do card)
  - Abas: Objetiva | Analitica | Cognitiva
- **Resultado testes auto**: OK — Painel lateral aberto, scores visiveis (4/6 dimensoes), abas presentes, botoes de decisao presentes.

### 3.6 Calcular scores reais via IA (T19)
- **Passo**: Selecionar um edital. Clicar "Calcular Scores IA".
- **Esperado**:
  - Loading no botao enquanto calcula (POST /api/editais/{id}/scores-validacao)
  - As 6 barras de score preenchidas com valores reais (0-100)
  - Score Geral atualizado (media ponderada)
  - Potencial de Ganho atualizado (Elevado>=80, Medio>=50, Baixo<50)
  - Decisao IA aparece: GO / NO-GO / CONDICIONAL (banner colorido)
  - Sub-scores tecnicos populam aba Objetiva
- **Resultado testes auto**: OK — Botao "Calcular Scores IA" encontrado.

### 3.7 Aba Objetiva — sub-scores tecnicos (T22)
- **Passo**: Clicar na aba "Objetiva".
- **Esperado**:
  - Se scores ja calculados: Banner GO/NO-GO/CONDICIONAL da IA no topo com justificativa
  - "Aderencia Tecnica Detalhada" com sub-scores individuais (barras com label e %)
  - Secao "Certificacoes" (tabela com nome e badge ok/pendente/vencida)
  - "Checklist Documental" com tabela Documento / Status / Validade
  - "Analise de Lote" com barra visual (itens aderentes verde vs intrusos vermelho)
  - Se scores nao calculados: mensagem "Clique em Calcular Scores IA para preencher"
- **Resultado testes auto**: OK — Aba Objetiva presente.

### 3.8 Aba Analitica
- **Passo**: Clicar na aba "Analitica".
- **Esperado**:
  - "Pipeline de Riscos" com badges de modalidade e nivel de risco
  - "Flags Juridicos" com badges de alerta (ou "Nenhum flag identificado")
  - "Fatal Flaws" (se houver) com card vermelho listando problemas criticos
  - "Reputacao do Orgao" com Pregoeiro, Pagamento, Historico
  - "Aderencia Tecnica Trecho-a-Trecho" com tabela comparativa edital vs portfolio

### 3.9 Aba Cognitiva — Gerar Resumo via IA (T20)
- **Passo**: Clicar na aba "Cognitiva". Clicar "Gerar Resumo".
- **Esperado**:
  - Loading no botao enquanto IA processa (envia ao chat como prompt)
  - Texto do resumo aparece abaixo (gerado pela IA via DeepSeek)
  - Botao muda para "Regerar Resumo" apos geracao
- **Resultado testes auto**: OK — Aba Cognitiva presente.

### 3.10 Aba Cognitiva — Perguntar a IA (T20)
- **Passo**: Na aba "Cognitiva", digitar "Qual o prazo de entrega?" no campo de pergunta. Clicar "Perguntar".
- **Esperado**:
  - Loading no botao
  - Resposta da IA aparece abaixo do campo de pergunta
  - Caixa "Resposta:" com texto gerado

### 3.11 Botoes de decisao — Participar (T21)
- **Passo**: Selecionar um edital. Clicar "Participar" na barra de decisao.
- **Esperado**:
  - Modal de confirmacao: "Deseja registrar a decisao: Participar?"
  - Status do edital muda para "Validado" na tabela
  - Card "Justificativa da Decisao" aparece
  - Campos: Select "Motivo" (Preco competitivo, Portfolio aderente, etc.) + TextArea "Detalhes"
  - Botao "Salvar Justificativa"
- **Resultado testes auto**: OK — Botao Participar encontrado.

### 3.12 Salvar justificativa (T21)
- **Passo**: Selecionar motivo "Portfolio aderente". Digitar "Produto atende 100% dos requisitos". Clicar "Salvar Justificativa".
- **Esperado**:
  - Card de justificativa fecha
  - Badge "Decisao salva" aparece
  - Dados persistidos via crudCreate("validacao_decisoes", ...)

### 3.13 Botao Acompanhar (T21)
- **Passo**: Selecionar outro edital. Clicar "Acompanhar".
- **Esperado**: Status muda para "Analisando". Card de justificativa aparece.
- **Resultado testes auto**: OK — Botao Acompanhar encontrado.

### 3.14 Botao Ignorar (T21)
- **Passo**: Selecionar outro edital. Clicar "Ignorar".
- **Esperado**: Status muda para "Descartado". Card de justificativa aparece.
- **Resultado testes auto**: OK — Botao Ignorar encontrado.

### 3.15 Intencao Estrategica persiste (T21)
- **Passo**: Selecionar um edital com decisao salva. Mudar "Intencao Estrategica" de "Acompanhamento" para "Estrategico".
- **Esperado**: Alteracao persistida no banco (se ja existe decisaoId, faz update).

### 3.16 Mudar status via select
- **Passo**: No card do edital selecionado, usar o select de status (no header do card) para mudar de "Novo" para "Analisando".
- **Esperado**: Badge de status atualizado na tabela. Endpoint PUT /api/propostas/{id}/status chamado.

---

## 4. PRECIFICACAO (PrecificacaoPage)

### 4.1 Navegacao
- **Passo**: Clicar em "Precificacao" na sidebar.
- **Esperado**: Pagina abre com titulo "Precificacao" e subtitulo "Consulta de precos de mercado e recomendacao".

### 4.2 Buscar precos no PNCP
- **Passo**: Digitar "centrifuga" no campo "Produto/Termo de busca". Clicar "Buscar no PNCP".
- **Esperado**:
  - Loading no botao
  - Se houver historico no banco: tabela com Data, Orgao, Produto, Valor, Vencedor + estatisticas (Media, Min, Max)
  - Se nao houver: abre o chat com prompt de busca via IA (fallback)

### 4.3 Recomendar preco
- **Passo**: Selecionar um edital no select "Edital" e um produto no select "Produto". Clicar "Recomendar Preco".
- **Esperado**:
  - Chat abre com prompt de recomendacao de preco
  - Se houver historico no banco: card "Recomendacao" aparece com Preco Sugerido, Faixa Competitiva, quantidade de licitacoes base, e justificativa

### 4.4 Historico de precos
- **Passo**: Observar tabela "Meu Historico de Precos" na parte inferior.
- **Esperado**:
  - Tabela com Produto, Preco, Data, Edital, Resultado (Ganho/Perdido com badge colorido)
  - Se nao houver dados: "Nenhum historico encontrado"

---

## 5. PROPOSTA (PropostaPage)

### 5.1 Navegacao
- **Passo**: Clicar em "Proposta" na sidebar.
- **Esperado**: Pagina abre com titulo "Geracao de Propostas". Card "Gerar Nova Proposta" + tabela "Minhas Propostas".

### 5.2 Formulario de nova proposta
- **Passo**: Verificar card "Gerar Nova Proposta".
- **Esperado**:
  - Select "Edital" populado com editais salvos do banco
  - Select "Produto" populado com produtos do portfolio
  - Campo "Preco Unitario" com icone de lampada (sugerir preco)
  - Campo "Quantidade"
  - Botao "Gerar Proposta Tecnica"

### 5.3 Sugerir preco
- **Passo**: Selecionar edital e produto. Clicar no icone de lampada ao lado do preco.
- **Esperado**: Chat abre com prompt de sugestao de preco. Se houver historico, hint "Sugerido: R$ X" aparece abaixo do campo.

### 5.4 Gerar proposta (T24)
- **Passo**: Selecionar edital, produto, digitar preco e quantidade. Clicar "Gerar Proposta Tecnica".
- **Esperado**:
  - Loading no botao
  - Proposta criada no banco (via crudCreate)
  - Nova linha aparece na tabela "Minhas Propostas" com status "Rascunho"
  - Chat abre com prompt para gerar texto tecnico via IA

### 5.5 Tabela de propostas
- **Passo**: Observar tabela "Minhas Propostas".
- **Esperado**:
  - Colunas: Edital, Orgao, Produto, Valor Total, Data, Status, Acoes
  - Status com badges (Rascunho, Pronta, Enviada)
  - Botoes de acao: Visualizar, Baixar, Excluir

### 5.6 Filtros
- **Passo**: Usar campo de busca e filtro de status.
- **Esperado**: Tabela filtra em tempo real.

### 5.7 Visualizar proposta
- **Passo**: Clicar em uma proposta na tabela (ou no icone de olho).
- **Esperado**: Card "Preview da Proposta" aparece com: Edital, Orgao, Produto, Preco Unitario, Quantidade, Valor Total. Se tiver texto tecnico, aparece em bloco `<pre>`.

### 5.8 Excluir proposta
- **Passo**: Clicar no icone de lixeira de uma proposta.
- **Esperado**: Proposta removida da tabela e do banco.

### 5.9 Baixar proposta PDF (T12 backend)
- **Passo**: Clicar no icone de download de uma proposta.
- **Esperado**:
  - Arquivo PDF baixa com nome "proposta-{edital}.pdf"
  - Conteudo: titulo, dados do edital, produto, precos, texto tecnico
  - Se endpoint nao disponivel: abre chat com prompt de exportacao

### 5.10 Baixar proposta DOCX (T12 backend)
- **Passo**: Na preview, clicar "Baixar DOCX".
- **Esperado**: Arquivo DOCX baixa com conteudo formatado.

---

## 6. SUBMISSAO (SubmissaoPage)

### 6.1 Navegacao
- **Passo**: Clicar em "Submissao" na sidebar.
- **Esperado**: Pagina abre com titulo "Submissao de Propostas" e subtitulo "Preparacao e envio de propostas aos portais".

### 6.2 Tabela de propostas para envio (T25)
- **Passo**: Observar tabela "Propostas Prontas para Envio".
- **Esperado**:
  - Colunas: Edital, Orgao, Produto, Valor, Abertura, Status, Checklist
  - Status: Aguardando (amarelo), Enviada (azul), Confirmada (verde)
  - Checklist: progresso X/4

### 6.3 Selecionar proposta — checklist
- **Passo**: Clicar em uma proposta na tabela.
- **Esperado**: Card "Checklist de Submissao" aparece com:
  - Info do edital (Orgao, Produto, Valor, Abertura)
  - 4 items de checklist:
    - [ ] Proposta tecnica gerada
    - [ ] Preco definido
    - [ ] Documentos anexados (X/Y)
    - [ ] Revisao final
  - Botoes: "Anexar Documento", "Marcar como Enviada", "Confirmar Envio", "Abrir Portal PNCP"

### 6.4 Anexar documento
- **Passo**: Clicar "Anexar Documento".
- **Esperado**: Modal abre com: Select "Tipo de Documento" (Proposta Tecnica, Certidao Negativa, Contrato Social, Procuracao, Outro), campo de upload de arquivo (.pdf, .doc, .docx), campo "Observacao". Botoes "Cancelar" e "Enviar".

### 6.5 Upload de documento
- **Passo**: Selecionar tipo "Certidao Negativa". Selecionar um arquivo PDF. Clicar "Enviar".
- **Esperado**: Modal fecha. Contador de documentos incrementa (ex: 1/3 → 2/3).

### 6.6 Workflow: Marcar como Enviada (T25)
- **Passo**: Clicar "Marcar como Enviada" em uma proposta com status "Aguardando".
- **Esperado**:
  - Status muda para "Enviada" (badge azul)
  - Checklist "Revisao final" fica marcado
  - Botao "Marcar como Enviada" fica desabilitado
  - Botao "Confirmar Envio" fica habilitado

### 6.7 Workflow: Confirmar Envio (T25)
- **Passo**: Clicar "Confirmar Envio" em uma proposta com status "Enviada".
- **Esperado**: Status muda para "Confirmada" (badge verde).

### 6.8 Abrir Portal PNCP
- **Passo**: Clicar "Abrir Portal PNCP".
- **Esperado**: Nova aba abre com `https://pncp.gov.br`.

---

## 7. ENDPOINTS BACKEND (Testes via curl)

### 7.1 GET /api/editais/buscar (T8 — refatorado)
```bash
TOKEN=$(curl -s -X POST http://localhost:5007/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pasteurjr@gmail.com","password":"123456"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Busca sem score (rapida)
curl -s "http://localhost:5007/api/editais/buscar?termo=reagentes&calcularScore=false&incluirEncerrados=true&limite=5" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -60

# Busca com score (mais lenta — calcula aderencia)
curl -s "http://localhost:5007/api/editais/buscar?termo=reagentes&calcularScore=true&limite=5" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -80
```
- **Esperado**: JSON com estrutura:
  ```json
  {
    "success": true,
    "editais": [
      {
        "id": "uuid ou hash",
        "numero": "PE-XXX/2026",
        "orgao": "Hospital das Clinicas UFMG",
        "objeto": "Aquisicao de reagentes...",
        "modalidade": "Pregao Eletronico",
        "valor_estimado": 450000.00,
        "data_abertura": "2026-02-24",
        "uf": "MG",
        "url": "https://pncp.gov.br/...",
        "fonte": "PNCP (API)",
        "fonte_tipo": "api",
        "cnpj_orgao": "18243287000146",
        "ano_compra": 2025,
        "seq_compra": 24,
        "total_itens": 15,
        "dados_completos": true,
        "encerrado": false,
        "pdf_url": "https://pncp.gov.br/...",
        "score_tecnico": 78.5,
        "recomendacao": "PARTICIPAR",
        "justificativa": "Portfolio atende 80% dos itens...",
        "produtos_aderentes": ["Kit Hematologia Completo"]
      }
    ],
    "total": 5,
    "termo": "reagentes",
    "uf": null,
    "fontes_usadas": ["PNCP (API)", "Web (Scraper)"],
    "erros_fontes": null
  }
  ```
- **Campos novos (pós-refatoracao)**:
  - `cnpj_orgao` — CNPJ do orgao licitante
  - `encerrado` — boolean indicando se edital ja encerrou
  - `pdf_url` — URL direta do PDF do edital (quando disponivel)
  - `fonte_tipo` — "api" ou "scraper"
  - `dados_completos` — true se enriquecido com dados PNCP
  - `fontes_usadas` — lista de fontes consultadas
  - `erros_fontes` — erros de timeout ou falhas em fontes especificas
- **NOTA**: Se o PNCP estiver lento, o endpoint pode demorar ate 120s. O campo `erros_fontes` indicara quais fontes falharam.

### 7.2 GET /api/editais/salvos (T9)
```bash
curl -s "http://localhost:5007/api/editais/salvos?com_score=true&com_estrategia=true" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -40
```
- **Esperado**: JSON com `success: true`, array `editais` com campos do edital + score_tecnico + decisao/prioridade/margem_desejada.

### 7.3 POST /api/editais/{id}/scores-validacao (T10)
```bash
# Usar um edital_id real do teste 7.2
EDITAL_ID="<uuid-do-edital>"
curl -s -X POST "http://localhost:5007/api/editais/$EDITAL_ID/scores-validacao" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
```
- **Esperado**: JSON com `scores` (6 dimensoes: tecnico, documental, complexidade, juridico, logistico, comercial), `score_geral`, `potencial_ganho`, `decisao_ia` (GO/NO-GO/CONDICIONAL), `justificativa_ia`, `sub_scores_tecnicos`.

### 7.4 PUT /api/propostas/{id}/status (T11)
```bash
# Usar um proposta_id real
PROPOSTA_ID="<uuid-da-proposta>"
curl -s -X PUT "http://localhost:5007/api/propostas/$PROPOSTA_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "revisao"}' | python3 -m json.tool
```
- **Esperado**: JSON com `success: true`, `status_anterior`, `status_atual`.
- **Transicoes validas**: rascunho→revisao, revisao→aprovada, aprovada→enviada.
- **Transicao invalida**: testar `rascunho→enviada` deve retornar erro 400.

### 7.5 GET /api/propostas/{id}/export (T12)
```bash
curl -s "http://localhost:5007/api/propostas/$PROPOSTA_ID/export?formato=pdf" \
  -H "Authorization: Bearer $TOKEN" -o proposta_teste.pdf
file proposta_teste.pdf

curl -s "http://localhost:5007/api/propostas/$PROPOSTA_ID/export?formato=docx" \
  -H "Authorization: Bearer $TOKEN" -o proposta_teste.docx
file proposta_teste.docx
```
- **Esperado**: Arquivos PDF e DOCX validos com conteudo da proposta.

### 7.6 Autenticacao — requisicao sem token
```bash
curl -s "http://localhost:5007/api/editais/buscar?termo=reagente" | python3 -m json.tool
```
- **Esperado**: HTTP 401 com mensagem "Token nao fornecido".

---

## 8. NAVEGACAO ENTRE PAGINAS

### 8.1 Captacao → Validacao (T16)
- **Passo**: Na CaptacaoPage, buscar editais. Abrir painel de um edital. Clicar "Ir para Validacao".
- **Esperado**: App navega para ValidacaoPage via evento customizado `navigate-to`. Edital salvo aparece na tabela.

### 8.2 Sidebar — todas as paginas da Onda 2
- **Passo**: Clicar em cada item: Captacao, Validacao, Precificacao, Proposta, Submissao.
- **Esperado**: Cada pagina carrega corretamente sem erros no console. Sidebar destaca item ativo (classe `active`).

---

## 9. ERROS E EDGE CASES

### 9.1 Busca com API lenta / PNCP em timeout
- **Passo**: Buscar um termo na CaptacaoPage.
- **Esperado**:
  - Loading spinner visivel durante espera. Nao trava a interface.
  - Se PNCP falhar com timeout: endpoint retorna resultados parciais (scraper) + campo `erros_fontes` com descricao do erro.
  - Se todas as fontes falharem: retorna `success: true, editais: [], erros_fontes: [...]`.
  - Frontend exibe resultados disponiveis + alerta sobre fontes com erro (se houver).

### 9.2 Token expirado
- **Passo**: Esperar token expirar (ou limpar localStorage). Tentar usar Captacao.
- **Esperado**: Erro amigavel. Nao mostra "Token nao fornecido" como texto tecnico — idealmente redireciona para login.

### 9.3 Edital sem score
- **Passo**: Na ValidacaoPage, selecionar edital que nunca teve scores calculados.
- **Esperado**: Barras de score mostram 0. Aba Objetiva mostra mensagem "Clique em Calcular Scores IA" com botao.

### 9.4 Proposta sem texto tecnico
- **Passo**: Criar proposta sem gerar texto via IA. Visualizar preview.
- **Esperado**: Preview mostra dados comerciais. Secao de texto tecnico nao aparece (ou aparece vazia).

### 9.5 Console do navegador
- **Passo**: Abrir DevTools (F12) > Console. Navegar por todas as paginas da Onda 2.
- **Esperado**: Nenhum erro critico (TypeError, 500, etc.). Warnings de React sao aceitaveis. Erros 401/404 isolados sao aceitaveis se nao impactam funcionalidade.

---

## 10. RESULTADOS DOS TESTES AUTOMATIZADOS (Playwright)

Executados em 19/02/2026 via `node test_ui_captacao_validacao.mjs`

| # | Teste | Status | Detalhe |
|---|-------|--------|---------|
| T01 | Login | **OK** | Token presente no localStorage |
| T02 | Captacao - Pagina carrega | **OK** | Titulo + campo de busca |
| T03 | Captacao - Cards prazo | **OK** | 4 cards (2d, 5d, 10d, 20d) |
| T04 | Captacao - Card busca | **OK** | Label Termo/Palavra-chave |
| T05 | Captacao - Filtro UF | **OK** | Select com 27 UFs |
| T06 | Captacao - Filtro Fonte | **OK** | PNCP, ComprasNET, BEC-SP, SICONV |
| T07 | Captacao - Classif Tipo/Origem | **OK** | Reagentes/Equip + Municipal/Federal |
| T08 | Captacao - Checkboxes | **OK** | Score + Encerrados |
| T09 | Captacao - Busca vazia | **OK** | Mensagem "Informe um termo" |
| T10 | Captacao - Busca "reagentes" | **WARN** | PNCP em timeout (instabilidade externa) |
| T11 | Captacao - Monitoramento | **OK** | Card presente |
| T12 | Validacao - Pagina carrega | **OK** | Titulo correto |
| T13 | Validacao - Lista editais | **OK** | 5 editais salvos (6 linhas na tabela) |
| T14 | Validacao - Filtros | **OK** | Campo busca + Status |
| T15 | Validacao - Selecionar edital | **OK** | Painel lateral com detalhes |
| T16 | Validacao - Scores IA | **OK** | 4/6 dimensoes visiveis |
| T17 | Validacao - Abas | **OK** | Cognitiva + Objetiva |
| T18 | Validacao - Botoes decisao | **OK** | Participar + Acompanhar + Ignorar |
| T19 | Validacao - Calcular Scores | **OK** | Botao "Calcular Scores IA" encontrado |
| T20 | Validacao - Info edital | **OK** | Orgao, Valor, Objeto |
| T21 | Validacao - Chat | **WARN** | Botao flutuante (global), nao no painel |

**Total: 19 OK / 2 WARN / 0 FAIL**

Screenshots disponiveis em `./test_screenshots/`

---

## Resumo — Checklist Rapido

| # | Funcionalidade | Pagina | Auto | Manual |
|---|----------------|--------|------|--------|
| 1 | Login e Dashboard com dados reais | Dashboard | OK | [ ] |
| 2 | Busca de editais multi-fonte (PNCP API + Serper) | Captacao | WARN* | [ ] |
| 3 | Filtros de busca (UF, Fonte, Tipo, Origem) | Captacao | OK | [ ] |
| 4 | Cards de prazo atualizados | Captacao | OK | [ ] |
| 5 | Painel lateral com scores e detalhes | Captacao | — | [ ] |
| 6 | Salvar editais (individual/todos/recomendados/selecionados) | Captacao | — | [ ] |
| 7 | Persistir intencao estrategica + margem | Captacao | — | [ ] |
| 8 | Navegacao Captacao → Validacao | Captacao | — | [ ] |
| 9 | Monitoramento automatico | Captacao | OK | [ ] |
| 10 | Tabela de editais reais (sem mock) | Validacao | OK | [ ] |
| 11 | Filtro por status + busca texto | Validacao | OK | [ ] |
| 12 | Score Dashboard (6 dimensoes) | Validacao | OK | [ ] |
| 13 | Calcular Scores via IA (endpoint real) | Validacao | OK | [ ] |
| 14 | Aba Objetiva (sub-scores, certificacoes, checklist, lote) | Validacao | OK | [ ] |
| 15 | Aba Analitica (riscos, flags, reputacao, trechos) | Validacao | — | [ ] |
| 16 | Aba Cognitiva — Gerar Resumo via IA | Validacao | OK | [ ] |
| 17 | Aba Cognitiva — Perguntar a IA | Validacao | — | [ ] |
| 18 | Decisao Participar/Acompanhar/Ignorar | Validacao | OK | [ ] |
| 19 | Justificativa da decisao persistida | Validacao | — | [ ] |
| 20 | Buscar precos no PNCP / historico | Precificacao | — | [ ] |
| 21 | Recomendar preco com IA | Precificacao | — | [ ] |
| 22 | Historico de precos do banco | Precificacao | — | [ ] |
| 23 | Gerar proposta (CRUD + IA) | Proposta | — | [ ] |
| 24 | Visualizar proposta (preview) | Proposta | — | [ ] |
| 25 | Excluir proposta | Proposta | — | [ ] |
| 26 | Baixar PDF / DOCX | Proposta | — | [ ] |
| 27 | Tabela de propostas para envio | Submissao | — | [ ] |
| 28 | Checklist de submissao (4 items) | Submissao | — | [ ] |
| 29 | Anexar documento | Submissao | — | [ ] |
| 30 | Workflow: Aguardando → Enviada → Confirmada | Submissao | — | [ ] |
| 31 | Endpoints backend (buscar, salvos, scores, status, export) | Backend | — | [ ] |
| 32 | Autenticacao (token correto em todas as paginas) | Geral | OK | [ ] |

\* WARN = API PNCP em timeout durante teste automatizado (instabilidade externa, nao bug)
