# CASOS DE TESTE PARA VALIDACAO — SPRINT 4 — CONJUNTO 1

**Data:** 21/04/2026
**Empresa:** CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda.
**Usuario:** valida1@valida.com.br / Senha: 123456
**Base:** tutorialsprint4-1.md + CASOS DE USO RECURSOS E IMPUGNACOES V5.md
**UCs cobertos:** UC-I01 a UC-I05, UC-RE01 a UC-RE06, UC-FU01 a UC-FU03

---

## Credenciais e Pre-requisitos

| Campo | Valor |
|---|---|
| URL | `http://pasteurjr.servehttp.com:5179` |
| Usuario | valida1@valida.com.br |
| Senha | 123456 |
| Perfil | Superusuario |
| Empresa | CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda. |
| Edital principal | Edital de "monitor multiparametrico" (salvo Sprint 2, status GO) |
| Edital secundario | Edital de "ultrassonografo portatil" (salvo Sprint 2) |
| Produtos | Monitor Multiparametrico Mindray iMEC10 Plus, Ultrassonografo Portatil Mindray M7T |

---

# FASE 1 — IMPUGNACAO E ESCLARECIMENTOS

---

## UC-I01 — Validacao Legal do Edital

### CT-I01-01 — Analise legal com resultado positivo (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-I01-01 |
| **Descricao** | Verificar que o sistema analisa o edital e exibe inconsistencias classificadas por gravidade |
| **Pre-condicoes** | Usuario autenticado como valida1@valida.com.br, empresa CH Hospitalar ativa, edital de "monitor multiparametrico" salvo na Sprint 2 com status GO |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Impugnacao" na sidebar. 2. Clicar na aba "Validacao Legal". 3. Selecionar edital de "monitor multiparametrico" no Select. 4. Clicar botao "Analisar Edital". 5. Aguardar processamento (ate 120s). |
| **Saida esperada** | Card "Resultado da Analise" exibido com tabela de inconsistencias contendo pelo menos 3 linhas. Badges de gravidade: ALTA (vermelho), MEDIA (amarelo), BAIXA (verde). Badges de sugestao: "Impugnacao" e "Esclarecimento". Inconsistencias tipicas: direcionamento por marca (Art. 41), experiencia desproporcional (Art. 67), prazo de pagamento (Art. 141). |
| **Tipo** | Positivo |

### CT-I01-02 — Verificar badges de gravidade ALTA
| Campo | Valor |
|---|---|
| **ID** | CT-I01-02 |
| **Descricao** | Verificar que inconsistencias de gravidade ALTA sao exibidas com badge vermelho |
| **Pre-condicoes** | CT-I01-01 executado com sucesso, tabela de inconsistencias visivel |
| **Acoes do ator e dados de entrada** | 1. Na tabela de inconsistencias, localizar linhas com badge "ALTA". |
| **Saida esperada** | Pelo menos 1 inconsistencia com badge "ALTA" em vermelho. Exemplos esperados: "O equipamento devera ser da marca X ou similar" (Art. 41) e "Exige-se experiencia minima de 10 anos" (Art. 67). |
| **Tipo** | Positivo |

### CT-I01-03 — Verificar badges de gravidade MEDIA e BAIXA
| Campo | Valor |
|---|---|
| **ID** | CT-I01-03 |
| **Descricao** | Verificar que inconsistencias de gravidade MEDIA e BAIXA sao exibidas com badges amarelo e verde |
| **Pre-condicoes** | CT-I01-01 executado com sucesso |
| **Acoes do ator e dados de entrada** | 1. Na tabela, localizar linhas com badge "MEDIA" (amarelo). 2. Localizar linhas com badge "BAIXA" (verde). |
| **Saida esperada** | Pelo menos 1 badge "MEDIA" (amarelo) — ex: "Prazo de entrega de 5 dias corridos" (Art. 40). Pelo menos 1 badge "BAIXA" (verde) — ex: "Registro ANVISA Classe III" (RDC 185/2001). |
| **Tipo** | Positivo |

### CT-I01-04 — Verificar badges de sugestao Impugnacao e Esclarecimento
| Campo | Valor |
|---|---|
| **ID** | CT-I01-04 |
| **Descricao** | Verificar que cada inconsistencia tem sugestao de tipo (Impugnacao ou Esclarecimento) |
| **Pre-condicoes** | CT-I01-01 executado com sucesso |
| **Acoes do ator e dados de entrada** | 1. Na tabela, verificar coluna "Sugestao" em cada linha. |
| **Saida esperada** | Cada linha possui badge "Impugnacao" (vermelho/error) ou "Esclarecimento" (azul/info). Inconsistencias ALTA devem sugerir "Impugnacao". Inconsistencias MEDIA podem sugerir "Esclarecimento". |
| **Tipo** | Positivo |

### CT-I01-05 — Nenhum edital salvo no sistema (FE-03)
| Campo | Valor |
|---|---|
| **ID** | CT-I01-05 |
| **Descricao** | Verificar comportamento quando nenhum edital esta disponivel para selecao |
| **Pre-condicoes** | Sistema sem editais salvos (ou cenario simulado) |
| **Acoes do ator e dados de entrada** | 1. Acessar ImpugnacaoPage. 2. Clicar na aba "Validacao Legal". 3. Verificar Select de editais. |
| **Saida esperada** | Select vazio ou com mensagem "Nenhum edital disponivel". Botao "Analisar Edital" desabilitado ou mensagem informativa. |
| **Tipo** | Negativo |

### CT-I01-06 — Re-analisar edital (FA-02)
| Campo | Valor |
|---|---|
| **ID** | CT-I01-06 |
| **Descricao** | Verificar que e possivel re-analisar o mesmo edital e a tabela e atualizada |
| **Pre-condicoes** | CT-I01-01 executado (primeira analise concluida) |
| **Acoes do ator e dados de entrada** | 1. Com o mesmo edital de "monitor multiparametrico" selecionado, clicar novamente "Analisar Edital". 2. Aguardar processamento. |
| **Saida esperada** | Nova analise gerada, tabela de inconsistencias atualizada. O resultado pode diferir levemente (analise IA), mas deve conter inconsistencias validas. |
| **Tipo** | Positivo |

---

## UC-I02 — Sugerir Esclarecimento ou Impugnacao

### CT-I02-01 — Criar peticao de Impugnacao via modal (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-I02-01 |
| **Descricao** | Criar uma peticao de impugnacao a partir da aba Peticoes |
| **Pre-condicoes** | UC-I01 concluido, usuario na ImpugnacaoPage |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "Peticoes". 2. Clicar botao "Nova Peticao". 3. No modal: Edital = edital de "monitor multiparametrico", Tipo = "Impugnacao", Template = "Nenhum (em branco)", Conteudo = (vazio ou texto livre). 4. Clicar "Criar". |
| **Saida esperada** | Peticao aparece na tabela com Tipo "Impugnacao", Status "Rascunho". Modal fecha apos criacao. |
| **Tipo** | Positivo |

### CT-I02-02 — Criar peticao de Esclarecimento
| Campo | Valor |
|---|---|
| **ID** | CT-I02-02 |
| **Descricao** | Criar uma peticao de esclarecimento para inconsistencia de gravidade MEDIA |
| **Pre-condicoes** | UC-I01 concluido, usuario na aba Peticoes |
| **Acoes do ator e dados de entrada** | 1. Clicar "Nova Peticao". 2. No modal: Edital = "monitor multiparametrico", Tipo = "Esclarecimento", Template = "Nenhum (em branco)", Conteudo = (vazio). 3. Clicar "Criar". |
| **Saida esperada** | Peticao de tipo "Esclarecimento" aparece na tabela com Status "Rascunho". Badge de tipo "Esclarecimento" (info). |
| **Tipo** | Positivo |

### CT-I02-03 — Criar peticao sem selecionar edital (FE-01)
| Campo | Valor |
|---|---|
| **ID** | CT-I02-03 |
| **Descricao** | Verificar validacao quando nenhum edital e selecionado no modal |
| **Pre-condicoes** | Aba Peticoes ativa |
| **Acoes do ator e dados de entrada** | 1. Clicar "Nova Peticao". 2. Deixar Select "Edital" sem selecao. 3. Selecionar Tipo = "Impugnacao". 4. Clicar "Criar". |
| **Saida esperada** | Mensagem de validacao "Selecione um edital". Modal nao fecha. |
| **Tipo** | Negativo |

### CT-I02-04 — Criar peticao sem template e sem conteudo (FA-01)
| Campo | Valor |
|---|---|
| **ID** | CT-I02-04 |
| **Descricao** | Verificar que e possivel criar peticao com conteudo vazio |
| **Pre-condicoes** | Aba Peticoes ativa |
| **Acoes do ator e dados de entrada** | 1. Clicar "Nova Peticao". 2. Edital = "monitor multiparametrico", Tipo = "Impugnacao", Template = "Nenhum (em branco)", Conteudo = (vazio). 3. Clicar "Criar". |
| **Saida esperada** | Peticao criada com conteudo vazio, status "Rascunho". Pode ser editada posteriormente no UC-I03. |
| **Tipo** | Limite |

---

## UC-I03 — Gerar Peticao de Impugnacao

### CT-I03-01 — Gerar peticao via IA com secoes obrigatorias (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-I03-01 |
| **Descricao** | Gerar peticao via IA e verificar presenca das 5 secoes obrigatorias |
| **Pre-condicoes** | Peticao de impugnacao criada no UC-I02, aba Peticoes ativa |
| **Acoes do ator e dados de entrada** | 1. Na tabela de peticoes, clicar icone Eye na peticao de Impugnacao. 2. No editor, clicar botao "Gerar Peticao". 3. Aguardar processamento da IA (ate 120s). |
| **Saida esperada** | Peticao gerada com 5 secoes: (1) Qualificacao com dados "CH Hospitalar", CNPJ "43.712.232/0001-85", representante "Diego Ricardo Munoz". (2) Dos Fatos com descricao do edital. (3) Do Direito com Art. 41, Art. 67, Art. 141 da Lei 14.133/2021. (4) Jurisprudencias com TCU. (5) Do Pedido com solicitacao de alteracao. |
| **Tipo** | Positivo |

### CT-I03-02 — Verificar dados da empresa na peticao
| Campo | Valor |
|---|---|
| **ID** | CT-I03-02 |
| **Descricao** | Verificar que a peticao contem dados corretos da empresa impugnante |
| **Pre-condicoes** | CT-I03-01 executado com peticao gerada |
| **Acoes do ator e dados de entrada** | 1. No TextArea do editor, verificar presenca de: "CH Hospitalar", "43.712.232/0001-85", "Diego Ricardo Munoz". |
| **Saida esperada** | Razao social "CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda." presente. CNPJ "43.712.232/0001-85" presente. Representante legal "Diego Ricardo Munoz — Socio-Administrador" presente. |
| **Tipo** | Positivo |

### CT-I03-03 — Salvar rascunho da peticao
| Campo | Valor |
|---|---|
| **ID** | CT-I03-03 |
| **Descricao** | Salvar peticao como rascunho apos edicao |
| **Pre-condicoes** | CT-I03-01 executado com peticao gerada no editor |
| **Acoes do ator e dados de entrada** | 1. Editar texto no TextArea (adicionar trecho ou modificar). 2. Clicar botao "Salvar Rascunho". |
| **Saida esperada** | Toast de sucesso "Rascunho salvo". Status permanece "Rascunho". |
| **Tipo** | Positivo |

### CT-I03-04 — Enviar peticao para revisao
| Campo | Valor |
|---|---|
| **ID** | CT-I03-04 |
| **Descricao** | Mudar status da peticao para "Em Revisao" |
| **Pre-condicoes** | CT-I03-03 executado (rascunho salvo) |
| **Acoes do ator e dados de entrada** | 1. Clicar botao "Enviar para Revisao". |
| **Saida esperada** | Status da peticao muda para "Em Revisao". Badge na tabela atualizado. |
| **Tipo** | Positivo |

### CT-I03-05 — Exportar peticao em PDF
| Campo | Valor |
|---|---|
| **ID** | CT-I03-05 |
| **Descricao** | Exportar peticao gerada como arquivo PDF |
| **Pre-condicoes** | Peticao com conteudo gerado no editor |
| **Acoes do ator e dados de entrada** | 1. Clicar botao "PDF" (ou "Baixar PDF"). |
| **Saida esperada** | Download de arquivo PDF iniciado. Arquivo contem texto da peticao com secoes obrigatorias. |
| **Tipo** | Positivo |

### CT-I03-06 — Falha na geracao via IA (FE-01)
| Campo | Valor |
|---|---|
| **ID** | CT-I03-06 |
| **Descricao** | Verificar comportamento quando a IA falha ao gerar a peticao |
| **Pre-condicoes** | Editor aberto com peticao de Impugnacao |
| **Acoes do ator e dados de entrada** | 1. Clicar "Gerar Peticao". 2. Simular timeout (caso IA demore mais de 120s) ou erro de rede. |
| **Saida esperada** | Mensagem de erro: "Erro ao gerar peticao via IA. Tente novamente." TextArea preserva conteudo anterior. Botao "Gerar Peticao" reabilitado para nova tentativa. |
| **Tipo** | Negativo |

---

## UC-I04 — Upload de Peticao Externa

### CT-I04-01 — Upload de PDF externo (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-I04-01 |
| **Descricao** | Fazer upload de peticao PDF elaborada fora do sistema |
| **Pre-condicoes** | Aba Peticoes ativa, arquivo `tests/fixtures/teste_upload.pdf` disponivel |
| **Acoes do ator e dados de entrada** | 1. Clicar botao "Upload Peticao". 2. No modal: Edital = "monitor multiparametrico". 3. Selecionar arquivo `tests/fixtures/teste_upload.pdf`. 4. Preencher Descricao = "Peticao de impugnacao elaborada pelo departamento juridico externo". 5. Clicar "Enviar". |
| **Saida esperada** | Arquivo aparece na tabela de peticoes. Badge "Externa" visivel. Botao "Visualizar" disponivel na linha. |
| **Tipo** | Positivo |

### CT-I04-02 — Upload de arquivo com formato invalido (FE-01)
| Campo | Valor |
|---|---|
| **ID** | CT-I04-02 |
| **Descricao** | Tentar upload de arquivo com formato nao suportado |
| **Pre-condicoes** | Modal de upload aberto |
| **Acoes do ator e dados de entrada** | 1. No modal, selecionar arquivo com extensao .txt ou .png. 2. Clicar "Enviar". |
| **Saida esperada** | Mensagem de erro: "Formato nao aceito. Envie arquivo .pdf, .docx ou .doc." Upload nao realizado. |
| **Tipo** | Negativo |

### CT-I04-03 — Upload sem selecionar edital (FE-03)
| Campo | Valor |
|---|---|
| **ID** | CT-I04-03 |
| **Descricao** | Tentar upload sem selecionar edital no modal |
| **Pre-condicoes** | Modal de upload aberto |
| **Acoes do ator e dados de entrada** | 1. Selecionar arquivo PDF valido. 2. Nao selecionar edital no Select. 3. Clicar "Enviar". |
| **Saida esperada** | Mensagem de validacao: "Selecione um edital para vincular a peticao." Modal nao fecha. |
| **Tipo** | Negativo |

---

## UC-I05 — Controle de Prazo

### CT-I05-01 — Exibicao de prazos com badges de urgencia (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-I05-01 |
| **Descricao** | Verificar que a tabela de prazos exibe editais com status e dias restantes |
| **Pre-condicoes** | Edital de "monitor multiparametrico" salvo com data de abertura definida |
| **Acoes do ator e dados de entrada** | 1. Acessar ImpugnacaoPage. 2. Clicar na aba "Prazos". |
| **Saida esperada** | Tabela de prazos carregada. Colunas: Edital, Orgao, Data Abertura, Prazo Limite (3d uteis), Dias Restantes, Status. Badges de status coloridos: "OK" (verde), "Atencao" (amarelo), "Urgente" (vermelho) ou "Expirado" (vermelho). |
| **Tipo** | Positivo |

### CT-I05-02 — Verificar calculo de prazo (3 dias uteis antes da abertura)
| Campo | Valor |
|---|---|
| **ID** | CT-I05-02 |
| **Descricao** | Verificar que o prazo limite e calculado como 3 dias uteis antes da data de abertura |
| **Pre-condicoes** | Tabela de prazos visivel com edital de "monitor multiparametrico" |
| **Acoes do ator e dados de entrada** | 1. Verificar coluna "Data Abertura" do edital (ex: 2026-04-15). 2. Verificar coluna "Prazo Limite" (deve ser 3 dias uteis antes = 2026-04-10). |
| **Saida esperada** | Prazo Limite calculado corretamente (3 dias uteis antes da abertura, excluindo sabados e domingos). Art. 164 Lei 14.133/2021. |
| **Tipo** | Positivo |

### CT-I05-03 — Cenario de prazo expirado
| Campo | Valor |
|---|---|
| **ID** | CT-I05-03 |
| **Descricao** | Verificar badge "EXPIRADO" para edital com prazo de impugnacao vencido |
| **Pre-condicoes** | Edital com data de abertura passada |
| **Acoes do ator e dados de entrada** | 1. Na tabela de prazos, localizar edital com data de abertura ja passada. |
| **Saida esperada** | Coluna "Dias Restantes" exibe badge "EXPIRADO" (vermelho). Coluna "Status" exibe badge "Expirado" (vermelho). |
| **Tipo** | Limite |

---

# FASE 2 — RECURSOS E CONTRA-RAZOES

---

## UC-RE01 — Monitorar Janela de Recurso

### CT-RE01-01 — Ativar monitoramento com canais selecionados (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-RE01-01 |
| **Descricao** | Ativar monitoramento de janela de recurso com canais de notificacao |
| **Pre-condicoes** | Usuario autenticado, edital de "monitor multiparametrico" salvo com resultado disponivel |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Recursos" na sidebar. 2. Selecionar edital de "monitor multiparametrico". 3. Marcar checkbox "WhatsApp". 4. Marcar checkbox "Email". 5. Clicar botao "Ativar Monitoramento". |
| **Saida esperada** | Status muda para "Aguardando". Timeline com 5 etapas visivel: Resultado (2026-04-16), Intencao de Recurso (2026-04-17), Razoes de Recurso (2026-04-21), Contra-Razoes (2026-04-24), Decisao (2026-04-28). Countdown exibido. |
| **Tipo** | Positivo |

### CT-RE01-02 — Verificar timeline de 5 etapas
| Campo | Valor |
|---|---|
| **ID** | CT-RE01-02 |
| **Descricao** | Verificar que a timeline exibe as 5 etapas com datas corretas |
| **Pre-condicoes** | CT-RE01-01 executado com monitoramento ativo |
| **Acoes do ator e dados de entrada** | 1. Verificar presenca das etapas: Resultado/Adjudicacao, Intencao de Recurso, Razoes de Recurso, Contra-Razoes, Decisao. |
| **Saida esperada** | 5 etapas visiveis com datas: 2026-04-16, 2026-04-17, 2026-04-21, 2026-04-24, 2026-04-28. Badges de status: Concluido (verde), Em andamento (azul), Pendente (cinza). |
| **Tipo** | Positivo |

### CT-RE01-03 — Ativar monitoramento sem canais selecionados (FE-01)
| Campo | Valor |
|---|---|
| **ID** | CT-RE01-03 |
| **Descricao** | Tentar ativar monitoramento sem nenhum canal de notificacao |
| **Pre-condicoes** | Aba Monitoramento ativa, edital selecionado |
| **Acoes do ator e dados de entrada** | 1. Nao marcar nenhum checkbox (WhatsApp, Email, Alerta no sistema). 2. Clicar "Ativar Monitoramento". |
| **Saida esperada** | Mensagem de validacao: "Selecione pelo menos um canal de notificacao." Monitoramento nao ativado. |
| **Tipo** | Negativo |

---

## UC-RE02 — Analisar Proposta Vencedora

### CT-RE02-01 — Analise da proposta vencedora com comparativos (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-RE02-01 |
| **Descricao** | Analisar proposta do concorrente vencedor e verificar tabelas comparativas |
| **Pre-condicoes** | RecursosPage ativa, edital de "monitor multiparametrico" selecionado |
| **Acoes do ator e dados de entrada** | 1. Clicar "Analisar Proposta Vencedora". 2. Aguardar processamento (ate 30s). |
| **Saida esperada** | Card com dados do concorrente: "MedTech Solutions Equipamentos Ltda.", CNPJ "12.345.678/0001-90". Preco vencedor unitario R$ 16.800,00. Nossa proposta R$ 18.200,00. Tabela comparativa de precos: Total vencedora R$ 183.300,00, nosso total R$ 198.500,00 (+8,3%). |
| **Tipo** | Positivo |

### CT-RE02-02 — Verificar comparativo tecnico com nao conformidades
| Campo | Valor |
|---|---|
| **ID** | CT-RE02-02 |
| **Descricao** | Verificar tabela comparativa tecnica com badges de conformidade |
| **Pre-condicoes** | CT-RE02-01 executado |
| **Acoes do ator e dados de entrada** | 1. Localizar tabela comparativa tecnica. 2. Verificar badges "Nao Atende" e "Atende". |
| **Saida esperada** | Pelo menos 5 itens "Nao Atende" na proposta vencedora: Tela (10,4" vs 12"), Parametros (8 vs 10), EtCO2 (Nao vs Sim), Bateria (3h vs 4h), ECG (5 vs 12 derivacoes). Badge "Atende" para itens conformes (Registro ANVISA, SpO2, Peso). |
| **Tipo** | Positivo |

### CT-RE02-03 — Verificar recomendacao da IA
| Campo | Valor |
|---|---|
| **ID** | CT-RE02-03 |
| **Descricao** | Verificar que a IA recomenda recurso com base nas nao conformidades |
| **Pre-condicoes** | CT-RE02-01 executado |
| **Acoes do ator e dados de entrada** | 1. Verificar Card "Analise Detalhada". |
| **Saida esperada** | IA recomenda interposicao de recurso. Texto menciona "recurso" e nao conformidades tecnicas identificadas. |
| **Tipo** | Positivo |

### CT-RE02-04 — Analisar proposta sem texto (FE-01)
| Campo | Valor |
|---|---|
| **ID** | CT-RE02-04 |
| **Descricao** | Tentar analisar proposta sem colar texto no TextArea |
| **Pre-condicoes** | Aba Analise ativa, edital selecionado |
| **Acoes do ator e dados de entrada** | 1. Deixar TextArea "Texto da Proposta Vencedora" vazio. 2. Clicar "Analisar Proposta Vencedora". |
| **Saida esperada** | Mensagem: "Cole o texto da proposta vencedora antes de analisar." Analise nao disparada. |
| **Tipo** | Negativo |

---

## UC-RE03 — Chatbox de Analise

### CT-RE03-01 — Pergunta sobre marca especifica (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-RE03-01 |
| **Descricao** | Enviar pergunta sobre marca no chatbox e receber resposta com artigo de lei |
| **Pre-condicoes** | UC-RE02 concluido, chatbox acessivel |
| **Acoes do ator e dados de entrada** | 1. No campo de texto do chatbox, digitar: "O edital exige marca especifica?". 2. Clicar "Enviar". 3. Aguardar resposta (ate 60s). |
| **Saida esperada** | Mensagem do usuario visivel no historico (lado direito). Resposta da IA visivel (lado esquerdo) mencionando Art. 41 da Lei 14.133/2021 e analise de direcionamento por marca. |
| **Tipo** | Positivo |

### CT-RE03-02 — Pergunta sobre prazo de entrega (contexto cumulativo)
| Campo | Valor |
|---|---|
| **ID** | CT-RE03-02 |
| **Descricao** | Verificar que o chat mantem contexto entre perguntas |
| **Pre-condicoes** | CT-RE03-01 executado (1 pergunta no historico) |
| **Acoes do ator e dados de entrada** | 1. Digitar: "Qual o prazo de entrega exigido?". 2. Clicar "Enviar". 3. Aguardar resposta. |
| **Saida esperada** | Resposta menciona prazo de entrega extraido do edital. Historico do chat agora tem 2 perguntas e 2 respostas. Contexto da conversa anterior mantido. |
| **Tipo** | Positivo |

### CT-RE03-03 — Pergunta sobre requisitos tecnicos
| Campo | Valor |
|---|---|
| **ID** | CT-RE03-03 |
| **Descricao** | Perguntar sobre conformidade tecnica da proposta vencedora |
| **Pre-condicoes** | CT-RE03-02 executado (2 perguntas no historico) |
| **Acoes do ator e dados de entrada** | 1. Digitar: "A proposta vencedora atende todos os requisitos tecnicos?". 2. Clicar "Enviar". 3. Aguardar resposta. |
| **Saida esperada** | Resposta detalha nao conformidades identificadas no comparativo (tela, parametros, EtCO2, bateria, ECG). Historico com 3 perguntas e 3 respostas (minimo 6 mensagens). |
| **Tipo** | Positivo |

### CT-RE03-04 — Enviar pergunta vazia (FE-01)
| Campo | Valor |
|---|---|
| **ID** | CT-RE03-04 |
| **Descricao** | Tentar enviar mensagem com campo vazio |
| **Pre-condicoes** | Chatbox ativo |
| **Acoes do ator e dados de entrada** | 1. Deixar campo de texto vazio. 2. Clicar "Enviar". |
| **Saida esperada** | Nenhuma mensagem enviada. Nenhuma alteracao no historico. Sistema ignora o envio. |
| **Tipo** | Negativo |

---

## UC-RE04 — Gerar Laudo de Recurso

### CT-RE04-01 — Gerar laudo de recurso com secoes obrigatorias (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-RE04-01 |
| **Descricao** | Gerar laudo de recurso via IA e verificar estrutura completa |
| **Pre-condicoes** | UC-RE02 concluido, edital de "monitor multiparametrico" selecionado |
| **Acoes do ator e dados de entrada** | 1. Clicar "Gerar Laudo de Recurso" (ou acessar aba Laudos, clicar "Novo Laudo", Tipo = "Recurso", Subtipo = "Administrativo", Edital = "monitor multiparametrico", Empresa Alvo = "MedTech Solutions Equipamentos Ltda."). 2. Aguardar geracao pela IA (ate 120s). |
| **Saida esperada** | Laudo gerado com secoes: Cabecalho ("AO PREGOEIRO"), Qualificacao (CH Hospitalar, CNPJ 43.712.232/0001-85, Diego Ricardo Munoz), Dos Fatos, Analise Tecnica (5 pontos de nao conformidade: tela 10,4", 8 parametros, EtCO2, bateria 3h, ECG 5 derivacoes), Do Direito (Art. 59 Lei 14.133/2021), Do Pedido. |
| **Tipo** | Positivo |

### CT-RE04-02 — Verificar fundamentos legais do laudo
| Campo | Valor |
|---|---|
| **ID** | CT-RE04-02 |
| **Descricao** | Verificar que o laudo cita artigos de lei e jurisprudencia TCU |
| **Pre-condicoes** | CT-RE04-01 executado |
| **Acoes do ator e dados de entrada** | 1. No TextArea do editor, verificar presenca de Art. 59 da Lei 14.133/2021. 2. Verificar presenca de Lei 14.133/2021. |
| **Saida esperada** | Art. 59 citado (desclassificacao de proposta nao conforme). Lei 14.133/2021 referenciada. Secao "Do Pedido" solicita desclassificacao e reclassificacao. |
| **Tipo** | Positivo |

### CT-RE04-03 — Exportar laudo em PDF
| Campo | Valor |
|---|---|
| **ID** | CT-RE04-03 |
| **Descricao** | Exportar laudo de recurso gerado como PDF |
| **Pre-condicoes** | Laudo gerado no editor |
| **Acoes do ator e dados de entrada** | 1. Clicar botao "Baixar PDF" (ou "PDF"). |
| **Saida esperada** | Download de arquivo PDF iniciado. |
| **Tipo** | Positivo |

### CT-RE04-04 — Criar laudo sem empresa alvo (FA-01)
| Campo | Valor |
|---|---|
| **ID** | CT-RE04-04 |
| **Descricao** | Criar laudo de recurso administrativo sem empresa alvo (recurso contra o edital) |
| **Pre-condicoes** | Aba Laudos ativa |
| **Acoes do ator e dados de entrada** | 1. Clicar "Novo Laudo". 2. Edital = "monitor multiparametrico", Tipo = "Recurso", Subtipo = "Administrativo", Empresa Alvo = (vazio). 3. Clicar "Criar". |
| **Saida esperada** | Laudo criado com Empresa Alvo vazia. Coluna "Empresa Alvo" na tabela exibe "-" ou vazio. Status "Rascunho". |
| **Tipo** | Limite |

### CT-RE04-05 — Campos obrigatorios nao preenchidos no modal (FE-01)
| Campo | Valor |
|---|---|
| **ID** | CT-RE04-05 |
| **Descricao** | Tentar criar laudo sem preencher campos obrigatorios |
| **Pre-condicoes** | Modal "Novo Laudo" aberto |
| **Acoes do ator e dados de entrada** | 1. Nao selecionar Edital. 2. Clicar "Criar". |
| **Saida esperada** | Mensagem de validacao indicando campo obrigatorio. Modal nao fecha. |
| **Tipo** | Negativo |

---

## UC-RE05 — Gerar Laudo de Contra-Razao

### CT-RE05-01 — Gerar laudo de contra-razao (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-RE05-01 |
| **Descricao** | Gerar laudo de contra-razao para defender proposta vencedora da CH Hospitalar |
| **Pre-condicoes** | Edital de "ultrassonografo portatil" selecionado, CH Hospitalar e a vencedora |
| **Acoes do ator e dados de entrada** | 1. Acessar RecursosPage. 2. Selecionar edital de "ultrassonografo portatil". 3. Clicar "Gerar Laudo de Contra-Razao". 4. Aguardar geracao (ate 120s). |
| **Saida esperada** | Laudo gerado com: Cabecalho ("AO PREGOEIRO"), Qualificacao (CH Hospitalar, CNPJ 43.712.232/0001-85), Recorrente adversario "BioEquip Distribuidora". Secoes: Dos Fatos, Da Defesa (exequibilidade demonstrada por notas fiscais, contratos vigentes, planilha de custos), Das Provas, Do Pedido (manutencao da adjudicacao). |
| **Tipo** | Positivo |

### CT-RE05-02 — Verificar argumentos de defesa
| Campo | Valor |
|---|---|
| **ID** | CT-RE05-02 |
| **Descricao** | Verificar que o laudo refuta alegacao de preco inexequivel |
| **Pre-condicoes** | CT-RE05-01 executado |
| **Acoes do ator e dados de entrada** | 1. No TextArea, verificar secao "Da Defesa". 2. Verificar mencao a "notas fiscais", "contrato vigente", "composicao de custos". |
| **Saida esperada** | 4 pontos de defesa: (1) Preco compativel com notas fiscais anteriores (Art. 59 par.4), (2) Contrato vigente pelo mesmo valor (Acordao TCU 1442/2018), (3) Planilha de custos com margem positiva (Art. 59 par.2), (4) Nota de credito do fabricante Mindray. |
| **Tipo** | Positivo |

### CT-RE05-03 — Exportar contra-razao em PDF
| Campo | Valor |
|---|---|
| **ID** | CT-RE05-03 |
| **Descricao** | Exportar laudo de contra-razao como PDF |
| **Pre-condicoes** | Laudo de contra-razao gerado |
| **Acoes do ator e dados de entrada** | 1. Clicar botao "Baixar PDF". |
| **Saida esperada** | Download de PDF iniciado com conteudo do laudo. |
| **Tipo** | Positivo |

---

## UC-RE06 — Submissao Assistida no Portal

### CT-RE06-01 — Submissao assistida de recurso (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-RE06-01 |
| **Descricao** | Realizar submissao assistida de recurso com checklist, exportacao e registro de protocolo |
| **Pre-condicoes** | Laudo de recurso gerado no UC-RE04, edital de "monitor multiparametrico" |
| **Acoes do ator e dados de entrada** | 1. No editor do laudo, clicar "Submissao Assistida". 2. Selecionar tipo "Recurso Administrativo". 3. Upload de laudo: `tests/fixtures/teste_upload.pdf`. 4. Upload de procuracao: `tests/fixtures/teste_upload.pdf`. 5. Upload de documentos: `tests/fixtures/teste_upload.pdf`. 6. Verificar checklist pre-submissao (Prazo, Documentos, Assinatura). 7. Clicar "Preparar Submissao". |
| **Saida esperada** | Checklist com 3 itens marcados: Prazo OK, Documentos OK, Assinatura OK. Instrucoes passo-a-passo exibidas para submissao no portal. 3 arquivos anexados. |
| **Tipo** | Positivo |

### CT-RE06-02 — Verificar checklist de validacao pre-envio
| Campo | Valor |
|---|---|
| **ID** | CT-RE06-02 |
| **Descricao** | Verificar que as 6 validacoes pre-envio sao executadas |
| **Pre-condicoes** | Modal de submissao assistida aberto |
| **Acoes do ator e dados de entrada** | 1. Verificar 6 checkboxes no modal: Tamanho do arquivo, Formato aceito, Prazo valido, Secao juridica, Secao tecnica, Assinatura. |
| **Saida esperada** | Todos os 6 checkboxes marcados. Texto: "Todas as validacoes passaram". |
| **Tipo** | Positivo |

### CT-RE06-03 — Registrar protocolo de submissao
| Campo | Valor |
|---|---|
| **ID** | CT-RE06-03 |
| **Descricao** | Registrar protocolo apos submissao manual no portal |
| **Pre-condicoes** | Modal de submissao aberto, validacoes passaram |
| **Acoes do ator e dados de entrada** | 1. Exportar PDF. 2. Clicar "Abrir Portal ComprasNet" (nova aba). 3. Preencher Protocolo = "PNCP-2026-0046-REC-001". 4. Clicar "Registrar Submissao". |
| **Saida esperada** | Mensagem "SUBMETIDO COM SUCESSO". Status do laudo muda para "Protocolado". Protocolo "PNCP-2026-0046-REC-001" salvo. |
| **Tipo** | Positivo |

### CT-RE06-04 — Registrar submissao sem protocolo (FE-02)
| Campo | Valor |
|---|---|
| **ID** | CT-RE06-04 |
| **Descricao** | Tentar registrar submissao sem informar protocolo |
| **Pre-condicoes** | Modal de submissao aberto |
| **Acoes do ator e dados de entrada** | 1. Deixar campo "Protocolo de Submissao" vazio. 2. Clicar "Registrar Submissao". |
| **Saida esperada** | Mensagem: "Informe o protocolo recebido do portal." Submissao nao registrada. |
| **Tipo** | Negativo |

---

# FASE 3 — FOLLOWUP DE RESULTADOS

---

## UC-FU01 — Registrar Resultado de Edital

### CT-FU01-01 — Registrar resultado "Ganho" (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-FU01-01 |
| **Descricao** | Registrar vitoria no edital de monitor multiparametrico |
| **Pre-condicoes** | FollowupPage acessivel, edital de "monitor multiparametrico" pendente de resultado |
| **Acoes do ator e dados de entrada** | 1. Clicar "Followup" na sidebar. 2. Selecionar edital de "monitor multiparametrico". 3. Clicar "Registrar Resultado". 4. Selecionar radio "Ganho". 5. Preencher Valor Homologado = "183300". 6. Preencher Motivo = "Recurso acatado — proposta concorrente desclassificada por nao atender requisitos tecnicos". 7. Preencher Licoes Aprendidas = "Analise tecnica detalhada da proposta concorrente foi decisiva. Manter banco de dados de especificacoes tecnicas dos concorrentes para futuras analises." 8. Clicar "Salvar Resultado". |
| **Saida esperada** | Toast de sucesso. Badge "Ganho" (verde) visivel na linha do edital. Stat Cards atualizados: Vitorias incrementado, Taxa de Sucesso recalculada. |
| **Tipo** | Positivo |

### CT-FU01-02 — Registrar resultado "Perdido"
| Campo | Valor |
|---|---|
| **ID** | CT-FU01-02 |
| **Descricao** | Registrar derrota no edital de ultrassonografo portatil |
| **Pre-condicoes** | FollowupPage acessivel, edital de "ultrassonografo portatil" pendente |
| **Acoes do ator e dados de entrada** | 1. Selecionar edital de "ultrassonografo portatil". 2. Clicar "Registrar Resultado". 3. Selecionar radio "Perdido". 4. Preencher Valor Proposta Vencedora = "142000". 5. Preencher Motivo = "Preco nao competitivo — concorrente com contrato de distribuicao exclusiva obteve desconto de volume". 6. Preencher Licoes Aprendidas = "Negociar condicoes de volume diretamente com o fabricante antes de cotar. Avaliar parcerias com distribuidores regionais para reduzir custo logistico." 7. Clicar "Salvar Resultado". |
| **Saida esperada** | Toast de sucesso. Badge "Perdido" (vermelho) visivel. Stat Cards atualizados com nova derrota. |
| **Tipo** | Positivo |

### CT-FU01-03 — Registrar resultado sem selecionar tipo (FE-02)
| Campo | Valor |
|---|---|
| **ID** | CT-FU01-03 |
| **Descricao** | Tentar registrar resultado sem selecionar Ganho/Perdido/Cancelado |
| **Pre-condicoes** | Modal de resultado aberto |
| **Acoes do ator e dados de entrada** | 1. Nao selecionar nenhum radio. 2. Clicar "Registrar" (ou "Salvar Resultado"). |
| **Saida esperada** | Mensagem: "Selecione o tipo de resultado." Modal nao fecha. |
| **Tipo** | Negativo |

### CT-FU01-04 — Registrar vitoria sem valor final (FE-03)
| Campo | Valor |
|---|---|
| **ID** | CT-FU01-04 |
| **Descricao** | Tentar registrar vitoria sem informar valor final |
| **Pre-condicoes** | Modal de resultado aberto |
| **Acoes do ator e dados de entrada** | 1. Selecionar "Ganho". 2. Deixar "Valor Final" vazio. 3. Clicar "Registrar". |
| **Saida esperada** | Mensagem: "Informe o valor final homologado." Modal nao fecha. |
| **Tipo** | Negativo |

---

## UC-FU02 — Configurar Alertas de Vencimento

### CT-FU02-01 — Configurar 3 alertas de vencimento (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-FU02-01 |
| **Descricao** | Configurar alertas de contrato, ARP e garantia para edital ganho |
| **Pre-condicoes** | UC-FU01 concluido com resultado "Ganho" para edital de monitor |
| **Acoes do ator e dados de entrada** | 1. Selecionar edital "monitor multiparametrico". 2. Clicar "Configurar Alertas". 3. Alerta 1: Tipo = "Contrato", Data = "2027-04-28", Antecedencias = 90/30/7 dias. 4. Adicionar Alerta 2: Tipo = "Ata de Registro de Precos", Data = "2027-04-28", Antecedencias = 60/30/15 dias. 5. Adicionar Alerta 3: Tipo = "Garantia Contratual", Data = "2026-07-28", Antecedencias = 30/15/5 dias. 6. Clicar "Salvar Alertas". |
| **Saida esperada** | Toast de sucesso. 3 alertas listados na tela: Contrato (2027-04-28), ARP (2027-04-28), Garantia (2026-07-28). Datas de vencimento e antecedencias visiveis. |
| **Tipo** | Positivo |

### CT-FU02-02 — Verificar lista de alertas salvos
| Campo | Valor |
|---|---|
| **ID** | CT-FU02-02 |
| **Descricao** | Verificar que todos os alertas configurados aparecem na lista |
| **Pre-condicoes** | CT-FU02-01 executado |
| **Acoes do ator e dados de entrada** | 1. Verificar lista de alertas: "Contrato", "Ata de Registro", "Garantia Contratual". |
| **Saida esperada** | 3 alertas visiveis com datas corretas: "2027-04-28" (2 vezes) e "2026-07-28" (1 vez). |
| **Tipo** | Positivo |

---

## UC-FU03 — Score Logistico

### CT-FU03-01 — Verificar score logistico e dimensoes (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-FU03-01 |
| **Descricao** | Verificar score logistico com 5 dimensoes e classificacao |
| **Pre-condicoes** | UC-FU01 concluido com "Ganho", edital de "monitor multiparametrico" |
| **Acoes do ator e dados de entrada** | 1. Selecionar edital "monitor multiparametrico". 2. Clicar "Score Logistico". 3. Aguardar carregamento. |
| **Saida esperada** | 5 dimensoes: Pontualidade (92%), Integridade (96%), Eficiencia (85%), Qualidade (92%), Satisfacao (82%). Score final: 89%. Classificacao: "Excelente". Grafico radar com 5 dimensoes visivel. Card de recomendacoes da IA presente. |
| **Tipo** | Positivo |

### CT-FU03-02 — Verificar score individual de cada dimensao
| Campo | Valor |
|---|---|
| **ID** | CT-FU03-02 |
| **Descricao** | Verificar valores individuais de cada dimensao do score |
| **Pre-condicoes** | CT-FU03-01 executado |
| **Acoes do ator e dados de entrada** | 1. Verificar: Pontualidade = 92%, Integridade = 96%, Eficiencia = 85%, Qualidade = 92%, Satisfacao = 82%. |
| **Saida esperada** | Cada dimensao com score numerico visivel e classificacao individual. Scores verdes para Excelente (>= 90%) e Bom (>= 80%). |
| **Tipo** | Positivo |

### CT-FU03-03 — Score como "N/A" sem dados suficientes (FA-01)
| Campo | Valor |
|---|---|
| **ID** | CT-FU03-03 |
| **Descricao** | Verificar exibicao quando dados logisticos sao insuficientes |
| **Pre-condicoes** | Edital sem dados logisticos configurados |
| **Acoes do ator e dados de entrada** | 1. Selecionar edital sem produto vinculado. 2. Verificar card "Score Logistico". |
| **Saida esperada** | Score exibe "N/A". Mensagem informativa sobre dados insuficientes. |
| **Tipo** | Limite |

---

# RESUMO DOS CASOS DE TESTE — CONJUNTO 1

| UC | ID | Tipo | Fluxo |
|---|---|---|---|
| UC-I01 | CT-I01-01 | Positivo | Principal |
| UC-I01 | CT-I01-02 | Positivo | Principal |
| UC-I01 | CT-I01-03 | Positivo | Principal |
| UC-I01 | CT-I01-04 | Positivo | Principal |
| UC-I01 | CT-I01-05 | Negativo | FE-03 |
| UC-I01 | CT-I01-06 | Positivo | FA-02 |
| UC-I02 | CT-I02-01 | Positivo | Principal |
| UC-I02 | CT-I02-02 | Positivo | Principal |
| UC-I02 | CT-I02-03 | Negativo | FE-01 |
| UC-I02 | CT-I02-04 | Limite | FA-01 |
| UC-I03 | CT-I03-01 | Positivo | Principal |
| UC-I03 | CT-I03-02 | Positivo | Principal |
| UC-I03 | CT-I03-03 | Positivo | Principal |
| UC-I03 | CT-I03-04 | Positivo | Principal |
| UC-I03 | CT-I03-05 | Positivo | Principal |
| UC-I03 | CT-I03-06 | Negativo | FE-01 |
| UC-I04 | CT-I04-01 | Positivo | Principal |
| UC-I04 | CT-I04-02 | Negativo | FE-01 |
| UC-I04 | CT-I04-03 | Negativo | FE-03 |
| UC-I05 | CT-I05-01 | Positivo | Principal |
| UC-I05 | CT-I05-02 | Positivo | Principal |
| UC-I05 | CT-I05-03 | Limite | FA-01/FE |
| UC-RE01 | CT-RE01-01 | Positivo | Principal |
| UC-RE01 | CT-RE01-02 | Positivo | Principal |
| UC-RE01 | CT-RE01-03 | Negativo | FE-01 |
| UC-RE02 | CT-RE02-01 | Positivo | Principal |
| UC-RE02 | CT-RE02-02 | Positivo | Principal |
| UC-RE02 | CT-RE02-03 | Positivo | Principal |
| UC-RE02 | CT-RE02-04 | Negativo | FE-01 |
| UC-RE03 | CT-RE03-01 | Positivo | Principal |
| UC-RE03 | CT-RE03-02 | Positivo | Principal |
| UC-RE03 | CT-RE03-03 | Positivo | Principal |
| UC-RE03 | CT-RE03-04 | Negativo | FE-01 |
| UC-RE04 | CT-RE04-01 | Positivo | Principal |
| UC-RE04 | CT-RE04-02 | Positivo | Principal |
| UC-RE04 | CT-RE04-03 | Positivo | Principal |
| UC-RE04 | CT-RE04-04 | Limite | FA-01 |
| UC-RE04 | CT-RE04-05 | Negativo | FE-01 |
| UC-RE05 | CT-RE05-01 | Positivo | Principal |
| UC-RE05 | CT-RE05-02 | Positivo | Principal |
| UC-RE05 | CT-RE05-03 | Positivo | Principal |
| UC-RE06 | CT-RE06-01 | Positivo | Principal |
| UC-RE06 | CT-RE06-02 | Positivo | Principal |
| UC-RE06 | CT-RE06-03 | Positivo | Principal |
| UC-RE06 | CT-RE06-04 | Negativo | FE-02 |
| UC-FU01 | CT-FU01-01 | Positivo | Principal |
| UC-FU01 | CT-FU01-02 | Positivo | Principal |
| UC-FU01 | CT-FU01-03 | Negativo | FE-02 |
| UC-FU01 | CT-FU01-04 | Negativo | FE-03 |
| UC-FU02 | CT-FU02-01 | Positivo | Principal |
| UC-FU02 | CT-FU02-02 | Positivo | Principal |
| UC-FU03 | CT-FU03-01 | Positivo | Principal |
| UC-FU03 | CT-FU03-02 | Positivo | Principal |
| UC-FU03 | CT-FU03-03 | Limite | FA-01 |

**Total: 53 casos de teste** (35 Positivos + 12 Negativos + 6 Limite)

---

*Documento gerado em 21/04/2026. Dados exclusivamente do tutorialsprint4-1.md (Conjunto 1 — CH Hospitalar).*
