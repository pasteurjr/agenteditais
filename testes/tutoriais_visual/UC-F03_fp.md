---
uc_id: UC-F03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F03_visual_fp.yaml
---

# UC-F03 — Gerir documentos da empresa (Fluxo Principal)

> **PO:** acompanhe a execucao. Cada parada eh um marco logico — voce decide aprovar/reprovar e opcionalmente comenta.
>
> **Cenario:** apos UC-F01 (cria empresa) + UC-F18 (vincula) + UC-F01 04c (seleciona ativa), o tester navega para EmpresaPage > Documentos da Empresa, faz upload de 3 documentos diferentes (Contrato Social sem validade, CRF FGTS com validade futura, Alvara com validade vencida) e confirma que os 3 aparecem na lista.
>
> **Pre-requisitos:**
> - UC-F01 + UC-F18 ja executados (empresa criada e vinculada)
> - users.pasta_documentos_teste configurado (default: `/home/pasteurjr/Documentos/documentos_sintetizados`)
> - 3 PDFs em `<pasta>/sprint1/UC-F03/` : `contrato_social.pdf`, `fgts.pdf`, `alvara.pdf`
> - Seed do banco editais com `categorias_documento` e `documentos_necessarios` (existe).

## Passo 00 — Setup: navegar para EmpresaPage e localizar Card Documentos

Garante que a sidebar esta aberta em Configuracoes > Empresa, navega para EmpresaPage, e scrolla ate o card "Documentos da Empresa".

**Observe criticamente:**
- User permanece logado (sessao do UC-F01)
- Item "Empresa" da secao "Configuracoes" da sidebar visivel
- EmpresaPage carrega com cabecalho "Dados da Empresa"
- Card "Documentos da Empresa" visivel apos scroll com botao "+ Upload Documento" no header
- Tabela de documentos pode estar vazia ("Nenhum documento cadastrado") ou ja com itens (se rodada antiga)

```yaml
id: passo_00_setup_navegar_documentos
acao:
  sequencia:
    # IDEMPOTENTE: garante secao Configuracoes expandida
    - tipo: evaluate
      valor_literal: |
        () => {
          const cfg = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => {
              const t = b.querySelector('.nav-section-label')?.textContent.trim();
              return t === 'Configuracoes' || t === 'Configurações';
            });
          if (!cfg) throw new Error('secao Configuracoes nao encontrada');
          if (!cfg.classList.contains('expanded')) cfg.click();
          return 'ok';
        }
    # Item "Empresa" eh nav-item de Configuracoes (NAO subsection-header de Cadastros).
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Empresa"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Empresa"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:has-text("Dados da Empresa"), h2:has-text("Dados da Empresa")'
      timeout: 15000
    # Scrolla para o card Documentos da Empresa
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3, h2')];
          const card = titulos.find(el => /Documentos da Empresa/i.test(el.textContent || ''));
          if (!card) throw new Error('Card "Documentos da Empresa" nao encontrado na pagina');
          card.scrollIntoView({block: 'center', behavior: 'instant'});
          return 'scrolled';
        }
    - tipo: wait_for
      seletor: 'button.action-button:has-text("Upload Documento"), button.action-button-secondary:has-text("Upload Documento")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F03_visual_fp.yaml#passo_00_setup_navegar_documentos"
```

## Passo 01 — Abrir Modal "Upload de Documento" (1a vez, para Doc 1)

Click no botao "+ Upload Documento" do header do Card "Documentos da Empresa". Abre Modal "Upload de Documento" com 3 campos: Tipo de Documento (select com optgroups), Arquivo (file input), Validade (date input).

**Observe criticamente:**
- Modal aparece centralizado com titulo "Upload de Documento"
- Campo "Tipo de Documento *" (asterisco vermelho — obrigatorio) com select tendo optgroups visiveis: Habilitação Jurídica, Habilitação Fiscal, Habilitação Econômico-Financeira, Qualificação Técnica, Sanitárias e Regulatórias, Outros
- Campo "Arquivo" com input file (accept .pdf,.doc,.docx,.jpg,.png)
- Campo "Validade" com input type=date
- Botoes "Cancelar" e "Enviar" no rodape (Enviar inicialmente desabilitado ate Tipo ser escolhido)

```yaml
id: passo_01_abrir_modal_doc1
acao:
  sequencia:
    - tipo: click
      seletor: 'button.action-button:has-text("Upload Documento"), button.action-button-secondary:has-text("Upload Documento")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'div.modal h2:has-text("Upload de Documento")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Tipo de Documento")) select'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F03_visual_fp.yaml#passo_01_abrir_modal_doc1"
```

## Passo 02 — Preencher Doc 1: Contrato Social (sem validade) e Enviar

Seleciona tipo "Contrato Social" no select, anexa arquivo `contrato_social.pdf`, deixa validade em branco, clica Enviar. Backend recebe POST e cria registro.

**Observe criticamente:**
- Select "Tipo de Documento" muda para "Contrato Social" (categoria Habilitação Jurídica)
- Apos selecionar arquivo, nome do arquivo aparece visualmente ao lado do input file (browser nativo)
- Campo "Validade" permanece vazio
- Botao "Enviar" fica habilitado (azul, primary)
- Apos click em Enviar, modal fecha, tabela "Documentos da Empresa" mostra 1 linha com "Contrato Social" e badge "OK" (verde)
- Sem mensagem vermelha

```yaml
id: passo_02_preencher_doc1_contrato
acao:
  sequencia:
    # 1. Seleciona Tipo "Contrato Social" no select dentro do modal
    - tipo: select
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Tipo de Documento")) select'
      valor_from_dataset: "doc1_tipo_nome"
      timeout: 5000
    # 2. Anexa arquivo Contrato Social via input[type=file]
    - tipo: upload_arquivo
      seletor: 'div.modal-body input[type="file"]'
      valor_from_pasta_docs: "sprint1/UC-F03/contrato_social.pdf"
      timeout: 5000
    # 3. Deixa validade vazia (nao mexe no campo). Clica Enviar.
    - tipo: click
      seletor: 'div.modal-footer button.btn-primary:has-text("Enviar")'
      timeout: 5000
    # 4. Aguarda salvamento (modal fecha via setShowDocModal(false))
    - tipo: wait
      valor_literal: 2500
    # 5. Confirma que linha "Contrato Social" apareceu na tabela
    - tipo: wait_for
      seletor: 'text=Contrato Social'
      timeout: 8000
validacao_ref: "testes/casos_de_teste/UC-F03_visual_fp.yaml#passo_02_preencher_doc1_contrato"
```

## Passo 03 — Abrir Modal "Upload de Documento" (2a vez, para Doc 2)

Click novamente no botao Upload Documento para abrir o modal pra inserir o segundo documento (FGTS).

**Observe criticamente:**
- Modal abre novamente vazio (sem dados do upload anterior)
- Campos Tipo, Arquivo e Validade limpos

```yaml
id: passo_03_abrir_modal_doc2
acao:
  sequencia:
    - tipo: click
      seletor: 'button.action-button:has-text("Upload Documento"), button.action-button-secondary:has-text("Upload Documento")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'div.modal h2:has-text("Upload de Documento")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F03_visual_fp.yaml#passo_03_abrir_modal_doc2"
```

## Passo 04 — Preencher Doc 2: CRF FGTS (validade futura 2026-12-31) e Enviar

**Observe criticamente:**
- Tipo selecionado: "CRF - Certificado de Regularidade do FGTS" (categoria Habilitação Fiscal)
- Validade preenchida com 2026-12-31
- Apos Enviar, tabela mostra 2 linhas (Contrato Social + CRF FGTS) ambas com badge "OK"

```yaml
id: passo_04_preencher_doc2_fgts
acao:
  sequencia:
    - tipo: select
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Tipo de Documento")) select'
      valor_from_dataset: "doc2_tipo_nome"
      timeout: 5000
    - tipo: upload_arquivo
      seletor: 'div.modal-body input[type="file"]'
      valor_from_pasta_docs: "sprint1/UC-F03/fgts.pdf"
      timeout: 5000
    # Preenche validade
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Validade")) input[type="date"]'
      valor_from_dataset: "doc2_validade"
      timeout: 5000
    - tipo: click
      seletor: 'div.modal-footer button.btn-primary:has-text("Enviar")'
      timeout: 5000
    - tipo: wait
      valor_literal: 1500
    - tipo: wait_for
      seletor: 'text=CRF - Certificado de Regularidade do FGTS'
      timeout: 8000
validacao_ref: "testes/casos_de_teste/UC-F03_visual_fp.yaml#passo_04_preencher_doc2_fgts"
```

## Passo 05 — Abrir Modal "Upload de Documento" (3a vez, para Doc 3)

```yaml
id: passo_05_abrir_modal_doc3
acao:
  sequencia:
    - tipo: click
      seletor: 'button.action-button:has-text("Upload Documento"), button.action-button-secondary:has-text("Upload Documento")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'div.modal h2:has-text("Upload de Documento")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F03_visual_fp.yaml#passo_05_abrir_modal_doc3"
```

## Passo 06 — Preencher Doc 3: Alvara de Funcionamento (validade vencida 2025-12-31)

Esta validade ja passou (2025-12-31 < 2026-04-30). Sistema deve aceitar e exibir badge "Vence" (amarelo) ou similar para indicar vencimento iminente/passado.

**Observe criticamente:**
- Tipo selecionado: "Alvará de Funcionamento" (categoria Habilitação Jurídica)
- Validade preenchida com 2025-12-31
- Apos Enviar, tabela mostra 3 linhas. Doc 3 com badge "Vence" (amarelo) ou "Vencido"

```yaml
id: passo_06_preencher_doc3_alvara
acao:
  sequencia:
    - tipo: select
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Tipo de Documento")) select'
      valor_from_dataset: "doc3_tipo_nome"
      timeout: 5000
    - tipo: upload_arquivo
      seletor: 'div.modal-body input[type="file"]'
      valor_from_pasta_docs: "sprint1/UC-F03/alvara.pdf"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Validade")) input[type="date"]'
      valor_from_dataset: "doc3_validade"
      timeout: 5000
    - tipo: click
      seletor: 'div.modal-footer button.btn-primary:has-text("Enviar")'
      timeout: 5000
    - tipo: wait
      valor_literal: 1500
    - tipo: wait_for
      seletor: 'text=Alvará de Funcionamento'
      timeout: 8000
validacao_ref: "testes/casos_de_teste/UC-F03_visual_fp.yaml#passo_06_preencher_doc3_alvara"
```

## Passo 07 — Verificar lista final com 3 documentos

**Observe criticamente:**
- Tabela "Documentos da Empresa" exibe 3 linhas (Contrato Social, CRF FGTS, Alvara)
- Doc 1 (Contrato Social) sem validade — badge "OK" verde
- Doc 2 (CRF FGTS, validade 2026-12-31) — badge "OK" verde
- Doc 3 (Alvara, validade 2025-12-31 ja passada) — badge "Vence" amarelo
- Cada linha tem botoes de visualizar, baixar e excluir

```yaml
id: passo_07_verificar_lista_3_documentos
acao:
  sequencia:
    # Scrolla para o card pra garantir 3 linhas visiveis
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3, h2')];
          const card = titulos.find(el => /Documentos da Empresa/i.test(el.textContent || ''));
          if (card) card.scrollIntoView({block: 'center', behavior: 'instant'});
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'text=Contrato Social'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=CRF - Certificado de Regularidade do FGTS'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Alvará de Funcionamento'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F03_visual_fp.yaml#passo_07_verificar_lista_3_documentos"
```
