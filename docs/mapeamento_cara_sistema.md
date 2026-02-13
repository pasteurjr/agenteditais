# Mapeamento CARA SISTEMA.pdf

Este documento mapeia cada observacao do PDF "CARA SISTEMA.pdf" (paginas 2-8) para os requisitos, telas e prompts do sistema facilicita.ia.

---

## Sumario

1. [Pagina 2 - Empresa](#pagina-2---empresa)
2. [Pagina 3 - Portfolio](#pagina-3---portfolio)
3. [Pagina 4 - Parametrizacoes](#pagina-4---parametrizacoes)
4. [Pagina 5 - Captacao (Layout e Scores)](#pagina-5---captacao-layout-e-scores)
5. [Pagina 6 - Captacao (Classificacao e Busca)](#pagina-6---captacao-classificacao-e-busca)
6. [Pagina 7 - Validacao (Sinais de Mercado e Analise)](#pagina-7---validacao-sinais-de-mercado-e-analise)
7. [Pagina 8 - Validacao (Aderencias e Riscos)](#pagina-8---validacao-aderencias-e-riscos)

---

## Pagina 2 - Empresa

### Observacao Geral
> "O cadastro da empresa sera importante para gerar fontes de consultas para o portfolio e registrar todas as documentacoes usualmente exigidas para participacao nos editais."

| Item | Observacao PDF | Requisito | Tela | Prompts | Status |
|------|----------------|-----------|------|---------|--------|
| 2.a | **Varias fontes de obtencao do portfolio**: Uploads (manuais, folders, instrucoes de uso); Acesso a ANVISA/registros; Acesso ao banco de plano de contas do ERP; Acesso ao website e redes sociais; Acesso a editais anteriores | FR-001 (Cadastro Portfolio com IA), FR-013 (Interface parametrizacao para cadastro produtos) | **EmpresaPage**, **PortfolioPage** | `upload_manual`, `download_url`, `buscar_produto_web`, `buscar_datasheet_web` | **Parcial** - Upload implementado, falta integracao ANVISA/ERP |
| 2.b | **Cadastro das Diferentes Fontes de Buscas**: Palavras-chave (geradas pela IA em funcao dos nomes dos produtos); Busca pelos NCMs afunilados no portfolio | FR-014 (Busca por NCM, Nome Tecnico, Palavra-chave), FR-002 (Monitoramento 24/7) | **ParametrizacoesPage**, **CaptacaoPage** | `buscar_editais_web`, `buscar_links_editais`, `configurar_monitoramento` | **Parcial** - Busca por termo implementada, falta geracao automatica de palavras-chave |
| 2.c | **Cadastro da estrutura de classificacao/agrupamento dos produtos**: A IA deveria gerar esses agrupamentos caso o cliente nao parametrize | FR-003 (Classificacao parametrizavel de tipos de Editais) | **ParametrizacoesPage** | `classificar_edital`, `classificar_edital_2`, `classificar_edital_3` | **Parcial** - Classificacao manual implementada, falta geracao automatica pela IA |

### Campos de Cadastro da Empresa (Pagina 1 e 2)

| Campo | Tipo | Requisito | Tela | Status |
|-------|------|-----------|------|--------|
| Razao Social | Cadastro | FR-001 | EmpresaPage | **Implementado** |
| CNPJ | Cadastro | FR-001 | EmpresaPage | **Implementado** |
| Inscricao Estadual | Cadastro | FR-001 | EmpresaPage | **Implementado** |
| Website | Cadastro | FR-001 | EmpresaPage | **Implementado** |
| Instagram/LinkedIn/Facebook | Cadastro | FR-001 | EmpresaPage | **Nao implementado** |
| Contrato Social | Upload | FR-019, NFR-004 | EmpresaPage | **Nao implementado** |
| AFE (Autorizacao Funcionamento ANVISA) | Upload | FR-019, NFR-004 | EmpresaPage | **Nao implementado** |
| CBPAD/CBPP | Upload | FR-019, NFR-004 | EmpresaPage | **Nao implementado** |
| Corpo de Bombeiros | Upload | FR-019, NFR-004 | EmpresaPage | **Nao implementado** |

---

## Pagina 3 - Portfolio

### Observacao Geral
> "Etapa mais estrategica" - Base de conhecimento estruturada com IA realizando leitura dos manuais tecnicos.

| Item | Observacao PDF | Requisito | Tela | Prompts | Status |
|------|----------------|-----------|------|---------|--------|
| 3.a | **Varias fontes de obtencao do portfolio**: Uploads (manuais, folders, instrucoes de uso); Acesso a ANVISA; Acesso ao ERP; Acesso ao website e redes sociais; Acesso a editais anteriores | FR-001, FR-013 | **PortfolioPage** | `upload_manual`, `download_url`, `buscar_produto_web`, `buscar_datasheet_web`, `listar_produtos` | **Parcial** |
| - | **Crie uma base de conhecimento estruturada**: Mascara de entrada parametrizavel para cadastrar caracteristicas tecnicas por classe | FR-001, FR-013 | **PortfolioPage** | `reprocessar_produto`, `atualizar_produto`, `verificar_completude` | **Parcial** - Cadastro basico implementado |
| - | **Deixe a IA trabalhar por voce**: IA realiza leitura dos manuais tecnicos e sugere novos campos ou preenche requisitos faltantes | FR-001 (IA para leitura e upload) | **PortfolioPage** | `upload_manual`, `reprocessar_produto` | **Implementado** |
| - | **Monitoramento Continuo 24/7**: Agente de IA monitora diariamente todas as fontes publicas | FR-002 (Monitoramento 24/7) | **MonitoriaPage** | `configurar_monitoramento`, `listar_monitoramentos` | **Implementado** |
| - | **Filtro Inteligente por categorias**: Comodato, Alugueis com/sem consumo, Venda de equipamentos, Consumo de insumos hospitalares | FR-003 (Classificacao parametrizavel) | **ParametrizacoesPage**, **CaptacaoPage** | `classificar_edital` | **Parcial** |

### Tipos de Upload do Portfolio

| Tipo Upload | Requisito | Tela | Prompt | Status |
|-------------|-----------|------|--------|--------|
| Upload de Manuais | FR-001, FR-013 | PortfolioPage | `upload_manual` | **Implementado** |
| Upload de Instrucoes de Uso | FR-001, FR-013 | PortfolioPage | `upload_manual` | **Implementado** |
| Upload NFS | FR-001 | PortfolioPage | - | **Nao implementado** |
| Upload Plano de Contas | FR-001 | PortfolioPage | - | **Nao implementado** |
| Upload Folders | FR-001, FR-013 | PortfolioPage | `upload_manual` | **Implementado** |
| Website de Consultas | FR-001 | PortfolioPage | `buscar_produto_web` | **Implementado** |

### Estrutura de Cadastro do Portfolio

| Campo | Requisito | Tela | Status |
|-------|-----------|------|--------|
| Classe de Produtos | FR-003 | ParametrizacoesPage | **Nao implementado** |
| NCM de cada Classe | FR-014 | ParametrizacoesPage | **Nao implementado** |
| Subclasse de Produtos | FR-003 | ParametrizacoesPage | **Nao implementado** |
| NCM de cada Subclasse | FR-014 | ParametrizacoesPage | **Nao implementado** |

---

## Pagina 4 - Parametrizacoes

### Observacao Geral
> "Etapa chave para geracao dos Scores e apresentacao das oportunidades de forma ordenada"

| Item | Observacao PDF | Requisito | Tela | Prompts | Status |
|------|----------------|-----------|------|---------|--------|
| 4.a | **Cadastro da estrutura de classificacao/agrupamento dos produtos**: A IA deveria gerar esses agrupamentos caso o cliente nao parametrize | FR-003 | **ParametrizacoesPage** | `classificar_edital` | **Parcial** |
| 4.b | **Norteadores do Score de Aderencia Comercial**: Regiao comercial de atuacao; Limitacoes de tempo de entrega | FR-004, BR-004 | **ParametrizacoesPage** | `calcular_aderencia` | **Parcial** - Score existe mas sem parametrizacao comercial |
| 4.c | **Cadastro dos tipos de editais que se deseja participar**: Comodatos, Vendas de Equipamentos, Aluguel com Consumo, Consumo de Reagentes, Insumos laboratoriais/hospitalares | FR-003 | **ParametrizacoesPage** | `classificar_edital` | **Parcial** |
| 4.d | **Norteadores do Score de Aderencia Tecnica**: Cadastro de todas as informacoes tecnicas dos produtos | FR-004, FR-001 | **PortfolioPage**, **ParametrizacoesPage** | `calcular_aderencia`, `verificar_completude` | **Implementado** |
| 4.e | **Norteadores do Score de Recomendacao de Participacao**: Cadastro de todas as fontes solicitadas pelo Edital | FR-004 | **ParametrizacoesPage** | `calcular_aderencia` | **Parcial** |
| 4.f | **Norteadores do Score de Aderencia de Ganho**: (nao detalhado no PDF) | FR-004, FR-012 | **ParametrizacoesPage** | - | **Nao implementado** |

### Secoes de Parametrizacoes

| Secao | Campos | Requisito | Status |
|-------|--------|-----------|--------|
| **Produtos** | Arquitetura das Classes, Arquitetura das Subclasses | FR-003, FR-001 | **Nao implementado** |
| **Comerciais** | Regiao de atuacao, Tempo de entrega, TAM/SAM/SOM | FR-004, BR-004 | **Nao implementado** |

---

## Pagina 5 - Captacao (Layout e Scores)

### Observacao Geral
> "O layout de apresentacao das oportunidades associado aos Scores sera o grande diferencial do sistema. A logica dos Scores sera a diferenciacao."

| Item | Observacao PDF | Requisito | Tela | Prompts | Status |
|------|----------------|-----------|------|---------|--------|
| - | **Painel de Oportunidades**: Lista de licitacoes com produto correspondente e score de aderencia | FR-004, FR-015 | **CaptacaoPage**, **Dashboard** | `buscar_editais_web`, `listar_editais` | **Implementado** |
| - | **Score de Aderencia Tecnica**: % do quanto as especificacoes do produto atendem as exigencias tecnicas do edital | FR-004 | **CaptacaoPage**, **ValidacaoPage** | `calcular_aderencia` | **Implementado** |
| - | **Score de Aderencia Comercial**: Analise de fatores como distancia, frequencia de entrega e custos logisticos | FR-004, BR-004 | **CaptacaoPage**, **ValidacaoPage** | `calcular_aderencia` | **Parcial** |
| - | **Score de Recomendacao de Participacao**: Potencial de ganho consolidado (estrelas 0-5) | FR-004 | **CaptacaoPage** | `calcular_aderencia` | **Parcial** |
| - | **Analise de Gaps**: Requisito X nao atendido, Certificacao Y pendente | FR-004, FR-019 | **CaptacaoPage**, **ValidacaoPage** | `calcular_aderencia`, `verificar_completude` | **Parcial** |
| - | **Potencial de Ganho**: Indicador consolidado (Elevado/Medio/Baixo) | FR-004 | **CaptacaoPage** | - | **Nao implementado** |
| - | **Intencao Estrategica**: Estrategico (entrada novo orgao), Defensivo, Apenas Acompanhamento, Aprendizado | - | **CaptacaoPage** | - | **Nao implementado** |
| - | **Expectativa de Margem**: Slider Media/Baixa, varia por Produto e Regiao | FR-005 | **CaptacaoPage**, **PrecificacaoPage** | `recomendar_preco` | **Parcial** |
| - | **Datas de submissao das propostas**: Proximos 2/5/10/20 dias | FR-008, FR-016 | **FlagsPage**, **Dashboard** | `dashboard_prazos`, `proximos_pregoes` | **Implementado** |

### Funcionalidades de Monitoramento (Pagina 5)

| Funcionalidade | Requisito | Tela | Prompts | Status |
|----------------|-----------|------|---------|--------|
| Monitoramento Abrangente 24/7 | FR-002, NFR-001 | MonitoriaPage | `configurar_monitoramento` | **Implementado** |
| Busca Inteligente por NCMs e palavras-chave | FR-014 | CaptacaoPage | `buscar_editais_web` | **Implementado** |
| Classificacao Automatica por tipo de edital | FR-003 | CaptacaoPage | `classificar_edital` | **Parcial** |
| Alertas em Tempo Real sobre oportunidades alinhadas | FR-008, FR-015, FR-020 | FlagsPage | `configurar_alertas` | **Implementado** |

### Categorias de Filtro Inteligente

| Categoria | Requisito | Status |
|-----------|-----------|--------|
| Comodatos | FR-003 | **Parcial** |
| Venda de Equipamentos | FR-003 | **Parcial** |
| Aluguel & Consumo | FR-003 | **Parcial** |
| Insumos | FR-003 | **Parcial** |

---

## Pagina 6 - Captacao (Classificacao e Busca)

| Item | Observacao PDF | Requisito | Tela | Prompts | Status |
|------|----------------|-----------|------|---------|--------|
| 6.a | **Classificacao quanto ao tipo de editais**: Reagentes, Equipamentos, Comodato, Aluguel, Oferta de Preco | FR-003 | **ParametrizacoesPage**, **CaptacaoPage** | `classificar_edital`, `classificar_edital_2`, `classificar_edital_3` | **Parcial** |
| 6.b | **Classificacao quanto a origem**: Municipais, Estaduais, Federais, Universidades, LACENs, Hospitais Publicos/Universitarios, Centros de Pesquisas, Campanhas Governamentais, Fundacoes | FR-003, BR-005 | **CaptacaoPage**, **ParametrizacoesPage** | - | **Nao implementado** |
| 6.c | **Locais de Busca**: Jornais eletronicos, sistemas de prefeitura, Portal PNCP, SICONV | FR-002 | **ParametrizacoesPage** | `cadastrar_fonte`, `listar_fontes`, `ativar_fonte` | **Parcial** - PNCP implementado |
| 6.d | **Formato de Busca**: NCMs, Nome Tecnico, Palavra-chave - leitura completa do edital (nao apenas objeto) | FR-014, BR-003 | **CaptacaoPage** | `buscar_editais_web`, `buscar_edital_numero_web` | **Implementado** |
| 6.e | **Interface de Comunicacao com o Usuario**: Alertas 24/7, tela de matching do edital (periodicidade definivel) | FR-015, FR-020, NFR-001 | **FlagsPage**, **MonitoriaPage** | `configurar_alertas`, `configurar_notificacoes`, `listar_alertas` | **Implementado** |

### Detalhamento de Locais de Busca

| Fonte | Tipo | Requisito | Prompts | Status |
|-------|------|-----------|---------|--------|
| Portal PNCP | API | FR-002 | `buscar_editais_web`, `buscar_atas`, `buscar_precos_pncp` | **Implementado** |
| SICONV | API/Scraper | FR-002 | `cadastrar_fonte` | **Nao implementado** |
| Jornais eletronicos | Scraper | FR-002 | `cadastrar_fonte` | **Nao implementado** |
| Sistemas de prefeitura | Scraper | FR-002 | `cadastrar_fonte` | **Nao implementado** |
| ComprasNET | Scraper | FR-002 | `cadastrar_fonte` | **Nao implementado** |

---

## Pagina 7 - Validacao (Sinais de Mercado e Analise)

### Observacao Geral
> "Essa e a fase em que o Usuario Acata as recomendacoes da IA e/ou agrega refinamentos de analises a partir de interacoes com a propria IA"

| Item | Observacao PDF | Requisito | Tela | Prompts | Status |
|------|----------------|-----------|------|---------|--------|
| - | **Sinais de Mercado**: Concorrente Dominante Identificado, Suspeita de Licitacao Direcionada | FR-010, FR-012 | **ValidacaoPage**, **ConcorrenciaPage** | `analisar_concorrente`, `listar_concorrentes` | **Parcial** |
| - | **Decisao do Usuario**: Participar, Acompanhar, Ignorar | FR-007 | **ValidacaoPage** | `atualizar_edital` | **Implementado** |
| - | **Justificativa como combustivel para aprendizado**: Motivos da decisao alimentam a IA futura | FR-012 | **ValidacaoPage**, **FollowupPage** | `registrar_derrota_motivo` | **Parcial** |
| - | **Analise de Lote (Item Intruso)**: Identificacao de item que causa dependencia de terceiros | FR-004 | **ValidacaoPage** | - | **Nao implementado** |
| - | **Alerta de Recorrencia**: Editais semelhantes recusados X vezes por margem insuficiente | FR-012 | **ValidacaoPage** | - | **Nao implementado** |
| - | **O Orgao (Reputacao)**: Pregoeiro rigoroso, bom pagador, historico de problemas politicos | FR-012 | **ValidacaoPage** | - | **Nao implementado** |
| - | **Memoria Corporativa Permanente**: Sistema aprende com historico | FR-012, NFR-012 | - | - | **Nao implementado** |
| - | **Checklist Documental**: Contrato Social, Balanco Patrimonial, Atestado de Capacidade | FR-019 | **ValidacaoPage** | `perguntar_edital_3` | **Parcial** |
| - | **Mapa Logistico**: Entrega estimada X dias | FR-004, BR-004 | **ValidacaoPage** | - | **Nao implementado** |
| - | **Flags Juridicos**: Sinalizacao de aglutinacao indevida ou restricao regional | FR-010 | **ValidacaoPage**, **FlagsPage** | - | **Nao implementado** |

### Scores Exibidos na Validacao (Pagina 7)

| Score | Componentes | Requisito | Status |
|-------|-------------|-----------|--------|
| **Score Geral (82/100)** | Consolidado de todos os scores | FR-004 | **Parcial** |
| **Aderencia Tecnica** | Requisitos de Hardware (95%), Alerta de semilist (75%), Certificacoes (Pendente), Integracao de Sistemas (80%), Eerminova (70%) | FR-004 | **Parcial** |
| **Aderencia tecnica (High)** | 90% | FR-004 | **Implementado** |
| **Aderencia documental (Medium)** | 65% | FR-004, FR-019 | **Nao implementado** |
| **Complexidade do edital (Low)** | 35% | - | **Nao implementado** |
| **Risco juridico percebido (Medium)** | 60% | FR-010 | **Nao implementado** |
| **Viabilidade logistica (High)** | 85% | BR-004 | **Nao implementado** |
| **Atratividade comercial historica (High)** | 95% | FR-012 | **Nao implementado** |

### Resumo da IA e Historico

| Funcionalidade | Requisito | Tela | Status |
|----------------|-----------|------|--------|
| Resumo da IA (texto explicativo do score) | FR-004 | ValidacaoPage | **Nao implementado** |
| Historico Semelhante (Licitacao 2023-A Vencida, 2023-B Perdida) | FR-012 | ValidacaoPage | **Nao implementado** |
| Pergunte a IA (campo de chat contextual) | FR-007 | ValidacaoPage | **Implementado** via FloatingChat |

---

## Pagina 8 - Validacao (Aderencias e Riscos)

### Observacao Geral
> "A etapa de validacao deve ser pautada pelas aderencias/Scores indicados abaixo"

| Item | Observacao PDF | Requisito | Tela | Prompts | Status |
|------|----------------|-----------|------|---------|--------|
| 8.a | **Aderencia/Riscos Tecnica**: IA ressalta trechos do edital com riscos de aderencia tecnica vis a vis caracteristicas do portfolio | FR-004 | **ValidacaoPage** | `calcular_aderencia`, `perguntar_edital_5` | **Parcial** |
| 8.b | **Aderencia/Riscos Documental**: Certidoes vencidas, detalhes sobre balancos, registros requeridos | FR-019, NFR-004 | **ValidacaoPage** | `perguntar_edital_3` | **Parcial** |
| 8.c | **Aderencia/Riscos Juridicos**: Alta recorrencia de aditivos, historico de acoes contra empresas, edital direcionado, pregoeiro rigoroso | FR-010 | **ValidacaoPage**, **ImpugnacaoPage** | `chat_impugnacao`, `chat_recurso` | **Parcial** |
| 8.d | **Aderencia/Riscos de Logistica**: (Em criacao no PDF) | BR-004 | **ValidacaoPage** | - | **Nao implementado** |
| 8.e | **Aderencia/Riscos de Portfolio**: Identificacao de itens intrusos, necessidade de complementacao, portfolio familia ou individual | FR-004 | **ValidacaoPage** | - | **Nao implementado** |
| 8.f | **Aderencia/Riscos Comerciais**: Precos predatorios, historicos de atrasos de faturamento, margem impactada por frequencia de entrega, historico de atrasos de pagamento, concorrente dominante | FR-005, FR-012, BR-004 | **ValidacaoPage**, **ConcorrenciaPage**, **PrecificacaoPage** | `buscar_precos_pncp`, `recomendar_preco`, `analisar_concorrente` | **Parcial** |

### Detalhamento dos Riscos por Tipo

#### 8.a - Riscos Tecnicos

| Risco | Requisito | Prompt | Status |
|-------|-----------|--------|--------|
| Especificacao tecnica nao atendida | FR-004 | `calcular_aderencia` | **Implementado** |
| Certificacao pendente | FR-019 | `verificar_completude` | **Implementado** |
| Requisito de hardware incompativel | FR-004 | `perguntar_edital_5` | **Parcial** |

#### 8.b - Riscos Documentais

| Risco | Requisito | Prompt | Status |
|-------|-----------|--------|--------|
| Certidao vencida | FR-019 | - | **Nao implementado** |
| Balanco patrimonial inadequado | FR-019 | - | **Nao implementado** |
| Registro ANVISA vencido | FR-019, NFR-004 | - | **Nao implementado** |
| Atestado de capacidade faltando | FR-019 | - | **Nao implementado** |

#### 8.c - Riscos Juridicos

| Risco | Requisito | Prompt | Status |
|-------|-----------|--------|--------|
| Alta recorrencia de aditivos no orgao | FR-010, FR-012 | - | **Nao implementado** |
| Historico de acoes judiciais | FR-010 | - | **Nao implementado** |
| Aparencia de edital direcionado | FR-010 | - | **Nao implementado** |
| Pregoeiro rigoroso identificado | FR-012 | - | **Nao implementado** |
| Aglutinacao indevida | FR-010 | `chat_impugnacao` | **Parcial** |
| Restricao regional | FR-010 | `chat_impugnacao` | **Parcial** |

#### 8.d - Riscos de Logistica

| Risco | Requisito | Prompt | Status |
|-------|-----------|--------|--------|
| Distancia ao orgao | BR-004 | - | **Nao implementado** |
| Frequencia de entrega | BR-004 | - | **Nao implementado** |
| Custo de servir | BR-004 | - | **Nao implementado** |
| Prazo de entrega inviavel | BR-004 | `perguntar_edital_2` | **Parcial** |

#### 8.e - Riscos de Portfolio

| Risco | Requisito | Prompt | Status |
|-------|-----------|--------|--------|
| Item intruso no lote | FR-004 | - | **Nao implementado** |
| Necessidade de complementacao | FR-004 | `verificar_completude` | **Parcial** |
| Portfolio familia vs individual | FR-003 | - | **Nao implementado** |

#### 8.f - Riscos Comerciais

| Risco | Requisito | Prompt | Status |
|-------|-----------|--------|--------|
| Preco predatorio identificado | FR-005, FR-012 | `buscar_precos_pncp` | **Parcial** |
| Historico de atrasos de faturamento | FR-012 | - | **Nao implementado** |
| Margem impactada por frequencia de entrega | BR-004 | - | **Nao implementado** |
| Historico de atrasos de pagamento do orgao | FR-012 | - | **Nao implementado** |
| Concorrente dominante identificado | FR-012 | `analisar_concorrente` | **Parcial** |

---

## Resumo de Cobertura por Pagina

| Pagina | Total Itens | Implementado | Parcial | Nao Implementado |
|--------|-------------|--------------|---------|------------------|
| 2 - Empresa | 3 principais + 9 campos | 1 | 2 | 9 campos |
| 3 - Portfolio | 5 principais + 6 uploads | 3 | 2 | 3 uploads |
| 4 - Parametrizacoes | 6 itens | 1 | 4 | 1 |
| 5 - Captacao (Scores) | 10 funcionalidades | 4 | 4 | 2 |
| 6 - Captacao (Busca) | 5 itens + 5 fontes | 2 | 2 | 4 fontes |
| 7 - Validacao (Sinais) | 11 funcionalidades | 2 | 3 | 6 |
| 8 - Validacao (Riscos) | 6 tipos + ~25 riscos | 1 | 5 | ~20 riscos |

---

## Mapeamento Requisitos -> Observacoes PDF

| Requisito | Nome | Paginas PDF | Status |
|-----------|------|-------------|--------|
| FR-001 | Cadastro Portfolio com IA | 2, 3 | **Implementado** |
| FR-002 | Monitoramento 24/7 | 3, 5, 6 | **Implementado** |
| FR-003 | Classificacao parametrizavel | 2, 3, 4, 5, 6 | **Parcial** |
| FR-004 | Score de Aderencia Tecnica e Comercial | 4, 5, 7, 8 | **Parcial** |
| FR-005 | Recomendacao de Precos | 5, 8 | **Parcial** |
| FR-006 | Geracao automatica da Proposta | - | **Implementado** |
| FR-007 | Painel para revisao | 7 | **Implementado** |
| FR-008 | Alertas de Abertura do Pregao | 5 | **Implementado** |
| FR-009 | Robo de Lances | - | **Nao implementado** |
| FR-010 | Auditoria da Proposta vencedora | 7, 8 | **Parcial** |
| FR-011 | Integracao com CRM | 1 (diagrama) | **Nao implementado** |
| FR-012 | Monitoramento pos-licitacao | 7, 8 | **Parcial** |
| FR-013 | Interface parametrizacao produtos | 2, 3, 4 | **Implementado** |
| FR-014 | Busca por NCM/Nome/Palavra-chave | 2, 6 | **Implementado** |
| FR-015 | Tela de matching do edital | 5, 6 | **Implementado** |
| FR-016 | Extracao automatica de datas | 5 | **Implementado** |
| FR-017 | Gerenciamento de usuarios | - | **Implementado** |
| FR-018 | Relatorios analiticos | - | **Parcial** |
| FR-019 | Validacao automatica de documentos | 7, 8 | **Parcial** |
| FR-020 | Notificacoes multicanal | 6 | **Implementado** |
| BR-003 | Busca le todo o texto do edital | 6 | **Implementado** |
| BR-004 | Score Comercial considera fatores logisticos | 4, 7, 8 | **Parcial** |
| BR-005 | Classificacao por origem | 6 | **Nao implementado** |

---

## Prompts Mapeados por Funcionalidade do PDF

### Empresa (Pagina 2)
- `upload_manual`, `download_url`, `buscar_produto_web`, `buscar_datasheet_web`

### Portfolio (Pagina 3)
- `upload_manual`, `download_url`, `buscar_produto_web`, `listar_produtos`, `reprocessar_produto`, `atualizar_produto`, `verificar_completude`

### Parametrizacoes (Pagina 4)
- `classificar_edital`, `calcular_aderencia`, `cadastrar_fonte`, `listar_fontes`

### Captacao (Paginas 5-6)
- `buscar_editais_web`, `buscar_edital_numero_web`, `buscar_links_editais`, `listar_editais`, `salvar_editais`, `configurar_monitoramento`, `listar_monitoramentos`, `configurar_alertas`, `dashboard_prazos`, `proximos_pregoes`

### Validacao (Paginas 7-8)
- `calcular_aderencia`, `perguntar_edital`, `perguntar_edital_3`, `perguntar_edital_5`, `atualizar_edital`, `analisar_concorrente`, `listar_concorrentes`, `buscar_precos_pncp`, `recomendar_preco`, `chat_impugnacao`, `chat_recurso`, `registrar_derrota_motivo`

---

## Funcionalidades Ausentes (Gap Analysis)

### Prioridade Alta

1. **Integracao ANVISA** - Acesso automatico aos registros de produtos
2. **Classificacao por origem do orgao** - Municipal, Estadual, Federal, etc.
3. **Analise de Lote com Item Intruso** - Identificacao automatica
4. **Memoria Corporativa Permanente** - Aprendizado do sistema
5. **Score de Aderencia de Ganho** - Baseado em historico
6. **Riscos Juridicos** - Pregoeiro rigoroso, edital direcionado, aditivos
7. **Reputacao do Orgao** - Bom pagador, problemas politicos

### Prioridade Media

1. **Integracao ERP** - Plano de contas
2. **Estrutura de Classes/Subclasses com NCM** - Parametrizacao completa
3. **TAM/SAM/SOM** - Metricas de mercado
4. **Intencao Estrategica** - Estrategico, Defensivo, Acompanhamento, Aprendizado
5. **Expectativa de Margem** - Slider por produto/regiao
6. **Alerta de Recorrencia** - Editais similares recusados
7. **Mapa Logistico** - Visualizacao de entrega

### Prioridade Baixa

1. **Redes Sociais da Empresa** - Instagram, LinkedIn, Facebook
2. **Upload de NFS** - Notas fiscais de servico
3. **Fontes adicionais** - SICONV, jornais, prefeituras
4. **Historico Semelhante** - Visualizacao de licitacoes passadas similares

---

## Telas do Sistema -> Observacoes PDF

| Tela | Paginas PDF Relacionadas | Funcionalidades Mapeadas |
|------|-------------------------|--------------------------|
| **EmpresaPage** | 1, 2 | Cadastro dados empresa, upload documentos |
| **PortfolioPage** | 1, 2, 3 | Upload manuais, cadastro produtos, IA leitura |
| **ParametrizacoesPage** | 1, 4 | Classes, NCMs, scores, comerciais |
| **CaptacaoPage** | 1, 5, 6 | Busca editais, painel oportunidades, scores |
| **ValidacaoPage** | 1, 7, 8 | Analise, aderencias, riscos, decisao |
| **PrecificacaoPage** | 5, 8 | Recomendacao precos, margem |
| **PropostaPage** | - | Geracao proposta |
| **SubmissaoPage** | - | Checklist submissao |
| **LancesPage** | - | Acompanhamento pregao |
| **FollowupPage** | 7 | Registro resultados, justificativas |
| **ImpugnacaoPage** | 8 | Recursos, impugnacoes |
| **ProducaoPage** | - | Contratos em execucao |
| **FlagsPage** | 5, 6, 7 | Alertas, prazos, flags juridicos |
| **MonitoriaPage** | 3, 5, 6 | Monitoramento 24/7, configuracao |
| **ConcorrenciaPage** | 7, 8 | Analise concorrentes |
| **MercadoPage** | - | Tendencias |
| **ContratadoRealizadoPage** | 1 | Comparativo valores |
| **PerdasPage** | 1, 7 | Analise perdas, motivos |

---

## Conclusao

O sistema facilicita.ia cobre aproximadamente **60%** das funcionalidades detalhadas no documento "CARA SISTEMA.pdf". As principais lacunas estao em:

1. **Integracao com fontes externas** (ANVISA, ERP, SICONV)
2. **Classificacao avancada** (origem do orgao, classes/subclasses com NCM)
3. **Analise de riscos detalhada** (juridicos, logisticos, portfolio)
4. **Memoria e aprendizado** (alerta de recorrencia, reputacao orgao)
5. **Metricas de mercado** (TAM/SAM/SOM, intencao estrategica)

As funcionalidades core (busca de editais, calculo de aderencia, geracao de propostas, alertas) estao implementadas ou parcialmente implementadas.
