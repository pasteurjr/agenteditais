Com relação à esta Sprint:
    • Esta Sprint entrega a camada de observabilidade, auditoria e notificações que amarra todo o ciclo comercial implementado nas Sprints 1 a 5. Depois de entregues a captação, precificação, propostas, impugnações, recursos, CRM e gestão de contratos, a empresa precisa saber: o que está prestes a vencer, o que mudou, quem mexeu em quê, e como avisar o usuário certo no momento certo.
    • O sistema deve centralizar toda a configuração de alertas e monitoramentos em telas operadas via IA. O usuário não configura mais flags abrindo formulários — ele pede via chatbox e a IA cria, lista, ajusta ou desativa os alertas/monitoramentos para ele.
    • A auditoria deixa de ser opcional e passa a ser universal: toda mudança de estado, toda deleção, toda alteração sensível em qualquer entidade (Edital, Proposta, Contrato, Produto, LeadCRM, Parametrização de Score) gera um registro em log, com quem fez, quando fez, o estado anterior e o estado novo. Isso não é só conformidade — é o substrato que vai alimentar, na Sprint de Aprendizado, a inteligência sobre porquês e padrões de decisão da empresa.
    • É importante que o sistema faça distinção entre:
        ◦ Alertas OPERACIONAIS (prazos vencendo, sessão de pregão abrindo, contratos a vencer, certidões expirando) — esses disparam via scheduler + email SMTP real;
        ◦ Monitoramentos CONTÍNUOS de fontes externas (PNCP, portais de transparência, sites de órgãos) — esses rodam em background e geram eventos que populam telas e caixas de entrada do usuário;
        ◦ Análises sob demanda (coerência de documentos da empresa, pendências do edital no PNCP) — essas são invocadas via chatbox quando o usuário quer uma segunda leitura.
    • Cada alerta e cada monitoramento deverá ser associado a um responsável (usuário do sistema) e a uma entidade de referência (edital, contrato, proposta, produto), para facilitar o tracking e o rateio de responsabilidades entre o time.
    • Tomar como referência, além do conteúdo deste descritivo, a Planilha de Controle de Editais Argus — aba "Alertas e Prazos" — que mostra como hoje a Argus controla manualmente os vencimentos e os responsáveis. A ideia é que o sistema absorva essa planilha e elimine o controle paralelo em Excel.
    • Permitir, na área de cadastro, que a empresa parametrize os tipos de alertas, os canais de entrega (email, tela, ambos), os horários de disparo e os destinatários padrão, no seguinte formato de exemplo:
        A. Tipos de Alertas:
    • Prazo de Impugnação vencendo
    • Prazo de Recurso vencendo
    • Abertura de Sessão de Pregão
    • Contrato a vencer em 90 dias
    • Contrato a vencer em 30 dias
    • Certidão Negativa expirando
    • Empenho com saldo crítico
    • Item intruso detectado em edital
    • Pedido em atraso vs cronograma
    • Auditoria — alteração sensível em parametrização
        B. Canais de Entrega:
    • Email SMTP (produção)
    • Notificação em tela (sino)
    • Ambos
        C. Níveis de Criticidade:
    • Crítico (vermelho, disparo imediato)
    • Alto (laranja, disparo diário)
    • Médio (amarelo, resumo semanal)
    • Informativo (azul, apenas tela)

Fluxo de Flags e Alertas do sistema — Dividido em Cards
Cada card deverá ter uma abertura que evidencia o detalhamento dos processos que estão dentro desse card específico:
    1. CARD — ALERTAS ATIVOS
    • Relação de todos os alertas configurados e atualmente em vigilância pelo sistema;
    • Cada alerta deve mostrar: tipo, entidade de referência (edital, contrato, etc.), responsável, data de disparo prevista, canal, criticidade e status (aguardando, disparado, reconhecido, expirado);
    • A tela é operada via chatbox: o usuário pode pedir "cria um alerta de prazo de recurso para o edital X com disparo amanhã às 8h" e a IA, usando `tool_configurar_alertas`, cria a entrada e confirma;
    • A mesma tela aceita "lista todos os alertas críticos para esta semana" via `tool_listar_alertas`;
    • Possibilidade de cancelar via "cancela o alerta Y" via `tool_cancelar_alerta`.
    2. CARD — DISPAROS DO DIA
    • Agenda visual, tipo calendário, com todos os disparos previstos para o dia corrente, semana e mês;
    • Cores diferentes por criticidade (crítico vermelho, alto laranja, médio amarelo, informativo azul);
    • Ao clicar em um disparo, o usuário é levado ao detalhe da entidade de referência (ex.: clica no alerta de recurso, abre a tela de recursos daquele edital).
    3. CARD — HISTÓRICO DE ALERTAS
    • Relação dos últimos N alertas disparados (padrão 30 dias), com status de entrega (email enviado com sucesso, email falhou, usuário reconheceu na tela, expirou sem reconhecimento);
    • Filtros por tipo, responsável, criticidade, status, período.
    • Essa tela servirá de insumo para, futuramente, identificar responsáveis que estão ignorando alertas críticos (governança interna).
    4. CARD — ALERTAS SILENCIADOS
    • Relação dos alertas que o usuário pediu para a IA silenciar temporariamente (ex.: "silencia os alertas de contrato a vencer até segunda");
    • Cada silenciamento deve ter motivo, prazo de retomada e log do usuário que silenciou.

PRINCIPAIS KPIs DO FLUXO DE FLAGS:
    1. Alertas Disparados no Mês X Alertas Reconhecidos
    2. Taxa de Reconhecimento por Responsável
    • Para identificar se algum membro do time está deixando alertas passarem
    3. Tempo Médio entre Disparo e Reconhecimento
    4. Alertas Críticos Expirados sem Reconhecimento
    • Importante: esse número deveria tender a zero
    5. Top Tipos de Alertas Disparados
    • Para entender onde a empresa está mais exposta a prazos

Fluxo de Monitoramento Automático — Dividido em Cards
Cada card deverá ter uma abertura que evidencia o detalhamento dos monitoramentos que estão dentro desse card específico:
    1. CARD — MONITORAMENTOS ATIVOS
    • Relação de todos os monitoramentos configurados pela empresa e rodando em background;
    • Cada monitoramento deve mostrar: fonte (PNCP, portal da prefeitura X, site do órgão Y), critério (palavras-chave, NCMs, órgãos específicos, faixa de valores), periodicidade (hora em hora, 4x ao dia, 1x ao dia), última execução, próxima execução, status (ativo, pausado, com erro);
    • Operação via chatbox: "cria um monitoramento do PNCP para buscar reagentes de hematologia com faixa de valor entre 100k e 500k, roda 2x ao dia" via `tool_configurar_monitoramento`;
    • "Lista todos os monitoramentos ativos" via `tool_listar_monitoramentos`;
    • "Pausa o monitoramento Z por uma semana" ou "desativa o monitoramento W" via `tool_desativar_monitoramento`.
    2. CARD — EVENTOS CAPTURADOS
    • Relação dos últimos eventos capturados pelos monitoramentos (editais novos, editais alterados, atas publicadas, pregões reabertos);
    • Cada evento deve indicar: monitoramento de origem, entidade descoberta (edital, ata, etc.), data/hora da captura, ação sugerida pela IA (ex.: "avaliar para análise", "descartar — fora do portfolio", "alerta crítico — item intruso detectado");
    • Ao clicar em um evento, o usuário é levado à tela de captação já com a entidade pré-carregada para análise.
    3. CARD — MONITORAMENTOS COM ERRO
    • Relação dos monitoramentos que falharam nas últimas N execuções (fonte indisponível, schema alterado, timeout, rate limit);
    • Indicar última tentativa, tipo de erro, ação corretiva sugerida;
    • Essa tela é crítica porque monitoramentos silenciosamente quebrados são o pior cenário — a empresa acredita que está sendo notificada e na verdade está cega.
    4. CARD — ANÁLISES SOB DEMANDA
    • Histórico das análises pontuais invocadas pelo usuário via chatbox:
    • SUBCARD — ANÁLISE DE DOCUMENTOS DA EMPRESA
    • Quando o usuário pede "analisa os documentos da minha empresa e me diz se está tudo coerente", a IA via `tool_analisar_documentos_empresa` varre os documentos cadastrados (contrato social, certidões, alvarás, cadastro na ANVISA, etc.) e reporta inconsistências (razão social divergente, datas fora de ordem, certidão vencida, campo ausente);
    • O resultado fica registrado aqui para consulta futura e para comparação com análises anteriores.
    • SUBCARD — PENDÊNCIAS NO PNCP
    • Quando o usuário pede "verifica se o edital X tem pendências ou atualizações no PNCP", a IA via `tool_verificar_pendencias_pncp` consulta o portal, compara com o que está salvo no sistema, e reporta mudanças (adendo, prorrogação de prazo, alteração de termo de referência, cancelamento, suspensão);
    • O resultado gera, quando aplicável, um alerta automático para o responsável do edital.

PRINCIPAIS KPIs DO FLUXO DE MONITORAMENTO:
    1. Monitoramentos Ativos X Monitoramentos com Erro
    2. Eventos Capturados no Mês X Eventos que Viraram Análise
    • Ou seja, quantos eventos de fato geraram ação do usuário
    3. Editais Descobertos via Monitoramento Automático X Total de Editais Analisados
    • Mostra o quanto o sistema automatizado está contribuindo para a captação
    4. Tempo Médio entre Publicação no PNCP e Captura pelo Monitoramento
    5. Pendências PNCP Detectadas X Pendências que Exigiram Ação
    • Exemplo: edital que foi prorrogado mas a empresa já havia decidido não participar

Fluxo de Auditoria — Dividido em Cards
Cada card deverá ter uma abertura que evidencia o escopo e os critérios da auditoria.
    1. CARD — REGISTROS DE AUDITORIA
    • Relação de todos os eventos auditados do sistema, com filtros por entidade, usuário, tipo de operação, período;
    • Cada registro deve conter: ID do evento, timestamp, usuário responsável, entidade (Edital, Proposta, Contrato, Produto, LeadCRM, ParametroScore, etc.), operação (CREATE, UPDATE, DELETE, STATE_TRANSITION), estado anterior (JSON), estado novo (JSON), IP de origem;
    • A captura é universal: o middleware de auditoria intercepta todas as operações de escrita nos CRUDs e em endpoints sensíveis, populando a tabela `auditoria_log`.
    2. CARD — ALTERAÇÕES SENSÍVEIS
    • Relação das alterações que impactam parametrizações de score, preços, políticas de lance, margem mínima, pesos de aderência técnica, pesos de aderência comercial, decisões GO/NO-GO, motivos de perda, e qualquer campo que afete diretamente o comportamento da IA;
    • Cada alteração desse tipo dispara automaticamente um alerta do tipo "Auditoria — alteração sensível em parametrização" para um destinatário parametrizado (normalmente a diretoria ou o gestor do sistema);
    • Essa proteção existe porque alterar um peso de score sem deixar rastro é o tipo de evento que pode "enviesar" a IA sem que ninguém saiba depois o motivo.
    3. CARD — CONSULTAS À AUDITORIA
    • Tela de busca assistida pela IA — o usuário pergunta "quem alterou o score de aderência do portfolio de hematologia nos últimos 30 dias" e a IA traduz a pergunta em uma query sobre `auditoria_log` e retorna a lista;
    • "Mostra todas as deleções de edital feitas pelo usuário Fulano no mês passado";
    • "Quais foram as últimas 10 mudanças de estado do contrato X".
    4. CARD — EXPORTAÇÃO PARA COMPLIANCE
    • Relação dos pacotes de exportação de auditoria gerados sob demanda (PDF ou CSV), com filtros por período, entidade e usuário;
    • Pacote versionado e assinado (timestamp + hash) para servir de evidência junto a auditorias externas ou inquéritos formais;
    • Download e envio por email via SMTP produção.

PONTOS IMPORTANTES SOBRE AUDITORIA:
    • A tabela `auditoria_log` tende a crescer rápido. É importante ter política de particionamento por mês e TTL (retenção padrão sugerida: 24 meses na tabela online + arquivamento para storage frio depois disso);
    • A serialização do "estado anterior" e "estado novo" deve mascarar campos sensíveis (senhas, tokens, chaves de API, dados de pagamento) antes de gravar — isso precisa ser enforced no middleware, não deixar para cada chamador;
    • A captura de IP de origem é importante para rastreabilidade, mas requer atenção em LGPD: a empresa deve ter política de retenção clara;
    • O middleware deve falhar de forma graciosa: se a gravação no log falhar, a operação principal NÃO pode ser bloqueada — o log é evidência, não gate. A falha deve gerar um alerta crítico para o administrador do sistema.

Fluxo de Notificações SMTP — Dividido em Cards
Esta etapa viabiliza a entrega real das notificações. Nas sprints anteriores, o disparo de email ficou em modo simulação (log em arquivo). Esta sprint promove o envio a produção.
    1. CARD — CONFIGURAÇÃO SMTP
    • Tela de parametrização do servidor SMTP da empresa: host, porta, usuário, senha criptografada, TLS/SSL, remetente padrão, nome do remetente;
    • Teste de conexão imediato ao salvar (envio de email de verificação para o próprio remetente);
    • Suporte a múltiplos provedores: SMTP próprio, Gmail Workspace, Microsoft 365, SendGrid, Amazon SES;
    • Permitir parametrizar DIFERENTES remetentes por tipo de alerta (ex.: alertas jurídicos saem do email juridico@empresa, alertas comerciais saem do email comercial@empresa), para que o destinatário identifique de imediato o contexto.
    2. CARD — FILA DE ENVIO
    • Relação dos emails na fila do scheduler, com status (pendente, enviando, enviado, falhou, reagendado);
    • Retentativas automáticas em caso de falha (backoff exponencial: 1min, 5min, 30min, desiste);
    • Após 3 tentativas falhas, o email vira alerta crítico de auditoria para o administrador.
    3. CARD — TEMPLATES DE EMAIL
    • Relação dos templates de email usados pelo sistema — um template por tipo de alerta;
    • Cada template deve permitir edição WYSIWYG com variáveis ({{ nome_usuario }}, {{ numero_edital }}, {{ data_limite }}, {{ link_sistema }});
    • Preview antes de salvar;
    • Versionamento dos templates (auditoria de quem mudou e quando);
    • Templates padrão já cadastrados para os 10 tipos de alerta definidos na parametrização acima.
    4. CARD — HISTÓRICO DE ENVIOS
    • Relação dos últimos N emails enviados (padrão 30 dias), com destinatário, tipo, assunto, status de entrega, data/hora, mensagem de erro (se houver);
    • Filtros por destinatário, tipo, status, período;
    • Possibilidade de reenvio manual de emails que falharam (a partir da tela, o usuário pede "reenvia o email Y" e a IA dispara novamente).

PRINCIPAIS KPIs DO FLUXO DE NOTIFICAÇÕES:
    1. Emails Enviados X Emails Entregues com Sucesso
    2. Taxa de Falha SMTP
    • Se passar de 5% é sinal de problema com o servidor/provedor
    3. Tempo Médio entre Enfileiramento e Envio
    4. Emails Críticos NÃO Entregues
    • Esse número deveria tender a zero; qualquer ocorrência vira incidente
    5. Distribuição de Envios por Tipo de Alerta
    • Para entender onde o sistema está gerando mais "ruído"

Referência com Modelo Existente
A base técnica para esta sprint já existe no sistema. Os seguintes itens de infraestrutura estão disponíveis e devem ser REUSADOS ao invés de reescritos:
    • APScheduler já está importado e em uso (`backend/scheduler.py`) — basta registrar novos jobs para os checagens periódicas (prazos de impugnação/recurso, contratos a vencer, certidões expirando, monitoramentos externos);
    • A tabela `auditoria_log` e o model `AuditoriaLog` já existem em `backend/models.py` — nunca foram populados transversalmente. Esta sprint fará o wiring universal via middleware;
    • A infraestrutura de chatbox + invocação de tools já está entregue desde a Sprint 1 — basta criar as novas tools (`tool_configurar_alertas`, `tool_listar_alertas`, `tool_cancelar_alerta`, `tool_dashboard_prazos`, `tool_calendario_editais`, `tool_configurar_monitoramento`, `tool_listar_monitoramentos`, `tool_desativar_monitoramento`, `tool_analisar_documentos_empresa`, `tool_verificar_pendencias_pncp`) e registrá-las no catálogo DeepSeek;
    • A Planilha de Controle de Editais Argus, na aba "Alertas e Prazos", traz 12 tipos de alerta que a Argus usa hoje manualmente — esses 12 devem virar os "tipos padrão" pré-cadastrados no sistema.

Integração com Sprints Anteriores
Esta sprint é profundamente transversal. A lista abaixo mostra onde os alertas e monitoramentos vão se encaixar:
    • Sprint 1 (Fundação) — auditoria universal passa a capturar todas as operações de CRUD de empresa, usuário, portfolio, produto, certidão, parametrizações;
    • Sprint 2 (Captação + Validação) — monitoramentos PNCP/Brave passam a rodar em background via scheduler e populam a fila de eventos capturados. Alertas de certidão vencida passam para o scheduler real;
    • Sprint 3 (Precificação + Proposta) — alertas de abertura de pregão passam a ser disparados via SMTP real. Alterações em ParametroScore, margem mínima, pesos de aderência disparam alertas de auditoria sensível;
    • Sprint 4 (Impugnação + Recursos) — alertas de prazo de impugnação (3 dias úteis) e recurso (3 dias úteis após decisão) passam a ser calculados pelo scheduler 1x ao dia. O gate dos prazos com feriados úteis entra em cena aqui;
    • Sprint 5 (Follow-up + Atas + Contratos + CRM) — alertas de contrato a vencer em 90/30 dias passam a rodar no scheduler. Alertas de empenho com saldo crítico. Alertas de pedido em atraso vs cronograma. Mudanças de estado de LeadCRM ficam auditadas.

Valor agregado da funcionalidade
Esta Sprint é a que transforma o sistema de "ferramenta operada" para "ferramenta que opera junto". Sem observabilidade, sem auditoria e sem notificações reais, todo o capital entregue nas Sprints 1 a 5 fica refém do usuário lembrar de olhar cada tela. Com o que esta Sprint entrega:
    • O usuário é chamado para agir no momento certo ao invés de ter que descobrir os problemas por conta própria;
    • A diretoria tem rastreabilidade total sobre quem mexeu em quê, o que é fundamental tanto para governança interna quanto para eventuais auditorias externas (TCE, TCU, auditorias contratuais);
    • Os monitoramentos em background tiram a pressão do time comercial de ficar varrendo o PNCP manualmente o tempo todo;
    • A análise de coerência de documentos da empresa evita aquele cenário clássico de "o edital reprovou a nossa participação porque a certidão estava vencida há 3 dias";
    • A infraestrutura SMTP em produção permite, enfim, que o sistema saia do modo "alerta dentro da tela" e passe a competir por atenção dos usuários no canal que eles de fato acompanham (email);
    • A base de dados de `auditoria_log` populada transversalmente será, a partir da Sprint de Aprendizado, o substrato para a IA aprender padrões de decisão da empresa — quando a diretoria altera um peso de score, o sistema futuro poderá perguntar "você quer aplicar essa mesma alteração ao grupo de produtos Y, que tem perfil parecido?".

PRINCIPAIS KPIs CONSOLIDADOS DESTA SPRINT:
    1. Alertas Críticos Expirados sem Reconhecimento — deve tender a zero
    2. Taxa de Falha SMTP — deve ficar abaixo de 5%
    3. Monitoramentos com Erro / Total de Monitoramentos — deve ficar abaixo de 10%
    4. Cobertura de Auditoria — percentual de endpoints de escrita cobertos pelo middleware (meta: 100%)
    5. Tempo Médio entre Evento PNCP e Alerta ao Usuário — deve ficar abaixo de 1 hora
    6. Análises de Documentos da Empresa Solicitadas X Inconsistências Detectadas
    7. Volume de Mudanças Sensíveis Auditadas por Mês — linha de base para governança
    8. Reenvios Manuais de Email X Envios Automáticos — métrica de "saúde" da fila SMTP
