# Índice de Casos de Uso (V5)

**Gerado em:** 2026-04-24T19:14:51
**Total de UCs canônicos:** 86
**UCs legacy preservados:** 3 (versões antigas de UCs duplicados em docs diferentes)
**Origem:** 5 documentos V5 em `docs/`.

Cada arquivo `UC-XYZ.md` contém o caso de uso integral com metadados.
Para regerar tudo: `python3 scripts/split-uc-v5.py`.

## UCs canônicos por Sprint

### Sprint 1

| UC | Nome | Doc origem |
|---|---|---|
| [UC-F01](UC-F01.md) | Manter cadastro principal da empresa | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F02](UC-F02.md) | Gerir contatos e area padrao | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F03](UC-F03.md) | Gerir documentos da empresa | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F04](UC-F04.md) | Buscar, revisar e anexar certidoes | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F05](UC-F05.md) | Gerir responsaveis da empresa | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F06](UC-F06.md) | Listar, filtrar e inspecionar produtos | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F07](UC-F07.md) | Cadastrar produto por IA a partir de manual, IFU, folder, NFS, plano de contas ou website | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F08](UC-F08.md) | Editar produto e especificacoes tecnicas | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F09](UC-F09.md) | Reprocessar especificacoes do produto com IA | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F10](UC-F10.md) | Consultar ANVISA e busca web a partir da tela de portfolio | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F11](UC-F11.md) | Verificar completude tecnica do produto | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F12](UC-F12.md) | Reprocessar metadados de captacao do produto | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F13](UC-F13.md) | Consultar classificacao e funil de monitoramento | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F14](UC-F14.md) | Configurar pesos e limiares de score | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F15](UC-F15.md) | Configurar parametros comerciais, regioes e modalidades | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F16](UC-F16.md) | Configurar fontes, palavras-chave e NCMs de busca | EMPRESA PORTFOLIO PARAMETRIZACAO |
| [UC-F17](UC-F17.md) | Configurar notificacoes e preferencias | EMPRESA PORTFOLIO PARAMETRIZACAO |

### Sprint 2

| UC | Nome | Doc origem |
|---|---|---|
| [UC-CV01](UC-CV01.md) | Buscar editais por termo, classificacao e score | CAPTACAO VALIDACAO(SPRINT2) |
| [UC-CV02](UC-CV02.md) | Explorar resultados e painel lateral do edital | CAPTACAO VALIDACAO(SPRINT2) |
| [UC-CV03](UC-CV03.md) | Salvar edital, itens e scores da captacao | CAPTACAO VALIDACAO(SPRINT2) |
| [UC-CV04](UC-CV04.md) | Definir estrategia, intencao e margem do edital | CAPTACAO VALIDACAO(SPRINT2) |
| [UC-CV05](UC-CV05.md) | Exportar e consolidar resultados da busca | CAPTACAO VALIDACAO(SPRINT2) |
| [UC-CV06](UC-CV06.md) | Gerir monitoramentos automaticos de busca | CAPTACAO VALIDACAO(SPRINT2) |
| [UC-CV07](UC-CV07.md) | Listar editais salvos e selecionar edital para analise | CAPTACAO VALIDACAO(SPRINT2) |
| [UC-CV08](UC-CV08.md) | Calcular scores multidimensionais e decidir GO/NO-GO | CAPTACAO VALIDACAO(SPRINT2) |
| [UC-CV09](UC-CV09.md) | Importar itens e extrair lotes por IA | CAPTACAO VALIDACAO(SPRINT2) |
| [UC-CV10](UC-CV10.md) | Confrontar documentacao necessaria com a empresa | CAPTACAO VALIDACAO(SPRINT2) |
| [UC-CV11](UC-CV11.md) | Analisar riscos, recorrencia, atas e concorrentes | CAPTACAO VALIDACAO(SPRINT2) |
| [UC-CV12](UC-CV12.md) | Analisar mercado do orgao contratante | CAPTACAO VALIDACAO(SPRINT2) |
| [UC-CV13](UC-CV13.md) | Usar IA na validacao: resumo, perguntas e acoes rapidas | CAPTACAO VALIDACAO(SPRINT2) |

### Sprint 3-4 (Precificação e Proposta)

| UC | Nome | Doc origem |
|---|---|---|
| [UC-P01](UC-P01.md) | Organizar Edital por Lotes | PRECIFICACAO E PROPOSTA |
| [UC-P02](UC-P02.md) | Selecao Inteligente de Portfolio (Agente Assistido) | PRECIFICACAO E PROPOSTA |
| [UC-P03](UC-P03.md) | Calculo Tecnico de Volumetria | PRECIFICACAO E PROPOSTA |
| [UC-P04](UC-P04.md) | Configurar Base de Custos (ERP + Tributario) | PRECIFICACAO E PROPOSTA |
| [UC-P05](UC-P05.md) | Montar Preco Base (Camada B) | PRECIFICACAO E PROPOSTA |
| [UC-P06](UC-P06.md) | Definir Valor de Referencia (Camada C) | PRECIFICACAO E PROPOSTA |
| [UC-P07](UC-P07.md) | Estruturar Lances (Camadas D e E) | PRECIFICACAO E PROPOSTA |
| [UC-P08](UC-P08.md) | Definir Estrategia Competitiva | PRECIFICACAO E PROPOSTA |
| [UC-P09](UC-P09.md) | Consultar Historico de Precos (Camada F) | PRECIFICACAO E PROPOSTA |
| [UC-P10](UC-P10.md) | Gestao de Comodato | PRECIFICACAO E PROPOSTA |
| [UC-P11](UC-P11.md) | Pipeline IA de Precificacao | PRECIFICACAO E PROPOSTA |
| [UC-P12](UC-P12.md) | Relatorio de Custos e Precos | PRECIFICACAO E PROPOSTA |
| [UC-R01](UC-R01.md) | Gerar Proposta Tecnica (Motor Automatico) | PRECIFICACAO E PROPOSTA |
| [UC-R02](UC-R02.md) | Upload de Proposta Externa | PRECIFICACAO E PROPOSTA |
| [UC-R03](UC-R03.md) | Personalizar Descricao Tecnica (A/B) | PRECIFICACAO E PROPOSTA |
| [UC-R04](UC-R04.md) | Auditoria ANVISA (Semaforo Regulatorio) | PRECIFICACAO E PROPOSTA |
| [UC-R05](UC-R05.md) | Auditoria Documental + Smart Split | PRECIFICACAO E PROPOSTA |
| [UC-R06](UC-R06.md) | Exportar Dossie Completo | PRECIFICACAO E PROPOSTA |
| [UC-R07](UC-R07.md) | Gerenciar Status e Submissao | PRECIFICACAO E PROPOSTA |

### Sprint 4 (Recursos e Impugnações)

| UC | Nome | Doc origem |
|---|---|---|
| [UC-I01](UC-I01.md) | Validacao Legal do Edital | RECURSOS E IMPUGNACOES |
| [UC-I02](UC-I02.md) | Sugerir Esclarecimento ou Impugnacao | RECURSOS E IMPUGNACOES |
| [UC-I03](UC-I03.md) | Gerar Peticao de Impugnacao | RECURSOS E IMPUGNACOES |
| [UC-I04](UC-I04.md) | Upload de Peticao Externa | RECURSOS E IMPUGNACOES |
| [UC-I05](UC-I05.md) | Controle de Prazo | RECURSOS E IMPUGNACOES |
| [UC-RE01](UC-RE01.md) | Monitorar Janela de Recurso | RECURSOS E IMPUGNACOES |
| [UC-RE02](UC-RE02.md) | Analisar Proposta Vencedora | RECURSOS E IMPUGNACOES |
| [UC-RE03](UC-RE03.md) | Chatbox de Analise | RECURSOS E IMPUGNACOES |
| [UC-RE04](UC-RE04.md) | Gerar Laudo de Recurso | RECURSOS E IMPUGNACOES |
| [UC-RE05](UC-RE05.md) | Gerar Laudo de Contra-Razao | RECURSOS E IMPUGNACOES |
| [UC-RE06](UC-RE06.md) | Submissao Assistida no Portal | RECURSOS E IMPUGNACOES |

### Sprint 5

| UC | Nome | Doc origem |
|---|---|---|
| [UC-FU01](UC-FU01.md) | Registrar Resultado (Vitoria/Derrota) | SPRINT5 |
| [UC-FU02](UC-FU02.md) | Configurar Alertas de Prazo | SPRINT5 |
| [UC-FU03](UC-FU03.md) | Score Logistico | SPRINT5 |
| [UC-AT01](UC-AT01.md) | Buscar Atas no PNCP | SPRINT5 |
| [UC-AT02](UC-AT02.md) | Extrair Resultados de Ata PDF | SPRINT5 |
| [UC-AT03](UC-AT03.md) | Dashboard de Atas Consultadas | SPRINT5 |
| [UC-CT06](UC-CT06.md) | Saldo de ARP / Controle de Carona | SPRINT5 |
| [UC-CT01](UC-CT01.md) | Cadastrar Contrato | SPRINT5 |
| [UC-CT02](UC-CT02.md) | Registrar Entrega + NF | SPRINT5 |
| [UC-CT03](UC-CT03.md) | Acompanhar Cronograma de Entregas | SPRINT5 |
| [UC-CT04](UC-CT04.md) | Gestao de Aditivos | SPRINT5 |
| [UC-CT05](UC-CT05.md) | Designar Gestor/Fiscal | SPRINT5 |
| [UC-CT07](UC-CT07.md) | Gestao de Empenhos *(NOVO V3)* | SPRINT5 |
| [UC-CT08](UC-CT08.md) | Auditoria Empenhos x Faturas x Pedidos *(NOVO V3)* | SPRINT5 |
| [UC-CT09](UC-CT09.md) | Contratos a Vencer *(NOVO V3)* | SPRINT5 |
| [UC-CT10](UC-CT10.md) | KPIs de Execucao *(NOVO V3)* | SPRINT5 |
| [UC-CR01](UC-CR01.md) | Dashboard Contratado X Realizado | SPRINT5 |
| [UC-CR02](UC-CR02.md) | Pedidos em Atraso | SPRINT5 |
| [UC-CR03](UC-CR03.md) | Alertas de Vencimento Multi-tier | SPRINT5 |
| [UC-CRM01](UC-CRM01.md) | Pipeline de Cards do CRM *(NOVO V3)* | SPRINT5 |
| [UC-CRM02](UC-CRM02.md) | Parametrizacoes do CRM *(NOVO V3)* | SPRINT5 |
| [UC-CRM03](UC-CRM03.md) | Mapa Geografico de Processos *(NOVO V3)* | SPRINT5 |
| [UC-CRM04](UC-CRM04.md) | Agenda/Timeline de Etapas *(NOVO V3)* | SPRINT5 |
| [UC-CRM05](UC-CRM05.md) | KPIs do CRM *(NOVO V3)* | SPRINT5 |
| [UC-CRM06](UC-CRM06.md) | Registrar Decisao de Nao-Participacao *(NOVO V3)* | SPRINT5 |
| [UC-CRM07](UC-CRM07.md) | Registrar Motivo de Perda *(NOVO V3)* | SPRINT5 |

## UCs legacy (duplicatas resolvidas)

Estes UCs aparecem em DOIS docs V5 com conteúdos diferentes. O canônico (sem sufixo) é a versão mais recente; o legacy é a versão antiga preservada para auditoria. **O processo de validação usa apenas o canônico.**

| UC legacy | Sprint origem | Nome | Substituído por |
|---|---|---|---|
| [UC-FU01_S4_legacy](UC-FU01_S4_legacy.md) | Sprint 4 (Recursos e Impugnações) | Registrar Resultado de Edital | [UC-FU01](UC-FU01.md) |
| [UC-FU02_S4_legacy](UC-FU02_S4_legacy.md) | Sprint 4 (Recursos e Impugnações) | Configurar Alertas de Vencimento | [UC-FU02](UC-FU02.md) |
| [UC-FU03_S4_legacy](UC-FU03_S4_legacy.md) | Sprint 4 (Recursos e Impugnações) | Score Logistico | [UC-FU03](UC-FU03.md) |

## Listagem completa (apenas canônicos, ordem alfabética)

| UC | Sprint | Nome |
|---|---|---|
| [UC-AT01](UC-AT01.md) | Sprint 5 | Buscar Atas no PNCP |
| [UC-AT02](UC-AT02.md) | Sprint 5 | Extrair Resultados de Ata PDF |
| [UC-AT03](UC-AT03.md) | Sprint 5 | Dashboard de Atas Consultadas |
| [UC-CR01](UC-CR01.md) | Sprint 5 | Dashboard Contratado X Realizado |
| [UC-CR02](UC-CR02.md) | Sprint 5 | Pedidos em Atraso |
| [UC-CR03](UC-CR03.md) | Sprint 5 | Alertas de Vencimento Multi-tier |
| [UC-CRM01](UC-CRM01.md) | Sprint 5 | Pipeline de Cards do CRM *(NOVO V3)* |
| [UC-CRM02](UC-CRM02.md) | Sprint 5 | Parametrizacoes do CRM *(NOVO V3)* |
| [UC-CRM03](UC-CRM03.md) | Sprint 5 | Mapa Geografico de Processos *(NOVO V3)* |
| [UC-CRM04](UC-CRM04.md) | Sprint 5 | Agenda/Timeline de Etapas *(NOVO V3)* |
| [UC-CRM05](UC-CRM05.md) | Sprint 5 | KPIs do CRM *(NOVO V3)* |
| [UC-CRM06](UC-CRM06.md) | Sprint 5 | Registrar Decisao de Nao-Participacao *(NOVO V3)* |
| [UC-CRM07](UC-CRM07.md) | Sprint 5 | Registrar Motivo de Perda *(NOVO V3)* |
| [UC-CT01](UC-CT01.md) | Sprint 5 | Cadastrar Contrato |
| [UC-CT02](UC-CT02.md) | Sprint 5 | Registrar Entrega + NF |
| [UC-CT03](UC-CT03.md) | Sprint 5 | Acompanhar Cronograma de Entregas |
| [UC-CT04](UC-CT04.md) | Sprint 5 | Gestao de Aditivos |
| [UC-CT05](UC-CT05.md) | Sprint 5 | Designar Gestor/Fiscal |
| [UC-CT06](UC-CT06.md) | Sprint 5 | Saldo de ARP / Controle de Carona |
| [UC-CT07](UC-CT07.md) | Sprint 5 | Gestao de Empenhos *(NOVO V3)* |
| [UC-CT08](UC-CT08.md) | Sprint 5 | Auditoria Empenhos x Faturas x Pedidos *(NOVO V3)* |
| [UC-CT09](UC-CT09.md) | Sprint 5 | Contratos a Vencer *(NOVO V3)* |
| [UC-CT10](UC-CT10.md) | Sprint 5 | KPIs de Execucao *(NOVO V3)* |
| [UC-CV01](UC-CV01.md) | Sprint 2 | Buscar editais por termo, classificacao e score |
| [UC-CV02](UC-CV02.md) | Sprint 2 | Explorar resultados e painel lateral do edital |
| [UC-CV03](UC-CV03.md) | Sprint 2 | Salvar edital, itens e scores da captacao |
| [UC-CV04](UC-CV04.md) | Sprint 2 | Definir estrategia, intencao e margem do edital |
| [UC-CV05](UC-CV05.md) | Sprint 2 | Exportar e consolidar resultados da busca |
| [UC-CV06](UC-CV06.md) | Sprint 2 | Gerir monitoramentos automaticos de busca |
| [UC-CV07](UC-CV07.md) | Sprint 2 | Listar editais salvos e selecionar edital para analise |
| [UC-CV08](UC-CV08.md) | Sprint 2 | Calcular scores multidimensionais e decidir GO/NO-GO |
| [UC-CV09](UC-CV09.md) | Sprint 2 | Importar itens e extrair lotes por IA |
| [UC-CV10](UC-CV10.md) | Sprint 2 | Confrontar documentacao necessaria com a empresa |
| [UC-CV11](UC-CV11.md) | Sprint 2 | Analisar riscos, recorrencia, atas e concorrentes |
| [UC-CV12](UC-CV12.md) | Sprint 2 | Analisar mercado do orgao contratante |
| [UC-CV13](UC-CV13.md) | Sprint 2 | Usar IA na validacao: resumo, perguntas e acoes rapidas |
| [UC-F01](UC-F01.md) | Sprint 1 | Manter cadastro principal da empresa |
| [UC-F02](UC-F02.md) | Sprint 1 | Gerir contatos e area padrao |
| [UC-F03](UC-F03.md) | Sprint 1 | Gerir documentos da empresa |
| [UC-F04](UC-F04.md) | Sprint 1 | Buscar, revisar e anexar certidoes |
| [UC-F05](UC-F05.md) | Sprint 1 | Gerir responsaveis da empresa |
| [UC-F06](UC-F06.md) | Sprint 1 | Listar, filtrar e inspecionar produtos |
| [UC-F07](UC-F07.md) | Sprint 1 | Cadastrar produto por IA a partir de manual, IFU, folder, NFS, plano de contas ou website |
| [UC-F08](UC-F08.md) | Sprint 1 | Editar produto e especificacoes tecnicas |
| [UC-F09](UC-F09.md) | Sprint 1 | Reprocessar especificacoes do produto com IA |
| [UC-F10](UC-F10.md) | Sprint 1 | Consultar ANVISA e busca web a partir da tela de portfolio |
| [UC-F11](UC-F11.md) | Sprint 1 | Verificar completude tecnica do produto |
| [UC-F12](UC-F12.md) | Sprint 1 | Reprocessar metadados de captacao do produto |
| [UC-F13](UC-F13.md) | Sprint 1 | Consultar classificacao e funil de monitoramento |
| [UC-F14](UC-F14.md) | Sprint 1 | Configurar pesos e limiares de score |
| [UC-F15](UC-F15.md) | Sprint 1 | Configurar parametros comerciais, regioes e modalidades |
| [UC-F16](UC-F16.md) | Sprint 1 | Configurar fontes, palavras-chave e NCMs de busca |
| [UC-F17](UC-F17.md) | Sprint 1 | Configurar notificacoes e preferencias |
| [UC-FU01](UC-FU01.md) | Sprint 5 | Registrar Resultado (Vitoria/Derrota) |
| [UC-FU02](UC-FU02.md) | Sprint 5 | Configurar Alertas de Prazo |
| [UC-FU03](UC-FU03.md) | Sprint 5 | Score Logistico |
| [UC-I01](UC-I01.md) | Sprint 4 (Recursos e Impugnações) | Validacao Legal do Edital |
| [UC-I02](UC-I02.md) | Sprint 4 (Recursos e Impugnações) | Sugerir Esclarecimento ou Impugnacao |
| [UC-I03](UC-I03.md) | Sprint 4 (Recursos e Impugnações) | Gerar Peticao de Impugnacao |
| [UC-I04](UC-I04.md) | Sprint 4 (Recursos e Impugnações) | Upload de Peticao Externa |
| [UC-I05](UC-I05.md) | Sprint 4 (Recursos e Impugnações) | Controle de Prazo |
| [UC-P01](UC-P01.md) | Sprint 3-4 (Precificação e Proposta) | Organizar Edital por Lotes |
| [UC-P02](UC-P02.md) | Sprint 3-4 (Precificação e Proposta) | Selecao Inteligente de Portfolio (Agente Assistido) |
| [UC-P03](UC-P03.md) | Sprint 3-4 (Precificação e Proposta) | Calculo Tecnico de Volumetria |
| [UC-P04](UC-P04.md) | Sprint 3-4 (Precificação e Proposta) | Configurar Base de Custos (ERP + Tributario) |
| [UC-P05](UC-P05.md) | Sprint 3-4 (Precificação e Proposta) | Montar Preco Base (Camada B) |
| [UC-P06](UC-P06.md) | Sprint 3-4 (Precificação e Proposta) | Definir Valor de Referencia (Camada C) |
| [UC-P07](UC-P07.md) | Sprint 3-4 (Precificação e Proposta) | Estruturar Lances (Camadas D e E) |
| [UC-P08](UC-P08.md) | Sprint 3-4 (Precificação e Proposta) | Definir Estrategia Competitiva |
| [UC-P09](UC-P09.md) | Sprint 3-4 (Precificação e Proposta) | Consultar Historico de Precos (Camada F) |
| [UC-P10](UC-P10.md) | Sprint 3-4 (Precificação e Proposta) | Gestao de Comodato |
| [UC-P11](UC-P11.md) | Sprint 3-4 (Precificação e Proposta) | Pipeline IA de Precificacao |
| [UC-P12](UC-P12.md) | Sprint 3-4 (Precificação e Proposta) | Relatorio de Custos e Precos |
| [UC-R01](UC-R01.md) | Sprint 3-4 (Precificação e Proposta) | Gerar Proposta Tecnica (Motor Automatico) |
| [UC-R02](UC-R02.md) | Sprint 3-4 (Precificação e Proposta) | Upload de Proposta Externa |
| [UC-R03](UC-R03.md) | Sprint 3-4 (Precificação e Proposta) | Personalizar Descricao Tecnica (A/B) |
| [UC-R04](UC-R04.md) | Sprint 3-4 (Precificação e Proposta) | Auditoria ANVISA (Semaforo Regulatorio) |
| [UC-R05](UC-R05.md) | Sprint 3-4 (Precificação e Proposta) | Auditoria Documental + Smart Split |
| [UC-R06](UC-R06.md) | Sprint 3-4 (Precificação e Proposta) | Exportar Dossie Completo |
| [UC-R07](UC-R07.md) | Sprint 3-4 (Precificação e Proposta) | Gerenciar Status e Submissao |
| [UC-RE01](UC-RE01.md) | Sprint 4 (Recursos e Impugnações) | Monitorar Janela de Recurso |
| [UC-RE02](UC-RE02.md) | Sprint 4 (Recursos e Impugnações) | Analisar Proposta Vencedora |
| [UC-RE03](UC-RE03.md) | Sprint 4 (Recursos e Impugnações) | Chatbox de Analise |
| [UC-RE04](UC-RE04.md) | Sprint 4 (Recursos e Impugnações) | Gerar Laudo de Recurso |
| [UC-RE05](UC-RE05.md) | Sprint 4 (Recursos e Impugnações) | Gerar Laudo de Contra-Razao |
| [UC-RE06](UC-RE06.md) | Sprint 4 (Recursos e Impugnações) | Submissao Assistida no Portal |

---

## Como usar

Estes arquivos são a **entrada** do processo de validação V3. O agente `validation-uc-analyzer` lê cada UC e produz a estrutura formal que alimenta o resto do pipeline (datasets → casos de teste → tutoriais).

Ver `docs/VALIDACAOFACILICITA.md` para o processo completo.
