# TUTORIAL PARA USO ATE SPRINT5

## Objetivo deste tutorial

Este material foi preparado para orientar a validação do cliente sobre o que faz parte do sistema até a Sprint 5 e como navegar pelos módulos já implementados.

Importante:

- este tutorial foca o fluxo funcional principal
- algumas telas futuras continuam em estágio mock e não devem ser usadas como critério de aceite da Sprint 5

## Escopo recomendado para validação do cliente

Validar prioritariamente estes módulos:

- Login
- Dashboard
- Empresa
- Portfolio
- Parametrizações
- Captação
- Validação
- Impugnação
- Precificação
- Proposta
- Submissão
- Recursos
- Follow-up
- Atas
- Execução de Contrato
- Contratado x Realizado

Evitar usar como base de aceite nesta rodada:

- CRM
- Perdas
- Concorrência
- Flags
- Monitoria
- Mercado
- Lances

## 1. Acesso ao sistema

### Login

Objetivo:

- autenticar o usuário e liberar acesso às telas

Passos:

1. Abrir a tela de login.
2. Informar email e senha.
3. Entrar no sistema.

Resultado esperado:

- carregamento da shell principal com sidebar e conteúdo central

## 2. Estrutura de navegação

O menu lateral organiza o sistema em quatro grupos:

- `Fluxo Comercial`
- `Cadastros`
- `Indicadores`
- `Configuracoes`

Leitura prática:

- use `Configuracoes` e `Cadastros` para preparar base de dados
- use `Fluxo Comercial` para executar o pipeline licitatório
- use `Indicadores` para acompanhamento dos resultados já implementados

## 3. Preparação da base

### Empresa

Objetivo:

- cadastrar e manter os dados institucionais da empresa

Validar:

- dados cadastrais
- documentos
- certidões
- responsáveis

O que o cliente deve observar:

- persistência dos dados
- funcionamento dos modais e formulários
- consistência entre listagens e detalhes

### Portfolio

Objetivo:

- cadastrar produtos e organizar suas informações técnicas

Validar:

- cadastro manual de produto
- especificações técnicas
- documentos do produto
- classificação por área, classe e subclasse

O que observar:

- possibilidade de criar e editar produtos
- consistência das abas
- integração do portfolio com fluxos posteriores

### Parametrizações

Objetivo:

- configurar referências usadas pelos fluxos operacionais

Validar:

- parâmetros de score
- fontes de editais
- modalidades
- origens de órgão
- classificações auxiliares

## 4. Fluxo comercial

### Captação

Objetivo:

- buscar editais e selecionar oportunidades

Validar:

- busca por termo
- filtros
- score exibido
- seleção e salvamento de editais

O que observar:

- retorno de resultados
- badges e indicadores
- atualização após salvar

### Validação

Objetivo:

- aprofundar a análise do edital salvo

Validar:

- score por dimensões
- checklist documental
- análises complementares
- decisão de participação

O que observar:

- clareza dos painéis
- consistência entre score geral e dimensões
- resposta do sistema após ações de validação

### Impugnação

Objetivo:

- avaliar juridicamente o edital e apoiar a geração de impugnações

Validar:

- seleção de edital
- processamento de análise jurídica
- geração de conteúdo
- controle de prazo

### Precificação

Objetivo:

- trabalhar lotes, itens, vínculos com produtos e estratégias de preço

Validar:

- organização por lote
- vínculo item-produto
- camadas de preço
- estratégia competitiva

### Proposta

Objetivo:

- gerar e revisar proposta técnica

Validar:

- criação da proposta
- uso de template
- geração com IA
- edição do conteúdo
- status da proposta

### Submissão

Objetivo:

- concluir o ciclo da proposta e acompanhar estado documental

Validar:

- checklist pré-submissão
- atualização de status
- consistência da listagem de propostas prontas

### Recursos

Objetivo:

- analisar proposta vencedora e produzir insumos para recurso/contra-razão

Validar:

- monitoramento de janela
- análise da vencedora
- geração de laudo
- interação com chat de apoio

### Follow-up

Objetivo:

- registrar resultado do certame

Validar:

- registro de vitória
- registro de derrota
- atualização de status
- reflexos nas entidades derivadas quando aplicável

## 5. Pós-licitação

### Atas

Objetivo:

- buscar atas, extrair dados e acompanhar atas consultadas

Validar:

- busca
- extração
- visualização das atas salvas
- saldos vinculados quando existirem

### Execução de Contrato

Objetivo:

- acompanhar contratos, entregas, aditivos e designações

Validar:

- criação/consulta de contratos
- registro de entregas
- cronograma
- aditivos
- designações de gestor/fiscal

### Contratado x Realizado

Objetivo:

- comparar o contratado com o realizado e enxergar atrasos/vencimentos

Validar:

- cards resumo
- tabela consolidada
- atrasos
- próximos vencimentos

## 6. Como o cliente deve validar

Recomendação prática:

1. Começar por `Empresa`, `Portfolio` e `Parametrizações`.
2. Depois executar `Captação` → `Validação` → `Precificação` → `Proposta` → `Submissão`.
3. Em seguida validar `Recursos`, `Follow-up`, `Atas`, `Execução de Contrato` e `Contratado x Realizado`.

## 7. O que considerar aprovado

Considere o módulo aprovado quando:

- a navegação ocorre sem bloqueio
- os dados carregam e persistem
- as ações principais retornam resposta coerente
- o comportamento visual bate com a intenção do fluxo
- não há erro impeditivo para o objetivo central da tela

## 8. O que registrar como divergência

Registrar divergência quando houver:

- botão que não produz ação real
- tela com dados evidentemente simulados
- ação salva mas não persiste
- score inconsistente com os detalhes mostrados
- erro de carregamento ou travamento
- nomenclatura confusa a ponto de impedir uso

## 9. Fechamento

Este tutorial deve ser usado como roteiro de validação funcional guiada do cliente. O cliente não deve assumir que todo item presente no menu representa escopo final homologado; a validação deve seguir o recorte acima, com foco no que está efetivamente implementado até a Sprint 5.
