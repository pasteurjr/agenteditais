---
uc_id: UC-R01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-R01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-R01_visual_fp.yaml
---

# UC-R01 — Gerar Proposta Tecnica (Motor IA Automatico) (Fluxo Principal)

> **Predecessores:** UC-P04..P08, UC-CV03, UC-F07/F08
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Setup: navegar para Fluxo Comercial > Proposta

Sidebar -> click Proposta. PropostaPage carrega.

**Observe criticamente:**
- Cabecalho 'Geracao de Propostas'
- Card 'Gerar Nova Proposta' visivel
- Tabela 'Minhas Propostas' embaixo

```yaml
id: passo_00_navegar_proposta
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fc = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => /Fluxo Comercial/i.test(b.querySelector('.nav-section-label')?.textContent.trim() || ''));
          if (!fc) throw new Error('secao Fluxo Comercial nao encontrada');
          if (!fc.classList.contains('expanded')) fc.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Proposta"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Proposta"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-R01_visual_fp.yaml#passo_00_navegar_proposta"
```

## Passo 01 — Selecionar Edital + Produto + Preco Unitario + Quantidade

No formulario inline, escolhe primeiro Edital + primeiro Produto, preenche Preco Unitario=130,00 (= preco_base UC-P05) e Quantidade=10.

**Observe criticamente:**
- Selects de Edital e Produto com opcoes
- Campo Preco Unitario aceita 130,00
- Campo Quantidade aceita 10
- **PRECO USADO: R$ 130,00 (igual ao preco_base configurado em UC-P05)**
- **VALOR TOTAL ESPERADO: R$ 1.300,00**

```yaml
id: passo_01_preencher_form_proposta
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const setSel = (label) => {
            const f = fields.find(x => new RegExp('^' + label + '$', 'i').test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
            if (!f) return false;
            const sel = f.querySelector('select');
            if (!sel) return false;
            const opts = [...sel.options].filter(o => o.value);
            if (!opts.length) return false;
            sel.value = opts[0].value;
            sel.dispatchEvent(new Event('change', {bubbles: true}));
            return opts[0].textContent.trim();
          };
          const setInp = (label, val) => {
            const f = fields.find(x => new RegExp(label, 'i').test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
            if (!f) return false;
            const inp = f.querySelector('input');
            if (!inp) return false;
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(inp, val);
            inp.dispatchEvent(new Event('input', {bubbles: true}));
            inp.dispatchEvent(new Event('change', {bubbles: true}));
            return true;
          };
          const ed = setSel('Edital');
          const pd = setSel('Produto');
          setInp('Pre[cç]o Unit[aá]rio', '130,00');
          setInp('Quantidade', '10');
          return 'edital=' + (ed||'?') + ' produto=' + (pd||'?');
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-R01_visual_fp.yaml#passo_01_preencher_form_proposta"
```

## Passo 02 — Click "Gerar Proposta Tecnica" — Motor IA

POST /api/precificacao/simular-ia chama DeepSeek pra gerar proposta tecnica completa (descricoes, especificacoes, justificativas).

**Observe criticamente:**
- Botao 'Gerar Proposta Tecnica' habilitado
- POST /simular-ia retorna 200 com proposta IA
- Nova linha aparece em 'Minhas Propostas' com status Rascunho
- **ANALISE DA PROPOSTA IA:** Verificar se a IA gerou conteudo coerente — descricao tecnica do produto, justificativas, e respeita os parametros (preco R$ 130, quantidade 10)
- **Tempo de resposta IA:** 30-90s tipico

```yaml
id: passo_02_gerar_proposta
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Gerar Proposta T[eé]cnica/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao_gerar';
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 90000
validacao_ref: "testes/casos_de_teste/UC-R01_visual_fp.yaml#passo_02_gerar_proposta"
```
