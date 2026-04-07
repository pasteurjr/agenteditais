# Tutorial de Validação Manual — Sprint 1 — Conjunto 2
# Empresa: RP3X Comércio e Representações Ltda.

**Data:** 01/04/2026
**Dados:** dadosempportpar-2.md
**Referência:** CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V2.md
**UCs:** F01–F17 (17 casos de uso)
**Público:** Dono do Produto / Validador de Negócio (sem conhecimento técnico necessário)

---

> **Como usar este tutorial**
>
> Siga cada passo na ordem indicada. Os dados a inserir estão destacados em `código`. As verificações ao final de cada UC dizem exatamente o que deve estar na tela para confirmar que o sistema funcionou corretamente. Quando algo não está como esperado, a seção "Sinais de problema" orienta o que reportar.

---

## Credenciais e Fluxo de Acesso

| Campo | Valor |
|---|---|
| Usuário (Conjunto 2) | valida2@valida.com.br |
| Senha | 123456 |
| Perfil | Superusuário |
| Empresa alvo | RP3X Comércio e Representações Ltda. |

### Pré-requisito — Associar valida2 à empresa RP3X

Este passo deve ser feito UMA VEZ antes de iniciar os UCs:

**Opção A — Via valida1 (recomendado):**
1. Login com `valida1@valida.com.br` / `123456`
2. Menu lateral → "Associar Empresa/Usuario"
3. Selecionar empresa: RP3X Comércio e Representações Ltda.
4. Selecionar usuário: valida2@valida.com.br
5. Papel: admin → clicar "Vincular"

**Opção B — valida2 cria a empresa diretamente:**
1. Login com `valida2@valida.com.br` / `123456`
2. Ao ver a tela de seleção de empresa, a RP3X ainda não existe — selecionar qualquer empresa ou criar nova
3. Menu Empresa → preencher dados da RP3X conforme UC-F01 → salvar
4. A empresa fica associada automaticamente a valida2

### Fluxo de login (após associação)
1. Acessar `http://localhost:5175`
2. Email: `valida2@valida.com.br` / Senha: `123456`
3. Tela de seleção de empresa → clicar "RP3X Comércio e Representações Ltda."
4. Dashboard carrega com RP3X como empresa ativa

### Menus extras visíveis (superusuário)
- **Usuarios** — CRUD de usuários
- **Associar Empresa/Usuario** — vincular usuários a empresas
- **Selecionar Empresa** — trocar empresa ativa

> Esses menus não aparecem para usuários normais (super=False). O tutorial a seguir assume que a empresa RP3X já está associada a valida2.

---

## Índice

- [UC-F01 — Manter Cadastro Principal da Empresa](#uc-f01--manter-cadastro-principal-da-empresa)
- [UC-F02 — Gerir Contatos e Área Padrão](#uc-f02--gerir-contatos-e-área-padrão)
- [UC-F03 — Gerir Documentos da Empresa](#uc-f03--gerir-documentos-da-empresa)
- [UC-F04 — Gerir Certidões Automáticas](#uc-f04--gerir-certidões-automáticas)
- [UC-F05 — Gerir Responsáveis da Empresa](#uc-f05--gerir-responsáveis-da-empresa)
- [UC-F06 — Listar e Filtrar Produtos do Portfólio](#uc-f06--listar-e-filtrar-produtos-do-portfólio)
- [UC-F07 — Cadastrar Produto por IA](#uc-f07--cadastrar-produto-por-ia)
- [UC-F08 — Editar Produto do Portfólio](#uc-f08--editar-produto-do-portfólio)
- [UC-F09 — Reprocessar IA no Produto](#uc-f09--reprocessar-ia-no-produto)
- [UC-F10 — Busca ANVISA e Busca Web](#uc-f10--busca-anvisa-e-busca-web)
- [UC-F11 — Verificar Completude do Produto](#uc-f11--verificar-completude-do-produto)
- [UC-F12 — Visualizar Metadados de Captação](#uc-f12--visualizar-metadados-de-captação)
- [UC-F13 — Gerir Classificação Área/Classe/Subclasse](#uc-f13--gerir-classificação-áreaclassesubclasse)
- [UC-F14 — Configurar Pesos e Limiares de Score](#uc-f14--configurar-pesos-e-limiares-de-score)
- [UC-F15 — Configurar Parâmetros Comerciais](#uc-f15--configurar-parâmetros-comerciais)
- [UC-F16 — Gerir Fontes de Busca e Palavras-Chave](#uc-f16--gerir-fontes-de-busca-e-palavras-chave)
- [UC-F17 — Configurar Notificações e Preferências](#uc-f17--configurar-notificações-e-preferências)
- [Resumo de Verificações por UC](#resumo-de-verificações-por-uc)
- [O que reportar se algo falhar](#o-que-reportar-se-algo-falhar)

---

## [UC-F01] Manter Cadastro Principal da Empresa

> **O que este caso de uso faz:** Aqui você vai preencher o cartão de identidade da empresa no sistema. Essas informações são a base de tudo: nome, CNPJ, endereço e presença digital. Sem esses dados, o sistema não sabe para quem está trabalhando. É como abrir uma ficha cadastral em um cartório — precisa ser feito uma vez, com cuidado, e fica como referência para todos os outros processos.

**Onde:** Menu lateral → Empresa → Cadastro
**Quanto tempo leva:** 5 a 10 minutos

---

### Antes de começar

- Certifique-se de estar logado no sistema. Você deve ver o menu lateral visível com as opções de navegação.
- Tenha em mãos os dados da empresa (eles estão listados neste tutorial — não precisa buscar em outro lugar).
- Se já existir um cadastro anterior de outra empresa (por exemplo, do Conjunto 1), o formulário pode já estar preenchido. Nesse caso, simplesmente apague os valores e insira os da RP3X.

---

### Passo 1 — Navegar até a página de Empresa

> **Nota de acesso:** Ao entrar no sistema com `valida2@valida.com.br`, a tela de seleção de empresa aparece primeiro. Selecione "RP3X Comércio e Representações Ltda." antes de seguir os passos abaixo.

**O que fazer:** No menu lateral à esquerda da tela, localize e clique na opção "Empresa" ou "Cadastro". Isso vai abrir a tela principal de cadastro da empresa.

**O que você vai ver na tela:** Uma página com um formulário dividido em seções (Dados Principais, Redes Sociais, Endereço, etc.). Os campos podem estar em branco ou com dados de outro teste anterior.

**O que acontece depois:** A tela de cadastro da empresa é exibida completamente. Se houver dados anteriores, eles estarão visíveis nos campos.

✅ **Correto se:** A tela de cadastro carregou e você consegue ver campos de texto para preencher.
❌ **Problema se:** A tela exibe uma mensagem de erro, fica em carregamento infinito, ou redireciona para outra página.

---

### Passo 2 — Preencher os dados principais de identificação

**O que fazer:** Preencha os campos da seção de dados principais da empresa, um a um, com as informações abaixo.

**O que você vai ver na tela:** Campos de texto em branco (ou com dados anteriores que você vai substituir). Os campos geralmente são: Razão Social, Nome Fantasia, CNPJ, Inscrição Estadual e Website.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Razão Social | `RP3X Comércio e Representações Ltda.` |
| Nome Fantasia | `RP3X Científica` |
| CNPJ | `68.218.593/0001-09` |
| Inscrição Estadual | `987.654.321.000` |
| Website | `https://www.rp3x.com.br` |

📌 **Atenção:** O campo CNPJ pode ter máscara automática (formatar com pontos e barra enquanto você digita). Digite somente os números — o sistema formata sozinho.

**O que acontece depois:** Conforme você preenche, os campos ficam com os valores inseridos. Nenhuma mensagem aparece ainda — o sistema só confirma quando você clicar em Salvar.

✅ **Correto se:** Todos os campos estão preenchidos com os dados acima, sem mensagem de erro em nenhum deles.
❌ **Problema se:** O campo CNPJ exibe mensagem de "formato inválido" ou fica em vermelho após você terminar de digitar.

---

### Passo 3 — Preencher as redes sociais

**O que fazer:** Localize a seção de Redes Sociais (pode estar logo abaixo dos dados principais ou em uma aba separada chamada "Redes Sociais" ou "Mídias Digitais"). Preencha os campos disponíveis.

**O que você vai ver na tela:** Campos para Instagram, LinkedIn e Facebook (podem haver outros). Todos devem estar em branco inicialmente.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Instagram | `@rp3x.cientifica` |
| LinkedIn | `rp3x-comercio-representacoes` |
| Facebook | (deixar em branco — campo opcional) |

📌 **Atenção:** O Facebook deve ficar **vazio intencionalmente**. Este é um campo opcional e queremos confirmar que o sistema salva corretamente mesmo com ele em branco. Não invente um valor aqui.

**O que acontece depois:** Os campos preenchidos ficam com os valores inseridos. O campo Facebook permanece vazio.

✅ **Correto se:** Instagram e LinkedIn preenchidos; Facebook vazio sem nenhuma mensagem de erro obrigatório.
❌ **Problema se:** O sistema exige preenchimento do Facebook e não permite salvar sem ele.

---

### Passo 4 — Preencher o endereço

**O que fazer:** Localize a seção de Endereço (pode estar em uma aba chamada "Endereço" ou logo abaixo das redes sociais). Preencha todos os campos de endereço.

**O que você vai ver na tela:** Campos de Logradouro, Complemento (ou Conjunto), Cidade, UF (Estado) e CEP.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Logradouro / Endereço | `Rua do Laboratório, 850, Conjunto 12` |
| Cidade | `Ribeirão Preto` |
| UF | `SP` |
| CEP | `14025-080` |

📌 **Atenção:** O campo UF provavelmente é uma lista suspensa (dropdown). Clique nele e selecione "SP" na lista. Se for campo de texto livre, digite `SP`.

**O que acontece depois:** Os campos de endereço estão preenchidos com os dados da RP3X.

✅ **Correto se:** Todos os campos de endereço estão preenchidos corretamente, incluindo o estado SP selecionado.
❌ **Problema se:** O campo CEP exibe mensagem de formato inválido, ou o estado não tem a opção SP disponível.

---

### Passo 5 — Salvar o cadastro

**O que fazer:** Após preencher todos os campos acima, localize o botão de salvar — geralmente chamado "Salvar", "Salvar Alterações" ou "Confirmar". Ele costuma estar no final do formulário ou no topo da página. Clique nele.

**O que você vai ver na tela:** O formulário completamente preenchido com todos os dados da RP3X Comércio e Representações Ltda.

**O que acontece depois:** O sistema processa as informações e exibe uma mensagem de confirmação (geralmente um aviso verde no canto superior direito ou inferior da tela, chamado "toast"). A mensagem pode dizer algo como "Dados salvos com sucesso" ou "Empresa atualizada".

✅ **Correto se:** Uma mensagem verde de confirmação aparece na tela. Os dados continuam visíveis no formulário após salvar.
❌ **Problema se:** Uma mensagem vermelha de erro aparece, ou a tela fica em branco, ou os dados somem após clicar em Salvar.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- A razão social `RP3X Comércio e Representações Ltda.` está exibida no formulário
- O CNPJ `68.218.593/0001-09` está formatado corretamente
- Instagram e LinkedIn preenchidos; Facebook em branco (sem erro)
- Endereço de Ribeirão Preto / SP preenchido
- Uma mensagem verde de "salvo com sucesso" foi exibida

**🔴 Sinais de problema:**
- Mensagem vermelha de erro ao tentar salvar
- O sistema exige o Facebook obrigatoriamente
- Os dados desaparecem após salvar (não persistem)
- O CNPJ não aceita o formato com pontos e barra

---

## [UC-F02] Gerir Contatos e Área Padrão

> **O que este caso de uso faz:** Aqui você cadastra os meios de contato da empresa (emails e telefones) e define qual é a área de atuação principal. Esses dados são usados pelo sistema para enviar notificações de editais encontrados e para filtrar oportunidades relevantes. Pense nisso como a "agenda de contatos" e o "cartão de especialidade" da empresa.

**Onde:** Menu lateral → Empresa → Contatos (ou aba Contatos dentro da página da Empresa)
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de começar

- O cadastro principal da empresa (UC-F01) deve estar salvo. Se ainda não fez, volte ao UC-F01.
- Tenha os emails e telefones prontos — eles estão listados abaixo.

---

### Passo 1 — Navegar até a seção de Contatos

**O que fazer:** Na página da Empresa, procure a aba ou seção chamada "Contatos". Pode estar como uma aba no topo da página ou como um item no menu lateral sob "Empresa".

**O que você vai ver na tela:** Uma seção com campos para adicionar emails e telefones. Pode exibir uma lista vazia (se for o primeiro acesso) ou os contatos de um teste anterior.

**O que acontece depois:** A tela de contatos é exibida, pronta para receber os dados.

✅ **Correto se:** A seção de contatos está visível com campos para email e telefone.
❌ **Problema se:** A página exibe erro ou não há nenhum campo visível para contatos.

---

### Passo 2 — Adicionar os endereços de email

**O que fazer:** Localize o campo ou botão para adicionar email. Pode ser um campo de texto com um botão "Adicionar" ao lado, ou uma lista onde você clica em "+ Email". Adicione os dois emails da RP3X, um de cada vez.

**O que você vai ver na tela:** Uma área para inserir endereços de email, possivelmente com uma lista abaixo mostrando os já cadastrados.

**Dados a informar (adicionar um por vez):**
1. `licitacoes@rp3x.com.br`
2. `diretoria@rp3x.com.br`

**O que acontece depois:** Após adicionar cada email, ele aparece na lista de emails cadastrados. Você deve ver os dois emails listados ao final.

✅ **Correto se:** Os dois emails estão listados na tela sem mensagem de erro de formato.
❌ **Problema se:** O sistema rejeita um dos emails por formato inválido, ou só permite um email.

---

### Passo 3 — Adicionar os telefones

**O que fazer:** Localize o campo para adicionar telefone (similar ao de email). Adicione os três telefones da RP3X, um de cada vez.

**O que você vai ver na tela:** Um campo de telefone com máscara ou sem, e uma lista dos telefones já adicionados.

**Dados a informar (adicionar um por vez):**
1. `(16) 3333-9900` — telefone fixo da empresa
2. `(16) 99888-7766` — celular principal
3. `(16) 99777-5544` — celular secundário

📌 **Atenção:** O sistema pode ter máscara automática para telefone (coloca os parênteses e o hífen automaticamente). Se isso acontecer, basta digitar os números — o formato aparece sozinho.

**O que acontece depois:** Os três telefones aparecem listados na seção de contatos.

✅ **Correto se:** Três telefones estão listados, com os números formatados corretamente.
❌ **Problema se:** O sistema aceita somente um ou dois telefones, ou rejeita o celular (que tem 9 dígitos).

---

### Passo 4 — Definir a Área Padrão de Atuação

**O que fazer:** Localize o campo "Área Padrão" ou "Área de Atuação Principal". Pode ser uma lista suspensa (dropdown) ou um campo de busca. Selecione ou digite a área correta.

**O que você vai ver na tela:** Um campo (provavelmente uma lista) com as opções de área de atuação disponíveis no sistema.

**Dado a informar:** `Diagnóstico in Vitro e Laboratório`

**O que acontece depois:** A área selecionada fica destacada ou exibida no campo. Essa informação vai ser usada para filtrar automaticamente editais relevantes para a RP3X.

✅ **Correto se:** A área "Diagnóstico in Vitro e Laboratório" está selecionada e visível.
❌ **Problema se:** A área não está disponível na lista, ou o campo não salva a seleção.

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
- Dois emails cadastrados: `licitacoes@rp3x.com.br` e `diretoria@rp3x.com.br`
- Três telefones cadastrados: `(16) 3333-9900`, `(16) 99888-7766` e `(16) 99777-5544`
- Área padrão definida como `Diagnóstico in Vitro e Laboratório`
- Mensagem de sucesso foi exibida ao salvar

**🔴 Sinais de problema:**
- Sistema limita o número de emails ou telefones
- A área "Diagnóstico in Vitro e Laboratório" não existe na lista
- Dados não persistem após salvar (somem ao atualizar a página)

---

## [UC-F03] Gerir Documentos da Empresa

> **O que este caso de uso faz:** Este é o arquivo digital da empresa. Aqui você sobe os documentos oficiais (alvarás, autorizações, certidões, certificados) que a empresa precisa apresentar em processos licitatórios. O sistema não apenas guarda os arquivos — ele monitora as datas de validade e sinaliza com cores quando um documento está prestes a vencer ou já vencido. Isso ajuda a empresa a nunca ser reprovada por documentação desatualizada.

**Onde:** Menu lateral → Empresa → Documentos
**Quanto tempo leva:** 10 a 15 minutos

---

### Antes de começar

- O cadastro da empresa (UC-F01) deve estar salvo.
- Você vai fazer upload do arquivo `tests/fixtures/test_document.pdf`. Esse é um arquivo de teste que já existe no sistema — ele simula um documento real. Peça ao responsável técnico para indicar onde esse arquivo está salvo no computador que você está usando, caso não saiba encontrá-lo.
- Você vai cadastrar **quatro documentos** com datas de validade diferentes. Cada data vai gerar um status de cor diferente — isso é intencional e faz parte do que estamos validando.

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
| Arquivo | `tests/fixtures/test_document.pdf` (clique em "Escolher arquivo" e selecione este PDF) |
| Data de Validade | `31/03/2026` |

📌 **Atenção:** A data `31/03/2026` é praticamente hoje (1º de abril de 2026). O sistema deve exibir este documento com um indicador de alerta — geralmente um badge ou ícone AMARELO, indicando que está prestes a vencer ou acabou de vencer. Isso é o comportamento esperado e correto.

**O que acontece depois:** Após salvar, o documento aparece na lista com um badge de status amarelo (pode dizer "Vence", "A vencer" ou similar).

✅ **Correto se:** Documento salvo e exibido na lista com indicador amarelo de alerta.
❌ **Problema se:** O documento não aparece na lista, ou aparece sem nenhum indicador de status de validade.

---

### Passo 3 — Cadastrar o Documento 2: Autorização de Funcionamento ANVISA (válido)

**O que fazer:** Clique novamente no botão para adicionar novo documento.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo de Documento | `Autorização de Funcionamento ANVISA (AFE)` |
| Arquivo | `tests/fixtures/test_document.pdf` |
| Data de Validade | `15/05/2027` |

**O que acontece depois:** Este documento deve aparecer na lista com um indicador VERDE (válido, dentro do prazo).

✅ **Correto se:** Documento salvo com badge verde indicando situação regular.
❌ **Problema se:** Badge aparece em outra cor, ou nenhum badge de status é exibido.

---

### Passo 4 — Cadastrar o Documento 3: Certificado ISO / Acreditação (válido)

**O que fazer:** Clique novamente no botão para adicionar novo documento.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo de Documento | `Certificado ISO / Acreditação` |
| Arquivo | `tests/fixtures/test_document.pdf` |
| Data de Validade | `30/09/2026` |

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
| Arquivo | `tests/fixtures/test_document.pdf` |
| Data de Validade | `31/12/2025` |

📌 **Atenção:** A data `31/12/2025` já passou (estamos em abril de 2026). O sistema deve exibir este documento com um indicador VERMELHO (vencido) ou AMARELO (alerta). Ambas as cores são aceitáveis para um documento já expirado — o importante é que o sistema sinalize o problema visivelmente.

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

> **O que este caso de uso faz:** Certidões são documentos obrigatórios em licitações — prova que a empresa não tem dívidas com o governo federal, estadual, municipal, trabalhista, etc. Buscá-las manualmente em cada site é demorado e propenso a erros. Este módulo automatiza essa busca usando o CNPJ da empresa. Além disso, permite fazer upload manual quando a busca automática não consegue o documento. Aqui também configuramos com que frequência o sistema renova essas certidões automaticamente.

**Onde:** Menu lateral → Empresa → Certidões
**Quanto tempo leva:** 8 a 12 minutos

---

### Antes de começar

- O CNPJ da RP3X deve estar cadastrado (UC-F01 concluído).
- A busca automática requer conexão com a internet — verifique se o computador está online.
- Se a busca automática demorar mais de 30 segundos sem resposta, use o upload manual conforme descrito no Passo 4. Isso é normal em horários de pico dos sites governamentais.

---

### Passo 1 — Navegar até a seção de Certidões

**O que fazer:** No menu lateral ou abas da página da Empresa, clique em "Certidões" ou "Certidões Automáticas".

**O que você vai ver na tela:** Uma tela com a lista de certidões disponíveis para busca automática, e provavelmente um campo mostrando o CNPJ da empresa que será consultado.

**O que acontece depois:** A tela de certidões é exibida com o CNPJ `68.218.593/0001-09` já preenchido automaticamente (vindo do cadastro).

✅ **Correto se:** O CNPJ da RP3X está preenchido automaticamente.
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

### Passo 3 — Iniciar a busca automática de certidões

**O que fazer:** Clique no botão "Buscar Certidões", "Consultar" ou similar. O sistema vai acessar os sites governamentais usando o CNPJ da RP3X e tentar baixar as certidões automaticamente.

**O que você vai ver na tela:** O botão de busca. Possivelmente um indicador de progresso enquanto a busca está acontecendo.

**O que acontece depois:** O sistema tenta conectar com os sites governamentais. Esse processo pode levar de 10 a 30 segundos. Algumas certidões podem ser encontradas automaticamente; outras podem falhar se o site governamental estiver fora do ar.

📌 **Atenção:** Como o CNPJ `68.218.593/0001-09` é fictício (usado apenas para testes), é provável que a busca automática não retorne documentos reais dos sites governamentais. Isso é esperado. O próximo passo mostra como fazer o upload manual nesse caso.

✅ **Correto se:** O sistema tenta a busca e exibe o resultado (seja com certidões encontradas ou com mensagem de que não encontrou).
❌ **Problema se:** O sistema trava indefinidamente (mais de 60 segundos sem resposta) ou exibe um erro fatal de sistema.

---

### Passo 4 — Fazer upload manual de certidão (PGFN)

**O que fazer:** Localize a certidão da PGFN (Procuradoria-Geral da Fazenda Nacional) na lista. Clique no botão de upload manual ao lado dela (pode ser um ícone de upload, nuvem ou a palavra "Upload"). Um formulário deve abrir.

**O que você vai ver na tela:** Um modal ou formulário para upload manual de certidão, com campos para arquivo, data de validade e número da certidão.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Arquivo | `tests/fixtures/test_document.pdf` |
| Data de Validade | `30/09/2026` |
| Número da Certidão | `PGFN-2025-98765` |

**O que acontece depois:** O arquivo é enviado e a certidão aparece na lista com status "Upload manual" e os dados informados.

✅ **Correto se:** A certidão PGFN aparece na lista com a data de validade `30/09/2026` e o número `PGFN-2025-98765`.
❌ **Problema se:** O upload falha ou os dados não aparecem na lista após salvar.

---

### Passo 5 — Verificar e editar os detalhes da certidão via modal

**O que fazer:** Após o upload, clique na certidão PGFN para abrir seus detalhes ou clique em um botão de edição (lápis, "Editar" ou similar).

**O que você vai ver na tela:** Um modal com os detalhes da certidão que você acabou de cadastrar.

**Verificar se os dados estão corretos:**

| Campo | Valor esperado |
|---|---|
| Status | `Upload manual` |
| Data de Validade | `30/09/2026` |
| Número | `PGFN-2025-98765` |
| Órgão | `Procuradoria-Geral da Fazenda Nacional` |

**O que acontece depois:** Se os dados estiverem corretos, feche o modal. Se precisar corrigir algum campo, edite e salve.

✅ **Correto se:** Todos os quatro campos estão corretos conforme a tabela acima.
❌ **Problema se:** O campo Órgão está vazio ou com nome diferente, ou a data está incorreta.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- A seção de certidões exibe a lista de certidões disponíveis para a empresa
- A frequência de atualização está configurada como `Quinzenal`
- A certidão PGFN aparece com status "Upload manual", data `30/09/2026` e número `PGFN-2025-98765`
- O órgão está identificado como `Procuradoria-Geral da Fazenda Nacional`

**🔴 Sinais de problema:**
- A tela de certidões não carrega ou exibe erro
- Não há opção de upload manual
- Os dados da certidão não persistem após salvar
- A frequência quinzenal não está disponível

---

## [UC-F05] Gerir Responsáveis da Empresa

> **O que este caso de uso faz:** Em licitações, é obrigatório identificar quem assina documentos e quem é responsável técnico pelos produtos. Este módulo permite cadastrar as pessoas que representam a empresa — o representante legal (quem assina contratos) e o responsável técnico (quem responde pela qualidade e conformidade dos produtos). Esses dados aparecem automaticamente nos documentos gerados pelo sistema.

**Onde:** Menu lateral → Empresa → Responsáveis
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de começar

- O cadastro principal da empresa deve estar salvo.
- Neste conjunto de dados, vamos cadastrar **apenas dois responsáveis** (sem Preposto). Isso valida que o sistema funciona corretamente sem o terceiro tipo de responsável.

---

### Passo 1 — Navegar até a seção de Responsáveis

**O que fazer:** No menu lateral ou abas da página da Empresa, clique em "Responsáveis".

**O que você vai ver na tela:** Uma lista de responsáveis (possivelmente vazia) e um botão para adicionar novo responsável.

**O que acontece depois:** A seção de responsáveis é exibida.

✅ **Correto se:** A tela de responsáveis carregou e há botão para adicionar.
❌ **Problema se:** Tela em branco ou erro ao carregar.

---

### Passo 2 — Cadastrar o Responsável 1: Representante Legal

**O que fazer:** Clique no botão para adicionar novo responsável. Um formulário deve abrir com campos para Tipo, Nome, Cargo, Email e Telefone.

**O que você vai ver na tela:** Um formulário ou modal de cadastro de responsável.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo | `Representante Legal` |
| Nome | `Fernanda Lima Costa` |
| Cargo | `Sócia-Administradora` |
| Email | `fernanda.costa@rp3x.com.br` |
| Telefone | `(16) 99888-7766` |

**O que acontece depois:** Após salvar, a Fernanda Lima Costa aparece na lista de responsáveis com o tipo "Representante Legal".

✅ **Correto se:** O responsável aparece na lista com nome e tipo corretos.
❌ **Problema se:** O formulário não aceita o tipo "Representante Legal" ou os dados não são salvos.

---

### Passo 3 — Cadastrar o Responsável 2: Responsável Técnico

**O que fazer:** Clique novamente no botão para adicionar novo responsável.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo | `Responsável Técnico` |
| Nome | `Dr. Ricardo Alves Nunes` |
| Cargo | `Farmacêutico-Bioquímico Responsável` |
| Email | `ricardo.nunes@rp3x.com.br` |
| Telefone | `(16) 99777-5544` |

**O que acontece depois:** O Dr. Ricardo aparece na lista de responsáveis com o tipo "Responsável Técnico". A lista agora tem dois itens.

✅ **Correto se:** Dois responsáveis listados, cada um com seu tipo correto.
❌ **Problema se:** O sistema exige um Preposto para salvar, ou rejeita o cargo "Farmacêutico-Bioquímico Responsável".

---

### Passo 4 — Confirmar que não existe terceiro responsável (sem Preposto)

**O que fazer:** Verifique a lista de responsáveis. Confirme que há exatamente dois, sem um terceiro do tipo "Preposto".

**O que você vai ver na tela:** Dois cards ou linhas na lista: Fernanda Lima Costa (Representante Legal) e Dr. Ricardo Alves Nunes (Responsável Técnico).

📌 **Atenção:** A ausência do Preposto é intencional. Queremos confirmar que o sistema não obriga o cadastro de um Preposto para funcionar. Se o sistema exibir um aviso dizendo que o Preposto é obrigatório, isso deve ser reportado como problema.

✅ **Correto se:** Exatamente dois responsáveis na lista, sem mensagem de alerta exigindo um Preposto.
❌ **Problema se:** O sistema exibe erro ou aviso dizendo que um Preposto é obrigatório.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Dois responsáveis cadastrados na lista
- Fernanda Lima Costa → tipo Representante Legal, cargo Sócia-Administradora
- Dr. Ricardo Alves Nunes → tipo Responsável Técnico, cargo Farmacêutico-Bioquímico Responsável
- Sistema não exige um terceiro responsável (Preposto)

**🔴 Sinais de problema:**
- Sistema obriga cadastro de Preposto
- Os dados dos responsáveis não persistem
- O tipo "Responsável Técnico" não existe na lista de opções

---

## [UC-F06] Listar e Filtrar Produtos do Portfólio

> **O que este caso de uso faz:** O portfólio de produtos é o catálogo de tudo que a empresa vende ou pode oferecer em licitações. Esta tela permite visualizar todos os produtos cadastrados e filtrá-los por área de atuação ou palavras-chave. Assim, quando um edital chega, é fácil verificar se a empresa tem o produto certo no portfólio.

**Onde:** Menu lateral → Portfólio
**Quanto tempo leva:** 3 a 5 minutos

---

### Antes de começar

- Para este UC, pode não haver produtos cadastrados ainda (se for o primeiro acesso). Nesse caso, a validação principal é confirmar que a tela carrega corretamente e que os filtros funcionam. Os produtos serão cadastrados nos próximos UCs.
- Se já houver produtos cadastrados de testes anteriores, eles serão visíveis aqui.

---

### Passo 1 — Navegar até o Portfólio

**O que fazer:** No menu lateral, clique em "Portfólio" ou "Produtos".

**O que você vai ver na tela:** A tela de listagem de produtos, possivelmente com cards ou linhas para cada produto. Se não houver produtos, uma mensagem de "nenhum produto encontrado" ou área vazia.

**O que acontece depois:** A tela de portfólio é exibida.

✅ **Correto se:** A tela carregou sem erros.
❌ **Problema se:** Erro 404, tela em branco ou mensagem de erro técnico.

---

### Passo 2 — Testar o filtro por Área

**O que fazer:** Localize o campo de filtro por Área (pode ser um dropdown, uma lista lateral ou um campo de busca). Selecione a área `Diagnóstico in Vitro e Laboratório`.

**O que você vai ver na tela:** Uma lista de produtos sendo filtrada (ou, se não houver produtos ainda, uma área vazia).

**O que acontece depois:** A lista exibe apenas produtos da área selecionada. Se não houver nenhum ainda, aparece uma mensagem como "nenhum produto encontrado para esta área".

✅ **Correto se:** O filtro funciona — a lista muda após selecionar a área.
❌ **Problema se:** O filtro não tem efeito ou exibe erro.

---

### Passo 3 — Testar a busca por palavra-chave "reagente"

**O que fazer:** Localize o campo de busca por texto (geralmente no topo da lista, pode ter um ícone de lupa). Digite a palavra `reagente` e pressione Enter ou aguarde a busca automática.

**O que você vai ver na tela:** O campo de busca com a palavra digitada.

**O que acontece depois:** A lista é filtrada para mostrar apenas produtos que contêm a palavra "reagente" no nome ou descrição.

✅ **Correto se:** A lista reage à palavra digitada (seja mostrando produtos, seja mostrando "nenhum resultado").
❌ **Problema se:** A busca não funciona ou exibe erro.

---

### Passo 4 — Testar a busca por palavra-chave "hematologia"

**O que fazer:** Limpe o campo de busca anterior e digite `hematologia`. Observe se a lista é filtrada.

**O que você vai ver na tela:** O campo de busca com a nova palavra.

**O que acontece depois:** A lista filtra para produtos relacionados à hematologia.

✅ **Correto se:** O campo de busca aceita a nova palavra e a lista responde.
❌ **Problema se:** O campo de busca trava ou não aceita nova entrada.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- A tela de portfólio carrega sem erros
- O filtro por Área funciona (lista muda ou exibe "sem resultados")
- A busca por "reagente" funciona
- A busca por "hematologia" funciona

**🔴 Sinais de problema:**
- Tela não carrega
- Filtros não têm nenhum efeito na lista
- Campo de busca não aceita texto

---

## [UC-F07] Cadastrar Produto por IA

> **O que este caso de uso faz:** Em vez de preencher manualmente todos os campos de um produto (o que pode ser muito trabalhoso para produtos técnicos complexos), o sistema usa Inteligência Artificial para preencher automaticamente as informações a partir do nome e tipo do produto. Você dá o nome do produto, a IA pesquisa e preenche fabricante, especificações técnicas, classificação e muito mais. Você ainda pode ajustar o que a IA trouxer.

**Onde:** Menu lateral → Portfólio → Novo Produto (ou botão "+ Produto")
**Quanto tempo leva:** 5 a 10 minutos (a IA pode levar até 60 segundos para responder)

---

### Antes de começar

- Certifique-se de que o sistema está conectado à internet (a IA precisa acessar serviços externos).
- Tenha paciência: a IA pode levar entre 20 e 60 segundos para processar o produto. Não clique em outros botões enquanto aguarda.
- Você vai cadastrar um produto de diagnóstico in vitro (reagente para glicose), que é o produto principal da RP3X.

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
| Arquivo | `tests/fixtures/test_document.pdf` |
| Nome do Produto | `Kit para Glicose Enzimática BioGlic-100` |
| Área | `Diagnóstico in Vitro e Laboratório` |
| Classe | `Reagentes Bioquímicos` |
| Subclasse | `Reagente para Glicose` |

**O que acontece depois:** Os campos básicos estão preenchidos. O formulário ainda não foi enviado para a IA.

✅ **Correto se:** Todos os campos estão preenchidos e nenhum campo obrigatório está em vermelho.
❌ **Problema se:** A subclasse "Reagente para Glicose" não existe na lista, ou a área não tem a classe "Reagentes Bioquímicos".

---

### Passo 3 — Aguardar o processamento da IA

**O que fazer:** Clique no botão de confirmar ou enviar (pode ser "Cadastrar com IA", "Processar", "Salvar e Analisar"). Após clicar, **aguarde** — não clique em mais nada.

**O que você vai ver na tela:** Um indicador de carregamento (spinner, barra de progresso, ou mensagem "Processando..."). A tela pode ficar "ocupada" enquanto a IA trabalha.

📌 **Atenção:** Este processamento pode levar entre 20 e 60 segundos. Aguarde pacientemente até a tela responder. Se depois de 90 segundos nada acontecer, reporte como problema.

**O que acontece depois:** A IA completa o processamento e os campos do produto são preenchidos automaticamente com as informações encontradas. Uma mensagem de sucesso deve aparecer.

✅ **Correto se:** Após o processamento, campos como fabricante, especificações e descrição estão preenchidos automaticamente pela IA.
❌ **Problema se:** A tela fica carregando por mais de 90 segundos, ou aparece mensagem de erro de IA.

---

### Passo 4 — Cadastrar o segundo item: Plano de Contas ERP (sem nome)

**O que fazer:** Ainda no módulo de documentos/produtos, adicione um segundo item com as seguintes características específicas.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Tipo | `Plano de Contas (ERP)` |
| Arquivo | `tests/fixtures/test_document.pdf` |
| Nome | (deixar em branco — não preencher) |

📌 **Atenção:** O nome deve ficar **em branco propositalmente**. Queremos validar que o sistema aceita salvar um documento do tipo "Plano de Contas ERP" sem um nome específico. Esse é um comportamento esperado — este tipo de documento não precisa de nome customizado.

**O que acontece depois:** O item é salvo sem nome, e aparece na lista identificado apenas pelo tipo.

✅ **Correto se:** O sistema aceita salvar sem o campo nome preenchido.
❌ **Problema se:** O sistema exige o nome obrigatoriamente e não permite salvar.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- O produto `Kit para Glicose Enzimática BioGlic-100` foi cadastrado e aparece no portfólio
- A IA preencheu automaticamente informações do produto (fabricante, especificações ou descrição)
- O item "Plano de Contas ERP" foi salvo sem nome, sem erro
- A classificação Área / Classe / Subclasse está correta

**🔴 Sinais de problema:**
- A IA não processa e retorna erro após mais de 90 segundos
- Nenhum campo é preenchido automaticamente pela IA
- O sistema exige nome obrigatório para o Plano de Contas ERP
- A subclasse "Reagente para Glicose" não está disponível

---

## [UC-F08] Editar Produto do Portfólio

> **O que este caso de uso faz:** Após o cadastro inicial (especialmente quando feito pela IA), é comum precisar complementar ou corrigir informações de um produto. Este UC permite editar todos os campos de um produto já cadastrado: nome, fabricante, modelo, especificações técnicas, código NCM e classificação. Pense nisso como a ficha técnica completa do produto — quanto mais completa, melhor o sistema consegue identificar editais compatíveis.

**Onde:** Menu lateral → Portfólio → clicar no produto → Editar
**Quanto tempo leva:** 8 a 12 minutos

---

### Antes de começar

- O produto `Kit para Glicose Enzimática BioGlic-100` deve estar cadastrado (UC-F07 concluído).
- Você vai atualizar o nome do produto e preencher informações técnicas detalhadas.

---

### Passo 1 — Localizar e abrir o produto para edição

**O que fazer:** Na tela de portfólio, localize o produto `Kit para Glicose Enzimática BioGlic-100`. Clique nele para abrir os detalhes, depois localize o botão "Editar" (pode ser um lápis, ou a palavra "Editar").

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
| Nome do Produto | `Kit para Glicose Enzimática BioGlic-100 Automação` |
| Fabricante | `Wiener Lab Group` |
| Modelo | `BioGlic-100 Auto` |
| SKU | `WL-BG100-AUTO-BR` |
| NCM | `3822.19.90` |

**O que acontece depois:** Os campos são atualizados com os novos valores.

✅ **Correto se:** Todos os campos aceitar os novos valores sem mensagem de erro.
❌ **Problema se:** O campo NCM rejeita o formato `3822.19.90`, ou o campo SKU tem limite de caracteres que impede o valor.

---

### Passo 3 — Preencher a descrição técnica

**O que fazer:** Localize o campo de Descrição do produto e preencha com o texto abaixo.

**Dado a informar:** `Reagente enzimático para dosagem de glicose em equipamentos automáticos; 100 determinações por kit`

**O que acontece depois:** A descrição é preenchida no campo correspondente.

✅ **Correto se:** O campo aceita o texto completo, incluindo o ponto e vírgula.
❌ **Problema se:** O campo tem limite de caracteres que trunca o texto.

---

### Passo 4 — Atualizar a classificação Área / Classe / Subclasse

**O que fazer:** Verifique ou atualize a classificação do produto conforme abaixo. Se os campos já estiverem corretos da IA, apenas confirme.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Área | `Diagnóstico in Vitro e Laboratório` |
| Classe | `Reagentes Bioquímicos` |
| Subclasse | `Reagente para Glicose` |

✅ **Correto se:** Os três níveis de classificação estão selecionados corretamente.
❌ **Problema se:** Selecionar a Classe faz a Subclasse ser zerada, ou os valores não existem na lista.

---

### Passo 5 — Preencher as especificações técnicas

**O que fazer:** Localize a seção de especificações técnicas do produto. Pode ser uma tabela onde você adiciona especificações chave-valor, ou campos individuais. Preencha todas as especificações listadas abaixo.

**O que você vai ver na tela:** Uma área para adicionar especificações técnicas, com campos como "Nome da especificação" e "Valor".

**Especificações a preencher:**

| Especificação | Valor |
|---|---|
| Determinações | `100 det/kit` |
| Método | `Enzimático (GOD-PAP)` |
| Amostra | `Soro, plasma` |
| Comprimento de Onda | `505 nm` |
| Linearidade | `0–500 mg/dL` |
| Temperatura | `37°C` |
| Incubação | `5 minutos` |
| Conservação | `2–8°C` |
| Validade do Kit | `24 meses` |
| Volume | `10 µL` |
| Registro ANVISA | `10386890001` |

📌 **Atenção:** São 11 especificações técnicas ao total. Adicione uma de cada vez. Alguns sistemas têm um botão "+ Adicionar Especificação" que você clica para cada nova linha.

**O que acontece depois:** Todas as especificações aparecem listadas na seção de especificações técnicas do produto.

✅ **Correto se:** As 11 especificações aparecem salvas corretamente.
❌ **Problema se:** O sistema limita o número de especificações, ou não aceita caracteres especiais como `µL` ou `°C`.

---

### Passo 6 — Salvar as edições

**O que fazer:** Clique no botão "Salvar Alterações" ou "Confirmar". Aguarde a confirmação.

**O que acontece depois:** Uma mensagem verde de sucesso aparece. O produto fica com todas as informações atualizadas.

✅ **Correto se:** Mensagem de sucesso exibida e nome do produto na lista agora mostra `Kit para Glicose Enzimática BioGlic-100 Automação`.
❌ **Problema se:** Erro ao salvar, ou o nome não foi atualizado na lista.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Nome atualizado para `Kit para Glicose Enzimática BioGlic-100 Automação`
- Fabricante `Wiener Lab Group`, Modelo `BioGlic-100 Auto`, SKU `WL-BG100-AUTO-BR`, NCM `3822.19.90`
- 11 especificações técnicas salvas
- Registro ANVISA `10386890001` preenchido
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

- O produto `Kit para Glicose Enzimática BioGlic-100 Automação` deve estar editado e salvo (UC-F08 concluído).

---

### Passo 1 — Abrir o produto e localizar o botão Reprocessar IA

**O que fazer:** Na tela de portfólio, clique no produto `Kit para Glicose Enzimática BioGlic-100 Automação` para abrir seus detalhes. No card de detalhes, procure pelo botão "Reprocessar IA", "Analisar com IA" ou similar.

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

- O produto `Kit para Glicose Enzimática BioGlic-100 Automação` deve estar cadastrado com o registro ANVISA `10386890001`.
- A busca requer conexão com a internet.

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
| Número de Registro ANVISA | `10386890001` |
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
| Nome para busca | `Kit de Reagentes para Hemograma Completo Sysmex` |
| Fabricante | `Sysmex` |

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

> **O que este caso de uso faz:** O sistema calcula automaticamente um "índice de completude" para cada produto — uma porcentagem que indica o quanto a ficha do produto está preenchida. Quanto mais completo, maior a chance de o produto ser bem avaliado em editais. Este UC verifica se o indicador está sendo calculado e exibido corretamente para o produto da RP3X.

**Onde:** Portfólio → produto → Card de Detalhes (seção de completude ou score)
**Quanto tempo leva:** 2 a 3 minutos

---

### Antes de começar

- O produto `Kit para Glicose Enzimática BioGlic-100 Automação` deve estar com todos os dados preenchidos (UCs F07 e F08 concluídos).

---

### Passo 1 — Abrir os detalhes do produto e localizar o indicador de completude

**O que fazer:** No portfólio, clique no produto `Kit para Glicose Enzimática BioGlic-100 Automação`. No card de detalhes, procure por um indicador de completude, score, porcentagem ou barra de progresso.

**O que você vai ver na tela:** O card de detalhes do produto com um indicador visual de completude (pode ser uma barra, um número percentual, ou um badge colorido).

✅ **Correto se:** O indicador de completude está visível.
❌ **Problema se:** Não há nenhum indicador de completude no card.

---

### Passo 2 — Verificar o valor do indicador geral

**O que fazer:** Observe o valor do indicador geral de completude. Anote a porcentagem exibida.

**O que você vai ver na tela:** Um número percentual ou uma classificação (pode ser um texto como "Bom", "Regular", etc.).

**Resultado esperado:** O indicador geral deve estar entre **65% e 80%**, e a cor do badge deve ser **AMARELA** (intermediário).

📌 **Atenção:** Um indicador AMARELO entre 65–80% é o resultado **correto e esperado** para este produto. NÃO é um problema. O produto da RP3X tem muitas informações preenchidas, mas faltam alguns campos que fariam o score chegar ao verde. Isso é intencional neste conjunto de dados — estamos validando que o sistema diferencia produtos completos (verde) de produtos com boa mas não total completude (amarelo).

✅ **Correto se:** Indicador entre 65–80% com badge AMARELO.
❌ **Problema se:** Indicador verde (acima de 80%) quando o produto não deveria estar 100% completo, ou indicador vermelho (abaixo de 65%) para um produto com tantos campos preenchidos.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- O indicador de completude está visível no card do produto
- O valor está entre 65% e 80%
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

- O produto `Kit para Glicose Enzimática BioGlic-100 Automação` deve estar cadastrado.

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

## [UC-F13] Gerir Classificação Área/Classe/Subclasse

> **O que este caso de uso faz:** O sistema possui uma hierarquia de classificação de produtos: Área → Classe → Subclasse. É como uma árvore de categorias — similar ao que você vê em e-commerces, onde produtos são organizados em departamentos e subseções. Este UC verifica se a estrutura de classificação está funcionando corretamente para as categorias da RP3X — permitindo navegar, expandir e visualizar os níveis da hierarquia.

**Onde:** Menu lateral → Parametrização → Classificação (ou Portfólio → Classificação)
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de começar

- As classificações podem já existir no sistema (cadastradas durante os UCs anteriores) ou precisar ser criadas aqui.

---

### Passo 1 — Navegar até a gestão de classificações

**O que fazer:** Localize no menu lateral a opção de Classificação ou Categorias (pode estar em "Parametrização" ou "Configurações"). Clique para abrir.

**O que você vai ver na tela:** Uma árvore ou lista de áreas disponíveis no sistema.

✅ **Correto se:** A tela de classificações carregou com uma estrutura de árvore ou lista.
❌ **Problema se:** A tela exibe erro ou não há estrutura visível.

---

### Passo 2 — Expandir a área de Diagnóstico in Vitro e Laboratório

**O que fazer:** Localize a área `Diagnóstico in Vitro e Laboratório` na lista. Clique na seta ou no nome para expandir e ver as classes dentro dela.

**O que você vai ver na tela:** A área listada, possivelmente com uma seta ou ícone indicando que pode ser expandida.

**O que acontece depois:** A área se expande mostrando as classes disponíveis, entre elas `Reagentes Bioquímicos` e `Reagentes e Kits Diagnósticos`.

✅ **Correto se:** A área expande e mostra classes como `Reagentes Bioquímicos`.
❌ **Problema se:** A área não expande ou não tem classes dentro dela.

---

### Passo 3 — Expandir a Classe "Reagentes Bioquímicos" e verificar a Subclasse

**O que fazer:** Dentro da área expandida, localize a classe `Reagentes Bioquímicos` e expanda-a para ver as subclasses.

**O que você vai ver na tela:** A classe com suas subclasses listadas abaixo.

**O que verificar:** A subclasse `Reagente para Glicose` deve estar visível dentro de `Reagentes Bioquímicos`.

**Dado a verificar:** `Área > Diagnóstico in Vitro e Laboratório → Classe > Reagentes Bioquímicos → Subclasse > Reagente para Glicose`

📌 **Atenção:** Confirme que o NCM `3822.19.90` está associado a esta classificação ou ao produto que usa ela.

✅ **Correto se:** A subclasse `Reagente para Glicose` está visível e acessível.
❌ **Problema se:** A subclasse não existe dentro da classe.

---

### Passo 4 — Expandir também a Classe "Reagentes e Kits Diagnósticos"

**O que fazer:** Ainda na área `Diagnóstico in Vitro e Laboratório`, localize a classe `Reagentes e Kits Diagnósticos` e expanda-a.

**O que verificar:** A subclasse `Kit de Hematologia` deve estar visível dentro de `Reagentes e Kits Diagnósticos`.

**Dado a verificar:** `Área > Diagnóstico in Vitro e Laboratório → Classe > Reagentes e Kits Diagnósticos → Subclasse > Kit de Hematologia`

✅ **Correto se:** A subclasse `Kit de Hematologia` está visível.
❌ **Problema se:** A subclasse não existe ou a classe não pode ser expandida.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Área `Diagnóstico in Vitro e Laboratório` existe e pode ser expandida
- Classe `Reagentes Bioquímicos` → Subclasse `Reagente para Glicose` existe
- Classe `Reagentes e Kits Diagnósticos` → Subclasse `Kit de Hematologia` existe
- NCM `3822.19.90` associado à classificação ou ao produto correspondente

**🔴 Sinais de problema:**
- As subclasses não existem na hierarquia
- A árvore de classificação não expande
- A área `Diagnóstico in Vitro e Laboratório` não existe no sistema

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

- Neste conjunto de dados, a RP3X atua em **todo o Brasil** — não em estados específicos. Isso é diferente de outras empresas que atuam só em algumas regiões. A validação inclui marcar o checkbox "Todo o Brasil".

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
| TAM (Mercado Total Disponível) | `R$ 4.200.000.000,00` |
| SAM (Mercado Endereçável) | `R$ 950.000.000,00` |
| SOM (Fatia de Mercado Alcançável) | `R$ 62.000.000,00` |

📌 **Atenção:** Os valores são grandes (bilhões e milhões). O sistema deve aceitar esses valores sem truncamento. Se o campo mostrar limite de dígitos, verifique se há um campo em valor simplificado (ex: "4.2 bi" em vez de "4.200.000.000").

**O que acontece depois:** Os três campos ficam preenchidos com os valores financeiros.

✅ **Correto se:** Os valores são aceitos e exibidos corretamente.
❌ **Problema se:** O sistema trunca os valores ou exibe erro para valores acima de certo limite.

---

### Passo 5 — Preencher os parâmetros de precificação

**O que fazer:** Localize a seção de precificação e preencha os campos conforme abaixo.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Markup | `35%` |
| Custos Fixos | `R$ 42.000` |
| Frete | `R$ 180` |

**O que acontece depois:** Os campos de precificação ficam preenchidos.

✅ **Correto se:** Todos os campos aceitam os valores sem erro.
❌ **Problema se:** O campo de Markup não aceita porcentagem, ou os valores de custo não aceitam casas decimais.

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
- TAM: R$ 4.200.000.000,00; SAM: R$ 950.000.000,00; SOM: R$ 62.000.000,00
- Markup: 35%, Custos Fixos: R$ 42.000, Frete: R$ 180
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

---

### Passo 1 — Navegar até Fontes de Busca

**O que fazer:** No menu lateral, localize "Parametrização" → "Fontes de Busca" ou "Portais de Busca". Clique para abrir.

**O que você vai ver na tela:** Uma lista de portais governamentais disponíveis, cada um com um toggle (botão de liga/desliga) ou checkbox para ativar ou desativar.

✅ **Correto se:** A lista de fontes carregou com os portais e seus respectivos controles de ativação.
❌ **Problema se:** A lista está vazia ou não há controles para ativar/desativar fontes.

---

### Passo 2 — Desativar o ComprasNet

**O que fazer:** Localize o ComprasNet na lista de portais. Clique no toggle ou checkbox para desativá-lo. Deve mudar de "Ativo" (geralmente verde) para "Inativo" (geralmente cinza ou vermelho).

**O que você vai ver na tela:** O ComprasNet na lista com seu status de ativação.

**O que acontece depois:** O ComprasNet fica marcado como inativo. O sistema não vai mais buscar editais neste portal (enquanto estiver desativado).

✅ **Correto se:** O status do ComprasNet muda visualmente para inativo após clicar no toggle.
❌ **Problema se:** O toggle não funciona, ou não há como desativar individualmente uma fonte.

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
3822.19.90
3822.90.90
3002.12.10
3002.90.99
3006.50.00
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

> **O que este caso de uso faz:** Este é o último passo da configuração da empresa: definir como e quando a empresa quer ser avisada sobre novos editais e eventos do sistema. Aqui configuramos os canais de notificação (email, sistema, SMS), a frequência dos alertas, e as preferências de interface (tema visual, idioma e fuso horário). É a personalização final que garante que o sistema vai funcionar do jeito que a equipe da RP3X prefere.

**Onde:** Menu lateral → Configurações → Notificações (ou Preferências)
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de começar

- Esta é a última UC do fluxo de configuração da Sprint 1.
- As notificações serão enviadas para o email `licitacoes@rp3x.com.br`.

---

### Passo 1 — Navegar até Notificações e Preferências

**O que fazer:** No menu lateral, localize "Configurações" → "Notificações" ou "Preferências". Clique para abrir.

**O que você vai ver na tela:** Uma tela com opções de canais de notificação, frequência, e preferências de interface.

✅ **Correto se:** A tela carregou com as opções disponíveis.
❌ **Problema se:** Tela em branco ou erro.

---

### Passo 2 — Configurar o endereço de email para notificações

**O que fazer:** Localize o campo de email para notificações. Verifique se já está preenchido com o email da empresa ou insira manualmente.

**Dado a informar:** `licitacoes@rp3x.com.br`

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

**O que acontece depois:** Uma mensagem de sucesso aparece. Todas as configurações de notificação e preferências ficam salvas.

✅ **Correto se:** Mensagem de sucesso e configurações persistem.
❌ **Problema se:** Erro ao salvar, ou preferências são perdidas ao recarregar a tela.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Email de notificação: `licitacoes@rp3x.com.br`
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
| UC-F01 | Cadastro principal da empresa | Dados salvos, CNPJ formatado, Facebook vazio sem erro, endereço de Ribeirão Preto/SP |
| UC-F02 | Contatos e área padrão | 2 emails, 3 telefones e área "Diagnóstico in Vitro e Laboratório" salvos |
| UC-F03 | Documentos com badges de validade | Alvará: amarelo; AFE: verde; ISO: verde; Certidão Estadual: vermelho/amarelo |
| UC-F04 | Certidões automáticas e upload PGFN | Frequência quinzenal configurada; certidão PGFN com número `PGFN-2025-98765` e validade `30/09/2026` |
| UC-F05 | Dois responsáveis sem Preposto | Fernanda (Rep. Legal) e Dr. Ricardo (Resp. Técnico) — sistema não exige Preposto |
| UC-F06 | Filtros do portfólio funcionando | Filtro por área e busca por "reagente" e "hematologia" respondem corretamente |
| UC-F07 | Cadastro por IA e Plano de Contas sem nome | IA processa em até 90s; item sem nome aceito pelo sistema |
| UC-F08 | Edição completa do produto | Nome atualizado, 11 specs técnicas salvas, NCM e SKU aceitos |
| UC-F09 | Reprocessamento de IA | Botão disponível, processo conclui, dados manuais não são apagados |
| UC-F10 | Busca ANVISA e busca web | Ambas executam sem travar o sistema |
| UC-F11 | Completude do produto em AMARELO | Indicador entre 65–80% com badge amarelo (não verde, não vermelho) |
| UC-F12 | Metadados de captação | CATMAT 256 e 258; 4 termos de busca salvos |
| UC-F13 | Hierarquia de classificação | Área > Diagnóstico; subclasses "Reagente para Glicose" e "Kit de Hematologia" existem |
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

> **Dica final:** Faça os UCs na ordem apresentada neste tutorial. Cada UC depende dos dados inseridos nos anteriores. Se pular um UC, pode ser que o próximo não funcione como esperado por falta de dados. Se precisar recomeçar, limpe os dados da RP3X antes de começar novamente.
