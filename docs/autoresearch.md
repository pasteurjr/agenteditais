Você deve atuar como um sistema autônomo de engenharia, validação e correção iterativa orientado pelo padrão de auto research.

## CONTEXTO DO PROJETO

Existe um sistema já implementado de gestão de editais com IA, voltado ao fluxo completo de licitações, que inclui funcionalidades de:

- cadastro de dados da empresa
- cadastro e gestão de documentos da empresa
- cadastro de portfolio de produtos
- cadastro de especificações técnicas de produtos com apoio de IA
- consulta e validação de dados de produtos e registros regulatórios
- cadastro de classes, subclasses e tipos de produtos
- parametrizações comerciais, fiscais, de score, regiões e tipos de edital
- captação de editais
- análise e validação de editais
- impugnações, esclarecimentos, recursos e contra-razões
- precificação por lotes e por camadas
- geração e auditoria de propostas
- submissão e exportação documental
- follow-up de resultados
- busca e extração de atas
- execução de contratos
- contratado x realizado
- funcionalidades já implementadas até a Sprint 5

O sistema possui frontend, backend, integrações, regras de negócio, comportamento de interface, ferramentas internas e estado de implementação já existentes.

Sua missão não é apenas testar superficialmente o sistema.

Sua missão é:

1. analisar integralmente a implementação existente
2. ler o arquivo de instruções do Claude Code do projeto, bem como quaisquer arquivos de contexto, documentação, README, prompts, workflows e convenções locais
3. ler integralmente os documentos funcionais e de requisitos disponíveis no projeto, incluindo os documentos de requisitos e casos de uso já existentes
4. entender o comportamento real já implementado
5. transformar esse entendimento em especificação formal rastreável
6. gerar casos de uso completos e reais
7. escrever fluxos de eventos detalhados, com foco especial na interação real entre ator e UI
8. gerar testes Playwright para validar cada caso de uso
9. executar os testes
10. capturar screenshots em cada ação do ator e em cada resposta relevante do sistema
11. comparar comportamento esperado e comportamento observado
12. registrar divergências
13. corrigir automaticamente código, testes, fluxos, componentes, backend, integrações ou documentação, quando necessário
14. repetir esse loop até que os casos de uso estejam realmente corretos, implementados e validados
15. gerar ao final um documento completo de validação com parecer final técnico
16. gerar ao final um manual completo e detalhado chamado `TUTORIAL PARA USO ATE SPRINT5.md`, ensinando o uso do sistema em todos os menus, telas e funcionalidades já implementadas até a Sprint 5

Você deve operar em modo iterativo contínuo, no espírito de auto research:
- analisar
- formular hipótese
- testar
- medir
- comparar
- corrigir
- reexecutar
- repetir até convergência

---

# OBJETIVO PRINCIPAL

Produzir uma validação completa, baseada em evidência observável, do sistema de editais com IA, incluindo:

- análise completa da implementação
- especificação funcional derivada da implementação real
- casos de uso completos com fluxos de eventos detalhados
- testes Playwright por caso de uso
- evidências visuais com screenshots
- relatório de divergências
- correções automáticas
- revalidação contínua
- documento final de validação com parecer conclusivo
- manual completo de uso do sistema até a Sprint 5

---

# REGRA CENTRAL

Você não deve considerar o sistema validado apenas porque:
- compila
- sobe localmente
- renderiza páginas
- passa em testes superficiais

Você só deve considerar um caso de uso validado quando:
1. o comportamento tiver sido entendido
2. tiver sido documentado formalmente
3. tiver sido coberto por teste Playwright
4. tiver sido executado na UI real
5. tiver evidências visuais suficientes
6. estiver coerente com a implementação observada, com os requisitos e com a intenção funcional do sistema
7. não houver divergência crítica em aberto

---

# ESCOPO DA ANÁLISE

Você deve analisar integralmente:

1. estrutura do repositório
2. frontend
3. backend e APIs
4. integrações com PNCP, atas, documentos, IA e demais serviços
5. fluxo de cadastro da empresa
6. fluxo de gestão documental da empresa
7. fluxo de cadastro e manutenção de portfolio
8. fluxo de especificações técnicas assistidas por IA
9. fluxo de classes, subclasses, tipos de produtos e parametrizações
10. fluxo de captação de editais
11. fluxo de validação e score dos editais
12. fluxo de impugnações, esclarecimentos, recursos e contra-razões
13. fluxo de precificação
14. fluxo de proposta e auditoria documental
15. fluxo de follow-up
16. fluxo de atas
17. fluxo de execução de contratos
18. fluxo de contratado x realizado
19. páginas, componentes e estados da UI
20. armazenamento de dados
21. autenticação e autorização, se existirem
22. erros, exceções, mensagens de feedback e estados vazios
23. jobs, filas, cron, schedulers ou workers, se existirem
24. arquivos de instrução do Claude Code
25. arquivos de contexto, prompts, workflows, READMEs e docs locais
26. testes existentes
27. scripts de build, run e validação
28. os documentos funcionais e de requisitos existentes no projeto, inclusive os documentos de casos de uso e requisitos já fornecidos

---

# ARQUIVOS E ESTRUTURA QUE VOCÊ DEVE CRIAR

Crie e mantenha a seguinte estrutura documental, ajustando-a se necessário sem perder rastreabilidade:

docs/
  analise/
    inventario_do_sistema.md
    arquitetura_observada.md
    funcionalidades_identificadas.md
    entidades_e_regras.md
    atores.md
    glossario.md
    duvidas_inferencias_e_assuncoes.md
    especificacao_funcional.md

  casos_de_uso/
    indice.md
    UC-001.md
    UC-002.md
    UC-003.md

  validacao/
    estrategia_de_validacao.md
    plano_de_testes.md
    relatorio_execucao.md
    divergencias.md
    correcoes_aplicadas.md
    parecer_final.md
    checklist_final.md

  rastreabilidade/
    matriz_casos_de_uso_x_codigo.md
    matriz_casos_de_uso_x_testes.md
    matriz_casos_de_uso_x_telas.md
    matriz_divergencias_x_correcoes.md

tests/
  e2e/
    playwright/
      uc-001.spec.ts
      uc-002.spec.ts
      uc-003.spec.ts

runtime/
  screenshots/
    UC-001/
    UC-002/
    UC-003/
  videos/
  traces/
  logs/
  artifacts/

TUTORIAL PARA USO ATE SPRINT5.md

---

# ORDEM OBRIGATÓRIA DE EXECUÇÃO

Siga rigorosamente esta ordem:

## FASE 1 — LEITURA E COMPREENSÃO DO PROJETO

1. Ler o repositório integralmente.
2. Identificar frontend, backend, integrações e fluxos principais.
3. Ler o arquivo de instruções do Claude Code do projeto e todos os arquivos correlatos.
4. Ler integralmente todos os documentos funcionais e de requisitos existentes no projeto.
5. Identificar como o sistema funciona de ponta a ponta, da fundação até a Sprint 5.
6. Identificar o que já está implementado, o que está parcial e o que ainda não está implementado.
7. Identificar comportamentos reais observáveis já implementados.

### Saídas obrigatórias
- docs/analise/inventario_do_sistema.md
- docs/analise/arquitetura_observada.md
- docs/analise/funcionalidades_identificadas.md
- docs/analise/entidades_e_regras.md
- docs/analise/atores.md
- docs/analise/especificacao_funcional.md

---

## FASE 2 — ESPECIFICAÇÃO FORMAL DERIVADA DA IMPLEMENTAÇÃO

Você deve gerar um documento de especificação funcional baseado na implementação real observada, e não apenas em suposições.

A especificação deve descrever:
- objetivo do sistema
- módulos
- atores
- entidades
- regras de negócio
- fluxos funcionais
- telas
- componentes relevantes
- eventos de interface
- respostas do sistema
- estados de erro
- restrições
- integrações
- relação entre requisitos, casos de uso e implementação observada
- situação por sprint, com foco especial nas funcionalidades até a Sprint 5

A especificação deve refletir a verdade atual do sistema, marcando claramente:
- comportamento confirmado por leitura de código
- comportamento confirmado por execução real
- comportamento inferido com base em evidência parcial
- pontos duvidosos ou ambíguos
- divergências entre documentação e implementação

### Saída obrigatória
- docs/analise/especificacao_funcional.md

---

## FASE 3 — GERAÇÃO DOS CASOS DE USO

Gere casos de uso formais e completos a partir da implementação observada e dos documentos funcionais disponíveis.

Cada caso de uso deve ser real, detalhado e centrado em comportamento observável.

Os casos de uso devem cobrir, no mínimo, os módulos e menus já implementados até a Sprint 5, incluindo:
- Empresa
- Portfolio
- Parametrizações
- Captação
- Validação
- Impugnação
- Precificação
- Proposta
- Follow-up
- Atas
- Execução de contratos
- Contratado x realizado

Cada caso de uso deve conter obrigatoriamente:

- ID
- Nome
- Objetivo
- Escopo
- Atores
- Gatilho
- Pré-condições
- Pós-condições
- Fluxo principal
- Fluxos alternativos
- Fluxos de exceção
- Regras de negócio associadas
- Componentes de UI envolvidos
- Dados manipulados
- Endpoints envolvidos, se aplicável
- Evidências esperadas
- Critérios de validação

## EXIGÊNCIA CRÍTICA SOBRE FLUXOS DE EVENTOS

Cada caso de uso deve conter uma descrição real e detalhada do fluxo de eventos, incluindo, passo a passo:

### Para cada passo:
1. ação explícita do ator na UI
2. elemento visual ou componente utilizado
3. resposta visual do sistema
4. efeito funcional esperado
5. possível requisição de rede, se relevante
6. persistência ou atualização de estado, se existir
7. evidência visual a ser coletada

Exemplo do nível de detalhe esperado:

Passo 1:
O ator acessa a tela inicial de captação de editais e visualiza a listagem principal.

Resposta do sistema:
O sistema renderiza a tabela de editais, exibe colunas, filtros, badges de status, paginação, ações por linha e o estado carregado da busca atual.

Evidência esperada:
Screenshot da tela inicial completa com tabela visível.

Passo 2:
O ator aciona o botão “Buscar Editais”.

Resposta do sistema:
O sistema exibe estado de carregamento, consulta a fonte configurada, processa os resultados e atualiza a tabela com os editais obtidos, seus campos, seus badges e suas ações disponíveis.

Evidência esperada:
Screenshot do momento do clique e screenshot do estado posterior ao carregamento da listagem.

Você deve fazer isso para todos os casos de uso.

### Saídas obrigatórias
- docs/casos_de_uso/indice.md
- docs/casos_de_uso/UC-xxx.md

---

## FASE 4 — PLANO DE VALIDAÇÃO

Crie a estratégia de validação e o plano de testes.

O plano deve mapear:
- cada caso de uso
- cada fluxo principal
- cada fluxo alternativo relevante
- cada fluxo de exceção crítico
- tela envolvida
- passos a serem automatizados
- screenshots a serem capturadas
- critérios de aprovação e reprovação
- artefatos esperados

### Saídas obrigatórias
- docs/validacao/estrategia_de_validacao.md
- docs/validacao/plano_de_testes.md

---

## FASE 5 — GERAÇÃO DOS TESTES PLAYWRIGHT

Para cada caso de uso, gere testes Playwright completos.

Cada teste deve:
1. preparar o ambiente
2. abrir a aplicação
3. navegar até a tela correta
4. executar o fluxo de eventos detalhado
5. validar a resposta do sistema em cada etapa relevante
6. capturar screenshot em cada ação do ator
7. capturar screenshot em cada resposta importante do sistema
8. registrar logs, traces e evidências
9. validar estados intermediários e estado final

## REGRAS PARA SCREENSHOTS

Você deve capturar screenshots com granularidade alta.

Para cada caso de uso, capture pelo menos:
- tela inicial do fluxo
- ação do ator antes da interação
- estado imediatamente após a ação
- resposta do sistema
- estado final do fluxo
- estados de erro, quando existirem
- estados alternativos, quando existirem

Use nomes de arquivos rastreáveis, por exemplo:
- runtime/screenshots/UC-001/01_tela_inicial.png
- runtime/screenshots/UC-001/02_clique_em_buscar_editais.png
- runtime/screenshots/UC-001/03_resposta_sistema_apos_busca.png

### Saídas obrigatórias
- tests/e2e/playwright/*.spec.ts
- runtime/screenshots/
- runtime/videos/
- runtime/traces/

---

## FASE 6 — EXECUÇÃO REAL E OBSERVAÇÃO

Execute o sistema localmente.
Suba frontend, backend e dependências.
Prepare massa de dados, integrações reais, dados reais ou ambiente realista conforme necessário.

Em seguida:
1. execute todos os testes Playwright
2. colete screenshots, vídeos, traces e logs
3. observe falhas e inconsistências
4. compare com a especificação e com os casos de uso

A validação deve incluir, sempre que possível, uso real ou semi-real das integrações essenciais, como:
- captação de editais
- importação e leitura de dados
- consultas relacionadas a portfolio, ANVISA, NCM e documentos
- busca de atas
- fluxos de follow-up e contrato
- dados relevantes de negócio

### Saída obrigatória
- docs/validacao/relatorio_execucao.md

---

## FASE 7 — ANÁLISE DE RESULTADOS

Para cada caso de uso executado, produza uma análise formal contendo:

- o que era esperado
- o que foi observado
- screenshots de referência
- se o fluxo passou ou falhou
- em que passo falhou
- se a UI respondeu conforme especificado
- se o backend respondeu conforme esperado
- se os dados refletiram a operação esperada
- se houve divergência documental
- se houve divergência funcional
- severidade da divergência
- causa provável

Você deve fazer uma análise séria, não superficial.

### Saída obrigatória
- docs/validacao/relatorio_execucao.md
- docs/validacao/divergencias.md

---

## FASE 8 — CORREÇÃO AUTOMÁTICA

Quando houver divergência, você deve corrigi-la.

Pode corrigir:
- testes Playwright incorretos
- documentação inconsistente
- fluxos de eventos imprecisos
- código frontend
- componentes
- hooks
- rotas
- serviços
- backend
- integração com editais, atas, documentos e IA
- tratamento de erros
- mensagens de feedback
- estados de loading
- persistência
- qualquer parte necessária para convergir o comportamento ao caso de uso correto

## REGRA DE CORREÇÃO
Antes de corrigir, registre a divergência.
Depois da correção, registre:
- arquivos alterados
- motivo
- impacto esperado
- caso de uso afetado
- evidência que deve melhorar após a correção

### Saída obrigatória
- docs/validacao/correcoes_aplicadas.md

---

## FASE 9 — LOOP CONTÍNUO NO PADRÃO DE AUTO RESEARCH

Você deve operar em loop contínuo:

1. ler e analisar
2. formular hipótese de melhoria/correção
3. aplicar mudança
4. executar validação
5. medir resultado
6. manter correção se melhorou
7. revisar ou reverter abordagem se piorou
8. repetir

Você não deve parar no primeiro conjunto de testes que passa parcialmente.

Você deve permanecer no loop até que:
- todos os casos de uso obrigatórios estejam especificados
- todos tenham testes Playwright correspondentes
- todos tenham evidência visual suficiente
- todas as divergências críticas estejam resolvidas
- os casos de uso reflitam corretamente o comportamento final do sistema
- a documentação final esteja coerente com a implementação final
- o manual final de uso esteja coerente com o sistema real validado

---

# DEFINIÇÃO DE CONCLUÍDO

Considere concluído somente quando, para cada caso de uso obrigatório:

- o caso de uso estiver escrito de forma completa
- o fluxo principal estiver validado
- fluxos alternativos relevantes estiverem validados
- fluxos de exceção críticos estiverem validados
- screenshots existirem para as ações e respostas principais
- teste Playwright estiver criado e executável
- divergências críticas estiverem fechadas
- rastreabilidade estiver atualizada
- parecer do caso de uso estiver emitido

Além disso, o projeto só pode ser considerado concluído quando:
- todos os menus e telas implementados até a Sprint 5 tiverem sido analisados
- todas as funcionalidades implementadas até a Sprint 5 tiverem sido verificadas
- o arquivo `TUTORIAL PARA USO ATE SPRINT5.md` tiver sido gerado com profundidade suficiente para orientar um usuário real do sistema

---

# FORMATO OBRIGATÓRIO DE CADA CASO DE USO

Use exatamente este nível de detalhamento:

## Caso de Uso: UC-XXX
### Nome
### Objetivo
### Escopo
### Atores
### Gatilho
### Pré-condições
### Pós-condições
### Regras de negócio
### Componentes de UI envolvidos
### Endpoints ou serviços envolvidos
### Dados manipulados
### Fluxo principal
### Fluxos alternativos
### Fluxos de exceção
### Evidências esperadas
### Critérios de validação
### Teste Playwright associado
### Screenshots esperados
### Resultado da validação
### Divergências encontradas
### Correções realizadas
### Status final

---

# FORMATO OBRIGATÓRIO DE REGISTRO DE DIVERGÊNCIA

Use estrutura semelhante a esta:

ID: DIV-XXX
Caso de uso: UC-XXX
Título: divergência entre comportamento esperado e observado
Tipo: funcional / UI / integração / documentação / teste
Severidade: baixa / média / alta / crítica
Passo do fluxo afetado:
Comportamento esperado:
Comportamento observado:
Evidência:
Causa provável:
Correção proposta:
Status:

---

# FORMATO OBRIGATÓRIO DE REGISTRO DE CORREÇÃO

ID: COR-XXX
Divergência associada:
Caso de uso afetado:
Arquivos alterados:
Descrição da correção:
Motivação:
Impacto esperado:
Evidência de revalidação:
Status:

---

# PARECER FINAL

Ao final, gere um documento `docs/validacao/parecer_final.md` contendo:

1. resumo técnico da validação executada
2. arquitetura e escopo validados
3. lista de casos de uso avaliados
4. status individual de cada caso de uso
5. testes criados e executados
6. quantidade de screenshots geradas
7. divergências encontradas
8. divergências corrigidas
9. divergências remanescentes, se houver
10. limitações da validação
11. grau de confiança na conformidade do sistema
12. parecer final conclusivo

O parecer deve classificar o sistema em uma destas categorias:
- validado com alta confiança
- validado com ressalvas
- parcialmente validado
- não validado

Justifique tecnicamente a classificação.

---

# MATRIZ DE RASTREABILIDADE

Mantenha atualizadas as seguintes matrizes:

- caso de uso → arquivos de código
- caso de uso → telas/componentes
- caso de uso → testes Playwright
- caso de uso → screenshots
- divergência → correção

### Saídas obrigatórias
- docs/rastreabilidade/matriz_casos_de_uso_x_codigo.md
- docs/rastreabilidade/matriz_casos_de_uso_x_testes.md
- docs/rastreabilidade/matriz_casos_de_uso_x_telas.md
- docs/rastreabilidade/matriz_divergencias_x_correcoes.md

---

# MANUAL FINAL OBRIGATÓRIO

Ao final de toda a validação, gere um arquivo:

`TUTORIAL PARA USO ATE SPRINT5.md`

Esse tutorial deve ser detalhado, didático, operacional e completo.

Ele deve instruir um usuário do sistema em todos os passos necessários para utilizar o sistema até a Sprint 5.

O tutorial deve cobrir, no mínimo:

1. visão geral do sistema
2. acesso ao sistema
3. cadastro da empresa
4. gestão documental
5. cadastro e manutenção do portfolio
6. uso da IA para preencher especificações de produtos
7. uso de classes, subclasses e tipos de produto
8. parametrizações gerais
9. captação de editais
10. validação e decisão
11. impugnações, esclarecimentos, recursos e contra-razões
12. precificação por lotes e camadas
13. geração e auditoria de proposta
14. follow-up
15. atas
16. execução de contratos
17. contratado x realizado
18. menus, telas, campos, botões e mensagens importantes
19. exemplos práticos de uso
20. cuidados operacionais, limites e observações

Para cada menu, tela e funcionalidade, o tutorial deve descrever:
- onde acessar
- o que aparece na tela
- o que o usuário deve fazer
- o que o sistema responde
- o que é salvo ou atualizado
- o que observar
- screenshots ou referências às evidências, se útil

O tutorial deve refletir o sistema REAL validado ao final, e não apenas o sistema pretendido.

---

# COMPORTAMENTO ESPERADO DE VOCÊ

Você deve agir como:
- analista de sistemas
- engenheiro de software
- testador
- validador funcional
- documentador técnico
- agente corretivo iterativo

Você não deve:
- parar cedo demais
- gerar documentação rasa
- criar casos de uso genéricos
- produzir fluxos de eventos superficiais
- validar sem executar
- concluir sem evidência visual
- ignorar divergências observadas

Você deve:
- trabalhar com profundidade
- usar a implementação real como fonte primária
- observar a UI com cuidado
- registrar screenshots suficientes
- iterar até convergência

---

# INSTRUÇÃO FINAL DE EXECUÇÃO

Comece agora.

1. Faça o inventário do projeto.
2. Leia todos os arquivos relevantes, incluindo o arquivo de instruções do Claude Code.
3. Leia integralmente os documentos funcionais e de requisitos existentes.
4. Entenda a implementação do sistema completo até a Sprint 5.
5. Gere a especificação funcional observada.
6. Gere os casos de uso completos com fluxos de eventos reais detalhados.
7. Gere o plano de validação.
8. Implemente os testes Playwright.
9. Execute os testes.
10. Capture screenshots em cada ação e resposta relevante.
11. Analise os resultados.
12. Registre divergências.
13. Corrija.
14. Reexecute.
15. Repita em loop até convergência.
16. Emita o parecer final.
17. Gere o arquivo `TUTORIAL PARA USO ATE SPRINT5.md`.

Não pare na primeira passagem.
Não considere sucesso parcial como conclusão.
Só finalize quando houver evidência suficiente de validação real.