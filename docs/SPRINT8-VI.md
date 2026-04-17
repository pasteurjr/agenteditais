**NOTA DE VERSAO (V4):** Esta sprint EXPANDE paginas existentes das Sprints 1-2 (CaptacaoPage, PortfolioPage, ParametrizacoesPage) e CRIA workflows novos (Dispensas de Licitacao, Geracao de Classes por IA, Mascaras de Descricao). Nenhuma funcionalidade existente e recriada — apenas o delta e implementado. Os modelos `Dispensa`, `ClasseProduto`/`ClasseProdutoV2`, `SubclasseProduto` (com `campos_mascara`) JA EXISTEM no backend e sao REUSADOS.

Com relacao a esta Sprint:
    • Esta Sprint entrega a camada de diversificacao de modalidades e inteligencia de portfolio que amplia o alcance do sistema para alem dos pregoes tradicionais. Depois de entregues a captacao, precificacao, propostas, impugnacoes, recursos, CRM, gestao de contratos (Sprints 1-5), a observabilidade/auditoria/notificacoes (Sprint 6) e a inteligencia de mercado/analytics/aprendizado (Sprint 7), a empresa precisa agora: capturar dispensas de licitacao (que representam volume significativo de compras publicas com prazos curtos), classificar seu portfolio de forma inteligente (para melhorar matching com editais), e normalizar descricoes de produtos (para aumentar a taxa de aderencia tecnica).
    • As dispensas de licitacao (Art. 75, Lei 14.133/2021) representam uma modalidade simplificada de contratacao publica que, por ter prazos mais curtos e valores menores, exige agilidade na resposta. A empresa que monitora dispensas via sistema tem vantagem competitiva sobre quem depende de busca manual nos portais. O sistema deve:
        ◦ Buscar dispensas no PNCP com filtros especificos (artigo, valor limite, orgao);
        ◦ Apresentar um dashboard dedicado com status pipeline (abertas, cotacao enviada, adjudicadas, encerradas);
        ◦ Permitir gerar cotacao assistida por IA, aproveitando a precificacao ja entregue na Sprint 3;
        ◦ Integrar dispensas com o pipeline CRM existente (Sprint 5) para rastreamento completo.
    • A geracao automatica de classes de portfolio via IA e o passo que transforma o cadastro de produtos de uma lista plana em uma estrutura hierarquica inteligente (Area → Classe → Subclasse). Hoje a empresa cria classes manualmente via CRUD (Sprint 1, UC-F13) — esta sprint adiciona a capacidade da IA analisar os produtos cadastrados e SUGERIR a classificacao ideal, baseando-se em:
        ◦ NCMs dos produtos (agrupamento por familia fiscal);
        ◦ Descricoes tecnicas (clustering semantico por tipo de produto);
        ◦ Historico de editais ganhos/perdidos (quais classes tem melhor aderencia);
        ◦ Classificacoes de mercado padrao do segmento (ANVISA, CATMAT, etc.).
    • A mascara de descricao e o mecanismo que normaliza a nomenclatura de produtos para maximizar o matching com termos de edital. Exemplo pratico: o fabricante chama "Kit Hemoglobina A1C", o edital pede "reagente para dosagem de hemoglobina glicada HbA1c" — sem normalizacao, o score de aderencia tecnica nao detecta a correspondencia. A `tool_aplicar_mascara_descricao` usa regex + LLM para gerar variantes normalizadas que aumentam a taxa de match.
    • A infraestrutura de campos de mascara (`campos_mascara`) JA EXISTE no modelo `SubclasseProduto` e ja e consumida pela extracao de specs em `tools.py` (`_build_prompt_mascara`, `_extrair_specs_em_chunks`). Esta sprint adiciona a tool que GERA e APLICA mascaras novas.

Fluxo de Dispensas de Licitacao — Dividido em Cards
Cada card devera ter uma abertura que evidencia o detalhamento dos processos que estao dentro desse card especifico:
    1. CARD — DASHBOARD DE DISPENSAS (EXPANSAO da CaptacaoPage)
    • **EXPANDE** a CaptacaoPage ja existente (Sprint 2, `CaptacaoPage.tsx:2641L`);
    • A CaptacaoPage JA POSSUI filtro de modalidade que inclui "dispensa", listagem de editais com score, painel lateral de analise, e cascata Area→Classe→Subclasse — NAO recriar;
    • ADICIONA: nova aba "Dispensas" com dashboard especifico para esta modalidade;
    • ADICIONA: stat cards dedicados: Dispensas Abertas, Em Cotacao, Adjudicadas, Encerradas;
    • ADICIONA: filtros especificos de dispensa: artigo (Art. 75-I a 75-VIII), faixa de valor (ate R$ 50K / R$ 50K-100K / acima R$ 100K), orgao;
    • ADICIONA: coluna "Artigo" e "Valor Limite" na tabela de dispensas;
    • ADICIONA: badges de urgencia por prazo (vermelho: <3 dias, amarelo: 3-7 dias, verde: >7 dias);
    • Cada dispensa e vinculada a um edital existente via `edital_id` — o modelo `Dispensa` ja tem esse foreign key;
    • A aba "Dispensas" mostra APENAS editais cuja modalidade e "dispensa" — e um filtro pre-aplicado, nao duplicacao da lista principal.
    2. CARD — BUSCAR DISPENSAS NO PNCP
    • Busca dedicada de dispensas no PNCP via `tool_buscar_editais` com filtro `modalidade=dispensa`;
    • A busca JA EXISTE na Sprint 2 (UC-CV01) — esta sprint ADICIONA um atalho direto na aba Dispensas com parametros pre-configurados;
    • ADICIONA: botao "Buscar Dispensas" que invoca busca com `modalidade=dispensa` + UFs da empresa + NCMs do portfolio;
    • ADICIONA: resultado exibido na tabela da aba Dispensas com score de aderencia (ja calculado pelo motor existente);
    • ADICIONA: ao salvar uma dispensa, cria automaticamente registro na tabela `dispensas` com status `aberta` e vincula ao edital.
    3. CARD — GERAR COTACAO PARA DISPENSA
    • Workflow de cotacao especifico para dispensas, que reutiliza a infraestrutura de precificacao da Sprint 3;
    • ADICIONA: botao "Gerar Cotacao" no painel de detalhe da dispensa;
    • ADICIONA: a IA (via chatbox) auxilia na geracao da cotacao, usando os precos ja cadastrados no portfolio (Camadas A-E da Sprint 3);
    • ADICIONA: campo `cotacao_texto` (ja existe no modelo `Dispensa`) preenchido pela IA com formatacao padrao;
    • ADICIONA: campo `fornecedores_cotados` (JSON) com lista de fornecedores para pesquisa de mercado;
    • ADICIONA: transicoes de status: aberta → cotacao_enviada → adjudicada/encerrada;
    • Cada transicao grava audit log (RN-037) e pode disparar alerta (Sprint 6).

PRINCIPAIS KPIs DO FLUXO DE DISPENSAS:
    1. Dispensas Capturadas / Total Disponivel no PNCP — taxa de cobertura
    2. Tempo Medio de Resposta (busca → cotacao enviada) — agilidade
    3. Dispensas Adjudicadas / Cotacoes Enviadas — taxa de conversao
    4. Valor Total Adjudicado em Dispensas — receita incremental
    5. Dispensas por Artigo (distribuicao) — perfil de oportunidades

Fluxo de Classificacao Inteligente do Portfolio — Dividido em Cards
Cada card devera ter uma abertura que evidencia como a IA organiza e otimiza o portfolio:
    1. CARD — GERAR CLASSES DO PORTFOLIO VIA IA
    • Tool nova `tool_gerar_classes_portfolio` que analisa os produtos cadastrados e gera sugestao de classificacao hierarquica;
    • A estrutura Area → Classe → Subclasse JA EXISTE no sistema (Sprint 1, modelos `AreaProduto`, `ClasseProdutoV2`, `SubclasseProduto`) — esta sprint NAO recria a estrutura, apenas adiciona a tool de geracao automatica;
    • A tool recebe como entrada a lista de produtos da empresa (nomes, NCMs, descricoes tecnicas) e retorna uma proposta de arvore hierarquica;
    • O resultado e apresentado como SUGESTAO — o usuario aceita, rejeita ou edita antes de aplicar (governanca);
    • Ao aceitar, o sistema cria os registros em `areas_produto`, `classes_produto_v2` e `subclasses_produto` via CRUDs existentes;
    • Minimo de 20 produtos exigido para rodar a tool (risco: classificacao ruim em portfolios pequenos);
    • O CRUD manual de classes JA EXISTE na ParametrizacoesPage (Sprint 1, `loadClasses`) — a tool e uma via ALTERNATIVA (IA) ao cadastro manual.
    2. CARD — GERENCIAR CLASSES E MASCARAS (EXPANSAO da ParametrizacoesPage)
    • **EXPANDE** a ParametrizacoesPage ja existente (Sprint 1, `ParametrizacoesPage.tsx:979L`);
    • A ParametrizacoesPage JA POSSUI: tab Score, tab Comercial, tab Fontes de Busca, tab Notificacoes, tab Preferencias — NAO recriar;
    • A ParametrizacoesPage JA CARREGA classes (`loadClasses` linha 210, CRUD `classes-produtos`) — ha infraestrutura parcial;
    • ADICIONA: nova aba "Classes" dedicada a gestao visual da arvore hierarquica (Area → Classe → Subclasse);
    • ADICIONA: visualizacao em arvore (tree view) com drag-and-drop para reorganizar;
    • ADICIONA: edicao inline de `campos_mascara` por subclasse — definicao de quais campos tecnicos a IA deve extrair;
    • ADICIONA: botao "Gerar Classes via IA" que invoca `tool_gerar_classes_portfolio` e exibe sugestao para aprovacao;
    • ADICIONA: botao "Aplicar ao Portfolio" que vincula produtos existentes as classes/subclasses geradas;
    • ADICIONA: indicador "Produtos sem Classe" mostrando quantos produtos do portfolio nao estao classificados.
    3. CARD — APLICAR MASCARA DE DESCRICAO A PRODUTOS
    • Tool nova `tool_aplicar_mascara_descricao` que normaliza descricoes de produtos para maximizar matching com editais;
    • A infraestrutura de campos de mascara JA EXISTE em `SubclasseProduto.campos_mascara` e JA E CONSUMIDA por `_build_prompt_mascara()` e `_extrair_specs_em_chunks()` em `tools.py` — esta sprint NAO recria o consumo, apenas adiciona a tool de GERACAO e APLICACAO;
    • A tool analisa a descricao original do produto e gera variantes normalizadas usando regex + LLM:
        ◦ Sinonimos tecnicos (ex.: "hemoglobina A1C" → "hemoglobina glicada HbA1c");
        ◦ Abreviacoes padrao (ex.: "Reag." → "Reagente");
        ◦ Termos de edital mais frequentes (aprendido do historico de editais captados);
    • O resultado e armazenado no campo `descricao_normalizada` do produto (campo a ser adicionado ao modelo Produto);
    • Feature flag por produto: o usuario pode desativar a mascara para produtos cujo nome original ja tem match alto;
    • Log antes/depois do score de aderencia para medir impacto da normalizacao.
    4. CARD — VISUALIZAR CLASSES NO PORTFOLIO (EXPANSAO do PortfolioPage)
    • **EXPANDE** o PortfolioPage ja existente (Sprint 1, `PortfolioPage.tsx:1478L`);
    • O PortfolioPage JA POSSUI: 3 tabs (produtos, cadastroIA, classificacao), filtros cascata (area, classe, subclasse), parse de mascara (`parseMascaraTop`) — NAO recriar;
    • ADICIONA: coluna "Classe" visivel na tabela principal de produtos (hoje mostra apenas subclasse);
    • ADICIONA: badge "Sem Classe" para produtos nao classificados;
    • ADICIONA: botao "Classificar Selecionados" que permite selecionar N produtos e invocar `tool_gerar_classes_portfolio` para classifica-los em lote;
    • ADICIONA: coluna "Descricao Normalizada" mostrando o resultado da mascara (quando aplicada);
    • ADICIONA: indicador visual (icone) quando a mascara melhorou o score de aderencia vs descricao original.

PRINCIPAIS KPIs DO FLUXO DE CLASSIFICACAO:
    1. Produtos Classificados / Total Portfolio — taxa de cobertura de classificacao
    2. Classes Geradas via IA / Classes Manuais — adocao da IA
    3. Score de Aderencia Medio Antes vs Depois da Mascara — impacto mensuravel
    4. Produtos com Mascara Ativa / Total Portfolio — penetracao da normalizacao
    5. Classes com campos_mascara definidos / Total Classes — completude de mascaras

PONTOS IMPORTANTES SOBRE DISPENSAS:
    • Dispensas de licitacao (Art. 75 Lei 14.133/2021) tem valores limite que variam por inciso: I (obras R$ 100K), II (outros R$ 50K), III-VIII (situacoes especificas sem limite fixo);
    • O workflow e mais curto que pregao: nao ha fase de lances, impugnacao e rara, e o prazo de resposta e tipicamente 3-5 dias uteis;
    • A integracao com o pipeline CRM existente (Sprint 5) e fundamental — uma dispensa adjudicada deve entrar como "ganho_provisorio" no pipeline;
    • O modelo `Dispensa` ja possui campos `artigo`, `valor_limite`, `justificativa`, `cotacao_texto`, `fornecedores_cotados`, `status` — todos devem ser utilizados no frontend.

PONTOS IMPORTANTES SOBRE CLASSES E MASCARAS:
    • A hierarquia Area → Classe → Subclasse ja esta implementada nos modelos `AreaProduto`, `ClasseProdutoV2`, `SubclasseProduto` desde a Sprint 1;
    • Os CRUDs `areas-produto`, `classes-produto-v2`, `subclasses-produto` ja estao registrados em `crud_routes.py`;
    • O campo `campos_mascara` (JSON) em `SubclasseProduto` ja define os campos tecnicos que a IA extrai de documentos — a Sprint 8 permite EDITAR esses campos visualmente na ParametrizacoesPage;
    • A funcao `_build_prompt_mascara()` em `tools.py:240` ja consome `campos_mascara` para guiar a extracao de especificacoes — nao recriar esse consumo;
    • O matching produto × edital (RN-067) segue hierarquia: produto exato → subclasse → classe → generico. Classes bem definidas melhoram diretamente o score de aderencia;
    • A `tool_gerar_classes_portfolio` deve respeitar o minimo de 20 produtos para evitar classificacoes espurias em portfolios pequenos.

Referencia com Modelo Existente
A base tecnica para esta sprint ja existe amplamente no sistema. Os seguintes itens de infraestrutura estao disponiveis e devem ser REUSADOS ao inves de reescritos:
    • `CaptacaoPage.tsx` ja existe com 2641 linhas — filtro de modalidade (incluindo "dispensa"), cascata Area→Classe→Subclasse, busca PNCP, painel lateral, score — esta sprint ADICIONA aba "Dispensas" com dashboard e workflow de cotacao;
    • `ParametrizacoesPage.tsx` ja existe com 979 linhas, 5 tabs (Score, Comercial, Fontes, Notificacoes, Preferencias) + carregamento de classes via `loadClasses` — esta sprint ADICIONA tab "Classes" com tree view e edicao de mascaras;
    • `PortfolioPage.tsx` ja existe com 1478 linhas, 3 tabs (produtos, cadastroIA, classificacao), filtros cascata, parse de mascara — esta sprint ADICIONA colunas e badges;
    • Modelo `Dispensa` ja existe em `models.py:2681` com campos artigo, valor_limite, justificativa, cotacao_texto, fornecedores_cotados, status;
    • Modelo `ClasseProdutoV2` ja existe em `models.py:288` + `SubclasseProduto` em `models.py:316` com `campos_mascara`;
    • CRUD `dispensas` ja registrado em `crud_routes.py:555`;
    • CRUD `classes-produto-v2` e `subclasses-produto` ja registrados;
    • Tools `_build_prompt_mascara` e `_extrair_specs_em_chunks` ja existem em `tools.py` e consomem campos_mascara;
    • Sidebar ja tem entrada "Dispensas" em Cadastros > Parametros;
    • Sidebar ja tem entrada "Classes" em Cadastros > Portfolio.

Integracao com Sprints Anteriores
    • Sprint 1 (Fundacao) — Portfolio, Areas, Classes, Subclasses e campos_mascara definem a estrutura que esta sprint inteligentifica via IA. Parametrizacoes comerciais alimentam cotacao de dispensas;
    • Sprint 2 (Captacao + Validacao) — Busca PNCP e motor de score de aderencia sao reusados para dispensas. Filtro de modalidade ja inclui "dispensa";
    • Sprint 3 (Precificacao + Proposta) — Camadas de precificacao (A-E) alimentam cotacao de dispensas. Gate de completude de produto verifica se produto esta pronto para cotar;
    • Sprint 5 (CRM + Contratos) — Pipeline CRM recebe dispensas adjudicadas como leads. Parametrizacoes CRM (UC-CRM02) incluem agrupamento de portfolio (RN-191) que classes refinam;
    • Sprint 6 (Auditoria + Monitoria) — Audit log rastreia alteracoes em classes e mascaras. Monitoramento pode capturar dispensas automaticamente;
    • Sprint 7 (Mercado + Analytics + Aprendizado) — TAM/SAM/SOM inclui dispensas no dimensionamento. Score de aderencia melhorado por mascaras impacta funil de analytics.

Valor agregado da funcionalidade
Esta Sprint e a que amplia o alcance comercial do sistema e otimiza a inteligencia do portfolio. Sem dispensas, a empresa ignora uma fatia significativa das contratacoes publicas (dispensas podem representar 30-40% do volume de compras de orgaos menores). Sem classificacao inteligente, o matching entre produtos e editais depende de cadastro manual que frequentemente e incompleto ou inconsistente. Com o que esta Sprint entrega:
    • A empresa captura dispensas de licitacao que antes passavam despercebidas — receita incremental em modalidade de baixa concorrencia e resposta rapida;
    • A IA classifica o portfolio automaticamente, eliminando o trabalho manual de organizar centenas de produtos em classes e subclasses — economia de horas de trabalho operacional;
    • As mascaras de descricao aumentam a taxa de match entre produtos da empresa e itens de edital — o score de aderencia tecnica melhora sem alterar o portfolio real;
    • A gestao visual de classes na ParametrizacoesPage da ao usuario controle sobre a classificacao sem depender do CRUD generico — experiencia de usuario superior;
    • A visualizacao de classes no PortfolioPage torna a hierarquia do portfolio transparente e acionavel — o usuario ve imediatamente quais produtos estao classificados e quais precisam de atencao.

PRINCIPAIS KPIs CONSOLIDADOS DESTA SPRINT:
    1. Dispensas Capturadas e Adjudicadas — novo canal de receita ativo
    2. Tempo Medio de Resposta a Dispensas — agilidade operacional
    3. Taxa de Classificacao do Portfolio — cobertura da organizacao inteligente
    4. Score de Aderencia Medio Antes vs Depois de Mascaras — impacto da normalizacao
    5. Classes Geradas via IA Aceitas / Total Geradas — confianca do usuario na IA
    6. Produtos com Descricao Normalizada / Total Portfolio — penetracao da funcionalidade
