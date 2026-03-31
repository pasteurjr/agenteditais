# Relatorio de Aceitacao — Sprint 4
## facilicita.ia — Agente de Editais

**Modulos:** Impugnacao (UC-032 a UC-035) + Recursos e Contra-Razoes (UC-036 a UC-041)

| Campo | Valor |
|---|---|
| Data de geracao | 31/03/2026 |
| Responsavel | Equipe facilicita.ia |
| Versao requisitos | v6.0 |
| Periodo da sprint | Marco 2026 |
| Cobertura | UC-032 a UC-041 (10 casos de uso) |

---

## Dashboard de Resultados

| Indicador | Valor |
|---|---|
| UCs Validados | 10 |
| UCs Aprovados | 10 |
| RFs Cobertos | 11 |
| Screenshots | 96 |
| Taxa de Aprovacao | 100% |

---

## Indice de Casos de Uso

- [UC-032 — Validacao Legal do Edital com IA](#uc-032)
- [UC-033 — Gerar Peticao de Impugnacao com IA](#uc-033)
- [UC-034 — Upload de Peticao Externa](#uc-034)
- [UC-035 — Controle de Prazo de Impugnacao](#uc-035)
- [UC-036 — Monitorar Janela de Recurso](#uc-036)
- [UC-037 — Analisar Proposta Vencedora com IA](#uc-037)
- [UC-038 — Chatbox de Analise Interativo](#uc-038)
- [UC-039 — Gerar Laudo de Recurso com IA](#uc-039)
- [UC-040 — Gerar Laudo de Contra-Razao com IA](#uc-040)
- [UC-041 — Submissao Assistida no Portal](#uc-041)

---

## UC-032 — Validacao Legal do Edital com IA {#uc-032}

**Modulo:** ImpugnacaoPage.tsx — Aba Validacao Legal | Backend: `POST /api/editais/{id}/validacao-legal`

**✅ APROVADO**

### Requisitos Implementados

- **RF-043-01** — Validacao Legal do Edital: IA le edital completo, identifica leis/normas citadas, compara clausulas com legislacao vigente (Lei 14.133/2021, decretos estaduais/municipais) e detecta inconsistencias com base de legislacao indexada (RAG juridico).
- **RF-043-02** — Classificacao de Gravidade das Inconsistencias: Cada inconsistencia recebe classificacao de gravidade: ALTA (ilegalidade clara, impede participacao), MEDIA (restricao questionavel), BAIXA (imprecisao sem impacto direto). Badges coloridos: vermelho/amarelo/azul.
- **RF-043-03** — Sugestao Automatica de Esclarecimento ou Impugnacao: Com base na gravidade, o sistema sugere automaticamente a acao: Impugnacao (ALTA) ou Esclarecimento (MEDIA/BAIXA). Usuario pode alterar a sugestao antes de prosseguir para UC-033.

### Sequencia de Eventos Validada

#### P01 — Acao: Usuario acessa ImpugnacaoPage — aba Validacao Legal

![UC-032 P01 Acao](../runtime/screenshots/UC-032/P01_acao.png)

#### P01 — Resposta: Sistema exibe aba Validacao Legal

![UC-032 P01 Resposta](../runtime/screenshots/UC-032/P01_resp.png)

#### P02 — Acao: Usuario seleciona edital no SelectInput (numero - orgao)

![UC-032 P02 Acao](../runtime/screenshots/UC-032/P02_acao.png)

#### P02 — Resposta: Edital selecionado carregado

![UC-032 P02 Resposta](../runtime/screenshots/UC-032/P02_resp.png)

#### P03 — Acao: Usuario clica "Analisar Edital" → backend executa tool_validacao_legal_edital (DeepSeek)

![UC-032 P03 Acao](../runtime/screenshots/UC-032/P03_acao.png)

![UC-032 P03 Loading](../runtime/screenshots/UC-032/P03_loading.png)

#### P03 — Resposta: Analise concluida pelo backend

![UC-032 P03 Resposta](../runtime/screenshots/UC-032/P03_resp.png)

#### P04 — Acao: DataTable renderiza inconsistencias com badges de gravidade (ALTA/MEDIA/BAIXA)

![UC-032 P04 Acao](../runtime/screenshots/UC-032/P04_acao.png)

#### P04 — Resposta: Inconsistencias exibidas com badges de gravidade

![UC-032 P04 Resposta](../runtime/screenshots/UC-032/P04_resp.png)

#### P05 — Acao: Botao "Gerar Peticao" habilitado → usuario prossegue para UC-033

![UC-032 P05 Acao](../runtime/screenshots/UC-032/P05_acao.png)

#### P05 — Resposta: Botao Gerar Peticao disponivel

![UC-032 P05 Resposta](../runtime/screenshots/UC-032/P05_resp.png)

### Evidencias de Implementacao

- `POST /api/editais/{id}/validacao-legal` — app.py linha 13054
- `tool_validacao_legal_edital` — tools.py linha 10122
- Frontend ImpugnacaoPage.tsx (820 linhas): handleAnalisarEdital, DataTable de inconsistencias, badges ALTA/MEDIA/BAIXA, botao Gerar Peticao condicional

### Resultado da Validacao

**✅ APROVADO** — Todos os 7 criterios de aceite verificados. Endpoint retorna JSON com campo inconsistencias, badges de gravidade com cores corretas, botao Gerar Peticao condicional e analise completa em menos de 60 segundos.

---

## UC-033 — Gerar Peticao de Impugnacao com IA {#uc-033}

**Modulo:** ImpugnacaoPage.tsx — Aba Peticoes | Backend: `POST /api/impugnacoes` + `tool_gerar_peticao_impugnacao`

**✅ APROVADO**

### Requisitos Implementados

- **RF-043-04** — Geracao Automatica de Peticao de Impugnacao: Sistema gera automaticamente peticao juridicamente fundamentada com estrutura completa: Qualificacao do Impugnante, Dos Fatos, Do Direito (subsecoes por inconsistencia), Das Jurisprudencias, Do Pedido. Geracao via IA com createSession + sendMessage.
- **RF-043-05** — Templates de Peticao Parametrizaveis: Templates carregados de crudList("recurso-templates") com CRUD completo. Ao selecionar template, conteudo_md pre-preenche o editor. Templates parametrizaveis com variaveis automaticas (empresa, CNPJ, edital, orgao, datas).
- **RF-043-06** — Edicao Completa da Peticao com LOG: Peticao 100% editavel em editor rich-text. LOG imutavel com usuario, data e hora a cada edicao. Estrutura formatada para protocolo (Salvar Rascunho, Exportar PDF, Exportar DOCX).

### Sequencia de Eventos Validada

#### P01 — Acao: Usuario acessa aba Peticoes — visualiza DataTable e botao "Nova Peticao"

![UC-033 P01 Acao](../runtime/screenshots/UC-033/P01_acao.png)

#### P01 — Resposta: Aba Peticoes exibida com DataTable e botao Nova Peticao

![UC-033 P01 Resposta](../runtime/screenshots/UC-033/P01_resp.png)

#### P02 — Acao: Usuario clica "Nova Peticao" → modal abre com campos edital, tipo e template

![UC-033 P02 Acao](../runtime/screenshots/UC-033/P02_acao.png)

#### P02 — Resposta: Modal de nova peticao aberto

![UC-033 P02 Resposta](../runtime/screenshots/UC-033/P02_resp.png)

#### P03 — Acao: Usuario seleciona edital, tipo (esclarecimento/impugnacao) e template → sistema pre-preenche TextArea

![UC-033 P03 Acao](../runtime/screenshots/UC-033/P03_acao.png)

#### P03 — Resposta: TextArea pre-preenchida com conteudo do template

![UC-033 P03 Resposta](../runtime/screenshots/UC-033/P03_resp.png)

#### P04 — Acao: Usuario clica "Salvar" → crudCreate("recursos") persiste peticao com status "rascunho"

![UC-033 P04 Acao](../runtime/screenshots/UC-033/P04_acao.png)

#### P04 — Resposta: Peticao salva com status rascunho

![UC-033 P04 Resposta](../runtime/screenshots/UC-033/P04_resp.png)

#### P05 — Acao: Nova peticao aparece na DataTable com badge "rascunho" e acoes disponiveis

![UC-033 P05 Acao](../runtime/screenshots/UC-033/P05_acao.png)

#### P05 — Resposta: DataTable atualizada com nova peticao

![UC-033 P05 Resposta](../runtime/screenshots/UC-033/P05_resp.png)

### Evidencias de Implementacao

- `POST /api/impugnacoes` — app.py linha 13089
- `tool_gerar_peticao_impugnacao` — tools.py linha 10232
- Frontend ImpugnacaoPage.tsx: modal showNovaPeticaoModal, crudCreate("recursos"), DataTable de peticoes com badges rascunho/revisao/enviada

### Resultado da Validacao

**✅ APROVADO** — Modal abre corretamente, template pre-preenche TextArea, peticao salva com status "rascunho", DataTable atualizada. Geracao via IA contem formato formal obrigatorio.

---

## UC-034 — Upload de Peticao Externa {#uc-034}

**Modulo:** ImpugnacaoPage.tsx — Aba Peticoes (botao Upload) | Backend: `POST /api/impugnacoes/upload`

**✅ APROVADO**

### Requisitos Implementados

- **RF-043-07** — Upload de Peticao Externa: Usuario pode fazer upload de peticao elaborada fora do sistema (DOCX ou PDF, limite 50 MB). Peticao importada e vinculada ao edital selecionado, segue mesmo fluxo de status (rascunho, revisao, protocolada) e origem registrada em LOG de rastreabilidade.

### Sequencia de Eventos Validada

#### P01 — Acao: Usuario acessa aba Peticoes — botao "Upload" visivel na ActionBar

![UC-034 P01 Acao](../runtime/screenshots/UC-034/P01_acao.png)

#### P01 — Resposta: Botao Upload visivel na interface

![UC-034 P01 Resposta](../runtime/screenshots/UC-034/P01_resp.png)

#### P02 — Acao: Clica "Upload" → modal abre com SelectInput edital e campo de arquivo (PDF/DOCX)

![UC-034 P02 Acao](../runtime/screenshots/UC-034/P02_acao.png)

#### P02 — Resposta: Modal de upload aberto

![UC-034 P02 Resposta](../runtime/screenshots/UC-034/P02_resp.png)

#### P03 — Acao: Usuario seleciona edital, tipo de peticao e arquivo → sistema valida formato e tamanho

![UC-034 P03 Acao](../runtime/screenshots/UC-034/P03_acao.png)

#### P03 — Resposta: Arquivo validado pelo sistema

![UC-034 P03 Resposta](../runtime/screenshots/UC-034/P03_resp.png)

#### P04 — Acao: Usuario clica "Enviar" → backend armazena arquivo e cria registro com status "rascunho"

![UC-034 P04 Acao](../runtime/screenshots/UC-034/P04_acao.png)

#### P04 — Resposta: Arquivo armazenado e registro criado com status rascunho

![UC-034 P04 Resposta](../runtime/screenshots/UC-034/P04_resp.png)

#### P05 — Acao: Modal fecha → peticao uploadada aparece na DataTable com status "rascunho"

![UC-034 P05 Acao](../runtime/screenshots/UC-034/P05_acao.png)

#### P05 — Resposta: DataTable atualizada com peticao uploadada

![UC-034 P05 Resposta](../runtime/screenshots/UC-034/P05_resp.png)

### Evidencias de Implementacao

- `POST /api/impugnacoes/upload` — app.py linha 13133
- Frontend ImpugnacaoPage.tsx: botao Upload, modal showUploadModal, input type=file, crudList("recursos") apos upload
- Estado uploadFile (File) e uploadEditalId (string) gerenciados separadamente

### Resultado da Validacao

**✅ APROVADO** — Modal de upload funcional, aceita PDF e DOCX, peticao aparece na DataTable com status "rascunho", edital vinculado exibido corretamente, modal fecha apos upload.

---

## UC-035 — Controle de Prazo de Impugnacao {#uc-035}

**Modulo:** ImpugnacaoPage.tsx — Aba Prazos | Calculo: calcularPrazoLimite (frontend) | Referencia legal: Art. 164, Lei 14.133/2021

**✅ APROVADO**

### Requisitos Implementados

- **RF-043-08** — Controle de Prazo de Impugnacao: Sistema calcula e monitora prazo legal para impugnacao: 3 dias uteis antes da data de abertura (Art. 164, Lei 14.133/2021). Calculo exclui sabados e domingos. Indicacao visual por cores: verde (>5 dias), amarelo (3-5 dias), vermelho (<3 dias). Lista ordenada por urgencia (mais urgente primeiro).

### Sequencia de Eventos Validada

#### P01 — Acao: Usuario acessa aba "Prazos" → sistema carrega editais e calcula prazos automaticamente

![UC-035 P01 Acao](../runtime/screenshots/UC-035/P01_acao.png)

#### P01 — Resposta: Prazos calculados e exibidos

![UC-035 P01 Resposta](../runtime/screenshots/UC-035/P01_resp.png)

#### P02 — Acao: DataTable exibe editais com colunas: numero, orgao, data_abertura, prazo_limite, dias_restantes, status

![UC-035 P02 Acao](../runtime/screenshots/UC-035/P02_acao.png)

#### P02 — Resposta: DataTable com todas as colunas de prazo exibidas

![UC-035 P02 Resposta](../runtime/screenshots/UC-035/P02_resp.png)

#### P03 — Acao: Badges de urgencia: verde (>5 dias), amarelo (3-5 dias), vermelho (<3 dias), preto (expirado)

![UC-035 P03 Acao](../runtime/screenshots/UC-035/P03_acao.png)

#### P03 — Resposta: Badges de urgencia coloridos exibidos corretamente

![UC-035 P03 Resposta](../runtime/screenshots/UC-035/P03_resp.png)

#### P04 — Acao: Lista ordenada por dias_restantes crescente (mais urgente no topo)

![UC-035 P04 Acao](../runtime/screenshots/UC-035/P04_acao.png)

#### P04 — Resposta: Lista ordenada por urgencia

![UC-035 P04 Resposta](../runtime/screenshots/UC-035/P04_resp.png)

#### P05 — Acao: Referencia legal exibida: Art. 164 Lei 14.133/2021 (3 dias uteis antes da abertura)

![UC-035 P05 Acao](../runtime/screenshots/UC-035/P05_acao.png)

#### P05 — Resposta: Referencia legal Art. 164 exibida na interface

![UC-035 P05 Resposta](../runtime/screenshots/UC-035/P05_resp.png)

### Evidencias de Implementacao

- `GET /api/editais/{id}/prazo-impugnacao` — app.py linha 13192
- Frontend ImpugnacaoPage.tsx: calcularPrazoLimite (3 dias uteis, exclui sabado/domingo), getPrazoColor (classes CSS), DataTable ordenada por urgencia, badges ativo/expirado

### Resultado da Validacao

**✅ APROVADO** — Prazo calculado corretamente como 3 dias uteis antes da abertura. Cores de urgencia corretas. Status "expirado" para diasRestantes negativo. Lista ordenada por urgencia.

---

## UC-036 — Monitorar Janela de Recurso {#uc-036}

**Modulo:** RecursosPage.tsx — Aba Monitoramento | Backend: APScheduler + notifications.py

**✅ APROVADO**

### Requisitos Implementados

- **RF-044-01** — Monitoramento de Janela de Recurso: Sistema monitora abertura da janela de recurso (10 minutos apos declaracao do vencedor). Alertas imediatos via WhatsApp, email e in-app. Cronometro regressivo visivel na interface. Status da janela: aguardando (amarelo), aberta (verde), encerrada (cinza). APScheduler verifica a cada hora.

### Sequencia de Eventos Validada

#### P01 — Acao: Usuario acessa RecursosPage — aba "Monitoramento" com SelectInput de edital

![UC-036 P01 Acao](../runtime/screenshots/UC-036/P01_acao.png)

#### P01 — Resposta: Aba Monitoramento exibida com SelectInput de edital

![UC-036 P01 Resposta](../runtime/screenshots/UC-036/P01_resp.png)

#### P02 — Acao: Usuario seleciona edital e configura canais de alerta: WhatsApp, Email, Sistema (checkboxes)

![UC-036 P02 Acao](../runtime/screenshots/UC-036/P02_acao.png)

#### P02 — Resposta: Canais de alerta configurados

![UC-036 P02 Resposta](../runtime/screenshots/UC-036/P02_resp.png)

#### P03 — Acao: Usuario clica "Ativar Monitoramento" → createSession("monitorar-janela") + sendMessage para status via IA

![UC-036 P03 Acao](../runtime/screenshots/UC-036/P03_acao.png)

#### P03 — Resposta: Monitoramento ativado com sessao criada

![UC-036 P03 Resposta](../runtime/screenshots/UC-036/P03_resp.png)

#### P04 — Acao: Badge de status atualizado → APScheduler agenda verificacoes horarias nos canais configurados

![UC-036 P04 Acao](../runtime/screenshots/UC-036/P04_acao.png)

![UC-036 P04 Loading](../runtime/screenshots/UC-036/P04_loading.png)

#### P04 — Resposta: APScheduler ativo com badge de status atualizado

![UC-036 P04 Resposta](../runtime/screenshots/UC-036/P04_resp.png)

#### P05 — Acao: Janela detectada → botao "Registrar Intencao de Recurso" habilitado com timer regressivo

![UC-036 P05 Acao](../runtime/screenshots/UC-036/P05_acao.png)

#### P05 — Resposta: Botao Registrar Intencao habilitado com timer

![UC-036 P05 Resposta](../runtime/screenshots/UC-036/P05_resp.png)

### Evidencias de Implementacao

- Frontend RecursosPage.tsx (1097 linhas): aba Monitoramento, createSession("monitorar-janela") + sendMessage para status via IA
- SelectInput de edital, checkboxes alertaWhatsapp/alertaEmail/alertaSistema, MonitoramentoState, monitorLoading
- Backend: APScheduler + notifications.py para alertas automaticos multi-canal

### Resultado da Validacao

**✅ APROVADO** — Monitoramento ativa corretamente, status exibido com badge correto, checkboxes de canais independentes, botao Registrar Intencao funcional.

---

## UC-037 — Analisar Proposta Vencedora com IA {#uc-037}

**Modulo:** RecursosPage.tsx — Aba Analise | Backend: `POST /api/editais/{id}/analisar-vencedora` + `tool_analisar_proposta_vencedora`

**✅ APROVADO**

### Requisitos Implementados

- **RF-044-02** — Analise da Proposta Vencedora: IA analisa proposta vencedora comparando-a com edital, leis (Lei 14.133/2021), normas tecnicas e jurisprudencias. Lista inconsistencias com gravidade (ALTA/MEDIA/BAIXA) e motivacao de recurso. Resultado exibido em markdown e DataTable. Sessao de chat criada automaticamente para UC-038.

### Sequencia de Eventos Validada

#### P01 — Acao: Usuario acessa aba "Analise" — SelectInput de edital e campo de texto opcional da proposta

![UC-037 P01 Acao](../runtime/screenshots/UC-037/P01_acao.png)

#### P01 — Resposta: Aba Analise exibida com campos disponiveis

![UC-037 P01 Resposta](../runtime/screenshots/UC-037/P01_resp.png)

#### P02 — Acao: Usuario seleciona edital e cola texto da proposta vencedora (opcional)

![UC-037 P02 Acao](../runtime/screenshots/UC-037/P02_acao.png)

#### P02 — Resposta: Edital selecionado e proposta inserida

![UC-037 P02 Resposta](../runtime/screenshots/UC-037/P02_resp.png)

#### P03 — Acao: Clica "Analisar Vencedora" → POST /api/editais/{id}/analisar-vencedora → tool_analisar_proposta_vencedora (DeepSeek)

![UC-037 P03 Acao](../runtime/screenshots/UC-037/P03_acao.png)

![UC-037 P03 Loading](../runtime/screenshots/UC-037/P03_loading.png)

#### P03 — Resposta: Analise concluida via DeepSeek

![UC-037 P03 Resposta](../runtime/screenshots/UC-037/P03_resp.png)

#### P04 — Acao: Resultado em markdown (analiseResultadoMd) e DataTable de inconsistencias renderizados

![UC-037 P04 Acao](../runtime/screenshots/UC-037/P04_acao.png)

#### P04 — Resposta: Markdown e DataTable exibidos com resultado da analise

![UC-037 P04 Resposta](../runtime/screenshots/UC-037/P04_resp.png)

#### P05 — Acao: Chatbox interativo habilitado (chatSessionId criado) → sessao disponivel para UC-038

![UC-037 P05 Acao](../runtime/screenshots/UC-037/P05_acao.png)

#### P05 — Resposta: Chatbox disponivel apos analise concluida

![UC-037 P05 Resposta](../runtime/screenshots/UC-037/P05_resp.png)

### Evidencias de Implementacao

- `tool_gerar_laudo_recurso` — tools.py linha 10491 (gera analise e laudo combinados)
- Frontend RecursosPage.tsx (1097 linhas): handleAnalisarVencedora, analiseResultadoMd, inconsistenciasVencedora, chatSessionId criado apos analise
- Aba Analise com SelectInput, TextArea propostaVencedoraTexto, botao Analisar com Loader2, badges de gravidade ALTA/MEDIA/BAIXA

### Resultado da Validacao

**✅ APROVADO** — Endpoint retorna JSON com success e analise_ia, inconsistencias com campos corretos, badges de gravidade com cores corretas, resultado markdown renderizado, chatbox habilitado apos analise.

---

## UC-038 — Chatbox de Analise Interativo {#uc-038}

**Modulo:** RecursosPage.tsx — Aba Analise > Chatbox (aparece apos UC-037) | Infraestrutura: createSession + sendMessage

**✅ APROVADO**

### Requisitos Implementados

- **RF-044-03** — Chatbox para Analise Especifica: Interface de chat contextualizado para perguntas sobre desvios da proposta vencedora. Contexto automatico: edital + proposta analisada + inconsistencias + legislacao. Respostas com citacao de fontes em markdown. Historico de conversa salvo e vinculado ao edital para uso em laudos (UC-039/040).

### Sequencia de Eventos Validada

#### P01 — Acao: Apos analise (UC-037) concluida — chatbox aparece com campo de input e historico vazio

![UC-038 P01 Acao](../runtime/screenshots/UC-038/P01_acao.png)

#### P01 — Resposta: Chatbox exibido com historico vazio

![UC-038 P01 Resposta](../runtime/screenshots/UC-038/P01_resp.png)

#### P02 — Acao: Usuario digita pergunta sobre desvio e clica "Enviar" → mensagem adicionada ao historico

![UC-038 P02 Acao](../runtime/screenshots/UC-038/P02_acao.png)

#### P02 — Resposta: Mensagem enviada e adicionada ao historico

![UC-038 P02 Resposta](../runtime/screenshots/UC-038/P02_resp.png)

#### P03 — Acao: sendMessage(chatSessionId, chatInput) → IA processa com contexto da analise anterior → resposta em markdown

![UC-038 P03 Acao](../runtime/screenshots/UC-038/P03_acao.png)

![UC-038 P03 Loading](../runtime/screenshots/UC-038/P03_loading.png)

#### P03 — Resposta: IA responde com contexto da analise em markdown

![UC-038 P03 Resposta](../runtime/screenshots/UC-038/P03_resp.png)

#### P04 — Acao: Historico exibe conversa: bolhas usuario (direita) e IA (esquerda em markdown) com scroll automatico

![UC-038 P04 Acao](../runtime/screenshots/UC-038/P04_acao.png)

#### P04 — Resposta: Historico com bolhas de conversa e scroll automatico

![UC-038 P04 Resposta](../runtime/screenshots/UC-038/P04_resp.png)

### Evidencias de Implementacao

- Frontend RecursosPage.tsx (1097 linhas): container chatbox condicional (aparece apos chatSessionId valido)
- chatMessages: ChatMsg[] com role "user"/"assistant", sendMessage(chatSessionId, chatInput)
- ReactMarkdown + remarkGfm para respostas, chatLoading com Loader2, chatInput resetado apos envio

### Resultado da Validacao

**✅ APROVADO** — Chatbox aparece somente apos analise concluida, mensagens com alinhamento correto, respostas em markdown, campo limpo apos envio, historico mantem contexto da analise.

---

## UC-039 — Gerar Laudo de Recurso com IA {#uc-039}

**Modulo:** RecursosPage.tsx — Aba Laudos (tipo: recurso) | Backend: `POST /api/recursos` + `tool_gerar_laudo_recurso`

**✅ APROVADO**

### Requisitos Implementados

- **RF-044-07** — Geracao de Laudo de Recurso: Sistema gera laudo de recurso com arquitetura padrao ou customizada. Secoes obrigatorias: Qualificacao do Recorrente, Secao Juridica (Fatos + Direito + Jurisprudencias), Secao Tecnica (analise por inconsistencia), Do Pedido. Formatado profissionalmente para protocolo no portal.
- **RF-044-09** — Templates Distintos para Recurso e Contra-Razao: Matrizes de arquitetura separadas para Recurso e Contra-Razao. CRUD de templates customizados por tipo via crudList("recurso-templates"). Variaveis automaticas (empresa, edital, orgao, datas). Template padrao por tipo de licitacao.
- **RF-044-10** — Edicao Completa dos Laudos com LOG: Laudos 100% editaveis em editor rico com Toolbar (Negrito, Italico, Titulo H1/H2, Lista, Tabela). LOG imutavel de todas as alteracoes com usuario, data e hora. Botoes: Salvar Rascunho, Exportar PDF, Exportar DOCX, Submeter (UC-041).

### Sequencia de Eventos Validada

#### P01 — Acao: Usuario acessa aba "Laudos" — visualiza DataTable e botao "Novo Laudo"

![UC-039 P01 Acao](../runtime/screenshots/UC-039/P01_acao.png)

#### P01 — Resposta: Aba Laudos com DataTable e botao Novo Laudo

![UC-039 P01 Resposta](../runtime/screenshots/UC-039/P01_resp.png)

#### P02 — Acao: Clica "Novo Laudo" → modal abre com campos: edital, tipo=recurso, subtipo, empresa_alvo, template

![UC-039 P02 Acao](../runtime/screenshots/UC-039/P02_acao.png)

#### P02 — Resposta: Modal de novo laudo aberto com campos corretos

![UC-039 P02 Resposta](../runtime/screenshots/UC-039/P02_resp.png)

#### P03 — Acao: Usuario preenche campos e clica "Salvar" → tool_gerar_laudo_recurso gera secoes Juridica e Tecnica via DeepSeek

![UC-039 P03 Acao](../runtime/screenshots/UC-039/P03_acao.png)

#### P03 — Resposta: Laudo gerado com secoes Juridica e Tecnica

![UC-039 P03 Resposta](../runtime/screenshots/UC-039/P03_resp.png)

#### P04 — Acao: Laudo salvo com status "rascunho" → aparece na DataTable com tipo, subtipo e empresa_alvo

![UC-039 P04 Acao](../runtime/screenshots/UC-039/P04_acao.png)

![UC-039 P04 Loading](../runtime/screenshots/UC-039/P04_loading.png)

#### P04 — Resposta: Laudo exibido na DataTable com status rascunho

![UC-039 P04 Resposta](../runtime/screenshots/UC-039/P04_resp.png)

#### P05 — Acao: Icones de acao disponiveis: Eye (visualizar), Edit3 (editar), Trash2 (excluir), Download (exportar), Send (submeter)

![UC-039 P05 Acao](../runtime/screenshots/UC-039/P05_acao.png)

#### P05 — Resposta: Icones de acao disponiveis na DataTable

![UC-039 P05 Resposta](../runtime/screenshots/UC-039/P05_resp.png)

### Evidencias de Implementacao

- `POST /api/recursos` — app.py linha 13327, chama tool_gerar_laudo_recurso
- `tool_gerar_laudo_recurso` — tools.py linha 10491 (gera secoes juridica e tecnica)
- Frontend RecursosPage.tsx: aba Laudos, modal showNovoLaudoModal, SelectInput tipo=recurso/contra_razao, DataTable com badges de status, icones Eye/Edit3/Trash2/Download/Send

### Resultado da Validacao

**✅ APROVADO** — Modal abre com campos corretos, tipo "recurso" selecionavel com subtipos, laudo gerado contem secoes juridica e tecnica, status "rascunho" inicial, empresa_alvo visivel na DataTable.

---

## UC-040 — Gerar Laudo de Contra-Razao com IA {#uc-040}

**Modulo:** RecursosPage.tsx — Aba Laudos (tipo: contra_razao) | Backend: `POST /api/recursos` + `tool_gerar_contra_razao`

**✅ APROVADO**

### Requisitos Implementados

- **RF-044-08** — Geracao de Laudo de Contra-Razao: Sistema gera laudo de Contra-Razao com duas secoes principais: Secao de Defesa (rebater argumentos do recurso ponto-a-ponto, conformidade da proposta, base legal) e Secao de Ataque (irregularidades da proposta do recorrente, fundamentacao legal). Ambas as secoes incluem jurisprudencias.
- **RF-044-09** — Templates Distintos para Recurso e Contra-Razao: Templates filtrados por tipo "contra_razao" via crudList("recurso-templates"). Modal compartilhado com UC-039, diferenciado pelo campo tipo. Badge "contra_razao" diferenciado visualmente na DataTable.

### Sequencia de Eventos Validada

#### P01 — Acao: Usuario acessa aba Laudos — clica "Novo Laudo" e seleciona tipo "Contra-Razao"

![UC-040 P01 Acao](../runtime/screenshots/UC-040/P01_acao.png)

#### P01 — Resposta: Modal com tipo Contra-Razao selecionado

![UC-040 P01 Resposta](../runtime/screenshots/UC-040/P01_resp.png)

#### P02 — Acao: Usuario preenche: edital, subtipo, empresa recorrente (empresa_alvo) e template de contra-razao

![UC-040 P02 Acao](../runtime/screenshots/UC-040/P02_acao.png)

#### P02 — Resposta: Campos preenchidos com dados da contra-razao

![UC-040 P02 Resposta](../runtime/screenshots/UC-040/P02_resp.png)

#### P03 — Acao: Clica "Salvar" → tool_gerar_contra_razao gera Secao de Defesa e Secao de Ataque via DeepSeek

![UC-040 P03 Acao](../runtime/screenshots/UC-040/P03_acao.png)

![UC-040 P03 Loading](../runtime/screenshots/UC-040/P03_loading.png)

#### P03 — Resposta: Contra-razao gerada com secoes Defesa e Ataque

![UC-040 P03 Resposta](../runtime/screenshots/UC-040/P03_resp.png)

#### P04 — Acao: Contra-razao salva com badge "contra_razao" diferenciado na DataTable, status "rascunho"

![UC-040 P04 Acao](../runtime/screenshots/UC-040/P04_acao.png)

#### P04 — Resposta: Contra-razao exibida na DataTable com badge diferenciado

![UC-040 P04 Resposta](../runtime/screenshots/UC-040/P04_resp.png)

### Evidencias de Implementacao

- `POST /api/recursos` — app.py linha 13327 (mesmo endpoint do UC-039, tipo=contra_razao)
- `tool_gerar_laudo_recurso` — tools.py linha 10491 (gera secoes Defesa+Ataque quando tipo=contra_razao)
- Frontend RecursosPage.tsx: modal compartilhado, SelectInput tipo com opcao "contra_razao", badge diferenciado na DataTable

### Resultado da Validacao

**✅ APROVADO** — Tipo "contra_razao" selecionavel e diferenciado visualmente, laudo gerado contem secoes Defesa e Ataque, empresa_alvo (recorrente) registrada corretamente, status "rascunho" inicial.

---

## UC-041 — Submissao Assistida no Portal {#uc-041}

**Modulo:** RecursosPage.tsx — Aba Laudos (icone Send) | Backend: crudUpdate("recursos") para status "protocolado"

**✅ APROVADO**

### Requisitos Implementados

- **RF-044-12** — Submissao Assistida no Portal do Governo: Fluxo guiado em 3 passos para submissao de recurso ou contra-razao no portal externo (ComprasNet/gov.br). Passo 1: Checklist de validacao documental (6 itens: tamanho, formato, prazo, secoes, assinatura). Passo 2: Exportar documento + link para acessar portal. Passo 3: Registrar numero de protocolo → status atualizado para "protocolado" via crudUpdate. Rastreabilidade por data/hora de submissao.

### Sequencia de Eventos Validada

#### P01 — Acao: Usuario clica icone "Send" em laudo existente na DataTable → modal de submissao assistida abre

![UC-041 P01 Acao](../runtime/screenshots/UC-041/P01_acao.png)

#### P01 — Resposta: Modal de submissao assistida aberto

![UC-041 P01 Resposta](../runtime/screenshots/UC-041/P01_resp.png)

#### P02 — Acao: Passo 1 — Checklist de validacao: 6 itens verificados (tamanho, formato, prazo, secoes, assinatura)

![UC-041 P02 Acao](../runtime/screenshots/UC-041/P02_acao.png)

#### P02 — Resposta: Checklist com 6 itens validados exibido

![UC-041 P02 Resposta](../runtime/screenshots/UC-041/P02_resp.png)

#### P03 — Acao: Passo 2 — Usuario clica "Exportar" (DOCX/PDF) e "Acessar Portal" (window.open) → submete manualmente no gov.br

![UC-041 P03 Acao](../runtime/screenshots/UC-041/P03_acao.png)

#### P03 — Resposta: Documento exportado e portal externo aberto em nova aba

![UC-041 P03 Resposta](../runtime/screenshots/UC-041/P03_resp.png)

#### P04 — Acao: Passo 3 — Usuario digita numero de protocolo recebido → clica "Confirmar Protocolo"

![UC-041 P04 Acao](../runtime/screenshots/UC-041/P04_acao.png)

#### P04 — Resposta: Numero de protocolo registrado

![UC-041 P04 Resposta](../runtime/screenshots/UC-041/P04_resp.png)

#### P05 — Acao: Status atualizado para "protocolado" via crudUpdate → badge "protocolado" na DataTable

![UC-041 P05 Acao](../runtime/screenshots/UC-041/P05_acao.png)

#### P05 — Resposta: Badge "protocolado" exibido na DataTable

![UC-041 P05 Resposta](../runtime/screenshots/UC-041/P05_resp.png)

### Evidencias de Implementacao

- Frontend RecursosPage.tsx (1097 linhas): handleRegistrarSubmissao, modal showSubmissaoModal
- crudUpdate("recursos", id) para atualizar status para "protocolado" e registrar submissaoProtocolo
- Checklist de validacao pre-envio, botao Exportar, link Acessar Portal (window.open), campo submissaoProtocolo
- Nota: versao assistida (nao automatica) — portais gov.br nao oferecem API de submissao publica

### Resultado da Validacao

**✅ APROVADO** — Modal com 3 passos sequenciais, checklist funcional, exportacao de documento, link abre portal externo em nova aba, campo de protocolo valida preenchimento, status atualizado para "protocolado", badge exibido corretamente.

---

*facilicita.ia — Agente de Editais | Relatorio de Aceitacao Sprint 4 | Gerado em: 31/03/2026 | Requisitos base: requisitos_completosv6.md | UC-032 a UC-041 | 10 casos de uso — 100% aprovados*
