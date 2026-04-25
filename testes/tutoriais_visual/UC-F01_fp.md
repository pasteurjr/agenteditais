---
uc_id: UC-F01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F01_visual_fp.yaml
---

# UC-F01 — Cadastrar empresa (Fluxo Principal) — Trilha Visual

> **PO:** acompanhe a execução automática no browser headed (slow_mo 500ms). Cada parada é um marco lógico — você decide ✅ Aprovar ou ❌ Reprovar e opcionalmente comenta antes de clicar ▶️ Continuar.

## Passo 01 — Navegar até EmpresaPage

O browser vai navegar até `/app/empresa` (Configurações > Empresa).

**Observe criticamente:**
- Cabeçalho exibe ícone Building + título "Dados da Empresa"
- Subtítulo: "Cadastro de informações e documentos da empresa"
- Card "Informações Cadastrais" carregado
- Há botão "Verificar Documentos" no header (referência a UC-F03)
- Form aparece com 4 seções: Dados Básicos, Presença Digital, Endereço, Emails/Telefones
- Sem spinner travado depois de 2-3 segundos

```yaml
id: passo_01_navegar_empresa
acao:
  sequencia:
    - tipo: navigate
      url: "/app/empresa"
      timeout: 15000
    - tipo: wait_for
      seletor: 'label:has-text("Razao Social")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_01_navegar_empresa"
```

## Passo 02 — Preencher seção "Dados Básicos"

O browser vai preencher os 4 campos da seção Dados Básicos em sequência: Razão Social, Nome Fantasia, CNPJ (`56.700.252/4415-59` válido RF), Inscrição Estadual.

**Observe criticamente:**
- Asterisco vermelho em **Razão Social** e **CNPJ** (campos obrigatórios)
- Sem asterisco em Nome Fantasia e Inscrição Estadual (opcionais)
- Campo CNPJ tem placeholder visível "00.000.000/0000-00"
- Máscara é aplicada durante a digitação ou só no blur?
- Aceita os valores sem alerta vermelho de validação

```yaml
id: passo_02_preencher_dados_basicos
acao:
  sequencia:
    - tipo: fill
      seletor: 'label:has-text("Razao Social") ~ div input.text-input'
      valor_from_dataset: "empresa.razao_social"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("Nome Fantasia") ~ div input.text-input'
      valor_from_dataset: "empresa.nome_fantasia"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("CNPJ") ~ div input.text-input'
      valor_from_dataset: "empresa.cnpj"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("Inscricao Estadual") ~ div input.text-input'
      valor_from_dataset: "empresa.inscricao_estadual"
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_02_preencher_dados_basicos"
```

## Passo 03 — Preencher seção "Presença Digital"

O browser vai preencher os 4 campos: Website, Instagram (com prefixo `@`), LinkedIn, Facebook.

**Observe criticamente:**
- Prefixo "@" aparece à esquerda do campo Instagram
- Campo Instagram aceita o texto sem duplicar o "@"
- Website tem validação tipo URL (sem rejeitar enquanto digita)
- Todos os 4 campos são opcionais (sem asterisco)

```yaml
id: passo_03_preencher_presenca_digital
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
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_03_preencher_presenca_digital"
```

## Passo 04 — Preencher seção "Endereço"

O browser vai preencher: Endereço, Cidade, UF (dropdown SP), CEP.

**Observe criticamente:** (V5 correção crítica — FE-05)
- O campo **UF deve ser dropdown <select>**, NÃO TextInput livre
- Dropdown deve listar 27 estados (AC, AL, AM... TO)
- Se UF for TextInput aceitando "XX" livre = bug FE-05 ainda presente
- Atenção ao CEP: o frontend tenta autocompletar via ViaCEP — pode sobrescrever Endereço/Cidade/UF se digitar 8 dígitos válidos

```yaml
id: passo_04_preencher_endereco
acao:
  sequencia:
    - tipo: fill
      seletor: 'label:has-text("Endereco") ~ div input.text-input'
      valor_from_dataset: "empresa.endereco"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("Cidade") ~ div input.text-input'
      valor_from_dataset: "empresa.cidade"
      timeout: 5000
    - tipo: select
      seletor: 'label:has-text("UF") ~ div select.select-input'
      valor_from_dataset: "empresa.uf"
      timeout: 5000
    - tipo: fill
      seletor: 'label:has-text("CEP") ~ div input.text-input'
      valor_from_dataset: "empresa.cep"
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_04_preencher_endereco"
```

## Passo 05 — Salvar e confirmar feedback

O browser vai clicar em "Salvar Alteracoes", aguardar a resposta do backend (POST/PUT `/api/crud/empresas`), e aguardar o indicador "Salvo!" aparecer.

**Observe criticamente:** (V5 correção crítica — FE-06)
- Botão "Salvar Alteracoes" visível com cor de destaque (variant primary)
- Após clique, botão entra em estado loading (spinner ou desabilitado)
- Indicador **"Salvo!" em verde** aparece ao lado do botão (correção V5: FE-06)
- Sem mensagem vermelha de erro
- Sem botão "Tentar novamente"
- Se nada aparecer = bug FE-06 (toast de sucesso ausente) ainda presente

```yaml
id: passo_05_salvar_e_confirmar
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Salvar Alteracoes")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Salvo!'
      timeout: 8000
validacao_ref: "testes/casos_de_teste/UC-F01_visual_fp.yaml#passo_05_salvar_e_confirmar"
```
