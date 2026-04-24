
Claude terminou a resposta
Você disse: O processo que uso para validação transforma especs de casos de uso reais, com interações do usuário com o sistema descritas e telas prototipadas em tutoriais …
O processo que uso para validação transforma especs de casos de uso reais, com interações do usuário com o sistema descritas e telas prototipadas em tutoriais a serem executado pelos donos do produto e pelo Claude code por meio de instruções ao playwright que comparam as respostas obtidas por meio de screenshots das telas com o que se espera. Esse processo é bom.?

16 de abr.
Claude respondeu: Seu processo tem fundamentos sólidos, mas deixa-me ser direto sobre onde ele brilha e onde tem fragilidades reais.
Seu processo tem fundamentos sólidos, mas deixa-me ser direto sobre onde ele brilha e onde tem fragilidades reais.

O que está bom

Partir de casos de uso com telas prototipadas como fonte da verdade é o approach correto — você está validando intenção de negócio, não implementação. Transformar isso em tutoriais executáveis cria documentação viva que serve dupla função (onboarding de POs + regressão automatizada). E usar Playwright com Claude Code para dirigir a navegação é pragmático, especialmente dado seu stack.

Onde vejo fragilidades

Comparação por screenshot é traiçoeira. Visual diffing puro gera falsos positivos em massa — mudança de 1px no antialiasing, fonte renderizada diferente entre ambientes, timestamp dinâmico na tela, dados variáveis vindos do banco. Você vai gastar mais tempo triando diferenças irrelevantes do que achando bugs reais. Se está usando comparação pixel-a-pixel, precisa no mínimo de: máscaras para regiões dinâmicas, tolerância configurável, e idealmente um oráculo semântico (o próprio Claude analisando se a tela "faz sentido" para o caso de uso, não se é pixel-idêntica).

Screenshot valida aparência, não comportamento. Uma tela pode estar visualmente correta e ter o estado interno errado — formulário que parece enviado mas não persistiu, botão que renderiza habilitado mas cuja ação falha silenciosamente. Para o Facilicita.IA especificamente, onde você tem fluxos de licitação com consequências regulatórias, validar só o visual é perigoso. Precisa combinar com asserções sobre DOM, requisições de rede, e estado do backend.

POs executando tutoriais em paralelo com automação é redundante ou divergente. Ou o PO está validando coisas que a automação já cobre (desperdício), ou está validando coisas que a automação não cobre (então a automação tem gaps não documentados). Vale mapear explicitamente: o que só humano captura (usabilidade, fluência, "isto parece certo para um pregoeiro?") versus o que a máquina captura melhor (regressão, cobertura exaustiva).

Tutorial-como-teste acopla especificação e execução. Quando a UI muda, você reescreve o tutorial, e perde histórico de "o caso de uso sempre foi este, só a forma de executá-lo mudou". Separar o quê (caso de uso abstrato) do como (script Playwright concreto) evita que refactors de UI quebrem sua base de specs.

Sugestões concretas

Considere uma arquitetura em três camadas: casos de uso em formato declarativo (Gherkin ou similar), adaptadores Playwright que realizam cada passo, e um verificador multi-modal que combina (a) asserções estruturais no DOM/API, (b) screenshot com máscaras para regiões estáveis, e (c) julgamento semântico via Claude para "isto corresponde ao comportamento esperado do caso de uso?". Sua stack de Petri Net no VisualTasksExec, aliás, cai como uma luva aqui — cada caso de uso vira uma rede, cada transição é um passo verificável, e você ganha rastreabilidade formal de qual estado do sistema corresponde a qual ponto do tutorial.

Em resumo: a intenção do processo é correta, mas a implementação baseada em screenshot comparison tende a degradar em ruído ao longo do tempo. Vale investir em verificação semântica antes que o custo de triagem de falsos positivos corroa a confiança da equipe nos testes.

Você disse: Existe alguma ferramenta livre que realize testes automatizados de validação ?
Existe alguma ferramenta livre que realize testes automatizados de validação ?

16 de abr.
Claude respondeu: Boa pergunta.
Boa pergunta. Deixa eu puxar o panorama atual antes de responder, porque esse ecossistema mudou bastante nos últimos meses.


Pesquisou na web
Pesquisou na web
Deixa eu complementar com uma busca específica sobre ferramentas que usam LLMs para validação semântica, que é o gap real do seu processo atual:


Pesquisou na web
Pesquisou na web
Sim, existem várias, e elas se dividem em três categorias distintas que resolvem problemas diferentes. Dado seu contexto (Facilicita.IA, Petri Net, desconfiança saudável de abstrações mágicas), vou filtrar as que realmente fazem sentido para você.

Categoria 1 — Comparação visual clássica (o que você já está fazendo, porém melhor)

BackstopJS é o padrão open-source para regressão visual via screenshots, e o próprio Playwright tem toHaveScreenshot() embutido com comparação baseline/atual 
Bug0
Autonoma AI
. Ambos são gratuitos e resolvem o mesmo problema que você tem hoje, mas com infraestrutura madura: gestão de baselines, máscaras para regiões dinâmicas, aprovação/rejeição de diffs, histórico. Visual Regression Tracker é uma alternativa auto-hospedada, platform-agnostic, roda em Docker, mantém tudo atrás do seu firewall 
Blogs
 — relevante pelo LGPD do Facilicita.IA. Recheck adota filosofia de "capturar tudo e ignorar seletivamente", com sintaxe git-style para ignorar diffs irrelevantes 
Momentic
, o que reduz triagem de falso positivo.

Essas resolvem o problema de infraestrutura, mas não o problema fundamental que apontei na resposta anterior: continuam validando aparência, não intenção.

Categoria 2 — Validação semântica via LLM (onde está o pulo do gato)

Aqui o paradigma muda: em vez de diff de pixels, um LLM olha a tela e julga se o comportamento observado bate com a intenção descrita no caso de uso.

A abordagem mais interessante é a de um "adversarial UI tester" com três componentes: um extrator de estado Playwright que captura snapshots semanticamente significativos, um planejador adversarial LLM que raciocina sobre esses snapshots para gerar sequências de interação hostis, e um executor Playwright que roda as sequências e detecta anomalias 
SitePoint
. A chave é comprimir o snapshot em JSON semântico, filtrando apenas elementos visíveis e interativos — HTML bruto é péssimo input para LLM, a maior parte é ruído estrutural 
SitePoint
. Isso se alinha exatamente com o que te sugeri: usar a árvore de acessibilidade em vez de pixels.

Ferramentas concretas nessa linha:

Playwright MCP — servidor MCP oficial que expõe o Playwright para LLMs via árvore de acessibilidade em vez de screenshots. Você já usa Claude Code, então integração é natural. O protocolo permite que LLMs controlem o Playwright usando árvores de acessibilidade estruturadas em vez de métodos frágeis baseados em screenshot, o que garante testes mais robustos 
DZone
.
Midscene.js (não apareceu nos resultados mas vale pesquisar) — expõe APIs como .ai, .aiQuery, .aiAssert onde você escreve assertions em linguagem natural ("o botão de submissão deve estar visível e habilitado após preenchimento válido") e um LLM multimodal avalia a tela. Playwright Mind expõe .ai, .aiQuery, e .aiAssert powered by LLMs multimodais 
Bug0
.
CodeceptJS — se quiser BDD + self-healing + AI integrada já empacotado. Plataforma open-source com sintaxe BDD, criação de page objects com locators semânticos via AI, self-healing de testes que falham, e integra com Anthropic, OpenAI, Azure OpenAI e Mixtral via Groq Cloud 
Testomat
. Esse "integra com Anthropic" significa que você pode plugar seu próprio LM Studio local ou Claude API.
Categoria 3 — BDD puro (a camada de especificação que você deveria ter)

Independente de qual ferramenta de execução escolher, sua arquitetura se beneficia de separar especificação do caso de uso (Gherkin) da execução (Playwright). Ferramentas: playwright-bdd e cucumber-playwright. playwright-bdd conecta @cucumber/cucumber com Playwright para times que escrevem cenários em Gherkin, útil quando gerentes de produto ou QA leads precisam revisar especs em linguagem simples 
DEV Community
. Para o Facilicita.IA isso é ouro — seus POs (Arnaldo, Tarcísio, time Argus) leem e aprovam os cenários sem precisar olhar código.

Minha recomendação para seu caso específico

Dada sua stack (Python + Playwright + Claude Code + LM Studio local + preferência por não depender de SaaS caro + LGPD):

Combine três camadas:

playwright-bdd (ou behave + playwright-python) como camada de especificação — casos de uso do Facilicita.IA em Gherkin, aprovados pelos POs.
Playwright MCP + Claude para execução inteligente — o agente lê o cenário Gherkin, extrai a árvore de acessibilidade da página, executa as interações e faz asserções semânticas ("o valor do lance está corretamente calculado conforme as regras do edital X"). Você já tem a infraestrutura Claude Code rodando.
Visual Regression Tracker self-hosted como rede de segurança visual — só para as 5-10 telas críticas onde aparência importa de fato (telas que serão auditadas, relatórios impressos, etc.), com máscaras generosas para regiões dinâmicas.
Isso mapeia muito bem no seu framework de Petri Net aliás: cada cenário Gherkin é uma rede, cada Given/When/Then é uma transição verificável, e o estado do sistema entre transições é auditável. A rastreabilidade que você já valoriza no VisualTasksExec se estende naturalmente para o domínio de teste.

Quer que eu detalhe a configuração de alguma dessas camadas especificamente, ou que eu escreva um exemplo concreto de como um caso de uso do Facilicita.IA ficaria nesse formato?

Você disse: cara, eu lhe disse que o Claude code rodando opus 4.
cara, eu lhe disse que o Claude code rodando opus 4.6 ests fazendo validação semântica das screenshots…eu peço a ele para analisar

16 de abr.
Claude respondeu: Você tem razão, peço desculpa — reli suas mensagens e você foi explícito: o Claude Code com Opus 4.
Você tem razão, peço desculpa — reli suas mensagens e você foi explícito: o Claude Code com Opus 4.6 já está fazendo a análise semântica das screenshots, não comparação pixel-a-pixel. Minha crítica inicial sobre "falsos positivos de antialiasing" foi mal calibrada para o que você realmente está fazendo.

Com essa correção, meu diagnóstico muda bastante:

O que você tem de fato é bom

Você está usando um LLM multimodal como oráculo de validação, que é exatamente o paradigma da "Categoria 2" que descrevi na resposta anterior — só que você chegou lá antes e sem precisar de ferramenta terceirizada. O Opus 4.6 consegue julgar "esta tela corresponde ao que o caso de uso espera?" com nuance que pixel diff nunca daria. Isso resolve o problema da aparência-vs-comportamento em grande parte, porque o modelo olha a tela renderizada e raciocina sobre o que está visível.

As fragilidades que permanecem (essas são reais)

Não-determinismo do juiz. Opus 4.6 pode dar vereditos ligeiramente diferentes em execuções idênticas. Para regressão automatizada isso é um problema — você precisa de um limiar ou de prompts muito bem ancorados para reduzir variância. Vale medir: rode o mesmo conjunto de screenshots 5x pelo mesmo prompt e veja a taxa de concordância.

Screenshot não captura estado invisível. Mesmo com análise semântica do Claude, a tela pode parecer certa e o backend estar errado. Persistência no banco, payload da requisição, evento disparado no Redis/fila — nada disso aparece no screenshot. Para o Facilicita.IA, onde uma proposta de licitação tem consequência jurídica, isso importa. A validação semântica é necessária, não suficiente.

Custo por execução. Análise semântica via Opus em cada screenshot, em cada run de CI, escala em token quickly. Você já teve problema de consumo de sessão em cache bug recentemente — vale planilhar: quantos screenshots por run × quantos runs por dia × custo médio de análise. Se o número ficar desconfortável, a saída é hierárquica: pixel diff (ou hash de DOM) como primeiro filtro barato, e só manda para o Opus quando houver diferença detectada.

Ancoragem do prompt. A qualidade da validação depende inteiramente de como você descreve "o que se espera" para o Claude. Se a descrição é vaga ("a tela deve mostrar os dados do edital corretamente"), o modelo é permissivo. Se é específica ("campo 'Valor estimado' deve exibir R$ X com duas casas decimais, formato pt-BR, botão 'Enviar proposta' habilitado apenas se todos os 7 anexos obrigatórios tiverem upload concluído"), a validação fica muito mais severa e reproduzível.

Regressão de prompt. Quando você refina o prompt de validação, testes antigos podem começar a passar ou falhar de forma diferente sem que o sistema tenha mudado. Você precisa versionar os prompts de validação junto com os casos de uso — eles são parte do contrato de teste, não configuração descartável.

O gap real que vejo no seu processo

Não é a falta de ferramenta. É a ausência de uma camada de asserções estruturais complementar à análise semântica. O Claude olha a tela e valida o que é visível; algo determinístico precisa validar o que não é — DOM, rede, banco, estado. Isso não substitui o que você faz, adiciona uma dimensão.

Concretamente para Facilicita.IA: para cada caso de uso, ao lado do "screenshot + prompt de análise semântica", você teria um pequeno conjunto de asserções duras (ex: POST /propostas foi chamado com valor=X, registro apareceu na tabela Y com status submetido, evento proposta.criada foi publicado). Playwright expõe page.on('request') e page.on('response') para interceptar rede; e você já tem infra MySQL remota para verificação de estado. Isso fecha o que a análise semântica sozinha não alcança.

Faz sentido com o que você está construindo?

Você disse: Pode escrever um prompt bem organizado para o Claude code?
Pode escrever um prompt bem organizado para o Claude code? Eu peço sempre a ele que a partir dos casos de uso  infira quais dados necessários para testar são necessárias, ele sintetiza dois conjuntos de dados, um para o ser humano fazer outro a ser feir8 pelo playwright. Ambos geram dois tutoriais baseados nos casos de uso, cometendo os dados sintetizados a serem usados na validação. O Claude conde usa o tutorial destinado ao playwright para testar sistematicamente cada ação do ator e resposta do sintoma que estão no tutorial. Ele analisa semanticamente as telas para verificar se a resposta é a desejada. Pode criar um prompt melhorado, detalhado , instruindo ao Claude code q dessa forma, introduzindo melhorias que possam garantir que a validação automática seja confiável ?

16 de abr.
Claude respondeu: Aqui está o prompt.
Aqui está o prompt. Estruturei em seções claras para o Claude Code conseguir seguir sistematicamente, e embuti as melhorias que discutimos (asserções estruturais, ancoragem do prompt de validação, tratamento de não-determinismo, versionamento).

markdown
# VALIDAÇÃO AUTOMATIZADA DE CASOS DE USO — PROTOCOLO DE EXECUÇÃO

## CONTEXTO E OBJETIVO

Você receberá um ou mais casos de uso (specs com interações usuário↔sistema 
e telas prototipadas). Seu trabalho tem quatro fases obrigatórias, executadas 
em ordem: SÍNTESE → TUTORIAIS → EXECUÇÃO → RELATÓRIO.

O objetivo final é produzir validação reproduzível, auditável e com baixo 
índice de falsos positivos/negativos. Você atua simultaneamente como 
engenheiro de testes, gerador de dados e juiz semântico.

---

## FASE 1 — SÍNTESE DE DADOS DE TESTE

A partir de cada caso de uso, infira os dados necessários para exercitá-lo. 
Produza DOIS conjuntos independentes:

### 1.1 Conjunto HUMANO (`dados_humano.json`)
Dados realistas e memoráveis para um Product Owner executar manualmente:
- Nomes, CNPJs, valores com aparência plausível no contexto do negócio
- Quantidade mínima para cobrir o fluxo (não sobrecarregue o humano)
- Inclua um campo `observacoes_po` explicando o porquê de cada dado

### 1.2 Conjunto PLAYWRIGHT (`dados_playwright.json`)
Dados para execução automatizada:
- **Determinísticos**: nada de `faker.random()` em tempo de execução; 
  gere agora e fixe no JSON
- **Identificáveis**: prefixe strings com `E2E_<timestamp>_` para facilitar 
  limpeza pós-teste e evitar colisão com dados reais
- **Cobrem casos extremos**: além do happy path, inclua pelo menos um 
  dado de borda (limite de caracteres, valor zero, data limite, etc.) 
  se o caso de uso comportar
- **Isolados**: cada execução deve ser independente — nunca dependa de 
  resíduo de execução anterior

### 1.3 Para AMBOS os conjuntos, declare explicitamente:
- `precondicoes`: estado do sistema antes do teste (usuário logado? 
  registros pré-existentes?)
- `dados_sensiveis`: flag booleana por campo indicando se contém PII/LGPD
- `criterios_limpeza`: como reverter o estado após o teste

**PARE E CONFIRME** antes de prosseguir para a Fase 2. Apresente os 
dois JSONs e aguarde validação explícita ("prossiga") ou correções.

---

## FASE 2 — GERAÇÃO DE TUTORIAIS

Produza DOIS tutoriais paralelos, ambos derivados do mesmo caso de uso 
mas adaptados ao executor.

### 2.1 Tutorial HUMANO (`tutorial_humano.md`)
- Linguagem natural, português brasileiro, tom instrutivo
- Passos numerados com: ação esperada → resultado observável
- Inclua screenshots/mockups de referência para cada tela
- Seção "critérios de aceitação" ao final, em linguagem de negócio

### 2.2 Tutorial PLAYWRIGHT (`tutorial_playwright.md`)
Este é o artefato crítico. Estrutura obrigatória por passo:

```yaml
passo_NN:
  id: unique_step_id
  acao_ator:
    descricao: "Ator clica em 'Enviar proposta'"
    seletor_preferencial: "getByRole('button', { name: 'Enviar proposta' })"
    seletor_fallback: "[data-testid='btn-enviar-proposta']"
    dados_entrada: ${dados_playwright.campo_x}
  
  resposta_esperada_sistema:
    # Validação em TRÊS camadas — todas obrigatórias
    
    camada_semantica:  # Análise visual por LLM
      descricao_ancorada: |
        Descrição MUITO específica do que deve estar visível.
        Evite vaguidades como "a tela correta aparece".
        Prefira: "Banner verde no topo com texto 'Proposta enviada 
        com sucesso'. Tabela central com coluna 'Status' mostrando 
        'Em análise' na linha recém-criada. Botão 'Enviar proposta' 
        deve estar desabilitado ou ausente."
      elementos_obrigatorios:
        - "texto exato: 'Proposta enviada com sucesso'"
        - "elemento de confirmação (modal, toast, banner)"
      elementos_proibidos:
        - "mensagens de erro"
        - "estados de loading persistentes"
    
    camada_estrutural_dom:  # Determinística
      - assercao: "elemento X tem atributo Y=Z"
      - assercao: "URL contém /propostas/"
    
    camada_estrutural_rede:  # Determinística
      - requisicao: "POST /api/propostas"
        payload_contem: { "valor": ${dados.valor} }
        status_esperado: 201
        timeout_ms: 5000
    
  validacao_backend:  # Opcional, mas recomendado para ações críticas
    tipo: "consulta_db | chamada_api | evento_fila"
    exemplo: "SELECT status FROM propostas WHERE id="
    resultado_esperado: "submetida"
```

**Regra de ouro da descrição ancorada**: se um humano leigo conseguir 
confundir duas telas diferentes lendo sua descrição, ela está fraca. 
Reescreva até ficar específica o bastante para distinguir A de B sem 
ambiguidade.

---

## FASE 3 — EXECUÇÃO SISTEMÁTICA

Execute o `tutorial_playwright.md` passo a passo. Para cada passo:

### 3.1 Pré-passo
- Log timestamp, step_id, estado atual
- Capture screenshot `before_<step_id>.png`
- Snapshot da árvore de acessibilidade (não HTML bruto — árvore a11y 
  é mais estável e semanticamente rica)

### 3.2 Ação
- Execute via Playwright com seletor preferencial
- Se falhar, tente fallback UMA vez, logando o downgrade
- Intercepte requisições via `page.on('request')` e `page.on('response')` 
  desde antes da ação

### 3.3 Validação em três camadas (ordem: barata → cara)

**Camada 1 — Estrutural DOM (milissegundos, determinística)**
- Verifique todas as asserções `camada_estrutural_dom`
- Falha aqui → marque passo como FALHOU, não gaste tokens com LLM

**Camada 2 — Estrutural Rede (segundos, determinística)**
- Verifique todas as asserções `camada_estrutural_rede`
- Capture payloads completos para o relatório
- Falha aqui → mesma regra: não prosseguir para LLM

**Camada 3 — Semântica (custosa, não-determinística)**
- Só execute se camadas 1 e 2 passaram
- Capture screenshot `after_<step_id>.png`
- Análise com prompt estruturado:
Descrição esperada: <descricao_ancorada>
Elementos obrigatórios: <lista>
Elementos proibidos: <lista>

Responda APENAS em JSON:
{
"veredito": "APROVADO | REPROVADO | INCONCLUSIVO",
"confianca": 0.0-1.0,
"elementos_obrigatorios_presentes": [...],
"elementos_obrigatorios_ausentes": [...],
"elementos_proibidos_detectados": [...],
"justificativa": "texto curto e específico",
"discrepancias": [...]
}

- **Redução de não-determinismo**: se `confianca < 0.85`, execute 
  a análise 2x adicionais e aplique voto majoritário. Registre 
  divergência entre execuções no relatório.

### 3.4 Pós-passo
- Log do veredito com evidências (screenshots, payloads, queries)
- Se REPROVADO: pare a execução do caso de uso (não tente recuperar), 
  vá para Fase 4
- Se APROVADO: prossiga para próximo passo

---

## FASE 4 — RELATÓRIO DE VALIDAÇÃO

Produza `relatorio_<caso_uso_id>_<timestamp>.md` contendo:

1. **Sumário executivo**: APROVADO/REPROVADO + taxa de passos aprovados
2. **Linha do tempo**: cada passo com veredito, duração, camada que 
   determinou o resultado
3. **Evidências por passo**: screenshots before/after, payloads de 
   rede, JSON da análise semântica
4. **Discrepâncias detectadas**: lista priorizada por severidade
5. **Custo de execução**: tokens usados na validação semântica, tempo 
   total, número de re-análises por baixa confiança
6. **Recomendações**: 
   - Passos cuja descrição ancorada precisa ser refinada (confiança 
     consistentemente baixa)
   - Seletores frágeis (usaram fallback)
   - Asserções redundantes entre camadas

---

## METADADOS E VERSIONAMENTO

Todos os artefatos gerados (dados, tutoriais, prompts de validação) 
devem conter cabeçalho:

```yaml
caso_uso_id: UC-XXX
caso_uso_versao: x.y.z
gerado_em: ISO-8601
modelo_validador: claude-opus-4.6
prompt_validacao_hash: sha256 dos prompts usados na camada semântica
```

Motivo: quando um teste começar a falhar após meses, precisamos saber 
se foi o sistema que mudou, o caso de uso que evoluiu, ou o prompt 
de validação que foi refinado.

---

## REGRAS INVIOLÁVEIS

1. **Nunca reescreva um caso de uso silenciosamente.** Se o spec é 
   ambíguo, pare e pergunte.
2. **Nunca invente dados "para fazer funcionar".** Se faltam dados, 
   volte à Fase 1.
3. **Nunca use a camada semântica como muleta para seletores ruins.** 
   Se o DOM está testável, teste no DOM.
4. **Sempre limpe os dados de teste após execução**, usando 
   `criterios_limpeza` da Fase 1.
5. **Sempre prefira árvore de acessibilidade sobre HTML bruto** para 
   análise estrutural e semântica — é mais estável e força o produto 
   a ser acessível como efeito colateral positivo.
6. **Na dúvida, reprove.** Falso negativo (passou mas deveria falhar) 
   é mais caro que falso positivo no Facilicita.IA.

---

## INÍCIO DA EXECUÇÃO

Aguardo o(s) caso(s) de uso. Ao recebê-los, começarei pela Fase 1 e 
apresentarei os JSONs de dados para sua confirmação antes de gerar 
os tutoriais.
Observações sobre as melhorias que embuti

Três dimensões que a versão anterior do seu processo não tinha explicitamente:

Validação em três camadas ordenada por custo. DOM → rede → semântica. A camada cara (Claude analisando screenshot) só dispara se as baratas passaram. Isso corta seu consumo de tokens drasticamente e ainda melhora o sinal — se a asserção de rede já falhou, o screenshot só vai confirmar sintoma, não descobrir causa.

Descrição ancorada com elementos obrigatórios e proibidos. A "regra de ouro" no prompt ataca o problema de ancoragem que mencionei: força o gerador a produzir descrições específicas o bastante para o juiz (Claude) não ter margem para ser permissivo. A lista de "proibidos" é especialmente importante — sem ela, um LLM tende a confirmar a presença do que foi pedido e ignorar a presença de um erro ao lado.

Voto majoritário em baixa confiança. Reduz o não-determinismo do juiz sem custar tokens em todos os passos — só quando a confiança está marginal. É um trade-off explícito de custo por confiabilidade.

Se quiser, posso adaptar esse prompt para ser um CLAUDE.md de projeto no Facilicita.IA, com caminhos de arquivo reais e comandos específicos do seu setup de Playwright.

Você disse: Os casos de uso tem sequência de eventos com ações do usuário e resposta do sistema.
Os casos de uso tem sequência de eventos com ações do usuário e resposta do sistema. Os dados tem que ser formatados como json?

16 de abr.
Claude respondeu: Não, JSON não é obrigatório — foi uma escolha minha por default que nem sempre é a melhor.
Não, JSON não é obrigatório — foi uma escolha minha por default que nem sempre é a melhor. Deixa eu reconsiderar honestamente.

Onde JSON ajuda

Quando o Playwright vai consumir os dados programaticamente, um formato estruturado e parseável economiza código — você faz const dados = require('./dados.json') e acessa dados.proposta.valor direto. Também é bom para versionamento (diffs ficam legíveis no git) e para validar schema.

Onde JSON atrapalha

Para o conjunto destinado ao humano (o PO executando manualmente), JSON é uma escolha ruim. O Arnaldo ou o Tarcísio abrindo um .json cheio de chaves e vírgulas para seguir um tutorial de licitação é atrito desnecessário. Eles querem ler uma tabela, uma lista, ou prosa bem formatada.

Para casos de uso com sequência de eventos (como os seus), há um ponto mais importante: os dados raramente são estáticos e independentes. O valor de uma proposta depende do edital selecionado no passo 2, que depende do CNPJ cadastrado no passo 1, que depende da sessão aberta no passo 0. JSON plano não captura essa sequência — você acaba empurrando a lógica temporal para fora do arquivo de dados, para o script Playwright. Isso espalha a semântica do caso de uso em dois lugares.

Formatos que se encaixam melhor no seu caso

Para o conjunto HUMANO, prefira markdown com tabelas e seções por passo:

markdown
## Dados para execução do UC-042

### Pré-condições
- Usuário logado: pregoeiro@orgao.gov.br
- Edital pré-cadastrado: nº 2026/001

### Passo 3 — Cadastrar proposta
| Campo              | Valor                    | Observação                |
|--------------------|--------------------------|---------------------------|
| Valor estimado     | R$ 45.230,00             | Abaixo do teto do edital  |
| Prazo de entrega   | 30 dias                  | Padrão para esta categoria|
| Anexo técnico      | proposta_tecnica_E2E.pdf | Arquivo em /testes/fixtures|

### Passo 5 — Confirmar envio
- Nada a preencher; apenas clicar em "Enviar proposta"
Para o conjunto PLAYWRIGHT, YAML costuma ser superior a JSON quando há sequência de eventos, por três motivos: suporta comentários (você explica por quê aquele valor), permite referências internas com âncoras (& e *) para reaproveitar dados entre passos, e é muito mais legível quando aninhado profundamente — o que acontece em casos de uso com condicionais e ramificações.

yaml
# UC-042 — Cadastro e envio de proposta
# Versão do caso de uso: 2.1.0

precondicoes:
  usuario: &pregoeiro
    email: pregoeiro_E2E@teste.gov.br
    senha: ${env.SENHA_TESTE}
  edital_existente: &edital_base
    numero: "E2E_2026_001"
    valor_teto: 50000.00

eventos:
  - passo: 1
    ator: usuario
    acao: login
    dados:
      usa: *pregoeiro
    
  - passo: 3
    ator: usuario
    acao: cadastrar_proposta
    dados:
      edital_ref: *edital_base  # reutiliza dado do passo anterior
      valor: 45230.00           # propositalmente < valor_teto
      prazo_dias: 30
      anexo: "proposta_tecnica_E2E.pdf"
    validacao_esperada:
      - "campo 'valor' aceita o formato pt-BR"
      - "sistema calcula percentual sobre teto automaticamente"
Alguns times vão ainda mais longe e usam Gherkin puro para casos de uso com eventos sequenciais, porque Gherkin foi desenhado exatamente para isso:

gherkin
Cenário: Pregoeiro envia proposta válida abaixo do teto
  Dado que estou logado como "pregoeiro_E2E@teste.gov.br"
  E existe o edital "E2E_2026_001" com teto de R$ 50.000,00
  Quando eu cadastro uma proposta com valor R$ 45.230,00 e prazo de 30 dias
  E anexo o arquivo "proposta_tecnica_E2E.pdf"
  E clico em "Enviar proposta"
  Então o sistema exibe "Proposta enviada com sucesso"
  E a proposta aparece com status "Em análise"
  E o valor registrado no backend é 45230.00
Nesse modelo, o próprio Gherkin é o caso de uso e os dados, unificados. O playwright-bdd ou behave lê direto.

Minha recomendação revisada para seu fluxo

Dada a natureza sequencial dos seus casos de uso, eu mudaria o prompt da resposta anterior para:

Conjunto HUMANO → markdown estruturado por passo (não JSON)
Conjunto PLAYWRIGHT → YAML com âncoras e comentários (não JSON), OU Gherkin se você quiser unificar spec e dados
Se me disser como seus casos de uso chegam hoje (são docs Word? Gherkin? texto livre? JIRA?), consigo calibrar melhor o formato de saída para reduzir atrito de conversão.

Você disse: Os dois conjuntos saomusados nos tutoriais 1 , que são os do playwright e no 2, que é o humano.
Os dois conjuntos saomusados nos tutoriais 1 , que são os do playwright e no 2, que é o humano.

16 de abr.
Claude respondeu: Entendi agora — os dois conjuntos de dados alimentam os dois tutoriais respectivamente.
Entendi agora — os dois conjuntos de dados alimentam os dois tutoriais respectivamente. Então a pergunta de formato tem que ser resolvida pensando em quem lê cada tutorial, não nos dados isoladamente.

Recalibrando

O tutorial 2 (humano) é lido por pessoa. Se os dados dentro dele estão em JSON, o PO tem que mentalmente traduzir {"valor": 45230.00, "prazo_dias": 30} para "valor R$ 45.230,00, prazo 30 dias" a cada passo. Atrito inútil. Os dados devem estar embutidos no corpo do tutorial como texto natural ou tabela, já formatados como o humano vai digitar/ler na tela.

O tutorial 1 (Playwright) é lido pelo Claude Code, que então gera/executa código. Aqui você tem duas opções legítimas:

Opção A — dados separados do tutorial. Tutorial em markdown com referências (${dados.proposta.valor}), arquivo de dados separado em YAML/JSON. Vantagem: reaproveita o mesmo tutorial com dados diferentes (happy path, borda, erro). Desvantagem: Claude precisa resolver as referências ao executar.

Opção B — dados embutidos no tutorial. Cada passo já traz os valores literais inline. Vantagem: tutorial é autocontido, Claude não precisa cruzar arquivos. Desvantagem: se quiser variar dados, gera novo tutorial.

Para seu caso, Opção B tende a funcionar melhor porque casa com o modelo mental de "um tutorial = uma execução concreta de um caso de uso". Se quiser testar variações (valor no limite, valor acima do teto, etc.), você pede ao Claude para gerar N tutoriais, um por variação. Cada tutorial fica autossuficiente e rastreável.

Como isso muda o prompt

O ajuste é relativamente pequeno mas importante. Aqui está a Fase 1 e 2 reescritas:

markdown
## FASE 1 — SÍNTESE DE DADOS DE TESTE

A partir de cada caso de uso, infira os dados necessários para 
exercitá-lo. Produza DOIS conjuntos independentes, cada um destinado 
a alimentar seu respectivo tutorial na Fase 2.

### 1.1 Conjunto HUMANO
Dados realistas e memoráveis para um Product Owner executar manualmente.
Destino: serão embutidos como texto natural no Tutorial 2 (humano).

Requisitos:
- Valores com aparência plausível no contexto do negócio (CNPJs válidos 
  pelo algoritmo, valores em R$ com centavos realistas, datas coerentes)
- Nomes fictícios mas profissionais (evite "João Teste 123")
- Quantidade mínima: apenas o necessário para exercitar o caso de uso
- Cada dado deve vir com uma nota curta de por que foi escolhido aquele 
  valor (facilita o PO entender a intenção do teste)

### 1.2 Conjunto PLAYWRIGHT
Dados para execução automatizada.
Destino: serão embutidos como valores literais no Tutorial 1 (Playwright), 
em cada passo onde a ação do ator requer entrada de dados.

Requisitos:
- Determinísticos: fixados agora, nada gerado em tempo de execução
- Identificáveis: prefixo `E2E_<YYYYMMDD>_` em strings livres, para 
  facilitar limpeza e isolamento de dados reais
- Coerentes entre passos: valor referenciado no passo 3 deve bater com 
  o cadastrado no passo 1 do mesmo caso de uso
- Cobrem pelo menos uma variação significativa além do happy path 
  (borda, limite, ou erro esperado) — gere um tutorial por variação

### 1.3 Para AMBOS os conjuntos, declare no topo do respectivo tutorial:
- Pré-condições do sistema (usuário logado? registros pré-existentes?)
- Identificação de dados sensíveis (PII/LGPD) — ainda que fictícios, 
  marque-os para que o tutorial humano não seja compartilhado sem 
  cuidado
- Critérios de limpeza ao final

**PARE E CONFIRME** apresentando os dois conjuntos em formato tabular 
legível (não JSON bruto). Aguarde "prossiga" antes da Fase 2.

---

## FASE 2 — GERAÇÃO DE TUTORIAIS

Os dois tutoriais derivam do mesmo caso de uso mas são independentes 
e autocontidos. Cada um embute seu respectivo conjunto de dados 
inline — não há arquivo de dados separado a ser consultado em tempo 
de execução.

### 2.1 Tutorial 2 — Humano (`tutorial_humano_UC-XXX.md`)

Markdown em português brasileiro, tom instrutivo, dados embutidos 
como texto natural.

Estrutura:

    # Tutorial de validação manual — UC-042
    
    ## Pré-condições
    - Você está logado como pregoeiro_E2E@teste.gov.br
    - O edital nº E2E_2026_001 já está cadastrado no sistema
    
    ## Passo 3 — Cadastrar proposta
    
    **O que fazer:**
    1. Clique em "Nova proposta" no menu lateral
    2. No campo "Valor estimado", digite: **R$ 45.230,00**
       _(valor propositalmente abaixo do teto do edital, R$ 50.000,00)_
    3. No campo "Prazo de entrega", informe: **30 dias**
    4. Anexe o arquivo `proposta_tecnica_E2E.pdf` 
       (disponível em /testes/fixtures/)
    5. Clique em "Salvar rascunho"
    
    **O que deve acontecer:**
    - Banner verde no topo: "Rascunho salvo com sucesso"
    - A proposta aparece na lista com status "Rascunho"
    - O botão "Enviar proposta" fica habilitado
    
    **O que observar criticamente:**
    - O valor é exibido como "R$ 45.230,00" (formato pt-BR com vírgula)?
    - O sistema mostra o percentual sobre o teto do edital?
    
    ---
    
    ## Passo 5 — Enviar proposta
    (...)
    
    ## Critérios de aceitação do caso de uso
    - [ ] Todos os passos executaram sem erro
    - [ ] Proposta aparece no painel com status "Em análise"
    - [ ] Email de confirmação chegou em pregoeiro_E2E@teste.gov.br

### 2.2 Tutorial 1 — Playwright (`tutorial_playwright_UC-XXX.md`)

Markdown estruturado para o Claude Code consumir. Cada passo é um 
bloco YAML autocontido com dados literais, não referências.

Estrutura:

    # Tutorial de execução automatizada — UC-042 (variação: happy path)
    
    ## Metadados
    caso_uso_id: UC-042
    variacao: happy_path
    caso_uso_versao: 2.1.0
    gerado_em: 2026-04-16T14:30:00-03:00
    
    ## Pré-condições
    - usuário pregoeiro_E2E@teste.gov.br logado via cookie de sessão
    - edital E2E_2026_001 presente no banco (seed em setup.sql)
    
    ## Passo 3 — Cadastrar proposta
    
```yaml
    id: passo_03_cadastrar_proposta
    
    acao_ator:
      descricao: "Preencher formulário de nova proposta e salvar rascunho"
      sequencia:
        - click:
            seletor_preferencial: "getByRole('link', { name: 'Nova proposta' })"
            seletor_fallback: "[data-testid='nav-nova-proposta']"
        - fill:
            campo: "getByLabel('Valor estimado')"
            valor: "45230,00"  # literal, formato pt-BR como o usuário digita
        - fill:
            campo: "getByLabel('Prazo de entrega (dias)')"
            valor: "30"
        - upload:
            campo: "getByLabel('Anexo técnico')"
            arquivo: "fixtures/proposta_tecnica_E2E.pdf"
        - click:
            seletor_preferencial: "getByRole('button', { name: 'Salvar rascunho' })"
    
    resposta_esperada_sistema:
      camada_semantica:
        descricao_ancorada: |
          Banner verde no topo da página com texto exato "Rascunho salvo 
          com sucesso". Tabela central exibe nova linha com valor 
          "R$ 45.230,00" e status "Rascunho". Botão "Enviar proposta" 
          habilitado (não cinza, não desabilitado).
        elementos_obrigatorios:
          - "texto 'Rascunho salvo com sucesso'"
          - "valor formatado 'R$ 45.230,00' em pt-BR"
          - "status 'Rascunho' visível na linha"
        elementos_proibidos:
          - "mensagens de erro"
          - "estados de loading persistentes"
          - "valor em formato não-brasileiro (ex: 45,230.00)"
      
      camada_estrutural_dom:
        - "URL contém /propostas/rascunho/"
        - "botão 'Enviar proposta' tem atributo disabled ausente"
      
      camada_estrutural_rede:
        - requisicao: "POST /api/propostas/rascunho"
          payload_contem:
            valor: 45230.00  # literal numérico, como vai pro backend
            prazo_dias: 30
          status_esperado: 201
      
      validacao_backend:
        query: "SELECT status, valor FROM propostas WHERE numero_edital='E2E_2026_001' ORDER BY criada_em DESC LIMIT 1"
        resultado_esperado:
          status: "rascunho"
          valor: 45230.00
```
    
    ## Passo 5 — Enviar proposta
    (...)
    
    ## Limpeza pós-execução
```sql
    DELETE FROM propostas WHERE numero_edital LIKE 'E2E_%';
```
Por que essa estrutura funciona melhor

O humano vê "R$ 45.230,00" no texto da instrução, que é exatamente o que ele vai digitar e ver na tela — sem tradução mental. O Claude Code, por outro lado, recebe o mesmo dado em três formatos apropriados para cada camada: "45230,00" na ação de preenchimento (formato que o usuário digita), "R$ 45.230,00" na validação semântica (formato que deve aparecer renderizado), 45230.00 na asserção de rede e backend (formato que trafega como número). Isso elimina uma classe comum de bug: validar visualmente "R$ 45.230,00" e o backend ter recebido 45230 sem centavos, ou vice-versa.

Embutir os dados inline em cada passo também facilita enormemente a auditoria: quando um teste falha seis meses depois, você abre um arquivo e vê toda a execução, sem cruzar referências com um arquivo de dados separado que pode ter sido editado entre execuções.

Quer que eu reescreva o prompt completo com essa estrutura, substituindo a versão anterior?

Você disse: Sim, completo.
Sim, completo. Onde o coloco para que eu não tenha que sempre que for validar o utilize?

16 de abr.
Claude respondeu: Antes do prompt completo, deixa eu responder a segunda parte primeiro porque ela afeta o formato de saída: no Claude Code você tem três lugares para colocar in…
Antes do prompt completo, deixa eu responder a segunda parte primeiro porque ela afeta o formato de saída: no Claude Code você tem três lugares para colocar instruções persistentes, cada um com escopo diferente.

Onde colocar o prompt

~/.claude/CLAUDE.md — escopo global (sua máquina inteira). Tudo que estiver aqui é carregado em toda sessão do Claude Code, em qualquer projeto. Não é o lugar certo para este prompt porque você não quer instruções de validação E2E carregadas quando estiver desenvolvendo um agente de viagem ou mexendo no VisualTasksExec.

<raiz_do_projeto>/CLAUDE.md — escopo projeto. Carregado automaticamente em toda sessão do Claude Code aberta dentro daquele projeto. Este é o lugar certo para o Facilicita.IA. Comite no git, toda a equipe se beneficia, versionamento automático.

<raiz_do_projeto>/.claude/commands/<nome>.md — comando slash. Vira um comando invocável tipo /validar-caso-de-uso. Útil quando a instrução é longa e você só quer ativá-la sob demanda, não em toda conversa do projeto.

Minha recomendação para seu caso

Use a combinação das duas últimas. No CLAUDE.md do projeto Facilicita.IA você coloca um resumo curto apontando para o comando, e cria um slash command /validar-uc com o prompt completo. Assim:

O CLAUDE.md fica enxuto (não polui contexto em tarefas que não são validação)
Você invoca com /validar-uc quando for validar
O prompt completo fica versionado no repositório, rastreável
A estrutura ficaria:

facilicita-ia/
├── CLAUDE.md                          # aponta para o comando
├── .claude/
│   └── commands/
│       └── validar-uc.md              # prompt completo
├── testes/
│   ├── casos_de_uso/                  # specs originais (input)
│   │   └── UC-042.md
│   ├── tutoriais_humano/              # outputs gerados (fase 2)
│   │   └── UC-042_humano.md
│   ├── tutoriais_playwright/          # outputs gerados (fase 2)
│   │   └── UC-042_happy_path.md
│   ├── fixtures/                      # arquivos de upload, seeds
│   └── relatorios/                    # outputs gerados (fase 4)
│       └── UC-042_20260416_143000.md
O que entra no CLAUDE.md do projeto:

markdown
# Facilicita.IA — Contexto para Claude Code

Sistema de automação de licitações e pregões governamentais brasileiros.
Stack: FastAPI, Redis, Playwright, MySQL remoto, orquestração via Petri 
Net (VisualTasksExec).

## Validação de casos de uso

Processo de validação automatizada de casos de uso: use o comando 
`/validar-uc` e forneça o(s) caso(s) de uso como entrada. O comando 
gera dois tutoriais (humano e Playwright), executa o tutorial 
Playwright com validação semântica + estrutural, e produz relatório 
auditável.

Diretórios relevantes:
- `testes/casos_de_uso/` — specs de entrada
- `testes/tutoriais_*/` — tutoriais gerados
- `testes/relatorios/` — relatórios de execução
- `testes/fixtures/` — arquivos auxiliares (PDFs, seeds SQL)

## Convenções do projeto
- Prefixo `E2E_<YYYYMMDD>_` em todos os dados de teste
- Limpeza obrigatória via `DELETE ... WHERE ... LIKE 'E2E_%'` ao final
- Screenshots salvos em `testes/relatorios/<uc_id>/<timestamp>/`
E agora o prompt completo, que você salva em .claude/commands/validar-uc.md:

markdown
---
description: Gera tutoriais e executa validação automatizada de caso(s) de uso
---

# VALIDAÇÃO AUTOMATIZADA DE CASOS DE USO — PROTOCOLO DE EXECUÇÃO

## CONTEXTO E OBJETIVO

Você receberá um ou mais casos de uso (specs com sequência de eventos 
contendo ações do usuário e respostas do sistema, com telas 
prototipadas). Seu trabalho tem quatro fases obrigatórias, executadas 
em ordem: SÍNTESE → TUTORIAIS → EXECUÇÃO → RELATÓRIO.

O objetivo é produzir validação reproduzível, auditável e com baixo 
índice de falsos positivos/negativos. Você atua simultaneamente como 
engenheiro de testes, gerador de dados e juiz semântico.

Artefatos são salvos em:
- Tutoriais humano: `testes/tutoriais_humano/<uc_id>_humano.md`
- Tutoriais Playwright: `testes/tutoriais_playwright/<uc_id>_<variacao>.md`
- Relatórios: `testes/relatorios/<uc_id>_<timestamp>.md`
- Evidências (screenshots, payloads): `testes/relatorios/<uc_id>/<timestamp>/`

---

## FASE 1 — SÍNTESE DE DADOS DE TESTE

A partir de cada caso de uso, infira os dados necessários para 
exercitá-lo. Produza DOIS conjuntos independentes, cada um destinado 
a alimentar seu respectivo tutorial na Fase 2. Os dados serão 
embutidos inline nos tutoriais — não gere arquivos JSON/YAML 
separados para os dados.

### 1.1 Conjunto HUMANO

Dados realistas e memoráveis para um Product Owner executar 
manualmente. Destino: serão embutidos como texto natural no 
Tutorial Humano.

Requisitos:
- Valores com aparência plausível no contexto de licitações 
  governamentais brasileiras (CNPJs válidos pelo algoritmo da RF, 
  valores em R$ com centavos realistas, datas coerentes com prazos 
  de editais, números de edital no formato N/ANO)
- Nomes fictícios mas profissionais — evite "João Teste 123" 
  ou similares
- Quantidade mínima: apenas o necessário para exercitar o caso de uso
- Cada dado deve vir com uma nota curta explicando por que aquele 
  valor foi escolhido (facilita o PO entender a intenção do teste 
  e observar criticamente o comportamento esperado)

### 1.2 Conjunto PLAYWRIGHT

Dados para execução automatizada. Destino: serão embutidos como 
valores literais em cada passo do Tutorial Playwright onde houver 
ação que requer entrada.

Requisitos:
- Determinísticos: fixados agora, nada gerado em tempo de execução
- Identificáveis: prefixo `E2E_<YYYYMMDD>_` em strings livres, para 
  facilitar limpeza e isolar de dados reais
- Coerentes entre passos: valor referenciado no passo N deve bater 
  com o cadastrado no passo anterior do mesmo caso de uso
- Triplo formato para cada dado numérico/datado quando aplicável:
  - Formato de entrada (como o usuário digita): "45230,00"
  - Formato de exibição (como aparece renderizado): "R$ 45.230,00"
  - Formato de trânsito (como vai para o backend): 45230.00
- Cobrem pelo menos uma variação significativa além do happy path 
  (borda, limite, erro esperado) — gere um tutorial Playwright 
  separado para cada variação

### 1.3 Para AMBOS os conjuntos, declare no topo do respectivo tutorial:

- Pré-condições do sistema (usuário logado? registros pré-existentes? 
  seeds necessárias?)
- Identificação de dados sensíveis (PII/LGPD) — ainda que fictícios, 
  marque-os para que o tutorial humano não seja compartilhado sem 
  cuidado
- Critérios de limpeza ao final da execução

### 1.4 Checkpoint obrigatório

**PARE E CONFIRME** apresentando os dois conjuntos em formato tabular 
legível (markdown, não JSON bruto). Aguarde "prossiga" ou correções 
antes de gerar os tutoriais. Isso evita desperdício de tokens em 
geração de tutoriais sobre premissas erradas.

---

## FASE 2 — GERAÇÃO DE TUTORIAIS

Os dois tutoriais derivam do mesmo caso de uso mas são autocontidos 
e independentes. Cada um embute seu respectivo conjunto de dados 
inline.

### 2.1 Tutorial Humano (`testes/tutoriais_humano/<uc_id>_humano.md`)

Markdown em português brasileiro, tom instrutivo, dados embutidos 
como texto natural.

Estrutura obrigatória:

    # Tutorial de validação manual — <UC-ID>: <Nome do caso de uso>
    
    ## Metadados
    - Caso de uso: <UC-ID> (versão <x.y.z>)
    - Tutorial gerado em: <ISO-8601>
    - Tempo estimado de execução: <minutos>
    
    ## Pré-condições
    <lista legível do que precisa estar pronto antes>
    
    ## Dados de teste (referência)
    | Campo | Valor a usar | Observação |
    |-------|-------------|------------|
    <tabela dos dados principais com nota de intenção>
    
    ## Passo N — <título descritivo da ação>
    
    **O que fazer:**
    <lista numerada de ações concretas com os valores literais 
    já no texto, no formato que o humano vai digitar na tela>
    
    **O que deve acontecer:**
    <lista do que deve aparecer na tela, com valores literais no 
    formato renderizado>
    
    **O que observar criticamente:**
    <lista de sutilezas que só humano capta: formatação de moeda 
    pt-BR, ordem visual dos elementos, responsividade, feedback 
    tátil de botões, etc.>
    
    [repetir por passo]
    
    ## Critérios de aceitação do caso de uso
    - [ ] <critério em linguagem de negócio>
    
    ## Limpeza após execução
    <instruções simples para o humano, se houver>

### 2.2 Tutorial Playwright (`testes/tutoriais_playwright/<uc_id>_<variacao>.md`)

Markdown estruturado para o Claude Code consumir. Cada passo é um 
bloco YAML autocontido com dados literais.

Estrutura obrigatória:

    # Tutorial de execução automatizada — <UC-ID> (variação: <nome>)
    
    ## Metadados
```yaml
    caso_uso_id: UC-042
    variacao: happy_path  # ou: limite_superior, erro_validacao, etc.
    caso_uso_versao: 2.1.0
    gerado_em: 
    modelo_validador: claude-opus-4.6
    prompt_validacao_versao: v1.0
```
    
    ## Pré-condições
    <lista técnica: seeds SQL, cookies de sessão, estado de filas>
    
    ## Setup
```sql
    -- Comandos SQL para preparar o estado
```
    
    ## Passo N — <título descritivo>
    
```yaml
    id: passo_NN_
    
    acao_ator:
      descricao: "Descrição humana curta do que o ator faz"
      sequencia:
        - :
            
    
    resposta_esperada_sistema:
      camada_semantica:
        descricao_ancorada: |
          Descrição MUITO específica do que deve estar visível na tela.
          Evite vaguidades como "a tela correta aparece".
          Seja tão específico que um humano leigo, lendo essa descrição, 
          não consiga confundi-la com outra tela similar do sistema.
        elementos_obrigatorios:
          - <lista de textos/elementos que DEVEM estar presentes>
        elementos_proibidos:
          - <lista de textos/elementos que NÃO podem aparecer>
      
      camada_estrutural_dom:
        - 
      
      camada_estrutural_rede:
        - requisicao: " "
          payload_contem:
            <chaves/valores esperados no body>
          status_esperado: 
          timeout_ms: 
      
      validacao_backend:  # opcional, usar em ações críticas
        query: ""
        resultado_esperado:
          
```
    
    [repetir por passo]
    
    ## Limpeza pós-execução
```sql
    DELETE FROM  WHERE  LIKE 'E2E_%';
```

### 2.3 Regra de ouro da descrição ancorada

Se um humano leigo, lendo só a `descricao_ancorada`, conseguir confundir 
duas telas diferentes do sistema, ela está fraca. Reescreva até 
distinguir A de B sem ambiguidade. A lista `elementos_proibidos` é 
tão importante quanto `elementos_obrigatorios` — sem ela, o juiz 
LLM tende a confirmar presença do que foi pedido e ignorar presença 
de erro ao lado.

### 2.4 Checkpoint

Após gerar os dois tutoriais, apresente os caminhos dos arquivos e 
um resumo de uma linha por passo. Aguarde "prossiga" antes de 
executar (Fase 3).

---

## FASE 3 — EXECUÇÃO SISTEMÁTICA

Execute o Tutorial Playwright passo a passo. Não execute o tutorial 
humano — este é para o PO rodar manualmente em paralelo.

### 3.1 Pré-passo

- Log estruturado: timestamp, step_id, estado atual
- Screenshot: `testes/relatorios/<uc_id>/<timestamp>/before_<step_id>.png`
- Snapshot da árvore de acessibilidade (não HTML bruto — árvore a11y 
  é mais estável e semanticamente rica, e força o produto a ser 
  acessível como efeito colateral positivo)

### 3.2 Ação

- Execute via Playwright com seletor preferencial
- Se falhar, tente fallback UMA vez, logando o downgrade como alerta 
  (seletor preferencial está ficando frágil)
- Intercepte requisições via `page.on('request')` e `page.on('response')` 
  desde antes da ação, para capturar tráfego de rede gerado pela ação

### 3.3 Validação em três camadas (ordem barato → caro)

**Camada 1 — Estrutural DOM** (milissegundos, determinística):
- Verifique todas as asserções `camada_estrutural_dom`
- Falha aqui → marque passo como REPROVADO, NÃO gaste tokens com 
  camada semântica

**Camada 2 — Estrutural Rede** (segundos, determinística):
- Verifique todas as asserções `camada_estrutural_rede`
- Capture payloads completos (request e response) para o relatório
- Falha aqui → mesma regra, NÃO prosseguir para camada semântica

**Camada 3 — Semântica** (custosa em tokens, não-determinística):
- Só execute se camadas 1 e 2 passaram
- Screenshot `after_<step_id>.png`
- Análise com prompt estruturado ao modelo:
Você está validando uma tela contra uma descrição esperada.

DESCRIÇÃO ESPERADA:
<descricao_ancorada>

ELEMENTOS OBRIGATÓRIOS:
<lista>

ELEMENTOS PROIBIDOS:
<lista>

Responda APENAS em JSON válido, sem markdown:
{
"veredito": "APROVADO | REPROVADO | INCONCLUSIVO",
"confianca": 0.0-1.0,
"elementos_obrigatorios_presentes": [<string>],
"elementos_obrigatorios_ausentes": [<string>],
"elementos_proibidos_detectados": [<string>],
"justificativa": "<texto curto e específico>",
"discrepancias_observadas": [<string>]
}


- **Redução de não-determinismo**: se `confianca < 0.85`, execute 
  a análise 2x adicionais e aplique voto majoritário (2 de 3). 
  Registre divergências entre execuções no relatório como sinal 
  de que a descrição ancorada precisa ser refinada.

- **Validação backend** (se definida): execute query/chamada e 
  compare com `resultado_esperado`. Esta camada pega o que screenshot 
  e rede não pegam: persistência correta, efeitos colaterais em 
  filas, etc.

### 3.4 Pós-passo

- Log do veredito com todas as evidências (screenshots, payloads 
  capturados, queries executadas, JSON da análise semântica)
- Se REPROVADO: pare a execução do caso de uso (não tente recuperar 
  automaticamente, isso mascara a causa raiz), vá direto para Fase 4
- Se APROVADO: prossiga para próximo passo

---

## FASE 4 — RELATÓRIO DE VALIDAÇÃO

Produza `testes/relatorios/<uc_id>_<timestamp>.md` contendo:

1. **Sumário executivo** (primeira tela do relatório): 
   APROVADO/REPROVADO global, taxa de passos aprovados, duração total, 
   custo estimado em tokens

2. **Linha do tempo**: tabela com cada passo, veredito, duração, 
   qual camada determinou o resultado (importante: se a camada 
   semântica nunca é o gargalo de reprovação, ela pode estar 
   permissiva demais)

3. **Evidências por passo**: links relativos para screenshots 
   before/after, payloads de rede (JSON completo), JSON da análise 
   semântica, resultado da validação backend

4. **Discrepâncias detectadas**: lista priorizada por severidade 
   (crítica → cosmética)

5. **Custo de execução**: tokens usados na validação semântica, 
   tempo total de execução, número de re-análises por baixa confiança 
   (métrica para monitorar saúde do processo)

6. **Recomendações de manutenção**: 
   - Passos cuja descrição ancorada gerou baixa confiança 
     repetidamente (refinar a descrição)
   - Seletores que caíram para fallback (refatorar no produto)
   - Asserções redundantes entre camadas (simplificar)

---

## REGRAS INVIOLÁVEIS

1. **Nunca reescreva um caso de uso silenciosamente.** Se o spec é 
   ambíguo, pare e pergunte antes da Fase 1.

2. **Nunca invente dados "para fazer funcionar".** Se faltam dados 
   no spec, volte à Fase 1 e pergunte.

3. **Nunca use a camada semântica como muleta para seletores ruins.** 
   Se o DOM está testável, teste no DOM — é mais barato e 
   determinístico.

4. **Sempre limpe os dados de teste após execução**, usando 
   `criterios_limpeza` da Fase 1. Dados residuais contaminam 
   execuções futuras.

5. **Sempre prefira árvore de acessibilidade** sobre HTML bruto 
   para análise estrutural e semântica — é mais estável e 
   semanticamente rica.

6. **Na dúvida, reprove.** Falso negativo (passou mas deveria 
   falhar) é mais caro que falso positivo no Facilicita.IA, onde 
   propostas têm consequência jurídica.

7. **Nunca pule os checkpoints** das Fases 1 e 2. Gerar tutoriais 
   sobre dados errados, ou executar tutoriais sobre premissas 
   erradas, desperdiça tokens e gera ruído no relatório.

---

## INÍCIO DA EXECUÇÃO

Aguardo o(s) caso(s) de uso. Ao recebê-los, começarei pela Fase 1 
e apresentarei os dois conjuntos de dados em formato tabular para 
sua confirmação antes de gerar os tutoriais.
Como invocar depois de salvar

Dentro do projeto Facilicita.IA, em qualquer sessão do Claude Code, você digita:

/validar-uc
e anexa ou cola o caso de uso. O Claude Code carrega o prompt inteiro automaticamente e segue as quatro fases.

Se quiser passar argumentos (ex: caminho do caso de uso), Claude Code aceita $ARGUMENTS no arquivo do comando — posso adaptar se for útil. Quer que eu faça essa variação?

Você disse: Coloca o validar-uc.
Coloca o validar-uc.md para eu baixar. E também o texto que colo no Claude.md em um outro arquivo para baixar

16 de abr.
Claude respondeu: Vou criar os dois arquivos para você baixar.
Vou criar os dois arquivos para você baixar.


Criou 2 arquivos, leu um arquivo
Criou 2 arquivos, leu um arquivo
Prontos. Para instalar:

validar-uc.md → salve em <raiz_do_projeto_facilicita>/.claude/commands/validar-uc.md
CLAUDE.md → o conteúdo vai em <raiz_do_projeto_facilicita>/CLAUDE.md. Se você já tem um CLAUDE.md no projeto, apenas acrescente as seções "Validação de casos de uso" e "Convenções do projeto" ao que já existe, sem sobrescrever o resto.
Depois de salvar, dentro do projeto basta digitar /validar-uc em qualquer sessão do Claude Code e anexar/colar o caso de uso. O comando puxa o protocolo inteiro automaticamente.


Validar uc
Documento · MD 

Claude
Documento · MD 
Você disse: Essa forma que você definiu ê melhor que aquela feira por ferramentas livres que você citou antes?
Essa forma que você definiu ê melhor que aquela feira por ferramentas livres que você citou antes?

16 de abr.
Claude respondeu: Pergunta honesta merece resposta honesta: não necessariamente.
Pergunta honesta merece resposta honesta: não necessariamente. Depende de três variáveis no seu contexto específico. Deixa eu ser direto sobre os trade-offs em vez de empurrar minha solução.

Onde o protocolo que escrevi ganha

Integração nativa com sua stack mental. Você já usa Claude Code com Opus 4.6 como ferramenta central de trabalho. Adicionar mais uma ferramenta (BackstopJS, Visual Regression Tracker, CodeceptJS) é mais contexto para aprender, mais infraestrutura para manter, mais um lugar onde coisas podem quebrar. O protocolo no validar-uc.md usa o que você já tem rodando.

Flexibilidade total. Você pode mudar o prompt em 5 minutos quando descobrir que a Fase 3 precisa de mais uma camada de validação. Com ferramenta pronta, você depende do roadmap do mantenedor ou de fork.

Casamento com Petri Net. Nenhuma ferramenta pronta vai entender que seus casos de uso são redes de Petri. Um protocolo customizado pode explicitamente mapear passo_03 para uma transição específica da rede, coisa que ferramentas genéricas não fazem.

Onde as ferramentas livres ganham

Infraestrutura madura resolvida. BackstopJS tem gestão de baselines, aprovação/rejeição visual, diff viewer web, integração CI/CD, comunidade que achou e corrigiu edge cases por anos. Meu protocolo tem nada disso — você teria que construir. Screenshot comparison, mesmo semântica, vai precisar de interface para revisar casos inconclusivos; você vai ter que construir essa UI.

Distribuição de esforço. Quando o BackstopJS tem bug, alguém do outro lado do mundo resolve. Quando seu protocolo tem bug, é você debugando às 2h da manhã. Para um founder com N projetos simultâneos, isso importa.

Padrões do mercado. Se amanhã o Arnaldo ou o Tarcísio contratarem um QA, a pessoa provavelmente conhece Playwright + BDD + alguma ferramenta de visual regression. Ninguém conhece seu protocolo — é tribal knowledge que fica com você.

Custo por execução. Minha abordagem tem o Opus 4.6 analisando screenshots em cada run. Suas preocupações recentes com consumo de sessão são reais — cada validação de caso de uso com 10 passos pode facilmente consumir tokens significativos. BackstopJS roda em milissegundos, custo zero por execução.

O ponto que eu não enfatizei o bastante antes

Minha solução e as ferramentas livres não são mutuamente exclusivas. O desenho mais sólido, honestamente, combina os dois:

playwright-bdd (livre) para a camada de especificação e execução mecânica — ganha infraestrutura madura
Seu protocolo customizado (dentro de steps BDD) para a validação semântica com Claude — ganha flexibilidade e casamento com sua stack
Visual Regression Tracker self-hosted (livre) para as 5-10 telas onde pixel-diff realmente importa — ganha rede de segurança visual barata
Nesse desenho, cada camada faz o que faz melhor. Ferramentas livres cuidam do que é comoditizado. Seu prompt cuida do que é específico ao seu domínio.

Qual escolher no seu caso

Se você está no estágio de "quero validar se o processo em si funciona antes de investir em infra", o protocolo sozinho é melhor — zero setup, iteração rápida, você descobre o que realmente importa validar. Depois de 2-3 casos de uso rodando, você vai ter dados concretos sobre onde a dor está: custo de tokens? gestão de baselines? triagem de falsos positivos? A dor específica vai indicar qual ferramenta livre vale a pena plugar.

Se você já tem clareza de que o volume vai ser alto (muitos casos de uso, muitas execuções por dia), começar com playwright-bdd + protocolo de validação semântica embutido nos steps é mais econômico a médio prazo.

Minha recomendação honesta: comece com o protocolo puro em 2-3 casos de uso do Facilicita.IA, meça custo real de tokens e tempo de triagem, depois decida se vale plugar ferramenta livre. Evita otimização prematura e te dá dados reais para decidir — em vez de você aceitar a recomendação de um assistente que tende naturalmente a propor a solução baseada em si mesmo.

Você disse: No seu arquivo tem instruções para fazer correções no código que possam corrigir as divergências?
No seu arquivo tem instruções para fazer correções no código que possam corrigir as divergências? E só parar quando o esperado para todos os casos de uso for atingido?

16 de abr.
Claude respondeu: Não, não tem.
Não, não tem. O protocolo atual para na Fase 4 produzindo relatório — ele detecta e documenta divergências, mas não corrige código nem itera até passar. É um validador, não um auto-reparador.

Antes de adicionar isso, preciso ser direto sobre os riscos, porque é uma mudança de natureza significativa:

Por que eu deliberadamente não incluí isso

Ambiguidade de causa raiz. Quando um caso de uso falha, a divergência pode estar no código, no caso de uso mal especificado, nos dados de teste sintetizados, ou no próprio prompt de validação. Um agente autônomo que "corrige até passar" tende a atacar o sintoma mais fácil — geralmente o código — mesmo quando o defeito está em outro lugar. Você termina com código "ajustado" para satisfazer casos de uso errados.

Oráculo corrompido. Quem decide se o comportamento está certo é o caso de uso. Se o Claude pode modificar o código e interpreta o caso de uso, você perdeu o juiz independente. Ele tem incentivo implícito para reinterpretar ambiguidades da spec de forma que o código atual passe, em vez de admitir que o código está errado.

Loop infinito silencioso. "Só parar quando todos passarem" pode significar 40 iterações mudando código para acomodar casos de uso contraditórios entre si (algo que vai acontecer no Facilicita.IA — regras de licitação têm exceções sutis). Você precisa de critérios de parada além de "todos verdes".

Gravidade do domínio. Facilicita.IA lida com propostas que têm consequência jurídica. Código auto-modificado por agente, sem revisão humana, em fluxos de licitação, é risco real. Um bug de cálculo em valor de proposta pode custar uma licitação ou gerar processo.

Como fazer isso com segurança

Se mesmo assim você quer o ciclo fechado, a forma responsável é:

Separar VALIDAR de CORRIGIR em dois comandos distintos. /validar-uc produz relatório. /corrigir-divergencias recebe um relatório aprovado pelo humano e propõe correções. Você não invoca o segundo sem ler o primeiro.
Classificação obrigatória da causa raiz antes de mexer em código. Para cada divergência, o agente precisa decidir entre: defeito de código, caso de uso ambíguo, dado de teste errado, descrição ancorada fraca, flutuação do juiz semântico. Só defeitos de código viram commits.
Correções sempre em branch isolada, nunca direto na main. PR aberto, não merge automático. Você ou outro humano revisa antes.
Teto de iterações. Máximo de N tentativas por caso de uso (3 é um bom número). Além disso, o agente declara "impasse" e pede intervenção humana em vez de continuar tentando.
Detecção de regressão cruzada. Depois de corrigir o caso A, re-executar todos os casos já aprovados. Se alguma "correção" quebrou caso que antes passava, rollback obrigatório e classificação como impasse — os casos são incompatíveis e precisam de decisão humana.
Proteção explícita de trilhas críticas. Arquivos que o agente nunca pode modificar sozinho: lógica de cálculo financeiro, integrações com sistemas governamentais, código de auditoria/log. Lista explícita no prompt.
Human-in-the-loop em pontos de decisão. O agente propõe a correção, explica a causa raiz identificada, mostra o diff, e pergunta "aplico?". Você pode dizer "sim", "não, a causa é outra", ou "sim mas com este ajuste".
Minha recomendação honesta

Antes de adicionar auto-correção, rode o protocolo atual em 2-3 casos de uso reais. Observe: quantas divergências aparecem? Quantas são defeito de código genuíno vs. spec ambígua vs. ruído do juiz? Se a maior parte for defeito de código óbvio e repetitivo (falta validação de campo, formatação errada, endpoint retornando status 500), auto-correção com as salvaguardas acima vale a pena. Se a maior parte for ambiguidade de spec ou decisões de produto, auto-correção vai te atrapalhar — você quer que essas subam para discussão humana.

Quer que eu crie um segundo arquivo, corrigir-divergencias.md, com esse protocolo de correção incluindo todas as salvaguardas? Manteria o validar-uc.md como está (foco em validação limpa) e você teria dois comandos complementares que você combina conscientemente quando quiser fechar o ciclo.

Você disse: Meu processo, como vc viu tem uma validação manhã, humana e uma automática.
Meu processo, como vc viu tem uma validação manhã, humana e uma automática. Eu quero que haja um loop, sim, que no automático efetue correções decorrentes dos resultados .

16 de abr.
Claude respondeu: Entendido.
Entendido. A validação humana em paralelo é a salvaguarda que torna o loop automático responsável — o PO captura o que o agente não deveria ousar decidir sozinho (ambiguidade de spec, decisão de produto, casos em que "passar" está errado). Faz sentido arquiteturalmente.

Vou criar o segundo comando com o loop de correção, desenhado para respeitar essa divisão de responsabilidades: o automático corrige defeitos de código; divergências que cheiram a ambiguidade de spec ou decisão de produto ficam marcadas como impasse e esperam a validação humana resolver.


Criar comando slash /corrigir-divergencias com loop de correção automática
Criar comando slash /corrigir-divergencias com loop de correção automática
Também vou atualizar o CLAUDE.md para referenciar o novo comando e estabelecer o fluxo integrado:


Criou 2 arquivos, executou um comando, leu um arquivo
Criou 2 arquivos, executou um comando, leu um arquivo
Três arquivos prontos:

corrigir-divergencias.md → .claude/commands/corrigir-divergencias.md
CLAUDE.md atualizado → substitui a versão anterior na raiz do projeto
validar-uc.md → continua igual, em .claude/commands/
O desenho do loop em uma frase: o automático corrige defeitos óbvios de código em branch isolada com PR, o humano valida em paralelo com o tutorial manual, e o cross-check entre os dois é a salvaguarda que impede que o loop automático "trape" a spec.

Pontos de atenção práticos para quando você rodar pela primeira vez:

Comece com teto de iterações = 1. Isso força o agente a ser conservador na classificação e te dá tempo de calibrar o que ele considera "defeito de código óbvio". Depois que você ganhar confiança, aumenta para 2 ou 3.

Crie um .claude-protected desde o dia zero. Mesmo que vazio. Depois de cada ciclo, se algum arquivo foi tocado e você achou arriscado, adicione lá. A lista cresce organicamente e protege você.

Rode primeiro em um caso de uso que você sabe que está com bug. Observe se a classificação de causa raiz bate com o que você sabe ser verdade. Se o agente acerta, ganha confiança; se erra, você entende as lacunas antes de depender do processo em casos que não conhece a resposta.

Compare sempre com a validação humana antes do merge. A seção "Cross-check manual" do relatório final é a parte mais importante do processo — é onde você flagra se o automático está sendo permissivo demais, o que seria o cenário mais perigoso no domínio de licitação.


Corrigir divergencias
Documento · MD 

Claude
Documento · MD 

Validar uc
Documento · MD 
Você disse: posso passar esses docs para o claude code entender?
posso passar esses docs para o claude code entender?

14:39
Claude respondeu: Sim, exatamente.
Sim, exatamente. Os dois arquivos de comando (validar-uc.md e corrigir-divergencias.md) são feitos precisamente para o Claude Code ler e executar — é o mecanismo nativo de slash commands dele. E o CLAUDE.md é lido automaticamente toda vez que você abre uma sessão do Claude Code dentro do diretório do projeto.

Instalação prática

Dentro da raiz do projeto Facilicita.IA, no terminal:

bash
# Criar estrutura (se ainda não existir)
mkdir -p .claude/commands
mkdir -p testes/{casos_de_uso,tutoriais_humano,tutoriais_playwright,relatorios,fixtures}

# Mover os arquivos baixados para os lugares certos
mv ~/Downloads/validar-uc.md .claude/commands/
mv ~/Downloads/corrigir-divergencias.md .claude/commands/
mv ~/Downloads/CLAUDE.md ./CLAUDE.md  # ou mesclar ao seu CLAUDE.md existente

# Opcional mas recomendado: criar arquivo de zonas protegidas vazio
touch .claude-protected

# Commitar no git
git add .claude/ CLAUDE.md .claude-protected testes/
git commit -m "chore: adiciona protocolo de validação e correção de UCs"
Verificar que o Claude Code reconheceu

Abra uma nova sessão do Claude Code na raiz do projeto:

bash
cd ~/projetos/facilicita-ia
claude
Dentro da sessão, digite / e você deve ver /validar-uc e /corrigir-divergencias na lista de comandos disponíveis. Se aparecerem, está funcionando.

Você também pode pedir ao Claude Code para confirmar que leu o CLAUDE.md — algo como "o que você sabe sobre este projeto?" — e ele deve responder com o contexto do Facilicita.IA que está lá dentro.

Se algo não aparecer

Verifique que os arquivos estão em .claude/commands/ (com o ponto), não em claude/commands/
Os frontmatters (--- no topo) precisam estar intactos — é deles que o Claude Code lê o description que aparece no menu
Reinicie a sessão do Claude Code depois de adicionar os arquivos
Compartilhamento com a equipe

Como você comitou no git, qualquer pessoa do time que clonar o repositório e rodar Claude Code dentro da pasta vai ter acesso aos mesmos comandos e ao mesmo contexto. Isso padroniza o processo de validação no Facilicita.IA sem depender de configuração individual de cada desenvolvedor.

Se o projeto Facilicita.IA compartilha código com os outros projetos da QUANTICA.IA (Zarpa, AgenciaDeAgentes, etc.) e você quiser o mesmo protocolo em todos, basta copiar os dois arquivos .claude/commands/ para cada projeto. O CLAUDE.md você adapta por projeto, já que o contexto de cada produto é diferente.






Claude é uma IA e pode cometer erros. Por favor, verifique as respostas.
