# RELATORIO: CARA SISTEMA.pdf vs Implementacao no App

**Data**: 2026-02-10
**Documento Analisado**: CARA SISTEMA.pdf (8 paginas)
**Repositorio**: agenteditais (facilicita.ia)

---

## INDICE

1. [Pagina 1 - Visao Geral da Arquitetura](#pagina-1---visao-geral-da-arquitetura)
2. [Pagina 2 - Empresa (Cadastro)](#pagina-2---empresa-cadastro)
3. [Pagina 3 - Portfolio](#pagina-3---portfolio)
4. [Pagina 4 - Parametrizacoes](#pagina-4---parametrizacoes)
5. [Pagina 5 - Captacao (Scores e Oportunidades)](#pagina-5---captacao-scores-e-oportunidades)
6. [Pagina 6 - Captacao (Classificacoes e Busca)](#pagina-6---captacao-classificacoes-e-busca)
7. [Pagina 7 - Validacao (Analise e Decisao)](#pagina-7---validacao-analise-e-decisao)
8. [Pagina 8 - Validacao (Aderencias e Riscos)](#pagina-8---validacao-aderencias-e-riscos)
9. [Resumo Geral de Cobertura](#resumo-geral-de-cobertura)
10. [Elementos Nao Presentes no PDF](#elementos-nao-presentes-no-pdf)

---

## PAGINA 1 - VISAO GERAL DA ARQUITETURA

### O que o PDF define:

A pagina 1 apresenta o mapa completo do sistema com 3 areas:

**TOPO - Menu Superior com 3 modulos de configuracao:**
- **Empresa (F1)**: Cadastro (Razao Social, CNPJ, Inscricao Estadual, Website, Instagram, LinkedIn, Facebook, Emails, Celulares) + Uploads (Contrato Social, AFE, CBPAD, CBPP, Corpo de Bombeiros)
- **Portfolio (F1)**: Uploads (Manuais, Instrucoes de Usos, NFS, Plano de Contas, Folders, Website de Consultas) + Cadastro (Classe de Produtos, NCM de cada Classe, Subclasse de Produtos, NCM de cada Subclasse)
- **Parametrizacoes (F1)**: Produtos (Arquitetura de Classes/Subclasses, IA pode trazer modelo do website/folders) + Comerciais (Regiao de atuacao, Tempo de entrega) + TAM/SAM/SOM

**ESQUERDA - Menu Lateral "Fluxo Comercial" (10 itens pretos):**
1. Captacao
2. Validacao
3. Precificacao
4. Proposta
5. Submissao
6. Lances
7. Followup
8. Impugnacao
9. Producao
10. CRM

**DIREITA - Menu Lateral "Indicadores" (7 itens vermelhos):**
1. Flags
2. Monitoria
3. Concorrencia
4. Mercado
5. Contratado X Realizado
6. Pedidos em Atraso
7. Perdas

**CENTRO - Dashboard Principal:**
- Barra superior: "LICITA.INTEL | Argus Diagnosticos" + badges de status (Captacao Atualizada Hoje, 2 Pendencias PNCP, 3 Alertas Criticos, Joao | Comercial)
- Busca: Campo "Buscar editais..."
- 3 cards de atencao imediata: "3 Editais Altamente Aderentes", "2 Riscos Relevantes", "1 Pendencia no PNCP"
- Funil de licitacoes: Captados 47 > Em Analise 12 > Decididos 8 > Acompanhando 15
- Secao "O que o sistema aprendeu com voce" (IA insights)
- Barra inferior: Portfolio da Empresa | Editais Acompanhados | Historico de Decisoes | Parametrizacoes | Relatorios
- Chat flutuante "Assistente Dr. Licita" com campo de mensagem
- Lema: "Decisao Humana, Apoiada por Inteligencia."

### Como foi implementado:

**Arquivo**: `frontend/src/components/Sidebar.tsx`

| Elemento do PDF | Implementacao | Status |
|-----------------|---------------|--------|
| Menu Superior (Empresa, Portfolio, Parametrizacoes) | Integrado como secao "Configuracoes" dentro do sidebar unico | MODIFICADO - Decisao de UI: sidebar unico em vez de menu superior separado |
| Menu Esquerdo (Fluxo Comercial) | Secao "Fluxo Comercial" no sidebar com 10 itens | IMPLEMENTADO - Ordem levemente diferente: Impugnacao aparece na posicao 3 em vez da 8 |
| Menu Direito (Indicadores) | Secao "Indicadores" no sidebar (mesmo lado esquerdo) | MODIFICADO - Unificado no sidebar unico a esquerda, sem menu direito separado |
| Dois sidebars (esquerda + direita) | Sidebar unico a esquerda | MODIFICADO - Correcao de UI/UX conforme ANALISE_UI_UX_CARA_SISTEMA.md |

**Arquivo**: `frontend/src/components/Dashboard.tsx`

| Elemento do PDF | Implementacao | Status |
|-----------------|---------------|--------|
| Barra superior com badges | NAO implementado (sem badges de status no header) | FALTANDO |
| Campo "Buscar editais..." | NAO implementado no Dashboard | FALTANDO |
| 3 cards de atencao imediata | Implementado como "Editais Urgentes" (card vermelho com 3 itens) | PARCIAL - Apenas urgencia por prazo, falta "Riscos Relevantes" e "Pendencias PNCP" |
| Funil de licitacoes | Implementado com 6 etapas (Captados 45 > Analise 28 > Validados 15 > Propostas 8 > Enviadas 5 > Ganhas 3) | IMPLEMENTADO - Etapas ligeiramente diferentes do PDF |
| "O que o sistema aprendeu" | Implementado como card "Insights da IA" com textos estaticos | PARCIAL - Mock, sem aprendizado real |
| Barra inferior de atalhos | NAO implementado | FALTANDO |
| Chat flutuante Dr. Licita | Implementado como componente FloatingChat.tsx | IMPLEMENTADO |
| KPIs (Captados, Propostas, etc.) | Implementado como 5 cards KPI (Em Analise, Propostas, Ganhas, Taxa Sucesso, Valor Total) | IMPLEMENTADO |
| Calendario/Proximos eventos | Implementado como card "Proximos Eventos" com 3 itens | IMPLEMENTADO |

**Ordem do Fluxo Comercial - PDF vs Implementacao:**

| Posicao | PDF (pagina 1) | Sidebar.tsx (atual) | Correto? |
|---------|----------------|---------------------|----------|
| 1 | Captacao | Captacao | SIM |
| 2 | Validacao | Validacao | SIM |
| 3 | Precificacao | **Impugnacao** | NAO - Impugnacao deveria estar na posicao 8 |
| 4 | Proposta | Precificacao | DESLOCADO |
| 5 | Submissao | Proposta | DESLOCADO |
| 6 | Lances | Submissao | DESLOCADO |
| 7 | Followup | Disputa Lances | DESLOCADO |
| 8 | Impugnacao | Followup | DESLOCADO |
| 9 | Producao | CRM | NAO - CRM deveria ser o ultimo |
| 10 | CRM | Execucao Contrato | DESLOCADO |

---

## PAGINA 2 - EMPRESA (CADASTRO)

### O que o PDF define:

**Titulo**: "O cadastro da empresa sera importante para gerar fontes de consultas para o portfolio e registrar todas as documentacoes usualmente exigidas para participacao nos editais."

**Cadastro da Empresa:**
- Formulario com campos: Razao Social, CNPJ, Inscricao Estadual, Website, Instagram
- Mockup visual mostrando "Aquila Diagnostico" como exemplo
- Icone de IA indicando que dados alimentam automaticamente o portfolio

**Uploads de Documentos:**
- Contrato Social, AFE, CBPAD, CBPP, Corpo de Bombeiros, etc.
- Icone "Documentos da Empresa" indicando repositorio de docs

**Conceitos-chave definidos:**

a. **Varias fontes de obtencao do portfolio:**
   - Uploads (manuais, folders, instrucoes de uso, etc.)
   - Acesso a ANVISA / registros dos produtos
   - Acesso ao banco de plano de contas do ERP
   - Acesso ao website e redes sociais do cliente
   - Acesso a todos os editais que o cliente ja participou

b. **Cadastro das Diferentes Fontes de Buscas:**
   - Palavras chaves geradas pela IA em funcao dos nomes dos produtos
   - Busca pelos NCMs afunilados no portfolio

c. **Cadastro da estrutura de classificacao/agrupamento dos produtos pelos clientes:**
   - IA deveria gerar esses agrupamentos caso o cliente nao os parametrize

### Como foi implementado:

**Arquivo**: `frontend/src/pages/EmpresaPage.tsx`

| Elemento do PDF | Implementacao | Status |
|-----------------|---------------|--------|
| Razao Social | Campo texto implementado | IMPLEMENTADO |
| CNPJ | Campo texto com mascara | IMPLEMENTADO |
| Inscricao Estadual | Campo texto implementado | IMPLEMENTADO |
| Website | Campo texto implementado | IMPLEMENTADO |
| Instagram | Campo texto implementado | IMPLEMENTADO |
| LinkedIn | NAO implementado como campo separado | FALTANDO |
| Facebook | NAO implementado como campo separado | FALTANDO |
| Emails, Celulares | Email e telefone no endereco, mas nao como campo social | PARCIAL |
| Upload Contrato Social | Tabela de documentos com upload por tipo (inclui "Contrato Social") | IMPLEMENTADO |
| Upload AFE | Tipo "AFE/ANVISA" na lista de documentos | IMPLEMENTADO |
| Upload CBPAD | NAO especificado na lista de tipos | FALTANDO |
| Upload CBPP | NAO especificado na lista de tipos | FALTANDO |
| Upload Corpo de Bombeiros | NAO especificado na lista de tipos | FALTANDO |
| Validade de documentos | Coluna "Validade" com status (OK, Vencendo, Faltando) | IMPLEMENTADO |
| Endereco completo | Secao completa (Logradouro, Cidade, UF, CEP, Telefone, Email) | IMPLEMENTADO (extra ao PDF) |
| Responsaveis | Tabela de pessoas responsaveis (Nome, Cargo, Email, Telefone) | IMPLEMENTADO (extra ao PDF) |
| IA alimentando portfolio | NAO implementado (sem integracao IA<->Empresa) | FALTANDO |
| Fontes de obtencao portfolio | NAO implementado (sem acesso ANVISA, ERP, website automatico) | FALTANDO |
| Geracao automatica de palavras-chave | NAO implementado | FALTANDO |

**Observacao**: A pagina EmpresaPage.tsx tem mais campos que o PDF pede (endereco, responsaveis), mas falta a integracao com IA e as fontes automaticas de dados que o PDF descreve. Os dados sao apenas mock local (estado React), sem persistencia em banco.

---

## PAGINA 3 - PORTFOLIO

### O que o PDF define:

**Titulo**: "Etapa mais estrategica"

**Uploads:**
- Upload de Manuais
- Upload de Instrucoes de Usos
- Upload NFS
- Upload Plano de Contas
- Upload Folders
- Website de Consultas

**Cadastro:**
- Classe de Produtos
- NCM de cada Classe
- Subclasse de Produtos
- NCM de cada Subclasse

**Formulario de Produto (mockup):**
- Nome do Produto: "Equipamento de Alta Tensao"
- Classe: "Classe B" (dropdown)
- Especificacao Tecnica 1: "Resistencia 10kΩ"
- Potencia: "1500W"
- Voltagem: "220V"
- Anexo: "Manual Tecnico.pdf"

**Conceitos:**
- "Crie uma base de conhecimento estruturada" - mascara parametrizavel para cadastrar especificacoes tecnicas por classe
- "Deixe a IA trabalhar por voce" - IA le manuais tecnicos e sugere/preenche campos
- Monitoramento Continuo: agente IA monitora fontes publicas diariamente
- Filtro Inteligente: classificacao automatica por categorias (Comodato, Alugueis, Venda, Consumo de reagentes, Consumo de insumos hospitalares)

**Fontes de obtencao:**
- Uploads (manuais, folders, instrucoes de uso)
- Acesso a ANVISA/registros dos produtos
- Acesso ao banco de plano de contas do ERP
- Acesso ao website e redes sociais do cliente
- Acesso a todos os editais que o cliente ja participou

### Como foi implementado:

**Arquivo**: `frontend/src/pages/PortfolioPage.tsx`

| Elemento do PDF | Implementacao | Status |
|-----------------|---------------|--------|
| Upload de Manuais | Modal de upload com tipo "Manual Tecnico" | IMPLEMENTADO |
| Upload de Instrucoes de Usos | Modal de upload com tipo "Instrucoes de Uso" | IMPLEMENTADO |
| Upload NFS | Modal de upload com tipo "NFS" | IMPLEMENTADO |
| Upload Plano de Contas | Modal de upload com tipo "Plano de Contas (ERP)" | IMPLEMENTADO |
| Upload Folders | Modal de upload com tipo "Folder Comercial" | IMPLEMENTADO |
| Website de Consultas | Modal "Buscar na Web" com campo nome/fabricante | IMPLEMENTADO |
| Tabela de produtos | Lista com colunas: Nome, Categoria, NCM, Completude %, Fonte | IMPLEMENTADO |
| Detalhes do produto | Painel lateral com Nome, Fabricante, Modelo, Categoria, NCM, Fonte | IMPLEMENTADO |
| Especificacoes tecnicas | Tabela de specs: Campo, Valor, Fonte, Status (com dots coloridos) | IMPLEMENTADO |
| Campo Nome do Produto | Presente no mock | IMPLEMENTADO |
| Campo Classe (dropdown) | NAO como dropdown separado, esta como "Categoria" na tabela | PARCIAL |
| Specs dinamicas (Resistencia, Potencia, Voltagem) | Tabela de specs mostra campos variados | IMPLEMENTADO |
| Anexo Manual Tecnico | Upload de arquivo com tipo selecionavel | IMPLEMENTADO |
| IA le manuais e preenche | Botao "Reprocessar com IA" existe, mas e mock | PARCIAL - UI existe, funcao mock |
| Indicador de completude | Coluna "Completude %" com barra de progresso | IMPLEMENTADO |
| Classe de Produtos / NCM | Exibido na tabela e detalhes | IMPLEMENTADO |
| Subclasse de Produtos | NAO implementado como conceito separado | FALTANDO |
| Acesso ANVISA | NAO implementado | FALTANDO |
| Acesso ERP | NAO implementado | FALTANDO |
| Acesso website automatico | NAO implementado | FALTANDO |
| Filtro inteligente por categoria | Filtro por categoria existe na tabela | IMPLEMENTADO |
| Monitoramento continuo | NAO implementado aqui (esta em MonitoriaPage) | IMPLEMENTADO EM OUTRA TELA |

**Observacao**: A tela Portfolio captura bem a essencia do PDF - upload de documentos, listagem de produtos, especificacoes tecnicas, indicador de completude. Porem, a integracao real com IA (leitura automatica de manuais, sugestao de campos) e mock. A hierarquia Classe > Subclasse > NCM nao esta implementada como arvore.

---

## PAGINA 4 - PARAMETRIZACOES

### O que o PDF define:

**Titulo**: "Etapa chave para geracao dos Scores e apresentacao das oportunidades de forma ordenada"

**Secoes:**

- **Produtos**: Arquitetura de Classes, Arquitetura de Subclasses (IA pode trazer modelo do website e folders previamente importados)
- **Comerciais**: Regiao de atuacao, Tempo de entrega
- **TAM/SAM/SOM**: Dimensionamento de mercado

**Conceitos detalhados:**

a. **Classificacao/agrupamento de produtos pelos clientes:**
   - IA deveria gerar agrupamentos automaticamente

b. **Norteadores do Score de Aderencia Comercial:**
   - Regiao comercial de atuacao
   - Limitacoes referentes a tempo de entrega

c. **Tipos de editais que se deseja participar:**
   - Comodatos, Vendas de Equipamentos, Aluguel com Consumo de Reagentes, Consumo de Reagentes, Compra de Insumos Laboratoriais, Compra de Insumos Hospitalares

d. **Norteadores do Score de Aderencia Tecnica:**
   - Cadastro de todas as informacoes tecnicas dos produtos

e. **Norteadores do Score de Recomendacao de Participacao:**
   - Cadastro de todas as fontes solicitadas pelo Edital

f. **Norteadores do Score de Aderencia de Ganho:**
   - xxxxxxxx (nao definido no PDF)

**Formulario visual (mockup):**
- Nome do Produto, Classe (dropdown), Especificacao Tecnica 1, Potencia, Voltagem
- Manual Tecnico.pdf anexado
- "Crie uma base de conhecimento estruturada"
- "Deixe a IA trabalhar por voce"

### Como foi implementado:

**Arquivo**: `frontend/src/pages/ParametrizacoesPage.tsx`

| Elemento do PDF | Implementacao | Status |
|-----------------|---------------|--------|
| **Aba Produtos** | | |
| Arquitetura de Classes | Arvore de classes expansivel com nome e NCM | IMPLEMENTADO |
| Arquitetura de Subclasses | Subclasses dentro de cada classe, com contagem de produtos | IMPLEMENTADO |
| IA gerar agrupamentos | Botao "Gerar Classes com IA" existe | PARCIAL - Botao mock |
| Adicionar/editar/excluir classes | Modais com formularios | IMPLEMENTADO (mock) |
| Adicionar/editar/excluir subclasses | Modais com formularios | IMPLEMENTADO (mock) |
| **Aba Comercial** | | |
| Regiao de atuacao | Grid de 27 estados brasileiros com selecao individual ou "Todo Brasil" | IMPLEMENTADO |
| Tempo de entrega | Campo com unidade (dias uteis / dias corridos / semanas) | IMPLEMENTADO |
| TAM/SAM/SOM | 3 cards com valores monetarios editaveis + botao "Calcular com IA" | IMPLEMENTADO |
| **Aba Fontes** | | |
| Fontes de editais | Tabela com PNCP, ComprasNET, Licitacoes-e, etc. com toggle ativo/inativo | IMPLEMENTADO |
| Palavras-chave | Lista de tags com adicao/remocao | IMPLEMENTADO |
| **Aba Notificacoes** | | |
| Email para notificacoes | Campo de email | IMPLEMENTADO |
| Canais (sistema, email, SMS) | Checkboxes por tipo | IMPLEMENTADO |
| Frequencia | Selecao de periodicidade | IMPLEMENTADO |
| **Aba Preferencias** | | |
| Tema (claro/escuro) | Radio buttons | IMPLEMENTADO |
| Idioma, Fuso horario | Dropdowns | IMPLEMENTADO |
| **Tipos de edital** | | |
| Comodatos, Vendas, Aluguel, etc. | NAO implementado como parametro separado | FALTANDO |
| **Scores configurados** | | |
| Score de Aderencia Comercial | Regiao + tempo de entrega implementados (norteadores) | PARCIAL |
| Score de Aderencia Tecnica | Depende do cadastro de produtos (Portfolio) | PARCIAL |
| Score de Recomendacao de Participacao | NAO implementado como configuracao | FALTANDO |
| Score de Aderencia de Ganho | NAO definido no PDF, nao implementado | N/A |

**Observacao**: ParametrizacoesPage.tsx e a tela mais completa em termos de UI. Tem 5 abas (Produtos, Comercial, Fontes, Notificacoes, Preferencias), cobrindo bem o PDF. As abas "Fontes", "Notificacoes" e "Preferencias" vao alem do que o PDF pede. Porem, a configuracao explicita dos "tipos de edital desejados" (Comodato, Venda, Aluguel, etc.) nao foi implementada como parametro.

---

## PAGINA 5 - CAPTACAO (SCORES E OPORTUNIDADES)

### O que o PDF define:

**Titulo**: "O layout de apresentacao das oportunidades associado aos Scores, sera o grande diferencial do sistema. A logica dos Scores sera a diferenciacao."

**Painel de Oportunidades (tabela):**
| Licitacao | Produto Correspondente | Score de Aderencia |
|-----------|----------------------|-------------------|
| Licitacao 2023/458 | Produto: Bomba Hidraulica X-300 | 98% |
| Licitacao 2023/461 | Produto: Valvula de Controle V-15 | 91% |
| Licitacao 2023/462 | Produto: Motor Eletrico M-550 | (com tooltip "Analise de Gaps - Requisito 4.2: Torque Maximo (desvio de 3%)") |
| Licitacao 2023/465 | Produto: Compressor de Ar C-80 | 88% |

**Analise do Edital (painel central):**
- Score de Aderencia Tecnica: 90% (gauge circular)
- Score de Aderencia Comercial: 75% (gauge circular)
- Score de Recomendacao de Participacao: 4.5/5 (estrelas)
- "O quanto as especificacoes do seu produto atendem as exigencias tecnicas do edital"
- "Analise de fatores como distancia, frequencia de entrega e custos logisticos"
- "Potencial de ganho consolidado com base na analise tecnica, comercial e premissas de atendimento"

**Monitoramento 24/7 & Busca Inteligente (infografico funil):**
- Monitoramento Abrangente 24/7
- Busca Inteligente por NCMs e palavras-chave
- Classificacao Automatica por tipo de edital
- Alertas em Tempo Real sobre oportunidades alinhadas
- Categorias: Comodatos, Venda de Equipamentos, Aluguel & Consumo, Insumos

**Datas de submissao das propostas:**
- Proximos 2 dias: 2 Editais
- Proximos 5 dias: 5 Editais
- Proximos 10 dias: x Editais
- Proximos 20 dias: x Editais

**Indicadores inferiores:**
- Score de Aderencia: 97% (gauge grande)
- Potencial de Ganho: "Elevado"
- Intencao estrategica: Radio (Edital Estrategico / Defensivo / Apenas Acompanhamento / Aprendizado)
- Expectativa de Margem: slider Media/Baixa com "Varia por Produto" / "Varia por Regiao"
- Analise de Gaps: "Requisito Tecnico 4.2.a nao atendido", "Certificacao XYZ pendente"
- Nota: "Isso muda completamente a leitura do score (Score baixo pode virar 'GO')."

### Como foi implementado:

**Arquivo**: `frontend/src/pages/CaptacaoPage.tsx`

| Elemento do PDF | Implementacao | Status |
|-----------------|---------------|--------|
| Tabela de oportunidades | Tabela com: Numero, Orgao, UF, Objeto, Valor Estimado, Abertura, Score, Status | IMPLEMENTADO |
| Score de Aderencia na tabela | Coluna "Score" com badge colorido (verde >70, amarelo 40-70, vermelho <40) | IMPLEMENTADO |
| Produto Correspondente | NAO implementado - tabela nao mostra qual produto do portfolio corresponde | FALTANDO |
| Score de Aderencia Tecnica (gauge) | NAO implementado como gauge separado | FALTANDO |
| Score de Aderencia Comercial (gauge) | NAO implementado como gauge separado | FALTANDO |
| Score de Recomendacao (estrelas) | NAO implementado | FALTANDO |
| Analise de Gaps | NAO implementado (sem tooltip de gaps) | FALTANDO |
| Datas de submissao (proximos X dias) | NAO implementado como painel separado | FALTANDO |
| Intencao estrategica (radio) | NAO implementado | FALTANDO |
| Expectativa de Margem (slider) | NAO implementado | FALTANDO |
| Potencial de Ganho | NAO implementado | FALTANDO |
| Monitoramento 24/7 (infografico) | NAO implementado visualmente (funcionalidade em MonitoriaPage) | FALTANDO AQUI |
| Classificacao automatica por tipo | NAO implementado | FALTANDO |
| Busca por NCMs e palavras-chave | Busca por termo implementada, sem filtro por NCM | PARCIAL |
| Filtro por UF | Dropdown de UF implementado | IMPLEMENTADO |
| Filtro por fonte | Dropdown PNCP/ComprasNET/Todas | IMPLEMENTADO |
| Checkbox "Calcular score" | Implementado | IMPLEMENTADO |
| Checkbox "Incluir encerrados" | Implementado | IMPLEMENTADO |
| Salvar editais (todos/recomendados/individual) | 3 botoes implementados | IMPLEMENTADO |
| Modal de detalhes | Modal com detalhes do edital ao clicar | IMPLEMENTADO |

**Observacao**: CaptacaoPage implementa a funcionalidade basica de busca e listagem, mas **nao implementa o sistema de scores multiplos** que e o diferencial descrito no PDF. O PDF descreve 4 scores separados (Tecnico, Comercial, Recomendacao, Ganho) e o app tem apenas 1 score geral. Falta toda a camada de "inteligencia estrategica" (intencao, margem, gaps).

---

## PAGINA 6 - CAPTACAO (CLASSIFICACOES E BUSCA)

### O que o PDF define:

**a. Classificacao quanto ao tipo de editais:**
- Editais de Reagentes
- Editais de Equipamentos
- Editais de Comodato
- Editais de Aluguel
- Editais de Oferta de Preco

**b. Classificacao quanto a origem dos editais:**
- Editais municipais, Estaduais, Federais
- Editais de Universidades
- Laboratorios Publicos ligados ao executivo (estadual ou municipal)
- LACENs - Laboratorios Publicos Centrais
- Hospitais Publicos
- Hospitais Universitarios
- Centros de Pesquisas
- Campanhas Governamentais Federais ou Estaduais
- Fundacoes de Pesquisas
- Fundacoes diversas

**c. Locais de Busca:**
- Jornais eletronicos
- Sistemas da prefeitura
- Portal PNCP de busca
- Acesso ao SICONV - portal de publicacao de editais

**d. Formato de Busca:**
- NCMs dos produtos
- Nome Tecnico dos Produtos
- Palavra chave
- Busca lendo todo o edital (nao pode ser busca pelo OBJETO do edital)
- IA deve fazer a leitura do edital buscando a palavra-chave

**e. Interface de Comunicacao com o Usuario:**
- Alertas gerados pela IA como resultado do monitoramento 24/7
- Tela/mensagem para informar o matching do edital (1x ao dia? Definir periodicidade)

### Como foi implementado:

**Arquivos**: `frontend/src/pages/CaptacaoPage.tsx` + `frontend/src/pages/MonitoriaPage.tsx` + `frontend/src/pages/ParametrizacoesPage.tsx`

| Elemento do PDF | Implementacao | Arquivo | Status |
|-----------------|---------------|---------|--------|
| Classificacao por tipo (Reagentes, Equipamentos, Comodato, Aluguel, Oferta de Preco) | NAO implementada como filtro ou parametro | - | FALTANDO |
| Classificacao por origem (Municipal, Estadual, Federal, Universidades, LACENs, etc.) | Parcial - filtro por UF existe, mas nao por tipo de orgao | CaptacaoPage | PARCIAL |
| Busca no PNCP | Fonte PNCP como opcao no dropdown | CaptacaoPage | IMPLEMENTADO |
| Busca no ComprasNET | Fonte ComprasNET como opcao | CaptacaoPage | IMPLEMENTADO |
| Busca no SICONV | NAO implementada como fonte | - | FALTANDO |
| Jornais eletronicos | NAO implementado | - | FALTANDO |
| Sistemas da prefeitura | NAO implementado | - | FALTANDO |
| Busca por NCM | NAO implementada | - | FALTANDO |
| Busca por Nome Tecnico | Busca por termo textual existe | CaptacaoPage | PARCIAL |
| Busca por Palavra-chave | Palavras-chave configuradas em Parametrizacoes | ParametrizacoesPage | IMPLEMENTADO |
| IA le o edital (nao so o objeto) | Busca atual e pelo OBJETO, nao pelo conteudo completo | Backend | PARCIAL |
| Alertas de matching | NAO implementados como notificacoes push | - | FALTANDO |
| Monitoramento 24/7 | UI de monitoramento com frequencia e estados | MonitoriaPage | IMPLEMENTADO (mock) |
| Periodicidade de alertas | Opcoes de frequencia (2h, 6h, 12h, 24h) no monitoramento | MonitoriaPage | IMPLEMENTADO (mock) |

**Observacao**: A classificacao granular descrita no PDF (por tipo de edital E por tipo de orgao) nao foi implementada. A busca funciona apenas por termo textual e UF, sem filtros por NCM, tipo de edital ou tipo de orgao.

---

## PAGINA 7 - VALIDACAO (ANALISE E DECISAO)

### O que o PDF define:

**Titulo**: "Essa e a fase em que o Usuario Acata as recomendacoes da IA e/ou agrega refinamentos de analises a partir de interacoes com a propria IA"

**Painel Superior-Esquerda - Sinais de Mercado:**
- Badge: "Concorrente Dominante Identificado"
- Badge: "Suspeita de Licitacao Direcionada"
- 3 botoes: [Participar] [Acompanhar] [Ignorar]
- Justificativa: Dropdown "Motivo: Margem Insuficiente" + campo texto "Concorrente X esta com preco predatorio"
- "Aprendizado da IA: A justificativa e o combustivel para a inteligencia futura."

**Painel Superior-Direita - Score Detalhado:**

*Aba Objetiva:*
- Score grande: 82
- Aderencia Tecnica: Requisitos de Hardware 95%, Certificacoes Pendente, Integracao de Sistemas 80%

*Aba Analitica:*
- Alerta de solvencia 75%
- Indicacao de savimento 65%
- Emmannuae 70%

*Aba Cognitiva:*
- Resumo da IA: texto
- Historico Semelhante: Licitacao 2023-A (Vencida), Licitacao 2022-B (Perdida - Preco)
- Pergunte a IA: campo de texto

- Risco Critico (badge vermelho)
- Atencao: Documentacao (badge amarelo)
- Checklist Documentos: Contrato Social (checked), Balanco Patrimonial (checked), Atestado de Capacidade (unchecked)
- Mapa Logistico: Entrega Estimada 5 dias
- Botoes: [Participar] [Ignorar]

**Painel Inferior-Esquerda - Analise de Lote:**
- Barra com itens: Aderente, Aderente, Aderente, ..., Item Intruso (amarelo)
- "Item Intruso: Dependencia de Terceiros (Impacto no Lote Inteiro)"
- Alerta de Recorrencia: "Editais semelhantes a este foram recusados 4 vezes por margem insuficiente"
  - Alta recorrencia de aditivos nesse orgao
  - Tecnicamente aderente, mas fora da politica comercial
- O Orgao (Reputacao): Pregoeiro rigoroso, Bom pagador, Historico de problemas politicos
- "Memoria Corporativa Permanente"

**Painel Inferior-Direita - Score Consolidado:**
- Score geral: 82/100 (circulo grande)
- 6 barras horizontais:
  - Aderencia tecnica (High): 90%
  - Aderencia documental (Medium): 65%
  - Complexidade do edital (Low): 35%
  - Risco juridico percebido (Medium): 60%
  - Viabilidade logistica (High): 85%
  - Atratividade comercial historica (High): 95%
- Modalidade e Risco: Pregao Eletronico, Risco de Preco Predatorio, Faturamento 45 dias
- Checklist Documental: Certidao Negativa (Vencida - Critico), Atestado de Capacidade (checked), Balanco Patrimonial (Ajustavel)
- Flags Juridicos: "Sinalizacao de aglutinacao indevida ou restricao regional"
- "O sistema identifica 'Fatal Flaws' antes da leitura humana detalhada"

### Como foi implementado:

**Arquivo**: `frontend/src/pages/ValidacaoPage.tsx`

| Elemento do PDF | Implementacao | Status |
|-----------------|---------------|--------|
| **Decisao (Participar/Acompanhar/Ignorar)** | Status dropdown com: Novo, Analisando, Validado, Descartado | PARCIAL - Falta "Acompanhar", logica diferente |
| **Justificativa com motivo** | NAO implementada | FALTANDO |
| **Aprendizado da IA com justificativas** | NAO implementado | FALTANDO |
| **Sinais de Mercado** | NAO implementados (sem "Concorrente Dominante", "Licitacao Direcionada") | FALTANDO |
| **Score 82/100 (circulo grande)** | Score aparece como badge na tabela, nao como circulo grande | PARCIAL |
| **6 barras de aderencia** | NAO implementadas (sem barras Tecnica/Documental/Juridica/etc.) | FALTANDO |
| **3 abas (Objetiva/Analitica/Cognitiva)** | NAO implementadas | FALTANDO |
| **Requisitos de Hardware/Certificacoes** | NAO implementado | FALTANDO |
| **Resumo da IA** | Botao "Resumir" que gera resumo textual | IMPLEMENTADO (funcionalidade basica) |
| **Historico Semelhante** | NAO implementado | FALTANDO |
| **Pergunte a IA** | Campo "Perguntar ao Edital" implementado | IMPLEMENTADO |
| **Checklist de Documentos** | NAO implementado | FALTANDO |
| **Mapa Logistico** | NAO implementado | FALTANDO |
| **Analise de Lote / Item Intruso** | NAO implementado | FALTANDO |
| **Alerta de Recorrencia** | NAO implementado | FALTANDO |
| **Reputacao do Orgao** | NAO implementado | FALTANDO |
| **Memoria Corporativa Permanente** | NAO implementado | FALTANDO |
| **Score consolidado com barras** | NAO implementado | FALTANDO |
| **Modalidade e Risco** | NAO implementado | FALTANDO |
| **Flags Juridicos** | NAO implementados | FALTANDO |
| **Fatal Flaws automaticos** | NAO implementado | FALTANDO |
| **Tabela de editais salvos** | Tabela com filtros por status e busca | IMPLEMENTADO |
| **Detalhes do edital** | Painel lateral com info basica | IMPLEMENTADO |
| **Baixar PDF** | Botao download PDF | IMPLEMENTADO |
| **Mudar status** | Dropdown de status | IMPLEMENTADO |

**Observacao**: A tela de Validacao e a **mais defasada** em relacao ao PDF. O PDF descreve uma tela extremamente rica com analise de aderencia multi-dimensional, sinais de mercado, historico, memoria corporativa, analise de lote e flags juridicos. A implementacao atual tem apenas: tabela de editais, resumo IA, pergunta IA, download PDF e mudanca de status. A maioria dos elementos criticos de "inteligencia" do PDF nao foi implementada.

---

## PAGINA 8 - VALIDACAO (ADERENCIAS E RISCOS)

### O que o PDF define:

**Titulo**: Continuacao da validacao - detalhamento dos scores de aderencia.

**Aderencia Tecnica e Traducao em Linguagem Natural:**
- Analise de Item 3.1
- Coluna "Trecho do Edital": "...fornecimento de switch 24 portas camada 3 com gerenciamento web..."
- Coluna "Aderencia": 82% (Parcialmente Aderente)
- Coluna "Trecho do Portfolio": "...modelo SW-24-L3 atende requisitos de gerenciamento e portas..."
- Resumo da IA: "Oportunidade promissora com aderencia tecnica forte. O score de 82 reflete baixo risco geral, mas atencao e necessaria para a documentacao pendente"

**Scores detalhados (a-f):**

a. **Aderencia / Riscos Tecnica:**
   - IA deve ressaltar trechos do edital que trazem riscos de aderencia tecnica vis a vis as caracteristicas tecnicas do portfolio

b. **Aderencia / Riscos Documental:**
   - Certidoes vencidas, detalhes sobre balancos, certidoes vencidas, registros requeridos

c. **Aderencia / Riscos Juridicos:**
   - Alta recorrencia de aditivos, historico de acoes contra empresas, aparencia de edital direcionado, pregoeiro rigoroso

d. **Aderencia / Riscos de Logistica:**
   - Criacao (nao detalhado)

e. **Aderencia / Riscos de Portfolio:**
   - Identificacao de itens intrusos
   - Necessidades de complementacao de portfolio
   - Portfolio familia ou individual

f. **Aderencia / Riscos Comerciais:**
   - Informacoes relevantes sobre precos
   - Precos predatorios
   - Historicos de atrasos de faturamentos
   - Margem impactada devido a frequencia de entrega ou custo de servir
   - Historico de atrasos de pagamentos
   - Concorrente dominante identificado

**Elementos visuais adicionais:**
- Card "O Orgao (Reputacao)": Pregoeiro rigoroso, Bom pagador, Historico de problemas politicos + "Memoria Corporativa Permanente"
- Card "Alerta de Recorrencia": "Editais semelhantes a este foram recusados 4 vezes por margem insuficiente" + bullets sobre aditivos e politica comercial

### Como foi implementado:

**Arquivo**: `frontend/src/pages/ValidacaoPage.tsx`

| Elemento do PDF | Implementacao | Status |
|-----------------|---------------|--------|
| Comparacao Trecho Edital vs Trecho Portfolio | NAO implementado | FALTANDO |
| Score de aderencia por item (82%) | NAO implementado | FALTANDO |
| Traducao em linguagem natural | NAO implementado | FALTANDO |
| Aderencia Tecnica detalhada | NAO implementado | FALTANDO |
| Aderencia Documental (certidoes, balancos) | NAO implementado | FALTANDO |
| Aderencia Juridica (riscos, historico) | NAO implementado | FALTANDO |
| Aderencia Logistica | NAO implementado | FALTANDO |
| Aderencia Portfolio (itens intrusos) | NAO implementado | FALTANDO |
| Aderencia Comercial (precos, concorrentes) | NAO implementado | FALTANDO |
| Reputacao do Orgao | NAO implementado | FALTANDO |
| Alerta de Recorrencia | NAO implementado | FALTANDO |
| Memoria Corporativa Permanente | NAO implementado | FALTANDO |
| Resumo da IA com contexto | Resumo basico existe, sem contexto de aderencia | PARCIAL |

**Observacao**: Nenhum dos elementos de aderencia detalhada (a-f) foi implementado na UI. Toda a logica de comparacao "Edital vs Portfolio" que e o core da validacao esta ausente. Este e o maior gap entre o PDF e a implementacao.

---

## RESUMO GERAL DE COBERTURA

### Por Pagina do PDF:

| Pagina | Conteudo | Cobertura UI | Cobertura Funcional | Nota |
|--------|----------|-------------|--------------------|----- |
| 1 | Visao Geral / Arquitetura | 80% | 40% | Estrutura de navegacao OK, dashboard parcial |
| 2 | Empresa | 70% | 20% | Campos OK, falta IA e integracao |
| 3 | Portfolio | 75% | 25% | Upload e listagem OK, falta IA real |
| 4 | Parametrizacoes | 85% | 30% | UI mais completa, falta logica dos scores |
| 5 | Captacao (Scores) | 30% | 15% | Busca basica OK, sistema de scores ausente |
| 6 | Captacao (Classificacoes) | 25% | 15% | Busca por termo OK, classificacoes ausentes |
| 7 | Validacao (Decisao) | 20% | 10% | Tabela OK, toda inteligencia ausente |
| 8 | Validacao (Aderencias) | 5% | 0% | Praticamente nada implementado |

### Por Funcionalidade Transversal:

| Funcionalidade | Descrita no PDF | Implementada | Status |
|----------------|----------------|--------------|--------|
| **Sistema de Scores Multiplos** | Score Tecnico, Comercial, Recomendacao, Ganho | Apenas 1 score geral | 15% |
| **IA le documentos/manuais** | IA preenche cadastro, analisa editais | Botoes mock sem funcao real | 10% |
| **Memoria Corporativa** | Sistema aprende com justificativas e historico | NAO implementado | 0% |
| **Comparacao Edital vs Portfolio** | Trecho a trecho com aderencia | NAO implementado | 0% |
| **Analise de Lote / Item Intruso** | Detecta itens que a empresa nao atende | NAO implementado | 0% |
| **Reputacao do Orgao** | Historico, pregoeiro, pagamentos | NAO implementado | 0% |
| **Alerta de Recorrencia** | Padroes de recusa em editais semelhantes | NAO implementado | 0% |
| **Sinais de Mercado** | Concorrente dominante, licitacao direcionada | NAO implementado | 0% |
| **Monitoramento 24/7** | Agente autonomo buscando editais | UI implementada, backend mock | 20% |
| **Classificacao por tipo/origem** | Reagentes, Equipamentos, Comodato, etc. | NAO implementado | 0% |
| **Intencao Estrategica** | Estrategico/Defensivo/Acompanhamento/Aprendizado | NAO implementado | 0% |
| **Chat Dr. Licita** | Assistente flutuante | Implementado e funcional | 80% |
| **Funil de Licitacoes** | Captados > Analise > Decididos > Acompanhando | Implementado no Dashboard | 70% |
| **Checklist Documental** | Status de certidoes e documentos exigidos | NAO implementado | 0% |
| **Flags Juridicos** | Aglutinacao indevida, restricao regional | NAO implementado | 0% |
| **Fatal Flaws** | Deteccao automatica de impedimentos | NAO implementado | 0% |

### Consolidado:

| Metrica | Valor |
|---------|-------|
| **Total de elementos descritos no PDF** | ~85 |
| **Elementos com UI implementada (mesmo mock)** | ~35 (41%) |
| **Elementos com funcionalidade real (backend)** | ~10 (12%) |
| **Paginas do app criadas** | 20 |
| **Paginas com dados reais (nao mock)** | ~3 (Captacao, Validacao parcial, Chat) |

---

## ELEMENTOS NAO PRESENTES NO PDF (IMPLEMENTADOS A MAIS)

As seguintes telas/funcionalidades foram implementadas no app mas **nao aparecem no CARA SISTEMA.pdf**:

| Tela | Descricao | Justificativa |
|------|-----------|---------------|
| **SubmissaoPage** | Checklist de submissao de proposta, anexar documentos | Inferido do fluxo (entre Proposta e Lances) |
| **FollowupPage** | Registrar resultado (vitoria/derrota), motivos | Inferido do fluxo |
| **ImpugnacaoPage** | Gerar texto de impugnacao/recurso com IA | Estava no menu, detalhes inferidos |
| **ProducaoPage** | Gestao de contratos, entregas, notas fiscais | Estava no menu como "Producao" |
| **CRMPage** | Gestao de leads, metas de vendedores, pos-perda | Estava no menu, detalhes inferidos |
| **FlagsPage** | Gestao de alertas configurados | Inferido de "Flags" no menu |
| **MonitoriaPage** | Configurar monitoramento com frequencia e UFs | Mencionado no PDF como conceito |
| **ConcorrenciaPage** | Analise de concorrentes com historico | Estava no menu |
| **MercadoPage** | Graficos de tendencias e categorias | Estava no menu |
| **ContratadoRealizadoPage** | Comparacao contratado vs realizado + atrasos | Estava no menu |
| **PerdasPage** | Analise de perdas com motivos e valores | Estava no menu |
| **FloatingChat** | Chat flutuante Dr. Licita | Mencionado no PDF pagina 1 |
| **Dashboard** | Dashboard com KPIs, funil, insights, calendario | Descrito na pagina 1 do PDF |
| **EmpresaPage** | Endereco, responsaveis (alem do PDF) | Extensao logica |
| **ParametrizacoesPage** | Abas de Fontes, Notificacoes, Preferencias (alem do PDF) | Extensao logica |

**Nota**: O PDF foca nas 3 telas de configuracao (Empresa, Portfolio, Parametrizacoes) e nas 2 telas operacionais mais criticas (Captacao e Validacao). As demais telas do Fluxo Comercial e Indicadores aparecem apenas como nomes nos menus laterais, sem detalhamento de conteudo.

---

## CONCLUSAO

O **CARA SISTEMA.pdf** define uma visao ambiciosa focada em **inteligencia de scores e aderencia multi-dimensional**. A implementacao atual:

1. **Acerta na estrutura de navegacao** - sidebar unificado, paginas separadas, chat flutuante
2. **Acerta no escopo de telas** - todas as 20+ telas mencionadas no menu foram criadas
3. **Falha na profundidade de Captacao e Validacao** - as duas telas mais detalhadas no PDF sao as mais superficiais na implementacao
4. **Nao implementa o diferencial do sistema** - o sistema de scores multiplos (Tecnico, Comercial, Portfolio, Juridico, Logistico) que o PDF descreve como "o grande diferencial" nao existe

**Gap critico**: A logica de **comparacao Edital vs Portfolio** (core da Validacao) e o **sistema de scores multi-dimensional** (core da Captacao) representam ~70% do valor descrito no PDF e 0% da implementacao funcional atual.

---

**Documento gerado em**: 2026-02-10
