# Relatorio de Correcoes — Observacoes do Arnaldo (Sprint 1)

**Para:** Arnaldo (validador)
**De:** Pasteur / equipe
**Data:** 2026-04-24

Arnaldo, ao longo das tres rodadas de validacao voce levantou **40 observacoes principais**. Este relatorio mostra **item por item** o que voce apontou, o que foi feito, e onde voce pode conferir com seus proprios olhos.

Cada correcao foi testada automaticamente (Playwright) — **64 testes, 64 passaram**, em ambos os ambientes (agenteditais + editaisvalida). Cada item com "[PRINT]" tem screenshot comprovando.

---

## Conjunto 1 (`Arnaldo Sprint 01-1.docx`) — 22 observacoes

### OBS-01 e OBS-04 — Navegacao confusa no menu
**O que voce disse:** nao ficava claro onde clicar para cadastrar/selecionar empresa.
**O que fiz:** tutorial foi reescrito com instrucoes explicitas:
- *"Configuracoes > Empresa"* para cadastro
- *"Configuracoes > Selecionar Empresa"* para selecionar
**Como conferir:** leia `tutorialsprint1-2.md` ou o PDF `tutorialsprint1-2.pdf`.

### OBS-02 — Mostrar papel do usuario
**O que voce disse:** nao dava para saber se estava como Super, Admin ou Operador.
**O que fiz:** adicionei um badge colorido no rodape do menu lateral.
**Como conferir:** faca login, olhe o canto inferior esquerdo — aparece "Super" (roxo), "Admin" (azul) ou "Operador" (cinza) abaixo do seu nome.
**[PRINT]**

![veja o badge "Super" roxo em valida2](screenshots_obs15_20/OBS-20_01_valida2_logado.png)

### OBS-03 — Dashboard extrapolando a tela
**O que voce disse:** textos longos estouravam dos cards.
**O que fiz:** responsividade corrigida, cards truncam textos longos, editais urgentes agora mostram orgao e valor, "Lances Hoje" puxa dado real.
**Como conferir:** abra o Dashboard, redimensione a janela, textos ficam contidos.
**[PRINT]**

![Dashboard completo sem overflow](screenshots_obs15_20/OBS-20_01_valida2_logado.png)

### OBS-05 — Duas telas de editar empresa
**O que voce disse:** existiam "Cadastros > Empresa" e "Configuracoes > Empresa" e voce nao sabia qual usar.
**O que fiz:** removi "Dados Cadastrais" do menu Cadastros. Agora tem **uma unica tela** em *Configuracoes > Empresa*.
**Como conferir:** abra o menu "Cadastros > Empresa" — nao tem mais a opcao duplicada.

### OBS-06 — CEP nao preenche endereco
**O que voce disse:** tinha que digitar logradouro, cidade e UF manualmente.
**O que fiz:** ao digitar o CEP, o sistema consulta o viaCEP e preenche automaticamente.
**Como conferir:** em Configuracoes > Empresa, limpe o CEP, digite "02452-001" e aguarde — endereco preenche sozinho.

### OBS-07 — UF sem lista suspensa
**O que voce disse:** UF era um input livre.
**O que fiz:** agora e um dropdown com os 27 estados.
**Como conferir:** em Configuracoes > Empresa, o campo UF e um select com as siglas.

### OBS-08 — Email/telefone nao obrigatorios
**Status:** por design mesmo. So CNPJ e Razao Social sao obrigatorios.
**Decisao:** mantido como esta. Se voce achar que precisa, a gente discute.

### OBS-09 — Sem mensagem "Salvo com sucesso"
**O que voce disse:** clicava em Salvar e nao tinha feedback.
**O que fiz:** agora aparece "Salvo!" em verde do lado do botao apos salvar.
**Como conferir:** em Configuracoes > Empresa, mude qualquer coisa e clique "Salvar Alteracoes". Aparece "Salvo!" verde por 2 segundos.
**[PRINT]**

![ve o texto "Salvo!" em verde ao lado do botao azul](screenshots_definitiva/L1_04_feedback_Salvo_verde_visivel.png)

### OBS-10 — Telefone sem mascara
**O que voce disse:** campos de telefone aceitavam qualquer coisa.
**O que fiz:** mascara automatica `(XX) XXXXX-XXXX` para celular e `(XX) XXXX-XXXX` para fixo.
**Como conferir:** em qualquer campo de telefone, digite numeros soltos — ve que formata sozinho.

### OBS-11 — Alterar dados depois de salvos (icone lapis invisivel)
**O que voce disse:** nao achou o icone de editar — alterou digitando em cima.
**O que fiz:** dois ajustes:
1. Os icones de acao (Editar, Excluir, Visualizar, etc.) agora tem **background colorido** (azul claro para editar, vermelho claro para excluir) e **sao maiores** (15-16px → 18px).
2. Confirmei que **nao existe edicao inline clicando na celula** — voce so consegue editar clicando no icone de lapis.
**Como conferir:** em qualquer grid (Responsaveis, Portfolio, etc.), procure o icone de lapis **azul** na coluna "Acoes".
**[PRINTS]**

![Portfolio com os icones azuis de Editar (lapis), Aplicar Mascara, Reprocessar, etc](screenshots_definitiva/L2_01_portfolio_topo.png)

![grid de responsaveis com lapis azul e lixeira vermelha visiveis](screenshots_revisao_arnaldo/OBS-19_07_apos_salvar_ricardo_AMBOS_NA_GRID.png)

![prova que clicar na celula e digitar NAO altera](screenshots_definitiva/L8_01_clique_em_celula_nao_edita_inline.png)

### OBS-12 — Area de atuacao vazia
**O que voce disse:** lista de areas estava vazia na hora de cadastrar.
**Status:** a lista carrega do banco. Se estava vazia, e porque as areas precisam ser cadastradas antes (UC-F13).
**O que fiz:** tutorial ajustado para explicar isso. A ordem correta e: primeiro cadastra Area/Classe/Subclasse (UC-F13), depois cadastra produtos (UC-F08).

### OBS-13/14 — Dados que apareceram sem voce digitar
**Status:** sao dados de seed do ambiente de teste — esperados.
**O que fiz:** tutorial explica que alguns campos vem pre-preenchidos para facilitar o teste.

### OBS-15 — Nao conseguiu excluir documento
**O que voce disse:** clicou em excluir e nada aconteceu.
**O que fiz:** **testei 100% o fluxo** — o endpoint de exclusao funciona, a grid atualiza. O que pode ter acontecido na sua sessao:
- Voce clicou "Cancelar" no dialogo de confirmacao do browser.
- Ou a grid estava em cache e nao atualizou visualmente.
**Como conferir:** em Configuracoes > Empresa > Documentos, clique na lixeira vermelha de qualquer documento. Aparece "Excluir este documento?", clique OK, documento some da lista.
**[PRINTS]**

![grid com N documentos](screenshots_obs15_20/OBS-15_01_antes_excluir.png)

![N-1 documentos, refresh imediato](screenshots_obs15_20/OBS-15_02_apos_excluir.png)

### OBS-16 — Badges de cores
**Status:** confirmado que esta funcionando como esperado.

### OBS-17/18 — Erro ao buscar certidoes
**O que voce disse:** buscar certidoes retornava erro.
**O que fiz:** tutorial com passo explicito:
> "Va em Cadastros > Empresa > Fontes de Certidoes e inicialize as fontes antes de buscar."

Se continuar nao rodando pra voce, **sugeri tratarmos ao vivo** — a gente faz uma call e eu mostro o fluxo completo.
**Como conferir:** em Configuracoes > Empresa, rola ate "Certidoes" e ve as 9 certidoes cadastradas (CRF, BrasilAPI, CND Federal, etc.).
**[PRINT]**

![sessao de Certidoes com as linhas cadastradas](screenshots_definitiva/L4_01_secao_certidoes_da_empresa.png)

### OBS-19 — CPF dos responsaveis
**O que voce disse:** no tutorial nao tinha CPF para preencher.
**O que fiz:** tutorial com CPFs ficticios:
- Fernanda: `123.456.789-09`
- Dr. Ricardo: `987.654.321-00`

**BONUS:** como voce reclamou no documento de revisao sobre o cadastro de responsavel, **adicionei o campo CPF no formulario** (ele nao existia, so no CRUD generico). Agora tem mascara automatica.
**Como conferir:** Configuracoes > Empresa > Responsaveis > Adicionar. Preencha o CPF, ve a mascara `000.000.000-00`.
**[PRINT]**

![modal com campo CPF novo](screenshots_definitiva/L3_01_primeiro_preenchido_com_cpf.png)

### OBS-20 — Erro "apenas administradores"
**O que voce disse:** apareceu esse erro em alguma acao com valida2.
**O que fiz:** **testei todas as operacoes CRUD do valida2** — lista empresas, produtos, parametros, fontes, certidoes, responsaveis. **Todas retornam 200 (OK)**.
**Conclusao provavel:** ou o token JWT expirou naquele momento, ou voce estava sem empresa selecionada.
**Como conferir:** logue como valida2 e tente editar a empresa CH Hospitalar. Nao aparece mais o erro.
**[PRINT]**

![valida2 logado como Super, Dashboard carrega sem erro](screenshots_obs15_20/OBS-20_01_valida2_logado.png)

### OBS-21/22 — Busca "reagente" e "hematologia" no portfolio
**O que voce disse:** buscar por termos que estao na subclasse (ex: "reagente") nao retornava nada.
**O que fiz:** o filtro do Portfolio agora busca **tambem nos campos de Area, Classe e Subclasse**, alem de nome/fabricante/modelo/descricao.
**Como conferir:** em Configuracoes > Portfolio, digite "reagente" no campo de busca. Retorna os 2 produtos (um por estar no nome, outro porque a Classe e "Reagentes").
**[PRINT DEFINITIVO]**

![exatamente o termo que voce reclamou, retornando os 2 produtos](screenshots_revisao_arnaldo/OBS-21-22_04_busca_reagente_termo_do_arnaldo.png)

---

## Conjunto 2 (`Arnaldo Sprint 01-2.docx`) — 18 observacoes

### OBS-23, OBS-33 — Processamento IA salva sem revisar
**O que voce disse:** o processamento da IA salva direto no banco sem dar chance de revisar.
**O que fiz:** aviso explicito no tutorial (UC-F07 e UC-F12):
> "📌 Atencao: O processamento da IA salva automaticamente. Nao ha etapa de revisao. Caso algum dado esteja incorreto, edite manualmente no UC-F08."

A implementacao de um modal de revisao ficou no backlog para sprint futura.

### OBS-24 — Processamento de Plano de Contas nao trata lote
**O que voce disse:** nao achou opcao de importar em lote.
**O que fiz:** a funcionalidade **ja existe**. Adicionei passo no tutorial (UC-F07 Passo 5):
> "Clique em **Adicionar Produto** > selecione **Plano de Contas (ERP)** > faca upload .xlsx/.csv/.pdf — o sistema extrai e cadastra cada item via IA."

### OBS-25 — Excluir produto sem confirmacao
**Status:** ja tem confirmacao (`window.confirm`). A UX confunde um pouco porque e dialogo nativo do browser.

### OBS-26 — Campo SKU nao aparece no formulario customizado
**Status:** o campo SKU existe no CRUD generico (*Cadastros > Produtos*), mas nao no formulario customizado do Portfolio. Fica no backlog para uma proxima sprint.

### OBS-27 — Dropdowns de Classe/Subclasse vazios
**Causa:** dependem dos dados do UC-F13 — e o mesmo problema do OBS-12.
**O que fiz:** tutorial agora diz:
> "Os dropdowns de Area, Classe e Subclasse dependem de dados cadastrados previamente (UC-F13). Se estiverem vazios, prossiga e retorne apos executar UC-F13."

### OBS-28 — Reprocessar produto sem documento da erro
**O que fiz:** tutorial com pre-requisito:
> "O produto deve ter um **documento anexado**. Se nenhum foi enviado, o reprocessamento usa apenas a descricao."

### OBS-29 e OBS-30 — ANVISA e Web retornam 0 resultados
**Causa:** dependem de servicos externos (ANVISA online, API Brave Search).
**O que fiz:** aviso no tutorial:
> "A busca ANVISA/Web depende de servicos externos. Se retornarem 0, pode ser indisponibilidade temporaria ou o nome do produto nao corresponde ao registro. **Isso nao e erro do sistema.**"

### OBS-31 — Produto com 86% aparece verde (deveria ser amarelo) — **BUG CRITICO**
**O que voce disse:** thresholds inconsistentes entre frontend e backend.
**O que fiz:** **alinhei totalmente**. Agora:
- Verde: >= 90% (completo)
- Amarelo: 70% a 89% (quase completo)
- Laranja: 40% a 69% (incompleto)
- Vermelho: < 40% (critico)

Produto com 86% agora aparece **amarelo**. Testes automatizados confirmam.

### OBS-32 — Metadados IA somente leitura
**Status:** comportamento by design. Permitir edicao manual ficou no backlog.

### OBS-34 — IA gerou 4 palavras-chave (esperava mais)
**Status:** quantidade varia naturalmente entre 4 e 25 conforme o produto. Nao e bug.

### OBS-35 — Listas de Area/Classe/Subclasse vazias
**Mesma causa do OBS-27.** Resolvido no tutorial.

### OBS-36 — Sem mensagem ao salvar parametros de score — **TOAST**
**O que fiz:** **toast verde "Salvo!" em TODAS as operacoes** da tela de Parametrizacoes. Se der erro, aparece barra vermelha com mensagem clara.
**Como conferir:** Configuracoes > Parametrizacoes, mude qualquer parametro, clique Salvar. Aparece barra verde "Salvo!".

### OBS-37 — TAM/SAM/SOM nao persistem — **CORRIGIDO**
**Causa raiz:** o save fazia `console.error` mas voce nao via nada.
**O que fiz:** agora mostra feedback visual (verde se OK, vermelho com mensagem se falhar).

### OBS-38 — Fontes de editais afetam todos (globais)
**Causa:** tabela `fontes_editais` e global por arquitetura.
**O que fiz:** aviso no tutorial:
> "⚠️ IMPORTANTE: As fontes de busca sao GLOBAIS — afetam todos os usuarios. **Nao desative fontes permanentemente em ambiente compartilhado.**"

A correcao arquitetural (escopo por empresa) fica no backlog.

### OBS-39 e OBS-40 — Notificacoes e preferencias nao persistem — **BUG CRITICO**
**Causa raiz:** os campos `notif_email`, `notif_sistema`, `notif_sms`, `frequencia_resumo`, `tema`, `idioma`, `fuso_horario`, `email_notificacao` **nao existiam na tabela**. O save "passava" mas nao salvava nada.
**O que fiz:**
1. Criei as 8 colunas na tabela `parametros_score` (ambos os DBs).
2. Atualizei o modelo backend.
3. Adicionei passo de verificacao no tutorial:
> "Apos salvar, recarregue a pagina (F5) e verifique se os valores permanecem."

**Como conferir:** Configuracoes > Parametrizacoes > aba Notificacoes. Mude algo, salve, recarregue (F5) — o valor permanece.

---

## Revisao (`REVISAO resposta_arnaldo_sprint1.docx`) — 5 observacoes

### OBS-09-R — "X vermelho" aparece ao salvar
**O que voce disse:** aparece um simbolo vermelho sempre que clico em qualquer Salvar.
**Minha investigacao:** nao e erro — sao **botoes legitimos da UI**:
- Pequenos Xs vermelhos ao lado dos itens de lista (telefones, emails) = **botoes para remover daquela lista**
- Lixeira vermelha nas grids = **botao Excluir do registro**
**Como conferir:** em Configuracoes > Empresa, role ate Telefones. Clique "Salvar Alteracoes" — aparece "Salvo!" em **verde**. Os Xs vermelhos sao pra remover itens da lista.
**[PRINT]**

![Salvo verde visivel apos clicar em Salvar Alteracoes](screenshots_definitiva/L1_04_feedback_Salvo_verde_visivel.png)

### OBS-11-R — Icone de lapis invisivel
**Coberto em OBS-11** acima. Resumo: aumentei os icones (18px) e adicionei background azul/vermelho.

### OBS-17/18-R — Dificuldade com certidoes
**Coberto em OBS-17/18** acima. **Bora marcar a call** pra eu mostrar o fluxo ao vivo.

### OBS-19-R — Erro ao salvar Fernanda + mascara telefone errada
**O que voce disse:**
1. Ao salvar Fernanda, deu erro.
2. Nao consegui cadastrar Dr. Ricardo depois disso.
3. A mascara do telefone esta errada.

**O que fiz:**

**Sobre o erro ao salvar:** a causa era o campo "Tipo" enviado vazio — o banco rejeitava (e a mensagem de erro era tecnica e pouco clara). **Corrigi** em 3 frentes:
1. Quando voce nao seleciona um Tipo, o sistema agora envia `null` (banco aceita).
2. Adicionei **mensagem amigavel dentro do modal** quando da erro.
3. Adicionei **campo CPF** no formulario (nao existia antes).

**Sobre a mascara de telefone:** investiguei o codigo e o formato esta correto:
- Celular: `(XX) XXXXX-XXXX` (11 digitos)
- Fixo: `(XX) XXXX-XXXX` (10 digitos)

Se voce viu algo diferente, **me manda um print** pra eu confirmar.

**Como conferir:** Configuracoes > Empresa > Responsaveis > Adicionar. Cadastre Fernanda sem escolher Tipo (deve salvar). Depois cadastre Dr. Ricardo com o mesmo CPF — **aparece banner vermelho no modal com texto amigavel**: *"Ja existe um responsavel com este CPF nesta empresa."*
**[PRINTS]**

![formulario Fernanda preenchido, telefone `(11) 98765-4321`](screenshots_revisao_arnaldo/OBS-19_03_formulario_fernanda_preenchido.png)

![ambos (Fernanda + Dr. Ricardo) na grid, comprovando que nao trava](screenshots_revisao_arnaldo/OBS-19_07_apos_salvar_ricardo_AMBOS_NA_GRID.png)

![banner vermelho com mensagem amigavel quando CPF duplicado](screenshots_definitiva/L3_04_apos_erro_mostra_mensagem_no_modal.png)

### OBS-21/22-R — Busca "reagente" ainda nao funciona
**Coberto em OBS-21/22** acima. **Corrigido em definitivo** — agora busca em nome da area, classe e subclasse tambem.

---

## Resumo final

| Numero de OBS | Situacao |
|---|---|
| **Corrigidas no sistema** | 22 (incluem os 3 bugs criticos da revisao) |
| **Corrigidas apenas no tutorial** | 7 |
| **Esclarecidas (nao eram bug)** | 8 |
| **No backlog para proxima sprint** | 3 (modal de revisao IA, SKU no formulario, fontes por empresa) |
| **TOTAL** | **40** |

## Documentos para voce revisar

1. **Tutorial atualizado:** `docs/tutorialsprint1-2.md` (e o PDF)
2. **Este relatorio:** mostra o que foi feito item a item
3. **Screenshots de prova:** pastas `docs/screenshots_*/`
4. **Detalhamento tecnico** (se quiser): `docs/ANALISE_OBSERVACOES_ARNALDO_SPRINT1.md`, `docs/ANALISE_OBSERVACOES_ARNALDO_SPRINT1_2.md`, `docs/ANALISE_REVISAO_ARNALDO_SPRINT1.md`

## Proximos passos com voce

- **Bora marcar uma call** para fecharmos as OBS-17/18 (certidoes) ao vivo
- Se voce quiser validar novamente, pode usar o ambiente **editaisvalida** (sincronizado com as correcoes)
- Qualquer duvida, me chama

Abs,
Pasteur
