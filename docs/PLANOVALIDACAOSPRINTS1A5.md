# PLANO: PowerPoint Didático — Facilitia.ia Sprints 1 a 5

## Contexto

Criar um PowerPoint completo e didático que apresente o sistema Facilitia.ia aos validadores **antes** deles iniciarem os testes. O tom deve ser de **ensino**: cada slide explica ao validador o que ele vai encontrar, por que aquela funcionalidade existe, e o que observar. As screenshots dos testes Playwright são a evidência visual.

O plano também inclui instruções detalhadas para transformar o PPT em uma **apresentação narrada** usando o Google NotebookLM (Audio Overview).

---

## PARTE 1 — Tom e Linguagem

### Diretrizes de escrita

O PowerPoint NÃO é um relatório técnico — é uma **apresentação didática**. Cada slide deve:

- **Começar com uma pergunta ou contexto** ("O que acontece quando a empresa recebe um edital?", "Como o sistema decide se vale a pena participar?")
- **Explicar o PORQUÊ antes do O QUÊ** — o validador precisa entender a motivação de cada funcionalidade
- **Usar linguagem acessível** — evitar jargão técnico (não dizer "CRUD", dizer "cadastro completo com edição e exclusão")
- **Bullets curtos e diretos** — máximo 5 por slide, cada um com 1 linha
- **Cada screenshot com legenda explicativa** — "Nesta tela, o validador deve verificar que os 6 scores aparecem com cores (verde=alto, vermelho=baixo)"

### Estrutura narrativa

O PowerPoint segue uma **história**: o ciclo de vida de uma licitação do ponto de vista da empresa.

```
"A empresa existe" (Sprint 1)
  → "Ela descobre um edital" (Sprint 2)
    → "Ela calcula o preço e monta a proposta" (Sprint 3)
      → "Ela se defende juridicamente se necessário" (Sprint 4)
        → "Ela acompanha o resultado e gerencia contratos" (Sprint 5)
```

---

## PARTE 2 — Estrutura Slide a Slide

### Seção A: Abertura e Visão Geral (slides 1-5)

| Slide | Título | Conteúdo didático |
|---|---|---|
| 1 | **Facilitia.ia — Gestão Inteligente de Licitações** | Capa: nome, data (Abril 2026), "Guia para Validadores — Sprints 1 a 5". Subtítulo: "Este PowerPoint explica o que o sistema faz e o que você deve verificar em cada tela." |
| 2 | **A jornada de uma licitação** | Diagrama visual do ciclo: Empresa → Captação → Validação → Precificação → Proposta → Impugnação → Recursos → Follow-up → Contrato → CRM. "O sistema cobre TODAS estas etapas." |
| 3 | **Como o sistema está organizado** | 3 camadas: (1) Fundação (empresa, produtos, configurações), (2) Fluxo Comercial (11 etapas sequenciais), (3) Painéis transversais (CRM, KPIs, alertas). "Cada sprint construiu uma parte deste quebra-cabeça." |
| 4 | **Em números** | Infográfico: 79 casos de uso especificados, 60+ requisitos funcionais, 5 sprints entregues, 1.237 screenshots de evidência, 2 empresas de teste (CH Hospitalar + RP3X), 100% de aprovação nos testes automatizados. |
| 5 | **As duas empresas de teste** | "Testamos com 2 empresas reais para garantir que o sistema funciona em cenários diferentes." CH Hospitalar = equipamentos médicos hospitalares. RP3X = reagentes para diagnóstico in vitro. Dados distintos, mesmas funcionalidades. |

### Seção B: Como funciona a validação (slides 6-12)

| Slide | Título | Conteúdo didático |
|---|---|---|
| 6 | **O ciclo de validação: 3 documentos por sprint** | Diagrama: "Para cada sprint, existem 3 tipos de documento que se complementam." Casos de Uso (o que o sistema DEVE fazer) → Tutorial (como TESTAR manualmente) → Relatório (o que ACONTECEU na automação). "Você está recebendo os 3 para cada sprint." |
| 7 | **O documento de Requisitos (`requisitos_completosv7.md`)** | "Este é o documento mestre. Cada funcionalidade do sistema tem um código RF-XXX (Requisito Funcional). Por exemplo, RF-019 = buscar editais no PNCP. São 60+ requisitos, e cada caso de uso implementa um ou mais deles." Mostrar trecho da tabela RF↔Sprint. |
| 8 | **O que é um Caso de Uso?** | "Um caso de uso descreve UMA funcionalidade específica. Ele tem: pré-condições (o que precisa existir antes), sequência de eventos (o que o ator faz e o que o sistema responde), e assertions (como verificar que funcionou)." Mostrar exemplo visual de 1 UC com anotações. |
| 9 | **O que é um Tutorial?** | "O tutorial é o seu roteiro de teste. Ele contém TODOS os dados que você precisa digitar — não precisa inventar nada. Siga passo a passo, na ordem." Mostrar trecho de tutorial com destaque nos dados em `código`. Lembrar: "Sprint 1 antes da Sprint 2, e assim por diante." |
| 10 | **A validação automatizada (Playwright)** | "Além do teste manual, rodamos testes automáticos que simulam um humano clicando no sistema. Para cada passo, tiramos 2 screenshots: uma da AÇÃO (o que foi clicado) e uma da RESPOSTA (o que o sistema mostrou). Se a tela estiver vazia, o teste REPROVA." |
| 11 | **O Relatório de Validação** | "Após a execução automática, geramos um relatório com: tabela de cada UC (aprovado/reprovado), as screenshots correspondentes, e os assertions que verificaram se havia dados reais na tela." Mostrar tabela exemplo. |
| 12 | **O Relatório de Aceitação** | "Este é o parecer final de cada sprint. Ele lista todos os requisitos (RF) atendidos, as evidências e a conclusão: APROVADO ou com ressalvas. Você pode usá-lo como checklist." |

### Seção C: Sprint 1 — A Fundação (slides 13-21)

**Contexto narrativo:** "Antes de participar de qualquer licitação, a empresa precisa existir no sistema com seus dados, produtos e configurações."

| Slide | Título | O que mostrar | Screenshot sugerida |
|---|---|---|---|
| 13 | **Sprint 1: Construindo a Fundação** | Capa da sprint. "17 casos de uso que cobrem: cadastro da empresa, portfolio de produtos e todas as configurações necessárias." RF-001 a RF-018. | — |
| 14 | **Cadastro da empresa (UC-F01, UC-F02)** | "O primeiro passo é cadastrar a empresa: CNPJ, razão social, endereço, contatos. O sistema busca dados automaticamente pelo CNPJ." Bullet: área padrão, contatos múltiplos. | UC-001/P01_resp |
| 15 | **Documentos e certidões (UC-F03, UC-F04)** | "A empresa precisa ter documentos em dia para participar. O sistema controla validade, alerta quando vence, e busca certidões automaticamente." | UC-003/melhor_resp, UC-004/melhor_resp |
| 16 | **Responsáveis técnicos (UC-F05)** | "Quem assina pela empresa? O sistema mantém o cadastro de responsáveis técnicos e administrativos que a IA pode consultar ao montar propostas." | UC-005/melhor_resp |
| 17 | **Portfolio de produtos (UC-F06, UC-F07)** | "O coração do sistema: os produtos que a empresa vende. Podem ser cadastrados manualmente, via CSV, ou pela IA que consulta a ANVISA e preenche automaticamente." | UC-006/melhor_resp, UC-007/melhor_resp |
| 18 | **Edição e IA nos produtos (UC-F08..F13)** | "Cada produto tem especificações técnicas, NCM, classificação e status no funil (cadastrado→qualificado→ofertado→vencedor). A IA pode reprocessar especificações a partir de manuais técnicos." | UC-008 ou UC-009 ou UC-012 (melhores) |
| 19 | **Verificação de completude (UC-F11)** | "O sistema audita se todas as especificações obrigatórias do produto estão preenchidas antes de permitir que ele seja usado em propostas." | UC-011/melhor_resp |
| 20 | **Pesos GO/NO-GO (UC-F14)** | "Aqui a empresa define o que é mais importante para ela: técnica? preço? documentação? São 6 dimensões com pesos configuráveis que a IA usa para pontuar cada edital." | UC-014/melhor_resp |
| 21 | **Parametrizações gerais (UC-F15..F17)** | "Custos fixos, regiões de atuação, fontes de busca (PNCP, Brave), palavras-chave, NCMs de interesse, notificações. Tudo configurável." | UC-015 ou UC-016 ou UC-017 |

### Seção D: Sprint 2 — Captação e Validação (slides 22-30)

**Contexto narrativo:** "Agora a empresa está cadastrada. O próximo passo é DESCOBRIR editais que interessam e AVALIAR se vale participar."

| Slide | Título | O que mostrar | Screenshot |
|---|---|---|---|
| 22 | **Sprint 2: Encontrar e avaliar oportunidades** | Capa. "13 casos de uso. O sistema busca editais no Portal Nacional (PNCP), calcula scores em 6 dimensões e recomenda GO ou NO-GO." RF-019 a RF-037. | — |
| 23 | **Busca de editais (UC-CV01)** | "O usuário digita um termo (ex: 'hemograma'), escolhe filtros (estado, modalidade), e o sistema consulta o PNCP. Cada edital recebe 6 scores automáticos com cores." | UC-CV01 ou busca (melhor) |
| 24 | **Painel de detalhes (UC-CV02)** | "Ao clicar num edital, abre um painel lateral com TUDO: scores detalhados, itens do edital, órgão, valor estimado, prazo. É a visão completa antes de decidir." | UC-CV02 |
| 25 | **Salvar e definir estratégia (UC-CV03, UC-CV04)** | "Gostou do edital? Salve e defina sua intenção: participar ou observar. Configure margem e estratégia comercial." | UC-CV03 ou UC-CV04 |
| 26 | **Exportar e monitorar (UC-CV05, UC-CV06)** | "Exporte resultados em CSV/PDF. Configure monitoramentos automáticos para receber alertas de novos editais sem precisar buscar todo dia." | UC-CV05 ou UC-CV06 |
| 27 | **Scores e decisão GO/NO-GO (UC-CV07, UC-CV08)** | "O momento crucial: a IA calcula 6 scores (técnico, comercial, jurídico, logístico, documental, complexidade) e recomenda GO ou NO-GO com justificativa escrita." | UC-CV08 (scores visíveis) |
| 28 | **Importação de itens e lotes (UC-CV09)** | "O sistema importa os itens do edital diretamente do PNCP e agrupa automaticamente em lotes via IA." | UC-CV09 |
| 29 | **Análises avançadas (UC-CV10..CV12)** | "Confronto automático dos documentos exigidos vs documentos da empresa. Análise de riscos, recorrência do órgão e histórico de compras." | UC-CV10 ou UC-CV11 (melhor) |
| 30 | **Chat com IA na validação (UC-CV13)** | "O validador pode conversar com a IA: 'Resuma este edital', 'Quais os riscos?', 'Recomende ação'. Respostas baseadas nos dados reais do edital." | UC-CV13 |

### Seção E: Sprint 3 — Precificação e Proposta (slides 31-40)

**Contexto narrativo:** "O edital passou no GO/NO-GO. Agora é preciso CALCULAR O PREÇO e MONTAR A PROPOSTA."

| Slide | Título | O que mostrar |
|---|---|---|
| 31 | **Sprint 3: Precificação em 6 camadas + Proposta automática** | Capa. "19 casos de uso. O preço é construído camada por camada (A→F), e a proposta técnica é gerada automaticamente pela IA." RF-039 a RF-041. |
| 32 | **Organização por lotes (UC-P01)** | "Os itens do edital são organizados em lotes com parâmetros técnicos. Cada lote pode ter sua estratégia de preço." |
| 33 | **Seleção inteligente de portfolio (UC-P02) + Volumetria (UC-P03)** | "A IA sugere quais produtos do portfolio atendem cada item do edital. Depois calcula as quantidades técnicas necessárias." |
| 34 | **Custos ERP e tributário (UC-P04)** | "Base de custos integrada: custo do produto + frete + impostos (regras por NCM). Tudo calculado automaticamente." |
| 35 | **Preço base e referência — Camadas B e C (UC-P05, UC-P06)** | "Camada B: 3 modos de input (manual, custos+markup, histórico). Camada C: valor de referência do edital para comparação." |
| 36 | **Lances e estratégia — Camadas D/E (UC-P07, UC-P08)** | "Primeiro lance (D) e lance mínimo (E). Estratégia: agressiva (margem menor, chance maior) ou conservadora." |
| 37 | **Histórico e comodato (UC-P09, UC-P10)** | "Camada F: preços históricos de editais similares com gráficos. Gestão de equipamentos em comodato com prazos." |
| 38 | **Pipeline IA + Relatório (UC-P11, UC-P12)** | "A IA analisa TUDO de uma vez e gera um relatório consolidado com todas as 6 camadas e recomendação." |
| 39 | **Motor de proposta técnica (UC-R01..R05)** | "O sistema gera a proposta técnica automaticamente com dados do edital e portfolio. Inclui auditoria ANVISA (semáforo regulatório) e checklist documental." |
| 40 | **Exportação e submissão (UC-R06, UC-R07)** | "Dossiê completo exportado em PDF/DOCX/ZIP. Status rastreado: rascunho → enviada → aceita." |

### Seção F: Sprint 4 — Defesa Jurídica (slides 41-47)

**Contexto narrativo:** "Nem todo edital é justo. Às vezes é preciso IMPUGNAR. E quando a empresa ganha, pode receber RECURSOS que precisa responder."

| Slide | Título | O que mostrar |
|---|---|---|
| 41 | **Sprint 4: Defesa jurídica assistida por IA** | Capa. "11 casos de uso. Análise de conformidade legal (Lei 14.133/2021), geração de petições, recursos e contra-razões — tudo com assistência da IA." RF-043, RF-044. |
| 42 | **Validação legal do edital (UC-I01, UC-I02)** | "A IA analisa o edital contra a legislação vigente e classifica inconsistências em ALTA/MÉDIA/BAIXA gravidade. Sugere esclarecimento ou impugnação." |
| 43 | **Gerar petição de impugnação (UC-I03, UC-I04)** | "A IA gera a minuta com fundamentação legal completa (artigos, jurisprudências). O usuário também pode fazer upload de petição redigida externamente." |
| 44 | **Controle de prazo (UC-I05)** | "Countdown visual: quantos dias faltam para impugnar. Alertas automáticos quando o prazo é crítico." |
| 45 | **Monitorar recursos e analisar concorrente (UC-RE01..RE03)** | "Após o resultado, o sistema monitora a janela de recurso. Se precisar, analisa a proposta vencedora para identificar pontos fracos. Chat jurídico interativo para perguntas específicas." |
| 46 | **Laudos de recurso e contra-razão (UC-RE04, UC-RE05)** | "Geração automática de laudo de recurso (quando a empresa perdeu) ou de contra-razão (quando a empresa ganhou e precisa se defender). Motivações estruturadas por categoria." |
| 47 | **Submissão assistida (UC-RE06)** | "O sistema auxilia o preenchimento nos portais da administração pública." |

### Seção G: Sprint 5 — Pós-venda e CRM (slides 48-63)

**Contexto narrativo:** "A licitação acabou. Agora começa a EXECUÇÃO: contratos, empenhos, entregas. E o CRM acompanha TUDO numa visão gerencial."

| Slide | Título | O que mostrar |
|---|---|---|
| 48 | **Sprint 5: Execução, Contratos e CRM** | Capa. "19 casos de uso — a maior sprint. Cobre follow-up de resultados, atas de pregão, gestão de contratos com empenhos, e um CRM completo com pipeline de 13 stages." |
| 49 | **Follow-up de resultados (UC-FU01..FU03)** | "Registrar vitória ou derrota. Configurar alertas para marcos da execução. Calcular score logístico de desempenho." |
| 50 | **Atas de pregão (UC-AT01..AT03)** | "Buscar atas diretamente no PNCP. Extrair vencedor e valor de atas em PDF. Dashboard de atas consultadas." |
| 51 | **Contratos — cadastro e entregas (UC-CT01..CT03)** | "Cadastrar contrato com dados básicos. Registrar entregas com NF. Cronograma previsto×realizado com alertas de atraso." |
| 52 | **Contratos — aditivos e designações (UC-CT04..CT06)** | "Gestão de aditivos contratuais. Designar gestor e fiscal. Controle de saldo ARP (autorizado não recebido)." |
| 53 | **Gestão de Empenhos (UC-CT07)** | "DESTAQUE: Tabela de empenhos com número EMPH-2026, valor, stat cards (empenhado/faturado/saldo). Itens incluem calibradores SEM VALOR com alerta visual e limite de consumo %. Botão Novo Empenho." Screenshot: UC-CT07/P03_resp |
| 54 | **Auditoria Empenho×Fatura×Entrega (UC-CT08)** | "Cruzamento automático: quanto foi empenhado vs faturado vs pago vs entregue. Detecta divergências (ex: R$24.000 de diferença) com alerta laranja. Exportar CSV." Screenshot: UC-CT08/P03_resp |
| 55 | **Contratos a Vencer — 5 tiers (UC-CT09)** | "Cards organizados em 5 faixas: vence em 30 dias, 90 dias, em tratativa, renovado, não renovado. Cada card tem botão de ação (Iniciar Tratativa, Marcar Renovado)." Screenshot: UC-CT09/P03_resp |
| 56 | **KPIs de Execução (UC-CT10)** | "6 stat cards numéricos: contratos ativos, vence 30d, vence 90d, em tratativa, renovados, não renovados. Filtro de período." Screenshot: UC-CT10/P03_resp |
| 57 | **Contratado × Realizado (UC-CR01..CR03)** | "Dashboard comparando valores contratados vs recebidos. Pedidos em atraso destacados. Alertas multi-tier por gravidade." |
| 58 | **Pipeline CRM — 13 stages (UC-CRM01)** | "O CORAÇÃO do CRM: kanban horizontal com 13 colunas, de 'Captado Não Divulgado' até 'Resultados Definitivos'. Cada card mostra edital, órgão e valor. Select para mover entre stages." Screenshot: UC-CRM01/P03_resp |
| 59 | **Parametrizações CRM (UC-CRM02)** | "3 sub-abas configuráveis: Tipos de Edital (8), Agrupamentos de Portfolio (12), Motivos de Derrota (7). A empresa personaliza conforme sua realidade." Screenshot: UC-CRM02/P03_resp |
| 60 | **Mapa geográfico (UC-CRM03)** | "Distribuição de editais por UF. Cards mostrando quantidade, valor total, leads potenciais. Filtro por região." Screenshot: UC-CRM03/P03_resp |
| 61 | **Agenda com urgência (UC-CRM04)** | "Lista de compromissos com datas e badges de urgência: CRÍTICA (vermelho), ALTA (laranja), NORMAL (azul), BAIXA. Inclui impugnações, recursos, reuniões, renovações." Screenshot: UC-CRM04/P03_resp |
| 62 | **KPIs CRM (UC-CRM05)** | "8 stat cards: Total editais, Leads, Propostas, Ganhos, Perdidos. Taxas de conversão (%), ticket médio, tempo médio. Todos com números reais." Screenshot: UC-CRM05/P03_resp |
| 63 | **Decisões: não-participação e perda (UC-CRM06, UC-CRM07)** | "Registro estruturado de: por que NÃO participou (motivo + justificativa) e por que PERDEU (categoria + contra-razão). Tabela com 4+ decisões seed. Insumo para melhoria contínua." Screenshot: UC-CRM06/P04_resp |

### Seção H: Encerramento (slides 64-67)

| Slide | Título | Conteúdo |
|---|---|---|
| 64 | **Resumo de conformidade** | Tabela consolidada: Sprint × Total UCs × RFs cobertos × Status. Todas as 5 sprints APROVADAS com 100% de testes passando. |
| 65 | **O que vem pela frente** | Sprint 6: CRM leads + PerdasPage + ConcorrênciaPage. Sprint 7: Flags, Monitoria, Auditoria, SMTP. Sprint 8-10: Mercado, Analytics, Dispensas, Lances. |
| 66 | **Como acessar para validar** | URL: http://192.168.1.115:5179. Credenciais: valida1@valida.com.br/123456 (CH Hospitalar) e valida2@valida.com.br/123456 (RP3X). Backend: porta 5008. Documentos em `docs/`. |
| 67 | **Obrigado — Facilitia.ia** | Slide final com contato e agradecimento. |

**Total: ~67 slides**

---

## PARTE 3 — Referências Cruzadas

Cada slide de UC contém no rodapé (fonte 10pt, cinza):
```
UC-XXX | RF-YYY | Doc: [nome].md | Tutorial: tutorialsprintN-1.md | Validação: RESULTADO VALIDACAO SPRINTN.md
```

| Faixa de UCs | RFs | Documento de Casos de Uso | Tutorial | Relatório |
|---|---|---|---|---|
| UC-F01..F17 | RF-001..018 | CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V2.md | tutorialsprint1-1/2.md | relatorio_aceitacao_sprint1_2.md |
| UC-CV01..CV13 | RF-019..037 | CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V2.md | tutorialsprint2-1/2.md | RESULTADO VALIDACAO SPRINT2.md |
| UC-P01..R07 | RF-039..041 | CASOS DE USO PRECIFICACAO E PROPOSTA V2.md | tutorialsprint3-1/2.md | RESULTADO VALIDACAO SPRINT3.md |
| UC-I01..RE06 | RF-043..044 | CASOS DE USO RECURSOS E IMPUGNACOES V2.md | tutorialsprint4-1/2.md | RESULTADO VALIDACAO SPRINT4.md |
| UC-FU01..CRM07 | RF-017..052 | CASOS DE USO SPRINT5 V3.md | tutorialsprint5-1/2.md | RESULTADO VALIDACAO SPRINT5.md |

---

## PARTE 4 — Geração Técnica do PowerPoint

### Ferramenta: python-pptx

Script `gerar_ppt_validacao.py`:
- Formato 16:9 widescreen
- **Tema escuro** (#0f172a fundo — igual ao sistema) com texto branco
- Títulos 28pt, bullets 16pt, rodapés 10pt cinza
- Screenshot redimensionada (max 70% da área do slide)
- Slides de separação de sprint com cor distinta:
  - Sprint 1: azul (#1e40af)
  - Sprint 2: verde (#059669)
  - Sprint 3: roxo (#7c3aed)
  - Sprint 4: vermelho (#dc2626)
  - Sprint 5: laranja (#ea580c)

### Saída
- `docs/APRESENTACAO_VALIDACAO_SPRINTS_1A5.pptx`
- `docs/APRESENTACAO_VALIDACAO_SPRINTS_1A5.pdf` (via LibreOffice)

---

## PARTE 5 — Transformar em Apresentação Narrada com NotebookLM

### O que é o NotebookLM

O Google NotebookLM (https://notebooklm.google.com) é uma ferramenta gratuita do Google que lê documentos e gera automaticamente um **podcast narrado** com dois apresentadores IA que discutem o conteúdo. É ideal para transformar o PowerPoint em um áudio explicativo que o validador pode ouvir antes de testar.

### Passo 1 — Preparar os arquivos

Exportar o PPTX como PDF (NotebookLM não aceita PPTX diretamente):
```bash
libreoffice --headless --convert-to pdf docs/APRESENTACAO_VALIDACAO_SPRINTS_1A5.pptx --outdir docs/
```

Preparar fontes complementares (dão contexto mais rico à narração):
- `docs/requisitos_completosv7.md` → converter para PDF ou fazer upload como TXT
- `docs/LEIAME.md` → upload como TXT
- 1 tutorial representativo (ex: `docs/tutorialsprint5-1.md`)

### Passo 2 — Criar o Notebook

1. Acessar https://notebooklm.google.com
2. Login com conta Google
3. Clicar **"+ New Notebook"** (ou "Novo Notebook")
4. Dar nome: "Facilitia.ia — Apresentação Sprints 1-5"

### Passo 3 — Fazer upload das fontes

1. No painel esquerdo **"Sources"**, clicar **"+ Add source"**
2. Selecionar **"Upload files"**
3. Fazer upload de:
   - `APRESENTACAO_VALIDACAO_SPRINTS_1A5.pdf` (fonte principal)
   - `requisitos_completosv7.md` (contexto dos RFs)
   - `LEIAME.md` (contexto do processo)
   - `tutorialsprint5-1.md` (exemplo de tutorial)
4. Aguardar processamento (~30 segundos por arquivo)

### Passo 4 — Gerar o Audio Overview

1. No canto superior direito, clicar na aba **"Studio"** (ou "Notebook guide")
2. Localizar o card **"Audio Overview"**
3. **ANTES de gerar**, clicar em **"Customize"** e colar o seguinte texto:

```
Este é o sistema Facilitia.ia, uma plataforma de gestão de licitações públicas
para empresas do setor de saúde e equipamentos médicos.

O público desta apresentação são VALIDADORES que vão testar o sistema pela
primeira vez. Explique de forma didática e acessível:

1. Como funciona o processo de validação (3 documentos por sprint)
2. O que cada sprint cobre, na sequência da jornada de uma licitação
3. As funcionalidades mais importantes de cada sprint, com exemplos concretos
4. O uso de IA (DeepSeek) na análise de editais, precificação e defesa jurídica
5. O CRM com pipeline de 13 stages que acompanha todo o ciclo

As duas empresas de teste são: CH Hospitalar (equipamentos médicos) e RP3X
(reagentes para diagnóstico). Cada sprint constrói sobre a anterior.

Fale em português brasileiro. Tom amigável e didático, como se estivesse
explicando para alguém que nunca viu o sistema antes.
```

4. Clicar **"Generate"**
5. Aguardar geração (~2-5 minutos)
6. Duração esperada: **8-15 minutos** de áudio narrado

### Passo 5 — Baixar e usar o áudio

1. Após geração, clicar no **ícone de download** (seta para baixo) no player de áudio
2. O arquivo é baixado em formato **MP3**
3. **Opções de uso:**
   - **Enviar para os validadores** como áudio complementar ao PPT
   - **Inserir no PowerPoint** como narração: em cada slide, Inserir → Áudio → selecionar trecho
   - **Publicar como link** se o notebook for compartilhado (Settings → Share)

### Passo 6 — Alternativa: narração por sprint (mais granular)

Se preferir áudios separados por sprint (em vez de 1 único podcast):

1. No NotebookLM, usar o **chat** (não o Audio Overview)
2. Digitar prompts específicos:
   - "Explique a Sprint 1 como se fosse uma aula para um validador. Foque no que ele deve verificar nas telas de cadastro de empresa e portfolio."
   - "Explique a Sprint 3 detalhando as 6 camadas de precificação e como a proposta técnica é gerada."
   - "Explique o CRM da Sprint 5, especialmente o pipeline de 13 stages e os KPIs."
3. Copiar as respostas e usar um TTS (text-to-speech) como:
   - Google Cloud TTS (pt-BR, voz Neural)
   - ElevenLabs (voz natural)
   - Ou o próprio recurso de leitura do PowerPoint

### Dica: slide oculto com roteiro de narração

Incluir como **último slide (oculto)** no PPT um roteiro textual que o NotebookLM pode usar como guia adicional:

```
ROTEIRO DE NARRAÇÃO — FACILITIA.IA

INTRODUÇÃO:
O Facilitia.ia é um sistema completo de gestão de licitações que cobre desde
a descoberta de um edital até a execução do contrato e o CRM pós-venda.
Ele foi desenvolvido em 5 sprints, cada uma construindo sobre a anterior.

SPRINT 1 — FUNDAÇÃO:
Cadastro da empresa, portfolio de produtos (com IA que consulta ANVISA),
e todas as configurações: pesos de score, custos, regiões, fontes de busca.

SPRINT 2 — CAPTAÇÃO:
Busca automática no PNCP, scores em 6 dimensões (técnico, comercial,
jurídico, logístico, documental, complexidade), decisão GO/NO-GO com IA.

SPRINT 3 — PREÇO E PROPOSTA:
6 camadas de precificação (A=volumetria → F=histórico), motor de proposta
técnica com IA, auditoria ANVISA, checklist documental, exportação de dossiê.

SPRINT 4 — DEFESA JURÍDICA:
Análise legal do edital, geração de petição de impugnação com fundamentação,
recursos e contra-razões — tudo assistido por IA com base na Lei 14.133/2021.

SPRINT 5 — PÓS-VENDA:
Follow-up (vitória/derrota), atas de pregão, gestão de contratos com empenhos
(incluindo itens sem valor com alerta), auditoria cruzada, contratos a vencer
em 5 tiers, CRM com pipeline de 13 stages, parametrizações, mapa por UF,
agenda com urgências, KPIs, decisões de não-participação e perda.

MENSAGEM FINAL:
O validador deve seguir os tutoriais na ordem (Sprint 1 → 5), usando os
dados fornecidos. Cada tela deve mostrar dados reais — se algo estiver
vazio, reportar como problema.
```

---

## PARTE 6 — Verificação

- [ ] PPT gerado com ~67 slides, tema escuro, screenshots reais
- [ ] Tom didático em TODOS os slides (perguntas, contexto, linguagem acessível)
- [ ] Referências cruzadas RF↔UC no rodapé de cada slide
- [ ] PDF exportado para NotebookLM
- [ ] Áudio narrado gerado no NotebookLM (~8-15 min)
- [ ] Arquivo salvo: `docs/APRESENTACAO_VALIDACAO_SPRINTS_1A5.pptx`
- [ ] Plano salvo: `docs/PLANOVALIDACAOSPRINTS1A5.md`

---

## Arquivos envolvidos

| Arquivo | Ação |
|---|---|
| `gerar_ppt_validacao.py` | NOVO — script Python (python-pptx) |
| `docs/APRESENTACAO_VALIDACAO_SPRINTS_1A5.pptx` | NOVO — saída |
| `docs/APRESENTACAO_VALIDACAO_SPRINTS_1A5.pdf` | NOVO — para NotebookLM |
| `docs/PLANOVALIDACAOSPRINTS1A5.md` | NOVO — cópia deste plano |
| `runtime/screenshots/UC-*/` | READ — fonte de imagens |
| `docs/requisitos_completosv7.md` | READ — referência RFs |
| `docs/CASOS DE USO *.md` | READ — fonte de UCs |
| `docs/LEIAME.md` | READ — processo de validação |
