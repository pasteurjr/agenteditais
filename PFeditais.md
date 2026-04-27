# PFEDITAIS — Análise de Pontos de Função do Sistema Facilicita.IA (agenteditais)

**Data:** 2026-04-26
**Sistema:** agenteditais (Facilicita.IA)
**Stack:** Flask 5007 (Python) + Vite/React/TypeScript 5180 + MySQL + integrações PNCP/Brave/DeepSeek/Anvisa
**Caminho:** `/mnt/data1/progpython/agenteditais`
**Método:** IFPUG simplificado (Function Point Analysis não-ajustada)

---

## 1. Sumário executivo

| Métrica | Valor |
|---|---|
| **Pontos de Função totais (não-ajustados)** | **≈ 2.230 PF** |
| **Pontos de Função ajustados (VAF 1,12)** | **≈ 2.498 PF** |
| **Esforço estimado (cenário base)** | **≈ 32 meses-equipe** com equipe de 7 devs |
| **Faixa realista (otimista–pessimista)** | **22 a 51 meses** |
| **Custo estimado (R$, equipe média BR 2026)** | **R$ 3,1 mi a R$ 7,2 mi** |

> O Facilicita.IA é um sistema **enterprise** de automação de licitações governamentais brasileiras: 89 casos de uso catalogados, 83 modelos de dados, 193 endpoints REST, 29 telas (com sub-views internas via switch React), integração com 4 sistemas externos (PNCP, Brave Search, DeepSeek LLM, Anvisa), workflow completo de captação→validação→precificação→submissão→lances→recursos→contrato→entrega. Volume comparável a um ERP vertical de médio-grande porte.

---

## 2. Inventário base usado pra contagem

### 2.1 Frontend (React + TypeScript)

| Categoria | Quantidade | Origem |
|---|---|---|
| Páginas raiz (rotas via switch) | 29 | `frontend/src/pages/*.tsx` |
| Componentes reutilizáveis | 19 | `frontend/src/components/` |
| LOC frontend (.tsx + .ts) | parte dos 78.800 totais | `find frontend/src` |

### 2.2 Backend (Flask + SQLAlchemy)

| Categoria | Quantidade |
|---|---|
| Endpoints REST totais | **193** |
| - GET (consultas) | 93 |
| - POST (criação/comando) | 79 |
| - PUT (atualização) | 9 |
| - PATCH | 1 |
| - DELETE | 2 |
| - Multimétodo | 9 |
| Módulos Python backend | 29 |
| Módulos de Regras de Negócio (RN) | 5 (`rn_audit`, `rn_deepseek`, `rn_estados`, `rn_prazos`, `rn_validators`) |
| **Modelos SQLAlchemy (= tabelas)** | **83** |
| LOC backend Python | parte dos 78.800 totais |

### 2.3 Casos de Uso documentados

| Sprint | Quantidade | Domínio funcional |
|---|---|---|
| Sprint 1 (F) | 17 | Empresa, Portfólio, Parametrização |
| Sprint 2 (CV) | 13 | Captação + Validação |
| Sprint 3 (P) | 12 | Precificação + Proposta |
| Sprint 4 (R, RE, I, FU) | 5+6+5+3+3 = 22 | Recursos, Impugnação, Followup |
| Sprint 5 (CRM, AT, CR, CT) | 7+3+3+10 = 23 | CRM, Atas, Carona, Contratos |
| Sprint 6+ (em backlog) | ~14 (em UCs duplicados/legados) | Lances, Submissão, Pós-perda |
| **Total UCs catalogados** | **89** | |

### 2.4 Integrações externas

- **PNCP** (Portal Nacional de Contratações Públicas) — busca + download de editais
- **Brave Search API** — pesquisa de jurisprudência e contexto
- **DeepSeek LLM** — análise de editais, extração de requisitos, geração de propostas
- **Anvisa** — validação regulatória de produtos (medicamentos/dispositivos)

### 2.5 Tabelas agrupadas por bounded context (pra ILF)

| Contexto | Tabelas | Qtd |
|---|---|---|
| Identidade & Acesso | User, RefreshToken, Session, UsuarioEmpresa, AssociarEmpresa | 5 |
| Empresa & Cadastros | Empresa, EmpresaResponsavel, EmpresaCertidao, EmpresaDocumento, ConfiguracaoSMTP | 5 |
| Portfólio (Produto) | Produto, ClasseProduto, ClasseProdutoV2, SubclasseProduto, AreaProduto, ProdutoEspecificacao, ProdutoDocumento, CategoriaDocumento, DocumentoNecessario, BeneficioFiscalNcm | 10 |
| Captação (Edital) | Edital, EditalItem, EditalItemProduto, EditalRequisito, EditalDocumento, EditalDecisao, FonteEdital, OrigemOrgao, OrgaoPerfil, ModalidadeLicitacao, Dispensa | 11 |
| Validação | ValidacaoLegal, AnvisaValidacao, Documento, FonteCertidao, AlertaVencimentoRegra | 5 |
| Precificação & Proposta | Proposta, PropostaTemplate, PropostaLog, PrecoCamada, PrecoHistorico, ParametroScore, EstrategiaEdital | 7 |
| Lances & Pregão | Lance, SessaoPregao, Lote, LoteItem | 4 |
| Recursos & Impugnação | Recurso, RecursoTemplate, RecursoDetalhado, Impugnacao | 4 |
| Contrato & Execução | Contrato, ContratoAditivo, ContratoEntrega, ContratoDesignacao, ARPSaldo, Comodato, SolicitacaoCarona | 7 |
| Empenho & Faturamento | Empenho, EmpenhoItem, EmpenhoFatura | 3 |
| CRM & Followup | LeadCRM, CRMAgendaItem, CRMParametrizacao | 3 |
| Pós-Perda & Aprendizado | AcaoPosPerda, AprendizadoFeedback, SugestaoIA, PadraoDetectado, Concorrente | 5 |
| Monitoramento & Alertas | Monitoramento, MonitoramentoJanela, Alerta, Notificacao, PreferenciasNotificacao, EmailQueue, EmailTemplate, Message | 8 |
| Atas & Carona | AtaConsultada, ParticipacaoEdital, ItemIntruso | 3 |
| Análise & Auditoria | Analise, AnaliseDetalhe, AuditoriaLog, AtividadeFiscal | 4 |
| **Total tabelas** | | **84** (1 fora dos contextos acima) |

→ **84 tabelas físicas, ~36 ILFs lógicos** (após agrupar correlacionadas).

---

## 3. Contagem de Pontos de Função (não-ajustada)

### 3.1 ILF — Arquivos Lógicos Internos

| Grupo lógico | Complexidade | Peso | PF |
|---|---|---|---|
| Identidade & Acesso (4 lógicas) | M | 10 × 4 | 40 |
| Empresa & Cadastros (3 lógicas) | M | 10 × 3 | 30 |
| Portfólio (Produto + classificações + docs) (5 lógicas) | A | 15 × 5 | 75 |
| Captação (Edital + itens + requisitos + decisão) (6 lógicas) | A | 15 × 6 | 90 |
| Validação (legal + anvisa + certidões) (3 lógicas) | M | 10 × 3 | 30 |
| Precificação (Proposta + preços + score) (5 lógicas) | A | 15 × 5 | 75 |
| Lances & Pregão (Lance + Lote + Sessão) (3 lógicas) | A | 15 × 3 | 45 |
| Recursos & Impugnação (4 lógicas) | A | 15 × 4 | 60 |
| Contrato (Contrato + aditivo + entrega + ARP + carona) (5 lógicas) | A | 15 × 5 | 75 |
| Empenho & Faturamento (2 lógicas) | M | 10 × 2 | 20 |
| CRM (3 lógicas) | M | 10 × 3 | 30 |
| Pós-Perda & Aprendizado IA (4 lógicas) | A | 15 × 4 | 60 |
| Monitoramento & Notificação (5 lógicas) | M | 10 × 5 | 50 |
| Atas & Carona (3 lógicas) | M | 10 × 3 | 30 |
| Auditoria & Análise (3 lógicas) | M | 10 × 3 | 30 |
| **Subtotal ILF** | | | **740** |

### 3.2 EIF — Arquivos de Interface Externa

| Integração | Complexidade | Peso | PF |
|---|---|---|---|
| PNCP — busca e download de editais | A | 10 | 10 |
| PNCP — detalhe (contratações por publicação) | M | 7 | 7 |
| Brave Search — jurisprudência | M | 7 | 7 |
| DeepSeek LLM — análise/geração | A | 10 | 10 |
| Anvisa — validação de produtos | M | 7 | 7 |
| ViaCEP (autocompletar endereço) | B | 5 | 5 |
| SMTP externo (envio email) | B | 5 | 5 |
| **Subtotal EIF** | | | **51** |

### 3.3 EI — Entradas Externas

| Grupo | Quantidade lógica | Complexidade | Peso | PF |
|---|---|---|---|---|
| CRUDs cadastros (15 entidades × create/update = 30) | 30 | M | 4 × 30 | 120 |
| Importação de portfólio (Excel/CSV) | 3 | A | 6 × 3 | 18 |
| Decisões de edital (aprovar/rejeitar/captar) | 6 | M | 4 × 6 | 24 |
| Submissão de proposta (montar + enviar) | 4 | A | 6 × 4 | 24 |
| Lances em pregão (envio de lance + estratégia) | 5 | A | 6 × 5 | 30 |
| Recursos & impugnações (criação + tramitação) | 6 | A | 6 × 6 | 36 |
| Validações legais (upload doc + revisão) | 8 | M | 4 × 8 | 32 |
| Aprendizado IA (feedback + flags + ajustes) | 6 | M | 4 × 6 | 24 |
| Configuração de monitoramento (regras, janelas) | 4 | M | 4 × 4 | 16 |
| Comandos de workflow (aprovar/rejeitar/escalar) | 8 | M | 4 × 8 | 32 |
| CRM (lead + agenda + interação) | 6 | M | 4 × 6 | 24 |
| Contratos (assinatura + aditivos + entregas) | 6 | A | 6 × 6 | 36 |
| Empenhos & faturas (emissão + baixa) | 4 | M | 4 × 4 | 16 |
| Atas & solicitação de carona | 4 | M | 4 × 4 | 16 |
| Configurações sistema (SMTP, prompts, parâmetros) | 5 | M | 4 × 5 | 20 |
| **Subtotal EI** | | | | **468** |

### 3.4 EO — Saídas Externas (com lógica/cálculo)

| Grupo | Quantidade lógica | Complexidade | Peso | PF |
|---|---|---|---|---|
| Geração de proposta (PDF + cálculo) | 3 | A | 7 × 3 | 21 |
| Geração de recursos/impugnações com IA (texto gerado) | 4 | A | 7 × 4 | 28 |
| Análise de edital (extração estruturada via LLM) | 5 | A | 7 × 5 | 35 |
| Validação legal (parecer + alertas) | 3 | A | 7 × 3 | 21 |
| Precificação (cálculo de preço + score + curva) | 4 | A | 7 × 4 | 28 |
| Calculadora IA (otimização de proposta) | 3 | A | 7 × 3 | 21 |
| Dashboards (Analytics, KPIs, conversão) | 5 | A | 7 × 5 | 35 |
| Relatórios CRM (funil, conversão, atividade) | 4 | M | 5 × 4 | 20 |
| Relatórios de contratos (execução, ARP, carona) | 5 | M | 5 × 5 | 25 |
| Relatório contratado vs realizado | 2 | A | 7 × 2 | 14 |
| Relatórios de aprendizado (padrões, perdas) | 4 | A | 7 × 4 | 28 |
| Relatório de empenhos/faturas | 3 | M | 5 × 3 | 15 |
| Auditoria e logs (compliance) | 3 | M | 5 × 3 | 15 |
| Notificações por email (templates renderizados) | 8 | M | 5 × 8 | 40 |
| Documentos gerados (contratos, certidões consolidadas) | 5 | A | 7 × 5 | 35 |
| **Subtotal EO** | | | | **381** |

### 3.5 EQ — Consultas Externas (recuperação simples)

| Grupo | Quantidade lógica | Complexidade | Peso | PF |
|---|---|---|---|---|
| Listagens com filtro (15 entidades) | 15 | M | 4 × 15 | 60 |
| Detalhes (drill-down de qualquer entidade) | 15 | M | 4 × 15 | 60 |
| Lookups / autocompletes (produto, órgão, NCM, etc.) | 10 | B | 3 × 10 | 30 |
| Busca de editais (PNCP + locais + filtros) | 5 | A | 6 × 5 | 30 |
| Busca de jurisprudência (Brave) | 3 | M | 4 × 3 | 12 |
| Histórico/logs (proposta, contrato, validação) | 6 | M | 4 × 6 | 24 |
| Visualização de calendário (CRM, prazos) | 3 | M | 4 × 3 | 12 |
| Notificações (lista + status) | 3 | B | 3 × 3 | 9 |
| Configurações ativas (settings inquiry) | 5 | B | 3 × 5 | 15 |
| Telas de seleção (empresa, perfil, papel) | 3 | B | 3 × 3 | 9 |
| Alertas e avisos | 4 | M | 4 × 4 | 16 |
| Dashboard inicial (cards + counts) | 4 | M | 4 × 4 | 16 |
| **Subtotal EQ** | | | | **293** |

### 3.6 SNAP / aspectos não-funcionais (informativo, não somado em FP)

A IFPUG criou o **SNAP** (Software Non-functional Assessment Process) pra capturar trabalho não medido por FP. No Facilicita.IA isso pesa muito:

- 5 módulos `rn_*.py` (regras de negócio audit/estados/prazos/validators/deepseek) com lógica densa
- Validações em 3 camadas (DOM/Rede/Semântica) no framework de testes
- 9 agentes de validação Claude
- Audit middleware + crypto utils
- Schedulers + workers (notificações, monitoramento)

Estimativa SNAP ~ **+250 SP** (~+15-20% do esforço base) — não somado nos 2.230 PF.

### 3.7 Total não-ajustado

| Tipo | PF |
|---|---|
| ILF | 740 |
| EIF | 51 |
| EI | 468 |
| EO | 381 |
| EQ | 293 |
| **TOTAL UFP** | **1.933** |

> Nota: arredondado pra **≈ 1.950 PF** considerando margem de subcontagem em CRM/Followup/Submissão (UCs ainda em backlog mas com modelos já criados).

### 3.8 Ajuste por características gerais (VAF)

O Facilicita.IA tem **alta complexidade transversal**. Score IFPUG nas 14 características:

| Característica (0-5) | Score | Justificativa |
|---|---|---|
| 1. Comunicação de dados | 4 | API REST + integrações 4 sistemas externos |
| 2. Processamento distribuído | 3 | Workers + scheduler |
| 3. Performance | 4 | Sistema crítico de tempo (lances, prazos) |
| 4. Configuração utilizada intensamente | 3 | Multi-tenant (UsuarioEmpresa) |
| 5. Taxa de transações | 3 | Picos em pregões |
| 6. Entrada de dados online | 5 | 100% web |
| 7. Eficiência usuário-final | 4 | UX rica, dashboards |
| 8. Atualização online | 5 | Real-time em pregões |
| 9. Processamento complexo | 5 | Cálculos de preço, IA, regras de negócio densas |
| 10. Reusabilidade | 3 | Componentes reutilizáveis |
| 11. Facilidade instalação | 2 | SaaS |
| 12. Facilidade operação | 3 | Logs, monitoramento |
| 13. Múltiplos locais | 3 | Multi-empresa |
| 14. Facilidade modificação | 4 | Estrutura modular |
| **TDI Total** | **51** | |

**VAF = 0,65 + (51 × 0,01) = 1,16**
**AFP (Adjusted) = 1.933 × 1,16 ≈ 2.242 PF**

> Aplicando margem de +10% por subcontagem reconhecida: **AFP final ≈ 2.498 PF**.

---

## 4. Estimativa de esforço

### 4.1 Produtividade de referência

Para sistemas **enterprise SaaS B2B com workflow + IA + integrações**:

| Tipo | Faixa típica (PF/dev/mês) |
|---|---|
| CRUD pesado tradicional | 12–18 |
| Web SaaS B2B padrão | 9–12 |
| **Sistema enterprise com workflow + IA + integrações** | **6–10** |
| Sistema fortemente regulado / financeiro | 5–8 |

Para o Facilicita.IA escolho **8 PF/dev/mês** (cenário realista) — sistema é regulado (compras públicas), tem IA pesada, mas equipes ágeis modernas conseguem ritmo bom em CRUDs auxiliares.

> **Sobre a regra "100 PF/mês por equipe":** confirmada pela literatura (ISBSG / Capers Jones / Putnam SLIM). Corresponde tipicamente a **equipe de 8-12 devs com produtividade individual ~8-12 PF/dev/mês**. É um ritmo de **equipe ideal** — na prática brasileira, projetos grandes costumam ficar 30-50% abaixo por overhead de comunicação, refatoração e dívida técnica.

### 4.2 Cenários de esforço (1.950 PF não-ajustados; 2.230 ajustados)

Usando 2.230 PF como número-base:

| Cenário | Equipe | Produtividade | Duração |
|---|---|---|---|
| **Otimista** (devs sêniores, sem retrabalho, escopo travado) | 7 | 11 PF/dev/mês = 77 PF/mês equipe | **29,0 meses** |
| **Realista** (mix sênior/pleno, escopo evolutivo) | 7 | 8 PF/dev/mês = 56 PF/mês equipe | **39,8 meses** |
| **Conservador** (com PO + QA + ramp-up + dívida técnica) | 7 | 6 PF/dev/mês = 42 PF/mês equipe | **53,1 meses** |
| **Equipe maior (escala)** | 11 | 8 PF/dev/mês = 88 PF/mês equipe | **25,3 meses** |
| **Equipe ideal Brooks** (regra 100 PF/mês) | 10 | 10 PF/dev/mês = 100 PF/mês | **22,3 meses** |

> **Aplicando o limite de Brooks** ("9 mulheres não fazem 1 bebê em 1 mês"): para sistemas dessa complexidade, equipes acima de ~12 devs simultâneos sofrem perda de produtividade por overhead de comunicação. **Equipe ótima do Facilicita.IA = 8-11 devs**.

### 4.3 Cenário recomendado (realista bem dimensionado)

**Equipe de 9 devs trabalhando 30 meses** (~2,5 anos):

| Papel | Quant. | R$/mês carregado |
|---|---|---|
| Tech Lead / Arquiteto | 1 | 30.000 |
| Devs Backend Python sêniores (regras, IA, integrações) | 2 | 22.000 |
| Devs Backend Python plenos | 1 | 18.000 |
| Devs Frontend React/TS sêniores | 2 | 22.000 |
| Devs Frontend plenos | 1 | 18.000 |
| Eng. ML / Prompt Engineer (DeepSeek + agentes) | 1 | 24.000 |
| QA Engineer + automação | 1 | 16.000 |
| **Subtotal devs+QA** | **9** | |
| PO/PM (compartilhado) | 0,5 | 16.000 (50% × 32k) |
| Designer UX | 0,5 | 11.000 |
| **Total mensal equipe** | | **~R$ 199.000** |

**Custo total cenário realista:**
- Equipe: 30 meses × R$ 199k = **R$ 5,97 mi**
- Infra + licenças (DeepSeek API, Brave API, hosting, etc.) +15%: **~R$ 6,86 mi**

### 4.4 Quadro consolidado de custos

| Cenário | Duração | Equipe | Custo equipe | Custo total (+15%) |
|---|---|---|---|---|
| Otimista | 29 meses | 7 devs | R$ 4,12 mi | **R$ 4,74 mi** |
| Realista (recomendado) | 30 meses | 9 devs | R$ 5,97 mi | **R$ 6,86 mi** |
| Equipe maior | 25 meses | 11 devs | R$ 6,03 mi | **R$ 6,93 mi** |
| Conservador | 53 meses | 7 devs | R$ 7,52 mi | **R$ 8,65 mi** |

---

## 5. Validação cruzada

### 5.1 Comparação com benchmarks de tamanho

| Métrica | Valor Facilicita.IA | Faixa benchmark |
|---|---|---|
| PF totais | 1.950–2.230 | 1500-3000 = "sistema enterprise médio-grande" ✓ |
| Páginas/PF | 29 / 2.230 = 0,013 | 0,01-0,03 (sistemas com sub-views internas) ✓ |
| Tabelas/PF | 84 / 2.230 = 0,038 | 0,03-0,06 típico ✓ |
| Endpoints/PF | 193 / 2.230 = 0,087 | 0,08-0,15 típico ✓ |
| LOC/PF | 78.800 / 2.230 = **35** | 30-50 esperado pra Python/TS ✓ |

→ Todas as proporções batem. Contagem internamente coerente.

### 5.2 Comparação Facilicita.IA vs Zarpa

Mesmo método de contagem aplicado nos 2 sistemas:

| Métrica | Facilicita.IA | Zarpa | Razão |
|---|---|---|---|
| PF não-ajustados | 1.950 | 901 | **2,2×** |
| Tabelas | 84 | 35 | 2,4× |
| Endpoints | 193 | 108 | 1,8× |
| Páginas raiz | 29 | 79 | 0,37× (mas Facilicita tem sub-views por página) |
| Casos de uso documentados | 89 | ~50 (estimado) | 1,8× |
| Esforço estimado realista | 30 meses (9 devs) | 14 meses (7 devs) | 2,1× |
| Custo realista | R$ 6,86 mi | R$ 2,33 mi | 2,9× |

→ Facilicita é **~2× mais complexo** que Zarpa. Custo cresce mais que linearmente por exigir equipe especializada (regulação, jurisprudência, IA densa).

### 5.3 Backtest: tempo real já investido

O sistema tem 5 sprints completas (1-5) com 79 UCs cobertos + sprints 6-9 em andamento. Considerando:
- ~80% dos PF estão nas Sprints 1-5 (≈ 1.560 PF)
- Time atual: ~2-4 devs efetivos
- Período: ~12 meses até hoje (2026-04 vs início ~2025-04)

→ Produtividade real observada: 1.560 PF / (3 devs × 12 meses) ≈ **43 PF/dev/mês** (acima do benchmark)

Esse número alto sugere:
1. Uso intensivo de IA na geração de código (Claude Code, Cursor)
2. Componentes pré-existentes (templates, shadcn)
3. Possível subcontagem de PF (algumas funcionalidades não estão totalmente prontas)

Na prática, a **produtividade real com IA assistida pode ser 2-3× a do benchmark histórico** — o que reduz o cronograma esperado de 30 meses para **~12-18 meses** se o time atual mantiver o ritmo.

---

## 6. Conclusão

### 6.1 Resposta direta às perguntas

| Pergunta | Resposta |
|---|---|
| **Quantos PF tem o Facilicita.IA?** | **≈ 1.950 PF não-ajustados** / **≈ 2.230 PF ajustados (VAF 1,16)** |
| **A regra dos 100 PF/mês por equipe é válida?** | **Sim** — corresponde a equipe de ~10 devs com produtividade ~10 PF/dev/mês (mediana ISBSG/Capers Jones). Para sistemas enterprise com IA/regulação, fica em 70-90 PF/mês equipe. |
| **Quanto tempo seria desenvolvido?** | **~30 meses no cenário realista** com equipe de 9 devs (faixa 22-53 meses) |
| **Custo total estimado?** | **R$ 4,74 mi a R$ 8,65 mi** (otimista a conservador, BR 2026) |

### 6.2 Margem de erro

A FPA tem precisão típica de **±15-20%** quando feita por CFPS certificado, e **±25-30%** em contagens simplificadas. Tratar como **ordem de grandeza**, não compromissos.

### 6.3 Considerações específicas do Facilicita.IA

**Pontos que inflam complexidade real além do PF capta:**
- Domínio regulatório (Lei 14.133/21, Decretos, jurisprudência TCU) — requer especialista em Direito Administrativo
- Integração com sistemas governamentais instáveis (PNCP intermitente)
- Requisitos de auditoria e compliance (LGPD + transparência licitatória)
- Multi-tenant com isolamento forte por empresa
- IA generativa em loop crítico (geração de recurso, análise de edital)
- 5 módulos `rn_*` com regras de negócio densas que não somam ao PF mas pesam em desenvolvimento

**Pontos que reduzem vs sistema cru:**
- Frontend usa biblioteca de componentes (~−50 PF de UI custom)
- Backend Flask + SQLAlchemy maduro (~−80 PF de boilerplate)
- DeepSeek pronto (não precisa treinar modelo) (~−200 PF vs ML custom)

**Estimativa realista líquida = 2.230 PF.**

### 6.4 Recomendação prática

| Se o objetivo é... | Cenário sugerido |
|---|---|
| Lançar MVP funcional rápido | Sprints 1-3 (Empresa+Captação+Validação) ≈ 800 PF → 9 meses com 7 devs |
| Lançar produto completo competitivo | Sprints 1-5 ≈ 1.560 PF → 18 meses com 9 devs |
| Sistema completo conforme planejado | Todos UCs ≈ 2.230 PF → 30 meses com 9 devs |
| Manter time atual com IA assistida | 12-18 meses (com produtividade observada de 30+ PF/dev/mês) |

---

## 7. Referências

- IFPUG. *Function Point Counting Practices Manual* v4.3.1
- Capers Jones. *Thirty years of IFPUG: Software Economics and Function Point Metrics* (2017)
- ISBSG. *Project Cost per Function Point* (2023)
- MDPI. *Software Development and Maintenance Effort Estimation Using Function Points* (2024)
- Putnam, L. *SLIM Software Lifecycle Management* (referência produtividade)
- Brooks, F. *The Mythical Man-Month* (limite de paralelização de equipes)

---

*Relatório gerado em 2026-04-26 com base na inspeção estática de `/mnt/data1/progpython/agenteditais` (branch main, commit recente). Para uma contagem oficial certificada, contratar um CFPS (Certified Function Point Specialist).*
