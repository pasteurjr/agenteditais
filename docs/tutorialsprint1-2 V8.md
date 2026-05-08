# Tutorial de Validação Manual — Sprint 1 — Conjunto 2 V8
# Empresa: Bio-Hosp Equipamentos Hospitalares Ltda.

**Data:** 08/05/2026 (V8)
**Dados:** dadosempportpar-2 V3.md
**Referência:** CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V2.md
**UCs:** F01–F17 (17 casos de uso)
**Público:** Dono do Produto / Validador de Negócio (sem conhecimento técnico necessário)

> **CHANGELOG V8 (vs V7) — corpo do tutorial atualizado com as 25 correções (08/05/2026)**
>
> V7 (06/05) introduziu o CHANGELOG no topo descrevendo as 25 correções, mas o passo a passo dos UCs continuava igual ao V6. **V8 reescreve cirurgicamente cada passo afetado** para refletir a UI real do produto após as correções, validadas em rodada V11 (08/05 13:35–13:41) com 45/45 passos APROVADO automatico.
>
> **O que mudou em V8 vs V7:**
> - UC-F01 Passo 2 — campos CNPJ* e IE* marcados como obrigatórios (asterisco vermelho).
> - UC-F01 Passo 4 — endereço com **7 campos estruturados** (CEP, Logradouro, Número, Complemento, Bairro, Cidade, UF).
> - UC-F01 — novo Passo 6: confirmar CNPJ disabled após Save.
> - UC-F01 — nova "Verificações visuais V8" no início (cursor pointer + sidebar localStorage + vincular sem re-login).
> - UC-F03 — badges agora distinguem 4 estados (OK/Vence/Vencido/Falta envio) com cores específicas.
> - UC-F04 — notas sobre filtro UF, coluna Fonte, botões individuais, tooltips, magic bytes, prevalência PDF.
> - UC-F05 — submenu renomeado + 3 campos novos (Validade mandato, Documento outorga, Caminho PDF).
> - UC-F13 — passo de validação de duplicatas (rejeição com mensagem amigável).
> - UC-F02/F06+ — passo dedicado ao Upload em Massa por IA (Cadastro por IA do Portfolio).
> - Aceite IA + auditoria (F03-03) — nota transversal nos UCs com extração automática.
>
> **Mapa Obs Arnaldo → seção do tutorial:**
> | Obs | Onde aparece em V8 |
> |---|---|
> | F01-01, F01-06 | Verificações iniciais + UC-F01 nota |
> | F01-02 | UC-F01 Passo 2 (tabela campos) |
> | F01-03 | Verificações iniciais V8 |
> | F01-04 | UC-F01 Passo 6 (NOVO) |
> | F01-05 | UC-F01 Verificações iniciais V8 |
> | F01-07 | UC-F01 Passo 4 (reescrito) |
> | F01-08 | Verificações iniciais V8 |
> | F02-01 | Antes de UC-F02 (já em V7) |
> | F02-02 | Verificações iniciais V8 |
> | F02-03 | Novo passo após UC-F06 |
> | F03-01 | UC-F03 Passos 2-5 (atualizado) |
> | F03-02 | UC-F03 nota inicial |
> | F03-03 | Notas transversais UC-F03 + UC-F06+ |
> | F04-01 | UC-F04 Passo 0 |
> | F04-02 | UC-F04 nota form Novo Fonte |
> | F04-03 | UC-F04 nota lista certidões |
> | F04-04 | UC-F04 nota botões individuais |
> | F04-05 | UC-F04 nota tooltips |
> | F04-06 | UC-F04 nota upload manual |
> | F04-07 | UC-F04 nota upload manual |
> | F04-08 | Invisível ao tester (apenas validação automática via banco) |
> | F05-01 | UC-F05 cabeçalho + Passo 1 |
> | F05-02, F05-03 | UC-F05 tabelas de campos (Passos 2-3) |
> | F13-01 | UC-F13 novo passo |

> **CHANGELOG V6 (vs V5) — corrige bug grave de especificações + ordem dos UCs:**
>
> - **ORDEM DOS UCs REORGANIZADA (V6):** UC-F13 (Áreas/Classes/Subclasses + Máscara de Campos) movido para **antes do UC-F06**. Nas versões V3/V4/V5, o tutorial seguia ordem numérica (F06 antes de F13), mas F06–F12 dependem da hierarquia + máscara cadastradas em F13. Validador deve seguir a ordem do índice (F01-F05-F13-F06-F07-...), não a numérica.
> - **UC-F13 PARTE 4 (NOVO):** cadastro de **Máscara de Campos** das subclasses (`campos_mascara`).
>   Define previamente quais especificações cada subclasse exige. Sem esta etapa, ao cadastrar um produto não há orientação dos campos esperados — Arnaldo procurou esta funcionalidade na Sprint 1 e não encontrou no tutorial. Caminho: **Cadastros → Portfolio → Subclasses → editar subclasse → campo "Máscara de Campos"**.
> - **UC-F08 Passo 5 reescrito:** as 8 especificações listadas em V3/V4/V5 eram de **kit reagente bioquímico de glicose** (Método GOD-PAP, Comprimento de Onda 505 nm, Linearidade 0–500 mg/dL) num produto que é **Monitor Multiparâmetro** — semanticamente absurdo. V6 corrige com 8 specs derivadas da máscara da subclasse "Monitor Multiparâmetro" (Tela, Parâmetros, Tipo de Paciente, Bateria, Peso, Alimentação, Classe ANVISA, Registro ANVISA).
>
> **CHANGELOG V5 (mantido):**
>
> - UC-F04 Passo 0.5 reformulado: as 3 fontes a cadastrar agora são **as que faltam para os editais reais das próximas sprints (Sprints 2-9)**:
>   1. **PGFN — Dívida Ativa da União** (URL específica do REGULARIZE) — fonte principal complementar à CND Federal conjunta RFB+PGFN
>   2. **CND Municipal de Itamarandiba/MG** — exigida pelo edital de teste `0031/2026 - MUNICIPIO DE ITAMARANDIBA`
>   3. **Junta Comercial de MG (JUCEMG)** — exigida em editais que pedem "Certidão Simplificada da Junta Comercial"
> - Esclarecimento técnico: a **CND Federal pré-cadastrada** (RFB/PGFN conjunta) é a **fonte oficial principal** desde a Portaria MF 358/2014. PGFN isolada é **complemento** para validar a integração separada.
>
> **CHANGELOG V4 (mantido):**
>
> - UC-F01: corrigidas 5 ocorrências erradas de `SP` para `MG` (cidade Belo Horizonte/MG)
> - UC-F01: nova orientação para usar **Configurações → Empresa** após primeiro login
> - UC-F01: aviso sobre formulário pré-populado com dados de outra empresa (clicar **+ Nova empresa** primeiro)
> - UC-F03: 8 novos tipos de documento expostos no dropdown (AFE ANVISA, ISO via Outro, Certidão Negativa Estadual etc.) — UI corrigida
> - UC-F03: orientação sobre badge de vencimento (verde/amarelo/vermelho) acionado pela `data_vencimento`
> - UC-F03: caminhos de PDF revisados — usar arquivos da pasta `docs/documentos_sintetizados` enviada pelo Pasteur
> - UC-F04: removido passo "Inicializar Fontes Padrão" (botão não existia); listadas as 9 fontes reais
> - UC-F04: adicionado **Passo 0.5 (opcional)** — CRUD de Fontes de Certidões (Cadastros → Fontes de Certidões). Cadastra 3 fontes específicas para Bio-Hosp/MG: **PGFN** (Federal), **SEFAZ-MG SOL** (Estadual), **Prefeitura de Contagem** (Municipal vizinha de BH). Mais cenários de desativar/reativar.
> - UC-F06: explicitado empty state esperado quando portfólio ainda não tem produtos
> - UC-F07: campo NCM com máscara automática (digite só os 8 dígitos, pontos aparecem sozinhos)
> - UC-F07: aviso para usar upload IA em produto **NOVO**, não em produto recém criado manualmente
> - UC-F11: incluído cenário negativo (remover 1 campo → completude < 100%)
> - UC-F12: clarificado que CATMAT/CATSER/termos de busca são gerados pela IA e não editáveis manualmente
> - UC-F15: campos R$ aceitam ponto e vírgula (máscara monetária livre); toast verde fixo aparece após salvar
> - UC-F16: orientação para identificar duplicidade de fontes "ComprasNet" no banco (afeta o teste de desativação)
> - UC-F17: salvamento agora é persistido e recarregado corretamente (e-mail/canais/tema/idioma/fuso)

---

> **Como usar este tutorial**
>
> Siga cada passo na ordem indicada. Os dados a inserir estão destacados em `código`. As verificações ao final de cada UC dizem exatamente o que deve estar na tela para confirmar que o sistema funcionou corretamente. Quando algo não está como esperado, a seção "Sinais de problema" orienta o que reportar.

---

## Credenciais e Fluxo de Acesso

| Campo | Valor |
|---|---|
| Usuário (Conjunto 2 V3) | validaarnaldo@valida.com.br |
| Senha | 123456 |
| Perfil | Superusuário |
| Empresa alvo | Bio-Hosp Equipamentos Hospitalares Ltda. |

### Pré-requisito — Vincular validaarnaldo (super) à empresa Bio-Hosp

Este passo deve ser feito UMA VEZ antes de iniciar os UCs:

**Procedimento (você é super, faz tudo sozinho):**
1. Login com `(não usado neste V3 — validador é super)` / `123456`
2. Menu lateral → "Associar Empresa/Usuario"
3. Selecionar empresa: Bio-Hosp Equipamentos Hospitalares Ltda.
4. Selecionar usuário: validaarnaldo@valida.com.br
5. Papel: admin → clicar "Vincular"

**Opção B — validaarnaldo cria a empresa diretamente:**
1. Login com `validaarnaldo@valida.com.br` / `123456`
2. Ao ver a tela de seleção de empresa, a Bio-Hosp ainda não existe — selecionar qualquer empresa ou criar nova
3. Menu Empresa → preencher dados da Bio-Hosp conforme UC-F01 → salvar
4. A empresa fica associada automaticamente a validaarnaldo

### Fluxo de login (após associação)
1. Acessar `http://pasteurjr.servehttp.com:5179`
2. Email: `validaarnaldo@valida.com.br` / Senha: `123456`
3. Tela de seleção de empresa → clicar "Bio-Hosp Equipamentos Hospitalares Ltda."
4. Dashboard carrega com Bio-Hosp como empresa ativa

### Menus extras visíveis (superusuário)
- **Usuarios** — CRUD de usuários
- **Associar Empresa/Usuario** — vincular usuários a empresas
- **Selecionar Empresa** — trocar empresa ativa

> Esses menus não aparecem para usuários normais (super=False). O tutorial a seguir assume que a empresa Bio-Hosp já está associada a validaarnaldo.

---

## Pré-requisito CRÍTICO — Vinculação usuário↔empresa após criação (UC-F18)

Se o usuário for criado sem vínculo prévio em `usuario_empresa`, ao logar ele cai em **"Você não tem empresas vinculadas"**. Após criar empresa via FA-07.A (CRUD), o vínculo NÃO é criado automaticamente — empresa fica órfã. Acessar `/app/empresa` redireciona de volta pra tela de bloqueio.

**Solução: executar FA-07.B (Vincular Empresa a Usuário) imediatamente após criar empresa.**



**Implementa UC-F18 (Vincular empresa a usuário)** — UC autônomo da Sprint 1, referenciado por UC-F01 via `<<uses>>` UML. Pós-condição: registro ativo em `usuario_empresa` permite ao user acessar rotas protegidas em sessões futuras.

### Pré-requisito CRÍTICO — Selecionar empresa ativa para a sessão

**Vincular ≠ Selecionar.** Após criar o registro `usuario_empresa` (passo anterior), é necessário **definir a empresa ativa** na sessão. Sem isso, o frontend continua sem contexto de empresa e pode redirecionar para "Sem empresa vinculada" mesmo com o vínculo já criado.

Caminho: **Configurações → Selecionar Empresa → clicar no card da empresa**.


**Endpoint:** `AuthContext.selecionarEmpresa(id)` atualiza JWT com `empresa_id`, salva em localStorage, re-renderiza shell. Top-bar passa a mostrar a empresa ativa.

### Dicas de navegação

- Para cadastro completo da empresa (incluindo redes sociais e endereço), acesse **Configurações > Empresa**
- Para selecionar a empresa, acesse **Configurações > Selecionar Empresa** e escolha 'Bio-Hosp Equipamentos Hospitalares Ltda.'

---

## Índice

> **⚠ ORDEM DE EXECUÇÃO (V6) — siga esta sequência:** O índice abaixo está **ordenado por dependência**, não pelo número canônico. UC-F13 (Áreas/Classes/Subclasses + Máscara de Campos) foi movido para **antes do UC-F06** porque os UCs F06–F12 (Portfólio, Cadastro/Edição de Produto) dependem da hierarquia e da máscara cadastrada em F13.

- [UC-F01 — Manter Cadastro Principal da Empresa](#uc-f01--manter-cadastro-principal-da-empresa)
- [UC-F02 — Gerir Contatos e Área Padrão](#uc-f02--gerir-contatos-e-área-padrão)
- [UC-F03 — Gerir Documentos da Empresa](#uc-f03--gerir-documentos-da-empresa)
- [UC-F04 — Gerir Certidões Automáticas](#uc-f04--gerir-certidões-automáticas)
- [UC-F05 — Gerir Responsáveis da Empresa](#uc-f05--gerir-responsáveis-da-empresa)
- **[UC-F13 — Gerir Classificação Área/Classe/Subclasse + Máscara de Campos](#uc-f13--gerir-e-consultar-classificação-áreaclassesubclasse)** — **EXECUTAR ANTES DO F06**
- [UC-F06 — Listar e Filtrar Produtos do Portfólio](#uc-f06--listar-e-filtrar-produtos-do-portfólio)
- [UC-F07 — Cadastrar Produto por IA](#uc-f07--cadastrar-produto-por-ia)
- [UC-F08 — Editar Produto do Portfólio](#uc-f08--editar-produto-do-portfólio)
- [UC-F09 — Reprocessar IA no Produto](#uc-f09--reprocessar-ia-no-produto)
- [UC-F10 — Busca ANVISA e Busca Web](#uc-f10--busca-anvisa-e-busca-web)
- [UC-F11 — Verificar Completude do Produto](#uc-f11--verificar-completude-do-produto)
- [UC-F12 — Visualizar Metadados de Captação](#uc-f12--visualizar-metadados-de-captação)
- [UC-F14 — Configurar Pesos e Limiares de Score](#uc-f14--configurar-pesos-e-limiares-de-score)
- [UC-F15 — Configurar Parâmetros Comerciais](#uc-f15--configurar-parâmetros-comerciais)
- [UC-F16 — Gerir Fontes de Busca e Palavras-Chave](#uc-f16--gerir-fontes-de-busca-e-palavras-chave)
- [UC-F17 — Configurar Notificações e Preferências](#uc-f17--configurar-notificações-e-preferências)
- [Resumo de Verificações por UC](#resumo-de-verificações-por-uc)
- [O que reportar se algo falhar](#o-que-reportar-se-algo-falhar)

---

## ✅ Verificações visuais V8 — antes de começar (transversais)

Antes de iniciar os UCs, faça estas 4 verificações que valem para todas as telas do sistema:

### 1. Cursor "mãozinha" (F02-02)
Passe o mouse sobre qualquer botão azul ou roxo da tela inicial — o cursor deve virar **mãozinha** (pointer). Botões cinza-claro **desabilitados** ficam com cursor "proibido" (not-allowed).
✅ **Correto se:** botões ativos = mãozinha; botões disabled = proibido.
❌ **Problema se:** botão ativo fica com cursor de seta (default).

### 2. Sidebar lembra preferência (F01-08)
1. Click em "CONFIGURACOES" na sidebar para expandir.
2. Click em "CADASTROS" para expandir.
3. Pressione **F5** (recarregar a página).

✅ **Correto se:** Após F5, **as 2 seções continuam abertas** — o sistema lembra a preferência.
❌ **Problema se:** Sidebar volta toda fechada após F5.

> **Como funciona:** O sistema salva no navegador (localStorage chave `facilicita_sidebar_sections_v1`) quais seções você deixou abertas. Próximo carregamento, restaura.

### 3. Vincular empresa sem re-login (F01-03)
Caso você precise vincular uma empresa nova a um usuário (Cadastros > Associar Empresa/Usuario), **não precisa fazer logout** para a empresa nova aparecer na lista do usuário-alvo. A lista atualiza automaticamente.

### 4. Sidebar "Configurações" com 4 itens curtos (F01-05)
Click em CONFIGURACOES e confira que aparecem exatamente os 4 itens com nomes curtos:
- **Empresa**
- **Portfolio**
- **Parametrizacoes**
- **Selecionar Empresa**

✅ **Correto se:** os 4 nomes estão lá, sem texto entre parênteses ou descrições longas.
❌ **Problema se:** algum item está com nome alterado ou faltando.

---

## [UC-F01] Manter Cadastro Principal da Empresa

> **O que este caso de uso faz:** Aqui você vai preencher o cartão de identidade da empresa no sistema. Essas informações são a base de tudo: nome, CNPJ, endereço e presença digital. Sem esses dados, o sistema não sabe para quem está trabalhando. É como abrir uma ficha cadastral em um cartório — precisa ser feito uma vez, com cuidado, e fica como referência para todos os outros processos.

> **V8 — Upload por IA já disponível (F01-01, F01-06):** se a empresa AINDA NÃO está cadastrada, ao acessar essa tela aparece o card **"Cadastro Automático por IA — envie contrato social"**. Você pode arrastar o contrato social em PDF e a IA extrai os dados — você revisa e salva. Para esse tutorial, vamos preencher manualmente para validar o fluxo tradicional. O fluxo IA é validado nos UCs UC-ARN-01/06 (Sprint 10).

**Onde:** Menu lateral → Configurações → Empresa
**Quanto tempo leva:** 5 a 10 minutos

---

### Antes de começar

- Certifique-se de estar logado no sistema. Você deve ver o menu lateral visível com as opções de navegação.
- Tenha em mãos os dados da empresa (eles estão listados neste tutorial — não precisa buscar em outro lugar).
- Se já existir um cadastro anterior de outra empresa (por exemplo, do Conjunto 1), o formulário pode já estar preenchido. Nesse caso, simplesmente apague os valores e insira os da Bio-Hosp.

---

### Passo 1 — Navegar até a página de Empresa

> **Nota de acesso:** Ao entrar no sistema com `validaarnaldo@valida.com.br`, a tela de seleção de empresa aparece primeiro. Selecione "Bio-Hosp Equipamentos Hospitalares Ltda." antes de seguir os passos abaixo.

**O que fazer:** No menu lateral à esquerda da tela, localize e clique na opção "Empresa" ou "Cadastro". Isso vai abrir a tela principal de cadastro da empresa.

**O que você vai ver na tela:** Uma página com um formulário dividido em seções (Dados Principais, Redes Sociais, Endereço, etc.). Os campos podem estar em branco ou com dados de outro teste anterior.

**O que acontece depois:** A tela de cadastro da empresa é exibida completamente. Se houver dados anteriores, eles estarão visíveis nos campos.

✅ **Correto se:** A tela de cadastro carregou e você consegue ver campos de texto para preencher.
❌ **Problema se:** A tela exibe uma mensagem de erro, fica em carregamento infinito, ou redireciona para outra página.

---

### Passo 2 — Preencher os dados principais de identificação

**O que fazer:** Preencha os campos da seção "Informações Cadastrais", um a um, com as informações abaixo.

**O que você vai ver na tela (V8):** Campos de texto em branco (ou com dados anteriores). Os **campos obrigatórios têm asterisco vermelho `*`** ao lado do nome. Confira:

- **Razão Social\*** (obrigatório)
- **CNPJ\*** (obrigatório, com hint "(não editável após cadastro)")
- **Inscrição Estadual\*** (V8: agora obrigatório — antes era opcional)
- Nome Fantasia (opcional)
- Website (opcional)

**Dados a informar:**

| Campo | Valor |
|---|---|
| Razão Social * | `Bio-Hosp Equipamentos Hospitalares Ltda.` |
| Nome Fantasia | `Bio-Hosp` |
| CNPJ * | `33.014.556/0001-96` |
| Inscrição Estadual * (V8) | `062.118.443.0078` |
| Website | `https://biohosp.com.br` |

📌 **Atenção V8:**
- O campo CNPJ aceita máscara automática — digite só números.
- Inscrição Estadual (IE) ficou **obrigatória** (asterisco vermelho). Se a empresa for isenta de IE, digite literalmente `ISENTO`.

**O que acontece depois:** Conforme você preenche, os campos ficam com os valores inseridos. Nenhuma mensagem aparece ainda — o sistema só confirma quando você clicar em Salvar.

✅ **Correto se:**
- Todos os campos com `*` estão preenchidos.
- Os 3 campos obrigatórios (Razão Social, CNPJ, IE) têm asterisco visualmente **vermelho** (não cinza).
- Nenhuma mensagem de erro de formato.

❌ **Problema se:**
- Campo IE não tem asterisco (F01-02 não aplicada).
- CNPJ exibe "formato inválido" após você digitar 14 dígitos válidos.
- Asterisco aparece em campos opcionais (Nome Fantasia, Website).

---

### Passo 3 — Preencher as redes sociais

**O que fazer:** Localize a seção de Redes Sociais (pode estar logo abaixo dos dados principais ou em uma aba separada chamada "Redes Sociais" ou "Mídias Digitais"). Preencha os campos disponíveis.

**O que você vai ver na tela:** Campos para Instagram, LinkedIn e Facebook (podem haver outros). Todos devem estar em branco inicialmente.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Instagram | `@biohospequipamentos` |
| LinkedIn | `bio-hosp-equipamentos` |
| Facebook | (deixar em branco — campo opcional) |

📌 **Atenção:** O Facebook deve ficar **vazio intencionalmente**. Este é um campo opcional e queremos confirmar que o sistema salva corretamente mesmo com ele em branco. Não invente um valor aqui.

**O que acontece depois:** Os campos preenchidos ficam com os valores inseridos. O campo Facebook permanece vazio.

✅ **Correto se:** Instagram e LinkedIn preenchidos; Facebook vazio sem nenhuma mensagem de erro obrigatório.
❌ **Problema se:** O sistema exige preenchimento do Facebook e não permite salvar sem ele.

---

### Passo 4 — Preencher o endereço (7 campos estruturados — V8/F01-07)

**O que fazer:** Localize a seção **Endereço** (logo abaixo de "Presença Digital"). Preencha pelo CEP — os outros campos são preenchidos automaticamente pelo sistema (via ViaCEP).

**O que você vai ver na tela (V8):** Endereço **estruturado em 7 campos separados**. Antes (V6) era só "Logradouro" + Cidade + UF + CEP. V8 quebrou em:

| Campo | Tipo | Como preenche |
|---|---|---|
| **CEP** | input | Você digita; ao sair do campo, sistema busca via ViaCEP e preenche os 4 campos abaixo automaticamente |
| **Logradouro (Rua/Avenida)** | input | Auto-preenchido pelo CEP — você pode editar se necessário |
| **Número** | input | **Manual** — não vem do CEP (cada caso é único) |
| **Complemento (opcional)** | input | Manual — Sala, Andar, Bloco, etc |
| **Bairro** | input | Auto-preenchido pelo CEP |
| **Cidade** | input | Auto-preenchido pelo CEP |
| **UF** | dropdown | Auto-preenchido pelo CEP |

**Dados a informar:**

| Campo | Valor |
|---|---|
| CEP | `30380-457` (digite e aguarde os outros preencherem) |
| Logradouro | `Avenida Raja Gabaglia` (auto-preenchido pelo CEP) |
| Número | `1781` |
| Complemento | `Sala 304` |
| Bairro | `Estoril` (auto-preenchido) |
| Cidade | `Belo Horizonte` (auto-preenchido) |
| UF | `MG` (auto-preenchido) |

📌 **Atenção V8:**
- Acima do CEP aparece o hint: *"CEP — digite e os campos abaixo são preenchidos automaticamente"*.
- Se ViaCEP não conseguir resolver o CEP (raro), você pode preencher manualmente os 7 campos.
- Os campos `endereco_numero`, `endereco_complemento` e `bairro` são novidade V8 (Migration 051) — antes ficavam concatenados num único "Logradouro".

**O que acontece depois:** Os 7 campos do endereço estão preenchidos. Visualmente o formulário está em duas linhas (Logradouro/Número/Complemento numa, Bairro/Cidade/UF noutra) — depende do tamanho da tela.

✅ **Correto se:**
- Após digitar o CEP, Logradouro/Bairro/Cidade/UF preenchem sozinhos.
- Os 7 campos estão visíveis como inputs separados (não um campo enorme único).
- Você consegue editar **Número** e **Complemento** independentemente.

❌ **Problema se:**
- CEP digitado não dispara preenchimento automático (defeito ViaCEP integration).
- Falta algum dos 4 novos campos (Número, Complemento, Bairro, ou estão fundidos).
- Número/Complemento ficam grudados no Logradouro como texto livre.

---

### Passo 5 — Salvar o cadastro

**O que fazer:** Após preencher todos os campos acima, localize o botão de salvar — geralmente chamado "Salvar", "Salvar Alterações" ou "Confirmar". Ele costuma estar no final do formulário ou no topo da página. Clique nele.

**O que você vai ver na tela:** O formulário completamente preenchido com todos os dados da Bio-Hosp Equipamentos Hospitalares Ltda.

**O que acontece depois:** O sistema processa as informações e exibe uma mensagem de confirmação (geralmente um aviso verde no canto superior direito ou inferior da tela, chamado "toast"). A mensagem pode dizer algo como "Dados salvos com sucesso" ou "Empresa atualizada".

✅ **Correto se:** Uma mensagem verde de confirmação aparece na tela. Os dados continuam visíveis no formulário após salvar.
❌ **Problema se:** Uma mensagem vermelha de erro aparece, ou a tela fica em branco, ou os dados somem após clicar em Salvar.

---

### Passo 5.5 — Reabrir a empresa para conferir e completar (NOVO em V4)

> **V4 — Passo crítico após salvar:** o save inicial pode não persistir TODOS os campos visíveis (a depender do estado de carregamento da página). Para garantir que os dados completos foram salvos, **siga os sub-passos abaixo**.

**O que fazer:**

1. Após o Passo 5 (Salvar), aguarde a mensagem verde de confirmação.
2. **Recarregue a página (F5)** ou navegue para outra tela e volte para **Configurações → Empresa**.
3. Confirme que o formulário voltou com **todos** os campos preenchidos (CNPJ, razão social, redes sociais, endereço completo).
4. Se algum campo voltou vazio, **preencha novamente** e clique em Salvar.
5. Verifique também a presença da empresa selecionada na top-bar (canto superior do sistema). Se a top-bar mostrar "Sem empresa" ou nome de outra empresa, vá em **Configurações → Selecionar Empresa** e clique no card da Bio-Hosp.

**O que acontece depois:** todos os dados estão consistentes na sessão e persistidos no banco.

✅ **Correto se:** Após F5 todos os campos voltam preenchidos E a top-bar mostra "Bio-Hosp Equipamentos Hospitalares Ltda.".
❌ **Problema se:** Algum campo volta vazio após F5 (defeito de persistência) OU top-bar mostra empresa errada.

---

### Passo 6 — V8: Confirmar que CNPJ ficou READ-ONLY após salvar (F01-04)

**O que fazer:**
1. Após o F5 do Passo 5.5, role a página até a seção "Informações Cadastrais".
2. Click no campo **CNPJ** (tente posicionar o cursor dentro).
3. Tente digitar qualquer caractere.

**O que você vai ver na tela (V8):**
- O rótulo do campo agora diz: **"CNPJ (não editável após cadastro)\*"**
- O input do CNPJ está **esmaecido (cinza)** — visualmente diferente dos outros campos editáveis.
- Cursor sobre o campo **NÃO** vira "I-beam" (texto editável).
- Logo abaixo do campo aparece o aviso explicativo:
  > *"CNPJ é a chave fiscal da empresa e não pode ser alterado. Para cadastrar outra empresa, use 'Selecionar Empresa → Nova Empresa'."*
- Outros campos (Nome Fantasia, IE) continuam editáveis normalmente.

✅ **Correto se:**
- Você não consegue digitar nada no campo CNPJ.
- O hint explicativo abaixo do campo está visível.
- O rótulo tem "(não editável após cadastro)".
- Outros campos ainda permitem edição.

❌ **Problema se:**
- Você consegue editar o CNPJ.
- O hint explicativo não aparece.
- Outros campos também ficaram disabled (não deveriam).

> **Por que essa correção:** o CNPJ é a chave fiscal da empresa — se ele puder ser alterado, perde-se o vínculo histórico (recibos, contratos, certidões emitidas com aquele CNPJ). A correção F01-04 garante que após o primeiro Save, o CNPJ vira read-only.

---

### ✅ Resultado Final

**O que o validador deve conferir (V8):**
- A razão social `Bio-Hosp Equipamentos Hospitalares Ltda.` está exibida no formulário
- O CNPJ `33.014.556/0001-96` está formatado corretamente — e **disabled após Save** (F01-04)
- Inscrição Estadual `062.118.443.0078` está preenchida e tem **asterisco vermelho** no rótulo (F01-02)
- Instagram e LinkedIn preenchidos; Facebook em branco (sem erro)
- **Endereço com 7 campos preenchidos** (CEP, Logradouro, Número, Complemento, Bairro, Cidade, UF) (F01-07)
- Uma mensagem verde de "salvo com sucesso" foi exibida
- Após F5, todos os campos persistem (V4)
- Top-bar do sistema mostra Bio-Hosp como empresa ativa
- Na sidebar Configurações aparecem 4 itens curtos (F01-05)

**🔴 Sinais de problema:**
- Mensagem vermelha de erro ao tentar salvar
- O sistema exige o Facebook obrigatoriamente
- Os dados desaparecem após salvar (não persistem)
- O CNPJ não aceita o formato com pontos e barra
- Após F5 algum campo volta vazio (defeito de persistência)
- IE não tem asterisco vermelho (F01-02 não aplicada)
- Endereço aparece como campo único concatenado (F01-07 não aplicada)
- CNPJ continua editável após Save (F01-04 não aplicada)

---

## [UC-F02] Gerir Contatos e Área Padrão

> **O que este caso de uso faz:** Aqui você cadastra os meios de contato da empresa (emails e telefones) e define qual é a área de atuação principal. Esses dados são usados pelo sistema para enviar notificações de editais encontrados e para filtrar oportunidades relevantes. Pense nisso como a "agenda de contatos" e o "cartão de especialidade" da empresa.

**Onde:** Menu lateral → Empresa → Contatos (ou aba Contatos dentro da página da Empresa)
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de começar

- O cadastro principal da empresa (UC-F01) deve estar salvo. Se ainda não fez, volte ao UC-F01.
- Tenha os emails e telefones prontos — eles estão listados abaixo.

> **🔄 Nota V7 sobre ordem dos UCs (F02-01):**
> Na revisão da V6, foi observado que pedagogicamente seria mais natural completar **todo o cadastro da empresa** (Documentos UC-F03, Certidões UC-F04, Responsáveis UC-F05) **antes** de mexer com áreas/portfólio (UC-F02 área padrão, UC-F13 hierarquia, F06+ produtos).
>
> **Por que mantemos a ordem atual (F01 → F13 → F02 → F03 → F04 → F05 → F06+):**
> 1. **UC-F02 precisa de UC-F13:** o campo "Área Padrão" do contato é um dropdown que lista as áreas cadastradas em UC-F13. Se F13 não existe ainda, o dropdown fica vazio.
> 2. **UC-F06+ (produtos) precisa de UC-F13:** filtros e cadastro de produto pedem Área/Classe/Subclasse.
> 3. **F03/F04/F05 podem rodar em qualquer ordem** depois de F01 — não há dependência forte.
>
> **Em uma versão futura do produto**, a Área Padrão será movida para o menu **Configurações** (não é dado estrutural — é preferência), permitindo cadastrar empresa/documentos/certidões/responsáveis em fluxo linear, e só depois portfólio. Por ora, siga a ordem do índice.

---

### Passo 1 — Navegar até a seção de Contatos

**O que fazer:** Na página da Empresa, procure a aba ou seção chamada "Contatos". Pode estar como uma aba no topo da página ou como um item no menu lateral sob "Empresa".

**O que você vai ver na tela:** Uma seção com campos para adicionar emails e telefones. Pode exibir uma lista vazia (se for o primeiro acesso) ou os contatos de um teste anterior.

**O que acontece depois:** A tela de contatos é exibida, pronta para receber os dados.

✅ **Correto se:** A seção de contatos está visível com campos para email e telefone.
❌ **Problema se:** A página exibe erro ou não há nenhum campo visível para contatos.

---

### Passo 2 — Adicionar os endereços de email

**O que fazer:** Localize o campo ou botão para adicionar email. Pode ser um campo de texto com um botão "Adicionar" ao lado, ou uma lista onde você clica em "+ Email". Adicione os dois emails da Bio-Hosp, um de cada vez.

**O que você vai ver na tela:** Uma área para inserir endereços de email, possivelmente com uma lista abaixo mostrando os já cadastrados.

**Dados a informar (adicionar um por vez):**
1. `licitacoes@biohosp.com.br`
2. `diretoria@biohosp.com.br`

**O que acontece depois:** Após adicionar cada email, ele aparece na lista de emails cadastrados. Você deve ver os dois emails listados ao final.

✅ **Correto se:** Os dois emails estão listados na tela sem mensagem de erro de formato.
❌ **Problema se:** O sistema rejeita um dos emails por formato inválido, ou só permite um email.

---

### Passo 3 — Adicionar os telefones

**O que fazer:** Localize o campo para adicionar telefone (similar ao de email). Adicione os três telefones da Bio-Hosp, um de cada vez.

**O que você vai ver na tela:** Um campo de telefone com máscara ou sem, e uma lista dos telefones já adicionados.

**Dados a informar (adicionar um por vez):**
1. `(31) 3287-4500` — telefone fixo da empresa
2. `(31) 99654-7821` — celular principal
3. `(31) 99654-7821` — celular secundário

📌 **Atenção:** O sistema pode ter máscara automática para telefone (coloca os parênteses e o hífen automaticamente). Se isso acontecer, basta digitar os números — o formato aparece sozinho.

**O que acontece depois:** Os três telefones aparecem listados na seção de contatos.

✅ **Correto se:** Três telefones estão listados, com os números formatados corretamente.
❌ **Problema se:** O sistema aceita somente um ou dois telefones, ou rejeita o celular (que tem 9 dígitos).

---

### Passo 4 — Definir a Área Padrão de Atuação

**O que fazer:** Localize o campo "Área Padrão" ou "Área de Atuação Principal". Pode ser uma lista suspensa (dropdown) ou um campo de busca. Selecione ou digite a área correta.

**O que você vai ver na tela:** Um campo (provavelmente uma lista) com as opções de área de atuação disponíveis no sistema.

**Dado a informar:** `Equipamentos Médico-Hospitalares`

> **V4 — dica de filtro:** se a lista de áreas é longa e não rola direito, **digite "Equipa"** no campo de busca. Isso filtra para apenas as áreas que contêm "Equipa" no nome e a opção `Equipamentos Médico-Hospitalares` aparece logo. Em V4 também foi feita deduplicação no banco — antes podia haver várias entradas iguais, agora há apenas uma de cada.

**O que acontece depois:** A área selecionada fica destacada ou exibida no campo. Essa informação vai ser usada para filtrar automaticamente editais relevantes para a Bio-Hosp.

✅ **Correto se:** A área "Equipamentos Médico-Hospitalares" está selecionada e visível.
❌ **Problema se:** A área não está disponível na lista após digitar "Equipa", ou o campo não salva a seleção.

---

### Passo 5 — Salvar os contatos e área padrão

**O que fazer:** Clique no botão "Salvar" ou "Confirmar" para gravar todos os contatos e a área padrão.

**O que você vai ver na tela:** Todos os dados preenchidos nos passos anteriores visíveis na tela.

**O que acontece depois:** Uma mensagem verde de confirmação aparece na tela indicando que os dados foram salvos.

✅ **Correto se:** Mensagem de sucesso aparece e os dois emails, três telefones e a área padrão continuam visíveis após salvar.
❌ **Problema se:** Mensagem de erro, ou os dados somem depois de salvar.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Dois emails cadastrados: `licitacoes@biohosp.com.br` e `diretoria@biohosp.com.br`
- Três telefones cadastrados: `(31) 3287-4500`, `(31) 99654-7821` e `(31) 99654-7821`
- Área padrão definida como `Equipamentos Médico-Hospitalares`
- Mensagem de sucesso foi exibida ao salvar

**🔴 Sinais de problema:**
- Sistema limita o número de emails ou telefones
- A área "Equipamentos Médico-Hospitalares" não existe na lista
- Dados não persistem após salvar (somem ao atualizar a página)

---

## [UC-F03] Gerir Documentos da Empresa

> **O que este caso de uso faz:** Este é o arquivo digital da empresa. Aqui você sobe os documentos oficiais (alvarás, autorizações, certidões, certificados) que a empresa precisa apresentar em processos licitatórios. O sistema não apenas guarda os arquivos — ele monitora as datas de validade e sinaliza com cores quando um documento está prestes a vencer ou já vencido. Isso ajuda a empresa a nunca ser reprovada por documentação desatualizada.

> **V8 — 4 estados de badge (F03-01):** O sistema agora distingue claramente:
> - 🟢 **OK (verde)** — documento com PDF + validade > 30 dias
> - 🟡 **Vence (amarelo)** — documento com PDF + vence em ≤ 30 dias
> - 🔴 **Vencido (vermelho)** — documento com PDF + data já passou
> - ⚪ **Falta envio (cinza)** — documento SEM PDF cadastrado
>
> Antes (V6/V7) confundia "Vencido" com "Falta envio" — ambos mostravam o mesmo badge.

> **V8 — Upload em massa por IA disponível (F03-02):** Em "Configurações → Empresa", role até **"Cadastro Automático de Documentos por IA"**. Você pode arrastar vários PDFs de uma vez (alvará, certidões, contrato social, atestados) e a **IA classifica cada um automaticamente** identificando tipo + data de vencimento. Você revisa em lote e marca aceite individual antes de salvar.

> **V8 — Aceite IA + log de auditoria (F03-03):** Em qualquer tela onde a IA preenche dados (este UC inclui), antes de salvar você precisa marcar o checkbox **"Aceito os dados extraídos pela IA"**. Esse aceite é registrado em trilha de auditoria (tabela `auditoria_aceite_ia`) — protege legalmente a empresa em caso de divergência sobre o que foi automatizado vs manual. Sem marcar o aceite, o botão "Salvar" fica desabilitado.

**Onde:** Menu lateral → Configurações → Empresa → Documentos (role a tela)
**Quanto tempo leva:** 10 a 15 minutos

---

### Antes de começar

- O cadastro da empresa (UC-F01) deve estar salvo.
- Você vai fazer upload de **arquivos PDF** entregues junto com este tutorial na pasta `docs/documentos_sintetizados/` (envio do Pasteur). Use qualquer um deles — o conteúdo do PDF não importa para esta validação, apenas que o sistema aceite o upload e armazene metadados (tipo + datas).
- Caso não tenha a pasta, **qualquer PDF** que você tenha no seu computador (max 10MB) serve.
- Você vai cadastrar **quatro documentos** com datas de validade diferentes. Cada data vai gerar um status de cor diferente — isso é intencional e faz parte do que estamos validando.

> **V4:** O dropdown de "Tipo de Documento" foi expandido. Agora aparecem 15 opções (vs 7 anteriores), incluindo "Autorização de Funcionamento ANVISA (AFE)", "Certidão Negativa Estadual", "Habilitação Fiscal/Econômica/Técnica", "CBPAD/CBPP/Bombeiros". A opção "Outro" agora aceita ISO/Acreditação.

---

### Passo 1 — Navegar até a seção de Documentos

**O que fazer:** No menu lateral ou nas abas da página da Empresa, clique em "Documentos".

**O que você vai ver na tela:** Uma lista de documentos (possivelmente vazia se for o primeiro acesso) e um botão para adicionar novo documento.

**O que acontece depois:** A tela de gestão de documentos é exibida.

✅ **Correto se:** A tela de documentos carregou e há um botão visível para adicionar documentos.
❌ **Problema se:** A tela exibe erro ou não há botão para adicionar documentos.

---

### Passo 2 — Cadastrar o Documento 1: Alvará / Licença Sanitária (vencimento próximo)

**O que fazer:** Clique no botão para adicionar um novo documento (pode ser "+ Adicionar Documento", "Novo", ou um ícone de mais). Um formulário ou modal deve abrir.

**O que você vai ver na tela:** Um formulário com campos como Tipo de Documento, Arquivo, Data de Validade e possivelmente Número ou Descrição.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo de Documento | `Alvará / Licença Sanitária` |
| Arquivo | qualquer PDF da pasta `docs/documentos_sintetizados/` (clique em "Escolher arquivo" e selecione um PDF) |
| Data de Validade | `30/06/2026` |

📌 **Atenção V8 (F03-01):** A data `30/06/2026` está dentro de ≤30 dias da data atual (08/05/2026). Pelo novo critério V8, o badge esperado é:
- Se a data 30/06 ainda **não passou** (faltam dias) → 🟡 **Vence** (amarelo)
- Se a data 30/06 **já passou** → 🔴 **Vencido** (vermelho)

(O badge não pode ser ⚪ "Falta envio" porque você anexou PDF.)

**O que acontece depois:** Após salvar, o documento aparece na lista com badge **Vence** (amarelo) ou **Vencido** (vermelho), nunca com badge cinza nem texto genérico "Falta".

✅ **Correto se:** Badge é AMARELO (Vence) ou VERMELHO (Vencido), com texto explícito.
❌ **Problema se:**
- Badge é CINZA "Falta envio" (sistema confundindo com documento sem PDF — F03-01 não aplicada).
- Texto genérico "Falta" sem distinção (V6/V7 antigo).
- Nenhum badge aparece.

---

### Passo 3 — Cadastrar o Documento 2: Autorização de Funcionamento ANVISA (válido)

**O que fazer:** Clique novamente no botão para adicionar novo documento.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo de Documento | `Autorização de Funcionamento ANVISA (AFE)` |
| Arquivo | qualquer PDF da pasta `docs/documentos_sintetizados/` |
| Data de Validade | `22/08/2027` |

**O que acontece depois (V8/F03-01):** Validade `22/08/2027` está a >30 dias da data atual → badge esperado: 🟢 **OK** (verde). Texto pode ser "OK", "Válido" ou "Em dia".

✅ **Correto se:** Badge VERDE, texto explícito (OK/Válido).
❌ **Problema se:**
- Badge AMARELO/VERMELHO (sistema cálculo errado).
- Nenhum badge.
- Texto genérico antigo sem cor.

---

### Passo 4 — Cadastrar o Documento 3: Certificado ISO / Acreditação (válido)

**O que fazer:** Clique novamente no botão para adicionar novo documento.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo de Documento | `Certificado ISO / Acreditação` |
| Arquivo | qualquer PDF da pasta `docs/documentos_sintetizados/` |
| Data de Validade | `15/10/2026` |

**O que acontece depois:** Este documento deve aparecer na lista com badge VERDE (válido por mais de 5 meses).

✅ **Correto se:** Documento salvo com badge verde.
❌ **Problema se:** Badge amarelo ou vermelho para este documento (a data ainda está longe — deveria ser verde).

---

### Passo 5 — Cadastrar o Documento 4: Certidão Negativa Estadual (vencida)

**O que fazer:** Clique novamente no botão para adicionar novo documento.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo de Documento | `Certidão Negativa Estadual` |
| Arquivo | qualquer PDF da pasta `docs/documentos_sintetizados/` |
| Data de Validade | `30/06/2026` |

📌 **Atenção:** A data `30/06/2026` já passou (estamos em abril de 2026). O sistema deve exibir este documento com um indicador VERMELHO (vencido) ou AMARELO (alerta). Ambas as cores são aceitáveis para um documento já expirado — o importante é que o sistema sinalize o problema visivelmente.

**O que acontece depois:** Documento aparece na lista com badge vermelho ou amarelo de alerta.

✅ **Correto se:** Badge vermelho ou amarelo indica que o documento está com validade expirada.
❌ **Problema se:** Badge verde para um documento vencido em dezembro de 2025.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Quatro documentos na lista, cada um com seu tipo e badge de status correto:
  - Alvará / Licença Sanitária → badge AMARELO (vencendo)
  - Autorização de Funcionamento ANVISA (AFE) → badge VERDE (válido)
  - Certificado ISO / Acreditação → badge VERDE (válido)
  - Certidão Negativa Estadual → badge VERMELHO ou AMARELO (vencido)
- Os arquivos foram aceitos pelo sistema sem erro de upload

**🔴 Sinais de problema:**
- Todos os documentos exibem o mesmo badge (independente da data)
- O sistema rejeita o arquivo PDF no upload
- Documentos vencidos aparecem com badge verde
- Menos de quatro documentos aparecem na lista

---

## [UC-F04] Gerir Certidões Automáticas

> **V8 — Mudanças visíveis (resumo das 7 correções):**
>
> 1. **Filtro automático por UF (F04-01):** Em Cadastros > Empresa > Fontes de Certidões, a lista mostra apenas fontes federais (UF=NULL) + fontes estaduais da UF da empresa atual (Bio-Hosp = MG). Você não verá mais SEFAZ-PR, SEFAZ-SP, Pref. Curitiba, etc.
>
> 2. **Label "Requer credencial" (F04-02):** No form Novo Fonte de Certidão, o rótulo antes era "Requer autenticação" (confuso). Agora é claro: **"Requer credencial para acessar (marque se NÃO for público)"**.
>
> 3. **Coluna "Fonte" Ativa/Inativa (F04-03):** Na tabela de Certidões dentro de Configurações > Empresa, cada linha mostra na coluna **Fonte** um badge:
>    - 🟢 **Ativa** — fonte habilitada, será usada na busca automática
>    - ⚪ **Inativa** — fonte desligada, não participará da busca
>
> 4. **Botões individuais por linha (F04-04):** Cada certidão tem botões próprios (não mais botão único geral):
>    - 🔄 Buscar agora (esta certidão específica)
>    - ✏️ Editar dados (número, validade, órgão)
>    - 📤 Fazer upload manual do PDF
>    - 👁️ Baixar PDF
>
> 5. **Tooltips ricos (F04-05):** Passe o mouse sobre cada ícone — aparece tooltip descritivo (ex: *"Editar dados da certidão (número, validade, órgão emissor)"*).
>
> 6. **Validade do PDF prevalece (F04-06):** Se você digitar uma data de validade e o PDF tiver outra (extraída por IA), o sistema **usa a data do PDF** (mais confiável — vem do documento oficial) e avisa: *"A validade extraída do PDF (DD/MM/AAAA) prevaleceu sobre a digitada."*
>
> 7. **Validação de magic bytes %PDF (F04-07):** Sistema lê os primeiros 4 bytes do arquivo. Se não for `%PDF` (ex: HTML disfarçado de PDF), rejeita com mensagem clara: *"O arquivo enviado não é um PDF válido. Verifique se você selecionou o arquivo correto."*

> **O que este caso de uso faz:** Certidões são documentos obrigatórios em licitações — prova que a empresa não tem dívidas com o governo federal, estadual, municipal, trabalhista, etc. Buscá-las manualmente em cada site é demorado e propenso a erros. Este módulo automatiza essa busca usando o CNPJ da empresa. Além disso, permite fazer upload manual quando a busca automática não consegue o documento. Aqui também configuramos com que frequência o sistema renova essas certidões automaticamente.

**Onde:** Menu lateral → Empresa → Certidões
**Quanto tempo leva:** 8 a 12 minutos

---

### Antes de começar

- O CNPJ da Bio-Hosp deve estar cadastrado (UC-F01 concluído).
- A busca automática requer conexão com a internet — verifique se o computador está online.
- Se a busca automática demorar mais de 30 segundos sem resposta, use o upload manual conforme descrito no Passo 4. Isso é normal em horários de pico dos sites governamentais.

---

### Passo 1 — Navegar até a seção de Certidões

**O que fazer:** No menu lateral ou abas da página da Empresa, clique em "Certidões" ou "Certidões Automáticas".

**O que você vai ver na tela:** Uma tela com a lista de certidões disponíveis para busca automática, e provavelmente um campo mostrando o CNPJ da empresa que será consultado.

**O que acontece depois:** A tela de certidões é exibida com o CNPJ `33.014.556/0001-96` já preenchido automaticamente (vindo do cadastro).

✅ **Correto se:** O CNPJ da Bio-Hosp está preenchido automaticamente.
❌ **Problema se:** O CNPJ está em branco ou com o CNPJ de outra empresa.

---

### Passo 2 — Configurar a frequência de atualização automática

**O que fazer:** Localize o campo de "Frequência de Atualização" ou "Frequência de Busca". Selecione a opção quinzenal.

**O que você vai ver na tela:** Uma lista suspensa ou conjunto de botões com opções de frequência (Diária, Semanal, Quinzenal, Mensal, etc.).

**Dado a informar:** Selecionar `Quinzenal`

**O que acontece depois:** A frequência quinzenal fica selecionada. Isso significa que o sistema vai buscar as certidões automaticamente a cada 15 dias.

✅ **Correto se:** A opção "Quinzenal" está selecionada.
❌ **Problema se:** Não há opção quinzenal disponível, ou a seleção não é salva.

---

### Passo 0 (Pré-requisito) — Verificar fontes de certidões disponíveis

> **V4 — Mudança importante:** Não existe mais botão "Inicializar Fontes Padrão". As fontes já vêm pré-cadastradas no banco de dados.

**O que fazer:** Antes de buscar certidões, verifique que existem fontes cadastradas. Vá em **Configurações → Empresa → bloco "Certidões Automáticas"**. As 9 fontes pré-cadastradas devem aparecer:

1. **CND Federal** — Receita Federal / PGFN
2. **CND Estadual SEFAZ/MG** — Secretaria da Fazenda de Minas Gerais
3. **CND Municipal** — Prefeitura de Belo Horizonte
4. **CRF FGTS** — Caixa Econômica Federal
5. **CNDT Trabalhista** — Tribunal Superior do Trabalho
6. **SICAF** — Cadastro Unificado de Fornecedores
7. **CGU Correcional** — CEIS+CNEP+CEPIM
8. **Certidão Falência/Recuperação** — Tribunal de Justiça
9. **BrasilAPI Situação CNPJ** — Receita Federal via API

✅ **Correto se:** As 9 fontes aparecem listadas (não 5 como em versões antigas).
❌ **Problema se:** Tela aparece vazia ou retorna erro ao carregar fontes.

📌 **Observação:** Se o tutorial menciona apenas 5 certidões padrão (Receita Federal, PGFN, FGTS, Trabalhista, Estadual), saiba que o produto evoluiu — agora são 9 fontes mais granulares. Use a busca contra todas elas.

---

### Passo 0.5 (Importante) — Cadastrar 3 fontes de certidão necessárias para os editais

> **V5 — Mudança importante:** as 3 fontes que vamos cadastrar agora **NÃO são exemplos genéricos** — elas cobrem **lacunas reais** dos editais de teste das próximas sprints (2-9). Sem essas fontes, Bio-Hosp não consegue habilitação completa nos editais que vamos validar.

**Contexto técnico:**

A fonte pré-cadastrada **CND Federal (Receita Federal / PGFN conjunta)** é a **fonte oficial principal** desde a Portaria MF 358/2014, que unificou a CND da Receita Federal com a CND da Dívida Ativa da União (PGFN) num único documento.
**Mesmo assim**, a PGFN mantém um portal próprio (REGULARIZE) que pode ser usado para consulta isolada de Dívida Ativa em casos específicos. Validamos a integração separada cadastrando-a abaixo.

**Onde:** Sidebar → **Cadastros → Fontes de Certidões** (item com ícone de globo 🌐)

#### Fonte 1 — PGFN: Dívida Ativa da União (REGULARIZE) — **complementar à CND Federal conjunta**

1. Clique em **+ Novo** no canto superior direito
2. Preencha exatamente:

| Campo | Valor |
|---|---|
| Tipo de Certidão | `CND Federal` |
| Nome da Fonte | `PGFN - REGULARIZE (Dívida Ativa)` |
| Órgão Emissor | `Procuradoria-Geral da Fazenda Nacional` |
| URL do Portal | `https://www.regularize.pgfn.gov.br/` |
| URL da API | (em branco) |
| Método de Acesso | `Público` |
| Requer Autenticação | OFF |
| Permitir Busca Automática | ✅ ON |
| Ativo | ✅ ON |
| Observações | `Portal REGULARIZE da PGFN. A CND Federal conjunta (RFB+PGFN) já cobre Dívida Ativa, mas esta fonte permite consulta isolada e validação separada.` |

3. Clique em **Salvar**.

#### Fonte 2 — CND Municipal de Itamarandiba/MG (necessária para edital `0031/2026`)

O edital de teste `0031/2026 - MUNICIPIO DE ITAMARANDIBA-MG` exige CND Municipal local. Bio-Hosp precisa cadastrar esta fonte para conseguir gerar a certidão automaticamente.

1. Clique em **+ Novo**
2. Preencha:

| Campo | Valor |
|---|---|
| Tipo de Certidão | `CND Municipal` |
| Nome da Fonte | `Prefeitura de Itamarandiba/MG - CND ISS` |
| Órgão Emissor | `Prefeitura Municipal de Itamarandiba` |
| URL do Portal | `https://itamarandiba.mg.gov.br/servicos/certidao-negativa-de-debitos` |
| Método de Acesso | `Público` |
| UF | `MG` |
| Cidade | `Itamarandiba` |
| Permitir Busca Automática | ✅ ON |
| Ativo | ✅ ON |
| Observações | `Necessária para participação no edital de teste 0031/2026. Município do Vale do Jequitinhonha-MG. CND ISS exigida em habilitação fiscal municipal.` |

3. Clique em **Salvar**.

#### Fonte 3 — Junta Comercial de Minas Gerais (JUCEMG)

Vários editais (Lei 14.133, art. 67-68) exigem **Certidão Simplificada da Junta Comercial** comprovando regularidade do registro empresarial. Não está nas 9 pré-cadastradas e é necessária a partir da Sprint 2.

1. Clique em **+ Novo**
2. Preencha:

| Campo | Valor |
|---|---|
| Tipo de Certidão | `Outro` |
| Nome da Fonte | `JUCEMG - Junta Comercial de Minas Gerais` |
| Órgão Emissor | `Junta Comercial do Estado de Minas Gerais` |
| URL do Portal | `https://www.jucemg.mg.gov.br/empresa/online/certidao` |
| Método de Acesso | `Público` |
| UF | `MG` |
| Permitir Busca Automática | ✅ ON |
| Ativo | ✅ ON |
| Observações | `Certidão Simplificada exigida em habilitação jurídica/qualificação técnica. Validade 30-90 dias. Necessária para editais que pedem comprovação de registro empresarial.` |

3. Clique em **Salvar**.

✅ **Correto se:** As 3 fontes novas aparecem na lista, totalizando **12 fontes (9 pré + 3 novas)**, todas com badge "Ativo".

📌 **Importante:** **NÃO PULE este passo.** As próximas sprints (2-9) vão validar habilitação de Bio-Hosp em editais que dependem destas 3 fontes. Sem elas, a busca automática vai retornar resultado parcial.

**Cenário de validação B — desativar uma fonte existente:**

1. Localize uma fonte (ex: `BrasilAPI Situação CNPJ`)
2. Clique em **edição** (lápis)
3. Desmarque o checkbox **Ativo**
4. Salve

✅ **Correto se:** Status muda para "Inativo".

**Cenário de validação C — reativar:**

1. Edite a fonte desativada acima
2. Marque **Ativo** ✅ novamente
3. Salve

✅ **Correto se:** Volta para "Ativo".

📌 **Observação importante:** as 3 fontes cadastradas em A ficam no banco para uso futuro. Se desativar uma fonte em B, **reative depois** para não impactar a busca real.

🔴 **Sinais de problema:**
- Item "Fontes de Certidões" não aparece na sidebar (verifique se você é superusuário)
- Tela CRUD em branco ou erro 500
- Não salva (campos obrigatórios faltando ou erro de permissão)
- Erro de "fonte duplicada" — significa que essa URL já existe; troque o nome ou pule

---

### Passo 3 — Iniciar a busca automática de certidões

**O que fazer:** Clique no botão "Buscar Certidões", "Consultar" ou similar. O sistema vai acessar os sites governamentais usando o CNPJ da Bio-Hosp e tentar baixar as certidões automaticamente.

**O que você vai ver na tela:** O botão de busca. Possivelmente um indicador de progresso enquanto a busca está acontecendo.

**O que acontece depois:** O sistema tenta conectar com os sites governamentais. Esse processo pode levar de 10 a 30 segundos. Algumas certidões podem ser encontradas automaticamente; outras podem falhar se o site governamental estiver fora do ar.

📌 **Atenção:** Como o CNPJ `33.014.556/0001-96` é fictício (usado apenas para testes), é provável que a busca automática não retorne documentos reais dos sites governamentais. Isso é esperado. O próximo passo mostra como fazer o upload manual nesse caso.

✅ **Correto se:** O sistema tenta a busca e exibe o resultado (seja com certidões encontradas ou com mensagem de que não encontrou).
❌ **Problema se:** O sistema trava indefinidamente (mais de 60 segundos sem resposta) ou exibe um erro fatal de sistema.

---

### Passo 4 — Fazer upload manual de certidão (PGFN)

**O que fazer:** Localize a certidão da PGFN (Secretaria de Estado da Fazenda de Minas Gerais) na lista. Clique no botão de upload manual ao lado dela (pode ser um ícone de upload, nuvem ou a palavra "Upload"). Um formulário deve abrir.

**O que você vai ver na tela:** Um modal ou formulário para upload manual de certidão, com campos para arquivo, data de validade e número da certidão.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Arquivo | qualquer PDF da pasta `docs/documentos_sintetizados/` |
| Data de Validade | `15/10/2026` |
| Número da Certidão | `SEFAZ-MG-2026-3301` |

**O que acontece depois:** O arquivo é enviado e a certidão aparece na lista com status "Upload manual" e os dados informados.

✅ **Correto se:** A certidão PGFN aparece na lista com a data de validade `15/10/2026` e o número `SEFAZ-MG-2026-3301`.
❌ **Problema se:** O upload falha ou os dados não aparecem na lista após salvar.

---

### Passo 5 — Verificar e editar os detalhes da certidão via modal

**O que fazer:** Após o upload, clique na certidão PGFN para abrir seus detalhes ou clique em um botão de edição (lápis, "Editar" ou similar).

**O que você vai ver na tela:** Um modal com os detalhes da certidão que você acabou de cadastrar.

**Verificar se os dados estão corretos:**

| Campo | Valor esperado |
|---|---|
| Status | `Upload manual` |
| Data de Validade | `15/10/2026` |
| Número | `SEFAZ-MG-2026-3301` |
| Órgão | `Secretaria de Estado da Fazenda de Minas Gerais` |

**O que acontece depois:** Se os dados estiverem corretos, feche o modal. Se precisar corrigir algum campo, edite e salve.

✅ **Correto se:** Todos os quatro campos estão corretos conforme a tabela acima.
❌ **Problema se:** O campo Órgão está vazio ou com nome diferente, ou a data está incorreta.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- A seção de certidões exibe a lista de certidões disponíveis para a empresa
- A frequência de atualização está configurada como `Quinzenal`
- A certidão PGFN aparece com status "Upload manual", data `15/10/2026` e número `SEFAZ-MG-2026-3301`
- O órgão está identificado como `Secretaria de Estado da Fazenda de Minas Gerais`

**🔴 Sinais de problema:**
- A tela de certidões não carrega ou exibe erro
- Não há opção de upload manual
- Os dados da certidão não persistem após salvar
- A frequência quinzenal não está disponível

---

## [UC-F05] Gerir Responsáveis e Representantes da Empresa

> **O que este caso de uso faz:** Em licitações, é obrigatório identificar quem assina documentos e quem é responsável técnico pelos produtos. Este módulo permite cadastrar as pessoas que representam a empresa — o representante legal (quem assina contratos) e o responsável técnico (quem responde pela qualidade e conformidade dos produtos). Esses dados aparecem automaticamente nos documentos gerados pelo sistema.

> **V8 — Submenu renomeado (F05-01):** Antes (V6/V7) o submenu na sidebar era apenas **"Responsáveis"**. Agora é **"Responsáveis e Representantes"** — mais claro porque a entidade comporta os 2 papéis (Responsável Técnico assina pela qualidade técnica; Representante Legal assina contratos pela empresa).

> **V8 — 3 campos novos no form (F05-02 + F05-03):** O cadastro agora inclui:
> 1. **Validade do mandato/procuração** (campo data) — para Representantes Legais e Prepostos com poderes formalmente outorgados.
> 2. **Documento de outorga (descrição)** — texto livre identificando o documento (ex: "Procuração 2026 cláusula 5", "Contrato Social cláusula 8").
> 3. **Caminho/URL do documento (PDF)** — link ou path para o PDF do documento de outorga.
>
> Esses 3 campos são essenciais especialmente para **Prepostos** (representantes em sessões de pregão), porque permitem rastreabilidade legal: quem outorgou poder, até quando vale, e o documento físico que comprova.

**Onde:** Menu lateral → **Cadastros → Empresa → Responsáveis e Representantes** (V8)
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de começar

- O cadastro principal da empresa deve estar salvo.
- Neste conjunto de dados, vamos cadastrar **apenas dois responsáveis** (sem Preposto). Isso valida que o sistema funciona corretamente sem o terceiro tipo de responsável.

---

### Passo 1 — Navegar até a seção de Responsáveis e Representantes (V8/F05-01)

**O que fazer:** Na sidebar (menu lateral esquerdo):
1. Click em **CADASTROS** para expandir.
2. Click em **Empresa** (subsection — vai abrir mais itens abaixo).
3. Click em **Responsáveis e Representantes**.

**O que você vai ver na tela (V8):**
- Header da página: **"Responsáveis e Representantes"** (título atualizado).
- Lista de responsáveis (possivelmente vazia se for primeiro acesso).
- Botão **"+ Novo"** no canto superior direito.
- Sidebar à esquerda mostra "Responsáveis e Representantes" destacado em azul (indicando que é a página atual).

**O que acontece depois:** A seção de responsáveis e representantes é exibida.

✅ **Correto se:** O título da página é "Responsáveis e Representantes" (não apenas "Responsáveis"), e o item correspondente na sidebar tem esse nome completo.
❌ **Problema se:** Sidebar continua mostrando apenas "Responsáveis" (F05-01 não aplicada).

---

### Passo 2 — Cadastrar o Responsável 1: Representante Legal (V8 com 3 campos novos)

**O que fazer:** Click no botão **"+ Novo"**. Um formulário aparece (no estilo "card aberto inline" — não é modal pop-up).

**O que você vai ver na tela (V8):** Um formulário com:
- Campos antigos: Tipo, Nome, Cargo, Email, Telefone, CPF.
- **3 campos NOVOS V8 (F05-02 + F05-03):**
  - **Validade do mandato/procuração** (campo data dd/mm/yyyy)
  - **Documento de outorga (descrição)** (campo texto)
  - **Caminho/URL do documento (PDF)** (campo texto)

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo * | `Representante Legal` |
| Nome * | `Mariana Andrade Silveira` |
| Cargo | `Sócia-Diretora` |
| Email | `fernanda.costa@biohosp.com.br` |
| Telefone | `(31) 99654-7821` |
| CPF | `845.612.339-58` |
| **Validade do mandato/procuração** (V8) | `15/12/2027` |
| **Documento de outorga (descrição)** (V8) | `Procuração ad judicia et extra — Contrato Social cláusula 5ª, data 03/02/2026` |
| **Caminho/URL do documento (PDF)** (V8) | `docs/documentos_sintetizados/procuracao-mariana-2026.pdf` (ou qualquer caminho/URL) |

📌 **Atenção V8:** os 3 campos novos não bloqueiam o salvamento se ficarem vazios — são opcionais. Mas o teste valida que **existem no formulário**. Se não estiverem visíveis, F05-02/F05-03 não foi aplicada.

**O que acontece depois:** Após salvar, Mariana Andrade Silveira aparece na lista com tipo "Representante Legal" + os 3 campos novos persistidos no banco.

✅ **Correto se:**
- Os 3 campos novos estão visíveis no formulário.
- Os dados foram salvos (lista mostra a Mariana).
- Recarregando a página, os 3 valores persistem.

❌ **Problema se:**
- Os 3 campos novos NÃO aparecem (F05-02/F05-03 não aplicada).
- Sistema rejeita o tipo "Representante Legal".
- Após Save, os 3 valores somem (defeito de persistência — Migration 052 não aplicada no banco).

---

### Passo 3 — Cadastrar o Responsável 2: Responsável Técnico (com 3 campos V8)

**O que fazer:** Click novamente em **"+ Novo"**.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo * | `Responsável Técnico` |
| Nome * | `Eng. Carlos Henrique Tavares` |
| Cargo | `Engenheiro Biomédico Responsável` |
| Email | `ricardo.nunes@biohosp.com.br` |
| Telefone | `(31) 99654-7821` |
| CPF | `627.483.501-90` |
| Validade do mandato/procuração (V8) | (vazio — Resp. Técnico não tem prazo de mandato; valida que campo aceita vazio) |
| Documento de outorga (V8) | `CRM nº 12.345/MG — registro técnico em vigor` |
| Caminho/URL do documento (PDF) (V8) | (vazio — opcional) |

📌 **Nota V8:** os 3 campos novos são opcionais (podem ficar vazios). Esse passo valida que aceitam preenchimento parcial.

**O que acontece depois:** O Dr. Ricardo aparece na lista de responsáveis com o tipo "Responsável Técnico". A lista agora tem dois itens.

✅ **Correto se:** Dois responsáveis listados, cada um com seu tipo correto.
❌ **Problema se:** O sistema exige um Preposto para salvar, ou rejeita o cargo "Engenheiro Biomédico Responsável".

---

### Passo 4 — Confirmar que não existe terceiro responsável (sem Preposto)

**O que fazer:** Verifique a lista de responsáveis. Confirme que há exatamente dois, sem um terceiro do tipo "Preposto".

**O que você vai ver na tela:** Dois cards ou linhas na lista: Mariana Andrade Silveira (Representante Legal) e Eng. Carlos Henrique Tavares (Responsável Técnico).

📌 **Atenção:** A ausência do Preposto é intencional. Queremos confirmar que o sistema não obriga o cadastro de um Preposto para funcionar. Se o sistema exibir um aviso dizendo que o Preposto é obrigatório, isso deve ser reportado como problema.

✅ **Correto se:** Exatamente dois responsáveis na lista, sem mensagem de alerta exigindo um Preposto.
❌ **Problema se:** O sistema exibe erro ou aviso dizendo que um Preposto é obrigatório.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Dois responsáveis cadastrados na lista
- Mariana Andrade Silveira → tipo Representante Legal, cargo Sócia-Diretora
- Eng. Carlos Henrique Tavares → tipo Responsável Técnico, cargo Engenheiro Biomédico Responsável
- Sistema não exige um terceiro responsável (Preposto)

**🔴 Sinais de problema:**
- Sistema obriga cadastro de Preposto
- Os dados dos responsáveis não persistem
- O tipo "Responsável Técnico" não existe na lista de opções

---

## [UC-F13] Gerir e consultar classificação Área/Classe/Subclasse

> **V8 — Rejeição de duplicatas (F13-01):** O sistema agora **rejeita áreas/classes com nome igual** dentro da mesma empresa, com **mensagem amigável**. Antes, tentar cadastrar uma área duplicada gerava erro técnico feio (UNIQUE constraint violation no banco). Agora aparece:
>
> > *"Já existe uma Área com este nome nesta empresa. Áreas devem ser únicas — use Subclasses para variações."*
>
> Para validar: depois de cadastrar a primeira área (Passo 1), tente cadastrar de novo com **mesmo nome** — confirme a mensagem amigável. Veja também a seção "Passo de validação V8 — Duplicatas" abaixo.

> **V8 do UC (29/04/2026):** Este UC foi reescrito. Antes era apenas "Consultar" (visualizar a árvore). Agora você **CRIA** a hierarquia primeiro e DEPOIS visualiza o que criou.
>
> **Por que:** cada empresa tem sua própria hierarquia (`empresa_scoped=True` no banco). A empresa Bio-Hosp (que você acabou de criar/vincular) ainda não tem nenhuma área/classe/subclasse cadastrada — você precisa criar a estrutura para que os outros UCs (UC-F02 área padrão, UC-F06 filtros de produto, UC-F08 cadastro de produto, e Sprint 2 com filtros de edital) funcionem.

> **O que este caso de uso faz:** O sistema possui uma hierarquia de classificação de produtos: **Área → Classe → Subclasse**. É como uma árvore de categorias — similar ao que você vê em e-commerces, onde produtos são organizados em departamentos e subseções. Você vai **criar** essa estrutura nos 3 CRUDs específicos (Áreas, Classes, Subclasses) e depois conferir na PortfolioPage que tudo aparece corretamente na árvore.

**Onde:**
- Cadastros → Áreas de Produto (criar áreas)
- Cadastros → Classes de Produto (criar classes vinculadas a áreas)
- Cadastros → Subclasses de Produto (criar subclasses vinculadas a classes, com NCM)
- Portfólio → aba Classificação (visualizar a árvore consolidada)

**Quanto tempo leva:** 12 a 18 minutos (3 hierarquias × 3 ciclos = 9 cadastros + visualização)

---

### Antes de começar

- Você deve ter logado como super (validaarnaldo ou similar) e ter a empresa Bio-Hosp **selecionada como ativa** (UC-F18 já feito).
- Os 3 CRUDs (`Áreas de Produto`, `Classes de Produto`, `Subclasses de Produto`) ficam dentro do menu lateral em **Cadastros**.
- Se em algum momento você já criou parte da hierarquia em sessão anterior, o tutorial é **idempotente**: pule os passos de criação cujos itens já aparecem na listagem e siga.

---

### Resumo do que você vai criar (3 hierarquias completas)

```
1. Equipamentos Médico-Hospitalares
   └── Monitoração
       └── Monitor Multiparamétrico (NCM 9018.19.90)

2. Equipamentos Médico-Hospitalares
   ├── Monitorização Multiparamétrica
   │   └── Monitor Multiparâmetro (NCM 9018.19.90)
   └── Monitorização Multiparamétrica
       └── Oxímetro de Pulso (NCM 9018.19.90)
```

Total: **2 áreas, 3 classes, 3 subclasses**.

---

### PARTE 1 — Criar Áreas

#### Passo 1.1 — Navegar para Cadastros → Áreas de Produto

**O que fazer:** Na sidebar, expanda a seção **Cadastros**. Clique no item **Áreas de Produto** (pode estar dentro de uma sub-seção "Empresa" ou similar).

**O que você vai ver:** Uma página CRUD com botão `Novo` no canto superior e uma lista (provavelmente vazia, se for a primeira vez).

✅ **Correto se:** Header da página mostra "Áreas de Produto" e botão `Novo` está visível.

#### Passo 1.2 — Criar Área "Equipamentos Médico-Hospitalares"

**O que fazer:**
1. Clique `Novo`.
2. No campo **Nome**, digite exatamente: `Equipamentos Médico-Hospitalares`
3. Clique `Salvar`.

✅ **Correto se:** Mensagem "Salvo com sucesso" aparece e a área entra na listagem.
❌ **Problema se:** Erro de duplicidade (área já existe — pular este passo) ou erro de validação.

#### Passo 1.3 — V8: Tentar duplicar área (F13-01) — deve REJEITAR com mensagem amigável

**O que fazer:**
1. Click `Novo` novamente.
2. No campo **Nome**, digite exatamente o **MESMO** valor do passo anterior: `Equipamentos Médico-Hospitalares`.
3. Click `Salvar`.

**O que você vai ver na tela (V8/F13-01):**
- O sistema **rejeita** a tentativa.
- Aparece uma mensagem amigável (toast vermelho ou alerta inline):
  > *"Já existe uma Área com este nome nesta empresa. Áreas devem ser únicas — use Subclasses para variações."*
- A listagem **continua com 1 área** (não cria a duplicata).

✅ **Correto se:**
- Mensagem amigável aparece (texto humano, não erro técnico tipo "IntegrityError" ou "UNIQUE constraint failed").
- Lista permanece com 1 entrada, não 2.
- Você consegue clicar Cancelar e o form some.

❌ **Problema se:**
- O sistema aceita a duplicata (cria 2ª entrada).
- Aparece erro técnico do banco (ex: "Duplicate entry" sem traducao).
- Mensagem é confusa ou ambígua.

> **Por que essa correção:** áreas duplicadas com mesmo nome confundem filtros, relatórios e produtos vinculados. F13-01 garante unicidade no banco (Migration 053 — `UNIQUE (empresa_id, nome)`) + tradução amigável no backend (`_friendly_error`).

#### Passo 1.4 — (continuar fluxo normal)

**O que fazer:** Click `Cancelar` no form. Confirme que a listagem mostra apenas 1 área.

✅ **Correto se:** Lista tem exatamente 1 entrada `Equipamentos Médico-Hospitalares`.

---

### PARTE 2 — Criar Classes

#### Passo 2.1 — Navegar para Cadastros → Classes de Produto

**O que fazer:** Sidebar → Cadastros → **Classes de Produto**.

✅ **Correto se:** Página CRUD de Classes carrega com botão `Novo`.

#### Passo 2.2 — Criar Classe "Monitoração" vinculada à Área "Equipamentos Médico-Hospitalares"

**O que fazer:**
1. Clique `Novo`.
2. No select **Área**, selecione: `Equipamentos Médico-Hospitalares`.
3. No campo **Nome**, digite: `Monitoração`.
4. Salvar.

✅ **Correto se:** Listagem mostra a classe com a área associada.

#### Passo 2.3 — Criar Classe "Monitorização Multiparamétrica" vinculada à Área "Equipamentos Médico-Hospitalares"

**O que fazer:** Clique `Novo`. Área: `Equipamentos Médico-Hospitalares`. Nome: `Monitorização Multiparamétrica`. Salvar.

#### Passo 2.4 — Criar Classe "Monitorização Multiparamétrica" vinculada à mesma área

**O que fazer:** Clique `Novo`. Área: `Equipamentos Médico-Hospitalares`. Nome: `Monitorização Multiparamétrica`. Salvar.

✅ **Correto se:** Listagem mostra **3 classes**, sendo 1 em Equipamentos e 2 em Diagnóstico.

---

### PARTE 3 — Criar Subclasses (com NCM)

#### Passo 3.1 — Navegar para Cadastros → Subclasses de Produto

**O que fazer:** Sidebar → Cadastros → **Subclasses de Produto**.

✅ **Correto se:** Página CRUD de Subclasses carrega com botão `Novo` e campos para Classe + Nome + NCM.

#### Passo 3.2 — Criar Subclasse "Monitor Multiparamétrico" vinculada à classe "Monitoração"

**O que fazer:**
1. Clique `Novo`.
2. Select **Classe**: selecione `Monitoração`.
3. **Nome**: `Monitor Multiparamétrico`
4. **NCM**: `9018.19.90`
5. Salvar.

✅ **Correto se:** Listagem mostra a subclasse com NCM.

#### Passo 3.3 — Criar Subclasse "Monitor Multiparâmetro"

**O que fazer:**
1. Clique `Novo`.
2. Classe: `Monitorização Multiparamétrica`
3. Nome: `Monitor Multiparâmetro`
4. NCM: `9018.19.90`
5. Salvar.

#### Passo 3.4 — Criar Subclasse "Oxímetro de Pulso"

**O que fazer:**
1. Clique `Novo`.
2. Classe: `Monitorização Multiparamétrica`
3. Nome: `Oxímetro de Pulso`
4. NCM: `9018.19.90`
5. Salvar.

✅ **Correto se:** Listagem mostra **3 subclasses** com seus NCMs.

---

### PARTE 4 — Configurar Máscara de Campos das Subclasses (NOVO em V6)

> **Por que esta parte é importante:** quando você cadastra um produto da subclasse "Monitor Multiparâmetro", o sistema precisa saber **quais especificações são esperadas** (tela, bateria, parâmetros monitorados, etc.). A **Máscara de Campos** (`campos_mascara`) define isso previamente. Sem esta configuração, o cadastro do produto fica "à mão livre" sem orientação dos campos certos.

**Onde:** Cadastros → Portfolio → Subclasses → clicar na subclasse → editar → campo **"Máscara de Campos"** (último campo do formulário, full-width).

#### Passo 4.1 — Abrir editor de máscara da subclasse "Monitor Multiparâmetro"

**O que fazer:**
1. Sidebar → **Cadastros → Portfolio → Subclasses**
2. Localize na lista a subclasse `Monitor Multiparâmetro` (criada em PARTE 3)
3. Clique no ícone de **edição** (lápis)
4. Role o formulário até o último campo: **"Máscara de Campos"**
5. Você verá um editor visual com botão **"+ Adicionar Campo"**

✅ **Correto se:** Editor aparece com lista vazia + botão para adicionar.
❌ **Problema se:** Campo "Máscara de Campos" não aparece no formulário.

#### Passo 4.2 — Adicionar os 8 campos da máscara de Monitor Multiparâmetro

**O que fazer:** Clique em **"+ Adicionar Campo"** 8 vezes, preenchendo cada um conforme tabela abaixo:

| # | Nome do Campo | Tipo | Unidade | Opções | Obrigatório |
|---|---|---|---|---|---|
| 1 | `Tela` | texto | `polegadas` | — | ✓ |
| 2 | `Parâmetros Monitorados` | texto | — | — | ✓ |
| 3 | `Tipo de Paciente` | seleção | — | `Adulto, Pediátrico, Neonatal` | ✓ |
| 4 | `Bateria Interna` | decimal | `horas` | — | — |
| 5 | `Peso` | decimal | `kg` | — | — |
| 6 | `Alimentação` | texto | `V` | — | — |
| 7 | `Classe ANVISA` | seleção | — | `I, II, III, IV` | ✓ |
| 8 | `Registro ANVISA` | texto | — | — | ✓ |

**O que acontece depois:** Após preencher os 8 campos, o JSON da máscara fica:
```json
[
  {"campo":"Tela","tipo":"texto","unidade":"polegadas","obrigatorio":true},
  {"campo":"Parâmetros Monitorados","tipo":"texto","obrigatorio":true},
  {"campo":"Tipo de Paciente","tipo":"select","opcoes":["Adulto","Pediátrico","Neonatal"],"obrigatorio":true},
  {"campo":"Bateria Interna","tipo":"decimal","unidade":"horas"},
  {"campo":"Peso","tipo":"decimal","unidade":"kg"},
  {"campo":"Alimentação","tipo":"texto","unidade":"V"},
  {"campo":"Classe ANVISA","tipo":"select","opcoes":["I","II","III","IV"],"obrigatorio":true},
  {"campo":"Registro ANVISA","tipo":"texto","obrigatorio":true}
]
```

#### Passo 4.3 — Salvar a subclasse

**O que fazer:** Clique em **"Salvar"** ou **"Atualizar"** no formulário.

✅ **Correto se:** Mensagem verde "Salvo!". Na listagem de subclasses, ao reabrir "Monitor Multiparâmetro", os 8 campos da máscara devem reaparecer no editor.

#### Passo 4.4 — Repetir para "Oxímetro de Pulso"

**O que fazer:** Volte à listagem de Subclasses. Edite `Oxímetro de Pulso` e configure a máscara abaixo:

| # | Nome do Campo | Tipo | Unidade | Opções | Obrigatório |
|---|---|---|---|---|---|
| 1 | `Faixa de SpO2` | texto | `%` | — | ✓ |
| 2 | `Faixa de Frequência Cardíaca` | texto | `bpm` | — | ✓ |
| 3 | `Tipo de Sensor` | seleção | — | `Adulto, Pediátrico, Neonatal, Universal` | ✓ |
| 4 | `Bateria` | decimal | `horas` | — | — |
| 5 | `Display` | texto | — | — | — |
| 6 | `Peso` | decimal | `kg` | — | — |
| 7 | `Classe ANVISA` | seleção | — | `I, II, III, IV` | ✓ |
| 8 | `Registro ANVISA` | texto | — | — | ✓ |

Salvar.

✅ **Correto se:** "Oxímetro de Pulso" também tem 8 campos na máscara.

#### Passo 4.5 — Verificar resultado no PortfolioPage

**O que fazer:** Vá em **Portfólio → aba Classificação**. Localize as 2 subclasses que você acabou de configurar. Cada uma deve mostrar (em algum lugar do card) os campos da máscara como referência visual ou contagem (ex: "8 campos").

✅ **Correto se:** As subclasses "Monitor Multiparâmetro" e "Oxímetro de Pulso" mostram os 8 campos cada.
❌ **Problema se:** O JSON foi salvo mas não aparece na aba Classificação — pode ser problema de cache, recarregue a página.

📌 **Observação:** A máscara é uma **referência** para o cadastro de produtos (UC-F07/F08). Ela **não impede** salvar produto sem alguma especificação — é uma sugestão de UI que ajuda o validador a saber quais campos são esperados para aquele tipo de produto. Os campos marcados como "obrigatório" geram destaque visual no formulário do produto, mas não bloqueiam o save.

---

### PARTE 5 — Visualizar a árvore consolidada

#### Passo 5.1 — Navegar para Portfólio → aba Classificação

**O que fazer:** Sidebar → Configurações → Portfolio (ou Portfólio direto, dependendo do menu). Acesse a aba **Classificação**.

**O que você vai ver:** Card "Estrutura de Classificação" listando as 2 áreas que você criou, expansíveis.

✅ **Correto se:** Aparecem as áreas `Equipamentos Médico-Hospitalares` e `Equipamentos Médico-Hospitalares`.

#### Passo 5.2 — Expandir cada área e classe

**O que fazer:** Clique nas setas para expandir. Confira:

- `Equipamentos Médico-Hospitalares`
  - `Monitoração` → `Monitor Multiparamétrico` (NCM 9018.19.90)
- `Equipamentos Médico-Hospitalares`
  - `Monitorização Multiparamétrica` → `Monitor Multiparâmetro` (NCM 9018.19.90)
  - `Monitorização Multiparamétrica` → `Oxímetro de Pulso` (NCM 9018.19.90)

✅ **Correto se:** Toda a árvore aparece com NCMs corretos.
❌ **Problema se:** Falta alguma área/classe/subclasse — voltar ao CRUD correspondente e completar.

#### Passo 5.3 — Conferir Card "Funil de Monitoramento"

**O que verificar:** Contagem de "N classes" e "N subclasses" reflete o que você acabou de criar.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- 2 áreas criadas (Equipamentos Médico-Hospitalares + Diagnóstico in Vitro)
- 3 classes criadas (Monitoração + Monitorização Multiparamétrica + Monitorização Multiparamétrica)
- 3 subclasses criadas com NCMs corretos
- **Máscara de Campos configurada (V6) em "Monitor Multiparâmetro" (8 campos) e "Oxímetro de Pulso" (8 campos)**
- Árvore consolidada na PortfolioPage mostra tudo aninhado

**🔴 Sinais de problema:**
- Erro 400 ao salvar classe (esqueceu selecionar Área)
- Erro 400 ao salvar subclasse (esqueceu selecionar Classe)
- NCM rejeitado (formato precisa ser XXXX.XX.XX)
- Duplicidade ao tentar criar Área já existente (pular)

**Pós-requisito:** Os UCs **UC-F02 (Área Padrão)**, **UC-F06 (Filtros de produto)**, **UC-F08 (Cadastrar produto)** e **Sprint 2 (busca de editais com filtros de classificação)** dependem desta hierarquia. Não execute esses UCs antes de concluir UC-F13.

---

## [UC-F06] Listar e Filtrar Produtos do Portfólio

> **O que este caso de uso faz:** O portfólio de produtos é o catálogo de tudo que a empresa vende ou pode oferecer em licitações. Esta tela permite visualizar todos os produtos cadastrados e filtrá-los por área de atuação ou palavras-chave. Assim, quando um edital chega, é fácil verificar se a empresa tem o produto certo no portfólio.

**Onde:** Menu lateral → Portfólio
**Quanto tempo leva:** 3 a 5 minutos

---

### Antes de começar

- Para este UC, pode não haver produtos cadastrados ainda (se for o primeiro acesso). Nesse caso, a validação principal é confirmar que a tela carrega corretamente e que os filtros funcionam. Os produtos serão cadastrados nos próximos UCs.
- Se já houver produtos cadastrados de testes anteriores, eles serão visíveis aqui.

> **V4 — Empty state esperado:** se você está executando este tutorial pela primeira vez para a empresa Bio-Hosp, **a lista virá vazia** (mensagem "Nenhum produto encontrado" ou similar). Isso é o **comportamento correto** — não é um defeito. Os produtos serão criados em UC-F07 logo a seguir. **Volte aqui depois do UC-F07** para ver o filtro retornando os produtos cadastrados.

---

### Passo 1 — Navegar até o Portfólio

**O que fazer:** No menu lateral, clique em "Portfólio" ou "Produtos".

**O que você vai ver na tela:** A tela de listagem de produtos, possivelmente com cards ou linhas para cada produto. Se não houver produtos, uma mensagem de "nenhum produto encontrado" ou área vazia.

**O que acontece depois:** A tela de portfólio é exibida.

✅ **Correto se:** A tela carregou sem erros.
❌ **Problema se:** Erro 404, tela em branco ou mensagem de erro técnico.

---

### Passo 2 — Testar o filtro por Área

**O que fazer:** Localize o campo de filtro por Área (pode ser um dropdown, uma lista lateral ou um campo de busca). Selecione a área `Equipamentos Médico-Hospitalares`.

**O que você vai ver na tela:** Uma lista de produtos sendo filtrada (ou, se não houver produtos ainda, uma área vazia).

**O que acontece depois:** A lista exibe apenas produtos da área selecionada. Se não houver nenhum ainda, aparece uma mensagem como "nenhum produto encontrado para esta área".

✅ **Correto se:** O filtro funciona — a lista muda após selecionar a área.
❌ **Problema se:** O filtro não tem efeito ou exibe erro.

---

### Passo 3 — Testar a busca por palavra-chave "reagente"

**O que fazer:** Localize o campo de busca por texto (geralmente no topo da lista, pode ter um ícone de lupa). Digite a palavra `reagente` e pressione Enter ou aguarde a busca automática.

**O que você vai ver na tela:** O campo de busca com a palavra digitada.

**O que acontece depois:** A lista é filtrada para mostrar apenas produtos que contêm a palavra "reagente" no nome ou descrição.

📌 **Nota:** O termo "reagente" busca no nome, fabricante e modelo do produto. Se não houver produto com esse termo nesses campos, a busca não retornará resultados. O filtro por Área/Classe é mais apropriado para buscar por categoria.

✅ **Correto se:** A lista reage à palavra digitada (seja mostrando produtos, seja mostrando "nenhum resultado").
❌ **Problema se:** A busca não funciona ou exibe erro.

---

### Passo 4 — Testar a busca por palavra-chave "hemograma"

**O que fazer:** Limpe o campo de busca anterior e digite `hemograma`. Observe se a lista é filtrada.

**O que você vai ver na tela:** O campo de busca com a nova palavra.

**O que acontece depois:** A lista filtra para produtos relacionados ao hemograma (o produto se chama "Desfibrilador Externo Automático Philips HeartStart FRx").

✅ **Correto se:** O campo de busca aceita a nova palavra e a lista responde.
❌ **Problema se:** O campo de busca trava ou não aceita nova entrada.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- A tela de portfólio carrega sem erros
- O filtro por Área funciona (lista muda ou exibe "sem resultados")
- A busca por "reagente" funciona
- A busca por "hemograma" funciona

**🔴 Sinais de problema:**
- Tela não carrega
- Filtros não têm nenhum efeito na lista
- Campo de busca não aceita texto

---

## [UC-F07] Cadastrar Produto por IA

> **O que este caso de uso faz:** Em vez de preencher manualmente todos os campos de um produto (o que pode ser muito trabalhoso para produtos técnicos complexos), o sistema usa Inteligência Artificial para preencher automaticamente as informações a partir do nome e tipo do produto. Você dá o nome do produto, a IA pesquisa e preenche fabricante, especificações técnicas, classificação e muito mais. Você ainda pode ajustar o que a IA trouxer.

> **V8 — Upload em Massa por IA disponível (F02-03):** Além do cadastro 1-a-1 deste UC, em **Configurações → Portfolio → aba "Cadastro por IA"** você pode arrastar **vários PDFs/DOCX de uma vez** (até 50). A IA classifica cada arquivo (catálogo, manual, registro ANVISA, ficha técnica) e tenta extrair: nome do produto, fabricante, modelo, área/classe/subclasse. Você revisa em lote e confirma antes de salvar. Card destacado:
>
> > 🤖 **Upload em Lote por IA (NOVO)**
> > Arraste vários catálogos/manuais/registros — IA classifica e extrai dados de cada produto. Você revisa antes de salvar.
>
> Para validar essa funcionalidade complementar, ver UC-ARN-11 (Sprint 10). Neste UC-F07 vamos focar no fluxo individual.

> **V8 — Aceite IA + log de auditoria (F03-03):** Antes de salvar produto criado por IA, você precisa marcar o checkbox **"Aceito os dados extraídos pela IA"**. Esse aceite é registrado em trilha de auditoria.

**Onde:** Menu lateral → Configurações → Portfólio → Novo Produto (ou botão "+ Produto")
**Quanto tempo leva:** 5 a 10 minutos (a IA pode levar até 60 segundos para responder)

---

### Antes de começar

- Certifique-se de que o sistema está conectado à internet (a IA precisa acessar serviços externos).
- Tenha paciência: a IA pode levar entre 20 e 60 segundos para processar o produto. Não clique em outros botões enquanto aguarda.
- Você vai cadastrar um produto de diagnóstico in vitro (reagente para glicose), que é o produto principal da Bio-Hosp.

---

### Passo 1 — Abrir o formulário de cadastro de novo produto

**O que fazer:** Na tela de Portfólio, clique no botão para adicionar um novo produto (pode ser "Novo Produto", "+ Adicionar", ou um botão com ícone de mais).

**O que você vai ver na tela:** Um formulário de cadastro de produto. Pode ser em uma nova página ou em um modal sobreposto à lista.

**O que acontece depois:** O formulário de novo produto é exibido, com campos em branco.

✅ **Correto se:** O formulário abriu e está em branco, pronto para receber dados.
❌ **Problema se:** O formulário não abre, ou abre com erro.

---

### Passo 2 — Preencher os dados básicos do produto para a IA processar

**O que fazer:** Preencha os campos que a IA vai usar como base para sua pesquisa. O mais importante é o nome do produto e a classificação.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo de Documento / Entrada | `Instruções de Uso / IFU` |
| Arquivo | qualquer PDF da pasta `docs/documentos_sintetizados/` |
| Nome do Produto | `Monitor Multiparâmetro Nihon Kohden BSM-3000` |
| Área | `Equipamentos Médico-Hospitalares` |
| Classe | `Monitorização Multiparamétrica` |
| Subclasse | `Monitor Multiparâmetro` |

> **V4 — sobre o campo NCM:** o NCM tem máscara automática `9999.99.99` (8 dígitos). Digite **só os 8 dígitos** (ex: `90181990`) e os pontos aparecem sozinhos. Não cole `9018.19.90` direto — o input só aceita os números.

**O que acontece depois:** Os campos básicos estão preenchidos. O formulário ainda não foi enviado para a IA.

✅ **Correto se:** Todos os campos estão preenchidos e nenhum campo obrigatório está em vermelho.
❌ **Problema se:** A subclasse "Monitor Multiparâmetro" não existe na lista, ou a área não tem a classe "Monitorização Multiparamétrica".

---

### Passo 3 — Aguardar o processamento da IA

> **V4 — Aviso importante (comportamento atual da IA):** se você já criou um produto manualmente antes de subir o arquivo (ex: salvou "Monitor Multiparâmetro" para preencher NCM e classificação primeiro), a IA pode **criar um SEGUNDO produto** com nome similar a partir do arquivo, em vez de complementar o produto existente. Esse comportamento será corrigido em uma versão futura. **Para esta validação V4:** suba o arquivo IA **antes** de salvar manualmente, ou aceite que dois produtos vão aparecer e marque um deles para exclusão. Reporte se a duplicidade ocorrer.

**O que fazer:** Clique no botão de confirmar ou enviar (pode ser "Cadastrar com IA", "Processar", "Salvar e Analisar"). Após clicar, **aguarde** — não clique em mais nada.

**O que você vai ver na tela:** Um indicador de carregamento (spinner, barra de progresso, ou mensagem "Processando..."). A tela pode ficar "ocupada" enquanto a IA trabalha.

📌 **Atenção:** Este processamento pode levar entre 20 e 60 segundos. Aguarde pacientemente até a tela responder. Se depois de 90 segundos nada acontecer, reporte como problema.

**O que acontece depois:** A IA completa o processamento e os campos do produto são preenchidos automaticamente com as informações encontradas. Uma mensagem de sucesso deve aparecer.

📌 **Atenção:** O processamento da IA salva os dados automaticamente no produto. Não há etapa de revisão antes do salvamento — após o processamento, os campos já estarão preenchidos e salvos. Caso algum dado esteja incorreto, você poderá editar manualmente no UC-F08.

✅ **Correto se:** Após o processamento, campos como fabricante, especificações e descrição estão preenchidos automaticamente pela IA.
❌ **Problema se:** A tela fica carregando por mais de 90 segundos, ou aparece mensagem de erro de IA.

---

### Passo 4 — Cadastrar o segundo item: Plano de Contas ERP (sem nome)

**O que fazer:** Ainda no módulo de documentos/produtos, adicione um segundo item com as seguintes características específicas.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo | `Plano de Contas (ERP)` |
| Arquivo | `docs/documentos_sintetizados/sprint1/UC-F07/plano_contas_exemplo.csv` (NOVO em V4) |
| Nome | (deixar em branco — não preencher) |

> **V4 — arquivo de exemplo agora incluso:** o arquivo `plano_contas_exemplo.csv` foi gerado e está em `docs/documentos_sintetizados/sprint1/UC-F07/`. Ele contém 15 produtos hospitalares (monitor multiparâmetro, oxímetro, eletrocardiógrafo, reagentes, etc.) com NCM, fabricante, preço base. Use ele para testar a importação em lote sem precisar inventar dados.

📌 **Atenção:** O nome deve ficar **em branco propositalmente**. Queremos validar que o sistema aceita salvar um documento do tipo "Plano de Contas ERP" sem um nome específico. Esse é um comportamento esperado — este tipo de documento não precisa de nome customizado.

**O que acontece depois:** O item é salvo sem nome, e aparece na lista identificado apenas pelo tipo.

✅ **Correto se:** O sistema aceita salvar sem o campo nome preenchido.
❌ **Problema se:** O sistema exige o nome obrigatoriamente e não permite salvar.

---

### Passo 5 — Importação em lote via Plano de Contas (ERP)

**O que fazer:** O sistema permite importar **múltiplos produtos de uma só vez** a partir de um arquivo de Plano de Contas (ERP) ou Nota Fiscal (NFS). Para testar:

1. Na tela de Portfólio, clique no botão para adicionar um novo produto ("Novo Produto", "+ Adicionar" ou similar)
2. No dropdown **Tipo de Documento**, selecione **Plano de Contas (ERP)**
3. Faça upload de um arquivo `.xlsx`, `.csv` ou `.pdf` que contenha uma lista de produtos/itens
4. Opcionalmente, preencha o nome do produto para direcionar a IA
5. Clique em confirmar/enviar

**O que você vai ver na tela:** O sistema processa o arquivo via IA e extrai cada item individualmente, cadastrando múltiplos produtos de uma só vez.

📌 **Atenção:** O processamento em lote pode levar até 2 minutos dependendo do tamanho do arquivo. Aguarde pacientemente. O mesmo fluxo funciona com o tipo **Nota Fiscal (NFS)** para importar itens de notas fiscais. Os tipos de arquivo aceitos são: `.pdf`, `.xlsx`, `.xls`, `.csv`.

**O que acontece depois:** Vários produtos novos aparecem no portfólio, cada um extraído automaticamente do arquivo enviado.

✅ **Correto se:** O sistema processa o arquivo e cadastra múltiplos produtos automaticamente.
❌ **Problema se:** O upload falha, nenhum produto é criado, ou o sistema só cadastra um item do arquivo.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- O produto `Monitor Multiparâmetro Nihon Kohden BSM-3000` foi cadastrado e aparece no portfólio
- A IA preencheu automaticamente informações do produto (fabricante, especificações ou descrição)
- O item "Plano de Contas ERP" foi salvo sem nome, sem erro
- A importação em lote via Plano de Contas processou e cadastrou múltiplos produtos
- A classificação Área / Classe / Subclasse está correta

**🔴 Sinais de problema:**
- A IA não processa e retorna erro após mais de 90 segundos
- Nenhum campo é preenchido automaticamente pela IA
- O sistema exige nome obrigatório para o Plano de Contas ERP
- A importação em lote não cadastra nenhum produto
- A subclasse "Monitor Multiparâmetro" não está disponível

---

## [UC-F08] Editar Produto do Portfólio

> **O que este caso de uso faz:** Após o cadastro inicial (especialmente quando feito pela IA), é comum precisar complementar ou corrigir informações de um produto. Este UC permite editar todos os campos de um produto já cadastrado: nome, fabricante, modelo, especificações técnicas, código NCM e classificação. Pense nisso como a ficha técnica completa do produto — quanto mais completa, melhor o sistema consegue identificar editais compatíveis.

**Onde:** Menu lateral → Portfólio → clicar no produto → Editar
**Quanto tempo leva:** 8 a 12 minutos

---

### Antes de começar

- O produto `Monitor Multiparâmetro Nihon Kohden BSM-3000` deve estar cadastrado (UC-F07 concluído).
- Você vai atualizar o nome do produto e preencher informações técnicas detalhadas.
- Os dropdowns de **Área**, **Classe** e **Subclasse** dependem de dados cadastrados previamente (UC-F13). Se estiverem vazios, prossiga com os demais campos e retorne após executar o UC-F13.

---

### Passo 1 — Localizar e abrir o produto para edição

**O que fazer:** Na tela de portfólio, localize o produto `Monitor Multiparâmetro Nihon Kohden BSM-3000`. Clique nele para abrir os detalhes, depois localize o botão "Editar" (pode ser um lápis, ou a palavra "Editar").

**O que você vai ver na tela:** O card ou linha do produto na lista de portfólio.

**O que acontece depois:** O formulário de edição do produto abre, mostrando os dados atuais (possivelmente preenchidos pela IA no UC-F07).

✅ **Correto se:** O formulário de edição abre com os dados do produto.
❌ **Problema se:** Não há botão de editar, ou o produto não está na lista.

---

### Passo 2 — Atualizar o nome e dados de identificação

**O que fazer:** Atualize os campos principais do produto com os novos valores.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Nome do Produto | `Monitor Multiparâmetro Nihon Kohden BSM-3000 (Versão Hospitalar)` |
| Fabricante | `Nihon Kohden` |
| Modelo | `BSM-3000 V2` |
| SKU | `NK-BSM3000-V2-BR` |
| NCM | `9018.19.90` |

**O que acontece depois:** Os campos são atualizados com os novos valores.

✅ **Correto se:** Todos os campos aceitar os novos valores sem mensagem de erro.
❌ **Problema se:** O campo NCM rejeita o formato `9018.19.90`, ou o campo SKU tem limite de caracteres que impede o valor.

---

### Passo 3 — Preencher a descrição técnica

**O que fazer:** Localize o campo de Descrição do produto e preencha com o texto abaixo.

**Dado a informar:** `Monitor multiparamétrico de sinais vitais para uso hospitalar adulto e pediátrico, com tela touchscreen 12 polegadas e bateria interna de 4 horas`

**O que acontece depois:** A descrição é preenchida no campo correspondente.

✅ **Correto se:** O campo aceita o texto completo, incluindo o ponto e vírgula.
❌ **Problema se:** O campo tem limite de caracteres que trunca o texto.

---

### Passo 4 — Atualizar a classificação Área / Classe / Subclasse

**O que fazer:** Verifique ou atualize a classificação do produto conforme abaixo. Se os campos já estiverem corretos da IA, apenas confirme.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Área | `Equipamentos Médico-Hospitalares` |
| Classe | `Monitorização Multiparamétrica` |
| Subclasse | `Monitor Multiparâmetro` |

✅ **Correto se:** Os três níveis de classificação estão selecionados corretamente.
❌ **Problema se:** Selecionar a Classe faz a Subclasse ser zerada, ou os valores não existem na lista.

---

### Passo 5 — Preencher as especificações técnicas (REESCRITO em V6)

> **V6 — Correção do bug histórico:** as 8 especificações listadas em V3/V4/V5 (Método GOD-PAP, Comprimento de Onda 505 nm, Linearidade 0–500 mg/dL, Soro/Plasma, Incubação, etc.) eram de **kit reagente bioquímico de glicose**, não fazem sentido para um Monitor Multiparâmetro. V6 substitui pelas 8 especificações **derivadas da Máscara de Campos cadastrada em UC-F13 PARTE 4**.

> **Pré-requisito:** UC-F13 PARTE 4 (Passos 4.1-4.3) deve ter sido executado, configurando a máscara da subclasse "Monitor Multiparâmetro" com os 8 campos. Se não foi, volte e execute antes.

**O que fazer:** Localize a seção de especificações técnicas do produto. **Os 8 campos exibidos derivam automaticamente da Máscara de Campos da subclasse "Monitor Multiparâmetro" configurada em UC-F13 PARTE 4.** Preencha cada um com os valores abaixo.

**O que você vai ver na tela:** Os 8 campos da máscara renderizados dinamicamente — cada um com label do nome configurado, tipo de input correto (texto/decimal/select), unidade e indicação se obrigatório.

**Valores a preencher (8 campos do Monitor Multiparâmetro Nihon Kohden BSM-3000):**

| # | Campo (da máscara) | Valor |
|---|---|---|
| 1 | Tela | `12 polegadas` |
| 2 | Parâmetros Monitorados | `ECG, SpO2, PNI, Temperatura, FC, FR` |
| 3 | Tipo de Paciente | `Adulto, Pediátrico, Neonatal` (selecione múltiplos se permitido, ou o principal) |
| 4 | Bateria Interna | `4` (horas) |
| 5 | Peso | `5,2` (kg) |
| 6 | Alimentação | `100-240` (V — bivolt automático) |
| 7 | Classe ANVISA | `II` |
| 8 | Registro ANVISA | `80129500015` |

📌 **Atenção:** São **8 campos** vindos da máscara — mesma quantidade do V5, mas agora com **conteúdo coerente com o produto**. Se algum campo da máscara não aparecer, volte ao UC-F13 PARTE 4 e confirme que a máscara da subclasse foi salva.

**O que acontece depois:** Todos os 8 valores ficam salvos na seção de especificações do produto.

✅ **Correto se:** Os 8 valores aparecem salvos. Os campos respeitam o tipo da máscara (decimal aceita só números, select mostra opções configuradas).
❌ **Problema se:**
- Aparece menos de 8 campos (a máscara da subclasse não foi configurada)
- Campo "Tipo de Paciente" não tem dropdown com 3 opções (a máscara salvou tipo errado)
- Sistema aceita texto livre num campo decimal (validação UI quebrada)

---

### Passo 6 — Salvar as edições

**O que fazer:** Clique no botão "Salvar Alterações" ou "Confirmar". Aguarde a confirmação.

**O que acontece depois:** Uma mensagem verde de sucesso aparece. O produto fica com todas as informações atualizadas.

✅ **Correto se:** Mensagem de sucesso exibida e nome do produto na lista agora mostra `Monitor Multiparâmetro Nihon Kohden BSM-3000 (Versão Hospitalar)`.
❌ **Problema se:** Erro ao salvar, ou o nome não foi atualizado na lista.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Nome atualizado para `Monitor Multiparâmetro Nihon Kohden BSM-3000 (Versão Hospitalar)`
- Fabricante `Nihon Kohden`, Modelo `BSM-3000 V2`, SKU `NK-BSM3000-V2-BR`, NCM `9018.19.90`
- 8 especificações técnicas salvas, derivadas da Máscara da subclasse (V6 corrigido — eram specs de reagente em V3/V4/V5)
- Registro ANVISA `80129500015` preenchido
- Classificação Área / Classe / Subclasse correta

**🔴 Sinais de problema:**
- Especificações com caracteres especiais (`µL`, `°C`) são rejeitadas
- Nome do produto não foi atualizado após salvar
- O sistema limita o número de especificações técnicas

---

## [UC-F09] Reprocessar IA no Produto

> **O que este caso de uso faz:** Após editar manualmente um produto (como fizemos no UC-F08), pode ser útil pedir para a IA analisar novamente as informações e complementar o que estiver faltando. Este UC testa exatamente isso: a opção "Reprocessar IA" no card de detalhes de um produto já cadastrado. É como pedir uma segunda opinião da IA com as informações mais completas que temos agora.

**Onde:** Portfólio → produto → Card de Detalhes → botão "Reprocessar IA"
**Quanto tempo leva:** 3 a 5 minutos (mais o tempo de processamento da IA, que pode ser até 60 segundos)

---

### Antes de começar

- O produto `Monitor Multiparâmetro Nihon Kohden BSM-3000 (Versão Hospitalar)` deve estar editado e salvo (UC-F08 concluído).
- O produto deve ter um **documento anexado** (manual técnico, IFU ou plano de contas). Se nenhum documento foi enviado durante o UC-F07, o reprocessamento usará apenas a descrição do produto como base, o que pode gerar resultados limitados.

---

### Passo 1 — Abrir o produto e localizar o botão Reprocessar IA

**O que fazer:** Na tela de portfólio, clique no produto `Monitor Multiparâmetro Nihon Kohden BSM-3000 (Versão Hospitalar)` para abrir seus detalhes. No card de detalhes, procure pelo botão "Reprocessar IA", "Analisar com IA" ou similar.

**O que você vai ver na tela:** O card de detalhes completo do produto, com todas as informações preenchidas nos UCs anteriores.

**O que acontece depois:** O botão de reprocessamento fica visível no card de detalhes.

✅ **Correto se:** O botão "Reprocessar IA" está visível e clicável.
❌ **Problema se:** Não há botão de reprocessamento na tela de detalhes.

---

### Passo 2 — Acionar o reprocessamento e aguardar

**O que fazer:** Clique no botão "Reprocessar IA". Aguarde o processamento sem clicar em outros botões.

**O que você vai ver na tela:** Um indicador de carregamento (spinner ou mensagem "Processando...").

📌 **Atenção:** Assim como no UC-F07, a IA pode levar de 20 a 60 segundos para responder. Aguarde pacientemente.

**O que acontece depois:** A IA processa o produto com as informações atualizadas e pode complementar campos que estavam incompletos ou refinar descrições existentes.

✅ **Correto se:** Após o processamento, uma mensagem de conclusão aparece (sucesso ou informativo).
❌ **Problema se:** Após 90 segundos, nada acontece ou aparece mensagem de erro.

---

### Passo 3 — Verificar o resultado do reprocessamento

**O que fazer:** Após o processamento, verifique se houve alguma alteração ou complementação nos dados do produto.

**O que você vai ver na tela:** O card de detalhes do produto, possivelmente com campos atualizados ou uma indicação de que a IA terminou o processamento.

**O que acontece depois:** O produto pode ter informações adicionais ou refinadas. O importante é que o processamento concluiu sem erro.

✅ **Correto se:** O processamento concluiu e o produto ainda tem todas as informações dos passos anteriores (nada foi apagado pela IA).
❌ **Problema se:** A IA apagou informações que foram inseridas manualmente, ou o processamento nunca conclui.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- O botão "Reprocessar IA" existe e funciona
- O processamento conclui em tempo razoável (até 90 segundos)
- As informações manuais do produto não foram apagadas pelo reprocessamento
- Uma mensagem de conclusão foi exibida

**🔴 Sinais de problema:**
- Botão de reprocessamento não existe
- Processamento fica em loop infinito
- IA apaga dados inseridos manualmente

---

## [UC-F10] Busca ANVISA e Busca Web

> **O que este caso de uso faz:** Este módulo busca informações adicionais sobre os produtos em duas fontes externas: o banco de dados da ANVISA (Agência Nacional de Vigilância Sanitária) e a internet (busca web). A busca ANVISA permite verificar o registro oficial de um produto pelo número de registro. A busca web traz informações públicas sobre produtos similares. Isso enriquece a base de dados da empresa com informações oficiais e de mercado.

**Onde:** Portfólio → produto → aba Pesquisa, ou menu Busca ANVISA
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de começar

- O produto `Monitor Multiparâmetro Nihon Kohden BSM-3000 (Versão Hospitalar)` deve estar cadastrado com o registro ANVISA `80129500015`.
- A busca requer conexão com a internet.

> **V4 — Dependências externas (motivo de "0 resultados"):**
>
> A funcionalidade de UC-F10 **depende de duas integrações externas** que podem estar indisponíveis ou não configuradas no ambiente. Antes de reportar como bug, verifique:
>
> **1. Busca ANVISA** — usa o serviço oficial `consultas.anvisa.gov.br/api/consulta`. Limitações:
>    - O número de registro precisa ser **válido** no banco da ANVISA. O `80129500015` usado no tutorial é fictício, então **0 resultados é o esperado** para esse exemplo.
>    - Para validação real, use um registro de produto que sabidamente exista (ex: pegue um da etiqueta de um produto físico no estoque).
>
> **2. Busca Web (Brave Search API)** — requer chave de API ativa em `.env` do backend (`BRAVE_SEARCH_API_KEY`). Limitações:
>    - Se a chave **não está configurada** ou **expirou**, todas as buscas retornam vazio.
>    - Se a chave existir mas excedeu cota mensal, idem.
>    - **Como saber:** peça ao Pasteur para verificar `backend/.env`. Se a chave estiver lá e ativa, a busca funciona.
>
> **Resumo: "0 resultados" geralmente significa (a) registro/termo não existe, (b) chave Brave API ausente/expirada — NÃO é defeito do produto.**

---

### Passo 1 — Localizar a funcionalidade de busca ANVISA

**O que fazer:** No portfólio ou no card de detalhes do produto, localize a aba ou botão "Busca ANVISA", "Pesquisa ANVISA" ou similar.

**O que você vai ver na tela:** Uma seção ou aba com campos para buscar no banco de dados da ANVISA.

✅ **Correto se:** A funcionalidade de busca ANVISA está acessível.
❌ **Problema se:** Não há opção de busca ANVISA na interface.

---

### Passo 2 — Realizar busca por número de registro ANVISA

**O que fazer:** No campo de busca ANVISA, insira o número de registro e nome conforme abaixo. Clique em "Buscar" ou pressione Enter.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Número de Registro ANVISA | `80129500015` |
| Nome do produto (se pedido) | `Kit Glicose BioGlic` |

**O que acontece depois:** O sistema consulta a ANVISA e exibe os resultados encontrados para este registro (ou informa que não foi encontrado — o que é possível pois pode ser um registro fictício para fins de teste).

✅ **Correto se:** O sistema executa a busca e exibe algum resultado (com ou sem dados encontrados) — o importante é não travar.
❌ **Problema se:** O sistema exibe erro técnico ao tentar buscar, ou fica em carregamento infinito.

---

### Passo 3 — Realizar busca web de produto similar

**O que fazer:** Localize a funcionalidade de "Busca Web" (pode estar na mesma tela ou em uma aba separada). Preencha os campos e execute a busca.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Nome para busca | `Kit de Reagentes para Hemograma Completo Nihon Kohden` |
| Fabricante | `Nihon Kohden` |

**O que acontece depois:** O sistema realiza uma busca na internet e exibe resultados de produtos similares encontrados. Os resultados podem ser links, fichas técnicas ou descrições de produtos similares.

✅ **Correto se:** A busca web executa e exibe algum resultado na tela.
❌ **Problema se:** A busca web trava, exibe erro de conexão ou não exibe nenhum resultado após 60 segundos.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- A funcionalidade de Busca ANVISA está disponível e executou
- A funcionalidade de Busca Web está disponível e executou
- Nenhuma das buscas travou o sistema

**🔴 Sinais de problema:**
- Busca ANVISA ou Busca Web causam erro técnico visível
- Sistema trava após iniciar a busca
- A interface não tem estas funcionalidades disponíveis

---

## [UC-F11] Verificar Completude do Produto

> **O que este caso de uso faz:** O sistema calcula automaticamente um "índice de completude" para cada produto — uma porcentagem que indica o quanto a ficha do produto está preenchida. Quanto mais completo, maior a chance de o produto ser bem avaliado em editais. Este UC verifica se o indicador está sendo calculado e exibido corretamente para o produto da Bio-Hosp.

**Onde:** Portfólio → produto → Card de Detalhes (seção de completude ou score)
**Quanto tempo leva:** 2 a 3 minutos

---

### Antes de começar

- O produto `Monitor Multiparâmetro Nihon Kohden BSM-3000 (Versão Hospitalar)` deve estar com todos os dados preenchidos (UCs F07 e F08 concluídos).

> **V4 — cenário negativo recomendado (opcional, mas útil):** se o produto está vindo 100% completo, faça um teste paralelo:
> 1. Abra UC-F08 e **REMOVA** o conteúdo do campo "Fabricante" (apague para deixar vazio).
> 2. Salve.
> 3. Abra UC-F11 — a completude deve **CAIR** (ex: de 100% para ~92%).
> 4. Volte para UC-F08, **restaure** "Nihon Kohden" no campo Fabricante e salve.
>
> Isso valida que o cálculo de completude responde a campos vazios. Se a completude permanecer 100% mesmo com campo vazio, é um defeito.

---

### Passo 1 — Abrir os detalhes do produto e localizar o indicador de completude

**O que fazer:** No portfólio, clique no produto `Monitor Multiparâmetro Nihon Kohden BSM-3000 (Versão Hospitalar)`. No card de detalhes, procure por um indicador de completude, score, porcentagem ou barra de progresso.

**O que você vai ver na tela:** O card de detalhes do produto com um indicador visual de completude (pode ser uma barra, um número percentual, ou um badge colorido).

✅ **Correto se:** O indicador de completude está visível.
❌ **Problema se:** Não há nenhum indicador de completude no card.

---

### Passo 2 — Verificar o valor do indicador geral

**O que fazer:** Observe o valor do indicador geral de completude. Anote a porcentagem exibida.

**O que você vai ver na tela:** Um número percentual ou uma classificação (pode ser um texto como "Bom", "Regular", etc.).

**Resultado esperado:** O indicador geral deve estar entre **70% e 89%**, e a cor do badge deve ser **AMARELA** (intermediário). O sistema usa os seguintes limiares de cor:
- **Verde** (≥ 90%): produto completo
- **Amarelo** (70–89%): produto quase completo
- **Laranja** (40–69%): produto incompleto
- **Vermelho** (< 40%): produto muito incompleto

📌 **Atenção:** Um indicador AMARELO entre 70–89% é o resultado **correto e esperado** para este produto. NÃO é um problema. O produto da Bio-Hosp tem muitas informações preenchidas, mas faltam alguns campos que fariam o score chegar ao verde (≥ 90%). Isso é intencional neste conjunto de dados — estamos validando que o sistema diferencia produtos completos (verde) de produtos com boa mas não total completude (amarelo).

✅ **Correto se:** Indicador entre 70–89% com badge AMARELO.
❌ **Problema se:** Indicador verde (acima de 90%) quando o produto não deveria estar 100% completo, ou indicador vermelho (abaixo de 40%) para um produto com tantos campos preenchidos.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- O indicador de completude está visível no card do produto
- O valor está entre 70% e 89%
- A cor do badge é AMARELA (não verde, não vermelha)

**🔴 Sinais de problema:**
- Indicador mostra 100% ou verde para um produto que não tem todos os campos possíveis preenchidos
- Indicador mostra menos de 65% para um produto com tantas informações
- Não há indicador de completude no sistema

---

## [UC-F12] Visualizar Metadados de Captação

> **O que este caso de uso faz:** Cada produto no portfólio possui metadados de captação — informações que o sistema usa para buscar editais relevantes, como códigos CATMAT (tabela do governo federal para classificação de produtos) e termos de busca (palavras-chave que o sistema vai pesquisar nos editais). Este UC verifica se esses metadados estão associados corretamente ao produto.

**Onde:** Portfólio → produto → aba Captação ou Metadados
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de começar

- O produto `Monitor Multiparâmetro Nihon Kohden BSM-3000 (Versão Hospitalar)` deve estar cadastrado.

> **V4 — Mudança importante (decisão de produto):** os campos **CATMAT, CATSER e Termos de Busca** são **gerados automaticamente pela IA** a partir do nome+especificações do produto. Eles aparecem **read-only** (somente leitura, como badges/tags) na tela de captação. **Você não vai conseguir editá-los manualmente** — esse é o comportamento atual e correto. Para alterar os códigos, é preciso reprocessar o produto via IA (UC-F09) com nome/especificações ajustados, ou cadastrar a subclasse com os códigos desejados (UC-F13).

---

### Passo 1 — Acessar os metadados de captação do produto

**O que fazer:** No card de detalhes do produto, clique na aba ou seção "Captação", "Metadados" ou "Palavras-Chave".

**O que você vai ver na tela:** Uma seção com campos para códigos CATMAT e termos de busca.

✅ **Correto se:** A seção de captação está acessível.
❌ **Problema se:** Não há seção de captação no produto.

---

### Passo 2 — Inserir os códigos CATMAT

**O que fazer:** No campo de códigos CATMAT (podem ser chamados de "Código do Material", "CATMAT" ou "Código SIASG"), insira os códigos abaixo. Podem ser inseridos separados por vírgula ou um de cada vez.

**Dados a informar:** `256` e `258`

**O que acontece depois:** Os códigos CATMAT ficam associados ao produto.

✅ **Correto se:** Os códigos 256 e 258 aparecem salvos nos metadados do produto.
❌ **Problema se:** O campo não aceita múltiplos códigos ou rejeita os valores.

---

### Passo 3 — Inserir os termos de busca

**O que fazer:** No campo de termos de busca (pode ser chamado de "Palavras-Chave", "Termos de Captação" ou "Keywords"), insira os termos listados abaixo, um de cada vez ou separados por vírgula.

**Dados a informar:**
- `reagente glicose`
- `kit glicose`
- `kit bioquimico`
- `reagente laboratorio`

**O que acontece depois:** Os quatro termos ficam listados nos metadados de captação do produto.

✅ **Correto se:** Os quatro termos aparecem salvos.
❌ **Problema se:** O sistema limita o número de termos, ou rejeita termos com mais de uma palavra.

---

### Passo 4 — Salvar os metadados

**O que fazer:** Clique no botão de salvar desta seção.

**O que acontece depois:** Uma mensagem de confirmação aparece.

✅ **Correto se:** Mensagem de sucesso exibida e os dados persistem.
❌ **Problema se:** Os dados somem após salvar.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Códigos CATMAT `256` e `258` associados ao produto
- Quatro termos de busca salvos: `reagente glicose`, `kit glicose`, `kit bioquimico`, `reagente laboratorio`

**🔴 Sinais de problema:**
- Metadados não persistem
- Sistema não aceita múltiplos termos
- A seção de captação não existe no produto

---

## [UC-F14] Configurar Pesos e Limiares de Score

> **O que este caso de uso faz:** Quando o sistema avalia se um edital é bom ou ruim para a empresa, ele usa uma pontuação (score) que leva em conta vários fatores: qualificação técnica, documentação, complexidade, aspectos jurídicos, logística e condições comerciais. Cada fator tem um "peso" na nota final. Este UC permite configurar esses pesos conforme a prioridade da empresa. Também define os limiares de decisão: acima de qual nota vale a pena participar (GO) e abaixo de qual é melhor não participar (NO-GO).

**Onde:** Menu lateral → Parametrização → Pesos e Scores
**Quanto tempo leva:** 8 a 12 minutos

---

### Antes de começar

- Este UC tem dois subcenários obrigatórios, executados na sequência:
  - **Subcenário A:** Testar pesos com soma errada (1.05) — o sistema DEVE bloquear e mostrar erro.
  - **Subcenário B:** Corrigir e salvar com soma correta (1.00) — o sistema DEVE aceitar e salvar.
- A validação mais importante aqui é confirmar que o sistema bloqueia valores inválidos ANTES de aceitar os corretos.

---

### Subcenário A — Testar que o sistema rejeita pesos com soma inválida

---

### Passo 1A — Navegar até Pesos e Limiares

**O que fazer:** No menu lateral, localize a opção "Parametrização" → "Pesos" ou "Score" ou "Configurar Pesos". Clique para abrir.

**O que você vai ver na tela:** Uma tela com campos de peso para cada fator (Técnico, Documental, Complexidade, Jurídico, Logístico, Comercial) e campos de limiar (GO e NO-GO).

✅ **Correto se:** A tela de configuração de pesos carregou com os campos disponíveis.
❌ **Problema se:** A tela não existe ou exibe erro.

---

### Passo 2A — Preencher com pesos que somam 1.05 (inválido)

**O que fazer:** Preencha os campos de peso com os valores abaixo. Note que eles somam **1.05** — um valor inválido (a soma deve sempre ser exatamente 1.00).

**Dados a informar (SOMA ERRADA — para testar o bloqueio):**

| Fator | Peso |
|---|---|
| Técnico | `0.30` |
| Documental | `0.25` |
| Complexidade | `0.10` |
| Jurídico | `0.20` |
| Logístico | `0.10` |
| Comercial | `0.10` |
| **TOTAL** | **1.05** |

📌 **Atenção:** Esses valores são intencionalmente errados. O total dá 1.05, não 1.00. Queremos ver o sistema rejeitar esse cenário.

**O que acontece depois:** O sistema deve mostrar uma mensagem de erro informando que a soma dos pesos não é igual a 1.00 (ou 100%). O botão de salvar deve estar bloqueado ou, ao clicar, a mensagem de erro deve aparecer.

✅ **Correto se:** Uma mensagem de erro clara aparece explicando que a soma dos pesos é inválida, E o sistema NÃO salva os dados com esses pesos.
❌ **Problema se:** O sistema aceita e salva os pesos mesmo com a soma incorreta de 1.05.

---

### Subcenário B — Corrigir e salvar com pesos válidos (soma = 1.00)

---

### Passo 1B — Corrigir o peso de Complexidade

**O que fazer:** No mesmo formulário, altere apenas o campo "Complexidade" de `0.10` para `0.05`. Deixe os demais como estão. A soma agora será 1.00 (valor correto).

**Pesos corretos após a correção:**

| Fator | Peso |
|---|---|
| Técnico | `0.30` |
| Documental | `0.25` |
| Complexidade | `0.05` ← corrigido |
| Jurídico | `0.20` |
| Logístico | `0.10` |
| Comercial | `0.10` |
| **TOTAL** | **1.00** ✅ |

**O que acontece depois:** A mensagem de erro deve desaparecer (se estava sendo exibida em tempo real). O botão de salvar deve ficar habilitado.

✅ **Correto se:** A mensagem de erro sumiu ou o sistema indica que a soma agora está correta.
❌ **Problema se:** A mensagem de erro continua mesmo após a correção.

---

### Passo 2B — Preencher os limiares de decisão

**O que fazer:** Localize os campos de limiar (GO e NO-GO). Preencha para cada fator conforme abaixo.

**Limiares a configurar:**

| Fator | Limiar GO (participar) | Limiar NO-GO (desistir) |
|---|---|---|
| Score Final | ≥ `0.75` | ≤ `0.45` |
| Técnico | ≥ `0.70` | ≤ `0.40` |
| Jurídico | ≥ `0.85` | ≤ `0.55` |

📌 **Atenção:** O limiar GO significa "se o score estiver igual ou acima deste valor, recomenda-se participar". O limiar NO-GO significa "se o score cair abaixo deste valor, é melhor não participar". O sistema usa esses valores para classificar automaticamente cada edital.

**O que acontece depois:** Os campos de limiar estão preenchidos com os valores acima.

✅ **Correto se:** Os campos aceitam os valores decimais sem erro.
❌ **Problema se:** Os campos não aceitam valores entre 0 e 1 (talvez esperem porcentagem, como 75 em vez de 0.75 — nesse caso, tente inserir os valores como 75, 45, 70, 40, 85, 55).

---

### Passo 3B — Salvar os pesos e limiares corretos

**O que fazer:** Clique no botão "Salvar" ou "Confirmar". Aguarde a confirmação.

**O que acontece depois:** Uma mensagem verde de sucesso deve aparecer. Os pesos e limiares ficam salvos.

✅ **Correto se:** Mensagem de sucesso exibida e os valores corretos persistem se você recarregar a tela.
❌ **Problema se:** Mensagem de erro mesmo com a soma correta, ou os dados não persistem.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Subcenário A: O sistema BLOQUEOU os pesos com soma 1.05 (exibiu mensagem de erro e não salvou)
- Subcenário B: O sistema ACEITOU os pesos com soma 1.00
- Pesos salvos: Técnico 0.30, Documental 0.25, Complexidade 0.05, Jurídico 0.20, Logístico 0.10, Comercial 0.10
- Limiares salvos: Final GO ≥ 0.75 / NO-GO ≤ 0.45; Técnico GO ≥ 0.70 / NO-GO ≤ 0.40; Jurídico GO ≥ 0.85 / NO-GO ≤ 0.55

**🔴 Sinais de problema:**
- O sistema aceita a soma 1.05 sem mensagem de erro (isso é um bug grave)
- O sistema rejeita a soma 1.00 (também é um bug)
- Os limiares não persistem após salvar

---

## [UC-F15] Configurar Parâmetros Comerciais

> **O que este caso de uso faz:** Aqui configuramos o "perfil de mercado" da empresa — onde ela quer atuar geograficamente, com qual prazo consegue entregar, com que frequência quer ser notificada de editais, e as informações financeiras de mercado (TAM, SAM, SOM) e de precificação (markup, custos fixos, frete). Esses dados ajudam o sistema a filtrar editais relevantes e a calcular se um edital é economicamente viável.

**Onde:** Menu lateral → Parametrização → Comercial ou Parâmetros Comerciais
**Quanto tempo leva:** 8 a 12 minutos

---

### Antes de começar

- Neste conjunto de dados, a Bio-Hosp atua em **todo o Brasil** — não em estados específicos. Isso é diferente de outras empresas que atuam só em algumas regiões. A validação inclui marcar o checkbox "Todo o Brasil".

---

### Passo 1 — Navegar até os Parâmetros Comerciais

**O que fazer:** No menu lateral, localize "Parametrização" → "Comercial" ou "Parâmetros Comerciais". Clique para abrir.

**O que você vai ver na tela:** Uma tela com seções para abrangência geográfica, prazos, frequência de busca e dados financeiros.

✅ **Correto se:** A tela carregou com os campos disponíveis.
❌ **Problema se:** Erro ao carregar ou página em branco.

---

### Passo 2 — Configurar abrangência geográfica (Todo o Brasil)

**O que fazer:** Localize a seção de abrangência geográfica. Deve haver uma opção para selecionar estados específicos ou marcar "Todo o Brasil" / "Atuar em todo o Brasil". Marque o checkbox "Atuar em todo o Brasil".

**O que você vai ver na tela:** Um mapa ou lista de estados, e um checkbox no topo ou próximo ao título dizendo algo como "Todo o Brasil" ou "Âmbito Nacional".

**Dado a informar:** Marcar ✅ o checkbox "Atuar em todo o Brasil"

📌 **Atenção:** Ao marcar "Atuar em todo o Brasil", todos os estados devem ser automaticamente selecionados ou o campo de seleção de estados deve ser desabilitado (pois não é mais necessário selecionar individualmente). NÃO selecione estados individuais.

**O que acontece depois:** O checkbox fica marcado. O campo de estados pode ser desabilitado ou todos os estados ficam marcados.

✅ **Correto se:** "Todo o Brasil" está marcado e o sistema reconhece abrangência nacional.
❌ **Problema se:** O sistema não tem essa opção e exige selecionar estados individualmente.

---

### Passo 3 — Configurar prazo de entrega e frequência de busca

**O que fazer:** Preencha os campos de prazo e frequência conforme abaixo.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Prazo de Entrega | `15` dias |
| Frequência de Busca de Editais | `Quinzenal` |

**O que acontece depois:** Os campos ficam preenchidos com os valores informados.

✅ **Correto se:** Os campos aceitam os valores.
❌ **Problema se:** O prazo mínimo aceito é maior que 15 dias, ou não há opção quinzenal.

---

### Passo 4 — Preencher os dados de mercado (TAM, SAM, SOM)

**O que fazer:** Localize a seção de dimensionamento de mercado. Esses dados são estimativas do tamanho do mercado em que a empresa atua. Preencha os campos conforme abaixo.

**O que você vai ver na tela:** Três campos financeiros: TAM (mercado total), SAM (mercado endereçável) e SOM (fatia alcançável).

**Dados a informar:**

| Campo | Valor |
|---|---|
| TAM (Mercado Total Disponível) | `R$ 8.500.000.000,00` |
| SAM (Mercado Endereçável) | `R$ 1.700.000.000,00` |
| SOM (Fatia de Mercado Alcançável) | `R$ 95.000.000,00` |

📌 **Atenção:** Os valores são grandes (bilhões e milhões). O sistema deve aceitar esses valores sem truncamento. Se o campo mostrar limite de dígitos, verifique se há um campo em valor simplificado (ex: "4.2 bi" em vez de "4.200.000.000").

**O que acontece depois:** Os três campos ficam preenchidos com os valores financeiros.

✅ **Correto se:** Os valores são aceitos e exibidos corretamente.
❌ **Problema se:** O sistema trunca os valores ou exibe erro para valores acima de certo limite.

---

### Passo 5 — Preencher os parâmetros de precificação

**O que fazer:** Localize a seção de precificação e preencha os campos conforme abaixo.

> **V4 — Mudança de comportamento (campos monetários):** os campos de Markup, Custos Fixos e Frete agora **aceitam ponto e vírgula** (ex: `15000,50` ou `15.000,50`). Não tem mais aquela limitação de digitar só números puros. Use vírgula como separador decimal. Se você acha que o sistema não aceitou, recarregue a página — os valores devem reaparecer corretamente.

**Dados a informar:**

| Campo | Valor (digite assim) |
|---|---|
| Markup | `35` (porcentagem, sem o símbolo %) |
| Custos Fixos | `67000` (ou `67.000,00` se preferir) |
| Frete | `320` (ou `320,00`) |

**O que acontece depois:** Os campos de precificação ficam preenchidos. Após clicar em "Salvar Custos", um **toast verde** aparece **fixo no canto superior direito da tela** com a mensagem "✓ Salvo!" (some sozinho em 3 segundos). Se você fizer scroll, o toast continua visível.

✅ **Correto se:** Todos os campos aceitam os valores sem erro **E** o toast verde aparece após salvar.
❌ **Problema se:** O campo de Markup não aceita porcentagem, OU os valores de custo não aceitam casas decimais, OU não aparece toast nenhum após salvar.

---

### Passo 6 — Selecionar as modalidades de licitação

**O que fazer:** Localize a seção de modalidades de licitação (pode ser chamada de "Modalidades que participa" ou similar). Marque as caixas de seleção conforme abaixo.

**Dados a informar:**

| Modalidade | Marcar? |
|---|---|
| Pregão Eletrônico | ✅ Sim |
| Dispensa de Licitação | ✅ Sim |
| Inexigibilidade | ✅ Sim |

**O que acontece depois:** As três modalidades ficam marcadas.

✅ **Correto se:** As três modalidades estão selecionadas.
❌ **Problema se:** Uma das modalidades não existe na lista, ou o sistema não permite selecionar as três ao mesmo tempo.

---

### Passo 7 — Salvar os parâmetros comerciais

**O que fazer:** Clique no botão "Salvar" ou "Confirmar".

**O que acontece depois:** Uma mensagem de sucesso aparece e todos os parâmetros ficam salvos.

✅ **Correto se:** Mensagem de sucesso e dados persistem.
❌ **Problema se:** Erro ao salvar ou dados não persistem.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- "Atuar em todo o Brasil" está marcado
- Prazo de entrega: 15 dias; Frequência: Quinzenal
- TAM: R$ 8.500.000.000,00; SAM: R$ 1.700.000.000,00; SOM: R$ 95.000.000,00
- Markup: 35%, Custos Fixos: R$ 67.000, Frete: R$ 320
- Três modalidades selecionadas: Pregão Eletrônico, Dispensa, Inexigibilidade

**🔴 Sinais de problema:**
- "Todo o Brasil" não existe como opção
- Valores financeiros grandes são rejeitados ou truncados
- Dados não persistem após salvar

---

## [UC-F16] Gerir Fontes de Busca e Palavras-Chave

> **O que este caso de uso faz:** O sistema monitora portais de compras governamentais (como ComprasNet, PNCP, BEC-SP e outros) para encontrar editais relevantes. Este UC permite configurar quais portais estão ativos e quais palavras-chave e códigos NCM o sistema deve usar na busca. É como configurar um radar de oportunidades — você define onde o radar aponta e o que ele vai procurar.

**Onde:** Menu lateral → Parametrização → Fontes de Busca
**Quanto tempo leva:** 8 a 12 minutos

---

### Antes de começar

- Você vai desativar o ComprasNet durante este teste (para validar que a desativação funciona) e depois pode reativá-lo.
- Os termos de busca são as palavras que o sistema vai procurar nos títulos e objetos dos editais.

⚠️ **IMPORTANTE:** As fontes de busca (ComprasNet, PNCP, etc.) são configurações **globais** — ativar ou desativar uma fonte afeta **todos os usuários e empresas** do sistema. Em ambiente de validação compartilhado, **NÃO desative fontes permanentemente**. Se o teste pedir para desativar, **reative imediatamente após o teste.**

---

### Passo 1 — Navegar até Fontes de Busca

**O que fazer:** No menu lateral, localize "Parametrização" → "Fontes de Busca" ou "Portais de Busca". Clique para abrir.

**O que você vai ver na tela:** Uma lista de portais governamentais disponíveis, cada um com um toggle (botão de liga/desliga) ou checkbox para ativar ou desativar.

✅ **Correto se:** A lista de fontes carregou com os portais e seus respectivos controles de ativação.
❌ **Problema se:** A lista está vazia ou não há controles para ativar/desativar fontes.

---

### Passo 2 — Desativar o ComprasNet

> **V4 — Aviso importante (banco com duplicidade conhecida):** o banco atualmente tem **DUAS entradas** com o nome "ComprasNet" (uma é "ComprasNet" pura, outra é "ComprasNet (Portal de Compras do Governo Federal)"). Se você desativar APENAS uma, ao recarregar a tela pode ver "ComprasNet" voltando a aparecer ativo (referente ao registro irmão). Para esta validação V4: desative as **duas linhas** que tiverem "ComprasNet" no nome. Reporte se identificar a duplicidade.

**O que fazer:** Localize **todas as linhas com "ComprasNet" no nome** na lista de portais. Clique no toggle ou checkbox para desativá-las uma por uma. Cada uma deve mudar de "Ativo" (geralmente verde) para "Inativo" (geralmente cinza ou vermelho).

**O que você vai ver na tela:** Possivelmente 1 ou 2 linhas com "ComprasNet" no nome.

**O que acontece depois:** Todas as linhas "ComprasNet" ficam marcadas como inativas. O sistema não vai mais buscar editais nestes portais (enquanto estiverem desativadas).

✅ **Correto se:** O status de cada linha "ComprasNet" muda para inativo após clicar no toggle E permanece inativo após recarregar a página.
❌ **Problema se:** O toggle não funciona, ou ao recarregar uma das linhas volta para ativo.

---

### Passo 3 — Inserir as palavras-chave de busca

**O que fazer:** Localize a seção de palavras-chave ou termos de busca. Insira todas as palavras-chave listadas abaixo, separadas por vírgula ou uma de cada vez conforme o sistema pedir.

**Dados a informar (keywords):**
```
reagente hematologia
kit diagnostico
reagente bioquimico
controle qualidade laboratorio
glicose enzimatica
hemograma completo
kit elisa
reagente pcr
kit sorologia
medio lote reagente
```

📌 **Atenção:** São 10 palavras-chave ao total. Verifique se o sistema aceita todas elas sem limite artificial de quantidade.

**O que acontece depois:** As palavras-chave ficam listadas na seção correspondente.

✅ **Correto se:** As 10 palavras-chave estão salvas e visíveis.
❌ **Problema se:** O sistema limita a menos de 10 palavras-chave.

---

### Passo 4 — Inserir os códigos NCM para busca

**O que fazer:** Localize a seção de códigos NCM (Nomenclatura Comum do Mercosul). Insira os códigos abaixo.

**Dados a informar (NCMs):**
```
9018.19.90
9019.20.10
9018.90.99
9402.90.20
9018.50.90
```

**O que acontece depois:** Os cinco códigos NCM ficam associados às buscas.

✅ **Correto se:** Os cinco NCMs estão salvos corretamente com o formato `xxxx.xx.xx`.
❌ **Problema se:** O campo NCM não aceita o formato com pontos, ou limita menos de 5 NCMs.

---

### Passo 5 — Salvar as configurações de fontes

**O que fazer:** Clique no botão de salvar.

**O que acontece depois:** Uma mensagem de sucesso aparece.

✅ **Correto se:** Mensagem de sucesso e todas as configurações persistem.
❌ **Problema se:** Os dados somem após salvar.

---

### Passo 6 — (Opcional) Reativar o ComprasNet

**O que fazer:** Se desejar, após confirmar que a desativação funcionou, reative o ComprasNet clicando novamente no toggle para deixá-lo ativo.

📌 **Atenção:** Reativar é opcional para a validação. O importante foi confirmar que a desativação e reativação funcionam. Se a sua equipe usa o ComprasNet, reative-o para não afetar buscas futuras.

✅ **Correto se:** O ComprasNet volta ao status ativo após clicar novamente.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- ComprasNet foi desativado com sucesso (e pode ser reativado)
- 10 palavras-chave estão salvas na seção de busca
- 5 códigos NCM estão salvos com formato correto
- O sistema aceita múltiplas fontes, palavras-chave e NCMs

**🔴 Sinais de problema:**
- Não é possível desativar individualmente uma fonte de busca
- Limite de palavras-chave menor que 10
- Códigos NCM são rejeitados por formato
- Dados não persistem

---

## [UC-F17] Configurar Notificações e Preferências

> **O que este caso de uso faz:** Este é o último passo da configuração da empresa: definir como e quando a empresa quer ser avisada sobre novos editais e eventos do sistema. Aqui configuramos os canais de notificação (email, sistema, SMS), a frequência dos alertas, e as preferências de interface (tema visual, idioma e fuso horário). É a personalização final que garante que o sistema vai funcionar do jeito que a equipe da Bio-Hosp prefere.

**Onde:** Menu lateral → Configurações → Notificações (ou Preferências)
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de começar

- Esta é a última UC do fluxo de configuração da Sprint 1.
- As notificações serão enviadas para o email `licitacoes@biohosp.com.br`.

> **V4 — Mudança importante (persistência corrigida):** a versão V3 tinha um defeito conhecido: ao salvar e-mail, canais (e-mail/sistema/SMS), tema, idioma e fuso, os valores eram persistidos no banco mas, ao recarregar a tela, a UI mostrava os defaults em vez dos valores salvos. **Em V4 isso foi corrigido.** Agora, depois de clicar em "Salvar Notificações" ou "Salvar Preferências", se você sair da tela e voltar, os valores devem permanecer iguais ao que você escolheu.
>
> **Como validar:** após cada save, **recarregue a página** (F5) e verifique se os campos mantêm o que você acabou de salvar. Se voltarem para defaults, é regressão e deve ser reportada.

---

### Passo 1 — Navegar até Notificações e Preferências

**O que fazer:** No menu lateral, localize "Configurações" → "Notificações" ou "Preferências". Clique para abrir.

**O que você vai ver na tela:** Uma tela com opções de canais de notificação, frequência, e preferências de interface.

✅ **Correto se:** A tela carregou com as opções disponíveis.
❌ **Problema se:** Tela em branco ou erro.

---

### Passo 2 — Configurar o endereço de email para notificações

**O que fazer:** Localize o campo de email para notificações. Verifique se já está preenchido com o email da empresa ou insira manualmente.

**Dado a informar:** `licitacoes@biohosp.com.br`

**O que acontece depois:** O email fica configurado como destino das notificações.

✅ **Correto se:** O campo aceita o email e o exibe corretamente.
❌ **Problema se:** O campo rejeita o email por formato inválido.

---

### Passo 3 — Ativar os canais de notificação

**O que fazer:** Ative os três canais de notificação disponíveis marcando os checkboxes ou toggles correspondentes.

**Dados a informar:**

| Canal | Ativar? |
|---|---|
| Email | ✅ Sim |
| Sistema (notificação interna) | ✅ Sim |
| SMS | ✅ Sim |

**O que acontece depois:** Os três canais ficam ativos (geralmente exibidos em verde ou com checkmark).

✅ **Correto se:** Os três canais estão ativos.
❌ **Problema se:** O canal SMS não existe, ou não é possível ativar os três simultaneamente.

---

### Passo 4 — Definir a frequência de notificações

**O que fazer:** Localize o campo de frequência das notificações e selecione a opção semanal.

**Dado a informar:** `Semanal`

**O que acontece depois:** A frequência semanal fica selecionada — a empresa receberá um resumo semanal de editais encontrados.

✅ **Correto se:** A opção "Semanal" está disponível e selecionada.
❌ **Problema se:** A frequência semanal não existe como opção.

---

### Passo 5 — Configurar as preferências de interface

**O que fazer:** Localize a seção de preferências de interface e configure as opções abaixo.

**Dados a informar:**

| Preferência | Valor |
|---|---|
| Tema Visual | `Claro` |
| Idioma | `pt-BR` (Português do Brasil) |
| Fuso Horário | `America/Sao_Paulo` |

📌 **Atenção:** O fuso horário pode estar listado como "Horário de Brasília (BRT)" ou "America/Sao_Paulo" — ambos são válidos e referem-se ao mesmo fuso. Selecione a opção correspondente disponível.

**O que acontece depois:** As preferências ficam configuradas.

✅ **Correto se:** Tema Claro, Idioma Português Brasil e Fuso Horário de São Paulo estão selecionados.
❌ **Problema se:** O idioma pt-BR não existe, ou o fuso horário de São Paulo não está na lista.

---

### Passo 6 — Salvar todas as configurações

**O que fazer:** Clique no botão "Salvar" ou "Confirmar".

**O que acontece depois:** Uma mensagem de sucesso aparece (barra verde "Salvo!" no topo da página). Todas as configurações de notificação e preferências ficam salvas.

✅ **Correto se:** Mensagem de sucesso e configurações persistem.
❌ **Problema se:** Erro ao salvar, ou preferências são perdidas ao recarregar a tela.

---

### Passo 7 — Verificar persistência

**O que fazer:** Após salvar as notificações e preferências, **recarregue a página** (F5 ou Ctrl+R). Verifique se todos os valores salvos permanecem como configurados.

**O que você vai ver na tela:** A página recarrega e exibe as configurações salvas anteriormente.

✅ **Correto se:** Todos os toggles, seleções e campos mantêm os valores salvos após recarregar. Especificamente: email `licitacoes@biohosp.com.br`, canais Email/Sistema/SMS ativos, frequência Semanal, tema Claro, idioma pt-BR, fuso America/Sao_Paulo.
❌ **Problema se:** Algum campo volta ao valor padrão após recarregar — isso indica que o salvamento não persistiu no banco de dados.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Email de notificação: `licitacoes@biohosp.com.br`
- Canais ativos: Email ✅, Sistema ✅, SMS ✅
- Frequência: Semanal
- Tema: Claro
- Idioma: Português do Brasil (pt-BR)
- Fuso Horário: America/Sao_Paulo (Brasília)

**🔴 Sinais de problema:**
- Canal SMS não disponível
- Idioma pt-BR não disponível
- Fuso horário de Brasília não disponível
- Configurações não persistem após salvar

---

## Resumo de Verificações por UC

| UC | O que verificar | Resultado esperado |
|---|---|---|
| UC-F01 | Cadastro principal da empresa | Dados salvos, CNPJ formatado, Facebook vazio sem erro, endereço de Belo Horizonte/MG |
| UC-F02 | Contatos e área padrão | 2 emails, 3 telefones e área "Equipamentos Médico-Hospitalares" salvos |
| UC-F03 | Documentos com badges de validade | Alvará: amarelo; AFE: verde; ISO: verde; Certidão Estadual: vermelho/amarelo |
| UC-F04 | Certidões automáticas e upload PGFN | Frequência quinzenal configurada; certidão PGFN com número `SEFAZ-MG-2026-3301` e validade `15/10/2026` |
| UC-F05 | Dois responsáveis sem Preposto | Fernanda (Rep. Legal) e Dr. Ricardo (Resp. Técnico) — sistema não exige Preposto |
| UC-F06 | Filtros do portfólio funcionando | Filtro por área e busca por "reagente" e "hemograma" respondem corretamente |
| UC-F07 | Cadastro por IA e Plano de Contas sem nome | IA processa em até 90s; item sem nome aceito pelo sistema |
| UC-F08 | Edição completa do produto | Nome atualizado, 11 specs técnicas salvas, NCM e SKU aceitos |
| UC-F09 | Reprocessamento de IA | Botão disponível, processo conclui, dados manuais não são apagados |
| UC-F10 | Busca ANVISA e busca web | Ambas executam sem travar o sistema |
| UC-F11 | Completude do produto em AMARELO | Indicador entre 65–80% com badge amarelo (não verde, não vermelho) |
| UC-F12 | Metadados de captação | CATMAT 256 e 258; 4 termos de busca salvos |
| UC-F13 | Hierarquia de classificação | Área > Diagnóstico; subclasses "Monitor Multiparâmetro" e "Oxímetro de Pulso" existem |
| UC-F14 | Pesos e limiares — dois subcenários | Soma 1.05 bloqueada; soma 1.00 aceita e salva |
| UC-F15 | Parâmetros comerciais com "Todo o Brasil" | Checkbox nacional marcado; TAM/SAM/SOM; 3 modalidades ativas |
| UC-F16 | Fontes de busca, keywords e NCMs | ComprasNet desativado; 10 keywords e 5 NCMs salvos |
| UC-F17 | Notificações e preferências | 3 canais ativos; semanal; tema claro; pt-BR; fuso Brasília |

---

## O que reportar se algo falhar

Se durante a validação você encontrar algo diferente do esperado, relate com as seguintes informações para facilitar a correção:

**1. Qual UC falhou?**
Exemplo: "UC-F03, Passo 2"

**2. O que você esperava ver?**
Exemplo: "O badge do Alvará deveria ser amarelo"

**3. O que apareceu em vez disso?**
Exemplo: "O badge apareceu em verde"

**4. Alguma mensagem de erro apareceu?**
Se sim, copie o texto exato da mensagem ou tire um print da tela.

**5. Em qual passo você estava?**
Exemplo: "Acabei de preencher a data e clicar em Salvar"

**6. O problema aparece toda vez que você tenta, ou só aconteceu uma vez?**
Se aconteceu só uma vez, tente repetir o passo para confirmar se é consistente.

---

> **Dica final:** Faça os UCs na ordem apresentada neste tutorial. Cada UC depende dos dados inseridos nos anteriores. Se pular um UC, pode ser que o próximo não funcione como esperado por falta de dados. Se precisar recomeçar, limpe os dados da Bio-Hosp antes de começar novamente.
