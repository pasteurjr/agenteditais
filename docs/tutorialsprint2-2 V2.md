# Tutorial de Validação Manual — Sprint 2 — Conjunto 2 (V2)
# Empresa: RP3X Comércio e Representações Ltda.

**Data:** 07/04/2026 (V2 atualizado em 29/04/2026)
**Dados:** dadoscapval-2 V2.md
**Referência:** CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V7.md
**UCs:** CV01–CV13 (13 casos de uso)
**Público:** Dono do Produto / Validador de Negócio (sem conhecimento técnico necessário)

---

## ⚠️ PRÉ-REQUISITO CRÍTICO — Hierarquia de Classificação criada em Sprint 1 (UC-F13 V8)

**Você deve ter executado o UC-F13 V8 da Sprint 1 antes de iniciar esta sprint.** O UC-F13 V8 cria a estrutura Área → Classe → Subclasse (2 áreas, 3 classes, 3 subclasses) específica da empresa RP3X. Esta Sprint 2 usa esses dados em **filtros de busca de editais** (especialmente UC-CV01 com cascata Área/Classe/Subclasse).

Se você (Arnaldo) seguiu o `tutorialsprint1-2 V2.md` corretamente, a hierarquia já está cadastrada. Caso contrário, volte ao tutorial da Sprint 1 e execute UC-F13 antes.

**Sintomas que indicam pré-requisito faltando:**
- Os campos Área/Classe/Subclasse na busca aparecem vazios.
- O sistema mostra "Nenhuma classificação cadastrada" ao tentar filtrar.

---

> **Como usar este tutorial**
>
> Siga cada passo na ordem indicada. Os dados a inserir estão destacados em `código`. As verificações ao final de cada UC dizem exatamente o que deve estar na tela para confirmar que o sistema funcionou corretamente. Quando algo não está como esperado, a seção "Sinais de problema" orienta o que reportar.

---

## Credenciais e Fluxo de Acesso

| Campo | Valor |
|---|---|
| Usuário (Conjunto 2) | valida2@valida.com.br |
| Senha | 123456 |
| Perfil | Superusuário |
| Empresa alvo | RP3X Comércio e Representações Ltda. |

### Pré-requisito — Associar valida2 à empresa RP3X

Este passo deve ser feito UMA VEZ antes de iniciar os UCs:

**Opção A — Via valida1 (recomendado):**
1. Login com `valida1@valida.com.br` / `123456`
2. Menu lateral → "Associar Empresa/Usuario"
3. Selecionar empresa: RP3X Comércio e Representações Ltda.
4. Selecionar usuário: valida2@valida.com.br
5. Papel: admin → clicar "Vincular"

**Opção B — valida2 cria a empresa diretamente:**
1. Login com `valida2@valida.com.br` / `123456`
2. Ao ver a tela de seleção de empresa, selecionar "RP3X Comércio e Representações Ltda." (se já existir do Sprint 1)
3. Se a RP3X não existir ainda, criá-la via Menu Empresa conforme UC-F01 do Sprint 1
4. A empresa fica associada automaticamente a valida2

### Fluxo de login (após associação)
1. Acessar `http://pasteurjr.servehttp.com:5179`
2. Email: `valida2@valida.com.br` / Senha: `123456`
3. Tela de seleção de empresa → clicar "RP3X Comércio e Representações Ltda."
4. Dashboard carrega com RP3X como empresa ativa

### Menus extras visíveis (superusuário)
- **Usuarios** — CRUD de usuários
- **Associar Empresa/Usuario** — vincular usuários a empresas
- **Selecionar Empresa** — trocar empresa ativa

> Esses menus não aparecem para usuários normais (super=False). O tutorial a seguir assume que a empresa RP3X já está associada a valida2 e que os dados do Sprint 1 (empresa, portfólio e parametrização) já estão cadastrados.

---

## Índice

- [UC-CV01 — Buscar editais por termo, classificação e score](#uc-cv01--buscar-editais-por-termo-classificação-e-score)
- [UC-CV02 — Explorar resultados e painel lateral](#uc-cv02--explorar-resultados-e-painel-lateral)
- [UC-CV03 — Salvar edital, itens e scores](#uc-cv03--salvar-edital-itens-e-scores)
- [UC-CV04 — Definir estratégia](#uc-cv04--definir-estratégia)
- [UC-CV05 — Exportar e consolidar](#uc-cv05--exportar-e-consolidar)
- [UC-CV06 — Gerir monitoramentos](#uc-cv06--gerir-monitoramentos)
- [UC-CV07 — Listar editais salvos (ValidaçãoPage)](#uc-cv07--listar-editais-salvos-validaçãopage)
- [UC-CV08 — Calcular scores e decidir](#uc-cv08--calcular-scores-e-decidir)
- [UC-CV09 — Importar itens e extrair lotes](#uc-cv09--importar-itens-e-extrair-lotes)
- [UC-CV10 — Confrontar documentação](#uc-cv10--confrontar-documentação)
- [UC-CV11 — Analisar riscos, atas, concorrentes](#uc-cv11--analisar-riscos-atas-concorrentes)
- [UC-CV12 — Analisar mercado](#uc-cv12--analisar-mercado)
- [UC-CV13 — IA resumo e perguntas](#uc-cv13--ia-resumo-e-perguntas)
- [Resumo de Verificações por UC](#resumo-de-verificações-por-uc)
- [O que reportar se algo falhar](#o-que-reportar-se-algo-falhar)

---

## [UC-CV01] Buscar editais por termo, classificação e score

> **O que este caso de uso faz:** Esta é a porta de entrada do sistema de captação de editais. Funciona como um mecanismo de busca especializado — você digita o que a empresa vende (por exemplo, "reagente hematologia") e o sistema procura nos portais de compras públicas (como o PNCP) todos os editais que mencionam esses produtos. Além de buscar, o sistema pode calcular automaticamente um "score" — uma nota de 0 a 100 que indica o quanto aquele edital combina com o portfólio da sua empresa. Pense nisso como um Google especializado em licitações, mas que já diz "este edital é 85% compatível com o que você vende".

**Onde:** Menu lateral → Captação
**Quanto tempo leva:** 15 a 20 minutos (são 5 buscas diferentes)

---

### Antes de começar

- Certifique-se de estar logado com `valida2@valida.com.br` e com a empresa RP3X ativa.
- Os dados do Sprint 1 (portfólio de produtos e parametrização) devem estar cadastrados — o cálculo de score depende desses dados.
- Tenha este tutorial aberto ao lado da tela do sistema para copiar os termos de busca.

---

### Passo 1 — Navegar até a página de Captação

**O que fazer:** No menu lateral à esquerda, localize e clique na opção "Captação". Isso vai abrir a tela de busca de editais.

**O que você vai ver na tela:** Uma página com um campo de busca principal (para digitar o termo), filtros adicionais (UF, NCM, fonte, score, etc.) e uma área onde os resultados vão aparecer (inicialmente vazia).

**O que acontece depois:** A tela de captação é exibida, pronta para receber os critérios de busca.

✅ **Correto se:** A tela de busca carregou com o campo de texto e os filtros visíveis.
❌ **Problema se:** A tela exibe erro, fica em carregamento infinito, ou não mostra o campo de busca.

---

### Passo 2 — Executar a Busca 1: "reagente hematologia"

**O que fazer:** No campo de busca principal, digite o termo de busca. Configure os filtros conforme a tabela abaixo e clique no botão "Buscar" (ou "Pesquisar").

**O que você vai ver na tela:** O campo de busca e os filtros ao redor dele. Alguns filtros podem estar ocultos e precisar de um clique em "Filtros avançados" ou similar para aparecer.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Termo de busca | `reagente hematologia` |
| UF | Todas (deixar em branco ou selecionar "Todas") |
| Fonte | `PNCP` |
| Tipo de Score | `Score Rápido` |
| Incluir encerrados | `Não` |

📌 **Atenção:** O campo "Tipo de Score" pode aparecer como um dropdown com opções como "Sem Score", "Score Rápido", "Score Híbrido" e "Score Profundo". Selecione `Score Rápido` — é o mais simples e mais veloz.

**O que acontece depois:** O sistema exibe um indicador de carregamento enquanto busca nos portais. Após alguns segundos (pode levar até 30s), uma lista de editais aparece na área de resultados. Cada edital mostra título, órgão, data e possivelmente um score numérico.

✅ **Correto se:** Pelo menos um edital aparece na lista de resultados. Os editais exibidos têm relação com reagentes ou hematologia.
❌ **Problema se:** A busca nunca termina (mais de 60s), ou retorna zero resultados, ou exibe uma mensagem de erro.

---

### Passo 3 — Executar a Busca 2: "kit diagnostico laboratorio" com NCM e UF

**O que fazer:** Limpe o campo de busca anterior (pode haver um botão "Limpar" ou "Nova Busca"). Digite o novo termo e configure os filtros conforme abaixo.

**O que você vai ver na tela:** O campo de busca limpo e os filtros resetados (ou ainda com valores da busca anterior que você deve alterar).

**Dados a informar:**

| Campo | Valor |
|---|---|
| Termo de busca | `kit diagnostico laboratorio` |
| NCM | `3822.19.90` |
| UF | `SP` |
| Fonte | `PNCP` |
| Tipo de Score | `Score Híbrido` |
| Incluir encerrados | `Não` |

📌 **Atenção:** O campo NCM (Nomenclatura Comum do Mercosul) é um código numérico que classifica mercadorias. Digite exatamente `3822.19.90` — este é o código para reagentes de diagnóstico. O campo pode ter máscara automática para os pontos.

**O que acontece depois:** A lista de resultados é atualizada com editais filtrados por SP e pelo NCM informado. O score híbrido pode demorar um pouco mais que o rápido (até 45s).

✅ **Correto se:** Resultados aparecem filtrados para São Paulo, com scores calculados ao lado de cada edital.
❌ **Problema se:** O filtro de NCM não é reconhecido, ou a UF SP não filtra corretamente.

---

### Passo 4 — Executar a Busca 3: "reagente bioquimico" com classificação completa

**O que fazer:** Limpe a busca anterior. Digite o novo termo e configure todos os filtros, incluindo Área, Classe e Subclasse.

**O que você vai ver na tela:** Além dos filtros já conhecidos, devem existir campos para Área, Classe e Subclasse (que vêm da parametrização do Sprint 1).

**Dados a informar:**

| Campo | Valor |
|---|---|
| Termo de busca | `reagente bioquimico` |
| Área | `Diagnóstico in Vitro e Laboratório` |
| Classe | `Reagentes e Kits Diagnósticos` |
| Subclasse | `Kit de Hematologia` |
| Tipo de Score | `Score Profundo` |
| Quantidade máxima | `5` |
| Incluir encerrados | `Sim` |

📌 **Atenção:** O Score Profundo é o mais completo e o mais demorado. Pode levar até 60 segundos ou mais. Não clique em "Buscar" novamente enquanto o sistema estiver processando — aguarde o resultado.

📌 **Atenção:** A opção "Incluir encerrados" agora está como `Sim`. Isso significa que editais já finalizados (prazo de submissão já passou) também vão aparecer nos resultados. Isso é útil para análise de mercado.

**O que acontece depois:** No máximo 5 resultados aparecem (por causa do limite de quantidade). Editais encerrados podem ter uma marcação visual diferente (badge "Encerrado" ou cor diferente).

✅ **Correto se:** Até 5 resultados são exibidos, possivelmente incluindo editais com status "Encerrado". Scores profundos estão calculados.
❌ **Problema se:** Mais de 5 resultados aparecem (o limite não funcionou), ou os campos de Área/Classe/Subclasse não estão disponíveis.

---

### Passo 5 — Executar a Busca 4: "glicose enzimatica laboratorio" sem score

**O que fazer:** Limpe a busca anterior. Configure os filtros para uma busca simples, sem cálculo de score.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Termo de busca | `glicose enzimatica laboratorio` |
| UF | `MG` |
| Tipo de Score | `Sem Score` |
| Incluir encerrados | `Não` |

📌 **Atenção:** Com "Sem Score", o sistema apenas busca os editais sem calcular a compatibilidade com o portfólio. A busca é mais rápida, mas os resultados não terão a nota de aderência.

**O que acontece depois:** Resultados aparecem sem coluna ou badge de score. A busca deve ser mais rápida que as anteriores.

✅ **Correto se:** Resultados aparecem rapidamente, filtrados para MG, sem nenhum score exibido.
❌ **Problema se:** Scores aparecem mesmo com "Sem Score" selecionado, ou o filtro MG não funciona.

---

### Passo 6 — Executar a Busca 5: "material laboratorial" com encerrados

**O que fazer:** Limpe a busca anterior. Execute a última busca do conjunto.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Termo de busca | `material laboratorial` |
| UF | Todas (deixar em branco) |
| Fonte | `PNCP` |
| Tipo de Score | `Score Rápido` |
| Incluir encerrados | `Sim` |

**O que acontece depois:** Uma lista de resultados mais ampla (sem filtro de UF e incluindo encerrados). Os editais encerrados devem estar visualmente diferenciados dos ativos.

✅ **Correto se:** Resultados incluem editais ativos e encerrados, com diferenciação visual entre eles.
❌ **Problema se:** Não há diferenciação visual entre ativos e encerrados, ou a opção "Incluir encerrados" não muda os resultados.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- 5 buscas executadas com sucesso, cada uma retornando resultados relevantes
- Score Rápido, Score Híbrido e Score Profundo calcularam corretamente (quando selecionados)
- "Sem Score" não exibiu scores nos resultados
- Filtros de UF (SP, MG, Todas) funcionaram corretamente
- Filtro de NCM `3822.19.90` filtrou resultados relevantes
- Filtros de Área/Classe/Subclasse funcionaram na Busca 3
- Limite de quantidade (5) respeitado na Busca 3
- Editais encerrados apareceram quando "Incluir encerrados" estava como Sim

**🔴 Sinais de problema:**
- Alguma busca retorna zero resultados (pode indicar problema de conexão com PNCP)
- Score Profundo trava indefinidamente (mais de 120 segundos)
- Filtros não alteram os resultados (sempre mostram os mesmos editais)
- Campo NCM não aceita o formato `3822.19.90`
- Campos Área/Classe/Subclasse não aparecem ou estão vazios

---

## [UC-CV02] Explorar resultados e painel lateral

> **O que este caso de uso faz:** Depois de buscar editais, você precisa ver os detalhes de cada um antes de decidir se vale a pena participar. O painel lateral é uma "ficha resumo" que aparece quando você clica em um edital — mostra informações como órgão comprador, valor estimado, prazo, e qual produto do seu portfólio mais combina com o que o edital pede. É como folhear um catálogo: você vê a capa (lista de resultados) e depois abre a página do item que interessou (painel lateral).

**Onde:** Menu lateral → Captação (mesma tela da busca)
**Quanto tempo leva:** 5 a 10 minutos

---

### Antes de começar

- Você deve ter executado pelo menos a Busca 1 ("reagente hematologia") do UC-CV01 e ter resultados visíveis na tela.
- Se a tela de resultados estiver vazia, volte ao UC-CV01 e execute a Busca 1 novamente.

---

### Passo 1 — Selecionar o primeiro edital da Busca 1

**O que fazer:** Na lista de resultados da Busca 1 ("reagente hematologia"), localize o primeiro edital que tenha um score igual ou superior a 40%. Clique sobre ele (no título ou em um botão "Ver detalhes").

**O que você vai ver na tela:** A lista de editais resultantes da Busca 1. Cada item deve mostrar título, órgão, data e score (se calculado).

**O que acontece depois:** Um painel lateral (ou uma seção expandida) abre ao lado ou abaixo do edital selecionado, mostrando informações detalhadas.

✅ **Correto se:** O painel lateral abre com informações do edital selecionado.
❌ **Problema se:** Nada acontece ao clicar no edital, ou a tela inteira muda em vez de abrir um painel.

---

### Passo 2 — Verificar as informações do painel lateral

**O que fazer:** No painel lateral que abriu, verifique se as seguintes informações estão presentes. Não precisa alterar nada — apenas confira visualmente.

**O que você vai ver na tela:** O painel lateral deve exibir seções ou campos com informações detalhadas do edital.

**Informações que devem estar presentes:**
- Título do edital
- Órgão comprador (nome do órgão público)
- Número do edital ou código PNCP
- Data de abertura e/ou encerramento
- Valor estimado (se disponível)
- Modalidade (pregão, concorrência, etc.)
- Score de aderência (a nota calculada)
- Produto do portfólio com maior compatibilidade

📌 **Atenção:** O produto compatível esperado é `Kit de Reagentes para Hemograma Completo Sysmex XN`. Verifique se este nome (ou algo muito similar) aparece na seção de compatibilidade do painel.

**O que acontece depois:** As informações ficam visíveis no painel para consulta.

✅ **Correto se:** Todas as informações listadas acima estão visíveis no painel. O produto `Kit de Reagentes para Hemograma Completo Sysmex XN` aparece como match.
❌ **Problema se:** O painel está vazio, ou faltam informações essenciais (como o score ou o produto compatível).

---

### Passo 3 — Explorar o segundo edital da Busca 2

**O que fazer:** Execute novamente a Busca 2 ("kit diagnostico laboratorio" com NCM `3822.19.90` e UF `SP`) se a lista não estiver mais visível. Em seguida, clique no segundo edital da lista para abrir seu painel lateral.

**O que você vai ver na tela:** Os resultados da Busca 2 e, após clicar, o painel lateral do segundo edital.

**O que acontece depois:** O painel lateral se atualiza com as informações do segundo edital selecionado.

✅ **Correto se:** O painel lateral se atualizou corretamente, mostrando informações diferentes do primeiro edital. O órgão e o título são de SP.
❌ **Problema se:** O painel continua mostrando informações do edital anterior, ou não atualiza ao clicar em outro edital.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- O painel lateral abre ao clicar em qualquer edital da lista
- As informações do painel são coerentes com o edital selecionado
- O produto `Kit de Reagentes para Hemograma Completo Sysmex XN` apareceu como match no primeiro edital da Busca 1
- Ao trocar de edital, o painel atualiza corretamente
- Score, órgão, data e modalidade estão visíveis

**🔴 Sinais de problema:**
- Painel lateral não abre ao clicar
- Informações do painel não mudam ao selecionar outro edital
- Nenhum produto compatível é exibido (seção de match vazia)
- Score não aparece no painel mesmo tendo sido calculado na busca

---

## [UC-CV03] Salvar edital, itens e scores

> **O que este caso de uso faz:** Encontrou um edital interessante? Agora é hora de salvá-lo para análise posterior. É como marcar uma página de um catálogo com um post-it — o edital fica guardado no sistema para você analisar com calma depois, na tela de Validação. Você pode salvar um edital individual, selecionar vários e salvar em lote, ou até salvar todos os resultados de uma busca de uma vez.

**Onde:** Menu lateral → Captação (mesma tela da busca)
**Quanto tempo leva:** 10 a 15 minutos (3 cenários)

---

### Antes de começar

- As buscas do UC-CV01 devem ter sido executadas com sucesso.
- Você vai trabalhar com os resultados das Buscas 1, 2 e 4.

---

### Passo 1 — Cenário 1: Salvar um edital individual da Busca 1

**O que fazer:** Execute a Busca 1 ("reagente hematologia") se a lista não estiver visível. Na lista de resultados, localize um edital com bom score. Clique no botão "Salvar" (ou ícone de disquete/favorito) que aparece ao lado desse edital específico.

**O que você vai ver na tela:** A lista de editais com um botão de ação em cada linha — pode ser "Salvar", um ícone de estrela, ou um bookmark.

**O que acontece depois:** O sistema salva o edital selecionado. Uma mensagem de confirmação (toast verde) pode aparecer, e o edital pode ganhar um badge visual indicando "Salvo" (ícone preenchido, cor diferente, ou texto "Salvo").

✅ **Correto se:** O edital foi marcado como salvo (badge "Salvo" visível ou ícone alterado) e uma mensagem de confirmação apareceu.
❌ **Problema se:** Nenhuma confirmação visual aparece, ou o botão "Salvar" não responde ao clique.

---

### Passo 2 — Cenário 2: Salvar múltiplos editais selecionados da Busca 2

**O que fazer:** Execute a Busca 2 ("kit diagnostico laboratorio", NCM `3822.19.90`, UF `SP`, Score Híbrido). Na lista de resultados, marque os checkboxes (caixas de seleção) ao lado de 2 editais diferentes. Em seguida, clique no botão "Salvar Selecionados" (pode estar no topo ou na parte inferior da lista).

**O que você vai ver na tela:** A lista de resultados com checkboxes ao lado de cada edital. Ao marcar dois checkboxes, um botão de ação em lote (como "Salvar Selecionados") deve ficar visível ou habilitado.

**Dados a informar:**
- Marcar o checkbox do 1o edital da lista
- Marcar o checkbox do 2o edital da lista
- Clicar em `Salvar Selecionados`

**O que acontece depois:** Os dois editais selecionados são salvos de uma vez. Uma mensagem de confirmação indica quantos foram salvos (ex: "2 editais salvos com sucesso"). Ambos devem exibir o badge "Salvo".

✅ **Correto se:** Os dois editais exibem badge "Salvo" e a mensagem confirma que 2 editais foram salvos.
❌ **Problema se:** Apenas um é salvo, ou o botão "Salvar Selecionados" não aparece após marcar os checkboxes.

---

### Passo 3 — Cenário 3: Salvar todos os editais da Busca 4

**O que fazer:** Execute a Busca 4 ("glicose enzimatica laboratorio", UF `MG`, Sem Score). Na lista de resultados, localize e clique no botão "Salvar Todos" (pode estar no topo da lista ou como uma opção de menu).

**O que você vai ver na tela:** A lista de resultados da Busca 4 e um botão "Salvar Todos" visível.

**O que acontece depois:** Todos os editais da busca são salvos de uma vez. Uma mensagem confirma a quantidade total salva (ex: "X editais salvos com sucesso"). Todos os editais devem exibir o badge "Salvo".

✅ **Correto se:** Todos os editais da lista exibem badge "Salvo" e a mensagem confirma a quantidade total.
❌ **Problema se:** O botão "Salvar Todos" não existe ou não funciona, ou apenas parte dos editais é salva.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Cenário 1: Um edital individual salvo da Busca 1, com badge "Salvo" visível
- Cenário 2: Dois editais salvos em lote da Busca 2, com badge "Salvo" em ambos
- Cenário 3: Todos os editais da Busca 4 salvos de uma vez
- Mensagens de confirmação apareceram em cada cenário
- Os editais salvos estarão disponíveis na tela de Validação (UC-CV07)

**🔴 Sinais de problema:**
- Botão "Salvar Selecionados" não aparece ao marcar checkboxes
- Botão "Salvar Todos" não existe na interface
- Badge "Salvo" não aparece após a ação
- Mensagem de erro ao tentar salvar
- Editais não aparecem depois na tela de Validação

---

## [UC-CV04] Definir estratégia

> **O que este caso de uso faz:** Após salvar os editais, você pode definir qual a "estratégia" da empresa para aquele tipo de oportunidade. A estratégia define a abordagem comercial — por exemplo, se a empresa vai disputar agressivamente (Estratégico), apenas monitorar (Acompanhamento), ou usar o edital para aprender sobre o mercado (Aprendizado). Junto com a estratégia, você define a margem mínima de lucro e se essa margem varia por produto ou região. Pense nisso como classificar as oportunidades em gavetas: "prioridade alta", "ficar de olho" e "estudar para o futuro".

**Onde:** Menu lateral → Captação (na interface de resultados ou no edital salvo)
**Quanto tempo leva:** 10 minutos (3 estratégias)

---

### Antes de começar

- Os editais do UC-CV03 devem estar salvos.
- Este passo pode ser feito na tela de Captação (junto aos resultados) ou na tela de Validação (nos editais salvos) — depende da interface do sistema.

---

### Passo 1 — Definir Estratégia 1: Estratégico para reagentes

**O que fazer:** Localize um edital salvo da Busca 1 ("reagente hematologia"). Abra seu painel ou acesse a opção de "Definir Estratégia" (pode ser um botão, um dropdown, ou uma aba no painel lateral).

**O que você vai ver na tela:** Um formulário ou modal para definir a estratégia do edital, com campos como Tipo de Estratégia, Margem Mínima e opções de variação.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo de Estratégia | `Estratégico` |
| Margem Mínima (%) | `20` |
| Varia por Produto | `Não` |
| Varia por Região | `Não` |

**O que acontece depois:** Após salvar, o edital exibe um indicador de estratégia (ex: badge "Estratégico" ou ícone específico). Uma mensagem de confirmação aparece.

✅ **Correto se:** A estratégia "Estratégico" com margem 20% foi salva e está visível no edital.
❌ **Problema se:** O campo de margem não aceita o valor 20, ou a estratégia não é exibida após salvar.

---

### Passo 2 — Definir Estratégia 2: Acompanhamento para glicose

**O que fazer:** Localize um edital salvo da Busca 4 ("glicose enzimatica laboratorio"). Acesse a opção de "Definir Estratégia".

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo de Estratégia | `Acompanhamento` |
| Margem Mínima (%) | `15` |
| Varia por Produto | `Sim` |
| Varia por Região | `Sim` |

📌 **Atenção:** Neste cenário, tanto "Varia por Produto" quanto "Varia por Região" estão como `Sim`. Isso indica que a margem de 15% é uma referência, mas pode ser ajustada dependendo do produto e da região. Verifique se o sistema aceita essas duas variações simultâneas.

**O que acontece depois:** A estratégia "Acompanhamento" com margem 15% e variações ativadas é exibida no edital.

✅ **Correto se:** Estratégia "Acompanhamento" salva com margem 15%, variação por produto e por região ambas ativas.
❌ **Problema se:** O sistema não permite ativar ambas as variações ao mesmo tempo, ou a margem não salva.

---

### Passo 3 — Definir Estratégia 3: Aprendizado genérico

**O que fazer:** Localize outro edital salvo (pode ser da Busca 2 ou qualquer outro salvo). Acesse a opção de "Definir Estratégia".

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo de Estratégia | `Aprendizado` |
| Margem Mínima (%) | `5` |
| Varia por Produto | `Não` |
| Varia por Região | `Não` |

**O que acontece depois:** A estratégia "Aprendizado" com margem 5% é salva.

✅ **Correto se:** Estratégia "Aprendizado" salva com margem 5%, sem variações.
❌ **Problema se:** O tipo "Aprendizado" não está disponível na lista de opções.

---

### Passo 4 — Verificar persistência das estratégias

**O que fazer:** Navegue para outra página (ex: Dashboard) e depois volte à tela onde os editais com estratégias definidas estão. Verifique se as estratégias ainda estão visíveis.

**O que você vai ver na tela:** Os editais com seus respectivos badges de estratégia (Estratégico, Acompanhamento, Aprendizado).

**O que acontece depois:** As estratégias permanecem associadas aos editais mesmo após navegar para fora da página.

✅ **Correto se:** Todas as três estratégias estão visíveis nos respectivos editais após navegar e voltar.
❌ **Problema se:** As estratégias desaparecem ao sair da página e voltar.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Estratégia 1: "Estratégico", margem 20%, sem variações — salvo e visível
- Estratégia 2: "Acompanhamento", margem 15%, variação por produto e região — salvo e visível
- Estratégia 3: "Aprendizado", margem 5%, sem variações — salvo e visível
- Todas as estratégias persistem após navegar entre páginas
- Mensagens de confirmação apareceram ao salvar cada estratégia

**🔴 Sinais de problema:**
- Tipos de estratégia (Estratégico, Acompanhamento, Aprendizado) não disponíveis
- Campo de margem não aceita valores numéricos
- Variação por Produto e por Região não podem ser ativadas simultaneamente
- Estratégias não persistem (somem ao recarregar a página)

---

## [UC-CV05] Exportar e consolidar

> **O que este caso de uso faz:** Às vezes você precisa compartilhar os resultados da busca com alguém que não tem acesso ao sistema — um diretor, um assessor jurídico, ou um parceiro comercial. Este caso de uso permite exportar os resultados em dois formatos: CSV (uma planilha que abre no Excel) e Relatório Completo (um documento mais detalhado). É como tirar uma fotocópia dos resultados para levar para uma reunião.

**Onde:** Menu lateral → Captação (na tela de resultados da busca)
**Quanto tempo leva:** 5 minutos

---

### Antes de começar

- Você vai executar duas buscas (Busca 1 e Busca 5 do UC-CV01) e exportar os resultados de cada uma em um formato diferente.

---

### Passo 1 — Exportar resultados em CSV (Busca 1)

**O que fazer:** Execute a Busca 1 ("reagente hematologia", Todas UFs, PNCP, Score Rápido, encerrados=Não). Com os resultados visíveis, localize e clique no botão "Exportar CSV" (pode estar no topo ou no rodapé da lista de resultados, ou em um menu de ações).

**O que você vai ver na tela:** A lista de resultados da Busca 1 e um botão de exportação (pode ser "Exportar", "CSV", ou um ícone de download).

**O que acontece depois:** O navegador inicia o download de um arquivo `.csv`. Dependendo das configurações do seu navegador, o arquivo pode ser salvo automaticamente na pasta de Downloads ou perguntar onde salvar.

✅ **Correto se:** Um arquivo CSV é baixado com sucesso. Se você abri-lo no Excel ou em um editor de texto, ele contém os dados dos editais (título, órgão, score, etc.) em formato tabular.
❌ **Problema se:** Nenhum download acontece, ou o arquivo baixado está vazio ou corrompido.

---

### Passo 2 — Exportar Relatório Completo (Busca 5)

**O que fazer:** Execute a Busca 5 ("material laboratorial", Todas UFs, PNCP, Score Rápido, encerrados=Sim). Com os resultados visíveis, localize e clique no botão "Relatório Completo" (pode estar ao lado do botão CSV, ou em um submenu de exportação).

**O que você vai ver na tela:** A lista de resultados da Busca 5 e o botão de geração de relatório.

**O que acontece depois:** O sistema gera um relatório mais detalhado (pode ser um PDF, um documento formatado, ou uma página nova com os dados consolidados). O download inicia ou o relatório abre em uma nova aba.

✅ **Correto se:** O relatório é gerado com sucesso e contém informações detalhadas dos editais (mais completo que o CSV).
❌ **Problema se:** O botão "Relatório Completo" não existe, ou o relatório não é gerado, ou exibe erro.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- CSV da Busca 1 foi baixado com dados dos editais em formato de planilha
- Relatório Completo da Busca 5 foi gerado com informações detalhadas
- Ambos os formatos contêm dados coerentes com os resultados exibidos na tela

**🔴 Sinais de problema:**
- Botão de exportação não existe ou não responde
- Arquivo baixado está vazio (0 bytes) ou corrompido
- Relatório Completo trava ou não é gerado
- Dados no arquivo exportado não correspondem aos resultados da busca

---

## [UC-CV06] Gerir monitoramentos

> **O que este caso de uso faz:** Em vez de buscar editais manualmente todos os dias, você pode criar "monitoramentos" — são buscas automáticas que o sistema executa periodicamente (a cada 6, 12 ou 24 horas) e avisa quando encontra novos editais compatíveis. É como contratar um assistente que fica de olho no portal de compras e te manda um recado toda vez que aparece algo interessante. Você define os critérios uma vez e o sistema cuida do resto.

**Onde:** Menu lateral → Captação (aba ou seção de Monitoramentos)
**Quanto tempo leva:** 15 a 20 minutos (3 monitoramentos + operações de ciclo de vida)

---

### Antes de começar

- Certifique-se de estar na tela de Captação.
- Procure uma aba, botão ou seção chamada "Monitoramentos", "Alertas" ou "Buscas Automáticas". Pode estar no topo da página de Captação ou como um item separado no menu.

---

### Passo 1 — Criar o Monitoramento 1: Reagentes de hematologia

**O que fazer:** Clique no botão para criar um novo monitoramento (pode ser "+ Novo Monitoramento", "Criar Alerta", ou similar). Preencha os campos conforme a tabela abaixo.

**O que você vai ver na tela:** Um formulário com campos para definir os critérios do monitoramento (termo de busca, NCM, UFs, fonte, intervalo, score mínimo, etc.).

**Dados a informar:**

| Campo | Valor |
|---|---|
| Termo de busca | `reagente hematologia hemograma` |
| NCM | `3822.19.90` |
| UFs | `SP, MG, PR, RS` |
| Fonte | `PNCP` |
| Intervalo | `6h` (a cada 6 horas) |
| Score mínimo | `50` |
| Incluir encerrados | `Não` |

📌 **Atenção:** O campo UFs pode permitir seleção múltipla (checkboxes ou lista com Ctrl+clique). Selecione os 4 estados: SP, MG, PR e RS.

**O que acontece depois:** O monitoramento é criado e aparece em uma lista de monitoramentos ativos, com status "Ativo" ou similar.

✅ **Correto se:** Monitoramento criado com status "Ativo", exibindo os critérios configurados.
❌ **Problema se:** O formulário não aceita múltiplas UFs, ou o monitoramento não é criado.

---

### Passo 2 — Criar o Monitoramento 2: Reagentes bioquímicos

**O que fazer:** Crie um segundo monitoramento com os dados abaixo.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Termo de busca | `reagente bioquimico glicose colesterol` |
| NCM | `3822.19.90` |
| UFs | Todas (deixar em branco ou selecionar "Todas") |
| Fonte | `PNCP` |
| Intervalo | `24h` (a cada 24 horas) |
| Score mínimo | `40` |
| Incluir encerrados | `Sim` |

**O que acontece depois:** O segundo monitoramento aparece na lista, com status "Ativo".

✅ **Correto se:** Dois monitoramentos ativos na lista.
❌ **Problema se:** O sistema não permite criar mais de um monitoramento.

---

### Passo 3 — Criar o Monitoramento 3: Material laboratorial genérico

**O que fazer:** Crie o terceiro e último monitoramento.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Termo de busca | `material laboratorio clinico` |
| NCM | (deixar em branco — campo vazio) |
| UFs | `SP` |
| Fonte | `PNCP` |
| Intervalo | `12h` (a cada 12 horas) |
| Score mínimo | `30` |
| Incluir encerrados | `Não` |

📌 **Atenção:** O campo NCM está **intencionalmente vazio** neste monitoramento. Isso testa se o sistema aceita monitoramentos sem filtro de NCM (busca mais ampla).

**O que acontece depois:** Três monitoramentos ativos na lista.

✅ **Correto se:** Três monitoramentos listados, todos com status "Ativo".
❌ **Problema se:** O sistema exige NCM obrigatoriamente, ou não permite criar o terceiro monitoramento.

---

### Passo 4 — Pausar o Monitoramento 2

**O que fazer:** Na lista de monitoramentos, localize o Monitoramento 2 ("reagente bioquimico glicose colesterol"). Clique no botão "Pausar" (pode ser um ícone de pausa, um toggle, ou uma opção em um menu de ações).

**O que você vai ver na tela:** A lista com três monitoramentos, cada um com botões de ação (Pausar, Editar, Excluir, etc.).

**O que acontece depois:** O status do Monitoramento 2 muda para "Pausado" (ou "Inativo"). Os outros dois permanecem "Ativo".

✅ **Correto se:** Monitoramento 2 com status "Pausado", Monitoramentos 1 e 3 com status "Ativo".
❌ **Problema se:** Todos os monitoramentos são pausados, ou o status não muda.

---

### Passo 5 — Atualizar o Monitoramento 1

**O que fazer:** Na lista de monitoramentos, clique em "Editar" no Monitoramento 1 ("reagente hematologia hemograma"). Altere o score mínimo de `50` para `60` e salve.

**O que você vai ver na tela:** O formulário de edição com os dados atuais do Monitoramento 1.

**Dados a alterar:**

| Campo | Valor anterior | Novo valor |
|---|---|---|
| Score mínimo | `50` | `60` |

**O que acontece depois:** O monitoramento é atualizado com o novo score mínimo. Uma mensagem de confirmação aparece.

✅ **Correto se:** O score mínimo do Monitoramento 1 agora exibe `60` na lista.
❌ **Problema se:** O valor não muda após salvar, ou o monitoramento é duplicado em vez de atualizado.

---

### Passo 6 — Retomar o Monitoramento 2

**O que fazer:** Na lista de monitoramentos, localize o Monitoramento 2 (que está pausado). Clique em "Retomar" (ou "Ativar", "Play", ou similar).

**O que acontece depois:** O status do Monitoramento 2 volta para "Ativo".

✅ **Correto se:** Monitoramento 2 com status "Ativo" novamente. Todos os três monitoramentos ativos.
❌ **Problema se:** O botão "Retomar" não existe, ou o status não muda.

---

### Passo 7 — Excluir o Monitoramento 3

**O que fazer:** Na lista de monitoramentos, localize o Monitoramento 3 ("material laboratorio clinico"). Clique em "Excluir" (ou ícone de lixeira). Confirme a exclusão se o sistema pedir confirmação.

**O que acontece depois:** O Monitoramento 3 é removido da lista. Restam apenas os Monitoramentos 1 e 2.

✅ **Correto se:** Apenas dois monitoramentos restam na lista (1 e 2), ambos com status "Ativo".
❌ **Problema se:** O monitoramento não é excluído, ou a exclusão apaga o monitoramento errado.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Três monitoramentos foram criados com sucesso (um com NCM vazio aceito)
- O ciclo de vida completo foi testado: Criar → Pausar → Atualizar → Retomar → Excluir
- Ao final, restam 2 monitoramentos ativos:
  - Mon 1: "reagente hematologia hemograma", score mínimo `60` (atualizado), 4 UFs, 6h
  - Mon 2: "reagente bioquimico glicose colesterol", score mínimo `40`, Todas UFs, 24h
- O Mon 3 foi excluído com sucesso

**🔴 Sinais de problema:**
- Sistema não permite criar monitoramento com NCM vazio
- Pausa e retomada não funcionam (status não muda)
- Edição duplica o monitoramento em vez de atualizá-lo
- Exclusão não funciona ou apaga o monitoramento errado
- Múltiplas UFs não podem ser selecionadas

---

## [UC-CV07] Listar editais salvos (ValidaçãoPage)

> **O que este caso de uso faz:** Agora entramos na fase de Validação — onde os editais salvos na Captação são analisados com mais profundidade. A tela de Validação funciona como uma "mesa de trabalho" onde ficam todos os editais que você guardou. Aqui você pode filtrar por status (Novo, GO, NO-GO, Em Avaliação), buscar por palavras, e abrir cada edital para uma análise detalhada com 6 abas diferentes (Aderência, Lotes, Documentos, Riscos, Mercado e IA).

**Onde:** Menu lateral → Validação
**Quanto tempo leva:** 5 a 10 minutos

---

### Antes de começar

- Os editais devem ter sido salvos no UC-CV03 (pelo menos 3 editais salvos).
- Você vai sair da tela de Captação e ir para a tela de Validação.

---

### Passo 1 — Navegar até a página de Validação

**O que fazer:** No menu lateral à esquerda, localize e clique na opção "Validação". Isso vai abrir a tela de validação com a lista de editais salvos.

**O que você vai ver na tela:** Uma página com uma lista de cards (ou linhas) representando os editais salvos. Deve haver filtros no topo (Status, busca por texto) e cada edital deve exibir título, órgão, status e possivelmente o score.

**O que acontece depois:** A lista de editais salvos é exibida. Se os editais foram salvos no UC-CV03, eles devem estar aqui.

✅ **Correto se:** A tela de Validação carrega e exibe os editais salvos anteriormente.
❌ **Problema se:** A tela está vazia (nenhum edital aparece), ou exibe erro ao carregar.

---

### Passo 2 — Filtrar por Status: Todos

**O que fazer:** No filtro de Status, selecione "Todos" (pode já estar selecionado por padrão). Verifique que todos os editais salvos aparecem na lista.

**O que você vai ver na tela:** A lista completa de editais salvos, independente do status.

**O que acontece depois:** Todos os editais salvos são exibidos.

✅ **Correto se:** Todos os editais salvos (dos 3 cenários do UC-CV03) estão visíveis.
❌ **Problema se:** Faltam editais que foram salvos anteriormente.

---

### Passo 3 — Filtrar por Status: Novo

**O que fazer:** No filtro de Status, selecione "Novo". Este é o status padrão dos editais recém-salvos que ainda não foram analisados.

**O que você vai ver na tela:** Apenas os editais com status "Novo" — ou seja, todos os que você salvou (já que nenhum foi analisado ainda).

**O que acontece depois:** A lista é filtrada mostrando apenas editais com status "Novo".

✅ **Correto se:** Os editais recém-salvos aparecem com status "Novo".
❌ **Problema se:** Nenhum edital aparece com filtro "Novo", ou editais com outros status aparecem.

---

### Passo 4 — Buscar por texto: "reagente"

**O que fazer:** No campo de busca por texto (pode estar no topo da lista), digite `reagente` e pressione Enter ou clique em "Buscar".

**O que você vai ver na tela:** Um campo de busca/filtro e a lista de editais.

**O que acontece depois:** A lista é filtrada mostrando apenas editais cujo título ou descrição contém a palavra "reagente".

✅ **Correto se:** Apenas editais relacionados a "reagente" são exibidos.
❌ **Problema se:** O filtro de texto não funciona, ou mostra editais sem relação com "reagente".

---

### Passo 5 — Buscar por texto: "glicose"

**O que fazer:** Limpe o campo de busca e digite `glicose`. Pressione Enter.

**O que acontece depois:** A lista mostra apenas editais relacionados a "glicose" (da Busca 4 do UC-CV01).

✅ **Correto se:** Editais de "glicose enzimatica" aparecem na lista filtrada.
❌ **Problema se:** Nenhum resultado, ou resultados incorretos.

---

### Passo 6 — Selecionar um edital e verificar as 6 abas

**O que fazer:** Limpe o filtro de busca. Localize um edital da Busca 1 ("reagente hematologia") e clique nele para abrir a tela de análise detalhada.

**O que você vai ver na tela:** A tela de detalhes do edital, com um card de informações no topo e 6 abas de análise abaixo:
1. **Aderência** — scores e decisão GO/NO-GO
2. **Lotes** — itens e agrupamento em lotes
3. **Documentos** — documentação exigida
4. **Riscos** — análise de riscos e concorrentes
5. **Mercado** — análise de mercado
6. **IA** — resumo e perguntas por inteligência artificial

**O que acontece depois:** A tela de detalhes do edital é exibida com as 6 abas disponíveis.

✅ **Correto se:** O card do edital exibe informações corretas e as 6 abas estão visíveis e clicáveis.
❌ **Problema se:** Faltam abas, ou a tela de detalhes não carrega.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- A tela de Validação lista todos os editais salvos no UC-CV03
- Os filtros de Status (Todos, Novo) funcionam corretamente
- A busca por texto ("reagente", "glicose") filtra os resultados corretamente
- Ao clicar em um edital, a tela de detalhes abre com as 6 abas visíveis
- O card do edital mostra título, órgão, status e score

**🔴 Sinais de problema:**
- Editais salvos não aparecem na tela de Validação
- Filtros de Status não alteram a lista
- Busca por texto não encontra editais conhecidos
- Tela de detalhes não carrega ou faltam abas

---

## [UC-CV08] Calcular scores e decidir

> **O que este caso de uso faz:** Este é o momento da decisão — o sistema calcula uma nota detalhada de aderência do edital ao perfil da empresa, considerando 6 dimensões diferentes (técnica, documental, financeira, etc.). Baseado nessa análise, você decide se a empresa vai participar (GO), não vai participar (NO-GO), ou se precisa investigar mais (Em Avaliação). É como o check-up final antes de inscrever a empresa numa corrida: o sistema avalia se você tem o equipamento certo, a documentação em dia e o preparo físico necessário.

**Onde:** Menu lateral → Validação → (selecionar edital) → aba Aderência
**Quanto tempo leva:** 15 a 20 minutos (2 decisões)

---

### Antes de começar

- Você deve ter selecionado um edital na tela de Validação (UC-CV07) e estar na tela de detalhes.
- Se necessário, navegue para Validação e clique em um edital de "reagente hematologia".

---

### Passo 1 — Acessar a aba Aderência

**O que fazer:** Na tela de detalhes do edital, clique na aba "Aderência" (pode ser a primeira aba, já selecionada por padrão).

**O que você vai ver na tela:** Uma seção dedicada à análise de aderência, possivelmente com um botão para calcular os scores (se ainda não foram calculados) e áreas para exibir as 6 dimensões de avaliação.

**O que acontece depois:** A aba de Aderência é exibida.

✅ **Correto se:** A aba Aderência está aberta e há um botão para calcular scores ou os scores já estão exibidos.
❌ **Problema se:** A aba não abre ou exibe erro.

---

### Passo 2 — Calcular scores de aderência

**O que fazer:** Clique no botão "Calcular Scores" (ou "Analisar Aderência", "Avaliar", ou similar). O sistema vai processar os dados do edital e do portfólio para gerar as notas.

**O que você vai ver na tela:** O botão de cálculo e, após clicar, um indicador de processamento (spinner, barra de progresso, etc.).

**O que acontece depois:** Após o processamento (pode levar 15-45 segundos), as 6 dimensões de score aparecem na tela, cada uma com uma nota e possivelmente um indicador visual (barra, cor, etc.).

**Dimensões esperadas e faixas de referência:**

| Dimensão | Faixa esperada |
|---|---|
| Técnica | 60–90% |
| Documental | 50–80% |
| Financeira | 40–75% |
| Experiência | 45–80% |
| Geográfica | 30–70% |
| Prazo | 50–85% |

📌 **Atenção:** Os valores exatos dependem dos dados do edital encontrado. O importante é que as 6 dimensões sejam exibidas com valores numéricos dentro de faixas razoáveis (entre 0% e 100%).

✅ **Correto se:** As 6 dimensões de score são exibidas com valores numéricos e indicadores visuais.
❌ **Problema se:** O cálculo trava, ou menos de 6 dimensões são exibidas, ou todos os valores são 0% ou 100%.

---

### Passo 3 — Decidir GO (Participar)

**O que fazer:** Após analisar os scores, localize os botões de decisão. Clique em "Participar (GO)" (ou "GO", "Aprovar", ou similar). O sistema pode pedir um motivo e detalhes — preencha conforme abaixo.

**O que você vai ver na tela:** Botões de decisão (GO, NO-GO, Em Avaliação) e possivelmente um campo de texto para justificativa.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Decisão | `Participar (GO)` |
| Motivo | `Boa aderência técnica` |
| Detalhes | `Kit Sysmex XN atende todos os parâmetros do edital. Empresa possui AFE vigente e documentação fiscal completa.` |

**O que acontece depois:** O status do edital muda para "GO" (ou "Aprovado", "Participar"). O card do edital na lista de Validação deve refletir esse novo status.

✅ **Correto se:** Status mudou para "GO", com o motivo e detalhes salvos. A cor ou badge do edital mudou para indicar aprovação (geralmente verde).
❌ **Problema se:** O status não muda, ou o motivo/detalhes não são salvos.

---

### Passo 4 — Decidir Em Avaliação para outro edital

**O que fazer:** Volte à lista de Validação (clicando em "Voltar" ou no menu lateral → Validação). Selecione outro edital (diferente do que recebeu GO). Acesse a aba Aderência e, após verificar os scores, clique em "Acompanhar (Em Avaliação)" (ou "Em Análise", ou similar).

**O que você vai ver na tela:** A tela de detalhes de outro edital, com a aba Aderência e os botões de decisão.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Decisão | `Acompanhar (Em Avaliação)` |
| Motivo | `Pendência documental` |
| Detalhes | `Necessário atualizar atestado de capacidade técnica antes de participar. Demais critérios atendem.` |

**O que acontece depois:** O status do edital muda para "Em Avaliação". O badge na lista reflete o novo status (geralmente amarelo ou laranja).

✅ **Correto se:** Status mudou para "Em Avaliação", com motivo e detalhes salvos.
❌ **Problema se:** O status não muda, ou a opção "Em Avaliação" não está disponível.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Scores de aderência calculados com 6 dimensões visíveis e valores numéricos
- Decisão GO aplicada ao primeiro edital com motivo "Boa aderência técnica" e detalhes salvos
- Decisão Em Avaliação aplicada ao segundo edital com motivo "Pendência documental" e detalhes salvos
- Na lista de Validação, os dois editais exibem seus respectivos status atualizados (GO e Em Avaliação)
- Os badges/cores refletem os status: GO (verde), Em Avaliação (amarelo/laranja)

**🔴 Sinais de problema:**
- Cálculo de scores trava ou retorna erros
- Menos de 6 dimensões de aderência são exibidas
- Botões de decisão (GO, Em Avaliação) não respondem
- Motivo e detalhes não são salvos com a decisão
- Status não atualiza na lista de Validação após a decisão

---

## [UC-CV09] Importar itens e extrair lotes

> **O que este caso de uso faz:** Um edital de licitação pode ter dezenas de itens — cada reagente, cada kit, cada material de consumo é listado separadamente. Este caso de uso permite importar automaticamente esses itens do portal PNCP e depois agrupá-los em "lotes" usando inteligência artificial. É como receber uma lista de compras do mercado e organizá-la por corredor: hematologia numa seção, bioquímica em outra, material de consumo em outra. Isso facilita a montagem da proposta comercial.

**Onde:** Menu lateral → Validação → (selecionar edital) → aba Lotes
**Quanto tempo leva:** 15 a 20 minutos

---

### Antes de começar

- Selecione o edital que recebeu decisão GO no UC-CV08 (o de "reagente hematologia").
- Navegue até a tela de detalhes deste edital.

---

### Passo 1 — Acessar a aba Lotes

**O que fazer:** Na tela de detalhes do edital, clique na aba "Lotes".

**O que você vai ver na tela:** Uma seção possivelmente vazia (sem itens importados ainda) e botões para importar itens e extrair lotes.

**O que acontece depois:** A aba de Lotes é exibida.

✅ **Correto se:** A aba Lotes está aberta com botões de ação visíveis.
❌ **Problema se:** A aba não abre ou não tem nenhum botão de ação.

---

### Passo 2 — Importar itens do PNCP

**O que fazer:** Clique no botão "Buscar Itens no PNCP" (ou "Importar Itens", "Carregar Itens", ou similar). O sistema vai consultar o portal PNCP e trazer os itens listados no edital.

**O que você vai ver na tela:** O botão de importação e, após clicar, um indicador de carregamento.

**O que acontece depois:** Após o processamento (pode levar 10-30 segundos), uma lista de itens aparece na aba. Os itens esperados para um edital de reagentes laboratoriais são:

| # | Item esperado |
|---|---|
| 1 | Reagente para hemograma completo |
| 2 | Diluente para hematologia |
| 3 | Lisante para hematologia |
| 4 | Calibrador hematológico |
| 5 | Controle hematológico |
| 6 | Reagente de glicose GOD-PAP |
| 7 | Reagente de colesterol |
| 8 | Ponteiras descartáveis |

📌 **Atenção:** Os nomes exatos podem variar dependendo do edital real encontrado. O importante é que itens relacionados a reagentes, diluentes, calibradores e material de consumo laboratorial apareçam. O total esperado é de aproximadamente 8 itens.

✅ **Correto se:** Uma lista de itens laboratoriais aparece (aproximadamente 8 itens), com descrições coerentes com reagentes e material de laboratório.
❌ **Problema se:** Nenhum item é importado, ou os itens não têm relação com o edital.

---

### Passo 3 — Extrair lotes via IA

**O que fazer:** Com os itens importados visíveis, clique no botão "Extrair Lotes via IA" (ou "Agrupar em Lotes", "Organizar Lotes", ou similar). A inteligência artificial vai analisar os itens e organizá-los em grupos lógicos.

**O que você vai ver na tela:** Os itens listados e o botão de extração de lotes.

**O que acontece depois:** Após o processamento da IA (pode levar 15-45 segundos), os itens são reorganizados em lotes:

| Lote | Nome esperado | Itens |
|---|---|---|
| Lote 1 | Hematologia | Itens 1–5 (reagente hemograma, diluente, lisante, calibrador, controle) |
| Lote 2 | Bioquímica | Itens 6–7 (glicose GOD-PAP, colesterol) |
| Lote 3 | Material de Consumo | Item 8 (ponteiras) |

✅ **Correto se:** Os itens foram agrupados em 3 lotes com nomes descritivos e distribuição lógica.
❌ **Problema se:** A IA não consegue agrupar (erro), ou coloca todos os itens em um único lote, ou cria lotes sem sentido.

---

### Passo 4 — Mover item entre lotes

**O que fazer:** Localize o item 8 (ponteiras) no Lote 3 (Material de Consumo). Arraste-o para o Lote 1 (Hematologia) ou use uma opção de "Mover para..." e selecione "Lote 1".

**O que você vai ver na tela:** Os 3 lotes com seus itens. Cada item pode ter uma opção de arrastar ou um menu de contexto para mover.

**O que acontece depois:** O item 8 (ponteiras) sai do Lote 3 e passa para o Lote 1. O Lote 3 fica vazio.

✅ **Correto se:** O item 8 agora está listado no Lote 1, e o Lote 3 está vazio.
❌ **Problema se:** O item não pode ser movido, ou é duplicado em vez de transferido.

---

### Passo 5 — Excluir lote vazio

**O que fazer:** O Lote 3 agora está vazio (sem nenhum item). Localize a opção para excluir este lote (ícone de lixeira, botão "Excluir Lote", ou similar). Clique para excluí-lo.

**O que você vai ver na tela:** O Lote 3 vazio e um botão/ícone de exclusão.

**O que acontece depois:** O Lote 3 é removido. Restam apenas Lote 1 (Hematologia, 6 itens) e Lote 2 (Bioquímica, 2 itens).

✅ **Correto se:** Apenas 2 lotes restam — Lote 1 com 6 itens e Lote 2 com 2 itens.
❌ **Problema se:** O sistema não permite excluir o lote, ou exclui o lote errado.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Itens importados do PNCP (aproximadamente 8 itens de reagentes e material laboratorial)
- IA agrupou os itens em 3 lotes com nomes descritivos
- Item 8 (ponteiras) foi movido do Lote 3 para o Lote 1 com sucesso
- Lote 3 (vazio) foi excluído com sucesso
- Resultado final: 2 lotes — Lote 1 (Hematologia, 6 itens) e Lote 2 (Bioquímica, 2 itens)

**🔴 Sinais de problema:**
- Importação de itens do PNCP falha ou retorna vazio
- IA não consegue agrupar os itens (erro de processamento)
- Não é possível mover itens entre lotes
- Não é possível excluir lotes vazios
- Itens desaparecem ao mover entre lotes

---

## [UC-CV10] Confrontar documentação

> **O que este caso de uso faz:** Cada edital exige uma série de documentos da empresa para habilitação — certidões fiscais, alvarás, registros técnicos, etc. Este caso de uso usa inteligência artificial para identificar quais documentos o edital exige, verifica quais a empresa já possui (cadastrados no Sprint 1) e sinaliza o que está faltando ou vencido. Para uma empresa de reagentes laboratoriais, documentos como AFE ANVISA e Licença Sanitária são obrigatórios — o sistema precisa identificar isso automaticamente. Pense nisso como um checklist de embarque: antes de viajar, você confere se tem passaporte, visto e vacinas em dia.

**Onde:** Menu lateral → Validação → (selecionar edital) → aba Documentos
**Quanto tempo leva:** 10 a 15 minutos

---

### Antes de começar

- Selecione o mesmo edital do UC-CV09 (o de "reagente hematologia" com decisão GO).
- Os documentos da empresa (UC-F03 do Sprint 1) devem estar cadastrados para que a confrontação funcione.

---

### Passo 1 — Acessar a aba Documentos

**O que fazer:** Na tela de detalhes do edital, clique na aba "Documentos".

**O que você vai ver na tela:** Uma seção dedicada à análise de documentação, possivelmente com categorias de documentos e botões para ações automatizadas.

**O que acontece depois:** A aba de Documentos é exibida.

✅ **Correto se:** A aba Documentos está aberta com seções de categorias de documentos visíveis.
❌ **Problema se:** A aba não abre ou exibe erro.

---

### Passo 2 — Identificar documentos exigidos pelo edital

**O que fazer:** Clique no botão "Identificar Documentos Exigidos" (ou "Analisar Exigências", "Extrair Documentos", ou similar). O sistema vai usar IA para ler o edital e identificar quais documentos são obrigatórios.

**O que você vai ver na tela:** O botão de identificação e, após clicar, um indicador de processamento.

**O que acontece depois:** A IA processa o edital e lista as categorias de documentos exigidos. Para um edital de reagentes laboratoriais, as categorias esperadas são:

| Categoria | Documentos específicos para reagentes |
|---|---|
| Habilitação Jurídica | Contrato Social, Procuração |
| Regularidade Fiscal | Certidão Federal, FGTS, Trabalhista |
| Qualificação Técnica | AFE ANVISA (Autorização de Funcionamento) |
| Sanitárias | Licença Sanitária, Registro ANVISA, Certificado de Boas Práticas, Laudo de Estabilidade |
| Qualificação Econômica | Balanço Patrimonial, Certidão Negativa de Falência |

📌 **Atenção:** Os documentos específicos para reagentes são especialmente importantes: **AFE ANVISA**, **Licença Sanitária**, **Registro ANVISA**, **Certificado de Boas Práticas** e **Laudo de Estabilidade**. Estes devem ser identificados pela IA porque são obrigatórios para empresas que vendem reagentes para laboratório.

✅ **Correto se:** As categorias de documentos aparecem listadas, incluindo documentos específicos do segmento de reagentes.
❌ **Problema se:** A IA não identifica documentos do setor sanitário/ANVISA, ou o processamento falha.

---

### Passo 3 — Buscar documentos exigidos na base da empresa

**O que fazer:** Clique no botão "Buscar Documentos Exigidos" (ou "Confrontar com Empresa", "Verificar Disponibilidade", ou similar). O sistema vai comparar os documentos exigidos pelo edital com os que a empresa já possui cadastrados.

**O que você vai ver na tela:** O botão de busca/confrontação e a lista de documentos exigidos.

**O que acontece depois:** Cada documento exigido recebe um indicador de status:
- Verde: a empresa possui o documento e ele está válido
- Amarelo: a empresa possui mas está próximo do vencimento
- Vermelho: a empresa não possui ou está vencido

✅ **Correto se:** Os documentos são confrontados com indicadores de status (verde/amarelo/vermelho) para cada um.
❌ **Problema se:** A confrontação não funciona, ou todos os documentos aparecem com o mesmo status.

---

### Passo 4 — Verificar certidões

**O que fazer:** Clique no botão "Verificar Certidões" (ou "Atualizar Certidões", "Consultar Certidões Online", ou similar). O sistema vai verificar o status das certidões fiscais da empresa.

**O que você vai ver na tela:** O botão de verificação e a seção de certidões dentro da aba de Documentos.

**O que acontece depois:** As certidões são verificadas e seus status atualizados na tela (pode consultar APIs externas ou verificar as datas de validade cadastradas).

✅ **Correto se:** As certidões são verificadas e seus status atualizados na tela.
❌ **Problema se:** A verificação falha ou não retorna resultados.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- A IA identificou as categorias de documentos exigidos (Habilitação Jurídica, Regularidade Fiscal, Qualificação Técnica, Sanitárias, Qualificação Econômica)
- Documentos específicos para reagentes foram identificados: AFE ANVISA, Licença Sanitária, Registro ANVISA, Certificado de Boas Práticas, Laudo de Estabilidade
- A confrontação com a base da empresa mostrou indicadores de status (verde/amarelo/vermelho) para cada documento
- A verificação de certidões foi executada com sucesso

**🔴 Sinais de problema:**
- IA não identifica documentos do segmento de reagentes/ANVISA
- Confrontação não mostra indicadores de status
- Verificação de certidões falha ou trava
- Todos os documentos aparecem com o mesmo status (sem diferenciação)

---

## [UC-CV11] Analisar riscos, atas, concorrentes

> **O que este caso de uso faz:** Antes de se comprometer com um edital, é crucial entender os riscos envolvidos. Este caso de uso funciona como um "raio-X" do edital: identifica riscos técnicos (o equipamento é compatível?), riscos regulatórios (precisa de AFE ANVISA?), riscos logísticos (precisa de cadeia fria?) e até riscos fatais (o edital especifica uma marca exclusiva, eliminando a concorrência?). Além disso, busca atas de preços anteriores e identifica os concorrentes habituais. É como fazer uma due diligence antes de assinar um contrato.

**Onde:** Menu lateral → Validação → (selecionar edital) → aba Riscos
**Quanto tempo leva:** 15 a 20 minutos

---

### Antes de começar

- Selecione o mesmo edital do UC-CV09 (o de "reagente hematologia" com decisão GO).
- Navegue até a tela de detalhes deste edital.

---

### Passo 1 — Acessar a aba Riscos

**O que fazer:** Na tela de detalhes do edital, clique na aba "Riscos".

**O que você vai ver na tela:** Uma seção dedicada à análise de riscos, com botões para executar análises e áreas para exibir os resultados.

**O que acontece depois:** A aba de Riscos é exibida.

✅ **Correto se:** A aba Riscos está aberta com botões de ação visíveis.
❌ **Problema se:** A aba não abre ou exibe erro.

---

### Passo 2 — Analisar riscos

**O que fazer:** Clique no botão "Analisar Riscos" (ou "Identificar Riscos", "Avaliar Riscos", ou similar). A IA vai processar o edital e identificar os riscos específicos para a participação da RP3X.

**O que você vai ver na tela:** O botão de análise e, após clicar, um indicador de processamento.

**O que acontece depois:** Após o processamento, uma lista de riscos aparece na tela, cada um com nível de severidade. Para um edital de reagentes laboratoriais, os riscos esperados são:

| Risco | Nível esperado |
|---|---|
| AFE ANVISA exigida | Alto |
| Exclusividade de plataforma / comodato | Crítico |
| Compatibilidade com equipamento específico | Alto |
| Prazo de validade mínimo dos reagentes | Médio |
| Registro de preços sem reajuste | Médio |
| Cadeia fria (2-8°C) para transporte e armazenamento | Alto |
| Entrega fracionada (parcelamento de entregas) | Médio |

📌 **Atenção:** Os riscos "Exclusividade de plataforma / comodato" (Crítico) e "AFE ANVISA" (Alto) são os mais importantes para reagentes laboratoriais. Se o edital exige equipamento em comodato de uma marca específica, a RP3X pode ser eliminada — o sistema deve sinalizar isso como risco crítico.

✅ **Correto se:** Os riscos são listados com níveis de severidade (Crítico, Alto, Médio, Baixo) e incluem riscos específicos do segmento de reagentes.
❌ **Problema se:** A análise não identifica riscos de ANVISA ou compatibilidade de equipamento, ou todos os riscos aparecem como "Baixo".

---

### Passo 3 — Verificar Falhas Fatais (Fatal Flaws)

**O que fazer:** Dentro da análise de riscos, verifique se há uma seção ou destaque para "Falhas Fatais" (Fatal Flaws) — condições que eliminam automaticamente a participação da empresa.

**O que você vai ver na tela:** Uma seção especial dentro dos riscos, possivelmente com destaque visual (cor vermelha, ícone de alerta), listando condições impeditivas.

**Falhas fatais esperadas para reagentes:**
- Especificação de marca exclusiva (o edital só aceita reagentes de uma marca específica)
- Comodato vinculado (o edital exige equipamento em comodato de um fabricante específico)

**O que acontece depois:** As falhas fatais são exibidas com destaque especial.

✅ **Correto se:** Falhas fatais são identificadas e exibidas com destaque visual (se aplicáveis ao edital).
❌ **Problema se:** A seção de falhas fatais não existe, ou não identifica condições impeditivas óbvias.

---

### Passo 4 — Rebuscar atas de registro de preços

**O que fazer:** Clique no botão "Rebuscar Atas" (ou "Buscar Atas de Preços", "Consultar Atas", ou similar). O sistema vai buscar atas de registro de preços anteriores relacionadas aos itens do edital.

**O que você vai ver na tela:** O botão de busca de atas e, após clicar, um indicador de processamento.

**O que acontece depois:** Uma lista de atas de preços anteriores pode aparecer, mostrando valores de referência praticados em licitações similares.

✅ **Correto se:** A busca é executada com sucesso (pode retornar atas ou informar que não encontrou atas compatíveis — ambos são resultados válidos).
❌ **Problema se:** A busca trava ou exibe erro.

---

### Passo 5 — Buscar vencedores e concorrentes

**O que fazer:** Clique no botão "Buscar Vencedores" (ou "Identificar Concorrentes", "Analisar Concorrência", ou similar). O sistema vai identificar empresas que venceram licitações similares no passado.

**O que você vai ver na tela:** O botão de busca e, após clicar, um indicador de processamento.

**O que acontece depois:** Uma lista de concorrentes aparece. Para o segmento de reagentes laboratoriais, os concorrentes esperados são:

| Concorrente |
|---|
| Labtest |
| Wama |
| Siemens Healthineers |
| Beckman Coulter |
| Abbott Diagnostics |

📌 **Atenção:** Os nomes dos concorrentes podem variar dependendo dos dados do PNCP. O importante é que o sistema identifique empresas do segmento de diagnóstico laboratorial.

✅ **Correto se:** Uma lista de concorrentes é exibida com nomes de empresas do segmento de diagnóstico.
❌ **Problema se:** A busca não retorna concorrentes, ou lista empresas de segmentos completamente diferentes.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Riscos identificados com níveis de severidade (Crítico, Alto, Médio, Baixo)
- Riscos específicos de reagentes presentes: AFE ANVISA (Alto), exclusividade plataforma (Crítico), compatibilidade equipamento (Alto), cadeia fria (Alto)
- Falhas fatais identificadas (marca exclusiva, comodato vinculado)
- Busca de atas executada (com ou sem resultados)
- Concorrentes identificados (Labtest, Wama, Siemens, Beckman Coulter, Abbott)

**🔴 Sinais de problema:**
- Análise de riscos não identifica riscos regulatórios (ANVISA)
- Todos os riscos têm o mesmo nível de severidade
- Seção de falhas fatais ausente
- Busca de atas ou concorrentes trava ou gera erro
- Concorrentes listados não têm relação com reagentes laboratoriais

---

## [UC-CV12] Analisar mercado

> **O que este caso de uso faz:** Além de analisar o edital em si, é importante entender o contexto do órgão comprador — se ele compra com frequência, se paga em dia, se tem histórico de problemas. A análise de mercado reúne informações como dados do órgão (porte, localização), reputação (se é bom pagador), volume de compras no PNCP, compras similares anteriores, e o histórico da sua própria empresa com aquele órgão. A IA também gera uma análise textual consolidando tudo. Pense nisso como verificar a "ficha" do seu potencial cliente antes de fechar negócio.

**Onde:** Menu lateral → Validação → (selecionar edital) → aba Mercado
**Quanto tempo leva:** 10 a 15 minutos

---

### Antes de começar

- Selecione o mesmo edital do UC-CV09 (o de "reagente hematologia" com decisão GO).
- Navegue até a tela de detalhes deste edital.

---

### Passo 1 — Acessar a aba Mercado

**O que fazer:** Na tela de detalhes do edital, clique na aba "Mercado".

**O que você vai ver na tela:** Uma seção dedicada à análise de mercado, possivelmente com um botão para iniciar a análise e áreas para exibir os resultados.

**O que acontece depois:** A aba de Mercado é exibida.

✅ **Correto se:** A aba Mercado está aberta com um botão para iniciar a análise ou dados já carregados.
❌ **Problema se:** A aba não abre ou exibe erro.

---

### Passo 2 — Executar a análise de mercado

**O que fazer:** Clique no botão "Analisar Mercado" (ou "Gerar Análise", "Consultar Mercado", ou similar). O sistema vai consultar diversas fontes e gerar a análise completa.

**O que você vai ver na tela:** O botão de análise e, após clicar, um indicador de processamento (pode levar 15-60 segundos por causa das consultas externas).

**O que acontece depois:** As seguintes seções de informação devem ser preenchidas na tela:

| Seção | Conteúdo esperado |
|---|---|
| Dados do Órgão | Nome, CNPJ, localização e porte do órgão comprador |
| Reputação | Indicadores de adimplência, histórico de pagamentos |
| Volume PNCP | Quantidade de compras realizadas pelo órgão no PNCP |
| Compras Similares | Compras anteriores de reagentes laboratoriais pelo mesmo órgão |
| Histórico Interno | Participações anteriores da RP3X com esse órgão (pode estar vazio se for o primeiro contato) |
| Análise IA | Texto consolidando as informações acima em uma análise de mercado |

📌 **Atenção:** A seção "Compras Similares" deve mostrar compras anteriores de reagentes (não de outros materiais). A seção "Histórico Interno" pode estar vazia se a RP3X nunca participou de licitação com esse órgão — isso é normal.

✅ **Correto se:** Todas as 6 seções são preenchidas (ou indicam "sem dados" quando apropriado). A Análise IA gera um texto coerente.
❌ **Problema se:** A análise trava, ou seções ficam vazias sem explicação, ou a Análise IA gera texto incoerente.

---

### Passo 3 — Verificar a Análise IA

**O que fazer:** Leia o texto gerado pela IA na seção "Análise IA". Verifique se o texto é coerente com os dados das outras seções e se menciona aspectos relevantes para reagentes laboratoriais.

**O que você vai ver na tela:** Um bloco de texto gerado pela IA, possivelmente com parágrafos sobre oportunidade, riscos e recomendação.

**O que acontece depois:** O texto deve estar disponível para leitura e possivelmente para exportação.

✅ **Correto se:** O texto da IA é coerente, menciona o segmento de reagentes, e faz referência aos dados do órgão e histórico de compras.
❌ **Problema se:** O texto é genérico demais (sem menção a reagentes), ou é incoerente com os dados exibidos nas outras seções.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- As 6 seções da análise de mercado foram preenchidas: Dados do Órgão, Reputação, Volume PNCP, Compras Similares, Histórico Interno e Análise IA
- Compras Similares exibem compras anteriores de reagentes (se existirem)
- Histórico Interno pode estar vazio (primeiro contato) — isso é aceitável
- Análise IA gera texto coerente e relevante para o segmento de reagentes laboratoriais

**🔴 Sinais de problema:**
- Análise de mercado trava ou não é gerada
- Seções ficam completamente vazias sem mensagem explicativa
- Análise IA gera texto incoerente ou sem relação com reagentes
- Dados do órgão não correspondem ao edital selecionado

---

## [UC-CV13] IA resumo e perguntas

> **O que este caso de uso faz:** Este é o assistente inteligente do sistema — uma IA que leu todo o edital e está pronta para responder suas perguntas. Você pode pedir um resumo executivo, fazer perguntas específicas sobre o edital (prazo, exigências técnicas, condições de entrega), solicitar a identificação de requisitos técnicos, e até pedir para classificar o tipo do edital. É como ter um especialista em licitações ao seu lado, disponível para consulta a qualquer momento — mas em vez de uma pessoa, é uma inteligência artificial treinada para entender editais.

**Onde:** Menu lateral → Validação → (selecionar edital) → aba IA
**Quanto tempo leva:** 15 a 20 minutos

---

### Antes de começar

- Selecione o mesmo edital dos UCs anteriores (o de "reagente hematologia" com decisão GO).
- Navegue até a tela de detalhes deste edital.

---

### Passo 1 — Acessar a aba IA

**O que fazer:** Na tela de detalhes do edital, clique na aba "IA".

**O que você vai ver na tela:** Uma seção com um campo para fazer perguntas e botões para ações automatizadas (Gerar Resumo, Requisitos Técnicos, Classificar, etc.).

**O que acontece depois:** A aba de IA é exibida, pronta para interação.

✅ **Correto se:** A aba IA está aberta com campo de perguntas e botões de ação visíveis.
❌ **Problema se:** A aba não abre ou exibe erro.

---

### Passo 2 — Gerar resumo do edital

**O que fazer:** Clique no botão "Gerar Resumo" (ou "Resumir Edital", "Resumo Executivo", ou similar).

**O que você vai ver na tela:** O botão de geração de resumo e, após clicar, um indicador de processamento.

**O que acontece depois:** A IA gera um resumo executivo do edital, contendo informações como: objeto da licitação, órgão, valor estimado, prazos, principais exigências, e itens relevantes. O resumo deve mencionar reagentes e material laboratorial.

✅ **Correto se:** Um resumo coerente é gerado, mencionando o objeto (reagentes), o órgão, e os principais pontos do edital.
❌ **Problema se:** O resumo não é gerado, ou é genérico demais, ou trava no processamento.

---

### Passo 3 — Fazer 5 perguntas ao assistente IA

**O que fazer:** No campo de perguntas, digite cada pergunta abaixo, uma de cada vez. Após digitar, pressione Enter ou clique em "Perguntar" (ou "Enviar"). Aguarde a resposta antes de fazer a próxima pergunta.

**Pergunta 1:**

Digite: `Os reagentes precisam ser compatíveis com algum equipamento específico?`

**O que acontece depois:** A IA responde com informações sobre compatibilidade de equipamento mencionada no edital.

✅ **Correto se:** A IA responde com informações relevantes sobre compatibilidade de equipamento (se o edital mencionar algum modelo ou marca).
❌ **Problema se:** A IA não responde, ou dá uma resposta completamente fora do contexto do edital.

---

**Pergunta 2:**

Digite: `Qual o prazo de validade mínimo exigido para os reagentes?`

**O que acontece depois:** A IA responde sobre prazos de validade exigidos no edital.

✅ **Correto se:** A resposta menciona prazo de validade mínimo (geralmente 6 ou 12 meses para reagentes) ou informa que o edital não especifica.

---

**Pergunta 3:**

Digite: `O edital exige entrega fracionada?`

**O que acontece depois:** A IA responde sobre condições de entrega.

✅ **Correto se:** A resposta aborda se o edital prevê entregas parceladas (fracionadas) ou entrega única.

---

**Pergunta 4:**

Digite: `É necessário AFE ANVISA?`

**O que acontece depois:** A IA responde sobre a exigência de Autorização de Funcionamento Especial da ANVISA.

✅ **Correto se:** A resposta confirma se o edital exige AFE ANVISA (muito provável para reagentes) e idealmente especifica o tipo de autorização.

---

**Pergunta 5:**

Digite: `Qual o regime de fornecimento — registro de preços ou contrato direto?`

**O que acontece depois:** A IA responde sobre a modalidade de contratação do edital.

✅ **Correto se:** A resposta identifica se é Sistema de Registro de Preços (SRP) ou contrato direto.

---

### Passo 4 — Solicitar Requisitos Técnicos

**O que fazer:** Clique no botão "Requisitos Técnicos" (ou "Identificar Requisitos", "Extrair Especificações", ou similar).

**O que você vai ver na tela:** O botão de requisitos e, após clicar, um indicador de processamento.

**O que acontece depois:** A IA lista os requisitos técnicos identificados no edital. Para reagentes, os requisitos esperados incluem:

- Compatibilidade com equipamento específico (se mencionado)
- Prazo de validade mínimo dos reagentes
- Certificados e registros exigidos (ANVISA, BPF)
- Método analítico (enzimático, colorimétrico, etc.)

✅ **Correto se:** Uma lista de requisitos técnicos específicos para reagentes é exibida.
❌ **Problema se:** Os requisitos são genéricos demais ou não mencionam aspectos técnicos de reagentes.

---

### Passo 5 — Classificar o edital

**O que fazer:** Clique no botão "Classificar Edital" (ou "Tipo do Edital", "Classificação", ou similar).

**O que você vai ver na tela:** O botão de classificação e, após clicar, um indicador de processamento.

**O que acontece depois:** A IA classifica o edital quanto ao tipo de aquisição. Para reagentes laboratoriais, a classificação esperada é **Consumo** (reagentes são materiais consumíveis, não são bens permanentes nem serviços).

✅ **Correto se:** A classificação indica "Consumo" (ou "Material de Consumo").
❌ **Problema se:** A classificação indica "Serviço" ou "Bens Permanentes" para reagentes.

---

### Passo 6 — Regerar resumo

**O que fazer:** Clique no botão "Regerar Resumo" (ou "Novo Resumo", "Atualizar Resumo", ou similar). Isso força a IA a gerar um novo resumo, que pode incorporar as perguntas e análises feitas anteriormente.

**O que você vai ver na tela:** O botão de regeração e o resumo atual.

**O que acontece depois:** Um novo resumo é gerado, possivelmente mais completo que o primeiro (já que a IA teve mais contexto das perguntas feitas).

✅ **Correto se:** Um novo resumo é gerado com sucesso, sem apagar o histórico de perguntas e respostas.
❌ **Problema se:** A regeração falha, ou o histórico de perguntas é apagado, ou o novo resumo é idêntico ao primeiro.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Resumo executivo gerado com informações relevantes sobre reagentes
- 5 perguntas respondidas pela IA com respostas coerentes e contextualizadas:
  1. Compatibilidade de equipamento — respondida
  2. Prazo de validade — respondida
  3. Entrega fracionada — respondida
  4. AFE ANVISA — respondida
  5. Regime de fornecimento — respondida
- Requisitos Técnicos identificados (compatibilidade, validade, certificados, método analítico)
- Classificação do edital como "Consumo"
- Resumo regerado com sucesso

**🔴 Sinais de problema:**
- IA não gera resumo ou responde perguntas
- Respostas são genéricas e não mencionam o conteúdo específico do edital
- Classificação incorreta (Serviço em vez de Consumo)
- Requisitos técnicos genéricos sem mencionar reagentes
- Regeração apaga o histórico de perguntas
- Processamento trava por mais de 60 segundos em qualquer operação

---

## Resumo de Verificações por UC

| UC | O que verificar | Resultado esperado |
|---|---|---|
| UC-CV01 | Busca de editais com 5 cenários | 5 buscas executadas; Score Rápido, Híbrido e Profundo calculados; filtros UF, NCM e classificação funcionando |
| UC-CV02 | Painel lateral de detalhes | Painel abre ao clicar; produto match "Kit Sysmex XN" exibido; painel atualiza ao trocar edital |
| UC-CV03 | Salvar editais (individual, selecionados, todos) | 3 cenários de salvamento com badge "Salvo" em cada |
| UC-CV04 | Definir 3 estratégias | Estratégico 20%, Acompanhamento 15% (com variações), Aprendizado 5% — todos persistem |
| UC-CV05 | Exportar CSV e Relatório Completo | Arquivo CSV baixado; Relatório gerado; ambos com dados coerentes |
| UC-CV06 | Gerir 3 monitoramentos + ciclo de vida | Criar 3, Pausar, Atualizar, Retomar, Excluir — ao final restam 2 ativos |
| UC-CV07 | Listar editais salvos e filtrar | Filtros Status e busca por texto funcionam; 6 abas visíveis ao abrir edital |
| UC-CV08 | Calcular scores e decidir GO / Em Avaliação | 6 dimensões de score; GO com motivo; Em Avaliação com motivo; badges de status corretos |
| UC-CV09 | Importar itens e extrair lotes | ~8 itens importados; 3 lotes pela IA; mover item; excluir lote vazio → 2 lotes finais |
| UC-CV10 | Confrontar documentação | 5 categorias identificadas; docs ANVISA presentes; confrontação com status verde/amarelo/vermelho |
| UC-CV11 | Analisar riscos e concorrentes | Riscos com severidade (Crítico a Médio); falhas fatais; atas; 5 concorrentes do segmento |
| UC-CV12 | Analisar mercado | 6 seções preenchidas; Análise IA coerente com reagentes laboratoriais |
| UC-CV13 | IA resumo e perguntas | Resumo gerado; 5 perguntas respondidas; Requisitos Técnicos; Classificação "Consumo"; Regeração OK |

---

## O que reportar se algo falhar

Se durante a validação você encontrar algo diferente do esperado, relate com as seguintes informações para facilitar a correção:

**1. Qual UC falhou?**
Exemplo: "UC-CV08, Passo 3"

**2. O que você esperava ver?**
Exemplo: "O status deveria mudar para GO após confirmar"

**3. O que apareceu em vez disso?**
Exemplo: "O botão ficou desabilitado e nenhuma mensagem apareceu"

**4. Alguma mensagem de erro apareceu?**
Se sim, copie o texto exato da mensagem ou tire um print da tela.

**5. Em qual passo você estava?**
Exemplo: "Acabei de preencher o motivo e clicar em Participar (GO)"

**6. O problema aparece toda vez que você tenta, ou só aconteceu uma vez?**
Se aconteceu só uma vez, tente repetir o passo para confirmar se é consistente.

---

> **Dica final:** Faça os UCs na ordem apresentada neste tutorial. Os UCs de Captação (CV01–CV06) devem ser feitos antes dos de Validação (CV07–CV13), pois os editais precisam ser salvos na Captação antes de aparecerem na Validação. Se precisar recomeçar, limpe os dados da RP3X antes de começar novamente.
