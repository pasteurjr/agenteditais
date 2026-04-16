**NOTA DE VERSAO (V4 corrigida):** Esta sprint EXPANDE paginas existentes das Sprints 5-6 (CRMPage aba Mapa, ConcorrenciaPage, PerdasPage, MercadoPage) e CRIA paginas novas (AnalyticsPage, AprendizadoPage). Nenhuma funcionalidade existente e recriada — apenas o delta e implementado.

Com relacao a esta Sprint:
    • Esta Sprint entrega a camada de inteligencia de mercado, analytics consolidado e aprendizado continuo que transforma o sistema de uma ferramenta operacional em uma plataforma de decisao estrategica. Depois de entregues a captacao, precificacao, propostas, impugnacoes, recursos, CRM, gestao de contratos (Sprints 1-5) e a observabilidade/auditoria/notificacoes (Sprint 6), a empresa precisa agora saber: qual o tamanho do mercado que me interessa, como estou performando vs a concorrencia, e como o sistema pode aprender com meus resultados para me assessorar melhor no futuro.
    • O sistema deve dimensionar o mercado da empresa usando a metodologia TAM/SAM/SOM:
        ◦ TAM (Total Addressable Market): o universo total de editais publicos no segmento de atuacao da empresa (hematologia, bioquimica, coagulacao, etc.), sem restricoes geograficas ou de capacidade;
        ◦ SAM (Serviceable Addressable Market): o subconjunto do TAM que a empresa PODE atender, considerando as UFs onde atua, os NCMs do portfolio, e a capacidade logistica parametrizada;
        ◦ SOM (Serviceable Obtainable Market): o subconjunto do SAM que a empresa REALMENTE consegue competir, baseado na taxa historica de vitoria, aderencia tecnica media e capacidade de atendimento simultaneo.
    • E importante que o sistema faca distincao entre:
        ◦ Analises de MERCADO (dimensionamento, tendencias, sazonalidade, precos medios) — sao analises macro que orientam a estrategia comercial da empresa;
        ◦ Analises de CONCORRENCIA (quem sao os players, qual a taxa de vitoria deles, quais precos praticam, em quais orgaos sao fortes) — sao analises pontuais que orientam a tatica por edital;
        ◦ Analises de PERFORMANCE (como a empresa esta performando no pipeline, qual a taxa de conversao por etapa, qual o ROI do sistema) — sao indicadores de gestao para a diretoria;
        ◦ DETECCAO DE ANOMALIAS (itens intrusos em editais, precos fora do padrao, orgaos com comportamento atipico) — sao alertas proativos que protegem a empresa de armadilhas.
    • O Pipeline de Aprendizado fecha o loop de retroalimentacao do sistema. Cada resultado (vitoria, derrota, desistencia) e cada ajuste manual em parametrizacoes (pesos de score, margens, estrategias) alimenta uma base de conhecimento que a IA consulta em analises futuras. Exemplo pratico: "na ultima analise, voce alterou o peso da aderencia tecnica de 0.4 para 0.6 depois de perder o edital X por criterio tecnico — quer aplicar a mesma logica aqui?"
    • Tomar como referencia o Roadmap Fase 1 (18/12/2025), itens 5.c (Score de Competitividade), 5.d (Score de Qualidade dos Concorrentes), 5.e (Tempo Medio do 1o Empenho), 11 (Monitoramento de licitacoes participadas — aprendizado com resultados).

Fluxo de Mercado e Dimensionamento — Dividido em Cards
Cada card devera ter uma abertura que evidencia o detalhamento dos processos que estao dentro desse card especifico:
    1. CARD — DASHBOARD TAM/SAM/SOM
    • Visao consolidada do mercado dimensionado pela IA, com tres indicadores-chave em formato funil visual;
    • TAM: total de editais publicados nos segmentos do portfolio da empresa nos ultimos 12 meses, com valor estimado acumulado. Fontes: PNCP + Brave (historico ja capturado nas Sprints 2/6);
    • SAM: editais do TAM filtrados pelas UFs de atuacao da empresa + NCMs do portfolio + faixa de valor viavel. Fontes: parametrizacoes da empresa (Sprint 1) + portfolio (Sprint 1);
    • SOM: editais do SAM multiplicados pela taxa historica de vitoria da empresa + filtro de capacidade. Fontes: pipeline CRM (Sprint 5) + participacoes historicas;
    • A tela e operada via chatbox: o usuario pode pedir "calcula meu TAM/SAM/SOM para hematologia em SP e MG" e a IA, usando `tool_calcular_tam_sam_som`, executa o dimensionamento e popula a tela;
    • A mesma tela aceita "mostra a evolucao do meu SOM nos ultimos 6 meses" para trend analysis;
    • Cache de 30 dias (RN-059) com opcao de forcar recalculo.
    2. CARD — DISTRIBUICAO GEOGRAFICA DO MERCADO (EXPANSAO da aba Mapa do CRMPage)
    • **EXPANDE** o mapa Leaflet/OSM ja existente na aba Mapa do CRMPage (Sprint 5, `CRMPage.tsx:539L`);
    • ADICIONA: camada de "oportunidade SAM" — editais que existem no SAM mas que a empresa nao participou;
    • ADICIONA: stat cards (UF Maior Oportunidade, UF Menor Participacao, UFs sem Presenca);
    • ADICIONA: ranking de UFs (DataTable) abaixo do mapa;
    • ADICIONA: filtros Segmento e Metrica (Quantidade/Valor);
    • EXPANDE: popup ao clicar UF com valor R$, top 3 orgaos compradores, taxa de participacao;
    • NAO RECRIA o mapa — usa o MapContainer/TileLayer/CircleMarker existente.
    3. CARD — PARTICIPACAO DE MERCADO — SHARE (EXPANSAO da ConcorrenciaPage)
    • **EXPANDE** a ConcorrenciaPage ja existente (Sprint 5, `ConcorrenciaPage.tsx:231L`);
    • A tabela de concorrentes com CNPJ/Vitorias/Derrotas/Taxa/Preco Medio JA EXISTE — NAO recriar;
    • ADICIONA: grafico de share (barras horizontais) — empresa em azul, concorrentes em cinza;
    • ADICIONA: stat cards (Concorrentes Conhecidos, Nossa Taxa, Maior Ameaca, Disputas);
    • ADICIONA: badge alerta amarelo (RN-073) na tabela existente;
    • ADICIONA: filtros Segmento, UF, Periodo;
    • Dados alimentados por: tabela `concorrentes` + `participacoes_editais` + `precos_historicos` (todas ja existem).
    4. CARD — ITENS INTRUSOS DETECTADOS
    • Relacao dos itens detectados pela IA como "intrusos" em editais — itens que fogem do padrao do objeto principal;
    • Exemplo: edital de reagentes de hematologia que inclui "calibrador sem valor de venda" ou "equipamento de terceiro nao contemplado no portfolio";
    • Cada item intruso mostra: edital de origem, descricao do item, motivo da classificacao como intruso, criticidade (alto/medio/informativo), acao sugerida;
    • Historico de alertas de itens intrusos por periodo.

PRINCIPAIS KPIs DO FLUXO DE MERCADO:
    1. TAM / SAM / SOM em valor (R$) e quantidade de editais
    2. Taxa de Cobertura (SAM / TAM) — indica quanto do mercado a empresa consegue atender
    3. Taxa de Penetracao (SOM / SAM) — indica quanto do mercado acessivel a empresa realmente compete
    4. Share de Mercado por segmento — % de editais ganhos vs total no segmento
    5. Top 5 concorrentes por taxa de vitoria
    6. Itens Intrusos Detectados / Total de Editais Analisados

Fluxo de Analytics Consolidado — Dividido em Cards
Cada card devera ter uma abertura que evidencia o escopo e a finalidade dos indicadores:
    1. CARD — PERFORMANCE DO PIPELINE
    • Funil de conversao por etapa do CRM (13 stages da Sprint 5): quantos editais entraram em cada etapa e quantos avancaram para a proxima;
    • Taxa de conversao por etapa (RN-196: "analisados", "participados", "nao_participados");
    • Grafico de funil visual com cores por etapa e numeros absolutos;
    • Filtros: Periodo (3m/6m/12m), Segmento, UF.
    2. CARD — TAXAS DE CONVERSAO
    • Indicadores detalhados: Taxa Geral (editais ganhos / participados), Taxa por Tipo de Edital (pregao, concorrencia, dispensa), Taxa por UF, Taxa por Segmento;
    • Benchmark historico: mesma metrica no periodo anterior para comparacao (seta verde se subiu, vermelha se caiu);
    • Contribuicao do sistema: editais descobertos via monitoramento automatico (Sprint 6) vs editais inseridos manualmente.
    3. CARD — TEMPO MEDIO ENTRE ETAPAS
    • Para cada transicao de etapa do pipeline CRM: tempo medio em dias;
    • Identificacao de gargalos: etapas onde o tempo medio e desproporcional (ex.: "proposta submetida → espera resultado" demora em media 45 dias vs 10 dias nas demais transicoes);
    • Grafico de barras horizontais com as etapas ordenadas por tempo medio.
    4. CARD — ROI DO SISTEMA
    • Calculo estimado do retorno sobre o investimento do sistema:
        ◦ Receita: soma dos valores arrematados em editais ganhos no periodo;
        ◦ Oportunidades Salvas: editais que a empresa quase perdeu mas conseguiu reverter via recursos (Sprint 4) — valor estimado;
        ◦ Produtividade: estimativa de horas economizadas vs processo manual (baseado em benchmark do setor);
    • Indicador unico: ROI % = (Receita + Economias) / Custo estimado do sistema;
    • Filtros: Periodo.
    5. CARD — ANALISE DE PERDAS COM RECOMENDACOES IA (EXPANSAO da PerdasPage)
    • **EXPANDE** a PerdasPage ja existente (Sprint 5, `PerdasPage.tsx:213L`);
    • O dashboard de perdas JA EXISTE com 3 stat cards, pie chart de motivos e tabela — NAO recriar;
    • ADICIONA: stat card "Top Motivo" (4o card);
    • ADICIONA: filtros Segmento e UF (ao filtro Periodo existente);
    • ADICIONA: card "Recomendacoes da IA" com 3-5 insights + botoes Aplicar/Rejeitar;
    • ADICIONA: botao "Exportar CSV";
    • Integra com UC-CRM07 (Sprint 5) para puxar os dados ja registrados;
    • Insights aceitos alimentam Pipeline de Aprendizado (UC-AP01).

PRINCIPAIS KPIs DO FLUXO DE ANALYTICS:
    1. Taxa de Conversao Geral (editais ganhos / participados)
    2. Tempo Medio do Ciclo Completo (captacao → resultado definitivo)
    3. Valor Medio Arrematado vs Valor Medio Estimado
    4. ROI % do sistema
    5. Top 3 Motivos de Perda
    6. Editais Descobertos via Monitoramento vs Total Captado

Fluxo de Aprendizado Continuo — Dividido em Cards
Cada card devera ter uma abertura que evidencia como o sistema retroalimenta a inteligencia:
    1. CARD — FEEDBACKS REGISTRADOS
    • Relacao de todos os feedbacks (resultados) registrados no sistema, que alimentam a base de conhecimento da IA;
    • Tipos de feedback: resultado_edital (ganhou/perdeu/desistiu), score_ajustado (usuario alterou peso/parametro), preco_ajustado (usuario alterou margem/lance), feedback_usuario (avaliacao explicita);
    • Cada registro mostra: tipo, entidade de referencia, dados de entrada (estado antes), resultado real (estado depois), delta (diferenca), aplicado (se a IA ja usou esse feedback), data;
    • Modelo `AprendizadoFeedback` ja existe no `models.py` — esta sprint popula e exibe.
    2. CARD — SUGESTOES DA IA
    • Relacao das sugestoes que a IA gera a partir do aprendizado acumulado;
    • Exemplo: "Voce ajustou o peso de aderencia tecnica de 0.4 para 0.6 nos ultimos 3 editais de hematologia. Quer aplicar isso como padrao para esse segmento?";
    • Exemplo: "Seus editais ganhos em SP tem margem media de 8%. Os perdidos tinham margem de 15%. A IA sugere calibrar a margem alvo para 10% nessa UF.";
    • Cada sugestao: aceitar (aplica automaticamente), rejeitar (com motivo), adiar;
    • Sugestoes aceitas viram novos registros em `AprendizadoFeedback` com `aplicado=true`.
    3. CARD — PADROES DETECTADOS
    • Analises automaticas que a IA roda periodicamente sobre a base de feedbacks;
    • Padroes possiveis: sazonalidade de editais por mes, correlacao entre aderencia tecnica e vitoria, orgaos com comportamento previsivel, faixas de preco vencedoras por segmento;
    • Cada padrao detectado mostra: descricao, confianca (%), base de dados (quantos registros sustentam o padrao), acao sugerida;
    • Frequencia de analise: 1x por semana via scheduler (job registrado no APScheduler).

PRINCIPAIS KPIs DO FLUXO DE APRENDIZADO:
    1. Feedbacks Registrados por Mes
    2. Sugestoes Geradas vs Sugestoes Aceitas (taxa de adocao)
    3. Padroes Detectados com Confianca > 70%
    4. Impacto das sugestoes: taxa de vitoria antes vs depois da aplicacao
    5. Ajustes de parametrizacao rastreados (auditoria sensivel Sprint 6)

PONTOS IMPORTANTES SOBRE APRENDIZADO:
    • O Pipeline de Aprendizado depende diretamente da base de dados de `auditoria_log` da Sprint 6 — toda alteracao de parametrizacao que dispara alerta sensivel tambem alimenta o aprendizado;
    • O modelo `AprendizadoFeedback` ja existe e tem 4 tipos de evento; esta sprint adiciona a logica de deteccao de padroes e geracao de sugestoes;
    • A IA NAO deve aplicar sugestoes automaticamente sem confirmacao do usuario — cada sugestao exige aceitar/rejeitar explicito (governanca);
    • Sugestoes rejeitadas tambem sao registradas com motivo — isso evita que a IA repita sugestoes que o usuario ja descartou;
    • A tabela `aprendizado_feedback` tende a crescer, mas em volume muito menor que `auditoria_log` — nao precisa de particionamento por enquanto.

Referencia com Modelo Existente
A base tecnica para esta sprint ja existe parcialmente no sistema. Os seguintes itens de infraestrutura estao disponiveis e devem ser REUSADOS ao inves de reescritos:
    • `MercadoPage.tsx` ja existe com 3 stat cards (Editais no Periodo, Valor Total, Valor Medio) + barra de tendencias + categorias — esta sprint REESCREVE para incluir TAM/SAM/SOM + mapa + share + intrusos;
    • Rota `/api/dashboard/mercado` ja existe em `app.py` e retorna `tendencias`, `categorias`, `total_editais`, `valor_total` — esta sprint EXPANDE para incluir dimensionamento TAM/SAM/SOM;
    • Model `Concorrente` ja existe com campos: nome, cnpj, segmentos, editais_participados, editais_ganhos, preco_medio, taxa_vitoria;
    • Model `ParticipacaoEdital` ja existe com campos: edital_id, concorrente_id, preco_proposto, posicao_final, desclassificado;
    • Model `PrecoHistorico` ja existe com campos: edital_id, produto_id, preco_referencia, preco_vencedor, nosso_preco;
    • Model `AprendizadoFeedback` ja existe com campos: tipo_evento, entidade, dados_entrada, resultado_real, delta, aplicado;
    • Routes de concorrentes ja existem em `app.py`: `processar_listar_concorrentes`, `processar_analisar_concorrente`;
    • CRUD `aprendizado-feedback` ja esta registrado em `crud_routes.py`;
    • Pipeline CRM de 13 stages (RN-165) ja esta ativo desde Sprint 5 — alimenta funil de analytics;
    • Middleware de Auditoria Universal (Sprint 6) — alteracoes sensiveis em parametrizacoes alimentam pipeline de aprendizado;
    • Sidebar ja tem entrada "Mercado" em "Indicadores" — esta sprint adiciona "Analytics" e "Aprendizado".

Integracao com Sprints Anteriores
Esta sprint e profundamente transversal e consome dados de todas as sprints anteriores:
    • Sprint 1 (Fundacao) — portfolio e parametrizacoes definem o SAM (quais NCMs, quais UFs, qual capacidade);
    • Sprint 2 (Captacao + Validacao) — historico de editais captados alimenta TAM; score de aderencia alimenta SOM;
    • Sprint 3 (Precificacao + Proposta) — precos praticados alimentam analise de preco medio e competitividade;
    • Sprint 4 (Impugnacao + Recursos) — resultados de recursos alimentam aprendizado sobre qualidade da concorrencia;
    • Sprint 5 (CRM + Contratos) — pipeline de 13 stages alimenta funil de analytics; motivos de perda alimentam analise de perdas; resultados definitivos alimentam feedbacks;
    • Sprint 6 (Auditoria + Monitoria) — alteracoes sensiveis em parametrizacoes alimentam pipeline de aprendizado; monitoramentos alimentam descoberta proativa de editais (que entra no calculo do TAM).

Valor agregado da funcionalidade
Esta Sprint e a que transforma o sistema de "ferramenta que opera junto" para "plataforma que pensa junto". Sem inteligencia de mercado, sem analytics e sem aprendizado, todo o capital operacional entregue nas Sprints 1-6 gera dados que ninguem analisa de forma consolidada. Com o que esta Sprint entrega:
    • A diretoria sabe exatamente o tamanho do mercado que interessa a empresa, quanto esta sendo capturado, e quanto esta sendo desperdicado — decisao de investimento informada;
    • O time comercial tem visibilidade de quem sao os concorrentes, onde sao fortes, e quais precos praticam — tatica por edital baseada em dados reais;
    • A deteccao de itens intrusos em editais evita o cenario classico de "ganhamos o edital mas tem um item que nao fornecemos e que vai consumir toda a margem";
    • O analytics consolidado mostra gargalos no pipeline (onde os processos estao travando) e permite acao corretiva rapida;
    • A analise de perdas com recomendacoes da IA fecha o loop de melhoria: cada derrota gera aprendizado que melhora a proxima tentativa;
    • O Pipeline de Aprendizado e o diferencial de longo prazo: quanto mais a empresa usa o sistema, mais inteligente ele fica, criando uma vantagem competitiva cumulativa que concorrentes nao conseguem replicar sem o mesmo volume de dados historicos.

PRINCIPAIS KPIs CONSOLIDADOS DESTA SPRINT:
    1. TAM / SAM / SOM — dimensionamento atualizado mensalmente
    2. Share de Mercado por segmento — deve subir trimestre a trimestre
    3. Taxa de Conversao Geral — meta: acima de 25%
    4. ROI do Sistema — deve ser positivo apos 3 meses de uso
    5. Sugestoes da IA Aceitas / Total — indica confianca do usuario no sistema
    6. Itens Intrusos Detectados antes de Submissao da Proposta — economia direta de recursos
    7. Tempo Medio entre Captacao e Resultado — deve cair com uso do sistema
    8. Padroes de Aprendizado com Confianca > 70% — indica maturidade da base de conhecimento
