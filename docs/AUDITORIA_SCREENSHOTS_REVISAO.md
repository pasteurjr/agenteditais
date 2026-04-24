# AUDITORIA HONESTA — Screenshots da Revisao do Arnaldo

**Data:** 2026-04-24
**Proposito:** Para cada OBS corrigida, identificar qual screenshot PROVA visualmente a correcao, qual nao prova, e qual correcao nao tem prova visual (so prova logica/API).

---

## Sumario por OBS

| OBS | Correcao | Screenshot(s) que provam visualmente | Verdict |
|---|---|---|---|
| OBS-21/22-R | Filtro inclui subclasse/classe/area | 21-22_01, 21-22_02, 21-22_03, **21-22_04** | **PROVADO** |
| OBS-19-R (fluxo) | Cadastrar 2 responsaveis sem erro | 19_02, 19_03, 19_04, 19_05, 19_06, **19_07** | **PROVADO** |
| OBS-19-R (ENUM) | tipo "" → NULL | **19_04, 19_07** (Tipo = "-") | **PROVADO** |
| OBS-19-R (friendly error) | Duplicate entry amigavel | Nenhum (so API) | Provado por asserção HTTP, sem screenshot |
| OBS-11-R (ícones) | Background azul, size 18 | 19_01, 19_04, 19_07, 21-22_01, 21-22_02, 21-22_03, 21-22_04 | **PROVADO** (ícones visíveis em múltiplas telas) |
| OBS-09-R | Não aparece X vermelho de erro ao salvar | 09_02 (= 09_03) | **PARCIALMENTE PROVADO** |
| OBS-17/18-R | Endpoint fontes-certidoes OK | Nenhum | Provado por API (200 OK, schema contém entidade) |

---

## Screenshot-a-screenshot — o que cada uma mostra

### 1. `OBS-09_01_tela_empresa_inicial.png`
**Mostra:** topo da tela "Dados da Empresa" — campos Razão Social, CNPJ, Inscrição Estadual, Área, Presença Digital, Endereço. Sem botões visíveis à direita, sem interação.
**Prova:** NADA sobre OBS-09-R. É só o estado inicial. Contexto.

### 2. `OBS-09_02_apos_salvar.png` e 3. `OBS-09_03_botao_excluir_vermelho_adjacente.png`
**Duas screenshots IDÊNTICAS** (md5 bate). Bug no meu spec — tirei 2 shots sem ação entre eles.
**Mostram:** lista de telefones (6 linhas) com **X no circulo à direita** de cada um (botão remover da lista). Botão "Salvar Alterações" azul. Abaixo: "Alertas IA sobre Documentos" e grid "Documentos da Empresa" com **lixeira vermelha** na coluna AÇOES.
**Prova OBS-09-R?** Parcialmente. Mostra os "X vermelhos" que confundem (são botões remover) e a lixeira vermelha (botão excluir), confirmando que **não são mensagens de erro, são componentes de UI**. MAS não mostra o antes/depois de clicar Salvar — não dá pra provar visualmente que Salvar não gerou erro. A prova disso está no teste: `expect(errorMessages).toBe(0)`.

### 4. `OBS-11_01_responsaveis_com_icones.png` e 5. `OBS-11_02_portfolio_icones_acao.png`
**Ambas mostram a MESMA tela (Empresa/Certidões)**. A nomeada "portfolio" não mostra Portfolio porque o `navTo("Portfolio")` não navegou antes do shot. Md5 diferente mas conteúdo essencialmente igual.
**Mostram:** grid de Certidões com ícones coloridos à direita (lápis azul, upload laranja, refresh ciano, globo azul) — todos com background visível.
**Prova OBS-11-R?** SIM para a tela Empresa. Para o Portfolio, a prova vem das screenshots 21-22_*.

### 6. `OBS-19_01_secao_responsaveis.png`
**Mostra:** grid Responsaveis ANTES do cadastro. 4 responsáveis (Paulo + Carla duplicados do seed). Ícones de ação coloridos.
**Prova:** estado inicial. Prepara contexto para OBS-19.

### 7. `OBS-19_02_modal_aberto_fernanda.png`
**Mostra:** modal "Adicionar Responsavel" aberto, todos os campos vazios. Tipo mostrando "Selecione o tipo..." (placeholder). Botões Cancelar e Salvar visíveis.
**Prova:** contexto. Modal abre corretamente.

### 8. `OBS-19_03_formulario_fernanda_preenchido.png`
**Mostra:** modal com dados preenchidos: Nome "Fernanda Silva Diretora", Cargo "Diretora Tecnica", Email "fernanda@test.com", Telefone "(11) 98765-4321". **Tipo CONTINUA VAZIO ("Selecione o tipo...")**. Botão Salvar ATIVO (azul).
**Prova OBS-19-R (ENUM vazio aceitável):** SIM. O botão ficou ativo mesmo sem tipo selecionado.

### 9. `OBS-19_04_apos_salvar_fernanda.png`
**Mostra:** grid Responsaveis apos save. Primeira linha: **"-" | Fernanda Silva Diretora | Diretora Tecnica | fernanda@test.com**. O "-" na coluna Tipo indica NULL.
**Prova OBS-19-R (persistência + ENUM → NULL):** SIM. Fernanda salva, Tipo exibido como "-".

### 10. `OBS-19_05_modal_aberto_ricardo.png`
**Mostra:** modal reaberto (cadastro 2). Campos vazios. Atrás do modal: Fernanda já na grid.
**Prova:** Fernanda persiste entre cadastros (contexto).

### 11. `OBS-19_06_formulario_ricardo_preenchido.png`
**Mostra:** modal com Dr. Ricardo Oliveira / Medico Responsavel / ricardo@test.com / (11) 3333-4444. Tipo vazio. Salvar ativo.
**Prova OBS-19-R:** idem 19_03, mas para o 2º cadastro.

### 12. `OBS-19_07_apos_salvar_ricardo_AMBOS_NA_GRID.png` **(PROVA MAIS FORTE)**
**Mostra:** grid com AMBOS os cadastros:
- Linha 1: **- | Dr. Ricardo Oliveira | Medico Responsavel | ricardo@test.com**
- Linha 2: **- | Fernanda Silva Diretora | Diretora Tecnica | fernanda@test.com**
- + Paulo + Carla + duplicados
Ícones com background colorido em todas as linhas.
**Prova OBS-19-R:** SIM. **O bug original do Arnaldo (não conseguir cadastrar o 2º após erro do 1º) está corrigido — os dois aparecem.**
**Prova OBS-11-R:** SIM. Ícones visíveis.

### 13. `OBS-21-22_01_portfolio_inicial.png`
**Mostra:** Portfolio estado inicial. 2 produtos: Kit Reagente Diagnostico Hematologia Sysmex (Classe "Reagentes Hematologia", Subclasse "Hemograma Completo") e Monitor Multiparametrico iMEC10 Plus (Classe "Reagentes", Subclasse "Coagulação"). Ícones coloridos na coluna AÇOES.
**Prova:** contexto + OBS-11-R (ícones visíveis no Portfolio).

### 14. `OBS-21-22_02_busca_coagulacao.png`
**Mostra:** busca "Coagula" retornou **1 produto** (Monitor Multiparametrico). Nome do produto NÃO contém "coagula" — apareceu porque o filtro agora busca em Subclasse ("Coagulação").
**Prova OBS-21/22-R:** SIM (busca por nome de subclasse).

### 15. `OBS-21-22_03_busca_hemograma.png`
**Mostra:** busca "Hemograma" retornou **1 produto** (Kit Reagente Diagnostico Hematologia Sysmex). Nome do produto contém "Hematologia" mas NÃO "Hemograma" — apareceu via Subclasse ("Hemograma Completo").
**Prova OBS-21/22-R:** SIM.

### 16. `OBS-21-22_04_busca_reagente_termo_do_arnaldo.png` **(PROVA DEFINITIVA)**
**Mostra:** busca "**reagente**" (EXATAMENTE o termo do Arnaldo) retornou **AMBOS os produtos**: Kit Reagente + Monitor Multiparametrico. O Monitor **não tem "reagente" no nome**, só na Classe — apareceu porque o filtro busca no nome da CLASSE.
**Prova OBS-21/22-R:** SIM, na condição exata do reclame do Arnaldo.

---

## Correções sem prova visual (só lógica/API)

### OBS-19-R (parte) — `_friendly_error` traduz Duplicate entry

Screenshot? **Nenhum** — é uma asserção HTTP. O teste Playwright `OBS-19-R: _friendly_error traduz...` faz:
```js
POST /api/crud/empresa-responsaveis (cpf: "12345678909")  → 201
POST /api/crud/empresa-responsaveis (cpf: "12345678909")  → 400
expect(errJson.error).toContain("Ja existe um responsavel com este CPF");
expect(errJson.error).not.toContain("IntegrityError");
```

**Se você quer prova visual, eu precisaria simular o fluxo pela UI de uma tela que exponha o campo CPF do responsável. Mas o formulário do responsável NÃO tem campo CPF** (já reportado como OBS-26 PROCEDE PARCIAL). O teste cobre o comportamento via API direta — que é o caminho real usado pelo CRUD genérico.

### OBS-17/18-R — Fontes de certidoes

Screenshot? **Nenhum** — validação por API (GET retorna 200, schema contém entidade).

**Se você quer prova visual**, eu precisaria navegar até `Configuracoes > Fontes de Certidões`, capturar screenshot do listado, e depois uma demo em vídeo do fluxo de inicialização. Isso foi deixado para chamada direta com o Arnaldo (OBS-17/18-R é "INFORMATIVO").

---

## Lacunas de prova visual (honesto)

| Lacuna | Impacto | O que faria para corrigir |
|---|---|---|
| `OBS-09_02` ≡ `OBS-09_03` (idênticas) | Baixo | Adicionar scroll entre shots ou capturar estado antes/depois de clicar Salvar |
| `OBS-11_02` mostra Empresa, não Portfolio | Nenhum (21-22_01 cobre) | Adicionar `page.scrollTo(0,0)` após navTo e esperar `page.waitForSelector("text=Portfolio de Produtos")` |
| Sem screenshot do friendly_error | Nenhum (UI não tem CPF) | Idem: precisaria adicionar campo CPF no formulário primeiro |
| Sem screenshot de fontes-certidoes | Nenhum (informativo) | Capturar navegação até a tela (rápido de adicionar) |

**Nenhuma lacuna invalida uma correção.** Todas as correções têm algum tipo de prova (screenshot OU asserção HTTP).

---

## Veredicto final

**Das 5 OBS da revisão:**

| OBS | Prova visual | Prova lógica/HTTP | Funciona? |
|---|---|---|---|
| OBS-21/22-R | 4 screenshots | asserção de linhas em DataTable | **SIM** |
| OBS-19-R (fluxo) | 6 screenshots | HTTP 201 x2 | **SIM** |
| OBS-19-R (ENUM) | 2 screenshots (Tipo = "-") | backend normaliza | **SIM** |
| OBS-19-R (friendly) | — | HTTP 400 com msg traduzida | **SIM** |
| OBS-11-R | 7 screenshots | computed styles RGB | **SIM** |
| OBS-09-R | 2 screenshots (idênticas, mas contextualmente úteis) | assertion errorMessages=0 | **SIM, mas prova fraca** |
| OBS-17/18-R | — | HTTP 200 + schema | Infraestrutura existe |

**Sim, existem provas reais para todas as correções. OBS-09-R tem a prova mais fraca (screenshots duplicadas), mas o comportamento foi verificado por asserção no DOM.**

As únicas 2 OBS sem screenshot visual são aquelas onde a prova visual não faz sentido (API) ou a UI não expõe o campo (friendly_error com CPF).
