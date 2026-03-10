# Roteiro Completo de Validação — Sprint 2 (RF-001 a RF-037)

**Data:** 2026-03-10
**Sistema:** facilicita.ia — Agente de Editais
**Ambiente:** Backend porta 5007 | Frontend porta 5175
**Credenciais:** `pasteurjr@gmail.com` / `123456`

---

## Mapa de Navegação (Menu Lateral)

```
Sidebar (menu lateral esquerdo)
│
├── Fluxo Comercial
│   ├── Captação          → T-18 a T-26 (RF-019 a RF-025)
│   └── Validação         → T-27 a T-37 (RF-026 a RF-037)
│
├── Cadastros             → Páginas CRUD genéricas (NÃO usar para estes testes)
│
├── Configurações
│   ├── Empresa           → T-01 a T-05 (RF-001 a RF-005)
│   │   Seções na página (rolar para baixo):
│   │   1. Informações Cadastrais (topo)
│   │   2. Alertas IA sobre Documentos
│   │   3. Documentos da Empresa
│   │   4. Certidões Automáticas
│   │   5. Responsáveis (final da página)
│   │
│   ├── Portfolio         → T-06 a T-12 (RF-006 a RF-013)
│   │   Abas: Meus Produtos | Cadastro Manual | Uploads | Classificação
│   │
│   └── Parametrizações   → T-13 a T-17 (RF-014 a RF-018)
│       Abas: Produtos | Comercial | Fontes de Busca
│
└── Indicadores           → (não coberto neste roteiro)
```

> **ATENÇÃO:** A seção "Cadastros → Empresa" do menu lateral leva a páginas CRUD genéricas (tabelas simples). As páginas completas com formulários ricos estão em **"Configurações → Empresa/Portfolio/Parametrizações"**.

---

## Como usar este roteiro

Cada teste tem um **ID** (ex: T-01), o **requisito** que cobre (ex: RF-001), os **passos** numerados e o **resultado esperado** com checkboxes `[ ]` para marcar. Siga na ordem — alguns testes dependem de dados criados em testes anteriores.

**Legenda de status:**
- ✅ PASS — Funcionou conforme esperado
- ⚠️ PARCIAL — Funciona mas com ressalvas
- ❌ FAIL — Não funciona ou não existe

---

## PRÉ-REQUISITOS

1. Abrir terminal e rodar o backend:
   ```bash
   cd /mnt/data1/progpython/agenteditais
   python3 backend/app.py
   ```
2. Em outro terminal, rodar o frontend:
   ```bash
   cd /mnt/data1/progpython/agenteditais/frontend
   npm run dev
   ```
3. Abrir o navegador em `http://localhost:5175`
4. Fazer login com `pasteurjr@gmail.com` / `123456`
5. Verificar que o **Dashboard** carregou com cards de resumo

---

# BLOCO 1 — FUNDAÇÃO: EMPRESA (RF-001 a RF-005)

## T-01 | RF-001: Cadastro da Empresa
**Navegação:** Sidebar → **Configurações** → **Empresa**

**Passos:**
1. No menu lateral, expandir a seção **"Configurações"** e clicar em **"Empresa"**
2. Verificar o card **"Informações Cadastrais"** com os seguintes campos:
   - [ ] Razão Social
   - [ ] Nome Fantasia
   - [ ] CNPJ
   - [ ] Inscrição Estadual
   - [ ] Área de Atuação Padrão (dropdown)
   - [ ] Website
   - [ ] Instagram
   - [ ] LinkedIn
   - [ ] Facebook
   - [ ] **Emails de Contato** — lista dinâmica (botão adicionar/remover)
   - [ ] **Celulares/Telefones** — lista dinâmica (botão adicionar/remover)
   - [ ] Endereço, Cidade, UF, CEP
3. Preencher ou editar os campos
4. Adicionar 2 emails clicando no botão "+"
5. Adicionar 2 celulares clicando no botão "+"
6. Clicar **"Salvar Alterações"**
7. Recarregar a página (F5) e verificar que os dados persistiram

**Resultado esperado:**
- [ ] Todos os campos listados estão presentes
- [ ] Emails e celulares permitem adicionar/remover múltiplos valores
- [ ] Dados persistem após recarregar

---

## T-02 | RF-002: Documentos Habilitativos da Empresa
**Navegação:** Sidebar → **Configurações** → **Empresa** → rolar até a seção **"Documentos da Empresa"** (abaixo de "Alertas IA")

**Passos:**
1. Na página Empresa, localizar a seção **"Documentos da Empresa"**
2. Verificar que existe uma **tabela** com colunas: Documento, Tipo, Validade, Status
3. Verificar **badges de status**: OK (verde), Vence em breve (amarelo), Falta (vermelho)
4. Clicar **"Upload Documento"**
5. No modal, verificar os **tipos disponíveis**:
   - [ ] Habilitação Jurídica (Contrato Social, Procuração)
   - [ ] Habilitação Fiscal (Certidão Negativa)
   - [ ] Habilitação Econômica/Financeira (Balanço Patrimonial)
   - [ ] Qualificação Técnica (Atestado de Capacidade)
   - [ ] Sanitárias/Regulatórias (AFE ANVISA, CBPAD, CBPP, Corpo de Bombeiros)
6. Selecionar tipo "Contrato Social", anexar um PDF, definir data de vencimento
7. Clicar **"Enviar"**
8. Verificar que o documento aparece na tabela com status correto
9. Testar ações na linha: **Visualizar**, **Download**, **Excluir**

**Resultado esperado:**
- [ ] Tabela de documentos visível com colunas corretas
- [ ] Upload funciona (modal com tipos)
- [ ] Documento aparece na tabela após upload
- [ ] Ações (visualizar, download, excluir) funcionais

---

## T-03 | RF-003: Certidões Automáticas
**Navegação:** Sidebar → **Configurações** → **Empresa** → rolar até a seção **"Certidões Automáticas"** (abaixo de "Documentos da Empresa")

**Passos:**
1. Localizar a seção **"Certidões Automáticas"**
2. Verificar que o CNPJ da empresa está preenchido (necessário para busca)
3. Clicar **"Buscar Certidões"**
4. Aguardar a busca (pode demorar 10-30s por certidão)
5. Verificar a **tabela de certidões** com colunas: Certidão, Órgão Emissor, Status, Validade
6. Verificar **tipos de status**: Válida (verde), Vencida (vermelho), Pendente (amarelo), Buscando, Erro
7. Verificar o **seletor de frequência**: Desativada, Diária, Semanal, Quinzenal, Mensal
8. Testar **ações por certidão**: Abrir portal, Upload manual, Download, Atualizar

**Resultado esperado:**
- [ ] Botão "Buscar Certidões" dispara busca automática
- [ ] Tabela mostra certidões com status colorido
- [ ] Seletor de frequência presente
- [ ] Ações por certidão funcionais

---

## T-04 | RF-004: Alertas IA sobre Documentos
**Navegação:** Sidebar → **Configurações** → **Empresa** → seção **"Alertas IA sobre Documentos"** (logo abaixo de "Informações Cadastrais")

**Passos:**
1. Localizar a seção **"Alertas IA sobre Documentos"**
2. Verificar se há alertas gerados pela IA (comparação docs empresa vs requisitos de editais)
3. Clicar **"Verificar Documentos"** (envia comando ao chat)
4. Verificar se a IA analisa e retorna alertas sobre documentos faltantes ou vencidos

**Resultado esperado:**
- [ ] Seção de alertas IA visível
- [ ] Botão "Verificar Documentos" envia ao chat
- [ ] IA retorna análise de documentos (se houver editais salvos)

---

## T-05 | RF-005: Responsáveis da Empresa
**Navegação:** Sidebar → **Configurações** → **Empresa** → rolar até a seção **"Responsáveis"** (última seção da página)

**Passos:**
1. Localizar a seção **"Responsáveis"**
2. Verificar a **tabela** com colunas: Tipo, Nome, Cargo, Email
3. Clicar **"Adicionar"**
4. No modal, preencher:
   - Tipo: Representante Legal (ou Preposto, Responsável Técnico)
   - Nome: "João da Silva"
   - Cargo: "Diretor"
   - Email: "joao@empresa.com"
   - Telefone: "(31) 99999-0000"
5. Clicar **Salvar**
6. Verificar que o responsável aparece na tabela
7. Testar **Editar** (ícone lápis) — alterar cargo → Salvar
8. Testar **Excluir** (ícone lixeira) — confirmar exclusão

**Resultado esperado:**
- [ ] Tabela de responsáveis visível
- [ ] Modal adicionar com campos (Tipo, Nome, Cargo, Email, Telefone)
- [ ] 3 tipos disponíveis (Representante Legal, Preposto, Responsável Técnico)
- [ ] CRUD completo funcional (criar, editar, excluir)

---

# BLOCO 2 — FUNDAÇÃO: PORTFOLIO (RF-006 a RF-013)

## T-06 | RF-006: Portfolio — Fontes de Obtenção
**Navegação:** Sidebar → **Configurações** → **Portfolio** → aba **"Uploads"**

**Passos:**
1. No menu lateral, expandir **"Configurações"** e clicar em **"Portfolio"**
2. Clicar na aba **"Uploads"**
3. Verificar que existem **6 cards de upload**:
   - [ ] **Manuais** — PDFs técnicos dos produtos
   - [ ] **Instruções de Uso** — IFUs
   - [ ] **NFS** — Notas fiscais (Excel/CSV)
   - [ ] **Plano de Contas** — Planilha do ERP
   - [ ] **Folders** — Catálogos comerciais
   - [ ] **Website de Consultas** — URL do fabricante
4. Expandir o card **"Manuais"**
5. Verificar campos: input de arquivo (PDF), campo opcional de nome do produto
6. Anexar um PDF de manual técnico
7. Clicar **"Processar com IA"**
8. Aguardar processamento — a IA deve extrair especificações do manual
9. Verificar na aba **"Meus Produtos"** se o produto foi criado/atualizado

**Resultado esperado:**
- [ ] 6 cards de upload presentes
- [ ] Upload de arquivo funcional
- [ ] Botão "Processar com IA" aciona extração
- [ ] Informação "Deixe a IA trabalhar por você" visível

---

## T-07 | RF-007: Registros ANVISA
**Navegação:** Sidebar → **Configurações** → **Portfolio** (botão no header da página)

**Passos:**
1. Na página Portfolio, clicar **"Buscar ANVISA"** no header
2. Verificar que o sistema busca registros de produtos na ANVISA
3. Se houver resultados, verificar que o usuário pode validar/complementar
4. Verificar se o campo "Registro ANVISA" existe no cadastro de produto

**Resultado esperado:**
- [ ] Botão "Buscar ANVISA" presente no header
- [ ] Busca dispara ação (via chat ou API)
- [ ] Campo de registro ANVISA disponível no cadastro de produto

---

## T-08 | RF-008: Cadastro Manual de Produtos
**Navegação:** Sidebar → **Configurações** → **Portfolio** → aba **"Cadastro Manual"**

**Passos:**
1. Clicar na aba **"Cadastro Manual"**
2. Verificar o formulário com campos:
   - [ ] Nome do Produto (obrigatório)
   - [ ] Classe (dropdown): Equipamento, Reagente, Insumo Hospitalar, Informática
   - [ ] Subclasse (dropdown, depende da classe)
   - [ ] NCM
   - [ ] Fabricante
   - [ ] Modelo
3. Selecionar Classe = **"Reagente"**
4. Verificar que os **campos dinâmicos** mudam para: Metodologia, Sensibilidade, Especificidade, Validade, Armazenamento
5. Trocar para Classe = **"Equipamento"**
6. Verificar que os campos mudam para: Potência, Voltagem, Resistência, Peso, Dimensões
7. Preencher os campos e clicar **"Salvar Produto"**
8. Ir para aba **"Meus Produtos"** e verificar que o produto aparece

**Resultado esperado:**
- [ ] Formulário com campos obrigatórios
- [ ] Classe muda os campos dinâmicos (RF-009: Máscara Parametrizável)
- [ ] Produto salvo aparece na listagem

---

## T-09 | RF-010: IA Lê Manuais e Sugere Campos
**Navegação:** Sidebar → **Configurações** → **Portfolio** → aba **"Uploads"** → card **"Manuais"**

**Passos:**
1. Ir para aba **"Uploads"** → expandir card **"Manuais"**
2. Selecionar um PDF de manual técnico real
3. Opcionalmente informar o nome do produto
4. Clicar **"Processar com IA"**
5. Aguardar processamento (pode demorar 15-60s)
6. Ir para aba **"Meus Produtos"** → clicar no produto processado
7. Verificar no painel de detalhes:
   - [ ] **Especificações Técnicas** extraídas pela IA (tabela Nome/Valor/Unidade)
   - [ ] Botão **"Reprocessar IA"** disponível
   - [ ] Botão **"Verificar Completude"** disponível

**Resultado esperado:**
- [ ] IA extrai especificações do manual PDF
- [ ] Especificações aparecem na tabela do produto
- [ ] Botões de reprocessamento disponíveis

---

## T-10 | RF-011 + RF-013: Classificação/Agrupamento de Produtos
**Navegação:** Sidebar → **Configurações** → **Portfolio** → aba **"Classificação"**

**Passos:**
1. Clicar na aba **"Classificação"**
2. Verificar a **árvore hierárquica**: Classe > Subclasse
3. Para cada classe, verificar:
   - [ ] Nome da classe
   - [ ] NCMs associados
   - [ ] Contagem de subclasses
   - [ ] Contagem de produtos
4. Expandir uma classe → ver as subclasses
5. Clicar **"Nova Classe"** → preencher nome e NCMs → Salvar
6. Selecionar a nova classe → clicar **"Add Subclasse"** → preencher → Salvar
7. Testar **Editar** e **Excluir** em classe e subclasse
8. Verificar botão **"Gerar com IA"** (pode estar como "Onda 4 — bloqueado")

**Resultado esperado:**
- [ ] Árvore hierárquica Classe > Subclasse visível
- [ ] NCMs associados a cada nível
- [ ] CRUD completo (criar, editar, excluir classe e subclasse)
- [ ] Contagens de produtos por classe/subclasse

---

## T-11 | RF-012: Importância do NCM
**Navegação:** Sidebar → **Configurações** → **Portfolio** (abas **"Meus Produtos"** e **"Cadastro Manual"**)

**Passos:**
1. Na aba **"Meus Produtos"**, verificar que a tabela tem coluna **NCM**
2. Na aba **"Cadastro Manual"**, verificar campo **NCM** no formulário
3. Na aba **"Classificação"**, verificar que classes e subclasses têm **NCMs associados**

**Resultado esperado:**
- [ ] Coluna NCM na tabela de produtos
- [ ] Campo NCM no cadastro manual
- [ ] NCMs vinculados a classes/subclasses

---

## T-12 | RF-008 (listagem): Meus Produtos
**Navegação:** Sidebar → **Configurações** → **Portfolio** → aba **"Meus Produtos"**

**Passos:**
1. Clicar na aba **"Meus Produtos"**
2. Verificar **campo de busca**: "Buscar produto, fabricante, modelo..."
3. Digitar parte do nome de um produto → verificar filtragem instantânea
4. Verificar **filtro por Classe** (dropdown): Todas, Equipamentos, Reagentes, etc.
5. Verificar **tabela** com colunas: Produto, Fabricante, Classe, NCM, Ações
6. Clicar em um produto → verificar **painel de detalhes**:
   - [ ] Info: Nome, Fabricante, Modelo, Classe, NCM, Preço Referência, Descrição
   - [ ] Especificações Técnicas (tabela Nome/Valor/Unidade)
   - [ ] Botões: Reprocessar IA, Verificar Completude, Preços de Mercado, Excluir

**Resultado esperado:**
- [ ] Busca e filtro por classe funcionais
- [ ] Tabela com dados corretos
- [ ] Painel de detalhes com especificações e ações

---

# BLOCO 3 — FUNDAÇÃO: PARAMETRIZAÇÕES (RF-014 a RF-018)

## T-13 | RF-014: Fontes de Busca
**Navegação:** Sidebar → **Configurações** → **Parametrizações** → aba **"Fontes de Busca"**

**Passos:**
1. No menu lateral, expandir **"Configurações"** e clicar em **"Parametrizações"**
2. Clicar na aba **"Fontes de Busca"**
3. Verificar **tabela "Fontes de Editais"** com colunas: Nome, Tipo, URL, Status, Ações
4. Verificar fontes cadastradas (ex: PNCP, ComprasNet, BEC-SP, etc.)
5. Verificar **status**: Ativa (verde) ou Pausada (cinza)
6. Testar **pausar/retomar** uma fonte (botão toggle)
7. Clicar **"Cadastrar Fonte"** → preencher nome, tipo, URL → Salvar
8. Verificar seção **"Palavras-chave de Busca"**:
   - [ ] Tags visíveis com palavras-chave
   - [ ] Botão editar para modificar (separadas por vírgula)
9. Verificar seção **"NCMs para Busca"**:
   - [ ] Tags de NCMs
   - [ ] Botão "Adicionar NCM"

**Resultado esperado:**
- [ ] Tabela de fontes com CRUD
- [ ] Toggle ativar/pausar funcional
- [ ] Palavras-chave editáveis
- [ ] NCMs de busca editáveis

---

## T-14 | RF-015: Estrutura de Classificação (em Parametrizações)
**Navegação:** Sidebar → **Configurações** → **Parametrizações** → aba **"Produtos"**

**Passos:**
1. Clicar na aba **"Produtos"** (padrão)
2. Verificar seção **"Estrutura de Classificação"**
3. Verificar que é a mesma árvore de classes/subclasses do Portfolio (RF-013)
4. Testar criar uma nova classe → adicionar subclasse
5. Verificar NCMs associados

**Resultado esperado:**
- [ ] Árvore de classificação presente na aba Produtos
- [ ] Consistente com o Portfolio (mesmos dados)

---

## T-15 | RF-016: Parametrizações Comerciais
**Navegação:** Sidebar → **Configurações** → **Parametrizações** → aba **"Comercial"**

**Passos:**
1. Clicar na aba **"Comercial"**
2. Verificar seção **"Região de Atuação"**:
   - [ ] Checkbox "Atuar em todo o Brasil"
   - [ ] Grid com **27 botões de estados** (AC, AL, AM, ..., TO) — toggle clicável
   - [ ] Resumo: "Estados selecionados: SP, MG, RJ..."
   - [ ] Botão "Salvar Estados"
3. Selecionar 3-4 estados → Salvar → Recarregar → Verificar persistência
4. Verificar seção **"Tempo de Entrega"**:
   - [ ] Campo "Prazo máximo aceito (dias)" — número
   - [ ] Dropdown "Frequência máxima" — Diária, Semanal, Quinzenal, Mensal
   - [ ] Botão "Salvar Prazo/Frequência"
5. Verificar seção **"Mercado (TAM/SAM/SOM)"**:
   - [ ] TAM (Mercado Total) — campo monetário R$
   - [ ] SAM (Mercado Alcançável) — campo monetário R$
   - [ ] SOM (Mercado Objetivo) — campo monetário R$
   - [ ] Botão "Salvar Mercado"
   - [ ] Botão "Calcular com IA" (pode estar bloqueado — Onda 4)

**Resultado esperado:**
- [ ] Grid de 27 estados com toggle funcional
- [ ] Campos de prazo e frequência
- [ ] TAM/SAM/SOM com campos monetários
- [ ] Dados persistem após salvar

---

## T-16 | RF-017: Tipos de Edital
**Navegação:** Sidebar → **Configurações** → **Parametrizações** → aba **"Produtos"** → rolar até seção **"Tipos de Edital Desejados"**

**Passos:**
1. Na aba **"Produtos"**, rolar até a seção **"Tipos de Edital Desejados"**
2. Verificar **6 checkboxes**:
   - [ ] Comodato de equipamentos
   - [ ] Venda de equipamentos
   - [ ] Aluguel com consumo de reagentes
   - [ ] Consumo de reagentes
   - [ ] Compra de insumos laboratoriais
   - [ ] Compra de insumos hospitalares
3. Marcar/desmarcar 2-3 tipos
4. Clicar **"Salvar Tipos"**
5. Recarregar a página → verificar que a seleção persistiu

**Resultado esperado:**
- [ ] 6 checkboxes presentes
- [ ] Toggle on/off funcional
- [ ] Persistência após salvar

---

## T-17 | RF-018: Norteadores de Score
**Navegação:** Sidebar → **Configurações** → **Parametrizações** → aba **"Produtos"** → rolar até seção **"Norteadores de Score"**

**Passos:**
1. Na aba **"Produtos"**, localizar seção **"Norteadores de Score"**
2. Verificar **6 cards de norteadores**:
   - [ ] (a) Classificação/Agrupamento → Score Técnico
   - [ ] (b) Score Comercial → Score Comercial (clicável, leva à aba Comercial)
   - [ ] (c) Tipos de Edital → Score Recomendação
   - [ ] (d) Score Técnico → Score Técnico (configurável no Portfolio)
   - [ ] (e) Score Participação → Score Recomendação
   - [ ] (f) Score Aderência de Ganho → Score Ganho
3. Verificar que cada norteador tem **ícone, título e badge de status** (configurado/pendente)
4. Clicar no norteador (b) → verificar que navega para a aba Comercial

**Resultado esperado:**
- [ ] 6 norteadores visíveis com ícones
- [ ] Badges de status de configuração
- [ ] Navegação funcional entre norteadores e suas configurações

---

# BLOCO 4 — CAPTAÇÃO (RF-019 a RF-025)

## T-18 | RF-019: Painel de Oportunidades
**Navegação:** Sidebar → **Fluxo Comercial** → **Captação**

**Passos:**
1. No menu lateral, expandir **"Fluxo Comercial"** e clicar em **"Captação"**
2. Verificar título: **"Captação de Editais"**
3. Verificar **4 cards de prazo** no topo:
   - [ ] Próximos 2 dias (ícone vermelho)
   - [ ] Próximos 5 dias (ícone laranja)
   - [ ] Próximos 10 dias (ícone amarelo)
   - [ ] Próximos 20 dias (ícone azul)
4. Verificar o **formulário de busca** com campos:
   - [ ] Termo / Palavra-chave (input ou dropdown com produtos do portfolio)
   - [ ] UF (dropdown: Todas + 27 estados)
   - [ ] Fonte (dropdown: PNCP, ComprasNet, BEC-SP, Licitações-e, etc.)
   - [ ] Área / Classe / Subclasse (3 dropdowns em cascata)
   - [ ] Modalidade (dropdown)
   - [ ] Origem (dropdown: Federal, Estadual, Municipal, etc.)
   - [ ] NCM (campo texto)
   - [ ] Período de Publicação (dropdown: 30/60/90/180/365 dias)
5. Preencher: Termo = "reagentes", UF = "Todas", Fonte = "PNCP"
6. Selecionar modo de score: **"Score Rápido"**
7. Clicar **"Buscar Editais"**
8. Aguardar resultados (15-60s dependendo da fonte e modo de score)
9. Verificar **tabela de resultados** com colunas:
   - [ ] Checkbox (seleção)
   - [ ] Fonte (badge colorido)
   - [ ] Número
   - [ ] Órgão
   - [ ] UF
   - [ ] Modalidade
   - [ ] Objeto (truncado)
   - [ ] Valor (R$)
   - [ ] Produto (correspondente)
   - [ ] Prazo (dias restantes com badge)
   - [ ] Score (círculo colorido)
10. Verificar que os **cards de prazo** atualizaram as contagens

**Resultado esperado:**
- [ ] Formulário completo com todos os campos
- [ ] Busca retorna resultados na tabela
- [ ] Tabela com 11 colunas, dados formatados
- [ ] Cards de prazo atualizados após busca

---

## T-19 | RF-020: Painel Lateral de Análise
**Navegação:** Sidebar → **Fluxo Comercial** → **Captação** (após busca com resultados, clicar em um edital na tabela)

**Passos:**
1. Com resultados na tabela, **clicar em uma linha** (edital)
2. Verificar que o **painel lateral direito** abre com:
   - [ ] **Dados do Edital**: Número, Órgão, UF, Modalidade, Fonte, Valor, Abertura, Objeto
   - [ ] **Score Principal**: ScoreCircle grande (100px)
   - [ ] **Sub-scores**: Técnico, Comercial, Recomendação (ou 6 dimensões se score profundo)
   - [ ] **Produto Correspondente**: nome do produto ou "—"
   - [ ] **Potencial de Ganho**: badge Elevado (verde) / Médio (amarelo) / Baixo (vermelho)
   - [ ] **Itens do Edital**: mini-tabela (#, Descrição, Qtd, Valor Total) — se disponíveis
   - [ ] **Intenção Estratégica**: RadioGroup (Estratégico, Defensivo, Acompanhamento, Aprendizado)
   - [ ] **Expectativa de Margem**: Slider 0-50%
   - [ ] **Análise de Gaps**: barras atendido/parcial/não_atendido
   - [ ] **Info**: Valor, Abertura, Tipo, Origem
3. Verificar **botões de ação**:
   - [ ] Salvar Estratégia
   - [ ] Salvar Edital
   - [ ] Ir para Validação
   - [ ] Abrir no Portal
4. Clicar no **X** para fechar o painel → tabela volta a largura total

**Resultado esperado:**
- [ ] Painel lateral com todas as seções acima
- [ ] Botões de ação funcionais
- [ ] Painel fecha ao clicar X

---

## T-20 | RF-021: Filtros e Classificação
**Navegação:** Sidebar → **Fluxo Comercial** → **Captação** (formulário de busca no topo da página)

**Passos:**
1. Testar **filtro UF**: Selecionar "São Paulo" → Buscar → verificar que resultados são de SP
2. Testar **filtro Fonte**: Selecionar "ComprasNet" → Buscar → verificar badge de fonte
3. Testar **filtro Classe/Subclasse**: Selecionar uma classe → verificar filtragem
4. Testar **filtro Modalidade**: Selecionar "Pregão Eletrônico"
5. Testar **filtro Origem**: Selecionar "Federal"
6. Testar **NCM**: Digitar um código NCM (ex: "9027.80.99")
7. Testar **Período**: Selecionar "Últimos 30 dias"
8. Testar **checkbox "Incluir Editais Encerrados"**: Marcar e verificar que editais encerrados aparecem com badge "Encerrado"
9. Testar os **4 modos de score**:
   - [ ] Sem Score — busca rápida, sem cálculo
   - [ ] Score Rápido — calcula aderência batch via DeepSeek
   - [ ] Score Híbrido — rápido em todos + profundo nos top N
   - [ ] Score Profundo — 6 dimensões nos top N

**Resultado esperado:**
- [ ] Cada filtro limita os resultados conforme selecionado
- [ ] 4 modos de score funcionam com tempos distintos
- [ ] Editais encerrados aparecem/desaparecem conforme checkbox

---

## T-21 | RF-022: Datas de Submissão (Cards de Prazo)
**Navegação:** Sidebar → **Fluxo Comercial** → **Captação** (4 cards coloridos no topo da página)

**Passos:**
1. Após uma busca com resultados, verificar os **4 cards de prazo**:
   - [ ] "Próximos 2 dias" — contagem de editais com abertura em ≤2 dias
   - [ ] "Próximos 5 dias" — contagem ≤5 dias
   - [ ] "Próximos 10 dias" — contagem ≤10 dias
   - [ ] "Próximos 20 dias" — contagem ≤20 dias
2. Na tabela, verificar a coluna **Prazo** com badges:
   - [ ] Badge vermelho para ≤2 dias
   - [ ] Badge amarelo para ≤5 dias
   - [ ] Texto normal para os demais
   - [ ] Badge cinza "Encerrado" para editais passados

**Resultado esperado:**
- [ ] Cards refletem contagens corretas
- [ ] Coluna Prazo com badges coloridos por urgência

---

## T-22 | RF-023: Intenção Estratégica e Margem
**Navegação:** Sidebar → **Fluxo Comercial** → **Captação** → clicar em um edital na tabela → **painel lateral direito**

**Passos:**
1. Abrir painel lateral de um edital
2. Na seção **"Intenção Estratégica"**, selecionar **"Estratégico"**
3. Na seção **"Expectativa de Margem"**, mover o slider para **25%**
4. Clicar **"Salvar Estratégia"**
5. Verificar mensagem **"Estratégia salva com sucesso"**
6. Fechar o painel → reabrir o mesmo edital
7. Verificar que **intenção e margem persistiram**

**Resultado esperado:**
- [ ] RadioGroup com 4 opções
- [ ] Slider de margem 0-50%
- [ ] Dados persistem após salvar (tabela estrategias-editais)

---

## T-23 | RF-024: Análise de Gaps
**Navegação:** Sidebar → **Fluxo Comercial** → **Captação** → clicar em um edital → **painel lateral direito** → rolar até **"Análise de Gaps"**

**Passos:**
1. Abrir painel de um edital que tenha score calculado
2. Localizar seção **"Análise de Gaps"** ou **"Análise de Validação"**
3. Verificar:
   - [ ] Se tem score profundo: 6 barras dimensionais + decisão GO/NO-GO + pontos positivos/atenção
   - [ ] Se tem score rápido: barras atendido/parcial/não_atendido

**Resultado esperado:**
- [ ] Gaps visíveis com indicadores visuais
- [ ] Dados coerentes com o score calculado

---

## T-24 | RF-025: Monitoramento 24/7
**Navegação:** Sidebar → **Fluxo Comercial** → **Captação** → rolar até o final da página → card **"Monitoramento Automático"**

**Passos:**
1. Rolar até o card **"Monitoramento Automático"** na parte inferior
2. Se não houver monitoramentos: verificar mensagem orientativa
3. Clicar **"Novo Monitoramento"** (ou botão equivalente)
4. Preencher o formulário inline:
   - [ ] Termo de busca (obrigatório)
   - [ ] NCM (opcional)
   - [ ] UFs (separadas por vírgula)
   - [ ] Fonte (dropdown)
   - [ ] Frequência: 6h / 12h / 24h / Semanal
   - [ ] Score mínimo alerta (dropdown)
   - [ ] Incluir encerrados (sim/não)
5. Clicar **"Criar"**
6. Verificar que o monitoramento aparece na lista com:
   - [ ] Badge Ativo/Inativo
   - [ ] Termo, NCM, UFs, Fonte, Frequência, Score mínimo
   - [ ] Contagem "Encontrados"
   - [ ] "Último check"
7. Testar **Pausar** → badge muda para Inativo
8. Testar **Retomar** → badge volta para Ativo
9. Testar **Excluir**

**Resultado esperado:**
- [ ] Formulário de criação completo
- [ ] Monitoramento aparece na lista
- [ ] Ações pausar/retomar/excluir funcionais

---

## T-25 | RF-019 (complemento): Salvar Editais
**Navegação:** Sidebar → **Fluxo Comercial** → **Captação** → após buscar editais, ver **3 botões acima da tabela de resultados**

**Passos:**
1. Após busca com resultados, verificar **3 botões** acima da tabela:
   - [ ] **Salvar Todos** — salva todos os editais retornados
   - [ ] **Salvar Score >= 70%** — salva apenas editais com score alto
   - [ ] **Exportar CSV** — baixa os resultados em CSV
2. Na tabela, marcar **checkbox de 2-3 editais** → verificar que aparece barra de seleção
3. Clicar **"Salvar Selecionados"**
4. Verificar alert de confirmação: "X edital(is) salvo(s)"
5. Na coluna **Ações**, clicar no ícone de **salvar** (disquete) de um edital individual
6. Navegar para **Validação** → verificar que os editais salvos aparecem na tabela

**Resultado esperado:**
- [ ] 3 botões de ação em massa presentes
- [ ] Salvar selecionados funcional
- [ ] Salvar individual funcional
- [ ] Editais aparecem na Validação após salvar

---

## T-26 | RF-020 (complemento): Navegação Captação → Validação
**Navegação:** Sidebar → **Fluxo Comercial** → **Captação** → clicar em edital salvo → **painel lateral** → botão **"Ir para Validação"**

**Passos:**
1. Abrir painel de um edital **salvo**
2. Clicar **"Ir para Validação"**
3. Verificar que o sistema navega para a página de **Validação**
4. Verificar que o edital aparece na tabela de editais salvos

**Resultado esperado:**
- [ ] Botão "Ir para Validação" funcional
- [ ] Navegação correta para ValidacaoPage

---

# BLOCO 5 — VALIDAÇÃO (RF-026 a RF-037)

> **Pré-requisito:** Ter pelo menos 1 edital salvo na Captação (testes anteriores).

## T-27 | RF-026: Sinais de Mercado
**Navegação:** Sidebar → **Fluxo Comercial** → **Validação**

**Passos:**
1. No menu lateral, expandir **"Fluxo Comercial"** e clicar em **"Validação"**
2. Verificar **tabela "Meus Editais"** com editais salvos
3. Clicar em um edital para selecioná-lo
4. Verificar a **barra superior** com:
   - [ ] Espaço para **badges de sinais de mercado** (ex: "Concorrente Dominante", "Licitação Direcionada")
   - [ ] **Contador de Fatal Flaws** (badge vermelho, se houver)
   - [ ] Badge **"Decisão salva"** (se já houver decisão)

**Resultado esperado:**
- [ ] Barra superior visível após selecionar edital
- [ ] Badges de sinais (se calculados pela IA)

---

## T-28 | RF-027: Decisão (Participar / Acompanhar / Ignorar)
**Navegação:** Sidebar → **Fluxo Comercial** → **Validação** → selecionar edital → **barra superior** com 3 botões de decisão

**Passos:**
1. Com edital selecionado, verificar os **3 botões de decisão**:
   - [ ] **Participar** (verde, ícone ThumbsUp)
   - [ ] **Acompanhar** (azul, ícone Eye)
   - [ ] **Ignorar** (cinza, ícone X)
2. Clicar **"Participar"**
3. Verificar que abre **modal de justificativa** com:
   - [ ] **Dropdown "Motivo"** com opções:
     - Preço competitivo
     - Portfólio aderente
     - Margem insuficiente
     - Falta documentação
     - Concorrente forte
     - Risco jurídico
     - Fora da região
     - Outro
   - [ ] **Textarea "Detalhes"**
4. Selecionar motivo "Portfólio aderente"
5. Digitar: "Produto atende 100% dos requisitos técnicos"
6. Clicar **"Salvar Justificativa"**
7. Verificar:
   - [ ] Badge **"Decisão salva"** aparece (verde)
   - [ ] Status do edital mudou para **"Validado"** na tabela à esquerda
8. Selecionar outro edital → Clicar **"Acompanhar"** → Justificar → Salvar
   - [ ] Status muda para **"Analisando"**
9. Selecionar outro edital → Clicar **"Ignorar"** → Justificar → Salvar
   - [ ] Status muda para **"Descartado"**
10. Voltar ao primeiro edital → Clicar **"Ignorar"** → Salvar
    - [ ] Decisão é **atualizada** (não duplicada)

**Resultado esperado:**
- [ ] 3 botões com cores distintas
- [ ] Modal de justificativa com dropdown (8+ motivos) + textarea
- [ ] Decisão persiste e atualiza status na tabela
- [ ] Decisão pode ser alterada (update, não duplicar)

---

## T-29 | RF-028: Score Dashboard (6 Dimensões)
**Navegação:** Sidebar → **Fluxo Comercial** → **Validação** → selecionar edital → **painel direito** com Score Dashboard

**Passos:**
1. Selecionar um edital
2. Clicar **"Calcular Scores IA"** (botão com ícone Sparkles)
3. Aguardar loading (spinner, 10-30s)
4. Verificar o **Score Dashboard**:
   - [ ] **ScoreCircle grande** (110px) com Score Geral (0-100)
   - [ ] **6 barras horizontais** com porcentagem:
     1. Aderência Técnica
     2. Aderência Documental
     3. Complexidade do Edital
     4. Risco Jurídico
     5. Viabilidade Logística
     6. Atratividade Comercial
   - [ ] **Cores por nível**: verde (>=70), amarelo (30-70), vermelho (<30)
   - [ ] **Badge de Potencial**: Elevado / Médio / Baixo
   - [ ] **Decisão IA**: GO (verde) / NO-GO (vermelho) / CONDICIONAL (amarelo)
   - [ ] **Justificativa da IA**: parágrafo explicativo
   - [ ] **Pontos Positivos**: lista com ícones verdes
   - [ ] **Pontos de Atenção**: lista com ícones amarelos
5. Recalcular novamente → verificar que o score é **consistente** (temperature=0)

**Resultado esperado:**
- [ ] 6 scores + decisão + justificativa + pontos aparecem
- [ ] Score determinístico (mesmo valor ao recalcular)
- [ ] Produto correto selecionado (matching inteligente por keywords)

---

## T-30 | RF-029: Aba Aderência (Objetiva)
**Navegação:** Sidebar → **Fluxo Comercial** → **Validação** → selecionar edital → aba **"Aderência"** (ícone Target, abaixo do Score Dashboard)

**Passos:**
1. Clicar na aba **"Aderência"** (ícone Target)
2. Verificar:
   - [ ] **Banner de Decisão IA** no topo (GO/NO-GO/CONDICIONAL com cor)
   - [ ] **Sub-scores Técnicos Detalhados** — grid de barras com labels e valores
   - [ ] **Certificações** — lista com badges:
     - OK (verde)
     - Vencida (vermelho)
     - Pendente (amarelo)
   - [ ] **Análise de Lote** (RF-031):
     - Barra horizontal segmentada (verde = aderente, vermelho = intruso)
     - Legenda: "Aderente (N)" / "Item Intruso (N)"
   - [ ] **Mapa Logístico** (F5):
     - UF do Edital (📍) ↔ UF da Empresa (🏢)
     - Badge de distância: Próximo (verde) / Médio (amarelo) / Distante (vermelho)
     - Estimativa de entrega em dias
   - [ ] **Intenção Estratégica**: RadioGroup (4 opções)
   - [ ] **Slider de Margem**: 0-50%

**Resultado esperado:**
- [ ] Todas as seções populadas com dados do cálculo
- [ ] Análise de lote com barra visual
- [ ] Mapa logístico com distância

---

## T-31 | RF-036: Aba Documentos (Processo Amanda)
**Navegação:** Sidebar → **Fluxo Comercial** → **Validação** → selecionar edital → aba **"Documentos"** (ícone FolderOpen)

**Passos:**
1. Clicar na aba **"Documentos"** (ícone FolderOpen)
2. Verificar seção **"Itens do Edital"**:
   - [ ] Tabela com colunas: #, Descrição, Qtd, Unidade, Valor Unit., Valor Total
   - [ ] Se vazia: botão **"Buscar Itens no PNCP"**
3. Verificar **3 pastas coloridas** (Processo Amanda):
   - [ ] **Documentos da Empresa** (ícone pasta azul)
     - Lista de docs com status + badge "Exigido" + validade
   - [ ] **Certidões e Fiscal** (ícone pasta amarela)
   - [ ] **Qualificação Técnica** (ícone pasta verde)
4. Cada documento mostra:
   - [ ] Nome
   - [ ] Badge "Exigido" (se requerido pelo edital)
   - [ ] Status: Disponível (verde), Vencido (amarelo), Faltante (vermelho)
   - [ ] Validade
5. Verificar **Resumo de Completude**:
   - [ ] Barra de progresso com percentual
   - [ ] Cor: verde (100%), amarelo (>=70%), vermelho (<70%)
   - [ ] Contadores: Disponíveis / Vencidos / Faltantes
6. Verificar **Checklist Documental IA** (se disponível):
   - [ ] Tabela: Documento, Status (badge), Validade
7. Testar botão **"Extrair Requisitos do Edital"** (se edital PNCP):
   - [ ] Chama endpoint de extração
   - [ ] Recarrega documentação após sucesso
8. Testar botão **"Documentos Exigidos via IA"** (envia ao chat)

**Resultado esperado:**
- [ ] 3 pastas coloridas com documentos e status
- [ ] Completude calculada com barra de progresso
- [ ] Extração de requisitos funcional

---

## T-32 | RF-030 + RF-032 + RF-035: Aba Riscos (Analítica)
**Navegação:** Sidebar → **Fluxo Comercial** → **Validação** → selecionar edital → aba **"Riscos"** (ícone AlertTriangle)

**Passos:**
1. Clicar na aba **"Riscos"** (ícone AlertTriangle)
2. Verificar **"Pipeline de Riscos"**:
   - [ ] Badge de modalidade (ex: "Pregão Eletrônico")
   - [ ] Badge de risco preço predatório (se detectado)
   - [ ] Badge de prazo faturamento
3. Verificar **"Flags Jurídicos"**:
   - [ ] Lista de flags (badges amarelos/vermelhos) OU "Nenhum flag identificado" (verde)
4. Verificar **"Fatal Flaws"** (se existirem):
   - [ ] Card vermelho com lista de problemas críticos
   - [ ] Nota: "O sistema identificou estes problemas críticos antes da leitura humana"
5. Verificar **"Alerta de Recorrência"** (se 2+ editais semelhantes perdidos):
   - [ ] Mensagem com contagem de ocorrências
6. Verificar **"Aderência Trecho-a-Trecho"** (RF-030):
   - [ ] Tabela com 3 colunas: Trecho do Edital | Aderência (%) | Trecho do Portfolio
   - [ ] Cores: verde (>=70%), amarelo (30-70%), vermelho (<30%)
7. Verificar **"Avaliação por Dimensão"** (RF-035):
   - [ ] Grid com 6 dimensões: Técnico, Documental, Complexidade, Jurídico, Logístico, Comercial
   - [ ] Cada uma com badge: Atendido (verde >70) / Ponto de Atenção (amarelo 30-70) / Impeditivo (vermelho <30)

**Resultado esperado:**
- [ ] Pipeline de riscos com badges
- [ ] Flags jurídicos visíveis
- [ ] Fatal Flaws destacados (se houver)
- [ ] Tabela trecho-a-trecho
- [ ] Avaliação por dimensão com 6 cards

---

## T-33 | RF-033 + RF-034: Aba Mercado
**Navegação:** Sidebar → **Fluxo Comercial** → **Validação** → selecionar edital → aba **"Mercado"** (ícone Building)

**Passos:**
1. Clicar na aba **"Mercado"** (ícone Building)
2. Verificar **"Reputação do Órgão — {nome}"**:
   - [ ] Pregoeiro (texto descritivo)
   - [ ] Pagamento (ex: "Pagador regular")
   - [ ] Histórico (quantidade de participações + GO/NO-GO)
3. Verificar **"Histórico de Editais Semelhantes"**:
   - [ ] Lista com: número, badge de decisão (GO/NO-GO), score, objeto
   - [ ] Ou "Nenhum edital semelhante encontrado"
4. Verificar **"Alerta de Recorrência"** (RF-034):
   - [ ] Se houver: mensagem "Editais semelhantes foram recusados N vezes..."
5. Testar botão **"Buscar Preços"** → envia ao chat
6. Testar botão **"Analisar Concorrentes"** → envia ao chat

**Resultado esperado:**
- [ ] Card de reputação do órgão com 3 itens
- [ ] Histórico de editais semelhantes (real ou "nenhum encontrado")
- [ ] Botões de ação enviam ao chat

---

## T-34 | RF-029 (Cognitiva): Aba IA
**Navegação:** Sidebar → **Fluxo Comercial** → **Validação** → selecionar edital → aba **"IA"** (ícone Sparkles)

**Passos:**
1. Clicar na aba **"IA"** (ícone Sparkles)
2. Verificar seção **"Resumo Gerado pela IA"**:
   - [ ] Clicar **"Gerar Resumo"** → aguardar → texto aparece
   - [ ] Clicar **"Regerar Resumo"** → texto é substituído
3. Verificar seção **"Pergunte à IA"**:
   - [ ] Campo de texto (ex: "Qual o prazo de entrega?")
   - [ ] Botão **"Perguntar"**
   - [ ] Resposta aparece em box abaixo
4. Verificar **"Ações Rápidas via IA"**:
   - [ ] Requisitos Técnicos → envia ao chat
   - [ ] Classificar Edital → envia ao chat
   - [ ] Gerar Proposta → envia ao chat
   - [ ] Baixar PDF do Edital → envia ao chat
   - [ ] Buscar Itens → envia ao chat

**Resultado esperado:**
- [ ] Resumo IA funcional (gerar/regerar)
- [ ] Pergunta livre funcional com resposta
- [ ] 5 ações rápidas enviam comandos ao chat

---

## T-35 | RF-031: Análise de Lote (Itens Intrusos)
**Navegação:** Sidebar → **Fluxo Comercial** → **Validação** → selecionar edital → aba **"Aderência"** → rolar até seção **"Análise de Lote"**

**Passos:**
1. Na aba Aderência, localizar **"Análise de Lote"**
2. Verificar **barra horizontal segmentada**:
   - [ ] Blocos verdes = itens aderentes
   - [ ] Blocos vermelhos/amarelos = itens intrusos
3. Verificar **legenda**:
   - [ ] "Aderente (N)" com contagem
   - [ ] "Item Intruso (N)" com contagem
4. Se houver itens intrusos:
   - [ ] Texto de alerta sobre dependência de terceiros

**Resultado esperado:**
- [ ] Barra visual com proporção aderentes vs intrusos
- [ ] Legenda com contagens

---

## T-36 | RF-037: GO/NO-GO (Fluxo Completo)
**Navegação:** Sidebar → **Fluxo Comercial** → **Validação** → selecionar edital (fluxo completo: calcular scores → navegar abas → decidir)

**Passos — Fluxo completo de validação de um edital:**
1. Selecionar edital na tabela à esquerda
2. Clicar **"Calcular Scores IA"** → aguardar
3. Verificar **Score Geral + 6 dimensões + Decisão IA**
4. Navegar pelas **5 abas** verificando dados
5. Na barra superior, clicar **"Participar"** (se decisão é GO)
6. Preencher justificativa → Salvar
7. Verificar:
   - [ ] Badge "Decisão salva"
   - [ ] Status mudou para "Validado"
   - [ ] Score consolidado visível
8. **Recalcular scores** (clicar "Calcular Scores IA" novamente):
   - [ ] Scores recalculados
   - [ ] Valor consistente (mesma faixa — temperature=0)

**Resultado esperado:**
- [ ] Fluxo completo funciona end-to-end
- [ ] Decisão final salva e refletida na tabela

---

## T-37 | RF-028 (PDF): Ver Edital
**Navegação:** Sidebar → **Fluxo Comercial** → **Validação** → selecionar edital → botão **"Ver Edital"** no card de informações

**Passos:**
1. Com edital selecionado, clicar **"Ver Edital"**
2. Verificar que **modal PdfViewer** abre com o PDF
3. Na **primeira vez**: PDF é baixado do PNCP (pode demorar 5-15s)
4. Fechar o modal → reabrir → PDF carrega **instantaneamente** (do disco local)

**Resultado esperado:**
- [ ] PDF visualizado no modal
- [ ] Download automático do PNCP na primeira vez
- [ ] Cache local funcional na segunda vez

---

# RESUMO — CHECKLIST RÁPIDO

## Fundação: Empresa (RF-001 a RF-005)
| # | Teste | RF | Status |
|---|-------|-----|--------|
| T-01 | Cadastro da Empresa | RF-001 | [ ] |
| T-02 | Documentos Habilitativos | RF-002 | [ ] |
| T-03 | Certidões Automáticas | RF-003 | [ ] |
| T-04 | Alertas IA Documentos | RF-004 | [ ] |
| T-05 | Responsáveis | RF-005 | [ ] |

## Fundação: Portfolio (RF-006 a RF-013)
| # | Teste | RF | Status |
|---|-------|-----|--------|
| T-06 | Fontes de Obtenção (Uploads) | RF-006 | [ ] |
| T-07 | Registros ANVISA | RF-007 | [ ] |
| T-08 | Cadastro Manual + Máscara | RF-008, RF-009 | [ ] |
| T-09 | IA Lê Manuais | RF-010 | [ ] |
| T-10 | Classificação/Agrupamento | RF-011, RF-013 | [ ] |
| T-11 | NCM | RF-012 | [ ] |
| T-12 | Meus Produtos (listagem) | RF-008 | [ ] |

## Fundação: Parametrizações (RF-014 a RF-018)
| # | Teste | RF | Status |
|---|-------|-----|--------|
| T-13 | Fontes de Busca | RF-014 | [ ] |
| T-14 | Estrutura de Classificação | RF-015 | [ ] |
| T-15 | Comerciais (Região/Prazo/TAM) | RF-016 | [ ] |
| T-16 | Tipos de Edital | RF-017 | [ ] |
| T-17 | Norteadores de Score | RF-018 | [ ] |

## Captação (RF-019 a RF-025)
| # | Teste | RF | Status |
|---|-------|-----|--------|
| T-18 | Painel de Oportunidades (Busca) | RF-019 | [ ] |
| T-19 | Painel Lateral de Análise | RF-020 | [ ] |
| T-20 | Filtros e Classificação | RF-021 | [ ] |
| T-21 | Cards de Prazo | RF-022 | [ ] |
| T-22 | Intenção Estratégica e Margem | RF-023 | [ ] |
| T-23 | Análise de Gaps | RF-024 | [ ] |
| T-24 | Monitoramento 24/7 | RF-025 | [ ] |
| T-25 | Salvar Editais | RF-019 | [ ] |
| T-26 | Navegação Captação → Validação | RF-020 | [ ] |

## Validação (RF-026 a RF-037)
| # | Teste | RF | Status |
|---|-------|-----|--------|
| T-27 | Sinais de Mercado | RF-026 | [ ] |
| T-28 | Decisão (Participar/Acompanhar/Ignorar) | RF-027 | [ ] |
| T-29 | Score Dashboard (6 Dimensões) | RF-028 | [ ] |
| T-30 | Aba Aderência | RF-029, RF-031 | [ ] |
| T-31 | Aba Documentos (Processo Amanda) | RF-036 | [ ] |
| T-32 | Aba Riscos | RF-030, RF-032, RF-035 | [ ] |
| T-33 | Aba Mercado | RF-033, RF-034 | [ ] |
| T-34 | Aba IA (Cognitiva) | RF-029 | [ ] |
| T-35 | Análise de Lote | RF-031 | [ ] |
| T-36 | GO/NO-GO (Fluxo Completo) | RF-037 | [ ] |
| T-37 | Ver Edital (PDF) | RF-028 | [ ] |

**Total: 37 testes cobrindo 37 requisitos (RF-001 a RF-037)**
