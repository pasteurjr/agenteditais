# PLANO DE VALIDACAO FINAL — SPRINT 2 (RF-001 a RF-037)

**Empresa:** QUANTICA IA LTDA — CNPJ 62.164.030/0001-90
**Data:** 24/02/2026
**Tempo estimado:** 4 horas
**URL Frontend:** http://localhost:5175
**URL Backend:** http://localhost:5007
**Login:** pasteurjr@gmail.com / 123456

---

## PREPARACAO (15 min)

Antes de comecar os testes, limpar dados de teste antigos e garantir ambiente limpo.

### P-01: Login e verificar ambiente
1. Abrir http://localhost:5175
2. Fazer login com `pasteurjr@gmail.com` / `123456`
3. Verificar que o Dashboard carrega com estatisticas
4. Verificar que o chat flutuante "Dr. Licita" aparece no canto inferior direito
5. **Resultado esperado:** Dashboard com cards de estatisticas, chat visivel

### P-02: Verificar que o backend esta rodando
1. No terminal: `tail -5 /tmp/backend_restart2.log`
2. Verificar que mostra "Servidor pronto na porta 5007!"
3. Se nao estiver rodando: `cd /mnt/data1/progpython/agenteditais/backend && python app.py > /tmp/backend_restart2.log 2>&1 &`

---

## GRUPO 1: PARAMETRIZACOES (45 min)

**Menu:** Configuracoes > Parametrizacoes
**Pagina:** ParametrizacoesPage.tsx
**Requisitos:** RF-015, RF-016, RF-017, RF-018, RF-014, RF-009, RF-013

---

### T-01: Aba Produtos — Criar Classes e Subclasses (RF-015, RF-013)
**Requisito:** "Cadastro da estrutura de classificacao / agrupamento dos produtos"

1. Abrir Configuracoes > Parametrizacoes
2. Clicar na aba **Produtos**
3. No card "Estrutura de Classificacao", clicar **"+ Nova Classe"**
4. Criar as seguintes classes:

| Nome da Classe | NCMs |
|---|---|
| Equipamentos Medicos | 9018.19.90, 9018.90.99 |
| Informatica e TI | 8471.30.19, 8471.49.00 |
| Reagentes Laboratoriais | 3822.00.90 |
| Insumos Hospitalares | 3005.90.20, 9018.39.99 |
| Redes e Telecomunicacoes | 8517.62.59 |

5. Para cada classe, clicar no icone de expandir e adicionar **subclasses**:

| Classe Pai | Subclasse | NCMs |
|---|---|---|
| Equipamentos Medicos | Monitores de Sinais Vitais | 9018.19.90 |
| Equipamentos Medicos | Desfibriladores e DEAs | 9018.90.99 |
| Equipamentos Medicos | Autoclaves e Esterilizacao | 8419.20.00 |
| Equipamentos Medicos | Bombas de Infusao | 9018.90.99 |
| Informatica e TI | Desktops e Notebooks | 8471.30.19 |
| Informatica e TI | Impressoras | 8443.32.29 |
| Reagentes Laboratoriais | Hematologia | 3822.00.90 |
| Insumos Hospitalares | Material Medico Geral | 3005.90.20 |
| Redes e Telecomunicacoes | Switches e Roteadores | 8517.62.59 |

6. **Verificar:** Cada classe expande mostrando suas subclasses abaixo
7. **Verificar:** NCMs aparecem como tags em cada classe/subclasse

**Criterio de aceite RF-015:** Arvore de classes/subclasses com NCMs ✓
**Criterio de aceite RF-013:** Hierarquia Classe > Subclasse ✓
**Criterio de aceite RF-009:** Classes definidas para mascara parametrizavel ✓

---

### T-02: Aba Produtos — Norteadores de Score (RF-018)
**Requisito:** "6 dimensoes que norteiam os scores do sistema"

1. Na aba Produtos, localizar o card **"Norteadores de Score"**
2. Verificar que mostra 6 dimensoes:
   - (a) Classificacao/Agrupamento (Score Tecnico)
   - (b) Score Comercial
   - (c) Tipos de Edital
   - (d) Score Tecnico
   - (e) Score Participacao
   - (f) Score Aderencia de Ganho
3. Verificar que cada item tem icone, titulo e badge de status
4. **Resultado esperado:** 6 cards/badges de norteadores visiveis

---

### T-03: Aba Produtos — Tipos de Edital (RF-017)
**Requisito:** "Cadastro dos tipos de editais que se deseja participar"

1. Na aba Produtos, localizar secao **"Tipos de Edital Desejados"**
2. Marcar os seguintes tipos (checkboxes/toggles):
   - [x] Comodatos
   - [x] Vendas de Equipamentos
   - [x] Aluguel com Consumo de Reagentes
   - [x] Consumo de Reagentes
   - [x] Compra de Insumos Laboratoriais
   - [x] Compra de Insumos Hospitalares
3. **Verificar:** Todos os 6 tipos aparecem e sao selecionaveis
4. Salvar e recarregar a pagina — verificar que permanecem marcados

---

### T-04: Aba Comercial — Regiao de Atuacao (RF-016)
**Requisito:** "Regiao comercial de atuacao"

1. Clicar na aba **Comercial**
2. No card "Regiao de Atuacao", selecionar os estados:
   - **MG** (sede), **SP**, **RJ**, **ES** (Sudeste)
   - **DF**, **GO** (Centro-Oeste parcial)
3. **OU** marcar "Atuar em todo o Brasil" se disponivel
4. Salvar

**Dados para Tempo de Entrega:**
- Prazo maximo: **30** dias
- Frequencia maxima: **Semanal**

**Dados para Mercado (TAM/SAM/SOM):**
- TAM: **5.000.000,00** (R$ 5 milhoes)
- SAM: **2.000.000,00** (R$ 2 milhoes)
- SOM: **800.000,00** (R$ 800 mil)

5. Preencher todos os campos e salvar
6. Recarregar pagina e verificar que dados persistiram

---

### T-05: Aba Fontes de Busca — Fontes de Editais (RF-014)
**Requisito:** "Cadastro das fontes onde o sistema busca editais"

1. Clicar na aba **Fontes de Busca**
2. Verificar que a tabela mostra fontes cadastradas (PNCP, ComprasNet, BEC-SP, etc.)
3. Verificar colunas: Nome, Tipo (API/Scraper), Status (Ativa/Inativa)
4. **Acao:** Se houver fontes duplicadas, excluir as duplicatas (manter apenas 1 de cada)
5. Verificar que restam fontes unicas:
   - PNCP (api, ativa)
   - ComprasNet (api, ativa)
   - BEC-SP (scraper, ativa)
   - Portal de Compras MG (scraper, ativa)
   - LicitaNet (scraper, ativa)
   - Licitacoes-e (scraper, ativa)
   - E outras conforme cadastradas

**Card Palavras-chave:**
6. No card "Palavras-chave de Busca", adicionar:
   - `equipamentos medicos`
   - `reagentes laboratoriais`
   - `insumos hospitalares`
   - `monitores sinais vitais`
   - `autoclaves`
   - `desfibriladores`
7. Salvar

**Card NCMs:**
8. No card "NCMs para Busca", verificar que mostra NCMs do portfolio
9. Se vazio, adicionar: `9018.19.90`, `9018.90.99`, `8419.20.00`, `3822.00.90`
10. Salvar e verificar persistencia

---

### T-06: Aba Notificacoes (RF-025 parcial)
1. Clicar na aba **Notificacoes**
2. Verificar opcoes de configuracao de alertas
3. Ativar notificacoes por email se disponivel
4. **Resultado esperado:** Secao de configuracao de notificacoes funcional

---

### T-07: Aba Preferencias
1. Clicar na aba **Preferencias**
2. Verificar opcoes: Tema (claro/escuro), Idioma, Fuso horario
3. Trocar tema para escuro e depois voltar para claro
4. **Resultado esperado:** Preferencias salvas e aplicadas

---

## GRUPO 2: PORTFOLIO DE PRODUTOS (60 min)

**Menu:** Captacao > Portfolio de Produtos
**Pagina:** PortfolioPage.tsx
**Requisitos:** RF-006, RF-007, RF-008, RF-009, RF-010, RF-011, RF-012

---

### T-08: Aba Meus Produtos — Verificar produtos existentes (RF-008)
**Requisito:** "Cadastro manual de produto com mascara parametrizavel por classe"

1. Abrir Portfolio de Produtos
2. Na aba **Meus Produtos**, verificar que ha 22 produtos cadastrados
3. Verificar colunas da tabela: Nome, Fabricante, Modelo, Classe, NCM, Completude (%), Acoes
4. Clicar em um produto (ex: "Monitor Multiparametros Mindray uMEC 12")
5. Verificar que o painel lateral mostra:
   - Informacoes basicas (nome, fabricante, modelo, NCM)
   - Especificacoes Tecnicas com badges "IA" indicando preenchimento automatico
6. **Resultado esperado:** Tabela com dados, painel de detalhes funcional

---

### T-09: Cadastro Manual — Novo Produto (RF-008, RF-009, RF-012)
**Requisito:** "Formulario com campos dinamicos conforme a classe selecionada"

1. Clicar na aba **Cadastro Manual**
2. Preencher o formulario com dados de um novo produto:

| Campo | Valor |
|---|---|
| Nome do Produto | Centrifuga de Bancada Kasvi K14-4000 |
| Classe | Equipamentos Medicos (ou Equipamento) |
| Subclasse | (selecionar se disponivel) |
| NCM | 8421.19.10 |
| Fabricante | Kasvi |
| Modelo | K14-4000 |

3. **Verificar RF-009:** Ao selecionar a classe "Equipamento", os campos de especificacao tecnica mudam:
   - Potencia, Voltagem, Resistencia, Peso, Dimensoes devem aparecer
4. Preencher especificacoes:

| Especificacao | Valor |
|---|---|
| Potencia | 250W |
| Voltagem | 220V |
| Peso | 12kg |
| Dimensoes | 350x350x250mm |

5. Clicar **"Cadastrar via IA"** (ou "Cadastrar")
6. **Resultado esperado:** Produto criado e visivel na aba Meus Produtos
7. **Verificar RF-012:** Campo NCM esta preenchido (8421.19.10)

---

### T-10: Cadastro Manual — Segundo Produto (categoria diferente)
1. Ainda na aba Cadastro Manual, criar outro produto:

| Campo | Valor |
|---|---|
| Nome | Kit Reagente Hemoglobina Glicada A1C |
| Classe | Reagentes (ou Reagente) |
| NCM | 3822.00.90 |
| Fabricante | Labtest Diagnostica |
| Modelo | Ref. 118 |

2. **Verificar RF-009:** Ao selecionar classe "Reagente", campos mudam para:
   - Metodologia, Sensibilidade, Especificidade, Validade, Armazenamento
3. Preencher:

| Especificacao | Valor |
|---|---|
| Metodologia | Imunoturbidimetria |
| Sensibilidade | 4.0% |
| Especificidade | 99% |
| Validade | 12 meses |
| Armazenamento | 2-8°C |

4. Cadastrar e verificar na lista

---

### T-11: Aba Uploads — Upload de Manual Tecnico (RF-006, RF-010)
**Requisito:** "Upload de manuais tecnicos dos produtos" + "IA le manuais e sugere campos"

1. Clicar na aba **Uploads**
2. Verificar que ha 6 cards de upload:
   - Manuais, Instrucoes de Uso, NFS, Plano de Contas, Folders, Website
3. Clicar no card **"Manuais"**
4. Fazer upload de um PDF qualquer (pode ser qualquer PDF disponivel em `docs/`)
5. **Verificar:** O sistema abre o chat e processa o arquivo com IA
6. **Verificar RF-010:** A IA extrai especificacoes do manual e sugere preenchimento
7. Repetir com o card **"Folders"** — fazer upload de outro PDF
8. **Resultado esperado:** Upload funciona, chat processa, IA sugere dados

---

### T-12: Aba Uploads — Buscar na ANVISA (RF-007)
**Requisito:** "Integracao com base de registros da ANVISA"

1. Na aba Uploads ou Meus Produtos, procurar botao **"Buscar na ANVISA"**
2. Clicar e abrir o modal
3. Buscar por: `Sysmex XN-1000`
4. **Verificar:** Modal abre, campo de busca funciona, resultado aparece
5. Se nenhum resultado, testar com: `monitor multiparametros` ou `autoclave`
6. **Resultado esperado:** Modal de busca ANVISA funcional

---

### T-13: Aba Classificacao — Funil de Monitoramento (RF-011)
**Requisito:** "Funil de monitoramento com 3 niveis"

1. Clicar na aba **Classificacao**
2. Verificar a hierarquia de classes (as que foram criadas no T-01)
3. Localizar o card **"Funil de Monitoramento"**
4. Verificar 3 etapas:
   - Monitoramento Continuo
   - Filtro Inteligente
   - Classificacao Automatica
5. Verificar status do agente (Ativo/Inativo)
6. Verificar "Ultima verificacao" e "Editais encontrados"
7. **Resultado esperado:** Visual do funil com 3 niveis e status do agente

---

### T-14: Acoes nos Produtos — Reprocessar e Completude
1. Voltar para aba **Meus Produtos**
2. Selecionar o produto "Monitor Multiparametros Mindray uMEC 12"
3. Clicar no botao **"Reprocessar IA"** (icone de refresh)
4. **Verificar:** Chat abre e reprocessa as especificacoes do produto
5. Clicar no botao **"Verificar Completude"**
6. **Verificar:** Score de completude aparece/atualiza na coluna %
7. **Resultado esperado:** Acoes de IA funcionam via chat

---

## GRUPO 3: EMPRESA (45 min)

**Menu:** Configuracoes > Empresa
**Pagina:** EmpresaPage.tsx
**Requisitos:** RF-001, RF-002, RF-003, RF-004, RF-005

---

### T-15: Dados Cadastrais da Empresa (RF-001)
**Requisito:** "Cadastro completo da empresa participante de licitacoes"

1. Abrir Configuracoes > Empresa
2. Verificar dados atuais preenchidos:

| Campo | Valor Esperado |
|---|---|
| Razao Social | QUANTICA IA LTDA |
| CNPJ | 62.164.030/0001-90 |
| Inscricao Estadual | 123.456.789.000 |
| Website | http://aquila-test.com |
| Instagram | @aquilatest |
| LinkedIn | aquila-diagnostico-ltda |
| Facebook | aquiladiagnostico |
| Endereco | Av Afonso Pena, 3351, Sala 1101QUA |
| Cidade | Belo Horizonte |
| UF | MG |
| CEP | 30130-008 |

3. **Atualizar** dados para a empresa real QUANTICA IA:

| Campo | Novo Valor |
|---|---|
| Website | https://quanticaia.com.br |
| Instagram | @quanticaia |
| LinkedIn | quantica-ia-ltda |
| Facebook | quanticaia |

4. **Emails multiplos (RF-001 criterio 2):**
   - Verificar que ha area de emails com botoes +/-
   - Remover emails antigos de teste
   - Adicionar: `contato@quanticaia.com.br`
   - Adicionar: `comercial@quanticaia.com.br`
   - Adicionar: `licitacoes@quanticaia.com.br`

5. **Celulares multiplos (RF-001 criterio 2):**
   - Remover celulares de teste
   - Adicionar: `(31) 99876-5432`
   - Adicionar: `(31) 98765-4321`

6. Clicar **"Salvar Alteracoes"**
7. Recarregar a pagina e verificar que todos os dados persistiram
8. **Resultado esperado:** Todos os campos preenchidos e salvos

---

### T-16: Documentos Habilitativos (RF-002)
**Requisito:** "Upload e gestao de todos os documentos habilitativos"

1. No card **"Documentos da Empresa"**, verificar a tabela
2. **Nota:** Ha 43 documentos de teste duplicados. Limpar excluindo duplicatas.
3. Garantir que resta pelo menos 1 documento de cada tipo essencial:

| Tipo | Nome | Validade |
|---|---|---|
| contrato_social | Contrato Social Quantica IA.pdf | (sem validade) |
| afe | AFE Quantica IA.pdf | 2027-12-31 |
| cbpad | CBPAD.pdf | 2027-12-31 |
| cbpp | CBPP.pdf | 2027-12-31 |
| bombeiros | Auto de Vistoria Bombeiros.pdf | 2027-12-31 |
| balanco | Balanco Patrimonial 2025.pdf | 2026-12-31 |
| habilitacao_fiscal | Habilitacao Fiscal.pdf | 2027-12-31 |
| habilitacao_economica | Habilitacao Economica.pdf | 2027-12-31 |
| qualificacao_tecnica | Qualificacao Tecnica.pdf | 2027-12-31 |
| atestado_capacidade | Atestado Capacidade HC UFMG.pdf | 2026-12-31 |
| alvara | Alvara Funcionamento BH 2026.pdf | 2026-12-31 |

4. **Teste de upload:** Clicar **"+ Upload Documento"**
   - Tipo: `procuracao`
   - Selecionar qualquer PDF
   - Validade: `2027-06-30`
   - Confirmar upload
5. **Verificar:** Documento aparece na tabela com status correto:
   - Verde (ok) = arquivo presente e nao vencido
   - Amarelo (vence) = vence em 30 dias
   - Vermelho (falta) = arquivo ausente ou vencido
6. **Teste de download:** Clicar no icone de download de um documento
7. **Teste de visualizacao:** Clicar no icone de olho (eye) de um documento
8. **Resultado esperado:** Upload, download e visualizacao funcionam; status corretos

---

### T-17: Certidoes Automaticas (RF-003)
**Requisito:** "Consulta automatica de certidoes com alerta de vencimento"

1. No card **"Certidoes Automaticas"**, verificar a tabela com 21 certidoes
2. **Verificar frequencia:** O seletor "Frequencia de busca automatica" deve mostrar "Diaria"
3. **Trocar frequencia** para "Semanal" e verificar que salva
4. Trocar de volta para "Diaria"
5. **Clicar "Buscar Certidoes"**
6. Aguardar a busca (pode levar 10-15 segundos)
7. **Verificar resultados:**
   - CEIS (CGU): Status **Valida** (busca real no Portal da Transparencia)
   - CNEP (CGU): Status **Valida** (busca real)
   - CADIN: Status **Valida** (busca real)
   - TCU: Status **Valida** (busca real)
   - Demais 17: Status **Pendente** ou **Manual** (requerem captcha/acesso manual)
8. **Verificar mensagem de sucesso:** Deve mostrar "X obtidas, Y pendentes, Z manuais"
9. **Verificar footer:** Deve mostrar "21 certidoes (X com busca automatica, Y manuais)"
10. **Teste upload manual:** Clicar no icone de upload de uma certidao pendente (ex: CND Federal)
    - Modal abre com campos: Arquivo, Validade, Numero
    - Selecionar qualquer PDF
    - Validade: `2026-08-24`
    - Numero: `CND-2026-001`
    - Confirmar
11. **Verificar:** Certidao muda para status "Valida"
12. **Teste portal:** Clicar no icone de olho de uma certidao
    - **Verificar:** Abre nova aba com o portal do orgao emissor

---

### T-18: Alertas IA sobre Documentos (RF-004)
**Requisito:** "IA compara documentos da empresa com requisitos dos editais"

1. No card **"Alertas IA sobre Documentos"**, clicar **"Verificar Documentos"**
2. **Verificar:** Chat abre e IA analisa os documentos da empresa
3. **Verificar:** IA identifica:
   - Documentos faltantes
   - Documentos vencidos ou proximos do vencimento
   - Sugestoes de documentos adicionais
4. **Resultado esperado:** IA gera alerta textual sobre status dos documentos

---

### T-19: Responsaveis da Empresa (RF-005)
**Requisito:** "CRUD de responsaveis da empresa"

1. No card **"Responsaveis"**, verificar a tabela
2. **Limpar registros de teste** (excluir "Responsavel Teste 813052", "042845", "927716")
3. Verificar que restam os responsaveis reais
4. **Adicionar novo responsavel:** Clicar **"+ Adicionar"**

| Campo | Valor |
|---|---|
| Tipo | Representante Legal |
| Nome | Arnaldo Bacha |
| Cargo | CEO |
| Email | arnaldo.bacha@quanticaia.com.br |
| Telefone | (31) 99876-5432 |

5. Salvar e verificar que aparece na tabela
6. **Editar responsavel:** Clicar no icone de editar do responsavel recem-criado
   - Alterar cargo para "Diretor Executivo"
   - Salvar
7. **Verificar:** Edicao persistiu
8. **Adicionar mais um:**

| Campo | Valor |
|---|---|
| Tipo | Preposto |
| Nome | Maria Silva |
| Cargo | Gerente de Licitacoes |
| Email | maria.silva@quanticaia.com.br |
| Telefone | (31) 98765-4321 |

9. **Resultado esperado:** CRUD completo (criar, editar, excluir) funcional

---

## GRUPO 4: CAPTACAO (60 min)

**Menu:** Captacao > Busca de Editais
**Pagina:** CaptacaoPage.tsx
**Requisitos:** RF-019, RF-020, RF-021, RF-022, RF-023, RF-024, RF-025

---

### T-20: Cards de Prazo (RF-022)
**Requisito:** "Card mostrando contagem de editais por prazo de submissao"

1. Abrir Captacao > Busca de Editais
2. No topo, verificar 4 cards de contagem:
   - Proximos 2 dias: X Editais
   - Proximos 5 dias: Y Editais
   - Proximos 10 dias: Z Editais
   - Proximos 20 dias: W Editais
3. **Verificar:** Cores por urgencia (vermelho/laranja/amarelo/azul)
4. **Resultado esperado:** 4 cards com contagens calculadas a partir dos editais salvos

---

### T-21: Busca de Editais — Busca Simples (RF-021)
**Requisito:** "Filtros avancados para busca e classificacao de editais"

1. No card **"Buscar Editais"**, preencher:

| Campo | Valor |
|---|---|
| Termo | equipamentos medicos laboratoriais |
| UF | MG |
| Fonte | PNCP |
| Calcular score | [x] marcado |

2. Clicar **"Buscar Editais"**
3. Aguardar resultados (pode levar 15-30 segundos)
4. **Verificar tabela de resultados:**
   - Colunas: Numero, Orgao, UF, Objeto, Valor, Prazo (dias), Score
   - Resultados aparecem com dados reais do PNCP
   - Score aparece como circulo colorido (verde >=80, amarelo 50-79, vermelho <50)
5. **Resultado esperado:** Editais reais retornados com scores calculados

---

### T-22: Busca de Editais — Filtros Avancados (RF-021)
**Requisito:** "Filtro por tipo, origem, fonte, NCM, palavra-chave"

1. Fazer nova busca com filtros diferentes:

| Campo | Valor |
|---|---|
| Termo | reagentes hematologia |
| UF | Todas |
| Fonte | Todas |
| Classificacao Tipo | Consumo de Reagentes |
| Calcular score | [x] marcado |

2. Buscar e verificar resultados
3. Fazer terceira busca por NCM:

| Campo | Valor |
|---|---|
| Termo | (vazio) |
| NCM | 9018.19.90 |
| UF | SP |

4. **Verificar RF-021 criterios:**
   - [x] Filtro por tipo de edital
   - [x] Filtro por UF (27 estados + Todas)
   - [x] Filtro por fonte (PNCP, ComprasNet, BEC, etc.)
   - [x] Busca por NCM
   - [x] Busca por palavra-chave

---

### T-23: Painel Lateral — Analise de Edital (RF-019, RF-020, RF-024)
**Requisito:** "Tabela com Score de Aderencia" + "Painel lateral com analise detalhada"

1. Nos resultados da busca, clicar em um edital (qualquer linha)
2. **Verificar painel lateral abre** com:
   - Score Geral (circulo grande)
   - Score Aderencia Tecnica (circulo menor)
   - Score Aderencia Comercial (circulo menor)
   - Score Recomendacao (estrelas)
   - Produto Correspondente (com badge IA)
   - Potencial de Ganho (badge: Elevado/Medio/Baixo)
3. **Verificar RF-024 — Analise de Gaps:**
   - Rolar o painel para baixo
   - Localizar secao de gaps/dimensoes de score
   - Verificar 6 barras: Tecnico, Documental, Complexidade, Juridico, Logistico, Comercial
   - Verificar pontos positivos e de atencao
4. **Verificar tooltip:** Passar o mouse sobre o score na tabela
   - Deve mostrar detalhes dos gaps (Atendido ✓, Parcial ●, Nao atendido ✗)
5. **Resultado esperado:** Painel lateral completo com scores e analise

---

### T-24: Intencao Estrategica e Margem (RF-023)
**Requisito:** "Definicao da intencao estrategica e expectativa de margem por edital"

1. Com o painel lateral aberto, localizar secao **"Intencao Estrategica"**
2. Selecionar: **"Edital Estrategico (Entrada em novo orgao)"**
3. Localizar **"Expectativa de Margem"**
4. Ajustar slider para **25%**
5. Verificar botoes "Varia por Produto" e "Varia por Região" (toggles)
6. Clicar **"Salvar Estrategia"**
7. **Resultado esperado:** Estrategia salva, valores persistem ao reabrir o edital

---

### T-25: Salvar Editais (RF-019)
1. Na tabela de resultados, marcar checkboxes de 3-5 editais
2. Clicar **"Salvar Selecionados"**
3. **Verificar:** Mensagem de sucesso aparece
4. Alternativamente, testar **"Salvar Score >= 70%"**
5. Testar **"Exportar CSV"**
6. **Resultado esperado:** Editais salvos no banco, CSV exportado

---

### T-26: Monitoramento 24/7 (RF-025)
**Requisito:** "Agente autonomo de monitoramento continuo"

1. Rolar ate o card **"Monitoramento Automatico"**
2. Verificar monitoramentos existentes:
   - "equipamentos laboratoriais" — AM, PA, TO — 4h — Ativo
   - "equipamentos medicos" — AM, MG, PA, SP, TO — 4h — Ativo
   - "reagentes de hematologia" — ES, MA, TO — 4h — Inativo
3. **Criar novo monitoramento:**

| Campo | Valor |
|---|---|
| Termo | insumos hospitalares |
| UFs | MG, SP, RJ |
| Frequencia | 12h |

4. Clicar para criar
5. **Verificar:** Novo monitoramento aparece na lista com status "Ativo"
6. **Testar pausar:** Clicar no botao de pausar do monitoramento "reagentes de hematologia"
7. **Verificar:** Status muda para Inativo/Pausado
8. **Resultado esperado:** CRUD de monitoramentos funcional, status toggleavel

---

### T-27: Abrir Edital no Portal (RF-019)
1. Na tabela de resultados ou editais salvos, clicar no botao **"Abrir no Portal"**
2. **Verificar:** Nova aba abre com o edital no site oficial (PNCP, etc.)
3. **Resultado esperado:** Link externo funcional

---

## GRUPO 5: VALIDACAO (60 min)

**Menu:** Validacao
**Pagina:** ValidacaoPage.tsx
**Requisitos:** RF-026 a RF-037

---

### T-28: Tabela de Editais para Validacao
1. Abrir pagina de **Validacao**
2. Verificar tabela de editais com colunas: Numero, Orgao, UF, Objeto, Valor, Abertura, Status, Score
3. **Filtrar por status:** Testar filtros "Novo", "Analisando", "Validado", "Descartado"
4. Verificar que editais salvos na Captacao aparecem aqui
5. **Selecionar** um edital (ex: PE-001/2026 — Hospital das Clinicas UFMG)

---

### T-29: Sinais de Mercado (RF-026)
**Requisito:** "Alertas de sinais de mercado detectados pela IA"

1. Com edital selecionado, verificar barra superior
2. **Verificar badges:** "Concorrente Dominante", "Suspeita Direcionamento", etc.
3. Cada badge deve ter cor (vermelho/amarelo) e icone
4. **Resultado esperado:** Badges de sinais de mercado visiveis (mesmo que vazias para editais novos)

---

### T-30: Decisao — Participar/Acompanhar/Ignorar (RF-027)
**Requisito:** "3 opcoes de decisao com justificativa obrigatoria"

1. Com edital selecionado, localizar 3 botoes no topo:
   - **[Participar]** (verde)
   - **[Acompanhar]** (azul)
   - **[Ignorar]** (vermelho/cinza)
2. Clicar em **"Participar"**
3. **Verificar modal de justificativa:**
   - Dropdown de motivo (lista pre-definida)
   - Textarea para justificativa livre
4. Preencher:

| Campo | Valor |
|---|---|
| Motivo | Aderencia tecnica alta |
| Detalhes | Nosso portfolio atende 90% dos requisitos tecnicos. Equipamento principal e o Monitor uMEC 12 que temos em estoque. Valor compativel com historico. |

5. Confirmar
6. **Verificar:** Status do edital muda para "Participando" ou equivalente
7. **Testar com outro edital:** Selecionar PE-003/2026 (FHEMIG) e clicar **"Acompanhar"**
   - Motivo: "Margem insuficiente"
   - Detalhes: "Valor referencia abaixo do custo. Acompanhar para referencia de precos."

---

### T-31: Score Dashboard — 6 Dimensoes (RF-028)
**Requisito:** "Dashboard com score geral e 6 sub-scores de risco"

1. Com edital selecionado, localizar area de scores (lateral direita)
2. **Verificar circulo grande:** Score geral (0-100)
3. **Clicar "Calcular Scores IA"**
4. Aguardar processamento
5. **Verificar 6 barras:**
   - Aderencia Tecnica (High/Medium/Low)
   - Aderencia Documental
   - Complexidade do Edital
   - Risco Juridico
   - Viabilidade Logistica
   - Atratividade Comercial
6. **Verificar cores:** Verde (High), Amarelo (Medium), Vermelho (Low)
7. **Verificar decisao IA:** Badge GO/NO-GO/CONDICIONAL
8. **Verificar Potencial de Ganho:** Badge Elevado/Medio/Baixo
9. **Resultado esperado:** Todos os 6 scores preenchidos com valores e cores

---

### T-32: Aba Aderencia (RF-029, RF-030, RF-031)
**Requisito:** "Aba Objetiva com aderencia tecnica, certificacoes, checklist, mapa logistico"

1. Clicar na aba **"Aderencia"** (ou 1a aba)
2. **Verificar RF-030 — Aderencia Tecnica:**
   - Recomendacao da IA (banner GO/NO-GO)
   - Sub-scores detalhados
3. **Verificar Certificacoes:** Tabela com Nome e Status (OK/Pendente)
4. **Verificar RF-031 — Analise de Lote:**
   - Barra horizontal com blocos coloridos
   - Verde = itens aderentes, Amarelo = itens intrusos
   - Legenda com descricao
5. **Verificar Mapa Logistico:**
   - UF do edital vs UF da empresa
   - Indicador de distancia/tempo de entrega
6. **Verificar Intencao Estrategica:** Radios + slider de margem
7. **Resultado esperado:** Todos os componentes da aba Aderencia visiveis e preenchidos

---

### T-33: Aba Documentos — Processo Amanda (RF-036)
**Requisito:** "Organizacao automatica de documentos em pastas conforme exigencias do edital"

1. Clicar na aba **"Documentos"** (2a aba)
2. **Verificar 3 pastas coloridas:**
   - **Pasta 1 (azul):** Documentos da Empresa (Contrato Social, etc.)
   - **Pasta 2 (amarelo):** Certidoes e Fiscal (CND Federal, FGTS, etc.)
   - **Pasta 3 (verde):** Qualificacao Tecnica (Atestados, ANVISA, etc.)
3. Dentro de cada pasta, verificar:
   - Lista de documentos com status (Presente/Faltante/Vencido)
   - Badges coloridas (verde=OK, vermelho=Pendente)
4. **Clicar "Documentos Exigidos via IA"** se disponivel
5. **Verificar:** IA cruza requisitos do edital com documentos da empresa
6. **Resultado esperado:** 3 pastas organizadas com status de cada documento

---

### T-34: Aba Riscos — Pipeline de Riscos (RF-032, RF-033, RF-034, RF-035)
**Requisito:** "Pipeline de riscos em 3 categorias"

1. Clicar na aba **"Riscos"** (3a aba)
2. **Verificar RF-032 — Pipeline de Riscos:**
   - Secao "Modalidade e Risco" com badges
   - Secao "Checklist Documental" com status
   - Secao "Flags Juridicos" com alertas
3. **Verificar Fatal Flaws:** Lista de problemas criticos
4. **Verificar RF-034 — Alerta de Recorrencia:**
   - Card de alerta se editais semelhantes foram recusados/perdidos
5. **Verificar Aderencia Trecho-a-Trecho (RF-030):**
   - Tabela: Trecho do Edital | Aderencia (%) | Trecho do Portfolio
   - Cores: verde (alta), amarelo (parcial), vermelho (baixa)
6. **Verificar RF-035 — Dimensoes de Risco:**
   - 6 badges: Tecnico, Documental, Complexidade, Juridico, Logistico, Comercial
   - Classificacao: Impeditivo vs Ponto de Atencao
7. **Verificar RF-033 — Reputacao do Orgao:**
   - Card com informacoes do orgao (pregoeiro, pagamento, historico)
8. **Resultado esperado:** Todas as secoes de risco preenchidas

---

### T-35: Aba Mercado (RF-033, RF-034)
1. Clicar na aba **"Mercado"** (4a aba)
2. **Verificar Reputacao do Orgao:**
   - Indicadores positivo/negativo/neutro
3. **Verificar Historico de Editais Semelhantes:**
   - Lista com decisoes anteriores
4. **Testar botoes IA:**
   - Clicar **"Buscar Precos"** — IA busca precos historicos
   - Clicar **"Analisar Concorrentes"** — IA analisa concorrencia
5. **Resultado esperado:** Informacoes de mercado disponiveis

---

### T-36: Aba IA — Chat Cognitivo (RF-029 aba cognitiva)
**Requisito:** "Resumo da IA, Historico Semelhante, Pergunte a IA"

1. Clicar na aba **"IA"** (5a aba)
2. **Gerar Resumo:**
   - Clicar **"Gerar Resumo"**
   - Aguardar IA processar
   - **Verificar:** Resumo textual do edital aparece
3. **Pergunte a IA:**
   - No campo "Pergunte a IA", digitar: `Quais sao os principais riscos deste edital para a Quantica IA?`
   - Enviar e aguardar resposta
   - **Verificar:** IA responde com analise contextualizada
4. **Testar acoes rapidas:**
   - Clicar **"Requisitos Tecnicos"** — IA lista requisitos
   - Clicar **"Classificar Edital"** — IA classifica o tipo
5. **Resultado esperado:** Chat cognitivo funcional com respostas contextualizadas

---

### T-37: GO/NO-GO Final (RF-037)
**Requisito:** "Decisao final consolidada de participacao no edital"

1. Com todos os scores calculados, verificar decisao consolidada:
   - Score geral consolidado
   - Recomendacao IA (GO/NO-GO/ACOMPANHAR)
2. Se ainda nao calculou, clicar **"Calcular Scores IA"**
3. **Verificar:** Badge GO/NO-GO aparece com cor (verde/vermelho/amarelo)
4. **Tomar decisao:** Clicar no botao correspondente a recomendacao da IA
5. **Resultado esperado:** Decisao final registrada, edital muda de status

---

## GRUPO 6: TESTES NO CHAT (30 min)

**Componente:** FloatingChat (Dr. Licita)
**Requisitos transversais:** RF-004, RF-010, RF-020, RF-029

---

### T-38: Chat — Listar Produtos
1. Abrir o chat flutuante (canto inferior direito)
2. Digitar: `Listar meus produtos`
3. **Verificar:** IA retorna lista dos 22+ produtos cadastrados
4. **Resultado esperado:** Lista formatada com nomes, categorias

---

### T-39: Chat — Buscar Editais
1. Digitar: `Buscar editais de equipamentos medicos em MG`
2. **Verificar:** IA busca e retorna editais com score
3. **Resultado esperado:** Editais reais encontrados

---

### T-40: Chat — Calcular Aderencia
1. Digitar: `Calcular aderencia do edital PE-001/2026 com o produto Monitor Multiparametros Mindray uMEC 12`
2. **Verificar:** IA calcula e retorna score de aderencia
3. **Resultado esperado:** Score numerico com detalhes

---

### T-41: Chat — Gerar Proposta
1. Digitar: `Gerar proposta para o edital PE-001/2026`
2. **Verificar:** IA gera texto de proposta tecnica
3. **Resultado esperado:** Texto de proposta formatado

---

### T-42: Chat — Upload de Documento
1. Usar o botao de upload no chat (clip icon)
2. Selecionar qualquer PDF de `docs/`
3. Digitar: `Analise este documento e extraia especificacoes de produtos`
4. **Verificar:** IA processa o PDF e extrai informacoes
5. **Resultado esperado:** Especificacoes extraidas do documento

---

### T-43: Chat — Perguntas Contextuais
1. Digitar: `Quais documentos da empresa Quantica IA estao vencidos?`
2. **Verificar:** IA consulta banco e lista documentos vencidos
3. Digitar: `Qual o historico de precos para equipamentos de monitoramento em MG?`
4. **Verificar:** IA busca precos historicos
5. **Resultado esperado:** Respostas contextualizadas com dados reais

---

### T-44: Chat — Sessoes
1. Verificar icone de historico no chat
2. Clicar para abrir sidebar de sessoes
3. **Verificar:** Lista de sessoes anteriores
4. Clicar **"+ Nova Conversa"**
5. **Verificar:** Nova sessao criada
6. Renomear sessao (clicar no nome, editar, Enter)
7. **Resultado esperado:** CRUD de sessoes funcional

---

## GRUPO 7: TESTES INTEGRADOS (15 min)

### T-45: Fluxo Completo — Busca ate Decisao
**Fluxo end-to-end que testa integracao entre paginas:**

1. **Captacao:** Buscar `autoclaves esterilizacao` em `MG`, com score
2. **Captacao:** Salvar 1 edital relevante
3. **Validacao:** Abrir o edital salvo na pagina de Validacao
4. **Validacao:** Calcular Scores IA
5. **Validacao:** Verificar aba Documentos (Processo Amanda)
6. **Validacao:** Verificar aba Riscos
7. **Validacao:** Tomar decisao "Participar" com justificativa
8. **Verificar:** Status muda, decisao registrada
9. **Resultado esperado:** Fluxo completo funciona sem erros

---

### T-46: Fluxo Completo — Portfolio ate Captacao
1. **Portfolio:** Criar produto "Autoclave Stermax VIDA 50L" com classe Equipamento
2. **Parametrizacoes:** Verificar que NCM 8419.20.00 esta nas palavras-chave
3. **Captacao:** Buscar "autoclave" — verificar que score considera o novo produto
4. **Resultado esperado:** Dados do portfolio influenciam scores da captacao

---

### T-47: Dashboard — Verificar Estatisticas
1. Voltar ao **Dashboard** (pagina inicial)
2. **Verificar cards:**
   - Total de editais salvos
   - Editais por status
   - Total de propostas
   - Proximos prazos
3. **Resultado esperado:** Estatisticas refletem dados inseridos durante os testes

---

## CHECKLIST FINAL — COBERTURA DE REQUISITOS

| RF | Titulo | Testes | Status |
|---|---|---|---|
| RF-001 | Cadastro da Empresa | T-15 | [ ] |
| RF-002 | Documentos Habilitativos | T-16 | [ ] |
| RF-003 | Certidoes Automaticas | T-17 | [ ] |
| RF-004 | Alertas IA Documentos | T-18, T-43 | [ ] |
| RF-005 | Responsaveis da Empresa | T-19 | [ ] |
| RF-006 | Portfolio — Fontes de Obtencao | T-11 | [ ] |
| RF-007 | Registros ANVISA | T-12 | [ ] |
| RF-008 | Cadastro Manual Produtos | T-09, T-10 | [ ] |
| RF-009 | Mascara Parametrizavel | T-09, T-10 | [ ] |
| RF-010 | IA Le Manuais | T-11, T-42 | [ ] |
| RF-011 | Funil de Monitoramento | T-13 | [ ] |
| RF-012 | Importancia do NCM | T-09, T-22 | [ ] |
| RF-013 | Classificacao/Agrupamento | T-01 | [ ] |
| RF-014 | Fontes de Busca | T-05 | [ ] |
| RF-015 | Parametrizacoes — Classificacao | T-01 | [ ] |
| RF-016 | Parametrizacoes — Comerciais | T-04 | [ ] |
| RF-017 | Tipos de Edital | T-03 | [ ] |
| RF-018 | Norteadores de Score | T-02 | [ ] |
| RF-019 | Painel de Oportunidades | T-21, T-23, T-25 | [ ] |
| RF-020 | Painel Lateral Analise | T-23, T-24 | [ ] |
| RF-021 | Filtros e Classificacao | T-21, T-22 | [ ] |
| RF-022 | Datas de Submissao | T-20 | [ ] |
| RF-023 | Intencao Estrategica/Margem | T-24 | [ ] |
| RF-024 | Analise de Gaps | T-23 | [ ] |
| RF-025 | Monitoramento 24/7 | T-26, T-06 | [ ] |
| RF-026 | Sinais de Mercado | T-29 | [ ] |
| RF-027 | Decisao Participar/Acompanhar | T-30 | [ ] |
| RF-028 | Score Dashboard 6 Dimensoes | T-31 | [ ] |
| RF-029 | 3 Abas (Aderencia/Riscos/IA) | T-32, T-34, T-36 | [ ] |
| RF-030 | Aderencia Trecho-a-Trecho | T-32, T-34 | [ ] |
| RF-031 | Analise de Lote | T-32 | [ ] |
| RF-032 | Pipeline de Riscos | T-34 | [ ] |
| RF-033 | Reputacao do Orgao | T-34, T-35 | [ ] |
| RF-034 | Alerta de Recorrencia | T-34, T-35 | [ ] |
| RF-035 | Aderencias/Riscos Dimensao | T-34 | [ ] |
| RF-036 | Processo Amanda | T-33 | [ ] |
| RF-037 | GO/NO-GO | T-37 | [ ] |

---

## NOTAS IMPORTANTES

1. **Backend deve estar rodando** na porta 5007 antes de iniciar os testes
2. **Frontend deve estar rodando** na porta 5175 (`cd frontend && npm run dev`)
3. **Busca de editais** requer conexao com internet (consulta PNCP real)
4. **Calcular Scores IA** requer API DeepSeek configurada (verificar config.py)
5. **Certidoes automaticas** — 4 fontes fazem busca real (CEIS, CNEP, CADIN, TCU), as demais 17 sao manuais
6. **Tempo entre testes:** Nao ha dependencia estrita entre grupos, mas recomenda-se seguir a ordem: Parametrizacoes > Portfolio > Empresa > Captacao > Validacao
7. **Se um teste falhar:** Anotar o numero do teste, o erro exato, e screenshot se possivel. Continuar com o proximo teste.
