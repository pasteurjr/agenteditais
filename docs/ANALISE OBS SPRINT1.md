# Análise das Observações — Tutorial Sprint 1 V6 (Conjunto 3 / Vita-Sense)

**Documento de origem:** `docs/Observações tutorialsprint1-3 V6.docx` (recebido 06/05/2026)
**Autor das observações:** Validador externo (Arnaldo, conjunto Vita-Sense / PR)
**Avaliador da análise:** Claude (sessão 06/05/2026)
**Escopo:** 22 observações distribuídas em UC-F01, F02, F03, F04, F05 e F13

---

## Como ler este documento

Cada observação foi avaliada nas dimensões:

| Campo | Significado |
|---|---|
| **Procede?** | `SIM` / `NÃO` / `PARCIAL` — se a observação descreve um problema/melhoria real |
| **Tipo** | `BUG` (defeito de código), `UX` (melhoria de fluxo/interface), `TUTORIAL` (texto do tutorial precisa ajustar), `RN` (regra de negócio nova/ambígua), `INFRA` (configuração / dado / seed) |
| **Severidade** | `ALTA` (bloqueia uso ou induz a erro grave) / `MÉDIA` (irrita ou força retrabalho) / `BAIXA` (estético / opcional) |
| **Onde corrigir** | Arquivo / linha / endpoint a tocar |
| **Correção proposta** | O que fazer pra resolver |
| **Esforço estimado** | `S` (até 30min), `M` (1-3h), `L` (1+ dia), `XL` (precisa decisão de produto) |

> **Importante:** este documento é apenas análise. **Nenhuma correção foi aplicada.** As correções serão feitas em ciclo separado, após sua aprovação.

---

## Sumário executivo

| UC | Total obs | Procede SIM | Procede PARCIAL | Procede NÃO | Bugs reais | Pedidos de feature (UX) |
|---|---|---|---|---|---|---|
| UC-F01 | 8 | 6 | 2 | 0 | 0 | 6 |
| UC-F02 | 3 | 3 | 0 | 0 | 0 | 3 |
| UC-F03 | 3 | 3 | 0 | 0 | 1 | 2 |
| UC-F04 | 7 | 7 | 0 | 0 | 4 | 3 |
| UC-F05 | 3 | 3 | 0 | 0 | 0 | 3 |
| UC-F13 | 1 | 1 | 0 | 0 | 0 | 1 |
| **Total** | **25** | **23** | **2** | **0** | **5** | **18** |

> **Observação:** o docx tinha 22 entradas; algumas continham várias obs em um único parágrafo, totalizando 25 itens analisados.

**Bugs reais (5) — prioridade ALTA:**
1. F03 obs#1: Flag "Falta" para vencido em vez de "Vencido"
2. F04 obs#1: Fontes de Certidões trazendo SEFAZ-MG quando empresa é PR
3. F04 obs#4: Botão "atualizar esta certidão" individual aciona busca **geral** (todas)
4. F04 obs#6: Data de validade no upload manual permite divergir da real (data do user prevalece sobre data do PDF)
5. F04 obs#7: CND Estadual SEFAZ/MG gera arquivo PDF com conteúdo errado (visualizador abre algo sem relação)

**Pedidos de feature de alta valia (UX) — prioridade ALTA:**
- F01 obs#1 + F02 obs#3 + F03 obs#2: **upload em massa de documentos com extração automática por IA** (cadastro, portfólio, documentos). Tema central, vai economizar muito tempo do user.
- F01 obs#5: separação clara entre **Cadastro** (irreversível) e **Configurações** (ajustes finos) — reorganização de menu.
- F03 obs#3: campo de **conferência humana obrigatória** antes de salvar resultado de IA (mitiga responsabilidade legal).

---

## UC-F01 — Cadastro Empresa

### F01-01. Upload de documentos da empresa com preenchimento automático

> **Observação original:** "Na fase de cadastro da empresa, já no preenchimento dos dados básicos, ter a opção de upload dos documentos da empresa e o preenchimento ser automático pelo sistema a partir destes documentos. O humano vai conferir os dados preenchidos e complementar o que o sistema não conseguiu identificar."

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | UX (feature nova) |
| **Severidade** | MÉDIA |
| **Estado atual** | EmpresaPage tem cadastro 100% manual: 13 campos de input direto (Razão Social, CNPJ, IE, IM, endereço, CEP, telefones, emails). Não há fluxo de "carregar contrato social → extrair dados". |
| **Onde corrigir** | Novo componente `CadastroEmpresaPorIA` em `frontend/src/pages/EmpresaPage.tsx` + endpoint novo `POST /api/empresas/extrair-dados-cadastro` no backend chamando `tools.tool_extrair_dados_empresa(pdf)` (DeepSeek). |
| **Correção proposta** | Adicionar botão "Cadastro automático por IA (upload contrato social)" na tela inicial de EmpresaPage. Após upload: chamar IA, popular formulário, deixar humano revisar e salvar. |
| **Esforço** | M (~1 dia) |

---

### F01-02. Indicar campos obrigatórios e bloquear avanço sem preenchimento

> **Observação original:** "Indicar campos obrigatórios e bloquear avanço sem preenchimento destes campos. (Exemplo: inscrição municipal)"

| Campo | Valor |
|---|---|
| **Procede?** | **PARCIAL** |
| **Tipo** | UX + RN (decisão de produto) |
| **Severidade** | MÉDIA |
| **Estado atual** | `frontend/src/pages/EmpresaPage.tsx:978/984` marca apenas **CNPJ e Razão Social** como `required`. Inscrição Municipal e demais campos NÃO são obrigatórios no front — e isso está alinhado com o tutorial (cadastro mínimo viável). |
| **Análise** | A observação mistura dois pedidos: (a) marcar visualmente todos os campos obrigatórios — o sistema já faz isso com asterisco vermelho via `<FormField required>`. (b) tornar Inscrição Municipal obrigatória — esta é decisão de produto/RN: nem todas as empresas têm IM (ex: empresas de serviço de fora do município). |
| **Correção proposta** | (a) Mantém asterisco como está. (b) **Decisão necessária do produto**: lista de campos efetivamente obrigatórios (CNPJ, Razão Social, Inscrição Estadual, Endereço completo, CEP, Cidade/UF? IM?). Após decisão, marcar `required` no front + validação no backend. |
| **Esforço** | XL (precisa decisão de produto) |

---

### F01-03. Após cadastro+vinculação foi necessário re-login para vínculo aparecer

> **Observação original:** "Seguindo o tutorial, foi realizado o cadastro da nova empresa (Vita-Sense). Após cadastro realizado foi feito o vínculo com o usuário. Nesta fase foi necessário sair do sistema e fazer novo login para o vínculo aparecer."

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | UX (refresh de estado) |
| **Severidade** | MÉDIA (não bloqueia mas confunde) |
| **Estado atual** | A tela `SelecionarEmpresaPage` carrega lista de empresas vinculadas no momento do login (JWT contém empresa_ids). Após `POST /api/admin/associar-empresa`, o token JWT do usuário não atualiza automaticamente. |
| **Onde corrigir** | `frontend/src/contexts/AuthContext.tsx` — após resposta OK de associar-empresa, fazer `refetchUser()` que invalida o cache e re-busca `/api/me`. Backend `/api/me` precisa retornar `empresas_vinculadas` atualizado. |
| **Correção proposta** | Adicionar callback `onSuccess` no formulário de vincular empresa que dispara re-fetch + redireciona pra SelecionarEmpresa. Sem necessidade de logout. |
| **Esforço** | S (~1h) |

---

### F01-04. Em Configurações não deveria ser possível alterar dados obrigatórios da empresa

> **Observação original:** "No menu configurações não deveria ser possível alterar dados obrigatórios do cadastro da empresa"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | UX + RN (separação Cadastro vs Configurações) |
| **Severidade** | MÉDIA |
| **Estado atual** | EmpresaPage atualmente serve **dois propósitos**: cadastrar empresa nova (campos editáveis) e configurar dados (editáveis também). CNPJ e Razão Social podem ser alterados mesmo após cadastrado. Riscos: alterar CNPJ por engano após anos de uso, perder rastreabilidade fiscal. |
| **Análise** | Concordo com o validador. CNPJ é chave fiscal e operacional — depois de cadastrado, alterar deveria exigir confirmação adicional ou ser proibido (criar nova empresa em vez de editar a existente). |
| **Correção proposta** | Em EmpresaPage, marcar CNPJ como `readOnly={empresaJaSalva}` quando carregar empresa existente. Razão Social: editável mas com aviso "Alterar Razão Social pode invalidar documentos já assinados". |
| **Esforço** | S |

---

### F01-05. Reorganização de menu — Cadastro vs Configurações

> **Observação original:** "Dados de cadastro da empresa não deveriam aparecer em outros menus e com opção de alterar, como por exemplo em Configurações. Cadastro da empresa e Configurações da empresa são funcionalidades distintas. Em Configurações o menu Empresa – Dados da Empresa, deveria estar em Cadastro – Empresa (antes de documentos)"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | UX + RN (estrutura de navegação) |
| **Severidade** | MÉDIA |
| **Estado atual** | `Sidebar.tsx` tem seção "Configurações > Empresa > Dados da Empresa" misturada com "Configurações > Empresa > Documentos / Certidões / Responsáveis". Não há seção "Cadastro" separada. |
| **Análise** | Concordo. A separação é natural: **Cadastro** (irreversível, dados estruturais) ≠ **Configurações** (preferências, parametrizações ajustáveis). |
| **Correção proposta** | Reorganizar Sidebar: criar seção "Cadastro" no topo (antes de Fluxo Comercial) contendo Empresa, Documentos, Certidões, Responsáveis, Portfólio. Manter "Configurações" só para preferências (notificações, score, parâmetros comerciais, fontes). |
| **Esforço** | M (mexer em sidebar + roteamento + treinar user) |

---

### F01-06. Documentos automaticamente preenchidos a partir do upload do cadastro

> **Observação original:** "No menu de Cadastro, onde tem o submenu Documentos, estes já aparecem de forma automática conforme os documentos que foram feitos upload no Cadastro da Empresa"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | UX (dependência do F01-01) |
| **Severidade** | MÉDIA |
| **Estado atual** | Decorrência natural do F01-01: se o user fizer upload do contrato social, identidade do sócio, alvará, etc. já no cadastro, o sistema deveria automaticamente popular o submenu Documentos com esses arquivos categorizados. |
| **Correção proposta** | Após implementar F01-01: após classificação por IA, criar registros em `empresa_documentos` (uma linha por arquivo) já com `tipo` preenchido, ligados à `empresa_id`. |
| **Esforço** | S (depois de F01-01 estar pronto) |

---

### F01-07. Endereço — campo separado para Número e Complemento

> **Observação original:** "Nos dados da empresa – endereço deve ter campo separado para número e complemento"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | UX (estrutura de dado) |
| **Severidade** | BAIXA (não bloqueia, mas confunde) |
| **Estado atual** | `EmpresaPage.tsx:130` tem só `endereco` (string única). User precisa digitar "Rua X, 123, Apto 45" tudo em 1 campo. |
| **Onde corrigir** | `EmpresaPage.tsx`, schema `empresas` no banco, campo `endereco_numero` + `endereco_complemento`. |
| **Correção proposta** | Quebrar `endereco` em 4 campos: `logradouro` (Rua/Av), `numero`, `complemento`, `bairro`. Padrão dos Correios. CEP API já popula esses campos automaticamente. |
| **Esforço** | M (precisa migration + adaptar form + testes) |

---

### F01-08. Sidebar abre sempre com Fluxo Comercial expandido

> **Observação original:** "Toda vez que abre o sistema o menu Fluxo Comercial já está aberto, melhor se estivem todos fechados sempre e quando o usuário abrir a barra de rolagem movimentar automaticamente."

| Campo | Valor |
|---|---|
| **Procede?** | **PARCIAL** |
| **Tipo** | UX (preferência inicial) |
| **Severidade** | BAIXA |
| **Estado atual** | `Sidebar.tsx:261` define `useState<Set<string>>(new Set(["fluxo"]))` — Fluxo Comercial é o único expandido por default. **Comportamento intencional pra não esconder os atalhos de uso diário.** |
| **Análise** | Comentário do user é estético/preferência. Trade-off real: (a) abrir tudo fechado = menos ruído visual, mais cliques pra ir nos itens; (b) abrir Fluxo Comercial = menos cliques pra ações frequentes mas mais ruído inicial. |
| **Correção proposta** | (a) Salvar preferência do user em localStorage: lembrar quais seções estavam expandidas na última sessão. (b) Para usuários novos, abrir só Fluxo Comercial (mantém atual). (c) Adicionar botão "Recolher tudo" no topo da sidebar pra usuário que prefere fechado. |
| **Esforço** | S |

---

## UC-F02 — Gerir Contatos e Área Padrão

### F02-01. Ordem de cadastro: Empresa → Documentos → Portfólio

> **Observação original:** "Seguindo o tutorial, antes de finalizar o cadastro completo da empresa (documentos, certidões, fontes de certidões etc.), passou para cadastrar a área de atuação da empresa, o que é feito no menu Portfólio. Correto seria finalizar o menu cadastro da empresa por completo, para depois seguir o cadastro de outros menus"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | TUTORIAL (texto do tutorial precisa ajustar) |
| **Severidade** | MÉDIA (prejudica fluxo do validador) |
| **Estado atual** | Tutorial V6 ordena F01 → F13 (Áreas/Classes/Subclasses) → F02 (Contatos/Área Padrão) → F03 (Documentos) → F04 (Certidões) → F05 (Responsáveis). A área padrão (F02) é selecionada **antes** dos documentos/certidões. Ordem técnica está correta (F02 precisa de F13 já criado), mas pedagogicamente fica estranho. |
| **Análise** | Validador tem razão no ponto pedagógico. A árvore de cadastro deveria ser: **(1) Cadastro Empresa completo (todos os dados estruturais + documentos + certidões + responsáveis legais) → (2) Portfólio + Área de atuação → (3) Parametrizações**. A obrigatoriedade técnica de F13 antes de F02 vem de uma limitação atual. |
| **Correção proposta** | (a) Curto prazo: ajustar **texto do tutorial** explicando claramente "estamos pulando entre menus por uma dependência técnica — vamos voltar pra completar Cadastro depois". (b) Longo prazo: separar **Área Padrão** do menu Empresa-Contatos para "Configurações" (não é dado de cadastro estrutural) — assim o cadastro fica linear. |
| **Esforço** | S (ajuste do tutorial); M (refator de menu) |

---

### F02-02. Mãozinha (cursor pointer) em todos elementos clicáveis

> **Observação original:** "Todos os locais clicáveis devem ter mãozinha do mouse"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | UX (acessibilidade) |
| **Severidade** | BAIXA |
| **Estado atual** | Não há uma regra global garantindo cursor pointer em todos elementos clicáveis. Buttons HTML têm por default, mas links/divs com `onClick` muitas vezes não têm. |
| **Onde corrigir** | `frontend/src/index.css` ou `App.css` — adicionar regra global. |
| **Correção proposta** | Adicionar CSS: `button, a, [onclick], [role="button"] { cursor: pointer; }`. Auditar componentes customizados (cards clicáveis, ícones de ação) que não usam `<button>`. |
| **Esforço** | S |

---

### F02-03. Upload em massa de documentos do Portfólio com classificação automática

> **Observação original:** "No menu Portfólio o ideal seria no submenu produtos o usuário carregar através de upload todos os documentos disponíveis referentes aos produtos de sua atuação (catálogos, descritivos técnicos, manuais de instruções, bulas, registros na Anvisa etc.). Após o upload destes documentos, o sistema de forma automática, preenche os submenus da área Portfólio, separando cada documento de acordo com sua categoria (Especificações, Áreas etc.). Após o preenchimento automático, o usuário faz a conferência e ajustes necessários, podendo inclusive alterar o local onde o sistema alocou algum determinado arquivo."

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | UX (feature de alta valia) |
| **Severidade** | ALTA (transforma a usabilidade do Portfólio) |
| **Estado atual** | `PortfolioPage.tsx:86-94` já tem fluxo "Cadastrar produto por IA com upload" que aceita 1 arquivo (manual, catálogo, registro ANVISA) e preenche **um produto**. NÃO há fluxo de upload em lote (drag-and-drop de pasta inteira) com classificação automática multi-produto. |
| **Análise** | Validador propõe um fluxo significativamente melhor: drag-and-drop de pasta com 50 PDFs → IA classifica cada um por tipo (catálogo / manual / bula / registro ANVISA / spec técnica) e por subclasse → cria N produtos automaticamente → user revisa em batch. Equivalente ao Excel-import mas com PDFs. |
| **Correção proposta** | Implementar componente `UploadLoteCadastroIA` em PortfolioPage. Backend: novo endpoint `POST /api/portfolio/cadastro-lote-ia` aceita FormData com N arquivos, processa cada um chamando `tool_cadastrar_produto_ia`, retorna lista de produtos criados/erros pra revisão. |
| **Esforço** | L (1 dia de backend + 1 dia de UI + 1 dia de QA) |

---

## UC-F03 — Gerir Documentos da Empresa

### F03-01. ⚠ Flag "Falta" para vencido — deveria ser "Vencido"

> **Observação original:** "Flag para documento vencido está como 'Falta'. Mudar esse flag para 'Vencido'"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | **BUG** |
| **Severidade** | ALTA (induz a erro de interpretação) |
| **Estado atual** | `EmpresaPage.tsx:707`: `return <span className="status-badge status-badge-error">Falta</span>;`. Mostra "Falta" como label genérico do badge de erro de documento. Mas o status real do documento pode ser **Vencido** (já existiu e venceu) ou **Faltando** (nunca foi enviado). São coisas diferentes. |
| **Onde corrigir** | `frontend/src/pages/EmpresaPage.tsx:707` (e adjacências). |
| **Correção proposta** | Distinguir: se `data_vencimento != null && data_vencimento < hoje` → "Vencido". Se `data_vencimento == null` → "Falta envio". Se `data_vencimento != null && data_vencimento > hoje` → "Válido". Já existe lógica parcial em `frontend/src/pages/EmpresaPage.tsx:820-827` para certidões (que distingue "Vencida" corretamente). Replicar para documentos. |
| **Esforço** | S |

---

### F03-02. Upload em massa com identificação automática de tipo + datas de vencimento

> **Observação original:** "Deveria ter opção de upload de vários documentos ou uma pasta inteira de documentos ao mesmo tempo, e o sistema já identificar o que é o que e organizar as datas de vencimentos... tudo de forma automática. Após o comando o usuário faz a conferência e ajusta o que o sistema não identificou ou identificou errado"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | UX (feature de alta valia, gêmeo do F02-03) |
| **Severidade** | ALTA |
| **Estado atual** | `EmpresaPage.tsx:510` permite upload de 1 documento por vez. Não há fluxo de upload em lote. |
| **Correção proposta** | Implementar drag-and-drop de pasta. Backend: novo `POST /api/empresa-documentos/upload-lote` que: (1) recebe N arquivos, (2) chama IA para cada um classificar tipo (contrato_social, certidao_negativa, alvara, etc.) + extrair data_vencimento, (3) cria registros em `empresa_documentos` em modo "rascunho", (4) retorna lista pra user revisar/confirmar. |
| **Esforço** | L (gemeo do F02-03 — componente reaproveitável) |

---

### F03-03. Campo de "li e confiri" antes de salvar resultado de IA

> **Observação original:** "Para mitigar responsabilidades imputadas em ações automáticas do nosso sistema, seria viável ter algum campo onde o usuário tenha que marcar que leu e conferiu os comandos executados ou documentos analisados pelo sistema, antes de salvar a operação."

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | RN (compliance/responsabilidade legal) |
| **Severidade** | ALTA (proteção legal pra empresa Facilicita) |
| **Estado atual** | Sistema salva resultado de IA (extração de dados, classificação de documento, sugestão de score) sem qualquer confirmação humana explícita. |
| **Análise** | Observação MUITO pertinente. Em ações automatizadas por IA o usuário deve assumir responsabilidade pela aceitação. Sem isso, em caso de erro com consequência (ex: data de vencimento extraída errada → empresa perde licitação por certidão vencida não detectada), a Facilicita pode ser responsabilizada. |
| **Correção proposta** | Em todo modal de "resultado da IA" (extração de dados, classificação, score), adicionar checkbox obrigatório: "Eu revisei os dados extraídos pela IA e confirmo que estão corretos". Sem checked, botão Salvar fica desabilitado. **Salvar log no banco** desse aceite (tabela `auditoria_aceite_ia` com `user_id`, `acao`, `dados_extraidos_json`, `aceito_em`). |
| **Esforço** | M (componente de aceite + log + retrofit em todos os fluxos IA — ~5-6 fluxos) |

---

## UC-F04 — Buscar, revisar e anexar certidões

### F04-01. ⚠ Fontes de Certidões trazendo SEFAZ-MG quando empresa é PR

> **Observação original:** "Nas Fontes das Certidões estão vindo base MG e a empresa é PR"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | **BUG** (filtro/seed errado) |
| **Severidade** | ALTA (induz busca em portal errado) |
| **Estado atual** | Tutorial V6-3 declara empresa Vita-Sense em PR (`UF=PR`, sede em Curitiba). Mas a Fontes de Certidões não filtra por UF da empresa — exibe **todas** as fontes globais cadastradas, incluindo SEFAZ-MG, SEFAZ-SP, etc. |
| **Onde corrigir** | (a) `backend/crud_routes.py` endpoint `GET /api/crud/fontes-certidoes` — adicionar filtro implícito por `uf == empresa.uf` quando aplicável (CNDs estaduais e municipais). (b) Seeds devem ter SEFAZ-PR e Pref. Curitiba pra Vita-Sense. |
| **Correção proposta** | (1) Backend: ao listar fontes para empresa X, retornar apenas fontes onde `uf IS NULL` (federais) OU `uf == empresa.uf` (estaduais) OU `cidade == empresa.cidade` (municipais). (2) Verificar se seed já tem fontes para PR; se não, adicionar `SEFAZ-PR` + `Prefeitura de Curitiba` em `backend/seeds/`. |
| **Esforço** | S (filtro) + S (seed) = M total |

---

### F04-02. Flag "Requer Autenticação" — comportamento confuso

> **Observação original:** "Ficou confuso o flag se requer autenticação ou não. O campo está desmarcado e não, quando marca ele muda sim"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | UX (label confusa) |
| **Severidade** | MÉDIA |
| **Estado atual** | `frontend/src/config/crudTables.tsx:1043`: campo `requer_autenticacao`, type `boolean`. UI provavelmente exibe um checkbox simples "Requer Autenticação" mas sem explicar o que significa marcado vs desmarcado. |
| **Análise** | Validador descreve confusão típica de checkbox sem contexto: "se está desmarcado significa que NÃO requer autenticação? Ou que ainda não decidi?". |
| **Correção proposta** | (a) Trocar checkbox por radio/select com 2 opções claras: "Acesso público (sem login)" / "Requer autenticação (login/senha/certificado)". (b) Quando "Requer autenticação" selecionado, mostrar campos `metodo_acesso` (login_senha / certificado / api_key) abaixo. |
| **Esforço** | S |

---

### F04-03. Flag Ativo/Inativo na lista de Certidões Automáticas

> **Observação original:** "Incluir flag na lista de Certidões Automáticas as fontes como ativo/inativo"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | UX (visibilidade de estado) |
| **Severidade** | BAIXA |
| **Estado atual** | A coluna `ativo` existe no schema da fonte (`crudTables.tsx:1047`), mas a lista de Certidões Automáticas (em EmpresaPage) não exibe esse campo na tabela. User não sabe se a fonte está ligada/desligada sem clicar pra editar. |
| **Onde corrigir** | `EmpresaPage.tsx`, definição das colunas da tabela de certidões (em `certColumns`/`fonteColumns` — verificar). |
| **Correção proposta** | Adicionar coluna "Status fonte" com badge verde "Ativa" / cinza "Inativa" baseado em `permite_busca_automatica` e `ativo`. |
| **Esforço** | S |

---

### F04-04. ⚠ BUG: Botão "Atualizar esta certidão" individual aciona busca geral (todas)

> **Observação original:** "Botão de atualizar certidão individualmente está ativando o geral para todas as certidões"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | **BUG** |
| **Severidade** | ALTA |
| **Estado atual** | `frontend/src/pages/EmpresaPage.tsx:901`: `<button title="Atualizar esta certidao" disabled={buscandoCertidoes} onClick={() => handleBuscarCertidoes()}>`. **Confirmado:** chama a função geral sem passar o ID da certidão da linha. |
| **Onde corrigir** | `EmpresaPage.tsx:901` + função `handleBuscarCertidoes` (linha 566). |
| **Correção proposta** | Refatorar `handleBuscarCertidoes` para aceitar `idsAlvo?: string[]` como parâmetro opcional. Quando vazio, busca todas. Quando vem um ID, busca só aquela. Mudar linha 901 para `onClick={() => handleBuscarCertidoes([c.id])}`. Backend pode já suportar via query param ou body — verificar. |
| **Esforço** | S |

---

### F04-05. Tooltip de "Ação Necessária" na lista

> **Observação original:** "No flag de Ação Necessária à frente de cada certidão, constar a descrição da ação necessária ao clicar (balão)"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | UX (afordância) |
| **Severidade** | BAIXA |
| **Estado atual** | A coluna "Ação" mostra ícone/badge mas sem `title` ou tooltip explicando o que precisa ser feito ("clicar pra fazer upload manual", "clicar pra abrir portal", "clicar pra atualizar"). |
| **Correção proposta** | Adicionar `title` ou `<Tooltip>` em cada ícone de ação descrevendo: "Buscar certidão automaticamente nesta fonte" / "Fazer upload manual do PDF" / "Abrir portal externo (login manual)" / "Visualizar PDF salvo". |
| **Esforço** | S |

---

### F04-06. ⚠ BUG: Data de validade do upload manual prevalece sobre a real do documento

> **Observação original:** "No upload manual a data de validade inserida pelo usuário não pode ser diferente da validade informada na certidão, deve prevalecer a do documento. O sistema deve avisar e realizar a alteração automática. Está prevalecendo a data informada pelo usuário e não a data real de validade da certidão"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | **BUG** (consistência de dados) |
| **Severidade** | ALTA (risco de falso "certidão válida") |
| **Estado atual** | No upload manual de certidão (`EmpresaPage.tsx:668`), o user preenche data de validade manualmente. Não há comparação com a data extraída do PDF pela IA. |
| **Análise** | Cenário: certidão válida até 30/03/2026 mas user digita 30/12/2026 (errado). Sistema salva 30/12/2026, certidão "parece válida" até dezembro mas na hora de submeter a licitação em outubro o sistema não percebe que está vencida. |
| **Correção proposta** | (a) Após upload, chamar IA pra extrair data do PDF. (b) Comparar `data_user` vs `data_ia`. (c) Se divergem em > 1 dia: mostrar warning "A IA detectou validade DD/MM/AAAA no documento, diferente da que você digitou. **Será usada a data do documento (validade real)**." Salvar `data_ia` como `data_vencimento` final. (d) Salvar ambas em log: `data_informada_user` + `data_extraida_ia` + flag `divergencia_corrigida`. |
| **Esforço** | M (precisa endpoint que chama IA + UI de aviso) |

---

### F04-07. ⚠ BUG: CND Estadual SEFAZ/MG gerou PDF com conteúdo errado (visualizador abre algo sem relação)

> **Observação original:** "Na geração automática das certidões, na certidão CND Estadual - SEFAZ/MG (ICMS) o sistema gerou o documento, identificou data de validade, disponibilizou o 'olho' para visualizar o documento, mas quando se abre não tem nada haver com o documento, foto abaixo:"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | **BUG** |
| **Severidade** | ALTA (sistema "engana" — diz que tem certidão mas o PDF salvo é outro) |
| **Estado atual** | Não pude verificar o PDF na captura (não temos a foto), mas o pattern descrito é de **scraper retornando HTML errado** (página de erro / login / banner) e sistema salvando essa resposta como "PDF" sem validar. |
| **Análise** | Provavelmente o scraper de SEFAZ/MG está com problema — talvez a página mudou e ele agora pega resposta diferente do PDF esperado. |
| **Onde corrigir** | `backend/integracoes/sefaz_mg.py` (ou similar) — adicionar validação após download: o conteúdo é PDF de fato? (Magic bytes `%PDF`). Se não for, marcar certidão como "erro" e logar conteúdo recebido para debug. |
| **Correção proposta** | (1) Validação técnica: rejeitar arquivos que não comecem com `%PDF`. (2) Validação semântica: chamar IA para confirmar se PDF parece com certidão (pode pegar PDF errado tipo extrato bancário). (3) Manter log do erro pra investigar scraper. |
| **Esforço** | M (validação simples) + L (debug do scraper) |

---

### F04-08. CRF FGTS — não disponibilizou o "olho" para visualizar

> **Observação original:** "Na certidão CRF - Certificado de Regularidade do FGTS foi gerado o comando da certidão alterando inclusive a data de validade, mas não disponibilizou o 'olho' no sistema"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | **BUG** (URL do PDF não persistido) |
| **Severidade** | MÉDIA |
| **Estado atual** | Quando uma certidão é gerada via integração, o PDF deveria ser salvo (em `empresa_documentos.arquivo_path` ou similar) e o ícone de olho aparece quando há arquivo. No CRF, parece que o registro foi atualizado (data de validade) mas o caminho do PDF não foi salvo — daí o olho some. |
| **Onde corrigir** | `backend/integracoes/caixa_fgts.py` (ou similar) — verificar se está realmente salvando o `arquivo_path` após download bem sucedido. |
| **Correção proposta** | Auditoria do fluxo CRF: download → save em disco → atualizar `empresa_documentos.arquivo_path` E `data_vencimento`. Atualmente parece que só atualiza `data_vencimento`. |
| **Esforço** | M |

---

## UC-F05 — Gerir Responsáveis da Empresa

### F05-01. Renomear "Responsáveis" → "Responsáveis Legais"

> **Observação original:** "Submenu Responsáveis substituir por Responsáveis Legais"

| Campo | Valor |
|---|---|
| **Procede?** | **PARCIAL** |
| **Tipo** | UX (label) |
| **Severidade** | BAIXA |
| **Estado atual** | A tela cobre 3 tipos: Representante Legal, Preposto, Responsável Técnico. "Responsáveis Legais" é incorreto pra Responsável Técnico (não é legal, é técnico/operacional). |
| **Análise** | Concordo parcialmente. Renomear pra "Responsáveis Legais" excluiria o Responsável Técnico. Melhor renomear para algo que englobe ambos. |
| **Correção proposta** | Renomear submenu para "Responsáveis" → "Responsáveis e Representantes" ou "Pessoas de Contato". Manter os 3 tipos. |
| **Esforço** | S |

---

### F05-02. Campo de data de validade no cadastro do responsável

> **Observação original:** "Incluir no campo de cadastro dos responsáveis a data de validade"

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | UX + RN (compliance) |
| **Severidade** | MÉDIA |
| **Estado atual** | `frontend/src/pages/EmpresaPage.tsx` interface `Responsavel` — verificar se tem `data_validade`. Procurações têm prazo (geralmente 1 ano), responsáveis técnicos podem ter contrato com prazo. |
| **Análise** | Procurações vencem. Se o sistema não trackeia validade, em caso de licitação a procuração apresentada pode estar vencida e a empresa perde. |
| **Correção proposta** | Adicionar campos: `documento_validade` (date) + `documento_path` (PDF da procuração/contrato). Mostrar alerta na lista quando documento estiver próximo de vencer (30 dias). Schema do banco precisa migration. |
| **Esforço** | M (migration + UI + alerta) |

---

### F05-03. Cadastro de Preposto — exigir documento de autorização

> **Observação original:** "No cadastro do preposto sistema da um flag alertando a necessidade de inclusão do documento que dá a autorização ao representante legal nomear o preposto (procuração, estatuto social, contrato social etc.)."

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | UX + RN (compliance) |
| **Severidade** | MÉDIA |
| **Estado atual** | Cadastro de Preposto não exige documento que comprova a outorga. |
| **Análise** | Validador tem razão. Em licitação, designar preposto requer documento (procuração, estatuto que delegue, etc.). Sem isso, preposto na sala virtual pode ser invalidado. |
| **Correção proposta** | Quando user seleciona tipo "preposto", mostrar campo obrigatório "Documento de outorga" (upload de PDF). No banco, salvar referência em `responsaveis.documento_outorga_path`. Validar no frontend: não permite salvar Preposto sem PDF anexado. |
| **Esforço** | M (similar ao F05-02) |

---

## UC-F13 — Gerir e consultar classificação Área/Classe/Subclasse

### F13-01. Não permitir cadastrar Área/Classe duplicada (já tem hierarquia)

> **Observação original:** "No cadastro da Área e Classe não deve permitir cadastrar novamente as mesmas, na medida que já se atribui hierarquia das subclasses vinculada à área e classe correspondentes."

| Campo | Valor |
|---|---|
| **Procede?** | **SIM** |
| **Tipo** | RN (constraint de unicidade) |
| **Severidade** | MÉDIA (gera dados duplicados, mas não quebra cadastro) |
| **Estado atual** | Tutorial V6 PARTE 1 instrui o user a criar 2 vezes a Área "Equipamentos Médico-Hospitalares" — isso é necessário porque o tutorial precisa de 2 áreas diferentes mas o exemplo é "casual". A hierarquia atual permite duplicidade dentro de uma mesma empresa (verificar se há `UNIQUE (empresa_id, nome)`). |
| **Análise** | Concordo. Áreas/Classes são taxonomia, não devem duplicar. Tutorial V6 também tem bug pedagógico: pede "Criar Área 'Equipamentos Médico-Hospitalares'" duas vezes seguidas — segundo passo deveria pedir Área diferente (ex: "Equipamentos de Imagem" ou "Diagnóstico in Vitro"). |
| **Onde corrigir** | (a) Banco: adicionar `UNIQUE (empresa_id, nome)` em `areas_produto` e `(empresa_id, area_id, nome)` em `classes_produto_v2`. (b) Backend: tratar erro 409 (duplicata). (c) Tutorial V6: corrigir Passo 1.3 para criar área diferente da Passo 1.2. |
| **Esforço** | M (migration + tratamento erro + revisar tutorial em V7) |

---

## Próximos passos (não fazer ainda)

Após sua aprovação dessa análise, sugiro priorizar nesta ordem:

### Sprint de correção rápida (1-2 dias)
1. **F03-01** — Bug "Falta" → "Vencido" (S)
2. **F04-04** — Bug botão atualizar individual chama geral (S)
3. **F02-02** — Cursor pointer global (S)
4. **F04-05** — Tooltips na coluna Ação (S)
5. **F04-03** — Flag Ativo/Inativo visível (S)
6. **F04-02** — Label clara "Requer Autenticação" (S)

### Sprint de bugs de IA/dados (2-3 dias)
7. **F04-06** — Validade do PDF prevalece (M)
8. **F04-07** — Validação que arquivo é PDF de verdade (M)
9. **F04-08** — Auditoria fluxo CRF FGTS (M)
10. **F04-01** — Filtro de fontes por UF (M)

### Sprint de melhorias UX médias (3-5 dias)
11. **F01-03** — Refresh de vínculo de empresa sem logout (S)
12. **F01-04** — CNPJ readonly após salvo (S)
13. **F01-07** — Endereço quebrado em 4 campos (M)
14. **F02-01** — Ajuste do tutorial sobre ordem de cadastro (S)
15. **F05-01** — Renomear submenu Responsáveis (S)
16. **F05-02** — Data de validade do responsável (M)
17. **F05-03** — Documento outorga preposto (M)
18. **F13-01** — UNIQUE constraint Área/Classe (M)

### Sprint estratégica (1+ semana cada)
19. **F01-01 + F01-06 + F02-03 + F03-02** — Upload em massa com IA (cadastro + portfólio + documentos). Funcionalidade que **transforma o produto**.
20. **F03-03** — Aceite de IA com checkbox + log auditoria (M)

### Decisão de produto (sem ETA)
21. **F01-05** — Reorganizar Sidebar: Cadastro / Configurações
22. **F01-02** — Definir lista oficial de campos obrigatórios
23. **F01-08** — Salvar preferência de sidebar do user

---

**Documento gerado em:** 06/05/2026
**Versão:** 1.0
**Próximo passo aguardando:** aprovação do user para iniciar correções na ordem priorizada.
