# Documento de Requisitos Completos v2 — facilicita.ia

**Versao:** 2.0
**Data:** 2026-02-22
**Base:** WORKFLOW SISTEMA.pdf (12 paginas) + DOC1/DOC2/DOC3 (documentos complementares)
**Revisao:** Reescrita completa a partir da analise visual de cada pagina do workflow

---

## 1. Visao Geral da Arquitetura (Pagina 1 do Workflow)

O sistema se organiza em **3 camadas**:

### Fundacao (F1) — Topo
Tres areas de configuracao inicial que alimentam todo o restante:
- **Empresa** — Dados cadastrais + documentos habilitativos
- **Portfolio** — Catalogo de produtos com especificacoes tecnicas
- **Parametrizacoes** — Classificacoes, scores, regioes, tipos de edital + TAM/SAM/SOM

### Fluxo Comercial — Esquerda (sequencial)
Pipeline de 11 etapas:
1. Captacao
2. Validacao
3. Impugnacao
4. Precificacao
5. Proposta / Documentacao
6. Submissao
7. Disputa Lances
8. Followup — Novas Anexacoes
9. Recurso / Contra Razoes
10. CRM — so desse processo
11. Execucao Contrato

### Indicadores — Direita (dashboards transversais)
7 paineis de monitoramento:
1. Flags
2. Monitoria
3. Concorrencia
4. Mercado
5. Contratado X Realizado
6. Pedidos em Atraso
7. Perdas

**Pagina central:** Dashboard/sumario com informacoes resumidas de cada processo.

---

## 2. Requisitos Funcionais — FUNDACAO

---

### RF-001: Cadastro da Empresa

**Pagina Workflow:** 2 (Empresa)
**Titulo Workflow:** "O cadastro da empresa sera importante para gerar fontes de consultas para o portfolio e registrar todas as documentacoes usualmente exigidas para participacao nos editais."

**Descricao:**
Cadastro completo da empresa participante de licitacoes com todos os dados necessarios para gerar fontes de consulta e registrar documentacao habilitatoria.

**Campos obrigatorios (conforme wireframe pag 2):**
- Razao Social
- CNPJ
- Inscricao Estadual
- Website
- Instagram
- LinkedIn
- Facebook
- **Emails** (plural — lista dinamica, adicionar/remover)
- **Celulares** (plural — lista dinamica, adicionar/remover)
- Endereco, Cidade, UF, CEP

**Criterios de aceite:**
1. Formulario com todos os campos acima
2. Campos de emails e celulares devem permitir adicionar/remover multiplos valores
3. Dados devem ser persistidos no backend e associados ao usuario logado
4. Dados da empresa alimentam consultas do portfolio (fontes de obtencao)

---

### RF-002: Documentos Habilitativos da Empresa

**Pagina Workflow:** 2 (Empresa)

**Descricao:**
Upload e gestao de todos os documentos habilitativos exigidos em licitacoes.

**Tipos de documento (conforme pag 2):**
- Contrato Social
- AFE (Autorizacao de Funcionamento)
- CBPAD
- CBPP
- Corpo de Bombeiros
- Economica (certidao/doc economico)
- Fiscal (certidao/doc fiscal)
- Financeira (certidao/doc financeiro)
- Tecnica (certidao/doc tecnico)
- Outro (generico)

**Criterios de aceite:**
1. Upload de PDF/DOC por tipo de documento
2. Cada documento tem: tipo, nome_arquivo, data_emissao, data_vencimento, status (ok/vence_em_breve/falta)
3. Tabela com indicadores visuais de status (verde=ok, amarelo=vence, vermelho=falta)
4. Acoes: Visualizar, Download, Excluir, Upload (para docs faltantes)
5. Persistencia no backend com path do arquivo no disco

---

### RF-003: Certidoes Automaticas

**Pagina Workflow:** 2 (Empresa)
**Texto Workflow:** "O sistema ja pega as certidoes de forma automatica, na linha do que e feito no ComLicitacoes"

**Descricao:**
Consulta automatica de certidoes de regularidade com alerta de vencimento.

**Tipos de certidao:**
- CND Federal
- CND Estadual
- CND Municipal
- FGTS
- Trabalhista

**Criterios de aceite:**
1. Secao dedicada a certidoes com status de cada uma
2. Botao para solicitar atualizacao automatica (integracao futura com APIs governamentais)
3. Alertas quando certidao esta proxima do vencimento
4. Armazenamento do arquivo da certidao e metadados (emissao, vencimento, orgao emissor)

---

### RF-004: Alertas IA sobre Documentos

**Pagina Workflow:** 2 (Empresa)
**Texto Workflow:** "Sistema traz o que o edital pede, compara com o que e exigido, verifica em editais passados as impugnacoes e jurisprudencia e a IA alerta quanto a exigencia de documentos a mais ou nao."

**Descricao:**
IA compara os documentos da empresa com os requisitos dos editais e alerta sobre problemas.

**Criterios de aceite:**
1. Ao analisar um edital, o sistema extrai os documentos exigidos
2. Compara automaticamente com os documentos da empresa (RF-002)
3. Gera alertas: documento faltante, documento vencido, documento nao exigido (possivel irregularidade)
4. Verifica jurisprudencia de impugnacoes em editais passados sobre exigencias documentais
5. IA sugere se alguma exigencia e excessiva/ilegal

---

### RF-005: Responsaveis da Empresa

**Pagina Workflow:** 2 (Empresa) — wireframe mostra area de responsaveis

**Descricao:**
CRUD de responsaveis da empresa (representantes legais, prepostos, tecnicos).

**Criterios de aceite:**
1. Tabela de responsaveis: nome, cargo, email, telefone, tipo (representante_legal/preposto/tecnico)
2. Modal para adicionar/editar responsavel
3. Acoes: Editar, Excluir
4. Persistencia no backend

---

### RF-006: Portfolio de Produtos — Fontes de Obtencao

**Pagina Workflow:** 3 (Portfolio)
**Titulo Workflow:** "Etapa mais estrategica"
**Item (a):** "Varias fontes de obtencao do portfolio"

**Descricao:**
O portfolio de produtos pode ser alimentado por multiplas fontes. O sistema deve suportar todas elas.

**Fontes de obtencao (conforme pag 3, item a):**
1. **Upload de Manuais** — PDF dos manuais tecnicos dos produtos
2. **Upload de Instrucoes de Uso** — documentos de instrucoes
3. **Upload de NFS** — notas fiscais para extrair produtos vendidos
4. **Upload de Plano de Contas** — planilha do ERP com catalogo
5. **Upload de Folders** — catalogos e folders comerciais
6. **Website de Consultas** — crawl automatico do website da empresa
7. **Acesso a ANVISA** — registros de produtos na ANVISA (ver RF-007)
8. **Acesso ao ERP** — integracao direta com plano de contas
9. **Acesso ao website e redes sociais** — crawl de Instagram, LinkedIn, etc.
10. **Editais anteriores** — extrair specs de editais que o cliente ja participou

**Criterios de aceite:**
1. Modal de upload com 6 tipos de arquivo (manual, instrucoes, NFS, plano_contas, folders, website)
2. Para cada upload, a IA extrai automaticamente produtos e especificacoes
3. Indicacao visual da fonte de cada dado (IA/Manual/Upload/ANVISA/ERP)
4. Botoes para cada tipo de fonte na pagina de Portfolio

---

### RF-007: Registros de Produtos pela ANVISA

**Pagina Workflow:** 3 (Portfolio)
**Item (b):** "Registros de Produtos pela Anvisa: A IA tenta trazer os registros e o usuario valida ou complementa"

**Descricao:**
Integracao com base de registros da ANVISA para importar dados de produtos regulamentados.

**Criterios de aceite:**
1. Botao "Buscar na ANVISA" na pagina de Portfolio
2. Busca por nome do produto ou registro ANVISA
3. IA traz registros encontrados e usuario valida/complementa
4. Dados importados alimentam o cadastro do produto
5. Campo de registro ANVISA no cadastro do produto

---

### RF-008: Cadastro Manual de Produtos

**Pagina Workflow:** 3 (Portfolio) — wireframe do form de cadastro

**Descricao:**
Cadastro manual de produto com mascara parametrizavel por classe.

**Campos do wireframe (pag 3):**
- Nome do Produto (ex: "Equipamento de Alta Tensao")
- Classe (dropdown, ex: "Classe B")
- Especificacao Tecnica 1 (ex: "Resistencia 10kOhm")
- Potencia (ex: "1500W")
- Voltagem (ex: "220V")
- Manual Tecnico (upload PDF — IA le e sugere preenchimento)

**Criterios de aceite:**
1. Formulario com campos dinamicos conforme a classe selecionada (ver RF-009)
2. Dropdown de classe vinculado as classes cadastradas em Parametrizacoes
3. Upload de manual tecnico que aciona extracao IA
4. Persistencia no backend via CRUD

---

### RF-009: Mascara Parametrizavel por Classe

**Pagina Workflow:** 3 (Portfolio)
**Texto Workflow:** "Crie uma base de conhecimento estruturada. Utilize uma mascara de entrada totalmente parametrizavel para cadastrar as caracteristicas tecnicas de seus produtos por classe, seguindo os criterios normalmente avaliados nos certames."

**Descricao:**
Cada classe de produto tem campos especificos (mascara) que determinam quais especificacoes tecnicas sao exigidas no cadastro daquela classe.

**Criterios de aceite:**
1. Ao selecionar uma classe no cadastro de produto, os campos do formulario mudam dinamicamente
2. Classes e seus campos sao definidos na area de Parametrizacoes (RF-015)
3. Campos podem ser: texto, numero, selecao, booleano
4. Os campos seguem os "criterios normalmente avaliados nos certames" do segmento

---

### RF-010: IA Le Manuais e Sugere Campos

**Pagina Workflow:** 3 (Portfolio)
**Texto Workflow:** "Deixe a IA trabalhar por voce. A IA realiza a leitura dos manuais tecnicos dos seus produtos e sugere novos campos ou preenche requisitos faltantes, garantindo um cadastro rico e completo para maximizar a compatibilidade."

**Descricao:**
Ao fazer upload de um manual tecnico, a IA extrai especificacoes e sugere preenchimento de campos.

**Criterios de aceite:**
1. Upload de manual tecnico (PDF) aciona processamento automatico
2. IA extrai especificacoes tecnicas do manual
3. IA sugere valores para campos da mascara da classe do produto
4. IA pode sugerir novos campos que nao existem na mascara atual
5. Indicador visual de "preenchido pela IA" vs "preenchido manualmente"
6. Usuario pode aceitar, rejeitar ou editar cada sugestao da IA

---

### RF-011: Funil de Monitoramento — Classificacao de Oportunidades

**Pagina Workflow:** 3 (Portfolio) — imagem do funil

**Titulo:** "Do ruido de milhares de editais a clareza das oportunidades certas"

**Descricao:**
Conceito visual do agente autonomo de monitoramento que filtra editais.

**3 niveis do funil (conforme pag 3):**
1. **Monitoramento Continuo:** Um agente de IA monitora diariamente todas as fontes publicas (federal, estaduais, municipais), capturando e pre-qualificando novos editais
2. **Filtro Inteligente:** O sistema classifica automaticamente as oportunidades por categorias estrategicas
3. **Classificacao parametrizavel:** Pre-estabelecida na pagina de cadastro (Etapa de Fundacao)

**Categorias de classificacao (conforme pag 3):**
- Comodato de equipamentos
- Alugueis com ou sem consumo de reagentes
- Venda de equipamentos
- Consumo de insumos hospitalares

**Criterios de aceite:**
1. Card informativo ou visual do funil na pagina de Portfolio ou Dashboard
2. Indicador de que o agente IA esta monitorando fontes
3. Classificacao automatica dos editais conforme tipos parametrizados (RF-017)
4. Numero de editais por categoria visivel

---

### RF-012: Importancia do NCM

**Pagina Workflow:** 3 (Portfolio)
**Nota:** "Verificar o quanto o NCM e uma informacao importante"

**Descricao:**
NCM (Nomenclatura Comum do Mercosul) deve ser tratado como campo relevante tanto no cadastro de produtos quanto na busca de editais.

**Criterios de aceite:**
1. Campo NCM obrigatorio no cadastro de produto
2. NCM por classe e por subclasse (ver RF-015)
3. Busca de editais por NCM (ver RF-021)
4. Afunilamento de NCMs pelo portfolio para otimizar buscas

---

### RF-013: Classificacao/Agrupamento de Produtos

**Pagina Workflow:** 2 (item c) e 4 (item a)
**Texto:** "Cadastro da estrutura de classificacao / agrupamento dos produtos pelos clientes. A IA deveria gerar esses agrupamentos, caso o cliente nao os parametrize no sistema."

**Descricao:**
Estrutura hierarquica de classes e subclasses de produtos, com NCMs associados.

**Criterios de aceite:**
1. Arvore hierarquica: Classe > Subclasse > Produtos
2. Cada classe tem: nome, NCMs associados, campos de mascara (specs)
3. Cada subclasse tem: nome, NCMs associados, classe pai
4. IA pode gerar agrupamentos automaticamente a partir dos produtos cadastrados
5. Usuario pode criar, editar, excluir classes e subclasses manualmente
6. Tela de gerenciamento na area de Parametrizacoes

---

### RF-014: Fontes de Busca

**Pagina Workflow:** 2 (item b) e 4 (Parametrizacoes)

**Descricao:**
Cadastro das fontes onde o sistema busca editais, incluindo palavras-chave e NCMs.

**Componentes (conforme pag 2, item b):**
1. **Palavras-chave:** Geradas pela IA em funcao dos nomes dos produtos
2. **NCMs de busca:** Afunilados pelo portfolio de produtos

**Criterios de aceite:**
1. Tabela de fontes cadastradas (PNCP, ComprasNET, BEC-SP, SICONV, etc.)
2. Cada fonte tem: nome, tipo (API/Scraper), URL, status (Ativa/Inativa)
3. Lista de palavras-chave editavel, com opcao de "Gerar automaticamente do portfolio"
4. Lista de NCMs de busca derivados do portfolio
5. CRUD completo de fontes

---

### RF-015: Parametrizacoes — Estrutura de Classificacao

**Pagina Workflow:** 4 (Parametrizacoes)
**Titulo:** "Etapa chave para geracao dos Scores e apresentacao das oportunidades de forma ordenada"
**Item (a):** "Cadastro da estrutura de classificacao / agrupamento dos produtos pelos clientes"

**Descricao:**
Area de parametrizacao que define a estrutura de classes/subclasses e alimenta os scores.

**Sub-areas do box Parametrizacoes (pag 1 e 4):**
- **Produtos:** Arquitetura das Classes, Arquitetura das Subclasses (IA pode trazer modelo a partir do website e folders)
- **Comerciais:** Regiao de atuacao, Tempo de entrega

**Criterios de aceite:**
1. Aba "Produtos": Arvore de classes/subclasses com NCMs (ver RF-013)
2. Botao "Gerar com IA" que analisa documentos importados e sugere estrutura de classes
3. Modal para criar/editar classe: Nome, NCMs
4. Modal para criar/editar subclasse: Classe Pai, Nome, NCMs
5. Acoes: Adicionar Subclasse, Editar, Excluir (por classe e subclasse)
6. Persistencia no backend

---

### RF-016: Parametrizacoes — Comerciais (Regiao e Tempo)

**Pagina Workflow:** 4 (Parametrizacoes)
**Item (b):** "Norteadores do Score de Aderencia Comercial: Regiao comercial de atuacao; Limitacoes referentes a tempo de entrega, etc."

**Descricao:**
Configuracao da regiao de atuacao e limitacoes de tempo que alimentam o Score Comercial.

**Criterios de aceite:**
1. **Regiao de Atuacao:** Grid com 27 estados brasileiros (botoes clicaveis), checkbox "Atuar em todo o Brasil"
2. **Prazo Maximo Aceito:** Campo numerico (dias)
3. **Frequencia Maxima:** Selecao (diaria/semanal/quinzenal/mensal)
4. **TAM/SAM/SOM:** 3 campos monetarios + botao "Calcular com IA baseado no portfolio"
5. Indicacao visual de que estas configs alimentam o Score de Aderencia Comercial
6. Persistencia no backend

---

### RF-017: Parametrizacoes — Tipos de Edital

**Pagina Workflow:** 4 (Parametrizacoes)
**Item (c):** "Cadastro dos tipos de editais que se deseja participar"

**Descricao:**
Selecao dos tipos de edital que a empresa deseja monitorar e participar.

**Tipos (conforme pag 4):**
1. Comodatos
2. Vendas de Equipamentos
3. Aluguel de Equipamentos com Consumo de Reagentes
4. Consumo de Reagentes
5. Compra de Insumos laboratoriais
6. Compra de Insumos Hospitalares

**Criterios de aceite:**
1. 6 checkboxes (toggle on/off) para cada tipo
2. Tipos selecionados alimentam o filtro inteligente de captacao
3. Persistencia no backend

---

### RF-018: Norteadores de Score

**Pagina Workflow:** 4 (Parametrizacoes)
**Itens (a) a (f):** 6 norteadores de score

**Descricao:**
6 dimensoes que norteiam os scores do sistema. Cada uma e parametrizavel.

**Dimensoes:**

| # | Norteador | Descricao | Fonte dos Dados |
|---|-----------|-----------|-----------------|
| a | **Classificacao** | Agrupamento de produtos (ver RF-015) | Parametrizacoes > Produtos |
| b | **Aderencia Comercial** | Regiao, tempo de entrega (ver RF-016) | Parametrizacoes > Comerciais |
| c | **Tipos de Edital** | Quais tipos participar (ver RF-017) | Parametrizacoes > Tipos |
| d | **Aderencia Tecnica** | Todas as informacoes tecnicas dos produtos | Portfolio > Specs dos Produtos |
| e | **Recomendacao de Participacao** | Todas as fontes/docs solicitados pelo edital | Edital > Requisitos vs Docs Empresa |
| f | **Aderencia de Ganho** | (placeholder — a definir) | Historico de vitorias/derrotas |

**Criterios de aceite:**
1. Card visual na pagina de Parametrizacoes mostrando os 6 norteadores
2. Cada norteador com icone, titulo e badge indicando status de configuracao
3. Click em cada norteador navega para a secao de configuracao correspondente
4. Os norteadores alimentam os calculos de score nas paginas de Captacao e Validacao

---

## 3. Requisitos Funcionais — FLUXO COMERCIAL

---

### RF-019: Captacao — Painel de Oportunidades

**Pagina Workflow:** 5 (Captacao)
**Titulo:** "O layout de apresentacao das oportunidades associado aos Scores, sera o grande diferencial do sistema. A logica dos Scores sera a diferenciacao."

**Descricao:**
Tabela principal de oportunidades de licitacao com score de aderencia e produto correspondente.

**Layout (conforme wireframe pag 5):**

| Licitacao | Produto Correspondente | Score de Aderencia |
|-----------|----------------------|-------------------|
| Licitacao 2023/458 | Produto: Bomba Hidraulica X-300 | 98% (circulo verde) |
| Licitacao 2023/461 | Produto: Valvula de Controle V-15 | 91% (circulo amarelo) |
| Licitacao 2023/462 | Produto: Motor Eletrico M-550 | (circulo com tooltip de gaps) |
| Licitacao 2023/465 | Produto: Compressor de Ar C-80 | 88% (circulo verde) |

**Criterios de aceite:**
1. Tabela com colunas: Licitacao, Produto Correspondente, Score de Aderencia (circulo colorido)
2. Score exibido como circulo colorido: verde (>=80), amarelo (50-79), vermelho (<50)
3. **Tooltip no hover do score** mostrando gaps (ex: "Requisito 4.2: Torque Maximo - desvio de 3%")
4. Colunas adicionais: Orgao, UF, Valor, Data Abertura
5. Clicar na linha abre painel lateral de analise (ver RF-020)
6. Linhas coloridas por faixa de score

---

### RF-020: Captacao — Painel Lateral de Analise

**Pagina Workflow:** 5 (Captacao) — wireframe central

**Descricao:**
Ao clicar em um edital no painel de oportunidades, abre painel lateral com analise detalhada.

**Componentes do painel (conforme pag 5):**
1. **Analise do Edital:** Titulo + numero (ex: "Pregao Eletronico 123/2024")
2. **Score de Aderencia Tecnica:** Circulo 90% — "O quanto as especificacoes do seu produto atendem as exigencias tecnicas do edital"
3. **Score de Aderencia Comercial:** Circulo 75% — "Analise de fatores como distancia, frequencia de entrega e custos logisticos"
4. **Score de Recomendacao de Participacao:** Estrelas 4.5/5 — "Potencial de ganho consolidado com base na analise tecnica, comercial e premissas de atendimento"
5. **Score de Aderencia geral:** Grande (97%)
6. **Potencial de Ganho:** Badge (Elevado/Medio/Baixo)

**Criterios de aceite:**
1. Painel lateral abre ao clicar em edital
2. 3 scores individuais com circulos/gauges visuais
3. Score geral consolidado
4. Badge de potencial de ganho
5. Botao X para fechar painel

---

### RF-021: Captacao — Filtros e Classificacao

**Pagina Workflow:** 5-6 (Captacao, detalhes)

**Descricao:**
Filtros avancados para busca e classificacao de editais.

**Filtros (conforme pag 6):**

**(a) Classificacao quanto ao tipo de editais:**
- Editais de Reagentes
- Editais de Equipamentos
- Editais de Comodato
- Editais de Aluguel
- Editais de Oferta de Preco

**(b) Classificacao quanto a origem:**
- Municipais
- Estaduais
- Federais
- Editais de Universidades
- Laboratorios Publicos ligados ao executivo (estadual ou municipal)
- LACENs — Laboratorios Publicos Centrais
- Hospitais Publicos
- Hospitais Universitarios
- Centros de Pesquisas
- Campanhas Governamentais Federais ou Estaduais
- Fundacoes de Pesquisas
- Fundacoes diversas

**(c) Locais de busca:**
- Jornais eletronicos
- Sistemas da prefeitura
- Portal PNCP
- SICONV — portal de publicacao de editais

**(d) Formato de busca:**
- NCMs dos produtos
- Nome Tecnico dos produtos
- Palavra-chave
- "A IA deve fazer a leitura do edital, buscando a palavra-chave" (busca pelo OBJETO, nao so titulo)

**(e) Interface de comunicacao com o usuario:**
- Alertas gerados pela IA como resultado do monitoramento 24/7
- Tela de matching periodico (definir periodicidade)

**Criterios de aceite:**
1. Filtro por tipo de edital (5 opcoes)
2. Filtro por origem (12+ opcoes)
3. Filtro por fonte de busca (PNCP, ComprasNET, BEC, SICONV, etc.)
4. Busca por NCM, nome tecnico, palavra-chave
5. IA le o edital inteiro buscando keywords (nao so titulo/objeto)
6. Todas as 27 UFs + "Todas"
7. Faixa de valor (min/max)

---

### RF-022: Captacao — Datas de Submissao

**Pagina Workflow:** 5 (Captacao) — card inferior esquerdo

**Descricao:**
Card mostrando contagem de editais por prazo de submissao.

**Layout (conforme pag 5):**
- Proximos 2 dias: X Editais
- Proximos 5 dias: Y Editais
- Proximos 10 dias: Z Editais
- Proximos 20 dias: W Editais

**Criterios de aceite:**
1. Card com 4 linhas (2/5/10/20 dias) e contagem de editais
2. Cores por urgencia (vermelho/laranja/amarelo/azul)
3. Dados calculados a partir das datas de abertura dos editais salvos

---

### RF-023: Captacao — Intencao Estrategica e Margem

**Pagina Workflow:** 5 (Captacao) — card inferior direito

**Descricao:**
Definicao da intencao estrategica e expectativa de margem por edital.

**Componentes (conforme pag 5):**

**Intencao Estrategica (radio buttons):**
1. Edital Estrategico (Entrada em novo orgao)
2. Defensivo
3. Apenas Acompanhamento
4. Aprendizado

**Expectativa de Margem:**
- Slider de margem (ex: Media/Baixa)
- Botao "Varia por Produto"
- Botao "Varia por Regiao"

**Nota Workflow:** "Isso muda completamente a leitura do score (Score baixo pode virar 'GO')."

**Criterios de aceite:**
1. Radio buttons de intencao estrategica (4 opcoes)
2. Slider de margem (0-50% ou similar)
3. Botoes "Varia por Produto" / "Varia por Regiao"
4. A intencao estrategica influencia a interpretacao do score (um score baixo com intencao "Estrategico" pode ser GO)
5. Dados persistidos por edital no backend

---

### RF-024: Captacao — Analise de Gaps

**Pagina Workflow:** 5 (Captacao) — card inferior

**Descricao:**
Lista de gaps entre o portfolio da empresa e os requisitos do edital.

**Exemplo (pag 5):**
- Requisito Tecnico 4.2.a nao atendido
- Certificacao XYZ pendente

**Criterios de aceite:**
1. Lista de gaps com descricao e severidade
2. Tooltip no hover do score no painel de oportunidades mostrando os gaps
3. Gaps sao calculados pela comparacao portfolio vs edital

---

### RF-025: Captacao — Monitoramento 24/7

**Pagina Workflow:** 5 (Captacao) — card direito

**Descricao:**
Agente autonomo de monitoramento continuo.

**Funcionalidades (conforme pag 5):**
1. Monitoramento Abrangente 24/7
2. Busca Inteligente por NCMs e palavras-chave
3. Classificacao Automatica por tipo de edital
4. Alertas em Tempo Real sobre oportunidades alinhadas

**Criterios de aceite:**
1. Card/badge mostrando status do monitoramento (ativo/pausado, ultima busca, novos encontrados)
2. Configuracao de periodicidade e fontes monitoradas
3. Notificacoes de novos editais encontrados

---

### RF-026: Validacao — Sinais de Mercado

**Pagina Workflow:** 7 (Validacao)
**Titulo:** "Essa e a fase em que o Usuario Acata as recomendacoes da IA e/ou agrega refinamentos de analises a partir de interacoes com a propria IA"

**Descricao:**
Alertas de sinais de mercado detectados pela IA.

**Sinais (conforme pag 7):**
- "Concorrente Dominante Identificado"
- "Suspeita de Licitacao Direcionada"

**Criterios de aceite:**
1. Barra no topo da validacao com badges de sinais de mercado
2. Cada sinal e uma badge colorida (vermelho/amarelo) com icone e texto
3. Sinais sao calculados pela IA a partir de dados do edital e historico

---

### RF-027: Validacao — Decisao (Participar/Acompanhar/Ignorar)

**Pagina Workflow:** 7 (Validacao) — canto superior esquerdo

**Descricao:**
3 opcoes de decisao sobre cada edital, com justificativa obrigatoria.

**Componentes (conforme pag 7):**
1. Botao **[Participar]** (verde com check)
2. Botao **[Acompanhar]** (azul)
3. Botao **[Ignorar]** (com X)
4. **Justificativa:** Dropdown de motivo (ex: "Margem Insuficiente") + textarea livre (ex: "Concorrente X esta com preco predatorio")

**Texto Workflow:** "A justificativa e o combustivel para a inteligencia futura"

**Criterios de aceite:**
1. 3 botoes com cores distintas
2. Ao clicar em qualquer botao, abre formulario de justificativa
3. Dropdown com motivos pre-definidos (pelo menos 9 opcoes)
4. Textarea para justificativa livre
5. Justificativa salva no backend e usada para aprendizado futuro
6. Persistencia por edital (modelo EstrategiaEdital)

---

### RF-028: Validacao — Score Dashboard (6 Dimensoes)

**Pagina Workflow:** 7 (Validacao) — canto inferior direito

**Descricao:**
Dashboard visual com score geral e 6 sub-scores de risco.

**Layout (conforme pag 7):**
- **ScoreCircle grande:** 82/100
- **6 barras horizontais:**
  1. Aderencia tecnica (High) — 90%
  2. Aderencia documental (Medium) — 65%
  3. Complexidade do edital (Low) — 35%
  4. Risco juridico percebido (Medium) — 60%
  5. Viabilidade logistica (High) — 85%
  6. Atratividade comercial historica (High) — 95%

**Titulo:** "O que sao IMPEDITIVOS e DESAFIOS (riscos sanaveis)"

**Criterios de aceite:**
1. Circulo grande com score geral (0-100)
2. 6 barras horizontais com porcentagem e nivel (High/Medium/Low)
3. Cores: verde (High), amarelo (Medium), vermelho (Low)
4. Scores calculados pelo motor multi-dimensional do backend
5. Cada barra clicavel para ver detalhes

---

### RF-029: Validacao — 3 Abas (Objetiva/Analitica/Cognitiva)

**Pagina Workflow:** 7 (Validacao) — canto superior direito

**Descricao:**
3 abas organizando diferentes perspectivas de analise do edital.

**Aba Objetiva:**
- Aderencia Tecnica detalhada (Hardware 95%, Alertas 75%, Integracao 80%, Servimento 65%, Permanencia 70%)
- Certificacoes (Pendente/OK)
- Checklist Documentos (Contrato Social, Balanco Patrimonial, Atestado de Capacidade)
- Mapa Logistico (UF do edital, distancia, tempo de entrega estimado)
- Botoes Participar/Ignorar
- Analise de Lote (RF-031)
- GO/NO-GO (RF-036)

**Aba Analitica:**
- Pipeline de Riscos (RF-032)
- Flags Juridicos (RF-033)
- Reputacao do Orgao (RF-034)
- Alerta de Recorrencia (RF-035)

**Aba Cognitiva:**
- Resumo da IA
- Historico Semelhante ("Licitacao 2023-A Vencida", "Licitacao 2022-B Perdida-Preco")
- Pergunte a IA (input de pergunta livre sobre o edital)

**Criterios de aceite:**
1. 3 abas clicaveis: Objetiva, Analitica, Cognitiva
2. Cada aba com seus componentes conforme descrito acima
3. Dados reais do backend (scores, documentos, historico)

---

### RF-030: Validacao — Aderencia Tecnica Trecho-a-Trecho

**Pagina Workflow:** 8 (Validacao) — wireframe lateral direito

**Titulo:** "Aderencia Tecnica e Traducao em Linguagem Natural"

**Descricao:**
Comparacao lado-a-lado entre trechos do edital e trechos do portfolio.

**Layout (conforme pag 7-8):**

| Trecho do Edital | Aderencia | Trecho do Portfolio |
|-----------------|-----------|-------------------|
| "...fornecimento de switch 24 portas camada 3 com gerenciamento web..." | Aderencia: 82% (Parcialmente Aderente) | "...modelo SW-24-L3 atende requisitos de gerenciamento e portas..." |

**+ Resumo da IA:** "A IA recomenda atencao moderada. Tecnicamente aderente (82%), porem com risco comercial elevado devido a exigencia documental e historico negativo com este orgao."

**Criterios de aceite:**
1. Tabela com 3 colunas: Trecho do Edital, Aderencia (%), Trecho do Portfolio
2. Cores na coluna de aderencia (verde/amarelo/vermelho)
3. Resumo textual da IA abaixo da tabela
4. Dados calculados pela comparacao automatica edital vs portfolio

---

### RF-031: Validacao — Analise de Lote (Itens Intrusos)

**Pagina Workflow:** 7 (Validacao) — canto inferior esquerdo

**Descricao:**
Identificacao de itens do lote que nao pertencem ao segmento da empresa.

**Layout (conforme pag 7):**
- Barra horizontal segmentada: 8 blocos "Aderente" (verde) + 1 bloco "Item Intruso" (amarelo)
- Texto: "Item Intruso: Dependencia de Terceiros (Impacto no Lote Inteiro)"
- Label: "Amarelo/Alerta"

**Criterios de aceite:**
1. Barra horizontal mostrando proporcao de itens aderentes vs intrusos
2. Cores: verde (aderente), amarelo (intruso)
3. Legenda com descricao do item intruso
4. Percentual de aderencia do lote
5. Alerta quando ha itens intrusos significativos

---

### RF-032: Validacao — Pipeline de Riscos

**Pagina Workflow:** 7 (Validacao) — centro inferior

**Descricao:**
Pipeline de riscos em 3 categorias com badges.

**Categorias (conforme pag 7):**
1. **Modalidade e Risco:** Badges — "Pregao Eletronico", "Risco de Preco Predatorio", "Faturamento 45 dias"
2. **Checklist Documental:** Certidao Negativa (Vencida - Critico), Atestado de Capacidade (OK), Balanco Patrimonial (Ajustavel)
3. **Flags Juridicos:** "Sinalizacao de aglutinacao indevida ou restricao regional"

**Texto Workflow:** "O sistema identifica Fatal Flaws antes da leitura humana"
**Texto Workflow:** "A cada Flag, a IA trazer uma sugestao de como contornar."

**Criterios de aceite:**
1. 3 secoes empilhadas: Modalidade, Checklist, Flags
2. Badges coloridas por severidade (vermelho=critico, amarelo=ajustavel, verde=ok)
3. Deteccao automatica de "Fatal Flaws" antes de o usuario ler o edital
4. Para cada flag, IA sugere como contornar

---

### RF-033: Validacao — Reputacao do Orgao

**Pagina Workflow:** 7 (Validacao)

**Descricao:**
Informacoes de reputacao do orgao licitante baseadas em historico.

**Campos (conforme pag 7):**
- Pregoeiro rigoroso
- Bom pagador
- Historico de problemas politicos

**Titulo:** "Memoria Corporativa Permanente"

**Criterios de aceite:**
1. Card com icone do orgao
2. 3+ itens de reputacao com indicadores (positivo/negativo/neutro)
3. Dados acumulados ao longo do tempo (memoria corporativa)
4. Persistencia no backend

---

### RF-034: Validacao — Alerta de Recorrencia

**Pagina Workflow:** 7 (Validacao) — canto inferior esquerdo

**Descricao:**
Alerta quando editais semelhantes ja foram recusados ou perdidos varias vezes.

**Exemplo (conforme pag 7):**
- "Editais semelhantes a este foram recusados 4 vezes por margem insuficiente."
- "Alta recorrencia de aditivos nesse orgao."
- "Tecnicamente aderente, mas fora da politica comercial."

**Criterios de aceite:**
1. Card de alerta vermelho quando ha recorrencia de perdas/recusas
2. Descricao textual do padrao identificado
3. Quantidade de ocorrencias anteriores semelhantes
4. Dados calculados a partir do historico de editais da empresa

---

### RF-035: Validacao — Aderencias/Riscos por Dimensao

**Pagina Workflow:** 8 (Validacao — pagina 2 de detalhes)
**Titulo:** "A etapa de validacao deve ser pautada pelas aderencias / Scores indicados abaixo"

**Descricao:**
5 dimensoes de aderencia/risco, cada uma classificada como Impeditivo ou Ponto de Atencao.

**Dimensoes (conforme pag 8, itens a-e):**

**(a) Tecnica / Portfolio:**
- Ressaltar trechos do edital que trazem riscos de aderencia tecnica vis-a-vis as caracteristicas do portfolio
- Identificacao de itens intrusos
- Necessidades de complementacao de portfolio
- Portfolio familia ou individual

**(b) Documental:**
- Certidoes vencidas, detalhes sobre balancos, certidoes vencidas, registros requeridos
- Se documento solicitado for muito inusitado, candidato a impugnacao (nao previstos na lei)

**(c) Juridicos:**
- Alta recorrencia de aditivos
- Historico de acoes contra empresas
- Aparencia de edital direcionado
- Pregoeiro rigoroso

**(d) Logistica:**
- Distancia para prestar assistencia tecnica

**(e) Comerciais:**
- Informacoes relevantes sobre precos, precos predatorios
- Historicos de atrasos de faturamentos
- Margem impactada devido a frequencia de entrega ou custo de servir
- Historico de atrasos de pagamentos
- Concorrente dominante identificado

**(f) Tipo de empresa:**
- Indicar sobre o tipo de empresa pode participar (micro, lucro presumido, etc.)
- O edital pode ser feito para cada empresa do grupo, aderente ao edital

**Criterios de aceite:**
1. Secao para cada dimensao (a-f) com dados relevantes
2. Classificacao como "Impeditivo" ou "Ponto de Atencao"
3. IA fornece recomendacao para cada item
4. Dados calculados automaticamente a partir dos dados do sistema

---

### RF-036: Validacao — Processo Amanda

**Pagina Workflow:** 9 (Validacao — Processo Amanda)

**Descricao:**
Organizacao automatica de documentos em pastas conforme exigencias do edital.

**Processo (conforme pag 9):**
1. Leitura do edital — entende o que o edital pede para iniciar montagem das pastas:
   - **Pasta 1: Documentos da empresa** — Atrela o documento com o item do edital que faz referencia ao mesmo
   - **Pasta 2: Documentos fiscais e certidoes** — Atrela o documento com o item do edital que faz referencia ao mesmo
   - **Pasta 3: Documentos de Qualificacao Tecnica** — Atrela o documento com o item do edital que faz referencia ao mesmo (se pede registro da ANVISA, e relacionado o numero do registro para cada produto)

**Criterios de aceite:**
1. Visualizacao em 3 pastas coloridas (azul/amarelo/verde)
2. Dentro de cada pasta, lista de documentos com status (presente/faltante/vencido)
3. Cada documento vinculado ao item/requisito do edital
4. StatusBadges para cada documento (OK/Pendente/Exigido)
5. Nota automatica gerada pela IA sobre completude

---

### RF-037: Validacao — GO/NO-GO

**Pagina Workflow:** 8-9 (Validacao)
**Texto:** "O que for definido aqui, vai para a tela do CRM"

**Descricao:**
Decisao final consolidada de participacao no edital, com scores e recomendacao da IA.

**Criterios de aceite:**
1. Botao "Calcular Scores IA" que aciona calculo completo das 6 dimensoes
2. Score geral consolidado
3. Recomendacao automatica da IA (GO/NO-GO/ACOMPANHAR)
4. Ao decidir, dados fluem para o CRM (pipeline de oportunidades)

---

### RF-038: Impugnacao de Edital

**Pagina Workflow:** Layout geral (pagina 1) — item do fluxo comercial

**Descricao:**
Geracao de minutas de impugnacao quando identificadas irregularidades no edital.

**Criterios de aceite:**
1. Tabela de editais com prazo de impugnacao, dias restantes, status
2. Opcao de criar impugnacao ou recurso (radio button)
3. Formulario: motivo, fundamentacao legal
4. Botao "Gerar Texto com IA" — IA gera minuta de impugnacao
5. Textarea para edicao da minuta gerada
6. Status: rascunho, protocolado, deferido, indeferido

---

### RF-039: Precificacao

**Pagina Workflow:** Layout geral (pagina 1) — item do fluxo comercial

**Descricao:**
Recomendacao de preco com base em historico de editais similares, precos de concorrentes e margem desejada.

**Criterios de aceite:**
1. Busca de precos no PNCP (termo de busca)
2. Estatisticas: media, minimo, maximo dos precos encontrados
3. Tabela de precos de mercado (data, orgao, valor, vencedor)
4. Recomendacao de preco por produto/edital (preco sugerido, faixa competitiva, justificativa)
5. Historico de precos proprios (resultado ganho/perdido)
6. Grafico de evolucao de precos

---

### RF-040: Proposta / Documentacao

**Pagina Workflow:** Layout geral (pagina 1) — item do fluxo comercial

**Descricao:**
Geracao automatica de proposta tecnica completa.

**Criterios de aceite:**
1. Selecao de edital e produto
2. Preco unitario (com sugestao automatica)
3. Botao "Gerar Proposta Tecnica" — IA gera documento completo
4. Preview da proposta gerada
5. Exportacao: DOCX e PDF
6. Status: rascunho, pronta, enviada

---

### RF-041: Submissao

**Pagina Workflow:** Layout geral (pagina 1) — item do fluxo comercial

**Descricao:**
Checklist e organizacao para submissao da proposta no portal.

**Criterios de aceite:**
1. Tabela de propostas prontas com checklist de progresso
2. Checklist: proposta tecnica (ok), preco definido (ok), documentos anexados (X/Y), revisao final
3. Botoes: Anexar Documento, Marcar como Enviada, Abrir Portal
4. Modal de upload de documentos complementares

---

### RF-042: Disputa de Lances

**Pagina Workflow:** 11 (Disputa Lances)
**Texto:** "Para gerar os lances, necessario ter acesso ao portal de lances Publico e privados. Talvez valha a pena permitir que, via nosso portal, o usuario possa se cadastrar e pagar sua modalidade de uso nos portais privados."

**Descricao:**
Monitoramento de pregoes eletronicos e sugestao de lances.

**Criterios de aceite:**
1. Tabela de pregoes do dia: edital, orgao, hora, status (aguardando/andamento/encerrado)
2. Indicadores visuais de status (dot colorido)
3. Stats: vitorias, derrotas, taxa de sucesso
4. Historico de lances: edital, nosso lance, lance vencedor, resultado
5. Botao "Abrir Sala de Lances" (link para portal)
6. (Futuro) Integracao direta com portais de lances

---

### RF-043: Followup — Novas Anexacoes

**Pagina Workflow:** Layout geral (pagina 1) — item do fluxo comercial

**Descricao:**
Acompanhamento pos-pregao: aguardar resultado, registrar vitoria/derrota.

**Criterios de aceite:**
1. Tabela de editais aguardando resultado: edital, orgao, dias aguardando, valor proposto
2. Tabela de resultados: edital, resultado (vitoria/derrota/cancelado), valor final, vencedor, motivo
3. Modal para registrar resultado com campos condicionais
4. Analise pos-resultado (motivo de perda, valor do vencedor)

---

### RF-044: Recurso / Contra Razoes

**Pagina Workflow:** 10 (Recurso) — placeholder "xxxxx"

**Descricao:**
Geracao de minutas de recurso administrativo e contra-razoes.

**Criterios de aceite:**
1. Pagina ou secao dedicada (separada de Impugnacao conforme layout pag 1)
2. Formulario: tipo (recurso/contra_razao), motivo, fundamentacao
3. Geracao automatica de texto pela IA
4. Status: rascunho, protocolado, deferido, indeferido
5. Prazo limite visivel

---

### RF-045: CRM — So Desse Processo

**Pagina Workflow:** Layout geral (pagina 1) — "CRM — so desse processo"

**Descricao:**
CRM ativo focado no processo de licitacao (nao um CRM generico).

**Criterios de aceite:**
1. KPIs: Total Leads, Leads Novos, Ganhos no Mes, Pipeline
2. Tabela de leads: edital, orgao, valor, score, status (prospeccao/contato/proposta/negociacao/ganho/perdido)
3. Filtros: busca, status, responsavel
4. Metas por vendedor: meta mensal, realizado, editais ganhos, %
5. Acoes pos-perda: edital, motivo, acao, responsavel, prazo, status
6. Modal de registrar contato: tipo, data, observacoes, proximo passo
7. "O que for definido aqui [na validacao], vai para a tela do CRM" — fluxo automatico

---

### RF-046: Execucao de Contrato

**Pagina Workflow:** Layout geral (pagina 1) — item do fluxo comercial (vermelho, em destaque)

**Descricao:**
Acompanhamento da execucao pos-vitoria: contratos, entregas, notas fiscais.

**Criterios de aceite:**
1. Tabela de contratos: numero, orgao, valor, data inicio/fim, status
2. Detalhe do contrato: entregas previstas vs realizadas
3. Modal de registrar entrega: descricao, quantidade, valor, nota fiscal
4. Indicadores: atrasados, entregues, pendentes
5. Proximos vencimentos

---

## 4. Requisitos Funcionais — INDICADORES

---

### RF-047: Flags (Sinalizadores)

**Pagina Workflow:** Layout geral (pagina 1) — indicador direito

**Descricao:**
Dashboard de sinalizadores criticos que requerem acao imediata.

**Criterios de aceite:**
1. Alertas ativos por categoria e cor (vermelho/amarelo/verde)
2. Tabela de alertas configurados
3. Modal para criar alerta (tipo, edital, prazo, descricao)
4. Acoes: visualizar, silenciar, excluir

---

### RF-048: Monitoria

**Pagina Workflow:** Layout geral (pagina 1) — indicador direito

**Descricao:**
Painel de monitoramentos automaticos configurados.

**Criterios de aceite:**
1. Tabela de monitoramentos: termo, UFs, fonte, frequencia, status
2. Editais encontrados por monitoramento
3. Modal para criar monitoramento (termo, UFs, fonte, frequencia)
4. Acoes: pausar, ativar, excluir

---

### RF-049: Concorrencia

**Pagina Workflow:** Layout geral (pagina 1) — indicador direito

**Descricao:**
Inteligencia competitiva sobre concorrentes.

**Criterios de aceite:**
1. Tabela de concorrentes identificados (nome, CNPJ, vitorias, taxa)
2. Detalhe por concorrente: historico de disputas, precos praticados
3. Analise comparativa: nosso desempenho vs concorrente
4. Filtros por periodo e segmento

---

### RF-050: Mercado (TAM/SAM/SOM)

**Pagina Workflow:** Layout geral (pagina 1) — indicador direito

**Descricao:**
Visao de mercado com dimensionamento TAM/SAM/SOM.

**Criterios de aceite:**
1. Stats: total de editais, valor total, media por edital
2. Tendencias por segmento/UF
3. Categorias mais demandadas
4. Evolucao de precos por segmento
5. Graficos reais (nao CSS fake)

---

### RF-051: Contratado X Realizado

**Pagina Workflow:** Layout geral (pagina 1) — indicador direito

**Descricao:**
Comparativo entre valores contratados e efetivamente realizados.

**Criterios de aceite:**
1. Resumo comparativo: total contratado vs total realizado
2. Tabela detalhada por contrato
3. Indicadores de desvio
4. Depende de RF-046 (Execucao de Contrato)

---

### RF-052: Pedidos em Atraso

**Pagina Workflow:** Layout geral (pagina 1) — indicador direito

**Descricao:**
Monitoramento de entregas atrasadas em contratos ativos.

**Criterios de aceite:**
1. Tabela de entregas atrasadas: contrato, item, dias de atraso, valor
2. Alertas automaticos para atrasos criticos
3. Depende de RF-046 (Execucao de Contrato)

---

### RF-053: Perdas

**Pagina Workflow:** Layout geral (pagina 1) — indicador direito

**Descricao:**
Dashboard de editais perdidos com analise de motivos.

**Criterios de aceite:**
1. Stats: total de perdas, valor perdido, taxa de perda
2. Grafico de motivos de perda (pizza ou barras)
3. Tabela de historico de perdas
4. Recomendacoes de melhoria baseadas em padroes de perda

---

## 5. Requisitos Transversais

---

### RF-054: Interface Hibrida (Chat + CRUD Visual)

**Descricao:**
O sistema funciona em dois modos: chat com agente IA e paginas visuais CRUD. Todas as operacoes devem ser acessiveis por ambos os canais.

**Criterios de aceite:**
1. FloatingChat acessivel de qualquer pagina
2. Paginas visuais com formularios CRUD para cada entidade
3. Operacoes via chat e via pagina produzem o mesmo resultado
4. REST APIs para cada entidade principal

---

### RF-055: Aprendizado Continuo

**Origem:** DOC2 (secao 10), DOC3 (REQ-11)
**Texto Workflow (pag 7):** "A justificativa e o combustivel para a inteligencia futura"

**Descricao:**
Sistema aprende com resultados (vitorias/derrotas) e justificativas de decisao para melhorar recomendacoes.

**Criterios de aceite:**
1. Registrar feedback de cada resultado (vitorias, derrotas, motivos)
2. Justificativas de decisao alimentam base de conhecimento
3. Scores se ajustam com base no historico
4. Recomendacoes de preco melhoram com resultados anteriores

---

### RF-056: Governanca e Auditoria

**Origem:** DOC2 (secao 11), DOC3 (REQ-12)

**Descricao:**
Log completo de todas as acoes do sistema para rastreabilidade.

**Criterios de aceite:**
1. Log de auditoria: usuario, acao, entidade, dados antes/depois, timestamp
2. Middleware automatico que registra operacoes CRUD
3. Dashboard de auditoria para administradores

---

### RF-057: Dispensas de Licitacao

**Origem:** DOC2 (secao 9), DOC3 (REQ-12)

**Descricao:**
Suporte especifico a dispensas de licitacao (Art. 75 Lei 14.133).

**Criterios de aceite:**
1. Filtro de dispensas na captacao
2. Workflow simplificado (prazos menores)
3. Geracao de cotacao para dispensas

---

### RF-058: Suporte Juridico IA

**Origem:** DOC2 (secao 6)

**Descricao:**
IA auxilia em questoes juridicas com disclaimers claros.

**Criterios de aceite:**
1. Disclaimers automaticos em respostas juridicas
2. Citacao de legislacao (Lei 14.133/2021)
3. Base de legislacao para RAG juridico

---

### RF-059: Autenticacao e Multi-tenancy

**Descricao:**
Login, tokens, isolamento de dados por usuario.

**Criterios de aceite:**
1. Login com email/senha
2. JWT + refresh tokens
3. Cada usuario so ve seus proprios dados
4. (Futuro) Google OAuth

---

### RF-060: Analytics com MindsDB

**Descricao:**
Consultas analiticas avancadas via MindsDB.

**Criterios de aceite:**
1. Previsoes de resultado
2. Analise de tendencias
3. Clustering de editais
4. Acessivel via chat

---

## 6. Requisitos Nao Funcionais

---

### RNF-001: Escalabilidade
- Suporte a multiplos usuarios simultaneos
- MySQL externo, Flask com pool de conexoes
- (Futuro) Redis para cache, Celery para filas

### RNF-002: Modularidade
- models.py (ORM), tools.py (logica), app.py (rotas)
- Frontend React componentizado
- Separacao clara de responsabilidades

### RNF-003: Observabilidade
- Logs estruturados (JSON)
- Metricas de uso (tokens LLM, latencia)
- Health check endpoint
- Tracing de chamadas

### RNF-004: Custos Controlaveis
- Contagem de tokens/chamadas LLM
- Limites de uso por usuario
- Dashboard de custos

---

## 7. Mapeamento Pagina Workflow → Requisitos

| Pagina Workflow | Titulo | Requisitos |
|----------------|--------|-----------|
| 1 | Visao Geral | Arquitetura (secao 1) |
| 2 | Empresa | RF-001 a RF-005, RF-013, RF-014 |
| 3 | Portfolio | RF-006 a RF-012 |
| 4 | Parametrizacoes | RF-013, RF-015 a RF-018 |
| 5 | Captacao (oportunidades) | RF-019 a RF-025 |
| 6 | Captacao (filtros) | RF-021 (detalhamento) |
| 7 | Validacao (principal) | RF-026 a RF-029, RF-031 a RF-034 |
| 8 | Validacao (aderencias) | RF-030, RF-035 |
| 9 | Validacao (Processo Amanda) | RF-036, RF-037 |
| 10 | Recurso | RF-044 |
| 11 | Disputa Lances | RF-042 |
| 12 | (CRM/Execucao) | RF-045, RF-046 |

---

## 8. Resumo Quantitativo

| Categoria | Qtd Requisitos |
|-----------|---------------|
| Fundacao (Empresa, Portfolio, Parametrizacoes) | 18 (RF-001 a RF-018) |
| Fluxo Comercial (Captacao a Execucao) | 28 (RF-019 a RF-046) |
| Indicadores (Flags a Perdas) | 7 (RF-047 a RF-053) |
| Transversais | 7 (RF-054 a RF-060) |
| **Total RF** | **60** |
| **Total RNF** | **4** |

---

## 9. Diferenca v1 → v2

| Aspecto | v1 (requisitos_completos.md) | v2 (este documento) |
|---------|------------------------------|---------------------|
| Total de RFs | 40 | **60** |
| Origem | 4 documentos misturados | **WORKFLOW SISTEMA.pdf como fonte primaria** |
| Portfolio | RF-005 (generico) | **RF-006 a RF-012** (7 requisitos detalhados: fontes, ANVISA, cadastro, mascara, IA, funil, NCM) |
| Parametrizacoes | RF-006 a RF-009 (4 vagos) | **RF-013 a RF-018** (6 requisitos: classificacao, fontes, comerciais, tipos, norteadores) |
| Captacao | RF-010 (1 generico) | **RF-019 a RF-025** (7 requisitos: painel, lateral, filtros, datas, intencao, gaps, monitoramento) |
| Validacao | RF-011 (1 generico) | **RF-026 a RF-037** (12 requisitos: sinais, decisao, scores 6D, abas, trecho-a-trecho, lote, riscos, orgao, recorrencia, aderencias, Amanda, GO/NO-GO) |
| Nivel de detalhe | Descricao generica | **Wireframes e layouts do workflow reproduzidos como criterios de aceite** |
| Rastreabilidade | "DOC1/DOC2/DOC3/DOC4" generico | **Pagina especifica do workflow + texto exato** |

**Principais gaps da v1 que a v2 corrige:**
1. Portfolio tratado como 1 requisito generico → agora tem 7 requisitos detalhados
2. Validacao tratada como 1 requisito generico → agora tem 12 requisitos detalhados
3. Captacao sem detalhe dos componentes visuais → agora tem 7 requisitos com layouts
4. Norteadores de Score nao existiam como requisito → agora RF-018 detalha todos os 6
5. Processo Amanda nao existia como requisito → agora RF-036
6. Trecho-a-trecho nao existia → agora RF-030
7. Analise de Lote simplificada → agora RF-031 com layout completo
8. Pipeline de Riscos nao existia → agora RF-032
9. Reputacao do Orgao nao existia → agora RF-033
10. Alerta de Recorrencia nao existia → agora RF-034

---

*Documento gerado em 2026-02-22. Fonte primaria: WORKFLOW SISTEMA.pdf (12 paginas) + screenshots de alta resolucao.*
