# Análise — Problema na especificação de produtos no Tutorial V5 (Sprint 1)

**Data:** 2026-05-05
**Tutoriais analisados:** `docs/tutorialsprint1-2 V5.md`, `V4.md`, `V3.md`, `V5-3` (análogo)
**Funcionalidade no sistema:** `subclasse_produto.campos_mascara` + `CamposMascaraEditor` (frontend)
**Veredito:** **Observação do Arnaldo PROCEDE — há 2 problemas distintos no V5.**

---

## 1. Resumo do problema encontrado

Existem **2 problemas distintos** no tutorial V5 relacionados a especificação de produtos:

### Problema A — Especificações INCONSISTENTES com o produto contextualizado (UC-F08, Passo 5)

O tutorial pede ao validador cadastrar especificações de **kit reagente bioquímico de glicose** (Método GOD-PAP, comprimento de onda 505 nm, linearidade 0–500 mg/dL, etc.) num produto que é **Monitor Multiparâmetro Nihon Kohden BSM-3000**. Isso é tecnicamente absurdo — Monitor não usa amostras de soro/plasma, não tem método enzimático.

### Problema B — Funcionalidade-chave OMITIDA (`campos_mascara` em Subclasses)

O sistema possui um mecanismo de **definir previamente quais especificações cada subclasse de produto exige**, via campo `campos_mascara` (JSON estruturado com nome/tipo/unidade/obrigatório de cada campo) na tabela `subclasses_produto`. Quando o usuário cadastra um produto, o sistema renderiza dinamicamente esses campos. **Nenhum tutorial (V3/V4/V5) menciona essa funcionalidade**, embora Arnaldo provavelmente tenha procurado por ela ("não localizei a opção ESPECIFICAÇÕES TÉCNICAS").

---

## 2. Trechos específicos do V5 que estão incorretos ou confusos

### Trecho A — UC-F08 Passo 5 (linhas 1191-1217 do `tutorialsprint1-2 V5.md`)

```markdown
### Passo 5 — Preencher as especificações técnicas

**Especificações a preencher (8 ao total):**

| # | Especificação | Valor |
|---|---|---|
| 1 | Método | `Enzimático (GOD-PAP)` |
| 2 | Amostra | `Soro, plasma` |
| 3 | Comprimento de Onda | `505 nm` |
| 4 | Linearidade | `0–500 mg/dL` |
| 5 | Temperatura | `37°C` |
| 6 | Incubação | `5 minutos` |
| 7 | Conservação | `2–8°C` |
| 8 | Registro ANVISA | `80129500015` |
```

Mas o produto sendo editado nesse UC-F08 é **`Monitor Multiparâmetro Nihon Kohden BSM-3000 (Versão Hospitalar)`** — todas as 7 primeiras especificações são de **kit reagente bioquímico de glicose**, **não de monitor de sinais vitais**.

### Trecho B — Tutorial não menciona em momento algum

A funcionalidade `campos_mascara` da subclasse — onde se define **quais especificações** cada subclasse exige (ex: subclasse "Monitor Multiparâmetro" deve exigir "Tela em polegadas", "Parâmetros monitorados", "Tipos de paciente", "Bateria interna", etc.). O caminho no menu é:

**Cadastros → Portfolio → Subclasses → editar subclasse → campo "Máscara de Campos"**

---

## 3. Comparação V3 / V4 / V5

| Aspecto | V3 | V4 | V5 |
|---|---|---|---|
| **Quantidade de specs no UC-F08** | 11 | 8 (corte das 3 inválidas) | 8 (mesmo do V4) |
| **Specs de reagente em produto Monitor** | ✅ tem (bug) | ✅ tem (bug) | ✅ tem (bug) |
| **Menciona `campos_mascara`** | ❌ não | ❌ não | ❌ não |
| **Caminho `Cadastros → Portfolio → Subclasses → Máscara`** | ❌ não | ❌ não | ❌ não |
| **Justifica corte das 3 specs (Determinações, Volume, Validade)** | — | ✅ explica | ✅ explica |

**Conclusão da comparação:** o problema **NÃO é introduzido no V5**. Está nas 3 versões. V4 e V5 só **enxugaram** o número (de 11 para 8) sem perceber que **o conteúdo das 8 restantes continua errado pro produto Monitor**.

---

## 4. Verificação no sistema

### A funcionalidade `campos_mascara` EXISTE e está acessível:

**Localização no código:**
- `backend/models.py` — tabela `subclasses_produto` tem coluna `campos_mascara` (longtext JSON)
- `frontend/src/config/crudTables.tsx:984` — campo no formulário CRUD de Subclasses:
  ```javascript
  { name: "campos_mascara", label: "Máscara de Campos", type: "json", width: "full",
    renderCustom: (value, onChange) => React.createElement(CamposMascaraEditor, { value, onChange }) }
  ```
- `frontend/src/config/crudTables.tsx:16` — componente `CamposMascaraEditor` com 5 tipos de campo: texto, número inteiro, decimal, seleção, sim/não, mais unidade/placeholder/obrigatório.

**Caminho no menu (sidebar):**
```
Cadastros → Portfolio → Subclasses
   ├─ clicar em uma subclasse (ex: "Monitor Multiparâmetro")
   ├─ campo "Máscara de Campos" (último campo do form)
   └─ editor visual lista os campos: nome, tipo, unidade, placeholder, obrigatório
```

**Como o sistema usa:**
- `frontend/src/config/crudTables.tsx:352` e `:613` — quando seleciona uma subclasse no cadastro de produto, parseia `campos_mascara` e renderiza dinamicamente os inputs corretos para aquela subclasse.

### A funcionalidade NÃO está perdida — só nunca foi documentada nos tutoriais.

---

## 5. Diferenças V5 vs V4 vs V3

**Não há diferenças estruturais nos 3 nesse ponto específico** — o bug das specs erradas e a omissão da funcionalidade `campos_mascara` estão **idênticos** nas 3 versões.

A única evolução foi: V3 → V4 reduziu de 11 specs para 8 (mantendo as 8 erradas). V5 só herdou. **Nenhuma versão tentou alinhar as 8 specs com o produto real.**

---

## 6. Conceitos misturados (resposta direta às 6 perguntas do briefing)

| # | Pergunta | Resposta |
|---|---|---|
| 1 | V5 tem instrução incorreta sobre especificações? | **SIM** — as 8 specs do Passo 5 são de reagente, não de monitor |
| 2 | A funcionalidade existe no sistema? | **SIM** — `campos_mascara` em Subclasses |
| 3 | O caminho de menu indicado no V5 está correto? | **NÃO TEM CAMINHO** — V5 não menciona Subclasses → Máscara |
| 4 | Diferença V5 vs V2/V3? | **NÃO** — bug está nas 3 versões |
| 5 | V5 mistura conceitos? | **SIM** — confunde "especificação do produto cadastrado" (UC-F08 Passo 5) com "definição prévia de quais specs a subclasse exige" (UC-F13/Subclasses, omitido) |
| 6 | V5 manda acessar tela inexistente? | Não diretamente — mas omite a tela que o validador precisaria conhecer (Subclasses → Máscara de Campos) |
| 7 | Está claro pro validador? | **NÃO** — Arnaldo procurou "ESPECIFICAÇÕES TÉCNICAS" porque não existe explicação do fluxo |

---

## 7. Explicação correta do fluxo

### Conceito que faltou ser explicado nos tutoriais

O sistema tem **2 níveis** de especificação de produto:

#### Nível 1 — Definição do TIPO (catálogo da empresa)

Em **Cadastros → Portfolio → Subclasses**, o usuário define **quais especificações cada subclasse de produto exige**:

```json
// Exemplo: subclasse "Monitor Multiparâmetro" — campos_mascara
[
  {"campo": "Tela", "tipo": "texto", "unidade": "polegadas", "obrigatorio": true},
  {"campo": "Parâmetros Monitorados", "tipo": "texto", "obrigatorio": true},
  {"campo": "Tipo de Paciente", "tipo": "select", "opcoes": ["Adulto","Pediátrico","Neonatal"]},
  {"campo": "Bateria Interna", "tipo": "decimal", "unidade": "horas"},
  {"campo": "Peso", "tipo": "decimal", "unidade": "kg"},
  {"campo": "Alimentação", "tipo": "texto", "unidade": "V"},
  {"campo": "Classe ANVISA", "tipo": "select", "opcoes": ["I","II","III","IV"]},
  {"campo": "Registro ANVISA", "tipo": "texto", "obrigatorio": true}
]
```

#### Nível 2 — Preenchimento ao cadastrar um produto

Em **Portfolio → Produtos → editar produto → seção Especificações**, o validador preenche **valores** para os campos definidos na máscara da subclasse à qual o produto pertence.

**O Passo 5 do UC-F08 atual está no Nível 2.** Mas o Nível 1 (definir a máscara da subclasse) é o que o Arnaldo procurou e não encontrou.

---

## 8. Sugestão de correção textual para o V5

### A) UC-F08 Passo 5 — corrigir as 8 especificações para Monitor Multiparâmetro

```markdown
### Passo 5 — Preencher as especificações técnicas

**O que fazer:** Localize a seção de especificações técnicas do produto. Os campos
exibidos dependem da máscara configurada na subclasse "Monitor Multiparâmetro"
(ver UC-F13). Preencha os valores conforme abaixo.

**Especificações a preencher (Monitor Multiparâmetro Nihon Kohden BSM-3000):**

| # | Especificação | Valor |
|---|---|---|
| 1 | Tela | `12 polegadas` |
| 2 | Parâmetros Monitorados | `ECG, SpO2, PNI, Temperatura, FC, FR` |
| 3 | Tipo de Paciente | `Adulto, Pediátrico, Neonatal` |
| 4 | Bateria Interna | `4 horas` |
| 5 | Peso | `5,2 kg` |
| 6 | Alimentação | `100-240 V (bivolt automático)` |
| 7 | Classe ANVISA | `II` |
| 8 | Registro ANVISA | `80129500015` |
```

### B) UC-F13 — adicionar passo 0 sobre Máscara de Campos

```markdown
### Passo 0 (NOVO em V6) — Configurar Máscara de Especificações da Subclasse

**Onde:** Cadastros → Portfolio → Subclasses → clicar em "Monitor Multiparâmetro" → Editar

**O que fazer:** Localize o campo **"Máscara de Campos"** no formulário (último
campo). Ele abre um editor visual onde você define **quais especificações qualquer
produto desta subclasse vai exigir** ao ser cadastrado.

**Exemplo de máscara para Monitor Multiparâmetro:**

| Nome do Campo | Tipo | Unidade | Obrigatório |
|---|---|---|---|
| Tela | texto | polegadas | ✓ |
| Parâmetros Monitorados | texto | — | ✓ |
| Tipo de Paciente | seleção (Adulto/Pediátrico/Neonatal) | — | — |
| Bateria Interna | decimal | horas | — |
| Peso | decimal | kg | — |
| Alimentação | texto | V | — |
| Classe ANVISA | seleção (I/II/III/IV) | — | ✓ |
| Registro ANVISA | texto | — | ✓ |

✅ **Correto se:** Após salvar a subclasse, ao cadastrar um produto desta
subclasse (UC-F07/F08), os 8 campos acima aparecem dinamicamente na seção
"Especificações Técnicas".
❌ **Problema se:** Ao salvar a subclasse, o JSON de campos_mascara fica vazio,
ou ao abrir cadastro de produto os campos não aparecem.
```

### C) Nota cruzada em UC-F07 e UC-F08

Adicionar bloco no início:

```markdown
> **Pré-requisito conceitual:** as especificações que o sistema vai pedir nesta
> tela dependem da **máscara de campos** definida na subclasse do produto
> (ver UC-F13 Passo 0). Se a máscara da subclasse "Monitor Multiparâmetro"
> não estiver configurada, a tela vai mostrar uma seção genérica de
> chave-valor sem orientação.
```

---

## 9. Conclusão final

**A observação do Arnaldo PROCEDE.**

Especificamente:

1. **As especificações listadas no UC-F08 Passo 5 estão semanticamente incorretas** para o produto contextualizado no tutorial. São specs de kit bioquímico de glicose (Método GOD-PAP, Comprimento de Onda 505 nm, Soro/plasma) num produto que é Monitor Multiparâmetro de sinais vitais.

2. **A funcionalidade que o Arnaldo provavelmente procurou** é a **Máscara de Campos** das Subclasses (`campos_mascara`), que permite definir previamente **quais especificações** cada subclasse de produto exige. Essa funcionalidade existe no sistema (campo no CRUD de Subclasses, com editor visual) mas **nunca foi documentada em nenhuma versão do tutorial**.

3. **O bug está nas 3 versões** (V3/V4/V5). A V5 não introduziu o problema — herdou-o e enxugou de 11 para 8 specs sem corrigir o conteúdo.

4. **O caminho correto no menu é:** `Cadastros → Portfolio → Subclasses → editar subclasse → campo "Máscara de Campos"`. Esse caminho **deveria estar documentado** em UC-F13 ou em um UC novo dedicado à parametrização de catálogo.

**Recomendação:** gerar um V6 dos 2 tutoriais corrigindo o conteúdo das specs do UC-F08 + adicionando Passo 0 no UC-F13 sobre Máscara de Campos da Subclasse.

---

*Relatório gerado em 2026-05-05 a partir de leitura linha-a-linha dos 3 tutoriais (V3/V4/V5) e verificação cruzada com `frontend/src/config/crudTables.tsx`, `backend/models.py` e `frontend/src/components/Sidebar.tsx`.*
