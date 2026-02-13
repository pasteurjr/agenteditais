# ANALISE COMPLETA: WORKFLOW SISTEMA.pdf vs Mock Atual vs Backend

Documento gerado a partir da analise do WORKFLOW SISTEMA.pdf (12 paginas), dos 22 mocks em `frontend/src/pages/`, dos 50 `processar_*`, 49 `tool_*`, 46 intents e 26 endpoints REST do backend.

**Legenda**:
- ✅ Existe no mock E tem backend funcional
- 🟡 Existe no mock mas SEM backend (mock only)
- ❌ NAO existe no mock (gap)
- 🔧 Backend existe mas mock nao usa

---

## PAGINA 2: EMPRESA (Fundacao)

### WORKFLOW diz (screenshot pag 2):

**Titulo vermelho**: "O cadastro da empresa sera importante para gerar fontes de consultas para o portfolio e registrar todas as documentacoes usualmente exigidas para participacao nos editais."

**Box Empresa (canto superior esquerdo)**:
- **Cadastro**: Razao Social, CNPJ, Inscricao Estadual, Website, Instagram, LinkedIn, Facebook, **Emails, Celulares, etc.**
- **Uploads**: Contrato Social, AFE, CBPAD, CBPP, Corpo de Bombeiros, .... (Economica, Fiscal, Financeira, Tecnica)

**Wireframe do form**: Mostra campos Razao Social ("Aquila Diagnostico"), CNPJ, Inscricao Estadual, Website ("Http:\\aquila.com"), Instagram. Seta vermelha conecta form → icone "Documentos da Empresa" (imagem de IA processando).

**3 itens detalhados**:
- **a. Varias fontes de obtencao do portfolio**: Uploads (manuais, folders, instrucoes de uso, etc.); Acesso a ANVISA / registros dos produtos; Acesso ao banco de plano de contas do ERP; Acesso ao website e redes sociais do cliente; Acesso a todos os editais que o cliente ja participou, etc.
- **b. Cadastro das Diferentes Fontes de Buscas**: Palavras chaves (geradas pela IA, em funcao dos nomes dos produtos); Busca pelos NCMs, afunilados no portfolio
- **c. Cadastro da estrutura de classificacao / agrupamento dos produtos pelos clientes**: A IA deveria gerar esses agrupamentos, caso o cliente nao os parametrize no sistema (na area de parametrizacao)

**Texto inferior (destacado)**:
- "O sistema ja pega as certidoes de forma automatica, na linha do que e feito no ComLicitacoes"
- "Sistema traz o que o edital pede, compara com o que e exigido, verifica em editais passados as impugnacoes e jurisprudencia e a IA alerta quanto a exigencia de documentos a mais ou nao."

### EmpresaPage.tsx - Mock Atual (301 linhas):

**Campos do form (mock)**:
- ✅ Razao Social (`razaoSocial` = "Aquila Diagnostico Ltda")
- ✅ Nome Fantasia (`nomeFantasia` = "Aquila Diagnostico")
- ✅ CNPJ (`cnpj` = "11.111.111/0001-11")
- ✅ Inscricao Estadual (`inscricaoEstadual` = "123.456.789")
- ✅ Website (`website` = "https://aquila.com.br")
- ✅ Instagram (`instagram` = "@aquiladiag")
- ✅ LinkedIn (`linkedin` = "aquila-diagnostico")
- ✅ Facebook (`facebook` = "")
- ✅ Endereco, Cidade, UF, CEP
- ✅ Telefone (1 campo)
- ✅ Email Principal (1 campo)
- ❌ **"Emails, Celulares, etc."** - WORKFLOW diz plural. Mock so tem 1 Email e 1 Telefone. Falta: lista dinamica de emails (adicionar/remover) e lista dinamica de celulares

**Documentos da empresa (mock)**:
- ✅ Tabela com: nome, validade, status (ok/vence/falta), acoes
- ✅ Mock tem 6 docs: Contrato Social, AFE, CBPAD, CBPP, Corpo de Bombeiros, Certidao Negativa
- ✅ Status badges: OK (verde), Vence em breve (amarelo com AlertTriangle), Falta (vermelho)
- ✅ Acoes: Visualizar, Download, Excluir (para docs com arquivo); Upload (para docs faltantes)
- ✅ Modal Upload: Tipo (Contrato Social, AFE, CBPAD, CBPP, Corpo de Bombeiros, Certidao Negativa, Outro), Arquivo (.pdf/.doc/.docx), Validade
- ❌ **Docs adicionais do WORKFLOW**: Economica, Fiscal, Financeira, Tecnica - nao estao no dropdown do modal
- ❌ **Busca automatica de certidoes** ("sistema ja pega certidoes automaticamente, na linha do ComLicitacoes")
- ❌ **IA compara docs exigidos pelo edital vs docs disponiveis** ("Sistema traz o que o edital pede, compara com o que e exigido")
- ❌ **Verificacao de jurisprudencia de impugnacoes** ("verifica em editais passados as impugnacoes e jurisprudencia")
- ❌ **Alerta IA sobre docs a mais ou a menos** ("a IA alerta quanto a exigencia de documentos a mais ou nao")
- ❌ **Icone de IA processando documentos** (wireframe mostra seta do form → icone IA → "Documentos da Empresa")

**Responsaveis (mock)**:
- ✅ Tabela: nome, cargo, email, acoes (Editar/Excluir)
- ✅ Modal adicionar: Nome, Cargo, Email, Telefone
- ❌ **Funcao/Papel na licitacao** - WORKFLOW nao detalha mas seria util ter (quem assina proposta, quem prepara docs, etc.)

**Backend disponivel**: NAO ha `processar_empresa` nem `tool_empresa` dedicados. Nao ha modelo `Empresa` no models.py (so `User`).

**Funcionalidade nova necessaria**:
- **Mock**: Campos de emails multiplos (lista dinamica), celulares multiplos, mais tipos de doc no dropdown (Economica, Fiscal, Financeira, Tecnica), secao "Certidoes Automaticas" com status, card "Alertas de Documentacao" mostrando comparacao edital vs docs
- **Backend**: Modelo `Empresa` + `EmpresaDocumento` + `Responsavel`; `tool_buscar_certidoes_automaticas`; `tool_comparar_docs_empresa_vs_edital`; `tool_verificar_jurisprudencia_docs`

**VEREDICTO EMPRESA**: Mock **75%** do WORKFLOW. Cadastro basico OK, mas faltam: emails/celulares multiplos, tipos de doc extras, certidoes automaticas, comparacao IA edital vs docs, alertas jurisprudencia.

---

## PAGINA 3: PORTFOLIO (Etapa mais estrategica)

### WORKFLOW diz (screenshot pag 3):

**Titulo vermelho**: "Etapa mais estrategica:"

**Box Portfolio (canto superior esquerdo)**:
- **Uploads**: Upload de Manuais, Upload de Instrucoes de Usos, Upload NFS, Upload Plano de Contas, Upload Folders, Website de Consultas
- **Cadastro**: Classe de Produtos, NCM de cada Classe, Subclasse de Produtos, NCM de cada Subclasse

**Wireframe do form de cadastro de produto**:
- Nome do Produto: "Equipamento de Alta Tensao"
- Classe: "Classe B" (dropdown)
- Especificacao Tecnica 1: "Resistencia 10kΩ"
- Potencia: "1500W"
- Voltagem: "220V"
- Icone "Manual Tecnico.pdf" conectado por seta ao form (IA le o manual e preenche)

**Texto esquerda - "Crie uma base de conhecimento estruturada"**:
"Utilize uma mascara de entrada totalmente parametrizavel para cadastrar as caracteristicas tecnicas de seus produtos por classe, seguindo os criterios normalmente avaliados nos certames."

**Texto esquerda - "Deixe a IA trabalhar por voce"**:
"A IA realiza a leitura dos manuais tecnicos dos seus produtos e sugere novos campos ou preenche requisitos faltantes, garantindo um cadastro rico e completo para maximizar a compatibilidade."

**Imagem direita - Funil "Do ruido de milhares de editais a clareza das oportunidades certas"**:
- "O Agente Autonomo que Monitora o Mercado por Voce"
- **Monitoramento Continuo**: Um agente de IA monitora diariamente todas as fontes publicas (federal, estaduais, municipais), capturando e pre-qualificando novos editais
- **Filtro Inteligente**: O sistema classifica automaticamente as oportunidades por categorias estrategicas, como:
  - Comodato de equipamentos
  - Alugueis com ou sem consumo de reagentes
  - Venda de equipamentos
  - Consumo de insumos hospitalares
- **Classificacao parametrizavel** e pre-estabelecida na pagina de cadastro – Etapa de Fundacao. Mostra boxes: "Comodato de equipamentos", "Alugueis com/sem consumo", "Venda de equipamentos", "Consumo de insumos hospitalares"

**Itens detalhados**:
- **a. Varias fontes de obtencao do portfolio**: Uploads (manuais, folders, instrucoes de uso, etc.); Acesso a ANVISA / registros dos produtos; Acesso ao banco de plano de contas do ERP; Acesso ao website e redes sociais do cliente; Acesso a todos os editais que o cliente ja participou, etc.
- **b. Registros de Produtos pela Anvisa**: A IA tenta trazer os registros e o usuario valida ou complementa......
- **Nota**: "Verificar o quanto o NCM e uma informacao importante"

### PortfolioPage.tsx - Mock Atual (289 linhas):

**Botoes de acao (header)**:
- ✅ Upload PDF (abre modal upload)
- ✅ Buscar na Web (abre modal busca)
- ✅ Cadastrar Manual (botao existe, onClick vazio)

**Tabela de produtos**:
- ✅ Colunas: nome (Produto), categoria, NCM, completude (ScoreBar), fonte, acoes
- ❌ **Coluna "fabricante"** - esta no interface mas NAO na tabela (falta coluna visivel)
- ❌ **Coluna "modelo"** - esta no interface mas NAO na tabela (falta coluna visivel)
- ❌ **Coluna "classe"** - WORKFLOW mostra "Classe B" como dropdown. Mock usa "categoria" generico

**Detalhe do produto (painel)**:
- ✅ Info grid: Nome, Fabricante, Modelo, Categoria, NCM, Fonte
- ✅ Tabela specs: Campo, Valor, Fonte (IA/Manual), Status (dot verde/amarelo)
- ✅ Botoes: Editar, Reprocessar IA, Verificar Completude
- ❌ **"Classe" como dropdown** (WORKFLOW mostra seletor de classe no form)
- ❌ **Campos dinamicos por classe** ("mascara de entrada totalmente parametrizavel por classe")
- ❌ **IA sugerindo campos** ("A IA sugere novos campos ou preenche requisitos faltantes")
- ❌ **Indicador visual de "IA preencheu"** (WORKFLOW mostra seta Manual.pdf → form, IA icon)

**Modal Upload**:
- ✅ Tipo: Manual Tecnico, Instrucoes de Uso, Datasheet, Folder/Catalogo, NFS, Plano de Contas (ERP)
- ✅ Arquivo (aceita PDF, ou xlsx/csv para plano de contas)
- ✅ Nome do Produto (opcional - "sera extraido automaticamente se nao informado")
- ✅ Hints para NFS e Plano de Contas
- ❌ **"Website de Consultas"** - WORKFLOW lista como fonte de upload, nao tem no mock

**Modal Buscar Web**:
- ✅ Nome do Produto + Fabricante (opcional)
- ❌ **Busca por NCM** (WORKFLOW diz "Busca pelos NCMs, afunilados no portfolio")

**Funcionalidades IA faltantes (todas ❌)**:
- ❌ **Acesso ANVISA**: "A IA tenta trazer os registros e o usuario valida ou complementa"
- ❌ **Acesso ao banco ERP** (alem do upload de plano de contas, deveria haver integracao direta)
- ❌ **Acesso ao website e redes sociais** (crawl automatico)
- ❌ **Acesso a editais anteriores** (extrair specs de editais ja participados)
- ❌ **Funil visual "Do ruido a clareza"** - imagem conceitual do agente autonomo de monitoramento. Poderia ser um card informativo/ilustrativo
- ❌ **Classificacao automatica de editais por tipo** (Comodato, Aluguel, Venda, Consumo, Insumos) - os tipos sao definidos na Parametrizacao mas nao ha indicacao visual no Portfolio
- ❌ **Monitoramento Continuo** (badge/card mostrando que agente IA esta monitorando fontes)

**Backend disponivel**:
- 🔧 `processar_upload_manual` + `tool_processar_upload` + `tool_extrair_especificacoes` - FUNCIONAL
- 🔧 `processar_buscar_web` + `tool_web_search` - FUNCIONAL
- 🔧 `processar_reprocessar_produto` + `tool_reprocessar_produto` - FUNCIONAL
- 🔧 `processar_verificar_completude` + `tool_verificar_completude_produto` - FUNCIONAL
- 🔧 `processar_download_url` + `tool_download_arquivo` - FUNCIONAL
- 🔧 REST: `GET /api/produtos`, `GET /api/produtos/<id>` - FUNCIONAL
- 🔧 REST: `POST /api/upload` - FUNCIONAL

**Funcionalidade nova necessaria**:
- **Mock**: Dropdown "Classe" no form/detalhe, campos dinamicos por classe (mascara parametrizavel), indicador visual "IA preencheu este campo", botao "Buscar ANVISA", botao "Importar do Website", card informativo "Agente Monitorando" com status, colunas fabricante/modelo visiveis na tabela
- **Backend**: `tool_buscar_anvisa` (registro de produtos), mascara dinamica por classe, crawl de website/redes sociais

**VEREDICTO PORTFOLIO**: Mock **70%** do WORKFLOW. Estrutura basica OK (upload, busca, specs), mas faltam: mascara parametrizavel por classe, integracao ANVISA, IA sugerindo campos, funil visual, classificacao automatica, colunas fabricante/modelo na tabela.

---

## PAGINA 4: PARAMETRIZACOES (Etapa chave para Scores)

### WORKFLOW diz (screenshot pag 4):

**Titulo vermelho**: "Etapa chave para geracao dos Scores e apresentacao das oportunidades de forma ordenada:"

**Box Parametrizacoes (canto superior esquerdo)**:
- **Produtos**: (IA pode trazer modelo para ser validado, a partir do website e folders previamente importados), Arquitetura das Classes, Arquitetura das Subclasses, ....
- **Comerciais**: Regiao de atuacao, Tempo de entrega, ....

**Wireframe do form** (mesmo form da pag 3):
- Nome do Produto, Classe (dropdown "Classe B"), Especificacao Tecnica 1 ("Resistencia 10kΩ"), Potencia ("1500W"), Voltagem ("220V"), icone Manual Tecnico.pdf

**Textos "Crie uma base de conhecimento estruturada" e "Deixe a IA trabalhar por voce"** - mesmos da pag 3

**6 itens Norteadores de Score (a-f)**:
- **a. Cadastro da estrutura de classificacao / agrupamento dos produtos pelos clientes**: A IA deveria gerar esses agrupamentos, caso o cliente nao os parametrize no sistema (na area de parametrizacao)
- **b. Norteadores do Score de Aderencia Comercial/Comerciais**: Regiao comercial de atuacao; Limitacoes referentes a tempo de entrega, etc.
- **c. Cadastro dos tipos de editais que se deseja participar**: Comodatos, Vendas de Equipamentos, Aluguel de Equipamentos com Consumo de Reagentes, Consumo de Reagentes, Compra de Insumos laboratoriais, Compra de Insumos Hospitalares, etc.
- **d. Norteadores do Score de Aderencia Tecnica**: Cadastro de todas as informacoes tecnicas dos produtos.
- **e. Norteadores do Score de Recomendacao de Participacao**: Cadastro de todas as fontes que sao solicitadas pelo Edital.
- **f. Norteadores do Score de Aderencia de Ganho**: xxxxxxxx. (placeholder - nao definido)

### ParametrizacoesPage.tsx - Mock Atual (654 linhas):

**Aba "Produtos" (classificacao)**:
- ✅ Arvore classes/subclasses expandivel com chevrons
- ✅ Cada classe mostra: nome, NCMs, qtd subclasses, qtd produtos
- ✅ Cada subclasse mostra: nome, NCMs, qtd produtos
- ✅ Acoes: Adicionar Subclasse, Editar, Excluir (por classe e subclasse)
- ✅ Modal "Nova Classe": Nome + NCMs
- ✅ Modal "Nova Subclasse": Classe Pai (disabled) + Nome + NCMs
- ✅ Botao "Gerar com IA" (Sparkles icon, simula geracao de classe "Reagentes")
- ✅ **Tipos de Edital**: 6 checkboxes (Comodato, Venda, Aluguel com consumo reagentes, Consumo reagentes, Insumos laboratoriais, Insumos hospitalares) - **CORRESPONDE EXATAMENTE ao item (c) do WORKFLOW**
- ❌ **"IA pode trazer modelo para ser validado, a partir do website e folders previamente importados"** - WORKFLOW diz que IA deveria sugerir a estrutura de classes baseada em docs ja importados. O botao "Gerar com IA" existe mas so adiciona 1 classe mock, nao analisa docs reais

**Aba "Comercial"**:
- ✅ **Regiao de Atuacao**: Grid de 27 estados brasileiros (botoes clicaveis), checkbox "Atuar em todo o Brasil", resumo dos estados selecionados - **CORRESPONDE ao item (b) "Regiao comercial de atuacao"**
- ✅ **Tempo de Entrega**: Prazo maximo aceito (dias), Frequencia maxima (diaria/semanal/quinzenal/mensal) - **CORRESPONDE ao item (b) "Limitacoes referentes a tempo de entrega"**
- ✅ **Mercado (TAM/SAM/SOM)**: 3 campos com prefixo R$, botao "Calcular com IA baseado no portfolio"
- ❌ **Relacao explicita com Score Comercial** - nao ha indicacao visual de que estas configs alimentam o "Score de Aderencia Comercial"

**Aba "Fontes de Busca"**:
- ✅ Tabela fontes: nome (PNCP, ComprasNET, BEC-SP, SICONV), tipo (API/Scraper), URL, status (Ativa/Inativa), acoes (Pausar/Ativar/Excluir)
- ✅ Modal cadastrar fonte: Nome, Tipo (API/Scraper), URL
- ✅ **Palavras-chave**: Tags (microscopio, centrifuga, autoclave, equipamento laboratorio, reagente, esterilizacao), botao "+ Editar", botao "Gerar automaticamente do portfolio" (Sparkles)
- ❌ **Busca por NCMs** - WORKFLOW pag 2 diz "Busca pelos NCMs, afunilados no portfolio". Nao ha campo especifico para NCMs de busca

**Aba "Notificacoes"**:
- ✅ Email para notificacoes
- ✅ Canais: Email, Sistema, SMS (checkboxes)
- ✅ Frequencia do resumo: Imediato, Diario, Semanal
- ✅ Botao Salvar

**Aba "Preferencias"**:
- ✅ Tema: Escuro/Claro (radio buttons)
- ✅ Idioma: Portugues/English/Espanol
- ✅ Fuso horario: 3 opcoes brasileiras

**Norteadores de Score - Analise do mock vs WORKFLOW itens (a)-(f)**:
- ✅ **(a) Classificacao/agrupamento**: Arvore classes/subclasses com NCMs EXISTE. IA "Gerar" existe (mock). OK.
- ✅ **(b) Score Comercial**: Regiao + Tempo entrega EXISTEM. OK.
- ✅ **(c) Tipos de editais**: 6 checkboxes EXISTEM e correspondem exatamente. OK.
- 🟡 **(d) Score Tecnico**: "Cadastro de todas as informacoes tecnicas dos produtos" - isto esta no PORTFOLIO (specs), nao na Parametrizacao. Mock do Portfolio tem tabela specs. Parcial.
- ❌ **(e) Score Recomendacao de Participacao**: "Cadastro de todas as fontes que sao solicitadas pelo Edital" - NAO existe config de quais fontes/docs os editais costumam pedir. Deveria haver secao listando tipos de documentos frequentemente solicitados.
- ❌ **(f) Score Aderencia de Ganho**: Placeholder "xxxxxxxx" no WORKFLOW. Nao implementado. Possivelmente: historico de vitorias/derrotas, margens praticadas, taxa de conversao.

**Backend disponivel**:
- 🔧 `processar_cadastrar_fonte` + `tool_cadastrar_fonte` - FUNCIONAL
- 🔧 `processar_listar_fontes` + `tool_listar_fontes` - FUNCIONAL
- 🔧 `processar_configurar_notificacoes` + `tool_configurar_preferencias_notificacao` - FUNCIONAL
- REST: `GET /api/fontes` - FUNCIONAL

**Funcionalidade nova necessaria**:
- **Mock**: Secao "Norteadores de Score" explicita (card mostrando os 6 scores e suas configs), campo NCMs de busca na aba Fontes, secao "Fontes documentais exigidas por editais" (item e), indicacao visual de que configs alimentam scores, IA sugerindo classes baseada em docs importados (nao apenas mock fixo)
- **Backend**: Modelo `ClasseProduto` + `Parametrizacao`; `processar_gerenciar_parametrizacoes` + `tool_gerenciar_parametrizacoes`; persistencia de classes/subclasses/NCMs/regiao/tipos

**VEREDICTO PARAMETRIZACOES**: Mock **80%** do WORKFLOW. Itens (a), (b), (c) OK. Faltam: Norteadores de Score como conceito explicito (item e, f), NCMs de busca, relacao visual configs→scores, IA sugerindo classes a partir de docs reais.

---

## PAGINA 3-4: CAPTACAO

### WORKFLOW diz:
- "O layout de apresentacao das oportunidades associado aos Scores sera o grande diferencial do sistema"
- **Painel de Oportunidades**: Tabela com Licitacao | Produto Correspondente | Score de Aderencia (circulo colorido)
- **Ao clicar num edital**: Analise do Edital com Score Tecnico (circulo 90%), Score Comercial (circulo 75%), Score de Recomendacao (estrelas 4.5/5)
- **Datas de submissao**: Proximos 2 dias: X, 5 dias: Y, 10 dias: Z, 20 dias: W
- **Score de Aderencia** grande (97%) + **Potencial de Ganho** (Elevado)
- **Intencao Estrategica**: radios Estrategico/Defensivo/Acompanhamento/Aprendizado
- **Expectativa de Margem**: slider + "Varia por Produto" / "Varia por Regiao"
- **Analise de Gaps**: lista de gaps ("Requisito 4.2.a nao atendido", "Certificacao XYZ pendente")
- **Tooltip**: hover no score mostra gaps
- **Categorizar por cor**: verde/amarelo/vermelho
- **Classificacao tipo**: Reagentes, Equipamentos, Comodato, Aluguel, Oferta Preco
- **Classificacao origem**: Municipais, Estaduais, Federais, Universidades, LACENs, Hospitais, etc
- **Locais de busca**: PNCP, ComprasNET, BEC, SICONV, jornais eletronicos
- **Formato de busca**: NCMs, Nome Tecnico, Palavra chave - IA le edital buscando keyword
- **Alertas**: Resultado do monitoramento 24/7

### CaptacaoPage.tsx - Mock Atual:
- ✅ Form busca: Termo, UF (4 opcoes), Fonte (PNCP/ComprasNET/Todas), checkboxes (calcular score, incluir encerrados)
- ✅ Tabela: checkbox, numero, orgao, UF, objeto, valor, abertura, score (ScoreBadge), acoes (ver, salvar)
- ✅ Botoes: Salvar Todos, Salvar Score>=70%, Exportar CSV, Salvar Selecionados
- ✅ Modal detalhes: info grid completo
- ✅ Secao Monitoramento: palavras-chave, ultima busca, novos encontrados
- ❌ **Coluna "Produto Correspondente"** (core do WORKFLOW pag 5)
- ❌ **Score como circulo colorido** (tem ScoreBadge texto, nao circulo visual)
- ❌ **Tooltip de gaps** no hover do score
- ❌ **Datas de submissao** (card "Proximos 2/5/10/20 dias: X editais")
- ❌ **Painel lateral ao clicar**: Score Tecnico + Score Comercial + Score Recomendacao + Intencao Estrategica + Margem + Potencial Ganho + Gaps
- ❌ **Linhas coloridas** por faixa de score (verde/amarelo/vermelho)
- ❌ **Classificacao por tipo de edital** (Reagentes, Equipamentos, Comodato, etc)
- ❌ **Classificacao por origem** (Municipal, Estadual, Federal, Universidade, etc)
- ❌ **Mais UFs** (so tem 4: MG, SP, RJ, ES - deveria ter todas ou as da parametrizacao)
- ❌ **Mais fontes** (so tem PNCP e ComprasNET, falta BEC, SICONV)

**Backend disponivel**:
- 🔧 `processar_buscar_editais` + `tool_buscar_editais_fonte` - FUNCIONAL (busca PNCP real)
- 🔧 `processar_buscar_editais_score` + `tool_calcular_score_aderencia` - FUNCIONAL
- 🔧 `processar_salvar_editais` + `tool_salvar_editais_selecionados` - FUNCIONAL
- 🔧 `processar_classificar_edital` + `tool_classificar_edital` - FUNCIONAL
- 🔧 `processar_buscar_links_editais` + `tool_buscar_links_editais` - FUNCIONAL
- 🔧 `processar_cadastrar_edital` - FUNCIONAL
- 🔧 REST: `GET /api/editais` - FUNCIONAL

**Funcionalidade nova necessaria**:
- Frontend: Tudo acima marcado com ❌ (UI gaps significativos)
- Backend: Score multi-dimensional (hoje `tool_calcular_score_aderencia` retorna score unico, nao 6 dimensoes)
- Backend: `tool_classificar_tipo_edital` (reagente/equipamento/comodato/etc) - `tool_classificar_edital` existe mas nao esta claro se classifica por tipo
- Backend: Match automatico edital → produto correspondente

**VEREDICTO CAPTACAO**: Mock 55% do WORKFLOW. Falta toda a camada de scores visuais, painel lateral, datas submissao, classificacoes, e intencao estrategica.

---

## PAGINA 5-6-7: VALIDACAO

### WORKFLOW diz (3 paginas inteiras - core do sistema):

**Topo**:
- Sinais de Mercado: "Concorrente Dominante Identificado", "Suspeita de Licitacao Direcionada"
- Botoes: [Participar] [Acompanhar] [Ignorar]
- Justificativa: dropdown motivo + textarea livre ("Concorrente X com preco predatorio")
- "A justificativa e o combustivel para a inteligencia futura"

**Direita - Score Dashboard**:
- ScoreCircle grande 82/100
- 6 barras: Aderencia tecnica (High 90%), Aderencia documental (Medium 65%), Complexidade edital (Low 35%), Risco juridico (Medium 60%), Viabilidade logistica (High 85%), Atratividade comercial (High 95%)

**3 Abas**: Objetiva | Analitica | Cognitiva
- Objetiva: Aderencia Tecnica detalhada (Hardware 95%, Alertas 75%, Integracao 80%, Servimento 65%, Permanencia 70%), Certificacoes (Pendente/OK), Checklist Docs, Mapa Logistico, botoes Participar/Ignorar
- Cognitiva: Resumo IA, Historico Semelhante ("Licitacao 2023-A Vencida", "2022-B Perdida-Preco"), Pergunte a IA

**Analise de Lote**: Barra horizontal (8 "Aderente" verdes + 1 "Item Intruso" amarelo)
**Alerta de Recorrencia**: "Editais semelhantes recusados 4 vezes por margem insuficiente"
**O Orgao (Reputacao)**: Pregoeiro rigoroso, Bom pagador, Historico problemas - "Memoria Corporativa Permanente"

**Pipeline de Riscos**:
1. Modalidade e Risco: badges Pregao Eletronico, Risco Preco Predatorio, Faturamento 45 dias
2. Checklist Documental: Certidao Negativa (Vencida-Critico), Atestado (OK), Balanco (Ajustavel)
3. Flags Juridicos: "Sinalizacao de aglutinacao indevida ou restricao regional"
- "O sistema identifica Fatal Flaws antes da leitura humana"

**Aderencia Tecnica trecho-a-trecho**: Tabela (Trecho Edital | Aderencia 82% | Trecho Portfolio) + Resumo IA

**Processo Amanda (pag 7)**:
- Leitura do edital → montagem de pastas:
  1. Docs empresa → item do edital
  2. Docs fiscais/certidoes → item do edital
  3. Docs Qualificacao Tecnica → item do edital (registro ANVISA)
- Score/Aderencia em 6 categorias: Tecnica/Portfolio, Documental, Juridicos, Logistica, Comerciais
- Indicar tipo empresa (micro, lucro presumido, etc)

### ValidacaoPage.tsx - Mock Atual:
- ✅ Tabela editais: numero, orgao, UF, objeto, valor, abertura, status (badges), score (ScoreBadge), acoes
- ✅ FilterBar: busca + filtro status (todos/novo/analisando/validado/descartado)
- ✅ Painel detalhe: info grid (numero, orgao, UF, valor, abertura, score), objeto, resumo
- ✅ Botao Resumir (com loading)
- ✅ Baixar PDF
- ✅ Mudar Status (dropdown)
- ✅ Perguntar ao Edital (inline + modal)
- ❌ **ScoreCircle grande** (82/100 com cor)
- ❌ **6 ScoreBars** (tecnico, documental, complexidade, juridico, logistico, comercial)
- ❌ **3 Abas** (Objetiva | Analitica | Cognitiva)
- ❌ **Sinais de Mercado** (badges concorrente dominante, licitacao direcionada)
- ❌ **Botoes [Participar] [Acompanhar] [Ignorar]** com justificativa
- ❌ **Justificativa** (dropdown motivo + textarea)
- ❌ **Analise de Lote** (barra horizontal aderente/intruso)
- ❌ **Alerta de Recorrencia** (card vermelho com historico)
- ❌ **Reputacao do Orgao** (card com pregoeiro, pagador, problemas)
- ❌ **Pipeline de Riscos** (modalidade, checklist documental, flags juridicos)
- ❌ **Checklist Documental** (certidao negativa, atestado, balanco com status)
- ❌ **Flags Juridicos** (aglutinacao, restricao regional)
- ❌ **Fatal Flaws** (deteccao automatica pre-leitura)
- ❌ **Aderencia trecho-a-trecho** (tabela edital vs portfolio)
- ❌ **Intencao Estrategica** (Estrategico/Defensivo/Acompanhamento/Aprendizado)
- ❌ **Expectativa Margem** (slider)
- ❌ **Historico Semelhante** (licitacoes anteriores similares)
- ❌ **Tipo empresa** (micro, lucro presumido)
- ❌ **Montagem de pastas** (docs empresa → itens edital)

**Backend disponivel**:
- 🔧 `processar_resumir_edital` - FUNCIONAL
- 🔧 `processar_perguntar_edital` - FUNCIONAL
- 🔧 `processar_baixar_pdf_edital` - FUNCIONAL
- 🔧 `processar_calcular_aderencia` + `tool_calcular_aderencia` - FUNCIONAL (score unico)
- 🔧 `processar_listar_editais` + `tool_listar_editais` - FUNCIONAL
- 🔧 `processar_atualizar_edital` + `tool_atualizar_edital` - FUNCIONAL
- 🔧 REST: `GET /api/editais`, `GET /api/editais/<id>`, `GET /api/editais/<id>/pdf` - FUNCIONAL

**Funcionalidade nova necessaria (GRANDE)**:
- Backend: Motor de score multi-dimensional (6 dimensoes em vez de 1)
- Backend: `tool_comparar_portfolio_edital` (trecho-a-trecho)
- Backend: `tool_detectar_sinais_mercado` (concorrente dominante, direcionamento)
- Backend: `tool_detectar_fatal_flaws` (certificacao faltando, doc vencido)
- Backend: `tool_analisar_lote` (itens aderentes vs intrusos)
- Backend: `tool_alerta_recorrencia` (buscar historico de editais similares)
- Backend: `tool_reputacao_orgao` (pregoeiro, pagador, problemas)
- Backend: `tool_flags_juridicos` (aglutinacao, restricao regional)
- Backend: `tool_checklist_documental` (empresa docs vs edital requisitos)
- Backend: Modelo `MemoriaCorporativa`, `ReputacaoOrgao`
- Backend: Estender `Analise` com campos multi-score
- Frontend: Overhaul completo da pagina com todos os elementos visuais

**VEREDICTO VALIDACAO**: Mock 20% do WORKFLOW. Esta e a pagina mais defasada e mais importante do sistema.

---

## PAGINA 8: CAPTACAO - DETALHES ADICIONAIS

### WORKFLOW diz:
- Classificacao tipo editais: Reagentes, Equipamentos, Comodato, Aluguel, Oferta Preco
- Classificacao origem: Municipais, Estaduais, Federais, Universidades, LACENs, Labs Publicos Centrais, Hospitais Publicos, Hospitais Universitarios, Centros de Pesquisa, Campanhas Governamentais, Fundacoes
- Locais de busca: Jornais eletronicos, sistemas da prefeitura, PNCP, SICONV
- Formato de busca: NCMs, Nome Tecnico, Palavra chave (IA le edital inteiro, nao so titulo)
- Interface de comunicacao: Alertas de monitoramento 24/7, tela de matching periodico (1x/dia?)

**Ja coberto na analise da CaptacaoPage acima.** Gaps: classificacoes tipo/origem, mais fontes, busca inteligente por NCM/nome tecnico.

---

## PAGINA 9: IMPUGNACAO

### WORKFLOW diz:
- Nao muito detalhado no PDF alem do botao no menu e referencia a impugnacao/recurso

### ImpugnacaoPage.tsx - Mock Atual:
- ✅ Tabela editais com prazo impugnacao (edital, orgao, prazo, dias restantes, status, botao Criar)
- ✅ Tabela "Minhas Impugnacoes" (edital, tipo badge, motivo, data, status)
- ✅ Modal criar: radio (Impugnacao/Recurso), motivo, fundamentacao, "Gerar Texto com IA" (loading), textarea gerada
- 🟡 Gerar Texto com IA (mock - gera template fixo)

**Backend disponivel**:
- Nao ha `processar_impugnacao` nem `tool_impugnacao` dedicados
- `processar_chat_livre` poderia gerar texto, mas sem tool especifico

**Funcionalidade nova necessaria**:
- Backend: `processar_gerar_impugnacao` + `tool_gerar_impugnacao`
- Backend: `processar_gerar_recurso` + `tool_gerar_recurso`
- Intent: `chat_impugnacao`, `chat_recurso` (ja mapeados em MAPEAMENTO_PROMPTS mas nao implementados)

**VEREDICTO IMPUGNACAO**: Mock 80% OK. Falta backend para geracao real de texto juridico.

---

## PAGINA 10: PRECIFICACAO (implicita no fluxo)

### PrecificacaoPage.tsx - Mock Atual:
- ✅ Form busca precos PNCP (termo + botao)
- ✅ Card estatisticas (media, min, max)
- ✅ Tabela precos mercado (data, orgao, termo, valor, vencedor)
- ✅ Form recomendacao (edital dropdown, produto dropdown, botao "Recomendar")
- ✅ Box recomendacao (preco sugerido, faixa competitiva, baseado em X, justificativa)
- ✅ Tabela historico pessoal (produto, preco, data, edital, resultado ganho/perdido)
- ❌ **Grafico evolucao precos** (nao tem chart, so tabela)
- ❌ **Analise margem** (WORKFLOW menciona margem impactada em Comerciais)

**Backend disponivel**:
- 🔧 `processar_buscar_precos_pncp` + `tool_buscar_precos_pncp` - FUNCIONAL
- 🔧 `processar_historico_precos` + `tool_historico_precos` - FUNCIONAL
- 🔧 `processar_recomendar_preco` + `tool_recomendar_preco` - FUNCIONAL

**VEREDICTO PRECIFICACAO**: Mock 85%. Falta grafico de evolucao e analise margem. Backend completo.

---

## PAGINA 10: PROPOSTA / DOCUMENTACAO

### PropostaPage.tsx - Mock Atual:
- ✅ Form: Edital, Produto, Preco Unitario (com "Sugerir Preco"), Quantidade
- ✅ Botao "Gerar Proposta Tecnica"
- ✅ Tabela propostas: edital, orgao, produto, valor total, data, status (rascunho/pronta/enviada)
- ✅ Preview: header + conteudo (pre tag), botoes Baixar DOCX/PDF, Enviar Email
- 🟡 Gerar proposta (mock - cria texto template)
- 🟡 Sugerir preco (mock - retorna 11500 fixo)

**Backend disponivel**:
- 🔧 `processar_gerar_proposta` + `tool_gerar_proposta` - FUNCIONAL (usa DeepSeek)
- 🔧 `processar_recomendar_preco` + `tool_recomendar_preco` - FUNCIONAL
- 🔧 REST: `GET /api/propostas`, `GET /api/propostas/<id>` - FUNCIONAL

**VEREDICTO PROPOSTA**: Mock 90%. Backend completo. So precisa conectar.

---

## PAGINA 10: SUBMISSAO

### SubmissaoPage.tsx - Mock Atual:
- ✅ Tabela propostas prontas: edital, orgao, produto, valor, abertura, hora, status, checklist progress
- ✅ Checklist detalhado: proposta tecnica, preco definido, documentos anexados (X/Y), revisao final
- ✅ Botoes: Anexar Documento, Marcar como Enviada, Abrir Portal PNCP
- ✅ Modal upload: tipo documento, arquivo, observacao

**Backend disponivel**: Nao ha tool dedicado. E uma tela organizacional/checklist.

**VEREDICTO SUBMISSAO**: Mock 90%. Tela organizacional, pouco backend necessario.

---

## PAGINA 11: DISPUTA LANCES

### WORKFLOW diz:
- "Para gerar os lances, necessario ter acesso ao portal de lances Publico e privados"
- Possibilidade de cadastro no portal via nosso sistema

### LancesPage.tsx - Mock Atual:
- ✅ Tabela pregoes hoje: edital, orgao, hora, status (aguardando/em_andamento/encerrado), tempo restante
- ✅ Status visual: dot amarelo (aguardando), dot verde pulse (andamento), dot cinza (encerrado)
- ✅ Stats: vitorias, derrotas, taxa sucesso
- ✅ Tabela historico: edital, orgao, data, nosso lance, lance vencedor, vencedor, resultado
- ✅ Botao "Abrir Sala de Lances" (abre ComprasNET)

**Backend disponivel**: Nao ha tool dedicado de lances.

**VEREDICTO LANCES**: Mock 85%. WORKFLOW diz pouco. Integracao com portal seria feature futura avancada.

---

## PAGINA 11: FOLLOWUP

### FollowupPage.tsx - Mock Atual:
- ✅ Tabela aguardando: edital, orgao, data submissao, dias aguardando, valor proposto, acoes (telefone, lembrete, registrar)
- ✅ Tabela resultados: edital, orgao, data, resultado (badge vitoria/derrota/cancelado), valor final, vencedor, motivo
- ✅ Modal registrar: radio (vitoria/derrota/cancelado), campos condicionais (valor final, vencedor, valor vencedor, motivo dropdown)

**Backend disponivel**:
- 🔧 `processar_registrar_resultado` + `tool_registrar_resultado` - FUNCIONAL
- 🔧 `processar_consultar_resultado` - FUNCIONAL
- 🔧 `processar_consultar_todos_resultados` - FUNCIONAL
- 🔧 `processar_extrair_ata` + `tool_extrair_ata_pdf` - FUNCIONAL

**VEREDICTO FOLLOWUP**: Mock 90%. Backend completo.

---

## PAGINA 11: RECURSO / CONTRA RAZOES

### WORKFLOW diz:
- Slide com titulo "Recurso" e conteudo "xxxxx" (placeholder, nao detalhado)
- No menu (TELA 04) aparece como item separado "Recurso / Contra Razoes" depois de Followup

### Mock Atual:
- ❌ **Nao existe pagina separada**. ImpugnacaoPage cobre impugnacao + recurso juntos.
- A questao e: separar em pagina propria ou manter junto? No sidebar atual, Impugnacao ja tem radio "Impugnacao/Recurso".

**Decisao necessaria**: Manter junto (como esta) ou separar (como TELA 04 sugere).

---

## PAGINA 12: CRM

### CRMPage.tsx - Mock Atual:
- ✅ 4 KPIs: Total Leads, Leads Novos, Ganhos no Mes, Pipeline
- ✅ Tabela leads: edital, orgao, objeto, valor, score aderencia, abertura, status (6 tipos), responsavel, acoes
- ✅ FilterBar: busca, status, responsavel
- ✅ Tabela metas vendedores: vendedor, meta mensal, realizado, editais ganhos, % (progress bar)
- ✅ Tabela acoes pos-perda: edital, orgao, motivo, acao, responsavel, prazo, status
- ✅ Modal registrar contato: tipo, data, observacoes, proximo passo, novo status

**Backend disponivel**: Nao ha modelo `Lead` nem `MetaVendedor`. Nao ha processar/tool dedicados.

**Funcionalidade nova necessaria**:
- Modelos: `Lead`, `MetaVendedor`, `ContatoLead`
- Backend: `processar_crm` + `tool_gerenciar_leads`

**VEREDICTO CRM**: Mock 90% visualmente. Backend 0%.

---

## PAGINAS NAO NO WORKFLOW MAS NO MOCK:

### Dashboard.tsx:
- ✅ Card urgentes (3 items), Funil CSS (6 etapas), 5 KPIs, Insights IA (3 items), Calendario (3 eventos)
- ❌ **Barra badges status** no topo
- ❌ **Campo busca rapida** no header
- ❌ **"O que o sistema aprendeu"** (secao aprendizado/memoria)
- Backend: `processar_dashboard_prazos` + `tool_dashboard_prazos` FUNCIONAL, MindsDB para KPIs

### FlagsPage.tsx:
- ✅ Alertas ativos (3 categorias coloridas), Tabela alertas configurados, Modal criar alerta
- Backend: 🔧 `processar_configurar_alertas`, `processar_listar_alertas`, `processar_cancelar_alerta` - TODOS FUNCIONAIS

### MonitoriaPage.tsx:
- ✅ Tabela monitoramentos (3 configs), Editais encontrados, Modal criar (27 UFs, frequencia)
- Backend: 🔧 `processar_configurar_monitoramento`, `processar_listar_monitoramentos`, `processar_desativar_monitoramento` - TODOS FUNCIONAIS

### ConcorrenciaPage.tsx:
- ✅ Tabela concorrentes, FilterBar, Painel detalhe, Historico disputas
- Backend: 🔧 `processar_listar_concorrentes`, `processar_analisar_concorrente` - FUNCIONAIS

### MercadoPage.tsx:
- ✅ Stats (total, valor, media), Barras tendencia (CSS), Categorias demandadas, Evolucao precos (SVG)
- ❌ **Graficos reais** (tudo e div/CSS/SVG fake)
- Backend: 🔧 MindsDB (`processar_consulta_mindsdb`) para dados reais

### PerdasPage.tsx:
- ✅ Stats (total, valor, taxa), Pizza motivos (CSS fake), Tabela historico
- ❌ **Grafico pizza real** (e div CSS)
- Backend: 🔧 MindsDB para dados reais

### ContratadoRealizadoPage.tsx:
- ✅ Resumo comparativo, Tabela detalhamento, Pedidos em atraso, Proximos vencimentos
- Backend: Nao ha modelo `Contrato`/`Entrega`. Backend 0%.

### ProducaoPage.tsx:
- ✅ Stats (ativos, atrasados, entregues), Tabela contratos, Detalhe, Modal entrega/NF
- Backend: Nao ha modelo `Contrato`/`Entrega`. Backend 0%.

---

## RESUMO GERAL

### Status por Pagina:

| Pagina | Mock UI | Backend Pronto | Gap Principal |
|--------|---------|----------------|---------------|
| **ValidacaoPage** | **20%** | 30% | Falta TUDO: scores 6D, abas, sinais, lote, recorrencia, orgao, flags, trecho-a-trecho |
| **CaptacaoPage** | **55%** | 60% | Falta: produto correspondente, scores visuais, datas, painel lateral, classificacoes |
| **Dashboard** | 80% | 50% | Falta: badges, busca, "sistema aprendeu" |
| **EmpresaPage** | **75%** | 0% | Falta: emails/celulares multiplos, tipos doc extras, certidoes auto, comparacao IA docs, jurisprudencia |
| **PortfolioPage** | **70%** | 90% | Falta: mascara parametrizavel por classe, ANVISA, IA sugerindo campos, funil visual, colunas fab/modelo |
| **ParametrizacoesPage** | **80%** | 20% | Falta: norteadores score explicitos (e/f), NCMs busca, relacao visual configs→scores |
| **PrecificacaoPage** | 85% | 95% | Falta grafico evolucao |
| **PropostaPage** | 90% | 95% | So conectar |
| **SubmissaoPage** | 90% | N/A | Tela organizacional |
| **LancesPage** | 85% | 10% | Sem tool dedicado |
| **FollowupPage** | 90% | 95% | So conectar |
| **ImpugnacaoPage** | 80% | 10% | Sem tool geracao texto juridico |
| **ProducaoPage** | 85% | 0% | Sem modelo Contrato/Entrega |
| **CRMPage** | 90% | 0% | Sem modelo Lead/Meta |
| **FlagsPage** | 90% | 95% | So conectar |
| **MonitoriaPage** | 90% | 95% | So conectar |
| **ConcorrenciaPage** | 85% | 90% | So conectar |
| **MercadoPage** | 75% | 70% | Graficos CSS fake |
| **PerdasPage** | 75% | 70% | Grafico CSS fake |
| **ContratadoRealizadoPage** | 80% | 0% | Sem modelo backend |

### Funcionalidades Backend NOVAS Necessarias:

**Modelos ORM faltantes** (backend/models.py):
1. `Empresa` + `EmpresaDocumento` + `Responsavel`
2. `ClasseProduto` + `Subclasse` + `Parametrizacao`
3. `MemoriaCorporativa`
4. `ReputacaoOrgao`
5. `Lead` + `MetaVendedor` + `ContatoLead`
6. `Contrato` + `Entrega`

**Intents/Processors/Tools faltantes** (core do diferencial):
1. Motor Score Multi-Dimensional (6 dimensoes) - estender `tool_calcular_aderencia`
2. `tool_comparar_portfolio_edital` (trecho-a-trecho)
3. `tool_detectar_sinais_mercado`
4. `tool_detectar_fatal_flaws`
5. `tool_analisar_lote` (itens intrusos)
6. `tool_alerta_recorrencia`
7. `tool_reputacao_orgao`
8. `tool_flags_juridicos`
9. `tool_checklist_documental` (empresa vs edital)
10. `tool_gerar_impugnacao` / `tool_gerar_recurso`
11. `tool_gerenciar_empresa`
12. `tool_gerenciar_parametrizacoes`
13. `tool_buscar_anvisa`

### O que JA FUNCIONA no backend e so precisa conectar no frontend:
1. Busca de editais PNCP (`tool_buscar_editais_fonte`)
2. Calculo de score aderencia (`tool_calcular_score_aderencia`) - score unico
3. Geracao de proposta (`tool_gerar_proposta`)
4. Busca precos PNCP (`tool_buscar_precos_pncp`)
5. Recomendacao preco (`tool_recomendar_preco`)
6. Upload e extracao specs (`tool_processar_upload` + `tool_extrair_especificacoes`)
7. Reprocessar produto (`tool_reprocessar_produto`)
8. Verificar completude (`tool_verificar_completude_produto`)
9. Resumir edital (`processar_resumir_edital`)
10. Perguntar ao edital (`processar_perguntar_edital`)
11. Registrar resultado (`tool_registrar_resultado`)
12. Alertas (`tool_configurar_alertas`, `tool_listar_alertas`)
13. Monitoramento (`tool_configurar_monitoramento`, `tool_listar_monitoramentos`)
14. Concorrentes (`tool_listar_concorrentes`, `tool_analisar_concorrente`)
15. MindsDB analytics (todas as 12 consultas)

### Prioridade de Implementacao (Mock primeiro, depois Backend):

**URGENTE (Core do produto - diferencial)**:
1. ValidacaoPage - Overhaul completo do mock
2. CaptacaoPage - Painel oportunidades + scores visuais

**IMPORTANTE (Fechar visual)**:
3. Dashboard - 3 secoes faltantes
4. Graficos reais (recharts) - MercadoPage, PerdasPage

**CONECTAR (backend ja existe)**:
5. PortfolioPage → sendMessage
6. PrecificacaoPage → sendMessage
7. PropostaPage → sendMessage
8. FollowupPage → sendMessage
9. FlagsPage → sendMessage
10. MonitoriaPage → sendMessage
11. ConcorrenciaPage → sendMessage

**BACKEND NOVO NECESSARIO**:
12. Motor Score Multi-Dimensional
13. Modelos ORM faltantes
14. Tools de inteligencia (sinais, fatal flaws, lote, recorrencia, etc)
15. EmpresaPage, CRMPage, ProducaoPage, ParametrizacoesPage (backend)
