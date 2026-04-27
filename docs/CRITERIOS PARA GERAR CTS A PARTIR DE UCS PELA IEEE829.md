# Critérios para Geração de Casos de Teste a partir de Casos de Uso

**Padrão de referência:** IEEE 829 / ISTQB (Foundation Level)
**Aplicação:** Facilicita.IA — Sprints 1 a 9
**Data:** 2026-04-27
**Versão:** 1.0
**Objetivo:** Documento normativo que define como derivar Casos de Teste (CTs) a partir de Casos de Uso (UCs). Toda geração ou auditoria de CT a partir desta data deve seguir este documento.

---

## 1. Anatomia de um Caso de Teste

Um CT é uma **trajetória** dentro do espaço de fluxos do UC, que termina numa **resposta verificável do sistema**.

```
CT = { Pré-condições } + { Sequência de ações do ator } + { Saída esperada }
                                                                ↑
                                                       resposta verificável
```

| Elemento | Definição | Exemplos |
|---|---|---|
| **Pré-condições** | Estado do sistema antes da execução | "Usuário logado", "Banco com 5 produtos", "Edital X cadastrado" |
| **Sequência de ações** | Passos atômicos do ator (entradas) | Preencher campo, clicar botão, navegar, fazer upload |
| **Saída esperada** | Resposta que o sistema produz, observável e mensurável | Mensagem na tela, navegação, persistência no banco, alerta de erro, status HTTP |

A **resposta verificável** é o que diferencia um CT de uma simples narrativa. Toda saída esperada precisa ser observável por uma das 3 camadas de validação (DOM, Rede, Semântica).

---

## 2. Como Derivar CTs Sistematicamente do UC

### 2.1 Insumos do UC

Cada UC documenta três tipos de fluxo:

| Tipo | Definição | Notação |
|---|---|---|
| **FP** — Fluxo Principal | Sequência canônica que descreve o caminho feliz | Único por UC |
| **FA** — Fluxo Alternativo | Caminhos válidos diferentes do principal (decisões do ator) | FA-01, FA-02, …, FA-N |
| **FE** — Fluxo de Exceção | Caminhos com erro/falha (validação, integração, indisponibilidade) | FE-01, FE-02, …, FE-M |

### 2.2 Regra de derivação (1 CT por fluxo)

| Tipo de fluxo no UC | Vira que CT? | Trajetória |
|---|---|---|
| **FP completo** | CT positivo | FP do início ao fim, sem desvios, dados válidos típicos |
| **FA-N** | CT positivo (variação) | FP até o ponto onde FA-N desvia, completa o caminho alternativo, termina no resultado correspondente |
| **FE-N** | CT negativo | FP até o ponto onde FE-N dispara, condição de erro acontece, termina na mensagem/bloqueio esperado |
| **Boundary / limite** | CT de limite | FP com valor extremo (vazio, máximo, mínimo, formato no limite) |

### 2.3 Cobertura mínima por UC

```
Cobertura mínima de CTs por UC = 1 (FP) + |FAs| + |FEs|
```

Onde `|FAs|` é o número de fluxos alternativos documentados e `|FEs|` o de exceções. Acima desse mínimo, adicionar CTs extras conforme classes de equivalência e fronteira (seção 3).

### 2.4 Tipologia obrigatória do CT

Todo CT deve receber um campo **`Tipo`** com um dos valores:

- **Positivo** (também chamado "FP" ou "happy path") — entradas válidas, fluxo principal ou alternativo bem-sucedido
- **Negativo** — entradas inválidas, fluxo de exceção esperado, sistema deve recusar/alertar
- **Limite** (também chamado "boundary") — valores na fronteira (vazio, max length, número 0, formato no limite)

---

## 3. Cobertura por Técnicas Caixa-Preta

A norma ISTQB recomenda 3 técnicas combinadas para cobrir o espaço de testes:

### 3.1 Cobertura de cenários (use case coverage)

Cada FP, FA e FE recebe **pelo menos um CT**. É o mínimo absoluto.

### 3.2 Cobertura de classes de equivalência

Para cada campo do UC, identificar classes de valores que produzem o mesmo comportamento:

- **Classe válida (positiva)**: valores que o sistema aceita
- **Classe inválida (negativa)**: valores que o sistema rejeita
- **Classe especial**: nulos, vazios, valores reservados

Cada classe deve ter pelo menos 1 CT que a exercite (positivo se válida, negativo se inválida).

**Exemplo — campo CNPJ no UC-F01:**

| Classe | Exemplo | CT esperado |
|---|---|---|
| Válida (formato + DV ok) | `43.712.232/0001-85` | CT-F01-01 (FP) |
| Inválida (formato errado) | `43.712.232/0001-8` (13 dígitos) | CT-F01-FE-formato |
| Inválida (DV errado) | `00.000.000/0000-00` | CT-F01-FE-DV |
| Especial (vazia) | `""` | CT-F01-FE-vazia |
| Duplicada | CNPJ já existe no banco | CT-F01-FE-duplicado |

### 3.3 Cobertura de fronteira (boundary value analysis)

Para cada classe válida, testar **os limites**:

- **Borda inferior**: menor valor aceito (ex: string com 1 caractere, número 0)
- **Borda superior**: maior valor aceito (ex: max length do campo, valor máximo permitido)
- **Imediatamente fora**: 1 abaixo da borda inferior, 1 acima da borda superior

**Exemplo — campo Razão Social (texto, max 255 chars):**

| Fronteira | CT |
|---|---|
| Vazio (1 abaixo do mínimo) | CT negativo (FE-04) |
| 1 caractere (mínimo aceito) | CT de limite |
| 255 caracteres (máximo aceito) | CT de limite |
| 256 caracteres (1 acima do máximo) | CT negativo |

### 3.4 Combinação de fluxos (CTs adicionais)

Quando a probabilidade de regressão é alta, **combinar dois ou mais fluxos num CT só** (técnica de pairwise / classes cruzadas):

- **FA-02 + FE-01** = "Preencher tudo, deixar Facebook vazio E digitar CNPJ inválido" → resultado FE-01 prevalece (erro)
- **FA-07.A + FE-CNPJ-duplicado** = "Super cria primeira empresa via FA-07.A com CNPJ duplicado" → erro

CTs combinados **não substituem** os CTs unitários — são adições.

---

## 4. Cobertura Total Esperada

Combinando as 3 técnicas:

```
N de CTs por UC ≥ 1 (FP) + |FAs| + |FEs| + |Classes inválidas extras| + |Limites|
                  └─────── cenários ──────┘ + └─── equivalência ─────┘ + └─ fronteira ─┘
```

Para um UC com 5 FAs, 6 FEs, 2 campos com 3 classes inválidas extras e 4 limites relevantes:

```
Mínimo = 1 + 5 + 6 = 12 (cenários)
Extras = 6 + 4 = 10 (equivalência + fronteira)
Total recomendado ≈ 12 a 22 CTs
```

---

## 5. Estrutura padrão de um CT em prosa

Cada CT deve ser documentado como uma tabela de campos fixos, no padrão dos docs `CASOS DE TESTE PARA VALIDACAO SPRINT*.md`:

| Campo | Conteúdo | Obrigatório |
|---|---|---|
| **ID** | `CT-{prefixoUC}-{numero ou tag}` (ex: CT-F01-FA07-A) | ✅ |
| **Descricao** | Frase única explicando o objetivo | ✅ |
| **Pre-condicoes** | Estado do sistema (usuário, dados, ambiente) | ✅ |
| **Acoes do ator e dados de entrada** | Lista numerada das ações, com valores literais quando relevante | ✅ |
| **Saida esperada** | Resposta verificável (DOM, rede, persistência, mensagem) | ✅ |
| **Tipo** | Positivo / Negativo / Limite | ✅ |
| **RNs aplicadas** | Quais RNs o CT exercita | Recomendado |
| **Trilha sugerida** | e2e / visual / humana / todas | Recomendado |

---

## 6. Convenção de IDs

| Prefixo | Origem | Exemplo |
|---|---|---|
| `CT-{UC}-{numero}` | Sequencial dentro do UC | CT-F01-01, CT-F01-02, … |
| `CT-{UC}-FA{N}-{letra}` | Subdivisão de Fluxo Alternativo | CT-F01-FA07-A, CT-F01-FA07-B |
| `CT-{UC}-FE{N}` | Vinculado a Fluxo de Exceção | CT-F01-FE01, CT-F01-FE02 |
| `CT-{UC}-LIM-{descricao}` | Cobertura de fronteira | CT-F01-LIM-razao-vazia |

A convenção sequencial pura (`CT-F01-01`) é aceitável quando o vínculo a um fluxo específico não cabe no nome — basta o campo `Descricao` deixar explícito.

---

## 7. Critérios de Aceitação de um Conjunto de CTs

Um conjunto de CTs por UC passa na auditoria quando:

1. **Cobertura de cenários:** todos os FP, FAs e FEs têm pelo menos 1 CT que os exercite
2. **Cobertura de classes:** todos os campos com regras de validação têm CTs para classe válida típica + classes inválidas relevantes + valores especiais (nulo/vazio quando aplicável)
3. **Cobertura de fronteira:** campos com limites numéricos ou de tamanho têm CTs nas bordas (mínimo, máximo, fora)
4. **Rastreabilidade:** cada CT cita explicitamente qual fluxo (FP/FA/FE) ou classe/fronteira ele cobre, na descrição ou nas RNs aplicadas
5. **Resposta verificável:** toda Saída esperada é observável por DOM, rede, ou semântica (não pode ser "o sistema funciona corretamente" sem detalhar o quê)
6. **Determinismo:** dada a mesma pré-condição e sequência, a saída esperada deve ser sempre a mesma. Comportamento aleatório (geração de IDs, timestamps) deve ser explicitado como tolerância na saída esperada

---

## 8. Mapeamento CT → Trilha de Validação

Após gerar os CTs, classificar cada um por trilha de execução:

| Trilha | Quando usar | Exemplos |
|---|---|---|
| **E2E (automática headless)** | CT puramente funcional, sem dependência de julgamento visual humano | Validação de CNPJ, persistência, retorno HTTP |
| **Visual (acompanhada)** | CT depende de aparência/UX (cor, animação, posicionamento, feedback visual) | Toast verde, máscara aplicada, dropdown vs textinput |
| **Humana (Arnaldo)** | CT depende de avaliação subjetiva de copy, fluxo intuitivo, edge case real | "A mensagem de erro é clara o suficiente?", "Um usuário leigo entenderia esse fluxo?" |

Idealmente, **CTs cobertos por E2E não precisam ser repetidos em Visual** (a Visual cobre o que E2E não pega). Mas pode haver sobreposição estratégica para regressão.

---

## 9. Procedimento de Geração de CTs para um UC

Quando um UC novo (ou atualizado) precisa de CTs, seguir esta ordem:

1. **Ler o UC inteiro** — Sequência de Eventos, Fluxos Alternativos, Fluxos de Exceção, Tela Representativa, RNs aplicáveis
2. **Listar todos os fluxos** — `FP + FAs + FEs` numerados
3. **Para cada campo com validação**, identificar classes de equivalência e fronteiras
4. **Gerar 1 CT por fluxo** — preenchendo a estrutura padrão (seção 5)
5. **Adicionar CTs de classes inválidas** que não estão cobertas pelos FEs
6. **Adicionar CTs de fronteira** quando relevante
7. **Adicionar CTs combinados** (pairwise) se houver risco de regressão cruzada
8. **Atribuir tipo** (Positivo/Negativo/Limite) em cada CT
9. **Atribuir trilha sugerida** em cada CT
10. **Validar contra critérios de aceitação** (seção 7)

---

## 10. Exemplo Aplicado: UC-F01 (Manter Cadastro Principal da Empresa)

### 10.1 Insumos do UC

- **FP:** 1 (Sequência de eventos: passos 1-5)
- **FAs:** 5 (FA-01 a FA-04 + FA-07)
- **FEs:** 6 (FE-01 a FE-06)
- **Campos com validação relevante:** CNPJ, Razão Social, UF, CEP

### 10.2 Cobertura mínima esperada

```
1 (FP) + 5 (FAs) + 6 (FEs) = 12 CTs mínimo
```

### 10.3 Trajetórias resultantes

| ID | Trajetória | Tipo | Trilha |
|---|---|---|---|
| CT-F01-FP | navegar → preencher tudo → salvar | Positivo | visual |
| CT-F01-FA01 | navegar → alterar → sair sem salvar → retornar | Positivo | visual |
| CT-F01-FA02 | preencher tudo MENOS Facebook → salvar | Positivo | e2e |
| CT-F01-FA03 | empresa já existe → carregar → editar → salvar (PUT) | Positivo | e2e |
| CT-F01-FA04 | acessar via "Cadastros > Empresa" CRUD genérico | Positivo | visual |
| CT-F01-FA07-A | super sem vínculo → "Criar Nova Empresa" → CRUD | Positivo | visual |
| CT-F01-FA07-B | super sem vínculo → "Vincular Empresa" → AssociarEmpresa | Positivo | visual |
| CT-F01-FA07-C | super sem vínculo + empresas existentes → "Entrar" → Selecionar | Positivo | visual |
| CT-F01-FA07-D | super sem vínculo + banco vazio → "Entrar" desabilitado | Limite | visual |
| CT-F01-FA07-E | usuário comum sem vínculo → tela só com "Sair" | Negativo | visual |
| CT-F01-FE01 | CNPJ DV inválido → erro RN-028 | Negativo | e2e |
| CT-F01-FE02 | CNPJ formato inválido (13 dígitos) → erro | Negativo | e2e |
| CT-F01-FE03 | servidor offline → "Tentar novamente" | Negativo | visual |
| CT-F01-FE04 | Razão Social vazia → erro obrigatório | Negativo | e2e |
| CT-F01-FE05 | UF como TextInput livre (bug) → aceita XX inválido | Negativo | visual |
| CT-F01-FE06 | toast de sucesso ausente (bug FE-06) → sem feedback | Negativo | visual |

**Total: 16 CTs** (acima do mínimo 12, com 4 CTs extras de fronteira/classe).

### 10.4 Estado atual da Sprint 1 (auditoria de aderência)

| UC | FP | FAs | FEs | Mínimo CTs | CTs hoje (CONJ1+CONJ2) | Aderência |
|---|---|---|---|---|---|---|
| F01 | 1 | 5 | 6 | 12 | 13 | ✅ ok |
| F02 | 1 | ? | ? | ? | 6 | ⚠️ verificar |
| F03 | 1 | ? | ? | ? | 6 | ⚠️ verificar |
| F04 | 1 | ? | ? | ? | 5 | ⚠️ raso |
| F05 | 1 | ? | ? | ? | 6 | ⚠️ verificar |
| F06 | 1 | ? | ? | ? | 8 | ⚠️ verificar |
| F07 | 1 | ? | ? | ? | 6 | ⚠️ verificar |
| F08 | 1 | ? | ? | ? | 4 | ⚠️ raso |
| F09 | 1 | ? | ? | ? | 3 | ⚠️ raso |
| F10 | 1 | ? | ? | ? | 4 | ⚠️ raso |
| F11 | 1 | ? | ? | ? | 3 | ⚠️ raso |
| F12 | 1 | ? | ? | ? | 4 | ⚠️ raso |
| F13 | 1 | ? | ? | ? | 4 | ⚠️ raso |
| F14 | 1 | ? | ? | ? | 6 | ⚠️ verificar |
| F15 | 1 | ? | ? | ? | 4 | ⚠️ raso |
| F16 | 1 | ? | ? | ? | 4 | ⚠️ raso |
| F17 | 1 | ? | ? | ? | 5 | ⚠️ raso |

→ Auditoria pendente: contar FAs e FEs em cada UC e comparar com CTs existentes para identificar lacunas.

---

## 11. Anti-padrões a Evitar

❌ **CT sem saída verificável**
> "Sistema funciona corretamente"

✅ Reescrever:
> "Toast verde 'Salvo com sucesso' visível por 3 segundos. CNPJ persistido com formato `00.000.000/0000-00`. Request POST /api/crud/empresas retorna 201."

❌ **CT que cobre múltiplos fluxos sem distinção**
> "CT-F01-01: Preencher CNPJ inválido E deixar Razão vazia E clicar Salvar"

✅ Separar:
> CT-F01-FE01 (CNPJ inválido) + CT-F01-FE04 (Razão vazia) + opcionalmente um CT combinado se houver lógica cruzada.

❌ **CT muito genérico**
> "CT-F01-XX: testar empresa"

✅ Específico:
> "CT-F01-FA02: salvar empresa válida sem preencher Facebook (campo opcional) — resultado: persistência com `facebook=null`"

❌ **CT que não cita o fluxo do UC**

Todo CT deve dizer explicitamente qual FP/FA/FE ou classe/fronteira ele cobre. Se não couber no nome, cobrir na descrição.

---

## 12. Referências Normativas

- **IEEE 829-2008** — Standard for Software and System Test Documentation
- **ISTQB Foundation Level Syllabus 2018 v3.1** — Capítulos 4 (Test Design Techniques) e 5 (Test Management)
- **Pressman, R.** — Software Engineering: A Practitioner's Approach (capítulo de Black-Box Testing)
- **Myers, G.** — The Art of Software Testing (técnicas de equivalência e fronteira)

---

## 13. Vinculação com a Validação Automática

Este documento é **insumo obrigatório** para:

- **Geração de CTs** dos UCs Sprint 1 a 9 (formato em prosa, em `docs/CASOS DE TESTE PARA VALIDACAO SPRINT*.md`)
- **Geração de casos de teste YAML executáveis** (em `testes/casos_de_teste/UC-*_<trilha>_<variacao>.yaml`)
- **Auditoria** de cobertura por UC e por sprint
- **Decisão sobre escalonamento** da automação visual: priorizar UCs com cobertura completa antes de UCs com cobertura rasa

Toda divergência entre os CTs em prosa (`docs/`) e os YAML executáveis (`testes/`) deve ser resolvida com base nesta norma.

---

*Documento normativo. Atualizar a versão e a data ao revisar.*
