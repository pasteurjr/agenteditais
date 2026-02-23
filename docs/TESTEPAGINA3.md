# TESTE DA PAGINA 3 — PORTFOLIO
## Guia Completo de Testes com Dados de Entrada e Saidas Esperadas

**Referencia:** WORKFLOW SISTEMA.pdf — Pagina 3
**Modulo:** PortfolioPage (route: "portfolio", menu: Configuracoes > Portfolio)

---

## INFORMACOES TECNICAS

| Item | Valor |
|---|---|
| Backend | http://localhost:5007 |
| Frontend | http://localhost:5175 |
| Login | pasteurjr@gmail.com / 123456 |
| Auth | POST /api/auth/login → access_token (Bearer) |
| Navegacao | Menu Configuracoes > Portfolio |

---

# TESTE 1 — Pagina carrega com 4 tabs visiveis

### O que diz o WORKFLOW:
> Portfolio: Uploads, Cadastro, Classificacao dos Produtos

### Onde testar:
Menu lateral → Configuracoes → **Portfolio**

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Fazer login no sistema | pasteurjr@gmail.com / 123456 |
| 2 | Expandir secao "Configuracoes" no menu lateral | — |
| 3 | Clicar em "Portfolio" | — |
| 4 | Verificar titulo da pagina | — |
| 5 | Verificar 4 tabs presentes | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Titulo da pagina | "Portfolio de Produtos" visivel |
| Tab 1 | "Meus Produtos" com icone e contagem |
| Tab 2 | "Uploads" visivel |
| Tab 3 | "Cadastro Manual" visivel |
| Tab 4 | "Classificacao" visivel |
| Tab ativa por padrao | "Meus Produtos" |
| Botoes no header | "Atualizar", "Buscar ANVISA", "Buscar na Web" |

---

# TESTE 2 — Tab "Meus Produtos": lista e tabela de produtos

### O que diz o WORKFLOW:
> Portfolio completo com produtos cadastrados, fabricante, modelo, classe, NCM e completude

### Onde testar:
Pagina Portfolio → Tab **Meus Produtos** (aba padrao)

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Acessar pagina Portfolio | — |
| 2 | Verificar que a tab "Meus Produtos" esta ativa | — |
| 3 | Verificar colunas da tabela | — |
| 4 | Verificar barra de filtros | — |
| 5 | Verificar acoes por produto | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Colunas da tabela | Produto, Fabricante, Modelo, Classe, NCM, Completude, Acoes |
| Barra de busca | Campo de busca com placeholder "Buscar produto, fabricante, modelo..." |
| Filtro de classe | Dropdown com opcoes: Todas, Equipamentos, Reagentes, Insumos Hospitalares, etc. |
| Botoes de acao por linha | Visualizar (olho), Reprocessar IA, Verificar Completude, Excluir |
| Completude | Barra ScoreBar mostrando % de preenchimento |

---

# TESTE 3 — Tab "Uploads": 6 cards de upload

### O que diz o WORKFLOW:
> Uploads: Manuais, Instrucoes de Uso, NFS, Plano de Contas, Folders, Website de Consultas

### Onde testar:
Pagina Portfolio → Tab **Uploads**

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Clicar na tab "Uploads" | — |
| 2 | Verificar titulo da secao | — |
| 3 | Contar os cards de upload | — |
| 4 | Verificar cada card pelo nome | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Header explicativo | "Varias fontes de obtencao do portfolio" |
| Total de cards | 6 cards de upload |
| Card 1 | "Manuais" — Manuais tecnicos dos produtos |
| Card 2 | "Instrucoes de Uso" — Instrucoes de uso e IFUs |
| Card 3 | "NFS" — Notas fiscais de servico |
| Card 4 | "Plano de Contas" — Plano de contas do ERP |
| Card 5 | "Folders" — Folders e catalogos comerciais |
| Card 6 | "Website de Consultas" — URL do site do fabricante |
| Card "IA trabalhar" | "Deixe a IA trabalhar por voce" visivel |

---

# TESTE 4 — Tab "Cadastro Manual": formulario com campos

### O que diz o WORKFLOW:
> Mascara de entrada parametrizavel para cadastrar caracteristicas tecnicas por classe

### Onde testar:
Pagina Portfolio → Tab **Cadastro Manual**

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Clicar na tab "Cadastro Manual" | — |
| 2 | Verificar titulo do card | — |
| 3 | Verificar campos do formulario | — |
| 4 | Selecionar uma classe e verificar specs dinamicas | Selecionar "Equipamentos" |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Titulo do card | "Crie uma base de conhecimento estruturada" |
| Campo "Nome do Produto" | Input presente com placeholder "Ex: Equipamento de Alta Tensao" |
| Campo "Classe" | Select com opcoes: Equipamentos, Reagentes, Insumos Hospitalares, Informatica |
| Campo "Subclasse" | Select presente (opcoes mudam conforme classe) |
| Campo "NCM" | Input presente com placeholder "Ex: 9027.30.11" |
| Campo "Fabricante" | Input presente com placeholder "Ex: Shimadzu" |
| Campo "Modelo" | Input presente com placeholder "Ex: UV-2600i" |
| Botoes | "Limpar" e "Cadastrar via IA" |
| Dica IA | Card com "Dica: Voce pode cadastrar produtos mais rapidamente..." |

### Teste extra — Specs dinamicas por classe:

| Classe Selecionada | Campos de Specs Esperados |
|---|---|
| Equipamentos | Potencia, Voltagem, Resistencia, Peso, Dimensoes |
| Reagentes | Metodologia, Sensibilidade, Especificidade, Validade, Armazenamento |
| Insumos Hospitalares | Material, Tamanho, Esterilidade, Quantidade por Caixa |
| Informatica | Processador, Memoria RAM, Armazenamento, Sistema Operacional |

---

# TESTE 5 — Tab "Classificacao": arvore de classes

### O que diz o WORKFLOW:
> Cadastro da estrutura de classificacao / agrupamento dos produtos: Classe de Produtos, NCM de cada Classe, Subclasse de Produtos, NCM de cada Subclasse

### Onde testar:
Pagina Portfolio → Tab **Classificacao**

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Clicar na tab "Classificacao" | — |
| 2 | Verificar titulo do card | — |
| 3 | Verificar classes presentes | — |
| 4 | Expandir uma classe para ver subclasses | Clicar em "Equipamentos" |
| 5 | Verificar NCM em cada nivel | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Titulo do card | "Cadastro da Estrutura de Classificacao" |
| Subtitulo | "Classe de Produtos → NCM de cada Classe → Subclasse de Produtos → NCM de cada Subclasse" |
| Total de classes | 4 classes: Equipamentos, Reagentes, Insumos Hospitalares, Informatica |
| Cada classe mostra NCM | Ex: Equipamentos = NCM: 9027, 9011, 8419 |
| Cada classe mostra contagem | "X produtos" |
| Subclasses de Equipamentos | Laboratorio (NCM: 9027.30, 9011.10), Hospitalar (NCM: 9018.19, 8419.20), Imagem e Diagnostico (NCM: 9022.14) |
| Nota IA | "A IA deveria gerar esses agrupamentos..." |
| Card Monitoramento | "Do ruido de milhares de editais..." com funil: Monitoramento → Filtro → Classificacao |
| Categorias no Filtro | Comodato, Alugueis, Venda, Consumo insumos |

---

# TESTE 6 — API: GET /api/crud/produtos

### Onde testar:
Via API direta

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Obter token de autenticacao | POST /api/auth/login com email e senha |
| 2 | Fazer GET /api/crud/produtos | Header: Authorization: Bearer <token> |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| HTTP Status | 200 |
| Resposta contém lista | Campo "items" com array de produtos |
| Cada produto tem campos | id, nome, fabricante, modelo, categoria, ncm |

---

# TESTE 7 — API: GET /api/crud/classes

### Onde testar:
Via API direta

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Fazer GET /api/crud/classes | Header: Authorization: Bearer <token> |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| HTTP Status | 200 |
| Resposta | JSON com classes cadastradas |

---

# TESTE 8 — API: POST /api/parametrizacoes/gerar-classes (IA)

### O que diz o WORKFLOW:
> A IA deveria gerar esses agrupamentos, caso o cliente nao os parametrize no sistema

### Onde testar:
Via API direta

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Fazer POST /api/parametrizacoes/gerar-classes | Header: Authorization: Bearer <token> |
| 2 | Aguardar resposta (10-30s) | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| HTTP Status | 200 |
| success | true |
| total_produtos | Numero > 0 |
| classes | Array de classes com nome, ncm_principal, subclasses |
| Cada classe tem subclasses | Array com nome e ncm |

---

# TESTE 9 — Screenshots de cada tab

### Passos:

| # | Acao | Screenshot |
|---|---|---|
| 1 | Tab Meus Produtos | p3_tab_produtos.png |
| 2 | Tab Uploads | p3_tab_uploads.png |
| 3 | Tab Cadastro Manual | p3_tab_cadastro.png |
| 4 | Tab Classificacao | p3_tab_classificacao.png |
| 5 | Classificacao expandida | p3_tab_classificacao_expandida.png |

---

# RESUMO — CHECKLIST RAPIDO

| # | Teste | Status |
|---|---|---|
| 1 | Pagina carrega com 4 tabs visiveis | ⬜ |
| 2 | Tab Meus Produtos: tabela com 7 colunas + filtros | ⬜ |
| 3 | Tab Uploads: 6 cards de upload presentes | ⬜ |
| 4 | Tab Cadastro Manual: formulario com 6 campos + specs dinamicas | ⬜ |
| 5 | Tab Classificacao: 4 classes + subclasses + NCM + monitoramento | ⬜ |
| 6 | API: GET /api/crud/produtos retorna produtos | ⬜ |
| 7 | API: GET /api/crud/classes retorna classes | ⬜ |
| 8 | API: POST /api/parametrizacoes/gerar-classes gera classes via IA | ⬜ |
| 9 | Screenshots de cada tab | ⬜ |

**Total: 9 testes cobrindo 100% da Pagina 3 do WORKFLOW SISTEMA**
