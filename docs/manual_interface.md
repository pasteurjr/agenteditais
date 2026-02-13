# Manual do Usuario - facilicita.ia

**Versao:** 1.0
**Data:** Fevereiro 2026

---

## Sumario

1. [Introducao](#1-introducao)
2. [Dashboard](#2-dashboard)
3. [Dr. Licita (Assistente IA)](#3-dr-licita-assistente-ia)
4. [Fluxo Comercial](#4-fluxo-comercial)
   - 4.1 [Captacao](#41-captacao)
   - 4.2 [Validacao](#42-validacao)
   - 4.3 [Precificacao](#43-precificacao)
   - 4.4 [Proposta](#44-proposta)
   - 4.5 [Submissao](#45-submissao)
   - 4.6 [Lances](#46-lances)
   - 4.7 [Followup](#47-followup)
   - 4.8 [Impugnacao](#48-impugnacao)
   - 4.9 [Producao](#49-producao)
5. [Indicadores](#5-indicadores)
   - 5.1 [Flags](#51-flags)
   - 5.2 [Monitoria](#52-monitoria)
   - 5.3 [Concorrencia](#53-concorrencia)
   - 5.4 [Mercado](#54-mercado)
   - 5.5 [Contratado X Realizado](#55-contratado-x-realizado)
   - 5.6 [Perdas](#56-perdas)
6. [Configuracoes](#6-configuracoes)
   - 6.1 [Empresa](#61-empresa)
   - 6.2 [Portfolio](#62-portfolio)
   - 6.3 [Parametrizacoes](#63-parametrizacoes)

---

## 1. Introducao

O **facilicita.ia** e um sistema inteligente de gestao de licitacoes publicas. Ele automatiza a captacao, analise e gestao de editais, propostas e contratos, utilizando inteligencia artificial para aumentar a produtividade e taxa de sucesso.

### Navegacao Principal

O sistema possui tres secoes principais acessiveis pela **barra lateral (sidebar)**:

1. **Fluxo Comercial** - Etapas do processo de licitacao
2. **Indicadores** - Metricas, alertas e analises
3. **Configuracoes** - Dados da empresa e parametros do sistema

### Elementos Comuns da Interface

| Elemento | Descricao |
|----------|-----------|
| **Card** | Container com titulo, icone e conteudo agrupado |
| **DataTable** | Tabela de dados com ordenacao e selecao |
| **Modal** | Janela flutuante para formularios e confirmacoes |
| **Status Badge** | Indicador visual de status (cores: verde, amarelo, vermelho) |
| **Score Badge** | Indicador de percentual (verde >= 80%, amarelo 50-79%, vermelho < 50%) |

---

## 2. Dashboard

**Menu:** Dashboard (pagina inicial)

### Descricao

Visao geral consolidada de todas as atividades de licitacao, com KPIs, alertas e insights gerados pela IA.

### Componentes da Tela

#### Editais Urgentes
Painel vermelho mostrando editais com prazos proximos.

| Campo | Descricao |
|-------|-----------|
| Numero | Identificador do edital (ex: PE 045/2024) |
| Orgao | Nome do orgao licitante |
| Prazo | Tempo restante (ex: "2 dias") |
| Valor | Valor estimado do edital |

**Acao:** Clicar em "Ver todos" navega para a tela de Validacao.

#### Funil de Editais
Grafico visual mostrando a quantidade de editais em cada etapa:
- Captacao
- Validacao
- Precificacao
- Proposta
- Submissao
- Ganhos

#### KPIs (Indicadores Chave)
| Indicador | Significado |
|-----------|-------------|
| Em Analise | Quantidade de editais sendo avaliados |
| Propostas | Propostas geradas aguardando envio |
| Ganhos | Licitacoes vencidas |
| Taxa de Sucesso | Percentual de vitorias |
| Valor Total | Soma dos valores dos contratos ganhos |

#### Insights da IA
Analises automaticas geradas pelo sistema, como:
- Tendencias de mercado
- Mudancas na taxa de sucesso
- Novos editais compativeis com o portfolio

**Acao:** Clicar em "Explorar insights" abre o Dr. Licita.

#### Proximos Eventos
Calendario resumido com:
- Datas de abertura de editais
- Prazos de impugnacao
- Sessoes de pregao

---

## 3. Dr. Licita (Assistente IA)

**Acesso:** Botao flutuante no canto inferior direito ou botao "Perguntar ao Dr. Licita" no Dashboard.

### Descricao

O Dr. Licita e o assistente de inteligencia artificial do sistema. Ele pode responder perguntas, executar tarefas automatizadas e auxiliar em todas as etapas do processo de licitacao.

### Interface do Chat

| Elemento | Funcao |
|----------|--------|
| **Botao flutuante** | Abre/fecha o chat |
| **Historico** | Icone de relogio para acessar conversas anteriores |
| **Nova conversa** | Botao "+" para iniciar nova sessao |
| **Expandir** | Amplia a janela do chat |
| **Campo de mensagem** | Area para digitar perguntas ou comandos |
| **Anexar arquivo** | Permite enviar PDFs e documentos |

### Prompts de IA Disponiveis

O Dr. Licita possui mais de 130 comandos organizados por categoria. Ao digitar uma mensagem, um menu dropdown exibe sugestoes contextuais.

#### Principais Categorias de Prompts:

**1. Busca de Editais**
- `buscar_editais_web` - Busca editais com calculo de aderencia ao portfolio
- `buscar_editais_simples` - Busca sem calculo de score
- `buscar_editais_todos` - Inclui editais encerrados
- `salvar_editais` - Salva todos os editais encontrados
- `salvar_editais_recomendados` - Salva apenas editais com score >= 70%

**2. Analise de Editais**
- `resumir_edital` - Gera resumo executivo do edital
- `perguntar_edital` - Faz pergunta especifica sobre o edital
- `calcular_aderencia_edital` - Calcula compatibilidade com portfolio
- `listar_editais` - Lista editais salvos

**3. Precificacao**
- `buscar_precos_pncp` - Consulta precos no Portal Nacional de Compras Publicas
- `recomendar_preco` - Sugere preco competitivo baseado em historico
- `historico_precos` - Exibe historico de precos praticados

**4. Propostas**
- `gerar_proposta` - Gera proposta tecnica automaticamente
- `listar_propostas` - Lista propostas criadas
- `excluir_proposta` - Remove proposta

**5. Alertas e Monitoramento**
- `configurar_alertas` - Cria alertas de prazo
- `listar_alertas` - Lista alertas configurados
- `configurar_monitoramento` - Configura busca automatica de editais
- `dashboard_prazos` - Exibe prazos proximos

**6. Impugnacoes e Recursos**
- `chat_impugnacao` - Gera texto de impugnacao
- `chat_recurso` - Gera texto de recurso administrativo

**7. Resultados**
- `registrar_vitoria` - Registra vitoria em licitacao
- `registrar_derrota` - Registra derrota com motivo
- `consultar_resultado` - Consulta resultado de edital

**8. Portfolio**
- `upload_manual` - Cadastra produto via PDF
- `buscar_produto_web` - Busca especificacoes na web
- `verificar_completude` - Verifica campos faltantes

### Sequencia de Uso

1. Clique no botao flutuante (canto inferior direito)
2. Inicie uma nova conversa ou selecione uma existente
3. Digite sua pergunta ou selecione um prompt do dropdown
4. Aguarde a resposta da IA
5. Anexe documentos se necessario (PDFs de editais, manuais)

---

## 4. Fluxo Comercial

### 4.1 Captacao

**Menu:** Fluxo Comercial > Captacao

### Descricao

Busca e captacao de novos editais em fontes publicas (PNCP, ComprasNET).

### Formulario de Busca

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| Termo / Palavra-chave | Texto | Nao | Palavras para buscar (ex: microscopio, reagente) |
| UF | Selecao | Nao | Estado para filtrar (Todas, MG, SP, RJ, ES) |
| Fonte | Selecao | Nao | Portal de origem (PNCP, ComprasNET, Todas) |

### Opcoes

| Checkbox | Significado |
|----------|-------------|
| Calcular score de aderencia | Compara editais com seu portfolio |
| Incluir editais encerrados | Mostra editais ja finalizados |

### Tabela de Resultados

| Coluna | Descricao |
|--------|-----------|
| Checkbox | Selecao para acoes em lote |
| Numero | Identificador do edital (ex: PE-001/2026) |
| Orgao | Nome do orgao licitante |
| UF | Estado |
| Objeto | Descricao resumida do objeto licitado |
| Valor | Valor estimado em R$ |
| Abertura | Data/hora de abertura do certame |
| Score | Percentual de aderencia ao portfolio (se calculado) |

### Acoes Disponiveis

| Botao | Funcao | Prompt IA |
|-------|--------|-----------|
| Buscar Editais | Executa a busca | `buscar_editais_web` |
| Salvar Todos | Salva todos os resultados | `salvar_editais` |
| Salvar Score >= 70% | Salva apenas recomendados | `salvar_editais_recomendados` |
| Exportar CSV | Exporta para planilha | - |
| Icone olho | Ver detalhes do edital | - |
| Icone disquete | Salvar edital individual | `salvar_edital_especifico` |

### Sequencia de Uso

1. Preencha o termo de busca (opcional)
2. Selecione UF e Fonte desejadas
3. Marque "Calcular score" se quiser analise de aderencia
4. Clique em "Buscar Editais"
5. Analise os resultados na tabela
6. Clique no icone de olho para ver detalhes
7. Salve editais individualmente ou em lote

---

### 4.2 Validacao

**Menu:** Fluxo Comercial > Validacao

### Descricao

Analise, resumo e validacao de editais salvos. Permite perguntar diretamente sobre o edital usando IA.

### Filtros

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Buscar | Texto | Filtra por numero, orgao ou objeto |
| Status | Selecao | Todos, Novo, Analisando, Validado, Descartado |

### Status dos Editais

| Status | Cor | Significado |
|--------|-----|-------------|
| Novo | Azul | Recem-salvo, nao analisado |
| Analisando | Amarelo | Em processo de avaliacao |
| Validado | Verde | Aprovado para participacao |
| Descartado | Vermelho | Nao compativel ou nao interessante |

### Tabela de Editais

| Coluna | Descricao |
|--------|-----------|
| Numero | Identificador do edital |
| Orgao | Orgao licitante |
| UF | Estado |
| Objeto | Descricao do objeto |
| Valor | Valor estimado |
| Abertura | Data de abertura |
| Status | Status atual do edital |
| Score | Aderencia ao portfolio |
| Acoes | Botoes de acao |

### Acoes na Tabela

| Icone | Funcao | Prompt IA |
|-------|--------|-----------|
| Olho | Ver detalhes | - |
| Documento | Resumir | `resumir_edital` |
| Balao | Perguntar | `perguntar_edital` |
| Download | Baixar PDF | `baixar_pdf_edital` |

### Painel de Detalhes

Ao selecionar um edital, exibe:

| Secao | Conteudo |
|-------|----------|
| Informacoes | Numero, Orgao, UF, Valor, Data, Score |
| Objeto | Descricao completa |
| Resumo (IA) | Resumo gerado automaticamente |
| Perguntar ao Edital | Campo para perguntas especificas |

### Botoes de Acao

| Botao | Funcao | Prompt IA |
|-------|--------|-----------|
| Resumir | Gera resumo via IA | `resumir_edital` |
| Baixar PDF | Download do edital | `baixar_pdf_edital` |
| Mudar Status | Dropdown para alterar status | `atualizar_edital` |
| Perguntar | Envia pergunta sobre o edital | `perguntar_edital` |

### Sequencia de Uso

1. Visualize a lista de editais salvos
2. Use os filtros para encontrar editais especificos
3. Clique em um edital para ver detalhes
4. Clique em "Resumir" para gerar resumo via IA
5. Use o campo "Perguntar ao Edital" para tirar duvidas
6. Altere o status conforme avanca a analise
7. Baixe o PDF se necessario

---

### 4.3 Precificacao

**Menu:** Fluxo Comercial > Precificacao

### Descricao

Consulta de precos de mercado no PNCP e recomendacao de precos competitivos.

### Consulta de Precos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Produto/Termo | Texto | Nome do produto para consultar |

**Acao:** Clicar em "Buscar no PNCP"

**Prompt IA:** `buscar_precos_pncp`

### Resultados da Consulta

| Estatistica | Descricao |
|-------------|-----------|
| Preco Medio | Media dos precos encontrados |
| Preco Minimo | Menor preco praticado |
| Preco Maximo | Maior preco praticado |

### Tabela de Precos de Mercado

| Coluna | Descricao |
|--------|-----------|
| Data | Data da licitacao |
| Orgao | Orgao contratante |
| Produto/Termo | Descricao do item |
| Valor | Preco praticado |
| Vencedor | Empresa vencedora |

### Recomendacao de Preco

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Edital | Selecao | Edital para precificar |
| Produto | Selecao | Produto do portfolio |

**Acao:** Clicar em "Recomendar Preco"

**Prompt IA:** `recomendar_preco`

### Resultado da Recomendacao

| Campo | Descricao |
|-------|-----------|
| Preco Sugerido | Valor recomendado pela IA |
| Faixa Competitiva | Intervalo min-max competitivo |
| Baseado em | Quantidade de licitacoes analisadas |
| Justificativa | Explicacao da recomendacao |

### Historico de Precos

Tabela com precos praticados anteriormente:

| Coluna | Descricao |
|--------|-----------|
| Produto | Nome do produto |
| Preco | Valor praticado |
| Data | Data da licitacao |
| Edital | Numero do edital |
| Resultado | Ganho ou Perdido |

---

### 4.4 Proposta

**Menu:** Fluxo Comercial > Proposta

### Descricao

Geracao e gestao de propostas tecnicas.

### Formulario de Nova Proposta

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| Edital | Selecao | Sim | Edital para o qual gerar proposta |
| Produto | Selecao | Sim | Produto do portfolio |
| Preco Unitario | Numero | Sim | Valor unitario proposto |
| Quantidade | Numero | Sim | Quantidade de unidades |

### Botoes de Acao

| Botao | Funcao | Prompt IA |
|-------|--------|-----------|
| Lampada | Sugerir preco | `recomendar_preco` |
| Gerar Proposta Tecnica | Gera documento | `gerar_proposta` |

### Tabela de Propostas

| Coluna | Descricao |
|--------|-----------|
| Edital | Numero do edital |
| Orgao | Orgao licitante |
| Produto | Nome do produto |
| Valor Total | Preco x Quantidade |
| Data | Data de criacao |
| Status | Rascunho, Pronta, Enviada |
| Acoes | Visualizar, Download, Excluir |

### Status das Propostas

| Status | Significado |
|--------|-------------|
| Rascunho | Em elaboracao |
| Pronta | Finalizada, aguardando envio |
| Enviada | Ja submetida ao portal |

### Preview da Proposta

Ao selecionar uma proposta, exibe:
- Cabecalho (Edital, Orgao, Produto, Preco, Quantidade, Valor Total)
- Conteudo da proposta tecnica

### Botoes de Download

| Botao | Funcao |
|-------|--------|
| Baixar DOCX | Exporta em Word |
| Baixar PDF | Exporta em PDF |
| Enviar por Email | Envia para destinatario |

### Sequencia de Uso

1. Selecione o edital no dropdown
2. Escolha o produto do portfolio
3. Clique na lampada para sugestao de preco (opcional)
4. Informe preco unitario e quantidade
5. Clique em "Gerar Proposta Tecnica"
6. Visualize o preview
7. Baixe em DOCX ou PDF
8. Altere status conforme necessario

---

### 4.5 Submissao

**Menu:** Fluxo Comercial > Submissao

### Descricao

Checklist e preparacao para envio de propostas aos portais de licitacao.

### Tabela de Propostas Prontas

| Coluna | Descricao |
|--------|-----------|
| Edital | Numero do edital |
| Orgao | Orgao licitante |
| Produto | Nome do produto |
| Valor | Valor total da proposta |
| Abertura | Data e hora de abertura |
| Status | Aguardando, Enviada, Confirmada |
| Checklist | Progresso (ex: 3/4) |

### Status de Submissao

| Status | Cor | Significado |
|--------|-----|-------------|
| Aguardando | Amarelo | Proposta pronta, nao enviada |
| Enviada | Azul | Submetida ao portal |
| Confirmada | Verde | Confirmacao de recebimento |

### Checklist de Submissao

Ao selecionar uma proposta:

| Item | Descricao |
|------|-----------|
| Proposta tecnica gerada | Documento criado |
| Preco definido | Valor informado |
| Documentos anexados | X de Y documentos |
| Revisao final | Conferencia realizada |

### Acoes Disponiveis

| Botao | Funcao |
|-------|--------|
| Anexar Documento | Abre modal de upload |
| Marcar como Enviada | Altera status |
| Abrir Portal PNCP | Abre site do portal |

### Modal de Anexar Documento

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Tipo de Documento | Selecao | Proposta Tecnica, Certidao Negativa, Contrato Social, Procuracao, Outro |
| Arquivo | Upload | PDF ou DOC |
| Observacao | Texto | Nota opcional |

### Sequencia de Uso

1. Visualize propostas prontas para envio
2. Clique em uma proposta para ver o checklist
3. Anexe documentos faltantes
4. Clique em "Abrir Portal PNCP" para acessar o portal
5. Submeta a proposta manualmente no portal
6. Retorne e clique em "Marcar como Enviada"

---

### 4.6 Lances

**Menu:** Fluxo Comercial > Lances

### Descricao

Acompanhamento de pregoes em andamento e historico de lances.

### Pregoes Hoje

Lista de sessoes de pregao do dia:

| Coluna | Descricao |
|--------|-----------|
| Indicador | Ponto colorido (verde=andamento, amarelo=aguardando, cinza=encerrado) |
| Edital | Numero do edital |
| Orgao | Orgao licitante |
| Hora | Horario da sessao |
| Status | Aguardando, Em andamento, Encerrado |
| Tempo | Tempo restante ate abertura |
| Acao | Botao "Abrir Sala" |

### Estatisticas

| Card | Descricao |
|------|-----------|
| Vitorias | Quantidade de vitorias no periodo |
| Derrotas | Quantidade de derrotas |
| Taxa de Sucesso | Percentual de vitorias |

### Historico de Lances

| Coluna | Descricao |
|--------|-----------|
| Edital | Numero do edital |
| Orgao | Orgao licitante |
| Data | Data do pregao |
| Nosso Lance | Valor do lance dado |
| Lance Vencedor | Valor do lance vencedor |
| Vencedor | Nome da empresa vencedora |
| Resultado | Vitoria ou Derrota |

---

### 4.7 Followup

**Menu:** Fluxo Comercial > Followup

### Descricao

Acompanhamento pos-submissao e registro de resultados.

### Aguardando Resultado

Lista de editais submetidos aguardando resultado:

| Coluna | Descricao |
|--------|-----------|
| Edital | Numero do edital |
| Orgao | Orgao licitante |
| Submetido em | Data da submissao |
| Aguardando | Dias desde a submissao |
| Valor Proposto | Valor da proposta |
| Acoes | Contato, Lembrete, Registrar |

### Registrar Resultado

Modal para registrar o desfecho:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Resultado | Radio | Vitoria, Derrota, Cancelado |

**Se Vitoria:**
| Campo | Descricao |
|-------|-----------|
| Valor Final | Valor do contrato |

**Se Derrota:**
| Campo | Descricao |
|-------|-----------|
| Vencedor | Nome da empresa vencedora |
| Valor Vencedor | Valor do vencedor |
| Motivo | Preco, Tecnico, Documentacao, Prazo, Outro |

### Prompts IA

| Resultado | Prompt |
|-----------|--------|
| Vitoria | `registrar_vitoria` |
| Derrota | `registrar_derrota` |
| Cancelado | `registrar_cancelado` |

### Resultados Registrados

Tabela com historico de resultados:

| Coluna | Descricao |
|--------|-----------|
| Edital | Numero |
| Orgao | Orgao licitante |
| Data | Data do resultado |
| Resultado | Vitoria, Derrota, Cancelado |
| Valor Final | Valor do contrato |
| Vencedor | Empresa vencedora |
| Motivo | Motivo da derrota |

---

### 4.8 Impugnacao

**Menu:** Fluxo Comercial > Impugnacao

### Descricao

Gerenciamento de impugnacoes de edital e recursos administrativos.

### Editais com Prazo de Impugnacao

| Coluna | Descricao |
|--------|-----------|
| Edital | Numero do edital |
| Orgao | Orgao licitante |
| Prazo Impugnacao | Data limite |
| Dias Restantes | Dias ate o prazo (vermelho se <= 3) |
| Status | Pendente, Criada, Enviada |
| Acao | Botao "Criar" |

### Formulario de Impugnacao

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| Tipo | Radio | Sim | Impugnacao do Edital ou Recurso Administrativo |
| Motivo | Texto | Sim | Resumo do motivo (ex: Especificacao restritiva) |
| Fundamentacao | Textarea | Nao | Argumentos detalhados |

### Geracao de Texto com IA

**Botao:** "Gerar Texto com IA"

**Prompts IA:**
- `chat_impugnacao` - Para impugnacoes
- `chat_recurso` - Para recursos

O sistema gera automaticamente:
- Cabecalho formal
- Identificacao do edital
- Motivos e fundamentacao
- Pedidos
- Local e data

### Minhas Impugnacoes e Recursos

| Coluna | Descricao |
|--------|-----------|
| Edital | Numero |
| Tipo | Impugnacao ou Recurso |
| Motivo | Resumo do motivo |
| Data | Data de criacao |
| Status | Rascunho, Pronta, Enviada |

---

### 4.9 Producao

**Menu:** Fluxo Comercial > Producao

### Descricao

Gerenciamento de contratos ganhos em fase de execucao.

### Estatisticas

| Card | Descricao |
|------|-----------|
| Contratos Ativos | Quantidade em execucao |
| Atrasados | Contratos com entrega em atraso |
| Entregues | Contratos finalizados |

### Tabela de Contratos

| Coluna | Descricao |
|--------|-----------|
| Edital | Numero do contrato |
| Orgao | Orgao contratante |
| Produto | Nome do produto |
| Qtd | Quantidade |
| Valor | Valor total |
| Prazo | Data de entrega |
| Dias Rest. | Dias restantes (negativo = atrasado) |
| Status | OK, Atencao, Atrasado, Entregue |
| NF | Nota fiscal anexada (check) |

### Status dos Contratos

| Status | Cor | Significado |
|--------|-----|-------------|
| OK | Verde | Dentro do prazo |
| Atencao | Amarelo | Prazo proximo |
| Atrasado | Vermelho | Prazo expirado |
| Entregue | Azul | Produto entregue |

### Painel de Detalhes

Ao selecionar um contrato:
- Informacoes completas (Edital, Orgao, Produto, Qtd, Valor, Prazo, Status, NF)

### Acoes Disponiveis

| Botao | Funcao |
|-------|--------|
| Registrar Entrega | Marca contrato como entregue |
| Anexar NF | Anexa nota fiscal |
| Ver Historico | Historico do contrato |

---

## 5. Indicadores

### 5.1 Flags

**Menu:** Indicadores > Flags

### Descricao

Visualizacao de alertas ativos e configuracao de lembretes.

### Alertas Ativos

Painel com alertas consolidados:

| Tipo | Cor | Exemplo |
|------|-----|---------|
| Critico | Vermelho | "3 editais vencem em 24h" |
| Atencao | Amarelo | "5 propostas pendentes de envio" |
| Info | Verde | "2 contratos com entrega proxima" |

Cada alerta mostra tags dos editais relacionados.

### Meus Alertas Configurados

| Coluna | Descricao |
|--------|-----------|
| Edital | Numero do edital |
| Tipo | Abertura, Impugnacao, Entrega, Documento |
| Antecedencia | Quando alertar (24h, 1h, 15min) |
| Proximo Disparo | Data/hora do proximo alerta |
| Status | Ativo, Disparado, Expirado |
| Acao | Excluir alerta |

### Criar Alerta

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Edital | Selecao | Edital para monitorar |
| Tipo | Selecao | Tipo de prazo a monitorar |
| Antecedencia | Checkbox | 24h, 1h, 15min |

**Prompt IA:** `configurar_alertas`

---

### 5.2 Monitoria

**Menu:** Indicadores > Monitoria

### Descricao

Configuracao de buscas automaticas de editais.

### Monitoramentos Ativos

| Coluna | Descricao |
|--------|-----------|
| Termo | Palavra-chave monitorada |
| UFs | Estados filtrados |
| Frequencia | Intervalo de busca |
| Ultima Busca | Data/hora da ultima execucao |
| Novos | Quantidade de novos editais encontrados |
| Status | Ativo ou Pausado |
| Acoes | Pausar/Ativar, Excluir |

### Criar Monitoramento

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Termo de busca | Texto | Palavras-chave (ex: microscopio) |
| Estados (UF) | Checkbox | Selecao de estados ou "Todos" |
| Frequencia | Radio | 2h, 6h, 12h, 24h |
| Notificar por | Checkbox | Sistema, Email |

**Prompt IA:** `configurar_monitoramento`, `configurar_monitoramento_uf`

### Ultimos Editais Encontrados

Ao selecionar um monitoramento, exibe os editais recentes:

| Coluna | Descricao |
|--------|-----------|
| Numero | Identificador do edital |
| Orgao | Orgao licitante |
| UF | Estado |
| Objeto | Descricao |
| Termo | Palavra-chave que encontrou |
| Acoes | Ver detalhes, Salvar |

---

### 5.3 Concorrencia

**Menu:** Indicadores > Concorrencia

### Descricao

Inteligencia competitiva e analise de concorrentes.

### Concorrentes Conhecidos

| Coluna | Descricao |
|--------|-----------|
| Empresa | Nome da empresa |
| CNPJ | Numero do CNPJ |
| Vitorias | Quantidade de vitorias |
| Derrotas | Quantidade de derrotas |
| Taxa Sucesso | Percentual de vitorias |
| Ultima Atuacao | Data da ultima participacao |
| Acoes | Ver detalhes, Analise |

### Cores de Taxa de Sucesso

| Faixa | Cor |
|-------|-----|
| >= 60% | Verde |
| 40-59% | Amarelo |
| < 40% | Vermelho |

### Detalhes do Concorrente

Ao selecionar um concorrente:
- Razao Social
- CNPJ
- Area de atuacao
- Taxa de sucesso
- Estatisticas (Vitorias x Derrotas)
- Historico de licitacoes

### Historico do Concorrente

| Coluna | Descricao |
|--------|-----------|
| Data | Data do certame |
| Edital | Numero |
| Orgao | Orgao licitante |
| Valor | Valor do lance/proposta |
| Resultado | Venceu ou Perdeu |
| Nos | Se participamos do mesmo certame |

---

### 5.4 Mercado

**Menu:** Indicadores > Mercado

### Descricao

Tendencias de mercado, demanda e evolucao de precos.

### Estatisticas Gerais

| Card | Descricao |
|------|-----------|
| Editais | Total de editais no periodo |
| Valor Total | Soma dos valores |
| Valor Medio | Media por edital |

### Tendencias de Editais

Grafico de barras mostrando quantidade de editais por mes.

### Categorias Mais Demandadas

| Campo | Descricao |
|-------|-----------|
| Categoria | Nome da categoria |
| Percentual | Participacao no total |
| Quantidade | Numero de editais |
| Valor Medio | Media por edital da categoria |

### Evolucao de Precos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Produto | Selecao | Produto para analisar |
| Periodo | Selecao | 3, 6 ou 12 meses |

Grafico de linha mostrando evolucao do preco medio.

---

### 5.5 Contratado X Realizado

**Menu:** Indicadores > Contratado X Realizado

### Descricao

Comparativo entre valores contratados e efetivamente realizados, alem de pedidos em atraso.

### Resumo

| Campo | Descricao |
|-------|-----------|
| Total Contratado | Soma dos valores contratados |
| Total Realizado | Soma dos valores pagos |
| Variacao | Percentual de diferenca (negativo = economia) |

### Filtro

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Periodo | Selecao | 3, 6 ou 12 meses |

### Detalhamento

| Coluna | Descricao |
|--------|-----------|
| Contrato | Numero do contrato |
| Orgao | Orgao contratante |
| Produto | Nome do produto |
| Contratado | Valor contratado |
| Realizado | Valor pago |
| Variacao | Percentual de diferenca |
| Status | Concluido, Em andamento |

### Pedidos em Atraso

| Coluna | Descricao |
|--------|-----------|
| Contrato | Numero |
| Orgao | Orgao |
| Prazo | Data limite |
| Atraso | Dias de atraso |
| Acao | Botao de contato |

### Proximos Vencimentos

Contratos com entrega proxima (7 dias).

---

### 5.6 Perdas

**Menu:** Indicadores > Perdas

### Descricao

Analise de derrotas e identificacao de padroes.

### Resumo

| Card | Descricao |
|------|-----------|
| Total de Perdas | Quantidade de derrotas |
| Valor Total Perdido | Soma dos valores |
| Taxa de Perda | Percentual de derrotas |

### Filtro

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Periodo | Selecao | 3, 6 ou 12 meses |

### Motivos das Perdas

Grafico de pizza mostrando distribuicao por motivo:

| Motivo | Descricao |
|--------|-----------|
| Preco | Perdeu por valor mais alto |
| Tecnico | Nao atendeu requisito tecnico |
| Documentacao | Problema com documentos |
| Outros | Outros motivos |

### Historico de Perdas

| Coluna | Descricao |
|--------|-----------|
| Edital | Numero |
| Orgao | Orgao licitante |
| Data | Data do resultado |
| Motivo | Razao da perda |
| Diferenca | Diferenca para o vencedor |
| Vencedor | Empresa vencedora |

---

## 6. Configuracoes

### 6.1 Empresa

**Menu:** Configuracoes > Empresa

### Descricao

Cadastro de informacoes da empresa e documentos.

### Informacoes Cadastrais

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| Razao Social | Texto | Sim | Nome oficial da empresa |
| Nome Fantasia | Texto | Nao | Nome comercial |
| CNPJ | Texto | Sim | Numero do CNPJ |
| Inscricao Estadual | Texto | Nao | IE |

### Presenca Digital

| Campo | Descricao |
|-------|-----------|
| Website | Endereco do site |
| Instagram | Usuario (com @) |
| LinkedIn | Perfil da empresa |

### Endereco

| Campo | Descricao |
|-------|-----------|
| Endereco | Logradouro e numero |
| Cidade | Municipio |
| UF | Estado |
| CEP | Codigo postal |
| Telefone | Numero de contato |
| Email | Email principal |

### Documentos da Empresa

| Coluna | Descricao |
|--------|-----------|
| Documento | Nome do documento |
| Validade | Data de vencimento |
| Status | OK, Vence em breve, Falta |
| Acoes | Visualizar, Download, Upload, Excluir |

### Status dos Documentos

| Status | Cor | Significado |
|--------|-----|-------------|
| OK | Verde | Valido e atualizado |
| Vence em breve | Amarelo | Vencimento proximo |
| Falta | Vermelho | Documento nao anexado |

### Tipos de Documento

- Contrato Social
- AFE (Autorizacao de Funcionamento)
- CBPAD
- CBPP
- Corpo de Bombeiros
- Certidao Negativa

### Responsaveis

Lista de pessoas autorizadas:

| Coluna | Descricao |
|--------|-----------|
| Nome | Nome completo |
| Cargo | Funcao na empresa |
| Email | Email do responsavel |
| Acoes | Editar, Excluir |

---

### 6.2 Portfolio

**Menu:** Configuracoes > Portfolio

### Descricao

Cadastro e gestao de produtos e servicos da empresa.

### Acoes Principais

| Botao | Funcao | Prompt IA |
|-------|--------|-----------|
| Upload PDF | Cadastra via manual tecnico | `upload_manual` |
| Buscar na Web | Busca especificacoes online | `buscar_produto_web` |
| Cadastrar Manual | Formulario manual | - |

### Filtros

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Buscar | Texto | Filtra por nome ou fabricante |
| Categoria | Selecao | Todas, Laboratorio, Hospitalar, Reagentes |

### Tabela de Produtos

| Coluna | Descricao |
|--------|-----------|
| Produto | Nome do produto |
| Categoria | Classificacao |
| NCM | Codigo fiscal |
| Completude | Percentual de campos preenchidos |
| Fonte | Origem dos dados (Manual PDF, Web, ANVISA) |
| Acoes | Visualizar, Editar, Reprocessar, Excluir |

### Indicador de Completude

Barra de progresso colorida:
- Verde: >= 80%
- Amarelo: 50-79%
- Vermelho: < 50%

### Detalhes do Produto

| Campo | Descricao |
|-------|-----------|
| Nome | Nome comercial |
| Fabricante | Empresa fabricante |
| Modelo | Codigo do modelo |
| Categoria | Classificacao |
| NCM | Codigo fiscal |
| Fonte | Origem dos dados |

### Especificacoes Tecnicas

Tabela com campos tecnicos:

| Coluna | Descricao |
|--------|-----------|
| Campo | Nome do atributo |
| Valor | Valor do atributo |
| Fonte | IA ou Manual |
| Status | Preenchido ou Faltando |

### Acoes nos Detalhes

| Botao | Funcao | Prompt IA |
|-------|--------|-----------|
| Editar | Abre formulario de edicao | - |
| Reprocessar IA | Refaz extracao de dados | `reprocessar_produto` |
| Verificar Completude | Analisa campos faltantes | `verificar_completude` |

### Modal de Upload PDF

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Arquivo | Upload | PDF do manual tecnico ou datasheet |
| Nome do Produto | Texto | Opcional (sera extraido automaticamente) |

### Modal de Busca Web

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Nome do Produto | Texto | Nome para buscar |
| Fabricante | Texto | Opcional |

---

### 6.3 Parametrizacoes

**Menu:** Configuracoes > Parametrizacoes

### Descricao

Configuracoes gerais do sistema organizadas em abas.

### Aba: Produtos

#### Estrutura de Classificacao

Tabela de classes de produtos:

| Coluna | Descricao |
|--------|-----------|
| Classe | Nome da categoria |
| NCMs | Codigos fiscais relacionados |
| Subclasses | Quantidade de subcategorias |
| Produtos | Quantidade de produtos |

**Acoes:** Nova Classe, Gerar com IA

#### Tipos de Edital Desejados

Checkboxes para selecionar tipos de interesse:
- Comodato de equipamentos
- Venda de equipamentos
- Aluguel com consumo de reagentes
- Consumo de reagentes
- Compra de insumos laboratoriais
- Compra de insumos hospitalares

### Aba: Comercial

#### Regiao de Atuacao

Mapa interativo para selecionar estados de atuacao.

#### Tempo de Entrega

| Campo | Descricao |
|-------|-----------|
| Prazo maximo (dias) | Maximo aceito para participar |
| Frequencia maxima | Diaria, Semanal, Quinzenal, Mensal |

#### Mercado (TAM/SAM/SOM)

| Campo | Descricao |
|-------|-----------|
| TAM | Mercado Total Enderecavel |
| SAM | Mercado Enderecavel Acessivel |
| SOM | Mercado Acessivel Obtivel |

**Acao:** "Calcular com IA baseado no portfolio"

### Aba: Fontes de Busca

#### Fontes de Editais

| Coluna | Descricao |
|--------|-----------|
| Nome | Nome da fonte (ex: PNCP) |
| Tipo | API ou Scraper |
| URL | Endereco do servico |
| Status | Ativa ou Inativa |
| Acoes | Pausar/Ativar, Excluir |

**Acao:** Cadastrar Fonte

#### Palavras-chave de Busca

Tags com palavras-chave para busca automatica.

**Acao:** "Gerar automaticamente do portfolio"

### Aba: Notificacoes

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Email | Texto | Email para notificacoes |
| Receber por | Checkbox | Email, Sistema, SMS |
| Frequencia do resumo | Selecao | Imediato, Diario, Semanal |

### Aba: Preferencias

| Campo | Tipo | Opcoes |
|-------|------|--------|
| Tema | Radio | Escuro, Claro |
| Idioma | Selecao | Portugues, English, Espanol |
| Fuso horario | Selecao | Sao Paulo, Manaus, Belem |

---

## Glossario

| Termo | Definicao |
|-------|-----------|
| **Edital** | Documento que define regras de uma licitacao |
| **Pregao** | Modalidade de licitacao com lances |
| **Score de Aderencia** | Percentual de compatibilidade com portfolio |
| **Impugnacao** | Contestacao ao edital antes da abertura |
| **Recurso** | Contestacao ao resultado apos a abertura |
| **PNCP** | Portal Nacional de Compras Publicas |
| **NCM** | Nomenclatura Comum do Mercosul (codigo fiscal) |
| **Dr. Licita** | Assistente de IA do sistema |

---

## Suporte

Para duvidas ou problemas, utilize o Dr. Licita (chat) ou entre em contato pelo email de suporte.

---

*facilicita.ia - Versao 1.0 - Fevereiro 2026*
