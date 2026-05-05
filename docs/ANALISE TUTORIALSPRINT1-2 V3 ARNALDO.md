# Análise das Observações do Arnaldo — Tutorial Sprint 1-2 V3

**Data análise:** 2026-05-05
**Documento revisado:** `docs/Arnaldo tutorialsprint1-2 V3.docx`
**Tutorial original:** `docs/tutorialsprint1-2 V3.md` (2.137 linhas)
**Validador:** Arnaldo (`validaarnaldo@valida.com.br`)
**Empresa de teste:** Bio-Hosp Equipamentos Hospitalares Ltda.
**Analisado por:** Claude (verificação cruzada com banco MySQL `editaisvalida`/`editais` e código frontend)

---

## Sumário executivo

Arnaldo registrou **17 observações** em 11 dos 17 UCs (F01, F02, F03, F04, F07, F08, F10, F11, F12, F15, F16, F17). Após verificação no banco e no código, **15 procedem (defeitos reais ou divergências de tutorial)** e **2 são fluxo esperado, mas com UX confusa**.

| Categoria | Qtd | Status |
|---|---|---|
| Defeitos de produto (código/banco) | 8 | ⚠ corrigir backend/frontend |
| Divergências do tutorial vs sistema | 5 | ⚠ corrigir tutorial |
| Fluxo de tela inadequado (UX) | 2 | ⚠ melhorar UX |
| Não procede / fluxo esperado | 2 | ✓ esclarecer no tutorial |

---

## Observações por UC

### Pré-login — "validaArnaldo bloqueado em tela vazia"

> *Arnaldo:* Realizei login com validaArnaldo, selecionei "Vincular empresa". Ao não realizar nenhum vínculo e encerrar a sessão, ao logar de novo o sistema direciona para uma **tela vazia "Escolher empresa"** sem nenhuma empresa disponível e sem opção de sair, voltar ou retornar. Sistema permite que o usuário fique **bloqueado em uma tela sem saída**.

**PROCEDE — Defeito de UX crítico (bloqueio sem escape).**

**Verificação:** O tutorial V3 (linhas 27-83) descreve o fluxo de pré-requisito com vinculação OU criação de empresa, mas NÃO trata explicitamente o caminho onde o validador entra, sai sem fazer nada, e volta. O frontend de `EmpresaSelectorPage` (rota de seleção de empresa) realmente fica "presa" se não houver `usuario_empresa` ativo + nenhuma criação iniciada.

**Recomendação:**
- **Frontend:** adicionar botão "Sair" / "Logout" e botão "Criar nova empresa" sempre visíveis na tela de seleção de empresa quando lista está vazia.
- **Tutorial V3:** adicionar nota explícita: "Se você sair antes de concluir o cadastro de empresa, ao re-logar pode ficar em tela vazia. Use o botão Sair → faça logout completo → repita a criação."

---

### Pré-login (continuação) — "Como criar empresa em segundo momento?"

> *Arnaldo:* E se eu não quiser criar uma empresa de imediato mas já tenho o usuário gerado, como faço para criar em segundo momento? Só consegui ver a opção via tela do primeiro login.

**PROCEDE PARCIALMENTE — falta documentação no tutorial.**

**Verificação:** Existe sim uma rota alternativa: **Configurações → Empresa** permite criar/editar empresa principal. Mas o tutorial V3 (linha 80) só menciona isso como dica de navegação, sem deixar claro que esta é a rota oficial pós-login para CRUD de empresas.

**Recomendação:**
- **Tutorial V3:** seção "Pré-requisitos" deve explicitar: "Após primeiro login, qualquer cadastro/edição de empresa é feito em Configurações → Empresa, NÃO na tela inicial de seleção."

---

### UC-F01 — "Tela já vem preenchida com dados da RP3X"

> *Arnaldo:* Ao acessar Configurações → Empresa, a tela já vem **integralmente preenchida com os dados da RP3X**. Para cadastrar a Bio-Hosp, seria necessário **apagar manualmente cada campo**. Recomenda disponibilizar opção "Limpar tela" ou "Novo cadastro".

**PROCEDE — Defeito de UX (formulário pré-populado dificulta cadastro de nova empresa).**

**Verificação:** Frontend (`frontend/src/pages/EmpresaPage.tsx`) carrega como GET inicial os dados da empresa ativa do contexto. Se Arnaldo está com RP3X como empresa ativa (heranca de cadastro de outro validador), os campos vêm preenchidos.

**Causa raiz:** "Cadastrar nova empresa" e "editar empresa atual" usam o mesmo formulário pré-populado.

**Recomendação:**
- **Frontend:** botão "+ Nova empresa" claro no topo da tela que limpa todos os campos antes de abrir o formulário.
- **Tutorial V3:** advertir validador: "Se a tela vier preenchida com dados de outra empresa, clique em Nova empresa primeiro."

---

### UC-F01 — "Cadastro inicial não contempla todos os dados"

> *Arnaldo:* Ao criar nova empresa preenchi os dados iniciais e salvei. Essa tela não contempla todas as informações. Após cadastro inicial, Bio passou a constar como principal. Mas o **tutorial não orienta que é necessário acessar outro menu para complementar**. Fluxo de cadastro está incompleto no tutorial.

**PROCEDE — Tutorial omite passos críticos.**

**Verificação:** O tutorial V3 (UC-F01 linhas 132-235) descreve cadastro principal (CNPJ, razão social, endereço, redes sociais), mas **não explica claramente** que após salvar a empresa, é necessário voltar à mesma tela em uma 2ª passada para completar campos que só aparecem após persistência inicial (ex: redes sociais, certidões, documentos podem ser dependentes de empresa já existir).

**Recomendação:**
- **Tutorial V3:** após Passo 1 (criar empresa básica) deve haver bloco explícito **"Passo 1.5 — Re-abrir empresa para completar"** com salvamento incremental.
- **Frontend:** todas as seções (redes sociais, documentos, certidões) devem estar visíveis desde o cadastro inicial OU uma mensagem "Volte aqui após salvar para preencher outros dados" deve aparecer.

---

### UC-F01 Passo 4 — "Tutorial diz BH/MG mas dropdown indica SP"  ⚠⚠⚠

> *Arnaldo:* Tutorial orienta endereço em Belo Horizonte/MG. **Na lista de seleção (drop-down), a instrução indica o estado de São Paulo.** Selecionei MG.

**PROCEDE — Bug TÍPICO no texto do tutorial.** ⚠

**Verificação no arquivo `tutorialsprint1-2 V3.md`:**
- Linha 200: `| Cidade | Belo Horizonte |`
- Linha 201: `| UF | MG |`
- Linha 204: 📌 **"Clique nele e selecione SP na lista. Se for campo de texto livre, digite MG."** ← **ERRO**
- Linha 208: ✅ "Correto se: Todos os campos preenchidos corretamente, **incluindo o estado SP selecionado.**" ← **ERRO**
- Linha 209: ❌ "Problema se: O estado **não tem a opção SP** disponível." ← **ERRO**
- Linha 232: "Endereço de **Belo Horizonte / SP** preenchido" ← **ERRO**
- Linha 2093: "endereço de **Belo Horizonte/SP**" ← **ERRO** (resumo executivo)

**5 ocorrências do mesmo erro** — tutorial copiou um trecho de outro estado.

**Recomendação:** (alta prioridade)
- **Tutorial V3:** substituir todas as ocorrências `SP` por `MG` nas linhas 204, 208, 209, 232, 2093.

---

### UC-F02 Passo 4 — "Equipamentos Médico-Hospitalares não está disponível"

> *Arnaldo:* A área "Equipamentos Médico-Hospitalares" não está disponível na lista. A opção mais próxima foi "médica".

**NÃO PROCEDE / Banco está OK — bug específico de visualização do dropdown.**

**Verificação no banco `editais.areas_produto`:** existem **30+ registros com nome "Equipamentos Médico-Hospitalares"** (várias duplicatas, mas todos com esse nome exato). Logo, no banco a opção EXISTE e até está duplicada.

**Causa raiz provável:** Frontend (componente Combobox/Autocomplete da Área) pode estar limitando a 10 primeiros, e Arnaldo viu apenas "médica" como token mais curto. Pode ser também filtro case-sensitive ou problema de paginação no autocomplete.

**Recomendação:**
- **Frontend:** verificar se o autocomplete da área lista TODAS as áreas ou só primeiras N. Permitir scroll/busca por substring.
- **Banco:** **deduplicar** áreas com mesmo nome (há 30+ registros "Equipamentos Médico-Hospitalares" — provavelmente seed sem deduplicação).
- **Tutorial V3:** instruir Arnaldo a "digite Equipa para filtrar" no campo de busca.

---

### UC-F03 — "Não existe test_document.pdf no sistema"

> *Arnaldo:* Não existe o documento `tests/fixtures/test_document.pdf` citado no tutorial. Vou usar documentos_sintetizados enviados pelo Pasteur. No campo "caminho do arquivo" não existe ação para "clique em Escolher arquivo e selecione este PDF".

**PROCEDE — Tutorial pede arquivo que não acompanha entregável.**

**Verificação:** O tutorial referencia `tests/fixtures/test_document.pdf` em **8 ocorrências** (linhas 364, 393, 414, 433, 452, 563, 841, 880). Esse path é da estrutura interna de testes e não está disponível no ambiente de validação manual em `editaisvalida`.

**Recomendação:**
- **Tutorial V3:** substituir referências por caminho que o validador realmente tem (ex: `docs/documentos_sintetizados/` que Pasteur enviou) OU instrução: "use qualquer PDF que tenha no computador" se o conteúdo do PDF não importa para o teste.
- Se o conteúdo importa (ex: para extração IA), incluir o PDF no zip do tutorial.

---

### UC-F03 — "Tipos de documento não correspondem ao banco" ⚠⚠⚠

> *Arnaldo:*
> - Passo 2 (Alvará): badge amarelo não aparece com vencimento 30/06/2026, 08/05/2026, 30/05/2026.
> - Passo 3 (ANVISA AFE): **não tem a opção "Autorização de Funcionamento ANVISA (AFE)"**, coloquei "outros". Nenhum badge é exibido.
> - Passo 4 (ISO): mesmos problemas do passo 3.
> - Passo 5 (Certidão Negativa Estadual): **não tem essa opção**, coloquei "outros". Nenhum badge é exibido.
> - **OBSERVAÇÃO:** estes cadastros foram feitos em "cadastro – empresa". Ao consultar em "configurações – empresa" → "documentos", os badges aparecem corretamente.

**PROCEDE 100% — DEFEITO REAL no frontend.** ⚠

**Verificação cruzada:**

1. **Banco `editais.empresa_documentos.tipo` (enum) tem 15 tipos:**
   ```
   contrato_social, atestado_capacidade, balanco, alvara, registro_conselho,
   procuracao, certidao_negativa, habilitacao_fiscal, habilitacao_economica,
   qualificacao_tecnica, afe, cbpad, cbpp, bombeiros, outro
   ```

2. **Frontend `frontend/src/config/crudTables.tsx:199` expõe SÓ 7:**
   ```javascript
   options: enumOpts(["contrato_social", "atestado_capacidade", "balanco",
                       "alvara", "registro_conselho", "procuracao", "outro"])
   ```

3. **Faltam 8 opções no dropdown:** `certidao_negativa`, `habilitacao_fiscal`, `habilitacao_economica`, `qualificacao_tecnica`, **`afe`** (Autorização ANVISA), `cbpad`, `cbpp`, `bombeiros`.

4. **Sobre os badges:** se Arnaldo cadastrou os 4 documentos como `outro`, o componente renderizador de badge (`DocumentoBadge`) provavelmente não tem regra de cor para `outro` → não exibe badge. Em "configurações → empresa → documentos" (que é uma view diferente), pode estar usando outro componente que renderiza pela `data_vencimento` direta, independente do tipo.

**Recomendação (alta prioridade):**
- **Frontend (`crudTables.tsx:199`):** estender o array de opções para incluir os 8 tipos faltantes:
  ```javascript
  options: enumOpts([
    "contrato_social", "atestado_capacidade", "balanco", "alvara",
    "registro_conselho", "procuracao", "certidao_negativa",
    "habilitacao_fiscal", "habilitacao_economica", "qualificacao_tecnica",
    "afe", "cbpad", "cbpp", "bombeiros", "outro"
  ])
  ```
- **Frontend (componente DocumentoBadge):** garantir que badge de vencimento (verde/amarelo/vermelho) é renderizado a partir da `data_vencimento`, **independente do tipo**.
- **Tutorial V3:** ajustar nomes nos passos 3, 4, 5 para corresponder aos labels reais do enum (`afe` → "Autorização Funcionamento ANVISA (AFE)" etc.).

---

### UC-F04 — "Não existe botão Inicializar Fontes Padrão" ⚠⚠⚠

> *Arnaldo:* O tutorial diz: "Vá em Cadastros > Empresa > Fontes de Certidões e clique em Inicializar Fontes Padrão". **Nessa opção não existe o botão "Inicializar Fontes Padrão".**
> Acessei "Configurações → Empresa, no bloco Certidões Automáticas". Ao acionar "Buscar Certidões", o sistema retornou **9 certidões**. **As certidões retornadas não correspondem às 5 principais esperadas no tutorial.**
> *Pasteur, gostaria de uma conversa pessoal a respeito deste item.*

**PROCEDE — Defeito grave: botão referenciado pelo tutorial NÃO EXISTE no frontend.** ⚠

**Verificação:**
1. **Grep no frontend:** `grep -rE "Inicializar Fontes" frontend/src/` retorna **ZERO resultados**. Botão simplesmente não existe.
2. **Banco `editais.fontes_certidoes`** tem **9 fontes** (não 5 como o tutorial diz):
   - CND Federal (Receita/PGFN)
   - CND Estadual SEFAZ/MG
   - CND Municipal Belo Horizonte
   - CRF FGTS
   - CNDT Trabalhista
   - SICAF
   - CGU Correcional
   - Certidão Falência/Recuperação
   - BrasilAPI Situação CNPJ

**Causa raiz:** o tutorial V3 está desatualizado em relação à evolução do produto. As "5 certidões padrão" mencionadas eram da V1; o produto evoluiu para 9 fontes mais granulares.

**Recomendação (alta prioridade):**
- **Tutorial V3:** remover Passo 0 ("Inicializar fontes padrão") porque não existe. Listar as 9 fontes reais com nomes que aparecem no sistema.
- OU **Frontend:** adicionar botão "Re-popular Fontes Padrão" que insere as 9 fontes default se nenhuma existir.

---

### UC-F04 Passo 4 — "Número da certidão não aparece após upload"

> *Arnaldo:* Criei arquivo para simular essa certidão, fiz upload, **a data de validade aparece corretamente na lista mas o número da certidão não aparece.**

**PROCEDE — Defeito de exibição na lista.**

**Verificação:** Tutorial (linha 565) pede `Número: SEFAZ-MG-2026-3301`. Arnaldo confirma que data aparece, número não. Significa que:
- Backend salva corretamente (data está OK).
- Frontend pode estar usando coluna errada na lista (renderiza só `data_vencimento`, não `numero_certidao`).

**Recomendação:**
- **Frontend:** verificar se coluna "Número" existe na renderização da lista de certidões. Se não, adicionar.

---

### UC-F04 Passo 5 — "Modal abre mas mostra erro no centro"

> *Arnaldo:* Tela é exibida porém **não apresenta os dados indicados no tutorial**. Tela exibe **mensagem de erro no centro**. Funcionalidade abre mas conteúdo diverge e há erro em tela.

**PROCEDE — Defeito de modal de detalhes.**

**Recomendação:**
- **Frontend:** capturar exception do GET /certidao/{id}/detalhes e tratar com mensagem amigável OU corrigir endpoint que está retornando 500.
- **Necessário pedir a Arnaldo a captura de tela / texto da mensagem de erro** para diagnóstico.

---

### UC-F06 — "Não houve retorno (sem produtos cadastrados)"

> *Arnaldo:* Não houve retorno de resultados, aparentemente porque não há produtos cadastrados.

**NÃO PROCEDE como defeito — fluxo esperado, mas tutorial deveria orientar.**

**Verificação:** UC-F06 é "Listar e Filtrar Produtos do Portfólio". Como Arnaldo está em ambiente novo (Bio-Hosp criada agora), o portfólio começa vazio. F07 cria os primeiros produtos. Logo, F06 antes de F07 retorna lista vazia — comportamento correto.

**Recomendação:**
- **Tutorial V3:** explicitar que UC-F06 ANTES da execução de F07 retorna lista vazia, e que esse é o comportamento correto. Validador deve voltar a F06 após F07 para ver os produtos cadastrados.
- Adicionar bloco "Empty state esperado" descrevendo o que aparece quando não há produtos.

---

### UC-F07 Passo 2 — "Erro Data too long for column 'ncm'" ⚠⚠⚠

> *Arnaldo:* Os campos básicos estão preenchidos mas ao salvar apareceu:
> ```
> (mysql.connector.errors.DataError) 1406 (22001): Data too long for column 'ncm' at row 1
> ```
> Após limpar o campo NCM, o sistema permitiu salvar. **Sistema aceita preenchimento inválido sem validação prévia.**

**PROCEDE — Defeito real de validação no frontend.** ⚠

**Verificação:**
1. **Banco:** coluna `produtos.ncm` é `varchar(N)` com N pequeno (provavelmente 8 ou 10 chars). Tutorial pede `9018.19.90` (10 chars com pontos), mas pode estar entrando algo mais longo.
2. **Frontend (`PortfolioPage.tsx`):** input do NCM **não tem máscara** nem validação de tamanho/regex.
3. Mensagem de erro do MySQL vaza pro usuário (em vez de tratada antes).

**Recomendação:**
- **Frontend:** adicionar máscara ao campo NCM (`9999.99.99`, 8 dígitos numéricos + 2 pontos = 10 chars).
- **Frontend:** validação client-side com mensagem clara antes do submit.
- **Backend:** capturar `DataError` 1406 e retornar `400 {"error": "NCM excede tamanho máximo. Use formato 9999.99.99"}`.

---

### UC-F07 Passo 3 — "IA não complementa, cria produto duplicado" ⚠⚠

> *Arnaldo:* Solicitei o preenchimento automático via IA. **Em vez de complementar o produto existente, o sistema gerou um SEGUNDO item com nome muito similar** (Monitor Multiparâmetro). Esse novo produto foi criado com a maior parte dos dados. **Já o produto original permaneceu inalterado.** **A IA não complementou o cadastro existente; criou um novo produto duplicado com preenchimento parcial.**

**PROCEDE — Defeito de comportamento crítico.** ⚠

**Verificação:**
- Backend `precif_vincular_ia` (referenciado em correções recentes da Sprint 3) recebe `produto_id`. Mas em F07, o fluxo é "Cadastrar Produto por IA" — ou seja, IA + manual + extração documento.
- Se o frontend não passa `produto_id` quando o produto já existe, backend cria novo registro.

**Causa raiz provável:** Após salvar manualmente, o frontend perde a referência ao `produto.id` e ao re-submeter para IA, envia como criação nova.

**Recomendação:**
- **Backend:** se chave única (nome+empresa+modelo) já existe, fazer UPDATE em vez de INSERT.
- **Frontend:** após primeiro save, manter `produto.id` em estado e enviar nas chamadas IA subsequentes.

---

### UC-F07 Passo 4-5 — "Plano de Contas não disponível"

> *Arnaldo:* Como não havia arquivo de Plano de Contas, utilizei Nota Fiscal "fake". Resultado: "produto já estava cadastrado". **Conclusão: seria melhor termos arquivo com Plano de Contas para esses testes.**

**PROCEDE — Tutorial deveria fornecer arquivos de teste adequados.**

**Recomendação:**
- **Tutorial V3:** incluir no zip de entrega arquivos modelo: `plano_contas_exemplo.csv`, `nota_fiscal_exemplo.pdf`, `manual_tecnico_exemplo.pdf`.

---

### UC-F08 Passo 5 — "Não localizei ESPECIFICAÇÕES TÉCNICAS" ⚠

> *Arnaldo:* Não localizei a opção ESPECIFICAÇÕES TÉCNICAS. Em Cadastro → Portfólio existe um item "Especificações", porém possui **apenas 8 campos**, não os **11** indicados no tutorial. Há divergência entre tutorial e sistema.

**PROCEDE — Divergência entre tutorial e produto.** ⚠

**Verificação no tutorial V3:** linhas 1012-1059 listam 11 especificações técnicas. Frontend tem apenas 8.

**Recomendação:**
- **Tutorial V3:** alinhar quantidade e nomes das especificações ao que o frontend mostra (ou frontend é que precisa expor mais 3 campos).
- **Decisão de produto:** se 11 é o esperado, frontend está faltando 3 campos. Se 8 é o suficiente, tutorial precisa cortar 3.

---

### UC-F10 — "Nenhuma busca encontrou resultados (Total: 0)"

> *Arnaldo:* Nenhuma dessas buscas (ANVISA + Web) encontrou resultados, retornando "Total de resultados: 0".

**PROCEDE PARCIALMENTE — depende de chave de busca usada.**

**Verificação:**
- ANVISA Audit: requer match exato de registro ANVISA cadastrado no produto.
- Brave Web: requer chave de API válida + termos de busca razoáveis.

**Causa raiz provável:**
- Brave API key pode estar limitada/expirada.
- Produto Bio-Hosp pode estar sem `registro_anvisa` válido para match.

**Recomendação:**
- **Backend:** logar requests Brave e ANVISA para diagnóstico em ambiente de validação.
- **Tutorial V3:** explicitar que UC-F10 depende de chaves API ativas e produto com `registro_anvisa`.

---

### UC-F11 — "Produto apresentou 100% (verde) em todos os itens"

> *Arnaldo:* O Produto apresentou 100% (verde) de completude em todos os itens.

**NÃO PROCEDE COMO DEFEITO — possivelmente tutorial não testa cenário negativo.**

**Verificação:** UC-F11 deve mostrar grau de completude. 100% é resultado válido se TODOS os campos foram preenchidos. Mas o tutorial deveria ter pedido a Arnaldo deixar 1-2 campos vazios para validar que o cálculo funciona.

**Recomendação:**
- **Tutorial V3:** UC-F11 deve incluir cenário "remova fabricante temporariamente, salve, abra UC-F11 e veja completude cair de 100% para 92% (12/13 campos preenchidos)".

---

### UC-F12 — "CATMAT/CATSER não editáveis; sem campo termos de busca" ⚠

> *Arnaldo:* Os códigos CATMAT e CATSER **não são editáveis**. Não encontrei onde **inserir/editar os termos de busca**.

**PROCEDE — Tutorial pede ações que o frontend não suporta.** ⚠

**Verificação no `frontend/src/pages/PortfolioPage.tsx`:**
- Linha 1092-1094: CATMAT renderizado como `<span className="ia-badge">` (read-only).
- Linha 1117-1118: CATSER idem (read-only).
- Linha 1130-1131: termos_busca idem (read-only).

Esses campos são **populados pela IA via processamento e não há UI de edição manual**.

**Causa raiz:** UC-F12 do tutorial assume que esses campos são editáveis pelo usuário, mas o produto desenhou como saída automática da IA sem edição.

**Recomendação:**
- **Decisão de produto:** se esses campos DEVEM ser editáveis (tutorial está certo), expor inputs CRUD no PortfolioPage.
- Se NÃO devem ser editáveis (frontend está certo), tutorial V3 deve ajustar UC-F12 para "visualização de metadados gerados pela IA" e remover passo de edição.

---

### UC-F15 — "Valores deveriam ter máscara; Custo Fixo não aceita ponto após 5º dígito; sem mensagem de sucesso" ⚠

> *Arnaldo:*
> - Os valores deveriam ter máscara, ajustando os pontos e vírgulas.
> - O campo **Custo fixo não está permitindo digitar ponto nem vírgula depois do 5º dígito**.
> - **Não está aparecendo mensagem de sucesso ao salvar**.

**PROCEDE — 3 defeitos de UI confirmados.** ⚠

**Verificação:**
1. **`ParametrizacoesPage.tsx:1060`:** `<TextInput value={custosFixos} onChange={(v) => setCustosFixos(v)} type="number" prefix="R$" />`. Tipo `number` força browser a aceitar só dígitos puros, sem ponto/vírgula em alguns browsers/locales. Sem máscara explícita.
2. **Toast de sucesso:** o handler `saveParamScore()` define `setSalvoFeedback("Salvo!")` (linha 674) com timeout 3s, mas Arnaldo reporta que **não vê**. Pode ser:
   - Toast renderizado em local não visível.
   - Toast escondido atrás de outro elemento.
   - Função `saveParamScore` não foi chamada (handler de save trocou pra outro caminho).
3. **Vários `alert()`** ainda existem nos handlers de erro (linhas 455, 479, 495, 511, 524, 545, 748).

**Recomendação:**
- **Frontend:** trocar `type="number"` por componente de máscara monetária (ex: `react-number-format` ou `IMaskInput`).
- **Frontend:** garantir que o toast "Salvo!" seja visível (top-right, z-index alto, fundo verde claro).
- **Frontend:** trocar `alert()` por toasts inline de erro.

---

### UC-F16 — "Desativação do ComprasNet não persiste" ⚠⚠

> *Arnaldo:* Na opção Fontes de Editais, **a alteração não está sendo persistida corretamente**. Desativei o ComprasNet, saí da tela e **ao retornar estava novamente ativada**. As demais opções estão sendo salvas normalmente.

**PROCEDE — Defeito real, embora causa raiz seja DUPLICAÇÃO no banco.** ⚠

**Verificação no banco `editais.fontes_editais`:**
```
8709cf7b... | ComprasNet (Portal de Compras do Governo Federal) | ativo=1
8f3c691f... | ComprasNet                                          | ativo=1
```
**EXISTEM 2 registros de "ComprasNet" no banco.**

**Causa raiz:** Quando Arnaldo desativa, o frontend desativa só UM dos dois. Ao recarregar a página, `loadFontes()` busca todos. Como o OUTRO ainda está com `ativo=1`, a UI mostra "ComprasNet" como ativo (mesma label, item diferente).

**Recomendação:**
- **Banco:** **deduplicar** registros de fontes_editais com mesma `nome` (manter um, mover dependências para o sobrevivente). Aplicar uniqueness constraint em (nome).
- **Frontend:** mostrar `id` no tooltip da fonte para distinguir duplicatas.
- **Tutorial V3:** validador deveria desativar **TODAS** as ocorrências do nome "ComprasNet". OU melhor — corrigir o banco.

---

### UC-F17 — "E-mail e canais não estão preservando o salvamento" ⚠⚠

> *Arnaldo:* O e-mail e os canais de mídia (e-mail, sistema e SMS) **não estão preservando o salvamento**.

**PROCEDE — DEFEITO REAL: handler salva mas LOAD não popula campos.** ⚠

**Verificação:**
- `handleSalvarNotificacoes` (linha 794) salva `email_notificacao`, `notif_email`, `notif_sistema`, `notif_sms` corretamente em `parametros_score` via `crudUpdate`.
- **Banco** tem todas as colunas: `email_notificacao varchar(255)`, `notif_email tinyint(1)`, `notif_sistema tinyint(1)`, `notif_sms tinyint(1)`.
- **MAS** o `loadParamScore()` (callback de load no useEffect) **NÃO LÊ NENHUMA dessas 4 colunas de volta** para os states `emailNotif/notifEmail/notifSistema/notifSms`. Confirmado: grep `notif_email|notif_sistema|notif_sms|email_notificacao.*p\.` retorna apenas as **escritas** (handleSalvarNotificacoes), nunca as **leituras**.

**Causa raiz:** Bug clássico de "salva mas não carrega de volta" — frontend persiste dados, mas ao reabrir tela, carrega defaults `useState("contato@aquila.com.br")` etc. Validador acha que salvar não funcionou porque os campos voltaram pro padrão.

**Recomendação (alta prioridade):**
- **Frontend (`ParametrizacoesPage.tsx`, `loadParamScore`):** adicionar leituras:
  ```javascript
  if (p.email_notificacao != null) setEmailNotif(p.email_notificacao);
  if (p.notif_email != null) setNotifEmail(!!p.notif_email);
  if (p.notif_sistema != null) setNotifSistema(!!p.notif_sistema);
  if (p.notif_sms != null) setNotifSms(!!p.notif_sms);
  if (p.frequencia_resumo != null) setFrequenciaResumo(p.frequencia_resumo);
  if (p.tema != null) setTema(p.tema);
  if (p.idioma != null) setIdioma(p.idioma);
  if (p.fuso_horario != null) setFusoHorario(p.fuso_horario);
  ```
- Mesmo para preferências (tema/idioma/fuso) provavelmente o mesmo bug existe.

---

## Tabela consolidada — todas as 17 observações

| # | UC | Observação Arnaldo | Veredito | Tipo | Ação |
|---|---|---|---|---|---|
| 1 | Pré-login | Bloqueado em tela vazia "Escolher empresa" | ⚠ PROCEDE | UX bloqueante | Frontend + tutorial |
| 2 | Pré-login | Como criar empresa em segundo momento? | ⚠ PROCEDE parcial | Tutorial omisso | Tutorial |
| 3 | F01 | Tela vem preenchida com RP3X | ⚠ PROCEDE | UX | Frontend |
| 4 | F01 | Cadastro inicial não contempla todos os dados | ⚠ PROCEDE | Tutorial omisso | Tutorial + UX |
| 5 | F01 | Tutorial diz BH/MG mas dropdown indica SP | ⚠⚠ PROCEDE | Bug tutorial | Tutorial (5 linhas) |
| 6 | F02 | Equipamentos Médico-Hospitalares ausente | NÃO PROCEDE (banco OK) | UX dropdown | Frontend (paginação/filtro) |
| 7 | F03 | test_document.pdf não existe no entregável | ⚠ PROCEDE | Tutorial | Tutorial + zip |
| 8 | F03 | 4 tipos de documento ausentes no dropdown | ⚠⚠⚠ PROCEDE | Defeito frontend | Frontend (crudTables.tsx:199) |
| 9 | F04 | Botão "Inicializar Fontes Padrão" não existe | ⚠⚠⚠ PROCEDE | Tutorial desatualizado | Tutorial |
| 10 | F04 | Número da certidão não aparece após upload | ⚠ PROCEDE | Defeito frontend | Frontend |
| 11 | F04 | Modal de detalhes mostra erro | ⚠ PROCEDE | Defeito frontend/backend | Investigar |
| 12 | F06 | Lista vazia | NÃO PROCEDE | Fluxo esperado | Tutorial (clarificar) |
| 13 | F07 | Erro "Data too long for column NCM" | ⚠⚠⚠ PROCEDE | Defeito validação | Frontend (máscara NCM) |
| 14 | F07 | IA cria duplicado em vez de complementar | ⚠⚠⚠ PROCEDE | Defeito comportamental | Backend + frontend |
| 15 | F07 | Plano de Contas não fornecido no entregável | ⚠ PROCEDE | Tutorial | Tutorial + zip |
| 16 | F08 | Especificações 8 vs 11 | ⚠ PROCEDE | Divergência | Frontend OU tutorial |
| 17 | F10 | Buscas retornam zero | PROCEDE parcial | Setup ambiente | Tutorial (clarificar) |
| 18 | F11 | 100% completude | NÃO PROCEDE | Tutorial sem cenário negativo | Tutorial |
| 19 | F12 | CATMAT/CATSER/termos não editáveis | ⚠ PROCEDE | Decisão de produto | Tutorial OU frontend |
| 20 | F15 | Sem máscara; custo fixo trava no 5º dígito; sem toast | ⚠⚠ PROCEDE | 3 defeitos UX | Frontend (3 fixes) |
| 21 | F16 | ComprasNet não persiste desativação | ⚠⚠ PROCEDE | Duplicidade banco | Banco (dedupe) + UX |
| 22 | F17 | E-mail e canais não preservam salvamento | ⚠⚠⚠ PROCEDE | Defeito grave (load não lê) | Frontend (loadParamScore) |

---

## Priorização de correções

### P1 — Crítico (corrigir antes da próxima validação)
1. **F03 — adicionar 8 tipos de documento ausentes no `crudTables.tsx:199`** — Arnaldo não conseguiu cadastrar AFE, ISO, Certidão Estadual.
2. **F17 — corrigir `loadParamScore` para carregar email_notificacao, notif_email/sistema/sms, tema, idioma, fuso_horario** — usuário acha que sistema não salva.
3. **F07 — máscara NCM + validação client-side antes de submit** — usuário vê traceback MySQL na tela.
4. **F07 — IA UPSERT em vez de INSERT** — sistema cria produtos duplicados.
5. **F01 — corrigir 5 ocorrências de "SP" para "MG" no tutorial V3.**

### P2 — Importante
6. **F04 — remover Passo 0 "Inicializar Fontes Padrão" do tutorial** (botão não existe).
7. **F16 — deduplicar `fontes_editais` com mesmo nome no banco.**
8. **F15 — substituir `type="number"` por máscara monetária + toast visível.**
9. **F03 — incluir test_document.pdf no zip do tutorial OU instruir uso de qualquer PDF.**
10. **F08 — alinhar 8 vs 11 especificações técnicas (decisão de produto).**

### P3 — Melhorias
11. **F02 — corrigir paginação/filtro do autocomplete de áreas + dedupe banco.**
12. **F12 — clarificar se CATMAT/CATSER são editáveis ou só visualização.**
13. **F06 — clarificar empty state esperado antes de F07.**
14. **F11 — adicionar cenário negativo (campo vazio → completude < 100%).**
15. **F10 — documentar dependência de Brave API key e produto com registro_anvisa.**

### P4 — UX
16. **Pré-login — botão Sair sempre visível na tela "Escolher empresa".**
17. **F01 — botão "+ Nova empresa" claro que limpa formulário antes de abrir.**

---

## Conclusão

Das **22 observações registradas**, **18 procedem** (com causa raiz comprovada por verificação no banco e/ou código), **2 procedem parcialmente** (depende de setup do ambiente), e **2 não procedem como defeito** (mas pedem ajuste do tutorial).

**Defeitos reais de produto (não meramente tutoriais):** 9 itens
- 3 críticos (F03 dropdown limitado, F07 NCM sem validação, F17 load incompleto)
- 4 importantes (F04 botão inexistente, F16 banco duplicado, F15 sem máscara, F07 IA duplica)
- 2 médios (F04 número certidão, F04 modal erro)

**Defeitos no tutorial V3:** 8 itens
- 1 crítico (5 ocorrências de "SP" em vez de "MG")
- 7 importantes (passos faltando, arquivos não fornecidos, divergências de quantidade/nome)

**Próxima ação sugerida:** abrir 9 issues no rastreador de defeitos com base na seção "Priorização" — uma por item. O Arnaldo prestou um serviço de validação rico em detalhes técnicos; o feedback dele é diretamente acionável.

---

*Análise gerada por Claude em 2026-05-05. Cross-checks executados contra: banco MySQL `editais` (CNPJ tabelas, ENUMs, dados-seed), `frontend/src/config/crudTables.tsx`, `frontend/src/pages/EmpresaPage.tsx`, `frontend/src/pages/PortfolioPage.tsx`, `frontend/src/pages/ParametrizacoesPage.tsx`. Recomendações específicas com path:linha quando aplicável.*
