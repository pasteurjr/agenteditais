SPRINT 6 — FLAGS, MONITORIA, AUDITORIA E SMTP (V2)

Versao: 2.0
Data-base: 15/04/2026
Substitui: SPRINT 6-VI.md (v1, sem rastreabilidade RF/RN correta)
Alinhamento: requisitos_completosv8.md (13/04/2026) + CASOS DE USO SPRINT 6.md (V4)

---

Rastreabilidade com requisitos_completosv8.md

Esta sprint cobre os seguintes requisitos funcionais do v8:

    • RF-047 — Flags (Sinalizadores): dashboard de alertas criticos com categorias, cores, criacao via modal/IA e acoes (visualizar, silenciar, excluir). [Pagina Workflow: layout geral, indicador direito]
    • RF-048 — Monitoria: painel de monitoramentos automaticos com termo, UFs, fonte, frequencia, status, eventos capturados e acoes (pausar, ativar, excluir). [Pagina Workflow: layout geral, indicador direito]
    • RF-056 — Governanca e Auditoria: log completo de todas as acoes do sistema (usuario, acao, entidade, dados antes/depois, timestamp), middleware automatico para operacoes CRUD e dashboard de auditoria para administradores.
    • RF-052-01 — Alertas de Vencimento Multi-tier: sistema de alertas configuraveis com multiplos niveis de antecedencia (30/15/7/1 dias) e canais escalonados (sistema/email/WhatsApp). Originalmente alocado na Sprint 5; nesta sprint os alertas passam do modo simulacao (log em arquivo) para o modo producao (SMTP real).
    • RF-054 — Interface Hibrida (Chat + CRUD Visual): todas as operacoes desta sprint sao acessiveis tanto via chatbox (IA executando tools) quanto via pagina visual. Criacao de alertas e monitoramentos e primariamente feita via chat.
    • RF-004 — Documentos da Empresa: consumido indiretamente pelo UC-MO03 (analise de coerencia dos documentos via IA sob demanda).
    • RF-002 — Gestao de Certidoes: consumido pelo UC-FL02 e UC-MO03 para disparo automatico de alertas via scheduler quando certidoes se aproximam do vencimento.
    • RF-019 — Captacao de Editais: consumido pelo UC-MO04 (verificacao de pendencias PNCP sob demanda).
    • RNF-003 — Observabilidade: consumido pelo UC-SM01 e UC-SM03 (fila de envio, logs estruturados, metricas de entrega).

Regras de Negocio ativadas (enforce) nesta sprint:

    • RN-037 — Audit log universal (era FALTANTE → passa a ENFORCED via middleware transversal)
    • RN-132 — Audit de invocacoes DeepSeek (era FALTANTE → passa a ENFORCED via decorator em tools.py)
    • RN-080 — Recalcular scores apos decisao GO/NO-GO exige justificativa + nova versao (era FALTANTE → passa a ENFORCED)
    • RN-039 — Documentos com data_vencimento transitam para "expirado" automaticamente via scheduler (era FALTANTE → passa a ENFORCED)
    • RN-031 — Bloqueio de participacao com certidao obrigatoria vencida (era FALTANTE → passa a ENFORCED via scheduler que atualiza status e dispara alerta)
    • RN-211 — Alerta formal ao gestor quando divergencia em auditoria ≥ R$1.000 OU ≥5% do empenhado (era FALTANTE → passa a ENFORCED)
    • RN-212 — Contador de prazo em Recursos/Contra-Razoes dispara evento automatico ao zerar (era FALTANTE → passa a ENFORCED via scheduler)
    • RN-186 — Niveis de criticidade (Critico<7d, Urgente 7-15d, Atencao 15-30d, Normal >30d) — ja estava enforced desde Sprint 5, reusada
    • RN-187 — Canais escalonados (sistema sempre, email 15d+, WhatsApp 7d+) — ja estava enforced desde Sprint 5, reusada
    • RN-008 — Status visual de certidao derivado da data de vencimento — ja estava enforced, agora dispara alerta via scheduler
    • RN-084 — Cooldown 60s entre invocacoes DeepSeek por empresa — ja estava enforced, aplicada aos novos UCs de chatbox

Total: 11 RNs enforced (6 ativadas a partir de FALTANTE + 5 ja enforced reusadas).

---

Com relacao a esta Sprint:

    • Esta Sprint entrega a camada de observabilidade, auditoria e notificacoes que amarra todo o ciclo comercial implementado nas Sprints 1 a 5. Depois de entregues a captacao, precificacao, propostas, impugnacoes, recursos, CRM e gestao de contratos, a empresa precisa saber: o que esta prestes a vencer, o que mudou, quem mexeu em que, e como avisar o usuario certo no momento certo.
    • O sistema deve centralizar toda a configuracao de alertas e monitoramentos em telas operadas via IA (RF-054). O usuario nao configura mais flags abrindo formularios — ele pede via chatbox e a IA cria, lista, ajusta ou desativa os alertas/monitoramentos para ele.
    • A auditoria (RF-056) deixa de ser opcional e passa a ser universal: toda mudanca de estado, toda delecao, toda alteracao sensivel em qualquer entidade (Edital, Proposta, Contrato, Produto, LeadCRM, ParametroScore) gera um registro em log, com quem fez, quando fez, o estado anterior e o estado novo. Isso nao e so conformidade — e o substrato que vai alimentar, na Sprint de Aprendizado (Sprint 7 v4), a inteligencia sobre porques e padroes de decisao da empresa.
    • E importante que o sistema faca distincao entre:
        ◦ Alertas OPERACIONAIS (RF-047 + RF-052-01): prazos vencendo, sessao de pregao abrindo, contratos a vencer, certidoes expirando — esses disparam via scheduler + email SMTP real;
        ◦ Monitoramentos CONTINUOS (RF-048): fontes externas (PNCP, portais de transparencia, sites de orgaos) rodando em background, gerando eventos que populam telas e caixas de entrada do usuario;
        ◦ Analises sob demanda (RF-048 via chatbox): coerencia de documentos da empresa (RF-004) e pendencias do edital no PNCP (RF-019) — essas sao invocadas via chatbox quando o usuario quer uma segunda leitura.
    • Cada alerta e cada monitoramento devera ser associado a um responsavel (usuario do sistema) e a uma entidade de referencia (edital, contrato, proposta, produto), para facilitar o tracking e o rateio de responsabilidades entre o time.
    • Tomar como referencia, alem do conteudo deste descritivo, a Planilha de Controle de Editais Argus — aba "Alertas e Prazos" — que mostra como hoje a Argus controla manualmente os vencimentos e os responsaveis. A ideia e que o sistema absorva essa planilha e elimine o controle paralelo em Excel.
    • Permitir, na area de cadastro, que a empresa parametrize os tipos de alertas, os canais de entrega (email, tela, ambos), os horarios de disparo e os destinatarios padrao, no seguinte formato de exemplo:
        A. Tipos de Alertas (cobertos por RF-047 + RF-052-01):
    • Prazo de Impugnacao vencendo
    • Prazo de Recurso vencendo
    • Abertura de Sessao de Pregao
    • Contrato a vencer em 90 dias
    • Contrato a vencer em 30 dias
    • Certidao Negativa expirando (dispara via RN-008 + RN-039)
    • Empenho com saldo critico
    • Item intruso detectado em edital
    • Pedido em atraso vs cronograma
    • Auditoria — alteracao sensivel em parametrizacao (disparado via RF-056 middleware)
        B. Canais de Entrega (regidos por RN-187):
    • Email SMTP (producao) — para alertas com antecedencia ≥15 dias
    • Notificacao em tela (sino) — para todos os alertas
    • WhatsApp — para alertas com antecedencia ≥7 dias (fase futura, fora desta sprint)
        C. Niveis de Criticidade (regidos por RN-186):
    • Critico (vermelho, <7 dias, disparo imediato)
    • Urgente (laranja, 7-15 dias, disparo diario)
    • Atencao (amarelo, 15-30 dias, resumo semanal)
    • Normal (verde, >30 dias, apenas tela)

Fluxo de Flags e Alertas do sistema (RF-047 + RF-052-01) — Dividido em Cards
Cada card devera ter uma abertura que evidencia o detalhamento dos processos que estao dentro desse card especifico:

    1. CARD — ALERTAS ATIVOS (UC-FL01)
    • Relacao de todos os alertas configurados e atualmente em vigilancia pelo sistema;
    • Cada alerta deve mostrar: tipo, entidade de referencia (edital, contrato, etc.), responsavel, data de disparo prevista, canal, criticidade e status (aguardando, disparado, reconhecido, expirado);
    • A tela e operada via chatbox (RF-054): o usuario pode pedir "cria um alerta de prazo de recurso para o edital X com disparo amanha as 8h" e a IA, usando `tool_configurar_alertas`, cria a entrada e confirma;
    • A mesma tela aceita "lista todos os alertas criticos para esta semana" via `tool_listar_alertas`;
    • Possibilidade de cancelar via "cancela o alerta Y" via `tool_cancelar_alerta`;
    • Toda invocacao destas tools fica registrada em AuditoriaLog (RN-132).
    2. CARD — DISPAROS DO DIA (UC-FL05)
    • Agenda visual, tipo calendario, com todos os disparos previstos para o dia corrente, semana e mes;
    • Cores diferentes por criticidade conforme RN-186 (critico vermelho, urgente laranja, atencao amarelo, normal verde);
    • Ao clicar em um disparo, o usuario e levado ao detalhe da entidade de referencia (ex: clica no alerta de recurso, abre a tela de recursos daquele edital).
    3. CARD — HISTORICO DE ALERTAS (UC-FL03)
    • Relacao dos ultimos N alertas disparados (padrao 30 dias), com status de entrega (email enviado com sucesso, email falhou, usuario reconheceu na tela, expirou sem reconhecimento);
    • Filtros por tipo, responsavel, criticidade, status, periodo;
    • Essa tela servira de insumo para, futuramente, identificar responsaveis que estao ignorando alertas criticos (governanca interna via RF-056).
    4. CARD — ALERTAS SILENCIADOS (UC-FL04)
    • Relacao dos alertas que o usuario pediu para a IA silenciar temporariamente (ex: "silencia os alertas de contrato a vencer ate segunda");
    • Cada silenciamento deve ter motivo (minimo 20 caracteres), prazo de retomada e log do usuario que silenciou (RN-037);
    • O silenciamento em si e uma operacao auditada — nao e possivel silenciar um alerta sem deixar rastro.

PRINCIPAIS KPIs DO FLUXO DE FLAGS (cobrem RF-047 criterio 4):

    1. Alertas Disparados no Mes X Alertas Reconhecidos
    2. Taxa de Reconhecimento por Responsavel
    • Para identificar se algum membro do time esta deixando alertas passarem
    3. Tempo Medio entre Disparo e Reconhecimento
    4. Alertas Criticos Expirados sem Reconhecimento
    • Importante: esse numero deveria tender a zero (meta SLO)
    5. Top Tipos de Alertas Disparados
    • Para entender onde a empresa esta mais exposta a prazos

Fluxo de Monitoramento Automatico (RF-048) — Dividido em Cards
Cada card devera ter uma abertura que evidencia o detalhamento dos monitoramentos que estao dentro desse card especifico:

    1. CARD — MONITORAMENTOS ATIVOS (UC-MO01)
    • Relacao de todos os monitoramentos configurados pela empresa e rodando em background;
    • Cada monitoramento deve mostrar: fonte (PNCP, portal da prefeitura X, site do orgao Y), criterio (palavras-chave, NCMs, orgaos especificos, faixa de valores), periodicidade (hora em hora, 4x ao dia, 1x ao dia), ultima execucao, proxima execucao, status (ativo, pausado, com erro);
    • Operacao via chatbox (RF-054): "cria um monitoramento do PNCP para buscar reagentes de hematologia com faixa de valor entre 100k e 500k, roda 2x ao dia" via `tool_configurar_monitoramento` (UC-MO02);
    • "Lista todos os monitoramentos ativos" via `tool_listar_monitoramentos`;
    • "Pausa o monitoramento Z por uma semana" ou "desativa o monitoramento W" via `tool_desativar_monitoramento`;
    • Cooldown DeepSeek RN-084 aplicavel a todas as invocacoes.
    2. CARD — EVENTOS CAPTURADOS (UC-MO05)
    • Relacao dos ultimos eventos capturados pelos monitoramentos (editais novos, editais alterados, atas publicadas, pregoes reabertos);
    • Cada evento deve indicar: monitoramento de origem, entidade descoberta (edital, ata, etc.), data/hora da captura, acao sugerida pela IA (ex: "avaliar para analise", "descartar — fora do portfolio", "alerta critico — item intruso detectado");
    • Ao clicar em um evento, o usuario e levado a tela de captacao (RF-019) ja com a entidade pre-carregada para analise.
    3. CARD — MONITORAMENTOS COM ERRO (UC-MO06)
    • Relacao dos monitoramentos que falharam nas ultimas N execucoes (fonte indisponivel, schema alterado, timeout, rate limit);
    • Indicar ultima tentativa, tipo de erro, acao corretiva sugerida pela IA;
    • Essa tela e critica porque monitoramentos silenciosamente quebrados sao o pior cenario — a empresa acredita que esta sendo notificada e na verdade esta cega.
    4. CARD — ANALISES SOB DEMANDA (UC-MO03, UC-MO04)
    • Historico das analises pontuais invocadas pelo usuario via chatbox:
    • SUBCARD — ANALISE DE DOCUMENTOS DA EMPRESA (UC-MO03)
    • Quando o usuario pede "analisa os documentos da minha empresa e me diz se esta tudo coerente", a IA via `tool_analisar_documentos_empresa` varre os documentos cadastrados em RF-004 (contrato social, certidoes, alvaras, cadastro na ANVISA, etc.) e reporta inconsistencias (razao social divergente, datas fora de ordem, certidao vencida, campo ausente);
    • Certidoes vencidas disparam automaticamente RN-031 (bloqueio de participacao) e geram alertas via UC-FL02;
    • Documentos com data de vencimento passada transitam automaticamente para `expirado` (RN-039);
    • O resultado fica registrado em `AnaliseDocumentosEmpresa` para consulta futura e para comparacao com analises anteriores.
    • SUBCARD — PENDENCIAS NO PNCP (UC-MO04)
    • Quando o usuario pede "verifica se o edital X tem pendencias ou atualizacoes no PNCP", a IA via `tool_verificar_pendencias_pncp` consulta o portal (RF-019), compara com o que esta salvo no sistema, e reporta mudancas (adendo, prorrogacao de prazo, alteracao de termo de referencia, cancelamento, suspensao);
    • O resultado gera, quando aplicavel, um alerta automatico para o responsavel do edital via UC-FL02.

PRINCIPAIS KPIs DO FLUXO DE MONITORAMENTO (cobrem RF-048 criterio 2):

    1. Monitoramentos Ativos X Monitoramentos com Erro
    2. Eventos Capturados no Mes X Eventos que Viraram Analise
    • Ou seja, quantos eventos de fato geraram acao do usuario
    3. Editais Descobertos via Monitoramento Automatico X Total de Editais Analisados
    • Mostra o quanto o sistema automatizado esta contribuindo para a captacao
    4. Tempo Medio entre Publicacao no PNCP e Captura pelo Monitoramento
    5. Pendencias PNCP Detectadas X Pendencias que Exigiram Acao
    • Exemplo: edital que foi prorrogado mas a empresa ja havia decidido nao participar

Fluxo de Auditoria (RF-056) — Dividido em Cards
Cada card devera ter uma abertura que evidencia o escopo e os criterios da auditoria.

    1. CARD — REGISTROS DE AUDITORIA (UC-AU01)
    • Relacao de todos os eventos auditados do sistema, com filtros por entidade, usuario, tipo de operacao, periodo;
    • Cada registro deve conter: ID do evento, timestamp, usuario responsavel, entidade (Edital, Proposta, Contrato, Produto, LeadCRM, ParametroScore, etc.), operacao (CREATE, UPDATE, DELETE, STATE_TRANSITION), estado anterior (JSON), estado novo (JSON), IP de origem;
    • A captura e universal (RN-037 enforced nesta sprint): o middleware de auditoria intercepta todas as operacoes de escrita nos CRUDs e em endpoints sensiveis, populando a tabela `auditoria_log`.
    2. CARD — ALTERACOES SENSIVEIS (UC-AU02)
    • Relacao das alteracoes que impactam parametrizacoes de score, precos, politicas de lance, margem minima, pesos de aderencia tecnica, pesos de aderencia comercial, decisoes GO/NO-GO, motivos de perda, e qualquer campo que afete diretamente o comportamento da IA;
    • Cada alteracao desse tipo dispara automaticamente um alerta do tipo "Auditoria — alteracao sensivel em parametrizacao" para um destinatario parametrizado (normalmente a diretoria ou o gestor do sistema);
    • Alteracoes em ParametroScore exigem justificativa obrigatoria + nova versao (RN-080 enforced nesta sprint) — versao anterior preservada para timeline;
    • Divergencias em auditoria de empenhos so disparam alerta formal ao gestor quando ≥R$1.000 OU ≥5% do empenhado (RN-211 enforced nesta sprint) — threshold anterior de R$0,01 gerava ruido demais.
    3. CARD — CONSULTAS A AUDITORIA (UC-AU01 + chatbox)
    • Tela de busca assistida pela IA — o usuario pergunta "quem alterou o score de aderencia do portfolio de hematologia nos ultimos 30 dias" e a IA traduz a pergunta em uma query sobre `auditoria_log` e retorna a lista;
    • "Mostra todas as delecoes de edital feitas pelo usuario Fulano no mes passado";
    • "Quais foram as ultimas 10 mudancas de estado do contrato X";
    • A propria consulta de auditoria e ela mesma auditada (metacaptura).
    4. CARD — EXPORTACAO PARA COMPLIANCE (UC-AU03)
    • Relacao dos pacotes de exportacao de auditoria gerados sob demanda (PDF ou CSV), com filtros por periodo, entidade e usuario;
    • Pacote versionado e assinado (timestamp + hash SHA-256) para servir de evidencia junto a auditorias externas ou inqueritos formais;
    • Download e envio por email via SMTP producao (UC-SM03);
    • Mascaramento automatico de dados pessoais LGPD (nomes, emails, IPs) quando a flag `mascarar_lgpd=true` esta ativada (default).

PONTOS IMPORTANTES SOBRE AUDITORIA:

    • A tabela `auditoria_log` tende a crescer rapido. E importante ter politica de particionamento por mes e TTL (retencao padrao sugerida: 24 meses na tabela online + arquivamento para storage frio depois disso);
    • A serializacao do "estado anterior" e "estado novo" deve mascarar campos sensiveis (senhas, tokens, chaves de API, dados de pagamento) antes de gravar — isso precisa ser enforced no middleware, nao deixar para cada chamador;
    • A captura de IP de origem e importante para rastreabilidade, mas requer atencao em LGPD: a empresa deve ter politica de retencao clara;
    • O middleware deve falhar de forma graciosa: se a gravacao no log falhar, a operacao principal NAO pode ser bloqueada — o log e evidencia, nao gate. A falha deve gerar um alerta critico para o administrador do sistema.

Fluxo de Notificacoes SMTP (RF-052-01 + RNF-003) — Dividido em Cards
Esta etapa viabiliza a entrega real das notificacoes. Nas sprints anteriores, o disparo de email ficou em modo simulacao (log em arquivo). Esta sprint promove o envio a producao.

    1. CARD — CONFIGURACAO SMTP (UC-SM01)
    • Tela de parametrizacao do servidor SMTP da empresa: host, porta, usuario, senha criptografada, TLS/SSL, remetente padrao, nome do remetente;
    • Teste de conexao imediato ao salvar (envio de email de verificacao para o proprio remetente);
    • Suporte a multiplos provedores: SMTP proprio, Gmail Workspace, Microsoft 365, SendGrid, Amazon SES;
    • Permitir parametrizar DIFERENTES remetentes por tipo de alerta (ex: alertas juridicos saem do email juridico@empresa, alertas comerciais saem do email comercial@empresa), para que o destinatario identifique de imediato o contexto.
    2. CARD — FILA DE ENVIO (UC-SM03)
    • Relacao dos emails na fila do scheduler, com status (pendente, enviando, enviado, falhou, reagendado);
    • Retentativas automaticas em caso de falha (backoff exponencial: 1min, 5min, 30min, desiste);
    • Apos 3 tentativas falhas, o email vira alerta critico de auditoria para o administrador;
    • Canais escalonados por antecedencia (RN-187 enforced desde Sprint 5): sistema (sempre), email (15d+), WhatsApp (7d+, fase futura).
    3. CARD — TEMPLATES DE EMAIL (UC-SM02)
    • Relacao dos templates de email usados pelo sistema — um template por tipo de alerta;
    • Cada template deve permitir edicao WYSIWYG com variaveis (`{{ nome_usuario }}`, `{{ numero_edital }}`, `{{ data_limite }}`, `{{ link_sistema }}`, `{{ criticidade }}`);
    • Preview antes de salvar;
    • Versionamento dos templates (auditoria de quem mudou e quando — via RN-037);
    • Templates padrao ja cadastrados para os 10 tipos de alerta definidos na parametrizacao acima.
    4. CARD — HISTORICO DE ENVIOS (UC-SM03)
    • Relacao dos ultimos N emails enviados (padrao 30 dias), com destinatario, tipo, assunto, status de entrega, data/hora, mensagem de erro (se houver);
    • Filtros por destinatario, tipo, status, periodo;
    • Possibilidade de reenvio manual de emails que falharam (a partir da tela, o usuario pede "reenvia o email Y" e a IA dispara novamente).

PRINCIPAIS KPIs DO FLUXO DE NOTIFICACOES (cobrem RNF-003):

    1. Emails Enviados X Emails Entregues com Sucesso
    2. Taxa de Falha SMTP
    • Se passar de 5% e sinal de problema com o servidor/provedor
    3. Tempo Medio entre Enfileiramento e Envio
    4. Emails Criticos NAO Entregues
    • Esse numero deveria tender a zero; qualquer ocorrencia vira incidente
    5. Distribuicao de Envios por Tipo de Alerta
    • Para entender onde o sistema esta gerando mais "ruido"

Referencia com Modelo Existente
A base tecnica para esta sprint ja existe no sistema. Os seguintes itens de infraestrutura estao disponiveis e devem ser REUSADOS ao inves de reescritos:

    • APScheduler ja esta importado e em uso (`backend/scheduler.py`) — basta registrar novos jobs para as checagens periodicas (prazos de impugnacao/recurso, contratos a vencer, certidoes expirando, monitoramentos externos);
    • A tabela `auditoria_log` e o model `AuditoriaLog` ja existem em `backend/models.py` — nunca foram populados transversalmente. Esta sprint fara o wiring universal via middleware, concretizando RF-056;
    • A infraestrutura de chatbox + invocacao de tools ja esta entregue desde a Sprint 1 (RF-054) — basta criar as novas tools (`tool_configurar_alertas`, `tool_listar_alertas`, `tool_cancelar_alerta`, `tool_dashboard_prazos`, `tool_calendario_editais`, `tool_configurar_monitoramento`, `tool_listar_monitoramentos`, `tool_desativar_monitoramento`, `tool_analisar_documentos_empresa`, `tool_verificar_pendencias_pncp`) e registra-las no catalogo DeepSeek;
    • A Planilha de Controle de Editais Argus, na aba "Alertas e Prazos", traz 10 tipos de alerta que a Argus usa hoje manualmente — esses 10 devem virar os "tipos padrao" pre-cadastrados no sistema;
    • Os validadores RN ja montados em modo warn-only em Sprints 4 e 5 (`backend/rn_validators.py`, `backend/rn_audit.py`, `backend/rn_estados.py`) passam para modo enforced nesta sprint via `ENFORCE_RN_VALIDATORS=true`.

Integracao com Sprints Anteriores
Esta sprint e profundamente transversal. A lista abaixo mostra onde os alertas e monitoramentos vao se encaixar:

    • Sprint 1 (Fundacao) — auditoria universal (RF-056) passa a capturar todas as operacoes de CRUD de empresa, usuario, portfolio, produto, certidao, parametrizacoes;
    • Sprint 2 (Captacao + Validacao Legal) — monitoramentos PNCP/Brave (RF-048) passam a rodar em background via scheduler e populam a fila de eventos capturados (UC-MO05). Alertas de certidao vencida (RF-002 + RN-008) passam para o scheduler real e disparam via SMTP;
    • Sprint 3 (Precificacao + Proposta) — alertas de abertura de pregao passam a ser disparados via SMTP real. Alteracoes em ParametroScore, margem minima, pesos de aderencia disparam alertas de auditoria sensivel (UC-AU02 + RN-080);
    • Sprint 4 (Impugnacao + Recursos) — alertas de prazo de impugnacao (3 dias uteis) e recurso (3 dias uteis apos decisao) passam a ser calculados pelo scheduler 1x ao dia. O contador de prazo (RN-212) dispara evento automatico movendo card para "atrasado" quando zerar;
    • Sprint 5 (Follow-up + Atas + Contratos + CRM) — alertas de contrato a vencer em 90/30 dias (RF-052-01) passam a rodar no scheduler. Alertas de empenho com saldo critico. Alertas de pedido em atraso vs cronograma. Mudancas de estado de LeadCRM ficam auditadas. Threshold de divergencia em auditoria de empenhos sobe para R$1.000 ou 5% (RN-211).

Valor agregado da funcionalidade
Esta Sprint e a que transforma o sistema de "ferramenta operada" para "ferramenta que opera junto". Sem observabilidade, sem auditoria e sem notificacoes reais, todo o capital entregue nas Sprints 1 a 5 fica refem do usuario lembrar de olhar cada tela. Com o que esta Sprint entrega:

    • O usuario e chamado para agir no momento certo ao inves de ter que descobrir os problemas por conta propria (RF-047);
    • A diretoria tem rastreabilidade total sobre quem mexeu em que (RF-056), o que e fundamental tanto para governanca interna quanto para eventuais auditorias externas (TCE, TCU, auditorias contratuais);
    • Os monitoramentos em background (RF-048) tiram a pressao do time comercial de ficar varrendo o PNCP manualmente o tempo todo;
    • A analise de coerencia de documentos da empresa (RF-004 via UC-MO03) evita aquele cenario classico de "o edital reprovou a nossa participacao porque a certidao estava vencida ha 3 dias";
    • A infraestrutura SMTP em producao (RF-052-01 + RNF-003) permite, enfim, que o sistema saia do modo "alerta dentro da tela" e passe a competir por atencao dos usuarios no canal que eles de fato acompanham (email);
    • A base de dados de `auditoria_log` populada transversalmente sera, a partir da Sprint 7 v4 (Aprendizado), o substrato para a IA aprender padroes de decisao da empresa — quando a diretoria altera um peso de score, o sistema futuro podera perguntar "voce quer aplicar essa mesma alteracao ao grupo de produtos Y, que tem perfil parecido?".

PRINCIPAIS KPIs CONSOLIDADOS DESTA SPRINT:

    1. Alertas Criticos Expirados sem Reconhecimento — deve tender a zero
    2. Taxa de Falha SMTP — deve ficar abaixo de 5%
    3. Monitoramentos com Erro / Total de Monitoramentos — deve ficar abaixo de 10%
    4. Cobertura de Auditoria — percentual de endpoints de escrita cobertos pelo middleware (meta: 100%)
    5. Tempo Medio entre Evento PNCP e Alerta ao Usuario — deve ficar abaixo de 1 hora
    6. Analises de Documentos da Empresa Solicitadas X Inconsistencias Detectadas
    7. Volume de Mudancas Sensiveis Auditadas por Mes — linha de base para governanca
    8. Reenvios Manuais de Email X Envios Automaticos — metrica de "saude" da fila SMTP

---

Mapeamento RF → UC (referencia cruzada com CASOS DE USO SPRINT 6.md):

| RF | Descricao | UCs desta sprint |
|---|---|---|
| RF-047 | Flags (Sinalizadores) | UC-FL01, UC-FL02, UC-FL03, UC-FL04, UC-FL05 |
| RF-048 | Monitoria | UC-MO01, UC-MO02, UC-MO03, UC-MO04, UC-MO05, UC-MO06 |
| RF-056 | Governanca e Auditoria | UC-AU01, UC-AU02, UC-AU03 |
| RF-052-01 | Alertas Multi-tier | UC-FL01, UC-FL02, UC-SM01, UC-SM02, UC-SM03 |
| RF-054 | Interface Hibrida Chat+CRUD | UC-FL02, UC-MO02, UC-MO03, UC-MO04 |
| RF-004 | Documentos da Empresa | UC-MO03 |
| RF-002 | Gestao de Certidoes | UC-FL02, UC-MO03 (integracao) |
| RF-019 | Captacao de Editais | UC-MO04 |
| RNF-003 | Observabilidade | UC-SM01, UC-SM03 |

Total: 7 RFs + 1 RNF + 17 UCs + 11 RNs enforced.

---

Historico de versoes:

    • v1 (SPRINT 6-VI.md) — versao inicial com rastreabilidade RF/RN incorreta (citava RF-022, RF-023, RF-030, RF-031, RF-039 que no v8 correspondem a requisitos de Datas/Intencao/Analise/Precificacao). Mantido por decisao explicita do dono do projeto.
    • v2 (este documento) — rastreabilidade RF/RN corrigida usando requisitos_completosv8.md como fonte autoritativa. Citacoes explicitas de RF-047, RF-048, RF-056, RF-052-01, RF-054, RF-004, RF-002, RF-019, RNF-003. Adicao de mapeamento RF → UC com CASOS DE USO SPRINT 6.md. Conteudo de negocio do v1 preservado quase na integra; apenas ajustes pontuais para correlacionar com as RNs e UCs reais.
