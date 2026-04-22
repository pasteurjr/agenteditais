# ANALISE DAS OBSERVACOES DO VALIDADOR ARNALDO — Sprint 01

**Data:** 2026-04-21
**Documento analisado:** `docs/arnaldo Sprint 01-1.docx`
**Tutorial de referencia:** `docs/tutorialsprint1-2.md`
**Analista:** IA (Claude)

---

## Resumo

O validador Arnaldo executou o tutorial da Sprint 1 (Conjunto 2, usuario valida2@valida.com.br) e reportou observacoes para os UCs F01 a F06. Abaixo, cada observacao e analisada com verificacao direta no codigo-fonte e no banco de dados.

**Legenda:**
- **PROCEDE** — observacao correta, requer correcao no sistema ou no tutorial
- **PROCEDE PARCIAL** — observacao tem fundamento, mas com ressalvas
- **NAO PROCEDE** — observacao incorreta ou por erro de operacao do validador
- **MELHORIA** — sugestao valida mas nao e bug

---

## Observacoes Gerais (pre-UCs)

### OBS-01: "Explicar melhor que deve ir para CADASTROS no menu lateral"
**Veredicto: PROCEDE — correcao no tutorial**

O tutorial nao explica claramente a navegacao inicial. O menu lateral tem duas secoes que lidam com empresa: "Cadastros > Empresa" e "Configuracoes > Empresa". O tutorial deve especificar exatamente qual caminho seguir.

**Correcao:** Adicionar no tutorial: *"No menu lateral esquerdo, clique em **Configuracoes** > **Empresa** para acessar o cadastro completo (com redes sociais, endereco, etc)."*

---

### OBS-02: "Nao seria interessante exibir qual o nivel do usuario logado? (super, normal)"
**Veredicto: MELHORIA — sugestao valida**

Atualmente o sistema nao mostra o papel do usuario na interface. Seria util para o validador saber se esta logado como super/admin/operador.

**Acao:** Baixa prioridade. Considerar exibir badge com papel no header ou no perfil.

---

### OBS-03: "Tela de DASHBOARD esta maior que a tela do notebook, extrapolando para a direita"
**Veredicto: PROCEDE — bug de responsividade**

Dashboard pode ultrapassar viewport em notebooks com resolucao menor (1366x768 comum).

**Acao:** Verificar CSS do DashboardPage para overflow horizontal. Aplicar `max-width: 100%; overflow-x: auto;` nos containers principais.

---

### OBS-04: "Explicar que a opcao SELECIONAR EMPRESA esta no submenu CONFIGURACOES"
**Veredicto: PROCEDE — correcao no tutorial**

O passo de selecionar empresa nao esta claro. O tutorial assume que o usuario sabe onde encontrar essa opcao.

**Correcao:** Adicionar passo explicito no tutorial: *"Apos login, va em **Configuracoes** > **Selecionar Empresa** e escolha 'RP3X Comercio e Representacoes Ltda.'"*

---

## [UC-F01] Manter Cadastro Principal da Empresa

### OBS-05: "Tem opcao de EDITAR EMPRESA em CADASTROS e em CONFIGURACOES. Nao seria melhor so em um?"
**Veredicto: PROCEDE — duplicidade confirmada no codigo**

Confirmado no Sidebar.tsx:
- Linha 80: `{ id: "crud-empresas", label: "Dados Cadastrais", page: "crud:empresas" }` (Cadastros > Empresa)
- Linha 236: `{ id: "empresa", label: "Empresa", page: "empresa" }` (Configuracoes)

A tela de Configuracoes > Empresa (EmpresaPage.tsx) e mais completa (inclui redes sociais, endereco, certidoes, responsaveis). A tela Cadastros > Empresa e o CRUD generico simplificado.

**Acao:** Considerar remover "Dados Cadastrais" de Cadastros > Empresa, ou redirecionar para a EmpresaPage. Ou pelo menos o tutorial deve especificar qual usar.

**Correcao no tutorial:** Instruir explicitamente que o cadastro deve ser feito em **Configuracoes > Empresa**, nao em Cadastros.

---

### OBS-06: "Para o endereco, poderia fazer leitura do CEP e montar os dados"
**Veredicto: MELHORIA — sugestao valida, nao implementado**

Confirmado no codigo: CEP e um `TextInput` simples (EmpresaPage.tsx linha 996). Nao ha integracao com viaCEP ou similar.

**Acao:** Implementar consulta viaCEP para auto-preenchimento de logradouro, cidade, UF. Melhoria de UX, nao bloqueante.

---

### OBS-07: "UF nao tem lista suspensa dos estados!"
**Veredicto: PROCEDE — bug de UX**

Confirmado no codigo: EmpresaPage.tsx linha 993 usa `TextInput` para UF, nao um `SelectInput`. O campo e texto livre, permitindo digitacao de valores invalidos.

**Acao:** Trocar `TextInput` por `SelectInput` com lista dos 27 UFs. Codigo: EmpresaPage.tsx, substituir input UF por select com opcoes fixas.

---

### OBS-08: "Nao digitei email nem telefone. O sistema nao deveria exigir?"
**Veredicto: PROCEDE PARCIAL**

Confirmado: campos email e telefone sao opcionais no modelo (models.py: nullable=True) e no CRUD (required = `["cnpj", "razao_social"]` apenas). Do ponto de vista de dados de licitacao, ter pelo menos um email e telefone e importante.

**Acao:** Considerar tornar email obrigatorio (campo de contato minimo para licitacoes). O tutorial deve mencionar que email/telefone sao opcionais mas recomendados.

---

### OBS-09: "Nao teve msg de 'salvo com sucesso'"
**Veredicto: PROCEDE — bug confirmado**

Confirmado no codigo: `handleSave()` em EmpresaPage.tsx (linhas 352-384) nao exibe mensagem de sucesso apos salvar. Apenas tem tratamento de erro. O usuario nao recebe feedback visual de que os dados foram salvos.

**Acao:** Adicionar toast/mensagem verde "Dados salvos com sucesso" apos PUT bem-sucedido na EmpresaPage.

---

## [UC-F02] Gerir Contatos e Area Padrao

### OBS-10: "Cadastro dos telefones nao tem mascara"
**Veredicto: PROCEDE — UX deficiente**

Confirmado: todos os inputs de telefone usam `TextInput` sem mascara. Nao ha biblioteca de mascaras (InputMask, react-input-mask) no projeto.

**Acao:** Implementar mascara de telefone `(XX) XXXXX-XXXX` para celular e `(XX) XXXX-XXXX` para fixo. Pode usar regex no onChange ou adicionar react-input-mask.

---

### OBS-11: "Deveria ter opcao de alterar os dados depois de salvos"
**Veredicto: NAO PROCEDE — funcionalidade existe**

Confirmado no codigo: EmpresaPage.tsx tem botao de edicao (Edit2 icon) com `handleEditarResponsavel()` (linha 886) que preenche o formulario para edicao e usa `crudUpdate()` para salvar alteracoes.

**Nota:** Pode ser que o botao de edicao nao esteja visivel o suficiente para o validador. Verificar se o icone de editar esta claro na interface.

---

### OBS-12: "Area de Atuacao Padrao nao abre lista, esta vazia"
**Veredicto: PROCEDE PARCIAL — depende dos dados**

Confirmado que o codigo carrega areas via `/api/areas-produto` (EmpresaPage.tsx linhas 301-314). Se a lista esta vazia, e porque nao existem areas cadastradas no banco para a empresa/usuario do validador. O tutorial deveria mencionar que as areas precisam existir antes (UC-F13 cria a hierarquia Area/Classe/Subclasse).

**Acao:** O tutorial deve reordenar a execucao: UC-F13 (Classificacao) deve vir ANTES de UC-F02, ou o seed deve garantir que as areas ja existam. Verificar se o seed do conjunto 2 popula areas_produto.

---

### OBS-13: "Email 'contato@rp3x.com.br' e telefone '(11) 3456-7890' nao foram inseridos por mim"
**Veredicto: PROCEDE PARCIAL — dados pre-existentes**

Esses dados podem ter vindo de:
1. Seed do conjunto 2 (valida2) — os dados de empresas incluem email/telefone default
2. Outro usuario que editou a empresa antes
3. Dados do CRUD generico (Cadastros > Empresa > Dados Cadastrais) que tem campos email/telefone separados do sistema de contatos

O campo `email` e `telefone` da tabela `empresas` sao campos simples (1 valor), diferentes dos contatos multiplos geridos na EmpresaPage (que ficam serializado em `emails` e `celulares`).

**Acao:** Esclarecer no tutorial a diferenca entre os campos de email/telefone basicos da empresa (Cadastros) e os contatos multiplos (Configuracoes > Empresa > Contatos). Idealmente unificar.

---

### OBS-14: "Areas de atuacao aparecem preenchidas com 'diagnostico in vitro', 'reagentes laboratorio' mas nao foram preenchidas por mim"
**Veredicto: PROCEDE PARCIAL — dados pre-existentes do seed**

O campo `areas_atuacao` da empresa pode ter sido preenchido pelo seed ou por processamento automatico de produtos. O seed_data.py contem `areas_atuacao=["diagnostico laboratorial", "equipamentos medicos", "reagentes"]` para a empresa de teste.

**Acao:** Se for dado do seed, e esperado. O tutorial deve mencionar que alguns dados podem ja existir do carregamento inicial.

---

## [UC-F03] Gerir Documentos da Empresa

### OBS-15: "Tentei excluir o documento de 31/03, mas o sistema nao respondeu ao comando"
**Veredicto: PROCEDE — possivel bug de exclusao**

O endpoint de delete existe no crud_routes.py (linhas 1429-1468). A tabela `empresa-documentos` esta em `ADMIN_WRITE_TABLES`, entao o usuario precisa ser admin. Valida2 e super (que implica admin), entao deveria funcionar.

Possiveis causas:
1. O botao de delete nao esta disparando o request corretamente
2. Erro silencioso no frontend (sem mensagem de erro exibida)
3. O documento pode estar referenciado por outra tabela (constraint FK)

**Acao:** Testar a exclusao de documentos manualmente via curl. Verificar se ha erro no console do browser. Verificar logs do backend.

---

### OBS-16: "Badge de cores funciona corretamente"
**Veredicto: CONFIRMADO — funciona**

Arnaldo confirmou que o sistema de badges por validade (verde/amarelo/vermelho) funciona. Documento de 31/03/2026 apareceu em vermelho (vencido).

---

## [UC-F04] Gerir Certidoes Automaticas

### OBS-17: "Ao clicar Buscar Certidoes: ERRO 'Nenhuma fonte de certidao cadastrada'"
**Veredicto: PROCEDE — falta passo no tutorial**

Confirmado no codigo (app.py linha 12590):
```python
if not fontes:
    return jsonify({"error": "Nenhuma fonte de certidão cadastrada. Acesse Cadastros > Empresa > Fontes de Certidões para configurar."}), 400
```

O sistema requer que fontes de certidao sejam cadastradas ANTES de buscar. Existe um endpoint `/api/fontes-certidoes/inicializar` (app.py linha 13013) que cria 5 fontes padrao, mas o tutorial nao instrui o usuario a executar esse passo.

**Acao CRITICA:** Adicionar passo no tutorial antes de UC-F04:
*"Antes de buscar certidoes, va em Cadastros > Empresa > Fontes de Certidoes e inicialize as fontes padrao (ou acesse o sistema e clique no botao 'Inicializar Fontes')."*

Alternativa: o sistema deveria auto-inicializar as fontes quando o usuario tenta buscar pela primeira vez e nao tem nenhuma.

---

### OBS-18: "Nao consegui cadastrar certidao manualmente — nao tenho os dados necessarios (URLs)"
**Veredicto: PROCEDE — tutorial incompleto**

O tutorial diz para buscar certidoes automaticamente e fazer upload manual da PGFN, mas nao fornece instrucoes completas para o cenario onde as fontes nao estao configuradas.

**Acao:** Tutorial deve incluir dados completos para o upload manual (tipo, arquivo, validade, numero) independente das fontes automaticas.

---

## [UC-F05] Gerir Responsaveis da Empresa

### OBS-19: "O tutorial nao informa o CPF da administradora nem do responsavel tecnico"
**Veredicto: PROCEDE — correcao no tutorial**

Confirmado: CPF e campo opcional (nullable=True, nao esta em `required`). Mas o formulario pode exibir o campo CPF e causar confusao se vazio.

**Acao:** Adicionar CPFs ficticios no tutorial para completude:
- Fernanda Lima Costa: `123.456.789-09` (ficticio)
- Dr. Ricardo Alves Nunes: `987.654.321-00` (ficticio)

Ou instruir explicitamente: *"O campo CPF e opcional neste momento."*

---

### OBS-20: "Sistema indica que apenas administradores podem criar este recurso"
**Veredicto: NAO PROCEDE — provavel erro de operacao**

Verificacao no codigo e banco:
- `valida2@valida.com.br` tem `is_super=True` no banco
- Na tabela `usuario_empresa`, valida2 tem `papel=admin` para a empresa RP3X (cca2ea55...)
- O codigo (crud_routes.py linha 1153): `_is_admin = _is_super or papel == 'admin'`
- Com `is_super=True`, `_is_admin` e sempre `True`
- O JWT (app.py linha 948) inclui `is_super=True` no token

**Possiveis causas do erro do Arnaldo:**
1. Token expirado e recriado sem is_super (improvavel)
2. Arnaldo nao selecionou a empresa RP3X antes de tentar criar responsavel
3. Arnaldo usou outro usuario que nao valida2
4. Bug de sessao — token criado no login sem empresa_id, e no fallback a empresa nao foi encontrada

**Acao:** Pedir ao Arnaldo para confirmar se estava logado como valida2 e se havia selecionado a empresa RP3X. Se o erro persistir, verificar o token JWT no browser (DevTools > Application > localStorage/cookies).

---

## [UC-F06] Listar e Filtrar Produtos do Portfolio

### OBS-21: "Busca por 'reagente' nao retorna resultados"
**Veredicto: PROCEDE — bug no filtro OU tutorial com dados incorretos**

**Analise detalhada:**

O filtro de texto no PortfolioPage.tsx (linhas 220-225) busca APENAS em:
- `p.nome` (nome do produto)
- `p.fabricante`
- `p.modelo`

**NAO busca em:** descricao, area, classe, subclasse, categoria.

Os produtos da empresa RP3X no banco:
| Produto | Nome | Fabricante | Modelo |
|---|---|---|---|
| 1 | Kit Glicose Wiener BioGlic-100 | Wiener | None |
| 2 | Kit Hemograma Sysmex XN | Sysmex | None |

Nenhum produto contem "reagente" ou "hematologia" no nome, fabricante ou modelo.

**Duplo problema:**
1. **Dados do seed:** Os nomes dos produtos nao contem os termos que o tutorial manda buscar
2. **Filtro limitado:** O filtro deveria buscar tambem na descricao e na classificacao (area/classe/subclasse)

**Acao (correcao dupla):**
1. **Corrigir seed/tutorial:** Incluir "reagente" no nome ou descricao dos produtos, ex: "Kit Reagente Glicose Wiener BioGlic-100"
2. **Melhorar filtro:** Adicionar busca na descricao e no nome da subclasse/classe:
```javascript
const match = p.nome.toLowerCase().includes(term) ||
  (p.fabricante || "").toLowerCase().includes(term) ||
  (p.modelo || "").toLowerCase().includes(term) ||
  (p.descricao || "").toLowerCase().includes(term);
```

---

### OBS-22: "Busca por 'hematologia' nao retorna resultados"
**Veredicto: PROCEDE — mesmo problema do OBS-21**

O produto "Kit Hemograma Sysmex XN" contem "hemograma" mas nao "hematologia". O tutorial pede buscar "hematologia" mas nenhum produto tem esse termo.

**Acao:** Corrigir o tutorial para buscar "hemograma" (que existe no nome) OU renomear o produto para incluir "hematologia".

---

## Resumo de Acoes

### Correcoes no Tutorial (ALTA prioridade)
| # | UC | Correcao |
|---|---|---|
| 1 | Geral | Explicar navegacao: Configuracoes > Empresa para cadastro completo |
| 2 | Geral | Explicar onde fica "Selecionar Empresa" (Configuracoes) |
| 3 | UC-F04 | Adicionar passo: inicializar fontes de certidoes ANTES de buscar |
| 4 | UC-F05 | Adicionar CPFs ficticios para os responsaveis |
| 5 | UC-F06 | Corrigir termos de busca: "hemograma" em vez de "hematologia", ou ajustar nomes dos produtos |

### Correcoes no Sistema (MEDIA prioridade)
| # | UC | Bug/Melhoria |
|---|---|---|
| 1 | UC-F01 | UF deve ser SelectInput (dropdown) em vez de TextInput |
| 2 | UC-F01 | Adicionar toast "Dados salvos com sucesso" apos salvar empresa |
| 3 | UC-F02 | Mascara de telefone nos inputs |
| 4 | UC-F03 | Verificar/corrigir exclusao de documentos |
| 5 | UC-F06 | Filtro de texto deve incluir descricao na busca |

### Melhorias (BAIXA prioridade)
| # | UC | Sugestao |
|---|---|---|
| 1 | UC-F01 | Auto-preenchimento de endereco por CEP (viaCEP) |
| 2 | UC-F01 | Unificar edicao de empresa (remover duplicidade Cadastros vs Configuracoes) |
| 3 | Geral | Exibir papel do usuario logado (super/admin/operador) |
| 4 | Geral | Corrigir responsividade do Dashboard para notebooks |
| 5 | UC-F02 | Tornar email obrigatorio (contato minimo para licitacoes) |

### Observacoes que NAO procedem
| # | UC | Motivo |
|---|---|---|
| 1 | UC-F02 | "Sem opcao de alterar dados" — botao de edicao existe (Edit2 icon) |
| 2 | UC-F05 | "Apenas administradores" — valida2 e super+admin, provavel erro de operacao |
