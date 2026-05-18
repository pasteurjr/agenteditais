# MELHORIAS DA UX — Sprints 1 a 5 (Facilicita.IA)

**Data:** 2026-05-18
**Autor da análise:** Analista de UX (avaliação heurística)
**Método:** percorreu-se as 5 sprints encadeadas no testesvalidacoes (mesmo fluxo dos REPORTs anteriores), capturando as telas reais de cada UC. Sobre as telas capturadas aplicou-se **avaliação heurística de Nielsen** (as 10 heurísticas, citando apenas as que se aplicam a cada tela) + sugestões de layout, cores, disposição de objetos e abas.
**Escopo da análise:** por **tela** (vários UCs compartilham a mesma tela — ex.: F06-F12 todos no Portfólio; CV01-CV13 na Captação/Validação), com cada UC mapeado à sua tela. Isso evita repetir a mesma análise heurística dezenas de vezes e produz recomendações acionáveis.

> **Nota de método (honesta):** este relatório avalia **usabilidade/interface**, não regressão funcional (essa está nos `REPORT SPRINTS 1 TO 5` / `6 TO 9`, 135/135). As telas analisadas vêm da execução encadeada com telas funcionais renderizadas corretamente. As 10 heurísticas de Nielsen referenciadas: **H1** Visibilidade do status · **H2** Correspondência sistema↔mundo real · **H3** Controle e liberdade do usuário · **H4** Consistência e padrões · **H5** Prevenção de erros · **H6** Reconhecer em vez de lembrar · **H7** Flexibilidade e eficiência · **H8** Estética e design minimalista · **H9** Ajudar a reconhecer/diagnosticar/recuperar de erros · **H10** Ajuda e documentação.

---

## Diagnóstico transversal (vale para todas as telas / todas as sprints)

Antes da análise tela a tela, padrões de UX que se repetem em **todo o sistema** e impactam todos os UCs de S1-S5:

| Heurística | Achado transversal | Severidade (0-4) | Recomendação |
|---|---|---|---|
| **H4 Consistência** | Tema escuro consistente, mas **densidade de informação muito alta** em tabelas (Empresas, Captação) — texto pequeno, baixo contraste cinza-sobre-azul-escuro. | 3 | Aumentar contraste do texto secundário (de `#8b…` para algo ≥ 4.5:1 sobre o fundo); aumentar `line-height` e `padding` vertical das linhas de tabela. |
| **H1 Visibilidade do status** | Passos demorados (IA/scraping) nem sempre têm feedback de progresso claro; estados de loading discretos. | 3 | Skeleton loaders nas grades; barra/spinner com texto ("Buscando editais no PNCP… 12s") nos passos com IA. |
| **H8 Minimalista** | Sidebar muito longa (Fluxo Comercial + Cadastros + Indicadores + Governança + Configurações) — ~25 itens, scroll vertical. | 2 | Agrupar com seções colapsáveis por padrão (só a seção ativa expandida); ícones + tooltip no modo recolhido. |
| **H6 Reconhecer vs lembrar** | Navegação depende de saber onde cada coisa está na árvore lateral; rótulos abreviados ("Monitor.", "Param."). | 2 | Breadcrumb no topo de cada página; evitar abreviações nos itens de menu. |
| **H2 Mundo real** | Bom uso de vocabulário do domínio (Edital, Lote, Aderência, CATMAT). Score numérico (ex. "53") sem legenda do que é "bom/ruim". | 2 | Legenda/escala visual ao lado do score (faixa colorida 0-100 + rótulo "Baixa/Média/Alta aderência"). |
| **H7 Flexibilidade** | Sem atalhos de teclado, sem ações em lote visíveis na maioria das grades. | 1 | Seleção múltipla + ações em lote nas grades de editais/produtos; atalho global de busca (já existe campo no topo — adicionar `/` para focar). |

**Paleta atual:** fundo azul-escuro (#0f1729 aprox.), acento azul (#3b82f6) e roxo (#8b5cf6), texto branco/cinza. Coerente e moderna, mas o **cinza secundário tem contraste insuficiente** (WCAG AA falha em vários textos de apoio) — é o problema de cor nº 1 do produto.

---

## SPRINT 1 — Empresa, Portfólio e Parametrização

### Tela A — Onboarding "Você não tem empresas vinculadas"
**UCs que passam por aqui:** ponto de entrada de praticamente todos os UCs S1 quando o usuário é super sem empresa (F01 e setup das demais).

**Avaliação heurística:**
- **H1 (status):** ✅ Bom — comunica claramente o estado ("Você não tem empresas vinculadas") e o porquê ("Como superusuário…").
- **H3 (controle/liberdade):** ✅ Oferece saídas claras (Criar, Vincular, Entrar vazio, Sair).
- **H8 (minimalista):** ✅ Tela limpa, 1 card central, 4 ações. Exemplar.
- **H4 (consistência):** ⚠️ As 3 ações primárias têm 3 cores diferentes (azul, roxo, cinza) sem hierarquia clara de qual é a recomendada.

**Sugestões profundas:**
- **Hierarquia de cor:** só **"Criar Nova Empresa"** deve ser primária (azul cheio). "Vincular" e "Entrar vazio" → botões secundários (outline), reduzindo o peso visual roxo. "Sair" como link de texto (já está discreto, ok).
- **Disposição:** adicionar 1 linha de texto auxiliar sob cada botão ("Crie do zero" / "Use uma empresa já cadastrada por outro usuário" / "Explore o sistema sem dados") — reduz dúvida (H6, H10).
- **Ícone:** o ícone do prédio é genérico; um ilustração de onboarding mais acolhedora reduz a sensação de "erro/vazio".

### Tela B — Empresas (CRUD, lista)
**UCs:** F01 (cadastro empresa) e base de todo o encadeamento.

**Avaliação heurística:**
- **H8 (minimalista):** ❌ **Violação relevante.** Tabela com ~9 colunas (CNPJ, Razão Social, Nome Fantasia, IE, IM, Regime, etc.), fonte minúscula, dezenas de linhas "DEMO …" — sobrecarga cognitiva.
- **H4 (consistência):** ⚠️ Largura de colunas desproporcional; CNPJ ocupa muito, ações espremidas à direita.
- **H6 (reconhecer):** ⚠️ Sem busca/filtro visível com destaque (há um campo, mas some no topo).

**Sugestões profundas:**
- **Layout:** trocar a tabela "tudo visível" por **cards ou linhas com 3-4 campos-chave** (Razão Social + CNPJ + cidade/UF + status) e um "Ver mais" que expande o resto. Densidade hoje é de planilha, não de app.
- **Cores:** linhas zebradas sutis (alternar fundo em 4% de luminância) para ancorar a leitura horizontal; status como **badge colorido** (ativo=verde, inativo=cinza) em vez de texto.
- **Disposição:** fixar o cabeçalho da tabela ao rolar (sticky header); mover busca/filtro para uma barra fixa acima da grade, sempre visível (H6).
- **Ações:** ícones de ação (editar/excluir) com `tooltip` e área de clique maior (hoje minúsculos).

### Tela C — Portfólio › Classificação (árvore Área→Classe→Subclasse)
**UCs:** F13 (hierarquia + máscara), base de F06-F12.

**Avaliação heurística:**
- **H2 (mundo real):** ✅ Excelente — "Área → Classe → Subclasse (com máscaras de especificação)" descreve o modelo mental certo; árvore com ícones de pasta.
- **H1 (status):** ✅ Mostra contagem ("2 classe(s)", "1 classe(s)") e estado do agente ("Agente Inativo · Última verificação: Nenhuma").
- **H4 (consistência):** ✅ Abas "Meus Produtos / Cadastro por IA / Classificação" claras, aba ativa destacada.
- **H8:** ⚠️ O "Funil de Monitoramento" no meio da tela de classificação mistura dois conceitos (estrutura de catálogo × monitoramento de mercado) — pode confundir foco.

**Sugestões profundas:**
- **Disposição/abas:** separar "Funil de Monitoramento" para sua própria aba ou card colapsado — a aba "Classificação" deveria focar **só** na árvore. Isso melhora H8 (minimalista) e H2 (um conceito por tela).
- **Cores:** os badges de classe ("Reagentes e Kits Diagnósticos", "Monitoração") estão bons; aplicar a mesma linguagem de badge colorido por área (cada área uma cor de acento) para reconhecimento rápido (H6).
- **Interação:** árvore expansível com indicador de "vazio" — quando uma subclasse não tem máscara, mostrar chip "sem máscara" (conecta com a obs17 já corrigida).

### Tela D — Modal "Adicionar Responsável" (sobre Empresa)
**UCs:** F05 (responsáveis/procuração).

**Avaliação heurística:**
- **H3 (controle):** ✅ Modal com Cancelar/Salvar explícitos, X no canto.
- **H5 (prevenção de erro):** ⚠️ Campos obrigatórios marcados com `*` (Nome, Email) — bom — mas sem validação inline visível; CPF com máscara placeholder (`000.000.000-00`) — bom.
- **H8:** ✅ Formulário enxuto, 1 coluna, foco claro.
- **H4:** ⚠️ O modal escurece o fundo corretamente, mas o conteúdo de trás "vaza" semi-visível e distrai.

**Sugestões profundas:**
- **Cores/foco:** aumentar a opacidade do overlay de fundo (de ~70% para ~85%) para isolar o modal (H8 — reduz ruído).
- **Prevenção de erro (H5):** validação inline (email válido, CPF completo) com mensagem sob o campo **antes** de clicar Salvar; desabilitar "Salvar" enquanto obrigatórios vazios (já há padrão disso no produto — aplicar aqui).
- **Disposição:** o select "Tipo" deveria vir com as opções visíveis num rótulo de ajuda ("procurador, sócio, representante…") — H6.

### Telas E — Parametrizações (abas Score / Comercial / Fontes / Notificações / Preferências / Classes)
**UCs:** F14 (score), F15 (comercial — TAM/SAM/SOM, máscara monetária), F16 (fontes — ativar/desativar), F17 (preferências).

**Avaliação heurística:**
- **H4 (consistência):** ✅ Sistema de abas (`tab-panel-header`) consistente e claro; aba ativa destacada.
- **H2 (mundo real):** ✅ Campos monetários com prefixo "R$" e máscara pt-BR (fix obs28); termos do domínio corretos.
- **H1 (status):** ✅ Toast verde fixo de confirmação ("✓ salvo") no canto.
- **H5:** ✅ Fontes com badge Ativa/Inativa visível (fix obs30).
- **H6:** ⚠️ Caixinhas de UF — fonte branca corrigida (obs27), mas a grade de 27 UFs é densa; sem agrupamento por região.

**Sugestões profundas:**
- **Disposição UF (F15):** agrupar as 27 UFs por região (Norte/Nordeste/CO/Sudeste/Sul) com subtítulos — reduz busca visual (H6); manter "Atuar em todo o Brasil" como toggle-mestre acima.
- **Cores:** o estado selecionado de UF (fundo azul) e o badge "Ativa" (verde) competem visualmente — padronizar verde só para "ativo/sucesso" e azul para "selecionado".
- **Abas:** 6 abas é o limite saudável; se crescer, considerar agrupar "Notificações + Preferências" numa aba "Pessoal". Adicionar indicador de "alterações não salvas" por aba (ponto laranja) — H1/H5.

---

## SPRINT 2 — Captação e Validação de Editais

### Tela F — Captação de Editais (filtros + grade + painel de detalhes)
**UCs:** CV01-CV06 (busca, filtros, monitoramentos), CV07-CV13 (validação: aderência, lotes, documentos, riscos, mercado, IA).

**Avaliação heurística:**
- **H8 (minimalista):** ❌ **A tela mais sobrecarregada do sistema.** Três zonas competindo: barra de filtros (modalidade, UF, score, dias…), grade de editais (muitas colunas), e painel de detalhes lateral — tudo simultâneo, fonte pequena.
- **H1 (status):** ✅ Mostra "Resultado: 11 editais encontrados" e badge de score (53) com anel colorido — bom feedback.
- **H2 (mundo real):** ✅ Score com anel circular colorido é uma boa metáfora visual de "quão aderente".
- **H6 (reconhecer):** ⚠️ Muitos filtros lado a lado sem agrupamento; difícil saber qual está ativo.
- **H4:** ⚠️ Painel de detalhes à direita repete dados da linha selecionada, mas a relação "linha selecionada ↔ painel" não tem destaque visual forte (qual linha está aberta?).

**Sugestões profundas:**
- **Layout (maior ganho do sistema):** adotar **master-detail com 2 painéis** explícito: grade ocupa ~60% à esquerda, detalhe ~40% à direita, com a **linha selecionada destacada** (barra lateral colorida + fundo). Hoje a relação é fraca.
- **Filtros:** recolher filtros avançados num "Filtros ▾" expansível; manter só busca + UF + score visíveis. Chips de "filtro ativo" abaixo da busca (ex.: `Pregão ✕` `SP ✕`) — H6, H3.
- **Cores/score:** padronizar a escala do anel de score (vermelho <40, amarelo 40-69, verde ≥70) com legenda fixa perto da grade — resolve o achado transversal H2.
- **Densidade:** reduzir colunas da grade para Objeto + Órgão + UF + Valor + Score; o resto vai para o painel de detalhe (H8).
- **Disposição abas do detalhe (CV09-CV13):** o painel de detalhes tem sub-abas (Lotes, Documentos, Riscos, Mercado, IA) — ótimo padrão; garantir que a aba ativa e a quantidade de itens por aba (ex.: "Documentos (3)") apareçam como badge — H1.

---

## SPRINT 3 — Precificação e Proposta

### Tela G — Proposta / Detalhes do Produto (specs técnicas)
**UCs:** P01-P12 (precificação, custos, preço-base, lances, estratégia, comodato, insights, relatório), R01-R07 (recursos da etapa: descrição técnica, ANVISA, auditoria, exportação).

**Avaliação heurística:**
- **H2 (mundo real):** ✅ Tabela "Especificações Técnicas" com Especificação/Valor/Unidade — modelo claro do domínio.
- **H4 (consistência):** ✅ Barra de ações no topo (Reprocessar / Verificar Completude / Preços de Mercado / Exportar) consistente com o resto do produto.
- **H8:** ⚠️ Tabela de specs longa e monótona (muitas linhas, sem agrupamento por categoria — elétrica, dimensional, regulatória).
- **H1:** ⚠️ Ações que disparam IA (Reprocessar) precisam de feedback de progresso mais forte (relaciona com diagnóstico transversal H1).

**Sugestões profundas:**
- **Disposição:** agrupar specs por **categoria com subtítulos colapsáveis** (Dimensional, Elétrica, Regulatória, Conectividade) — transforma uma lista de 20+ linhas em 4-5 blocos navegáveis (H8, H6).
- **Cores:** destacar specs **obrigatórias da máscara não preenchidas** em âmbar e preenchidas em verde-discreto (conecta com completude, obs17); badge "IA" vs "Manual" por origem da spec (rastreabilidade — relaciona obs9/12).
- **Ações:** transformar a barra de ações em botões com ícone+rótulo e estado de loading individual (o botão vira spinner enquanto a IA roda) — H1.
- **Layout:** cabeçalho do produto (nome, fabricante, modelo, NCM, ANVISA, categoria) hoje é uma linha apertada — promover a um "card de identidade" com 2 colunas de pares rótulo/valor, fonte maior. É a primeira coisa que o usuário lê; merece respiro (H8).

---

## SPRINT 4 — Recursos e Impugnações

### Tela H — Dashboard (porta de entrada / contexto)
**UCs:** I01-I05 (impugnações) e RE01-RE06 (recursos) — vários operam via ações que retornam ao Dashboard como contexto.

**Avaliação heurística:**
- **H1 (status):** ✅ **Ponto forte do produto.** Dashboard com KPIs (Novos, Em Análise, Validados, Propostas, Lance Hoje), Funil de Editais visual, Insights da IA, Monitoramento Automático, Próximos Eventos. Excelente visibilidade do estado geral.
- **H2 (mundo real):** ✅ Funil de Editais (Captação→Validação→Precificação→Proposta→Submissão→Ganhos) representa fielmente o pipeline de licitação.
- **H8:** ✅ Bem organizado em cards; respiro adequado (contrasta positivamente com as telas de tabela).
- **H1:** ⚠️ Quando tudo está zerado ("Nenhum edital urgente", "0 propostas", "0%"), a tela parece "morta" — não orienta o próximo passo.

**Sugestões profundas:**
- **Estado vazio (empty state):** quando KPIs estão zerados, cada card deveria ter uma **CTA contextual** ("Nenhum edital ainda → Buscar editais"), transformando vazio em ação (H1, H10). Hoje informa o vazio mas não conduz.
- **Funil:** o Funil de Editais é ótimo — torná-lo **clicável** (clicar em "Captação 1" leva à lista filtrada por esse estágio) — H7 (atalho), H3.
- **Cores:** os números grandes dos KPIs poderiam usar cor semântica (verde para "Ganhos", âmbar para "Em Análise", vermelho para "Lance Hoje" urgente) em vez de tudo branco — leitura mais rápida (H1).
- **Impugnação/Recurso (I/RE):** estes UCs geram peças jurídicas; recomenda-se uma tela dedicada com **preview do documento gerado** lado a lado com os parâmetros (split view), em vez de retornar ao dashboard — hoje a ação some sem artefato visível (H1, H3).

---

## SPRINT 5 — Followup, Atas, Execução, Contratado×Realizado, CRM

### Tela I — (módulos AT/CR/CRM/CT/FU — operações via endpoint)
**UCs:** AT01-03 (atas), CR01-03 (contratado×realizado), CRM01-07, CT01-10 (execução de contrato), FU01-03 (followup).

**Observação honesta de método:** estes 26 UCs foram exercitados majoritariamente por **chamada de endpoint** (`passo_01_chamar_endpoint`), com tela de contexto = Dashboard. A análise visual aqui é menos rica porque a interface própria desses módulos não foi profundamente percorrida nesta captura. As recomendações abaixo são baseadas no padrão de telas equivalentes do produto (CRM, Contratos, Followup têm páginas dedicadas no menu) e devem ser confirmadas com captura dirigida dessas páginas.

**Avaliação heurística (padrão do produto, a confirmar):**
- **H2 (mundo real):** ✅ Vocabulário do domínio correto (Ata de Pregão, Contratado×Realizado, Followup).
- **H4 (consistência):** ✅ Itens no menu lateral seguem o padrão dos demais módulos.
- **H1:** ⚠️ Módulos de acompanhamento (Followup, Contratado×Realizado) **vivem de status temporal** — exigem forte visibilidade de prazos/pendências, que o dashboard genérico não cobre.

**Sugestões profundas:**
- **Contratado×Realizado (CR):** é intrinsecamente comparativo — recomenda-se layout de **2 colunas espelhadas** (Contratado | Realizado) com diferença destacada (verde se cumprido, vermelho se aquém) e barra de progresso por item. É a tela onde uma boa visualização agrega mais valor.
- **Followup (FU):** timeline vertical com marcos (datas, responsável, status) — metáfora temporal (H2); cores por status do marco (concluído/pendente/atrasado).
- **CRM (7 UCs):** lista de contatos/oportunidades pede **kanban ou lista com filtros de estágio**; evitar tabela densa (mesmo problema da tela B).
- **Execução de Contrato (CT, 10 UCs):** checklist de obrigações contratuais com progresso (% executado) e alertas de prazo no topo — conecta com o módulo de Alertas (S6).
- **Recomendação de processo:** rodar uma captura dirigida das páginas `CRMPage`, `ContratadoRealizadoPage`, `FollowupPage`, `AtasPage`, `ContratosPage` (existem no frontend) para uma análise heurística visual completa da S5 — esta seção é a de menor profundidade visual por limitação da captura por endpoint.

---

## Síntese — Top 10 melhorias de UX priorizadas (S1-S5)

| # | Tela / Módulo | Melhoria | Heurística | Impacto | Esforço |
|---|---|---|---|---|---|
| 1 | **Transversal** | Aumentar contraste do texto secundário (WCAG AA) | H4/H8 | Alto | Baixo |
| 2 | **Captação (S2)** | Master-detail explícito + reduzir colunas + chips de filtro | H8/H6 | Alto | Médio |
| 3 | **Transversal** | Escala/legenda de score padronizada (cores 0-100) | H2/H1 | Alto | Baixo |
| 4 | **Empresas/CRUD (S1)** | Trocar tabela-planilha por cards/linhas resumidas + sticky header | H8 | Alto | Médio |
| 5 | **Dashboard (S4)** | Empty states com CTA + funil clicável + cor semântica nos KPIs | H1/H7 | Alto | Médio |
| 6 | **Proposta (S3)** | Agrupar specs por categoria colapsável + card de identidade do produto | H8/H6 | Médio | Médio |
| 7 | **Parametrizações (S1)** | UFs agrupadas por região + indicador "alterações não salvas" por aba | H6/H5 | Médio | Baixo |
| 8 | **Onboarding (S1)** | Hierarquia de cor nos botões (1 primário) + texto auxiliar | H4/H6 | Médio | Baixo |
| 9 | **Sidebar (transversal)** | Seções colapsáveis (só ativa expandida) + breadcrumb | H6/H8 | Médio | Médio |
| 10 | **S5 (CR/FU/CRM/CT)** | Layouts dedicados (comparativo, timeline, kanban) + captura dirigida p/ análise completa | H2/H1 | Alto | Alto |

### Conclusão do analista

O Facilicita.IA tem uma **base de design moderna e consistente** (tema escuro coerente, sistema de abas, dashboard com bom storytelling de pipeline). Os pontos fortes de UX são o **Dashboard** (H1 exemplar) e a **árvore de Classificação** (H2 exemplar). 

As duas fraquezas estruturais são: **(1) densidade excessiva de informação em telas de tabela** (Empresas, Captação) — viola H8 e prejudica H6; e **(2) contraste insuficiente do texto secundário** — viola H4 e acessibilidade (WCAG AA). Atacar esses dois itens (melhorias #1 e #2/#4 da tabela) traria o maior ganho percebido de usabilidade com esforço relativamente baixo.

Recomenda-se priorizar as melhorias de **Alto impacto / Baixo esforço** (#1, #3) como quick wins imediatos, e tratar #2/#4/#5 como o roadmap de UX do próximo ciclo.

---

*Análise heurística gerada a partir das telas reais capturadas na execução encadeada S1-S5 no testesvalidacoes (2026-05-18). Telas funcionais de referência: Onboarding, Empresas CRUD, Portfólio/Classificação (F13), modal Responsável, Parametrizações (abas), Captação de Editais (grade+detalhe+score), Proposta/Detalhes-produto, Dashboard. A seção S5 tem profundidade visual reduzida (UCs por endpoint) e recomenda captura dirigida das páginas dedicadas para análise completa — registrado honestamente.*
