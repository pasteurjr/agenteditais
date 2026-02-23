# PLANO DE TESTES - SISTEMA AGENTE DE EDITAIS

**Documento:** plano_testes_1.md
**Data:** 2026-02-21
**Escopo:** Páginas 2 a 10 do WORKFLOW SISTEMA.pdf
**Credenciais de teste:** pasteurjr@gmail.com / 123456
**URL Frontend:** http://localhost:5175
**URL Backend:** http://localhost:5007
**URL Chat:** Painel lateral direito do sistema (botão "Assistente IA")

---

# PAGINA 2 — EMPRESA

**Título no workflow:** "O cadastro da empresa será importante para gerar fontes de consultas para o portfolio e registrar todas as documentações usualmente exigidas para participação nos editais."

**Navegação:** Menu lateral > Configurações > Empresa
**Componente:** frontend/src/pages/EmpresaPage.tsx
**API principal:** GET/PUT /api/crud/empresas, POST /api/empresa-documentos/upload

---

## REQUISITO 2.1 — Cadastro da Empresa (Dados Básicos)

**Texto da página do workflow:**
> "Cadastro: Razão Social, CNPJ, Inscrição Estadual, Website, Instagram, LinkedIn, Facebook, Emails, Celulares, etc."

**Onde na UI foi implementado:**
- Card "Informações Cadastrais" na página Empresa
- Campos: Razão Social*, Nome Fantasia, CNPJ* (placeholder "00.000.000/0000-00"), Inscrição Estadual
- Seção "Presença Digital": Website, Instagram (@), LinkedIn, Facebook
- Seção "Endereço": Endereço, Cidade, UF, CEP
- Listas dinâmicas: Emails de Contato (botão "Adicionar"), Celulares/Telefones (botão "Adicionar")
- Botão "Salvar Alterações"

**Passo a passo para testar na UI:**
1. Fazer login com pasteurjr@gmail.com / 123456
2. No menu lateral, clicar em "Configurações" > "Empresa"
3. Verificar que o card "Informações Cadastrais" está visível
4. Preencher os campos:
   - Razão Social: "Áquila Diagnóstico Ltda"
   - CNPJ: "11.111.111/0001-11"
   - Inscrição Estadual: "123.456.789.000"
   - Website: "http://aquila.com"
   - Instagram: "@aquiladiag"
5. Clicar em "Salvar Alterações"
6. Recarregar a página (F5) e verificar que os dados persistiram

**Passo a passo para testar no Chat com Agente:**
1. Abrir o chat (botão "Assistente IA" no canto superior direito)
2. Digitar: "qual o CNPJ da minha empresa?"
3. Verificar que a IA responde com o CNPJ cadastrado
4. Digitar: "atualize o website da empresa para http://aquiladiag.com.br"
5. Verificar que a IA confirma a atualização
6. Ir na página Empresa e verificar que o campo Website foi alterado

**Dados de teste:**
| Campo | Valor |
|-------|-------|
| Razão Social | Áquila Diagnóstico Ltda |
| CNPJ | 11.111.111/0001-11 |
| Inscrição Estadual | 123.456.789.000 |
| Website | http://aquila.com |
| Instagram | @aquiladiag |
| LinkedIn | linkedin.com/company/aquila |
| Facebook | facebook.com/aquila |
| Email | contato@aquila.com |
| Celular | (31) 99999-0001 |

**Resultados esperados:**
- Todos os campos aceitam entrada de texto
- Campos obrigatórios (Razão Social, CNPJ) são validados
- Dados salvos persistem após recarregar
- Chat consegue ler e alterar dados da empresa

---

## REQUISITO 2.2 — Uploads de Documentos da Empresa

**Texto da página do workflow:**
> "Uploads: Contrato Social, AFE, CBPAD, CBPP, Corpo de Bombeiros, ...."

**Onde na UI foi implementado:**
- Card "Documentos da Empresa" na página Empresa
- Tabela com colunas: Documento, Tipo, Validade, Status (badge OK/Vence em breve/Falta), Ações
- Botão "Upload Documento" (abre modal)
- Modal: Select "Tipo de Documento" (contrato_social, atestado_capacidade, balanco, alvara, registro_conselho, procuracao, outro), File input, Data Validade

**Passo a passo para testar na UI:**
1. Na página Empresa, rolar até o card "Documentos da Empresa"
2. Clicar no botão "Upload Documento"
3. No modal, selecionar Tipo = "Contrato Social"
4. Selecionar um arquivo PDF de teste
5. Informar Validade = "31/12/2026"
6. Clicar em "Enviar"
7. Verificar que o documento aparece na tabela com status "OK"
8. Clicar no ícone de olho (Eye) para visualizar o documento
9. Clicar no ícone de download para baixar

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "quais documentos da empresa estão cadastrados?"
2. Verificar que a IA lista os documentos com tipo e status
3. Digitar: "algum documento está vencido?"
4. Verificar que a IA informa documentos vencidos ou próximos do vencimento

**Dados de teste:**
| Documento | Tipo | Validade |
|-----------|------|----------|
| contrato_social_aquila.pdf | Contrato Social | 31/12/2026 |
| afe_aquila.pdf | Alvará | 30/06/2026 |
| atestado_cap.pdf | Atestado Capacidade | 31/12/2025 (vencido) |

**Resultados esperados:**
- Upload funciona para arquivos PDF
- Documento aparece na tabela após upload
- Badge de status mostra "OK" (válido), "Vence em breve" (< 30 dias), ou "Falta" (vencido)
- Visualização inline do PDF funciona
- Download do arquivo funciona

---

## REQUISITO 2.3 — Certidões Automáticas

**Texto da página do workflow:**
> "O sistema já pega as certidões de forma automática, na linha do que é feito no ComLicitações"

**Onde na UI foi implementado:**
- Card "Certidões Automáticas" na página Empresa
- Tabela: Certidão, Status (Obtida/Pendente/Erro), Data Obtenção, Validade, Ações
- Tipos: cnd_federal, cnd_estadual, cnd_municipal, fgts, trabalhista, outro
- API: POST /api/empresa-certidoes/buscar-automatica

**Passo a passo para testar na UI:**
1. Na página Empresa, rolar até "Certidões Automáticas"
2. Verificar que a tabela mostra as certidões com seus status
3. Verificar badges: "Obtida" (verde), "Pendente" (amarelo), "Erro" (vermelho)
4. Clicar no ícone RefreshCw para atualizar uma certidão

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "quais certidões da empresa estão vencidas?"
2. Verificar que a IA lista certidões com status e validade
3. Digitar: "busque as certidões atualizadas da empresa"
4. Verificar que a IA tenta buscar nos portais oficiais

**Dados de teste:**
Não requer entrada — as certidões são buscadas automaticamente com base no CNPJ cadastrado.

**Resultados esperados:**
- Tabela lista certidões com status correto
- Certidões vencidas mostram badge "Vencida" ou "Erro"
- Sistema identifica certidões que precisam renovação

---

## REQUISITO 2.4 — Responsáveis da Empresa

**Texto da página do workflow:**
> "Cadastro: ... Emails, Celulares, etc." (área de contatos e responsáveis)

**Onde na UI foi implementado:**
- Card "Responsáveis" na página Empresa
- Tabela: Nome, Cargo, Email, Ações
- Botão "Adicionar" (abre modal)
- Modal: Nome*, Cargo, Email*, Telefone, Tipo (representante_legal, preposto, tecnico)

**Passo a passo para testar na UI:**
1. Na página Empresa, rolar até "Responsáveis"
2. Clicar em "Adicionar"
3. Preencher: Nome = "João Silva", Cargo = "Diretor Técnico", Email = "joao@aquila.com"
4. Clicar em "Salvar"
5. Verificar que o responsável aparece na tabela
6. Clicar no ícone lixeira para excluir (deve pedir confirmação)

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "quem são os responsáveis cadastrados na empresa?"
2. Verificar que a IA lista os responsáveis com cargos

**Dados de teste:**
| Nome | Cargo | Email | Tipo |
|------|-------|-------|------|
| João Silva | Diretor Técnico | joao@aquila.com | tecnico |
| Maria Santos | Representante Legal | maria@aquila.com | representante_legal |

**Resultados esperados:**
- Modal abre corretamente
- Responsável é adicionado e aparece na tabela
- Exclusão funciona com confirmação
- Chat lista responsáveis corretamente

---

# PAGINA 3 — PORTFOLIO

**Título no workflow:** "Etapa mais estratégica"

**Navegação:** Menu lateral > Configurações > Portfolio
**Componente:** frontend/src/pages/PortfolioPage.tsx
**API principal:** GET /api/crud/produtos, POST /api/upload, POST /api/chat-upload

---

## REQUISITO 3.1 — Várias Fontes de Obtenção do Portfolio

**Texto da página do workflow:**
> "Várias fontes de obtenção do portfolio: Uploads (manuais, folders, instruções de uso, etc.); Acesso à ANVISA / registros dos produtos; Acesso ao banco de plano de contas do ERP; Acesso ao website e redes sociais do cliente; Acesso a todos os editais que o cliente já participou, etc."

**Onde na UI foi implementado:**
- Tab "Uploads" na página Portfolio
- 6 cards de upload:
  1. Manuais (BookOpen icon)
  2. Instruções de Uso (ClipboardList icon)
  3. NFS (Receipt icon)
  4. Plano de Contas (FileText icon)
  5. Folders (FolderOpen icon)
  6. Website de Consultas (MonitorSmartphone icon)
- Cada card: File input + "Nome do Produto (opcional)" + Botão "Processar com IA"
- Card "Deixe a IA trabalhar por você" com fluxo: Manual → IA → Produto Cadastrado
- Botões no header: "Buscar ANVISA" (Shield), "Buscar na Web" (Globe)

**Passo a passo para testar na UI:**
1. Ir em Configurações > Portfolio
2. Clicar na tab "Uploads"
3. Verificar que os 6 cards de upload estão visíveis
4. Clicar no card "Manuais"
5. Selecionar um PDF de manual técnico
6. Digitar nome do produto: "Equipamento de Alta Tensão"
7. Clicar em "Processar com IA"
8. Aguardar processamento — verificar que produto é criado na tab "Meus Produtos"
9. Clicar no botão "Buscar ANVISA" no header
10. No modal, digitar: "microscopio" e clicar "Buscar via IA"
11. Clicar no botão "Buscar na Web"
12. No modal, digitar produto: "Equipamento de Alta Tensão", fabricante: "Siemens"
13. Clicar "Buscar via IA"

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "cadastre um produto chamado Microscópio Óptico Binocular, fabricante Nikon, modelo Eclipse E200"
2. Verificar que a IA cria o produto e lista as especificações extraídas
3. Digitar: "busque o registro ANVISA do produto Microscópio Óptico"
4. Verificar que a IA tenta buscar na ANVISA
5. Digitar: "importe os produtos do website http://aquila.com/produtos"
6. Verificar que a IA tenta acessar e extrair produtos
7. Digitar: "liste meus produtos cadastrados"
8. Verificar que a IA mostra a lista completa

**Dados de teste:**
| Upload | Arquivo | Produto Esperado |
|--------|---------|-----------------|
| Manual | manual_microscopio.pdf | Microscópio Óptico |
| Instrução de Uso | instrucao_centrifuga.pdf | Centrífuga Laboratorial |
| Folder | folder_reagentes.pdf | Kit Reagente PCR |

**Resultados esperados:**
- Todos os 6 cards de upload funcionam
- IA extrai especificações do PDF automaticamente
- Produto criado aparece na tab "Meus Produtos"
- Busca ANVISA retorna registros
- Busca na Web retorna informações do produto

---

## REQUISITO 3.2 — Registros de Produtos pela ANVISA

**Texto da página do workflow:**
> "Registros de Produtos pela Anvisa: A IA tenta trazer os registros e o usuário valida ou complementa..."

**Onde na UI foi implementado:**
- Botão "Buscar ANVISA" (Shield icon) no header da página Portfolio
- Modal: campo "Número de Registro ANVISA" OU "Nome do Produto"
- Botão "Buscar via IA"

**Passo a passo para testar na UI:**
1. Na página Portfolio, clicar "Buscar ANVISA"
2. Digitar nome do produto: "hemoglobina glicada"
3. Clicar "Buscar via IA"
4. Verificar que a IA busca e retorna resultados de registros ANVISA

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "busque o registro ANVISA do produto hemoglobina glicada"
2. Verificar que a IA retorna dados do registro (número, fabricante, validade)
3. Digitar: "cadastre esse produto com as informações da ANVISA"
4. Verificar que o produto é criado com dados enriquecidos

**Dados de teste:**
- Termo de busca: "hemoglobina glicada"
- Registro ANVISA esperado: número de registro, fabricante, validade

**Resultados esperados:**
- Modal de busca ANVISA funciona
- IA retorna registros encontrados
- Usuário pode cadastrar produto baseado no registro

---

## REQUISITO 3.3 — Cadastro Estruturado de Produtos

**Texto da página do workflow:**
> "Crie uma base de conhecimento estruturada. Utilize uma máscara de entrada totalmente parametrizável para cadastrar as características técnicas de seus produtos por classe, seguindo os critérios normalmente avaliados nos certames."
> "Nome do Produto, Classe, Especificação Técnica 1, Potência, Voltagem"

**Onde na UI foi implementado:**
- Tab "Cadastro Manual" na página Portfolio
- Campos: Nome do Produto*, Classe (select), Subclasse (select), NCM, Fabricante, Modelo
- Seção "Especificações Técnicas" dinâmica (campos mudam conforme a classe selecionada)
- Botão "Cadastrar via IA" (Sparkles icon)

**Passo a passo para testar na UI:**
1. Na página Portfolio, clicar na tab "Cadastro Manual"
2. Preencher:
   - Nome do Produto: "Equipamento de Alta Tensão"
   - Classe: "Classe B" (selecionar no dropdown)
   - NCM: "9027.80.99"
   - Fabricante: "Siemens"
   - Modelo: "X-500"
3. Preencher especificações técnicas que aparecerem (ex: Potência = "1500W", Voltagem = "220V", Resistência = "10kΩ")
4. Clicar "Cadastrar via IA"
5. Verificar que produto aparece na tab "Meus Produtos"

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "cadastre um produto: nome Centrífuga Laboratorial, fabricante Eppendorf, modelo 5424R, classe equipamento, potência 250W, voltagem 220V, rotação máxima 21130 RPM"
2. Verificar que a IA cria o produto com todas as especificações
3. Digitar: "verifique a completude do produto Centrífuga Laboratorial"
4. Verificar que a IA indica campos faltantes ou porcentagem de completude

**Dados de teste:**
| Campo | Valor |
|-------|-------|
| Nome | Equipamento de Alta Tensão |
| Classe | Classe B |
| NCM | 9027.80.99 |
| Fabricante | Siemens |
| Modelo | X-500 |
| Potência | 1500W |
| Voltagem | 220V |
| Resistência | 10kΩ |

**Resultados esperados:**
- Formulário aceita todos os campos
- Especificações dinâmicas mudam conforme a classe
- Produto é criado com sucesso
- IA sugere campos faltantes via "Verificar Completude"

---

## REQUISITO 3.4 — IA Lê Manuais e Sugere Campos

**Texto da página do workflow:**
> "Deixe a IA trabalhar por você. A IA realiza a leitura dos manuais técnicos dos seus produtos e sugere novos campos ou preenche requisitos faltantes, garantindo um cadastro rico e completo para maximizar a compatibilidade."

**Onde na UI foi implementado:**
- Card "Deixe a IA trabalhar por você" na tab Uploads
- Botão "Reprocessar IA" no detalhe do produto (tab Meus Produtos)
- Botão "Verificar Completude" no detalhe do produto
- Badge "IA" nas especificações extraídas automaticamente

**Passo a passo para testar na UI:**
1. Na tab "Meus Produtos", clicar em um produto que foi cadastrado via upload de PDF
2. Verificar que as especificações têm badge "IA" (extraídas automaticamente)
3. Clicar "Reprocessar IA" — verificar que novas especificações podem ser adicionadas
4. Clicar "Verificar Completude" — verificar a porcentagem de completude

**Passo a passo para testar no Chat com Agente:**
1. Fazer upload de um PDF no chat: arrastar arquivo manual_tecnico.pdf para o chat
2. Digitar junto: "extraia as especificações deste manual e cadastre como produto"
3. Verificar que a IA extrai nome, especificações técnicas do PDF
4. Digitar: "reprocesse o produto Microscópio Óptico para extrair mais especificações"
5. Verificar que a IA re-analisa e sugere complementos

**Dados de teste:**
- Arquivo: qualquer PDF de manual técnico de equipamento laboratorial

**Resultados esperados:**
- IA extrai especificações automaticamente do PDF
- Badge "IA" aparece nos campos extraídos
- Reprocessamento pode adicionar novos campos
- Completude mostra porcentagem realista

---

## REQUISITO 3.5 — Classificação/Agrupamento de Produtos

**Texto da página do workflow:**
> "Cadastro das Diferentes Fontes de Buscas: Palavras chaves (geradas pela IA, em função dos nomes dos produtos); Busca pelos NCMs, afunilados no portfolio"

**Onde na UI foi implementado:**
- Tab "Classificação" na página Portfolio
- Árvore de classes expandível: Classe > Subclasses > Produtos
- Cada classe mostra: nome, badge NCM, contagem de produtos
- Card "Funil de Monitoramento": Monitoramento Contínuo → Filtro Inteligente → Classificação Automática

**Passo a passo para testar na UI:**
1. Na página Portfolio, clicar na tab "Classificação"
2. Verificar que as classes existentes são listadas como árvore
3. Expandir uma classe para ver suas subclasses
4. Verificar que cada classe mostra o NCM e quantidade de produtos
5. Verificar o card "Funil de Monitoramento" com os 3 passos e badge "Agente Ativo"

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "liste as classes de produtos cadastradas"
2. Verificar que a IA mostra classes com NCMs
3. Digitar: "gere palavras-chave de busca baseadas nos meus produtos"
4. Verificar que a IA gera termos relevantes

**Dados de teste:**
Não requer entrada — usa produtos já cadastrados.

**Resultados esperados:**
- Árvore de classificação mostra estrutura correta
- NCMs são exibidos por classe
- Funil de monitoramento mostra os 3 passos

---

# PAGINA 4 — PARAMETRIZAÇÕES

**Título no workflow:** "Etapa chave para geração dos Scores e apresentação das oportunidades de forma ordenada"

**Navegação:** Menu lateral > Configurações > Parametrizações
**Componente:** frontend/src/pages/ParametrizacoesPage.tsx
**API principal:** GET/POST /api/crud/parametros-score, POST /api/parametrizacoes/gerar-classes

---

## REQUISITO 4.1 — Cadastro da Estrutura de Classificação

**Texto da página do workflow:**
> "a. Cadastro da estrutura de classificação / agrupamento dos produtos pelos clientes: A IA deveria gerar esses agrupamentos, caso o cliente não os parametrize no sistema (na área de parametrização)"

**Onde na UI foi implementado:**
- Tab "Produtos" na página Parametrizações
- Seção "Estrutura de Classificação": Árvore Classes → Subclasses
- Botões por classe: "Adicionar Subclasse", "Editar", "Excluir"
- Botões globais: "Nova Classe", "Gerar com IA (Onda 4)"
- Modal "Nova Classe": Nome*, NCMs
- Modal "Nova Subclasse": Classe Pai (disabled), Nome*, NCMs*

**Passo a passo para testar na UI:**
1. Ir em Configurações > Parametrizações
2. Verificar tab "Produtos" ativa por padrão
3. Na seção "Estrutura de Classificação", clicar "Nova Classe"
4. Preencher: Nome = "Equipamentos Laboratoriais", NCMs = "9027.80.99, 9027.50.00"
5. Clicar "Salvar"
6. Verificar que a classe aparece na árvore
7. Clicar "Adicionar Subclasse" na classe criada
8. Preencher: Nome = "Microscópios", NCMs = "9011.80.00"
9. Clicar "Salvar"
10. Verificar que a subclasse aparece dentro da classe

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "gere a estrutura de classificação dos meus produtos automaticamente"
2. Verificar que a IA analisa os produtos e sugere classes/subclasses
3. Digitar: "crie uma classe chamada Reagentes com NCM 3822.00.90"
4. Verificar que a classe é criada

**Dados de teste:**
| Classe | NCMs | Subclasses |
|--------|------|------------|
| Equipamentos Laboratoriais | 9027.80.99, 9027.50.00 | Microscópios, Centrífugas |
| Reagentes | 3822.00.90 | PCR, Hematologia |

**Resultados esperados:**
- Classes são criadas e aparecem na árvore
- Subclasses aparecem dentro da classe pai
- NCMs são exibidos como badges
- Edição e exclusão funcionam

---

## REQUISITO 4.2 — Norteadores do Score Comercial

**Texto da página do workflow:**
> "b. Norteadores do Score de Aderência Comercial: Região comercial de atuação; Limitações referentes à tempo de entrega, etc."

**Onde na UI foi implementado:**
- Tab "Comercial" na página Parametrizações
- Seção "Região de Atuação": Checkbox "Atuar em todo o Brasil" + Grid de 27 UFs
- Seção "Tempo de Entrega": Prazo máximo aceito (dias), Frequência máxima (select)
- Seção "Mercado (TAM/SAM/SOM)": 3 campos com prefixo R$

**Passo a passo para testar na UI:**
1. Na página Parametrizações, clicar na tab "Comercial"
2. Na seção "Região de Atuação":
   - Desmarcar "Atuar em todo o Brasil"
   - Clicar nos botões de UF: SP, RJ, MG, ES (selecionar Sudeste)
   - Verificar que o resumo mostra "4 estados selecionados"
3. Na seção "Tempo de Entrega":
   - Preencher prazo máximo: 30 dias
   - Selecionar frequência: "Mensal"
4. Na seção "Mercado":
   - TAM: 500.000.000
   - SAM: 100.000.000
   - SOM: 20.000.000

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "quais são as regiões de atuação da empresa?"
2. Verificar que a IA retorna os estados configurados
3. Digitar: "configure a região de atuação para todo o Sudeste e Sul"
4. Verificar que a IA atualiza as UFs

**Dados de teste:**
| Parâmetro | Valor |
|-----------|-------|
| UFs | SP, RJ, MG, ES |
| Prazo máximo | 30 dias |
| Frequência | Mensal |
| TAM | R$ 500.000.000 |
| SAM | R$ 100.000.000 |
| SOM | R$ 20.000.000 |

**Resultados esperados:**
- Grid de UFs funciona como toggle (clique seleciona/deseleciona)
- "Atuar em todo o Brasil" seleciona/deseleciona todos
- Campos de mercado aceitam valores monetários
- Configurações persistem após salvar

---

## REQUISITO 4.3 — Tipos de Editais Desejados

**Texto da página do workflow:**
> "c. Cadastro dos tipos de editais que se deseja participar: Comodatos, Vendas de Equipamentos, Aluguel de Equipamentos com Consumo de Reagentes, Consumo de Reagentes, Compra de Insumos laboratoriais, Compra de Insumos Hospitalares, etc."

**Onde na UI foi implementado:**
- Tab "Produtos" na página Parametrizações
- Seção "Tipos de Edital Desejados" com 6 checkboxes

**Passo a passo para testar na UI:**
1. Na tab "Produtos", rolar até "Tipos de Edital Desejados"
2. Marcar: Comodato de equipamentos, Consumo de reagentes, Compra de insumos laboratoriais
3. Desmarcar: Venda de equipamentos
4. Clicar "Salvar"
5. Recarregar e verificar que checkboxes mantêm estado

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "quais tipos de edital estamos configurados para participar?"
2. Verificar que a IA lista os tipos marcados

**Dados de teste:**
Checkboxes marcados: Comodato, Consumo de reagentes, Insumos laboratoriais

**Resultados esperados:**
- 6 checkboxes visíveis e funcionais
- Estado persiste após salvar

---

## REQUISITO 4.4 — Norteadores de Score Técnico

**Texto da página do workflow:**
> "d. Norteadores do Score de Aderência Técnica: Cadastro de todas as informações técnicas dos produtos."

**Onde na UI foi implementado:**
- Tab "Produtos", seção "Norteadores de Score"
- Grid com 6 indicadores de score (a-f), cada um mostrando: ícone, nome, descrição
- Indicador (d): "Score Técnico → baseado em specs do Portfolio"

**Passo a passo para testar na UI:**
1. Na tab "Produtos", verificar seção "Norteadores de Score"
2. Verificar que os 6 cards estão visíveis:
   - (a) Classificação/Agrupamento
   - (b) Score Comercial
   - (c) Tipos de Edital
   - (d) Score Técnico
   - (e) Score Recomendação
   - (f) Score Aderência de Ganho
3. Cada card deve ter ícone, título e descrição

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "como são calculados os scores de aderência?"
2. Verificar que a IA explica as 6 dimensões de score
3. Digitar: "calcule o score de aderência para o edital PE-001/2026"
4. Verificar que a IA retorna scores técnico, comercial, etc.

**Dados de teste:**
Não requer entrada — visualização dos 6 norteadores.

**Resultados esperados:**
- 6 cards de norteadores visíveis
- Cada card com título e descrição claros

---

## REQUISITO 4.5 — Fontes de Busca

**Texto da página do workflow:**
> "Cadastro das Diferentes Fontes de Buscas: Palavras chaves (geradas pela IA, em função dos nomes dos produtos); Busca pelos NCMs, afunilados no portfolio"

**Onde na UI foi implementado:**
- Tab "Fontes de Busca" na página Parametrizações
- Tabela "Fontes de Editais": Nome, Tipo (API/SCRAPER), URL, Status (Ativa/Inativa), Ações
- Botão "Cadastrar Fonte" (abre modal)
- Seção "Palavras-chave de Busca": Tags editáveis
- Seção "NCMs para Busca": Tags NCM + botão "+ Adicionar NCM"

**Passo a passo para testar na UI:**
1. Na tab "Fontes de Busca", verificar tabela de fontes
2. Verificar que PNCP aparece como fonte ativa
3. Clicar "Cadastrar Fonte"
4. Preencher: Nome = "Portal BEC-SP", Tipo = "Scraper", URL = "https://bec.sp.gov.br"
5. Clicar "Salvar"
6. Verificar fonte na tabela
7. Na seção "Palavras-chave", verificar tags existentes
8. Na seção "NCMs", clicar "+ Adicionar NCM" e digitar "9027.80.99"

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "liste as fontes de busca de editais configuradas"
2. Verificar que a IA lista PNCP e outras fontes
3. Digitar: "cadastre uma nova fonte chamada ComprasNET com URL https://comprasnet.gov.br"
4. Verificar que a IA confirma o cadastro

**Dados de teste:**
| Nome | Tipo | URL |
|------|------|-----|
| Portal BEC-SP | Scraper | https://bec.sp.gov.br |
| ComprasNET | API | https://comprasnet.gov.br |

**Resultados esperados:**
- Tabela lista fontes com status
- Cadastro de nova fonte funciona
- Palavras-chave são editáveis como tags
- NCMs podem ser adicionados

---

# PAGINA 5 — CAPTAÇÃO (Busca e Monitoramento)

**Título no workflow:** "O layout de apresentação das oportunidades associado aos Scores, será o grande diferencial do sistema. A lógica dos Scores será a diferenciação."

**Navegação:** Menu lateral > Fluxo Comercial > Captação
**Componente:** frontend/src/pages/CaptacaoPage.tsx
**API principal:** GET /api/editais/buscar, GET /api/editais/salvos

---

## REQUISITO 5.1 — Monitoramento Abrangente 24/7

**Texto da página do workflow:**
> "Monitoramento Abrangente 24/7; Busca Inteligente por NCMs e palavras-chave; Classificação Automática por tipo de edital; Alertas em Tempo Real sobre oportunidades alinhadas"

**Onde na UI foi implementado:**
- Card "Monitoramento Automático" na parte inferior da CaptacaoPage
- Status badge (Ativo/Inativo), Termo, UFs, Editais encontrados, Último check
- Botão "Atualizar"
- API: GET /api/crud/monitoramentos, POST /api/crud/monitoramentos

**Passo a passo para testar na UI:**
1. Ir em Fluxo Comercial > Captação
2. Rolar até o card "Monitoramento Automático"
3. Verificar se existem monitoramentos ativos listados
4. Clicar "Atualizar" para recarregar
5. Se vazio, mostra "Nenhum monitoramento configurado"

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "configure um monitoramento automático para reagentes laboratoriais em SP e MG"
2. Verificar que a IA confirma a configuração
3. Digitar: "liste meus monitoramentos ativos"
4. Verificar que mostra o monitoramento criado
5. Digitar: "desative o monitoramento de reagentes"
6. Verificar que a IA confirma a desativação

**Dados de teste:**
| Termo | UFs | Frequência |
|-------|-----|-----------|
| reagentes laboratoriais | SP, MG | Diário |
| equipamento hospitalar | RJ | Semanal |

**Resultados esperados:**
- Card mostra monitoramentos existentes ou mensagem vazia
- Chat consegue criar, listar e desativar monitoramentos
- Badge de status correto (Ativo/Inativo)

---

## REQUISITO 5.2 — Prazos de Submissão (X Dias para frente)

**Texto da página do workflow:**
> "X Dias para frente" / "Datas de submissão das propostas: Próximos 2 dias: 2 Editais; Próximos 5 dias: 5 Editais; Próximos 10 dias: x Editais; Próximos 20 dias:"

**Onde na UI foi implementado:**
- 4 StatCards no topo da CaptacaoPage:
  - "Próximos 2 dias" (ícone AlertTriangle, vermelho)
  - "Próximos 5 dias" (ícone Calendar, laranja)
  - "Próximos 10 dias" (ícone Calendar, amarelo)
  - "Próximos 20 dias" (ícone Calendar, azul)

**Passo a passo para testar na UI:**
1. Na página Captação, verificar os 4 cards no topo
2. Cada card mostra um número (quantidade de editais naquela faixa de prazo)
3. Verificar que as cores são: vermelho, laranja, amarelo, azul (por urgência)

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "quais editais vencem nos próximos 5 dias?"
2. Verificar que a IA lista editais com prazos próximos
3. Digitar: "mostre o calendário de editais desta semana"
4. Verificar que a IA retorna prazos organizados

**Dados de teste:**
Não requer entrada — os cards são calculados automaticamente baseado nos editais salvos.

**Resultados esperados:**
- 4 stat cards visíveis com contagens
- Cores corretas por urgência
- Números refletem editais reais salvos

---

# PAGINA 6 — CAPTAÇÃO (Painel de Oportunidades)

**Título no workflow:** "Painel de Oportunidades" / "Cliquei no edital que posso ter interesse, ele abre a próxima tela... Para enriquecer a validação da escolha"

**Navegação:** Menu lateral > Fluxo Comercial > Captação (mesma página, seção de resultados)
**Componente:** frontend/src/pages/CaptacaoPage.tsx (linhas 426-947)

---

## REQUISITO 6.1 — Tabela de Oportunidades com Score

**Texto da página do workflow:**
> "Painel de Oportunidades: Licitação | Produto Correspondente | Score de Aderência"
> "Licitação 2023/458 | Produto: Bomba Hidráulica X-300 | 98%"
> "Licitação 2023/461 | Produto: Válvula de Controle V-15 | 91%"

**Onde na UI foi implementado:**
- Tabela DataTable na CaptacaoPage após busca
- Colunas: Checkbox, Número, Órgão, UF, Objeto, Valor, Produto, Prazo, Score (gauge circular), Ações

**Passo a passo para testar na UI:**
1. Na página Captação, no campo Termo, digitar: "reagente"
2. Selecionar Fonte: "PNCP"
3. Marcar checkbox "Calcular score de aderência"
4. Clicar "Buscar Editais"
5. Aguardar resultados na tabela
6. Verificar colunas: Número, Órgão, UF, Objeto, Valor, Prazo, Score
7. Verificar que Score mostra gauge circular colorido (verde/amarelo/vermelho)
8. Passar o mouse sobre o Score para ver tooltip com gaps

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "busque editais de reagentes laboratoriais com score"
2. Verificar que a IA retorna lista com números, órgãos e scores
3. Digitar: "busque editais de microscópio no PNCP para SP"
4. Verificar resultados filtrados por UF

**Dados de teste:**
| Termo | Fonte | UF | Score | Encerrados |
|-------|-------|----|-------|-----------|
| reagente | PNCP | (todas) | Sim | Não |
| microscópio | PNCP | SP | Sim | Sim |

**Resultados esperados:**
- Tabela mostra resultados com todas as colunas
- Score aparece como gauge circular colorido
- Verde (>= 80%), amarelo (>= 50%), vermelho (< 50%)
- Tooltip do score mostra gaps técnicos

---

## REQUISITO 6.2 — Categorizar por Cor

**Texto da página do workflow:**
> "Categorizar por cor (amarelo, verde, vermelho)"

**Onde na UI foi implementado:**
- Função getRowClass() na CaptacaoPage (linhas 406-410)
- Score >= 80: verde (row-high-score)
- Score >= 50: amarelo (row-medium-score)
- Score < 50: vermelho (row-low-score)

**Passo a passo para testar na UI:**
1. Após buscar editais com score, verificar as linhas da tabela
2. Linhas com score >= 80% devem ter fundo esverdeado
3. Linhas com score 50-79% devem ter fundo amarelado
4. Linhas com score < 50% devem ter fundo avermelhado

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "busque editais de reagentes com score e separe por categoria de aderência"
2. Verificar que a IA agrupa: alto (>= 80), médio (50-79), baixo (< 50)

**Dados de teste:**
Usar resultados da busca anterior.

**Resultados esperados:**
- Cores das linhas correspondem às faixas de score
- Distinção visual clara entre as 3 categorias

---

## REQUISITO 6.3 — Painel Lateral com Análise do Edital

**Texto da página do workflow:**
> "Análise do Edital: Pregão Eletrônico 123/2024 — Score de Aderência Técnica 90% — Score de Aderência Comercial 75% — Score de Recomendação de Participação 4.5/5"

**Onde na UI foi implementado:**
- Painel lateral que abre ao clicar em um edital na tabela (linhas 738-947)
- Score principal (gauge circular grande)
- 3 sub-scores: Aderência Técnica (gauge), Aderência Comercial (gauge), Recomendação (star rating)
- Produto Correspondente, Potencial de Ganho (badge)

**Passo a passo para testar na UI:**
1. Na tabela de resultados, clicar em qualquer edital
2. Verificar que o painel lateral abre à direita
3. Verificar score principal (número grande em gauge circular)
4. Verificar 3 sub-scores abaixo:
   - Aderência Técnica (gauge circular)
   - Aderência Comercial (gauge circular)
   - Recomendação (estrelas)
5. Verificar "Produto Correspondente" mostra o produto mais aderente
6. Verificar "Potencial de Ganho" mostra badge (Elevado/Médio/Baixo)

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "analise o edital PE-001/2026 em detalhe"
2. Verificar que a IA mostra score técnico, comercial e recomendação
3. Digitar: "qual produto é mais aderente ao edital PE-001/2026?"
4. Verificar que a IA identifica o produto correspondente

**Dados de teste:**
Clicar em qualquer edital dos resultados de busca.

**Resultados esperados:**
- Painel lateral abre com animação
- Score principal visível e legível
- 3 sub-scores funcionais
- Produto correspondente identificado
- Badge de potencial de ganho visível

---

## REQUISITO 6.4 — Análise de Gaps

**Texto da página do workflow:**
> "Análise de Gaps: Requisito 4.2: Torque Máximo (desvio de 3%)"

**Onde na UI foi implementado:**
- Tooltip no Score da tabela (hover mostra gaps)
- Seção "Análise de Gaps" no painel lateral (linhas 874-887)
- Lista de gaps: item + tipo (atendido/parcial/nao_atendido)

**Passo a passo para testar na UI:**
1. Na tabela de resultados, passar o mouse sobre o Score de um edital
2. Verificar que tooltip mostra lista de gaps técnicos
3. No painel lateral (clicar no edital), rolar até "Análise de Gaps"
4. Verificar lista de requisitos com status (atendido, parcial, não atendido)

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "quais são os gaps técnicos do edital PE-001/2026?"
2. Verificar que a IA lista requisitos não atendidos ou parcialmente atendidos
3. Digitar: "o que preciso ajustar no meu portfolio para atender o edital PE-001/2026?"
4. Verificar que a IA sugere complementações

**Dados de teste:**
Usar edital com score entre 50-90% (tem gaps visíveis).

**Resultados esperados:**
- Tooltip de gaps funciona no hover
- Seção de gaps no painel lista requisitos
- IA identifica e sugere correções para gaps

---

## REQUISITO 6.5 — Intenção Estratégica + Margem

**Texto da página do workflow:**
> "Qual a intenção estratégica? Edital Estratégico (Entrada em novo órgão) / Defensivo / Apenas Acompanhamento / Aprendizado"
> "Expectativa de Margem: Média/Baixa — Varia por Produto — Varia por Região"

**Onde na UI foi implementado:**
- RadioGroup "Intenção Estratégica" no painel lateral (4 opções)
- Slider "Expectativa de Margem" (0-50%) no painel lateral
- Botões toggle: "Varia por Produto", "Varia por Região"
- Botão "Salvar Estratégia"

**Passo a passo para testar na UI:**
1. No painel lateral do edital, rolar até "Intenção Estratégica"
2. Selecionar "Estratégico"
3. Ajustar slider de margem para 25%
4. Clicar "Varia por Produto"
5. Clicar "Salvar Estratégia"
6. Verificar que a estratégia foi salva (mensagem de sucesso)

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "defina o edital PE-001/2026 como estratégico com margem de 20%"
2. Verificar que a IA confirma a definição da estratégia
3. Digitar: "quais editais estão marcados como estratégicos?"
4. Verificar que a IA lista editais com suas estratégias

**Dados de teste:**
| Edital | Intenção | Margem |
|--------|----------|--------|
| PE-001/2026 | Estratégico | 25% |
| PE-003/2026 | Defensivo | 15% |

**Resultados esperados:**
- RadioGroup funciona (seleção exclusiva)
- Slider ajusta margem de 0 a 50%
- Botões "Varia por" funcionam como toggle
- Estratégia é salva com sucesso

---

# PAGINA 7 — CAPTAÇÃO (Classificações e Fontes)

**Título no workflow:** "CAPTAÇÃO — Classificação quanto ao tipo de editais"

**Navegação:** Menu lateral > Fluxo Comercial > Captação (formulário de busca)
**Componente:** frontend/src/pages/CaptacaoPage.tsx (linhas 601-689)

---

## REQUISITO 7.1 — Classificação por Tipo de Edital

**Texto da página do workflow:**
> "a. Classificação quanto ao tipo de editais: Editais de Reagentes; Editais de Equipamentos; Editais de Comodato; Editais de Aluguel; Editais de Oferta de Preço;"

**Onde na UI foi implementado:**
- Select "Classificação Tipo" no formulário de busca da CaptacaoPage
- 6 opções: Todos, Reagentes, Equipamentos, Comodato, Aluguel, Oferta de Preço

**Passo a passo para testar na UI:**
1. Na página Captação, localizar o select "Classificação Tipo"
2. Clicar para abrir o dropdown
3. Verificar as 6 opções: Todos, Reagentes, Equipamentos, Comodato, Aluguel, Oferta de Preço
4. Selecionar "Reagentes"
5. Preencher Termo: "kit diagnóstico"
6. Clicar "Buscar Editais"
7. Verificar que resultados são filtrados por tipo Reagentes

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "busque editais do tipo comodato de equipamentos"
2. Verificar que a IA busca e filtra por tipo comodato
3. Digitar: "busque editais de reagentes no PNCP"
4. Verificar que retorna editais classificados como reagentes

**Dados de teste:**
| Classificação | Termo | Resultado Esperado |
|--------------|-------|-------------------|
| Reagentes | kit diagnóstico | Editais de reagentes/kits |
| Equipamentos | microscópio | Editais de equipamentos |
| Comodato | equipamento hospitalar | Editais de comodato |

**Resultados esperados:**
- Select mostra exatamente 6 opções
- Seleção filtra corretamente os resultados

---

## REQUISITO 7.2 — Classificação por Origem

**Texto da página do workflow:**
> "b. Classificação quanto à origem desses editais: Editais municipais; Estaduais; Federais; Editais de Universidades; Laboratórios Públicos ligados ao executivo (estadual ou municipal), LACENs; Hospitais Públicos; Hospitais Universitários; Centros de Pesquisas; etc."

**Onde na UI foi implementado:**
- Select "Classificação Origem" no formulário de busca
- 9 opções: Todos, Municipal, Estadual, Federal, Universidade, Hospital, LACEN, Força Armada, Autarquia

**Passo a passo para testar na UI:**
1. Localizar select "Classificação Origem"
2. Abrir dropdown e verificar 9 opções
3. Selecionar "Federal"
4. Buscar e verificar resultados filtrados

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "busque editais federais de reagentes"
2. Verificar que a IA filtra por origem federal
3. Digitar: "busque editais de universidades para microscópio"
4. Verificar que filtra por origem universidade

**Dados de teste:**
| Origem | Termo | Resultado |
|--------|-------|-----------|
| Federal | reagente | Editais de órgãos federais |
| Hospital | equipamento | Editais de hospitais públicos |
| Universidade | microscópio | Editais de universidades |

**Resultados esperados:**
- Select mostra exatamente 9 opções
- Filtro funciona corretamente

---

## REQUISITO 7.3 — Locais de Busca

**Texto da página do workflow:**
> "c. Locais de Busca: Jornais eletrônicos, sistemas da prefeitura, Portal PNCP de busca, Acesso ao SICONV – portal de publicação de editais....."

**Onde na UI foi implementado:**
- Select "Fonte" no formulário de busca
- 5 opções: PNCP, ComprasNET, BEC-SP, SICONV, Todas as fontes

**Passo a passo para testar na UI:**
1. Localizar select "Fonte"
2. Abrir dropdown e verificar 5 opções
3. Selecionar "PNCP"
4. Digitar termo e buscar
5. Repetir com "ComprasNET" e "Todas as fontes"

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "busque editais de reagentes no PNCP"
2. Verificar que busca especificamente no PNCP
3. Digitar: "busque editais de microscópio em todas as fontes"
4. Verificar que busca em múltiplas fontes

**Dados de teste:**
| Fonte | Termo |
|-------|-------|
| PNCP | reagente laboratorial |
| ComprasNET | equipamento hospitalar |
| Todas as fontes | microscópio |

**Resultados esperados:**
- 5 opções no select de Fonte
- PNCP retorna resultados da API oficial
- "Todas as fontes" busca em múltiplas fontes

---

## REQUISITO 7.4 — Formato de Busca

**Texto da página do workflow:**
> "d. Formato de Busca: Criação do formato de busca (NCMs dos produtos, Nome Técnico dos Produtos, Palavra chave, etc.), com a busca lendo todo o edital (não pode ser busca pelo OBJETO do edital). A IA deve fazer a leitura do edital, buscando a palavra-chave;"

**Onde na UI foi implementado:**
- Campo "Termo / Palavra-chave" no formulário de busca
- Placeholder: contém "microscópio" como exemplo
- Checkbox "Calcular score de aderência (portfolio)"

**Passo a passo para testar na UI:**
1. No campo Termo, digitar: "reagente laboratorial"
2. Verificar que o campo aceita texto livre
3. Marcar "Calcular score de aderência"
4. Clicar "Buscar Editais"
5. Verificar que resultados mostram scores calculados

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "busque editais pelo NCM 9027.80.99"
2. Verificar que a IA busca usando o NCM
3. Digitar: "busque editais que mencionem centrífuga com rotor de ângulo fixo"
4. Verificar que a IA busca usando termos técnicos específicos

**Dados de teste:**
| Tipo Busca | Termo |
|-----------|-------|
| Palavra-chave | reagente laboratorial |
| NCM | 9027.80.99 |
| Nome técnico | centrífuga rotor ângulo fixo |

**Resultados esperados:**
- Campo aceita qualquer formato de busca
- Score é calculado quando checkbox marcado
- IA lê conteúdo dos editais, não apenas o objeto

---

## REQUISITO 7.5 — Filtro por UF (28 opções)

**Texto da página do workflow:**
(Implícito na classificação por origem — filtro por estado)

**Onde na UI foi implementado:**
- Select "UF" no formulário de busca
- 28 opções: Todas + 27 estados brasileiros

**Passo a passo para testar na UI:**
1. Localizar select "UF"
2. Abrir dropdown e verificar 28 opções
3. Verificar presença de: Todas, São Paulo, Minas Gerais, Rio de Janeiro, Bahia, Distrito Federal
4. Selecionar "São Paulo" e buscar
5. Verificar que resultados são de órgãos de SP

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "busque editais de reagentes em São Paulo"
2. Verificar que resultados são de SP
3. Digitar: "busque editais em MG e RJ"
4. Verificar que filtra por múltiplos estados

**Dados de teste:**
Selecionar: São Paulo, Minas Gerais

**Resultados esperados:**
- 28 opções no dropdown (Todas + 27 UFs)
- Filtro por UF funciona corretamente
- Resultados mostram apenas editais da UF selecionada

---

# PAGINA 8 — VALIDAÇÃO (Decisão)

**Título no workflow:** "Essa é a fase em que o Usuário Acata as recomendações da IA e/ou agrega refinamentos de análises à partir de interações com a própria IA"

**Navegação:** Menu lateral > Fluxo Comercial > Validação
**Componente:** frontend/src/pages/ValidacaoPage.tsx
**API principal:** GET /api/editais/salvos, POST /api/editais/{id}/scores-validacao

---

## REQUISITO 8.1 — Lista de Editais Salvos com Score

**Texto da página do workflow:**
> (Tabela de editais salvos para validação com scores pré-calculados)

**Onde na UI foi implementado:**
- Card "Meus Editais" com filtros (busca + status)
- Tabela: Número, Órgão, UF, Objeto, Valor, Abertura, Status (badge), Score (gauge)
- Filtro Status: Todos, Novo, Analisando, Validado, Descartado

**Passo a passo para testar na UI:**
1. Ir em Fluxo Comercial > Validação
2. Verificar título "Validação de Editais"
3. Verificar card "Meus Editais" com tabela
4. Verificar colunas: Número, Órgão, UF, Objeto, Valor, Abertura, Status, Score
5. Usar filtro de busca para procurar um edital específico
6. Usar filtro de Status para mostrar apenas "Novo"

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "liste meus editais salvos para validação"
2. Verificar que a IA lista os editais com scores
3. Digitar: "quais editais estão com status 'novo'?"
4. Verificar que a IA filtra por status

**Dados de teste:**
Não requer entrada — usa editais previamente salvos da etapa de Captação.

**Resultados esperados:**
- Tabela carrega editais salvos
- Filtros funcionam (busca + status)
- Scores aparecem como gauge circular
- Status aparece como badge colorido

---

## REQUISITO 8.2 — Sinais de Mercado

**Texto da página do workflow:**
> "Sinais de Mercado: Concorrente Dominante Identificado; Suspeita de Licitação Direcionada"

**Onde na UI foi implementado:**
- Barra superior "validacao-top-bar" (aparece ao selecionar edital)
- Badges de sinais de mercado (Warning/Error)
- Badge "Fatal Flaws" com contagem

**Passo a passo para testar na UI:**
1. Na tabela, clicar em um edital
2. Verificar que a barra superior aparece
3. Verificar se existem badges de sinais (Concorrente Dominante, Licitação Direcionada)
4. Verificar badge de Fatal Flaws (se existir)

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "quais são os sinais de mercado do edital PE-001/2026?"
2. Verificar que a IA indica: concorrentes identificados, riscos de direcionamento
3. Digitar: "existe algum concorrente dominante neste edital?"
4. Verificar análise da IA

**Dados de teste:**
Selecionar edital que tenha scores calculados.

**Resultados esperados:**
- Barra de sinais visível após selecionar edital
- Badges de sinais com ícones corretos
- Fatal Flaws listados quando existem

---

## REQUISITO 8.3 — Decisão: Participar / Acompanhar / Ignorar

**Texto da página do workflow:**
> "[✓ Participar] [Acompanhar] [✗ Ignorar]"
> "Justificativa: Motivo: Margem Insuficiente — Concorrente X está com preço predatório."
> "A justificativa é o combustível para a inteligência futura."

**Onde na UI foi implementado:**
- 3 botões de decisão na barra superior: "Participar" (ThumbsUp, verde), "Acompanhar" (Eye, azul), "Ignorar" (X, cinza)
- Card "Justificativa da Decisão" (aparece após clicar decisão)
- Select "Motivo" (8 opções), TextArea "Detalhes", Botão "Salvar Justificativa"

**Passo a passo para testar na UI:**
1. Selecionar um edital na tabela
2. Clicar botão "Participar"
3. Verificar que o card "Justificativa da Decisão" aparece
4. Selecionar motivo: "Preço competitivo"
5. Digitar detalhes: "Margem aceitável para este tipo de produto, região estratégica"
6. Clicar "Salvar Justificativa"
7. Verificar que badge "Decisão salva" aparece na barra de sinais
8. Repetir com "Acompanhar" e "Ignorar" em outros editais

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "marque o edital PE-001/2026 como 'participar' com motivo: preço competitivo e margem aceitável"
2. Verificar que a IA salva a decisão e justificativa
3. Digitar: "marque o edital DL-010/2026 como 'ignorar' por margem insuficiente — concorrente com preço predatório"
4. Verificar que a IA registra a recusa com justificativa
5. Digitar: "liste as decisões que tomei nos editais"
6. Verificar lista com decisões e justificativas

**Dados de teste:**
| Edital | Decisão | Motivo | Detalhes |
|--------|---------|--------|----------|
| PE-001/2026 | Participar | Preço competitivo | Margem aceitável, região estratégica |
| DL-010/2026 | Ignorar | Margem insuficiente | Concorrente X com preço predatório |
| PE-003/2026 | Acompanhar | Avaliar concorrência | Aguardando análise de mercado |

**Resultados esperados:**
- 3 botões funcionais com cores distintas
- Card justificativa aparece após decisão
- 8 opções no dropdown de motivo
- Justificativa salva com sucesso
- Badge "Decisão salva" aparece
- Chat registra decisões corretamente

---

## REQUISITO 8.4 — Score Dashboard (82/100 com 6 sub-scores)

**Texto da página do workflow:**
> "Score 82/100" com gráfico radar mostrando:
> "Aderência técnica (High) 90%; Aderência documental (Medium) 65%; Complexidade do edital (Low) 35%; Risco jurídico percebido (Medium) 60%; Viabilidade logística (High) 85%; Atratividade comercial histórica (High) 95%"

**Onde na UI foi implementado:**
- Score Dashboard à direita do painel de edital
- Score principal (gauge circular grande, 120px)
- Potencial de Ganho (badge)
- Botão "Calcular Scores IA" (TrendingUp icon)
- 6 barras de score com nível (High/Medium/Low):
  1. Aderência Técnica
  2. Aderência Documental
  3. Complexidade Edital
  4. Risco Jurídico
  5. Viabilidade Logística
  6. Atratividade Comercial

**Passo a passo para testar na UI:**
1. Selecionar um edital na tabela
2. No painel direito, verificar Score Dashboard
3. Verificar score geral (gauge circular com número)
4. Clicar "Calcular Scores IA" se scores não estiverem calculados
5. Aguardar cálculo
6. Verificar as 6 barras de sub-score:
   - Cada barra mostra porcentagem
   - Cada barra mostra nível (High/Medium/Low)
   - Cores: verde (High), amarelo (Medium), vermelho (Low)
7. Verificar Potencial de Ganho (Elevado/Médio/Baixo)

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "calcule os scores de validação do edital PE-001/2026"
2. Verificar que a IA retorna 6 dimensões de score com valores
3. Digitar: "qual a aderência técnica do edital PE-001/2026?"
4. Verificar detalhe do score técnico
5. Digitar: "qual o risco jurídico deste edital?"
6. Verificar análise de risco jurídico

**Dados de teste:**
Selecionar edital e clicar "Calcular Scores IA".

**Resultados esperados:**
- Score geral aparece como gauge circular (0-100)
- 6 sub-scores com barras de progresso
- Níveis High/Medium/Low com cores corretas
- Botão "Calcular Scores IA" aciona cálculo via API
- Chat retorna scores detalhados

---

# PAGINA 9 — VALIDAÇÃO (Aderências Detalhadas)

**Título no workflow:** "A etapa de validação deve ser pautada pelas aderências / Scores indicados abaixo"

**Navegação:** Menu lateral > Fluxo Comercial > Validação (tabs Objetiva e Analítica)
**Componente:** frontend/src/pages/ValidacaoPage.tsx (linhas 470-705)

---

## REQUISITO 9.1 — Aderência Técnica / Portfolio

**Texto da página do workflow:**
> "a. Aderência / Riscos (classificado como Impeditivo ou Pts de Atenção) Técnica / Portfolio: A IA deve ressaltar os trechos do edital que trazem riscos de aderência técnica vis a vis as características técnicas do portfolio. Identificação de itens intrusos; Necessidades de complementação de portfolio; Portfolio família ou individual; etc"

**Onde na UI foi implementado:**
- Tab "Objetiva", seção "Aderência Técnica Detalhada"
- Sub-scores grid OU placeholder com botão "Calcular Scores"

**Passo a passo para testar na UI:**
1. Selecionar edital, verificar tab "Objetiva" ativa
2. Verificar seção "Aderência Técnica Detalhada"
3. Se scores calculados: verificar grid com sub-scores técnicos
4. Se não: clicar "Calcular Scores" e aguardar

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "analise a aderência técnica do edital PE-001/2026 com meu portfolio"
2. Verificar que a IA compara requisitos do edital com produtos cadastrados
3. Digitar: "existem itens intrusos neste edital?"
4. Verificar que a IA identifica itens que não são do portfolio
5. Digitar: "o que preciso complementar no portfolio para atender este edital?"
6. Verificar sugestões de complementação

**Dados de teste:**
Usar edital com scores calculados.

**Resultados esperados:**
- Seção mostra aderência técnica detalhada
- Identifica gaps e itens intrusos
- IA sugere complementações de portfolio

---

## REQUISITO 9.2 — Aderência Documental

**Texto da página do workflow:**
> "b. Aderência / Riscos Documental: Certidões vencidas, detalhes sobre balanços, certidões vencidas, registros requeridos, etc. Se o documento solicitado for muito inusitado, então é um edital candidato a ser impugnado, pois os documentos são previstos na lei de licitações."

**Onde na UI foi implementado:**
- Tab "Objetiva", seção "Checklist Documental"
- Tabela: Documento, Status (badge OK/Vencido/Faltando/Ajustável), Validade

**Passo a passo para testar na UI:**
1. Na tab "Objetiva", rolar até "Checklist Documental"
2. Verificar tabela com documentos e status
3. Verificar badges: OK (verde), Vencido (vermelho), Faltando (cinza), Ajustável (amarelo)

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "verifique se a documentação da empresa está completa para o edital PE-001/2026"
2. Verificar que a IA compara documentos exigidos com documentos cadastrados
3. Digitar: "algum documento está vencido para este edital?"
4. Verificar que a IA identifica certidões vencidas
5. Digitar: "este edital exige algum documento inusitado que possa ser impugnado?"
6. Verificar análise de impugnação

**Dados de teste:**
Usar edital com scores calculados.

**Resultados esperados:**
- Tabela com checklist documental
- Badges de status corretos por documento
- IA identifica documentos vencidos e faltantes
- IA identifica documentos inusitados (candidatos a impugnação)

---

## REQUISITO 9.3 — Aderência Jurídica (Flags)

**Texto da página do workflow:**
> "c. Aderência / Riscos Jurídicos: Alta recorrência de aditivos, histórico de ações contra empresas, aparência de edital direcionado, pregoeiro rigoroso, etc."

**Onde na UI foi implementado:**
- Tab "Analítica", seção "Pipeline de Riscos" (badges de risco)
- Seção "Fatal Flaws" (lista de problemas críticos com AlertCircle)

**Passo a passo para testar na UI:**
1. Clicar na tab "Analítica"
2. Verificar "Pipeline de Riscos":
   - Badges: Modalidade, Risco de Preço Predatório, Faturamento
   - 3 níveis: Alto (vermelho), Médio (amarelo), Baixo (verde)
3. Verificar "Fatal Flaws" (se existir):
   - Lista de problemas críticos com ícone AlertCircle

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "quais são os riscos jurídicos do edital PE-001/2026?"
2. Verificar que a IA analisa: aglutinação indevida, restrição regional, edital direcionado
3. Digitar: "este edital tem aparência de ser direcionado?"
4. Verificar análise da IA
5. Digitar: "existem fatal flaws neste edital?"
6. Verificar que a IA identifica problemas impeditivos

**Dados de teste:**
Usar edital com scores calculados.

**Resultados esperados:**
- Pipeline de riscos com 3 badges
- Fatal Flaws listados quando existem
- IA analisa riscos jurídicos detalhadamente

---

## REQUISITO 9.4 — Aderência Logística

**Texto da página do workflow:**
> "d. Aderência / Riscos de Logística: Distância para prestar a assistência Técnica, etc;"

**Onde na UI foi implementado:**
- Tab "Objetiva", seção "Mapa Logístico"
- UF Edital → Empresa (SP), badge de distância (Próximo/Médio/Distante), Entrega Estimada (dias)

**Passo a passo para testar na UI:**
1. Na tab "Objetiva", verificar "Mapa Logístico"
2. Verificar UF do edital e UF da empresa
3. Verificar badge de distância
4. Verificar estimativa de entrega em dias

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "qual a viabilidade logística para atender o edital PE-001/2026?"
2. Verificar que a IA analisa distância e prazo de entrega
3. Digitar: "consigo atender a entrega em 15 dias para o órgão em MG?"
4. Verificar análise de viabilidade

**Dados de teste:**
Usar edital de órgão em MG (empresa baseada em SP).

**Resultados esperados:**
- Mapa logístico mostra UFs corretas
- Badge de distância adequado
- Estimativa de entrega realista

---

## REQUISITO 9.5 — Aderência Comercial

**Texto da página do workflow:**
> "e. Aderência / Riscos Comerciais: Informações relevantes sobre preços, preços predatórios, históricos de atrasos de faturamentos, margem impactada devido à frequência de entrega ou custo de servir, histórico de atrasos de pagamentos, Concorrente dominante identificado, etc."

**Onde na UI foi implementado:**
- Score "Atratividade Comercial" no dashboard de scores
- Badge "Potencial de Ganho" (Elevado/Médio/Baixo)
- Intenção Estratégica (RadioGroup)
- Expectativa de Margem (Slider)

**Passo a passo para testar na UI:**
1. No Score Dashboard, verificar "Atratividade Comercial" nas 6 barras
2. Verificar Potencial de Ganho badge
3. Ajustar Intenção Estratégica e Margem

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "analise a viabilidade comercial do edital PE-001/2026"
2. Verificar que a IA analisa: preços, concorrência, margem
3. Digitar: "qual o histórico de preços para este tipo de edital?"
4. Verificar que a IA busca preços históricos
5. Digitar: "existe risco de preço predatório neste edital?"
6. Verificar análise de concorrência

**Dados de teste:**
Usar edital com scores calculados.

**Resultados esperados:**
- Score comercial visível no dashboard
- Potencial de ganho reflete análise real
- IA fornece análise comercial detalhada

---

## REQUISITO 9.6 — Análise de Lote (Item Intruso)

**Texto da página do workflow:**
> "Análise de Lote (Identificação de Item Intruso): Aderente Aderente Aderente ... Item Intruso — Dependência de Terceiros (Impacto no Lote Inteiro) — Amarelo/Alerta"

**Onde na UI foi implementado:**
- Tab "Objetiva", seção "Análise de Lote"
- Barra de segmentos: Aderente (verde) vs Intruso (vermelho)
- Legenda com contagens

**Passo a passo para testar na UI:**
1. Na tab "Objetiva", rolar até "Análise de Lote"
2. Verificar barra de segmentos visual
3. Verificar legenda: quantos itens aderentes vs intrusos

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "analise os itens do lote do edital PE-001/2026"
2. Verificar que a IA identifica itens aderentes e intrusos
3. Digitar: "existe item intruso neste edital que depende de terceiros?"
4. Verificar análise de dependência

**Dados de teste:**
Usar edital com múltiplos itens.

**Resultados esperados:**
- Barra de lote mostra segmentos coloridos
- Itens intrusos destacados
- IA identifica dependências de terceiros

---

## REQUISITO 9.7 — Reputação do Órgão

**Texto da página do workflow:**
> "O Órgão (Reputação): Pregoeiro rigoroso; Bom pagador; Histórico de problemas políticos — Memória Corporativa Permanente"

**Onde na UI foi implementado:**
- Tab "Analítica", seção "Reputação do Órgão"
- Grid com 3 itens: Pregoeiro, Pagamento, Histórico
- Cada item: ícone + classificação (rigoroso/moderado/flexível, bom/regular/mau, etc.)

**Passo a passo para testar na UI:**
1. Na tab "Analítica", verificar "Reputação do Órgão"
2. Verificar grid com 3 itens:
   - Pregoeiro: rigoroso / moderado / flexível
   - Pagamento: bom pagador / regular / mau pagador
   - Histórico: problemas / sem problemas

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "qual a reputação do órgão do edital PE-001/2026?"
2. Verificar que a IA analisa: pregoeiro, pagamento, histórico
3. Digitar: "o Hospital das Clínicas UFMG é bom pagador?"
4. Verificar que a IA busca na memória corporativa
5. Digitar: "o pregoeiro deste edital costuma ser rigoroso?"
6. Verificar análise

**Dados de teste:**
Usar edital com scores calculados.

**Resultados esperados:**
- Grid com 3 itens de reputação
- Classificações claras por item
- IA acessa memória corporativa

---

## REQUISITO 9.8 — Alerta de Recorrência

**Texto da página do workflow:**
> "Alerta de Recorrência: Editais semelhantes a este foram recusados 4 vezes por margem insuficiente. Alta recorrência de aditivos nesse órgão. Tecnicamente aderente, mas fora da política comercial."

**Onde na UI foi implementado:**
- Tab "Analítica", seção "Alerta de Recorrência" (aparece se >= 2 perdas semelhantes)
- Contagem de editais semelhantes recusados + motivos

**Passo a passo para testar na UI:**
1. Na tab "Analítica", verificar se "Alerta de Recorrência" aparece
2. Se presente: verificar contagem e motivos listados
3. Se ausente: é esperado quando não há histórico de perdas semelhantes

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "existem editais semelhantes a este que já participamos e perdemos?"
2. Verificar que a IA analisa histórico de perdas
3. Digitar: "qual o padrão de recusa em editais deste órgão?"
4. Verificar análise de recorrência

**Dados de teste:**
Não requer entrada — depende do histórico.

**Resultados esperados:**
- Alerta aparece quando há 2+ perdas semelhantes
- Mostra contagem e motivos de recusa
- IA analisa padrões de recorrência

---

# PAGINA 10 — VALIDAÇÃO (Processo Amanda + Cognitiva)

**Título no workflow:** "Processo Amanda"

**Navegação:** Menu lateral > Fluxo Comercial > Validação (seção Processo Amanda + tab Cognitiva)
**Componente:** frontend/src/pages/ValidacaoPage.tsx (linhas 708-1058)

---

## REQUISITO 10.1 — Processo Amanda: 3 Pastas de Documentos

**Texto da página do workflow:**
> "a. Leitura do Edital: Entende o que o edital pede para iniciar a montagem das pastas:
> 1. Pasta de documentos da empresa - Atrela o documento com o item do edital que faz referência ao mesmo;
> 2. Pasta de documentos fiscais e certidões – Atrela o documento com o item do edital que faz referência ao mesmo;
> 3. Pasta de documentos de Qualificação Técnica - Atrela o documento com o item do edital que faz referência ao mesmo (se pede registro da anvisa, é relacionado (para cada produto) o número do registro;"

**Onde na UI foi implementado:**
- Card "Processo Amanda - Documentação" (abaixo das tabs de análise)
- 3 cards de pasta (cores distintas):
  1. "Documentos da Empresa" (azul): Contrato Social, Procuração, Atestado Capacidade Técnica
  2. "Certidões e Fiscal" (amarelo): CND Federal, FGTS, Trabalhista, Balanço Patrimonial
  3. "Qualificação Técnica" (verde): Registro ANVISA, Certificado BPF, Laudo Técnico
- Cada item com StatusBadge (Disponível/Faltante/OK/Vencida)

**Passo a passo para testar na UI:**
1. Selecionar edital na tabela de Validação
2. Rolar até o card "Processo Amanda"
3. Verificar 3 pastas com cores distintas (azul, amarelo, verde)
4. Verificar itens dentro de cada pasta:
   - Pasta 1 (azul): Contrato Social, Procuração, Atestado
   - Pasta 2 (amarelo): CND Federal, FGTS, Trabalhista, Balanço
   - Pasta 3 (verde): Registro ANVISA, Certificado BPF, Laudo
5. Verificar StatusBadge em cada item (verde=OK, vermelho=Faltante, amarelo=Vencida)
6. Contar total de status badges (esperado >= 10)

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "monte a documentação necessária para o edital PE-001/2026 (Processo Amanda)"
2. Verificar que a IA lista as 3 pastas com documentos necessários
3. Digitar: "quais documentos estão faltando para este edital?"
4. Verificar que a IA identifica documentos faltantes
5. Digitar: "o registro ANVISA dos nossos produtos está em dia?"
6. Verificar que a IA verifica validade dos registros

**Dados de teste:**
Usar edital já salvo com scores calculados.

**Resultados esperados:**
- 3 pastas com cores distintas
- Documentos corretos em cada pasta
- StatusBadge por documento
- IA monta documentação automaticamente
- Identifica documentos faltantes ou vencidos

---

## REQUISITO 10.2 — Aderência Técnica Trecho-a-Trecho (Linguagem Natural)

**Texto da página do workflow:**
> "Aderência Técnica e Tradução em Linguagem Natural: Análise de Item 3.1: Trecho do Edital | Aderência: 82% (Parcialmente Aderente) | Trecho do Portfolio"

**Onde na UI foi implementado:**
- Tab "Analítica", seção "Aderência Técnica Trecho-a-Trecho"
- Tabela: Trecho do Edital | Aderência (ScoreBadge %) | Trecho do Portfolio

**Passo a passo para testar na UI:**
1. Clicar na tab "Analítica"
2. Rolar até "Aderência Técnica Trecho-a-Trecho"
3. Verificar tabela com 3 colunas:
   - Trecho do Edital (texto do requisito)
   - Aderência (badge com percentual)
   - Trecho do Portfolio (texto correspondente do produto)
4. Verificar que a tradução é em linguagem natural (não técnica)

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "compare trecho a trecho os requisitos do edital PE-001/2026 com meu portfolio"
2. Verificar que a IA faz comparação item a item
3. Digitar: "traduza os requisitos técnicos do edital em linguagem simples"
4. Verificar que a IA traduz termos técnicos para linguagem acessível
5. Digitar: "qual o item com menor aderência neste edital?"
6. Verificar que a IA identifica o item mais fraco

**Dados de teste:**
Usar edital com scores calculados.

**Resultados esperados:**
- Tabela com 3 colunas funcionais
- Trechos do edital e portfolio lado a lado
- Percentual de aderência por trecho
- Linguagem natural na tradução

---

## REQUISITO 10.3 — Resumo Gerado pela IA (Tab Cognitiva)

**Texto da página do workflow:**
> "Resumo da IA: Oportunidade promissora com aderência técnica forte. O score na 82 reflete boa atenção, é necessário focar a documentação pendente."

**Onde na UI foi implementado:**
- Tab "Cognitiva", seção "Resumo Gerado pela IA"
- Texto do resumo OU botão "Gerar Resumo" (se não gerado) / "Regerar Resumo" (se já existe)

**Passo a passo para testar na UI:**
1. Clicar na tab "Cognitiva"
2. Verificar seção "Resumo Gerado pela IA"
3. Se resumo não existe: clicar "Gerar Resumo" e aguardar
4. Se resumo existe: ler o texto gerado
5. Clicar "Regerar Resumo" para obter novo resumo

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "gere um resumo executivo do edital PE-001/2026"
2. Verificar que a IA gera resumo com pontos fortes e fracos
3. Digitar: "resuma os principais riscos e oportunidades deste edital"
4. Verificar resumo focado em riscos e oportunidades

**Dados de teste:**
Usar edital com scores calculados.

**Resultados esperados:**
- Botão "Gerar Resumo" funciona
- Resumo é gerado pela IA com análise coerente
- "Regerar Resumo" produz novo texto
- Resumo menciona score, aderência, documentação pendente

---

## REQUISITO 10.4 — Histórico de Editais Semelhantes

**Texto da página do workflow:**
> (Implícito na Memória Corporativa — Histórico de editais passados semelhantes)

**Onde na UI foi implementado:**
- Tab "Cognitiva", seção "Histórico de Editais Semelhantes"
- Lista com StatusBadge (Vencida/Perdida/Cancelada), Nome, Motivo
- OU mensagem "Nenhum edital semelhante encontrado"

**Passo a passo para testar na UI:**
1. Na tab "Cognitiva", verificar "Histórico de Editais Semelhantes"
2. Se existe histórico: verificar lista com status e motivos
3. Se não existe: verificar mensagem "Nenhum edital semelhante"

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "existem editais semelhantes a PE-001/2026 que já participamos?"
2. Verificar que a IA busca no histórico
3. Digitar: "quais editais semelhantes vencemos e quais perdemos?"
4. Verificar lista com resultados

**Dados de teste:**
Não requer entrada — depende do histórico.

**Resultados esperados:**
- Seção visível na tab Cognitiva
- Lista com editais semelhantes (se existirem)
- Status por edital (Vencida/Perdida/Cancelada)
- Mensagem clara quando não há histórico

---

## REQUISITO 10.5 — Pergunte à IA sobre este Edital

**Texto da página do workflow:**
> "Pergunte à IA: 1. Qual o principal risco? 2. O prazo de entrega é viável para a região?"

**Onde na UI foi implementado:**
- Tab "Cognitiva", seção "Pergunte à IA sobre este Edital"
- TextInput com placeholder "Ex: Qual o prazo de entrega?"
- Botão "Perguntar" (MessageSquare icon)
- Caixa de resposta (se respondido)

**Passo a passo para testar na UI:**
1. Na tab "Cognitiva", rolar até "Pergunte à IA"
2. Verificar campo de pergunta com placeholder
3. Digitar: "Qual o prazo de entrega exigido?"
4. Clicar "Perguntar"
5. Aguardar resposta da IA
6. Verificar que resposta aparece na caixa abaixo

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "sobre o edital PE-001/2026, qual o prazo de entrega exigido?"
2. Verificar resposta da IA
3. Digitar: "qual o principal risco de participar deste edital?"
4. Verificar análise de risco
5. Digitar: "posso impugnar alguma cláusula deste edital?"
6. Verificar análise jurídica

**Dados de teste:**
| Pergunta | Resposta Esperada |
|----------|------------------|
| Qual o prazo de entrega? | Prazo em dias conforme edital |
| Qual o principal risco? | Análise do risco mais relevante |
| O prazo é viável para MG? | Análise logística baseada na região |

**Resultados esperados:**
- Campo de pergunta funcional
- Botão "Perguntar" aciona IA
- Resposta coerente e contextualizada ao edital
- Chat também responde perguntas sobre editais específicos

---

## REQUISITO 10.6 — Decisão GO/NO-GO da IA

**Texto da página do workflow:**
> (Banner de recomendação da IA baseado nos scores calculados)

**Onde na UI foi implementado:**
- Tab "Objetiva", banner "Recomendação da IA" (aparece após calcular scores)
- 3 opções: GO (CheckCircle verde), NO-GO (XCircle vermelho), CONDICIONAL (AlertTriangle amarelo)
- Justificativa da IA

**Passo a passo para testar na UI:**
1. Na tab "Objetiva", verificar se banner de decisão existe
2. Se scores não calculados: clicar "Calcular Scores IA" primeiro
3. Verificar banner com: GO, NO-GO ou CONDICIONAL
4. Verificar justificativa da IA abaixo do banner

**Passo a passo para testar no Chat com Agente:**
1. No chat, digitar: "qual a recomendação da IA para o edital PE-001/2026? GO ou NO-GO?"
2. Verificar que a IA responde com decisão e justificativa
3. Digitar: "por que a IA recomenda NO-GO para este edital?"
4. Verificar que a IA explica os motivos detalhados

**Dados de teste:**
Usar edital com scores calculados.

**Resultados esperados:**
- Banner de decisão visível após cálculo de scores
- Ícone e cor corretos para GO/NO-GO/CONDICIONAL
- Justificativa coerente da IA
- Chat replica decisão do banner

---

# RESUMO DE COBERTURA

| Página | Requisitos | Testes UI | Testes Chat |
|--------|-----------|-----------|-------------|
| 2 - Empresa | 4 | 4 | 4 |
| 3 - Portfolio | 5 | 5 | 5 |
| 4 - Parametrizações | 5 | 5 | 5 |
| 5 - Captação (Busca) | 2 | 2 | 2 |
| 6 - Captação (Painel) | 5 | 5 | 5 |
| 7 - Captação (Filtros) | 5 | 5 | 5 |
| 8 - Validação (Decisão) | 4 | 4 | 4 |
| 9 - Validação (Aderências) | 8 | 8 | 8 |
| 10 - Validação (Amanda/Cognitiva) | 6 | 6 | 6 |
| **TOTAL** | **44** | **44** | **44** |
