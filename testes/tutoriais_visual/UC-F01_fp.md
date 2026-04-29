---
uc_id: UC-F01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F01_visual_fp.yaml
---

# UC-F01 — Cadastrar empresa (Fluxo Principal + FA-07.A) — Trilha Visual

> **PO:** acompanhe a execução. Cada parada é um marco lógico — você decide ✅ Aprovar ou ❌ Reprovar e opcionalmente comenta antes de clicar ▶️ Continuar.
>
> **Cenario B:** super `valida4` sem vinculos entra → cria empresa via FA-07.A (CRUD generico) → seleciona a empresa criada → completa cadastro principal na EmpresaPage. Cobre **CT-F01-FA07-A** e **CT-F01-01**.

## Passo 00 — Login (FA-07 entrada)

O browser vai logar com `valida4@valida.com.br`. Como o super não tem vínculos em `usuario_empresa`, o sistema deve mostrar a tela "Você não tem empresas vinculadas" com 3 botões.

**Observe criticamente:**
- Tela "Você não tem empresas vinculadas" aparece após login (FA-07 entrada)
- 3 botões visíveis: "Criar Nova Empresa" (azul), "Vincular Empresa a Usuário" (roxo), "Entrar no Sistema" (verde)
- Botão "Sair" disponível embaixo
- Subtitulo: "Como superusuário, você pode escolher uma das opções abaixo"

```yaml
id: passo_00_login
acao:
  sequencia:
    - tipo: navigate
      url: "/"
      timeout: 15000
    - tipo: wait_for
      seletor: 'input[type="email"]'
      timeout: 10000
    - tipo: fill
      seletor: 'input[type="email"]'
      valor_from_contexto: "usuario.email"
      timeout: 5000
    - tipo: fill
      seletor: 'input[type="password"]'
      valor_from_contexto: "usuario.senha"
      timeout: 5000
    - tipo: click
      seletor: 'button[type="submit"]'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:has-text("Você não tem empresas vinculadas"), h1:has-text("Sem empresa vinculada")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_00_login"
```

## Passo 01 — Clicar "Criar Nova Empresa" (FA-07.A)

O browser vai clicar no botão "➕ Criar Nova Empresa" para entrar no fluxo de criação via CRUD genérico.

**Observe criticamente:**
- Após clicar, sistema entra no shell autenticado
- Sidebar visível à esquerda
- Tela do CRUD de Empresas aparece com cabeçalho "Empresas"
- Botão "Novo" visível no canto direito superior
- Lista de empresas (pode estar vazia ou ter empresas pré-existentes do banco)

```yaml
id: passo_01_criar_via_fa07a
acao:
  sequencia:
    - tipo: click
      seletor: 'button[data-action="criar-empresa"], button:has-text("Criar Nova Empresa")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button:has-text("Novo")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_01_criar_via_fa07a"
```

## Passo 02 — Clicar [Novo] no CRUD

O browser clica no botão "Novo" do CRUD de Empresas para abrir o formulário de criação.

**Observe criticamente:**
- Card "Novo Empresas" abre (ou similar) com formulário em form-grid-2
- Campos visíveis: CNPJ, Razão Social (obrigatórios com `*`), Nome Fantasia, Inscrição Estadual, Inscrição Municipal, Regime Tributário, Porte, Endereço, Cidade, UF, CEP, Telefone, Email, Áreas de Atuação, Ativo
- Botões "Salvar" (primary) e "Cancelar" no header

```yaml
id: passo_02_clicar_novo
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'label:has-text("CNPJ")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_02_clicar_novo"
```

## Passo 03 — Preencher TODOS os campos do CRUD

O browser preenche todos os campos do formulário do CRUD em sequência: CNPJ, Razão Social, Nome Fantasia, Inscrição Estadual, Inscrição Municipal, Regime Tributário (select), Porte (select), Endereço, Cidade, UF, CEP, Telefone, Email.

**Observe criticamente:**
- Campo CNPJ tem placeholder "00.000.000/0001-00" e máscara
- Asterisco vermelho indica obrigatórios (CNPJ e Razão Social apenas)
- Regime Tributário e Porte são dropdowns (select), não text input
- Aceita todos os valores sem alerta vermelho
- **NÃO há campos** de Website/Instagram/LinkedIn/Facebook neste CRUD — esses só existem na EmpresaPage (preenchidos no passo 08)

```yaml
id: passo_03_preencher_dados_basicos_crud
acao:
  sequencia:
    - tipo: fill
      seletor: 'label:has-text("CNPJ") ~ input.text-input, label:has-text("CNPJ") + input'
      valor_from_dataset: "empresa.cnpj"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("Razão Social") ~ input.text-input, label:has-text("Razão Social") + input'
      valor_from_dataset: "empresa.razao_social"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("Nome Fantasia") ~ input.text-input, label:has-text("Nome Fantasia") + input'
      valor_from_dataset: "empresa.nome_fantasia"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("Inscrição Estadual") ~ input.text-input, label:has-text("Inscrição Estadual") + input'
      valor_from_dataset: "empresa.inscricao_estadual"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("Inscrição Municipal") ~ input.text-input, label:has-text("Inscrição Municipal") + input'
      valor_from_dataset: "empresa.inscricao_municipal"
      timeout: 5000
    - tipo: select
      seletor: 'label:has-text("Regime Tributário") ~ select.select-input, label:has-text("Regime Tributário") + select'
      valor_from_dataset: "empresa.regime_tributario"
      timeout: 5000
    - tipo: select
      seletor: 'label:has-text("Porte") ~ select.select-input, label:has-text("Porte") + select'
      valor_from_dataset: "empresa.porte"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("Endereço") ~ textarea, label:has-text("Endereço") + textarea, label:has-text("Endereço") ~ input.text-input'
      valor_from_dataset: "empresa.endereco"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("Cidade") ~ input.text-input, label:has-text("Cidade") + input'
      valor_from_dataset: "empresa.cidade"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("UF") ~ input.text-input, label:has-text("UF") + input'
      valor_from_dataset: "empresa.uf"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("CEP") ~ input.text-input, label:has-text("CEP") + input'
      valor_from_dataset: "empresa.cep"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("Telefone") ~ input.text-input, label:has-text("Telefone") + input'
      valor_from_dataset: "empresa.telefone"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("Email") ~ input[type="email"], label:has-text("Email") + input'
      valor_from_dataset: "empresa.email"
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_03_preencher_dados_basicos_crud"
```

## Passo 04 — Salvar empresa no CRUD

O browser clica em "Salvar" no CRUD. Backend faz `POST /api/crud/empresas` e empresa é criada.

**Observe criticamente:**
- Botão "Salvar" entra em estado loading (spinner)
- Após retorno OK, o form fecha e a empresa aparece na listagem
- Sem mensagem de erro vermelha
- CNPJ exibido com máscara (formato `XX.XXX.XXX/XXXX-XX`)

```yaml
id: passo_04_salvar_no_crud
acao:
  sequencia:
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button:has-text("Novo")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_04_salvar_no_crud"
```

## Passo 04b — Vincular empresa ao usuário via UI (UC-F18 / FA-07.B)

**Crítico:** após criar empresa via CRUD (passo 04), o usuário ainda **não tem vínculo** em `usuario_empresa`. O sistema continua tratando o user como "sem empresa vinculada" — qualquer rota protegida redireciona pra tela de bloqueio.

Este passo navega para a página **"Associar Empresa / Usuário"** (acessível via sidebar do super) e cria o vínculo manualmente. Implementa **UC-F18 (Vincular empresa a usuário)**, referenciado por UC-F01 via `<<uses>>` UML.

**Observe criticamente:**
- Sidebar tem item "Associar Empresa/Usuario" (só super vê)
- Após clicar, página `/app/admin/associar-empresa` carrega com cabeçalho "Associar Empresa / Usuário"
- Select "Empresa" lista a empresa recém-criada (formato "Razao Social — CNPJ")
- Select "Usuário" lista o usuário corrente (formato "Nome (email)")
- Papel default = Operador
- Após clicar "Vincular", mensagem verde "Vínculo criado/atualizado" aparece
- Tabela "Vínculos Existentes" abaixo mostra o novo vínculo

```yaml
id: passo_04b_vincular_empresa_ao_user
acao:
  sequencia:
    # 1. Expande secao CADASTROS (sidebar) caso esteja colapsada — clique idempotente
    #    NOTE: se ja estiver expandida, este click colapsa; o segundo click reabre.
    #    Pra evitar isso, usa wait_for: se nav-item-label "Associar Empresa" ja existe, pula.
    - tipo: click
      seletor: '.nav-section-label:has-text("Cadastros"), .nav-section-label:has-text("CADASTROS"), button.nav-section-header:has-text("Cadastros"), button.nav-section-header:has-text("CADASTROS")'
      timeout: 10000
    - tipo: wait_for
      seletor: '.nav-item-label:has-text("Associar Empresa")'
      timeout: 5000
    # 2. Clica no item Associar Empresa/Usuario
    - tipo: click
      seletor: '.nav-item-label:has-text("Associar Empresa/Usuario"), .nav-item-label:has-text("Associar Empresa")'
      timeout: 5000
    # 3. Aguarda pagina AssociarEmpresaUsuario carregar
    - tipo: wait_for
      seletor: 'h1:has-text("Associar Empresa")'
      timeout: 10000
    # 4. Seleciona empresa criada (option label = "{razao} — {cnpj}")
    - tipo: select
      seletor: 'label:has-text("Empresa") ~ select, label:has-text("Empresa") + select'
      valor_from_dataset: "empresa.razao_social"
      timeout: 5000
    # 5. Seleciona usuario corrente (option label = "{name} ({email})")
    - tipo: select
      seletor: 'label:has-text("Usuário") ~ select, label:has-text("Usuario") ~ select, label:has-text("Usuário") + select, label:has-text("Usuario") + select'
      valor_from_contexto: "usuario.email"
      timeout: 5000
    # 6. Clica Vincular
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Vincular")'
      timeout: 5000
    # 7. Aguarda mensagem de sucesso (verde)
    - tipo: wait_for
      seletor: 'text=/V[ií]nculo criado/'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_04b_vincular_empresa"
```

## Passo 05 — Re-login para refresh do AuthContext + navegar para EmpresaPage

**Crítico:** o frontend mantém a lista `vinculadas` em `localStorage` que foi populada no passo 0 (login original) — naquele momento o user não tinha empresas vinculadas. Após o vínculo via API no passo 4b, o `localStorage` continua **desatualizado**. Se simplesmente navegarmos para `/app/empresa`, o `RequireEmpresa` do React continua redirecionando para "Sem empresa vinculada" porque consulta `vinculadas` cacheado.

Solução: limpa localStorage e re-loga. O novo login chama `GET /api/auth/minhas-empresas` que retorna o vínculo recém-criado.

**Observe criticamente:**
- Navegação para `/login` limpa estado anterior
- Re-login com mesmas credenciais
- Após login, redirecionamento direto pra EmpresaPage (sem cair em "Sem empresa vinculada")
- URL final: /app/empresa
- Cabeçalho "Dados da Empresa" aparece

```yaml
id: passo_05_selecionar_empresa
acao:
  sequencia:
    - tipo: navigate
      url: "/login"
      timeout: 10000
    - tipo: wait_for
      seletor: 'input[type="email"]'
      timeout: 10000
    - tipo: fill
      seletor: 'input[type="email"]'
      valor_from_contexto: "usuario.email"
      timeout: 5000
    - tipo: fill
      seletor: 'input[type="password"]'
      valor_from_contexto: "usuario.senha"
      timeout: 5000
    - tipo: click
      seletor: 'button[type="submit"]'
      timeout: 5000
    - tipo: wait
      valor_literal: 2000
    - tipo: navigate
      url: "/app/empresa"
      timeout: 10000
    - tipo: wait_for
      seletor: 'h1:has-text("Dados da Empresa"), h2:has-text("Dados da Empresa")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_05_selecionar_empresa"
```

## Passo 06 — Confirmar EmpresaPage carregada

A EmpresaPage ja foi alcancada no passo 5. Este passo apenas confirma visualmente os elementos esperados.

**Observe criticamente:**
- Cabecalho exibe titulo "Dados da Empresa"
- Card "Informacoes Cadastrais" carregado com Razao e CNPJ ja preenchidos (vieram do CRUD)
- Form com 4 secoes: Dados Basicos, Presenca Digital, Endereco, Emails/Telefones

```yaml
id: passo_06_navegar_empresa_page
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'label:has-text("Razão Social"), label:has-text("Razao Social")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_06_navegar_empresa_page"
```

## Passo 07 — Verificar dados já preenchidos do CRUD (validação)

Os dados básicos (CNPJ, Razão, Nome Fantasia, IE, IM, Endereço, Cidade, UF, CEP, Telefone, Email) já vieram do CRUD criado no passo 04. A EmpresaPage carrega esses dados via `crudList("empresas", { limit: 1 })`.

**Observe criticamente:**
- Razão Social, CNPJ, Nome Fantasia, IE preenchidos automaticamente
- UF mostrado como dropdown com SP selecionado (V5 correção FE-05)
- Endereço, Cidade, CEP preenchidos
- Asterisco vermelho só em Razão Social e CNPJ
- Sem alerta de erro de carregamento

```yaml
id: passo_07_verificar_dados_carregados
acao:
  tipo: wait_for
  seletor: 'label:has-text("Razao Social")'
  timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_07_completar_dados_basicos"
```

## Passo 08 — Preencher Presença Digital (Website + redes sociais)

O browser preenche os 4 campos de redes sociais: Website, Instagram, LinkedIn, Facebook. **Estes 4 campos NÃO existem no CRUD** — só estão na EmpresaPage. É a única razão de termos vindo até aqui depois de criar via CRUD.

**Observe criticamente:**
- Prefixo "@" aparece à esquerda do campo Instagram
- Campo Website tem validação tipo URL (sem rejeitar enquanto digita)
- Todos os 4 campos opcionais (sem asterisco)
- Estes campos estão vazios (vieram nulos do registro CRUD)

```yaml
id: passo_08_completar_presenca_digital
acao:
  sequencia:
    - tipo: fill
      seletor: 'label:has-text("Website") ~ div input.text-input'
      valor_from_dataset: "empresa.website"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("Instagram") ~ div input.text-input'
      valor_from_dataset: "empresa.instagram"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("LinkedIn") ~ div input.text-input'
      valor_from_dataset: "empresa.linkedin"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("Facebook") ~ div input.text-input'
      valor_from_dataset: "empresa.facebook"
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_08_completar_presenca_digital"
```

## Passo 09 — Salvar Alterações e confirmar feedback

O browser clica em "Salvar Alterações" na EmpresaPage. Backend faz POST/PUT e indicador "Salvo!" verde deve aparecer.

**Observe criticamente:** (V5 correção crítica — FE-06)
- Botão "Salvar Alteracoes" visível com cor de destaque (variant primary)
- Após clique, botão entra em estado loading
- Indicador **"Salvo!" em verde** aparece ao lado do botão
- Sem mensagem vermelha de erro
- Sem botão "Tentar novamente"

```yaml
id: passo_09_salvar_e_confirmar
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Salvar Alteracoes"), button:has-text("Salvar Alterações")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Salvo!'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_10_salvar_e_confirmar"
```

