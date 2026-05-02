---
uc_id: UC-F07
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F07_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F07_visual_fp.yaml
---

# UC-F07 — Cadastrar produto via IA a partir de Manual Tecnico (Fluxo Principal)

> **PO:** acompanhe a execucao. O processamento da IA (DeepSeek) demora 30-120 segundos. Aguarde o spinner desaparecer e a resposta inline aparecer antes de aprovar.
>
> **Cenario:** apos UC-F01+UC-F18+UC-F13, navega para Configuracoes>Portfolio aba "Cadastro por IA". Seleciona tipo "Manual Tecnico", anexa `manual_tecnico.pdf`, aciona "Processar com IA" e aguarda o DeepSeek extrair o produto. Ao final, a aba "Meus Produtos" mostra o produto cadastrado.
>
> **Pre-requisitos:**
> - UC-F01 + UC-F18 ja executados (empresa criada, vinculada e ativa)
> - UC-F13 ja executado (areas/classes/subclasses cadastradas — opcional para FP)
> - Servico DeepSeek operacional
> - Arquivo `manual_tecnico.pdf` em `<pasta_documentos>/sprint1/UC-F07/`

## Passo 00 — Setup: navegar para Portfolio aba "Cadastro por IA"

Sidebar expande Configuracoes -> Portfolio. PortfolioPage carrega na aba "Meus Produtos". Click na aba "Cadastro por IA".

**Observe criticamente:**
- Sidebar "CONFIGURACOES" expandida (idempotente)
- PortfolioPage carrega com cabecalho "Portfolio"
- 3 tabs visiveis: Meus Produtos | Cadastro por IA | Classificacao
- Tab "Cadastro por IA" fica destacada (active) apos click
- Card "Cadastro por IA" aparece com select Tipo de Documento, file input, secao Classificacao opcional, botao "Processar com IA"

```yaml
id: passo_00_setup_navegar_cadastro_ia
acao:
  sequencia:
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
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Portfolio"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Portfolio"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button.ptab:has-text("Cadastro por IA")'
      timeout: 15000
    - tipo: click
      seletor: 'button.ptab:has-text("Cadastro por IA")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button.ptab.active:has-text("Cadastro por IA")'
      timeout: 5000
    - tipo: wait_for
      seletor: '.card-title:has-text("Cadastro por IA"), h3:has-text("Cadastro por IA")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F07_visual_fp.yaml#passo_00_setup_navegar_cadastro_ia"
```

## Passo 01 — Selecionar tipo "Manual Tecnico" e anexar PDF

Seleciona o select de Tipo de Documento como "Manual Tecnico" (value=manual). Apos a selecao, o file input fica visivel. Anexa o arquivo manual_tecnico.pdf.

**Observe criticamente:**
- Select "Tipo de Documento" muda para "Manual Tecnico"
- File input visivel (nao e website)
- Apos anexo, info do arquivo aparece com nome e tamanho (ex: "manual_tecnico.pdf (XX KB)")
- Secao "Classificacao (opcional)" visivel com 3 selects Area/Classe/Subclasse

```yaml
id: passo_01_selecionar_tipo_e_anexar_arquivo
acao:
  sequencia:
    - tipo: select
      seletor: 'div.cadastro-form div.form-field:has(.form-field-label:has-text("Tipo de Documento")) select.select-input'
      valor_from_dataset: "tipo_documento_value"
      timeout: 5000
    - tipo: wait
      valor_literal: 500
    - tipo: upload_arquivo
      seletor: 'div.cadastro-form input[type="file"]'
      valor_from_pasta_docs: "sprint1/UC-F07/manual_tecnico.pdf"
      timeout: 5000
    - tipo: wait_for
      seletor: 'div.upload-file-info:has-text("manual_tecnico.pdf")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F07_visual_fp.yaml#passo_01_selecionar_tipo_e_anexar_arquivo"
```

## Passo 02 — Acionar "Processar com IA" e aguardar resposta

Click no botao "Processar com IA". O sistema cria sessao "cadastro-produto" via POST /api/sessions e envia o arquivo via POST /api/chat-upload. **DeepSeek processa por 30-120 segundos.** Aguardamos a resposta inline aparecer (texto markdown da IA).

**Observe criticamente:**
- Botao "Processar com IA" muda para "Processando..." com spinner
- Toast "Processando..." pode aparecer
- Aguarda 30-120s (paciencia — IA esta processando o PDF)
- Resposta da IA aparece em bloco markdown (`.markdown-response`) abaixo do botao
- Sem erros visiveis na tela
- POST /api/sessions retorna 200/201 com session_id
- POST /api/chat-upload retorna 200/201 com texto da resposta

```yaml
id: passo_02_processar_com_ia
acao:
  sequencia:
    - tipo: click
      seletor: 'div.cadastro-actions button.btn-primary:has-text("Processar com IA")'
      timeout: 5000
    # Pequena pausa pra spinner aparecer
    - tipo: wait_for
      seletor: 'button.btn-primary:has-text("Processando")'
      timeout: 5000
    # AGUARDA processamento da IA (DeepSeek) — timeout 240s pra dar
    # tempo suficiente pro LLM processar o PDF inteiro e extrair specs
    - tipo: wait_for
      seletor: 'div.markdown-response, button.btn-primary:has-text("Processar com IA")'
      timeout: 240000
    # Aguarda mais 3s pra fetchProdutos() terminar
    - tipo: wait
      valor_literal: 3000
validacao_ref: "testes/casos_de_teste/UC-F07_visual_fp.yaml#passo_02_processar_com_ia"
```

## Passo 03 — Confirmar produto cadastrado na aba "Meus Produtos"

Click na aba "Meus Produtos". Verifica que ao menos 1 produto aparece na grade (a IA criou o produto).

**Observe criticamente:**
- Tab "Meus Produtos" volta a estar ativa
- Header da tab mostra contador atualizado, ex: "Meus Produtos (1)" ou maior
- Grade de produtos (cards) com pelo menos 1 produto
- Cada card tem nome do produto, NCM ou subclasse, botoes de acao
- Sem mensagem "Nenhum produto cadastrado"

```yaml
id: passo_03_verificar_produto_na_grade
acao:
  sequencia:
    - tipo: click
      seletor: 'button.ptab:has-text("Meus Produtos")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button.ptab.active:has-text("Meus Produtos")'
      timeout: 5000
    # Aguarda cards/listagem aparecer (qualquer produto)
    - tipo: wait_for
      seletor: '.produto-card, .portfolio-grid > *, table tbody tr'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F07_visual_fp.yaml#passo_03_verificar_produto_na_grade"
```
