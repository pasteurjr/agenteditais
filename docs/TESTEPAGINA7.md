# TESTEPAGINA7 - CAPTACAO: Classificacoes, Locais de Busca e Monitoramento

**Pagina:** 7 do WORKFLOW SISTEMA.pdf
**Modulo:** CaptacaoPage.tsx (mesma pagina da 5-6, foco nos filtros e monitoramento)
**Rota:** captacao (Fluxo Comercial > Captacao)

---

## CONTEXTO DA PAGINA 7

a. Classificacao quanto ao tipo de editais:
   Editais de Reagentes; Editais de Equipamentos; Editais de Comodato; Editais de Aluguel; Editais de Oferta de Preco

b. Classificacao quanto a origem desses editais:
   Editais municipais; Estaduais; Federais; Editais de Universidades; Laboratorios Publicos (LACENs); Hospitais Publicos; Hospitais Universitarios; Centros de Pesquisas; Campanhas Governamentais; Fundacoes de Pesquisas; Fundacoes diversas; etc.

c. Locais de Busca:
   Jornais eletronicos, sistemas da prefeitura, Portal PNCP de busca, Acesso ao SICONV - portal de publicacao de editais...

d. Formato de Busca:
   Criacao do formato de busca (NCMs dos produtos, Nome Tecnico dos Produtos, Palavra chave, etc.), com a busca lendo todo o edital (nao pode ser busca pelo OBJETO do edital). A IA deve fazer a leitura do edital, buscando a palavra-chave;

e. Interface de Comunicacao com o Usuario:
   Alertas gerados pela IA, como resultado de seu monitoramento 24/7 (ver os horarios de busca para nao encarecer o sistema), nas telas de interface com o usuario, etc.
   Tela de interface ou mensagem de interface para informar o matching do edital (1 vz ao dia? Definir essa periodicidade);

---

## TESTES

### T1: Classificacao por tipo de edital (5 tipos)
**Acao:** Verificar select "Classificacao Tipo" no formulario de busca
**Verificar:**
- Select existe com label "Classificacao Tipo"
- Opcoes: Todos, Reagentes, Equipamentos, Comodato, Aluguel, Oferta de Preco
- Total: 6 opcoes (incluindo "Todos")

### T2: Classificacao por origem de edital (8+ origens)
**Acao:** Verificar select "Classificacao Origem" no formulario de busca
**Verificar:**
- Select existe com label "Classificacao Origem"
- Opcoes: Todos, Municipal, Estadual, Federal, Universidade, Hospital, LACEN, Forca Armada, Autarquia
- Total: 9 opcoes (incluindo "Todos")

### T3: Locais de Busca (4 fontes + Todas)
**Acao:** Verificar select "Fonte" no formulario
**Verificar:**
- Select existe com label "Fonte"
- Opcoes: PNCP, ComprasNET, BEC-SP, SICONV, Todas as fontes
- Total: 5 opcoes

### T4: Formato de Busca - Campo termo/palavra-chave
**Acao:** Verificar campo de busca por termo
**Verificar:**
- Campo TextInput com label "Termo / Palavra-chave"
- Placeholder: "Ex: microscopio, reagente..."
- Botao "Buscar Editais" funcional

### T5: Formato de Busca - Checkbox calcular score
**Acao:** Verificar checkboxes no formulario
**Verificar:**
- Checkbox "Calcular score de aderencia (portfolio)" presente
- Checkbox "Incluir editais encerrados" presente

### T6: Interface de Comunicacao - Card Monitoramento Automatico
**Acao:** Scroll ate o card de Monitoramento
**Verificar:**
- Card "Monitoramento Automatico" visivel
- Se nenhum monitoramento: mensagem "Nenhum monitoramento configurado"
- Sugestao via chat: "Monitore editais de equipamentos laboratoriais no PNCP"
- Botao "Atualizar" presente

### T7: API Monitoramentos
**Acao:** GET /api/crud/monitoramentos
**Verificar:**
- HTTP 200
- Retorna array (pode ser vazio)

### T8: Filtro UF com 27 estados + Todas
**Acao:** Verificar select UF
**Verificar:**
- 28 opcoes (Todas + 27 UFs brasileiras)
- Inclui: AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO

### T9: Screenshots dos filtros e monitoramento
**Acao:** Capturar screenshots mostrando todos os selects expandidos e card de monitoramento
